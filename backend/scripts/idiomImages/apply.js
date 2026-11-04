'use strict';
// Upload the picked idiom illustrations (../data/idiomImages.json, made by
// candidates.js → sheet.js → pick.js) to R2 and set words[i].imageUrl on the
// "IELTS Speaking – Idioms thông dụng" Vocab Topic. rawImport is regenerated so
// the admin text editor keeps the image= lines. Pre-cropped 8:5 (640×400 WebP,
// "attention" crop) to match the Learn card / Quiz image.
// Words that already have an image are skipped unless --force.
//   node scripts/idiomImages/apply.js             # dry run
//   node scripts/idiomImages/apply.js --apply [--force]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const mongoose = require('mongoose');
const VocabularyLesson = require('../../models/VocabularyLesson');
const { lessonToText } = require('../../services/vocabularyLessonParser');
const picks = require('../data/idiomImages.json');

const TITLE = 'IELTS Speaking – Idioms thông dụng';
const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');
const UA = 'EnglishWithDan-covers/1.0 (https://ieltsthayha.com)';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function download(url) {
  let res;
  for (let i = 0; i < 4; i++) {
    res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status !== 429) break;
    await sleep(5000 * (i + 1));
  }
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const lesson = await VocabularyLesson.findOne({ title: TITLE }).lean();
    if (!lesson) throw new Error(`lesson "${TITLE}" not found`);
    const byWord = new Map(lesson.words.map((w, i) => [w.word, i]));
    const plan = [];
    for (const p of picks) {
      const i = byWord.get(p.word);
      if (i == null) { console.log(`✗ "${p.word}" not in the lesson`); continue; }
      if (lesson.words[i].imageUrl && !FORCE) continue;
      plan.push({ i, p });
    }
    console.log(`${picks.length} picks, ${plan.length} to upload (${lesson.words.length} words in the lesson).`);
    if (!APPLY || !plan.length) { if (plan.length) console.log('dry run — re-run with --apply.'); return; }

    const r2 = require('../../services/r2Service');
    if (!r2.isConfigured()) throw new Error('R2_* env vars missing — see services/r2Service.js');
    const sharp = require('sharp');
    const urls = new Map();
    for (const { i, p } of plan) {
      try {
        const out = await sharp(await download(p.image), { limitInputPixels: 50e6 })
          .rotate().resize(640, 400, { fit: 'cover', position: sharp.strategy.attention }).webp({ quality: 80 }).toBuffer();
        const id = `${Date.now()}_${require('crypto').randomBytes(4).toString('hex')}`;
        urls.set(i, await r2.putObject(`idioms/${id}.webp`, out, 'image/webp'));
        console.log(`✓ ${p.word}`);
      } catch (e) {
        console.log(`✗ ${p.word}: ${e.message}`);
      }
      await sleep(800);
    }

    // One conditional write, so a concurrent admin edit is never overwritten.
    const words = lesson.words.map((w, i) => (urls.has(i) ? { ...w, imageUrl: urls.get(i) } : w));
    const r = await VocabularyLesson.collection.updateOne(
      { _id: lesson._id, updatedAt: lesson.updatedAt },
      { $set: { words, rawImport: lessonToText({ ...lesson, words }), updatedAt: new Date() } });
    console.log(r.modifiedCount ? `\nSaved ${urls.size} image(s).` : '\n✗ lesson changed meanwhile — nothing saved, re-run.');
  } finally {
    await mongoose.disconnect();
  }
})().catch(e => { console.error(e); process.exit(1); });
