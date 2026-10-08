// READ-ONLY: gather Wikimedia Commons cover candidates for the published Vocab Topics
// lessons (VocabularyLesson) that have no cover yet. Only CC0 / Public-domain files
// are kept: the card has no room for a credit line. Landscape only (the card crops ~3:1).
//   node cover_candidates.js [titleRegex]        → web/candidates.json
// Search terms: cover_queries.json { "<last 6 of lessonId>": "query | alt query" } wins,
// otherwise the title. Re-running keeps entries whose query did not change.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const S = __dirname;
const OUT = path.join(S, 'web', 'candidates.json');
const UA = 'EnglishWithDan-covers/1.0 (https://ieltsthayha.com)';
const only = process.argv[2] ? new RegExp(process.argv[2], 'i') : null;
const queries = require('./cover_queries.json');
const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};

const strip = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const FREE = /^(cc0|public domain|pd\b|pdm)/i;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function search(q) {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({
    action: 'query', format: 'json', generator: 'search', gsrnamespace: '6', gsrlimit: '50',
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
  await mongoose.connect(process.env.MONGO_URI);
  const lessons = await mongoose.connection.collection('vocabularylessons')
    .find({ published: true, $or: [{ thumbnailUrl: '' }, { thumbnailUrl: { $exists: false } }] })
    .project({ title: 1, order: 1 }).sort({ order: 1, createdAt: -1 }).toArray();
  await mongoose.disconnect();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const out = {};
  for (const l of lessons) {
    const id = String(l._id);
    if (only && !only.test(l.title)) { if (prev[id]) out[id] = prev[id]; continue; }
    const query = queries[id.slice(-6)] || l.title.replace(/[^\p{L}\p{N}' ]+/gu, ' ').replace(/\s+/g, ' ').trim();
    if (prev[id] && prev[id].query === query) { out[id] = prev[id]; continue; }
    const cands = [];
    for (const q of query.split('|').map(s => s.trim()).filter(Boolean)) {
      let n = 0;
      for (const pg of await search(q)) {
        const ii = pg.imageinfo?.[0]; const m = ii?.extmetadata || {};
        const lic = strip(m.LicenseShortName?.value);
        if (!ii || !FREE.test(lic) || !/jpeg|png/.test(ii.mime) || ii.width < 800 || ii.width / ii.height < 1.2) continue;
        if (/trademark/i.test(strip(m.Restrictions?.value))) continue;
        if (cands.some(c => c.file === pg.title)) continue;
        cands.push({ file: pg.title, image: ii.thumburl || ii.url, thumb: (ii.thumburl || ii.url).replace(/\/1280px-/, '/330px-'),
          descriptionUrl: ii.descriptionurl, license: lic, artist: strip(m.Artist?.value).slice(0, 80), w: ii.width, h: ii.height });
        if (++n >= 5 || cands.length >= 10) break; // up to 5 per query so the alt query gets a say
      }
      if (cands.length >= 10) break;
      await sleep(400);
    }
    out[id] = { title: l.title, query, cands };
    console.log(`${String(cands.length).padStart(2)} ${l.title}  [${query}]`);
    fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
    await sleep(400);
  }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log(`\n${Object.keys(out).length} lessons, ${Object.values(out).filter(x => !x.cands.length).length} without candidates → ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
