/**
 * backend/models/DictationAttempt.js
 * Sentence-by-sentence Listening dictation practice (frontend/dictation.html)
 * — separate from ListeningPracticeAttempt (MCQ-style Listening questions)
 * since it's a different skill (transcription, not comprehension) and would
 * otherwise pollute that collection's stats/weakness analysis.
 */
const mongoose = require('mongoose');

const DictationAnswerSchema = new mongoose.Schema({
  sentenceIndex: Number,
  isCorrect:     Boolean, // perfect word-for-word match against the sentence
  matchedWords:  Number,
  totalWords:    Number
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
