/**
 * backend/models/ListeningSection.js
 * Bài lẻ Listening – mỗi section là một document độc lập với audio riêng
 */
const mongoose = require('mongoose');

const LSQuestionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  type: {
    type: String,
    enum: ['multiple-choice', 'fill-blank', 'sentence-completion', 'matching',
           'map-labelling', 'checkbox', 'multi-answer-group', 'matching-info'],
    required: true
  },
  questionText:  { type: String, required: true },
  options:       [String],
  checkboxCount: { type: Number, default: 2 },
  wordBank:      [String],
  imageUrl:      { type: String, default: '' },
  correctAnswer: { type: String, required: true },
  explanation:   { type: String, default: '' },
});

const LSGroupSchema = new mongoose.Schema({
  groupType: {
    type: String,
    enum: ['table', 'note-form', 'bullet-list', 'plain', 'map',
           'matching-options', 'summary-completion', 'sentence-endings', 'drag-drop'],
    default: 'plain'
  },
  groupTitle:  { type: String, default: '' },
  instruction: { type: String, default: '' },
  tableConfig: { headers: [String], rows: [[String]] },
  noteConfig:  { title: { type: String, default: '' }, lines: [String] },
  bulletConfig:{ items: [String] },
  imageUrl:    { type: String, default: '' },
  matchingOptions:        [String],
  matchingReuseAllowed:   { type: Boolean, default: false },
  interchangeableAnswers: { type: Boolean, default: false },
  summaryConfig: {
    text:     { type: String, default: '' },
    wordBank: [{ letter: String, word: String }]
  },
  endingsConfig: {
    endings: [{ letter: String, text: String }]
  },
  dragDropConfig: {
    text:  { type: String, default: '' },
    words: [String]
  },
  questions: [LSQuestionSchema],
});

const ListeningSectionSchema = new mongoose.Schema({
  partNumber:    { type: Number, required: true, enum: [1, 2, 3, 4] },
  title:         { type: String, required: true },
  description:   { type: String, default: '' },
  audioUrl:      { type: String, default: '' },
  audioFileName: { type: String, default: '' },
  audioDuration: { type: Number, default: 0 },
  transcript:    { type: String, default: '' },
  questionRange: { start: Number, end: Number },
  questionGroups:  [LSGroupSchema],
  isActive:        { type: Boolean, default: true },
  isActualTest:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ListeningSection', ListeningSectionSchema);
