const mongoose = require('mongoose');

const task1ExerciseSchema = new mongoose.Schema({
  skillType: {
    type: String,
    enum: ['noun_phrase', 'data_description', 'comparison', 'paraphrase', 'trend_language', 'overview'],
    required: true
  },
  module: { type: Number, enum: [1, 2, 3, 4], required: true },
  level: { type: String, enum: ['beginner', 'elementary', 'intermediate'], required: true },
  type: {
    type: String,
    enum: ['fill_blank', 'translation', 'rearrange', 'multiple_choice', 'error_correction', 'paraphrase_choose', 'data_transform'],
    required: true
  },
  instruction: { type: String, required: true },
  questionVi: { type: String },
  questionEn: { type: String },
  sentenceWithBlanks: { type: String },
  blanksCount: { type: Number, default: 1 },
  baseWords: [{ type: String }],
  options: [{ type: String }],
  correctOptionIndex: { type: Number },
  dataContext: {
    type: { type: String, enum: ['table', 'sentence', 'chart_description'] },
    subject: { type: String },
    year: { type: String },
    value: { type: String },
    unit: { type: String },
    additionalData: mongoose.Schema.Types.Mixed
  },
  sampleAnswers: [{ type: String }],
  primaryAnswer: { type: String },
  grammarPoint: { type: String },
  explanation: { type: String },
  explanationEn: { type: String },
  hints: [{ type: String }],
  orderIndex: { type: Number, default: 0 },
  xpReward: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Task1Exercise', task1ExerciseSchema);
