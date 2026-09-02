const mongoose = require('mongoose');
const { bandScoreTable } = require('../utils/bandScore');

const AnswerSchema = new mongoose.Schema({
  questionNumber: Number,
  userAnswer:    String,
  correctAnswer: String,
  isCorrect:     Boolean
}, { _id: false });

const TestAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReadingTest',
    required: true
  },

  // 3 passage IDs đã được random cho lần thi này
  passagesUsed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Passage'
  }],

  // Immutable snapshot of the 3 passages (content + question groups + question
  // text / options / correctAnswer / explanation) exactly as they were when
  // this attempt was submitted. Before this field, only per-question
  // correctAnswer was snapshotted (AnswerSchema.correctAnswer), so an admin
  // editing a live Passage doc afterwards silently retro-changed the passage
  // text and question wording every past review of that passage showed.
  // Absent on attempts finished before this existed — getAttemptReview()
  // falls back to reading the live Passage docs for those.
  passagesSnapshot: { type: [mongoose.Schema.Types.Mixed], default: undefined },

  answers: [AnswerSchema],

  // Kết quả tổng hợp
  totalQuestions: { type: Number, default: 40 },
  correctCount:   { type: Number, default: 0 },
  wrongCount:     { type: Number, default: 0 },
  skippedCount:   { type: Number, default: 0 },
  bandScore:      { type: Number, default: 0 },

  // Thời gian
  startTime: { type: Date, default: Date.now },
  endTime:   { type: Date },
  duration:  { type: Number, default: 0 }, // giây

  status: {
    type: String,
    enum: ['in-progress', 'completed', 'timeout'],
    default: 'in-progress'
  }
}, { timestamps: true });

// ─── Indexes ───────────────────────────────────────────────────────────────
TestAttemptSchema.index({ status: 1, endTime: -1 });
TestAttemptSchema.index({ userId: 1, status: 1 });
// BUG-029: every sibling attempt model (ListeningAttempt, WritingAttempt,
// SpeakingAttempt, etc.) has a {userId, <dateField>} index backing its own
// "my history, newest first" query — this one didn't, even though
// readingService.getHistory()/listAdminAttempts() run exactly that shape
// (find({userId,status}).sort({endTime:-1})) on every reading-history page
// view, and weaknessService (the recommendation engine) reads from the
// same collection. Without this, that sort ran in-memory after an
// index-only-partial-match instead of being satisfied directly by the index.
TestAttemptSchema.index({ userId: 1, endTime: -1 });
TestAttemptSchema.index({ testId: 1, status: 1 });
// Retention: auto-delete 3 months after the attempt was created — student
// practice/exam history isn't kept indefinitely (unlike VocabBook, the
// personal saved-word notebooks, which have no expiry).
TestAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// ─── Tính band score theo thang IELTS chính thức ───────────────────────────
TestAttemptSchema.methods.calculateBandScore = function () {
  return bandScoreTable('reading', this.correctCount);
};

module.exports = mongoose.model('TestAttempt', TestAttemptSchema);