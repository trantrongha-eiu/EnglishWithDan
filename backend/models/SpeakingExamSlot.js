const mongoose = require('mongoose');

// 🎤 Đăng kí thi Speaking — one bookable 25-minute slot of a teacher's free
// time: 15' thi Speaking + 10' nhận feedback. The teacher enters a free
// window (date + from/to) on the class page's "🎤 Thi Speaking" tab and
// speakingExam.controller splits it into back-to-back slots; a student of
// any of `classIds` ticks ONE slot from their dashboard ("Lớp học của tôi")
// and picks online (Google Meet) or offline (tại nhà giáo viên).
//
// Times are the Vietnam wall clock: dayKey "YYYY-MM-DD" + startTime/endTime
// "HH:mm"; startsAt/endsAt are the same instants as real Dates (+07:00) for
// sorting, "is it in the future" checks and the TTL below.
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const SpeakingExamSlotSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Classes whose students may book this slot (the class it was created on
  // first). A teacher can open the same free time to several of their classes.
  classIds:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup' }],

  dayKey:    { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  startTime: { type: String, required: true, match: TIME },
  endTime:   { type: String, required: true, match: TIME },
  startsAt:  { type: Date, required: true },
  endsAt:    { type: Date, required: true },

  // Formats the teacher offers for this slot; the student picks one of them.
  modes:    { type: [{ type: String, enum: ['online', 'offline'] }], default: ['online', 'offline'] },
  // Only ever shown to the student who booked the slot (never in the open list).
  meetLink: { type: String, default: '', trim: true, maxlength: 500 },
  address:  { type: String, default: '', trim: true, maxlength: 500 },
  note:     { type: String, default: '', trim: true, maxlength: 500 },

  // Booking — null studentId = slot still open.
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  classId:   { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', default: null }, // class the student booked through
  mode:      { type: String, enum: ['online', 'offline', null], default: null },
  bookedAt:  { type: Date, default: null },

  // After the exam the teacher records how it went (shown to the student).
  result:       { type: String, enum: ['', 'done', 'no_show'], default: '' },
  band:         { type: Number, min: 0, max: 9, default: null },
  feedbackNote: { type: String, default: '', trim: true, maxlength: 3000 },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

SpeakingExamSlotSchema.index({ classIds: 1, startsAt: 1 });
SpeakingExamSlotSchema.index({ teacherId: 1, dayKey: 1 });
SpeakingExamSlotSchema.index({ studentId: 1, startsAt: -1 });
// Practice-history retention rule (3 months): a slot and its booking/result
// disappear 90 days after the exam ended.
SpeakingExamSlotSchema.index({ endsAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('SpeakingExamSlot', SpeakingExamSlotSchema);
