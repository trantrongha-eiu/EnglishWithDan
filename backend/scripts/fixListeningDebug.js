'use strict';

/**
 * Listening debug fixes (2026-10-30), found by volListening/ls_deep_audit.js. Applied to every đề lẻ
 * (listeningsections) AND every full-test part (listeningtests.sections) so the copies stay identical.
 *
 *  Rules (what students see):
 *   - question text repeating its own number ("11   The park was…" under the "11" badge) → number removed
 *   - blank glued to a word ("good__Q3__skills") → spaces added; a printed number glued to its own blank → dropped
 *  Hand fixes (by section title, guarded on the current value):
 *   - Walking Holiday Q19/Q20: explanations named the letter one off ("→ E" for vegetation = F, "→ F" for wildlife = G)
 *   - Water Heater Q11: drag word / key "On/off switch" — the grader splits keys on "/", so the right answer could never
 *     be marked correct → "On-off switch"
 *   - Post Office Package Delivery Q8: key "photographs/(some) photographs" → "photographs / some photographs"
 *
 * One updateOne per document, guarded on updatedAt; backup first.
 * Run: node backend/scripts/fixListeningDebug.js [--apply | --restore <backup.json>]
 */

const fs = require('fs');
const path = require('path');

const HAND = {
  'Walking Holiday': {
    expl: { 19: [['→ E đúng.', '→ F đúng.']], 20: [['→ F đúng.', '→ G đúng.']] },
  },
  'Water Heater': {
    keys: { 11: ['On/off switch', 'On-off switch'] },
    dragWords: [['On/off switch', 'On-off switch']],
  },
  'Post Office Package Delivery': {
    keys: { 8: ['photographs/(some) photographs', 'photographs / some photographs'] },
  },
};

function fixTpl(s, nums, where, log) {
  let t = String(s ?? '');
  const t0 = t;
  t = t.replace(/(^|[\s>(●•])(\d{1,2})\.?\s?(__Q(\d+)__)/g, (all, pre, d, ph, n) => (n.startsWith(d) && (all.includes('.') || !/\s/.test(all.slice(pre.length)) || /^\s*$/.test(pre)) ? pre + ph : all));
  t = t.replace(/([A-Za-z0-9,;:)])(__Q\d+__)/g, '$1 $2').replace(/(__Q\d+__)([A-Za-z0-9(])/g, '$1 $2');
  if (t !== t0) log(`${where}: "${t0.replace(/<[^>]+>/g, '').trim().slice(0, 60)}" → "${t.replace(/<[^>]+>/g, '').trim().slice(0, 60)}"`);
  return t;
}

function fixUnit(u, log) {
  for (const g of u.questionGroups || []) {
    const nums = new Set((g.questions || []).map(q => q.questionNumber));
    if (g.noteConfig?.lines) g.noteConfig.lines = g.noteConfig.lines.map(l => fixTpl(l, nums, 'note', log));
    if (g.bulletConfig?.items) g.bulletConfig.items = g.bulletConfig.items.map(l => fixTpl(l, nums, 'bullet', log));
    if (g.tableConfig?.rows) g.tableConfig.rows = g.tableConfig.rows.map(r => r.map(c => fixTpl(c, nums, 'table', log)));
    if (g.summaryConfig?.text) g.summaryConfig.text = fixTpl(g.summaryConfig.text, nums, 'summary', log);
    for (const q of g.questions || []) {
      const t = String(q.questionText || '');
      const m = t.match(/^\s*(\d{1,2})(?:\s*[.):]\s*|\s+)(?=\S)/);
      if (m && +m[1] === q.questionNumber && t.slice(m[0].length).trim().length > 3) {
        q.questionText = t.slice(m[0].length).trim();
        log(`Q${q.questionNumber} text: number removed`);
      }
    }
  }
  const spec = HAND[String(u.title || '').trim()];
  if (!spec) return;
  const Q = n => (u.questionGroups || []).flatMap(g => g.questions || []).find(q => q.questionNumber === +n);
  for (const [n, [from, to]] of Object.entries(spec.keys || {})) {
    const q = Q(n); if (!q || q.correctAnswer === to) continue;
    if (q.correctAnswer !== from) throw new Error(`${u.title} Q${n}: key "${q.correctAnswer}", expected "${from}"`);
    q.correctAnswer = to; log(`Q${n} key "${from}" → "${to}"`);
  }
  for (const [n, pairs] of Object.entries(spec.expl || {})) {
    const q = Q(n); if (!q) continue;
    for (const [from, to] of pairs) if (String(q.explanation).includes(from)) { q.explanation = q.explanation.replace(from, () => to); log(`Q${n} explanation "${from}" → "${to}"`); }
  }
  for (const [from, to] of spec.dragWords || []) for (const g of u.questionGroups || []) {
    const w = g.dragDropConfig?.words; if (!w) continue;
    g.dragDropConfig.words = w.map(x => (String(x).trim() === from ? (log(`drag word "${from}" → "${to}"`), to) : x));
  }
}

