// Apply mini_patches.js to drafts → web/mini/final_<id>.json ; report unmatched patches
const fs = require('fs');
const P = require('./mini_patches');
const ids = process.argv.slice(2);
for (const id of ids) {
  const d = JSON.parse(fs.readFileSync(`web/mini/draft_${id}.json`, 'utf8'));
  const p = P[id] || {};
  const miss = [];
  const strFields = [];
  const visit = (o) => { for (const k of Object.keys(o)) { if (typeof o[k] === 'string') strFields.push([o, k]); else if (o[k] && typeof o[k] === 'object') visit(o[k]); } };
  visit(d);
  for (const [from, to] of p.text || []) {
    let hit = 0;
    for (const [o, k] of strFields) {
      const before = o[k];
      o[k] = typeof from === 'string' ? o[k].split(from).join(to) : o[k].replace(from, to);
      if (o[k] !== before) hit++;
    }
    if (!hit) miss.push(String(from).slice(0, 50));
  }
  if (p.fn) p.fn(d);
  const qs = d.questionGroups.flatMap(g => g.questions);
  const off = 0; // patch numbers are final (renumbered) numbers
  for (const [n, k] of Object.entries(p.keys || {})) { const q = qs.find(q => q.questionNumber === +n + off); if (!q) miss.push(`key Q${n}`); else q.correctAnswer = k; }
  for (const [n, line] of Object.entries(p.notes || {})) {
    const qn = +n + off; const g = d.questionGroups.find(g => g.noteConfig && g.noteConfig.lines.some(l => l.includes(`__Q${n}__`) || l.includes(`__Q${qn}__`)));
    if (!g) { miss.push(`note Q${n}`); continue; }
    const i = g.noteConfig.lines.findIndex(l => l.includes(`__Q${qn}__`) || l.includes(`__Q${n}__`));
    g.noteConfig.lines[i] = line.replace(/__Q(\d+)__/g, (_, x) => `__Q${+x + off}__`);
  }
  // generic tidy of content/questions
  const tidy = s => s.replace(/ﬀ/g, 'ff').replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl').replace(/ﬃ/g, 'ffi').replace(/([a-z)]) ?\.([A-Z][a-z])/g, '$1. $2').replace(/ +([,.;:!?])(?=[\s<]|$)/g, '$1').replace(/([,;])(?=[A-Za-z])/g, '$1 ').replace(/ {2,}/g, ' ');
  d.content = tidy(d.content);
  d.questionGroups.forEach(g => { g.instruction = tidy(g.instruction); g.questions.forEach(q => { q.questionText = tidy(q.questionText); if (q.options) q.options = q.options.map(o => tidy(o.replace(/[,.]$/, m => m === ',' ? '.' : m))); }); if (g.noteConfig) g.noteConfig.lines = g.noteConfig.lines.map(tidy); });
  fs.writeFileSync(`web/mini/final_${id}.json`, JSON.stringify(d, null, 1));
  console.log(id, d.title, d.category, `${d.questionRange.start}-${d.questionRange.end}`, miss.length ? 'UNMATCHED: ' + miss.join(' | ') : 'all patches applied');
}
