'use strict';
// Tidy an OCR paragraph file (web/vol<V>/paras/…) into a spec passage file: glue paragraphs broken at page ends / short lines
// (next starts lower-case, or previous has no closing punctuation), drop stray one-letter lines, optionally prefix letters.
//   node mkpara.js <in> <out> [--letters] [--skip N]   (--skip: drop the first N paragraphs, e.g. the "You should spend…" line)
const fs = require('fs');
const [inp, out] = process.argv.slice(2);
const letters = process.argv.includes('--letters');
const si = process.argv.indexOf('--skip'), skip = si > 0 ? +process.argv[si + 1] : 0;
let ps = fs.readFileSync(inp, 'utf8').replace(/\r/g, '').split(/\n\s*\n/).map(s => s.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean).slice(skip);
ps = ps.filter(p => !/^[a-zA-Z]\.?$/.test(p));
const res = [];
for (const p of ps) {
  if (res.length && (/^[a-z]/.test(p) || !/[.!?”’"')\]:]$/.test(res[res.length - 1]))) res[res.length - 1] += ' ' + p;
  else res.push(p);
}
const L = 'ABCDEFGHIJKL';
fs.writeFileSync(out, res.map((p, i) => (letters ? L[i] + ' ' : '') + p).join('\n\n') + '\n');
res.forEach((p, i) => console.log((letters ? L[i] : i + 1) + ' ' + p.slice(0, 80)));
