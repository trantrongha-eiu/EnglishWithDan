require('dotenv').config();
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');
const ids = process.argv.slice(2);
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  for (const id of ids) {
    const s = await ListeningSection.findById(id).lean();
    console.log('\n\n########## SECTION', id, '##########');
    console.log('TITLE:', s.title, '| PART:', s.partNumber, '| RANGE:', JSON.stringify(s.questionRange));
    console.log('\n--- TRANSCRIPT ---');
    console.log(s.transcript);
    console.log('\n--- QUESTIONS ---');
    (s.questionGroups||[]).forEach(g => {
      console.log(`[group type=${g.groupType} title="${g.groupTitle}" instruction="${g.instruction}"]`);
      if (g.tableConfig?.headers?.length) console.log('  table headers:', g.tableConfig.headers, 'rows:', JSON.stringify(g.tableConfig.rows));
      if (g.noteConfig?.lines?.length) console.log('  note lines:', JSON.stringify(g.noteConfig.lines));
      if (g.bulletConfig?.items?.length) console.log('  bullet items:', JSON.stringify(g.bulletConfig.items));
      if (g.matchingOptions?.length) console.log('  matchingOptions:', JSON.stringify(g.matchingOptions));
      if (g.dragDropConfig?.words?.length) console.log('  dragDropConfig.words:', JSON.stringify(g.dragDropConfig.words), '\n  dragDropConfig.text:', g.dragDropConfig.text);
      (g.questions||[]).forEach(q => {
        console.log(`  Q${q.questionNumber} [${q.type}] "${q.questionText}" options=${JSON.stringify(q.options)} answer=${JSON.stringify(q.correctAnswer)}`);
      });
    });
  }
  await mongoose.disconnect();
})().catch(e=>{console.error(e);process.exit(1);});
