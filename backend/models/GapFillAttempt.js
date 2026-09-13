/**
 * backend/models/GapFillAttempt.js
 * Full-transcript Listening gap-fill practice (frontend/listening.html,
 * "Gap-fill" screen) — separate from ListeningPracticeAttempt (MCQ-style
 * Listening questions) and DictationAttempt (sentence-by-sentence typing)
 * since it's yet another distinct skill (fill-in-the-blank while listening
 * to the full continuous audio) and shouldn't pollute either collection's
 * stats/weakness analysis.
 */
const mongoose = require('mongoose');

const GapFillAnswerSchema = new mongoose.Schema({
  blankIndex: Number,
  userAnswer: String,
  isCorrect:  Boolean,
}, { _id: false });

const GapFillAttemptSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sectionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'ListeningSection', required: true },
  sectionTitle: { type: String, default: '' },
  partNumber:   { type: Number, default: 1 },

  answers:      [GapFillAnswerSchema],
  totalBlanks:  { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },

  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

GapFillAttemptSchema.index({ userId: 1, submittedAt: -1 });
// Same 3-month retention as every other practice-history collection.
GapFillAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('GapFillAttempt', GapFillAttemptSchema);
