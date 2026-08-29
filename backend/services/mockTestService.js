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

// Best-effort proctoring: once the student has left the exam screen more
// than this many times the run is voided ('disqualified') and they must
// wait out DQ_COOLDOWN_SECONDS before starting a fresh one. Teachers/admins
// are exempt (see recordViolation / startMockTest callers).
const MAX_VIOLATIONS = 10;
const DQ_COOLDOWN_SECONDS = 300; // 5 minutes

// Valid IELTS band values a teacher may type into the manual-score editor.
// Band 0 is deliberately excluded: numericBand() treats 0 as "not graded"
// everywhere in this service (AI/reading attempts default overallBand to 0),
// so a hand-entered 0 would silently read back as blank — leave the skill
// empty instead.
const BAND_VALUES = new Set([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9]);

// Same random-doc pattern as writingService.randomDoc — count then skip.
async function randomActive(Model, extraFilter = {}) {
  const filter = { isActive: true, ...extraFilter };
  const count = await Model.countDocuments(filter);
  if (!count) return null;
  return Model.findOne(filter).skip(Math.floor(Math.random() * count)).lean();
}

// Official IELTS/IDP overall band: the arithmetic mean of the four skill
// bands, rounded to the NEAREST half band — an average ending in .25 rounds
// up to .5, one ending in .75 up to the next whole, one ending in .125
// rounds down to the whole, .375/.625 to the half. `Math.round` gives
// exactly this half-up-at-the-midpoint behaviour.
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
  // A voided / discarded run keeps its terminal status and a null overall
  // band no matter what bands sit on its steps.
  if (doc.status === 'disqualified' || doc.status === 'abandoned') {
    doc.overallBand = null;
    return;
  }
  const bands = SKILL_ORDER.map(s => numericBand(doc.steps[s] && doc.steps[s].band));
  const allNumeric = bands.every(b => b !== null);
  const overall = allNumeric ? roundOverall(bands.reduce((a, b) => a + b, 0) / 4) : null;

  // Run still in progress (student hasn't finished all four): a manual
  // early edit may surface a preview overall once all four bands exist, but
  // it must never flip the run to 'completed' before the student is done.
  if (doc.progress !== 'done') {
    doc.overallBand = overall;
    return;
  }
  doc.overallBand = overall;
  doc.status = allNumeric ? 'completed' : 'awaiting-grading';
}

// The one still-open mock for this user (in-progress or done-but-awaiting
// grading), newest first.
async function getCurrentDoc(userId) {
  return MockTestAttempt.findOne({
    userId,
    status: { $in: ['in-progress', 'awaiting-grading'] }
  }).sort({ createdAt: -1 });
}

// Server-side proof that `userId` is genuinely partway through a real mock
// run and is CURRENTLY on the `skill` step — the only thing that legitimises
// skipping the mandatory-review gate on that skill's /start route
// (middleware/requireReviewComplete.js). Nothing here is client-supplied:
//   • userId          → user A can never ride user B's run
//   • status 'in-progress' → a completed / awaiting-grading / abandoned run
//                            can't be replayed to keep bypassing the gate
//   • progress: skill → the bypass is scoped to the exact step the run is
//                       on; once they advance past Listening, a Listening
//                       /start no longer bypasses, and vice-versa.
// (Writing/Speaking never hit requireReviewComplete, so `skill` is only ever
// 'listening' or 'reading' in practice — the SKILL_ORDER guard just keeps a
// bad value from building a nonsense query.)
async function hasActiveMockStep(userId, skill) {
  if (!SKILL_ORDER.includes(skill)) return false;
  const doc = await MockTestAttempt.findOne({
    userId,
    status: 'in-progress',
    progress: skill,
  }).select('_id').lean();
  return !!doc;
}

