'use strict';

/**
 * One-off content fix for Reading passages (2026-09-30): passage texts that
 * don't match the standard paper the questions were written on, and answer
 * keys that don't match the text. Found by comparing every passage against
 * the local source papers ("IELTS - SUPERVIP/đề thi thật listen-read") and,
 * where there is no local copy, the published passage online.
 *
 * Replaced texts (see data/readingContentFixes.js for why):
 *  - The Tasmanian Tiger (Mocktest 23 P2)   — different article + OCR garbage
 *  - Skyscraper Farming (Mocktest 36 P2)    — content was a copy of "Whale Culture"
 *  - Business Innovation (Mocktest 36 P3)   — distorted rewrite, Q36–40 unanswerable
 *  - Koalas (Mocktest 22 P1)                — not the exam's version (Q5 key)
 * Patched in place (exact substring replacements, each must match once):
 *  see PATCHES below.
 *
 * Every write is one updateOne per passage by _id, guarded on updatedAt as
 * read. Run: node backend/scripts/fixReadingContent.js [--apply | --restore <file>]
 */

const fs = require('fs');
const path = require('path');
const TEXTS = require('./data/readingContentFixes');

// title → { content?: new html, patches?: [[from, to, label]], keys?: {qNum: [from, to]}, questionText?: {...}, headings?: fn }
const PLAN = {
  'The Tasmanian Tiger': { content: TEXTS.TASMANIAN_TIGER },
  'Skyscraper Farming': {
    content: TEXTS.SKYSCRAPER_FARMING,
    groupFix: (p, log) => {
      p.questionGroups.forEach(g => (g.headingsConfig?.headings || []).forEach(h => {
        const t = h.text.replace('capacities ò vertical', 'capacities of vertical').replace('for famers', 'for farmers');
        if (t !== h.text) { log(`heading ${h.numeral} "${h.text}" → "${t}"`); h.text = t; }
      }));
      p.questionGroups.forEach(g => {
        if (Array.isArray(g.matchingOptions)) {
          const m = g.matchingOptions.map(o => String(o).trim());
          if (JSON.stringify(m) !== JSON.stringify(g.matchingOptions)) { log(`matchingOptions trimmed`); g.matchingOptions = m; }
        }
      });
    },
  },
  'Business Innovation': { content: TEXTS.BUSINESS_INNOVATION },
  Koalas: { content: TEXTS.KOALAS },
  'Violins and very cold weather - a hypothesis': {
    patches: [[
      /reached their peak perhaps made that(\s*<\/p>)/,
      "reached their peak perhaps made that crucial difference in the violin's tone and brilliance. Furthermore, the conjunction of elevation, topography, soil properties and a deterioration in climate was temporally unique – climate conditions with temperatures such as those that occurred during the Maunder Minimum simply cannot and do not occur today in areas where the Cremonese makers obtained their wood.$1",
      'paragraph G was cut off after "perhaps made that"',
    ]],
    // "ONE WORD ONLY from the passage": "artistry" is only in the summary's
    // title; the passage has "the skills of these Cremonese artisans".
    keys: { 21: ['artistry', 'skills / skill'] },
    groupFix: (p, log) => {
      const q = p.questionGroups.flatMap(g => g.questions).find(x => x.questionNumber === 21);
      if (/fine artistry/.test(q.explanation || '')) {
        q.explanation = 'Giải thích: Đoạn A: "...the popular belief is that the skills of these Cremonese artisans, combined with either a secret ingredient or undocumented process, gave their instruments the rich sound..." → chất lượng vượt trội phần lớn nhờ "skills" (tay nghề) của những người làm đàn. Lưu ý "artistry" chỉ có trong tiêu đề phần tóm tắt, không có trong bài đọc nên không phải đáp án (ONE WORD ONLY from the passage).';
        log('Q21 explanation rewritten for "skills"');
      }
    },
  },
  'The role of accidents in business': {
    patches: [
      [/‘The cost of accidents, business people tend to call such efforts failure\.’/,
        '‘The cost of accidents that do not prove valuable are often of concern to people in business,’ they write. ‘In business, people tend to call such efforts failure.’',
        'restore "that do not prove valuable are often of concern to people in business, they write. In"'],
      [/notion frequently pushes by consultants/, 'notion frequently pushed by consultants', '"pushes" → "pushed"'],
    ],
  },
  'To catch a king': {
    patches: [[/offered for his capture, through a series of/, 'offered for his capture. Over the following six weeks he managed, through a series of',
      'restore "Over the following six weeks he managed," (sentence had no verb)']],
  },
  'Science and the Stradivarius': {
    patches: [[/of its О\./, 'of its own.', 'Cyrillic "О." → "own."']],
  },
  'The discovery of a baby mammoth': {
    keys: { 24: ['Vegetable', 'vegetation'] }, // "dramatically altered the vegetation"
    syncFlat: true,
  },
  // Legacy flat questions[] kept letter keys (G, J, H…) for the Q31–36
  // word-bank summary; the practice answer-key endpoint used to let them
  // override the group keys (fixed in readingService.getPassageAnswerKey).
  'The persistence and peril of misinformation': { syncFlat: true },
  // Keys below checked against the local answer sheets "Dap an test 3/4.pdf".
  "Children's comprehension of television advertising": {
    keys: { 26: ['shorter', 'funnier'] },
    groupFix: (p, log) => {
      const g = p.questionGroups.find(x => (x.questions || []).some(q => q.questionNumber === 26));
      const lines = g.noteConfig?.lines || [];
      lines.forEach((l, i) => {
        const t = l.replace('they may recognise that advertisements are __Q26__', 'they may recognise that there is a difference in length or that advertisements are __Q26__');
        if (t !== l) { lines[i] = t; log('Q26 summary: restore "that there is a difference in length or"'); }
      });
      const q = g.questions.find(x => x.questionNumber === 26);
      const ex = 'Older children tell commercials from programmes by "affective" cues (\'commercials are funnier than TV programs\') or "perceptual" ones (\'commercials are short and programs are long\'). The summary already covers length ("a difference in length or…"), so the gap takes the affective cue: funnier.';
      if (q.explanation !== ex && /perceptual/.test(q.explanation || '') && !/funnier/.test(q.explanation || '')) { q.explanation = ex; log('Q26 explanation rewritten for "funnier"'); }
    },
  },
  'A New Voyage Round the World': {
    keys: { 36: ['NO', 'NOT GIVEN'] },
    groupFix: (p, log) => {
      const q = p.questionGroups.flatMap(g => g.questions).find(x => x.questionNumber === 36);
      const ex = 'The writer only says Dampier\'s life "has been chronicled in full by numerous biographers" (Clennell Wilkinson 1929, Anton Gill) — nothing about whether any of them knew him personally, so the claim is NOT GIVEN.';
      if (/ruling out personal contact/.test(q.explanation || '')) { q.explanation = ex; log('Q36 explanation rewritten for NOT GIVEN'); }
    },
  },
  "Australia's Megafauna Controversy": {
    keys: { 29: ['YES', 'NO'] },
    groupFix: (p, log) => {
      const q = p.questionGroups.flatMap(g => g.questions).find(x => x.questionNumber === 29);
      const ex = 'The writers accept the dating of the 1–1.7 m layers: "the dating of these layers is accurate". Their objection is to how the finds got there (inconsistent ages of charcoal, sand and bones within a layer), not to the dates themselves — so "unreliable" contradicts their view: NO.';
      if (/Lower-confidence call/.test(q.explanation || '')) { q.explanation = ex; log('Q29 explanation rewritten for NO'); }
    },
  },
  'The relationship between bees and flowering plants': {
    keys: { 25: ['traplining', 'trap-lining / traplining'] }, // passage spells "trap-lining"
  },
  'Keeping the water away': {
    keys: { 22: ['central Europe', 'central Europe / Europe'] }, // answer sheet: "Europe"
  },
  'Climate change reveals ancient artefacts in Norway’s glaciers': {
    keys: { 20: ['micro-organisms', 'micro-organisms / microorganisms'] }, // passage spells "microorganisms"
  },
};

