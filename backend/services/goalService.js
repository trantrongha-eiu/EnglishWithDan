'use strict';

// IELTS Goal (Priority 2B). Owns validation + read/write of the goal
// fields on User (targetBand/targetExamDate reused from the existing
// lightweight planner — see models/User.js; currentBand/currentBandSource/
// weeklyStudyMinutes/studyDays/preferredSessionMinutes are new). Derived
// numbers (daysRemaining, examUrgency, gapBands...) are always computed on
// read, never stored — see §7/§19 of the spec this implements.
const User = require('../models/User');
const userService = require('./userService');
const weaknessService = require('./weaknessService');
const { todayVNDate } = require('./streakBonusService');

// Product's current teaching scope — deliberately stricter than the
// underlying targetBand/currentBand schema fields' own bound (4-9), which
// stays as-is so this doesn't risk breaking any pre-existing value or the
// unrelated profile.html reader of targetBand. Enforced only here, at the
// Goal API's own validation layer.
const MIN_BAND = 4.0;
const MAX_BAND = 7.5;
const BAND_STEP = 0.5;
const VALID_WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const MIN_SESSION_MINUTES = 5;
const MAX_SESSION_MINUTES = 240;
const MAX_WEEKLY_MINUTES = 7 * 24 * 60; // a whole week — anything above is a typo

// Reused verbatim from weaknessService so "enough data to estimate a band"
// means the same thing everywhere in the app.
const MIN_SAMPLE_SIZE = weaknessService.MIN_SAMPLE_SIZE;

function isValidBand(b) {
  if (typeof b !== 'number' || Number.isNaN(b)) return false;
  if (b < MIN_BAND || b > MAX_BAND) return false;
  const steps = (b - MIN_BAND) / BAND_STEP;
  return Math.abs(steps - Math.round(steps)) < 1e-9;
}

// Returns an array of human-readable errors — empty means valid. Only
// validates fields that are actually present in `input` (partial updates
// are allowed — see §20, a student can change one field at a time).
function validateGoalInput(input) {
  const errors = [];
  const { currentBand, targetBand, examDate, weeklyStudyMinutes, studyDays, preferredSessionMinutes } = input;

  if (currentBand !== undefined && currentBand !== null && !isValidBand(currentBand)) {
    errors.push(`Trình độ hiện tại phải từ ${MIN_BAND.toFixed(1)} đến ${MAX_BAND.toFixed(1)} (bước 0.5)`);
  }
  if (targetBand !== undefined && targetBand !== null && !isValidBand(targetBand)) {
    errors.push(`Band mục tiêu phải từ ${MIN_BAND.toFixed(1)} đến ${MAX_BAND.toFixed(1)} (bước 0.5)`);
  }
  // Cross-field check only when BOTH are being set/known this call — a
  // partial update of just one of the two can't validate the pair here;
  // updateGoal() re-checks against the merged (existing+incoming) values.
  if (typeof currentBand === 'number' && typeof targetBand === 'number' && currentBand > targetBand) {
    errors.push(CURRENT_ABOVE_TARGET);
  }
  if (examDate !== undefined && examDate !== null) {
    const d = new Date(examDate);
    if (Number.isNaN(d.getTime())) errors.push('Ngày thi không hợp lệ');
    else if (d < todayVNDate()) errors.push('Ngày thi không được ở trong quá khứ');
  }
  if (weeklyStudyMinutes !== undefined && weeklyStudyMinutes !== null) {
    if (typeof weeklyStudyMinutes !== 'number' || !Number.isFinite(weeklyStudyMinutes) || weeklyStudyMinutes <= 0) errors.push('Thời gian học mỗi tuần phải lớn hơn 0 phút');
    else if (weeklyStudyMinutes > MAX_WEEKLY_MINUTES) errors.push(`Thời gian học mỗi tuần tối đa ${MAX_WEEKLY_MINUTES} phút`);
  }
  if (preferredSessionMinutes !== undefined && preferredSessionMinutes !== null) {
    if (typeof preferredSessionMinutes !== 'number' || preferredSessionMinutes < MIN_SESSION_MINUTES || preferredSessionMinutes > MAX_SESSION_MINUTES) {
      errors.push(`Số phút mỗi buổi phải từ ${MIN_SESSION_MINUTES} đến ${MAX_SESSION_MINUTES}`);
    }
  }
  if (studyDays !== undefined && studyDays !== null) {
    if (!Array.isArray(studyDays)) errors.push('Ngày học trong tuần không hợp lệ');
    else if (studyDays.some(d => !VALID_WEEKDAYS.includes(d))) errors.push('Ngày học trong tuần không hợp lệ');
  }
  return errors;
}

