const mongoose = require('mongoose');
const proctorSchema = require('./shared/proctorSchema');

const PracticeAnswerSchema = new mongoose.Schema({
  questionNumber: Number,
  userAnswer:     String,
  correctAnswer:  String,
  isCorrect:      Boolean
}, { _id: false });

const ListeningPracticeAttemptSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sectionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'ListeningSection', required: true },
  sectionTitle: { type: String, default: '' },
  partNumber:   { type: Number, default: 1 },

  answers:        [PracticeAnswerSchema],
  totalQuestions: { type: Number, default: 0 },
  correctCount:   { type: Number, default: 0 },
  wrongCount:     { type: Number, default: 0 },
  skippedCount:   { type: Number, default: 0 },

  timeTaken:   { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },

  // Test Simulation mode only — see ReadingPracticeAttempt.js's identical
  // addition for the full rationale. No separate duration/startTime field
  // here: a single-play, no-pause/no-rewind audio section already has its
  // own natural time limit (its length), so unlike Reading practice there's
  // no artificial countdown to snapshot — status/mode/proctor exist purely
  // so a strike has an in-progress row to attach to.
  status: { type: String, enum: ['in-progress', 'completed', 'disqualified'], default: 'completed' },
  mode: { type: String, enum: ['practice', 'simulation'], default: 'practice' },
  proctor: { type: proctorSchema, default: () => ({}) },

  // BUG-A07 — see ReadingPracticeAttempt.js for the full rationale. One UUID
  // per practice attempt on the client; when present the service upserts on
  // (userId, clientKey) so a double fire can't duplicate the row.
  clientKey:   { type: String }
}, { timestamps: true });

ListeningPracticeAttemptSchema.index({ userId: 1, submittedAt: -1 });
ListeningPracticeAttemptSchema.index(
  { userId: 1, clientKey: 1 },
  { unique: true, partialFilterExpression: { clientKey: { $type: 'string' } } }
);
// Retention: auto-delete 3 months after the attempt was created — student
// practice history isn't kept indefinitely (unlike VocabBook, the personal
// saved-word notebooks, which have no expiry).
ListeningPracticeAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('ListeningPracticeAttempt', ListeningPracticeAttemptSchema);
