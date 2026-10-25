'use strict';
// Vol 7+: write paragraphs of web/vol<V>/paras/t<T>.txt (pdfparas.js) to a passage file for a spec, blank line between them.
//   node cutparas.js <vol> <test> <out.txt> <from-to|n> […]      e.g. node cutparas.js 7 1 specs/vol7/t1p1.txt 1-10
// Edit the result by hand afterwards (title line, "# standfirst", paragraph letters, typos).
const fs = require('fs'), path = require('path');
const [vol, test, out, ...ranges] = process.argv.slice(2);
const paras = fs.readFileSync(path.join(__dirname, 'web', `vol${vol}`, 'paras', `t${test}.txt`), 'utf8').trim().split('\n')
  .map(l => l.replace(/^\[\d+\|p\d+\]\s*/, ''));
const pick = [];
for (const r of ranges) { const [a, b] = r.split('-').map(Number); for (let i = a; i <= (b ?? a); i++) pick.push(paras[i]); }
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, pick.join('\n\n') + '\n');
console.log(out, pick.length, 'paragraphs');
