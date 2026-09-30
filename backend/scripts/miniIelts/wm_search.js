// Search Wikimedia Commons for a replacement passage illustration and render a contact sheet.
//   node wm_search.js "<query>" [--free]     → shots/wm.png + web/wm.json (numbered candidates)
// --free keeps only CC0 / Public domain (covers); otherwise CC BY / BY-SA are listed too (need a credit line).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const S = __dirname;
const UA = 'EnglishWithDan-covers/1.0 (https://ieltsthayha.com)';
const q = process.argv[2];
const free = process.argv.includes('--free');
const strip = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

(async () => {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({ action: 'query', format: 'json', generator: 'search', gsrnamespace: '6', gsrlimit: '30', gsrsearch: `${q} filetype:bitmap`,
    prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1280', iiextmetadatafilter: 'LicenseShortName|Artist' }).forEach(([k, v]) => u.searchParams.set(k, v));
  const j = await (await fetch(u, { headers: { 'User-Agent': UA } })).json();
  const cands = Object.values(j.query?.pages || {}).sort((a, b) => a.index - b.index).map(p => {
    const ii = p.imageinfo?.[0] || {}; const m = ii.extmetadata || {};
    return { file: p.title, image: ii.thumburl || ii.url, thumb: (ii.thumburl || ii.url || '').replace(/\/1280px-/, '/330px-'), license: strip(m.LicenseShortName?.value), artist: strip(m.Artist?.value).slice(0, 60), w: ii.width, h: ii.height, mime: ii.mime };
  }).filter(c => /jpeg|png/.test(c.mime) && c.w >= 600 && (free ? /^(cc0|public domain|pd\b|pdm)/i : /^(cc0|public domain|pd\b|pdm|cc by)/i).test(c.license)).slice(0, 12);
  fs.writeFileSync(path.join(S, 'web', 'wm.json'), JSON.stringify(cands, null, 1));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  fs.writeFileSync(path.join(S, 'web', 'wm.html'), `<!doctype html><meta charset="utf-8"><body style="margin:6px;font:11px sans-serif;display:flex;flex-wrap:wrap;gap:8px">` +
    cands.map((c, i) => `<figure style="margin:0;width:250px"><img src="${esc(c.thumb)}" style="width:250px;height:160px;object-fit:cover"><figcaption><b style="font-size:14px">${i}</b> ${esc(c.license)} ${c.w}×${c.h}<br>${esc(c.file.slice(5, 60))}<br>${esc(c.artist)}</figcaption></figure>`).join(''));
  cands.forEach((c, i) => console.log(i, c.license, `${c.w}x${c.h}`, c.file, '|', c.artist));
  execFileSync('node', [path.join(S, 'shot.js'), path.join(S, 'web', 'wm.html'), path.join(S, 'shots', 'wm.png'), '1100'], { stdio: 'inherit' });
})();
