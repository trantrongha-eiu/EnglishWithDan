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
TestAttemptSchema.index({ testId: 1, status: 1 });

// ─── Tính band score theo thang IELTS chính thức ───────────────────────────
TestAttemptSchema.methods.calculateBandScore = function () {
  return bandScoreTable('reading', this.correctCount);
};

module.exports = mongoose.model('TestAttempt', TestAttemptSchema);