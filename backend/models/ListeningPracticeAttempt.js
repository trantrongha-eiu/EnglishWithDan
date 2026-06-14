const mongoose = require('mongoose');

const PracticeAnswerSchema = new mongoose.Schema({
  questionNumber: Number,
  userAnswer:     String,
  correctAnswer:  String,
  isCorrect:      Boolean
}, { _id: false });

const ListeningPracticeAttemptSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sectionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'ListeningSection', required: true },
  sectionTitle: { type: String, default: '' },
  partNumber:   { type: Number, default: 1 },

  answers:        [PracticeAnswerSchema],
  totalQuestions: { type: Number, default: 0 },
  correctCount:   { type: Number, default: 0 },
  wrongCount:     { type: Number, default: 0 },
  skippedCount:   { type: Number, default: 0 },

  timeTaken:   { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

ListeningPracticeAttemptSchema.index({ userId: 1, submittedAt: -1 });

module.exports = mongoose.model('ListeningPracticeAttempt', ListeningPracticeAttemptSchema);
