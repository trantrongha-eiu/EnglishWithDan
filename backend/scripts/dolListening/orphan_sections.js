// READ-ONLY: đề lẻ that are not already a part of any full test (transcript 8-gram / question overlap /
// same title+part, like dol_triage.js), with their source (DOL book/test/section when known).
//   node orphan_sections.js            → web/orphans.json + summary
const fs = require('fs'), path = require('path');
const W = f => path.join(__dirname, 'web', f);
const sections = JSON.parse(fs.readFileSync(W('sections.json'), 'utf8'));
const tests = JSON.parse(fs.readFileSync(W('tests.json'), 'utf8'));
const imported = JSON.parse(fs.readFileSync(W('imported.json'), 'utf8'));
const items = JSON.parse(fs.readFileSync(W('dol_items.json'), 'utf8'));
const triage = JSON.parse(fs.readFileSync(W('triage.json'), 'utf8'));

const strip = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
const words = s => strip(s).toLowerCase().replace(/[’']/g, '').match(/[a-z0-9]+/g) || [];
const grams = (s, n = 8) => { const w = words(s), g = new Set(); for (let i = 0; i + n <= w.length; i++) g.add(w.slice(i, i + n).join(' ')); return g; };
const ov = (a, b) => { if (!a.size || !b.size) return 0; let n = 0; for (const x of a) if (b.has(x)) n++; return n / Math.min(a.size, b.size); };
const nt = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const qtext = gs => gs.map(g => JSON.stringify([g.noteConfig, g.tableConfig, g.matchingOptions, g.questions.map(q => [q.questionText, q.options])])).join(' ');

const inTests = [];
for (const t of tests) (t.sections || []).forEach((s, i) => inTests.push({ test: t.name, part: s.partNumber || i + 1, title: nt(s.title), g: grams(s.transcript), q: grams(qtext(s.questionGroups || []), 6) }));

const dolOf = {};
for (const [dolId, sid] of Object.entries(imported)) dolOf[sid] = dolId;

const out = [];
for (const s of sections) {
  const g = grams(s.transcript);
  let best = { s: 0 };
  for (const o of inTests) {
    // transcript only: note-form question texts are just "Q1 Q2 …", so question grams match everything
    const sc = Math.max(ov(g, o.g), (o.title === nt(s.title) && o.part === s.partNumber) ? 1 : 0);
    if (sc > best.s) best = { s: sc, test: o.test };
  }
  if (best.s >= 0.3) continue;
  let src = null;
  const dolId = dolOf[s._id];
  if (dolId) {
    const tr = triage.find(r => r.id === dolId) || {};
    const d = JSON.parse(fs.readFileSync(W(`draft/${dolId}.json`), 'utf8'));
    const it = items.find(x => x.url && d._url && d._url.endsWith(x.url.split('/').pop())) || items.find(x => nt(x.name) === nt(tr.title || s.title));
    const m = it && it.url.match(/ielts-(\d+)-test-(\d+)-section-(\d+)/);
    src = { dolId, examSource: tr.source, url: it && it.url, book: m ? +m[1] : null, test: m ? +m[2] : null, section: m ? +m[3] : null };
  }
  out.push({ _id: s._id, part: s.partNumber, title: s.title, isActive: s.isActive, isActualTest: s.isActualTest, audioUrl: s.audioUrl, audioDuration: s.audioDuration, createdAt: s.createdAt, closest: best.test ? `${best.test} ${best.s.toFixed(2)}` : '', src });
}
fs.writeFileSync(W('orphans.json'), JSON.stringify(out, null, 1));
const byPart = [1, 2, 3, 4].map(p => out.filter(o => o.part === p).length);
console.log(`${out.length} đề lẻ not in any full test — by part P1..P4: ${byPart.join(' / ')}`);
for (const o of out) console.log(`P${o.part} ${o.isActive ? 'ON ' : 'off'} ${o._id} ${o.title.slice(0, 50).padEnd(50)} ${o.src ? (o.src.book ? `C${o.src.book}T${o.src.test}S${o.src.section}` : o.src.examSource) : 'old'}  ${o.closest}`);
