// scripts/patchWT1L09ChartImages.js
//
// T1-L09-E03 ("Review — Viết Introduction cho 4 biểu đồ") and T1-L09-E04
// ("Practice — Viết Overview cho 4 biểu đồ trên") only ever showed the 4
// charts as one-line text descriptions (stimulus.kind:'text', no image) —
// impossible to write an accurate Overview from, since "2 đặc điểm nổi bật"
// requires reading real trend data off the actual chart. No single montage
// image of all 4 charts exists (patchWT1ImagesM12.js already established
// that and explicitly stripped/skipped an image for these two), but each of
// the 4 charts individually already has a real image uploaded to Cloudinary
// for OTHER exercises that reuse the same charts (T1-L07-E06/07/08,
// T1-TEST2-B) — this just points T1-L09-E03/E04's rows at those same URLs
// instead of re-uploading anything.
//
// Also fixes two content bugs surfaced while doing this:
//   - Graph 3's text claimed 3 years (1981, 1991, 2001) but the real pie-
//     chart image only covers 2 (1981, 1991) — text now matches the image.
//   - E04's caption referenced "T1-L10-E03" (a different lesson/module
//     entirely) instead of its own lesson's E03.
//
// Mirrors backend/scripts/data/writingTask1/exercises-module2.json (kept in
// sync) so a from-scratch seed matches. A targeted $set on just these two
// docs — not a full course re-seed — since $set never touches fields not
// listed and other exercises may carry admin-only edits the seed JSON
// doesn't have (see fixWt1StrayStimulus.js's header for why a full re-seed
// is avoided here).
//
//   node scripts/patchWT1L09ChartImages.js --dry
//   node scripts/patchWT1L09ChartImages.js
'use strict';

const ROWS = [
  ['Graph 1', 'The consumption of fish and different kinds of meat in a European country between 1979 and 2004.',
    'https://res.cloudinary.com/dnexal8zv/image/upload/v1788518183/wt1/charts/fish-meat-1979-2004.png'],
  ['Graph 2', 'The proportion of the population aged 65 and over between 1940 and 2040 in three different countries.',
    'https://res.cloudinary.com/dnexal8zv/image/upload/wt1/charts/population-65plus.png'],
  ['Graph 3', 'The changes in annual spending by a particular UK school in 1981 and 1991.',
    'https://res.cloudinary.com/dnexal8zv/image/upload/v1788514573/wt1/charts/uk-school-pie-1981-1991.png'],
  ['Graph 4', 'Male and female fitness membership in Thailand between 1985 and 2015.',
    'https://res.cloudinary.com/dnexal8zv/image/upload/v1788514574/wt1/charts/gym-thailand-1985-2015.png'],
];

const E03_SAMPLE_ANSWER = 'The line graph illustrates how much fish and various types of meat were eaten in a European country between 1979 and 2004. The line graph compares the percentage of people aged 65 and above in three countries over the hundred years from 1940 to 2040. The pie charts illustrate how a particular UK school divided its annual spending, namely in 1981 and 1991. The line graph compares fitness club membership in Thailand in terms of gender between 1985 and 2015.';

async function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[patchWT1L09ChartImages] ${dry ? 'DRY RUN' : 'LIVE'}\n`);

  require('dotenv').config();
  const mongoose = require('mongoose');
  const WT1Exercise = require('../models/WT1Exercise');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Đã kết nối MongoDB\n');

  const e03 = await WT1Exercise.findOne({ code: 'T1-L09-E03' });
  const e04 = await WT1Exercise.findOne({ code: 'T1-L09-E04' });
  if (!e03) console.warn('  ! T1-L09-E03 không tồn tại — bỏ qua');
  if (!e04) console.warn('  ! T1-L09-E04 không tồn tại — bỏ qua');

  if (e03) {
    console.log('  T1-L09-E03: gắn ảnh cho 4 dòng + sửa Graph 3 (1981/1991) + sampleAnswer');
    if (!dry) {
      e03.stimulus.rows = ROWS.map((r) => r.slice());
      e03.rubric.sampleAnswer = E03_SAMPLE_ANSWER;
      e03.markModified('stimulus');
      e03.markModified('rubric');
      await e03.save();
    }
  }

  if (e04) {
    console.log('  T1-L09-E04: thêm 4 dòng (label + ảnh) + sửa caption sai lesson code');
    if (!dry) {
      e04.stimulus.rows = ROWS.map((r) => r.slice());
      e04.stimulus.caption = 'Dùng lại 4 biểu đồ ở bài trước (T1-L09-E03)';
      e04.markModified('stimulus');
      await e04.save();
    }
  }

  console.log(dry ? '\n(dry — không ghi gì)' : '\nXong.');
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
