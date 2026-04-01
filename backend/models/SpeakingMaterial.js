const mongoose = require('mongoose');

const SpeakingMaterialSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  quarter:  { type: String, required: true },  // 'Q1 2025', 'Q2 2025', ...
  topic:    { type: String, required: true },
  pdfUrl:   { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('SpeakingMaterial', SpeakingMaterialSchema);
