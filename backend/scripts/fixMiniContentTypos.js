'use strict';

/**
 * One-off text fixes in imported mini-ielts Reading passages, found while
 * writing their explanations or debugging. Explicit passage ids; each fix must
 * match at least once, otherwise the passage is left alone. A fix applies to the
 * passage `content` (default) or, with `in: 'summary'`, to the word-bank summary
 * text of its question groups (questionGroups[].summaryConfig.text); `fn(doc)`
 * (with `in: 'groups'`) edits questionGroups directly and returns its change count. The update
 * is conditional on updatedAt and only touches that field. Also applied to the
 * batch data files so a re-import would carry the fix.
 *
 * Run:  node backend/scripts/fixMiniContentTypos.js            (dry run)
 *       node backend/scripts/fixMiniContentTypos.js --apply
 */

const fs = require('fs');
const path = require('path');

const FIXES = [
  { id: '6abcc44d9bd9acaeb9541fd1', title: 'The success of cellulose', from: /<p>\{([A-J])\}\s*/g, to: '<p><strong>$1</strong> ' },
  { id: '6abd01b21b50c9b87212e5b2', title: 'The history of glass', from: /Modem glass plants/g, to: 'Modern glass plants' },
  { id: '6abdb3f33da7a4e8d035c820', title: 'Economic Evolution', from: /<p>\{([A-J])\}\s*/g, to: '<p><strong>$1</strong> ' },
  // mini's own numbering left in the heading
  { id: '6abdb3eb3da7a4e8d035c740', title: 'Facial Expression', from: /<h2>Facial Expression 1<\/h2>/g, to: '<h2>Facial Expression</h2>' },
  { id: '6abdee1454216aa2da157a0c', title: 'Food for Thought', from: /<h2>Food for thought 2<\/h2>/g, to: '<h2>Food for Thought</h2>' },
  // "an __Q37__" pointed students at 'arrangement'; the key is 'blend' (fat and sweat "combine")
  { id: '6abdee0854216aa2da157900', title: 'How to Handle the Sun', in: 'summary', from: /the body has a defense: an __Q37__/g, to: 'the body has a defense: a __Q37__' },
  { id: '6abdf8581a3545ddbcd9fe14', title: 'Can We Believe Our Own Eyes?', from: /arrow’ end\./g, to: 'arrow end.' },
  // the passage has paragraphs A-I but mini listed only A-H → paragraph I could not be picked
  { id: '6abdee0854216aa2da157923', title: 'John Franklin: The Discovery of Slowness', in: 'groups', fn: d => {
    const g = d.questionGroups[0];
    if (g.groupType !== 'matching-options' || g.matchingOptions.join('') !== 'ABCDEFGH') return 0;
    g.matchingOptions = 'ABCDEFGHI'.split('');
    return 1;
  } },
];

// apply a fix to a passage-shaped doc; returns the number of replacements (doc is changed in place)
function applyFix(doc, f) {
  if (f.fn) return f.fn(doc);
  const sub = s => { f.from.lastIndex = 0; const n = (String(s || '').match(f.from) || []).length; f.from.lastIndex = 0; return [n, n ? String(s).replace(f.from, f.to) : s]; };
  if (f.in === 'summary') {
    let hits = 0;
    for (const g of doc.questionGroups || []) {
      if (!g.summaryConfig || !g.summaryConfig.text) continue;
      const [n, t] = sub(g.summaryConfig.text);
      if (n) { hits += n; g.summaryConfig.text = t; }
    }
    return hits;
  }
  const [n, t] = sub(doc.content);
  if (n) doc.content = t;
  return n;
}

async function run() {
  const apply = process.argv.includes('--apply');
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const mongoose = require('mongoose');
  const Passage = require('../models/Passage');
  await mongoose.connect(process.env.MONGO_URI);
  try {
    for (const f of FIXES) {
      const p = await Passage.findById(f.id).select('title content questionGroups tags updatedAt').lean();
      if (!p || p.title !== f.title || !(p.tags || []).includes('mini-ielts')) { console.log(`✗ ${f.id}: not the expected passage`); continue; }
      const hits = applyFix(p, f);
      if (!hits) { console.log(`- ${p.title}: nothing to fix`); continue; }
      console.log(`${apply ? '→' : 'would fix'} ${p.title} (${f.in || 'content'}): ${hits} replacement(s)`);
      if (!apply) continue;
      const field = f.in === 'summary' || f.in === 'groups' ? { questionGroups: p.questionGroups } : { content: p.content };
      const r = await Passage.collection.updateOne({ _id: p._id, updatedAt: p.updatedAt }, { $set: { ...field, updatedAt: new Date() } });
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
    for (const it of items) for (const f of FIXES) if (it.doc.title === f.title && applyFix(it.doc, f)) changed = true;
    if (changed && apply) { fs.writeFileSync(fp, JSON.stringify(items, null, 1)); console.log(`   updated ${file}`); }
  }
}

run().catch(e => { console.error('[fix] FAILED', e); process.exit(1); });
