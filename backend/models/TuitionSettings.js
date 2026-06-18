const mongoose = require('mongoose');

// Singleton document — only one row ever exists
const TuitionSettingsSchema = new mongoose.Schema({
  _singleton:     { type: String, default: 'main', unique: true },
  bankName:       { type: String, default: '' },
  bankAccount:    { type: String, default: '' },
  accountName:    { type: String, default: '' },
  qrImageUrl:     { type: String, default: '' },
  qrImagePublicId:{ type: String, default: '' },
  defaultMonthlyFee: { type: Number, default: 0 },
  paymentNote:    { type: String, default: '' },
  autoRemindEnabled:  { type: Boolean, default: false },
  autoRemindDay:      { type: Number,  default: 10 },   // ngày trong tháng (1-31)
  autoRemindEndMonth: { type: Number,  default: null },  // tháng cuối (1-12)
  autoRemindEndYear:  { type: Number,  default: null },  // năm cuối
}, { timestamps: true });

TuitionSettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ _singleton: 'main' });
  if (!doc) doc = await this.create({ _singleton: 'main' });
  return doc;
};

module.exports = mongoose.model('TuitionSettings', TuitionSettingsSchema);
