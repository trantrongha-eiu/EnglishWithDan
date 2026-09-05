// scripts/patchWT1ImagesFullV2.js
// Upload the 5 chart images the "full-v2" curriculum restructure's new
// Module 3 (static/mixed) content needs — extracted from
// IELTS-Writing-Task-1-full-v2.docx via mammoth, saved to
// task 1 grammar/extracted-images/full-v2/ — to Cloudinary and patch the
// matching WT1Exercise docs.
//
//   node scripts/patchWT1ImagesFullV2.js --dry
//   node scripts/patchWT1ImagesFullV2.js
'use strict';

const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', '..', 'task 1 grammar', 'extracted-images', 'full-v2');

const MAP = {
  'housing-preferences-uk-2009':          { codes: ['T1-L11-E02'] },
  'recycling-sydney-melbourne-worldwide': { codes: ['T1-L11-E03'] },
  'australian-household-energy-emissions':{ codes: ['T1-L11-E04'] },
  'uk-travel-abroad-and-visitors':        { codes: ['T1-L12-E02'] },
  'temperature-sunshine-three-cities':    { codes: ['T1-L12-E03'] },
};

async function main() {
  const dry = process.argv.includes('--dry');
  const entries = Object.entries(MAP);
  console.log(`[patchWT1ImagesFullV2] ${dry ? 'DRY RUN' : 'LIVE'}\n`);

  for (const [name, v] of entries) {
    const p = path.join(IMG_DIR, name + '.png');
    if (!fs.existsSync(p)) throw new Error(`Không tìm thấy ${p}`);
    console.log(`  ✓ ${name}  →  ${v.codes.join(', ')}`);
  }
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

  for (const [name, v] of entries) {
    const buf = fs.readFileSync(path.join(IMG_DIR, name + '.png'));
    const dataUri = `data:image/png;base64,${buf.toString('base64')}`;
    const res = await cloudinary.uploader.upload(dataUri, {
      public_id: 'wt1/full-v2/' + name, overwrite: true, invalidate: true, resource_type: 'image',
    });
    const r = await WT1Exercise.updateMany(
      { code: { $in: v.codes } },
      { $set: { 'stimulus.imageUrl': res.secure_url, needsAsset: false, published: true } }
    );
    console.log(`  ✓ ${name} → ${res.secure_url}\n      patched ${r.modifiedCount}/${v.codes.length}: ${v.codes.join(', ')}`);
  }

  await mongoose.disconnect();
  console.log('\nXong.');
}

main().catch((e) => { console.error(e); process.exit(1); });
