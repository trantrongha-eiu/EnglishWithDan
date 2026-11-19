const mongoose = require('mongoose');

// A referrer's withdrawal request. The admin transfers the money by hand,
// then marks it 'paid' (or 'rejected', which returns the amount to the
// balance). Balance = earned commissions − pending/paid payouts.
const AffiliatePayoutSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:      { type: Number, required: true, min: 1 }, // VND
  // Either a scan-to-pay QR or the three typed bank fields (requestPayout
  // checks one of them is there)
  bankName:    { type: String, default: '' },
  bankAccount: { type: String, default: '' },
  accountName: { type: String, default: '' },
  qrImageUrl:  { type: String, default: '' },
  note:        { type: String, default: '' },
  status:      { type: String, enum: ['pending', 'paid', 'rejected'], default: 'pending' },
  adminNote:   { type: String, default: '' },
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt:  { type: Date, default: null },
}, { timestamps: true });

// One pending request per user, enforced by the DB (two quick submits can't
// both reserve the same balance).
AffiliatePayoutSchema.index(
  { userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);
AffiliatePayoutSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('AffiliatePayout', AffiliatePayoutSchema);
