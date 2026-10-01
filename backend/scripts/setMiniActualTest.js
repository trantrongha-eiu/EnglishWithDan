'use strict';

/**
 * Tick "Actual test" (isActualTest:true) on every imported mini-ielts Reading
 * passage — they all come from mini-ielts' "Recent Actual Tests" section, so
 * they belong in the Actual Test tab of the practice list like the Cambridge
 * passages (thầy, 2026-10-01). Only that one field (+updatedAt) changes; each
 * passage is updated by _id, conditionally on its updatedAt — never an open filter.
 *
 * Run:  node backend/scripts/setMiniActualTest.js            (dry run)
 *       node backend/scripts/setMiniActualTest.js --apply
 */

const path = require('path');

async function run() {
  const apply = process.argv.includes('--apply');
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const mongoose = require('mongoose');
  const Passage = require('../models/Passage');
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const ps = await Passage.find({ tags: 'mini-ielts' }).select('title isActive isActualTest updatedAt').lean();
    const todo = ps.filter(p => !p.isActualTest);
    console.log(`${ps.length} mini-ielts passages (${ps.filter(p => p.isActive).length} active); ${ps.length - todo.length} already ticked, ${todo.length} to tick`);
    if (!apply) { if (todo.length) console.log('dry run — re-run with --apply.'); return; }
    let ok = 0;
    for (const p of todo) {
      const r = await Passage.collection.updateOne({ _id: p._id, tags: 'mini-ielts', updatedAt: p.updatedAt }, { $set: { isActualTest: true, updatedAt: new Date() } });
      if (r.modifiedCount) ok++; else console.log(`  ✗ changed meanwhile — skipped: ${p.title}`);
    }
    console.log(`✓ ticked ${ok}/${todo.length}`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch(e => { console.error('[actual-test] FAILED', e); process.exit(1); });
