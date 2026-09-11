'use strict';

/**
 * One-off data fix: ListeningSection 6a509ddcc7a497a299b33db3's `title`
 * field says "Temporary Patient Record Form" — a copy-paste leftover from
 * the unrelated Part 1 form section (6a4ca23dda4283960021a74a). Its actual
 * transcript/questions are a radio talk about the city of Gisborne, New
 * Zealand — content and questions match each other fine, only the title
 * shown to students is wrong. See chat log 2026-09-11.
 *
 * Run: node backend/scripts/fixGisborneSectionTitle.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');

const SECTION_ID = '6a509ddcc7a497a299b33db3';
const NEW_TITLE = 'The City of Gisborne';

async function run() {
  const section = await ListeningSection.findById(SECTION_ID);
  if (!section) throw new Error(`Section ${SECTION_ID} not found`);
  if (section.title === NEW_TITLE) {
    console.log('[fix] already renamed — nothing to do.');
    return;
  }
  if (section.title !== 'Temporary Patient Record Form') {
    throw new Error(`Refusing to run: expected title "Temporary Patient Record Form", found "${section.title}"`);
  }
  section.title = NEW_TITLE;
  await section.save();
  console.log(`[fix] title corrected to "${NEW_TITLE}".`);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await run();
  } finally {
    await mongoose.disconnect();
  }
})().catch(e => { console.error('[fix] FAILED', e); process.exit(1); });
