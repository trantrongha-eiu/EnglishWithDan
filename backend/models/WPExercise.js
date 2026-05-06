const mongoose = require('mongoose');

const wpExerciseSchema = new mongoose.Schema({
  lessonId:           { type: mongoose.Schema.Types.ObjectId, ref: 'WPLesson' },
  topicKey:           { type: String, required: true },
  level:              { type: String, enum: ['beginner', 'elementary', 'intermediate', 'advanced'], required: true },
  type:               { type: String, enum: ['translation', 'rearrange', 'fill_blank', 'expand', 'combine'], required: true },
  grammarPoint:       { type: String },
  instruction:        { type: String },
  question:           { type: String, required: true },
  hints:              [String],
  sampleAnswer:       { type: String, required: true },
  alternativeAnswers: [String],
  explanation:        { type: String },
  tags:               [String],
  // type-specific fields
  baseWords:  [String],
  options:    [String],
  blankAnswer: String,
  sentences:  [String],
  connector:  String,
  baseText:   String,
  difficulty: { type: Number, default: 1 },
  orderIndex: { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true }
}, { timestamps: true });

wpExerciseSchema.index({ topicKey: 1, level: 1, type: 1 });

module.exports = mongoose.model('WPExercise', wpExerciseSchema);
