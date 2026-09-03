const mongoose = require('mongoose');

// One document per (session × student). NEVER deleted — a mistyped mark is
// fixed with an edit that appends to editHistory, so "không cho phép giáo
// viên vô tình xóa lịch sử điểm danh" holds by construction. classId is
// denormalized off the session so the dashboard/student views can query
// without a join.
const editEntrySchema = new mongoose.Schema({
  from: { type: String },
  to:   { type: String },
  byId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  at:   { type: Date, default: Date.now },
}, { _id: false });

const AttendanceRecordSchema = new mongoose.Schema({
  sessionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSession', required: true },
  classId:      { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
  enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassEnrollment', required: true },
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  status:      { type: String, enum: ['present', 'absent', 'excused', 'late'], required: true },
  lateMinutes: { type: Number, min: 0 },
  note:        { type: String, default: '', trim: true, maxlength: 500 },

  markedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  markedAt:     { type: Date, default: Date.now },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastEditedAt: { type: Date },
  editHistory:  { type: [editEntrySchema], default: [] },
}, { timestamps: true });

AttendanceRecordSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
AttendanceRecordSchema.index({ classId: 1, studentId: 1 });

// Permanent history, no automated backup — same guard as VocabBook / User.
AttendanceRecordSchema.plugin(require('../utils/guardAgainstMassDelete'));

module.exports = mongoose.model('AttendanceRecord', AttendanceRecordSchema);
