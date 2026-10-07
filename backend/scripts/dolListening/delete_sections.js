// Delete đề lẻ Listening by _id (thầy 2026-10-07: "không lấy được ảnh phù hợp thì xóa luôn bài đó").
// Dry run prints every reference (attempts, assignments, progress, full-test copies); --apply backs each
// section up to web/backup/ and deletes it by _id only. Refuses a section that still has attempts or
// assignments unless --force (practice history has no snapshot, so those rows would lose their section).
//   node delete_sections.js <id …> [--apply] [--force]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const W = f => path.join(__dirname, 'web', f);

const args = process.argv.slice(2);
const apply = args.includes('--apply'), force = args.includes('--force');
const ids = args.filter(a => /^[0-9a-f]{24}$/.test(a));
if (!ids.length) throw new Error('no section ids');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const names = (await db.listCollections().toArray()).map(c => c.name);
  fs.mkdirSync(W('backup'), { recursive: true });
  try {
    for (const id of ids) {
      const oid = new mongoose.Types.ObjectId(id);
      const s = await db.collection('listeningsections').findOne({ _id: oid });
      if (!s) { console.log(`- ${id} not found`); continue; }
      const refs = {};
      for (const c of names) {
        if (c === 'listeningsections') continue;
        const n = await db.collection(c).countDocuments({ $or: [{ sectionId: oid }, { resourceId: oid }, { listeningSectionId: oid }, { 'sections._id': oid }] });
        if (n) refs[c] = n;
      }
      const blocking = Object.keys(refs).some(c => /attempt|assignment/i.test(c));
      console.log(`${s.title} (${id}) active=${s.isActive} refs ${JSON.stringify(refs)}${blocking && !force ? '  ← has attempts/assignments' : ''}`);
      if (!apply) continue;
      if (blocking && !force) { console.log('   skipped (use --force)'); continue; }
      fs.writeFileSync(W(`backup/section_${id}.json`), JSON.stringify(s));
      const r = await db.collection('listeningsections').deleteOne({ _id: oid });
      console.log(`   backed up + deleted ${r.deletedCount}`);
    }
  } finally { await mongoose.disconnect(); }
})();
