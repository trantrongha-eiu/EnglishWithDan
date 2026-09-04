const mongoose = require('mongoose');
const { Schema } = mongoose;

// WT1 course lesson ("Buổi 2 … Buổi 11", "TEST"). The unit a student
// opens; holds 5–8 WT1Exercise blocks (referenced the other way, by
// WT1Exercise.lessonCode). Refs its module by `moduleCode`.
// `gate` = the condition to unlock the next lesson.
const WT1LessonSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    moduleCode: { type: String, required: true, index: true },
    order: Number,
    title: String,
    titleEn: String,
    durationMinutes: Number,
    objectives: [String],
    keyLanguage: [String],
    isTest: { type: Boolean, default: false },
    totalPoints: Number,
    exerciseCount: Number,
    // Điều kiện mở buổi kế tiếp
    gate: {
      requireObjectiveCompletion: { type: Boolean, default: true },
      minObjectiveScorePercent: { type: Number, default: 70 },
      minWritingSubmissions: { type: Number, default: 1 },
    },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WT1Lesson', WT1LessonSchema);
