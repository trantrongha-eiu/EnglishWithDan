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
  completedAt: { type: Date },
  // A teacher/admin typed this band in by hand (e.g. they ran the Speaking
  // part live, in person). A manual band is authoritative: the lazy
  // re-grade (refreshGrades) and advance() must never overwrite it.
  manual:      { type: Boolean, default: false },
  manualBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  manualAt:    { type: Date }
}, { _id: false });

// Client-side proctoring: the mock skill pages report every time the
// student leaves the exam tab (hides it, blurs the window, or tries to
// close it). We can't PREVENT that in a browser — this just counts it
// ("gậy") and flags the run so a teacher can see it. See
// frontend/js/shared/mock-test.js (MockTest proctor) + recordViolation().
const proctorEventSchema = new mongoose.Schema({
  type:  { type: String, enum: ['hidden', 'blur', 'unload-attempt'], required: true },
  skill: { type: String, enum: ['listening', 'reading', 'writing', 'speaking'] },
  at:    { type: Date, default: Date.now }
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

  // A teacher/admin edited one or more skill bands by hand — see the
  // per-step `manual` flag. `adminNote` is their free-text note ("Speaking
  // chấm trực tiếp 20/8"), surfaced in the admin monitor.
  adminNote:     { type: String, default: '' },
  scoreEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scoreEditedAt: { type: Date },

  // An admin removed this run from the monitor (soft delete — recoverable in
  // the DB; the four per-skill sub-attempts are untouched).
  deletedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt:     { type: Date },

  status: {
    type: String,
    // 'abandoned'    = the student discarded a still-open run from the
    //                  dashboard so they could start a fresh mock.
    // 'disqualified' = the student left the exam screen more than
    //                  MAX_VIOLATIONS times; the run is voided (no overall
    //                  band) and they must wait out a cooldown before a new
    //                  one.
    // 'deleted'      = an admin removed it from the monitor.
    // All three are excluded from history + the "resume" lookup; the
    // sub-attempts they linked to keep living in their own per-skill
    // histories (no data loss).
    enum: ['in-progress', 'awaiting-grading', 'completed', 'abandoned', 'disqualified', 'deleted'],
    default: 'in-progress'
  },

  // Tab-switching / focus-loss log during the exam (best-effort proctoring).
  proctor: {
    violationCount: { type: Number, default: 0 },
    violated:       { type: Boolean, default: false },
    events:         { type: [proctorEventSchema], default: [] },
    // Set when violationCount first exceeds MAX_VIOLATIONS and the run is
    // voided — the start of the "wait 5 minutes" cooldown.
    disqualifiedAt: { type: Date }
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
