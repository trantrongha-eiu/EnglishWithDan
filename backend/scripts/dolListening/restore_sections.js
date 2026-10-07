// Restore đề lẻ Listening from web/backup/section_<id>.json (written by delete_sections.js) with the same
// _id; the backup is plain JSON, so the ListeningSection model casts ids/dates back. Refuses if the
// _id already exists or a schema path would be dropped.
//   node restore_sections.js <id …> [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const ListeningSection = require('../../models/ListeningSection');
const W = f => path.join(__dirname, 'web', f);

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const ids = args.filter(a => /^[0-9a-f]{24}$/.test(a));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    for (const id of ids) {
      const raw = JSON.parse(fs.readFileSync(W(`backup/section_${id}.json`), 'utf8'));
      if (await ListeningSection.exists({ _id: id })) { console.log(`- ${raw.title}: already exists`); continue; }
      const doc = new ListeningSection(raw).toObject({ depopulate: true });
      const lost = Object.keys(raw).filter(k => !(k in doc));
      if (lost.length) { console.log(`✗ ${raw.title}: fields not in schema ${lost.join(',')} — skipped`); continue; }
      doc.createdAt = new Date(raw.createdAt);
      doc.updatedAt = new Date();
      const nq = doc.questionGroups.reduce((n, g) => n + g.questions.length, 0);
      console.log(`${apply ? '→' : 'dry'} restore "${raw.title}" (${id}) q=${nq} active=${doc.isActive}`);
      if (apply) await ListeningSection.collection.insertOne(doc);
    }
  } finally { await mongoose.disconnect(); }
})();
