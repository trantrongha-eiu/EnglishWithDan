const mongoose = require('mongoose');

// Reading strategy articles ("Reading Tips") shown on the Reading page,
// browsable the same way Essential Grammar lessons are (collapsible
// category sidebar + click-through content panel) — see
// frontend/js/reading-tips.js. Unlike Essential Grammar, this is reference
// material with no quiz/scoring, so the block types here are shaped for
// strategy write-ups (steps, worked examples, callouts, tables) rather than
// grammar-drill content — no shared schema with EssentialGrammarLesson.
const blockSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['overview', 'steps', 'example', 'list', 'callout', 'table', 'summary']
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

const readingTipSchema = new mongoose.Schema({
  category:   { type: String, required: true },
  lessonKey:  { type: String, required: true },
  title:      { type: String, required: true },
  icon:       { type: String, default: '📖' },
  summary:    { type: String, default: '' },
  blocks:     [blockSchema],
  orderIndex: { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true }
}, { timestamps: true });

readingTipSchema.index({ category: 1, lessonKey: 1 }, { unique: true });
readingTipSchema.index({ isActive: 1, orderIndex: 1 });

module.exports = mongoose.model('ReadingTip', readingTipSchema);
