// Continues the numbering from seedActualReadingMocktests.js (which used
// the 20 tagged "<Series> - Test N" triplets to create "Actual Mocktest
// 1".."Actual Mocktest 20"). This script covers the remaining isActualTest
// passages that have NO tag grouping them to a specific original test —
// per the user's explicit instruction, these are combined arbitrarily:
// shuffle each category pool, then pair one passage1 + one passage2 + one
// passage3 (in list order after shuffling) per new test. There is no
// content relationship between the 3 passages in each of these tests
// beyond "assembled to fill out a full-length mock" — unlike Mocktest
// 1-20, which are genuine original-test triplets.
//
// Counts are uneven (verified live: 20 passage1 / 17 passage2 / 18
// passage3), so the number of triplets is capped by the smallest pool
// (17) — leftover passages that can't complete a triplet are reported and
// left untouched (still usable individually via "Reading lẻ").
//
// Run: node scripts/seedActualReadingMocktestsUntagged.js
'use strict';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function runSeed() {
  const Passage = require('../models/Passage');
  const ReadingTest = require('../models/ReadingTest');

  const untagged = await Passage.find(
    { isActualTest: true, isActive: true, $or: [{ tags: { $exists: false } }, { tags: [] }] },
    'title category'
  ).lean();

  const byCategory = { passage1: [], passage2: [], passage3: [] };
  untagged.forEach(p => byCategory[p.category]?.push(p));

  const p1 = shuffle(byCategory.passage1);
  const p2 = shuffle(byCategory.passage2);
  const p3 = shuffle(byCategory.passage3);
  const tripletCount = Math.min(p1.length, p2.length, p3.length);

  const existingMax = (await ReadingTest.find({ seriesName: 'Actual Mocktest' }, 'testNumber').lean())
    .reduce((max, t) => Math.max(max, t.testNumber || 0), 0);

  let created = 0;
  for (let i = 0; i < tripletCount; i++) {
    const mocktestNumber = existingMax + i + 1;
    const name = `Actual Mocktest ${mocktestNumber}`;

    const existing = await ReadingTest.findOne({ name });
    if (existing) {
      console.log(`[SeedActualReadingMocktestsUntagged] "${name}" already exists (_id=${existing._id}) – skip`);
      continue;
    }

    const doc = await ReadingTest.create({
      name,
      seriesName: 'Actual Mocktest',
      testNumber: mocktestNumber,
      isActive: true,
      passageIds: [p1[i]._id, p2[i]._id, p3[i]._id],
    });
    console.log(`[SeedActualReadingMocktestsUntagged] Created "${name}" (_id=${doc._id}) <- "${p1[i].title}" / "${p2[i].title}" / "${p3[i].title}"`);
    created++;
  }

  const leftover = [
    ...p1.slice(tripletCount).map(p => p.title + ' (passage1)'),
    ...p2.slice(tripletCount).map(p => p.title + ' (passage2)'),
    ...p3.slice(tripletCount).map(p => p.title + ' (passage3)'),
  ];
  console.log(`\n[SeedActualReadingMocktestsUntagged] Done. created=${created} (pools: p1=${p1.length} p2=${p2.length} p3=${p3.length}).`);
  if (leftover.length) {
    console.log(`[SeedActualReadingMocktestsUntagged] Left unpaired (still usable individually via Reading lẻ): ${leftover.join(', ')}`);
  }
}

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedActualReadingMocktestsUntagged] FAILED', e); process.exit(1); });
}

module.exports = { runSeed };
