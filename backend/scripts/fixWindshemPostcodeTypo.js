'use strict';

/**
 * One-off data fix: "Windshem Farm Center" (ListeningSection
 * 6a53e0a25c459ab074ced7f5) Q10's stored correctAnswer was "SH121QL", but
 * the transcript clearly says "the postcode is SH12 1LQ." — the last two
 * letters were transposed (QL instead of LQ). Corrected to "SH121LQ".
 * See chat log 2026-09-11.
 *
 * Run: node backend/scripts/fixWindshemPostcodeTypo.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');

const SECTION_ID = '6a53e0a25c459ab074ced7f5';

async function run() {
  const section = await ListeningSection.findById(SECTION_ID);
  if (!section) throw new Error(`Section ${SECTION_ID} not found`);
  if (section.title !== 'Windshem Farm Center') {
    throw new Error(`Refusing to run: unexpected title "${section.title}"`);
  }
  let fixed = 0;
  for (const g of section.questionGroups) {
    for (const q of g.questions) {
      if (q.questionNumber === 10 && q.correctAnswer === 'SH121QL') {
        q.correctAnswer = 'SH121LQ';
        fixed++;
      }
    }
  }
  if (fixed === 0) { console.log('[fix] already corrected — nothing to do.'); return; }
  section.markModified('questionGroups');
  await section.save();
  console.log('[fix] Q10 postcode typo fixed (SH121QL -> SH121LQ).');
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await run();
  } finally {
    await mongoose.disconnect();
  }
})().catch(e => { console.error('[fix] FAILED', e); process.exit(1); });
