const mongoose = require('mongoose');

const PracticeAnswerSchema = new mongoose.Schema({
  questionNumber: Number,
  userAnswer:     String,
  correctAnswer:  String,
  isCorrect:      Boolean
}, { _id: false });

const ReadingPracticeAttemptSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  passageId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Passage', required: true },
  passageTitle: { type: String, default: '' },
  category:     { type: String, default: '' },

  answers:        [PracticeAnswerSchema],
  totalQuestions: { type: Number, default: 0 },
  correctCount:   { type: Number, default: 0 },
  wrongCount:     { type: Number, default: 0 },
  skippedCount:   { type: Number, default: 0 },

  timeTaken:   { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },

  // BUG-A07: idempotency key, one UUID per practice attempt on the client.
  // /practice/save is fire-and-forget from the review screen — a double
  // render / double-click / browser retry could create duplicate rows (and
  // duplicate AttemptReview docs feeding the mandatory-review gate). When
  // present, the service upserts on (userId, clientKey) instead of always
  // inserting. Optional: older clients / direct calls without it keep the
  // old always-insert behavior.
  clientKey:   { type: String }
}, { timestamps: true });

ReadingPracticeAttemptSchema.index({ userId: 1, submittedAt: -1 });
// Partial: only rows that actually carry a clientKey participate, so the
// large back-catalogue of pre-BUG-A07 rows (no clientKey) is untouched and
// can't collide.
ReadingPracticeAttemptSchema.index(
  { userId: 1, clientKey: 1 },
  { unique: true, partialFilterExpression: { clientKey: { $type: 'string' } } }
);
// Retention: auto-delete 3 months after the attempt was created — student
// practice history isn't kept indefinitely (unlike VocabBook, the personal
// saved-word notebooks, which have no expiry).
ReadingPracticeAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('ReadingPracticeAttempt', ReadingPracticeAttemptSchema);
