// Trim the tail of a đề lẻ's audio (e.g. the exam's "10 minutes to transfer your answers" silence that came with
// the original track) → re-encode, upload to Cloudinary, point the section at it. Only the END is cut, so
// dictation timings stay valid (refuses if a dictation sentence ends after the cut). Backup → web/vol<V>/backup.
//   node trim_section_audio.js <vol> <sectionId> <cutSeconds> [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const upload = (file, opts) => new Promise((res, rej) => fs.createReadStream(file).pipe(cloudinary.uploader.upload_stream(opts, (e, r) => e ? rej(e) : res(r))));
const { uploadAudio } = require('../../services/r2Service'); // Listening audio → Cloudflare R2 (zero egress), see services/r2Service.js
const ff = execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const [VOL, id, cutArg] = process.argv.slice(2);
const cut = +cutArg;
const APPLY = process.argv.includes('--apply');
const W = f => path.join(__dirname, 'web', `vol${VOL}`, f);

(async () => {
  if (!VOL || !id || !(cut > 30)) { console.log('usage: node trim_section_audio.js <vol> <sectionId> <cutSeconds> [--apply]'); process.exit(1); }
  await mongoose.connect(process.env.MONGO_URI);
  const col = mongoose.connection.db.collection('listeningsections');
  const s = await col.findOne({ _id: new mongoose.Types.ObjectId(id) });
  if (!s) throw new Error('section not found');
  const lastDict = Math.max(0, ...(s.dictationSentences || []).map(d => d.end || 0));
  if (lastDict > cut) throw new Error(`dictation sentence ends at ${lastDict}s, after the cut`);
  console.log(`${s.title}: ${s.audioDuration}s → ${cut}s (last dictation end ${lastDict}s)`);
  if (!APPLY) { console.log('dry run — add --apply'); return mongoose.disconnect(); }
  fs.mkdirSync(W('backup'), { recursive: true });
  fs.writeFileSync(W(`backup/trim_${id}_${Date.now()}.json`), JSON.stringify({ _id: id, audioUrl: s.audioUrl, audioDuration: s.audioDuration, audioFileName: s.audioFileName }, null, 1));
  const tmp = W(`audio/trim_${id}`);
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  const r = await fetch(s.audioUrl);
  fs.writeFileSync(tmp + '_src.mp3', Buffer.from(await r.arrayBuffer()));
  // 1.5 s fade so the cut never clicks
  execFileSync(ff, ['-y', '-loglevel', 'error', '-i', tmp + '_src.mp3', '-t', String(cut), '-af', `afade=t=out:st=${cut - 1.5}:d=1.5`, '-ac', '1', '-ar', '44100', '-b:a', '64k', tmp + '.mp3']);
  const up = await uploadAudio(tmp + '.mp3', { folder: 'listening-sections', public_id: `trim_${id}_${Date.now()}` });
  await col.updateOne({ _id: s._id }, { $set: { audioUrl: up.secure_url, audioDuration: Math.round(up.duration || cut), updatedAt: new Date() } });
  console.log(`✓ ${up.secure_url} ${up.duration}s`);
  fs.unlinkSync(tmp + '_src.mp3');
  await mongoose.disconnect();
})().catch(e => { console.error(e.message); process.exit(1); });
