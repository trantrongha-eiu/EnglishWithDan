'use strict';
// READ-ONLY: dump question groups of passages whose title matches argv[2] (regex)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const ps = await mongoose.connection.db.collection('passages').find({ title: new RegExp(process.argv[2], 'i') }).toArray();
  const full = process.argv.includes('--content');
  for (const p of ps) {
    console.log(`\n######## ${p.title} [${p._id}] ${p.category} ${p.questionRange?.start}-${p.questionRange?.end}`);
    if (full) console.log('CONTENT:', p.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 6000));
    (p.questionGroups || []).forEach((g, gi) => {
      console.log(`-- G${gi + 1} ${g.groupType} | title="${g.groupTitle}" | instr="${(g.instruction || '').replace(/\s+/g, ' ')}"`);
      if (g.matchingOptions?.length) console.log('   matchingOptions:', JSON.stringify(g.matchingOptions), 'title:', g.matchingOptionsTitle);
      if (g.endingsConfig?.endings?.length) console.log('   endings:', JSON.stringify(g.endingsConfig.endings.map(e => `${e.letter}:${e.text}`)));
      if (g.summaryConfig?.text) console.log('   summary:', g.summaryConfig.text.replace(/\s+/g, ' '), '\n   bank:', JSON.stringify((g.summaryConfig.wordBank || []).map(w => `${w.letter}:${w.word}`)));
      if (g.noteConfig?.lines?.length) console.log('   note:', JSON.stringify(g.noteConfig.lines));
      if (g.headingsConfig?.headings?.length) console.log('   headings:', JSON.stringify(g.headingsConfig.headings.map(h => `${h.numeral}:${h.text}`)));
      if (g.interchangeableAnswers || g.matchingReuseAllowed) console.log('   interchangeable=', g.interchangeableAnswers, 'reuse=', g.matchingReuseAllowed);
      (g.questions || []).forEach(q => console.log(`   Q${q.questionNumber} [${q.type}] "${(q.questionText || '').replace(/\s+/g, ' ')}" => ${q.correctAnswer}${q.options?.length ? ' opts=' + JSON.stringify(q.options) : ''}${q.wordBank?.length ? ' wb=' + JSON.stringify(q.wordBank) : ''}`));
    });
  }
  await mongoose.disconnect();
})();
