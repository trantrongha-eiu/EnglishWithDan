for (const id of process.argv.slice(2)) {
  const d = require(`./web/mini/draft_${id}.json`);
  console.log(`\n########## ${id} ${d.title} [${d.category} ${d.questionRange.start}-${d.questionRange.end}]`);
  console.log(d.content.replace(/<h2>.*?<\/h2>/, '').replace(/<\/?(p|strong)>/g, '').replace(/\n\n/g, '\n'));
  for (const g of d.questionGroups) {
    console.log(`-- ${g.groupType} | ${g.instruction.slice(0, 160)}`);
    if (g.headingsConfig) console.log('   H:', g.headingsConfig.headings.map(h => `${h.numeral}:${h.text}`).join(' | '));
    if (g.matchingOptions && g.matchingOptions.some(o => o.length > 1)) console.log('   O:', g.matchingOptions.map((o, i) => String.fromCharCode(65 + i) + ':' + o).join(' | '));
    if (g.endingsConfig) console.log('   E:', g.endingsConfig.endings.map(e => `${e.letter}:${e.text}`).join(' | '));
    if (g.noteConfig) g.noteConfig.lines.forEach(l => console.log('   |', l));
    for (const q of g.questions) console.log(`   Q${q.questionNumber} ${q.type === 'fill-blank' && /^Question/.test(q.questionText) ? '' : q.questionText}${q.options ? ' {' + q.options.map((o, i) => String.fromCharCode(65 + i) + ') ' + o).join(' ') + '}' : ''} => ${q.correctAnswer}`);
  }
}
