const mongoose = require('mongoose');

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
  const c = this.correctCount;
  if (c >= 39) return 9.0;
  if (c >= 37) return 8.5;
  if (c >= 35) return 8.0;
  if (c >= 32) return 7.5;
  if (c >= 30) return 7.0;
  if (c >= 26) return 6.5;
  if (c >= 23) return 6.0;
  if (c >= 18) return 5.5;
  if (c >= 16) return 5.0;
  if (c >= 13) return 4.5;
  if (c >= 10) return 4.0;
  if (c >= 8)  return 3.5;
  if (c >= 6)  return 3.0;
  if (c >= 4)  return 2.5;
  return 2.0;
};

// ── Index thường dùng: lấy lịch sử theo user, sort mới nhất ─────────────────
ListeningAttemptSchema.index({ userId: 1, submittedAt: -1 });
ListeningAttemptSchema.index({ testId: 1, submittedAt: -1 });

module.exports = mongoose.model('ListeningAttempt', ListeningAttemptSchema);