const CURRENT_ABOVE_TARGET = 'Trình độ hiện tại không được cao hơn band mục tiêu';

function examUrgencyFromDays(daysRemaining) {
  if (daysRemaining == null || daysRemaining < 0) return null;
  if (daysRemaining <= 14) return 'critical';
  if (daysRemaining <= 30) return 'high';
  if (daysRemaining <= 60) return 'moderate';
  return 'low';
}

// A rough, documented heuristic — NOT a validated prediction and never
// promises a band outcome (§24). Purely a planning-feasibility signal:
// "is the available time in the right order of magnitude for this gap".
const ESTIMATED_HOURS_PER_HALF_BAND = 40;

function assessFeasibility({ currentBand, targetBand, weeksRemaining, weeklyStudyMinutes }) {
  if (currentBand == null || targetBand == null || weeksRemaining == null || weeksRemaining <= 0 || !weeklyStudyMinutes) return null;
  const gap = Math.max(0, Math.round((targetBand - currentBand) * 10) / 10);
  if (gap === 0) {
    return { level: 'on_track', gap, message: 'Trình độ hiện tại đã bằng band mục tiêu — hãy giữ nhịp học đều đặn để duy trì.' };
  }
  const requiredHours = (gap / BAND_STEP) * ESTIMATED_HOURS_PER_HALF_BAND;
  const availableHours = (weeklyStudyMinutes / 60) * weeksRemaining;
  const ratio = availableHours > 0 ? availableHours / requiredHours : 0;
  let level, message;
  if (ratio >= 1) {
    level = 'reasonable';
    message = 'Thời gian học bạn dành ra là hợp lý cho mục tiêu này (theo ước tính số giờ học chung) — học đều đặn quan trọng hơn mọi con số.';
  } else if (ratio >= 0.5) {
    level = 'tight';
    message = 'Thời gian khá gấp cho mục tiêu này. Nếu được, hãy tăng thời gian học mỗi tuần.';
  } else {
    level = 'challenging';
    message = 'Mục tiêu cần tiến bộ rất nhiều trong thời gian ngắn. Hãy tăng thời gian học hoặc lùi ngày thi để có thêm thời gian chuẩn bị.';
  }
  return { level, gap, requiredHours: Math.round(requiredHours), availableHours: Math.round(availableHours), ratio: Math.round(ratio * 100) / 100, message };
}

// Returns the goal with every derived field computed fresh — never reads a
// stored daysRemaining/examUrgency/gap, since those would go stale the
// instant a day passes.
async function getGoal(userId) {
  const user = await User.findById(userId)
    .select('currentBand currentBandSource targetBand targetExamDate weeklyStudyMinutes studyDays preferredSessionMinutes')
    .lean();

  const now = todayVNDate();
  let daysRemaining = null, weeksRemaining = null, examUrgency = null, isPastExamDate = false;
  if (user.targetExamDate) {
    daysRemaining = Math.round((new Date(user.targetExamDate).getTime() - now.getTime()) / 86400000);
    isPastExamDate = daysRemaining < 0;
    weeksRemaining = isPastExamDate ? null : Math.max(1, Math.ceil(daysRemaining / 7));
    examUrgency = examUrgencyFromDays(daysRemaining);
  }

  const gapBands = (typeof user.currentBand === 'number' && typeof user.targetBand === 'number')
    ? Math.round((user.targetBand - user.currentBand) * 10) / 10
    : null;

  const feasibility = isPastExamDate ? null : assessFeasibility({
    currentBand: user.currentBand, targetBand: user.targetBand,
    weeksRemaining, weeklyStudyMinutes: user.weeklyStudyMinutes,
  });

  const hasGoal = user.targetBand != null || user.targetExamDate != null || user.currentBand != null;

  return {
    hasGoal,
    currentBand: user.currentBand ?? null,
    currentBandSource: user.currentBandSource ?? null,
    targetBand: user.targetBand ?? null,
    examDate: user.targetExamDate ?? null,
    weeklyStudyMinutes: user.weeklyStudyMinutes ?? null,
    studyDays: user.studyDays ?? [],
    preferredSessionMinutes: user.preferredSessionMinutes ?? null,
    daysRemaining, weeksRemaining, examUrgency, isPastExamDate,
    gapBands, feasibility,
  };
}

