const mongoose = require('mongoose');

// A student's self-reported "tôi có mặt" tick from their own dashboard for
// TODAY's session, PENDING teacher confirmation. This is deliberately kept
// separate from AttendanceRecord (the actual source of truth read by
// classAttendanceService.computeEnrollmentStats) — a self-check-in never
// counts toward attendance stats / pass-fail on its own; it only becomes
// real once a teacher reviews it (classAttendance.controller.js's
// saveSessionAttendance resolves any pending check-in for a session to
// 'confirmed' or 'rejected' the moment that student's real AttendanceRecord
// is saved, based on whether the teacher marked them present/late or not).
const AttendanceCheckInSchema = new mongoose.Schema({
  sessionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSession', required: true },
  classId:      { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
  enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassEnrollment', required: true },
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  status:      { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
  checkedInAt: { type: Date, default: Date.now },

  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
}, { timestamps: true });

AttendanceCheckInSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceCheckIn', AttendanceCheckInSchema);
