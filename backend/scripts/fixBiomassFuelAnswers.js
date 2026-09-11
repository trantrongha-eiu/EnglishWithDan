'use strict';

/**
 * One-off data fix: "Biomass fuel" (ListeningSection
 * 6a4c9670da428396002190a8) had a badly wrong answer key for ALL 10
 * questions (Q31-Q40) — none of the stored correctAnswer values fit
 * grammatically into their own note-form blank (e.g. Q31's blank reads
 * "made from ___ materials" but the stored answer was "cost"; Q34's blank
 * reads "ground into a ___" but the stored answer was "holes"). The
 * transcript conveniently contains its own inline "(31)".."(40)" markers
 * next to the actual spoken word for each blank — unambiguous ground
 * truth — so this corrects all 10 answers to match. See chat log
 * 2026-09-11.
 *
 * Old -> new:
 *   Q31 cost -> raw            Q36 starch -> electricity
 *   Q32 store -> cleaner       Q37 agriculture -> paper
 *   Q33 powder -> size         Q38 factories -> starch
 *   Q34 holes -> powder        Q39 businesses -> wood
 *   Q35 electricity/energy -> melt   Q40 demand -> institutions
 *
 * Run: node backend/scripts/fixBiomassFuelAnswers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');

const SECTION_ID = '6a4c9670da428396002190a8';

const CORRECTED = {
  31: 'raw',
  32: 'cleaner',
  33: 'size',
  34: 'powder',
  35: 'melt',
  36: 'electricity',
  37: 'paper',
  38: 'starch',
  39: 'wood',
  40: 'institutions',
};

async function run() {
  const section = await ListeningSection.findById(SECTION_ID);
  if (!section) throw new Error(`Section ${SECTION_ID} not found`);
  if (section.title !== 'Biomass fuel') {
    throw new Error(`Refusing to run: expected title "Biomass fuel", found "${section.title}"`);
  }

  let fixed = 0;
  for (const g of section.questionGroups) {
    for (const q of g.questions) {
      const correct = CORRECTED[q.questionNumber];
      if (correct !== undefined && q.correctAnswer !== correct) {
        q.correctAnswer = correct;
        fixed++;
      }
    }
  }
  if (fixed === 0) {
    console.log('[fix] already corrected — nothing to do.');
    return;
  }
  if (fixed !== 10) throw new Error(`Expected to fix exactly 10 answers, fixed ${fixed} — aborting, check the document by hand.`);

  section.markModified('questionGroups');
  await section.save();
  console.log(`[fix] corrected ${fixed} answers (Q31-Q40).`);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await run();
  } finally {
    await mongoose.disconnect();
  }
})().catch(e => { console.error('[fix] FAILED', e); process.exit(1); });
