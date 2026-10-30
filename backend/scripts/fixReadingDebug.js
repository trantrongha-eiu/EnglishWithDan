'use strict';

/**
 * Reading bank debug fixes (2026-10-30). Found by volReading/rd_deep_audit.js and by comparing the
 * Actual Mocktest 1–16 keys (Cambridge 15/16/17/20 + Cam 19 T1 passages) with the official answer keys.
 *
 *  1. Hand-checked fixes per passage — data/readingDebugFixes.js (wrong keys, YES/NO sets stored as
 *     TRUE/FALSE, copied / invented explanations, non-verbatim quotes, passage typos, a title).
 *  2. Rules applied to every passage (render problems students see):
 *     - blank glued to a word ("a__Q1__", "__Q3__is") → a space is added
 *     - "__Q2__. surrounds" (stray full stop inside a sentence) → removed
 *     - question text that repeats its own number ("31   At times…") → number removed
 *     - note lines that start with the question number ("24 Corals have…") → number removed
 *     - page markup pasted into the passage (<!DOCTYPE>, <html>, <head>…</head>, <body>) → removed
 *     - group instruction holding HTML (escaped on screen → raw tags) → title moved to groupTitle, tags removed
 *     - "Transcript:" label in Reading explanations → "Trích:" (Reading has no transcript)
 *     - word-bank words / matching options with trailing spaces → trimmed
 *
 * Every write is one updateOne per passage by _id, guarded on updatedAt as read; backup first.
 * Run: node backend/scripts/fixReadingDebug.js [--apply | --restore <backup.json>]
 */

const fs = require('fs');
const path = require('path');
const FIXES = require('./data/readingDebugFixes');

const YN_INSTR = n => `Do the following statements agree with the claims of the writer in Reading Passage ${n}?\nWrite\nYES if the statement agrees with the claims of the writer\nNO if the statement contradicts the claims of the writer\nNOT GIVEN if it is impossible to say what the writer thinks about this`;
const QUOTE_LINE = /^((?:📌\s*)?(?:Trích(?: dẫn)?|Transcript|Dẫn chứng)\s*:)(.*)$/m;

function replaceOnce(s, from, to, what, log) {
  if (from instanceof RegExp) {
    const n = (s.match(new RegExp(from.source, from.flags.includes('g') ? from.flags : from.flags + 'g')) || []).length;
    if (!n) return s;
    log(`${what}: ${from} ×${n}`);
    return s.replace(from, () => to);
  }
  const n = s.split(from).length - 1;
  if (n === 0) return s; // already applied
  if (n > 1) throw new Error(`${what}: "${from.slice(0, 50)}" matches ${n}×`);
  log(`${what}: "${from.slice(0, 60)}" → "${to.slice(0, 60)}"`);
  return s.replace(from, () => to);
}