function planForPassage(passage) {
  const spec = PLAN[passage.title];
  if (!spec) return null;
  const p = JSON.parse(JSON.stringify(passage));
  const changes = [];
  const log = s => changes.push(s);
  if (spec.content && p.content !== spec.content) {
    log(`content replaced (${p.content.length} → ${spec.content.length} chars)`);
    p.content = spec.content;
  }
  for (const [re, to, label] of spec.patches || []) {
    const hits = p.content.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')) || [];
    if (hits.length === 0) continue; // already applied
    if (hits.length > 1) throw new Error(`${p.title}: patch "${label}" matches ${hits.length}×`);
    p.content = p.content.replace(re, to);
    log(`content: ${label}`);
  }
  for (const [n, [from, to]] of Object.entries(spec.keys || {})) {
    for (const g of p.questionGroups) for (const q of g.questions) {
      if (q.questionNumber === +n && q.correctAnswer === from) { q.correctAnswer = to; log(`Q${n} key "${from}" → "${to}"`); }
    }
  }
  if (spec.groupFix) spec.groupFix(p, log);
  if (spec.syncFlat) {
    const gk = {};
    p.questionGroups.forEach(g => g.questions.forEach(q => { gk[q.questionNumber] = q.correctAnswer; }));
    (p.questions || []).forEach(q => {
      if (gk[q.questionNumber] !== undefined && gk[q.questionNumber] !== q.correctAnswer) {
        log(`legacy questions[] Q${q.questionNumber} key "${q.correctAnswer}" → "${gk[q.questionNumber]}" (synced to group)`);
        q.correctAnswer = gk[q.questionNumber];
      }
    });
  }
  return changes.length ? { changes, next: p } : null;
}

