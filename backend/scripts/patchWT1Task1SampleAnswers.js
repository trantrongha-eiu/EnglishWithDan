// scripts/patchWT1Task1SampleAnswers.js
//
// Backfill `rubric.sampleAnswer` on the Writing Task 1 course's
// `sentence_writing` exercises that shipped without one. The model answer
// is written to closely follow each exercise's own rubric (target
// structures, mustUse count, checklist, word count) and is shown to the
// student ONLY after they press "Nộp bài" — sanitizeExercise() strips
// rubric.sampleAnswer before submission, and gradeWritingLocal() returns
// it in the /submit response, where the frontend renders it under
// "Xem bài mẫu".
//
// Why a targeted patch and not a full re-seed: an admin may have edited
// other fields of these exercises via /admin/wt1, and the full seed does
// `$set: <whole doc>`. This only ever writes the single `rubric.sampleAnswer`
// path, and only when it is currently empty (so re-running is safe and a
// later hand-edited sample answer is never clobbered).
//
// Source of truth is the seed JSON under data/writingTask1/ — this script
// reads the sample answers straight from there so the two never drift.
//
//   node scripts/patchWT1Task1SampleAnswers.js --dry   # report only
//   node scripts/patchWT1Task1SampleAnswers.js         # apply
'use strict';

const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data', 'writingTask1');

// The 8 codes this patch is responsible for. Listed explicitly so the
// script's blast radius is auditable and a future seed sample answer added
// for some OTHER exercise doesn't silently get pushed by this script.
const CODES = [
  'T1-L05-E07', 'T1-L07-E02', 'T1-L08-E04', 'T1-L09-E03',
  'T1-TEST3-A3', 'T1-TEST3-A4', 'T1-L14-E04', 'T1-L15-E03',
];

function loadSeedSampleAnswers() {
  const files = fs.readdirSync(DATA_DIR).filter((f) => /^exercises-.*\.json$/.test(f));
  const byCode = {};
  for (const f of files) {
    for (const ex of (JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')).exercises || [])) {
      byCode[ex.code] = ex;
    }
  }
  const out = {};
  for (const code of CODES) {
    const ex = byCode[code];
    if (!ex) { console.warn(`⚠️  ${code}: không thấy trong seed JSON — bỏ qua`); continue; }
    const sa = ex.rubric && ex.rubric.sampleAnswer;
    if (!sa || !sa.trim()) { console.warn(`⚠️  ${code}: seed JSON chưa có rubric.sampleAnswer — bỏ qua`); continue; }
    out[code] = sa.trim();
  }
  return out;
}

async function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[patchWT1Task1SampleAnswers] ${dry ? 'DRY RUN — report only' : 'LIVE — will $set rubric.sampleAnswer'}\n`);

  const samples = loadSeedSampleAnswers();
  const codes = Object.keys(samples);
  if (!codes.length) { console.log('Không có sample answer nào để áp dụng.'); return; }

  require('dotenv').config();
  const mongoose = require('mongoose');
  const WT1Exercise = require('../models/WT1Exercise');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Đã kết nối MongoDB\n');

  let applied = 0, skipped = 0, missing = 0;
  for (const code of codes) {
    const ex = await WT1Exercise.findOne({ code }).select('code type rubric').lean();
    if (!ex) { console.log(`   ✗ ${code}: không có trong DB`); missing++; continue; }
    const current = ex.rubric && ex.rubric.sampleAnswer;
    if (current && current.trim()) {
      console.log(`   • ${code}: đã có sampleAnswer (${current.split(/\s+/).length} từ) — không đụng tới`);
      skipped++;
      continue;
    }
    console.log(`   ${dry ? '→ would set' : '✏️  set'} ${code}: "${samples[code].slice(0, 70)}…" (${samples[code].split(/\s+/).length} từ)`);
    if (!dry) {
      const res = await WT1Exercise.updateOne({ code }, { $set: { 'rubric.sampleAnswer': samples[code] } });
      if (res.modifiedCount) applied++;
    }
  }

  console.log(`\n${dry ? '(DRY RUN) ' : ''}applied ${applied}, skipped ${skipped}, missing ${missing}`);
  await mongoose.disconnect();
  console.log('Xong.');
}

main().catch((e) => { console.error(e); process.exit(1); });
