// READ-ONLY: gather Wikimedia Commons illustration candidates for each idiom of the
// "IELTS Speaking – Idioms thông dụng" Vocab Topic. Same pipeline as the card covers
// (vocabCovers/, miniIelts/): only CC0 / Public-domain files, because the word card
// has no room for a credit line.
//   node candidates.js [idiomRegex]      → web/candidates.json
// Search terms come from queries.json { "<idiom>": "query | alt query" }.
// Re-running keeps entries whose query did not change.
const fs = require('fs');
const path = require('path');
const S = __dirname;
const OUT = path.join(S, 'web', 'candidates.json');
const UA = 'EnglishWithDan-covers/1.0 (https://ieltsthayha.com)';
const only = process.argv[2] ? new RegExp(process.argv[2], 'i') : null;
const queries = require('./queries.json');
const rows = require('../data/idiomsIeltsSpeaking.json');
const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};

const strip = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const FREE = /^(cc0|public domain|pd\b|pdm)/i;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function search(q) {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({
    action: 'query', format: 'json', generator: 'search', gsrnamespace: '6', gsrlimit: '50',
    gsrsearch: `${q} filetype:bitmap`, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '960',
    iiextmetadatafilter: 'LicenseShortName|Artist|Restrictions',
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
  for (const [word, meaning, definition] of rows) {
    const query = queries[word];
    if (!query) throw new Error(`no query for "${word}"`);
    if ((only && !only.test(word)) || (prev[word] && prev[word].query === query)) { if (prev[word]) out[word] = prev[word]; continue; }
    const cands = [];
    for (const q of query.split('|').map(s => s.trim()).filter(Boolean)) {
      let n = 0;
      for (const pg of await search(q)) {
        const ii = pg.imageinfo?.[0]; const m = ii?.extmetadata || {};
        const lic = strip(m.LicenseShortName?.value);
        const ratio = ii ? ii.width / ii.height : 0;
        if (!ii || !FREE.test(lic) || !/jpeg|png/.test(ii.mime) || ii.width < 600 || ratio < 0.9 || ratio > 2.2) continue;
        if (/trademark/i.test(strip(m.Restrictions?.value))) continue;
        if (cands.some(c => c.file === pg.title)) continue;
        const image = ii.thumburl || ii.url;
        cands.push({ file: pg.title, image, thumb: image.replace(/\/960px-/, '/330px-'),
          descriptionUrl: ii.descriptionurl, license: lic, artist: strip(m.Artist?.value).slice(0, 80), w: ii.width, h: ii.height });
        if (++n >= 4 || cands.length >= 8) break; // up to 4 per query so the alt query gets a say
      }
      if (cands.length >= 8) break;
      await sleep(400);
    }
    out[word] = { word, meaning, definition, query, cands };
    console.log(`${String(cands.length).padStart(2)} ${word}  [${query}]`);
    fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
    await sleep(400);
  }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log(`\n${Object.keys(out).length} idioms, ${Object.values(out).filter(x => !x.cands.length).length} without candidates → ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
