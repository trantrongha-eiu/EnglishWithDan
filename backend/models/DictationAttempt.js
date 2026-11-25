/**
 * backend/models/DictationAttempt.js
 * Sentence-by-sentence Listening dictation practice (frontend/dictation.html)
 * — separate from ListeningPracticeAttempt (MCQ-style Listening questions)
 * since it's a different skill (transcription, not comprehension) and would
 * otherwise pollute that collection's stats/weakness analysis.
 */
const mongoose = require('mongoose');

// One wrong word at a sentence's first check, sorted by the page
// (student-src utils/dictationInsights.js MISTAKE_TYPES: ending_s,
// weak_form, sound, case…) — "Bạn hay nghe sai" adds these up.
const DictationMistakeSchema = new mongoose.Schema({
  type:  String,
  typed: String,
  word:  String
}, { _id: false });

const DictationAnswerSchema = new mongoose.Schema({
  sentenceIndex: Number,
  isCorrect:     Boolean, // typed right (≥80% of the words; a drill exact) without seeing the answer first
  matchedWords:  Number,
  totalWords:    Number,
  mistakes:      { type: [DictationMistakeSchema], default: undefined }
}, { _id: false });

const DictationAttemptSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // A Listening section's dictation — or, with drillId, a "Đánh vần tên &
  // số dài" lesson (DictationDrill; its items are clips of many sections).
  sectionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'ListeningSection', required() { return !this.drillId; } },
  drillId:      { type: mongoose.Schema.Types.ObjectId, ref: 'DictationDrill', default: undefined },
  sectionTitle: { type: String, default: '' },
  partNumber:   { type: Number, default: 1 },

  answers:        [DictationAnswerSchema],
  totalSentences: { type: Number, default: 0 },
  correctCount:   { type: Number, default: 0 },

  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

DictationAttemptSchema.index({ userId: 1, submittedAt: -1 });
// Same 3-month retention as every other practice-history collection —
// dictation practice history isn't kept forever.
DictationAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('DictationAttempt', DictationAttemptSchema);
