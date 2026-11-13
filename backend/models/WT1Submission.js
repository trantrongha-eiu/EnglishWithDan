const mongoose = require('mongoose');
const { Schema } = mongoose;

// One student attempt at one WT1Exercise. References the exercise/lesson by
// `code` (not _id) so re-seeding content never orphans it. `answers` holds
// objective results; `responses` + `aiFeedback` hold AI-graded writing.
const WT1SubmissionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exerciseCode: { type: String, required: true, index: true },
    lessonCode: { type: String, index: true },
    attempt: { type: Number, default: 1 },

    // Bài khách quan — `score` is a 0-100 PERCENTAGE (got/maxScore*100, see
    // wt1GradingService.gradeObjective), used for lesson-gate averaging;
    // `correctCount` is the raw number of items answered correctly, kept
    // separately so admin reporting can show a true "x/maxScore" instead of
    // dividing a percentage by an item count (was showing e.g. "100/5").
    answers: Schema.Types.Mixed, // { q1: "amount", q2: ["a","b"] }
    score: Number,
    correctCount: Number,
    maxScore: Number,
    // Per-item verdict exactly as returned at grading time — kept so the
    // "Lịch sử" review (student + admin, wt1Service.buildReview) shows the
    // SAME right/wrong marks the student saw, including Gemini's verdict on
    // autoGrade:false sentence_transform items (a local re-grade could
    // disagree). Rows saved before this existed are re-graded locally.
    results: [{ _id: false, id: String, correct: Boolean, explanation: String }],
    // Rubric-based grade for writing (sentence_writing, or the fallback when
    // AI grading is unavailable) — { feedbackVi, checklist, aiUnavailable }.
    localFeedback: Schema.Types.Mixed,

    // Bài AI chấm
    responses: [String], // theo responseSlots, hoặc 1 phần tử với paragraph/full
    aiFeedback: {
      model: String,
      scores: Schema.Types.Mixed, // { taskAchievement, coherence, lexical, grammar }
      bandEstimate: Number,
      feedbackVi: String,
      corrections: [{ original: String, corrected: String, note: String }],
      usedStructures: [String],
      missingStructures: [String],
      // speaking_response only
      strengths: [String],
      improvements: [String],
      rawTokens: Number,
    },

    // speaking_response with multiple items only (see wt1Service.
    // recordSpeakingItem) — each sub-question of the exercise is recorded
    // and AI-graded on its own instead of one combined take covering the
    // whole exercise. Accumulates one entry per item as the student
    // progresses (status stays 'draft' until every item has one); once
    // complete, `aiFeedback` above holds the averaged/aggregate result
    // (same shape every other WT1Submission's aiFeedback uses, so history/
    // admin views need no special-casing) and status flips to 'graded'.
    itemResults: [{
      itemIndex: Number,
      prompt: String,
      transcript: String,
      // This item's recording on R2 (speaking-recordings/, purged after 90
      // days by cron/speakingRecordingCleanup.js) — '' when none was saved.
      audioUrl: String,
      feedback: {
        scores: Schema.Types.Mixed, // { fluency, vocabulary, grammar, pronunciation }
        bandEstimate: Number,
        feedbackVi: String,
        corrections: [{ original: String, corrected: String, note: String }],
        strengths: [String],
        improvements: [String],
      },
    }],

    // 'draft' = a speaking_response attempt still missing one or more
    // itemResults — deliberately excluded from every gate/history/admin
    // query (see wt1Service's subs queries) so an unfinished multi-item
    // recording never counts as "done" or shows up as a real attempt.
    status: { type: String, enum: ['draft', 'submitted', 'graded'], default: 'submitted' },
    timeSpentSeconds: Number,

    // Single-shot speaking_response: the student's recording on R2 (same
    // folder + 90-day purge as itemResults[].audioUrl) so a teacher can
    // listen to it from the admin review queue. '' = none saved.
    audioUrl: { type: String, default: '' },

    // Auto AI re-grade bookkeeping (teacherReviewService.autoRegradePending,
    // every 10 min) for writing rows still without an AI band — non-overload
    // failures counted; given up after AUTO_MAX_TRIES. Cleared on success.
    aiRetry: { _id: false, tries: Number, lastError: String, lastAt: Date },

    // Teacher's own grade + comment from the admin review queue — see
    // models/shared/teacherReviewSchema.js + services/teacherReviewService.js.
    teacherReview: require('./shared/teacherReviewSchema'),
  },
  { timestamps: true }
);

WT1SubmissionSchema.index({ userId: 1, exerciseCode: 1, attempt: 1 }, { unique: true });
// Same 3-month retention convention as every other attempt-history model
// (see memory/data_retention_policy.md). Lesson progress does NOT depend on
// these rows surviving — WT1Progress.exerciseBest keeps each exercise's best
// score after its submissions expire (see wt1Service._recompute).
WT1SubmissionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('WT1Submission', WT1SubmissionSchema);
