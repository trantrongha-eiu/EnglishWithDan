'use strict';

/**
 * examSimulationService — "Test Simulation" mode for standalone Reading,
 * Listening and Writing attempts (full test AND individual/"lẻ" practice).
 *
 * Deliberately parallel to, not built on top of, mockTestService.js's
 * 4-skill Mock Test proctoring (MockTestAttempt) — that flow is untouched.
 * The violation-counting/disqualify logic here is a direct copy of
 * mockTestService.recordViolation's shape and behavior (same response
 * contract: {violationCount, violated, disqualified, cooldownSeconds}) so
 * the frontend's exam-proctor.js can reuse mock-test.js's proven
 * response-handling logic verbatim. See backend/models/shared/
 * proctorSchema.js for the embedded sub-doc every attempt model below
 * shares.
 *
 * Unlike the 4-skill Mock Test (one MockTestAttempt wrapper voids without
 * touching the underlying per-skill attempts), a Simulation attempt IS the
 * thing being voided — there's no separate wrapper, so disqualifying it
 * sets status:'disqualified' directly on the TestAttempt/ListeningAttempt/
 * WritingAttempt/*PracticeAttempt row itself.
 */
const mongoose = require('mongoose');
const { ValidationError, NotFoundError, AppError } = require('../errors/AppError');
const User = require('../models/User');
const TestAttempt = require('../models/TestAttempt');
const ReadingPracticeAttempt = require('../models/ReadingPracticeAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const ListeningPracticeAttempt = require('../models/ListeningPracticeAttempt');
const WritingAttempt = require('../models/WritingAttempt');

const SKILLS = ['reading', 'listening', 'writing'];
const ATTEMPT_TYPES = ['full', 'practice'];
const PROCTOR_TYPES = ['hidden', 'blur', 'unload-attempt'];
const PROCTOR_EVENT_CAP = 200; // keep the most recent N, never grow unbounded

// Intentionally separate from mockTestService's MAX_VIOLATIONS (10) — a
// stricter threshold for single-skill Simulation, per product decision.
const MAX_VIOLATIONS = 5;
// Global across ALL 3 skills (confirmed product decision — not per-skill):
// a disqualification in any one of Reading/Listening/Writing locks starting
// a new Simulation in any of them for this long. Same 5-minute value as
// mockTestService's DQ_COOLDOWN_SECONDS, tracked independently.
const COOLDOWN_SECONDS = 300;

// A single Reading passage / Listening section has no official IELTS time
// limit on its own — these are the platform's own exam-condition
// convention for "lẻ" Simulation mode, not real IELTS rules. Listening has
// no entry here: its single-play, no-pause/no-rewind audio already acts as
// a natural limit, so Simulation adds no artificial countdown there.
const READING_PRACTICE_DURATION_SEC = 20 * 60;
const WRITING_TASK_DURATION_SEC = { 1: 20 * 60, 2: 40 * 60 };

function modelFor(skill, attemptType) {
  if (!SKILLS.includes(skill)) throw new ValidationError('Kỹ năng không hợp lệ');
  if (!ATTEMPT_TYPES.includes(attemptType)) throw new ValidationError('Loại bài không hợp lệ');
  if (skill === 'reading') return attemptType === 'full' ? TestAttempt : ReadingPracticeAttempt;
  if (skill === 'listening') return attemptType === 'full' ? ListeningAttempt : ListeningPracticeAttempt;
  return WritingAttempt; // full exam + per-task practice share one model/collection
}

// ── Cooldown ────────────────────────────────────────────────────────────

async function checkCooldown(userId) {
  const user = await User.findById(userId).select('simulationCooldownUntil').lean();
  const untilMs = user && user.simulationCooldownUntil ? new Date(user.simulationCooldownUntil).getTime() : 0;
  const remainingMs = untilMs - Date.now();
  if (remainingMs <= 0) return { active: false, remainingSeconds: 0 };
  return { active: true, remainingSeconds: Math.ceil(remainingMs / 1000) };
}

// Throws a 429 (same convention mockTestService.startMockTest already uses
// for its own cooldown, incl. the .cooldownSeconds property) if the
// student is still locked out. Called first, before anything else, in
// every Simulation "start" path below — reads straight from the User
// document server-side, so refresh / logout+login / calling the start API
// directly with nothing but a valid token all hit the exact same check.
async function assertNotOnCooldown(userId) {
  const { active, remainingSeconds } = await checkCooldown(userId);
  if (!active) return;
  const waitMin = Math.max(1, Math.ceil(remainingSeconds / 60));
  const err = new AppError(
    `Bạn vừa bị huỷ một lượt Test Simulation do vi phạm giám sát quá ${MAX_VIOLATIONS} lần. `
    + `Vui lòng đợi khoảng ${waitMin} phút nữa rồi bắt đầu lượt mới.`,
    429
  );
  err.cooldownSeconds = remainingSeconds;
  throw err;
}

// ── Violations ──────────────────────────────────────────────────────────

// A skill page reported the student leaving the exam tab during a live
// Simulation attempt. `attemptType` distinguishes full-test vs "lẻ"
// practice so the right model is looked up (see modelFor). Only counts
// while the attempt is still 'in-progress'; once it's already
// completed/timed-out/disqualified this is a no-op that just echoes the
// terminal state back — same idempotency guarantee as
// mockTestService.recordViolation, so a late/duplicate keepalive POST
// can't double-disqualify or resurrect a finished attempt.
async function recordViolation(userId, { skill, attemptType, attemptId, type }) {
  if (!mongoose.isValidObjectId(attemptId)) throw new ValidationError('attemptId không hợp lệ');
  if (!PROCTOR_TYPES.includes(type)) throw new ValidationError('Loại vi phạm không hợp lệ');
  const Model = modelFor(skill, attemptType);

  const doc = await Model.findOne({ _id: attemptId, userId });
  if (!doc) throw new NotFoundError('Không tìm thấy bài làm');
  if (doc.mode !== 'simulation') throw new ValidationError('Bài làm này không ở chế độ Test Simulation');

  if (!doc.proctor) doc.proctor = { violationCount: 0, violated: false, events: [] };

  if (doc.status !== 'in-progress') {
    const dq = doc.status === 'disqualified';
    return {
      violationCount: doc.proctor.violationCount || 0,
      violated: !!doc.proctor.violated,
      disqualified: dq,
      cooldownSeconds: dq ? COOLDOWN_SECONDS : 0
    };
  }

  doc.proctor.violationCount = (doc.proctor.violationCount || 0) + 1;
  doc.proctor.violated = true;
  doc.proctor.events.push({ type, at: new Date() });
  if (doc.proctor.events.length > PROCTOR_EVENT_CAP) {
    doc.proctor.events = doc.proctor.events.slice(-PROCTOR_EVENT_CAP);
  }

  let disqualified = false;
  if (doc.proctor.violationCount > MAX_VIOLATIONS) {
    doc.status = 'disqualified';
    doc.proctor.disqualifiedAt = new Date();
    disqualified = true;
  }

  await doc.save();

  if (disqualified) {
    // Global cooldown, set unconditionally on every disqualification (not
    // just the first) — a student who racks up several always waits the
    // full 5 minutes from the most recent one, not the first.
    await User.updateOne(
      { _id: userId },
      { $set: { simulationCooldownUntil: new Date(Date.now() + COOLDOWN_SECONDS * 1000) } }
    );
  }

  return {
    violationCount: doc.proctor.violationCount,
    violated: true,
    disqualified,
    cooldownSeconds: disqualified ? COOLDOWN_SECONDS : 0
  };
}

module.exports = {
  SKILLS,
  ATTEMPT_TYPES,
  MAX_VIOLATIONS,
  COOLDOWN_SECONDS,
  READING_PRACTICE_DURATION_SEC,
  WRITING_TASK_DURATION_SEC,
  modelFor,
  checkCooldown,
  assertNotOnCooldown,
  recordViolation,
};