// Partial update — only fields present in `input` are validated/changed.
// Practice history (attempts, VocabBook, streak, ...) is never touched by
// this — a goal edit only ever writes these few User fields.
async function updateGoal(userId, input) {
  // goal.html re-sends EVERY field on each save. A value that isn't changing
  // isn't re-validated: an exam date that has since passed, or a target band
  // above this page's 7.5 scope that was set from Profile (which allows up
  // to 9.0), used to block every other edit — the student couldn't even
  // change their study days without first clearing / lowering those.
  const existing = await User.findById(userId).select('currentBand targetBand targetExamDate').lean();
  input = { ...input };
  const sameDay = (a, b) => a && b && !Number.isNaN(new Date(a).getTime())
    && new Date(a).toISOString().slice(0, 10) === new Date(b).toISOString().slice(0, 10);
  if (input.targetBand != null && input.targetBand === existing.targetBand) delete input.targetBand;
  if (input.currentBand != null && input.currentBand === existing.currentBand) delete input.currentBand;
  if (input.examDate != null && sameDay(input.examDate, existing.targetExamDate)) delete input.examDate;
  if (Array.isArray(input.studyDays)) input.studyDays = [...new Set(input.studyDays)];

  const errors = validateGoalInput(input);
  if (errors.length) return { status: 'invalid', errors };

  // Cross-check currentBand<=targetBand against the MERGED (existing +
  // incoming) state — validateGoalInput() above only catches it when both
  // are provided in the SAME call; this also catches e.g. raising
  // currentBand above an already-saved targetBand in isolation.
  const mergedCurrent = input.currentBand !== undefined ? input.currentBand : existing.currentBand;
  const mergedTarget = input.targetBand !== undefined ? input.targetBand : existing.targetBand;
  if (typeof mergedCurrent === 'number' && typeof mergedTarget === 'number' && mergedCurrent > mergedTarget) {
    return { status: 'invalid', errors: [CURRENT_ABOVE_TARGET] };
  }

  const update = {};
  if (input.currentBand !== undefined) {
    update.currentBand = input.currentBand;
    update.currentBandSource = input.currentBand == null ? null : 'self_assessed';
  }
  if (input.targetBand !== undefined) update.targetBand = input.targetBand;
  if (input.examDate !== undefined) update.targetExamDate = input.examDate;
  if (input.weeklyStudyMinutes !== undefined) update.weeklyStudyMinutes = input.weeklyStudyMinutes;
  if (input.studyDays !== undefined) update.studyDays = input.studyDays;
  if (input.preferredSessionMinutes !== undefined) update.preferredSessionMinutes = input.preferredSessionMinutes;

  await User.updateOne({ _id: userId }, { $set: update });
  return { status: 'ok', goal: await getGoal(userId) };
}

// System-estimated performance, kept explicitly separate from the
// student's self-assessed currentBand (§5) — reuses userService.getStats()
// (the SAME aggregate that already powers profile.html's band chart)
// rather than computing a second, competing analytics pass. A skill only
// gets an 'estimated' status once it clears MIN_SAMPLE_SIZE; below that
// it's honestly 'insufficient_data', never an invented weakness (§9/§13).
async function getEstimatedPerformance(userId) {
  const stats = await userService.getStats(userId);
  const skills = ['reading', 'listening', 'writing', 'speaking'];
  const perSkill = {};
  const trusted = [];
  for (const skill of skills) {
    const s = stats[skill];
    const sample = s.total || 0;
    if (sample >= MIN_SAMPLE_SIZE && s.avgBand != null) {
      const band = parseFloat(s.avgBand);
      perSkill[skill] = { status: 'estimated', avgBand: band, sampleSize: sample };
      trusted.push(band);
    } else {
      perSkill[skill] = { status: 'insufficient_data', avgBand: null, sampleSize: sample };
    }
  }
  const overallEstimate = trusted.length ? Math.round((trusted.reduce((a, b) => a + b, 0) / trusted.length) * 2) / 2 : null;
  return { skills: perSkill, overallEstimate };
}

module.exports = {
  getGoal, updateGoal, getEstimatedPerformance, validateGoalInput, assessFeasibility,
  MIN_BAND, MAX_BAND, BAND_STEP, MAX_WEEKLY_MINUTES, VALID_WEEKDAYS, MIN_SAMPLE_SIZE,
};
