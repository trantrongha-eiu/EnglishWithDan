const mongoose = require('mongoose');

const UpgradeRequestSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  months:   { type: Number, enum: [1, 3, 6, 12, 36], required: true },
  amount:   { type: Number, required: true }, // VND — integer, no decimal subunits
  status:   { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  note:     { type: String, default: '' },
  adminNote:{ type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null }
}, { timestamps: true });

// Enforces "only one pending request per user" atomically at the DB level —
// the route's own findOne-then-save check is a convenience for a friendly
// error message, not the actual guard (two near-simultaneous submits could
// otherwise both pass that check and create duplicate pending requests).
UpgradeRequestSchema.index(
  { userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);
UpgradeRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('UpgradeRequest', UpgradeRequestSchema);
