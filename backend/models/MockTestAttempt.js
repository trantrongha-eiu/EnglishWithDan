const mongoose = require('mongoose');

/**
 * MockTestAttempt — one full 4-skill IELTS mock test run by a student.
 *
 * The student takes it in TWO sittings (see mockTestService / the frontend
 * "mock mode"):
 *   Sitting 1: Listening → Reading  (chained back-to-back)
 *   Sitting 2: Writing   → Speaking (resumable any time later)
 *
 * The four sub-attempts are the SAME per-skill attempt docs every other
 * flow already creates (ListeningAttempt, TestAttempt (reading),
 * WritingAttempt, SpeakingAttempt) — this doc only records which random
 * test was assigned for each skill, the progress cursor, and a back-
 * reference to each sub-attempt so history can link straight to its review.
 *
 * Writing (teacher/AI graded async) and Speaking (AI graded) bands are
 * usually NOT available at submit time — `steps.*.band` stays null until
 * mockTestService.getHistory() lazily re-reads the referenced attempt.
 * overallBand / status = 'completed' only once all four numeric bands exist.
 */
const stepSchema = new mongoose.Schema({
  attemptId:   { type: mongoose.Schema.Types.ObjectId },
  band:        { type: Number, default: null },
  completedAt: { type: Date }
}, { _id: false });

const MockTestAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // The random bundle, fixed at start — both sittings use exactly these.
  bundle: {
    listeningTestId:    { type: mongoose.Schema.Types.ObjectId, ref: 'ListeningTest' },
    readingTestId:      { type: mongoose.Schema.Types.ObjectId, ref: 'ReadingTest' },
    writingExamId:      { type: mongoose.Schema.Types.ObjectId, ref: 'WritingExam' },
    speakingQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'SpeakingQuestion' },
    speakingTopic:      { type: String, default: '' },   // snapshot
    speakingCueCard:    { type: String, default: '' },   // snapshot
    listeningTestName:  { type: String, default: '' },   // snapshot
    readingTestName:    { type: String, default: '' },   // snapshot
    writingExamName:    { type: String, default: '' }     // snapshot
  },

  steps: {
    listening: { type: stepSchema, default: () => ({}) },
    reading:   { type: stepSchema, default: () => ({}) },
    writing:   { type: stepSchema, default: () => ({}) },
    speaking:  { type: stepSchema, default: () => ({}) }
  },

  progress: {
    type: String,
    enum: ['listening', 'reading', 'writing', 'speaking', 'done'],
    default: 'listening'
  },

  sitting1CompletedAt: { type: Date },   // set when reading step recorded
  sitting2CompletedAt: { type: Date },   // set when speaking step recorded

  overallBand: { type: Number, default: null },  // avg of 4 bands, rounded to .5

  status: {
    type: String,
    enum: ['in-progress', 'awaiting-grading', 'completed'],
    default: 'in-progress'
  }
}, { timestamps: true });

// "My mock history, newest first" — the only list query this collection serves.
MockTestAttemptSchema.index({ userId: 1, createdAt: -1 });
// Resume lookup: the student's one still-open mock.
MockTestAttemptSchema.index({ userId: 1, status: 1 });
// Retention: auto-delete 3 months after creation — same policy as every
// sibling attempt model (ListeningAttempt, TestAttempt, WritingAttempt,
// SpeakingAttempt). The sub-attempts expire on their own identical TTL.
MockTestAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('MockTestAttempt', MockTestAttemptSchema);
