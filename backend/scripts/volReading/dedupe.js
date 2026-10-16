'use strict';
// READ-ONLY: match each passage of web/vol<V>/keys.json against the bank dump (web/passages.json):
// key agreement (same question numbers) + title word overlap. Prints best 3 per passage and the tests that hold them.
//   node dedupe.js <vol>
const vol = process.argv[2];
const keys = require(`./web/vol${vol}/keys.json`);
const ps = require('./web/passages.json'), ts = require('./web/tests.json');
const norm = s => String(s || '').toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
const short = { 'not given': 'ng', ng: 'ng', true: 't', t: 't', false: 'f', f: 'f', yes: 'y', y: 'y', no: 'n', n: 'n' };
const k1 = s => { const n = norm(s); return short[n] || n; };
const words = s => new Set(norm(s).split(' ').filter(w => w.length > 2 && !['the', 'and', 'for', 'its'].includes(w)));
const qmap = p => { const m = {}; for (const g of p.questionGroups || []) for (const q of g.questions || []) m[q.questionNumber] = q.correctAnswer; for (const q of p.questions || []) m[q.questionNumber] ??= q.correctAnswer; return m; };
const inTests = id => ts.filter(t => (t.passageIds || []).some(x => String(x) === String(id))).map(t => t.name);
for (const [T, list] of Object.entries(keys)) for (const [i, k] of list.entries()) {
  const tw = words(k.title);
  const scored = ps.map(p => {
    const m = qmap(p); let hit = 0;
    k.key.forEach((a, j) => { const b = m[k.start + j]; if (b != null && String(b).split('/').map(k1).some(x => String(a).split('/').map(k1).includes(x))) hit++; });
    const pw = words(p.title); const ov = [...tw].filter(w => pw.has(w)).length / Math.max(1, Math.min(tw.size, pw.size));
    return { p, hit, ov, score: hit / k.key.length + ov };
  }).sort((a, b) => b.score - a.score).slice(0, 2);
  console.log(`T${T} P${i + 1} "${k.title}"`);
  for (const s of scored) console.log(`   ${s.hit}/${k.key.length} key, title ${s.ov.toFixed(2)} → "${s.p.title}" [${s.p._id}] ${s.p.category} ${s.p.questionRange?.start}-${s.p.questionRange?.end} active=${s.p.isActive} content=${(s.p.content || '').length} | ${inTests(s.p._id).join(', ')}`);
}