async function startMockTest(userId) {
  // Resume rather than stacking a second open run.
  const existing = await getCurrentDoc(userId);
  if (existing) return { resumed: true, attempt: publicShape(existing) };

  // Proctoring cooldown: a run voided for too many exam-screen exits locks
  // the student out of starting a new one for DQ_COOLDOWN_SECONDS.
  const lastDq = await MockTestAttempt.findOne({ userId, status: 'disqualified' })
    .sort({ 'proctor.disqualifiedAt': -1, createdAt: -1 })
    .select('proctor.disqualifiedAt createdAt')
    .lean();
  if (lastDq) {
    const startedAt = new Date((lastDq.proctor && lastDq.proctor.disqualifiedAt) || lastDq.createdAt).getTime();
    const elapsedMs = Date.now() - startedAt;
    if (elapsedMs < DQ_COOLDOWN_SECONDS * 1000) {
      const waitSec = Math.ceil((DQ_COOLDOWN_SECONDS * 1000 - elapsedMs) / 1000);
      const waitMin = Math.max(1, Math.ceil(waitSec / 60));
      const err = new AppError(
        `Lượt thi thử trước đã bị huỷ do rời màn hình thi quá ${MAX_VIOLATIONS} lần. `
        + `Vui lòng quay lại trang chủ và đợi khoảng ${waitMin} phút nữa rồi bắt đầu lượt mới.`,
        429
      );
      err.cooldownSeconds = waitSec;
      throw err;
    }
  }

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
    // Late report (e.g. a keepalive POST that landed after the run was
    // already voided) — echo the terminal state so the client still tears
    // down and bounces the student home.
    const dq = doc.status === 'disqualified';
    return {
      violationCount: doc.proctor.violationCount || 0,
      violated: !!doc.proctor.violated,
      disqualified: dq,
      cooldownSeconds: dq ? DQ_COOLDOWN_SECONDS : 0
    };
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

  // Over the limit → void the run. The four sub-attempts (if any were
  // already submitted) stay in their own per-skill histories; only this
  // wrapper is closed, and no overall band is ever computed for it.
  let disqualified = false;
  if (doc.proctor.violationCount > MAX_VIOLATIONS) {
    doc.status = 'disqualified';
    doc.proctor.disqualifiedAt = new Date();
    doc.overallBand = null;
    disqualified = true;
  }

  await doc.save();

  return {
    violationCount: doc.proctor.violationCount,
    violated: true,
    disqualified,
    cooldownSeconds: disqualified ? DQ_COOLDOWN_SECONDS : 0
  };
}

async function advance(userId, mockId, { skill, attemptId }) {
  if (!mongoose.isValidObjectId(mockId)) throw new ValidationError('mockId không hợp lệ');
  if (!SKILL_ORDER.includes(skill)) throw new ValidationError('skill không hợp lệ');

  const doc = await MockTestAttempt.findOne({ _id: mockId, userId });
  if (!doc) throw new NotFoundError('Không tìm thấy bài thi thử');

  // A run voided for proctoring violations (or discarded) can't take any more
  // steps — the client should already have bounced the student home, but a
  // submit that raced the disqualification lands here.
  if (doc.status === 'disqualified' || doc.status === 'abandoned') {
    throw new AppError('Lượt thi thử này đã kết thúc (bị huỷ do vi phạm hoặc đã bỏ qua).', 409);
  }

  // Idempotent: a double-tap / back-forward that re-fires advance for a step
  // already recorded just returns the current navigation target again.
  const alreadyDone = !!(doc.steps[skill] && doc.steps[skill].completedAt);
  if (doc.progress !== skill && !alreadyDone) {
    throw new AppError(`Bước hiện tại là "${doc.progress}", không phải "${skill}"`, 409);
  }

  if (!alreadyDone) {
    // A teacher may have pre-entered this skill's band by hand (Speaking run
    // live, in person) before the student's own sub-attempt lands — keep the
    // manual band + flags, never overwrite with the auto-graded one.
    const prev = doc.steps[skill] || {};
    const band = prev.manual ? prev.band : await readBand(skill, attemptId);
    doc.steps[skill] = {
      attemptId: attemptId || prev.attemptId || undefined,
      band,
      completedAt: new Date(),
      manual: !!prev.manual,
      manualBy: prev.manualBy,
      manualAt: prev.manualAt
    };
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
    // End of sitting 1 — back to the dashboard, student resumes Writing later.
    return { sittingBreak: true, nextSkill: 'writing', breakAfter: 'reading' };
  }
  if (skill === 'writing') {
    // Writing and Speaking are now separate, self-started steps: don't chain
    // straight into Speaking — send the student back to the dashboard so they
    // tap "Bắt đầu Speaking" when they're ready (e.g. waiting for a teacher
    // to run the Speaking part live).
    return { sittingBreak: true, nextSkill: 'speaking', breakAfter: 'writing' };
  }
  return { done: true };
}

