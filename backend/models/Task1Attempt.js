const mongoose = require('mongoose');

const task1AttemptSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task1Exercise', required: true },
  userAnswer: { type: String, required: true },
  isCorrect:  { type: Boolean },
  score:      { type: Number, min: 0, max: 100 },
  xpEarned:  { type: Number, default: 0 },
  feedback:   { type: String },
  skillType:  { type: String },
  module:     { type: Number },
  sessionId:  { type: String }
}, { timestamps: true });

// Same 3-month retention convention as every other attempt-history model
// (TestAttempt, ListeningAttempt, ReadingPracticeAttempt, WritingAttempt...
// all use this exact expireAfterSeconds keyed on createdAt) — was 30 days
// here until a consistency audit found the mismatch (2026-08-26).
task1AttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// getProgress()/getHistory() filter by userId sorted by recency — previously unindexed.
task1AttemptSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Task1Attempt', task1AttemptSchema);
