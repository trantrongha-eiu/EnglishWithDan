'use strict';
// READ-ONLY (Vol 7): compare the keys in specs/vol<V>/t<T>p<P>.js with the answers in the explanation docx
// (web/vol<V>/expl/t<T>.txt from docx2txt.py: "Câu hỏi N: …" … "Đáp án: X"). Prints only the questions that differ.
//   node explkeys.js <vol> [test…]
const fs = require('fs'), path = require('path');
const [vol, ...only] = process.argv.slice(2);
const dir = path.join(__dirname, 'web', `vol${vol}`, 'expl'), sdir = path.join(__dirname, 'specs', `vol${vol}`);
const n = s => String(s).toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9/]+/g, ' ').trim();
for (const f of fs.readdirSync(dir).filter(f => /^t\d+\.txt$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))) {
  const t = f.match(/\d+/)[0];
  if (only.length && !only.includes(t)) continue;
  const ex = {}; let q = null;
  for (const l of fs.readFileSync(path.join(dir, f), 'utf8').split('\n')) {
    const m = l.match(/^Câu(?: hỏi)?\s*(\d+)(?:\s*[-–]\s*(\d+))?\s*:/); if (m) { q = +m[1]; continue; }
    const a = l.match(/^Đáp án\s*:\s*(.+)/); if (a && q && !ex[q]) ex[q] = a[1].trim();
  }
  const key = {};
  for (const p of [1, 2, 3]) { const sp = path.join(sdir, `t${t}p${p}.js`); if (fs.existsSync(sp)) Object.assign(key, require(sp).key); }
  const diffs = [];
  for (let i = 1; i <= 40; i++) {
    if (key[i] == null) continue;
    const e = ex[i];
    if (e == null) { diffs.push(`${i}: spec "${key[i]}" | expl —`); continue; }
    const kv = String(key[i]).split(/\s*\/\s*/).map(n), ev = n(e);
    if (!kv.some(v => ev === v || ev.startsWith(v + ' ') || ev.includes(v))) diffs.push(`${i}: spec "${key[i]}" | expl "${e}"`);
  }
  console.log(`== T${t}: ${Object.keys(ex).length} expl answers, ${Object.keys(key).length} spec keys${diffs.length ? '' : ', all agree'}`);
  for (const d of diffs) console.log('   ' + d);
}
