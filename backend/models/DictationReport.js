/**
 * backend/models/DictationReport.js
 * A student's "🚩 Báo lỗi câu này" on Luyện Dictation (/app/dictation): one
 * sentence of a Listening section's dictationSentences, or one item of a
 * DictationDrill, that they think is wrong (text ≠ audio, clip cut off…).
 * Handled on admin /dictation-reports, where the sentence can be fixed in
 * place (services/dictationReportService.js).
 *
 * The sentence is snapshotted at report time (`sentenceText`, `answer`,
 * `start`, `end`) so the admin still sees what the student saw after the
 * sentence has been edited. One open report per student per sentence: a
 * second report of the same sentence updates the first.
 *
 * Content QA, not practice history: open reports are kept until handled;
 * handled ones (resolvedAt set) expire after 90 days like the rest.
 */
const mongoose = require('mongoose');

const DictationReportSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, default: '' },

  kind:      { type: String, enum: ['section', 'drill'], required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ListeningSection', default: undefined },
  drillId:   { type: mongoose.Schema.Types.ObjectId, ref: 'DictationDrill', default: undefined },
  drillSlug: { type: String, default: undefined },
  lessonTitle:   { type: String, default: '' },
  sentenceIndex: { type: Number, required: true, min: 0 },

  // What the sentence was when it was reported
  sentenceText: { type: String, default: '' },
  answer:       { type: String, default: '' },
  start:        { type: Number, default: 0 },
  end:          { type: Number, default: 0 },

  reason:      { type: String, required: true },   // DictationReportSettings reason key
  reasonLabel: { type: String, default: '' },
  note:        { type: String, default: '', maxlength: 500 },
  typedText:   { type: String, default: '', maxlength: 500 }, // what the student had typed

  // The sentence was removed from the lesson on admin (sentenceIndex then
  // no longer points at it)
  sentenceRemoved: { type: Boolean, default: undefined },

  status:     { type: String, enum: ['open', 'fixed', 'dismissed'], default: 'open' },
  adminNote:  { type: String, default: '', maxlength: 500 },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

DictationReportSchema.index({ status: 1, createdAt: -1 });
DictationReportSchema.index({ sectionId: 1, sentenceIndex: 1 });
DictationReportSchema.index({ drillId: 1, sentenceIndex: 1 });
DictationReportSchema.index({ userId: 1, status: 1 });
// Handled reports go after 3 months; open ones (resolvedAt null) never expire.
DictationReportSchema.index({ resolvedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('DictationReport', DictationReportSchema);
