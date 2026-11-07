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
    // Theory cards shown above the exercises, one per grammar structure
    // (e.g. Task 2 Module 3's 12 band-raising structures). Text may use
    // **bold** to highlight the target structure.
    theory: [{
      _id: false,
      title: String,
      titleEn: String,
      formula: [String],
      usage: [String],
      examples: [{ _id: false, en: String, vi: String }],
      notes: [String],
    }],
    // Speaking course: the Student's Book's MODEL ANSWER and UPGRADE
    // (Band 5 → 6 → 7) boxes for this lesson, word for word — written by
    // scripts/speakingBook/syncBookModels.js. `lines` keep the book's **bold**.
    bookModels: [{
      _id: false,
      kind: { type: String, enum: ['model', 'upgrade'] },
      title: String,
      question: String,
      lines: [String],
    }],
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
