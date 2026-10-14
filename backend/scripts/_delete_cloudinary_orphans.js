// One-off (2026-10-10): delete the 160 Cloudinary assets no longer referenced
// by the DB or the repo (~1.1 GB, mostly duplicate listening_tmp_* uploads and
// Cloudinary's default samples/). Every file was downloaded and size-checked
// first — backup + manifest: D:\Projects\cloudinary_orphan_backup_2026-10-10
//   node scripts/_delete_cloudinary_orphans.js          # list only
//   node scripts/_delete_cloudinary_orphans.js --apply
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });

const MANIFEST = 'D:/Projects/cloudinary_orphan_backup_2026-10-10/_manifest.json';
const list = JSON.parse(require('fs').readFileSync(MANIFEST, 'utf8'));

(async () => {
  const mb = list.reduce((s, a) => s + a.bytes, 0) / 1e6;
  console.log(`${list.length} assets, ${mb.toFixed(0)} MB`);
  if (!process.argv.includes('--apply')) { list.forEach(a => console.log(' ', a.rt, a.id)); return console.log('list only — add --apply'); }
  const tally = {};
  for (const rt of ['image', 'video', 'raw']) {
    const ids = list.filter(a => a.rt === rt).map(a => a.id);
    for (let i = 0; i < ids.length; i += 100) {
      const r = await cloudinary.api.delete_resources(ids.slice(i, i + 100), { resource_type: rt, type: 'upload' });
      for (const [id, v] of Object.entries(r.deleted || {})) {
        tally[v] = (tally[v] || 0) + 1;
        if (v !== 'deleted') console.log('  ', rt, id, v);
      }
    }
  }
  console.log(tally);
})().catch(e => { console.error(e.error || e.message); process.exit(1); });
