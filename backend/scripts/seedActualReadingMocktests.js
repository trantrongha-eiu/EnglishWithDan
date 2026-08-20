// Creates 20 fixed Reading ReadingTest docs ("Actual Mocktest 1".."Actual
// Mocktest 20"), each pinned to a specific passage1+passage2+passage3
// triplet via the new ReadingTest.passageIds field (see readingService.js
// startTest()) — as opposed to the existing "MockTest Đề Random" test,
// which keeps randomly sampling 3 passages every attempt.
//
// The 20 triplets come from Passage.tags — passages tagged with a
// "<Series> - Test N" pattern (e.g. "Cam 20 - Test 3") are already grouped
// by which original Cambridge test they came from. Verified live: exactly
// 20 complete (passage1+2+3 all present) tagged triplets exist across
// Cam 15/16/17/20/21, Test 1-4 each. Ordered by series then test number so
// "Actual Mocktest 1" == Cam 15 Test 1, ... "Actual Mocktest 20" == Cam 21
// Test 4 — an arbitrary but stable, reproducible numbering.
//
// Run: node scripts/seedActualReadingMocktests.js
'use strict';

const SERIES = ['Cam 15', 'Cam 16', 'Cam 17', 'Cam 20', 'Cam 21'];
const TEST_NUMBERS = [1, 2, 3, 4];

async function runSeed() {
  const Passage = require('../models/Passage');
  const ReadingTest = require('../models/ReadingTest');

  const passages = await Passage.find(
    { isActualTest: true, isActive: true, tags: { $exists: true, $ne: [] } },
    'title category tags'
  ).lean();

  const groups = {};
  passages.forEach(p => {
    const testTag = (p.tags || []).find(t => /Test \d+$/.test(t));
    if (!testTag) return;
    if (!groups[testTag]) groups[testTag] = {};
    groups[testTag][p.category] = p;
  });

  let mocktestNumber = 0;
  let created = 0, skipped = 0;

  for (const series of SERIES) {
    for (const n of TEST_NUMBERS) {
      const tag = `${series} - Test ${n}`;
      const g = groups[tag];
      mocktestNumber++;
      const name = `Actual Mocktest ${mocktestNumber}`;

      if (!g || !g.passage1 || !g.passage2 || !g.passage3) {
        console.warn(`[SeedActualReadingMocktests] SKIP "${name}" — incomplete triplet for tag "${tag}"`);
        skipped++;
        continue;
      }

      const existing = await ReadingTest.findOne({ name });
      if (existing) {
        console.log(`[SeedActualReadingMocktests] "${name}" already exists (_id=${existing._id}) – skip`);
        continue;
      }

      const doc = await ReadingTest.create({
        name,
        seriesName: 'Actual Mocktest',
        testNumber: mocktestNumber,
        isActive: true,
        passageIds: [g.passage1._id, g.passage2._id, g.passage3._id],
      });
      console.log(`[SeedActualReadingMocktests] Created "${name}" (_id=${doc._id}) <- ${tag}: "${g.passage1.title}" / "${g.passage2.title}" / "${g.passage3.title}"`);
      created++;
    }
  }

  console.log(`\n[SeedActualReadingMocktests] Done. created=${created} skipped=${skipped} (out of ${mocktestNumber} targets).`);
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
  })().catch(e => { console.error('[SeedActualReadingMocktests] FAILED', e); process.exit(1); });
}

module.exports = { runSeed };
