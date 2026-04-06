const mongoose = require('mongoose');

const WritingSampleSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  quarter:  { type: String, required: true },   // 'Q1 2025', 'Q2 2025', ...
  topic:    { type: String, required: true },    // 'Environment', 'Technology', ...
  taskType: { type: String, enum: ['task1', 'task2', 'both'], default: 'task2' },
  pdfUrl:   { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('WritingSample', WritingSampleSchema);
