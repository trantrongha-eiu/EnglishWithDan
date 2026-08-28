'use strict';

/**
 * mockTestService — the full 4-skill IELTS mock test.
 *
 * A run is one MockTestAttempt (see the model for the two-sitting shape).
 * We never re-implement any skill's exam engine: `startMockTest` just picks
 * a random active test per skill and stores the bundle; each skill page,
 * in "mock mode", starts that assigned test through its own existing
 * /start endpoint and calls `advance` after its own /submit. `advance`
 * reads the freshly-created per-skill attempt to record a back-reference
 * (and the band, when the skill grades synchronously).
 */
const mongoose = require('mongoose');
const { ValidationError, NotFoundError, AppError } = require('../errors/AppError');
const MockTestAttempt = require('../models/MockTestAttempt');
const ListeningTest = require('../models/ListeningTest');
const ReadingTest = require('../models/ReadingTest');
const WritingExam = require('../models/WritingExam');
const SpeakingQuestion = require('../models/SpeakingQuestion');
const ListeningAttempt = require('../models/ListeningAttempt');
const TestAttempt = require('../models/TestAttempt');           // Reading
const WritingAttempt = require('../models/WritingAttempt');
const SpeakingAttempt = require('../models/SpeakingAttempt');

const SKILL_ORDER = ['listening', 'reading', 'writing', 'speaking'];
const NEXT = { listening: 'reading', reading: 'writing', writing: 'speaking', speaking: 'done' };

// Same random-doc pattern as writingService.randomDoc — count then skip.
async function randomActive(Model, extraFilter = {}) {
  const filter = { isActive: true, ...extraFilter };
  const count = await Model.countDocuments(filter);
  if (!count) return null;
  return Model.findOne(filter).skip(Math.floor(Math.random() * count)).lean();
}

// Official IELTS overall band: mean of the four skill bands, rounded to the
// nearest half (x.25 rounds up to x.5, x.75 up to the next whole).
function roundOverall(avg) {
  return Math.round(avg * 2) / 2;
}

function numericBand(v) {
  return typeof v === 'number' && v > 0 ? v : null;
}

// Pull the band for one already-graded sub-attempt. Returns null when the
// skill grades asynchronously and isn't done yet (Writing: teacher/AI;
// Speaking: AI) — history re-checks those later.
async function readBand(skill, attemptId) {
  if (!attemptId) return null;
  if (skill === 'listening') {
    const a = await ListeningAttempt.findById(attemptId).select('bandScore').lean();
    return numericBand(a && a.bandScore);
  }
  if (skill === 'reading') {
    const a = await TestAttempt.findById(attemptId).select('bandScore').lean();
    return numericBand(a && a.bandScore);
  }
  if (skill === 'writing') {
    const a = await WritingAttempt.findById(attemptId).select('grading.overallBand').lean();
    return numericBand(a && a.grading && a.grading.overallBand);
  }
  if (skill === 'speaking') {
    const a = await SpeakingAttempt.findById(attemptId).select('aiFeedback.overallBand status').lean();
    return numericBand(a && a.aiFeedback && a.aiFeedback.overallBand);
  }
  return null;
}

// Recomputes overallBand + status from whatever bands are currently on the
// doc. Mutates in place; caller saves.
function recomputeOverall(doc) {
  const bands = SKILL_ORDER.map(s => numericBand(doc.steps[s] && doc.steps[s].band));
  const allDone = doc.progress === 'done';
  if (bands.every(b => b !== null)) {
    doc.overallBand = roundOverall(bands.reduce((a, b) => a + b, 0) / 4);
    doc.status = 'completed';
  } else {
    doc.overallBand = null;
    doc.status = allDone ? 'awaiting-grading' : 'in-progress';
  }
}

// The one still-open mock for this user (in-progress or done-but-awaiting
// grading), newest first.
async function getCurrentDoc(userId) {
  return MockTestAttempt.findOne({
    userId,
    status: { $in: ['in-progress', 'awaiting-grading'] }
  }).sort({ createdAt: -1 });
}

