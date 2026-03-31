const mongoose = require('mongoose');

/**
 * Question types supported:
 * - true-false-ng      : True / False / Not Given
 * - multiple-choice    : A, B, C, D
 * - fill-blank         : text input
 * - sentence-completion: drag-and-drop (bank of words)
 * - matching-headings  : drag heading → paragraph
 * - matching-info      : match statement → section letter
 * - checkbox           : chọn nhiều đáp án (N trong M)
 * - map-labelling      : điền nhãn vào sơ đồ/hình ảnh (fill-blank kèm image)
 */
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
  questionText: { type: String, required: true },

  // Dùng cho multiple-choice / checkbox
  options: [String],

  // Checkbox: số đáp án cần chọn (VD: chọn 2 trong 5)
  checkboxCount: { type: Number, default: 2 },

  // Dùng cho sentence-completion / matching
  wordBank: [String],

  // Đáp án đúng
  // - string thông thường cho single answer
  // - JSON stringified array cho checkbox: '["A","C"]'
  correctAnswer: { type: String, required: true },

  // Giải thích (chỉ hiện khi review)
  explanation: { type: String, default: '' },

  // Với matching-headings: danh sách paragraph labels (A, B, C…)
  paragraphLabels: [String],

  // Với map-labelling: URL hình ảnh sơ đồ/bản đồ
  // (dùng chung cho cả Reading và Listening)
  imageUrl: { type: String, default: '' }
});

const PassageSchema = new mongoose.Schema({
  title: { type: String, required: true },

  category: {
    type: String,
    enum: ['passage1', 'passage2', 'passage3'],
    required: true
  },

  // Nội dung bài đọc – lưu HTML (giáo viên có thể in đậm, nghiêng…)
  content: { type: String, required: true },

  questions: [QuestionSchema],

  // Phạm vi câu hỏi, ví dụ: { start: 1, end: 13 }
  questionRange: {
    start: { type: Number, required: true },
    end:   { type: Number, required: true }
  },

  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },

  tags: [String],

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Passage', PassageSchema);