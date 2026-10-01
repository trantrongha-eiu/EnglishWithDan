// Repair truncated transcripts inside full tests (2026-10-01 audit). Insert-only: our text is kept, and every
// real-content DOL cue (exam framing excluded) that our transcript lacks is inserted after the line that holds
// the previous matched cue, labelled with our speaker name (DOL speaker → our label by majority vote).
// Actual Test 7 P1 is replaced by its complete đề lẻ copy "Holiday Job". Backups → web/backup/.   [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const W = f => path.join(__dirname, 'web', f);
const tri = JSON.parse(fs.readFileSync(W('triage.json'), 'utf8'));
const FRAMING = /^(that is the end|you now have|now (listen|turn)|before you hear|you will hear|first,? you have|in the ielts test|this is the ielts|there will be time|the test is in|at the end of the test|test \d|part (one|two|three|four|\d)\b|questions? \d+ (to|and) \d+|this is the end|listen carefully|all the recordings)/i;
const JOBS = [
  ...[['1', 1], ['2', 1], ['2', 3], ['3', 1], ['3', 2], ['3', 3], ['4', 1], ['4', 3]].map(([t, p]) => ({ test: `Cam 20 - Test ${t}`, part: p, dol: `CAM20_L${t}_S${p}` })),
  { test: 'Actual Test 7', part: 1, section: 'Holiday Job' },
];
const words = s => String(s || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
// our line format: "MAN   text" (label + 2+ spaces) or "Label:" on its own line
const LABEL_INLINE = /^([A-Z][A-Z .'-]{1,24}?)\s{2,}(.*)$/;
const LABEL_ALONE = /^([A-Za-z][A-Za-z .'-]{0,24}):\s*$/;

function merge(ours, cues) {
  const lines = ours.split('\n');
  const lineLabel = []; let cur = '';
  lines.forEach((l, i) => { const a = l.match(LABEL_INLINE), b = l.match(LABEL_ALONE); if (a) cur = a[1].trim(); else if (b) cur = b[1].trim(); lineLabel[i] = cur; });
  const lineGrams = lines.map(l => { const w = words(l), g = new Set(); for (let i = 0; i + 5 <= w.length; i++) g.add(w.slice(i, i + 5).join(' ')); return g; });
  const where = c => {   // best matching line for a cue
    const w = words(c.text); let best = -1, bs = 0;
    lineGrams.forEach((g, i) => { let h = 0, t = 0; for (let k = 0; k + 5 <= w.length; k++) { t++; if (g.has(w.slice(k, k + 5).join(' '))) h++; } const s = t ? h / t : 0; if (s > bs) { bs = s; best = i; } });
    return bs >= 0.3 ? best : -1;
  };
  const vote = {};
  const placed = cues.map(c => ({ c, at: words(c.text).length >= 5 ? where(c) : -2 }));
  placed.forEach(p => { if (p.at >= 0 && p.c.speaker && lineLabel[p.at]) { const v = (vote[p.c.speaker] = vote[p.c.speaker] || {}); v[lineLabel[p.at]] = (v[lineLabel[p.at]] || 0) + 1; } });
  const mapSp = sp => { const v = vote[sp]; return v ? Object.entries(v).sort((a, b) => b[1] - a[1])[0][0] : ''; };
  const inserts = {};   // line index → [new lines]
  let lastAt = 1;
  const added = [];
  for (const p of placed) {
    if (p.at >= 0) { lastAt = Math.max(lastAt, p.at); continue; }
    const text = p.c.text.trim();
    if (p.at === -2 || FRAMING.test(text) || words(text).length < 6) continue;
    const label = mapSp(p.c.speaker);
    (inserts[lastAt] = inserts[lastAt] || []).push(label ? `${label}   ${text}` : text);
    added.push(text);
  }
  const out = [];
  lines.forEach((l, i) => { out.push(l); (inserts[i] || []).forEach(x => out.push(x)); });
  return { text: out.join('\n'), added };
}

(async () => {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  try {
    for (const j of JOBS) {
      const t = await db.collection('listeningtests').findOne({ name: j.test });
      const s = t.sections[j.part - 1];
      let text, note;
      if (j.dol) {
        const d = JSON.parse(fs.readFileSync(W(`draft/${tri.find(x => x.dolSection === j.dol).id}.json`), 'utf8'));
        const m = merge(s.transcript || '', d._cues);
        text = m.text; note = `+${m.added.length} line(s): ${m.added.map(a => a.slice(0, 60)).join(' | ')}`;
      } else {
        text = (await db.collection('listeningsections').findOne({ title: j.section })).transcript;
        note = `replaced by đề lẻ "${j.section}"`;
      }
      console.log(`${apply ? '→' : 'dry'} ${j.test} P${j.part}: ${note}`);
      if (!apply || text === s.transcript) continue;
      fs.writeFileSync(W(`backup/test_${t._id}_P${j.part}_transcript.txt`), s.transcript || '');
      const r = await db.collection('listeningtests').updateOne({ _id: t._id }, { $set: { [`sections.${j.part - 1}.transcript`]: text, updatedAt: new Date() } });
      console.log(`   ${r.modifiedCount ? '✓' : '✗'}`);
    }
  } finally { await mongoose.disconnect(); }
})();
