// scripts/patchWT1LayoutImages.js
// One-off: upload the new "Dạng Layout" appendix images to Cloudinary and
// patch T1-L18B-E02/E03 (stimulus.imageUrl + needsAsset:false + published:true).
//
//   node scripts/patchWT1LayoutImages.js --dry
//   node scripts/patchWT1LayoutImages.js
//
// Images extracted from the freshly-updated
//   task 1 grammar/AcademicWritingFull_DanielHa.docx
// (word/media/image75.png, image76.png — the two figures next to the new
// "PHỤ LỤC — DẠNG LAYOUT" section) and copied into
//   task 1 grammar/extracted-images/maps-process/
// alongside patchWT1Images.js's existing images, same public_id convention
// (wt1/maps-process/<name>).
'use strict';

const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', '..', 'task 1 grammar', 'extracted-images', 'maps-process');

const MAP = {
  'layout-seminar-plan-ab.png':      { caption: 'Two seating layout options — Plan A and Plan B (seminar room)', codes: ['T1-L18B-E02'] },
  'layout-office-present-future.png': { caption: 'Present Office Building and Future Office Building',           codes: ['T1-L18B-E03'] },
};

async function main() {
  const dry = process.argv.includes('--dry');
  const entries = Object.entries(MAP);
  const total = entries.reduce((n, [, v]) => n + v.codes.length, 0);
  console.log(`[patchWT1LayoutImages] ${dry ? 'DRY RUN' : 'LIVE'} — ${entries.length} ảnh → ${total} exercise\n`);

  for (const [file, v] of entries) {
    const p = path.join(IMG_DIR, file);
    const ok = fs.existsSync(p);
    console.log(`  ${ok ? '✓' : '✗ THIẾU'} ${file}  →  ${v.codes.join(', ')}`);
    if (!ok) throw new Error(`Không tìm thấy ${p}`);
  }
  if (dry) { console.log('\n(dry) không upload / không ghi DB.'); process.exit(0); }

  require('dotenv').config();
  const r2 = require('../services/r2Service');
  if (!r2.isConfigured()) throw new Error('R2_* env vars missing — see services/r2Service.js');
  const mongoose = require('mongoose');
  const WT1Exercise = require('../models/WT1Exercise');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('\nĐã kết nối MongoDB\n');

  for (const [file, v] of entries) {
    const buf = fs.readFileSync(path.join(IMG_DIR, file));
    const dataUri = `data:image/png;base64,${buf.toString('base64')}`;
    const publicId = 'wt1/maps-process/' + file.replace(/\.png$/, '');
    const res = await r2.uploadImageFrom(dataUri, publicId);
    const url = res.secure_url;
    const r = await WT1Exercise.updateMany(
      { code: { $in: v.codes } },
      { $set: { 'stimulus.imageUrl': url, 'stimulus.kind': 'image', needsAsset: false, published: true } },
    );
    console.log(`  ✓ ${file} → ${url}\n      patched ${r.modifiedCount}/${v.codes.length}: ${v.codes.join(', ')}`);
  }

  const stillPending = await WT1Exercise.find({ needsAsset: true }).select('code').lean();
  console.log(`\nCòn ${stillPending.length} bài needsAsset: ${stillPending.map((x) => x.code).join(', ') || '(không còn)'}`);
  await mongoose.disconnect();
  console.log('Xong.');
}

main().catch((e) => { console.error(e); process.exit(1); });
