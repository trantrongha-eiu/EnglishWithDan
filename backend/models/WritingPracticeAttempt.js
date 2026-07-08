const mongoose = require('mongoose');

const writingPracticeAttemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseId: { type: String, required: true },
  level:      { type: String, enum: ['beginner', 'elementary', 'intermediate'], required: true },
  type:       { type: String, enum: ['translation', 'rearrange', 'fill_blank', 'expand', 'combine'], required: true },
  topic:      { type: String, required: true },
  userAnswer: { type: String, required: true },
  xpEarned:  { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Auto-delete after 30 days
writingPracticeAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('WritingPracticeAttempt', writingPracticeAttemptSchema);
