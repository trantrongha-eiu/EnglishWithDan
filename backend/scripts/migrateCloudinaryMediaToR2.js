// scripts/migrateCloudinaryMediaToR2.js
// Move every remaining Cloudinary file referenced from the DB to Cloudflare
// R2 (2026-10-14) — covers, content images (inside passage HTML too), map /
// chart images, proctor screenshots, avatars, assignment photos, PDFs, the
// tuition QR, Entrance Test recordings. Listening audio already moved
// (migrateListeningAudioToR2.js). New uploads go to R2 via services/mediaStore.
//
// Every string in every collection is scanned, so a URL is found wherever it
// sits (field, array, snapshot, HTML). Each unique URL is copied once:
//   - a card cover (only ever seen in a *thumbnailUrl field, untransformed)
//     is fetched as Cloudinary's own c_fill,g_auto 640×320 WebP crop — the
//     exact framing students see today — since R2 serves bytes as-is and
//     utils/cardThumbnail only crops Cloudinary URLs;
//   - anything else is fetched byte-for-byte as delivered (transformations
//     included) and stored at its public_id path.
// A local copy of every file goes to --originals (default
// D:\Projects\cloudinary_media_originals) — the only copy once Cloudinary
// is cleaned up.
//
// Phases (resumable, re-run safely):
//   (no flag)          dry run: what would move, by folder and field.
//   --copy [--limit N] download + upload to R2; DB untouched. Logged to
//                      data/mediaR2Backup/map.jsonl.
//   --apply            --copy, then rewrite every DB string that holds a copied
//                      URL (each change → changes.jsonl, guarded by the old value
//                      so a concurrent write is never clobbered). Sibling
//                      publicId / qrImagePublicId / audioPublicId → the R2 key.
//   --rollback         restore every changed field from changes.jsonl.
// Cloudinary is never modified.
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const APPLY = flag('--apply');
const COPY = APPLY || flag('--copy');
const ROLLBACK = flag('--rollback');
const LIMIT = Number(opt('--limit', Infinity));
const ORIGINALS = opt('--originals', path.resolve(__dirname, '..', '..', '..', 'cloudinary_media_originals'));
const BACKUP_DIR = path.join(__dirname, 'data', 'mediaR2Backup');
const MAP_FILE = path.join(BACKUP_DIR, 'map.jsonl');
const CHANGES_FILE = path.join(BACKUP_DIR, 'changes.jsonl');

const URL_RE = /https?:\/\/res\.cloudinary\.com\/[^\s"'<>)\\]+/g;
const COVER_T = 'c_fill,g_auto,w_640,h_320,q_auto:good,f_webp';
const EXT_OF = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif',
  'image/bmp': 'bmp', 'image/svg+xml': 'svg', 'application/pdf': 'pdf',
  'audio/webm': 'webm', 'video/webm': 'webm', 'audio/mpeg': 'mp3', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'video/mp4': 'mp4',
};
// Siblings that hold the storage id of a URL field.
const ID_SIBLING = { url: 'publicId', qrImageUrl: 'qrImagePublicId', audioUrl: 'audioPublicId' };

const readJsonl = (f) => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(JSON.parse) : [];

