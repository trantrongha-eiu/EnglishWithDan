'use strict';

/**
 * Give the Reading passages that share a title a distinguishing suffix
 * (thầy chose renaming over hiding, 2026-10-01 — hiding is not possible:
 * full tests only load isActive passages).
 *
 *   "The Step Pyramid of Djoser" ×2 — same text, different question sets:
 *     the Cambridge 16 Test 1 Passage 2 copy (used by Actual Mocktest 5) gets
 *     "(Cambridge 16)"; the stand-alone Passage 1 rewrite keeps the plain title.
 *   "Jewels from the sea" ×2 — same questions, each embedded in a full test:
 *     suffixed with the mock test that uses it.
 *
 * Only `title` (+ updatedAt) changes, and only while the title is still the
 * old one (conditional update), so an admin edit in between is left alone.
 *
 * Run:  node backend/scripts/renameDuplicatePassages.js            (dry run)
 *       node backend/scripts/renameDuplicatePassages.js --apply
 */

const path = require('path');

const RENAMES = [
  { id: '6a2a76ace802f36848dfa675', from: 'The Step Pyramid of Djoser', to: 'The Step Pyramid of Djoser (Cambridge 16)' },
  { id: '6a553b6e7451993d82bd2881', from: 'Jewels from the sea', to: 'Jewels from the Sea (Mocktest 33)' },
  { id: '6a6f50cf839b40f4e501ec3f', from: 'Jewels from the sea', to: 'Jewels from the Sea (Mocktest 29)' },
];

(async () => {
  const apply = process.argv.includes('--apply');
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const mongoose = require('mongoose');
  const Passage = require('../models/Passage');
  await mongoose.connect(process.env.MONGO_URI);
  try {
    for (const r of RENAMES) {
      const p = await Passage.findById(r.id).select('title').lean();
      if (!p) { console.log(`✗ ${r.id} not found`); continue; }
      if (p.title === r.to) { console.log(`= ${r.to} (already renamed)`); continue; }
      if (p.title !== r.from) { console.log(`✗ ${r.id} title is "${p.title}", expected "${r.from}" — skipped`); continue; }
      if (!apply) { console.log(`→ "${r.from}" → "${r.to}"`); continue; }
      const res = await Passage.collection.updateOne({ _id: p._id, title: r.from }, { $set: { title: r.to, updatedAt: new Date() } });
      console.log(res.modifiedCount ? `✓ "${r.from}" → "${r.to}"` : `✗ ${r.id} changed meanwhile — skipped`);
    }
    if (!apply) console.log('dry run — re-run with --apply.');
  } finally {
    await mongoose.disconnect();
  }
})().catch(e => { console.error(e); process.exit(1); });
