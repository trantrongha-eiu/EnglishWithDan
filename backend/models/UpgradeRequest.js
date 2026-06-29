const mongoose = require('mongoose');

const UpgradeRequestSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  months:   { type: Number, enum: [1, 3, 6, 12, 36], required: true },
  amount:   { type: Number, required: true },
  status:   { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  note:     { type: String, default: '' },
  adminNote:{ type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('UpgradeRequest', UpgradeRequestSchema);
