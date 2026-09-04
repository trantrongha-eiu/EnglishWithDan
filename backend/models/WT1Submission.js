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

    // Bài khách quan
    answers: Schema.Types.Mixed, // { q1: "amount", q2: ["a","b"] }
    score: Number,
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