// https://res.cloudinary.com/<cloud>/<type>/upload/[transforms/][v123/]<public_id>[.ext]
function parse(url) {
  const m = /^https?:\/\/res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\/(.+)$/.exec(url.split(/[?#]/)[0]);
  if (!m) return null;
  const segs = m[2].split('/');
  const transforms = [];
  while (segs.length > 1 && !/^v\d+$/.test(segs[0]) && (segs[0].includes(',') || /^[a-z]{1,3}_/.test(segs[0]))) transforms.push(segs.shift());
  const rest = segs.join('/'); // [v123/]public_id[.ext], as delivered
  if (segs.length > 1 && /^v\d+$/.test(segs[0])) segs.shift();
  let pid = decodeURIComponent(segs.join('/'));
  let ext = '';
  const e = /\.([a-z0-9]{2,5})$/i.exec(pid);
  if (e && m[1] !== 'raw') { ext = e[1].toLowerCase(); pid = pid.slice(0, -e[0].length); }
  return { type: m[1], transforms: transforms.join('/'), pid, ext, rest };
}

// Walk every string of a document; cb(pathArray, value, parent, key).
function walk(v, p, cb, parent, key) {
  if (typeof v === 'string') return cb(p, v, parent, key);
  if (Array.isArray(v)) return v.forEach((x, i) => walk(x, p.concat(i), cb, v, i));
  if (v && typeof v === 'object' && !(v instanceof Date) && !v._bsontype) {
    for (const k of Object.keys(v)) if (k !== '_id') walk(v[k], p.concat(k), cb, v, k);
  }
}

async function scan(db, onDoc) {
  const cols = (await db.listCollections().toArray()).map(c => c.name).filter(n => !n.startsWith('system.')).sort();
  for (const col of cols) {
    for await (const doc of db.collection(col).find({})) await onDoc(col, doc);
  }
}

async function fetchBuf(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  const len = Number(r.headers.get('content-length'));
  if (len && len !== buf.length) throw new Error(`truncated: ${buf.length}/${len} bytes`);
  return { buf, type: (r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase() };
}

function saveLocal(key, buf) {
  const dest = path.join(ORIGINALS, ...key.split('/'));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
}

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } }));
}

