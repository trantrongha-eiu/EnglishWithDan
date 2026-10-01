// Print what is needed to verify keys + write explanations for draft sections: every question with
// its key, and the transcript cues around DOL's free "Listen from here" time (_t), marking the cue(s)
// that contain the answer words.
//   node dol_ctx.js <id …>
const fs = require('fs'), path = require('path');
const norm = s => String(s || '').toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9'£$%.]+/g, ' ').trim();
const fmt = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

for (const id of process.argv.slice(2)) {
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', 'draft', id + '.json'), 'utf8'));
  console.log(`\n######## ${id} | P${d.partNumber} | ${d.title} | ${d._dolSectionId}`);
  const cues = d._cues;
  for (const g of d.questionGroups) {
    console.log(`\n== ${g.groupTitle} [${g.groupType}] ${g.instruction.replace(/\n/g, ' / ')}`);
    if (g.matchingOptions) console.log('   options: ' + g.matchingOptions.map((o, i) => `${'ABCDEFGHIJ'[i]}=${o}`).join(' | '));
    if (g.dragDropConfig && g.dragDropConfig.words.length) console.log('   box: ' + g.dragDropConfig.words.join(' | '));
    const tmpl = (g.noteConfig && g.noteConfig.lines) || (g.tableConfig && [].concat(g.tableConfig.headers.join(' | '), ...g.tableConfig.rows.map(r => r.join(' | ')))) || (g.dragDropConfig && [g.dragDropConfig.text.replace(/<[^>]+>/g, ' ')]) || [];
    for (const q of g.questions) {
      const line = tmpl.find(l => l.includes(`__Q${q.questionNumber}__`));
      let qt = q.questionText;
      if (line) qt = line.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (q.options && q.options.length) qt += '  {' + q.options.map((o, i) => `${'ABCDEFGHIJ'[i]}. ${o}`).join('  ') + '}';
      const ansWords = q.correctAnswer.split('/').map(norm);
      const t = q._t ?? null;
      console.log(`Q${q.questionNumber} [${q.correctAnswer}] ${qt}${t != null ? `  @${fmt(t)}` : ''}`);
      if (process.env.FULL) continue;
      if (q.type === 'fill-blank' || (q.type === 'map-labelling' && g.dragDropConfig)) {
        const hit = cues.filter(c => ansWords.some(a => a && norm(c.text).includes(a)));
        if (!hit.length) console.log('   !! answer text not found in transcript');
        const best = hit.sort((a, b) => Math.abs(a.start - (t ?? a.start)) - Math.abs(b.start - (t ?? b.start)))[0];
        if (best) console.log(`   ~ ${fmt(best.start)} ${best.speaker ? best.speaker + ': ' : ''}${best.text}`);
      } else if (t != null) {
        cues.filter(c => c.end >= t - 1 && c.start <= t + 30).slice(0, 6).forEach(c => console.log(`   . ${fmt(c.start)} ${c.speaker ? c.speaker + ': ' : ''}${c.text}`));
      }
    }
  }
  if (process.env.FULL) {
    console.log('-- transcript');
    cues.forEach(c => console.log(`${fmt(c.start)} ${c.speaker ? c.speaker + ': ' : ''}${c.text}`));
  }
}
