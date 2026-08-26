const mongoose = require('mongoose');

// `questionSchema` below is one of three overlapping-looking "sentence
// exercise" systems (the other two: WPExercise.js, Task1Exercise.js) —
// `type` values intentionally overlap across all three since that's just
// question FORMAT. These questions are specifically tied to ONE Task 2
// essay topic (always nested under a Task2Topic doc) — see
// docs/EXERCISE_SYSTEMS.md for the full placement rule + examples.
const questionSchema = new mongoose.Schema({
  questionId:       { type: String },
  level:            { type: String, enum: ['beginner', 'elementary', 'intermediate'], required: true },
  type:             { type: String, enum: ['essay_type_recognition', 'fill_blank', 'rearrange', 'translation', 'error_correction', 'topic_sentence', 'short_writing', 'paraphrase'], required: true },
  questionText:     { type: String, required: true },
  options:          [{ type: String }],
  baseWords:        [{ type: String }],
  correctAnswer:    { type: String },
  explanationVi:    { type: String },
  explanationEn:    { type: String },
  modelAnswer:      { type: String },
  fallbackKeywords:   [{ type: String }],
  sentenceStructure:  { type: String },
  orderIndex:         { type: Number, default: 0 },
  isActive:           { type: Boolean, default: true }
}, { _id: true });

const vocabSchema = new mongoose.Schema({
  term:         { type: String, required: true },
  definitionVi: { type: String },
  example:      { type: String }
}, { _id: false });

const task2TopicSchema = new mongoose.Schema({
  week:              { type: Number, required: true, min: 1, max: 12 },
  block:             { type: String, required: true },
  topicName:         { type: String, required: true },
  topicEmoji:        { type: String, default: '📝' },
  essayType:         { type: String, enum: ['advantages_disadvantages', 'cause_effect', 'cause_solution', 'effect_solution', 'agree_disagree', 'discuss_both_views', 'positive_or_negative_development'], required: true },
  prompt:            { type: String, required: true },
  hintAdvantages:    [{ type: String }],
  hintDisadvantages: [{ type: String }],
  questions:         [questionSchema],
  vocabularyList:    [vocabSchema],
  orderIndex:        { type: Number, default: 0 },
  isActive:          { type: Boolean, default: true }
}, { timestamps: true });

// Matches listTopicsForWeek()/getExam()'s hot-path query+sort shape
// (filter isActive [+week], sort orderIndex).
task2TopicSchema.index({ isActive: 1, week: 1, orderIndex: 1 });

module.exports = mongoose.model('Task2Topic', task2TopicSchema);
