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

const TERMINAL_STATUSES = new Set(['completed', 'dropped']);

function round1(n) {
  return Math.round((n + Number.EPSILON) * 10) / 10;
}

// Merge a class's stored policy with the schema defaults so a policy object
// that predates a new field (or a partial one from a test) still computes.
function withPolicyDefaults(policy = {}) {
  return {
    maxAbsencesAllowed:     policy.maxAbsencesAllowed ?? 3,
    warnThreshold:          policy.warnThreshold ?? 2,
    excusedCountsAsAbsence: policy.excusedCountsAsAbsence ?? true,
    lateToAbsenceRatio:     policy.lateToAbsenceRatio && policy.lateToAbsenceRatio >= 1 ? policy.lateToAbsenceRatio : 2,
    lateThresholdMinutes:   policy.lateThresholdMinutes ?? 15,
    failOnExceed:           policy.failOnExceed ?? true,
    homeworkMissThreshold:  policy.homeworkMissThreshold && policy.homeworkMissThreshold >= 1 ? policy.homeworkMissThreshold : 3,
  };
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

function autoStatusReason(stats, policy) {
  const p = withPolicyDefaults(policy);
  if (stats.derivedStatus === 'failed') {
    return `Nghỉ ${stats.absenceEquivalent}/${p.maxAbsencesAllowed} buổi — vượt giới hạn cho phép.`;
  }
  if (stats.derivedStatus === 'warning') {
    return `Đã nghỉ ${stats.absenceEquivalent} buổi (ngưỡng cảnh báo ${p.warnThreshold}).`;
  }
  return '';
}

function applyStatsToEnrollment(enrollment, stats, policy) {
  enrollment.stats = {
    heldSessions:      stats.heldSessions,
    attendedCount:     stats.attendedCount,
    absentUnexcused:   stats.absentUnexcused,
    absentExcused:     stats.absentExcused,
    lateCount:         stats.lateCount,
    absenceEquivalent: stats.absenceEquivalent,
    attendanceRate:    stats.attendanceRate,
    remainingAllowed:  stats.remainingAllowed,
    computedAt:        new Date(),
  };
  if (!TERMINAL_STATUSES.has(enrollment.status) && enrollment.status !== stats.derivedStatus) {
    enrollment.status = stats.derivedStatus;
    enrollment.statusAuto = true;
    enrollment.statusUpdatedAt = new Date();
    enrollment.statusReason = autoStatusReason(stats, policy);
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
    applyStatsToEnrollment(e, stats, cls.policy);
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
  applyStatsToEnrollment(enrollment, stats, cls.policy);
  await enrollment.save();
  return enrollment;
}

module.exports = {
  computeEnrollmentStats,
  withPolicyDefaults,
  autoStatusReason,
  applyStatsToEnrollment,
  refreshClass,
  refreshEnrollment,
};
