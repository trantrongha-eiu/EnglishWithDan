const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  type: {
    type: String,
    enum: [
      'true-false-ng',
      'multiple-choice',
      'fill-blank',
      'sentence-completion',
      'matching-headings',
      'matching-info',
      'checkbox',
      'map-labelling'
    ],
    required: true
  },
  questionText:   { type: String, required: true },
  options:        [String],
  checkboxCount:  { type: Number, default: 2 },
  wordBank:       [String],
  correctAnswer:  { type: String, required: true },
  explanation:    { type: String, default: '' },
  paragraphLabels:[String],
  imageUrl:       { type: String, default: '' }
});

// ── Question Group ────────────────────────────────────────────────────────────
// Một group = một khối câu hỏi có cùng instruction và layout
// VD: "Questions 1-5: True/False/NG", "Questions 6-10: Fill in the table"
const QuestionGroupSchema = new mongoose.Schema({
  groupType: {
    type: String,
    enum: [
      'plain',              // Câu hỏi thường (radio/fill), không khung đặc biệt
      'table',              // Bảng có header, ô dùng __Qn__ placeholder
      'note-form',          // Khung ghi chú/note với các dòng
      'bullet-list',        // Danh sách bullet
      'map',                // Map/diagram labelling với ảnh chung
      'matching-options',   // Matching features/people: list A-G + câu hỏi chọn letter
      'matching-headings',  // Matching headings: list i,ii,iii + đoạn A,B,C
      'summary-completion', // Summary + word bank A-J (kéo thả)
      'sentence-endings'    // Sentence endings A-H (kéo thả)
    ],
    default: 'plain'
  },

  // Tiêu đề nhóm (VD: "Questions 1-5", "Reading Passage 3 has six sections, A–F")
  groupTitle: { type: String, default: '' },

  // Hướng dẫn (VD: "Choose ONE WORD ONLY from the passage for each answer")
  instruction: { type: String, default: '' },

  // ── table config ──
  tableConfig: {
    headers: [String],
    rows:    [[String]]
  },

  // ── note-form config ──
  noteConfig: {
    title: { type: String, default: '' },
    lines: [String]
  },

  // ── bullet-list config ──
  bulletConfig: {
    items: [String]
  },

  // ── map config ──
  imageUrl: { type: String, default: '' },

  // ── matching-options config ──
  // Danh sách options hiển thị bên dưới (VD: A. Shaping... B. Causes...)
  matchingOptions: [String],

  // Có cho dùng lại letter không (NB: You may use any letter more than once)
  matchingReuseAllowed: { type: Boolean, default: false },

  // Hoán đổi thứ tự: các câu trong nhóm có thể đổi đáp án cho nhau (VD: Q23+Q24 "Choose TWO letters")
  interchangeableAnswers: { type: Boolean, default: false },

  // ── matching-headings config ──
  // Danh sách tiêu đề (i. text, ii. text, iii. text...)
  headingsConfig: {
    headings: [{ numeral: String, text: String }]
  },

  // ── summary-completion config ──
  // Đoạn tóm tắt có chỗ trống __Qn__ + word bank A-J
  summaryConfig: {
    text:     { type: String, default: '' },
    wordBank: [{ letter: String, word: String }]
  },

  // ── sentence-endings config ──
  // Danh sách phần kết câu A-H để học sinh ghép
  endingsConfig: {
    endings: [{ letter: String, text: String }]
  },

  questions: [QuestionSchema]
});

const PassageSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  category: { type: String, enum: ['passage1','passage2','passage3'], required: true },
  content:  { type: String, required: true },

  // Mảng các question groups (thay thế questions[] phẳng)
  questionGroups: [QuestionGroupSchema],

  // Giữ lại questions[] để tương thích ngược (có thể để trống nếu dùng groups)
  questions: [QuestionSchema],

  questionRange: {
    start: { type: Number, required: true },
    end:   { type: Number, required: true }
  },

  difficulty: { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  tags:       [String],
  isActive:   { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Passage', PassageSchema);