const mongoose = require('mongoose');

// What a referrer earns from a referred account. Two kinds:
//
// • 'percent' — an approved Premium UpgradeRequest (source 'premium'):
//   `percent` % of `baseAmount`. Before 2026-11-20 paid tuition fees
//   (source 'tuition') earned this kind too, one row per fee.
// • 'tuition_flat' — since 2026-11-20, ONE row per referred student, created
//   when their first tuition fee is paid (sourceId = that fee). It waits in
//   'awaiting_choice' until the referrer picks:
//     'cash'   → amount = cashAmount, counts toward the wallet
//     'credit' → amount 0; creditAmount comes off the referrer's own oldest
//                unpaid tuition fee (creditFeeId), or the next one created.
//
// {source, sourceId} is unique, so re-marking the same fee paid updates the
// one row instead of paying twice. A fee un-marked paid / deleted flips the
// row to 'cancelled'; it then stops counting toward the referrer's balance.
// No TTL — these are money records.
const AffiliateCommissionSchema = new mongoose.Schema({
  referrerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source:         { type: String, enum: ['premium', 'tuition'], required: true },
  sourceId:       { type: mongoose.Schema.Types.ObjectId, required: true },
  kind:           { type: String, enum: ['percent', 'tuition_flat'], default: 'percent' },
  // What the referred user paid, VND
  baseAmount:     { type: Number, required: true, min: 0 },
  // The Premium rate at the time it was earned (0 on tuition_flat rows)
  percent:        { type: Number, required: true, min: 0, max: 100 },
  amount:         { type: Number, required: true, min: 0 }, // VND into the wallet, rounded
  description:    { type: String, default: '' },
  status:         { type: String, enum: ['awaiting_choice', 'earned', 'cancelled'], default: 'earned' },
  // tuition_flat only
  rewardChoice:   { type: String, enum: ['cash', 'credit', null], default: null },
  cashAmount:     { type: Number, default: 0, min: 0 },
  creditAmount:   { type: Number, default: 0, min: 0 },
  chosenAt:       { type: Date, default: null },
  creditFeeId:    { type: mongoose.Schema.Types.ObjectId, ref: 'TuitionFee', default: null },
  creditAppliedAt: { type: Date, default: null },
  cancelReason:   { type: String, default: '' },
  cancelledAt:    { type: Date, default: null },
}, { timestamps: true });

AffiliateCommissionSchema.index({ source: 1, sourceId: 1 }, { unique: true });
// One tuition reward per referred student
AffiliateCommissionSchema.index({ referredUserId: 1 }, { unique: true, partialFilterExpression: { kind: 'tuition_flat' } });
AffiliateCommissionSchema.index({ referrerId: 1, createdAt: -1 });
AffiliateCommissionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('AffiliateCommission', AffiliateCommissionSchema);
