const mongoose = require('mongoose');

const SpeakingQuestionSchema = new mongoose.Schema({
  topic:    { type: String, required: true },
  part:     { type: Number, enum: [1, 2, 3], default: 1 },
  question: { type: String, required: true },
  cueCard:  { type: String, default: '' },   // Part 2 cue card bullet points
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('SpeakingQuestion', SpeakingQuestionSchema);
