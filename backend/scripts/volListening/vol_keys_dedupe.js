// READ-ONLY: compare the answer keys of each Vol part (web/vol<V>/keys.json = { test: [40 keys] }, e.g. from the
// vol's key xlsx) with every bank section's keys (same question numbers) — re-recorded copies of one exam share
// ≥ 70 % of keys even when transcripts differ. Also lists the full tests (web/tests.json) holding the best match.
//   node vol_keys_dedupe.js <vol>
const fs = require('fs'), path = require('path');
const vol = process.argv[2];
const bank = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', 'sections.json'), 'utf8'));
const tests = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', 'tests.json'), 'utf8'));
const K = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', `vol${vol}`, 'keys.json'), 'utf8'));
const n = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const keyMap = s => { const m = {}; for (const g of s.questionGroups || []) for (const q of g.questions || []) m[q.questionNumber] = String(q.correctAnswer || '').split('/').map(n); return m; };
const bankKeys = bank.map(s => ({ s, m: keyMap(s) }));
const match = (v, k) => v && v.some(x => x && (x === n(k) || (x.length > 2 && n(k).includes(x)) || (n(k).length > 2 && x.includes(n(k)))));
for (const [t, all] of Object.entries(K)) for (let p = 1; p <= 4; p++) {
  const keys = all.slice((p - 1) * 10, p * 10), start = (p - 1) * 10 + 1;
  const words = keys.map(n).filter(k => k.length > 1);
  const best = bankKeys.filter(b => b.s.partNumber === p).map(b => {
    let hit = 0; keys.forEach((k, j) => { if (match(b.m[start + j], k)) hit++; });
    const anyw = words.filter(k => Object.values(b.m).some(v => v.includes(k))).length;
    return { b, hit, anyw };
  }).sort((a, c) => (c.hit + c.anyw) - (a.hit + a.anyw))[0];
  const inTests = tests.filter(x => (x.sections || []).some(s => s.partNumber === p && s.title === best.b.s.title)).map(x => x.name);
  const flag = (best.anyw >= 3 || best.hit >= 7) ? '  <<<< CHECK' : '';
  console.log(`T${t} P${p}: [${best.b.s.title}] pos ${best.hit}/10 words ${best.anyw}/${words.length} ${best.b.s._id} ${best.b.s.isActive ? 'on' : 'OFF'} {${inTests.join('; ')}}${flag}`);
}
