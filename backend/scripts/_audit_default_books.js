'use strict';
// READ-ONLY dry run: what would ensureDefaultBooks (new version) do for every user?
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const VocabBook = require('../models/VocabBook');
const { assignDefaultSlots, canonicalName } = require('../utils/defaultVocabBooks');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const books = await VocabBook.aggregate([
    { $project: { userId: 1, name: 1, isDefault: 1, defaultSlot: 1, wordCount: { $size: { $ifNull: ['$words', []] } } } },
    { $sort: { _id: 1 } },
  ]);
  const byUser = new Map();
  for (const b of books) {
    const k = String(b.userId);
    if (!byUser.has(k)) byUser.set(k, []);
    byUser.get(k).push(b);
  }
  const tot = { promote: 0, promotedWords: 0, rename: 0, discard: 0, create: 0, extra: 0 };
  for (const [uid, list] of byUser) {
    const { bySlot, extra, discard, missing } = assignDefaultSlots(list);
    const lines = [];
    for (const [slot, b] of [...bySlot].sort((x, y) => x[0] - y[0])) {
      if (!b.isDefault) { lines.push(`promote "${b.name}"(${b.wordCount}w) -> slot ${slot}`); tot.promote++; tot.promotedWords += b.wordCount; }
      else if (b.name !== canonicalName(slot)) { lines.push(`rename default "${b.name}"(${b.wordCount}w) -> ${canonicalName(slot)}`); tot.rename++; }
    }
    for (const b of discard) { lines.push(`DELETE empty default "${b.name}" slot ${b.defaultSlot} (${b.wordCount}w)`); tot.discard++; }
    for (const b of extra) { lines.push(`demote extra "${b.name}"(${b.wordCount}w)`); tot.extra++; }
    if (missing.length) { lines.push(`create empty ${missing.map(canonicalName).join(', ')}`); tot.create += missing.length; }
    if (lines.length) console.log(uid, '\n   ' + lines.join('\n   '));
  }
  console.log('\nusers', byUser.size, tot);
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
