const mongoose = require('mongoose');

// Affiliate program settings — singleton, edited from admin /affiliate →
// "Cài đặt". The rates are snapshotted onto each commission when it is
// earned, so changing them never rewrites past commissions.
//
// Since 2026-11-20:
//   • Premium: `premiumPercent` % of every package a referred account buys
//   • Học phí: one reward per referred student, when their first tuition fee
//     is paid — the referrer picks `tuitionCash` VND into the wallet, or
//     `tuitionCredit` VND off their own tuition.
// `percent` is the old single rate (Premium + every tuition fee); only the
// commissions earned before 2026-11-20 carry it.
const AffiliateSettingsSchema = new mongoose.Schema({
  _singleton: { type: String, default: 'main', unique: true },
  enabled:    { type: Boolean, default: true },
  percent:    { type: Number, default: 10, min: 0, max: 100 }, // legacy, unused
  premiumPercent: { type: Number, default: 20, min: 0, max: 100 },
  tuitionCash:    { type: Number, default: 200000, min: 0 },
  tuitionCredit:  { type: Number, default: 300000, min: 0 },
  // Smallest withdrawal a referrer can request, VND
  minPayout:  { type: Number, default: 100000, min: 0 },
}, { timestamps: true });

AffiliateSettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ _singleton: 'main' });
  if (!doc) {
    try { doc = await this.create({ _singleton: 'main' }); }
    catch (err) {
      if (err && err.code === 11000) doc = await this.findOne({ _singleton: 'main' }); // lost a create race
      else throw err;
    }
  }
  return doc;
};

module.exports = mongoose.model('AffiliateSettings', AffiliateSettingsSchema);
