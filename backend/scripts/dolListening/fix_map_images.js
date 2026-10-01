// Give old sections whose map group has NO image a labelled map: either rendered from a DOL draft
// (dol_mapimg.py — same letters as our key, checked by hand) or a local image file. Sets imageUrl on the
// đề lẻ section AND on every full test's embedded copy of that section (matched by question texts).
// Backups → web/backup/. Dry run unless --apply.
//   node fix_map_images.js [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const W = f => path.join(__dirname, 'web', f);

// our section id → where the picture comes from
const JOBS = [
  { id: '6a6c014085e01d9821f44bcb', dol: '6070360aa8558941e71e4f17' },   // Cam 15 T4 P2 Croft Valley Park
  { id: '6a6c014685e01d9821f44dce', dol: '648435fa2315850f00a53180' },   // Cam 18 T2 P2 new housing development
  { id: '6a6c014b85e01d9821f44f77', dol: '6a3e33eac1e7e46e48356570' },   // Cam 21 T2 P2 Melby Coal Mine
  ...(fs.existsSync(W('maps/minster_park.png')) ? [{ id: '6a6c013e85e01d9821f44b65', file: W('maps/minster_park.png') }] : []),
];

const qsig = g => JSON.stringify((g.questions || []).map(q => [q.questionNumber, String(q.questionText).trim().toLowerCase(), String(q.correctAnswer).trim()]));

(async () => {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  fs.mkdirSync(W('backup'), { recursive: true });
  try {
    for (const job of JOBS) {
      const s = await db.collection('listeningsections').findOne({ _id: new mongoose.Types.ObjectId(job.id) });
      const gi = s.questionGroups.findIndex(g => g.groupType === 'map' && !g.imageUrl);
      if (gi < 0) { console.log(`- ${s.title}: no image-less map group`); continue; }
      const sig = qsig(s.questionGroups[gi]);
      let png = job.file;
      if (job.dol) {
        const d = JSON.parse(fs.readFileSync(W(`draft/${job.dol}.json`), 'utf8'));
        const dg = d.questionGroups.findIndex(g => g._mapSource);
        const ours = s.questionGroups[gi].questions.map(q => `${q.questionNumber}=${q.correctAnswer}`).join(' ');
        const theirs = d.questionGroups[dg].questions.map(q => `${q.questionNumber}=${q.correctAnswer}`).join(' ');
        if (ours !== theirs) { console.log(`✗ ${s.title}: key mismatch\n   ours   ${ours}\n   theirs ${theirs}`); continue; }
        png = W(`maps/fix_${job.id}.png`);
        execFileSync('py', [path.join(__dirname, 'dol_mapimg.py'), W(`draft/${job.dol}.json`), String(dg), png]);
      }
      const tests = await db.collection('listeningtests').find({ 'sections.questionGroups.questions.questionText': s.questionGroups[gi].questions[0].questionText }).toArray();
      const copies = [];
      for (const t of tests) t.sections.forEach((x, si) => (x.questionGroups || []).forEach((g, gj) => { if (g.groupType === 'map' && qsig(g) === sig && !g.imageUrl) copies.push({ t, si, gj }); }));
      console.log(`${apply ? '→' : 'dry'} ${s.title} Q${s.questionGroups[gi].questions[0].questionNumber}+ ← ${path.basename(png)}; full-test copies: ${copies.map(c => c.t.name).join(', ') || 'none'}`);
      if (!apply) continue;
      fs.writeFileSync(W(`backup/section_${job.id}.json`), JSON.stringify(s));
      const up = await cloudinary.uploader.upload(png, { folder: 'listening-maps', public_id: `map_${job.id}`, overwrite: true });
      const r = await db.collection('listeningsections').updateOne({ _id: s._id, updatedAt: s.updatedAt }, { $set: { [`questionGroups.${gi}.imageUrl`]: up.secure_url, updatedAt: new Date() } });
      console.log(`   section ${r.modifiedCount ? '✓' : '✗ changed meanwhile'} ${up.secure_url}`);
      for (const c of copies) {
        fs.writeFileSync(W(`backup/test_${c.t._id}.json`), JSON.stringify(c.t));
        const r2 = await db.collection('listeningtests').updateOne({ _id: c.t._id }, { $set: { [`sections.${c.si}.questionGroups.${c.gj}.imageUrl`]: up.secure_url, updatedAt: new Date() } });
        console.log(`   test ${c.t.name} ${r2.modifiedCount ? '✓' : '✗'}`);
      }
    }
  } finally { await mongoose.disconnect(); }
})();
