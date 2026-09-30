'use strict';

// Merge a class's stored policy with the schema defaults so a policy object
// that predates a new field (or a partial one from a test) still computes.
// Lives outside classAttendanceService.js (which used to own this) so
// assignmentService.js can depend on it without creating a require cycle:
// classAttendanceService now depends on assignmentService (to fold homework
// misses into the auto status — see refreshClass/refreshEnrollment there),
// so assignmentService can no longer depend back on classAttendanceService.
function withPolicyDefaults(policy = {}) {
  const maxAbsencesAllowed = policy.maxAbsencesAllowed ?? 3;
  return {
    maxAbsencesAllowed,
    // Absence reminder/warning kicks in at HALF the allowed absences (owner's
    // rule). A stored 0/blank used to mean "warn at 0 absences" — i.e. every
    // student in the class read as "warning" before missing a single session
    // — so anything < 0.5 now falls back to that half-way mark.
    warnThreshold:          policy.warnThreshold >= 0.5 ? policy.warnThreshold : maxAbsencesAllowed / 2,
    excusedCountsAsAbsence: policy.excusedCountsAsAbsence ?? true,
    lateToAbsenceRatio:     policy.lateToAbsenceRatio && policy.lateToAbsenceRatio >= 1 ? policy.lateToAbsenceRatio : 2,
    lateThresholdMinutes:   policy.lateThresholdMinutes ?? 15,
    failOnExceed:           policy.failOnExceed ?? true,
    homeworkMissThreshold:  policy.homeworkMissThreshold && policy.homeworkMissThreshold >= 1 ? policy.homeworkMissThreshold : 3,
    // Enrollment-status thresholds (distinct from homeworkMissThreshold above,
    // which only gates the dashboard/nag-message nudge) — counted against the
    // SAME "assignments currently overdue & incomplete in this class" number,
    // recomputed live each time (see assignmentService.getOverdueCountForClass)
    // so a teacher extending a deadline (or the student making the work up)
    // can pull a student back out of warning/failed, same as fixing an
    // attendance record. Archiving an incomplete assignment does NOT — it keeps
    // counting (assignmentService.archivedIsMissed).
    homeworkWarnThreshold:  policy.homeworkWarnThreshold && policy.homeworkWarnThreshold >= 1 ? policy.homeworkWarnThreshold : 5,
    homeworkFailThreshold:  policy.homeworkFailThreshold && policy.homeworkFailThreshold >= 1 ? policy.homeworkFailThreshold : 10,
  };
}

module.exports = { withPolicyDefaults };
