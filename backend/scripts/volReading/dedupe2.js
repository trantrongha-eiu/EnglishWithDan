'use strict';
// READ-ONLY (Vol 2+ layout): for each OCR'd source file web/vol<V>/ocr/<stem>_p*.txt, which bank passages (web/passages.json)
// does it contain? Score = share of the bank passage's word 6-grams found in the file's OCR text. Prints hits ≥ 15%.
//   node dedupe2.js <vol> [minPct=15]
const fs = require('fs'), path = require('path');
const vol = process.argv[2], min = +(process.argv[3] || 15);
const ps = require('./web/passages.json'), ts = require('./web/tests.json');
const dir = path.join(__dirname, 'web', `vol${vol}`, 'ocr');
const plain = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
const toks = s => plain(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
const grams = w => { const g = new Set(); for (let i = 0; i + 6 <= w.length; i++) g.add(w.slice(i, i + 6).join(' ')); return g; };
const inTests = id => ts.filter(t => (t.passageIds || []).some(x => String(x) === String(id))).map(t => t.name);
const bank = ps.map(p => ({ p, g: grams(toks(p.content)) })).filter(b => b.g.size > 50);
const stems = [...new Set(fs.readdirSync(dir).map(f => f.replace(/_p\d+\.txt$/, '')))];
for (const s of stems) {
  const files = fs.readdirSync(dir).filter(f => f.startsWith(s + '_p')).sort((a, b) => +a.match(/_p(\d+)/)[1] - +b.match(/_p(\d+)/)[1]);
  const text = files.map(f => fs.readFileSync(path.join(dir, f), 'utf8').split(/\r?\n/).map(l => l.split('\t')[1] || '').join(' ')).join(' ');
  const g = grams(toks(text));
  const hits = bank.map(b => { let n = 0; for (const x of b.g) if (g.has(x)) n++; return { p: b.p, pct: 100 * n / b.g.size }; })
    .filter(h => h.pct >= min).sort((a, b) => b.pct - a.pct);
  console.log(`== ${s}`);
  for (const h of hits) console.log(`   ${h.pct.toFixed(0)}% "${h.p.title}" [${h.p._id}] ${h.p.category} ${h.p.questionRange?.start}-${h.p.questionRange?.end} active=${h.p.isActive} | ${inTests(h.p._id).join(', ')}`);
}
