// Print a passage from passages.json (prod dump) with its questions and keys, for writing
// Vietnamese explanations.   node expl_show.js <mongoId | titleRegex>
//   node expl_show.js --todo    → mini-ielts passages still lacking an explanations file
const fs = require('fs');
const path = require('path');
const ps = require('./passages.json');
const DIR = path.join(__dirname, '..', 'data', 'miniIeltsReading', 'explanations');
const arg = process.argv[2] || '';
const text = s => String(s || '').replace(/<br\s*\/?>/g, '\n').replace(/<\/(p|h2|li|tr)>/g, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\n{2,}/g, '\n').trim();

if (arg === '--todo') {
  const done = new Set(fs.existsSync(DIR) ? fs.readdirSync(DIR).map(f => f.replace('.json', '')) : []);
  ps.filter(p => (p.tags || []).includes('mini-ielts') && !done.has(String(p._id)))
    .sort((a, b) => String(a._id).localeCompare(String(b._id)))
    .forEach(p => console.log(String(p._id), p.category, p.title));
  process.exit(0);
}
const p = ps.find(x => String(x._id) === arg) || ps.find(x => new RegExp(arg, 'i').test(x.title));
if (!p) throw new Error(`no passage ${arg}`);
console.log(`##### ${p._id} ${p.title} [${p.category} ${p.questionRange.start}-${p.questionRange.end}]\n`);
console.log(text(p.content));
for (const g of p.questionGroups) {
  console.log(`\n-- ${g.groupType} | ${g.instruction}`);
  if (g.matchingOptions?.length && !/^[A-J]$/.test(g.matchingOptions[0])) console.log('   options: ' + g.matchingOptions.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(' | '));
  if (g.headingsConfig?.headings?.length) console.log('   headings: ' + g.headingsConfig.headings.map(h => `${h.numeral}) ${h.text}`).join(' | '));
  if (g.endingsConfig?.endings?.length) console.log('   endings: ' + g.endingsConfig.endings.map(e => `${e.letter}) ${e.text}`).join(' | '));
  if (g.summaryConfig?.wordBank?.length) console.log('   bank: ' + g.summaryConfig.wordBank.map(w => `${w.letter}) ${w.word}`).join(' | '));
  if (g.bulletConfig?.items?.length) console.log('   bullets: ' + g.bulletConfig.items.map(text).join(' / '));
  if (g.dragDropConfig?.words?.length) console.log('   words: ' + g.dragDropConfig.words.join(' | '));
  if (g.noteConfig?.lines?.length) console.log('   notes: ' + [g.noteConfig.title, ...g.noteConfig.lines].filter(Boolean).map(text).join(' / '));
  if (g.summaryConfig?.text) console.log('   summary: ' + text(g.summaryConfig.text));
  if (g.tableConfig?.rows?.length) console.log('   table: ' + g.tableConfig.rows.map(r => r.join(' ¦ ')).join(' // '));
  for (const q of g.questions) console.log(`   Q${q.questionNumber} [${q.type}] ${text(q.questionText)}${q.options?.length ? ' {' + q.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(' ') + '}' : ''} => ${q.correctAnswer}${q.explanation ? '  (has expl)' : ''}`);
}
