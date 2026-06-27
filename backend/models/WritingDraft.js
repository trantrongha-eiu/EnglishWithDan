const mongoose = require('mongoose');

const writingDraftSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  taskType:  { type: Number, required: true },
  task:      { type: mongoose.Schema.Types.Mixed, required: true },
  answer:    { type: String, default: '' },
  wordCount: { type: Number, default: 0 },
  seconds:   { type: Number, default: 0 },
  savedAt:   { type: Date, default: Date.now }
});

// Auto-delete 30 ngày sau lần lưu cuối
writingDraftSchema.index({ savedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('WritingDraft', writingDraftSchema);
