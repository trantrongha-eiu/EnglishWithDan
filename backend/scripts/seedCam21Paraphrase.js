'use strict';

/**
 * Seed the four "Cambridge IELTS 21 – Test N" paraphrase VocabUnits.
 *
 * Data: scripts/data/cam21Paraphrase.js (see its header for source/accuracy).
 * Slots them right after the existing "Cambridge IELTS 20" units by nudging
 * the single "Irregular Verbs" unit to the end — one scoped updateOne, no
 * mass writes, no deleteMany (see memory: incident_vocabbook_mass_delete).
 *
 * Idempotent. Re-running MERGES new paraphrase pairs into each unit by
 * `word` (keeps any teacher edits). Pass --replace to overwrite each unit's
 * words[] wholesale instead.
 *
 * Run:  node backend/scripts/seedCam21Paraphrase.js [--replace]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const VocabUnit = require('../models/VocabUnit');
const TESTS = require('./data/cam21Paraphrase');

const REPLACE = process.argv.includes('--replace');
const TARGET_START = 17;                 // Cam21 Test 1 → unitNumber 17
const IRREGULAR_RE = /^Irregular Verbs/i;
const PARK_NUMBER = 9000;               // temporary unitNumber while reshuffling

function toWordDoc(w) {
  return {
    type: 'paraphrase',
    word: String(w.word || '').trim(),
    paraphrase: String(w.paraphrase || '').trim(),
    meaning: String(w.meaning || '').trim(),
    explanation: String(w.explanation || '').trim(),
  };
}

function mergeWords(existing, incoming) {
  const seen = new Set(existing.map(w => (w.word || '').toLowerCase().trim()));
  const added = incoming.filter(w => !seen.has(w.word.toLowerCase().trim()));
  return { words: existing.concat(added), addedCount: added.length };
}

async function run() {
  const cam21Count = TESTS.length;
  const targetNumbers = TESTS.map((_, i) => TARGET_START + i);          // [17..20]
  const irregularTarget = TARGET_START + cam21Count;                    // 21
  const titles = TESTS.map(t => t.title);

  // 1. Safety: every target slot must be free, OR already held by the unit
  //    we intend to put there (re-run), OR by the Irregular Verbs unit
  //    (which we're about to move out of the way).
  const occupants = await VocabUnit.find({
    unitNumber: { $in: targetNumbers.concat([irregularTarget]) },
  }).select('unitNumber title').lean();

  for (const o of occupants) {
    const okCam21 = titles.includes(o.title) && targetNumbers.includes(o.unitNumber);
    const okIrregular = IRREGULAR_RE.test(o.title);
    if (!okCam21 && !okIrregular) {
      throw new Error(
        `unitNumber ${o.unitNumber} is occupied by "${o.title}" — refusing to overwrite. ` +
        `Adjust TARGET_START in this script or move that unit first.`
      );
    }
  }

  // 2. Park "Irregular Verbs" at a temp number so the target slots are clear
  //    (unique index on unitNumber).
  const irregular = await VocabUnit.findOne({ title: IRREGULAR_RE });
  if (irregular && irregular.unitNumber !== irregularTarget) {
    await VocabUnit.updateOne({ _id: irregular._id }, { $set: { unitNumber: PARK_NUMBER } });
    console.log(`[cam21] parked "${irregular.title}" (#${irregular.unitNumber} → #${PARK_NUMBER})`);
  }

  // 3. Upsert the four Cam 21 units at their target numbers/sortOrder.
  const summary = [];
  for (let i = 0; i < TESTS.length; i++) {
    const t = TESTS[i];
    const unitNumber = targetNumbers[i];
    const sortOrder = TARGET_START - 1 + i; // Cam 20 (2/2) is sortOrder 15
    const incoming = t.words.map(toWordDoc);

    let unit = await VocabUnit.findOne({ title: t.title });
    if (!unit) {
      unit = new VocabUnit({
        unitNumber,
        sortOrder,
        title: t.title,
        description: t.description || '',
        level: 'B1',
        isActive: true,
        words: incoming,
      });
      await unit.save();
      summary.push({ title: t.title, status: 'created', words: unit.words.length });
      continue;
    }

    unit.unitNumber = unitNumber;
    unit.sortOrder = sortOrder;
    unit.description = t.description || unit.description;
    unit.isActive = true;
    if (REPLACE) {
      unit.words = incoming;
      summary.push({ title: t.title, status: 'replaced', words: incoming.length });
    } else {
      const { words, addedCount } = mergeWords(unit.words, incoming);
      unit.words = words;
      summary.push({ title: t.title, status: `merged (+${addedCount})`, words: words.length });
    }
    unit.markModified('words');
    await unit.save();
  }

  // 4. Land "Irregular Verbs" just after the Cam 21 block.
  if (irregular) {
    await VocabUnit.updateOne(
      { _id: irregular._id },
      { $set: { unitNumber: irregularTarget, sortOrder: irregularTarget - 1 } }
    );
    console.log(`[cam21] moved "${irregular.title}" → #${irregularTarget}`);
  }

  console.log('\n[cam21] done:');
  for (const s of summary) console.log(`  #${''} ${s.status.padEnd(14)} ${s.words.toString().padStart(3)} words  ${s.title}`);
  const total = summary.reduce((n, s) => n + s.words, 0);
  console.log(`  total: ${total} paraphrase pairs across ${summary.length} units`);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await run();
  } finally {
    await mongoose.disconnect();
  }
})().catch(e => { console.error('[cam21] FAILED', e); process.exit(1); });
