const mongoose = require('mongoose');

const task2TemplateAttemptSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  templateType: { type: String },
  templateName: { type: String },
  totalItems:   { type: Number, default: 0 },
  correctItems: { type: Number, default: 0 },
  createdAt:    { type: Date, default: Date.now }
});

// Auto-delete after 30 days
task2TemplateAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Task2TemplateAttempt', task2TemplateAttemptSchema);
