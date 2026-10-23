'use strict';
// Vol 2+ layout: web/vol<V>/keys.json lists, per source file stem, each passage's text pages + question pages →
// web/vol<V>/text/<stem>p<P>.txt (passage OCR, "=== QUESTIONS ===", question OCR). Same format as split.js output.
//   node split2.js <vol>
const fs = require('fs'), path = require('path');
const vol = process.argv[2];
const dir = path.join(__dirname, 'web', `vol${vol}`);
const keys = require(path.join(dir, 'keys.json'));
fs.mkdirSync(path.join(dir, 'text'), { recursive: true });
const JUNK = /fanpage|telegram|facebook\.com|group\s*:|realielts|real ielts|cung c[aấ]p b[oộ]|^\s*\d{1,2}\s*$/i;
const page = (s, k) => fs.readFileSync(path.join(dir, 'ocr', `${/^\d+$/.test(s) ? 't' + s : s}_p${k}.txt`), 'utf8').split(/\r?\n/).map(l => l.split('\t')[1]).filter(t => t != null && !JUNK.test(t));
for (const [s, list] of Object.entries(keys)) list.forEach((k, j) => {
  if (!k) return;
  const out = [`# ${s} P${j + 1} ${k.title}`, ...k.pages.flatMap(p => page(s, p)), '=== QUESTIONS ===', ...k.qpages.flatMap(p => page(s, p))];
  fs.writeFileSync(path.join(dir, 'text', `${/^\d+$/.test(s) ? 't' + s : s}p${j + 1}.txt`), out.join('\n'));
});
