/**
 * importTranscripts.js — write reviewed transcripts from
 * backend/scripts/data/missing-transcripts.json back into the DB.
 *
 *   node backend/scripts/importTranscripts.js            # dry run (default)
 *   node backend/scripts/importTranscripts.js --apply    # actually write
 *
 * For each entry with a non-empty `transcript`:
 *   - ListeningTest:      sets sections.$.transcript  (matched by sectionId)
 *   - ListeningSection:   sets transcript             (matched by standaloneSectionId, if present)
 *
 * Every update is scoped to a single _id — no bulk/unscoped updateMany.
 * Skips any entry whose section already has a transcript (won't overwrite).
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const ListeningTest = require('../models/ListeningTest');
const ListeningSection = require('../models/ListeningSection');

const IN = path.join(__dirname, 'data', 'missing-transcripts.json');
const APPLY = process.argv.includes('--apply');
const MIN_LEN = 20;

(async () => {
  if (!fs.existsSync(IN)) { console.error(`Not found: ${IN}\nRun exportMissingTranscripts.js first.`); process.exit(1); }
  const entries = JSON.parse(fs.readFileSync(IN, 'utf8'));
  await mongoose.connect(process.env.MONGO_URI);

  let planned = 0, skippedEmpty = 0, skippedExisting = 0, updatedTests = 0, updatedSections = 0;

  for (const e of entries) {
    const text = (e.transcript || '').trim();
    if (text.length < MIN_LEN) { skippedEmpty++; continue; }

    const test = await ListeningTest.findOne({ _id: e.testId, 'sections._id': e.sectionId }, { 'sections.$': 1 }).lean();
    const current = test && test.sections && test.sections[0] && (test.sections[0].transcript || '').trim();
    if (current && current.length >= MIN_LEN) { skippedExisting++; continue; }

    planned++;
    console.log(`${APPLY ? 'WRITE' : 'PLAN '}  #${e.testNumber} ${e.testName} · Part ${e.partNumber}  (${text.length} chars)${e.standaloneSectionId ? ' [+ standalone]' : ''}`);

    if (APPLY) {
      const r1 = await ListeningTest.updateOne(
        { _id: e.testId, 'sections._id': e.sectionId },
        { $set: { 'sections.$.transcript': text } }
      );
      if (r1.modifiedCount) updatedTests++;

      if (e.standaloneSectionId) {
        const r2 = await ListeningSection.updateOne(
          { _id: e.standaloneSectionId },
          { $set: { transcript: text } }
        );
        if (r2.modifiedCount) updatedSections++;
      }
    }
  }

  console.log(`\n${APPLY ? 'Applied' : 'Dry run'}: ${planned} to write · ${skippedEmpty} empty · ${skippedExisting} already had a transcript`);
  if (APPLY) console.log(`ListeningTest sections updated: ${updatedTests} · standalone ListeningSection updated: ${updatedSections}`);
  else console.log(`Re-run with --apply to write.`);

  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
