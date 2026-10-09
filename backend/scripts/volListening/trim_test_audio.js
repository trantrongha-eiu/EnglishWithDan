// Trim the tail of a FULL listening test's audio (the "10 minutes to transfer your answers" silence that came with the
// original recording) → re-encode, upload to Cloudinary, point the test at it. Same as trim_section_audio.js but for
// listeningtests (matched by exact name). Find the cut with ffmpeg silencedetect first. Backup → web/vol<V>/backup.
//   node trim_test_audio.js <vol> "<test name>" <cutSeconds> [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const upload = (file, opts) => new Promise((res, rej) => fs.createReadStream(file).pipe(cloudinary.uploader.upload_stream(opts, (e, r) => e ? rej(e) : res(r))));
const { uploadAudio } = require('../../services/r2Service'); // Listening audio → Cloudflare R2 (zero egress), see services/r2Service.js
const ff = execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const [VOL, name, cutArg] = process.argv.slice(2);
const cut = +cutArg;
const APPLY = process.argv.includes('--apply');
const W = f => path.join(__dirname, 'web', `vol${VOL}`, f);

(async () => {
  if (!VOL || !name || !(cut > 600)) { console.log('usage: node trim_test_audio.js <vol> "<test name>" <cutSeconds> [--apply]'); process.exit(1); }
  await mongoose.connect(process.env.MONGO_URI);
  const col = mongoose.connection.db.collection('listeningtests');
  const t = await col.findOne({ name });
  if (!t) throw new Error(`test "${name}" not found`);
  const stamped = (t.sections || []).flatMap(s => (s.questionGroups || []).flatMap(g => g.questions || []))
    .map(q => q.audioTimestamp).filter(x => x != null);
  if (stamped.some(x => x > cut)) throw new Error(`a question audioTimestamp (${Math.max(...stamped)}s) is after the cut`);
  console.log(`${t.name}: ${t.audioDuration}s → ${cut}s`);
  if (!APPLY) { console.log('dry run — add --apply'); return mongoose.disconnect(); }
  fs.mkdirSync(W('backup'), { recursive: true });
  fs.writeFileSync(W(`backup/trim_test_${t._id}_${Date.now()}.json`), JSON.stringify({ _id: String(t._id), name: t.name, audioUrl: t.audioUrl, audioDuration: t.audioDuration, audioFileName: t.audioFileName }, null, 1));
  const tmp = W(`audio/trim_test_${t._id}`);
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  const r = await fetch(t.audioUrl);
  fs.writeFileSync(tmp + '_src', Buffer.from(await r.arrayBuffer()));
  // 1.5 s fade so the cut never clicks
  execFileSync(ff, ['-y', '-loglevel', 'error', '-i', tmp + '_src', '-t', String(cut), '-af', `afade=t=out:st=${cut - 1.5}:d=1.5`, '-ac', '1', '-ar', '44100', '-b:a', '64k', tmp + '.mp3']);
  const up = await uploadAudio(tmp + '.mp3', { folder: 'listening', public_id: `trim_test_${t._id}_${Date.now()}` });
  await col.updateOne({ _id: t._id }, { $set: { audioUrl: up.secure_url, audioFileName: path.basename(up.secure_url), audioDuration: Math.round(up.duration || cut), updatedAt: new Date() } });
  console.log(`✓ ${up.secure_url} ${up.duration}s`);
  fs.unlinkSync(tmp + '_src');
  await mongoose.disconnect();
})().catch(e => { console.error(e.message); process.exit(1); });
