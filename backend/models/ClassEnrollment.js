const mongoose = require('mongoose');

// One document per (student × time they were enrolled in a class). A student
// re-taking a course gets a NEW ClassEnrollment — the old one (and every
// AttendanceRecord tied to its classId/studentId) is kept untouched, so
// history never resets. Removing a student from a class is a SOFT delete
// (removedAt) for the same reason.
const enrollmentStatsSchema = new mongoose.Schema({
  heldSessions:      { type: Number, default: 0 }, // mẫu số: buổi đã diễn ra & đã điểm danh
  attendedCount:     { type: Number, default: 0 }, // present + late + được bù
  absentUnexcused:   { type: Number, default: 0 },
  absentExcused:     { type: Number, default: 0 },
  lateCount:         { type: Number, default: 0 },
  // absence-equivalent: absent=1, excused=1|0 theo policy, late=1/ratio, buổi
  // được học bù=0. So với policy.maxAbsencesAllowed / warnThreshold.
  absenceEquivalent: { type: Number, default: 0 },
  attendanceRate:    { type: Number, default: 0 }, // %
  remainingAllowed:  { type: Number, default: 0 },
  // Số bài tập ĐANG quá hạn & chưa đạt (>=70% điểm) trong lớp này ngay tại
  // thời điểm tính — live snapshot từ assignmentService.getOverdueCountForClass,
  // không phải bộ đếm cộng dồn vĩnh viễn. So với policy.homeworkWarnThreshold /
  // homeworkFailThreshold để ra enrollment.status.
  homeworkMissedCount: { type: Number, default: 0 },
  computedAt:        { type: Date },
}, { _id: false });

const ClassEnrollmentSchema = new mongoose.Schema({
  classId:    { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
  studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  enrolledAt: { type: Date, default: Date.now },
  enrolledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // active/warning/failed are auto-managed by classAttendanceService from the
  // attendance math; completed/dropped are terminal states only a teacher sets
  // by hand and the auto-math then leaves alone.
  status:          { type: String, enum: ['active', 'warning', 'failed', 'completed', 'dropped'], default: 'active' },
  statusReason:    { type: String, default: '' },
  statusUpdatedAt: { type: Date },
  statusAuto:      { type: Boolean, default: false }, // true = last set by the system, not a person

  // Soft remove — keeps every AttendanceRecord for this (classId, studentId)
  // readable. A re-add after this creates a fresh enrollment document.
  removedAt: { type: Date, default: null },
  removedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  stats: { type: enrollmentStatsSchema, default: () => ({}) },

  // Last time the "you've missed homework past the threshold" reminder was
  // sent for this enrollment — so assignmentSweep doesn't re-send every day
  // while the student stays over the line. Cleared implicitly by a new
  // crossing (see assignmentService).
  homeworkWarnNotifiedAt: { type: Date, default: null },
}, { timestamps: true });

// Dashboard / roster reads by class; the student-facing view reads by student.
ClassEnrollmentSchema.index({ classId: 1, studentId: 1, removedAt: 1 });
ClassEnrollmentSchema.index({ studentId: 1, status: 1 });
// At most one ACTIVE (not soft-removed) enrollment per student per class —
// partialFilterExpression scopes the uniqueness to live rows so re-enrolling
// after a removal doesn't collide (same trick as TuitionFee's monthly index).
// Explicit name so it can't collide with the plain compound index above.
ClassEnrollmentSchema.index(
  { classId: 1, studentId: 1 },
  { unique: true, partialFilterExpression: { removedAt: null }, name: 'uniq_active_enrollment' }
);

// Permanent per-student record with no automated backup on this Atlas tier —
// same guard as VocabBook / User (see utils/guardAgainstMassDelete.js).
ClassEnrollmentSchema.plugin(require('../utils/guardAgainstMassDelete'));

module.exports = mongoose.model('ClassEnrollment', ClassEnrollmentSchema);