// Re-reads any sub-attempt whose band is still null (Writing graded later by
// admin/cron, Speaking by AI) and patches it in. Mutates + saves if changed.
async function refreshGrades(doc) {
  let changed = false;
  for (const skill of SKILL_ORDER) {
    const step = doc.steps[skill];
    // A manually-entered band is authoritative — never re-read over it.
    if (step && !step.manual && step.completedAt && step.attemptId && numericBand(step.band) === null) {
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
    completedAt: doc.steps[s] && doc.steps[s].completedAt ? doc.steps[s].completedAt : null,
    manual: !!(doc.steps[s] && doc.steps[s].manual)
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
      disqualifiedAt: (doc.proctor && doc.proctor.disqualifiedAt) || null,
      events: ((doc.proctor && doc.proctor.events) || []).map(e => ({
        type: e.type, skill: e.skill || null, at: e.at
      }))
    }
  };
}

// ── Admin: cross-student mock-test monitoring ────────────────────────────
// A teacher/admin view of every student's full-mock runs. Reuses the exact
// refreshGrades + publicShape the student history path uses (single source
// of truth for a run's serialized form) and just attaches who ran it. The
// full 4-skill mock had no admin surface at all before this — the runs and
// the proctoring ("gậy") log lived in the DB unread.
function shapeAdmin(doc) {
  const shape = publicShape(doc);
  const u = doc.userId && typeof doc.userId === 'object' ? doc.userId : null;
  shape.user = {
    _id: u ? String(u._id) : null,
    username: (u && u.username) || '',
    displayName: (u && ([u.firstName, u.lastName].filter(Boolean).join(' ') || u.username)) || '–',
    className: (u && u.className) || ''
  };
  shape.adminNote = doc.adminNote || '';
  shape.scoreEditedAt = doc.scoreEditedAt || null;
  return shape;
}

// Mirror a hand-entered mock band onto the underlying per-skill attempt so
// the student's STANDALONE skill history (Speaking / Writing) shows the same
// number, not a stale AI draft or "chờ chấm". Best-effort — a failure here
// never fails setManualScores (the mock step is already saved). Only fires
// when a numeric band is set; clearing an override (band → null) does NOT
// roll the sub-attempt back — that band was already shown to the student.
// Listening / Reading are objective (band derives from the correct-answer
// count) and are left mock-only on purpose.
async function mirrorBandToSubAttempt(skill, attemptId, band, { actorName, note } = {}) {
  if (!attemptId || numericBand(band) === null) return;
  try {
    if (skill === 'speaking') {
      const sa = await SpeakingAttempt.findById(attemptId).select('aiFeedback.overallFeedback').lean();
      const patch = { 'aiFeedback.overallBand': band, status: 'analyzed' };
      // Don't clobber a real AI/teacher write-up if one is already there.
      if (!sa || !sa.aiFeedback || !sa.aiFeedback.overallFeedback) {
        patch['aiFeedback.overallFeedback'] = note
          ? `Giáo viên chấm trực tiếp trong bài thi thử full. Ghi chú: ${note}`
          : 'Giáo viên chấm trực tiếp trong bài thi thử full.';
      }
      await SpeakingAttempt.findByIdAndUpdate(attemptId, { $set: patch });
    } else if (skill === 'writing') {
      // Set only these fields ($set with dotted paths) so any earlier
      // per-task AI breakdown on grading.task1/task2 is preserved. No email
      // is sent from here — that's the dedicated Writing grading screen's
      // job (full per-criterion feedback + notification).
      await WritingAttempt.findByIdAndUpdate(attemptId, {
        $set: {
          'grading.overallBand': band,
          'grading.adminNote': note || 'Chấm trong bài thi thử full.',
          'grading.confirmedAt': new Date(),
          'grading.confirmedBy': actorName || 'admin',
          gradingStatus: 'confirmed',
          feedbackRead: false
        }
      });
    }
  } catch (err) {
    console.error('[mockTestService] mirrorBandToSubAttempt failed', {
      skill, attemptId: String(attemptId), error: err.message
    });
  }
}

