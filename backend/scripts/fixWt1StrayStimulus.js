// scripts/fixWt1StrayStimulus.js
//
// Repairs WT1 course exercises whose stored `stimulus` / `wordBank` do not
// belong to them — the symptom reported on writing-task1.html was
// T1-L13-E02 ("PRACTICE 2 – Viết câu mô tả vị trí", a keyword→sentence
// drill) showing a port-town before/after MAP plus a change-verb word bank
// ("chopped down", "relocated to", "replaced by" …). That map + word bank
// are T1-L14-E02's; the seed file for T1-L13-E02 has neither. Almost
// certainly an admin CRUD edit that saved the wrong exercise's media onto
// this one.
//
// Re-running seedWritingTask1Course.js does NOT fix this: that seed upserts
// with `$set: <seed doc>`, which never *removes* a field the seed omits.
// So a stray stimulus/wordBank in the DB survives a re-seed and must be
// $unset explicitly — which is what this script does.
//
// What it does:
//   1. Loads the seed exercises for course IELTS-W-T1.
//   2. For every published WT1Exercise in that course, compares the stored
//      stimulus.imageUrl / wordBank against the seed's.
//   3. Reports every exercise where the DB has a stimulus or wordBank that
//      the seed does NOT (i.e. the seed author never gave it one) — these
//      are the ones that look wrong.
//   4. In LIVE mode, $unsets stimulus + wordBank on exactly those.
//      Exercises where the seed *does* define a stimulus are never touched
//      (an admin may have legitimately swapped the image).
//
//   node scripts/fixWt1StrayStimulus.js --dry     # report only
//   node scripts/fixWt1StrayStimulus.js           # apply the $unset
'use strict';

const path = require('path');
const fs = require('fs');

const COURSE = 'IELTS-W-T1';
const DATA_DIR = path.join(__dirname, 'data', 'writingTask1');

function loadSeedExercises() {
  const files = fs.readdirSync(DATA_DIR).filter((f) => /^exercises-.*\.json$/.test(f));
  let out = [];
  for (const f of files) out = out.concat(JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')).exercises || []);
  const byCode = {};
  for (const e of out) byCode[e.code] = e;
  return byCode;
}

async function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[fixWt1StrayStimulus] ${dry ? 'DRY RUN — report only' : 'LIVE — will $unset stray fields'}\n`);

  require('dotenv').config();
  const mongoose = require('mongoose');
  const WT1Exercise = require('../models/WT1Exercise');
  const WT1Lesson = require('../models/WT1Lesson');
  const WT1Module = require('../models/WT1Module');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Đã kết nối MongoDB\n');

  const seed = loadSeedExercises();

  const moduleCodes = (await WT1Module.find({ courseCode: COURSE }).select('code').lean()).map((m) => m.code);
  const lessonCodes = (await WT1Lesson.find({ moduleCode: { $in: moduleCodes } }).select('code').lean()).map((l) => l.code);
  const rows = await WT1Exercise.find({ lessonCode: { $in: lessonCodes } }).lean();
  console.log(`Quét ${rows.length} exercise thuộc course ${COURSE}\n`);

  const stray = [];   // DB has stimulus/wordBank the seed never gave it
  const diff = [];     // seed DOES define a stimulus but DB's imageUrl differs — report only

  for (const ex of rows) {
    const s = seed[ex.code];
    const seedHasStim = !!(s && s.stimulus && (s.stimulus.imageUrl || s.stimulus.kind));
    const seedHasWB = !!(s && Array.isArray(s.wordBank) && s.wordBank.length);
    const dbHasStim = !!(ex.stimulus && (ex.stimulus.imageUrl || ex.stimulus.kind));
    const dbHasWB = !!(Array.isArray(ex.wordBank) && ex.wordBank.length);

    if (!s) continue; // exercise not in the seed (admin-added) — leave alone

    // Per-field: a field is "stray" only when the seed doesn't define it.
    // An exercise whose seed HAS a real stimulus (e.g. T1-L22-E03's bee
    // diagram) but also picked up a stray wordBank gets only the wordBank
    // cleared — its own stimulus is left alone.
    const strayStim = dbHasStim && !seedHasStim;
    const strayWB = dbHasWB && !seedHasWB;

    if (strayStim || strayWB) {
      stray.push({
        code: ex.code, type: ex.type, title: ex.title,
        strayStim, strayWB,
        dbStimulus: strayStim ? (ex.stimulus.imageUrl || ex.stimulus.kind) : null,
        dbWordBank: strayWB ? ex.wordBank : null,
      });
    } else if (seedHasStim && dbHasStim && s.stimulus.imageUrl && ex.stimulus.imageUrl && s.stimulus.imageUrl !== ex.stimulus.imageUrl) {
      diff.push({ code: ex.code, seed: s.stimulus.imageUrl, db: ex.stimulus.imageUrl });
    }
  }

  if (diff.length) {
    console.log(`ℹ️  ${diff.length} exercise có stimulus khác seed (admin có thể đã đổi ảnh — KHÔNG đụng tới):`);
    diff.forEach((d) => console.log(`   ${d.code}\n      seed: ${d.seed}\n      db  : ${d.db}`));
    console.log();
  }

  if (!stray.length) {
    console.log('✅ Không có exercise nào mang stimulus/wordBank "lạc" — không cần sửa.');
  } else {
    console.log(`⚠️  ${stray.length} exercise mang stimulus/wordBank mà seed KHÔNG hề khai báo:`);
    stray.forEach((x) => {
      console.log(`   ${x.code} (${x.type}) — ${x.title || ''}`);
      if (x.strayStim) console.log(`      → sẽ $unset stimulus (đang là: ${x.dbStimulus})`);
      if (x.strayWB) console.log(`      → sẽ $unset wordBank (đang là: ${JSON.stringify(x.dbWordBank)})`);
    });
    console.log();

    if (!dry) {
      let n = 0;
      for (const x of stray) {
        const unset = {};
        if (x.strayStim) unset.stimulus = 1;
        if (x.strayWB) unset.wordBank = 1;
        const res = await WT1Exercise.updateOne({ code: x.code }, { $unset: unset });
        if (res.modifiedCount) n++;
        console.log(`   ✏️  ${x.code}: $unset ${Object.keys(unset).join(' + ')}`);
      }
      console.log(`\n✅ Đã dọn ${n}/${stray.length} exercise.`);
    } else {
      console.log('   (DRY RUN — chạy lại không có --dry để áp dụng $unset)');
    }
  }

  await mongoose.disconnect();
  console.log('\nXong.');
}

main().catch((e) => { console.error(e); process.exit(1); });
