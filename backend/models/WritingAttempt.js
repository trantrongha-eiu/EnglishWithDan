const mongoose = require('mongoose');
const proctorSchema = require('./shared/proctorSchema');

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
    // 'in-progress'/'disqualified' are Test Simulation mode only — that mode
    // persists a placeholder attempt at START (unlike every other
    // submissionType, which only ever writes at submit time), so a strike
    // has somewhere to attach and an unfinished/voided run is visible
    // rather than leaving no trace. 'disqualified' = 5+ strikes
    // (examSimulationService.recordViolation) voided the run.
    enum: ['in-progress', 'completed', 'timeout', 'disqualified'],
    default: 'completed'
  },

  mode: { type: String, enum: ['practice', 'simulation'], default: 'practice' },
  proctor: { type: proctorSchema, default: () => ({}) },

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

  feedbackRead: { type: Boolean, default: false, index: true },

  // "Viết lại" — after a graded (gradingStatus 'confirmed') essay is
  // returned, the student rewrites it by hand on the site (see
  // frontend screen-rewrite + POST /api/writing/attempt/:id/rewrite).
  // Not re-graded — this is a self-improvement exercise the teacher
  // monitors. `done` = every graded task has been rewritten to its
  // minimum word count. `bypassed` = an admin-issued ReviewBypassCode
  // cleared it (same mechanism reading/listening reviews use — see
  // reviewService.redeemBypassCode). The requireRewriteComplete gate
  // blocks a new submit once 3+ confirmed essays sit un-rewritten.
  rewrite: {
    task1:       { type: String, default: '' },
    task2:       { type: String, default: '' },
    wordCount1:  { type: Number, default: 0 },
    wordCount2:  { type: Number, default: 0 },
    submittedAt: { type: Date },
    done:        { type: Boolean, default: false },
    bypassed:    { type: Boolean, default: false },
    bypassCode:  { type: String, default: '' },
    bypassedAt:  { type: Date }
  }

}, { timestamps: true });

WritingAttemptSchema.index({ userId: 1, submittedAt: -1 });
WritingAttemptSchema.index({ examId: 1, submittedAt: -1 });
// requireRewriteComplete gate + getPendingRewrites: "this student's
// confirmed essays that still need a rewrite".
WritingAttemptSchema.index({ userId: 1, gradingStatus: 1, 'rewrite.done': 1 });
// Retention: auto-delete 3 months after the attempt was created, no
// exception for gradingStatus/feedbackRead (confirmed decision — a
// submission still pending/unread at 3 months is deleted like any other).
// Student practice/exam history isn't kept indefinitely (unlike VocabBook,
// the personal saved-word notebooks, which have no expiry).
WritingAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('WritingAttempt', WritingAttemptSchema);
