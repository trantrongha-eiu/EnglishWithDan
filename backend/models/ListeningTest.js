const mongoose = require('mongoose');

// ── Individual question (unchanged) ──────────────────────────────────────────
const ListeningQuestionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  type: {
    type: String,
    // 'checkbox' giữ lại để backward-compatible với data cũ; dùng 'multi-answer-group' cho data mới
    enum: ['multiple-choice', 'fill-blank', 'sentence-completion', 'matching', 'map-labelling', 'checkbox', 'multi-answer-group', 'matching-info'],
    required: true
  },
  questionText:  { type: String, required: true },
  options:       [String],
  // checkboxCount: số đáp án cần chọn trong cluster (2, 3, 4...)
  // Dùng cho cả 'checkbox' (legacy) và 'multi-answer-group'
  checkboxCount: { type: Number, default: 2 },
  wordBank:      [String],
  imageUrl:      { type: String, default: '' },
  correctAnswer: { type: String, required: true },
  explanation:   { type: String, default: '' },
  audioTimestamp:{ type: Number, default: null }
});

// ── Question Group ────────────────────────────────────────────────────────────
// Một group = một khung visual chứa nhiều câu hỏi liên quan
// VD: bảng 4 hàng (Q1-Q4), khung bullet list (Q5-Q7), hay plain text (Q8-Q10)
const QuestionGroupSchema = new mongoose.Schema({
  groupType: {
    type: String,
    enum: ['table', 'note-form', 'bullet-list', 'plain', 'map', 'matching-options', 'summary-completion', 'sentence-endings'],
    required: true,
    default: 'plain'
  },

  // Hướng dẫn hiển thị trên đầu group
  // VD: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer."
  instruction: { type: String, default: '' },

  // ── Cấu hình cho groupType = 'table' ──────────────────────────────────────
  // headers: ['Apartments', 'Parking', 'Additional information']
  // rows: mảng các hàng, mỗi hàng là mảng string, ô nào có câu hỏi dùng placeholder '__Q{n}__'
  // VD: ['Rose Garden', 'free parking', 'a large __Q1__']
  tableConfig: {
    headers: [String],
    rows:    [[String]]   // mảng 2 chiều: rows[i][j] = text hoặc '__Q{n}__'
  },

  // ── Cấu hình cho groupType = 'note-form' ──────────────────────────────────
  // title: tiêu đề của note block (VD: "Accommodation details")
  // lines: mảng string, dùng '__Q{n}__' để đánh dấu chỗ trống
  // VD: ['Type of apartment: __Q1__', 'Location: __Q2__ Street']
  noteConfig: {
    title: { type: String, default: '' },
    lines: [String]
  },

  // ── Cấu hình cho groupType = 'bullet-list' ────────────────────────────────
  // items: mảng string, dùng '__Q{n}__' để đánh dấu chỗ trống
  // VD: ['What colour is the bus? __Q5__', 'How long is the trip? __Q6__']
  bulletConfig: {
    items: [String]
  },

  // ── Cấu hình cho groupType = 'map' ────────────────────────────────────────
  imageUrl: { type: String, default: '' },

  // ── Cấu hình cho groupType = 'matching-options' ───────────────────────────
  // matchingOptions: danh sách lựa chọn A→G (VD: ['the museum', 'the library', ...])
  matchingOptions:        [String],
  matchingReuseAllowed:   { type: Boolean, default: false },
  interchangeableAnswers: { type: Boolean, default: false },

  // ── Cấu hình cho groupType = 'summary-completion' ─────────────────────────
  // summaryConfig.text: đoạn văn tóm tắt với placeholder __Q{n}__
  // summaryConfig.wordBank: mảng { letter, word }
  summaryConfig: {
    text:     { type: String, default: '' },
    wordBank: [{ letter: String, word: String }]
  },

  // ── Cấu hình cho groupType = 'sentence-endings' ───────────────────────────
  // endingsConfig.endings: mảng { letter, text } — phần kết câu A→H
  endingsConfig: {
    endings: [{ letter: String, text: String }]
  },

  // Các câu hỏi trong group này
  questions: [ListeningQuestionSchema]
});

// ── Section (Part 1–4) ────────────────────────────────────────────────────────
const ListeningSectionSchema = new mongoose.Schema({
  partNumber: { type: Number, enum: [1, 2, 3, 4], required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  transcript:  { type: String, default: '' },   // Transcript riêng cho từng Part
  questionRange: {
    start: { type: Number, required: true },
    end:   { type: Number, required: true }
  },
  questionGroups: [QuestionGroupSchema]
});

// ── Listening Test ────────────────────────────────────────────────────────────
const ListeningTestSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  testNumber:    { type: Number, required: true },
  seriesName:    { type: String, default: '' },
  audioUrl:      { type: String, default: '' },
  audioFileName: { type: String, default: '' },
  audioDuration: { type: Number, default: 0 },
  sections: [ListeningSectionSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Virtual: tổng số câu (flatten qua groups)
ListeningTestSchema.virtual('totalQuestions').get(function () {
  return this.sections.reduce((sum, s) =>
    sum + s.questionGroups.reduce((gs, g) => gs + g.questions.length, 0), 0);
});

module.exports = mongoose.model('ListeningTest', ListeningTestSchema);