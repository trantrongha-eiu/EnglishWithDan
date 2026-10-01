// READ-ONLY: find duplicate Listening content in the dump (web/). Sections: same key list or ≥60% transcript
// 8-grams. Full tests: same section key lists. Prints groups with usage hints.
const fs = require('fs'), path = require('path');
const W = f => path.join(__dirname, 'web', f);
const ss = JSON.parse(fs.readFileSync(W('sections.json'), 'utf8'));
const ts = JSON.parse(fs.readFileSync(W('tests.json'), 'utf8'));
const keys = s => (s.questionGroups || []).flatMap(g => g.questions || []).map(q => String(q.correctAnswer).trim().toLowerCase()).join('|');
const words = s => String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
const grams = s => { const w = words(s), g = new Set(); for (let i = 0; i + 8 <= w.length; i++) g.add(w.slice(i, i + 8).join(' ')); return g; };
const ov = (a, b) => { if (a.size < 20 || b.size < 20) return 0; let n = 0; for (const x of a) if (b.has(x)) n++; return n / Math.min(a.size, b.size); };

const S = ss.map(s => ({ id: String(s._id), title: s.title, active: s.isActive, part: s.partNumber, k: keys(s), g: grams(s.transcript), dict: (s.dictationSentences || []).length, expl: (s.questionGroups || []).flatMap(g => g.questions).filter(q => q.explanation).length, created: s.createdAt }));
const seen = new Set();
console.log('== đề lẻ');
for (let i = 0; i < S.length; i++) {
  if (seen.has(i)) continue;
  const grp = [i];
  for (let j = i + 1; j < S.length; j++) if (!seen.has(j) && S[i].part === S[j].part && ((S[i].k && S[i].k === S[j].k) || ov(S[i].g, S[j].g) > 0.6)) grp.push(j);
  if (grp.length > 1) { grp.forEach(x => seen.add(x)); console.log('--'); grp.forEach(x => { const s = S[x]; console.log(`${s.active ? 'ON ' : 'off'} ${s.id} P${s.part} expl${s.expl} dict${s.dict} ${String(s.created).slice(0, 10)} ${s.title}`); }); }
}
console.log('== đề full');
const T = ts.map(t => ({ id: String(t._id), name: t.name, active: t.isActive, sig: (t.sections || []).map(keys).join('#'), audio: !!t.audioUrl, created: t.createdAt }));
const tseen = new Set();
for (let i = 0; i < T.length; i++) {
  if (tseen.has(i)) continue;
  const grp = [i];
  for (let j = i + 1; j < T.length; j++) if (!tseen.has(j) && T[i].sig === T[j].sig) grp.push(j);
  if (grp.length > 1) { grp.forEach(x => tseen.add(x)); console.log('--'); grp.forEach(x => console.log(`${T[x].active ? 'ON ' : 'off'} ${T[x].id} ${T[x].name} audio:${T[x].audio} ${String(T[x].created).slice(0, 10)}`)); }
}
// full tests sharing individual sections (legit in books, just listed)
const bySec = {};
ts.forEach(t => (t.sections || []).forEach((s, i) => { const k = keys(s); if (k) (bySec[k] = bySec[k] || []).push(`${t.name} P${i + 1}`); }));
console.log('== sections shared by several full tests');
Object.values(bySec).filter(v => v.length > 1).forEach(v => console.log('  ' + v.join(' = ')));
