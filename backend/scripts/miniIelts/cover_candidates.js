// READ-ONLY (DB): gather Wikimedia Commons cover candidates for Reading passages
// that have no cover yet (no thumbnailUrl, no <img> in content — the 118 pre-mini
// passages). Only CC0 / Public-domain files are kept: the card has no room for
// a credit line.
//   node cover_candidates.js [titleRegex]        → web/covers/candidates.json
// Search terms: cover_queries.json { "<passageId>": "query | alt query" } wins,
// otherwise the title. Re-running keeps entries whose query did not change.
const fs = require('fs');
const path = require('path');
const S = __dirname;
const OUT = path.join(S, 'web', 'covers', 'candidates.json');
const UA = 'EnglishWithDan-covers/1.0 (https://ieltsthayha.com)';
const only = process.argv[2] ? new RegExp(process.argv[2], 'i') : null;

const ps = require('./passages.json')
  .filter(p => !(p.tags || []).includes('mini-ielts') && !p.thumbnailUrl && !/<img\s/.test(p.content || ''))
  .sort((a, b) => a.title.localeCompare(b.title));
const overrides = fs.existsSync(path.join(S, 'cover_queries.json')) ? require('./cover_queries.json') : {};
const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};

const strip = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const FREE = /^(cc0|public domain|pd\b|pdm)/i;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function search(q) {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({
    action: 'query', format: 'json', generator: 'search', gsrnamespace: '6', gsrlimit: '40',
    gsrsearch: `${q} filetype:bitmap`, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1280',
    iiextmetadatafilter: 'LicenseShortName|Artist|Restrictions|ObjectName',
  }).forEach(([k, v]) => u.searchParams.set(k, v));
  for (let i = 0; i < 3; i++) {
    const res = await fetch(u, { headers: { 'User-Agent': UA } });
    if (res.status === 429) { await sleep(5000); continue; }
    const j = await res.json();
    return Object.values(j.query?.pages || {}).sort((a, b) => a.index - b.index);
  }
  throw new Error('429 x3');
}

(async () => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const out = {};
  for (const p of ps) {
    const id = String(p._id);
    if (only && !only.test(p.title)) { if (prev[id]) out[id] = prev[id]; continue; }
    const query = overrides[id] || p.title.replace(/[^\p{L}\p{N}' ]+/gu, ' ').replace(/\s+/g, ' ').trim();
    if (prev[id] && prev[id].query === query) { out[id] = prev[id]; continue; }
    const cands = [];
    for (const q of query.split('|').map(s => s.trim()).filter(Boolean)) {
      for (const pg of await search(q)) {
        const ii = pg.imageinfo?.[0]; const m = ii?.extmetadata || {};
        const lic = strip(m.LicenseShortName?.value);
        if (!ii || !FREE.test(lic) || !/jpeg|png/.test(ii.mime) || ii.width < 700 || ii.height < 350) continue;
        if (/trademark/i.test(strip(m.Restrictions?.value))) continue;
        if (cands.some(c => c.file === pg.title)) continue;
        cands.push({ file: pg.title, image: ii.thumburl || ii.url, thumb: (ii.thumburl || ii.url).replace(/\/1280px-/, '/330px-'),
          descriptionUrl: ii.descriptionurl, license: lic, artist: strip(m.Artist?.value).slice(0, 80), w: ii.width, h: ii.height });
        if (cands.length >= 8) break;
      }
      if (cands.length >= 8) break;
      await sleep(400);
    }
    out[id] = { title: p.title, query, cands };
    console.log(`${String(cands.length).padStart(2)} ${p.title}  [${query}]`);
    fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
    await sleep(400);
  }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log(`\n${Object.keys(out).length} passages, ${Object.values(out).filter(x => !x.cands.length).length} without candidates → ${OUT}`);
})();
