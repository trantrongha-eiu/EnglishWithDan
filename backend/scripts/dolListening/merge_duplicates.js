// Merge duplicate đề lẻ: move every attempt / reference of the dropped copy onto the kept section, then
// delete the dropped copy (by _id only). Refuses when the two answer keys differ. Backups → web/backup/.
//   node merge_duplicates.js [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const W = f => path.join(__dirname, 'web', f);

const MERGES = [
  { keep: '6a50aa0bc7a497a299b374e8', drop: ['6a4b694e5934e78bb4ffa24a', '6a50aa0cc7a497a299b374f7'], set: { title: 'The Influence of Children on Adult Diet' } },
  { keep: '6a6c014685e01d9821f44d99', drop: ['6a8e2d3abb541d5ceada09c7'] },   // Becoming a volunteer for ACE = Cam 18 T1 P2
  { keep: '6a6c014685e01d9821f44da7', drop: ['6a8e2d3abb541d5ceada09d5'] },   // Talk on jobs in fashion design = Cam 18 T1 P3
];
// collections that point at a ListeningSection by `sectionId`
const REFS = ['listeningpracticeattempts', 'dictationattempts', 'gapfillattempts'];

const keys = s => (s.questionGroups || []).flatMap(g => g.questions || []).map(q => `${q.questionNumber}=${String(q.correctAnswer).trim().toLowerCase()}`).join('|');

(async () => {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const have = new Set((await db.listCollections().toArray()).map(c => c.name));
  fs.mkdirSync(W('backup'), { recursive: true });
  try {
    for (const m of MERGES) {
      const oid = x => new mongoose.Types.ObjectId(x);
      const keep = await db.collection('listeningsections').findOne({ _id: oid(m.keep) });
      for (const d of m.drop) {
        const drop = await db.collection('listeningsections').findOne({ _id: oid(d) });
        if (!drop) { console.log(`- ${d} already gone`); continue; }
        if (keys(drop) !== keys(keep)) { console.log(`✗ ${drop.title}: answer keys differ from ${keep.title} — skipped`); continue; }
        const counts = {};
        for (const c of REFS) if (have.has(c)) counts[c] = await db.collection(c).countDocuments({ sectionId: drop._id });
        const asg = (await db.collection('assignments').find({ resourceId: drop._id }).toArray()).length;
        console.log(`${apply ? '→' : 'dry'} drop "${drop.title}" (${d}) into "${keep.title}" — refs ${JSON.stringify(counts)} assignments ${asg}`);
        if (!apply) continue;
        fs.writeFileSync(W(`backup/section_${d}.json`), JSON.stringify(drop));
        for (const c of Object.keys(counts)) if (counts[c]) {
          const r = await db.collection(c).updateMany({ sectionId: drop._id }, { $set: { sectionId: keep._id } });
          console.log(`   moved ${r.modifiedCount} ${c}`);
        }
        if (asg) await db.collection('assignments').updateMany({ resourceId: drop._id }, { $set: { resourceId: keep._id } });
        const del = await db.collection('listeningsections').deleteOne({ _id: drop._id });
        console.log(`   deleted ${del.deletedCount}`);
      }
      if (apply && m.set) await db.collection('listeningsections').updateOne({ _id: keep._id }, { $set: { ...m.set, updatedAt: new Date() } });
    }
  } finally { await mongoose.disconnect(); }
})();
