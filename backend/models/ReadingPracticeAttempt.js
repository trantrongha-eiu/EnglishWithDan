const mongoose = require('mongoose');
const proctorSchema = require('./shared/proctorSchema');

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

  // The fields below only apply to Test Simulation mode. Practice mode
  // (mode:'practice', the default — every row before this field existed)
  // never sets them; the /practice/save write path is otherwise completely
  // unchanged (still a plain insert with no upfront row).
  //
  // 'in-progress' is written at POST /practice/start-simulation, before the
  // student has answered anything — so a strike (examSimulationService.
  // recordViolation) has a row to attach to, matching TestAttempt's
  // (full-test) existing start-then-submit shape. 'disqualified' = 5+
  // strikes voided the run.
  status: { type: String, enum: ['in-progress', 'completed', 'disqualified'], default: 'completed' },
  mode: { type: String, enum: ['practice', 'simulation'], default: 'practice' },
  proctor: { type: proctorSchema, default: () => ({}) },
  // Simulation-only exam-condition timer — a single passage has no official
  // IELTS time limit, so this is the platform's own ~20min/passage
  // convention (examSimulationService.READING_PRACTICE_DURATION_SEC),
  // snapshotted here rather than recomputed so a later constant change
  // never retroactively changes what an already-started run enforced.
  startTime: { type: Date },
  duration: { type: Number },

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
