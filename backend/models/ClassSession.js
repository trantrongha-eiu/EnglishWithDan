const mongoose = require('mongoose');

// One class meeting. `sessionNumber` is "buổi học thứ mấy" (auto = max in the
// class + 1). Only sessions with status 'held' and a date in the past count
// toward attendance math — 'scheduled' future sessions and 'cancelled' ones
// are ignored by classAttendanceService.
const ClassSessionSchema = new mongoose.Schema({
  classId:       { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
  sessionNumber: { type: Number, required: true },
  date:          { type: Date, required: true },
  topic:         { type: String, default: '', trim: true, maxlength: 200 },
  note:          { type: String, default: '', trim: true, maxlength: 1000 },

  // 'makeup' = buổi học bù. A student marked present/late at a makeup session
  // cancels (net) the absence on the linked original session — see
  // classAttendanceService.computeEnrollmentStats.
  type:               { type: String, enum: ['regular', 'makeup'], default: 'regular' },
  makeupForSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSession', default: null },

  status: { type: String, enum: ['scheduled', 'held', 'cancelled'], default: 'scheduled' },

  attendanceTakenAt: { type: Date },
  attendanceTakenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

ClassSessionSchema.index({ classId: 1, sessionNumber: 1 }, { unique: true });
ClassSessionSchema.index({ classId: 1, date: 1 });

// Deleting a session would orphan / silently drop its attendance history.
ClassSessionSchema.plugin(require('../utils/guardAgainstMassDelete'));

module.exports = mongoose.model('ClassSession', ClassSessionSchema);