function autoRules(p, log) {
  // page markup
  const c0 = p.content || '';
  const c1 = c0.replace(/<!DOCTYPE[^>]*>/gi, '').replace(/<\/?html[^>]*>/gi, '').replace(/<head\b[\s\S]*?<\/head>/gi, '')
    .replace(/<\/?body[^>]*>/gi, '').replace(/^\s+/, '');
  if (c1 !== c0) { p.content = c1; log('content: page markup removed'); }

  for (const g of p.questionGroups || []) {
    const qs = g.questions || [];
    const nums = new Set(qs.map(q => q.questionNumber));
    const fixTpl = (s, where) => {
      let t = String(s ?? '');
      const t0 = t;
      // a printed question number glued to its own blank ("covered with 6__Q6__", "7. __Q7__(and)") → dropped
      t = t.replace(/(^|[\s>(●•])(\d{1,2})\.?\s?(__Q(\d+)__)/g, (all, pre, d, ph, n) => (n.startsWith(d) && (all.includes('.') || !/\s/.test(all.slice(pre.length)) || /^\s*$/.test(pre)) ? pre + ph : all));
      t = t.replace(/(__Q\d+__)\(and\)/g, '$1');
      t = t.replace(/([A-Za-z0-9,;:)])(__Q\d+__)/g, '$1 $2').replace(/(__Q\d+__)([A-Za-z0-9(])/g, '$1 $2');
      t = t.replace(/(__Q\d+__)\s*\.\s+(?=[a-z])/g, '$1 ');
      // a note line starting with its own question number ("24 Corals have a number of __Q24__")
      const m = t.match(/^(\s*(?:[●•]\s*)?)(\d{1,2})\s+(?=[A-Z])/);
      if (m && nums.has(+m[2]) && t.includes(`__Q${m[2]}__`)) t = t.replace(/^(\s*(?:[●•]\s*)?)\d{1,2}\s+/, '$1');
      if (t !== t0) log(`${where}: "${t0.replace(/<[^>]+>/g, '').trim().slice(0, 70)}" → "${t.replace(/<[^>]+>/g, '').trim().slice(0, 70)}"`);
      return t;
    };
    if (g.noteConfig?.lines) g.noteConfig.lines = g.noteConfig.lines.map(l => fixTpl(l, 'note'));
    if (g.bulletConfig?.items) g.bulletConfig.items = g.bulletConfig.items.map(l => fixTpl(l, 'bullet'));
    if (g.tableConfig?.rows) g.tableConfig.rows = g.tableConfig.rows.map(r => r.map(c => fixTpl(c, 'table')));
    if (g.summaryConfig?.text) g.summaryConfig.text = fixTpl(g.summaryConfig.text, 'summary');

    // instruction with HTML → title to groupTitle, plain text instruction
    if (/<[a-z][^>]*>/i.test(g.instruction || '')) {
      const m = g.instruction.match(/^\s*<strong>([^<]+)<\/strong>\s*(?:<br\s*\/?>)?\s*/i);
      const before = g.instruction;
      if (m && !String(g.groupTitle || '').includes(m[1].trim())) g.groupTitle = `${String(g.groupTitle || '').trim()}${g.groupTitle ? ': ' : ''}${m[1].trim()}`;
      g.instruction = (m ? g.instruction.slice(m[0].length) : g.instruction).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
      log(`instruction: "${before.slice(0, 60)}" → title "${g.groupTitle}", "${g.instruction.slice(0, 40)}…"`);
    }
    // trailing spaces in banks / options
    (g.summaryConfig?.wordBank || []).forEach(w => { const t = String(w.word || '').trim(); if (t !== w.word) { log(`bank word "${w.word}" trimmed`); w.word = t; } });
    if (Array.isArray(g.matchingOptions)) {
      const m = g.matchingOptions.map(o => String(o).trim());
      if (JSON.stringify(m) !== JSON.stringify(g.matchingOptions)) { log('matchingOptions trimmed'); g.matchingOptions = m; }
    }

    for (const q of qs) {
      // own number repeated in the question text
      const t = String(q.questionText || '');
      const m = t.match(/^\s*(\d{1,2})(?:\s*[.):]\s*|\s+)(?=\S)/);
      if (m && +m[1] === q.questionNumber && t.slice(m[0].length).trim().length > 3) {
        q.questionText = t.slice(m[0].length).trim();
        log(`Q${q.questionNumber} text: number removed ("${q.questionText.slice(0, 40)}…")`);
      }
      const e = String(q.explanation || '');
      const e2 = e.replace(/^Transcript\s*:/gm, 'Trích:').replace(/^Vị trí & Transcript\s*:/gm, 'Vị trí & Trích:');
      if (e2 !== e) { q.explanation = e2; p._transcriptLabels = (p._transcriptLabels || 0) + 1; }
    }
  }
  if (p._transcriptLabels) { log(`explanations: "Transcript:" → "Trích:" in ${p._transcriptLabels} question(s)`); delete p._transcriptLabels; }
}