async function run() {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const mongoose = require('mongoose');
  const { EJSON } = mongoose.mongo.BSON;
  const args = process.argv.slice(2);
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  try {
    if (args[0] === '--restore') {
      const { sections = [], tests = [] } = EJSON.parse(fs.readFileSync(args[1], 'utf8'), { relaxed: false });
      for (const d of sections) console.log('[restore] S', d.title, (await db.collection('listeningsections').replaceOne({ _id: d._id }, d)).modifiedCount);
      for (const d of tests) console.log('[restore] T', d.name, (await db.collection('listeningtests').replaceOne({ _id: d._id }, d)).modifiedCount);
      return;
    }
    const plans = { sections: [], tests: [] };
    for (const s of await db.collection('listeningsections').find({}).toArray()) {
      const changes = []; const next = JSON.parse(JSON.stringify(s)); fixUnit(next, c => changes.push(c));
      if (changes.length) { plans.sections.push({ p: s, next }); console.log(`\nS ${s._id} "${s.title}"\n  - ${changes.join('\n  - ')}`); }
    }
    for (const t of await db.collection('listeningtests').find({}).toArray()) {
      const changes = []; const next = JSON.parse(JSON.stringify(t));
      next.sections.forEach(p => fixUnit(p, c => changes.push(`P${p.partNumber} ${c}`)));
      if (changes.length) { plans.tests.push({ p: t, next }); console.log(`\nT ${t._id} "${t.name}"\n  - ${changes.join('\n  - ')}`); }
    }
    console.log(`\n[fix] ${plans.sections.length} section(s), ${plans.tests.length} test(s) to update.`);
    if (!args.includes('--apply')) { console.log('[fix] dry run — re-run with --apply.'); return; }
    const dir = path.join(__dirname, 'backups'); fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `listening-debug-fix-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(file, EJSON.stringify({ sections: plans.sections.map(x => x.p), tests: plans.tests.map(x => x.p) }, { relaxed: false }));
    console.log(`[fix] backup → ${file}`);
    let ok = 0;
    // only the question groups change; written back as plain JSON values (ids kept as strings → re-cast below)
    const ObjectId = mongoose.Types.ObjectId;
    const reId = o => Array.isArray(o) ? o.map(reId) : (o && typeof o === 'object')
      ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, k === '_id' && typeof v === 'string' && /^[0-9a-f]{24}$/.test(v) ? new ObjectId(v) : reId(v)])) : o;
    for (const { p, next } of plans.sections) {
      const r = await db.collection('listeningsections').updateOne({ _id: p._id, updatedAt: p.updatedAt }, { $set: { questionGroups: reId(next.questionGroups), updatedAt: new Date() } });
      if (r.matchedCount) ok++; else console.log(`[fix] SKIPPED S "${p.title}" — changed since planning`);
    }
    for (const { p, next } of plans.tests) {
      const set = { updatedAt: new Date() };
      next.sections.forEach((s, i) => { set[`sections.${i}.questionGroups`] = reId(s.questionGroups); });
      const r = await db.collection('listeningtests').updateOne({ _id: p._id, updatedAt: p.updatedAt }, { $set: set });
      if (r.matchedCount) ok++; else console.log(`[fix] SKIPPED T "${p.name}" — changed since planning`);
    }
    console.log(`[fix] applied to ${ok}/${plans.sections.length + plans.tests.length} document(s).`);
  } finally { await mongoose.disconnect(); }
}

if (require.main === module) run().catch(e => { console.error('[fix] FAILED', e.message); process.exit(1); });
