const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── IELTS Writing Task 1 structured course (the "WT1" system) ──────────
// A 4th sentence/writing-exercise system alongside WPExercise /
// Task1Exercise / Task2Topic.questions (see docs/EXERCISE_SYSTEMS.md).
// Unlike the flat Task1Exercise grammar drills, this is a multi-tier
// curriculum: WT1Course → WT1Module → WT1Lesson → WT1Exercise → Item.
// Every cross-reference uses `code` (a stable string), never _id, so the
// content can be re-seeded repeatedly without breaking student progress
// (WT1Submission / WT1Progress also reference `code`).
const WT1CourseSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    title: String,
    skill: { type: String, default: 'writing' },
    taskType: { type: String, default: 'task1' },
    language: { type: String, default: 'vi' },
    targetBand: String,
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('WT1Course', WT1CourseSchema);
