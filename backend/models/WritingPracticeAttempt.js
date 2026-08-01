const mongoose = require('mongoose');

// One document per topic completion (flushed when the student switches
// topic/level/mode or leaves the page — see writing-practice.html's
// sessionAttempts buffer), NOT one per sentence. Used to be one row per
// individual exercise, which made the admin "Kết quả" list unreadable
// (hundreds of one-sentence rows) and impossible to read as "how well is
// this student doing on this topic" — audit finding, 2026-08-02.
const writingPracticeAttemptSchema = new mongoose.Schema({
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level:        { type: String, enum: ['beginner', 'elementary', 'intermediate'], required: true },
  topic:        { type: String, required: true },
  // Exercise types included in this batch (translation/rearrange/fill_blank/
  // expand/combine) — informational only, a batch can mix types when the
  // student practices with the topic filter set to "Tất cả".
  types:        [{ type: String }],
  totalItems:   { type: Number, required: true },
  correctItems: { type: Number, required: true },
  xpEarned:     { type: Number, default: 0 },
  createdAt:    { type: Date, default: Date.now }
});

// Auto-delete after 30 days
writingPracticeAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// getHistory()/getMyStats() filter by studentId sorted by recency — previously unindexed.
writingPracticeAttemptSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('WritingPracticeAttempt', writingPracticeAttemptSchema);
