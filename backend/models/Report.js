const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporterId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reporterName: { type: String, required: true },
  reportedName: { type: String, required: true },
  reason:       { type: String, required: true, trim: true, maxlength: 500 },
  messageId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  status:       { type: String, enum: ['open', 'resolved'], default: 'open' },
}, { timestamps: true });

// Admin report queue filters/sorts by status then recency.
ReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', ReportSchema);
