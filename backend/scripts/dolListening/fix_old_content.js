// One-off fixes for content defects found by audit_listening.js in OLD Listening sections (2026-10-01).
// Each fix edits the đề lẻ section and every full-test copy with the same questions. Backups → web/backup/.
//   node fix_old_content.js [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const W = f => path.join(__dirname, 'web', f);
const apply = process.argv.includes('--apply');

// options typed with their own letter ("A   They are too small.") — the page adds the letter again
const stripLetters = groups => groups.map(g => ({ ...g, questions: g.questions.map(q => ({
  ...q, options: (q.options || []).map(o => String(o).replace(/^[A-H](?:[.)]|\s)\s*/, '').trim()),
})) }));

// Research into Learner Persistence: Q38–40 ("Recommendations" notes) were missing from the template
function learnerPersistence(groups) {
  const out = [];
  for (const g of groups) {
    if (g.groupType === 'table' && g.questions.some(q => q.questionNumber === 38)) {
      out.push({ ...g, groupTitle: 'Questions 33-37', instruction: 'Complete the table below.\nWrite ONE WORD ONLY for each answer.', questions: g.questions.filter(q => q.questionNumber <= 37) });
      const { _id, ...rest } = g;
      out.push({
        ...rest, groupType: 'note-form', groupTitle: 'Questions 38-40',
        instruction: 'Complete the notes below.\nWrite NO MORE THAN TWO WORDS for each answer.',
        tableConfig: { headers: [], rows: [] },
        noteConfig: { title: 'Recommendations', lines: [
          '• Ask new students to complete questionnaires to gauge their level of __Q38__',
          '• Train selected students to act as __Q39__',
          '• Outside office hours, offer __Q40__ help.',
          '• Follow up students who miss deadlines.',
        ] },
        questions: g.questions.filter(q => q.questionNumber >= 38),
      });
    } else out.push(g);
  }
  return out;
}

const FIXES = [
  { id: '6a8e2d3abb541d5ceada09c7', why: 'option letters', groups: stripLetters, set: { isActualTest: true } },   // Cam 18 T1 P2
  { id: '6a8e2d3abb541d5ceada09d5', why: 'option letters', groups: stripLetters, set: { isActualTest: true } },   // Cam 18 T1 P3
  { id: '6a53c99e5c459ab074ce99ff', why: 'Q38-40 template', groups: learnerPersistence, set: { title: 'Research into Learner Persistence' } },
];

const sig = s => JSON.stringify((s.questionGroups || []).flatMap(g => g.questions || []).map(q => [q.questionNumber, String(q.correctAnswer).trim().toLowerCase()]));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  fs.mkdirSync(W('backup'), { recursive: true });
  try {
    for (const f of FIXES) {
      const s = await db.collection('listeningsections').findOne({ _id: new mongoose.Types.ObjectId(f.id) });
      const groups = f.groups(s.questionGroups);
      const changed = JSON.stringify(groups) !== JSON.stringify(s.questionGroups);
      const tests = await db.collection('listeningtests').find({}).toArray();
      const copies = [];
      for (const t of tests) (t.sections || []).forEach((x, i) => { if (sig(x) === sig(s)) copies.push({ t, i }); });
      console.log(`${apply ? '→' : 'dry'} ${s.title} (${f.why}) groups ${changed ? 'changed' : 'same'}; copies: ${copies.map(c => `${c.t.name} P${c.i + 1}`).join(', ') || 'none'}`);
      if (!apply) continue;
      fs.writeFileSync(W(`backup/section_${f.id}.json`), JSON.stringify(s));
      const r = await db.collection('listeningsections').updateOne({ _id: s._id, updatedAt: s.updatedAt }, { $set: { questionGroups: groups, ...f.set, updatedAt: new Date() } });
      console.log(`   section ${r.modifiedCount ? '✓' : '✗'}`);
      for (const c of copies) {
        fs.writeFileSync(W(`backup/test_${c.t._id}.json`), JSON.stringify(c.t));
        const cg = f.groups(c.t.sections[c.i].questionGroups);
        const r2 = await db.collection('listeningtests').updateOne({ _id: c.t._id }, { $set: { [`sections.${c.i}.questionGroups`]: cg, updatedAt: new Date() } });
        console.log(`   test ${c.t.name} ${r2.modifiedCount ? '✓' : '✗'}`);
      }
    }
  } finally { await mongoose.disconnect(); }
})();
