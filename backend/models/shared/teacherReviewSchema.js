// Shared "teacherReview" sub-document — a teacher/admin's own grade + comment
// on a student's open-ended submission, given from the admin "Chấm bài khoá
// học & Speaking" queue (services/teacherReviewService.js). Embedded into
// WT1Submission (course writing + course speaking) and SpeakingAttempt
// (standalone Speaking practice). It sits ALONGSIDE the AI grade, never
// replaces it: the student still gets the instant AI feedback, and this is
// the human layer on top.
//
// `reviewedAt` is the queue key — a submission with no reviewedAt (created
// on/after teacherReviewService.QUEUE_CUTOFF) is "chờ duyệt".
const { Schema } = require('mongoose');

module.exports = {
  // Overall band the teacher gives (0–9, .5 steps). null = comment only.
  band: { type: Number, default: null },
  // Per-criterion bands — speaking: { fluency, vocabulary, grammar,
  // pronunciation }; writing: { taskAchievement, coherence, lexical, grammar }.
  scores: { type: Schema.Types.Mixed, default: undefined },
  note: { type: String, default: '', maxlength: 4000 },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  reviewerName: { type: String, default: '' },
  reviewedAt: { type: Date, default: null },
};
