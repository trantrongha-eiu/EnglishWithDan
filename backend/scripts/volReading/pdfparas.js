'use strict';
// Vol 7+ (PDFs with a text layer): web/vol<V>/txt/t<T>.txt (pymupdf get_text per page, "##### PAGE k" markers)
// → web/vol<V>/paras/t<T>.txt: lines joined into paragraphs (a blank line = paragraph break; a page break is not),
// each paragraph prefixed with its number "[n]" so specs can be cut by paragraph range.
//   node pdfparas.js <vol> [test…]
const fs = require('fs'), path = require('path');
const [vol, ...only] = process.argv.slice(2);
const dir = path.join(__dirname, 'web', `vol${vol}`);
const out = path.join(dir, 'paras'); fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(path.join(dir, 'txt')).filter(f => /^t\d+\.txt$/.test(f))) {
  const t = f.match(/\d+/)[0];
  if (only.length && !only.includes(t)) continue;
  const lines = fs.readFileSync(path.join(dir, 'txt', f), 'utf8').replace(/\r/g, '').split('\n');
  const paras = []; let cur = [], page = 0;
  const flush = () => { if (cur.length) paras.push({ page, s: cur.join(' ').replace(/\s+/g, ' ').replace(/(\w)- (\w)/g, '$1-$2').trim() }); cur = []; };
  for (const l of lines) {
    const m = l.match(/^##### PAGE (\d+)/);
    if (m) { if (!cur.length) page = +m[1]; continue; }
    if (!l.trim()) { flush(); continue; }
    if (!cur.length) page = page || 1;
    cur.push(l.trim());
  }
  flush();
  fs.writeFileSync(path.join(out, f), paras.map((p, i) => `[${i}|p${p.page}] ${p.s}`).join('\n') + '\n');
  console.log(f, paras.length, 'paragraphs');
}
