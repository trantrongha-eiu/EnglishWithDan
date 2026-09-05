'use strict';

// Attendance math for the teacher class-management feature. The core
// (computeEnrollmentStats) is a PURE function — no DB — so it can be
// unit-tested against hand-built session/record arrays. The refresh*
// helpers load the data, run compute, and persist stats + the auto status
// (active / warning / failed) onto the ClassEnrollment.
//
// Rules (defaults live on ClassGroup.policy, all per-class configurable):
//   - Only 'regular' sessions that are status 'held' AND dated <= now AND
//     have a mark for this student count toward the totals. Future /
//     scheduled / cancelled sessions are ignored ("chỉ tính buổi đã diễn ra").
//   - absent            → +1 absence-equivalent, unexcused
//   - excused           → +1 if policy.excusedCountsAsAbsence else +0, excused
//   - late              → attended, +1/lateToAbsenceRatio  (2 lần trễ ~ 1 vắng)
//   - present           → attended, +0
//   - A 'makeup' session where the student is present/late cancels (net) the
//     absence on its linked original session ("bù buổi nào thì xóa buổi vắng đó").

const ClassGroup = require('../models/ClassGroup');
const ClassEnrollment = require('../models/ClassEnrollment');
const ClassSession = require('../models/ClassSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const assignmentService = require('./assignmentService');
const { withPolicyDefaults } = require('../utils/classPolicy');

const TERMINAL_STATUSES = new Set(['completed', 'dropped']);

function round1(n) {
  return Math.round((n + Number.EPSILON) * 10) / 10;
}

/**
 * @param {object}   args
 * @param {object}   args.enrollment  ClassEnrollment (only .status is read)
 * @param {object}   args.policy      ClassGroup.policy (defaults filled in)
 * @param {object[]} args.sessions    every ClassSession for the class
 * @param {object[]} args.records     every AttendanceRecord for THIS student in the class
 * @param {Date}     [args.now]
 * @returns stats + derivedStatus
 */
function computeEnrollmentStats({ enrollment, policy, sessions = [], records = [], now = new Date() }) {
  const p = withPolicyDefaults(policy);
  const recBySession = new Map();
  for (const r of records) recBySession.set(String(r.sessionId), r);

  // Original sessions that this student has "made up": a non-cancelled makeup
  // session, linked to an original, where the student was present or late.
  const madeUpOriginalIds = new Set();
  for (const s of sessions) {
    if (s.type !== 'makeup' || !s.makeupForSessionId || s.status === 'cancelled') continue;
    const r = recBySession.get(String(s._id));
    if (r && (r.status === 'present' || r.status === 'late')) {
      madeUpOriginalIds.add(String(s.makeupForSessionId));
    }
  }

  let heldSessions = 0, attendedCount = 0, absentUnexcused = 0, absentExcused = 0, lateCount = 0;
  let absenceEquivalent = 0;

  for (const s of sessions) {
    if (s.type !== 'regular' || s.status !== 'held') continue;
    if (new Date(s.date).getTime() > now.getTime()) continue;
    const r = recBySession.get(String(s._id));
    if (!r) continue; // held & past but not marked for this student yet
    heldSessions += 1;

    if (madeUpOriginalIds.has(String(s._id))) { attendedCount += 1; continue; }

    switch (r.status) {
      case 'present':
        attendedCount += 1;
        break;
      case 'late':
        attendedCount += 1;
        lateCount += 1;
        absenceEquivalent += 1 / p.lateToAbsenceRatio;
        break;
      case 'excused':
        absentExcused += 1;
        absenceEquivalent += p.excusedCountsAsAbsence ? 1 : 0;
        break;
      case 'absent':
      default:
        absentUnexcused += 1;
        absenceEquivalent += 1;
        break;
    }
  }

  absenceEquivalent = round1(absenceEquivalent);
  const absentTotal = absentUnexcused + absentExcused;
  const attendanceRate = heldSessions ? Math.round((attendedCount / heldSessions) * 100) : 0;
  const remainingAllowed = Math.max(0, round1(p.maxAbsencesAllowed - absenceEquivalent));

  // Attendance-only signal — combined with the (DB-backed, so not computable
  // in this pure function) homework-miss count by deriveCombinedStatus below,
  // called from applyStatsToEnrollment. Kept as its own field because it's
  // still what this function's unit tests assert against.
  let derivedStatus;
  if (TERMINAL_STATUSES.has(enrollment?.status)) {
    derivedStatus = enrollment.status;
  } else if (p.failOnExceed && absenceEquivalent > p.maxAbsencesAllowed) {
    derivedStatus = 'failed';
  } else if (absenceEquivalent >= p.warnThreshold) {
    derivedStatus = 'warning';
  } else {
    derivedStatus = 'active';
  }

  return {
    heldSessions, attendedCount, absentUnexcused, absentExcused, absentTotal,
    lateCount, absenceEquivalent, attendanceRate, remainingAllowed, derivedStatus,
  };
}

// Combines the attendance-derived status with the (separately sourced)
// live homework-miss count — either cause alone is enough to warn/fail an
// enrollment. Pure — takes the count as a plain number so it stays testable
// without a DB.
function deriveCombinedStatus(stats, homeworkMissedCount, policy) {
  if (TERMINAL_STATUSES.has(stats.derivedStatus)) return stats.derivedStatus;
  const p = withPolicyDefaults(policy);
  const attendanceFail = p.failOnExceed && stats.absenceEquivalent > p.maxAbsencesAllowed;
  const homeworkFail = homeworkMissedCount >= p.homeworkFailThreshold;
  if (attendanceFail || homeworkFail) return 'failed';
  const attendanceWarn = stats.absenceEquivalent >= p.warnThreshold;
  const homeworkWarn = homeworkMissedCount >= p.homeworkWarnThreshold;
  if (attendanceWarn || homeworkWarn) return 'warning';
  return 'active';
}

// homeworkMissedCount/status default to the attendance-only reading (0 misses,
// stats.derivedStatus) so existing callers that only ever knew about
// attendance keep getting the exact same text.
function autoStatusReason(stats, policy, homeworkMissedCount = 0, status = stats.derivedStatus) {
  const p = withPolicyDefaults(policy);
  const attendanceFail = p.failOnExceed && stats.absenceEquivalent > p.maxAbsencesAllowed;
  const homeworkFail = homeworkMissedCount >= p.homeworkFailThreshold;
  const attendanceWarn = stats.absenceEquivalent >= p.warnThreshold;
  const homeworkWarn = homeworkMissedCount >= p.homeworkWarnThreshold;
  const reasons = [];
  if (status === 'failed') {
    if (attendanceFail) reasons.push(`Nghỉ ${stats.absenceEquivalent}/${p.maxAbsencesAllowed} buổi — vượt giới hạn cho phép.`);
    if (homeworkFail) reasons.push(`Thiếu ${homeworkMissedCount} bài tập quá hạn (giới hạn ${p.homeworkFailThreshold}) — vượt giới hạn cho phép.`);
  } else if (status === 'warning') {
    if (attendanceWarn) reasons.push(`Đã nghỉ ${stats.absenceEquivalent} buổi (ngưỡng cảnh báo ${p.warnThreshold}).`);
    if (homeworkWarn) reasons.push(`Đang thiếu ${homeworkMissedCount} bài tập quá hạn (ngưỡng cảnh báo ${p.homeworkWarnThreshold}).`);
  }
  return reasons.join(' ');
}

function applyStatsToEnrollment(enrollment, stats, policy, homeworkMissedCount = 0) {
  enrollment.stats = {
    heldSessions:      stats.heldSessions,
    attendedCount:     stats.attendedCount,
    absentUnexcused:   stats.absentUnexcused,
    absentExcused:     stats.absentExcused,
    lateCount:         stats.lateCount,
    absenceEquivalent: stats.absenceEquivalent,
    attendanceRate:    stats.attendanceRate,
    remainingAllowed:  stats.remainingAllowed,
    homeworkMissedCount,
    computedAt:        new Date(),
  };
  const combinedStatus = deriveCombinedStatus(stats, homeworkMissedCount, policy);
  if (!TERMINAL_STATUSES.has(enrollment.status) && enrollment.status !== combinedStatus) {
    enrollment.status = combinedStatus;
    enrollment.statusAuto = true;
    enrollment.statusUpdatedAt = new Date();
    enrollment.statusReason = autoStatusReason(stats, policy, homeworkMissedCount, combinedStatus);
  }
}

// Recompute every non-removed enrollment in a class. Loads sessions/records
// once and groups records by student to avoid a query per enrollment.
async function refreshClass(classId) {
  const cls = await ClassGroup.findById(classId).lean();
  if (!cls) return;
  const enrollments = await ClassEnrollment.find({ classId, removedAt: null });
  if (!enrollments.length) return;

  const [sessions, allRecords] = await Promise.all([
    ClassSession.find({ classId }).lean(),
    AttendanceRecord.find({ classId }).lean(),
  ]);
  const byStudent = new Map();
  for (const r of allRecords) {
    const k = String(r.studentId);
    if (!byStudent.has(k)) byStudent.set(k, []);
    byStudent.get(k).push(r);
  }

  for (const e of enrollments) {
    const stats = computeEnrollmentStats({
      enrollment: e, policy: cls.policy, sessions,
      records: byStudent.get(String(e.studentId)) || [],
    });
    const homeworkMissedCount = await assignmentService.getOverdueCountForClass(e.studentId, classId);
    applyStatsToEnrollment(e, stats, cls.policy, homeworkMissedCount);
    await e.save();
  }
}

async function refreshEnrollment(enrollmentId) {
  const enrollment = await ClassEnrollment.findById(enrollmentId);
  if (!enrollment || enrollment.removedAt) return null;
  const cls = await ClassGroup.findById(enrollment.classId).lean();
  if (!cls) return enrollment;
  const [sessions, records] = await Promise.all([
    ClassSession.find({ classId: enrollment.classId }).lean(),
    AttendanceRecord.find({ classId: enrollment.classId, studentId: enrollment.studentId }).lean(),
  ]);
  const stats = computeEnrollmentStats({ enrollment, policy: cls.policy, sessions, records });
  const homeworkMissedCount = await assignmentService.getOverdueCountForClass(enrollment.studentId, enrollment.classId);
  applyStatsToEnrollment(enrollment, stats, cls.policy, homeworkMissedCount);
  await enrollment.save();
  return enrollment;
}

module.exports = {
  computeEnrollmentStats,
  deriveCombinedStatus,
  withPolicyDefaults,
  autoStatusReason,
  applyStatsToEnrollment,
  refreshClass,
  refreshEnrollment,
};
