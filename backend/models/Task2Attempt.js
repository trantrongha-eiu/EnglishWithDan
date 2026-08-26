const mongoose = require('mongoose');

const qAttemptSchema = new mongoose.Schema({
  questionId:       { type: String },
  userAnswer:       { type: String },
  isCorrect:        { type: Boolean },
  score:            { type: Number },
  timeSpentSeconds: { type: Number }
}, { _id: false });

const task2AttemptSchema = new mongoose.Schema({
  userId:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionType:        { type: String, enum: ['practice', 'exam'], default: 'practice' },
  week:               { type: Number },
  topicId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Task2Topic' },
  topicName:          { type: String },
  level:              { type: String },
  questionsAttempted: [qAttemptSchema],
  totalQuestions:     { type: Number },
  correctCount:       { type: Number, default: 0 },
  scorePercentage:    { type: Number },
  completedAt:        { type: Date, default: Date.now }
}, { timestamps: true });

// Same 3-month retention convention as every other attempt-history model
// (TestAttempt, ListeningAttempt, ReadingPracticeAttempt, WritingAttempt...
// all use this exact expireAfterSeconds keyed on createdAt) — was 60 days
// here until a consistency audit found the mismatch (2026-08-26).
task2AttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// getWrongQuestions() filters by {userId, topicId}; getHistory()/getProgress()
// filter by userId sorted by recency — both previously unindexed.
task2AttemptSchema.index({ userId: 1, topicId: 1 });
task2AttemptSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('Task2Attempt', task2AttemptSchema);
