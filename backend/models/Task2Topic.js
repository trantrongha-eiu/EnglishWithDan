const mongoose = require('mongoose');

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
  fallbackKeywords: [{ type: String }],
  orderIndex:       { type: Number, default: 0 }
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
  essayType:         { type: String, enum: ['advantages_disadvantages', 'cause_effect', 'cause_solution', 'effect_solution', 'agree_disagree', 'discuss_both_views'], required: true },
  prompt:            { type: String, required: true },
  hintAdvantages:    [{ type: String }],
  hintDisadvantages: [{ type: String }],
  questions:         [questionSchema],
  vocabularyList:    [vocabSchema],
  orderIndex:        { type: Number, default: 0 },
  isActive:          { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Task2Topic', task2TopicSchema);
