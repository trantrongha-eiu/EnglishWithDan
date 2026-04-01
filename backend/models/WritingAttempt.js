const mongoose = require('mongoose');

const WritingAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WritingExam',
    required: true
  },
  examName: { type: String, default: '' },  // snapshot tên đề

  task1Answer: { type: String, default: '' },
  task2Answer: { type: String, default: '' },
  wordCount1:  { type: Number, default: 0 },
  wordCount2:  { type: Number, default: 0 },

  startTime:   { type: Date, default: Date.now },
  submittedAt: { type: Date, default: Date.now },
  timeTaken:   { type: Number, default: 0 },   // giây

  status: {
    type: String,
    enum: ['completed', 'timeout'],
    default: 'completed'
  }
}, { timestamps: true });

WritingAttemptSchema.index({ userId: 1, submittedAt: -1 });
WritingAttemptSchema.index({ examId: 1, submittedAt: -1 });

module.exports = mongoose.model('WritingAttempt', WritingAttemptSchema);
