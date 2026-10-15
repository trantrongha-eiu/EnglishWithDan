// List where a part's .docx transcript and its Whisper transcript disagree (token LCS diff), to spot ASR slips
// in the docx — numbers, names, letters. Prints "docx ⟶ whisper" with context; long one-sided gaps (Whisper
// dropping a passage) are summarised.   node diff_whisper.js specs/vol1_t6.js [part]
// Vol 7: spec.docx = the test's transcript file (split by heading lines); Whisper = web/vol<V>/whisper (large-v3) or,
// when there is none, the turbo words of speaker_pitch.js (web/vol<V>/words). Each slip carries its time in the part (s).
const fs = require('fs'), path = require('path');
const { splitParts, cleanPart } = require('./vol_transcript');
const { splitHeadings } = require('./vol_build');
const spec = require(path.resolve(process.argv[2]));
const onlyPart = +process.argv[3] || 0;
const W = f => path.join(__dirname, 'web', `vol${spec.vol}`, f);
const ex = JSON.parse(fs.readFileSync(W('extract.json'), 'utf8')).files;
const docF = ex[spec.docx || Object.keys(ex).find(k => k.startsWith(`test ${spec.test}/`) && ex[k].type === 'docx')];
let docText = docF.text || docF.pages.join('\n'); for (const [a, b] of spec.rawFix || []) docText = docText.split(a).join(b);
for (const [re, b] of spec.rawRe || []) docText = docText.replace(new RegExp(re, 'g'), b);
const parts = spec.docx ? splitHeadings(docText) : splitParts(docText);
const toks = s => String(s).replace(/^[A-Za-z ]+:$/gm, ' ').toLowerCase().replace(/[’']/g, '').replace(/(\d),(\d)/g, '$1$2').match(/[a-z0-9.]+/g)?.map(t => t.replace(/\.$/, '')) || [];
for (const s of spec.sections) {
  if (onlyPart && s.part !== onlyPart) continue;
  let wf = W(`whisper/t${spec.test}p${s.part}.json`);
  if (!fs.existsSync(wf)) wf = W(`words/t${spec.test}p${s.part}.json`);
  if (!fs.existsSync(wf) || !parts[s.part]) continue;
  const wj = JSON.parse(fs.readFileSync(wf, 'utf8'));
  const a = toks(cleanPart(parts[s.part], s));
  // Whisper tokens with the start time of their segment
  const b = [], bt = [];
  for (const sg of wj.segments || [{ text: wj.text, start: 0 }]) for (const t of toks(sg.text)) { b.push(t); bt.push(sg.start); }
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
    const at = `@${Math.round(bt[Math.min(j0, bt.length - 1)] || 0)}s`;
    if (i - i0 > 12 && j - j0 < 3) out.push(`  ${at} [whisper missing ${i - i0} words after "${ctx}"]`);
    else if (j - j0 > 12 && i - i0 < 3) out.push(`  ${at} [whisper extra: ${db.slice(0, 160)}]`);
    else if (da !== db) out.push(`  ${at} …${ctx}  «${da.slice(0, 120)}» ⟶ «${db.slice(0, 120)}»`);
  }
  console.log(`== T${spec.test} P${s.part} (${out.length})\n${out.join('\n')}`);
}
