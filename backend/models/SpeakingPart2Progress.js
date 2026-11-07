const mongoose = require('mongoose');

// One student's progress on one Speaking Part 2 master story
// (speaking-part2.html, content in data/speakingPart2.js). Progress, not
// history — no TTL (see the 3-month retention rule: only practice history
// expires). Written by services/speakingPart2Service.saveProgress, read by
// the page (sync across devices) and by resourceCompletionService
// (`speaking_part2` homework: done once all 5 steps are done).
const speakingPart2ProgressSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storyId: { type: String, required: true },          // data/speakingPart2.js stories[].id
  read:    { type: Boolean, default: false },          // ① "Đã đọc xong"
  ok:      { type: [String], default: [] },            // sentence/vocab keys typed correctly at least once
  speak:   { type: Number, default: 0 },               // ⑤ timed speaking runs of >= 60 s
  best:    { type: mongoose.Schema.Types.Mixed, default: {} }, // runKey -> last run's first-try %
  // When each step was first done (read/vocab/fixed/why/speak) — never moved.
  stepsAt: { type: mongoose.Schema.Types.Mixed, default: {} },
  completedAt: { type: Date, default: null },          // all 5 steps done (first time)
}, { timestamps: true, minimize: false });

speakingPart2ProgressSchema.index({ userId: 1, storyId: 1 }, { unique: true });

module.exports = mongoose.model('SpeakingPart2Progress', speakingPart2ProgressSchema);
