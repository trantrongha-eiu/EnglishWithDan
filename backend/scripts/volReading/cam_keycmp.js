// Compare DB keys with the official Cambridge keys in cam_keys.txt (by passage title). READ-ONLY.
// Run ../miniIelts/dump_passages.js first.
const ps = require(process.env.PS_FILE || '../miniIelts/passages.json'); const fs = require('fs');
const nrm = s => String(s || '').toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
let cur = null; const off = {};
for (const l of fs.readFileSync(__dirname + '/cam_keys.txt', 'utf8').split(/\r?\n/)) {
  if (l.startsWith('@')) { cur = l.slice(1).trim(); off[cur] = {}; }
  else if (cur && l.trim() && !l.startsWith('#')) l.split('|').forEach(x => { const m = x.trim().match(/^(\d+) (.+)$/); off[cur][m[1]] = m[2]; });
}
let bad = 0, cmp = 0;
for (const [t, keys] of Object.entries(off)) {
  const cands = ps.filter(p => p.title === t);
  if (!cands.length) { console.log('NO PASSAGE', t); continue; }
  for (const p of cands) for (const g of p.questionGroups) {
    const bank = Object.fromEntries((g.summaryConfig?.wordBank || []).map(w => [String(w.letter).toUpperCase(), nrm(w.word)]));
    const isMulti = g.questions.some(q => q.type === 'multi-answer-group') || g.interchangeableAnswers;
    for (const q of g.questions) {
      const o = keys[q.questionNumber]; if (!o) continue; cmp++;
      const alts = String(q.correctAnswer).split(/\s*\/\s*/).map(nrm);
      const oalts = o.split('/').map(nrm);
      let ok = oalts.some(a => alts.includes(a)) || oalts.some(a => bank[a.toUpperCase()] && alts.includes(bank[a.toUpperCase()]));
      if (!ok && isMulti) {
        const mine = g.questions.map(x => nrm(x.correctAnswer)).sort().join();
        const theirs = g.questions.map(x => nrm(keys[x.questionNumber] || '')).sort().join();
        ok = mine === theirs;
      }
      if (!ok) { bad++; console.log(`✗ ${t} [${(p.tests || []).join(',')}] Q${q.questionNumber} [${q.type}/${g.groupType}] db="${q.correctAnswer}" official="${o}"${bank[o.toUpperCase()] ? ' (=' + bank[o.toUpperCase()] + ')' : ''}`); }
    }
  }
}
console.log('compared', cmp, 'mismatch', bad);
