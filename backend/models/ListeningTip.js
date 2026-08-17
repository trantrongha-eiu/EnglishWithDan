const mongoose = require('mongoose');

// Listening strategy articles ("Listening Tips") shown on the Listening
// page, browsable the same way as ReadingTip/Essential Grammar lessons —
// see frontend/js/listening-tips.js. Identical block shape to ReadingTip
// (reference material, no quiz/scoring) — kept as its own model/collection
// rather than sharing ReadingTip's since the two are managed and browsed
// as fully independent lesson sets, one per skill.
const blockSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['overview', 'steps', 'example', 'list', 'callout', 'table', 'summary']
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

const listeningTipSchema = new mongoose.Schema({
  category:   { type: String, required: true },
  lessonKey:  { type: String, required: true },
  title:      { type: String, required: true },
  icon:       { type: String, default: '🎧' },
  summary:    { type: String, default: '' },
  blocks:     [blockSchema],
  orderIndex: { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true }
}, { timestamps: true });

listeningTipSchema.index({ category: 1, lessonKey: 1 }, { unique: true });
listeningTipSchema.index({ isActive: 1, orderIndex: 1 });

module.exports = mongoose.model('ListeningTip', listeningTipSchema);
