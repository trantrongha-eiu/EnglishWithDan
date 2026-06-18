const mongoose = require('mongoose');

const TuitionFeeSchema = new mongoose.Schema({
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  feeType:     { type: String, enum: ['monthly', 'course'], required: true },
  // monthly
  month:       { type: Number, min: 1, max: 12 },
  year:        { type: Number },
  // course
  courseName:  { type: String, default: '' },
  // amount
  amount:      { type: Number, required: true, default: 0 },
  // admin marks paid
  isPaid:      { type: Boolean, default: false },
  paidDate:    { type: Date },
  // student pressed "Tôi đã chuyển khoản"
  studentNotified:   { type: Boolean, default: false },
  studentNotifiedAt: { type: Date },
  // notes
  note:        { type: String, default: '' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Unique compound index — prevents duplicate monthly fees per student.
// sparse: true so course fees (month/year = null) are excluded from uniqueness check.
TuitionFeeSchema.index({ studentId: 1, feeType: 1, month: 1, year: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('TuitionFee', TuitionFeeSchema);
