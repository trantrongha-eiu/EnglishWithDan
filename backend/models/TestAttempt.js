const mongoose = require('mongoose');

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
  const c = this.correctCount;
  if (c >= 39) return 9.0;
  if (c >= 37) return 8.5;
  if (c >= 35) return 8.0;
  if (c >= 33) return 7.5;
  if (c >= 30) return 7.0;
  if (c >= 27) return 6.5;
  if (c >= 23) return 6.0;
  if (c >= 19) return 5.5;
  if (c >= 15) return 5.0;
  if (c >= 13) return 4.5;
  if (c >= 10) return 4.0;
  if (c >= 8)  return 3.5;
  if (c >= 6)  return 3.0;
  if (c >= 4)  return 2.5;
  return 1.0;
};

module.exports = mongoose.model('TestAttempt', TestAttemptSchema);