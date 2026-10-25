'use strict';
// Vol 7+: apply exact text replacements to passage files made by cutparas.js; each "from" must occur exactly once.
//   node txtfix.js <fixes.js>    fixes.js: module.exports = { 'specs/vol7/t2p2.txt': [[from, to], …], … }
// Use '\n\n' in "from" to join a paragraph split by a page break. Paths are relative to this folder.
const fs = require('fs'), path = require('path');
const fixes = require(path.resolve(process.argv[2]));
let bad = 0;
for (const [f, pairs] of Object.entries(fixes)) {
  const p = path.join(__dirname, f);
  let s = fs.readFileSync(p, 'utf8');
  for (const [a, b] of pairs) {
    const n = s.split(a).length - 1;
    if (n !== 1) { console.log(`✗ ${f}: "${a.slice(0, 60)}" found ${n}×`); bad++; continue; }
    s = s.replace(a, () => b);
  }
  fs.writeFileSync(p, s);
  console.log(`${f}: ${pairs.length} fixes`);
}
process.exitCode = bad ? 1 : 0;
