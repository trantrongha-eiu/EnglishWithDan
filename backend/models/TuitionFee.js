const mongoose = require('mongoose');

const TuitionFeeSchema = new mongoose.Schema({
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  feeType:     { type: String, enum: ['monthly', 'course'], required: true },
  // monthly
  month:       { type: Number, min: 1, max: 12 },
  year:        { type: Number },
  // course
  courseName:  { type: String, default: '' },
  // amount, in VND — integer, no decimal subunits
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
// partialFilterExpression scopes this to feeType:'monthly' only, so course fees
// (which always share studentId/feeType, only month/year differ as undefined)
// never collide with each other. `sparse` doesn't achieve this: it only skips a
// document when ALL indexed fields are missing, and studentId/feeType never are.
TuitionFeeSchema.index(
  { studentId: 1, feeType: 1, month: 1, year: 1 },
  { unique: true, partialFilterExpression: { feeType: 'monthly' } }
);

// Serves the auto-reminder cron's `find({month,year,isPaid:false})` — that
// query doesn't start with studentId, so it can't use the index above.
TuitionFeeSchema.index({ month: 1, year: 1, isPaid: 1 });

module.exports = mongoose.model('TuitionFee', TuitionFeeSchema);
