const mongoose = require('mongoose');

// Writing strategy articles ("Writing Tips") shown on the Writing page's
// own screen (opened from the home screen, alongside "Tài liệu mẫu"), same
// pattern as ReadingTip/ListeningTip — see frontend/js/writing-tips.js.
// Own model/collection like the other two Tips features (managed/browsed
// independently per skill) even though the block shape is identical.
const blockSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['overview', 'steps', 'example', 'list', 'callout', 'table', 'summary']
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

const writingTipSchema = new mongoose.Schema({
  category:   { type: String, required: true },
  lessonKey:  { type: String, required: true },
  title:      { type: String, required: true },
  icon:       { type: String, default: '✏️' },
  summary:    { type: String, default: '' },
  blocks:     [blockSchema],
  orderIndex: { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true }
}, { timestamps: true });

writingTipSchema.index({ category: 1, lessonKey: 1 }, { unique: true });
writingTipSchema.index({ isActive: 1, orderIndex: 1 });

module.exports = mongoose.model('WritingTip', writingTipSchema);
