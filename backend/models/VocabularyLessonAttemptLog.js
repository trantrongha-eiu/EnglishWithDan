const mongoose = require('mongoose');

// One document per Finish-Quiz submission — distinct from
// VocabularyLessonAttempt (a single aggregate row per user+lesson used for
// Best Score/Attempt Count). This log exists purely to power history views:
// the student's own "past attempts" list, and admin analytics (per-student
// breakdown, per-student history, class average, most-missed words). Never
// read on the hot path (Results tab's Best Score/Attempt Count still come
// from the aggregate row) — only fetched when a history/analytics view is
// explicitly opened.
const VocabularyLessonAttemptLogSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId:   { type: mongoose.Schema.Types.ObjectId, ref: 'VocabularyLesson', required: true },
  score:      { type: Number, required: true },
  correct:    { type: Number, required: true },
  wrong:      { type: Number, required: true },
  total:      { type: Number, required: true },
  timeSpent:  { type: Number, default: 0 },   // giây — CHỈ của lần này, không cộng dồn
  wrongWords: [{ type: String }],             // các từ trả lời sai lần này — phục vụ "câu sai nhiều"
}, { timestamps: true });

// Học sinh xem lịch sử của chính mình cho 1 lesson; admin xem lịch sử của
// 1 học sinh cho 1 lesson — cùng một truy vấn shape, sort theo mới nhất.
VocabularyLessonAttemptLogSchema.index({ userId: 1, lessonId: 1, createdAt: -1 });
// Admin: hoạt động gần đây / breakdown toàn lesson, và nguồn cho "câu sai
// nhiều" (aggregate theo lessonId, không quan tâm ai làm).
VocabularyLessonAttemptLogSchema.index({ lessonId: 1, createdAt: -1 });

module.exports = mongoose.model('VocabularyLessonAttemptLog', VocabularyLessonAttemptLogSchema);
