const mongoose = require('mongoose');

const AccessKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, uppercase: true },

  // null = dùng được cho mọi test
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReadingTest',
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

// Virtual: còn hiệu lực?
AccessKeySchema.virtual('isValid').get(function () {
  if (!this.isActive) return false;
  if (this.currentUses >= this.maxUses) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
});

module.exports = mongoose.model('AccessKey', AccessKeySchema);