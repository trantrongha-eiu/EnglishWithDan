/**
 * backend/models/ShadowingAttempt.js
 * One practice session on a ShadowingLesson (frontend/shadowing.html), in
 * either mode — `dictation` (type what you hear, scored word-for-word) or
 * `shadowing` (repeat aloud, scored from the browser's speech-to-text).
 * Same shape/retention as DictationAttempt, kept separate since it points
 * at a different content collection.
 */
const mongoose = require('mongoose');

const ShadowingAnswerSchema = new mongoose.Schema({
  segmentIndex: Number,
  matchedWords: Number,
  totalWords:   Number,
  score:        Number, // 0–100, matchedWords / totalWords
}, { _id: false });

const ShadowingAttemptSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lessonId:    { type: mongoose.Schema.Types.ObjectId, ref: 'ShadowingLesson', required: true },
  lessonTitle: { type: String, default: '' },
  mode:        { type: String, enum: ['dictation', 'shadowing'], required: true },

  answers:       [ShadowingAnswerSchema],
  totalSegments: { type: Number, default: 0 }, // segments in the lesson
  avgScore:      { type: Number, default: 0 }, // over the answered segments

  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

ShadowingAttemptSchema.index({ userId: 1, lessonId: 1, submittedAt: -1 });
// Same 3-month retention as every other practice-history collection.
ShadowingAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('ShadowingAttempt', ShadowingAttemptSchema);
