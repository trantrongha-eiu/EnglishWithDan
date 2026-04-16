const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
  // ── Loại mục từ ─────────────────────────────────────────────────
  // 'vocab'      : từ vựng thông thường (mặc định)
  // 'paraphrase' : cặp paraphrase dùng cho luyện IELTS
  type:        { type: String, enum: ['vocab', 'paraphrase'], default: 'vocab' },

  // ── Trường dùng chung ────────────────────────────────────────────
  word:        { type: String, required: true },  // từ / "Text trong bài"
  meaning:     { type: String, default: '' },      // nghĩa tiếng Việt

  // ── Chỉ dùng cho type: 'vocab' ──────────────────────────────────
  example:     { type: String, default: '' },      // ví dụ câu
  audioUrl:    { type: String, default: '' },      // URL audio
  phonetic:    { type: String, default: '' },      // /fəˈnɛtɪk/
  partOfSpeech:{ type: String, default: '' },      // verb, noun, adj…
  level:       { type: String, default: 'B1' },    // A1 A2 B1 B2 C1
  difficulty:  { type: Number, default: 1 },       // 1–5

  // ── Chỉ dùng cho type: 'paraphrase' ────────────────────────────
  paraphrase:  { type: String, default: '' },      // Paraphrase trong câu hỏi
  explanation: { type: String, default: '' },      // Giải thích chi tiết
}, { _id: false });

const VocabUnitSchema = new mongoose.Schema({
  unitNumber: { type: Number, required: true, unique: true },
  sortOrder:  { type: Number, default: 0 },   // dùng để kéo thả đổi vị trí
  title:      { type: String, required: true },
  description:{ type: String, default: '' },
  level:      { type: String, default: 'B1' },
  isActive:   { type: Boolean, default: true },
  words:      [WordSchema]
}, { timestamps: true });

module.exports = mongoose.model('VocabUnit', VocabUnitSchema);