async function run() {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const mongoose = require('mongoose');
  const { EJSON } = mongoose.mongo.BSON;
  const args = process.argv.slice(2);
  await mongoose.connect(process.env.MONGO_URI);
  const col = mongoose.connection.db.collection('passages');
  try {
    if (args[0] === '--restore') {
      const docs = EJSON.parse(fs.readFileSync(args[1], 'utf8'), { relaxed: false });
      for (const doc of docs) {
        const r = await col.replaceOne({ _id: doc._id }, doc);
        console.log(`[restore] ${doc._id} "${doc.title}" matched=${r.matchedCount} modified=${r.modifiedCount}`);
      }
      return;
    }
    const passages = await col.find({ title: { $in: Object.keys(PLAN) } }).toArray();
    const plans = [];
    for (const p of passages) {
      const r = planForPassage(p);
      if (!r) continue;
      plans.push({ p, ...r });
      console.log(`\n${p._id} "${p.title}"`);
      r.changes.forEach(c => console.log(`  - ${c}`));
    }
    const missing = Object.keys(PLAN).filter(t => !passages.some(p => p.title === t));
    if (missing.length) console.log(`\n[fix] WARNING: no passage titled ${JSON.stringify(missing)}`);
    console.log(`\n[fix] ${plans.length} passage(s) to update.`);
    if (!plans.length || !args.includes('--apply')) { if (plans.length) console.log('[fix] dry run — re-run with --apply.'); return; }

    const dir = path.join(__dirname, 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `reading-content-fix-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(file, EJSON.stringify(plans.map(x => x.p), { relaxed: false }));
    console.log(`[fix] backup → ${file}`);
    const Passage = require('../models/Passage');
    let ok = 0;
    for (const { p, next } of plans) {
      const doc = new Passage({ ...next, _id: p._id }).toObject();
      const groups = doc.questionGroups;
      const r = await col.updateOne({ _id: p._id, updatedAt: p.updatedAt },
        { $set: { content: next.content, questionGroups: groups, questions: doc.questions, updatedAt: new Date() } });
      if (r.matchedCount === 1) ok++; else console.log(`[fix] SKIPPED "${p.title}" — changed since planning`);
    }
    console.log(`[fix] applied to ${ok}/${plans.length} passage(s).`);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) run().catch(e => { console.error('[fix] FAILED', e); process.exit(1); });
module.exports = { planForPassage, PLAN };
