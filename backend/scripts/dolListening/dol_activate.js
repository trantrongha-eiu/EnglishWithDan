// Show / hide imported DOL sections for students.
//   node dol_activate.js <dolId …> [--off] [--apply]
// Refuses to activate a section that has a question without an explanation.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const LS = require('../../models/ListeningSection');
const imported = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', 'imported.json'), 'utf8'));
(async () => {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply'), on = !args.includes('--off');
  await mongoose.connect(process.env.MONGO_URI);
  try {
    for (const id of args.filter(a => !a.startsWith('--'))) {
      const s = imported[id] && await LS.findById(imported[id]).lean();
      if (!s) { console.log(`✗ ${id}: not imported`); continue; }
      const qs = s.questionGroups.flatMap(g => g.questions);
      const noExpl = qs.filter(q => !q.explanation).map(q => q.questionNumber);
      if (on && (noExpl.length || !s.audioUrl || !s.transcript)) { console.log(`✗ ${s.title}: missing ${noExpl.length ? 'explanation Q' + noExpl.join(',') : ''} ${s.audioUrl ? '' : 'audio'} ${s.transcript ? '' : 'transcript'}`); continue; }
      if (apply) await LS.updateOne({ _id: s._id }, { $set: { isActive: on } });
      console.log(`${apply ? (on ? 'ON ' : 'OFF') : 'dry'} ${s._id} P${s.partNumber} ${s.title}${s.isActualTest ? ' [actual]' : ''}`);
    }
  } finally { await mongoose.disconnect(); }
})();
