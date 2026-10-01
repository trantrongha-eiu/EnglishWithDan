// Write our own Vietnamese explanations for imported DOL sections.
// Data: ../data/dolListening/explanations/<dolId>.json  { title, q: { "<n>": { v, t, p, key?, why? } } }
//   v = where in the recording ("Đầu bài, khi …"), t = transcript quote(s) (string or array, each must
//   appear verbatim in the section transcript), p = analysis ending "→ <answer>",
//   key/why = corrected answer key (+ reason) when the DOL key is wrong.
// Format written (same as the rest of the Listening bank): "Vị trí: …\n\nTranscript: “…”\n\nPhân tích: …"
//   node set_dol_expl.js [dolId …]            validate against local drafts (no DB)
//   node set_dol_expl.js [dolId …] --apply     write to the imported sections
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'data', 'dolListening', 'explanations');
const W = f => path.join(__dirname, 'web', f);
const norm = s => ' ' + String(s || '').toLowerCase().replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—−]/g, '-')
  .replace(/…/g, '...').replace(/\s+/g, ' ') + ' ';
const quotes = t => (Array.isArray(t) ? t : [t]).filter(Boolean);
const compose = e => [`Vị trí: ${e.v}`, ...(quotes(e.t).length ? [`Transcript: ${quotes(e.t).map(x => `“${x}”`).join(' … ')}`] : []), `Phân tích: ${e.p}`].join('\n\n');

function check(d, data) {
  const problems = [];
  if (data.title !== d.title) problems.push(`title "${data.title}" ≠ "${d.title}"`);
  const qs = d.questionGroups.flatMap(g => g.questions);
  const body = norm(d.transcript);
  for (const n of Object.keys(data.q)) if (!qs.some(q => String(q.questionNumber) === n)) problems.push(`Q${n}: no such question`);
  for (const q of qs) {
    const e = data.q[q.questionNumber];
    if (!e) { problems.push(`Q${q.questionNumber}: missing`); continue; }
    if (!e.v || !e.p) problems.push(`Q${q.questionNumber}: empty v/p`);
    if (!quotes(e.t).length) problems.push(`Q${q.questionNumber}: no transcript quote`);
    for (const t of quotes(e.t)) if (!body.includes(norm(t).trim())) problems.push(`Q${q.questionNumber}: quote not in transcript: "${t.slice(0, 80)}"`);
    if (e.key !== undefined && !e.why) problems.push(`Q${q.questionNumber}: key change without why`);
    const key = String(e.key !== undefined ? e.key : q.correctAnswer);
    const variants = key.split('/').map(v => norm(v).trim()).filter(Boolean);
    const tail = norm(String(e.p).split('→').pop());
    if (!e.p.includes('→') || !variants.some(v => tail.includes(v))) problems.push(`Q${q.questionNumber}: analysis must end "→ … ${key.split('/')[0]}"`);
  }
  return problems;
}

(async () => {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  let ids = args.filter(a => !a.startsWith('--'));
  if (!ids.length) ids = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
  const imported = fs.existsSync(W('imported.json')) ? JSON.parse(fs.readFileSync(W('imported.json'), 'utf8')) : {};
  let mongoose, LS;
  if (apply) {
    require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });
    mongoose = require('mongoose'); LS = require('../../models/ListeningSection');
    await mongoose.connect(process.env.MONGO_URI);
  }
  let ok = 0;
  try {
    for (const id of ids) {
      const data = JSON.parse(fs.readFileSync(path.join(DIR, id + '.json'), 'utf8'));
      const d = JSON.parse(fs.readFileSync(W(`draft/${id}.json`), 'utf8'));
      const problems = check(d, data);
      if (problems.length) { console.log(`✗ ${d.title}\n   ${problems.join('\n   ')}`); continue; }
      ok++;
      const keyCh = Object.entries(data.q).filter(([, e]) => e.key !== undefined).map(([n, e]) => `Q${n} → ${e.key} (${e.why})`);
      console.log(`✓ ${d.title}${keyCh.map(k => '\n   KEY ' + k).join('')}`);
      if (!apply) continue;
      if (!imported[id]) { console.log('   (not imported yet — skipped)'); continue; }
      const s = await LS.findById(imported[id]).lean();
      const groups = s.questionGroups.map(g => ({ ...g, questions: g.questions.map(q => {
        const e = data.q[q.questionNumber];
        return { ...q, explanation: compose(e), ...(e.key !== undefined ? { correctAnswer: e.key } : {}) };
      }) }));
      const r = await LS.collection.updateOne({ _id: s._id, updatedAt: s.updatedAt }, { $set: { questionGroups: groups, updatedAt: new Date() } });
      console.log(`   written: ${r.modifiedCount}`);
    }
  } finally { if (mongoose) await mongoose.disconnect(); }
  console.log(`${ok}/${ids.length} valid`);
})();
