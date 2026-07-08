const mongoose = require('mongoose');
const { bandScoreTable } = require('../utils/bandScore');

// ── Per-question answer record ────────────────────────────────────────────────
const ListeningAnswerSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  userAnswer:     { type: String, default: '' },
  correctAnswer:  { type: String, required: true },
  isCorrect:      { type: Boolean, default: false }
}, { _id: false });

// ── Main attempt schema ───────────────────────────────────────────────────────
const ListeningAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ListeningTest',
    required: true
  },
  testName: { type: String, default: '' },   // snapshot tên đề, tránh phải populate

  answers: [ListeningAnswerSchema],

  // Kết quả tổng hợp
  totalQuestions: { type: Number, default: 40 },
  correctCount:   { type: Number, default: 0 },
  wrongCount:     { type: Number, default: 0 },
  skippedCount:   { type: Number, default: 0 },
  bandScore:      { type: Number, default: 0 },

  // Thời gian
  startTime:    { type: Date, default: Date.now },
  submittedAt:  { type: Date, default: Date.now },
  timeTaken:    { type: Number, default: 0 },  // giây

  status: {
    type: String,
    enum: ['completed', 'timeout'],
    default: 'completed'
  }
}, { timestamps: true });

// ── Band score IELTS Listening (thang chính thức) ────────────────────────────
ListeningAttemptSchema.methods.calculateBandScore = function () {
  return bandScoreTable('listening', this.correctCount);
};

// ── Index thường dùng: lấy lịch sử theo user, sort mới nhất ─────────────────
ListeningAttemptSchema.index({ userId: 1, submittedAt: -1 });
ListeningAttemptSchema.index({ userId: 1, status: 1 });
ListeningAttemptSchema.index({ testId: 1, submittedAt: -1 });

module.exports = mongoose.model('ListeningAttempt', ListeningAttemptSchema);