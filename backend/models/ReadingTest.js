const mongoose = require('mongoose');

/**
 * ReadingTest chỉ lưu metadata của bộ đề.
 * 3 passages được random khi user bắt đầu làm (trong route /start).
 */
const ReadingTestSchema = new mongoose.Schema({
  name:       { type: String, required: true }, // "Orange Test 20"
  seriesName: { type: String, default: '' },    // "Orange Test"
  testNumber: { type: Number, required: true }, // 20
  isActive:   { type: Boolean, default: true }
}, { timestamps: true });

ReadingTestSchema.index({ isActive: 1, testNumber: -1 });

module.exports = mongoose.model('ReadingTest', ReadingTestSchema);