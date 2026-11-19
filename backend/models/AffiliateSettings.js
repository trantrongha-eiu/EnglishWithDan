const mongoose = require('mongoose');

// Affiliate program settings — singleton, edited from admin /affiliate →
// "Cài đặt". `percent` is snapshotted onto each commission when it is earned,
// so changing it never rewrites past commissions.
const AffiliateSettingsSchema = new mongoose.Schema({
  _singleton: { type: String, default: 'main', unique: true },
  enabled:    { type: Boolean, default: true },
  percent:    { type: Number, default: 10, min: 0, max: 100 },
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
