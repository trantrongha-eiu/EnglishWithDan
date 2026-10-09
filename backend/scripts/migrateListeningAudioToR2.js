// scripts/migrateListeningAudioToR2.js
// Move every Listening audio from Cloudinary to Cloudflare R2 (2026-10-10).
// Cloudinary free is 25 credits/month and Listening audio was ~95% of
// storage + nearly all bandwidth (44.5 credits); R2 has zero egress fees.
// On the way the audio is re-encoded to 64 kbps mono CBR MP3 (most tracks
// were 128–320 kbps stereo, some WAV) — CBR keeps <audio> seeking exact,
// and the output duration is checked against the source so audioTimestamp /
// dictation timings stay valid.
//
// Phases (all resumable, re-run safely):
//   --download            fetch every original into --originals (default
//                         D:\Projects\cloudinary_audio_originals); size-checked.
//                         Do this first — it is the only copy once Cloudinary
//                         deletes or locks the account.
//   --sample N            encode N files locally to listen to; no upload/DB.
//   --apply [--limit N]   encode → upload to R2 → swap the URL in the DB.
//                         Cloudinary is NOT touched; every swap is appended to
//                         data/audioR2Backup/map.jsonl.
//   --rollback            put every old Cloudinary URL back in the DB.
//   (no flag)             dry run: what would be processed.
//
// DB fields rewritten (exact old-URL match):
//   listeningtests.audioUrl, listeningsections.audioUrl,
//   listeningattempts.audioUrlSnapshot,
//   entrancetestattempts.sections.listening.{audioUrlSnapshot,sectionSnapshot.audioUrl}
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const mongoose = require('mongoose');

const BITRATE_K = 64;
const SKIP_ENCODE_BELOW_K = 80;   // already small — upload as-is rather than lose quality
const MAX_DURATION_DRIFT = 0.5;   // seconds
const CLOUDINARY_AUDIO = /res\.cloudinary\.com\/[^/]+\/video\/upload\/(?:v\d+\/)?(?:listening|listening-sections)\//;

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const DOWNLOAD = flag('--download');
const APPLY = flag('--apply');
const ROLLBACK = flag('--rollback');
const SAMPLE = Number(opt('--sample', 0));
const LIMIT = Number(opt('--limit', Infinity));
const ORIGINALS = opt('--originals', path.resolve(__dirname, '..', '..', '..', 'cloudinary_audio_originals'));
const BACKUP_DIR = path.join(__dirname, 'data', 'audioR2Backup');
const MAP_FILE = path.join(BACKUP_DIR, 'map.jsonl');
const WORK = path.join(BACKUP_DIR, 'work');

// [collection, field] pairs that may hold a Listening audio URL.
const FIELDS = [
  ['listeningtests', 'audioUrl'],
  ['listeningsections', 'audioUrl'],
  ['listeningattempts', 'audioUrlSnapshot'],
  ['entrancetestattempts', 'sections.listening.audioUrlSnapshot'],
  ['entrancetestattempts', 'sections.listening.sectionSnapshot.audioUrl'],
];

let ffPath;
const ff = () => (ffPath ||= execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim());

function readMap() {
  if (!fs.existsSync(MAP_FILE)) return [];
  return fs.readFileSync(MAP_FILE, 'utf8').split('\n').filter(Boolean).map(JSON.parse);
}

const hms = (m) => (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]);

