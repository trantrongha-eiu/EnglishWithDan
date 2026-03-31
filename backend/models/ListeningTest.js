const mongoose = require('mongoose');

/**
 * Listening question types:
 * - multiple-choice      : A, B, C, D
 * - fill-blank           : text input
 * - sentence-completion  : drag-and-drop (word bank)
 * - matching             : match statement → option letter
 * - map-labelling        : fill blank for map/diagram labels
 * - checkbox             : chọn nhiều (chọn N trong M đáp án)
 */
const ListeningQuestionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  type: {
    type: String,
    enum: [
      'multiple-choice',
      'fill-blank',
      'sentence-completion',
      'matching',
      'map-labelling',
      'checkbox'
    ],
    required: true
  },
  questionText: { type: String, required: true },

  // multiple-choice / checkbox
  options: [String],

  // checkbox: số đáp án cần chọn (VD: 2 trong 5)
  checkboxCount: { type: Number, default: 1 },

  // sentence-completion / matching
  wordBank: [String],

  // Đáp án đúng
  // - string cho single answer
  // - JSON stringified array cho checkbox (VD: '["A","C"]')
  correctAnswer: { type: String, required: true },

  explanation: { type: String, default: '' },

  // Thời điểm trong audio liên quan (giây), dùng để scroll khi review
  audioTimestamp: { type: Number, default: null }
});

// Mỗi section = 1 phần nghe (Part 1, Part 2, Part 3, Part 4)
const ListeningSectionSchema = new mongoose.Schema({
  partNumber: {
    type: Number,
    enum: [1, 2, 3, 4],
    required: true
  },

  title: { type: String, required: true },

  // Mô tả context (VD: "A conversation between two students about...")
  description: { type: String, default: '' },

  questions: [ListeningQuestionSchema],

  questionRange: {
    start: { type: Number, required: true },
    end:   { type: Number, required: true }
  }
});

const ListeningTestSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  testNumber: { type: Number, required: true },
  seriesName: { type: String, default: '' },

  // URL audio (Cloudinary, S3, hoặc bất kỳ CDN nào)
  audioUrl: { type: String, default: '' },

  // Tên file gốc (hiển thị cho admin)
  audioFileName: { type: String, default: '' },

  // Thời lượng audio (giây) – lưu để hiển thị
  audioDuration: { type: Number, default: 0 },

  // Transcript toàn bộ bài nghe (plain text, dùng cho word-sync)
  transcript: { type: String, default: '' },

  // Word-level timestamps: [{ word, start, end }]
  // Mảng này được admin import (từ Whisper JSON hoặc nhập tay)
  wordTimestamps: [{
    word:  { type: String },
    start: { type: Number }, // giây
    end:   { type: Number }
  }],

  sections: [ListeningSectionSchema],

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ListeningTest', ListeningTestSchema);