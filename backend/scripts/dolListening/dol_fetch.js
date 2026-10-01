// Download every DOL listening section's FREE content (questions, answer key, transcript cues, audio
// path, images) to web/dol/<id>.json.
//
// DOL's "Giải thích chi tiết theo Linear" is a PAID feature (PRO, 299.000đ/tháng): its text is present
// in the page payload but hidden from free visitors. We do NOT take it — every `explanation` object is
// reduced to the start/end time the free "Listen from here" button uses before anything is written.
//
//   node dol_fetch.js [--only id1,id2] [--force]
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'web', 'dol');
fs.mkdirSync(OUT, { recursive: true });
const items = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', 'dol_items.json'), 'utf8'));
const args = process.argv.slice(2);
const only = args.includes('--only') ? new Set(args[args.indexOf('--only') + 1].split(',')) : null;
const force = args.includes('--force');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));

function scrub(o) {
  if (Array.isArray(o)) return o.map(scrub);
  if (o && typeof o === 'object') {
    const r = {};
    for (const [k, v] of Object.entries(o)) {
      if (k === 'explanation') {
        r[k] = v && typeof v === 'object' ? { startTimeInSeconds: v.startTimeInSeconds, endTimeInSeconds: v.endTimeInSeconds } : null;
      } else if (k === 'waveInfo' || k === 'createdBy' || k === 'lastModifiedBy') continue;
      else r[k] = scrub(v);
    }
    return r;
  }
  return o;
}

async function get(url, json) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, Origin: 'https://tuhoc.dolenglish.vn', Referer: 'https://tuhoc.dolenglish.vn/' } });
      if (r.ok) return json ? r.json() : r.text();
      console.log('  HTTP', r.status, url);
    } catch (e) { console.log('  ERR', e.message); }
    await sleep(3000 * (i + 1));
  }
  return null;
}

(async () => {
  let ok = 0, fail = 0;
  for (const it of items) {
    if (only && !only.has(it.id)) continue;
    const file = path.join(OUT, it.id + '.json');
    if (!force && fs.existsSync(file)) continue;
    const meta = await get(`https://api.dolenglish.vn/public/page-management/api/page/tests/PRACTICE_TEST/${it.id}`, true);
    const sol = meta && (meta.pages || []).find(p => p.templateTypeId === 'VIEW_SOLUTION');
    if (!sol) { console.log('NO SOLUTION PAGE', it.id, it.name); fail++; continue; }
    await sleep(800);
    const html = await get('https://tuhoc.dolenglish.vn/' + sol.url.replace(/^\//, ''), false);
    const m = html && html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) { console.log('NO DATA', it.id, it.name); fail++; continue; }
    const dec = JSON.parse(decodeURIComponent(JSON.parse(m[1]).props.pageProps.encryptedData));
    const data = dec.data && dec.data.data;
    if (!data || !data.questionGroups) { console.log('NO QUESTIONS', it.id, it.name); fail++; continue; }
    delete data.pages;
    fs.writeFileSync(file, JSON.stringify({ listing: it, solutionUrl: sol.url, practiceUrl: (meta.pages.find(p => p.templateTypeId === 'DO_TEST') || {}).url, data: scrub(data) }));
    ok++;
    if (ok % 20 === 0) console.log(`… ${ok} saved`);
    await sleep(1200);
  }
  console.log(`done: saved ${ok}, failed ${fail}`);
})();
