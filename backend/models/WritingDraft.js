const mongoose = require('mongoose');

const writingDraftSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskType:  { type: Number, required: true },
  // Duplicated out of `task` (which already carries _id) so drafts can be
  // scoped/queried per task without reaching into the Mixed field — one
  // draft per {userId, taskType, taskId}, up to 2 per {userId, taskType}
  // (enforced in writingService.saveDraft, not at the schema level).
  taskId:    { type: String, required: true },
  task:      { type: mongoose.Schema.Types.Mixed, required: true },
  answer:    { type: String, default: '' },
  wordCount: { type: Number, default: 0 },
  seconds:   { type: Number, default: 0 },
  savedAt:   { type: Date, default: Date.now }
});

writingDraftSchema.index({ userId: 1, taskType: 1, taskId: 1 }, { unique: true });

// Auto-delete 30 ngày sau lần lưu cuối
writingDraftSchema.index({ savedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('WritingDraft', writingDraftSchema);
