const mongoose = require('mongoose');

/**
 * Ghi nhận hoạt động từ vựng của học sinh theo ngày (UTC).
 * Mỗi (userId, date) là duy nhất → dùng $inc để cộng dồn trong ngày.
 */
const VocabActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    required: true,
    index: true
  },
  // Ngày (00:00:00 UTC) – key chính để nhóm theo ngày/tháng/năm
  date: {
    type:     Date,
    required: true
  },
  // Số lần mở trang từ vựng (GET /api/vocabbook/)
  viewCount:    { type: Number, default: 0 },
  // Số từ mới được thêm vào sổ (POST /api/vocabbook/:id/words)
  wordsAdded:   { type: Number, default: 0 },
  // Số lần cập nhật trạng thái học 1 từ (PATCH …/words/:wordId với status)
  wordsStudied: { type: Number, default: 0 },
}, { timestamps: true });

// Đảm bảo (userId, date) là unique → upsert an toàn
VocabActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('VocabActivity', VocabActivitySchema);
