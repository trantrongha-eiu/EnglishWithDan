const mongoose = require('mongoose');
const proctorSchema = require('./shared/proctorSchema');

/**
 * EntranceTestAttempt — one student's run of the 74-minute, 5-section
 * IELTS Entrance Test ("Test đầu vào"). See backend/services/
 * entranceTestService.js for the full flow.
 *
 * Everything needed to grade and later review this attempt is snapshotted
 * onto the doc itself at the moment each section starts (questionsSnapshot
 * / passageSnapshot / sectionSnapshot) — the same pattern TestAttempt.
 * passagesSnapshot / ListeningAttempt.sectionsSnapshot already use — so a
 * later admin edit to the live Passage/ListeningSection/WritingTask1/
 * EntranceGrammarQuestion docs can never retroactively change an
 * in-progress or already-completed attempt's questions, answer key, or
 * score (spec §24).
 *
 * Unlike every other attempt model in this codebase, this one carries NO
 * 90-day TTL index — placement results are a one-time signal worth keeping
 * around (e.g. for later course-placement reference), not disposable
 * practice history.
 */
const GrammarAnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true }, // questionsSnapshot[i]._id, stringified
  topic:      { type: String, default: '' },
  userAnswer: { type: String, default: '' },
  correct:    { type: Boolean, default: false },
}, { _id: false });

const ObjectiveAnswerSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  userAnswer:     { type: String, default: '' },
  correctAnswer:  { type: String, default: '' },
  isCorrect:      { type: Boolean, default: false },
}, { _id: false });

const SectionTimingFields = {
  startedAt:       { type: Date },
  sectionExpiresAt:{ type: Date },
  submittedAt:     { type: Date },
};

const GrammarSectionSchema = new mongoose.Schema({
  ...SectionTimingFields,
  // Frozen copy of the 25 EntranceGrammarQuestion docs used, answer key
  // included — never sent to the client before this section is submitted
  // (entranceTestService strips `answer`/`accept` on every pre-submission
  // read).
  questionsSnapshot: { type: [mongoose.Schema.Types.Mixed], default: [] },
  answers:      { type: [GrammarAnswerSchema], default: [] },
  correctCount: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  band:         { type: Number, default: null },
}, { _id: false });

const ReadingSectionSchema = new mongoose.Schema({
  ...SectionTimingFields,
  passageSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
  answers:      { type: [ObjectiveAnswerSchema], default: [] },
  correctCount: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  band:         { type: Number, default: null },
}, { _id: false });

const ListeningSectionAttemptSchema = new mongoose.Schema({
  ...SectionTimingFields,
  sectionSnapshot:  { type: mongoose.Schema.Types.Mixed, default: null },
  audioUrlSnapshot: { type: String, default: '' },
  answers:      { type: [ObjectiveAnswerSchema], default: [] },
  correctCount: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  band:         { type: Number, default: null },
}, { _id: false });

const WritingSectionSchema = new mongoose.Schema({
  ...SectionTimingFields,
  promptSnapshot:   { type: mongoose.Schema.Types.Mixed, default: null },
  writingAnswer:    { type: String, default: '' }, // draft copy; graded copy lives on the linked WritingAttempt
  wordCount:        { type: Number, default: 0 },
  // The real WritingAttempt created on submit — reuses the existing AI-
  // grade cron + admin WritingGrades.jsx confirm queue instead of a
  // bespoke grading path (per product decision). Band is polled/copied
  // from writingAttemptId.grading.overallBand into `band` below once
  // available (see entranceTestService.getResult).
  writingAttemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'WritingAttempt' },
  // Suggested band pulled from the linked WritingAttempt (a teacher-
  // confirmed grading.overallBand if there is one, else the AI's
  // aiGrading.task1.bandScore) — what the admin review screen proposes.
  // `band` is the FINAL band, set when an admin approves the result (or,
  // on a pre-Speaking legacy attempt, the confirmed grade copied straight
  // in — see entranceTestService.isLegacyAttempt).
  aiBand:           { type: Number, default: null },
  band:             { type: Number, default: null },
}, { _id: false });

