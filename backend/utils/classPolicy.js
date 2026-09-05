'use strict';

// Merge a class's stored policy with the schema defaults so a policy object
// that predates a new field (or a partial one from a test) still computes.
// Lives outside classAttendanceService.js (which used to own this) so
// assignmentService.js can depend on it without creating a require cycle:
// classAttendanceService now depends on assignmentService (to fold homework
// misses into the auto status — see refreshClass/refreshEnrollment there),
// so assignmentService can no longer depend back on classAttendanceService.
function withPolicyDefaults(policy = {}) {
  return {
    maxAbsencesAllowed:     policy.maxAbsencesAllowed ?? 3,
    warnThreshold:          policy.warnThreshold ?? 2,
    excusedCountsAsAbsence: policy.excusedCountsAsAbsence ?? true,
    lateToAbsenceRatio:     policy.lateToAbsenceRatio && policy.lateToAbsenceRatio >= 1 ? policy.lateToAbsenceRatio : 2,
    lateThresholdMinutes:   policy.lateThresholdMinutes ?? 15,
    failOnExceed:           policy.failOnExceed ?? true,
    homeworkMissThreshold:  policy.homeworkMissThreshold && policy.homeworkMissThreshold >= 1 ? policy.homeworkMissThreshold : 3,
    // Enrollment-status thresholds (distinct from homeworkMissThreshold above,
    // which only gates the dashboard/nag-message nudge) — counted against the
    // SAME "assignments currently overdue & incomplete in this class" number,
    // recomputed live each time (see assignmentService.getOverdueCountForClass)
    // so a teacher extending a deadline or archiving an assignment can pull a
    // student back out of warning/failed, same as fixing an attendance record.
    homeworkWarnThreshold:  policy.homeworkWarnThreshold && policy.homeworkWarnThreshold >= 1 ? policy.homeworkWarnThreshold : 5,
    homeworkFailThreshold:  policy.homeworkFailThreshold && policy.homeworkFailThreshold >= 1 ? policy.homeworkFailThreshold : 10,
  };
}

module.exports = { withPolicyDefaults };