function handFixes(p, spec, log) {
  if (spec.title && p.title !== spec.title && p.title !== spec.rename) throw new Error(`${p._id}: title is "${p.title}", expected "${spec.title}"`);
  if (spec.rename && p.title !== spec.rename) { log(`title "${p.title}" → "${spec.rename}"`); p.title = spec.rename; }
  for (const [from, to] of spec.content || []) p.content = replaceOnce(p.content, from, to, 'content', log);
  const allQ = (p.questionGroups || []).flatMap(g => g.questions.map(q => ({ g, q })));
  const Q = n => { const x = allQ.find(x => x.q.questionNumber === +n); if (!x) throw new Error(`${p.title}: no Q${n}`); return x; };
  for (const [n, [from, to]] of Object.entries(spec.keys || {})) {
    const { q } = Q(n);
    if (q.correctAnswer === to) continue;
    if (q.correctAnswer !== from) throw new Error(`${p.title} Q${n}: key is "${q.correctAnswer}", expected "${from}"`);
    q.correctAnswer = to; log(`Q${n} key "${from}" → "${to}"`);
  }
  if (spec.yesNo) {
    const map = { TRUE: 'YES', FALSE: 'NO', 'NOT GIVEN': 'NOT GIVEN' };
    const groups = new Set();
    for (const n of spec.yesNo) {
      const { g, q } = Q(n); groups.add(g);
      if (q.type === 'true-false-ng') {
        const k = String(q.correctAnswer).trim().toUpperCase();
        if (!map[k]) throw new Error(`${p.title} Q${n}: key "${q.correctAnswer}"`);
        log(`Q${n} true-false-ng "${q.correctAnswer}" → yes-no-ng "${map[k]}"`);
        q.type = 'yes-no-ng'; q.correctAnswer = map[k];
        q.explanation = String(q.explanation || '').replace(/\bTRUE\b/g, 'YES').replace(/\bFALSE\b/g, 'NO');
      }
    }
    const pn = { passage1: 1, passage2: 2, passage3: 3 }[p.category] || 3;
    for (const g of groups) if (!/claims of the writer|views of the writer/i.test(g.instruction || '')) { g.instruction = YN_INSTR(pn); log(`instruction → YES/NO/NOT GIVEN (claims of the writer)`); }
  }
  for (const [n, v] of Object.entries(spec.expl || {})) {
    const { q } = Q(n);
    if (typeof v === 'string') { if (q.explanation !== v) { q.explanation = v; log(`Q${n} explanation rewritten`); } }
    else for (const [from, to] of v) q.explanation = replaceOnce(String(q.explanation || ''), from, to, `Q${n} explanation`, log);
  }
  for (const [n, text] of Object.entries(spec.quote || {})) {
    const { q } = Q(n);
    const e = String(q.explanation || '');
    const m = e.match(QUOTE_LINE);
    let next;
    if (m && /“|"/.test(m[2]) || m && /^(Trích|Transcript)/.test(m[1])) next = e.replace(QUOTE_LINE, () => `Trích: ${text}`);
    else if (m) next = e.replace(QUOTE_LINE, () => `Trích: ${text}\n\nPhân tích:${m[2]}`); // "Dẫn chứng:" held analysis, not a quote
    else next = e.replace(/^(Vị trí[^\n]*\n+)?/, (all) => `${all}Trích: ${text}\n\n`);
    if (next !== e) { q.explanation = next; log(`Q${n} quote → verbatim`); }
  }
  for (const gspec of spec.groups || []) {
    const { g } = Q(gspec.q);
    for (const [field, pairs] of Object.entries(gspec.replace || {})) for (const [from, to] of pairs) g[field] = replaceOnce(String(g[field] || ''), from, to, `group ${field}`, log);
  }
  for (const [from, to] of spec.summaryText || []) for (const g of p.questionGroups) if (g.summaryConfig?.text?.includes(from)) g.summaryConfig.text = replaceOnce(g.summaryConfig.text, from, to, 'summary', log);
  for (const [from, to] of spec.bankWords || []) for (const g of p.questionGroups) (g.summaryConfig?.wordBank || []).forEach(w => { if (String(w.word).trim() === from) { log(`bank word "${from}" → "${to}"`); w.word = to; } });
}

function planForPassage(p) {
  const changes = [];
  const log = s => changes.push(s);
  const next = JSON.parse(JSON.stringify(p));
  next._id = p._id;
  autoRules(next, log);
  if (FIXES[String(p._id)]) handFixes(next, FIXES[String(p._id)], log);
  // legacy flat questions[]: keep key / type / explanation in step with the groups
  const byN = {};
  (next.questionGroups || []).forEach(g => g.questions.forEach(q => { byN[q.questionNumber] = q; }));
  (next.questions || []).forEach(q => {
    const g = byN[q.questionNumber]; if (!g) return;
    for (const f of ['correctAnswer', 'type', 'explanation', 'questionText']) if (q[f] !== undefined && q[f] !== g[f] && changes.length) q[f] = g[f];
  });
  return changes.length ? { changes, next } : null;
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
    const passages = await col.find({}).toArray();
    const missing = Object.keys(FIXES).filter(id => !passages.some(p => String(p._id) === id));
    if (missing.length) throw new Error(`no passage with _id ${missing.join(', ')}`);
    const plans = [];
    for (const p of passages) {
      const r = planForPassage(p);
      if (!r) continue;
      plans.push({ p, ...r });
      console.log(`\n${p._id} "${p.title}"`);
      r.changes.forEach(c => console.log(`  - ${c}`));
    }
    console.log(`\n[fix] ${plans.length} passage(s) to update.`);
    if (!plans.length || !args.includes('--apply')) { if (plans.length) console.log('[fix] dry run — re-run with --apply.'); return; }

    const dir = path.join(__dirname, 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `reading-debug-fix-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(file, EJSON.stringify(plans.map(x => x.p), { relaxed: false }));
    console.log(`[fix] backup → ${file}`);
    const Passage = require('../models/Passage');
    let ok = 0;
    for (const { p, next } of plans) {
      const doc = new Passage({ ...next, _id: p._id }).toObject();
      const r = await col.updateOne({ _id: p._id, updatedAt: p.updatedAt },
        { $set: { title: next.title, content: next.content, questionGroups: doc.questionGroups, questions: doc.questions, updatedAt: new Date() } });
      if (r.matchedCount === 1) ok++; else console.log(`[fix] SKIPPED "${p.title}" — changed since planning`);
    }
    console.log(`[fix] applied to ${ok}/${plans.length} passage(s).`);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) run().catch(e => { console.error('[fix] FAILED', e.message); process.exit(1); });
module.exports = { planForPassage };