// ── Admin: manually enter / correct a run's skill bands ─────────────────
// A teacher who ran (say) the Speaking part live, in person, types the band
// straight in here. Any subset of the four skills may be given; a numeric
// value pins that skill (marks it `manual` so the lazy re-grade never
// overwrites it), `null` clears the override so the auto-graded band takes
// over again. The overall band is recomputed with the same official-IELTS
// rounding used everywhere else. A numeric Speaking/Writing band is also
// mirrored onto the sub-attempt (mirrorBandToSubAttempt) so the student's
// per-skill history matches.
async function setManualScores(id, { steps = {}, note, actorId, actorName } = {}) {
  if (!mongoose.isValidObjectId(id)) throw new ValidationError('id không hợp lệ');
  // Populate the student so the returned shapeAdmin() carries a real
  // `user` block (the caller drops it straight back into the admin modal).
  const doc = await MockTestAttempt.findById(id)
    .populate('userId', 'username firstName lastName className');
  if (!doc) throw new NotFoundError('Không tìm thấy bài thi thử');

  let touched = false;
  const applied = []; // numeric bands set in this call → mirror onto sub-attempts
  for (const skill of SKILL_ORDER) {
    if (!Object.prototype.hasOwnProperty.call(steps, skill)) continue;
    let v = steps[skill];
    if (v === '' || v === undefined) v = null;
    if (typeof v === 'string' && v.trim() !== '') v = Number(v);
    if (v !== null && !BAND_VALUES.has(v)) {
      throw new ValidationError(`Band cho ${skill} không hợp lệ — nhập 1 đến 9, bước 0.5 (để trống nếu chưa chấm).`);
    }
    const cur = doc.steps[skill] || {};
    doc.steps[skill] = v === null
      ? { attemptId: cur.attemptId, band: null, completedAt: cur.completedAt,
          manual: false, manualBy: undefined, manualAt: undefined }
      : { attemptId: cur.attemptId, band: v, completedAt: cur.completedAt || new Date(),
          manual: true, manualBy: actorId || undefined, manualAt: new Date() };
    if (v !== null) applied.push(skill);
    touched = true;
  }

  if (typeof note === 'string') {
    doc.adminNote = note.trim().slice(0, 2000);
    touched = true;
  }
  if (!touched) throw new ValidationError('Không có thay đổi nào để lưu.');

  doc.scoreEditedBy = actorId || undefined;
  doc.scoreEditedAt = new Date();
  recomputeOverall(doc);
  await doc.save();
  // A step just cleared back to null should pick its auto-graded band back up.
  await refreshGrades(doc);
  // Push each hand-entered Speaking/Writing band onto its sub-attempt so the
  // student's standalone skill history matches (best-effort, post-save).
  await Promise.all(applied.map(skill => mirrorBandToSubAttempt(
    skill,
    doc.steps[skill] && doc.steps[skill].attemptId,
    doc.steps[skill] && doc.steps[skill].band,
    { actorName: actorName || (actorId ? String(actorId) : 'admin'), note: doc.adminNote }
  )));
  return shapeAdmin(doc);
}

async function getAdminHistory({ page = 1, limit = 20, userId = null, status = null, violatedOnly = false } = {}) {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(50, Math.max(1, Number(limit) || 20));
  const filter = { status: { $ne: 'abandoned' } };
  if (userId && mongoose.isValidObjectId(userId)) filter.userId = userId;
  if (status && ['in-progress', 'awaiting-grading', 'completed', 'disqualified'].includes(status)) filter.status = status;
  if (violatedOnly) filter['proctor.violated'] = true;

  const [docs, total, violatedTotal] = await Promise.all([
    MockTestAttempt.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate('userId', 'username firstName lastName className'),
    MockTestAttempt.countDocuments(filter),
    MockTestAttempt.countDocuments({ status: { $ne: 'abandoned' }, 'proctor.violated': true })
  ]);

  const items = [];
  for (const doc of docs) {
    await refreshGrades(doc);
    items.push(shapeAdmin(doc));
  }
  return { items, total, page, limit, violatedTotal };
}

async function getAdminHistoryDetail(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await MockTestAttempt.findOne({ _id: id, status: { $ne: 'abandoned' } })
    .populate('userId', 'username firstName lastName className');
  if (!doc) return null;
  await refreshGrades(doc);
  return shapeAdmin(doc);
}

module.exports = {
  startMockTest, getCurrent, abandonCurrent, recordViolation,
  advance, getHistory, getHistoryDetail, hasActiveMockStep,
  getAdminHistory, getAdminHistoryDetail, setManualScores,
  // exported for tests
  roundOverall, randomActive, SKILL_ORDER, MAX_VIOLATIONS, DQ_COOLDOWN_SECONDS
};
