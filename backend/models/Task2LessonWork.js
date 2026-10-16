const mongoose = require('mongoose');

// One student's work on ONE Task 2 lesson ("Buổi học" — every Task2Topic is
// one class session on task2-practice.html): the group-brainstorm notes and
// the essay written in two halves — Introduction + Body 1 in class, Body 2 +
// Conclusion at home from the book's template. Kept server-side (not just
// localStorage) because the two halves are routinely written on different
// devices: a classroom machine, then the student's own phone/laptop.
const task2LessonWorkSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Task2Topic', required: true },
  // One entry per Task2Topic.brainstormHints side (same order).
  brainstorm: [{ type: String }],
  sections: {
    intro:      { type: String, default: '' },
    body1:      { type: String, default: '' },
    body2:      { type: String, default: '' },
    conclusion: { type: String, default: '' }
  },
  // Set when the student hands the finished essay over to writing.html for
  // AI grading — drives the "Hoàn thành" mark on the lesson list.
  submittedAt: { type: Date, default: null },
  // questionId → the student's English for a sentence-building question,
  // copied from every draft save. A draft only holds the CURRENT session, so
  // without this a half-done "Dịch câu" run was lost as soon as the student
  // started "Dịch tiếp N câu" (the new session overwrote the draft, then
  // finishing it deleted the draft).
  sentences: {
    type: Map,
    of: new mongoose.Schema({ en: String, isCorrect: Boolean }, { _id: false }),
    default: undefined
  }
}, { timestamps: true });

task2LessonWorkSchema.index({ userId: 1, topicId: 1 }, { unique: true });
// Same 3-month retention as Task2Attempt (counted from the last edit).
task2LessonWorkSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('Task2LessonWork', task2LessonWorkSchema);
