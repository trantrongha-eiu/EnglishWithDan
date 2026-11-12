const mongoose = require('mongoose');

// One student's progress on one Speaking Part 2 master story
// (speaking-part2.html, content in data/speakingPart2.js). Progress, not
// history — no TTL (see the 3-month retention rule: only practice history
// expires). Written by services/speakingPart2Service.saveProgress, read by
// the page (sync across devices) and by resourceCompletionService
// (`speaking_part2` homework: passed once the story is >= 70% learnt).
const speakingPart2ProgressSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storyId: { type: String, required: true },          // data/speakingPart2.js stories[].id
  // Content version the f<sec>.<j> keys below refer to (data/speakingPart2.js
  // VERSION). Missing = written before v3; speakingPart2Service.upgradeKeys
  // moves those keys onto the v3 sentences on the next read/save.
  v:       { type: Number, default: null },
  read:    { type: Boolean, default: false },          // ① "Đã đọc xong"
  ok:      { type: [String], default: [] },            // sentence/vocab keys typed correctly at least once
  shadow:  { type: mongoose.Schema.Types.Mixed, default: {} }, // sentence key ("." → "_", f0_1) -> best nhại score 0–100
  speak:   { type: Number, default: 0 },               // ⑤ timed speaking runs of >= 60 s
  best:    { type: mongoose.Schema.Types.Mixed, default: {} }, // runKey -> last run's first-try %
  // When each step was first done (read/vocab/learn/speak) — never moved.
  // (Docs from before 2026-11-11 may also hold the old fixed/why keys.)
  stepsAt: { type: mongoose.Schema.Types.Mixed, default: {} },
  masteredAt:  { type: Date, default: null },          // story first reached 70% learnt (homework pass)
  completedAt: { type: Date, default: null },          // all 4 steps done (first time)
}, { timestamps: true, minimize: false });

speakingPart2ProgressSchema.index({ userId: 1, storyId: 1 }, { unique: true });

module.exports = mongoose.model('SpeakingPart2Progress', speakingPart2ProgressSchema);
