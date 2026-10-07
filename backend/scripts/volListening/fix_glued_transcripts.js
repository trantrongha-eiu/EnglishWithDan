// Add the missing space after punctuation in transcripts ("each day.It's" → "each day. It's", "in person,but" →
// "in person, but") of the given đề lẻ AND their copies inside full tests (matched by title + part).
// Only letter.Letter / letter,letter joins are touched: "3.40", "1,500", "post.com", "U.S." stay. Backup → web/vol<V>/backup.
//   node fix_glued_transcripts.js <vol> <sectionId…> [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const VOL = process.argv[2];
const ids = process.argv.slice(3).filter(a => !a.startsWith('--'));
const APPLY = process.argv.includes('--apply');
const W = f => path.join(__dirname, 'web', `vol${VOL}`, f);

const fix = t => String(t || '').replace(/([a-z][.?!])([A-Z])/g, '$1 $2').replace(/([a-z],)([a-z])/g, '$1 $2');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const backup = { sections: [], tests: [] };
  for (const id of ids) {
    const s = await db.collection('listeningsections').findOne({ _id: new mongoose.Types.ObjectId(id) });
    if (!s) { console.log(`✗ ${id} not found`); continue; }
    const next = fix(s.transcript);
    const n = (s.transcript.match(/[a-z][.?!][A-Z]|[a-z],[a-z]/g) || []).length;
    console.log(`${s.title} (lẻ): ${n} join(s)`);
    for (const m of (s.transcript.match(/.{0,15}(?:[a-z][.?!][A-Z]|[a-z],[a-z]).{0,15}/g) || []).slice(0, 4)) console.log(`   ${JSON.stringify(m)}`);
    backup.sections.push({ _id: id, transcript: s.transcript });
    if (APPLY && next !== s.transcript) await db.collection('listeningsections').updateOne({ _id: s._id }, { $set: { transcript: next, updatedAt: new Date() } });
    const tests = await db.collection('listeningtests').find({ sections: { $elemMatch: { title: s.title, partNumber: s.partNumber } } }).toArray();
    for (const t of tests) {
      const i = t.sections.findIndex(x => x.title === s.title && x.partNumber === s.partNumber);
      const cur = t.sections[i].transcript || '';
      console.log(`   + full test "${t.name}" P${s.partNumber}: ${cur === s.transcript ? 'same transcript' : 'DIFFERENT transcript (fixed on its own)'}`);
      backup.tests.push({ _id: String(t._id), index: i, transcript: cur });
      if (APPLY && fix(cur) !== cur) await db.collection('listeningtests').updateOne({ _id: t._id }, { $set: { [`sections.${i}.transcript`]: fix(cur), updatedAt: new Date() } });
    }
  }
  if (APPLY) {
    fs.mkdirSync(W('backup'), { recursive: true });
    const f = W(`backup/glued_${Date.now()}.json`);
    fs.writeFileSync(f, JSON.stringify(backup));
    console.log(`✓ applied; backup ${f}`);
  } else console.log('dry run — add --apply');
  await mongoose.disconnect();
})();
