// Reading: name the Cambridge sets "Cam N - Test M" (like Listening already does) — 2026-11-25.
//   • Full test:  ReadingTest "Actual Mocktest 1–20" → "Cam 15/16/17/20/21 - Test 1–4" (seriesName "Cam N").
//     Mapping from volReading/README.md (cam_keys.txt + cam_keycmp.js checked 657 keys against the books).
//   • Bài lẻ:     Passage.source = "Cam N - Test M" on every passage of those tests, the 3 Cam 19 Test 1 passages
//     that sit inside other mocktests (AM23 P1 / AM24 P2 / AM27 P3), and any other copy with the same title + text.
//     The bài lẻ card shows it; "(Cambridge 16)" is dropped from the Djoser title since the label now says it.
//   • Homework:   assignment resource labels that still say "Actual Mocktest N" for a renamed test.
// Dry run by default; --apply writes (backup in ../backups/cam-reading-rename-*.json).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
// Actual Mocktest number → [Cam book, test]
const AM_TO_CAM = {};
[[15, 1], [16, 5], [17, 9], [20, 13], [21, 17]].forEach(([cam, first]) => {
  for (let t = 1; t <= 4; t++) AM_TO_CAM[first + t - 1] = [cam, t];
});
// Cam passages inside mixed mocktests: [mocktest, passage index 0-2, label]
const LOOSE = [[23, 0, 'Cam 19 - Test 1'], [24, 1, 'Cam 19 - Test 1'], [27, 2, 'Cam 19 - Test 1']];
const TITLE_FIX = { 'The Step Pyramid of Djoser (Cambridge 16)': 'The Step Pyramid of Djoser' };

const norm = s => String(s || '').toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
const words = s => new Set(norm(s).split(' ').filter(w => w.length > 3));
const overlap = (a, b) => { const A = words(a), B = words(b); let n = 0; A.forEach(w => { if (B.has(w)) n++; }); return n / Math.max(1, Math.min(A.size, B.size)); };

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const tests = await db.collection('readingtests').find({ seriesName: 'Actual Mocktest' }).toArray();
  const byNo = Object.fromEntries(tests.map(t => [t.testNumber, t]));
  const backup = { tests: [], passages: [], assignments: [] };
  const testOps = [], passageSet = new Map(); // passageId → label

  for (const [am, [cam, tn]] of Object.entries(AM_TO_CAM)) {
    const t = byNo[am];
    if (!t) { console.log('MISSING Actual Mocktest', am); continue; }
    const name = `Cam ${cam} - Test ${tn}`;
    backup.tests.push({ _id: t._id, name: t.name, seriesName: t.seriesName, testNumber: t.testNumber });
    testOps.push({ t, set: { name, seriesName: `Cam ${cam}`, testNumber: tn } });
    (t.passageIds || []).forEach(id => passageSet.set(String(id), name));
  }
  for (const [am, i, label] of LOOSE) {
    const id = byNo[am]?.passageIds?.[i];
    if (id) passageSet.set(String(id), label); else console.log('MISSING loose passage', am, i);
  }

  const ids = [...passageSet.keys()].map(id => new mongoose.Types.ObjectId(id));
  const camPs = await db.collection('passages').find({ _id: { $in: ids } }, { projection: { title: 1, content: 1, source: 1 } }).toArray();
  // other copies of the same passage (same title, ≥80% shared words)
  const titles = camPs.map(p => p.title);
  const fixedTitles = Object.keys(TITLE_FIX).filter(k => titles.includes(k)).map(k => TITLE_FIX[k]);
  const copies = await db.collection('passages').find({ _id: { $nin: ids }, title: { $in: [...titles, ...fixedTitles] } }, { projection: { title: 1, content: 1, source: 1 } }).toArray();
  for (const c of copies) {
    const orig = camPs.find(p => p.title === c.title || TITLE_FIX[p.title] === c.title);
    const ov = overlap(orig.content, c.content);
    console.log(`copy "${c.title}" ${c._id} overlap ${(ov * 100).toFixed(0)}% ${ov >= 0.8 ? '→ label' : '→ skip'}`);
    if (ov >= 0.8) passageSet.set(String(c._id), passageSet.get(String(orig._id)));
  }

  const allIds = [...passageSet.keys()].map(id => new mongoose.Types.ObjectId(id));
  const allPs = await db.collection('passages').find({ _id: { $in: allIds } }, { projection: { title: 1, source: 1 } }).toArray();
  const passageOps = allPs.map(p => {
    backup.passages.push({ _id: p._id, title: p.title, source: p.source });
    const set = { source: passageSet.get(String(p._id)) };
    if (TITLE_FIX[p.title]) set.title = TITLE_FIX[p.title];
    return { p, set };
  });

  // homework labels
  const renamed = Object.fromEntries(testOps.map(o => [String(o.t._id), o]));
  const asg = await db.collection('assignments').find({ 'resources.resourceType': 'reading_test' }).toArray();
  const asgOps = [];
  for (const a of asg) {
    let changed = false;
    const items = (a.resources || []).map(it => {
      const o = it.resourceType === 'reading_test' && renamed[String(it.resourceId)];
      if (o && it.label === o.t.name) { changed = true; return { ...it, label: o.set.name }; }
      return it;
    });
    if (changed) { backup.assignments.push({ _id: a._id, resources: a.resources }); asgOps.push({ a, items }); }
  }

  testOps.forEach(o => console.log(`test  ${o.t.name.padEnd(20)} → ${o.set.name}`));
  passageOps.forEach(o => console.log(`pass  ${o.set.source.padEnd(16)} ${o.p.title}${o.set.title ? `  (title → ${o.set.title})` : ''}`));
  asgOps.forEach(o => console.log(`hw    assignment ${o.a._id}`));
  console.log(`\n${testOps.length} tests, ${passageOps.length} passages, ${asgOps.length} assignments ${APPLY ? '— APPLYING' : '(dry run, add --apply)'}`);

  if (APPLY) {
    const dir = path.join(__dirname, '..', 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const f = path.join(dir, `cam-reading-rename-${Date.now()}.json`);
    fs.writeFileSync(f, JSON.stringify(backup, null, 1));
    for (const o of testOps) await db.collection('readingtests').updateOne({ _id: o.t._id }, { $set: o.set });
    for (const o of passageOps) await db.collection('passages').updateOne({ _id: o.p._id }, { $set: o.set });
    for (const o of asgOps) await db.collection('assignments').updateOne({ _id: o.a._id }, { $set: { resources: o.items } });
    console.log('backup', f);
  }
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
