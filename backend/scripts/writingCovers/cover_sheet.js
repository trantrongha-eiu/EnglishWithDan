/* global document */
// Contact sheet of cover candidates per topic, to choose by eye (~8 topics per sheet).
//   node cover_sheet.js <from> [count=8]   → shots/covers_<from>.png
//   node cover_sheet.js 2,4,14             → shots/covers_2.png (just those rows)
// Rows are numbered by position in web/candidates.json; each row lists its prompts
// (1., 2., …) — pick one letter per prompt with cover_pick.js.
const { chromium } = require('../../../node_modules/playwright');
const fs = require('fs');
const path = require('path');
const S = __dirname;
const all = Object.entries(JSON.parse(fs.readFileSync(path.join(S, 'web', 'candidates.json'), 'utf8')));
const list = String(process.argv[2] || '').includes(',') ? process.argv[2].split(',').map(Number) : null;
const from = list ? list[0] : +process.argv[2] || 0;
const count = +process.argv[3] || 8;
const L = 'abcdefghijklmn';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

(async () => {
  const picked = list ? list.map(n => [n, all[n]]) : all.slice(from, from + count).map((e, i) => [from + i, e]);
  const rows = picked.map(([n, [topic, x]]) => `
    <div class="row"><div class="t"><b>#${n}</b> ${esc(topic)}<br><small>${esc(x.query)}</small>
      <ol>${x.prompts.map(p => `<li>${esc(p.prompt)}…</li>`).join('')}</ol></div>
    <div class="c">${x.cands.map((c, j) => `<figure><img src="${esc(c.thumb)}"><figcaption><b>${L[j]}</b> ${esc(c.license)} · ${c.w}×${c.h}<br>${esc(c.file.replace(/^File:/, '').slice(0, 48))}</figcaption></figure>`).join('') || '<i>no candidates</i>'}</div></div>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{font:12px system-ui;margin:8px;background:#fff}.row{display:flex;border-bottom:2px solid #ccc;padding:6px 0}
    .t{width:260px;flex:none;font-size:13px}.t ol{margin:4px 0 0;padding-left:18px;font-size:10.5px;line-height:1.3}
    .c{display:flex;flex-wrap:wrap;gap:6px}
    figure{margin:0;width:190px}img{width:190px;height:95px;object-fit:cover;display:block;background:#eee}
    figcaption{font-size:10px;line-height:1.2;word-break:break-all}b{font-size:12px}</style>${rows}`;
  const file = path.join(S, 'web', `sheet_${from}.html`);
  fs.writeFileSync(file, html);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1850, height: 800 }, userAgent: 'EnglishWithDan-covers/1.0 (https://ieltsthayha.com)' });
  await page.goto('file:///' + file.replace(/\\/g, '/'), { waitUntil: 'networkidle', timeout: 120000 }).catch(() => {});
  const broken = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).length);
  fs.mkdirSync(path.join(S, 'shots'), { recursive: true });
  await page.screenshot({ path: path.join(S, 'shots', `covers_${from}.png`), fullPage: true });
  console.log(`shots/covers_${from}.png (${picked.length} rows, ${broken} broken thumbs) of ${all.length}`);
  await browser.close();
})();