// Duration in seconds, parsed from ffmpeg's banner (imageio_ffmpeg ships no ffprobe).
// An MP3 without a Xing/Info header only gets a bitrate-based estimate there
// (off by ~1s on 17 of the sources), so those are fully decoded instead.
function probeDuration(file) {
  const r = spawnSync(ff(), ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const m = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(r.stderr || '');
  if (!m) throw new Error('no duration in ffmpeg output for ' + path.basename(file));
  if (!/Estimating duration from bitrate/.test(r.stderr)) return hms(m);
  const d = spawnSync(ff(), ['-hide_banner', '-nostats', '-i', file, '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 26 });
  const t = [...(d.stderr || '').matchAll(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/g)].pop();
  if (!t) throw new Error('could not decode ' + path.basename(file) + ' to measure its duration');
  return hms(t);
}

function encode(src, dest) {
  execFileSync(ff(), ['-y', '-loglevel', 'error', '-i', src, '-vn', '-map_metadata', '-1',
    '-ac', '1', '-ar', '44100', '-codec:a', 'libmp3lame', '-b:a', `${BITRATE_K}k`, dest]);
}

// "listening/listening_tmp_123" (no extension) from a Cloudinary delivery URL.
function publicIdOf(url) {
  const m = /\/video\/upload\/(?:v\d+\/)?((?:listening|listening-sections)\/[^?#]+?)(?:\.([a-z0-9]+))?$/i.exec(url);
  return m ? { pid: decodeURIComponent(m[1]), ext: (m[2] || 'bin').toLowerCase() } : null;
}

const localOriginal = (url) => {
  const { pid, ext } = publicIdOf(url);
  return path.join(ORIGINALS, pid.replace(/\//g, '__') + '.' + ext);
};

async function collectUrls(db) {
  const urls = new Map(); // url -> ['collection.field×n', ...]
  for (const [col, field] of FIELDS) {
    const rows = await db.collection(col).aggregate([
      { $match: { [field]: { $regex: CLOUDINARY_AUDIO.source } } },
      { $group: { _id: '$' + field, n: { $sum: 1 } } },
    ]).toArray();
    for (const r of rows) {
      if (!urls.has(r._id)) urls.set(r._id, []);
      urls.get(r._id).push(`${col}.${field}×${r.n}`);
    }
  }
  return urls;
}

async function swapUrl(db, from, to) {
  let n = 0;
  for (const [col, field] of FIELDS) {
    const r = await db.collection(col).updateMany({ [field]: from }, { $set: { [field]: to } });
    n += r.modifiedCount;
  }
  return n;
}

async function download(url, dest) {
  if (fs.existsSync(dest)) return false;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  const len = Number(r.headers.get('content-length'));
  if (len && len !== buf.length) throw new Error(`truncated: ${buf.length}/${len} bytes`);
  fs.writeFileSync(dest + '.part', buf);
  fs.renameSync(dest + '.part', dest);
  return true;
}

// Run `fn` over `items` with `n` workers.
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } }));
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  fs.mkdirSync(WORK, { recursive: true });
  fs.mkdirSync(ORIGINALS, { recursive: true });

  if (ROLLBACK) {
    const map = readMap();
    let n = 0;
    for (const m of map) n += await swapUrl(db, m.newUrl, m.oldUrl);
    console.log(`rolled back ${map.length} URLs (${n} fields). The R2 objects were left in place.`);
    return mongoose.disconnect();
  }

  const urls = [...(await collectUrls(db)).entries()];
  console.log(`${urls.length} Cloudinary audio URLs still in the DB`);

  if (DOWNLOAD) {
    let got = 0, had = 0, bytes = 0;
    const failed = [];
    await pool(urls, 4, async ([url], k) => {
      const dest = localOriginal(url);
      try {
        if (await download(url, dest)) { got++; bytes += fs.statSync(dest).size; } else had++;
        if ((got + had) % 25 === 0) console.log(`  ${got + had}/${urls.length} (${(bytes / 1e9).toFixed(2)} GB new)`);
      } catch (e) { failed.push(`${url}: ${e.message}`); }
    });
    console.log(`downloaded ${got}, already had ${had}, failed ${failed.length} → ${ORIGINALS}`);
    failed.forEach(f => console.log('  ✗', f));
    return mongoose.disconnect();
  }

  if (!APPLY && !SAMPLE) {
    const local = urls.filter(([u]) => fs.existsSync(localOriginal(u))).length;
    console.log(`dry run — ${local}/${urls.length} originals already downloaded. Use --download, --sample N or --apply.`);
    urls.slice(0, 10).forEach(([u, where]) => console.log('  ', u.split('/upload/')[1], '←', where.join(', ')));
    return mongoose.disconnect();
  }

  const r2 = APPLY ? require('../services/r2Service') : null;
  if (r2 && !r2.isConfigured()) throw new Error('R2_* env vars missing — see services/r2Service.js');

  const todo = urls.slice(0, SAMPLE || LIMIT);
  let before = 0, after = 0, ok = 0;
  const failed = [];
  await pool(todo, SAMPLE ? 1 : 3, async ([url, where], i) => {
    const { pid } = publicIdOf(url);
    const tag = `[${i + 1}/${todo.length}] ${pid}`;
    try {
      const src = localOriginal(url);
      await download(url, src);
      const dur = probeDuration(src);
      const srcBytes = fs.statSync(src).size;
      const kbps = srcBytes * 8 / dur / 1000;

      let out = src;
      if (kbps > SKIP_ENCODE_BELOW_K || !/\.mp3$/i.test(src)) {
        out = path.join(WORK, pid.replace(/\//g, '__') + '_m64.mp3');
        encode(src, out);
        const outDur = probeDuration(out);
        if (Math.abs(outDur - dur) > MAX_DURATION_DRIFT) throw new Error(`duration drift ${dur.toFixed(2)}s → ${outDur.toFixed(2)}s`);
      }
      const outBytes = fs.statSync(out).size;
      before += srcBytes; after += outBytes;
      const line = `${tag} ${(srcBytes / 1e6).toFixed(1)}MB @${kbps.toFixed(0)}k → ${(outBytes / 1e6).toFixed(1)}MB (${dur.toFixed(0)}s)`;
      if (SAMPLE) { ok++; return console.log(line, '\n    source:', src, '\n    64k:   ', out); }

      const newUrl = await r2.putObject(`${pid}.mp3`, fs.readFileSync(out), 'audio/mpeg');
      const fields = await swapUrl(db, url, newUrl);
      fs.appendFileSync(MAP_FILE, JSON.stringify({ oldUrl: url, newUrl, srcBytes, outBytes, duration: dur, fields, where, at: new Date().toISOString() }) + '\n');
      if (out !== src) fs.unlinkSync(out);
      ok++;
      console.log(`${line} ✓ R2, ${fields} DB fields`);
    } catch (e) {
      failed.push(`${pid}: ${e.message}`);
      console.log(`${tag} ✗ ${e.message}`);
    }
  });
  console.log(`\n${ok} ok, ${failed.length} failed — ${(before / 1e9).toFixed(2)} GB → ${(after / 1e9).toFixed(2)} GB`);
  failed.forEach(f => console.log('  ✗', f));
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
