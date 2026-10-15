// Re-cut an imported đề lẻ's audio from the vol source with the part's CURRENT spec clip (after a part boundary was moved,
// e.g. Vol 7 T6: P2 ended with P3's narration) → R2, point the section at it. Unlike trim_section_audio.js it can move the
// START too, so it refuses when the section has dictation sentences (their timings would shift). Backup → web/vol<V>/backup.
// Rebuild the full test's audio afterwards (rejoin_test_audio.js).
//   node reclip_section_audio.js <vol> <t6p2 …> [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const { partFile, durationOf } = require('./vol_media');
const { uploadAudio } = require('../../services/r2Service'); // Listening audio → Cloudflare R2 (zero egress), see services/r2Service.js
const [VOL, ...rest] = process.argv.slice(2);
const APPLY = rest.includes('--apply');
const ids = rest.filter(a => !a.startsWith('--'));
const W = f => path.join(__dirname, 'web', `vol${VOL}`, f);

(async () => {
  if (!VOL || !ids.length) { console.log('usage: node reclip_section_audio.js <vol> <t6p2 …> [--apply]'); process.exit(1); }
  const imported = JSON.parse(fs.readFileSync(W('imported.json'), 'utf8'));
  await mongoose.connect(process.env.MONGO_URI);
  const col = mongoose.connection.db.collection('listeningsections');
  try {
    for (const id of ids) {
      const [, t, p] = id.match(/^t(\d+)p(\d)$/);
      const s = require(`./specs/vol${VOL}_t${t}.js`).sections.find(x => x.part === +p);
      const sec = await col.findOne({ _id: new mongoose.Types.ObjectId(imported[id]) });
      if (!s || !sec) throw new Error(`${id}: no spec part / section`);
      if ((sec.dictationSentences || []).length) throw new Error(`${id}: has dictation sentences — their timings would shift`);
      const file = partFile(+VOL, +t, +p, s.audio, s.clip); // cached by clip, so a moved boundary makes a new file
      const dur = durationOf(file);
      console.log(`${id} ${sec.title}: ${sec.audioDuration}s → ${dur}s (clip ${s.clip.join('–')})`);
      if (!APPLY) continue;
      fs.mkdirSync(W('backup'), { recursive: true });
      fs.writeFileSync(W(`backup/reclip_${id}_${Date.now()}.json`), JSON.stringify({ _id: String(sec._id), audioUrl: sec.audioUrl, audioDuration: sec.audioDuration }, null, 1));
      const up = await uploadAudio(file, { folder: 'listening-sections', public_id: `vol${VOL}_${id}_${Date.now()}` });
      await col.updateOne({ _id: sec._id, updatedAt: sec.updatedAt }, { $set: { audioUrl: up.secure_url, audioDuration: Math.round(up.duration || dur), updatedAt: new Date() } });
      console.log(`  ✓ ${up.secure_url} ${up.duration}s`);
    }
    if (!APPLY) console.log('dry run — add --apply');
  } finally { await mongoose.disconnect(); }
})().catch(e => { console.error('✗', e.message); process.exit(1); });
