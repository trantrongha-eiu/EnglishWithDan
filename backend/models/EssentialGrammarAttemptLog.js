const mongoose = require('mongoose');

// One document per quiz/practice submission — distinct from
// EssentialGrammarAttempt (a single aggregate row per user+lesson used for
// Best Score/Attempt Count). Exists purely to power history views: the
// student's own "past attempts" list, and admin analytics (per-student
// breakdown, per-student history, most-missed questions). Never read on the
// hot path — only fetched when a history/analytics view is explicitly
// opened. Same pattern as VocabularyLessonAttemptLog.js.
const EssentialGrammarAttemptLogSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId:       { type: mongoose.Schema.Types.ObjectId, ref: 'EssentialGrammarLesson', required: true },
  score:          { type: Number, required: true },
  correct:        { type: Number, required: true },
  wrong:          { type: Number, required: true },
  total:          { type: Number, required: true },
  timeSpent:      { type: Number, default: 0 },   // giây — CHỈ của lần này, không cộng dồn
  wrongQuestions: [{ type: String }],              // câu hỏi trả lời sai lần này — phục vụ "câu sai nhiều"
}, { timestamps: true });

// Học sinh xem lịch sử của chính mình cho 1 lesson; admin xem lịch sử của
// 1 học sinh cho 1 lesson — cùng một truy vấn shape, sort theo mới nhất.
EssentialGrammarAttemptLogSchema.index({ userId: 1, lessonId: 1, createdAt: -1 });
// Admin: hoạt động gần đây / breakdown toàn lesson, và nguồn cho "câu sai
// nhiều" (aggregate theo lessonId, không quan tâm ai làm).
EssentialGrammarAttemptLogSchema.index({ lessonId: 1, createdAt: -1 });
// Retention: auto-delete 3 months after the attempt was logged — student
// practice history isn't kept indefinitely (unlike VocabBook, the personal
// saved-word notebooks, which have no expiry). EssentialGrammarAttempt (the
// Best Score/Attempt Count aggregate row) is untouched — only this log.
EssentialGrammarAttemptLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('EssentialGrammarAttemptLog', EssentialGrammarAttemptLogSchema);
