const mongoose = require('mongoose');

// Nội dung từ vựng giáo viên giao theo buổi học — khác với VocabUnit (nội
// dung Cambridge Paraphrase có sẵn) và VocabBook (sổ từ cá nhân học sinh tự
// tạo). Không lưu câu hỏi quiz: quiz được sinh runtime từ words[] mỗi lần
// học sinh vào luyện tập (xem services/vocabularyQuizEngine.js — Phase 5).
//
// Field list cố ý chỉ gồm những field admin thật sự nhập qua "EnglishWithDan
// Lesson Format" (xem services/vocabularyLessonParser.js). Thêm field mới
// (audio, image, synonyms, antonyms, notes...) chỉ cần thêm vào parser +
// schema này, không phải sửa gì khác.
const LessonWordSchema = new mongoose.Schema({
  word:         { type: String, required: true, trim: true },
  meaning:      { type: String, required: true, trim: true },
  ipa:          { type: String, default: '' },
  partOfSpeech: { type: String, default: '' },
  example:      { type: String, default: '' },
  definition:   { type: String, default: '' },
  collocations: [{ type: String }],
  // Đáp án nhiễu cho câu hỏi Multiple Choice — admin tự cung cấp trong lúc
  // paste lesson, server không tự sinh (không gọi AI API).
  distractors:  [{ type: String }],
}, { _id: false });

const DIFFICULTY_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const VocabularyLessonSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  difficulty:  { type: String, enum: DIFFICULTY_LEVELS, default: 'B1' },
  order:       { type: Number, default: 0 },   // thứ tự hiển thị trong Classroom / Today's Lesson
  published:   { type: Boolean, default: false },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  words:       [LessonWordSchema],

  // Auto Backup Import — nguyên văn nội dung "EnglishWithDan Lesson Format"
  // dùng để tạo/cập nhật lesson này lần gần nhất. Cho phép Edit trực tiếp
  // bằng text, dễ debug khi parser đổi, và export lại đúng định dạng gốc.
  // Nếu sau này thêm field mới vào parser (audio=, image=, synonyms=...),
  // lesson cũ vẫn parse lại được từ raw text này mà không mất dữ liệu.
  rawImport:   { type: String, default: '' },
}, { timestamps: true });

// Học sinh: liệt kê bài đã publish, sắp theo order.
VocabularyLessonSchema.index({ published: 1, order: 1 });
// Admin: danh sách bài do 1 giáo viên tạo, mới nhất trước.
VocabularyLessonSchema.index({ createdBy: 1, createdAt: -1 });

VocabularyLessonSchema.statics.DIFFICULTY_LEVELS = DIFFICULTY_LEVELS;

module.exports = mongoose.model('VocabularyLesson', VocabularyLessonSchema);
