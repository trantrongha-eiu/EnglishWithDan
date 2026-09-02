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

  // Immutable snapshot of the test's sections (question text / options /
  // correctAnswer / explanation / group config) + audio URL exactly as they
  // were when this attempt was submitted — so a later admin edit to the live
  // ListeningTest / ListeningSection can't retro-change what this student's
  // review shows. Absent on attempts finished before this existed;
  // getHistoryDetail() falls back to reading the live test for those.
  sectionsSnapshot: { type: [mongoose.Schema.Types.Mixed], default: undefined },
  audioUrlSnapshot: { type: String, default: '' },

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
    // 'in-progress' is written at /start (audit fix — previously nothing
    // was persisted until /submit, so an abandoned mock test left zero
    // trace anywhere, including admin). Matches TestAttempt's (Reading)
    // enum/default exactly.
    enum: ['in-progress', 'completed', 'timeout'],
    default: 'in-progress'
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
// Retention: auto-delete 3 months after the attempt was created — student
// practice/exam history isn't kept indefinitely (unlike VocabBook, the
// personal saved-word notebooks, which have no expiry).
ListeningAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('ListeningAttempt', ListeningAttemptSchema);