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
    // Mindset courses: the lesson's vocabulary, which the student saves into
    // one of their 5 fixed books ("Sổ 1".."Sổ 5", VocabBook.defaultSlot) —
    // one click on the lesson page, or the copy-paste list for "Nhập hàng loạt".
    vocabSave: {
      _id: false,
      slot: { type: Number, min: 1, max: 5 },
      title: String,
      words: [{ _id: false, word: String, meaning: String, example: String }],
    },
    // Buttons out to the site's own practice pages — a Reading passage /
    // Listening section seeded for this course (opened in the normal
    // reading.html / listening.html UI) or an Essential Grammar lesson.
    // seedCourse.js resolves `ref` (Passage/ListeningSection.courseRef) to `url`.
    practiceLinks: [{
      _id: false,
      kind: { type: String, enum: ['reading', 'listening', 'grammar', 'link'] },
      title: String,
      note: String,
      url: String,
    }],
    // Mindset: images cut from the book (pictures the lesson talks about).
    images: [{ _id: false, url: String, caption: String }],
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