async function copyOne(r2, url, isCover) {
  const p = parse(url);
  if (!p) throw new Error('unrecognised Cloudinary URL');
  const base = `https://res.cloudinary.com/${url.split('/')[3]}/${p.type}/upload/`;
  if (isCover) {
    const orig = await fetchBuf(url);
    saveLocal(`${p.pid}.${p.ext || EXT_OF[orig.type] || 'bin'}`, orig.buf);
    const crop = await fetchBuf(`${base}${COVER_T}/${p.rest}`);
    if (crop.type !== 'image/webp') throw new Error(`cover crop came back as ${crop.type}`);
    const key = `covers/${p.pid.replace(/\//g, '_')}.webp`;
    saveLocal(key, crop.buf);
    return { key, newUrl: await r2.putObject(key, crop.buf, 'image/webp'), bytes: crop.buf.length, srcBytes: orig.buf.length };
  }
  const { buf, type } = await fetchBuf(url);
  const ext = p.type === 'raw' ? '' : (EXT_OF[type] || p.ext || 'bin');
  if (ext === 'svg') throw new Error('SVG — not copied (script risk on the media domain)');
  const suffix = p.transforms ? `_t${crypto.createHash('sha1').update(p.transforms).digest('hex').slice(0, 8)}` : '';
  const key = `${p.pid}${suffix}${ext ? '.' + ext : ''}`;
  saveLocal(key, buf);
  const contentType = p.type === 'raw' && /\.pdf$/i.test(p.pid) ? 'application/pdf' : (type || 'application/octet-stream');
  return { key, newUrl: await r2.putObject(key, buf, contentType), bytes: buf.length, srcBytes: buf.length };
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  if (ROLLBACK) {
    const changes = readJsonl(CHANGES_FILE);
    let n = 0, skipped = 0;
    for (const c of changes.reverse()) {
      const id = c.oid ? new mongoose.Types.ObjectId(c.id) : c.id;
      const r = await db.collection(c.col).updateOne({ _id: id, [c.path]: c.to }, { $set: { [c.path]: c.from } });
      if (r.modifiedCount) n++; else skipped++;
    }
    console.log(`rolled back ${n} fields (${skipped} already changed since). R2 objects left in place.`);
    return mongoose.disconnect();
  }

  // 1) Every Cloudinary URL and the fields it appears in.
  const seen = new Map(); // url -> { fields:Set, coverOnly:boolean }
  await scan(db, (col, doc) => walk(doc, [], (p, s) => {
    const m = s.match(URL_RE);
    if (!m) return;
    const field = `${col}.${p.filter(x => typeof x === 'string').join('.')}`;
    for (const u of m) {
      if (!seen.has(u)) seen.set(u, { fields: new Set(), coverOnly: true });
      const e = seen.get(u);
      e.fields.add(field);
      if (!(/thumbnailUrl$/.test(field) && s === u)) e.coverOnly = false;
    }
  }));
  const done = new Map(readJsonl(MAP_FILE).map(m => [m.oldUrl, m]));
  const all = [...seen.entries()].map(([url, e]) => ({ url, fields: [...e.fields], cover: e.coverOnly && !parse(url)?.transforms }));
  const todo = all.filter(x => !done.has(x.url));
  console.log(`${all.length} Cloudinary URLs in the DB — ${all.length - todo.length} already on R2, ${todo.length} to copy`);

  if (!COPY) {
    const byFolder = {};
    all.forEach(x => { const p = parse(x.url); const k = p ? `${p.type} ${p.pid.split('/')[0]}${x.cover ? ' (cover)' : ''}` : 'unparsed'; byFolder[k] = (byFolder[k] || 0) + 1; });
    Object.entries(byFolder).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(String(n).padStart(6), k));
    console.log('\ndry run — use --copy (R2 only) or --apply (R2 + DB).');
    return mongoose.disconnect();
  }

  // 2) Copy to R2.
  const r2 = require('../services/r2Service');
  if (!r2.isConfigured()) throw new Error('R2_* env vars missing — see services/r2Service.js');
  fs.mkdirSync(ORIGINALS, { recursive: true });
  const batch = todo.slice(0, LIMIT);
  let ok = 0, bytes = 0;
  const failed = [];
  await pool(batch, 6, async (x, i) => {
    try {
      const r = await copyOne(r2, x.url, x.cover);
      const line = { oldUrl: x.url, newUrl: r.newUrl, key: r.key, cover: x.cover, bytes: r.bytes, srcBytes: r.srcBytes, fields: x.fields, at: new Date().toISOString() };
      fs.appendFileSync(MAP_FILE, JSON.stringify(line) + '\n');
      done.set(x.url, line);
      ok++; bytes += r.bytes;
      if (ok % 50 === 0) console.log(`  ${ok}/${batch.length} copied (${(bytes / 1e6).toFixed(1)} MB)`);
    } catch (e) {
      failed.push(`${x.url}: ${e.message}`);
    }
  });
  console.log(`copied ${ok}, failed ${failed.length} (${(bytes / 1e6).toFixed(1)} MB) → R2 + ${ORIGINALS}`);
  failed.forEach(f => console.log('  ✗', f));

  if (!APPLY) return mongoose.disconnect();

  // 3) Rewrite the DB, field by field, guarded by the old value.
  let fields = 0, docsChanged = 0, raced = 0;
  await scan(db, async (col, doc) => {
    const sets = [];
    walk(doc, [], (p, s, parent, key) => {
      if (!s.includes('res.cloudinary.com')) return;
      const next = s.replace(URL_RE, u => (done.has(u) ? done.get(u).newUrl : u));
      if (next === s) return;
      sets.push({ path: p.join('.'), from: s, to: next });
      const idKey = ID_SIBLING[key];
      if (idKey && parent && typeof parent[idKey] === 'string' && done.has(s)) {
        sets.push({ path: p.slice(0, -1).concat(idKey).join('.'), from: parent[idKey], to: done.get(s).key });
      }
    });
    if (!sets.length) return;
    const filter = { _id: doc._id };
    const $set = {};
    for (const c of sets) { filter[c.path] = c.from; $set[c.path] = c.to; }
    const r = await db.collection(col).updateOne(filter, { $set });
    if (!r.modifiedCount) { raced++; return; }
    docsChanged++; fields += sets.length;
    fs.appendFileSync(CHANGES_FILE, sets.map(c => JSON.stringify({ col, id: String(doc._id), oid: doc._id instanceof mongoose.Types.ObjectId, ...c, at: new Date().toISOString() })).join('\n') + '\n');
  });
  console.log(`DB: ${fields} fields in ${docsChanged} documents now point at R2` + (raced ? `; ${raced} documents changed mid-run — re-run --apply` : ''));
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
