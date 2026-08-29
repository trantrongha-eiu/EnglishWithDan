'use strict';

// Mandatory post-test Review System — see docs referenced in the plan this
// was built from (backend/models/AttemptReview.js has the schema-level
// rationale). This service is deliberately thin: it never re-fetches
// Passage/ListeningTest content (the frontend already has that from the
// existing review/history-detail endpoints).
const AttemptReview = require('../models/AttemptReview');
const ReviewBypassCode = require('../models/ReviewBypassCode');
const WritingAttempt = require('../models/WritingAttempt');
const { skillFor, resolveErrorCode } = require('../constants/errorTaxonomy');

// A mistake counts as "reviewed" once the core guided-review steps are
// done — error classification, confidence, and "what to remember" learning
// point. Free-text fields (evidence, temptingAnswerNote, note,
// learningPoint.content) are deliberately optional so 7 mistakes doesn't
// turn into an essay assignment; learningPoint.category is a single tap,
// not free text, so it's required alongside the others.
function coreFieldsFilled(m) {
  return !!(m.errorCategory && m.errorReason && m.confidence && m.learningPoint?.category);
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

// correctAnswer is always included — the review screen behind this data
// already shows it unconditionally (built straight from the attempt's own
// graded answers, independent of this collection), so there was never
// anything left to protect by withholding it here too.
async function getReviewDetail(reviewId, userId) {
  return AttemptReview.findOne({ _id: reviewId, userId }).lean();
}

async function getReviewByAttempt(attemptType, attemptId, userId) {
  return AttemptReview.findOne({ attemptType, attemptId, userId }).lean();
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
      && !['very-confident', 'not-sure', 'guessing', 'left-blank'].includes(patch.confidence)) {
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
    review: review.toObject(),
    reviewCompleted: review.status === 'completed',
    summary: review.status === 'completed' ? {
      mistakesReviewed: review.mistakes.length,
      distinctErrorCategories: [...new Set(review.mistakes.map(m => m.errorCategory).filter(Boolean))].length,
    } : null,
  };
}

// Redeem an admin-issued bypass code: mark every one of this student's
// PENDING reading/listening reviews 'bypassed' AND every graded Writing
// essay still awaiting a rewrite 'rewrite.bypassed' — so BOTH the
// mandatory-review gate (reading/listening) and the rewrite gate (writing)
// open again. One code clears the student's whole backlog.
// Returns { status, ... } — 'ok' | 'not_found' | 'not_redeemable' |
// 'already_used' | 'nothing_pending'. `cleared` = reviews + rewrites.
async function redeemBypassCode(userId, rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) return { status: 'not_found' };

  const doc = await ReviewBypassCode.findOne({ code });
  if (!doc) return { status: 'not_found' };
  if (!doc.isRedeemable()) return { status: 'not_redeemable' };
  if (doc.redemptions.some(r => String(r.userId) === String(userId))) {
    return { status: 'already_used' };
  }

  const now = new Date();
  const [reviewRes, rewriteRes] = await Promise.all([
    AttemptReview.updateMany(
      { userId, status: 'pending' },
      { $set: { status: 'bypassed', bypassCode: code, bypassedAt: now } }
    ),
    WritingAttempt.updateMany(
      { userId, gradingStatus: 'confirmed', 'rewrite.done': { $ne: true }, 'rewrite.bypassed': { $ne: true } },
      { $set: { 'rewrite.bypassed': true, 'rewrite.bypassCode': code, 'rewrite.bypassedAt': now } }
    ),
  ]);
  const cleared = (reviewRes.modifiedCount || 0) + (rewriteRes.modifiedCount || 0);

  doc.redemptions.push({ userId, cleared });
  doc.usedCount += 1;
  await doc.save();

  return cleared ? { status: 'ok', cleared } : { status: 'nothing_pending', cleared: 0 };
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
  redeemBypassCode,
};
