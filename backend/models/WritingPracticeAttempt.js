const mongoose = require('mongoose');

const writingPracticeAttemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  exerciseId: { type: String, required: true },
  level:      { type: String, enum: ['beginner', 'elementary', 'intermediate'], required: true },
  type:       { type: String, enum: ['translation', 'rearrange', 'fill_blank', 'expand', 'combine'], required: true },
  topic:      { type: String, required: true },
  userAnswer: { type: String, required: true },
  aiFeedback: {
    grammarScore:    Number,
    naturalScore:    Number,
    isAcceptable:    Boolean,
    corrections:     [{ error: String, fix: String, explainVi: String }],
    feedbackVi:      String,
    suggestedAnswer: String,
    upgradeVersion:  String
  },
  xpEarned:  { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WritingPracticeAttempt', writingPracticeAttemptSchema);