// Speaking Part 2 — one cue card, 70s prep + up to 2 min recording (the
// student may also type/correct the transcript). The recording is stored on
// Cloudinary so a teacher can listen to it; the student never sees any AI
// feedback — aiBand/aiFeedback are a suggestion for the admin review only.
const SpeakingSectionSchema = new mongoose.Schema({
  ...SectionTimingFields,
  questionSnapshot: { type: mongoose.Schema.Types.Mixed, default: null }, // { _id, topic, question, cueCard }
  transcript:       { type: String, default: '' },  // draft (autosaved) → final on submit
  aiTranscript:     { type: String, default: '' },  // AI's transcription when the student had no STT text
  durationSec:      { type: Number, default: 0 },
  audioUrl:         { type: String, default: '' },
  audioPublicId:    { type: String, default: '' },
  audioMimeType:    { type: String, default: '' },
  aiStatus:        { type: String, enum: ['none', 'pending', 'done', 'error'], default: 'none' },
  aiError:          { type: String, default: '' },
  aiBand:           { type: Number, default: null },
  aiFeedback:       { type: mongoose.Schema.Types.Mixed, default: null },
  band:             { type: Number, default: null }, // final, set on admin approval
}, { _id: false });

const EntranceTestAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  status: {
    type: String,
    enum: ['in-progress', 'completed', 'disqualified', 'abandoned'],
    default: 'in-progress',
  },
  // Finer-grained than `status` for the result screen: COMPLETED requires
  // all 4 bands (incl. Writing, which grades asynchronously) to be present.
  resultStatus: {
    type: String,
    // PENDING_WRITING — waiting for the Writing AI grade.
    // PENDING_REVIEW  — every band has a suggestion; waiting for an admin to
    //                   review + approve. The student sees no scores until then.
    // COMPLETED       — approved (or a legacy attempt fully graded): visible.
    enum: ['IN_PROGRESS', 'PENDING_WRITING', 'PENDING_REVIEW', 'COMPLETED', 'DISQUALIFIED', 'ABANDONED'],
    default: 'IN_PROGRESS',
  },

  // The content IDs drawn at random for this attempt at start time — kept
  // alongside the full per-section snapshots below for traceability and so
  // a retake can avoid re-drawing content this student has already seen.
  // Not relied on for grading.
  configSnapshot: {
    readingPassageId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Passage' },
    listeningSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ListeningSection' },
    writingTask1Id:      { type: mongoose.Schema.Types.ObjectId, ref: 'WritingTask1' },
    speakingQuestionId:  { type: mongoose.Schema.Types.ObjectId, ref: 'SpeakingQuestion' },
    grammarSetKey:       { type: String, default: 'default' },
  },

  currentSection: {
    type: String,
    enum: ['grammar', 'reading', 'listening', 'writing', 'speaking', 'done'],
    default: 'grammar',
  },

  startedAt:   { type: Date, default: Date.now },
  completedAt: { type: Date },

  sections: {
    grammar:   { type: GrammarSectionSchema, default: () => ({}) },
    reading:   { type: ReadingSectionSchema, default: () => ({}) },
    listening: { type: ListeningSectionAttemptSchema, default: () => ({}) },
    writing:   { type: WritingSectionSchema, default: () => ({}) },
    speaking:  { type: SpeakingSectionSchema, default: () => ({}) },
  },

  // Final overall band — only set once the result is COMPLETED (approved).
  overallBand: { type: Number, default: null },

  // Admin approval of the compiled result — until approvedAt is set the
  // student sees "đang chờ giáo viên duyệt" and no scores at all.
  review: {
    approvedAt:     { type: Date, default: null },
    approvedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedByName: { type: String, default: '' },
    adminNote:      { type: String, default: '' },
  },

  // Reused shape (violationCount/violated/events/disqualifiedAt) — see
  // backend/models/shared/proctorSchema.js. Threshold is
  // entranceTestService.MAX_VIOLATIONS (5), deliberately independent of
  // mockTestService's own MAX_VIOLATIONS (10) for the 4-skill Full Mock
  // Test — a per-user decision confirmed for this feature, not a global
  // proctoring-threshold change.
  proctor: { type: proctorSchema, default: () => ({}) },
}, {
  timestamps: true,
  // Every save() checks __v, not just saves that touch an array. Several
  // requests legitimately race on one attempt (the submit click, the
  // client's expiry re-sync, the visibilitychange re-sync, autosaves), and
  // scalar-only saves used to slip past each other silently — that is how
  // one Writing submit produced 3 WritingAttempts. The loser now gets a
  // VersionError and entranceTestService.withVersionRetry re-runs it
  // against the fresh doc.
  optimisticConcurrency: true,
});

// Admin review queue: "finished attempts waiting for approval".
EntranceTestAttemptSchema.index({ resultStatus: 1, createdAt: -1 });

// Resume lookup: "does this student have an open attempt".
EntranceTestAttemptSchema.index({ userId: 1, status: 1 });
// "My entrance test history" — a student can self-serve retake, so this can
// hold several completed/disqualified/abandoned rows per student, each one
// kept (no TTL, see above) as a permanent record for the student's own
// history view and the admin attempt monitor.
EntranceTestAttemptSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('EntranceTestAttempt', EntranceTestAttemptSchema);