async function startMockTest(userId) {
  // Resume rather than stacking a second open run.
  const existing = await getCurrentDoc(userId);
  if (existing) return { resumed: true, attempt: publicShape(existing) };

  const [lt, rt, we, sq] = await Promise.all([
    randomActive(ListeningTest),
    randomActive(ReadingTest),
    randomActive(WritingExam),
    randomActive(SpeakingQuestion, { part: 2 })
  ]);

  const missing = [];
  if (!lt) missing.push('Listening');
  if (!rt) missing.push('Reading');
  if (!we) missing.push('Writing');
  if (!sq) missing.push('Speaking');
  if (missing.length) {
    throw new ValidationError(`Chưa đủ đề cho bài thi thử (thiếu: ${missing.join(', ')}). Vui lòng liên hệ giáo viên.`);
  }

  const doc = await MockTestAttempt.create({
    userId,
    bundle: {
      listeningTestId: lt._id,
      readingTestId: rt._id,
      writingExamId: we._id,
      speakingQuestionId: sq._id,
      speakingTopic: sq.topic || '',
      speakingCueCard: sq.cueCard || sq.question || '',
      listeningTestName: lt.name || '',
      readingTestName: rt.name || '',
      writingExamName: we.name || ''
    },
    progress: 'listening'
  });

  return { resumed: false, attempt: publicShape(doc) };
}

async function getCurrent(userId) {
  const doc = await getCurrentDoc(userId);
  return doc ? publicShape(doc) : null;
}

// Student discarded the still-open run from the dashboard. Mark it
// 'abandoned' (kept out of history + the resume lookup) so startMockTest()
// will build a fresh bundle on their next go. No-op if nothing is open.
async function abandonCurrent(userId) {
  const doc = await getCurrentDoc(userId);
  if (!doc) return { abandoned: false };
  doc.status = 'abandoned';
  await doc.save();
  return { abandoned: true, attemptId: String(doc._id) };
}

const PROCTOR_TYPES = ['hidden', 'blur', 'unload-attempt'];
const PROCTOR_EVENT_CAP = 200; // keep the most recent N, never grow unbounded

// A mock skill page reported the student leaving the exam tab. Bump the
// counter + flag the run. Only counts while the run is still open; once
// it's graded/completed/abandoned this is a no-op that just echoes the
// current tally back.
async function recordViolation(userId, mockId, { type, skill } = {}) {
  if (!mongoose.isValidObjectId(mockId)) throw new ValidationError('mockId không hợp lệ');
  if (!PROCTOR_TYPES.includes(type)) throw new ValidationError('Loại vi phạm không hợp lệ');

  const doc = await MockTestAttempt.findOne({ _id: mockId, userId });
  if (!doc) throw new NotFoundError('Không tìm thấy bài thi thử');

  if (!doc.proctor) doc.proctor = { violationCount: 0, violated: false, events: [] };

  if (doc.status !== 'in-progress') {
    return { violationCount: doc.proctor.violationCount || 0, violated: !!doc.proctor.violated };
  }

  doc.proctor.violationCount = (doc.proctor.violationCount || 0) + 1;
  doc.proctor.violated = true;
  doc.proctor.events.push({
    type,
    skill: SKILL_ORDER.includes(skill) ? skill : undefined,
    at: new Date()
  });
  if (doc.proctor.events.length > PROCTOR_EVENT_CAP) {
    doc.proctor.events = doc.proctor.events.slice(-PROCTOR_EVENT_CAP);
  }
  await doc.save();

  return { violationCount: doc.proctor.violationCount, violated: true };
}

async function advance(userId, mockId, { skill, attemptId }) {
  if (!mongoose.isValidObjectId(mockId)) throw new ValidationError('mockId không hợp lệ');
  if (!SKILL_ORDER.includes(skill)) throw new ValidationError('skill không hợp lệ');

  const doc = await MockTestAttempt.findOne({ _id: mockId, userId });
  if (!doc) throw new NotFoundError('Không tìm thấy bài thi thử');

  // Idempotent: a double-tap / back-forward that re-fires advance for a step
  // already recorded just returns the current navigation target again.
  const alreadyDone = !!(doc.steps[skill] && doc.steps[skill].completedAt);
  if (doc.progress !== skill && !alreadyDone) {
    throw new AppError(`Bước hiện tại là "${doc.progress}", không phải "${skill}"`, 409);
  }

  if (!alreadyDone) {
    const band = await readBand(skill, attemptId);
    doc.steps[skill] = { attemptId: attemptId || undefined, band, completedAt: new Date() };
    doc.progress = NEXT[skill];
    if (skill === 'reading') doc.sitting1CompletedAt = new Date();
    if (skill === 'speaking') doc.sitting2CompletedAt = new Date();
    recomputeOverall(doc);
    await doc.save();
  }

  return { attempt: publicShape(doc), nav: navFor(doc, skill) };
}

