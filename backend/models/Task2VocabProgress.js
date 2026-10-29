const mongoose = require('mongoose');

// Step ① of a Task 2 lesson (task2-practice.html): which of the topic's terms
// the student has saved into a VocabBook, and their best vocab-quiz score.
// Together these unlock steps 2–6. Used to live only in localStorage, so a
// student who did step ① on their phone found it locked again on a laptop.
// No TTL: this is unlock state, not practice history (see the 3-month
// retention rule — progress must outlive the history rows).
const task2VocabProgressSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Task2Topic', required: true },
  savedTerms: [{ type: String }],
  quizBest:   { type: Number, default: null, min: 0, max: 100 }
}, { timestamps: true });

task2VocabProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model('Task2VocabProgress', task2VocabProgressSchema);
