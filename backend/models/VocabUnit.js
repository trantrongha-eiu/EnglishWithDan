const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
  word:       { type: String, required: true },
  meaning:    { type: String, required: true },   // nghĩa tiếng Việt
  example:    { type: String, default: '' },       // ví dụ
  audioUrl:   { type: String, default: '' },       // URL audio nếu có
  phonetic:   { type: String, default: '' },       // /kəˈmjuːt/
  partOfSpeech:{ type: String, default: '' },      // verb, noun, adj…
  level:      { type: String, default: 'B1' },     // A1 A2 B1 B2 C1
  difficulty: { type: Number, default: 1 }         // 1–5
}, { _id: false });

const VocabUnitSchema = new mongoose.Schema({
  unitNumber: { type: Number, required: true, unique: true },
  title:      { type: String, required: true },
  description:{ type: String, default: '' },
  level:      { type: String, default: 'B1' },
  isActive:   { type: Boolean, default: true },
  words:      [WordSchema]
}, { timestamps: true });

module.exports = mongoose.model('VocabUnit', VocabUnitSchema);