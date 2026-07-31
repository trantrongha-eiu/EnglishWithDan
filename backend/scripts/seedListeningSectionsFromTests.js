// One-off fix — creates the standalone ListeningSection documents that were
// missing for the 24 ListeningTest docs seeded via seedListeningTest.js
// (Cam 15–19 and Cam 21, Tests 1–4).
//
// Why this was needed: the admin's normal workflow is (1) enter each Part
// as its own ListeningSection with its own audio under "Bài lẻ Listening",
// then (2) use "Tạo Full Test" to copy 4 chosen sections into one
// ListeningTest, then (3) upload one more combined audio to that
// ListeningTest. AssembleModal (admin-src/src/pages/ListeningSections.jsx)
// confirms the two collections are independent copies, not references —
// there is no link from a ListeningTest back to the sections it came from.
// seedListeningTest.js wrote directly into ListeningTest.sections[], so
// step (1) never happened for these 24 tests: they were invisible on the
// "Bài lẻ Listening" page and had no way to get per-part audio uploaded.
//
// This script copies each ListeningTest.sections[i] into a new standalone
// ListeningSection, leaving audioUrl blank for the admin to upload via the
// normal "Bài lẻ Listening" flow. It does not touch the existing
// ListeningTest documents.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const ListeningTest = require('../models/ListeningTest');
const ListeningSection = require('../models/ListeningSection');

const TEST_NAMES = [
  'Cam 15 - Test 1', 'Cam 15 - Test 2', 'Cam 15 - Test 3', 'Cam 15 - Test 4',
  'Cam 16 - Test 1', 'Cam 16 - Test 2', 'Cam 16 - Test 3', 'Cam 16 - Test 4',
  'Cam 17 - Test 1', 'Cam 17 - Test 2', 'Cam 17 - Test 3', 'Cam 17 - Test 4',
  'Cam 18 - Test 1', 'Cam 18 - Test 2', 'Cam 18 - Test 3', 'Cam 18 - Test 4',
  'Cam 19 - Test 1', 'Cam 19 - Test 2', 'Cam 19 - Test 3', 'Cam 19 - Test 4',
  'Cam 21 - Test 1', 'Cam 21 - Test 2', 'Cam 21 - Test 3', 'Cam 21 - Test 4',
];

// Section titles were mostly left as the generic "Part N" placeholder when
// the source text had no distinct topic name — give those a unique,
// searchable title in the standalone-section library instead of 24 rows
// all literally called "Part 1".
function sectionTitle(testName, sec) {
  const t = (sec.title || '').trim();
  return /^Part \d$/.test(t) ? `${testName} – Part ${sec.partNumber}` : t;
}

async function runSeed() {
  let inserted = 0, skipped = 0, missingTests = 0;
  for (const name of TEST_NAMES) {
    const test = await ListeningTest.findOne({ name }).lean();
    if (!test) { console.log(`[SeedListeningSections] ListeningTest not found: "${name}" – skip`); missingTests++; continue; }

    for (const sec of test.sections) {
      const title = sectionTitle(name, sec);
      const existing = await ListeningSection.findOne({ title, partNumber: sec.partNumber }).lean();
      if (existing) {
        console.log(`[SeedListeningSections] "${title}" (Part ${sec.partNumber}) already exists (_id=${existing._id}) – skip`);
        skipped++;
        continue;
      }
      const doc = await ListeningSection.create({
        partNumber: sec.partNumber,
        title,
        description: sec.description || '',
        audioUrl: '',
        audioFileName: '',
        audioDuration: 0,
        transcript: sec.transcript || '',
        questionRange: sec.questionRange,
        questionGroups: sec.questionGroups,
        isActive: true,
        isActualTest: true,
      });
      console.log(`[SeedListeningSections] Inserted "${title}" (Part ${sec.partNumber}, _id=${doc._id})`);
      inserted++;
    }
  }
  console.log(`\n[SeedListeningSections] Done. inserted=${inserted} skipped=${skipped} missingTests=${missingTests}`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedListeningSections] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TEST_NAMES, sectionTitle };
