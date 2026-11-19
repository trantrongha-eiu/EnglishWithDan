const mongoose = require('mongoose');

// One commission per paid order of a referred user: an approved Premium
// UpgradeRequest (source 'premium') or a TuitionFee marked paid ('tuition').
// {source, sourceId} is unique, so re-marking the same fee paid updates the
// one row instead of paying twice. A fee un-marked paid / deleted flips the
// row to 'cancelled'; it then stops counting toward the referrer's balance.
// No TTL — these are money records.
const AffiliateCommissionSchema = new mongoose.Schema({
  referrerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source:         { type: String, enum: ['premium', 'tuition'], required: true },
  sourceId:       { type: mongoose.Schema.Types.ObjectId, required: true },
  // What the referred user paid, VND
  baseAmount:     { type: Number, required: true, min: 0 },
  // AffiliateSettings.percent at the time it was earned
  percent:        { type: Number, required: true, min: 0, max: 100 },
  amount:         { type: Number, required: true, min: 0 }, // VND, rounded
  description:    { type: String, default: '' },
  status:         { type: String, enum: ['earned', 'cancelled'], default: 'earned' },
  cancelReason:   { type: String, default: '' },
  cancelledAt:    { type: Date, default: null },
}, { timestamps: true });

AffiliateCommissionSchema.index({ source: 1, sourceId: 1 }, { unique: true });
AffiliateCommissionSchema.index({ referrerId: 1, createdAt: -1 });
AffiliateCommissionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('AffiliateCommission', AffiliateCommissionSchema);
