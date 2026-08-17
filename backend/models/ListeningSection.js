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
  matchingOptionsTitle:   { type: String, default: '' },
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
  // Sentence-level dictation practice ("chép chính tả từng câu") — one
  // start/end timestamp pair (seconds into audioUrl) per sentence, derived
  // by aligning `transcript` (this section's verified, human-authored
  // text — always what's shown/checked against, never the ASR's own
  // wording) against Groq Whisper's word-level timestamps for the SAME
  // audio. See scripts/bulkAlignListeningDictation.js. Empty until a
  // section has been run through that alignment.
  dictationSentences: [{
    text:  { type: String, required: true },
    start: { type: Number, required: true },
    end:   { type: Number, required: true },
    _id: false,
  }],
  dictationAlignedAt: { type: Date, default: null },
  // Set when a bulk-alignment attempt rejects this section (failed strict
  // validation) or hits a permanent error (e.g. audio file too large for
  // Groq's free-tier 25MB cap) — lets the default bulk run skip it on
  // future passes instead of re-burning quota on a doomed-to-fail-again
  // section every single hour. Cleared automatically on a later success.
  dictationSkippedAt:  { type: Date, default: null },
  dictationSkipReason: { type: String, default: '' },
  // True only for failures no transcript/code fix can ever resolve (e.g.
  // audio file too large for Groq's free-tier 25MB cap) — --include-skipped
  // deliberately excludes these (only --force retries them) so a bulk run
  // doesn't re-attempt the same doomed section every single time, unlike a
  // content-validation rejection which a transcript-cleaning fix might fix.
  dictationSkipPermanent: { type: Boolean, default: false },
}, { timestamps: true });

ListeningSectionSchema.index({ partNumber: 1, isActive: 1 });
ListeningSectionSchema.index({ isActualTest: 1, isActive: 1 });

module.exports = mongoose.model('ListeningSection', ListeningSectionSchema);
