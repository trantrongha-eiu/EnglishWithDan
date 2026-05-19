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

module.exports = mongoose.model('Task1Attempt', task1AttemptSchema);
