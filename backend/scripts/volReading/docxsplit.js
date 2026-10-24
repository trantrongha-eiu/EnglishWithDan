'use strict';
// Vol 6: web/vol<V>/full_reading.txt (docx2txt.py of the typed "Full Reading.docx") → web/vol<V>/docx/t<T>p<P>.txt,
// one file per passage (text + questions in the docx's own order). The dedupe scripts read these with SRC=docx.
//   node docxsplit.js <vol>
const fs = require('fs'), path = require('path');
const vol = process.argv[2], dir = path.join(__dirname, 'web', `vol${vol}`);
const lines = fs.readFileSync(path.join(dir, 'full_reading.txt'), 'utf8').split('\n');
const out = path.join(dir, 'docx'); fs.mkdirSync(out, { recursive: true });
let t = 0, p = 0, buf = [];
const flush = () => { if (t && p) fs.writeFileSync(path.join(out, `t${t}p${p}.txt`), buf.join('\n').trim() + '\n'); buf = []; };
for (const l of lines) {
  let m;
  if ((m = l.match(/^\s*TEST\s+(\d+)\s*$/i))) { flush(); t = +m[1]; p = 0; continue; }
  if ((m = l.match(/^\s*READING PASSAGE\s+(\d+)\s*$/i))) { flush(); p = +m[1]; continue; }
  if (/^Thẻ \d+$/.test(l.trim())) continue;
  buf.push(l);
}
flush();
for (const f of fs.readdirSync(out).sort()) console.log(f, fs.readFileSync(path.join(out, f), 'utf8').split('\n').length, 'lines');
