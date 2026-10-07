// Import VOL drafts (web/vol<V>/draft/t<T>p<P>.json, built by vol_build.js) as HIDDEN ListeningSections:
// part audio → Cloudinary listening-sections/vol<V>_t<T>_p<P>, map crops → listening-maps/vol<V>_t<T>_p<P>_g<i>.
// Source mark: audioFileName "vol<V>_t<T>_p<P>.mp3" (refuses to import twice). Writes web/vol<V>/imported.json.
//   node vol_import.js <vol> <t6p1 …> [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const ListeningSection = require('../../models/ListeningSection');
const { audioFor, durationOf, cropFor } = require('./vol_media');

const [vol, ...rest] = process.argv.slice(2);
const apply = rest.includes('--apply');
const ids = rest.filter(a => !a.startsWith('--'));
const W = f => path.join(__dirname, 'web', `vol${vol}`, f);
const IMPORTED = W('imported.json');
const imported = fs.existsSync(IMPORTED) ? JSON.parse(fs.readFileSync(IMPORTED, 'utf8')) : {};
const upload = (file, opts) => new Promise((res, rej) => fs.createReadStream(file).pipe(cloudinary.uploader.upload_stream(opts, (e, r) => e ? rej(e) : res(r))));
const strip = o => Array.isArray(o) ? o.map(strip) : (o && typeof o === 'object')
  ? Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('_')).map(([k, v]) => [k, strip(v)])) : o;

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    for (const id of ids) {
      const d = JSON.parse(fs.readFileSync(W(`draft/${id}.json`), 'utf8'));
      const dup = await ListeningSection.findOne({ audioFileName: d.audioFileName }).select('_id').lean();
      if (dup || imported[id]) { console.log(`SKIP ${id} ${d.title}: already in DB (${dup ? dup._id : imported[id]})`); continue; }
      const maps = d.questionGroups.map((g, i) => g._crop ? i : -1).filter(i => i >= 0);
      const mp3 = audioFor(d), dur = durationOf(mp3);
      console.log(`${apply ? 'IMPORT' : 'DRY'} ${id} P${d.partNumber} ${d.title} — audio ${dur}s, ${maps.length} map(s)`);
      if (!apply) continue;
      const tag = d.audioFileName.replace(/\.mp3$/, '');
      const au = await upload(mp3, { resource_type: 'video', folder: 'listening-sections', public_id: tag, overwrite: true });
      for (const gi of maps) {
        const im = await upload(cropFor(d, gi), { folder: 'listening-maps', public_id: `${tag}_g${gi}`, overwrite: true });
        d.questionGroups[gi].imageUrl = im.secure_url;
      }
      const doc = strip(d);
      Object.assign(doc, { audioUrl: au.secure_url, audioDuration: Math.round(au.duration || dur), isActive: false });
      const s = await ListeningSection.create(doc);
      imported[id] = String(s._id);
      fs.writeFileSync(IMPORTED, JSON.stringify(imported, null, 1));
      console.log(`  ✓ ${s._id}`);
    }
  } finally { await mongoose.disconnect(); }
})();