// Where the frontend should send the student after `skill` was recorded.
function navFor(doc, skill) {
  if (skill === 'listening') {
    return { nextSkill: 'reading', nextTargetId: String(doc.bundle.readingTestId) };
  }
  if (skill === 'reading') {
    return { sittingBreak: true, nextSkill: 'writing' };
  }
  if (skill === 'writing') {
    return { nextSkill: 'speaking', nextTargetId: String(doc.bundle.speakingQuestionId) };
  }
  return { done: true };
}

// Re-reads any sub-attempt whose band is still null (Writing graded later by
// admin/cron, Speaking by AI) and patches it in. Mutates + saves if changed.
async function refreshGrades(doc) {
  let changed = false;
  for (const skill of SKILL_ORDER) {
    const step = doc.steps[skill];
    if (step && step.completedAt && step.attemptId && numericBand(step.band) === null) {
      const band = await readBand(skill, step.attemptId);
      if (band !== null) { step.band = band; changed = true; }
    }
  }
  if (changed) {
    recomputeOverall(doc);
    await doc.save();
  }
  return doc;
}

async function getHistory(userId, { page = 1, limit = 10 } = {}) {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(50, Math.max(1, Number(limit) || 10));
  const histFilter = { userId, status: { $ne: 'abandoned' } };
  const [docs, total] = await Promise.all([
    MockTestAttempt.find(histFilter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    MockTestAttempt.countDocuments(histFilter)
  ]);
  const items = [];
  for (const doc of docs) {
    await refreshGrades(doc);
    items.push(publicShape(doc));
  }
  return { items, total, page, limit };
}

async function getHistoryDetail(userId, id) {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await MockTestAttempt.findOne({ _id: id, userId, status: { $ne: 'abandoned' } });
  if (!doc) return null;
  await refreshGrades(doc);
  return publicShape(doc);
}

// Serializer — the frontend never needs the raw Mongoose doc.
function publicShape(doc) {
  const step = s => ({
    attemptId: doc.steps[s] && doc.steps[s].attemptId ? String(doc.steps[s].attemptId) : null,
    band: doc.steps[s] && numericBand(doc.steps[s].band) !== null ? doc.steps[s].band : null,
    completedAt: doc.steps[s] && doc.steps[s].completedAt ? doc.steps[s].completedAt : null
  });
  return {
    _id: String(doc._id),
    progress: doc.progress,
    status: doc.status,
    overallBand: numericBand(doc.overallBand),
    createdAt: doc.createdAt,
    sitting1CompletedAt: doc.sitting1CompletedAt || null,
    sitting2CompletedAt: doc.sitting2CompletedAt || null,
    bundle: {
      listeningTestId: String(doc.bundle.listeningTestId || ''),
      readingTestId: String(doc.bundle.readingTestId || ''),
      writingExamId: String(doc.bundle.writingExamId || ''),
      speakingQuestionId: String(doc.bundle.speakingQuestionId || ''),
      speakingTopic: doc.bundle.speakingTopic || '',
      speakingCueCard: doc.bundle.speakingCueCard || '',
      listeningTestName: doc.bundle.listeningTestName || '',
      readingTestName: doc.bundle.readingTestName || '',
      writingExamName: doc.bundle.writingExamName || ''
    },
    steps: {
      listening: step('listening'),
      reading: step('reading'),
      writing: step('writing'),
      speaking: step('speaking')
    },
    proctor: {
      violationCount: (doc.proctor && doc.proctor.violationCount) || 0,
      violated: !!(doc.proctor && doc.proctor.violated),
      events: ((doc.proctor && doc.proctor.events) || []).map(e => ({
        type: e.type, skill: e.skill || null, at: e.at
      }))
    }
  };
}

module.exports = {
  startMockTest, getCurrent, abandonCurrent, recordViolation,
  advance, getHistory, getHistoryDetail,
  // exported for tests
  roundOverall, randomActive, SKILL_ORDER
};
