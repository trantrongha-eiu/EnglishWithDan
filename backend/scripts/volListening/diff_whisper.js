// List where a part's .docx transcript and its Whisper transcript disagree (token LCS diff), to spot ASR slips
// in the docx — numbers, names, letters. Prints "docx ⟶ whisper" with context; long one-sided gaps (Whisper
// dropping a passage) are summarised.   node diff_whisper.js specs/vol1_t6.js [part]
const fs = require('fs'), path = require('path');
const { splitParts, cleanPart } = require('./vol_transcript');
const spec = require(path.resolve(process.argv[2]));
const onlyPart = +process.argv[3] || 0;
const W = f => path.join(__dirname, 'web', `vol${spec.vol}`, f);
const ex = JSON.parse(fs.readFileSync(W('extract.json'), 'utf8')).files;
const doc = ex[Object.keys(ex).find(k => k.startsWith(`test ${spec.test}/`) && ex[k].type === 'docx')].text;
let docText = doc; for (const [a, b] of spec.rawFix || []) docText = docText.split(a).join(b);
const parts = splitParts(docText);
const toks = s => String(s).replace(/^[A-Za-z ]+:$/gm, ' ').toLowerCase().replace(/[’']/g, '').replace(/(\d),(\d)/g, '$1$2').match(/[a-z0-9.]+/g)?.map(t => t.replace(/\.$/, '')) || [];
for (const s of spec.sections) {
  if (onlyPart && s.part !== onlyPart) continue;
  const wf = W(`whisper/t${spec.test}p${s.part}.json`);
  if (!fs.existsSync(wf) || !parts[s.part]) continue;
  const a = toks(cleanPart(parts[s.part], s)), b = toks(JSON.parse(fs.readFileSync(wf, 'utf8')).text);
  const n = a.length, m = b.length, L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) { i++; j++; continue; }
    const i0 = i, j0 = j;
    while ((i < n || j < m) && !(i < n && j < m && a[i] === b[j])) { if (j >= m || (i < n && L[i + 1][j] >= L[i][j + 1])) i++; else j++; }
    const da = a.slice(i0, i).join(' '), db = b.slice(j0, j).join(' ');
    const ctx = a.slice(Math.max(0, i0 - 4), i0).join(' ');
    if (i - i0 > 12 && j - j0 < 3) out.push(`  [whisper missing ${i - i0} words after "${ctx}"]`);
    else if (j - j0 > 12 && i - i0 < 3) out.push(`  [whisper extra: ${db.slice(0, 80)}]`);
    else if (da !== db && (/\d/.test(da + db) || i - i0 <= 4 && j - j0 <= 4)) out.push(`  …${ctx}  «${da}» ⟶ «${db}»`);
  }
  console.log(`== T${spec.test} P${s.part} (${out.length})\n${out.join('\n')}`);
}
