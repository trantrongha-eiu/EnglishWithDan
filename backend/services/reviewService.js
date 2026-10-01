'use strict';

// Mandatory post-test Review System — see docs referenced in the plan this
// was built from (backend/models/AttemptReview.js has the schema-level
// rationale). This service is deliberately thin: it never re-fetches
// Passage/ListeningTest content (the frontend already has that from the
// existing review/history-detail endpoints).
const AttemptReview = require('../models/AttemptReview');
const ReviewBypassCode = require('../models/ReviewBypassCode');
const WritingAttempt = require('../models/WritingAttempt');
const TestAttempt = require('../models/TestAttempt');
const ReadingPracticeAttempt = require('../models/ReadingPracticeAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const ListeningPracticeAttempt = require('../models/ListeningPracticeAttempt');
// populate() targets for the attempt models above
require('../models/ReadingTest');
require('../models/ListeningTest');
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
//
// Same-named attempts only owe ONE review — the newest. Retaking a test
// (or several random mock runs, all named "MockTest Đề Random") used to
// stack up one pending review per run, so a student was forced to review
// the same test over and over. A pending review is marked 'superseded'
// once the student has SUBMITTED a newer attempt with the same name and
// kind — whether that newer run has its own pending review or scored
// perfectly and needed none. Done lazily here, so the existing backlog
// clears itself on the next gate check too.
async function getPendingReviews(userId, skill) {
  const attemptTypes = skill === 'reading' ? ['reading', 'reading-practice'] : ['listening', 'listening-practice'];
  let items = await AttemptReview.find({ userId, status: 'pending', attemptType: { $in: attemptTypes } })
    .sort({ createdAt: 1 });
  if (items.length) {
    const stale = await findSupersededReviews(userId, items);
    if (stale.length) {
      await AttemptReview.updateMany(
        { _id: { $in: stale }, userId, status: 'pending' },
        { $set: { status: 'superseded', completedAt: new Date() } }
      );
      const staleSet = new Set(stale.map(String));
      items = items.filter(r => !staleSet.has(String(r._id)));
    }
  }
  return { items, count: items.length };
}

// Where each attemptType's attempt lives, what it's called and when it was
// submitted — shared by describePendingReviews (lookup by _id) and
// findSupersededReviews (lookup of the student's newer attempts).
// `done` = statuses that count as a real, graded submission (in-progress /
// abandoned / disqualified runs never supersede anything).
const ATTEMPT_SOURCES = {
  reading: {
    model: TestAttempt, select: 'testId endTime', populate: true, dateField: 'endTime',
    done: ['completed', 'timeout'], title: a => a.testId?.name, takenAt: a => a.endTime,
  },
  'reading-practice': {
    model: ReadingPracticeAttempt, select: 'passageTitle submittedAt', dateField: 'submittedAt',
    done: ['completed'], title: a => a.passageTitle, takenAt: a => a.submittedAt,
  },
  listening: {
    model: ListeningAttempt, select: 'testName testId submittedAt', populate: true, dateField: 'submittedAt',
    done: ['completed', 'timeout'], title: a => a.testName || a.testId?.name, takenAt: a => a.submittedAt,
  },
  'listening-practice': {
    model: ListeningPracticeAttempt, select: 'sectionTitle submittedAt', dateField: 'submittedAt',
    done: ['completed'], title: a => a.sectionTitle, takenAt: a => a.submittedAt,
  },
};

function findAttempts(attemptType, filter) {
  const src = ATTEMPT_SOURCES[attemptType];
  let q = src.model.find(filter).select(src.select);
  if (src.populate) q = q.populate('testId', 'name');
  return q.lean();
}

const titleKey = t => String(t || '').trim().toLowerCase().replace(/\s+/g, ' ');

// _ids of every pending review whose student has since submitted a NEWER
// attempt of the same attemptType (so same skill AND same Full đề/Bài lẻ
// kind) with the same title. Rows whose attempt is gone (no real title)
// are never superseded — the generic fallback title would match anything.
async function findSupersededReviews(userId, items) {
  const described = (await describePendingReviews(items)).filter(d => d.hasTitle);
  const byType = {};
  described.forEach(d => { (byType[d.attemptType] = byType[d.attemptType] || []).push(d); });
  const stale = [];
  await Promise.all(Object.entries(byType).map(async ([attemptType, rows]) => {
    const src = ATTEMPT_SOURCES[attemptType];
    const oldest = new Date(Math.min(...rows.map(d => new Date(d.takenAt).getTime())));
    const newer = await findAttempts(attemptType, {
      userId, status: { $in: src.done }, [src.dateField]: { $gt: oldest },
    });
    const latest = new Map();
    newer.forEach(a => {
      const key = titleKey(src.title(a));
      const t = new Date(src.takenAt(a)).getTime();
      if (key && !(latest.get(key) >= t)) latest.set(key, t);
    });
    rows.forEach(d => {
      if (latest.get(titleKey(d.title)) > new Date(d.takenAt).getTime()) stale.push(d._id);
    });
  }));
  return stale;
}

// Turns getPendingReviews()'s raw docs into what the student-facing list
// needs: WHICH test/passage each pending review belongs to, when it was
// taken, and how far along it is. Without this the gate only ever pointed
// at "the oldest one" — a student who fully reviewed their mock test still
// saw "Bạn có N bài đang chờ Review" from other attempts (often Bài lẻ, or
// several mock runs all named "MockTest Đề Random") with no way to tell
// which ones were left, and read it as the finished test being re-demanded.
// One batched lookup per attempt type; a row whose attempt is gone keeps a
// generic title instead of disappearing (it still counts toward the gate).
async function describePendingReviews(items) {
  const idsByType = {};
  items.forEach(r => { (idsByType[r.attemptType] = idsByType[r.attemptType] || []).push(r.attemptId); });
  const meta = {};
  await Promise.all(Object.entries(idsByType).map(([attemptType, ids]) => {
    const src = ATTEMPT_SOURCES[attemptType];
    return findAttempts(attemptType, { _id: { $in: ids } }).then(rows => rows.forEach(a => {
      meta[String(a._id)] = { title: src.title(a), takenAt: src.takenAt(a) };
    }));
  }));
  return items.map(r => {
    const m = meta[String(r.attemptId)] || {};
    const title = (m.title || '').trim();
    return {
      _id: r._id,
      attemptType: r.attemptType,
      attemptId: r.attemptId,
      isPractice: r.attemptType.endsWith('-practice'),
      title: title || 'Bài đã làm',
      hasTitle: !!title,
      takenAt: m.takenAt || r.createdAt,
      mistakeCount: r.mistakes.length,
      reviewedCount: r.mistakes.filter(x => x.completedAt).length,
    };
  });
}

// History rows (full tests or Bài lẻ) → same rows + reviewStatus
// ('none' | 'pending' | 'completed' | 'bypassed' | 'unavailable' | 'superseded') and
// reviewed/total counts, so the history tables can flag "Chưa review".
async function attachReviewStatus(userId, attemptType, rows) {
  const map = await getReviewStatusMap(userId, attemptType, rows.map(r => r._id));
  return rows.map(r => {
    const s = map[String(r._id)];
    return { ...r, reviewStatus: s ? s.status : 'none', reviewMistakeCount: s ? s.mistakeCount : 0, reviewedCount: s ? s.reviewedCount : 0 };
  });
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
  reviews.forEach(r => {
    map[r.attemptId.toString()] = {
      status: r.status, mistakeCount: r.mistakes.length, reviewedCount: r.mistakes.filter(m => m.completedAt).length,
    };
  });
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

// Redeem an admin-issued code. Two kinds share this one code pool (see
// models/ReviewBypassCode.js):
//
//  - 'review-bypass' (default): marks every one of this student's PENDING
//    reading/listening reviews 'bypassed' AND every graded Writing essay
//    still awaiting a rewrite 'rewrite.bypassed' — so BOTH the
//    mandatory-review gate (reading/listening) and the rewrite gate
//    (writing) open again. One code clears the student's whole backlog.
//  - 'wt1-test-unlock': opens the code's one `targetLessonCode` WT1 test
//    lesson for this student — see wt1Service.assertLessonUnlocked. No
//    other collection is touched; the redemption itself IS the unlock.
//
// Returns { status, ... } — 'ok' | 'not_found' | 'not_redeemable' |
// 'already_used' | 'nothing_pending' (review-bypass only, when there was
// nothing to clear). `cleared` = reviews + rewrites (review-bypass only).
async function redeemBypassCode(userId, rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) return { status: 'not_found' };

  const doc = await ReviewBypassCode.findOne({ code });
  if (!doc) return { status: 'not_found' };
  if (!doc.isRedeemable()) return { status: 'not_redeemable' };
  if (doc.redemptions.some(r => String(r.userId) === String(userId))) {
    return { status: 'already_used' };
  }

  if (doc.kind === 'wt1-test-unlock') {
    doc.redemptions.push({ userId });
    doc.usedCount += 1;
    await doc.save();
    return { status: 'ok', kind: 'wt1-test-unlock', lessonCode: doc.targetLessonCode };
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

// Called by reading/listeningService.getPracticeHistoryDetail the moment a
// Bài lẻ review's passage/section resolves to null (permanently deleted by
// an admin after the student's attempt). Unlike full-test reviews, practice
// reviews carry no content snapshot, so once this happens the review can
// never be shown again — left 'pending', it would sit forever as the
// oldest item getPendingReviews/_goToPendingReview always points a student
// at, hard-blocking new practice with no way to ever clear it (every
// "Tiếp tục Review" click reruns the same failing lookup). A no-op if the
// review was already resolved some other way (redeemed code, TTL-expired).
async function resolveOrphanedReview(attemptType, attemptId) {
  await AttemptReview.updateOne(
    { attemptType, attemptId, status: 'pending' },
    { $set: { status: 'unavailable', completedAt: new Date() } }
  );
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
  createReviewIfNeeded, getPendingReviews, describePendingReviews, attachReviewStatus,
  getReviewStatusMap, MAX_PENDING_REVIEWS,
  getReviewDetail, getReviewByAttempt, updateMistake, getReviewHistory,
  redeemBypassCode, resolveOrphanedReview,
};
