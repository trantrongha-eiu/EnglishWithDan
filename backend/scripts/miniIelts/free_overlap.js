// READ-ONLY: active passages not used by any full test — text overlap (8-gram) with test passages and with each
// other, and question-range sanity per category (P1 1-13, P2 14-26, P3 27-40). Reads passages.json.
const ps = require('./passages.json');
const norm = s => String(s).replace(/<[^>]+>/g, ' ').toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/);
const grams = w => { const o = new Set(); for (let i = 0; i + 8 <= w.length; i++) o.add(w.slice(i, i + 8).join(' ')); return o; };
const active = ps.filter(p => p.isActive);
const inTest = active.filter(p => (p.tests || []).length);
const free = active.filter(p => !(p.tests || []).length);
const G = new Map(active.map(p => [String(p._id), grams(norm(p.content))]));
const ov = (a, b) => { const ga = G.get(String(a._id)), gb = G.get(String(b._id)); let h = 0; for (const k of ga) if (gb.has(k)) h++; return h / (ga.size || 1); };
const RANGE = { passage1: [1, 13], passage2: [14, 26], passage3: [27, 40] };
for (const p of free) {
  const r = RANGE[p.category], q = p.questionRange || {};
  const n = (p.questionGroups || []).reduce((s, g) => s + g.questions.length, 0);
  if (!r || q.start !== r[0] || q.end !== r[1] || n !== r[1] - r[0] + 1) console.log(`RANGE ${p.category} ${q.start}-${q.end} (${n} q) ${p.title}`);
  for (const t of inTest) { const c = ov(p, t); if (c >= 0.15) console.log(`DUP-TEST ${(c * 100).toFixed(0)}% "${p.title}" ~ "${t.title}" [${t.tests.join(', ')}]`); }
}
for (let i = 0; i < free.length; i++) for (let j = i + 1; j < free.length; j++) { const c = ov(free[i], free[j]); if (c >= 0.15) console.log(`DUP-FREE ${(c * 100).toFixed(0)}% "${free[i].title}" ~ "${free[j].title}"`); }
console.log(`${free.length} free passages checked`);
