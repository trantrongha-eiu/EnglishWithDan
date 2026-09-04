// scripts/seedWritingTask1Course.js
// Seed the structured IELTS Writing Task 1 course (WT1 system).
//
//   node scripts/seedWritingTask1Course.js         # upsert into the DB
//   node scripts/seedWritingTask1Course.js --dry   # validate + tally, write nothing
//
// Idempotent: every doc is upsert-ed by `code`, so re-running never
// duplicates and never touches WT1Submission / WT1Progress (student data).
// Adapted from the teacher's seed-task1.js — MONGODB_URI → MONGO_URI (the
// project standard, cf. scripts/seedTask2Exercises.js), data dir moved
// under scripts/data/, models required individually.
'use strict';

const fs = require('fs');
const path = require('path');

const WT1Course = require('../models/WT1Course');
const WT1Module = require('../models/WT1Module');
const WT1Lesson = require('../models/WT1Lesson');
const WT1Exercise = require('../models/WT1Exercise');

const DATA_DIR = path.join(__dirname, 'data', 'writingTask1');
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));

async function upsert(Model, filter, doc, label) {
  await Model.findOneAndUpdate(
    filter,
    { $set: doc },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`  ✓ ${label}: ${doc.code}`);
}

// Kiểm tra dữ liệu trước khi ghi — bắt lỗi sớm còn hơn seed rác vào DB.
function validate(exercises, lessonCodes) {
  const errors = [];
  const seen = new Set();

  for (const ex of exercises) {
    if (seen.has(ex.code)) errors.push(`Trùng code: ${ex.code}`);
    seen.add(ex.code);

    if (!lessonCodes.has(ex.lessonCode))
      errors.push(`${ex.code}: lessonCode "${ex.lessonCode}" không tồn tại`);

    if (ex.autoGrade && (!ex.items || ex.items.length === 0))
      errors.push(`${ex.code}: autoGrade nhưng không có items`);

    if (!ex.autoGrade && !ex.rubric && !ex.items)
      errors.push(`${ex.code}: bài AI chấm nhưng thiếu rubric`);

    // Số marker "____" phải khớp số blanks
    if (ex.type === 'gap_fill') {
      for (const it of ex.items || []) {
        const markers = (String(it.prompt || '').match(/____/g) || []).length;
        const blanks = (it.blanks || []).length;
        if (markers !== blanks)
          errors.push(`${ex.code}/${it.id}: ${markers} marker nhưng ${blanks} blanks`);
      }
    }

    if (ex.type === 'mcq') {
      for (const it of ex.items || []) {
        if (!(it.options || []).some((o) => o.id === it.answer))
          errors.push(`${ex.code}/${it.id}: answer "${it.answer}" không có trong options`);
      }
    }

    if (ex.type === 'categorize') {
      const ids = new Set((ex.categories || []).map((c) => c.id));
      for (const it of ex.items || [])
        if (!ids.has(it.category))
          errors.push(`${ex.code}/${it.id}: category "${it.category}" không khai báo`);
    }
  }
  return errors;
}

function load() {
  const { course, modules, lessons } = read('lessons.json');
  const exercises = [
    ...read('exercises-module1.json').exercises,
    ...read('exercises-module2.json').exercises,
  ];
  const lessonCodes = new Set(lessons.map((l) => l.code));
  return { course, modules, lessons, exercises, lessonCodes };
}

function tally(exercises) {
  const byType = exercises.reduce((a, e) => ((a[e.type] = (a[e.type] || 0) + 1), a), {});
  const byLesson = exercises.reduce((a, e) => ((a[e.lessonCode] = (a[e.lessonCode] || 0) + 1), a), {});
  console.log('  Theo type:  ', JSON.stringify(byType));
  console.log('  Theo lesson:', JSON.stringify(byLesson));
  const pending = exercises.filter((e) => e.needsAsset).map((e) => e.code);
  console.log(`  Chờ ảnh (needsAsset): ${pending.length}${pending.length ? ' — ' + pending.join(', ') : ''}`);
}

async function runSeed({ course, modules, lessons, exercises }) {
  console.log('\nCourse:');
  await upsert(WT1Course, { code: course.code }, course, 'course');

  console.log('\nModules:');
  for (const m of modules)
    await upsert(WT1Module, { code: m.code }, { ...m, courseCode: course.code }, 'module');

  console.log('\nLessons:');
  for (const l of lessons) await upsert(WT1Lesson, { code: l.code }, l, 'lesson');

  console.log('\nExercises:');
  for (const ex of exercises) {
    // Bài còn thiếu ảnh biểu đồ thì chưa publish
    const doc = { ...ex, published: !ex.needsAsset };
    await upsert(WT1Exercise, { code: ex.code }, doc, 'exercise');
  }

  const pending = exercises.filter((e) => e.needsAsset).map((e) => e.code);
  if (pending.length) {
    console.log(`\n⚠️  ${pending.length} bài đang chờ ảnh biểu đồ (published=false):\n   ${pending.join(', ')}`);
    console.log('   Sau khi upload ảnh, patch: db.wt1exercises.updateOne(');
    console.log('     { code: "T1-L07-E06" },');
    console.log('     { $set: { "stimulus.imageUrl": "...", needsAsset: false, published: true } })');
  }
  console.log('\n  Tổng kết theo type:', JSON.stringify(exercises.reduce((a, e) => ((a[e.type] = (a[e.type] || 0) + 1), a), {})));
}

async function main() {
  const dry = process.argv.includes('--dry');
  const data = load();

  console.log(`[WT1Seed] ${dry ? 'DRY RUN — không ghi gì' : 'seeding'}\n`);
  console.log(`  ${data.modules.length} module · ${data.lessons.length} lesson · ${data.exercises.length} exercise`);
  const errors = validate(data.exercises, data.lessonCodes);
  if (errors.length) {
    console.error('\n❌ Dữ liệu seed có lỗi:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }
  console.log('\n✅ Validate xong: dữ liệu hợp lệ');
  tally(data.exercises);

  if (dry) process.exit(0);

  require('dotenv').config();
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('\nĐã kết nối MongoDB');
  await runSeed(data);
  await mongoose.disconnect();
  console.log('\nXong.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
