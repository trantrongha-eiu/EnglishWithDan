const mongoose = require('mongoose');

const task2TemplateAttemptSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  templateType: { type: String },
  templateName: { type: String },
  // Absent on every attempt saved before Band 6+ templates existed —
  // defaults to 'band7' so old rows keep meaning what they always meant
  // (the only level that existed at the time).
  level:        { type: String, enum: ['band6', 'band7'], default: 'band7' },
  totalItems:   { type: Number, default: 0 },
  correctItems: { type: Number, default: 0 },
  // Optional — absent on every attempt saved before the memorization-modes
  // feature. Defaults to 'cloze' so old rows and old callers (which never
  // send this field) keep meaning exactly what they always meant.
  mode:         { type: String, enum: ['cloze', 'translation', 'chunks', 'build', 'dictation'], default: 'cloze' },
  // Set when this attempt came from "Chế độ thi thử" (timed, single-pass,
  // no hints) rather than regular self-paced practice — lets admin/history
  // tell timed test runs apart from ordinary practice sessions.
  isExam:       { type: Boolean, default: false },
  timeTakenSec: { type: Number },
  createdAt:    { type: Date, default: Date.now }
});

// Same 3-month retention convention as every other attempt-history model
// (TestAttempt, ListeningAttempt, ReadingPracticeAttempt, WritingAttempt...
// all use this exact expireAfterSeconds keyed on createdAt) — was 30 days
// here until a consistency audit found the mismatch (2026-08-26).
task2TemplateAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// getHistory() filters by userId sorted by recency — previously unindexed.
task2TemplateAttemptSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Task2TemplateAttempt', task2TemplateAttemptSchema);
