const mongoose = require('mongoose');

// Một dòng tổng hợp duy nhất mỗi (userId, lessonId) — không log từng lần
// làm bài riêng lẻ. Mỗi lần học sinh nộp quiz/practice của bài học, service
// UPSERT vào đúng doc này: cộng attemptCount, cập nhật bestScore nếu cao
// hơn, ghi đè score/timeSpent của lần gần nhất. Cùng pattern với
// VocabularyLessonAttempt.js.
const EssentialGrammarAttemptSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId:     { type: mongoose.Schema.Types.ObjectId, ref: 'EssentialGrammarLesson', required: true },
  score:        { type: Number, default: 0 },   // % đúng của lần gần nhất
  completed:    { type: Boolean, default: false },
  bestScore:    { type: Number, default: 0 },
  attemptCount: { type: Number, default: 0 },
  lastAttempt:  { type: Date, default: null },
  timeSpent:    { type: Number, default: 0 },   // giây, cộng dồn mọi lần làm
}, { timestamps: true });

EssentialGrammarAttemptSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
// Admin "số học sinh hoàn thành" — đếm theo lessonId + completed.
EssentialGrammarAttemptSchema.index({ lessonId: 1, completed: 1 });

module.exports = mongoose.model('EssentialGrammarAttempt', EssentialGrammarAttemptSchema);
