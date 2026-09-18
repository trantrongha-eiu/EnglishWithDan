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
  },
  { timestamps: true }
);

WT1SubmissionSchema.index({ userId: 1, exerciseCode: 1, attempt: 1 }, { unique: true });
// Same 3-month retention convention as every other attempt-history model
// (see memory/data_retention_policy.md).
WT1SubmissionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('WT1Submission', WT1SubmissionSchema);
