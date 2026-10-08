// Rebuild an EXISTING full test's audio from its 4 đề lẻ audios (matched by title + part, like vol_audit.js), joined the
// same way as vol_full_tests.js (re-encode 192k) → Cloudinary, point the test at it. For old hand-made full tests whose
// own recording drifted from the parts (Vol 1 - Test 1–4: the 30 s check pauses cut to ~15 s, "That is the end of
// section N" dropped). Refused when a question has an audioTimestamp (it would no longer match). Backup → web/vol<V>/backup.
//   node rejoin_test_audio.js <vol> "<test name>" … [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const { durationOf } = require('./vol_media');
const upload = (file, opts) => new Promise((res, rej) => fs.createReadStream(file).pipe(cloudinary.uploader.upload_stream(opts, (e, r) => e ? rej(e) : res(r))));
const ff = execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const [VOL, ...rest] = process.argv.slice(2);
const names = rest.filter(a => !a.startsWith('--'));
const APPLY = process.argv.includes('--apply');
const W = f => path.join(__dirname, 'web', `vol${VOL}`, f);

(async () => {
  if (!VOL || !names.length) { console.log('usage: node rejoin_test_audio.js <vol> "<test name>" … [--apply]'); process.exit(1); }
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  try {
    for (const name of names) {
      const t = await db.collection('listeningtests').findOne({ name });
      if (!t) { console.log(`✗ ${name}: not found`); continue; }
      if ((t.sections || []).flatMap(s => s.questionGroups.flatMap(g => g.questions)).some(q => q.audioTimestamp != null)) {
        console.log(`✗ ${name}: has question audioTimestamps — skipped`); continue;
      }
      const parts = [];
      for (const s of t.sections) {
        const lone = await db.collection('listeningsections').find({ title: s.title, partNumber: s.partNumber }).toArray();
        if (lone.length !== 1 || !lone[0].audioUrl) throw new Error(`${name} P${s.partNumber}: ${lone.length} đề lẻ "${s.title}" (need exactly 1 with audio)`);
        parts.push(lone[0]);
      }
      if (parts.map(s => s.partNumber).join() !== '1,2,3,4') throw new Error(`${name}: parts ${parts.map(s => s.partNumber)}`);
      const total = parts.reduce((n, s) => n + (s.audioDuration || 0), 0);
      console.log(`${name}: ${t.audioDuration}s → ~${total}s (${parts.map(s => `P${s.partNumber} ${s.audioDuration}s`).join(', ')})`);
      if (!APPLY) continue;

      const tmp = W(`fulltest_audio/rejoin_${t._id}`); fs.mkdirSync(tmp, { recursive: true });
      const files = [];
      for (const s of parts) {
        const f = path.join(tmp, `p${s.partNumber}${path.extname(new URL(s.audioUrl).pathname) || '.mp3'}`);
        if (!fs.existsSync(f)) fs.writeFileSync(f, Buffer.from(await (await fetch(s.audioUrl)).arrayBuffer()));
        files.push(f);
      }
      const out = path.join(tmp, 'full.mp3');
      execFileSync(ff, ['-y', '-loglevel', 'error', ...files.flatMap(f => ['-i', f]),
        '-filter_complex', files.map((_, i) => `[${i}:a]`).join('') + `concat=n=${files.length}:v=0:a=1[a]`,
        '-map', '[a]', '-ac', '2', '-ar', '44100', '-b:a', '192k', out]);
      const dur = Math.round(durationOf(out));
      if (Math.abs(dur - total) > 5) throw new Error(`${name}: joined audio ${dur}s vs sections ${total}s`);

      fs.mkdirSync(W('backup'), { recursive: true });
      fs.writeFileSync(W(`backup/rejoin_test_${t._id}_${Date.now()}.json`),
        JSON.stringify({ _id: String(t._id), name: t.name, audioUrl: t.audioUrl, audioDuration: t.audioDuration, audioFileName: t.audioFileName }, null, 1));
      const up = await upload(out, { resource_type: 'video', folder: 'listening', public_id: `listening_${t._id}_${Date.now()}` });
      await db.collection('listeningtests').updateOne({ _id: t._id },
        { $set: { audioUrl: up.secure_url, audioDuration: dur, audioFileName: `${name.replace(/\W+/g, '-').toLowerCase()}-full.mp3`, updatedAt: new Date() } });
      console.log(`   ✓ audio ${dur}s ${(fs.statSync(out).size / 1e6).toFixed(1)}MB ${up.secure_url}`);
    }
  } finally { await mongoose.disconnect(); }
})();
