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

  // Task references (pool-based)
  task1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'WritingTask1' },
  task2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'WritingTask2' },

  // Snapshots – lưu nội dung tại thời điểm thi để history luôn đúng
  task1Snapshot: {
    imageUrl:     { type: String, default: '' },
    instructions: { type: String, default: '' },
    prompt:       { type: String, default: '' }
  },
  task2Snapshot: {
    instructions: { type: String, default: '' },
    prompt:       { type: String, default: '' }
  },

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
