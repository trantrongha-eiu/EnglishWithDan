// Contact sheet of idiom illustration candidates, to choose by eye (~10 idioms per sheet).
//   node sheet.js <from> [count=10]   → shots/idioms_<from>.png
//   node sheet.js 2,4,14              → shots/idioms_2.png (just those rows)
// Rows are numbered by position in web/candidates.json; pick with pick.js.
// Thumbs are cropped 8:5 like the Learn card / Quiz image.
const { chromium } = require('../../../node_modules/playwright');
const fs = require('fs');
const path = require('path');
const S = __dirname;
const all = Object.values(JSON.parse(fs.readFileSync(path.join(S, 'web', 'candidates.json'), 'utf8')));
const list = String(process.argv[2] || '').includes(',') ? process.argv[2].split(',').map(Number) : null;
const from = list ? list[0] : +process.argv[2] || 0;
const count = +process.argv[3] || 10;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

(async () => {
  const picked = list ? list.map(n => [n, all[n]]) : all.slice(from, from + count).map((x, i) => [from + i, x]);
  const rows = picked.map(([n, x]) => `
    <div class="row"><div class="t"><b>#${n}</b> ${esc(x.word)}<br><small>${esc(x.definition)}</small><br><small class="q">${esc(x.query)}</small></div>
    <div class="c">${x.cands.map((c, j) => `<figure><img src="${esc(c.thumb)}"><figcaption><b>${'abcdefgh'[j]}</b> ${esc(c.file.replace(/^File:/, '').slice(0, 40))}</figcaption></figure>`).join('') || '<i>no candidates</i>'}</div></div>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{font:12px system-ui;margin:8px;background:#fff}.row{display:flex;border-bottom:2px solid #ccc;padding:6px 0}
    .t{width:190px;flex:none;font-size:14px}.t small{font-size:11px;color:#444}.q{color:#999!important}
    .c{display:flex;flex-wrap:wrap;gap:6px}
    figure{margin:0;width:192px}img{width:192px;height:120px;object-fit:cover;display:block;background:#eee}
    figcaption{font-size:10px;line-height:1.2;word-break:break-all}b{font-size:14px;color:#c00}</style>${rows}`;
  const file = path.join(S, 'web', `sheet_${from}.html`);
  fs.writeFileSync(file, html);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1780, height: 800 }, userAgent: 'EnglishWithDan-covers/1.0 (https://ieltsthayha.com)' });
  await page.goto('file:///' + file.replace(/\\/g, '/'), { waitUntil: 'networkidle', timeout: 120000 }).catch(() => {});
  const broken = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).length);
  fs.mkdirSync(path.join(S, 'shots'), { recursive: true });
  await page.screenshot({ path: path.join(S, 'shots', `idioms_${from}.png`), fullPage: true });
  console.log(`shots/idioms_${from}.png (${picked.length} rows, ${broken} broken thumbs) of ${all.length}`);
  await browser.close();
})();
