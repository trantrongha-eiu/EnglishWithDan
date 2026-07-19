const mongoose = require('mongoose');

const SpeakingQuestionSchema = new mongoose.Schema({
  topic:    { type: String, required: true },
  part:     { type: Number, enum: [1, 2, 3], default: 1 },
  question: { type: String, required: true },
  cueCard:  { type: String, default: '' },   // Part 2 cue card bullet points
  isActive: { type: Boolean, default: true },
  // Pre-generated (or lazily cached on first request) Band 7.5+ sample
  // answer — once set, /api/speaking/sample-answer serves this directly
  // instead of calling Gemini, so repeat views of the same question across
  // every student cost zero extra AI calls. See scripts/generateSampleAnswers.js
  // for bulk pre-generation across the whole question bank.
  sampleAnswer: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('SpeakingQuestion', SpeakingQuestionSchema);
