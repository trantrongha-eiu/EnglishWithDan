const mongoose = require('mongoose');

const SpeakingAttemptSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId:   { type: mongoose.Schema.Types.ObjectId, ref: 'SpeakingQuestion' },
  topic:        { type: String, default: '' },
  part:         { type: Number, enum: [1, 2, 3], default: 1 },
  question:     { type: String, default: '' },
  transcript:   { type: String, default: '' },
  aiFeedback: {
    overallBand:      { type: Number, default: 0 },
    fluency:          { type: Number, default: 0 },
    vocabulary:       { type: Number, default: 0 },
    grammar:          { type: Number, default: 0 },
    // null when Pronunciation was not assessable (speaking-v2 grades it
    // only from a heard recording — never guessed from a transcript).
    pronunciation:    { type: Number, default: 0 },
    // true when Pronunciation was graded from the student's real audio
    // recording (multimodal). false = not heard (speaking-v2: not assessed;
    // older speaking-v1 rows: a transcript-only estimate).
    pronunciationFromAudio: { type: Boolean, default: false },
    // true when the AI judged there was no real answer to assess (silent
    // recording, mic issue, nothing actually said) — the 4 scores above are
    // all 0 in this case too, but that's NOT a genuine Band 0 assessment;
    // history/admin views should show "Không phát hiện nội dung" instead of
    // a bare 0.0. See speakingService.hasRealContent.
    noGenuineAnswer: { type: Boolean, default: false },
    overallFeedback:  { type: String, default: '' },
    correctedVersion: { type: String, default: '' }, // Stage 1 (analyze) no longer populates this — kept for old attempts + optional future use
    todaysFocus:      { type: String, default: '' },
    strengths:        [String],
    corrections:      [{ original: String, corrected: String, explanation: String }],
    vocabUpgrades:    [{ original: String, upgrade: String, reason: String }],
    suggestions:      [String],
    feedback:         { type: String, default: '' },  // legacy field

    // ── speaking-v2 (see services/speakingScoringV2.js) ──
    // The flat bands above stay the source for stats/history/other skills;
    // these hold the detailed, evidence-backed analysis behind them.
    // 'speaking-v1' = the older flat-only grade (criteria null).
    scoringVersion:   { type: String, default: '' },
    // { fluencyCoherence, lexicalResource, grammaticalRangeAccuracy,
    //   pronunciation } — each { band, descriptorMatch, strengths,
    //   weaknesses, evidence[], limitations[], range/accuracy/flexibility/
    //   appropriacyLevel, feedback, nextStep } (+ lexical features, grammar
    //   structures / errorDensity, pronunciation assessable/reason).
    criteria:         { type: mongoose.Schema.Types.Mixed, default: null },
    priorityImprovements: { type: [String], default: [] },
    memorisedLanguage:    { type: mongoose.Schema.Types.Mixed, default: [] },
    partAnalysis:         { type: mongoose.Schema.Types.Mixed, default: [] },
    // true = Pronunciation could not be assessed (no recording heard), so
    // overallBand is the mean of the other three criteria only.
    provisional:      { type: Boolean, default: false },
    pronunciationAssessable: { type: Boolean, default: null },
    qualityCheck:     { type: mongoose.Schema.Types.Mixed, default: null }, // { verifiedQuotes, droppedQuotes }
    analyzedAt:       { type: Date },
  },
  duration:     { type: Number, default: 0 }, // seconds
  status:       { type: String, enum: ['pending', 'analyzed', 'error'], default: 'pending' },
  // true while a 'pending' attempt waits in the AI re-grade queue
  // (SpeakingGradeJob — AI was overloaded at submit time). Keeps
  // attemptTimeoutSweep from flipping it to 'error' in the meantime.
  gradingQueued: { type: Boolean, default: false }
}, { timestamps: true });

// getHistory()/admin history both filter by userId sorted by recency —
// previously unindexed.
SpeakingAttemptSchema.index({ userId: 1, createdAt: -1 });
// Retention: auto-delete 3 months after the attempt was created — student
// practice history isn't kept indefinitely (unlike VocabBook, the personal
// saved-word notebooks, which have no expiry).
SpeakingAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('SpeakingAttempt', SpeakingAttemptSchema);
