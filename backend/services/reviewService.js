'use strict';

// Mandatory post-test Review System — see docs referenced in the plan this
// was built from (backend/models/AttemptReview.js has the schema-level
// rationale). This service is deliberately thin: it never re-fetches
// Passage/ListeningTest content (the frontend already has that from the
// existing review/history-detail endpoints), and it never re-implements
// grading — retry-grading calls back into readingService/listeningService's
// own single-question comparators via a lazy require (readingService.js
// requires this file at module scope for createReviewIfNeeded, so a
// top-level require here would be circular; requiring inside the function
// body defers it until both modules have finished loading).
const AttemptReview = require('../models/AttemptReview');
const { skillFor, resolveErrorCode } = require('../constants/errorTaxonomy');

// A mistake counts as "reviewed" once the core guided-review steps are
// done — error classification, confidence, and an attempted retry. Free-
// text fields (evidence, temptingAnswerNote, note, learningPoint.content)
// are deliberately optional so 7 mistakes doesn't turn into an essay
// assignment; learningPoint.category is a single tap, not free text, so
// it's required alongside the others.
function coreFieldsFilled(m) {
  return !!(m.errorCategory && m.errorReason && m.confidence && m.retryAnswer != null && m.learningPoint?.category);
}

// Filters graded answers down to the ones that need review (wrong OR
// skipped — both grade as isCorrect:false in every attempt model today, and
// leaving a hard question blank must not be a way to dodge the whole
// mandatory-review loop). Returns [] for a perfect/all-attempted-correct
// submission — the caller creates no document at all in that case.
function pickMistakes(gradedAnswers, questionTypeMap) {
  return gradedAnswers
    .filter(a => !a.isCorrect)
    .map(a => ({
      questionNumber: a.questionNumber,
      questionType: questionTypeMap?.[a.questionNumber] || '',
      userAnswer: a.userAnswer || '',
      correctAnswer: a.correctAnswer || '',
    }));
}

async function createReviewIfNeeded({ userId, attemptType, attemptId, gradedAnswers, questionTypeMap }) {
  const mistakes = pickMistakes(gradedAnswers, questionTypeMap);
  if (!mistakes.length) return null; // perfect score (or nothing answered wrong) — nothing to gate

  // Upsert on the unique (userId, attemptType, attemptId) key — idempotent
  // against a retried/duplicate submit call ever reaching this twice.
  return AttemptReview.findOneAndUpdate(
    { userId, attemptType, attemptId },
    { $setOnInsert: { userId, attemptType, attemptId, status: 'pending', mistakes, startedAt: new Date() } },
    { upsert: true, new: true }
  );
}

// Scoped per-skill: a pending Reading review blocks new Reading only, not
// Listening — matches the fact the gate sits at skill-specific route
// chokepoints (see middleware/requireReviewComplete.js).
function getPendingReview(userId, skill) {
  const attemptTypes = skill === 'reading' ? ['reading', 'reading-practice'] : ['listening', 'listening-practice'];
  return AttemptReview.findOne({ userId, status: 'pending', attemptType: { $in: attemptTypes } }).sort({ createdAt: 1 });
}

async function getReviewDetail(reviewId, userId) {
  return AttemptReview.findOne({ _id: reviewId, userId }).lean();
}

async function getReviewByAttempt(attemptType, attemptId, userId) {
  return AttemptReview.findOne({ attemptType, attemptId, userId }).lean();
}

function gradeRetry(attemptType, questionType, rawUser, rawCorrect) {
  if (!rawUser) return false;
  if (attemptType.startsWith('reading')) {
    const { gradeOne, gradeMultiAnswerGroup } = require('./readingService');
    return questionType === 'multi-answer-group'
      ? gradeMultiAnswerGroup(rawUser, rawCorrect)
      : gradeOne(rawUser, rawCorrect);
  }
  const { matchSingleAnswer } = require('./listeningService');
  return matchSingleAnswer(questionType, rawUser, rawCorrect);
}

const PATCHABLE_FIELDS = ['confidence', 'retryAnswer', 'evidence', 'temptingAnswerNote', 'note'];

async function updateMistake(reviewId, mistakeId, userId, patch) {
  const review = await AttemptReview.findOne({ _id: reviewId, userId });
  if (!review) return { status: 'not_found' };
  const mistake = review.mistakes.id(mistakeId);
  if (!mistake) return { status: 'not_found' };

  if (patch.errorCategory !== undefined || patch.errorReason !== undefined) {
    const category = patch.errorCategory ?? mistake.errorCategory;
    const reason = patch.errorReason ?? mistake.errorReason;
    const code = resolveErrorCode(skillFor(review.attemptType), category, reason);
    if (!code) return { status: 'invalid_taxonomy' };
    mistake.errorCategory = category;
    mistake.errorReason = reason;
    mistake.errorCode = code;
  }

  for (const field of PATCHABLE_FIELDS) {
    if (patch[field] !== undefined) mistake[field] = patch[field];
  }
  if (patch.confidence !== undefined && !['very-confident', 'not-sure', 'guessing'].includes(patch.confidence)) {
    return { status: 'invalid_confidence' };
  }

  if (patch.retryAnswer !== undefined) {
    // Server-computed, never trusted from the client — grades the isolated
    // retry against this mistake's own frozen correctAnswer.
    mistake.retryResult = gradeRetry(review.attemptType, mistake.questionType, patch.retryAnswer, mistake.correctAnswer)
      ? 'correct' : 'wrong';
  }

  if (patch.learningPoint !== undefined) {
    const cat = patch.learningPoint.category;
    if (cat !== undefined) {
      if (cat !== null && !['vocabulary', 'strategy', 'grammar', 'ielts-trap'].includes(cat)) {
        return { status: 'invalid_learning_point' };
      }
      mistake.learningPoint.category = cat;
    }
    if (patch.learningPoint.content !== undefined) mistake.learningPoint.content = patch.learningPoint.content;
  }

  mistake.completedAt = coreFieldsFilled(mistake) ? (mistake.completedAt || new Date()) : null;

  const allDone = review.mistakes.every(m => m.completedAt);
  if (allDone && review.status !== 'completed') {
    review.status = 'completed';
    review.completedAt = new Date();
  } else if (!allDone && review.status === 'completed') {
    // Defensive — shouldn't happen (fields only ever get filled in, not
    // cleared), but keeps status consistent if a future edit path clears one.
    review.status = 'pending';
    review.completedAt = null;
  }

  await review.save();
  return {
    status: 'ok',
    review,
    reviewCompleted: review.status === 'completed',
    summary: review.status === 'completed' ? {
      mistakesReviewed: review.mistakes.length,
      distinctErrorCategories: [...new Set(review.mistakes.map(m => m.errorCategory).filter(Boolean))].length,
    } : null,
  };
}

async function getReviewHistory(userId, { attemptType, from, to, page = 1, limit = 20 } = {}) {
  const filter = { userId, status: 'completed' };
  if (attemptType) filter.attemptType = attemptType;
  if (from || to) {
    filter.completedAt = {};
    if (from) filter.completedAt.$gte = new Date(from);
    if (to) filter.completedAt.$lte = new Date(to);
  }
  const [items, total] = await Promise.all([
    AttemptReview.find(filter).sort({ completedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    AttemptReview.countDocuments(filter),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
}

module.exports = {
  createReviewIfNeeded, getPendingReview, getReviewDetail, getReviewByAttempt,
  updateMistake, getReviewHistory,
};
