const mongoose = require('mongoose');
const guardAgainstMassDelete = require('../utils/guardAgainstMassDelete');

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
  // Cụm collocation phổ biến của từ — string đơn giản (chỉ phrase, không kèm
  // nghĩa/ví dụ riêng), cùng quy ước với VocabularyLesson's LessonWordSchema.
  // Nguồn: dictionary popup's Collocations tab (js/shared/dictionary-lookup.js
  // -> GET /api/dictionary/:word/collocations) khi lưu từ, hoặc carry-over từ
  // VocabularyLesson khi "Lưu tất cả vào sổ".
  collocations:[{ type: String }],
  savedAt:     { type: Date, default: Date.now },
  wrongCount:  { type: Number, default: 0 },     // số lần trả lời sai tích lũy
  // Learning evidence: số lần trả lời ĐÚNG tích lũy qua recordPracticeResult
  // (vocabBookService) — riêng biệt với srsBox (mức Leitner). Một câu đúng
  // không đồng nghĩa "đã thuộc"; correctCount cho phép phân biệt "mới đúng
  // 1 lần" với "đã đúng nhiều lần liên tiếp" khi cần, dù status hiện tại
  // được suy ra trực tiếp từ srsBox (xem statusFromBox()).
  correctCount:{ type: Number, default: 0 },
  // Spaced repetition (Leitner box, 6 mức 0-5 — xem vocabBookService.computeSrs
  // cho công thức). nextReviewAt=null nghĩa là "chưa từng ôn, due ngay".
  srsBox:         { type: Number, default: 0 },
  nextReviewAt:   { type: Date, default: null },
  lastReviewedAt: { type: Date, default: null },
  // Graded-practice-only evidence for class homework "vocab_goal" items
  // (services/vocabGoalService.js). Unlike lastReviewedAt/srsBox — which the
  // manual status dropdown (updateWord) ALSO moves — these are written ONLY
  // by recordPracticeResult, so a student can't tick a homework quota done
  // by clicking "đã thuộc" instead of actually answering a quiz.
  lastPracticedAt:     { type: Date, default: null },
  lastPracticeCorrect: { type: Boolean, default: null }
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
  // 1..5 for the default books ("Sổ 1".."Sổ 5", utils/defaultVocabBooks.js),
  // null for a student's own books. Homework vocab_goal items target a slot.
  // Legacy defaults without one get it from ensureDefaultBooks on next list.
  defaultSlot: { type: Number, min: 1, max: 5, default: null },
  sortOrder:{ type: Number, default: 0 }
}, { timestamps: true });

// Every book/word CRUD op filters by userId (see services/vocabBookService.js) —
// was previously unindexed, forcing a full collection scan per request.
VocabBookSchema.index({ userId: 1 });
// One book per default slot per student — also makes a concurrent
// ensureDefaultBooks restore of the same missing slot fail fast (E11000,
// ignored) instead of creating a duplicate "Sổ 3".
VocabBookSchema.index(
  { userId: 1, defaultSlot: 1 },
  { unique: true, partialFilterExpression: { defaultSlot: { $type: 'number' } } }
);

VocabBookSchema.plugin(guardAgainstMassDelete);

module.exports = mongoose.model('VocabBook', VocabBookSchema);