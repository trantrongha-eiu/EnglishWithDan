const mongoose = require('mongoose');

// Saved practice/exam session for "Viết câu nâng cao". Mirrors
// Task2Attempt.js field-for-field (same retention + index conventions) so
// the admin activity reporting + the student history modal can treat it
// the same way.
const sAttemptSchema = new mongoose.Schema({
  sentenceId:       { type: String },
  userAnswer:       { type: String },
  isCorrect:        { type: Boolean },
  score:            { type: Number },
  timeSpentSeconds: { type: Number },
}, { _id: false });

const advSentenceAttemptSchema = new mongoose.Schema({
  userId:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionType:        { type: String, enum: ['practice', 'exam'], default: 'practice' },
  week:               { type: Number },
  groupId:            { type: mongoose.Schema.Types.ObjectId, ref: 'SentenceStructureGroup' },
  groupName:          { type: String },
  sentencesAttempted: [sAttemptSchema],
  totalQuestions:     { type: Number },
  correctCount:       { type: Number, default: 0 },
  scorePercentage:    { type: Number },
  completedAt:        { type: Date, default: Date.now },
}, { timestamps: true });

// Same 3-month retention convention as every other attempt-history model
// (see memory/data_retention_policy.md — TestAttempt, Task2Attempt, ...).
advSentenceAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
advSentenceAttemptSchema.index({ userId: 1, groupId: 1 });
advSentenceAttemptSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('AdvSentenceAttempt', advSentenceAttemptSchema);
