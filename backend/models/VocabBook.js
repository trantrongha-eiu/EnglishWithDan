const mongoose = require('mongoose');

// Mỗi từ được lưu vào sổ
const SavedWordSchema = new mongoose.Schema({
  word:        { type: String, required: true },
  meaning:     { type: String, default: '' },
  example:     { type: String, default: '' },
  phonetic:    { type: String, default: '' },    // /ɪˈstæblɪʃ/
  partOfSpeech:{ type: String, default: '' },    // verb, noun…
  // Trạng thái học
  status: {
    type: String,
    enum: ['chua-thuoc', 'nho-so-so', 'da-thuoc'],
    default: 'chua-thuoc'
  },
  note:        { type: String, default: '' },    // ghi chú cá nhân
  // Nguồn gốc: từ reading hay từ vocab unit
  source:      { type: String, default: '' },    // 'reading' | 'unit-5'
  savedAt:     { type: Date, default: Date.now }
}, { _id: true });

// Mỗi "sổ" = 1 topic/chủ đề
const VocabBookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    required: true
  },
  name:     { type: String, required: true, default: 'Sổ từ vựng' },
  // Màu icon phân biệt sổ (hex)
  color:    { type: String, default: '#e53935' },
  emoji:    { type: String, default: '📘' },
  words:    [SavedWordSchema],
  isDefault:{ type: Boolean, default: false },   // 5 sổ mặc định
  sortOrder:{ type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('VocabBook', VocabBookSchema);