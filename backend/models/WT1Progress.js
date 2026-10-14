const mongoose = require('mongoose');
const { Schema } = mongoose;

// Per-(student, lesson) progress for the WT1 course — drives the
// lesson-unlock gate (WT1Lesson.gate). `completedExercises` stores
// exercise `code`s (not _id) so re-seeding content keeps progress intact.
// No TTL: this is durable state, not attempt history. WT1Submission (the
// history) expires after 3 months, so the gate must never depend on those
// rows alone — `exerciseBest` is the durable record of what was done.
const WT1ProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseCode: { type: String, required: true },
    lessonCode: { type: String, required: true },
    completedExercises: [String], // danh sách exercise.code
    // { [exercise.code]: best score 0-100 } for every exercise ever done in
    // this lesson — survives WT1Submission's 3-month TTL so an expired
    // history never re-locks a lesson or un-ticks a finished exercise.
    exerciseBest: { type: Schema.Types.Mixed, default: undefined },
    objectiveScorePercent: Number,
    writingSubmissions: { type: Number, default: 0 },
    unlocked: { type: Boolean, default: false },
    completedAt: Date,
  },
  { timestamps: true }
);

WT1ProgressSchema.index({ userId: 1, lessonCode: 1 }, { unique: true });

module.exports = mongoose.model('WT1Progress', WT1ProgressSchema);
