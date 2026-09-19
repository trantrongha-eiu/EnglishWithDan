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
    // When true, the sequential lesson-gate (assertLessonUnlocked /
    // computeLessonStatuses in wt1Service.js) is skipped for every lesson in
    // this module — all its lessons stay open regardless of order or prior
    // scores, for modules meant as free-practice reference material rather
    // than a graded progression.
    freePractice: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WT1Module', WT1ModuleSchema);
