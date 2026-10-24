'use strict';
// READ-ONLY: like dedupe2.js but against the mini-ielts scrape (../miniIelts/web/mini/x_<id>.json, incl. passages never
// imported to the bank) — finds a clean text to diff the OCR against (wdiff.js <ocr> mini:<id>). Prints hits ≥ minPct.
//   node dedupe_mini.js <vol> [minPct=15] [stem]
const fs = require('fs'), path = require('path');
const [vol, minArg, only] = process.argv.slice(2), min = +(minArg || 15);
const mdir = path.join(__dirname, '..', 'miniIelts', 'web', 'mini');
const DOCX = process.env.SRC === 'docx'; // Vol 6: web/vol<V>/docx/<stem>.txt (docxsplit.js) instead of OCR pages
const dir = path.join(__dirname, 'web', `vol${vol}`, DOCX ? 'docx' : 'ocr');
const toks = s => String(s || '').replace(/<[^>]+>/g, ' ').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
const grams = w => { const g = new Set(); for (let i = 0; i + 6 <= w.length; i++) g.add(w.slice(i, i + 6).join(' ')); return g; };
const mini = [];
for (const f of fs.readdirSync(mdir).filter(f => /^x_\d+\.json$/.test(f))) {
  let j; try { j = JSON.parse(fs.readFileSync(path.join(mdir, f), 'utf8')); } catch { continue; }
  const g = grams(toks((j.paras || []).join(' '))); if (g.size > 50) mini.push({ id: j.id, title: j.title, g });
}
const stems = [...new Set(fs.readdirSync(dir).map(f => DOCX ? f.replace(/\.txt$/, '') : f.replace(/_p\d+\.txt$/, '')))].filter(s => !only || s === only);
for (const s of stems) {
  const files = DOCX ? [] : fs.readdirSync(dir).filter(f => f.startsWith(s + '_p'));
  const g = grams(toks(DOCX ? fs.readFileSync(path.join(dir, s + '.txt'), 'utf8') : files.map(f => fs.readFileSync(path.join(dir, f), 'utf8').split(/\r?\n/).map(l => l.split('\t')[1] || '').join(' ')).join(' ')));
  const hits = mini.map(m => { let n = 0; for (const x of m.g) if (g.has(x)) n++; return { m, pct: 100 * n / m.g.size }; }).filter(h => h.pct >= min).sort((a, b) => b.pct - a.pct);
  console.log(`== ${s}`);
  for (const h of hits) console.log(`   ${h.pct.toFixed(0)}% mini ${h.m.id} "${h.m.title}"`);
}
