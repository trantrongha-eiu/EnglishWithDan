const mongoose = require('mongoose');

const ReadingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  testType: {
    type: String,
    enum: ['Academic', 'General Training'],
    default: 'Academic'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  timeLimit: {
    type: Number,
    default: 60 // phút
  },
  passages: [{
    passageNumber: {
      type: Number,
      required: true
    },
    title: String,
    text: {
      type: String,
      required: true
    },
    questions: [{
      questionNumber: {
        type: Number,
        required: true
      },
      questionType: {
        type: String,
        enum: [
          'Multiple Choice',
          'True/False/Not Given',
          'Yes/No/Not Given',
          'Matching Headings',
          'Matching Information',
          'Matching Features',
          'Matching Sentence Endings',
          'Sentence Completion',
          'Summary Completion',
          'Note Completion',
          'Table Completion',
          'Flow-chart Completion',
          'Diagram Label Completion',
          'Short-answer Questions'
        ],
        required: true
      },
      question: {
        type: String,
        required: true
      },
      options: [String], // cho multiple choice
      correctAnswer: {
        type: String,
        required: true
      },
      explanation: String // giải thích đáp án
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp trước khi save
ReadingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("ReadingTest", ReadingSchema);