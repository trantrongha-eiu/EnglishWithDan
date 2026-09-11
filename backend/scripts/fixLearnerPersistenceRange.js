'use strict';

/**
 * One-off data fix: "Research into Learner Persistence. 13"
 * (ListeningSection 6a53c99e5c459ab074ce99ff, Part 4) has questions
 * numbered 31-40 (matching its "Questions 31 and 32" / "questions 31-40"
 * group titles and its Part 4 slot) but the document's top-level
 * `questionRange` field was stored as {start:1, end:10} — corrected to
 * {start:31, end:40}. Metadata only; the questions/answers themselves
 * were unaffected. See chat log 2026-09-11.
 *
 * Run: node backend/scripts/fixLearnerPersistenceRange.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');

const SECTION_ID = '6a53c99e5c459ab074ce99ff';

async function run() {
  const section = await ListeningSection.findById(SECTION_ID);
  if (!section) throw new Error(`Section ${SECTION_ID} not found`);
  if (section.title !== 'Research into Learner Persistence. 13') {
    throw new Error(`Refusing to run: unexpected title "${section.title}"`);
  }
  if (section.questionRange.start === 31 && section.questionRange.end === 40) {
    console.log('[fix] already corrected — nothing to do.');
    return;
  }
  section.questionRange = { start: 31, end: 40 };
  await section.save();
  console.log('[fix] questionRange corrected to {start:31, end:40}.');
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await run();
  } finally {
    await mongoose.disconnect();
  }
})().catch(e => { console.error('[fix] FAILED', e); process.exit(1); });
