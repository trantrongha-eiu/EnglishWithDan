/**
 * Seed script for the SentenceStructureGroup collection ("Viết câu nâng cao").
 * 12 grammar-structure groups · 73 Việt→Anh translation sentences.
 * Content lives in scripts/data/advSentences.js (the reproducibility snapshot;
 * the live DB is authoritative going forward — edit via the admin panel).
 *
 * Run from backend/:
 *   node scripts/seedAdvSentences.js         # upsert into the DB
 *   node scripts/seedAdvSentences.js --dry   # print counts, touch nothing
 *
 * Upsert key: `code`. replaceOne replaces the whole group doc, so re-running
 * after an admin edit will overwrite those edits with the file — keep the
 * file in sync (or just don't re-run once content is being managed in admin).
 */
'use strict';

const groups = require('./data/advSentences');

function summarise() {
  let sentences = 0;
  for (const g of groups) {
    const n = (g.sentences || []).length;
    sentences += n;
    const blank = (g.sentences || []).filter((s) => !s.answerEn || !s.answerEn.trim()).length;
    console.log(
      `  W${g.week}.${g.slotInWeek}  ${g.code.padEnd(22)} ${String(n).padStart(2)} câu` +
      (blank ? `  ⚠ ${blank} chưa có answerEn` : ''),
    );
  }
  console.log(`\n  Tổng: ${groups.length} nhóm · ${sentences} câu`);
  return sentences;
}

async function runSeed() {
  const SentenceStructureGroup = require('../models/SentenceStructureGroup');
  const ops = groups.map((g) => ({
    replaceOne: { filter: { code: g.code }, replacement: g, upsert: true },
  }));
  const result = await SentenceStructureGroup.bulkWrite(ops);
  console.log(`[AdvSentenceSeed] upserted ${result.upsertedCount}, modified ${result.modifiedCount} groups`);
}

if (require.main === module) {
  const dry = process.argv.includes('--dry');
  console.log(`[AdvSentenceSeed] ${dry ? 'DRY RUN — nothing will be written' : 'seeding'}:\n`);
  const total = summarise();
  if (total !== 73) console.warn(`\n[AdvSentenceSeed] ⚠ expected 73 sentences, found ${total}`);

  if (dry) { process.exit(0); }

  require('dotenv').config();
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(runSeed)
    .then(() => mongoose.disconnect())
    .then(() => console.log('[AdvSentenceSeed] Done'))
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { runSeed, groups };
