'use strict';
// READ-ONLY: per-item check that a bank passage's questions are the ones printed in the Vol PDF (OCR):
// every question text / option / heading / ending / note line of the bank passage is looked up in the OCR question
// pages (3-gram coverage); items under 60% are printed. Also prints the bank key next to each question number.
//   node qcheck.js <vol> <T> <P> <passageId|idSuffix> [offset]   (offset: Vol number − bank number, e.g. 13 for a P1 reused as P2)
const fs = require('fs'), path = require('path');
const [vol, T, P, pid, off = '0'] = process.argv.slice(2);
const bank = require('./web/passages.json').find(p => String(p._id) === pid || String(p._id).endsWith(pid));
const keys = require(`./web/vol${vol}/keys.json`)[T][P - 1];
const raw = fs.readFileSync(path.join(__dirname, 'web', `vol${vol}`, 'text', `t${T}p${P}.txt`), 'utf8').split('=== QUESTIONS ===')[1] || '';
const words = s => String(s).replace(/<[^>]+>/g, ' ').replace(/__Q\d+__/g, ' ').toLowerCase().replace(/[‘’`]/g, "'").replace(/[^a-z0-9']+/g, ' ').trim().split(/\s+/).filter(Boolean);
const grams = (w, n = 3) => { const s = new Set(); for (let i = 0; i + n <= w.length; i++) s.add(w.slice(i, i + n).join(' ')); return s; };
const O = grams(words(raw));
const cov = s => { const g = grams(words(s)); if (g.size < 2) return 1; let h = 0; for (const x of g) if (O.has(x)) h++; return h / g.size; };
const items = [];
for (const [gi, g] of (bank.questionGroups || []).entries()) {
  const tag = `G${gi + 1}`;
  items.push([tag + ' instr', g.instruction]);
  for (const o of g.matchingOptions || []) items.push([tag + ' option', o]);
  for (const l of g.noteConfig?.lines || []) items.push([tag + ' note', l]);
  for (const l of g.bulletConfig?.items || []) items.push([tag + ' bullet', l]);
  for (const h of g.headingsConfig?.headings || []) items.push([tag + ' heading ' + h.numeral, h.text]);
  for (const e of g.endingsConfig?.endings || []) items.push([tag + ' ending ' + e.letter, e.text]);
  if (g.summaryConfig?.text) items.push([tag + ' summary', g.summaryConfig.text]);
  for (const w of g.summaryConfig?.wordBank || []) items.push([tag + ' bank ' + w.letter, w.word]);
  for (const r of g.tableConfig?.rows || []) items.push([tag + ' row', r.join(' | ')]);
  for (const q of g.questions || []) {
    items.push([`Q${q.questionNumber}`, q.questionText]);
    for (const o of q.options || []) items.push([`Q${q.questionNumber} opt`, o]);
  }
}
let bad = 0;
for (const [tag, s] of items) { if (!s) continue; const c = cov(s); if (c < 0.6) { bad++; console.log(`  ${(c * 100).toFixed(0).padStart(3)}% ${tag}: ${String(s).replace(/\s+/g, ' ').slice(0, 150)}`); } }
// key comparison (Vol key from keys.json vs bank, with offset)
const m = {}; for (const g of bank.questionGroups || []) for (const q of g.questions || []) m[q.questionNumber + +off] = q.correctAnswer;
const diff = keys.key.map((k, j) => [keys.start + j, k, m[keys.start + j]]).filter(([, a, b]) => String(a).toLowerCase() !== String(b).toLowerCase());
console.log(`T${T}P${P} "${bank.title}": ${items.length} items, ${bad} weak; key diffs: ${diff.map(([n, a, b]) => `Q${n} vol=${a} bank=${b}`).join('; ') || 'none'}`);
