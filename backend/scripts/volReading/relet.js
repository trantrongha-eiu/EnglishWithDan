'use strict';
// Re-join a lettered passage file in place: every paragraph that does not start with "A." … "J." (or "A ") is glued to the
// previous one (OCR paragraph detection breaks at page ends / short lines).   node relet.js <file>
const fs = require('fs');
const f = process.argv[2];
const ps = fs.readFileSync(f, 'utf8').replace(/\r/g, '').split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
const out = [];
for (const p of ps) {
  if (!out.length || /^([A-J][.)]?\s|#\s|•)/.test(p)) out.push(p);
  else out[out.length - 1] += ' ' + p;
}
fs.writeFileSync(f, out.join('\n\n') + '\n');
console.log(`${ps.length} → ${out.length} paragraphs`);
