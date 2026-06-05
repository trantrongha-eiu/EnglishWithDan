const mongoose = require('mongoose');

const taskGradeSubSchema = {
  bandScore: { type: Number },
  ta:  { score: { type: Number }, comment: { type: String, default: '' } },
  cc:  { score: { type: Number }, comment: { type: String, default: '' } },
  lr:  { score: { type: Number }, comment: { type: String, default: '' } },
  gra: { score: { type: Number }, comment: { type: String, default: '' } },
  overallFeedback: { type: String, default: '' },
  sentenceFeedback: [{ type: mongoose.Schema.Types.Mixed }],
  // legacy fields kept for backward compat
  corrections: [{
    original:    { type: String, default: '' },
    corrected:   { type: String, default: '' },
    explanation: { type: String, default: '' }
  }],
  suggestions: [{ type: String }]
};

const WritingAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  submissionType: {
    type: String,
    enum: ['exam', 'practice'],
    default: 'exam',
    index: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WritingExam'
  },
  examName: { type: String, default: '' },

  task1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'WritingTask1' },
  task2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'WritingTask2' },

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
  timeTaken:   { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['completed', 'timeout'],
    default: 'completed'
  },

  gradingStatus: {
    type: String,
    enum: ['pending', 'ai_done', 'confirmed'],
    default: 'pending'
  },

  aiGrading: {
    task1: taskGradeSubSchema,
    task2: taskGradeSubSchema,
    generatedAt: { type: Date }
  },

  grading: {
    task1: taskGradeSubSchema,
    task2: taskGradeSubSchema,
    overallBand:  { type: Number },
    adminNote:    { type: String, default: '' },
    confirmedAt:  { type: Date },
    confirmedBy:  { type: String, default: '' }
  },

  feedbackRead: { type: Boolean, default: false, index: true }

}, { timestamps: true });

WritingAttemptSchema.index({ userId: 1, submittedAt: -1 });
WritingAttemptSchema.index({ examId: 1, submittedAt: -1 });

module.exports = mongoose.model('WritingAttempt', WritingAttemptSchema);
