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
const { playDuration } = require('../utils/shadowingClip');

// Display names — same as CATEGORY_LABEL in frontend/js/shadowing.js.
const CATEGORY_LABELS = {
  'ielts-part1': 'Speaking Part 1', 'ielts-part2': 'Speaking Part 2', 'ielts-part3': 'Speaking Part 3',
  '6-minute-english': '6 Minute English', 'kids-stories': 'Truyện kể BBC', 'fun-shorts': 'Video ngắn vui',
  'comedy': 'Hài Stand-up', 'ted-shorts': 'TED ngắn', 'everyday-english': 'Everyday English',
  'spelling-numbers': 'Đánh vần & số', 'grammar': 'Ngữ pháp', 'connected-speech': 'Nối âm cơ bản',
  'connected-speech-advanced': 'Nối âm nâng cao', 'animated': 'Hoạt hình kiến thức',
  '6-minute-grammar': '6 Minute Grammar', 'ielts-mock-test': 'Mock test Speaking',
};
const CATEGORIES = Object.keys(CATEGORY_LABELS);

const SegmentSchema = new mongoose.Schema({
  start: { type: Number, required: true }, // seconds into the video
  end:   { type: Number, required: true },
  text:  { type: String, required: true },
  vi:    { type: String, default: '' },    // Vietnamese translation, shown under the sentence
  answer: { type: String },                // Dictation grades this instead of `text` (spelled names, numbers)
}, { _id: false });

const ShadowingLessonSchema = new mongoose.Schema({
  slug:        { type: String, required: true, unique: true, trim: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  youtubeId:   { type: String, required: true, trim: true },
  sourceTitle: { type: String, default: '' }, // the full YouTube video's title
  channel:     { type: String, default: '' },
  category:    { type: String, enum: CATEGORIES, required: true },
  level:       { type: String, enum: ['A2', 'B1', 'B2', 'C1', 'C2'], default: 'B1' },
  clipStart:   { type: Number, required: true },
  clipEnd:     { type: Number, required: true },
  // The video shows its own English subtitles (BBC Storytellers): the
  // player's "Xem video" overlay then adds only the Vietnamese, at the top.
  burnedInCaptions: { type: Boolean, default: false },
  segments:    { type: [SegmentSchema], default: [] },
  // Derived from segments (withStats) so the picker list needn't load them.
  segmentCount: { type: Number, default: 0 },
  playDuration: { type: Number, default: 0 }, // seconds, cut parts excluded (utils/shadowingClip)
  order:       { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

ShadowingLessonSchema.index({ isPublished: 1, category: 1, order: 1 });

// The seed writes with bulkWrite (no save hooks), so it calls this too.
function withStats(lesson) {
  const segs = lesson.segments || [];
  return { ...lesson, segmentCount: segs.length, playDuration: playDuration(segs) };
}
ShadowingLessonSchema.pre('save', function () {
  this.segmentCount = this.segments.length;
  this.playDuration = playDuration(this.segments);
});

module.exports = mongoose.model('ShadowingLesson', ShadowingLessonSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.CATEGORY_LABELS = CATEGORY_LABELS;
module.exports.withStats = withStats;
