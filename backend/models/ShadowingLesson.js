/**
 * backend/models/ShadowingLesson.js
 * A 2–3 minute clip of a public YouTube video (Keith / English Pro Tips /
 * BBC 6 Minute English…), split into timed sentences for the Shadowing /
 * Dictation player (frontend/shadowing.html). The video is never stored or
 * re-hosted — the player embeds it with the YouTube IFrame API and seeks to
 * each segment's start/end. Content is built from the channel's captions by
 * scripts/shadowing/buildShadowingLessons.js and seeded by
 * scripts/seedShadowingLessons.js (upsert key: slug).
 */
const mongoose = require('mongoose');

const CATEGORIES = ['ielts-part1', 'ielts-part2', '6-minute-english'];

const SegmentSchema = new mongoose.Schema({
  start: { type: Number, required: true }, // seconds into the video
  end:   { type: Number, required: true },
  text:  { type: String, required: true },
}, { _id: false });

const ShadowingLessonSchema = new mongoose.Schema({
  slug:        { type: String, required: true, unique: true, trim: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  youtubeId:   { type: String, required: true, trim: true },
  sourceTitle: { type: String, default: '' }, // the full YouTube video's title
  channel:     { type: String, default: '' },
  category:    { type: String, enum: CATEGORIES, required: true },
  level:       { type: String, enum: ['A2', 'B1', 'B2', 'C1'], default: 'B1' },
  clipStart:   { type: Number, required: true },
  clipEnd:     { type: Number, required: true },
  segments:    { type: [SegmentSchema], default: [] },
  order:       { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

ShadowingLessonSchema.index({ isPublished: 1, category: 1, order: 1 });

module.exports = mongoose.model('ShadowingLesson', ShadowingLessonSchema);
module.exports.CATEGORIES = CATEGORIES;
