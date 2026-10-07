// Show / hide imported VOL sections (web/vol<V>/imported.json). Refuses to show a section without explanation for
// every question, audio, transcript or cover image.   node vol_activate.js <vol> [t6p1 …] [--off] [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const LS = require('../../models/ListeningSection');
const [vol, ...rest] = process.argv.slice(2);
const imported = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', `vol${vol}`, 'imported.json'), 'utf8'));
(async () => {
  const apply = rest.includes('--apply'), on = !rest.includes('--off');
  let ids = rest.filter(a => !a.startsWith('--'));
  if (!ids.length) ids = Object.keys(imported);
  await mongoose.connect(process.env.MONGO_URI);
  try {
    for (const id of ids) {
      const s = imported[id] && await LS.findById(imported[id]).lean();
      if (!s) { console.log(`✗ ${id}: not imported`); continue; }
      const noExpl = s.questionGroups.flatMap(g => g.questions).filter(q => !q.explanation).map(q => q.questionNumber);
      const mapNoImg = s.questionGroups.some(g => g.groupType === 'map' && !g.imageUrl);
      const missing = [noExpl.length && `explanation Q${noExpl.join(',')}`, !s.audioUrl && 'audio', !s.transcript && 'transcript', !s.thumbnailUrl && 'cover', mapNoImg && 'map image'].filter(Boolean);
      if (on && missing.length) { console.log(`✗ ${id} ${s.title}: missing ${missing.join(', ')}`); continue; }
      if (apply) await LS.updateOne({ _id: s._id }, { $set: { isActive: on } });
      console.log(`${apply ? (on ? 'ON ' : 'OFF') : 'dry'} ${id} ${s._id} P${s.partNumber} ${s.title}`);
    }
  } finally { await mongoose.disconnect(); }
})();
