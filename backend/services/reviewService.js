'use strict';

// Mandatory post-test Review System — see docs referenced in the plan this
// was built from (backend/models/AttemptReview.js has the schema-level
// rationale). This service is deliberately thin: it never re-fetches
// Passage/ListeningTest content (the frontend already has that from the
// existing review/history-detail endpoints).
const AttemptReview = require('../models/AttemptReview');
const { skillFor, resolveErrorCode } = require('../constants/errorTaxonomy');

// A mistake counts as "reviewed" once the core guided-review steps are
// done — error classification, confidence, and an attempted retry. Free-
// text fields (evidence, temptingAnswerNote, note, learningPoint.content)
// are deliberately optional so 7 mistakes doesn't turn into an essay
// assignment; learningPoint.category is a single tap, not free text, so
// it's required alongside the others.
function coreFieldsFilled(m) {
  // retryAnswer must be a non-empty attempt, not just "the field was
  // touched" — `!= null` alone let a client PATCH with retryAnswer:'' and
  // have it count as a completed retry without the student actually
  // attempting anything (found during audit; the frontend already guards
  // against sending an empty value, but the backend must not rely on that).
  return !!(m.errorCategory && m.errorReason && m.confidence
    && typeof m.retryAnswer === 'string' && m.retryAnswer.trim().length > 0
    && m.learningPoint?.category);
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
//
// A student can legitimately have MULTIPLE pending reviews at once — submit
// routes were never gated, only start/fetch — so this returns every pending
// doc, not just the oldest (see MAX_PENDING_REVIEWS below for why that
// matters: the old getPendingReview() only ever surfaced the single oldest
// one, so a student who fully finished THAT review could still be blocked
// by a second, entirely invisible one from a concurrent attempt, with no
// indication anything else was left).
function getPendingReviews(userId, skill) {
  const attemptTypes = skill === 'reading' ? ['reading', 'reading-practice'] : ['listening', 'listening-practice'];
  return AttemptReview.find({ userId, status: 'pending', attemptType: { $in: attemptTypes } })
    .sort({ createdAt: 1 })
    .then(items => ({ items, count: items.length }));
}

// Gate threshold — a student may have up to this many pending reviews
// before being blocked from starting a new test/practice of that skill.
// Below this, they're free to keep practicing (informational nudge only);
// at/above it, requireReviewComplete.js blocks with a 403 explaining why.
const MAX_PENDING_REVIEWS = 3;

// One query, reused by both readingService.listTestsForUser and
// listeningService.listStudentTests to attach a per-test review-status
// badge (none/pending/completed) to each test's lastAttempt, instead of
// each duplicating the AttemptReview query itself.
async function getReviewStatusMap(userId, attemptType, attemptIds) {
  if (!attemptIds.length) return {};
  const reviews = await AttemptReview.find({ userId, attemptType, attemptId: { $in: attemptIds } })
    .select('attemptId status mistakes').lean();
  const map = {};
  reviews.forEach(r => { map[r.attemptId.toString()] = { status: r.status, mistakeCount: r.mistakes.length }; });
  return map;
}

// Strips `correctAnswer` from any mistake that hasn't gone through "Try
// Again" yet. Audit finding: hiding the correct answer until after retry
// was implemented purely in the frontend's rendering order — the raw API
// response already carried it from the start, so anyone opening devtools'
// network tab could see it before attempting the retry, defeating the
// whole point of the exercise. Once retryResult is set (the student has
// submitted their retry), the answer is meant to be revealed, so it's left
// in untouched from that point on.
function _withheldUntilRetried(reviewDoc) {
  if (!reviewDoc) return reviewDoc;
  reviewDoc.mistakes = reviewDoc.mistakes.map(m => m.retryResult == null ? { ...m, correctAnswer: undefined } : m);
  return reviewDoc;
}

async function getReviewDetail(reviewId, userId) {
  const doc = await AttemptReview.findOne({ _id: reviewId, userId }).lean();
  return _withheldUntilRetried(doc);
}

async function getReviewByAttempt(attemptType, attemptId, userId) {
  const doc = await AttemptReview.findOne({ attemptType, attemptId, userId }).lean();
  return _withheldUntilRetried(doc);
}

// The isolated "Try Again" retry is always a single value for ONE question
// — even for cluster question types (multi-answer-group, checkbox) whose
// ORIGINAL submission format is a JSON-encoded array/letter-set shared
// across a whole question cluster (see readingService.gradeMultiAnswerGroup/
// listeningService.matchSingleAnswer's own comments). Audit finding: the
// frontend's isolated retry sends a single chip value, not a JSON array, so
// reusing those original comparators here made JSON.parse throw on every
// multi-answer-group/checkbox retry, silently grading it "wrong"
// regardless of correctness. A plain single-value match (case-insensitive,
// "/"-delimited alternates supported, matching gradeOne's own fallback
// branch) is correct for every question type in this isolated-retry
// context — this never needs to call back into readingService/
// listeningService at all.
function gradeRetry(rawUser, rawCorrect) {
  if (!rawUser) return false;
  const alts = String(rawCorrect || '').split('/').map(s => s.trim().toLowerCase()).filter(Boolean);
  return alts.includes(String(rawUser).trim().toLowerCase());
}

const MAX_LEN = { evidence: 1000, temptingAnswerNote: 1000, note: 1000, 'learningPoint.content': 500 };
const PATCHABLE_TEXT_FIELDS = ['evidence', 'temptingAnswerNote', 'note'];

async function updateMistake(reviewId, mistakeId, userId, patch) {
  const review = await AttemptReview.findOne({ _id: reviewId, userId });
  if (!review) return { status: 'not_found' };
  const mistake = review.mistakes.id(mistakeId);
  if (!mistake) return { status: 'not_found' };

  // Validate everything BEFORE mutating the in-memory document — audit
  // finding: the previous version wrote patch.confidence into the
  // subdocument via a generic field-copy loop and only checked its
  // validity afterward. Harmless in practice (the early return skipped
  // save()), but the wrong order for a function whose whole point is
  // never trusting client input.
  if (patch.confidence !== undefined && patch.confidence !== null
      && !['very-confident', 'not-sure', 'guessing'].includes(patch.confidence)) {
    return { status: 'invalid_confidence' };
  }
  let resolvedCode = null;
  if (patch.errorCategory !== undefined || patch.errorReason !== undefined) {
    const category = patch.errorCategory ?? mistake.errorCategory;
    const reason = patch.errorReason ?? mistake.errorReason;
    resolvedCode = resolveErrorCode(skillFor(review.attemptType), category, reason);
    if (!resolvedCode) return { status: 'invalid_taxonomy' };
  }
  for (const field of PATCHABLE_TEXT_FIELDS) {
    if (patch[field] !== undefined && String(patch[field]).length > MAX_LEN[field]) {
      return { status: 'field_too_long', field, max: MAX_LEN[field] };
    }
  }
  if (patch.learningPoint?.category !== undefined) {
    const cat = patch.learningPoint.category;
    if (cat !== null && !['vocabulary', 'strategy', 'grammar', 'ielts-trap'].includes(cat)) {
      return { status: 'invalid_learning_point' };
    }
  }
  if (patch.learningPoint?.content !== undefined && String(patch.learningPoint.content).length > MAX_LEN['learningPoint.content']) {
    return { status: 'field_too_long', field: 'learningPoint.content', max: MAX_LEN['learningPoint.content'] };
  }

  // All validated — now safe to assign.
  if (resolvedCode) {
    mistake.errorCategory = patch.errorCategory ?? mistake.errorCategory;
    mistake.errorReason = patch.errorReason ?? mistake.errorReason;
    mistake.errorCode = resolvedCode;
  }
  if (patch.confidence !== undefined) mistake.confidence = patch.confidence;
  for (const field of PATCHABLE_TEXT_FIELDS) {
    if (patch[field] !== undefined) mistake[field] = patch[field];
  }
  if (patch.retryAnswer !== undefined) {
    mistake.retryAnswer = patch.retryAnswer;
    // Server-computed, never trusted from the client — grades the isolated
    // retry against this mistake's own frozen correctAnswer.
    mistake.retryResult = gradeRetry(patch.retryAnswer, mistake.correctAnswer) ? 'correct' : 'wrong';
  }
  if (patch.learningPoint !== undefined) {
    if (patch.learningPoint.category !== undefined) mistake.learningPoint.category = patch.learningPoint.category;
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
    // toObject() + _withheldUntilRetried, not the live mongoose doc directly
    // — this response carries every mistake in the review, not just the one
    // just patched, so any OTHER mistake still awaiting its own retry must
    // have its correctAnswer withheld here too, the same as the plain GET
    // endpoints (fixed alongside the same audit finding).
    review: _withheldUntilRetried(review.toObject()),
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
  createReviewIfNeeded, getPendingReviews, getReviewStatusMap, MAX_PENDING_REVIEWS,
  getReviewDetail, getReviewByAttempt, updateMistake, getReviewHistory,
};
