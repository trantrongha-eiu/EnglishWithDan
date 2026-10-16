'use strict';
// OCR pages (web/vol<V>/ocr/t<T>_p<k>.txt, from ocr.ps1) → web/vol<V>/text/t<T>p<P>.txt = Reading passage P of test T
// (passage text, then a line "=== QUESTIONS ===", then the question pages). Drops watermark/footer lines.
//   node split.js <vol>
const fs = require('fs'), path = require('path');
const vol = process.argv[2];
const dir = path.join(__dirname, 'web', `vol${vol}`);
const ocr = path.join(dir, 'ocr');
const keys = fs.existsSync(path.join(dir, 'keys.json')) ? require(path.join(dir, 'keys.json')) : {};
fs.mkdirSync(path.join(dir, 'text'), { recursive: true });
fs.mkdirSync(path.join(dir, 'paras'), { recursive: true });

// Join OCR lines into paragraphs (→ web/vol<V>/paras/…, a starting point for the spec's passage text): a line ends its
// paragraph when it stops well short of its column's right edge, or the next line starts a lettered paragraph
// ("B. …", "Paragraph C") or is indented. Column = lines of the same page whose left x is within 60 px.
function paragraphs(ls) {
  for (const l of ls) l.right = Math.max(...ls.filter(o => o.k === l.k && Math.abs(o.x - l.x) < 60).map(o => o.x + o.w));
  const out = []; let cur = '';
  ls.forEach((l, i) => {
    const t = l.text.trim();
    cur = cur ? (cur.endsWith('-') && /^[a-z]/.test(t) ? cur.slice(0, -1) + t : cur + ' ' + t) : t;
    const nx = ls[i + 1];
    const short = l.x + l.w < l.right - 70;
    const nextStarts = nx && (/^([A-J][.)]\s|Paragraph [A-J]\b|Section [A-J]\b)/.test(nx.text.trim()) || (nx.k === l.k && nx.x - l.x > 25 && nx.x - l.x < 120));
    if (!nx || short || nextStarts) { out.push(cur); cur = ''; }
  });
  return out;
}
const JUNK = /fanpage|telegram|facebook\.com|group\s*:|realielts|real ielts|cung c[aấ]p b[oộ]|^\s*\d{1,2}\s*$|^\s*(R\s*E\s*A\s*L|E\s*X\s*A\s*M\s*S|IELTS)\s*$/i;
const tests = [...new Set(fs.readdirSync(ocr).map(f => +f.match(/^t(\d+)_/)[1]))].sort((a, b) => a - b);
for (const T of tests) {
  const pages = fs.readdirSync(ocr).filter(f => f.startsWith(`t${T}_p`)).map(f => +f.match(/_p(\d+)/)[1]).sort((a, b) => a - b);
  const lines = [];
  for (const k of pages) for (const l of fs.readFileSync(path.join(ocr, `t${T}_p${k}.txt`), 'utf8').split(/\r?\n/)) {
    const [geo, text] = l.split('\t'); if (text == null || JUNK.test(text)) continue;
    const [x, y, w, h] = geo.trim().split(/\s+/).map(Number);
    lines.push({ k, text, x, y, w, h });
  }
  const startRP = lines.findIndex(l => /^\s*reading passage\b/i.test(l.text));
  const end = lines.findIndex((l, i) => i > startRP && /writing task 1/i.test(l.text));
  const body = lines.slice(startRP, end < 0 ? undefined : end);
  // passage boundaries: "READING PASSAGE n" headings (n optional: Vol 1 T9 P3 just says "READING PASSAGE")
  const heads = body.map((l, i) => /^\s*reading passage\b\s*\d?\s*$/i.test(l.text.trim()) ? i : -1).filter(i => i >= 0);
  // some tests print no "READING PASSAGE 3" heading (Vol 1 T8, T10) → start P3 at its title line (title from keys.json)
  const norm = s => s.toLowerCase().replace(/[^a-z]+/g, ' ').trim();
  const titles = (keys[T] || []).map(k => norm(k.title));
  if (heads.length < 3 && titles[heads.length]) {
    const i = body.findIndex((l, i) => i > heads[heads.length - 1] && norm(l.text) === titles[heads.length]);
    if (i > 0) heads.push(i);
  }
  heads.forEach((h, j) => {
    const chunk = body.slice(h, heads[j + 1] ?? body.length);
    // questions start at the first "Questions N" after the passage title (T9 P3 prints "Questions 28-40" beside its heading)
    const ti = Math.max(0, chunk.findIndex(l => titles[j] && norm(l.text) === titles[j]));
    const q = chunk.findIndex((l, i) => i > ti && /^\s*questions?\s*\d/i.test(l.text));
    const out = [`# T${T} P${j + 1} pages ${chunk[0].k}-${chunk[chunk.length - 1].k}`, ...chunk.slice(0, q < 0 ? undefined : q).map(l => l.text),
      '=== QUESTIONS ===', ...(q < 0 ? [] : chunk.slice(q).map(l => l.text))];
    fs.writeFileSync(path.join(dir, 'text', `t${T}p${j + 1}.txt`), out.join('\n'));
    fs.writeFileSync(path.join(dir, 'paras', `t${T}p${j + 1}.txt`), paragraphs(chunk.slice(1, q < 0 ? undefined : q)).join('\n\n') + '\n');
  });
  console.log(`T${T}: ${heads.length} passages`);
}
