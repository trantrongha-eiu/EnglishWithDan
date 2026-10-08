// List where a part's Gemini transcript (the base for Vol 2+, after spec.fix) and its Whisper transcript disagree
// (token LCS diff) — numbers, names, letters, words one of them invented or dropped. Narration only Whisper has
// (Gemini leaves it out on purpose) is summarised as "[whisper extra …]". Prints "gemini ⟶ whisper".
//   node diff_gemini.js specs/vol2_t1.js [part]
const fs = require('fs'), path = require('path');
const { geminiTranscript } = require('./vol_build');
const spec = require(path.resolve(process.argv[2]));
const onlyPart = +process.argv[3] || 0;
const W = f => path.join(__dirname, 'web', `vol${spec.vol}`, f);
const toks = s => String(s).replace(/^[A-Za-z.' ]+:$/gm, ' ').toLowerCase().replace(/[’']/g, '').replace(/(\d)[,.](\d)/g, '$1$2')
  .replace(/\b([a-z0-9])(?:-([a-z0-9]))+\b/g, m => m.replace(/-/g, '')).match(/[a-z0-9]+/g) || [];
for (const s of spec.sections) {
  if (s.reuse || (onlyPart && s.part !== onlyPart)) continue;
  const wf = W(`whisper/t${spec.test}p${s.part}.json`), gf = W(`gemini/t${spec.test}p${s.part}.txt`);
  if (!fs.existsSync(wf) || !fs.existsSync(gf)) { console.log(`== T${spec.test} P${s.part}: missing ${fs.existsSync(gf) ? 'whisper' : 'gemini'}`); continue; }
  const a = toks(geminiTranscript(fs.readFileSync(gf, 'utf8'), s.fix)), b = toks(JSON.parse(fs.readFileSync(wf, 'utf8')).text);
  const n = a.length, m = b.length, L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  const FILLER = /^(um|uh|erm|er|hmm|ah|oh|well|so|and|okay|ok|yes|yeah|right|the|a|i|its|it|is|now|then|but|just|thats|that)$/;
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) { i++; j++; continue; }
    const i0 = i, j0 = j;
    while ((i < n || j < m) && !(i < n && j < m && a[i] === b[j])) { if (j >= m || (i < n && L[i + 1][j] >= L[i][j + 1])) i++; else j++; }
    const da = a.slice(i0, i), db = b.slice(j0, j);
    const ctx = a.slice(Math.max(0, i0 - 5), i0).join(' ');
    if (da.every(t => FILLER.test(t)) && db.every(t => FILLER.test(t))) continue;
    if (j - j0 > 8 && i - i0 < 2) out.push(`  [whisper extra: ${db.join(' ').slice(0, 90)}]`);
    else if (i - i0 > 8 && j - j0 < 2) out.push(`  [GEMINI ONLY ${i - i0} words after "${ctx}": ${da.join(' ').slice(0, 90)}]`);
    else out.push(`  …${ctx}  «${da.join(' ')}» ⟶ «${db.join(' ')}»`);
  }
  console.log(`== T${spec.test} P${s.part} (${out.length})\n${out.join('\n')}`);
}
