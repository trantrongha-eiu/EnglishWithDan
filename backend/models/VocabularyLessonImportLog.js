const mongoose = require('mongoose');

// Import History — one row per Import/Re-import attempt (success AND
// failure). Deliberately NOT cascade-deleted when its lesson is deleted
// (see vocabularyLessonService.deleteLesson) — the whole point is that an
// admin can recover the raw pasted text even if the lesson it produced is
// long gone, or if the attempt never produced a lesson at all because
// validation failed. title/wordCount are a snapshot taken at import time
// so the history list still means something after the lesson is edited
// or deleted; `lessonId` is kept for the happy path (jump to the current
// lesson) but is not required to still resolve to a document.
const VocabularyLessonImportLogSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rawText:   { type: String, required: true },
  status:    { type: String, enum: ['success', 'failed'], required: true },
  // Named errorMessages, not `errors` — that's a reserved Mongoose
  // schema pathname (collides with the document's built-in validation
  // `.errors` property) and Mongoose warns loudly about it at model load.
  errorMessages: [{ type: String }],
  title:     { type: String, default: null },
  wordCount: { type: Number, default: 0 },
  lessonId:  { type: mongoose.Schema.Types.ObjectId, ref: 'VocabularyLesson', default: null },
}, { timestamps: true });

VocabularyLessonImportLogSchema.index({ createdAt: -1 });
VocabularyLessonImportLogSchema.index({ lessonId: 1 });

module.exports = mongoose.model('VocabularyLessonImportLog', VocabularyLessonImportLogSchema);
