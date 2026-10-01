// Import reviewed DOL drafts (web/draft/<dolId>.json) as HIDDEN ListeningSection docs.
//   node dol_import.js <dolId …> [--apply]
// Per section: skip if already imported (audioFileName "dol_<sectionId>.mp3" or same title + part),
// download the audio from DOL and re-host it on Cloudinary (listening-sections), render map/diagram
// labels onto the image (dol_mapimg.py) and host it (listening-maps), drop every _private field and
// insert with isActive:false. Records dolId → _id in web/imported.json.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const ListeningSection = require('../../models/ListeningSection');

const W = f => path.join(__dirname, 'web', f);
const IMPORTED = W('imported.json');
const imported = fs.existsSync(IMPORTED) ? JSON.parse(fs.readFileSync(IMPORTED, 'utf8')) : {};
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36';

const upload = (buf, opts) => new Promise((res, rej) => cloudinary.uploader.upload_stream(opts, (e, r) => e ? rej(e) : res(r)).end(buf));

function strip(o) {
  if (Array.isArray(o)) return o.map(strip);
  if (o && typeof o === 'object') {
    const r = {};
    for (const [k, v] of Object.entries(o)) if (!k.startsWith('_')) r[k] = strip(v);
    return r;
  }
  return o;
}

(async () => {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const ids = args.filter(a => !a.startsWith('--'));
  await mongoose.connect(process.env.MONGO_URI);
  try {
    for (const id of ids) {
      const d = JSON.parse(fs.readFileSync(W(`draft/${id}.json`), 'utf8'));
      const tag = `dol_${d._dolSectionId}.mp3`;
      const dup = await ListeningSection.findOne({ $or: [{ audioFileName: tag }, { title: d.title, partNumber: d.partNumber }] }).select('_id title').lean();
      if (dup || imported[id]) { console.log(`SKIP ${id} ${d.title}: already in DB (${dup ? dup._id : imported[id]})`); continue; }
      const maps = d.questionGroups.map((g, i) => g._mapSource ? i : -1).filter(i => i >= 0);
      console.log(`${apply ? 'IMPORT' : 'DRY'} ${id} P${d.partNumber} ${d.title} — ${d.questionGroups.length} groups, ${maps.length} image(s)`);
      if (!apply) continue;

      const r = await fetch(d._audio, { headers: { 'User-Agent': UA, Referer: 'https://tuhoc.dolenglish.vn/' } });
      if (!r.ok) { console.log(`  ✗ audio HTTP ${r.status}`); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      const au = await upload(buf, { resource_type: 'video', folder: 'listening-sections', public_id: `dol_${d._dolSectionId}` });
      for (const gi of maps) {
        const png = W(`maps/${id}_${gi}.png`);
        execFileSync('py', [path.join(__dirname, 'dol_mapimg.py'), W(`draft/${id}.json`), String(gi), png], { stdio: 'pipe' });
        const im = await upload(fs.readFileSync(png), { folder: 'listening-maps', public_id: `dol_${d._dolSectionId}_${gi}` });
        d.questionGroups[gi].imageUrl = im.secure_url;
      }
      const doc = strip(d);
      doc.audioUrl = au.secure_url;
      doc.audioDuration = Math.round(au.duration || 0);
      doc.audioFileName = tag;
      doc.isActive = false;
      const s = await ListeningSection.create(doc);
      imported[id] = String(s._id);
      fs.writeFileSync(IMPORTED, JSON.stringify(imported, null, 1));
      console.log(`  ✓ ${s._id}  audio ${doc.audioDuration}s  ${(buf.length / 1e6).toFixed(1)}MB`);
    }
  } finally { await mongoose.disconnect(); }
})();
