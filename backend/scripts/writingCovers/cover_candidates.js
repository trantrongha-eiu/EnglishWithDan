// READ-ONLY: gather Wikimedia Commons cover candidates for the active Writing Task 2 prompts,
// one search per topic (topics.json: { topic: { query: "q | alt q", ids: [last 6 of promptId] } }).
// Each prompt of a topic gets its own picture, so a topic gets ~2 candidates per prompt.
// Only CC0 / Public-domain files are kept (the card has no room for a credit line);
// landscape only (the card crops ~3:1). Prompts that already have a cover are skipped
// unless --force (to replace one; then setWritingTask2Thumbnail.js --force).
//   node cover_candidates.js [topicRegex] [--force]        → web/candidates.json
// Re-running keeps topics whose query and prompts did not change.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const S = __dirname;
const OUT = path.join(S, 'web', 'candidates.json');
const UA = 'EnglishWithDan-covers/1.0 (https://ieltsthayha.com)';
const force = process.argv.includes('--force');
const arg = process.argv.slice(2).find(a => !a.startsWith('--'));
const only = arg ? new RegExp(arg, 'i') : null;
const topics = require('./topics.json');
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
  const tasks = await require('../../models/WritingTask2').find({ isActive: true }).select('prompt thumbnailUrl').lean();
  await mongoose.disconnect();
  const bySuffix = new Map(tasks.map(t => [String(t._id).slice(-6), t]));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const out = {};
  for (const [topic, { query, ids }] of Object.entries(topics)) {
    const prompts = ids.map(s => bySuffix.get(s)).filter(t => t && (force || !t.thumbnailUrl))
      .map(t => ({ id: String(t._id), prompt: t.prompt.replace(/\s+/g, ' ').slice(0, 90) }));
    if (!prompts.length) continue;
    const key = `${query}#${prompts.map(p => p.id).join(',')}`;
    if ((only && !only.test(topic)) || (prev[topic] && prev[topic].key === key)) { if (prev[topic]) out[topic] = prev[topic]; continue; }
    const want = Math.min(14, Math.max(6, prompts.length * 2 + 4));
    const qs = query.split('|').map(s => s.trim()).filter(Boolean);
    const cands = [];
    for (const q of qs) {
      let n = 0;
      for (const pg of await search(q)) {
        const ii = pg.imageinfo?.[0]; const m = ii?.extmetadata || {};
        const lic = strip(m.LicenseShortName?.value);
        if (!ii || !FREE.test(lic) || !/jpeg|png/.test(ii.mime) || ii.width < 800 || ii.width / ii.height < 1.2) continue;
        if (/trademark/i.test(strip(m.Restrictions?.value))) continue;
        if (cands.some(c => c.file === pg.title)) continue;
        cands.push({ file: pg.title, image: ii.thumburl || ii.url, thumb: (ii.thumburl || ii.url).replace(/\/1280px-/, '/330px-'),
          descriptionUrl: ii.descriptionurl, license: lic, artist: strip(m.Artist?.value).slice(0, 80), w: ii.width, h: ii.height });
        if (++n >= Math.ceil(want / qs.length) || cands.length >= want) break; // every query gets a say
      }
      if (cands.length >= want) break;
      await sleep(400);
    }
    out[topic] = { key, query, prompts, cands };
    console.log(`${String(cands.length).padStart(2)}/${prompts.length} ${topic}  [${query}]`);
    fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
    await sleep(400);
  }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  const short = Object.entries(out).filter(([, x]) => x.cands.length < x.prompts.length).map(([k]) => k);
  console.log(`\n${Object.keys(out).length} topics; fewer candidates than prompts: ${short.join(', ') || 'none'} → ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
