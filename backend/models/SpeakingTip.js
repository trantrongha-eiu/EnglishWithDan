const mongoose = require('mongoose');

// Speaking strategy articles ("Speaking Tips") shown on the Speaking
// page's own screen (opened from the home screen, alongside "Tài liệu"),
// same pattern as ReadingTip/ListeningTip/WritingTip — see
// frontend/js/speaking-tips.js. Own model/collection like the other three.
const blockSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['overview', 'steps', 'example', 'list', 'callout', 'table', 'summary']
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

const speakingTipSchema = new mongoose.Schema({
  category:   { type: String, required: true },
  lessonKey:  { type: String, required: true },
  title:      { type: String, required: true },
  icon:       { type: String, default: '🎙️' },
  summary:    { type: String, default: '' },
  blocks:     [blockSchema],
  orderIndex: { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true }
}, { timestamps: true });

speakingTipSchema.index({ category: 1, lessonKey: 1 }, { unique: true });
speakingTipSchema.index({ isActive: 1, orderIndex: 1 });

module.exports = mongoose.model('SpeakingTip', speakingTipSchema);
