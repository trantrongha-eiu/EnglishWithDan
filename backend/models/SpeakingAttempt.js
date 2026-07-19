const mongoose = require('mongoose');

const SpeakingAttemptSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId:   { type: mongoose.Schema.Types.ObjectId, ref: 'SpeakingQuestion' },
  topic:        { type: String, default: '' },
  part:         { type: Number, enum: [1, 2, 3], default: 1 },
  question:     { type: String, default: '' },
  transcript:   { type: String, default: '' },
  aiFeedback: {
    overallBand:      { type: Number, default: 0 },
    fluency:          { type: Number, default: 0 },
    vocabulary:       { type: Number, default: 0 },
    grammar:          { type: Number, default: 0 },
    pronunciation:    { type: Number, default: 0 },
    overallFeedback:  { type: String, default: '' },
    correctedVersion: { type: String, default: '' }, // Stage 1 (analyze) no longer populates this — kept for old attempts + optional future use
    todaysFocus:      { type: String, default: '' },
    strengths:        [String],
    corrections:      [{ original: String, corrected: String, explanation: String }],
    suggestions:      [String],
    feedback:         { type: String, default: '' }  // legacy field
  },
  duration:     { type: Number, default: 0 }, // seconds
  status:       { type: String, enum: ['pending', 'analyzed', 'error'], default: 'pending' }
}, { timestamps: true });

// getHistory()/admin history both filter by userId sorted by recency —
// previously unindexed.
SpeakingAttemptSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SpeakingAttempt', SpeakingAttemptSchema);
