const mongoose = require('mongoose');

// Reading-check quizzes on the Task 2 Templates type guide ("Hướng dẫn dạng
// bài này"): one row per student × essay type, shared by Band 6+ and Band 7+.
// Each guide section (recognise → outline → upgrade → language → essay →
// mistakes) opens only after the one before it is passed (>= 90%), and the
// 5-step path opens once every section is passed. Durable progress: no TTL.
const sectionSchema = new mongoose.Schema({
  best:     { type: Number, default: 0 },    // best % so far
  tries:    { type: Number, default: 0 },
  passedAt: { type: Date, default: null },   // first time >= pass bar
}, { _id: false });

const task2GuideQuizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  typeId: { type: String, required: true },
  sections: {
    recognise: { type: sectionSchema, default: () => ({}) },
    outline:   { type: sectionSchema, default: () => ({}) },
    upgrade:   { type: sectionSchema, default: () => ({}) },
    language:  { type: sectionSchema, default: () => ({}) },
    essay:     { type: sectionSchema, default: () => ({}) },
    mistakes:  { type: sectionSchema, default: () => ({}) },
  },
}, { timestamps: true });

task2GuideQuizSchema.index({ userId: 1, typeId: 1 }, { unique: true });

module.exports = mongoose.model('Task2GuideQuiz', task2GuideQuizSchema);
