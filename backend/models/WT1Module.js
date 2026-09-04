const mongoose = require('mongoose');
const { Schema } = mongoose;

// WT1 course module (e.g. "Biểu đồ tĩnh" / "Biểu đồ động"). Refs its
// parent course by `courseCode`. See WT1Course.js for the system overview.
const WT1ModuleSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    courseCode: { type: String, required: true, index: true },
    order: Number,
    title: String,
    titleEn: String,
    outcomes: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('WT1Module', WT1ModuleSchema);
