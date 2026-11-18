/**
 * Seed script for the DictationDrill collection ("Đánh vần tên & số dài"
 * lessons on frontend/dictation.html). Content lives in
 * scripts/data/dictationDrills.json, built from the Listening bank by
 * scripts/dictationDrills/buildDictationDrills.js.
 *
 * Run from backend/:
 *   node scripts/seedDictationDrills.js         # upsert into the DB
 *   node scripts/seedDictationDrills.js --dry   # print counts, touch nothing
 *
 * Also runs on every server start (server.js) — upsert key `slug`, so it is
 * idempotent; a lesson no longer in the JSON is unpublished, not deleted.
 */
'use strict';

const lessons = require('./data/dictationDrills.json');

async function runSeed() {
  const DictationDrill = require('../models/DictationDrill');
  const ops = lessons.map((l) => ({
    replaceOne: { filter: { slug: l.slug }, replacement: { isPublished: true, ...l }, upsert: true },
  }));
  const result = await DictationDrill.bulkWrite(ops);
  const dropped = await DictationDrill.updateMany(
    { slug: { $nin: lessons.map((l) => l.slug) }, isPublished: true },
    { $set: { isPublished: false } },
  );
  console.log(`[DictationDrillSeed] upserted ${result.upsertedCount}, modified ${result.modifiedCount}, unpublished ${dropped.modifiedCount} lessons`);
}

if (require.main === module) {
  const dry = process.argv.includes('--dry');
  for (const l of lessons) console.log(`  ${l.slug.padEnd(14)} ${l.category.padEnd(9)} ${String(l.items.length).padStart(3)} items  ${l.title}`);
  console.log(`\n  ${lessons.length} lessons`);
  if (dry) process.exit(0);

  require('dotenv').config();
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(runSeed)
    .then(() => mongoose.disconnect())
    .then(() => console.log('[DictationDrillSeed] Done'))
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { runSeed, lessons };
