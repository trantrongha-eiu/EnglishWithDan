// One-off (2026-10-14): empty the Cloudinary account after everything moved
// to Cloudflare R2 (migrateListeningAudioToR2.js, migrateCloudinaryMediaToR2.js).
// Lists every asset; any not already backed up locally (audio/media originals,
// the 2026-10-10 orphan backup) is downloaded to --backup first, size-checked.
//   node scripts/_wipe_cloudinary.js            # inventory only
//   node scripts/_wipe_cloudinary.js --backup   # + download what has no local copy
//   node scripts/_wipe_cloudinary.js --apply    # + delete everything
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });

const APPLY = process.argv.includes('--apply');
const BACKUP = APPLY || process.argv.includes('--backup');
const BACKUP_DIR = 'D:/Projects/cloudinary_final_backup_2026-10-14';
const DATA = path.join(__dirname, 'data');

const jsonl = (f) => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(JSON.parse) : [];

async function listAll(rt) {
  const out = [];
  let cursor;
  do {
    const r = await cloudinary.api.resources({ resource_type: rt, type: 'upload', max_results: 500, next_cursor: cursor });
    out.push(...r.resources);
    cursor = r.next_cursor;
  } while (cursor);
  return out;
}

(async () => {
  // Assets already copied locally: by secure_url path (version-less) for the two migrations, by id for the orphan backup.
  const tail = (u) => u.replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/(\w+)\/upload\/(?:.*?\/)?(?:v\d+\/)/, '$1/');
  const covered = new Set();
  for (const m of jsonl(path.join(DATA, 'audioR2Backup', 'map.jsonl'))) covered.add(tail(m.oldUrl));
  for (const m of jsonl(path.join(DATA, 'mediaR2Backup', 'map.jsonl'))) covered.add(tail(m.oldUrl));
  const orphanManifest = 'D:/Projects/cloudinary_orphan_backup_2026-10-10/_manifest.json';
  const orphanIds = new Set(fs.existsSync(orphanManifest) ? JSON.parse(fs.readFileSync(orphanManifest, 'utf8')).map(a => `${a.rt}/${a.id}`) : []);

  const all = [];
  for (const rt of ['image', 'video', 'raw']) all.push(...(await listAll(rt)).map(a => ({ ...a, rt })));
  const isCovered = (a) => covered.has(`${a.rt}/${a.public_id}${a.format ? '.' + a.format : ''}`) || orphanIds.has(`${a.rt}/${a.public_id}`);
  const missing = all.filter(a => !isCovered(a));
  const mb = (xs) => (xs.reduce((s, a) => s + (a.bytes || 0), 0) / 1e6).toFixed(1);
  console.log(`${all.length} assets on Cloudinary (${mb(all)} MB): image ${all.filter(a => a.rt === 'image').length}, video ${all.filter(a => a.rt === 'video').length}, raw ${all.filter(a => a.rt === 'raw').length}`);
  console.log(`${all.length - missing.length} already backed up locally; ${missing.length} not (${mb(missing)} MB)`);
  const byFolder = {};
  missing.forEach(a => { const k = `${a.rt} ${a.public_id.includes('/') ? a.public_id.split('/')[0] : '(root)'}`; byFolder[k] = (byFolder[k] || 0) + 1; });
  Object.entries(byFolder).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(String(n).padStart(6), k));
  if (!BACKUP) return console.log('inventory only — --backup downloads the rest, --apply also deletes');

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const failed = [];
  for (const a of missing) {
    const dest = path.join(BACKUP_DIR, a.rt, ...`${a.public_id}${a.format && a.rt !== 'raw' ? '.' + a.format : ''}`.split('/'));
    if (fs.existsSync(dest) && fs.statSync(dest).size === a.bytes) continue;
    try {
      const r = await fetch(a.secure_url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      if (a.bytes && buf.length !== a.bytes) throw new Error(`size ${buf.length} != ${a.bytes}`);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, buf);
    } catch (e) { failed.push(`${a.rt}/${a.public_id}: ${e.message}`); }
  }
  fs.writeFileSync(path.join(BACKUP_DIR, '_manifest.json'), JSON.stringify(all.map(a => ({ rt: a.rt, id: a.public_id, format: a.format, bytes: a.bytes, url: a.secure_url })), null, 1));
  console.log(`backup → ${BACKUP_DIR}: ${failed.length} failed`);
  failed.forEach(f => console.log('  ✗', f));
  if (!APPLY) return;
  if (failed.length) throw new Error('backup incomplete — nothing deleted');

  const tally = {};
  for (const rt of ['image', 'video', 'raw']) {
    const ids = all.filter(a => a.rt === rt).map(a => a.public_id);
    for (let i = 0; i < ids.length; i += 100) {
      const r = await cloudinary.api.delete_resources(ids.slice(i, i + 100), { resource_type: rt, type: 'upload' });
      for (const [id, v] of Object.entries(r.deleted || {})) {
        tally[v] = (tally[v] || 0) + 1;
        if (v !== 'deleted') console.log('  ', rt, id, v);
      }
    }
  }
  console.log('deleted:', tally);
  for (const rt of ['image', 'video', 'raw']) console.log(`  ${rt} left: ${(await listAll(rt)).length}`);
})().catch(e => { console.error(e.error || e.message || e); process.exit(1); });
