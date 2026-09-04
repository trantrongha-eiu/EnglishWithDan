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
//
// 2026-09-04 audit against the docx captions caught three wrong picks in the
// first version of this MAP; the notes below record what changed:
//   - population-65plus   was <79755cde> (the fish & meat line graph)   → <314374cd>
//   - fish-meat-1979-2004 was <b3d03090> (a copy with a model answer)   → <79755cde> (clean-ish)
//   - graphs-1-4-montage  was <39c933fc> (a vocabulary table, no graph) → removed
//                         (T1-L10-E03/E04 stimuli are kind:text; imageUrl is unset)
//   - figures-A-F         <9e20a78f> only holds Figures A–C; the docx has a
//                         second image <eef6f3d8> for D–F. Both halves are now
//                         uploaded and T1-L08-E02 (responseSlots:6) points at a
//                         Cloudinary transform that stacks D–F under A–C.
'use strict';

const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', '..', 'task 1 grammar', 'extracted-images', 'dynamic-static');
const CLOUD = 'dnexal8zv';

// sha (no .png)  ->  { name, codes: [exercise codes], setKind?: false }
const MAP = {
  '203cd5a1562c9c5880266264e3815a212badc175': { name: 'line-graph-AN',           codes: ['T1-L05-E07'] },
  '79755cde4139aa6f8983e22ab6ec6037b74bb358': { name: 'fish-meat-1979-2004',     codes: ['T1-L07-E06', 'T1-L11-E03'] },
  '5ab24a32ab9300ccf9a754d418736c00d0cbafd0': { name: 'uk-school-pie-1981-1991', codes: ['T1-L07-E07'] },
  'fb3525946d9167674ca0c8550f06e1e42d2f4a94': { name: 'gym-thailand-1985-2015',  codes: ['T1-L07-E08', 'T1-L11-E04'] },
  '0bd085fdba6d6946b2e219703812dbe371d778b9': { name: 'forecast-1940-2030',      codes: ['T1-L08-E03'] },
  '314374cdf1726d929f28353d8b7841a3278c07c0': { name: 'population-65plus',       codes: ['T1-TEST2-B'] },
  // the two halves of the Figures A–F set (Exercise 2, Buổi 8) — see FIGURES_AF_URL
  '9e20a78f34234cd3222eb410b3afe5daecb9a2c9': { name: 'figures-abc',             codes: [] },
  'eef6f3d8c0d41dd55be7dcaf2ecc1d9db2d1778a': { name: 'figures-def',             codes: [] },
};

// Cloudinary transform URL that stacks figures-def under figures-abc into one A–F image.
const FIGURES_AF_URL =
  `https://res.cloudinary.com/${CLOUD}/image/upload/` +
  'w_1200,h_840,c_pad,b_white,g_north/' +
  'l_wt1:charts:figures-def,w_1200,c_scale/fl_layer_apply,g_south/' +
  'wt1/charts/figures-abc.png';
const FIGURES_AF_CODES = ['T1-L08-E02'];

// kind:text stimuli that must NOT carry an imageUrl (no montage exists in the docx —
// the four graph descriptions already live in stimulus.rows).
const STRIP_IMAGE = ['T1-L10-E03', 'T1-L10-E04'];

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
    console.log(`  ✓ ${sha.slice(0, 10)}…  (${v.name})  →  ${v.codes.join(', ') || '(montage half)'}`);
  }
  console.log(`  figures A–F montage → ${FIGURES_AF_CODES.join(', ')}`);
  console.log(`  strip imageUrl → ${STRIP_IMAGE.join(', ')}`);
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
      public_id: 'wt1/charts/' + v.name, overwrite: true, invalidate: true, resource_type: 'image',
    });
    if (!v.codes.length) { console.log(`  ✓ ${v.name} → ${res.secure_url} (montage half)`); continue; }
    const set = { 'stimulus.imageUrl': res.secure_url, needsAsset: false, published: true };
    if (v.setKind !== false) set['stimulus.kind'] = 'image';
    const r = await WT1Exercise.updateMany({ code: { $in: v.codes } }, { $set: set });
    console.log(`  ✓ ${v.name} → ${res.secure_url}\n      patched ${r.modifiedCount}/${v.codes.length}: ${v.codes.join(', ')}`);
  }

  const rAF = await WT1Exercise.updateMany(
    { code: { $in: FIGURES_AF_CODES } },
    { $set: { 'stimulus.imageUrl': FIGURES_AF_URL, 'stimulus.kind': 'image', needsAsset: false, published: true } },
  );
  console.log(`  ✓ figures A–F montage → ${rAF.modifiedCount}/${FIGURES_AF_CODES.length}: ${FIGURES_AF_CODES.join(', ')}`);

  const rStrip = await WT1Exercise.updateMany(
    { code: { $in: STRIP_IMAGE } },
    { $unset: { 'stimulus.imageUrl': '' } },
  );
  console.log(`  ✓ stripped imageUrl → ${rStrip.modifiedCount}/${STRIP_IMAGE.length}: ${STRIP_IMAGE.join(', ')}`);

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
