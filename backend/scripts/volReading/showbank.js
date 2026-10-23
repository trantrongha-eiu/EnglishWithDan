'use strict';
// READ-ONLY: print a bank passage's question groups compactly (type, instruction, questions, options, key)
//   node showbank.js <passageId|idSuffix>
const p = require('./web/passages.json').find(p => String(p._id).endsWith(process.argv[2]));
const strip = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
console.log(`"${p.title}" ${p.category} ${p.questionRange?.start}-${p.questionRange?.end} active=${p.isActive}`);
for (const g of p.questionGroups || []) {
  console.log(`-- [${g.questionType}] ${strip(g.instruction).slice(0, 160)}`);
  for (const o of g.matchingOptions || []) console.log(`     opt ${strip(o)}`);
  for (const h of g.headingsConfig?.headings || []) console.log(`     ${h.numeral} ${strip(h.text)}`);
  for (const e of g.endingsConfig?.endings || []) console.log(`     ${e.letter} ${strip(e.text)}`);
  for (const w of g.summaryConfig?.wordBank || []) console.log(`     bank ${w.letter} ${strip(w.word)}`);
  if (g.summaryConfig?.text) console.log(`     summary: ${strip(g.summaryConfig.text).slice(0, 600)}`);
  for (const l of g.noteConfig?.lines || []) console.log(`     note: ${strip(l).slice(0, 200)}`);
  for (const q of g.questions || []) console.log(`   Q${q.questionNumber} [${q.correctAnswer}] ${strip(q.questionText).slice(0, 170)}${(q.options || []).length ? ' || ' + q.options.map(strip).join(' | ') : ''}`);
}
