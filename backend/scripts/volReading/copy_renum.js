'use strict';
// Draft a renumbered copy of a bank passage so it can sit in another slot of a fixed test (answers are keyed by question
// number across the whole test, so a Passage 1 (Q1–13) cannot be used as Passage 2). Content, questions, keys,
// explanations, cover are copied; numbers in question texts / blanks / group titles / instructions are shifted.
//   node copy_renum.js <vol> <T> <P> <bankIdSuffix> "<new title>" [key overrides n=answer …]
// → web/vol<V>/draft/t<T>p<P>.json (same format as vr_build.js; imported by vr_import.js)
const fs = require('fs'), path = require('path');
const [vol, T, P, suf, title, ...over] = process.argv.slice(2);
const src = require('./web/passages.json').find(p => String(p._id).endsWith(suf));
if (!src) throw new Error('no passage ' + suf);
const start = { 1: 1, 2: 14, 3: 27 }[P];
const off = start - src.questionRange.start;
const shiftRange = s => String(s || '').replace(/\b(\d{1,2})(\s*(?:[-–]|and|to)\s*)(\d{1,2})\b/g, (m, a, sep, b) => (+a < +b && +a >= src.questionRange.start && +b <= src.questionRange.end) ? `${+a + off}${sep}${+b + off}` : m)
  .replace(/Reading Passage \d/g, `Reading Passage ${P}`);
const strip = o => { const { _id, ...r } = o; return r; };
const groups = src.questionGroups.map(g => {
  const n = strip(JSON.parse(JSON.stringify(g)));
  n.groupTitle = shiftRange(n.groupTitle); n.instruction = shiftRange(n.instruction);
  if (n.noteConfig) n.noteConfig.lines = n.noteConfig.lines.map(l => l.replace(/__Q(\d+)__/g, (_, x) => `__Q${+x + off}__`));
  if (n.summaryConfig) n.summaryConfig.text = n.summaryConfig.text.replace(/__Q(\d+)__/g, (_, x) => `__Q${+x + off}__`);
  if (n.tableConfig) n.tableConfig.rows = n.tableConfig.rows.map(r => r.map(c => c.replace(/__Q(\d+)__/g, (_, x) => `__Q${+x + off}__`)));
  n.questions = n.questions.map(q => {
    const r = strip(q); const old = r.questionNumber; r.questionNumber += off;
    if (r.questionText === `Question ${old}`) r.questionText = `Question ${r.questionNumber}`;
    return r;
  });
  return n;
});
for (const o of over) { const [n, a] = o.split('='); groups.forEach(g => g.questions.forEach(q => { if (q.questionNumber === +n) q.correctAnswer = a; })); }
const doc = { title, category: `passage${P}`, content: src.content,questionGroups: groups, questions: [],
  questionRange: { start, end: src.questionRange.end + off }, difficulty: src.difficulty || 'medium', tags: [`vol-${vol}`, 'vol-original-exams'],
  isActive: false, isActualTest: true, thumbnailUrl: src.thumbnailUrl || '' };
const out = path.join(__dirname, 'web', `vol${vol}`, 'draft', `t${T}p${P}.json`);
fs.writeFileSync(out, JSON.stringify({ source: `Vol ${vol} - Test ${T} - Passage ${P} (renumbered copy of "${src.title}" ${src._id})`, imageUrl: null, notes: [], doc }, null, 1));
console.log(`✓ "${title}" passage${P} Q${start}-${doc.questionRange.end} ← "${src.title}" Q${src.questionRange.start}-${src.questionRange.end} (offset ${off}) → ${path.relative(__dirname, out)}`);
for (const g of groups) console.log(`   ${g.groupType} | ${g.groupTitle} | ${g.instruction.slice(0, 100)} | ${g.questions.map(q => q.questionNumber + '=' + q.correctAnswer).join(' ')}`);
