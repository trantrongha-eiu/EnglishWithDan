const mongoose = require('mongoose');

// "🚩 Báo lỗi câu" on Luyện Dictation — singleton, edited on admin
// /dictation-reports → "Cấu hình": turn the button on/off for students and
// edit the list of reasons they pick from, thank-you message on/off. A report keeps the reason's
// label as it was, so renaming a reason never rewrites old reports.
const DEFAULT_REASONS = [
  { key: 'wrong_text', label: 'Đáp án sai chữ / sai chính tả' },
  { key: 'mismatch',   label: 'Audio không khớp với câu đáp án' },
  { key: 'cut_audio',  label: 'Audio bị cắt mất đầu / cuối câu' },
  { key: 'no_audio',   label: 'Không nghe được / audio lỗi' },
  { key: 'wrong_vi',   label: 'Nghĩa tiếng Việt sai' },
  { key: 'other',      label: 'Lỗi khác' },
];

const ReasonSchema = new mongoose.Schema({
  key:   { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true, maxlength: 120 },
}, { _id: false });

const DictationReportSettingsSchema = new mongoose.Schema({
  _singleton: { type: String, default: 'main', unique: true },
  enabled:    { type: Boolean, default: true },
  // Fixing a sentence sends each student who reported it a thank-you
  // message (Hộp thư)
  thankOnFix: { type: Boolean, default: true },
  reasons:    { type: [ReasonSchema], default: () => DEFAULT_REASONS.map(r => ({ ...r })) },
}, { timestamps: true });

DictationReportSettingsSchema.statics.getSingleton = async function () {
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

const DictationReportSettings = mongoose.model('DictationReportSettings', DictationReportSettingsSchema);
DictationReportSettings.DEFAULT_REASONS = DEFAULT_REASONS;
module.exports = DictationReportSettings;
