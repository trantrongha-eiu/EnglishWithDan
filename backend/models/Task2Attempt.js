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

module.exports = mongoose.model('Task2Attempt', task2AttemptSchema);
