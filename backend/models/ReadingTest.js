const mongoose = require('mongoose');

/**
 * ReadingTest lưu metadata của bộ đề. Nếu passageIds có đủ 3 phần tử
 * (đúng thứ tự passage1, passage2, passage3), đây là một bộ đề CỐ ĐỊNH —
 * startTest() dùng đúng 3 passage đó thay vì random. Nếu passageIds rỗng/
 * thiếu, hành vi cũ vẫn giữ nguyên: 3 passage được random mỗi lần bắt đầu
 * (xem readingService.js startTest()).
 */
const ReadingTestSchema = new mongoose.Schema({
  name:       { type: String, required: true }, // "Orange Test 20"
  seriesName: { type: String, default: '' },    // "Orange Test"
  testNumber: { type: Number, required: true }, // 20
  isActive:   { type: Boolean, default: true },
  passageIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Passage' }]
}, { timestamps: true });

ReadingTestSchema.index({ isActive: 1, testNumber: -1 });

module.exports = mongoose.model('ReadingTest', ReadingTestSchema);