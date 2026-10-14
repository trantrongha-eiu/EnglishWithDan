// scripts/patchWT1Images.js
// One-off: upload the Maps/Process chart images to Cloudinary and patch the
// matching WT1Exercise docs (stimulus.imageUrl + needsAsset:false + published:true).
//
//   node scripts/patchWT1Images.js --dry   # show the plan, upload nothing
//   node scripts/patchWT1Images.js         # upload + patch prod
//
// Images come from the extracted docx media:
//   task 1 grammar/extracted-images/maps-process/imageN.png
// Mapping (image → exercise codes) is derived from the captions in
// IELTS-Writing-Task-1-Maps-Process-Appendix-EnglishWithDan.docx.
'use strict';

const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', '..', 'task 1 grammar', 'extracted-images', 'maps-process');

// image file  ->  { caption, codes: [exercise codes that use it] }
const MAP = {
  'image2.png':  { caption: 'Youngsville, New Zealand — 1990 và 2010',          codes: ['T1-L14-E02', 'T1-L14-E03'] },
  'image3.png':  { caption: 'Thị trấn ven cảng — 2005 và 2010',                 codes: ['T1-L13-E02'] },
  'image4.png':  { caption: 'West Park Secondary School — 1950, 1980, 2010',    codes: ['T1-L16-E01', 'T1-L16-E02'] },
  'image5.png':  { caption: 'Templeton seaside resort — 2000 và 2013',          codes: ['T1-L17-E01', 'T1-TEST3-B'] },
  'image6.png':  { caption: 'Eastminster village — 1999 và 2009',               codes: ['T1-L17-E02'] },
  'image7.png':  { caption: 'Islip town centre — hiện tại và bản quy hoạch',    codes: ['T1-L18-E01'] },
  'image8.png':  { caption: 'City Hospital road access — 2007 và 2010',         codes: ['T1-L18-E02'] },
  'image9.png':  { caption: 'Life cycle of a frog',                             codes: ['T1-L23-E02'] },
  'image10.png': { caption: 'Cement Production và Concrete Production',         codes: ['T1-L22-E01'] },
  'image11.png': { caption: 'Milk production process',                         codes: ['T1-L22-E02'] },
  'image12.png': { caption: 'Brick manufacturing process',                     codes: ['T1-L22-E03', 'T1-TEST4-B'] },
  'image13.png': { caption: 'Life cycle of the honey bee',                     codes: ['T1-L24-E01'] },
  'image14.png': { caption: 'Life cycle of the salmon',                        codes: ['T1-L24-E02'] },
};

async function main() {
  const dry = process.argv.includes('--dry');
  const entries = Object.entries(MAP);
  const total = entries.reduce((n, [, v]) => n + v.codes.length, 0);
  console.log(`[patchWT1Images] ${dry ? 'DRY RUN' : 'LIVE'} — ${entries.length} ảnh → ${total} exercise\n`);

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
