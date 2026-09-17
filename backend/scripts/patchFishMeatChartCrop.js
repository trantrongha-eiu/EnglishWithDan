// scripts/patchFishMeatChartCrop.js
//
// The fish/meat consumption chart image (wt1/charts/fish-meat-1979-2004,
// extracted from the source docx as a plain screenshot of the textbook
// page) had a red-boxed "fill in the blank" Introduction example baked
// into the bottom of the image itself:
//   "The line graph illustrates the amount of fish and 3 other types of
//    meat which were consumed in a European country from 1979 to 2004."
// Every WT1 exercise that shows this chart is either an Introduction-
// writing exercise (T1-L09-E03) or a Body-writing exercise that assumes
// the student hasn't seen a model Introduction yet (T1-L06-E10,
// T1-L07-E06, T1-L09-E04, T1-L09-E07) — the baked-in answer gave it away.
//
// Fix: crop the image to just the exam prompt + chart (drop everything
// from y=445px down, see the local cropped file already produced), then
// re-upload to the SAME Cloudinary public_id and update every doc's
// stored URL to the new secure_url (Cloudinary assigns a new version on
// overwrite, so old version-pinned URLs would otherwise keep serving the
// stale cached image).
//
//   node scripts/patchFishMeatChartCrop.js --dry
//   node scripts/patchFishMeatChartCrop.js
'use strict';

const path = require('path');
const fs = require('fs');

const CROPPED_PATH = path.join(__dirname, '..', '..', 'task 1 grammar', 'extracted-images', 'dynamic-static', '79755cde-cropped.png');
const PUBLIC_ID = 'wt1/charts/fish-meat-1979-2004';
const OLD_URL_FRAGMENT = 'wt1/charts/fish-meat-1979-2004';

async function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[patchFishMeatChartCrop] ${dry ? 'DRY RUN' : 'LIVE'}\n`);

  if (!fs.existsSync(CROPPED_PATH)) throw new Error(`Không tìm thấy ${CROPPED_PATH}`);

  require('dotenv').config();
  const mongoose = require('mongoose');
  const WT1Exercise = require('../models/WT1Exercise');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Đã kết nối MongoDB');

  const docs = await WT1Exercise.find({
    $or: [
      { 'stimulus.imageUrl': new RegExp(OLD_URL_FRAGMENT) },
      { 'stimulus.rows': { $elemMatch: { $elemMatch: { $regex: OLD_URL_FRAGMENT } } } },
    ],
  });
  console.log(`Tìm thấy ${docs.length} bài dùng ảnh này: ${docs.map((d) => d.code).join(', ')}`);

  let newUrl;
  if (!dry) {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const buf = fs.readFileSync(CROPPED_PATH);
    const dataUri = `data:image/png;base64,${buf.toString('base64')}`;
    const res = await cloudinary.uploader.upload(dataUri, {
      public_id: PUBLIC_ID, overwrite: true, invalidate: true, resource_type: 'image',
    });
    newUrl = res.secure_url;
    console.log(`Đã upload ảnh crop → ${newUrl}`);
  } else {
    newUrl = 'https://res.cloudinary.com/<dry-run-placeholder>/' + PUBLIC_ID + '.png';
  }

  for (const doc of docs) {
    let changed = false;
    if (doc.stimulus && doc.stimulus.imageUrl && doc.stimulus.imageUrl.includes(OLD_URL_FRAGMENT)) {
      console.log(`  ${doc.code}: stimulus.imageUrl → ${newUrl}`);
      if (!dry) { doc.stimulus.imageUrl = newUrl; changed = true; }
    }
    if (doc.stimulus && Array.isArray(doc.stimulus.rows)) {
      doc.stimulus.rows.forEach((row, i) => {
        if (row[2] && row[2].includes(OLD_URL_FRAGMENT)) {
          console.log(`  ${doc.code}: stimulus.rows[${i}][2] → ${newUrl}`);
          if (!dry) { row[2] = newUrl; changed = true; }
        }
      });
    }
    if (!dry && changed) {
      doc.markModified('stimulus');
      await doc.save();
    }
  }

  console.log(dry ? '\n(dry — không ghi gì)' : '\nXong.');
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
