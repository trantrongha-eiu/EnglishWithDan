const mongoose = require('mongoose');

const AccessKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, uppercase: true },

  // 'reading' | 'listening' | 'writing' | 'speaking' | null (null = dùng được cho mọi loại)
  testType: {
    type: String,
    enum: ['reading', 'listening', 'writing', 'speaking', null],
    default: null
  },

  // null = dùng được cho mọi test thuộc testType (hoặc mọi test nếu testType cũng null)
  // refPath động theo testType
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'testRefModel',
    default: null
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  expiresAt: { type: Date, default: null },   // null = không hết hạn

  maxUses:     { type: Number, default: 1 },
  currentUses: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Virtual dùng để refPath biết ref đến model nào
AccessKeySchema.virtual('testRefModel').get(function () {
  if (this.testType === 'reading')   return 'ReadingTest';
  if (this.testType === 'listening') return 'ListeningTest';
  if (this.testType === 'writing')   return 'WritingExam';
  return 'ReadingTest'; // fallback (sẽ không populate nếu testId = null)
});

// Virtual: còn hiệu lực?
AccessKeySchema.virtual('isValid').get(function () {
  if (!this.isActive) return false;
  if (this.currentUses >= this.maxUses) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
});

module.exports = mongoose.model('AccessKey', AccessKeySchema);