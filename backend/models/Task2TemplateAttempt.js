const mongoose = require('mongoose');

const task2TemplateAttemptSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  templateType: { type: String },
  templateName: { type: String },
  totalItems:   { type: Number, default: 0 },
  correctItems: { type: Number, default: 0 },
  // Optional — absent on every attempt saved before the memorization-modes
  // feature. Defaults to 'cloze' so old rows and old callers (which never
  // send this field) keep meaning exactly what they always meant.
  mode:         { type: String, enum: ['cloze', 'translation', 'chunks', 'build', 'dictation'], default: 'cloze' },
  createdAt:    { type: Date, default: Date.now }
});

// Auto-delete after 30 days
task2TemplateAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// getHistory() filters by userId sorted by recency — previously unindexed.
task2TemplateAttemptSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Task2TemplateAttempt', task2TemplateAttemptSchema);
