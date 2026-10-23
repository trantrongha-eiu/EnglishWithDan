'use strict';
// READ-ONLY: compare the keys OCR'd from the Vol explain files (web/vol<V>/ocr/explain-t<T>_p*.txt, left column "N answer")
// with the bank keys of the passages chosen in specs/vol<V>/tests.js-like map given here. Prints mismatches + numbers not read.
//   node keycmp3.js <vol> <T> <id1> <id2> <id3>
const fs = require('fs'), path = require('path');
const [vol, T, ...ids] = process.argv.slice(2);
const dir = path.join(__dirname, 'web', `vol${vol}`, 'ocr');
const files = fs.readdirSync(dir).filter(f => f.startsWith(`explain-t${T}_p`)).sort((a, b) => +a.match(/_p(\d+)/)[1] - +b.match(/_p(\d+)/)[1]);
const vk = {};
for (const f of files) for (const l of fs.readFileSync(path.join(dir, f), 'utf8').split(/\r?\n/)) {
  const [geo, text] = l.split('\t'); if (text == null) continue;
  if (+geo.trim().split(/\s+/)[0] > 330) continue;
  const m = text.trim().match(/^(\d)\s?(\d)?\s*[.)]?\s*(.+)$/); if (!m) continue;
  const n = +(m[1] + (m[2] || '')); if (n < 1 || n > 40 || vk[n]) continue;
  vk[n] = m[3].trim();
}
const ps = require('./web/passages.json');
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/^not$/, 'not given');
for (const id of ids) {
  const p = ps.find(x => String(x._id).endsWith(id));
  const out = [];
  for (const g of p.questionGroups) for (const q of g.questions) {
    const v = vk[q.questionNumber];
    if (v == null) { out.push(`Q${q.questionNumber} ? (bank ${q.correctAnswer})`); continue; }
    const alts = String(q.correctAnswer).split('/').map(norm);
    if (!alts.includes(norm(v)) && !alts.some(a => norm(v).startsWith(a + ' ') || a.startsWith(norm(v)))) out.push(`Q${q.questionNumber} vol="${v}" bank="${q.correctAnswer}"`);
  }
  console.log(`T${T} "${p.title}": ${out.join('; ') || 'all match'}`);
}
