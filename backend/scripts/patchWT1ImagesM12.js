// scripts/patchWT1ImagesM12.js
// Upload the Module 1–2 chart images (from the DynamicChart/StaticChart docx)
// to Cloudinary and patch the matching WT1Exercise docs.
//
//   node scripts/patchWT1ImagesM12.js --dry
//   node scripts/patchWT1ImagesM12.js
//
// Images = word/media/*.png extracted to
//   task 1 grammar/extracted-images/dynamic-static/<sha>.png
// The <sha>→exercise mapping is read off the captions in
// IELTS-Writing-Task-1-DynamicChart_StaticChart.docx.
'use strict';

const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', '..', 'task 1 grammar', 'extracted-images', 'dynamic-static');

// sha (no .png)  ->  { name, codes: [exercise codes], setKind?: false }
const MAP = {
  '203cd5a1562c9c5880266264e3815a212badc175': { name: 'line-graph-AN',           codes: ['T1-L05-E07'] },
  'b3d0309057815765ada3e2c1fc9587d344f627ca': { name: 'fish-meat-1979-2004',     codes: ['T1-L07-E06', 'T1-L11-E03'] },
  '5ab24a32ab9300ccf9a754d418736c00d0cbafd0': { name: 'uk-school-pie-1981-1991', codes: ['T1-L07-E07'] },
  'fb3525946d9167674ca0c8550f06e1e42d2f4a94': { name: 'gym-thailand-1985-2015',  codes: ['T1-L07-E08', 'T1-L11-E04'] },
  '9e20a78f34234cd3222eb410b3afe5daecb9a2c9': { name: 'figures-A-F',             codes: ['T1-L08-E02'] },
  '0bd085fdba6d6946b2e219703812dbe371d778b9': { name: 'forecast-1940-2030',      codes: ['T1-L08-E03'] },
  '79755cde4139aa6f8983e22ab6ec6037b74bb358': { name: 'population-65plus',       codes: ['T1-TEST2-B'] },
  '39c933fce5eb8354c9382597ad71e02dba05102c': { name: 'graphs-1-4-montage',      codes: ['T1-L10-E03', 'T1-L10-E04'], setKind: false },
};
// T1-L09-E04 has no single chart image in the docx — its 5 topics are already
// spelled out in stimulus.rows, so just publish it (no image).
const PUBLISH_NO_IMAGE = ['T1-L09-E04'];

async function main() {
  const dry = process.argv.includes('--dry');
  const entries = Object.entries(MAP);
  console.log(`[patchWT1ImagesM12] ${dry ? 'DRY RUN' : 'LIVE'}\n`);

  for (const [sha, v] of entries) {
    const p = path.join(IMG_DIR, sha + '.png');
    if (!fs.existsSync(p)) throw new Error(`Không tìm thấy ${p}`);
    console.log(`  ✓ ${sha.slice(0, 10)}…  (${v.name})  →  ${v.codes.join(', ')}`);
  }
  console.log(`  (no image, publish only) → ${PUBLISH_NO_IMAGE.join(', ')}`);
  if (dry) { console.log('\n(dry)'); process.exit(0); }

  require('dotenv').config();
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  const mongoose = require('mongoose');
  const WT1Exercise = require('../models/WT1Exercise');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('\nĐã kết nối MongoDB\n');

  for (const [sha, v] of entries) {
    const buf = fs.readFileSync(path.join(IMG_DIR, sha + '.png'));
    const dataUri = `data:image/png;base64,${buf.toString('base64')}`;
    const res = await cloudinary.uploader.upload(dataUri, {
      public_id: 'wt1/charts/' + v.name, overwrite: true, resource_type: 'image',
    });
    const set = { 'stimulus.imageUrl': res.secure_url, needsAsset: false, published: true };
    if (v.setKind !== false) set['stimulus.kind'] = 'image';
    const r = await WT1Exercise.updateMany({ code: { $in: v.codes } }, { $set: set });
    console.log(`  ✓ ${v.name} → ${res.secure_url}\n      patched ${r.modifiedCount}/${v.codes.length}: ${v.codes.join(', ')}`);
  }

  if (PUBLISH_NO_IMAGE.length) {
    const r = await WT1Exercise.updateMany(
      { code: { $in: PUBLISH_NO_IMAGE } },
      { $set: { needsAsset: false, published: true } },
    );
    console.log(`  ✓ publish (no image): ${r.modifiedCount}/${PUBLISH_NO_IMAGE.length}: ${PUBLISH_NO_IMAGE.join(', ')}`);
  }

  const pending = await WT1Exercise.find({ needsAsset: true }).select('code').lean();
  console.log(`\nCòn ${pending.length} bài needsAsset: ${pending.map((x) => x.code).join(', ') || '(không còn)'}`);
  await mongoose.disconnect();
  console.log('Xong.');
}

main().catch((e) => { console.error(e); process.exit(1); });
