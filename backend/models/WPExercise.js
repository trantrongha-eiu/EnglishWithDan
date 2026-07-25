const mongoose = require('mongoose');

// One of three overlapping-looking "sentence exercise" systems (the other
// two: Task1Exercise.js, Task2Topic.js's questions subschema) — `type`
// values (fill_blank/rearrange/translation/...) intentionally overlap
// across all three since that's just question FORMAT, not what determines
// which system a new exercise belongs in. This one is for general
// sentence-writing skills NOT tied to a specific IELTS Task — see
// docs/EXERCISE_SYSTEMS.md for the full placement rule + examples.
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
