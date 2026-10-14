/**
 * Seed script for the ShadowingLesson collection (frontend/shadowing.html).
 * Content lives in scripts/data/shadowingLessons.json, generated from
 * YouTube captions by scripts/shadowing/buildShadowingLessons.js (see that
 * file's header for how to add a lesson).
 *
 * Run from backend/:
 *   node scripts/seedShadowingLessons.js         # upsert into the DB
 *   node scripts/seedShadowingLessons.js --dry   # print counts, touch nothing
 *
 * Also runs on every server start (server.js) — upsert key `slug`, so it's
 * idempotent and a new lesson in the JSON goes live with the next deploy.
 *
 * Vietnamese translations live separately in scripts/data/
 * shadowingTranslations.json ({ slug: { "<English sentence>": "<vi>" } }),
 * keyed by sentence text so re-running the caption builder doesn't drop
 * them; a sentence with no entry just shows without a translation.
 */
'use strict';

const translations = require('./data/shadowingTranslations.json');
const lessons = require('./data/shadowingLessons.json').map((l) => {
  const vi = translations[l.slug] || {};
  return { ...l, segments: l.segments.map((s) => ({ ...s, vi: vi[s.text] || '' })) };
});

function summarise() {
  for (const l of lessons) {
    const missing = l.segments.filter((s) => !s.vi).length;
    console.log(`  ${l.slug.padEnd(32)} ${l.category.padEnd(17)} ${String(l.segments.length).padStart(3)} câu  ${Math.round(l.clipEnd - l.clipStart)}s${missing ? `  (${missing} câu chưa dịch)` : ''}`);
  }
  console.log(`\n  Tổng: ${lessons.length} bài`);
}

async function runSeed() {
  const ShadowingLesson = require('../models/ShadowingLesson');
  const ops = lessons.map((l) => ({
    replaceOne: { filter: { slug: l.slug }, replacement: { isPublished: true, ...l }, upsert: true },
  }));
  const result = await ShadowingLesson.bulkWrite(ops);
  console.log(`[ShadowingSeed] upserted ${result.upsertedCount}, modified ${result.modifiedCount} lessons`);
}

if (require.main === module) {
  const dry = process.argv.includes('--dry');
  console.log(`[ShadowingSeed] ${dry ? 'DRY RUN — nothing will be written' : 'seeding'}:\n`);
  summarise();
  if (dry) { process.exit(0); }

  require('dotenv').config();
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(runSeed)
    .then(() => mongoose.disconnect())
    .then(() => console.log('[ShadowingSeed] Done'))
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { runSeed, lessons };
