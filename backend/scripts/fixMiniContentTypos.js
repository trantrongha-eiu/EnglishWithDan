'use strict';

/**
 * One-off text fixes in the content of imported mini-ielts Reading passages,
 * found while writing their explanations. Explicit passage ids; each fix must
 * match at least once, otherwise the passage is left alone. The update is
 * conditional on updatedAt. Also applied to the batch data files so a re-import
 * would carry the fix.
 *
 * Run:  node backend/scripts/fixMiniContentTypos.js            (dry run)
 *       node backend/scripts/fixMiniContentTypos.js --apply
 */

const fs = require('fs');
const path = require('path');

const FIXES = [
  { id: '6abcc44d9bd9acaeb9541fd1', title: 'The success of cellulose', from: /<p>\{([A-J])\}\s*/g, to: '<p><strong>$1</strong> ' },
  { id: '6abd01b21b50c9b87212e5b2', title: 'The history of glass', from: /Modem glass plants/g, to: 'Modern glass plants' },
];

async function run() {
  const apply = process.argv.includes('--apply');
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const mongoose = require('mongoose');
  const Passage = require('../models/Passage');
  await mongoose.connect(process.env.MONGO_URI);
  try {
    for (const f of FIXES) {
      const p = await Passage.findById(f.id).select('title content tags updatedAt').lean();
      if (!p || p.title !== f.title || !(p.tags || []).includes('mini-ielts')) { console.log(`✗ ${f.id}: not the expected passage`); continue; }
      const hits = (p.content.match(f.from) || []).length;
      if (!hits) { console.log(`- ${p.title}: nothing to fix`); continue; }
      const content = p.content.replace(f.from, f.to);
      console.log(`${apply ? '→' : 'would fix'} ${p.title}: ${hits} replacement(s)`);
      if (!apply) continue;
      const r = await Passage.collection.updateOne({ _id: p._id, updatedAt: p.updatedAt }, { $set: { content, updatedAt: new Date() } });
      console.log(`   ${r.modifiedCount ? '✓ written' : '✗ changed meanwhile'}`);
    }
  } finally {
    await mongoose.disconnect();
  }
  // keep the import data files in step
  const dir = path.join(__dirname, 'data', 'miniIeltsReading');
  for (const file of fs.readdirSync(dir).filter(n => n.endsWith('.json'))) {
    const fp = path.join(dir, file);
    const items = JSON.parse(fs.readFileSync(fp, 'utf8'));
    let changed = false;
    for (const it of items) for (const f of FIXES) {
      if (it.doc.title === f.title && f.from.test(it.doc.content)) { f.from.lastIndex = 0; it.doc.content = it.doc.content.replace(f.from, f.to); changed = true; }
      f.from.lastIndex = 0;
    }
    if (changed && apply) { fs.writeFileSync(fp, JSON.stringify(items, null, 1)); console.log(`   updated ${file}`); }
  }
}

run().catch(e => { console.error('[fix] FAILED', e); process.exit(1); });
