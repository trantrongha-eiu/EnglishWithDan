const mongoose = require('mongoose');
const { Schema } = mongoose;

// Per-(student, lesson) progress for the WT1 course — drives the
// lesson-unlock gate (WT1Lesson.gate). `completedExercises` stores
// exercise `code`s (not _id) so re-seeding content keeps progress intact.
// No TTL: this is durable state, not attempt history.
const WT1ProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseCode: { type: String, required: true },
    lessonCode: { type: String, required: true },
    completedExercises: [String], // danh sách exercise.code
    objectiveScorePercent: Number,
    writingSubmissions: { type: Number, default: 0 },
    unlocked: { type: Boolean, default: false },
    completedAt: Date,
  },
  { timestamps: true }
);

WT1ProgressSchema.index({ userId: 1, lessonCode: 1 }, { unique: true });

module.exports = mongoose.model('WT1Progress', WT1ProgressSchema);
