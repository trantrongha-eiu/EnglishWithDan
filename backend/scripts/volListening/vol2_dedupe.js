// READ-ONLY: match each Vol transcript PDF (Otter "pN.pdf" per part, Vol 2+) against the bank (web/sections.json)
// by 8-gram overlap of transcripts and by distinctive content words; prints the best bank candidates per file.
//   node vol2_dedupe.js <vol>
const fs = require('fs'), path = require('path');
const vol = process.argv[2] || '2';
const ex = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', `vol${vol}`, 'extract.json'), 'utf8')).files;
const bank = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', 'sections.json'), 'utf8'));
const toks = s => String(s || '').toLowerCase().replace(/[’']/g, '').match(/[a-z0-9]+/g) || [];
const grams = (t, n = 6) => { const g = new Set(); for (let i = 0; i + n <= t.length; i++) g.add(t.slice(i, i + n).join(' ')); return g; };
const STOP = new Set('the a an and or of to in on at for is are was were be been it its this that you i we they he she with as by from have has had not but so if do does did can will would there their our your my me us them what which who when where how all any some about into than then also just very well yes no okay ok right like think know one two three four five six seven eight nine ten part section questions question answer now listen look time'.split(' '));
const bankInfo = bank.map(s => {
  const t = toks(s.transcript);
  const qtext = JSON.stringify(s.questionGroups || []);
  return { id: String(s._id), title: s.title, part: s.partNumber, g: grams(t), words: new Set(t.filter(w => w.length > 4 && !STOP.has(w))), q: toks(qtext) };
});
for (const [k, v] of Object.entries(ex)) {
  if (!k.startsWith('listening/') || v.type !== 'pdf' || /\/Test \d+\.pdf$/.test(k)) continue;
  const text = v.pages.join('\n').replace(/GROUP:[^\n]*\n/g, '').replace(/^[\s\S]*?SPEAKERS[^\n]*\n[^\n]*\n/, '').replace(/^\s*(?:\d+|Speaker \d+|\d+:\d+(?::\d+)?)\s*$/gm, '');
  const t = toks(text), g = grams(t);
  const words = new Set(t.filter(w => w.length > 4 && !STOP.has(w)));
  const scored = bankInfo.map(b => {
    let gi = 0; for (const x of g) if (b.g.has(x)) gi++;
    let wi = 0; for (const x of words) if (b.words.has(x)) wi++;
    return { b, gram: gi / Math.max(1, g.size), word: wi / Math.max(1, words.size) };
  }).sort((a, c) => (c.gram * 3 + c.word) - (a.gram * 3 + a.word)).slice(0, 2);
  console.log(`${k.split('/')[1].padEnd(8)} ${k.replace(/^.*(?=\b[pP] ?\d|\bsection)/, '').padEnd(28)} ${scored.map(s => `[${s.b.part}] ${s.b.title.slice(0, 40)} g=${s.gram.toFixed(2)} w=${s.word.toFixed(2)} ${s.b.id}`).join(' | ')}`);
}
