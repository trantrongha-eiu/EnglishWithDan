const mongoose = require('mongoose');

const PracticeResultSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  unitNumber: { type: Number },
  total:      { type: Number, default: 0 },
  correct:    { type: Number, default: 0 },
  wrong:      { type: Number, default: 0 },
  percentage: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('PracticeResult', PracticeResultSchema);
