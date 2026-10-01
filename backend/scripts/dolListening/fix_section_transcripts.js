// Complete truncated transcripts of OLD sections (text heard with old_whisper.js, speakers assigned by hand).
// Appends `append` (format: "Speaker:\nsentence" lines) to the đề lẻ section AND to every full-test copy with the
// same answer keys, unless that copy already contains the text. Backups → web/backup/.   [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const W = f => path.join(__dirname, 'web', f);
const FIX = require('../data/listeningTranscriptFixes');   // { <sectionId>: { title, append } }
const keySig = s => (s.questionGroups || []).flatMap(g => g.questions || []).map(q => `${q.questionNumber}=${String(q.correctAnswer).trim().toLowerCase()}`).join('|');
const probe = a => a.split('\n').filter(l => !/:\s*$/.test(l)).slice(-1)[0].slice(0, 40);

(async () => {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  fs.mkdirSync(W('backup'), { recursive: true });
  try {
    const tests = await db.collection('listeningtests').find({}).toArray();
    for (const [id, f] of Object.entries(FIX)) {
      const s = await db.collection('listeningsections').findOne({ _id: new mongoose.Types.ObjectId(id) });
      const targets = [{ label: `lẻ ${s.title}`, coll: 'listeningsections', _id: s._id, field: 'transcript', text: s.transcript || '' }];
      for (const t of tests) (t.sections || []).forEach((x, i) => { if (keySig(x) === keySig(s)) targets.push({ label: `${t.name} P${i + 1}`, coll: 'listeningtests', _id: t._id, field: `sections.${i}.transcript`, text: x.transcript || '' }); });
      for (const tg of targets) {
        if (tg.text.includes(probe(f.append))) { console.log(`= ${tg.label} already complete`); continue; }
        console.log(`${apply ? '→' : 'dry'} ${tg.label}: +${f.append.split('\n').length} lines`);
        if (!apply) continue;
        fs.writeFileSync(W(`backup/transcript_${tg._id}_${tg.field.replace(/\W/g, '_')}.txt`), tg.text);
        const r = await db.collection(tg.coll).updateOne({ _id: tg._id }, { $set: { [tg.field]: tg.text.replace(/\s+$/, '') + '\n' + f.append, updatedAt: new Date() } });
        console.log(`   ${r.modifiedCount ? '✓' : '✗'}`);
      }
    }
  } finally { await mongoose.disconnect(); }
})();
