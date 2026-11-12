// scripts/seedCourse.js
// Seed one of the structured courses built on the WT1 system (same models,
// same JSON layout under scripts/data/<dir>/):
//
//   node scripts/seedCourse.js t1         # IELTS Writing Task 1  (data/writingTask1)
//   node scripts/seedCourse.js t2         # IELTS Writing Task 2  (data/writingTask2)
//   node scripts/seedCourse.js speaking   # IELTS Speaking        (data/speakingCourse)
//   node scripts/seedCourse.js mindset0   # Mindset for IELTS Foundation (data/mindset0) —
//        run scripts/seedMindsetMedia.js mindset0 FIRST (it creates the
//        Passage/ListeningSection docs the lessons' practiceLinks[].ref point at)
//   add --dry to validate + tally without writing anything
//
// Idempotent: every doc is upsert-ed by `code`, so re-running never
// duplicates and never touches WT1Submission / WT1Progress (student data).
// Re-running DOES overwrite edits made in the admin "Khoá học" pages.
'use strict';

const fs = require('fs');
const path = require('path');

const WT1Course = require('../models/WT1Course');
const WT1Module = require('../models/WT1Module');
const WT1Lesson = require('../models/WT1Lesson');
const WT1Exercise = require('../models/WT1Exercise');

const COURSES = {
  t1: { dir: 'writingTask1', tag: 'WT1Seed' },
  t2: { dir: 'writingTask2', tag: 'WT2Seed' },
  speaking: { dir: 'speakingCourse', tag: 'SpeakingSeed' },
  mindset0: { dir: 'mindset0', tag: 'Mindset0Seed' },
  mindset1: { dir: 'mindset1', tag: 'Mindset1Seed' },
};
const courseKey = process.argv.slice(2).find((a) => !a.startsWith('--'));
const COURSE = COURSES[courseKey];
if (!COURSE) {
  console.error('Usage: node scripts/seedCourse.js <' + Object.keys(COURSES).join('|') + '> [--dry]');
  process.exit(1);
}
const DATA_DIR = path.join(__dirname, 'data', COURSE.dir);
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
const listJson = (re) => fs.readdirSync(DATA_DIR).filter((f) => re.test(f)).sort();

// Content is split across files so each module can be authored/seeded
// independently: lessons*.json each carry { course, modules[], lessons[] }
// (merged by `code`); exercises-*.json each carry { exercises: [] }.
function dedupeByCode(arr) {
  const seen = new Set();
  return arr.filter((x) => (seen.has(x.code) ? false : seen.add(x.code)));
}

// Optional exercise fields that only some exercise types carry. When the seed
// JSON drops one (e.g. an exercise changes type), $set alone would leave the
// old value in the DB — stale `items` showed old prompts in the history view,
// stale `responseSlots` / `timerMinutes` changed the textareas and timer. So
// any of these missing from the seed doc is $unset.
const EXERCISE_OPTIONAL_FIELDS = [
  'items', 'rubric', 'stimulus', 'wordBank', 'categories', 'responseSlots',
  'timerMinutes', 'speakingPart', 'speakingPrepSeconds',
];

async function upsert(Model, filter, doc, label, optionalFields = []) {
  const $unset = {};
  for (const f of optionalFields) if (!(f in doc)) $unset[f] = '';
  await Model.findOneAndUpdate(
    filter,
    Object.keys($unset).length ? { $set: doc, $unset } : { $set: doc },
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
  const lessonFiles = listJson(/^lessons.*\.json$/);
  const exerciseFiles = listJson(/^exercises-.*\.json$/);
  if (!lessonFiles.length) throw new Error(`Không tìm thấy lessons*.json trong ${DATA_DIR}`);

  let course = null;
  let modules = [];
  let lessons = [];
  for (const f of lessonFiles) {
    const j = read(f);
    if (j.course && !course) course = j.course;
    modules = modules.concat(j.modules || []);
    lessons = lessons.concat(j.lessons || []);
  }
  modules = dedupeByCode(modules);
  lessons = dedupeByCode(lessons);

  let exercises = [];
  for (const f of exerciseFiles) exercises = exercises.concat(read(f).exercises || []);

  // Mindset: "media:<file>" → the R2 URL scripts/seedMindsetMedia.js cached
  // in media.json. Left as-is when not uploaded yet (a --dry run before media).
  const mediaFile = path.join(DATA_DIR, 'media.json');
  if (fs.existsSync(mediaFile) || /media:/.test(JSON.stringify({ lessons, exercises }))) {
    const media = fs.existsSync(mediaFile) ? JSON.parse(fs.readFileSync(mediaFile, 'utf8')) : {};
    const sub = (v) => JSON.parse(JSON.stringify(v).replace(/media:([A-Za-z0-9_.-]+\.(?:jpg|png|webp))/g, (m, f) => (typeof media[f] === 'string' ? media[f] : m)));
    lessons = sub(lessons);
    exercises = sub(exercises);
    const left = JSON.stringify({ lessons, exercises }).match(/media:[A-Za-z0-9_.-]+\.(?:jpg|png|webp)/g);
    if (left) console.log(`  ⚠️  ${left.length} ảnh chưa upload (chạy seedMindsetMedia.js): ${[...new Set(left)].join(', ')}`);
  }

  console.log(`  nguồn: ${lessonFiles.join(', ')} + ${exerciseFiles.join(', ') || '(chưa có exercises-*.json)'}`);
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

// Lesson fields only the Mindset courses carry — $unset when the seed doc
// drops them, same reason as EXERCISE_OPTIONAL_FIELDS. (Not theory/bookModels:
// syncBookModels.js writes bookModels outside this seed.)
const LESSON_OPTIONAL_FIELDS = ['vocabSave', 'practiceLinks', 'images'];

// practiceLinks[].ref = 'reading:<courseRef>' | 'listening:<courseRef>' →
// the reading.html / listening.html URL of the Passage / ListeningSection
// that scripts/seedMindsetMedia.js upserted under that courseRef.
async function resolvePracticeLinks(lessons) {
  const Passage = require('../models/Passage');
  const ListeningSection = require('../models/ListeningSection');
  const missing = [];
  for (const l of lessons) {
    if (!Array.isArray(l.practiceLinks)) continue;
    for (const pl of l.practiceLinks) {
      if (!pl.ref) continue;
      const [kind, ref] = String(pl.ref).split(':');
      const Model = kind === 'listening' ? ListeningSection : Passage;
      const doc = await Model.findOne({ courseRef: ref }).select('_id category').lean();
      if (!doc) { missing.push(pl.ref); continue; }
      pl.url = kind === 'listening'
        ? '/listening.html?sectionId=' + doc._id + '&exam=practice'
        : '/reading.html?passageId=' + doc._id + '&category=' + (doc.category || 'passage1') + '&exam=practice';
      if (!pl.kind) pl.kind = kind;
      delete pl.ref;
    }
  }
  if (missing.length) throw new Error('practiceLinks ref chưa có trong DB (chạy seedMindsetMedia.js trước): ' + missing.join(', '));
}

async function runSeed({ course, modules, lessons, exercises }) {
  console.log('\nCourse:');
  await upsert(WT1Course, { code: course.code }, course, 'course');

  console.log('\nModules:');
  for (const m of modules)
    await upsert(WT1Module, { code: m.code }, { ...m, courseCode: course.code }, 'module');

  console.log('\nLessons:');
  await resolvePracticeLinks(lessons);
  for (const l of lessons) await upsert(WT1Lesson, { code: l.code }, l, 'lesson', LESSON_OPTIONAL_FIELDS);

  console.log('\nExercises:');
  for (const ex of exercises) {
    // Bài còn thiếu ảnh biểu đồ thì chưa publish
    const doc = { ...ex, published: !ex.needsAsset };
    await upsert(WT1Exercise, { code: ex.code }, doc, 'exercise', EXERCISE_OPTIONAL_FIELDS);
  }

  const pending = exercises.filter((e) => e.needsAsset).map((e) => e.code);
  if (pending.length) {
    console.log(`\n⚠️  ${pending.length} bài đang chờ ảnh biểu đồ (published=false):\n   ${pending.join(', ')}`);
    console.log('   Sau khi upload ảnh, patch: db.wt1exercises.updateOne(');
    console.log('     { code: "<mã bài>" },');
    console.log('     { $set: { "stimulus.imageUrl": "...", needsAsset: false, published: true } })');
  }
  console.log('\n  Tổng kết theo type:', JSON.stringify(exercises.reduce((a, e) => ((a[e.type] = (a[e.type] || 0) + 1), a), {})));
}

async function main() {
  const dry = process.argv.includes('--dry');
  const data = load();

  console.log(`[${COURSE.tag}] ${dry ? 'DRY RUN — không ghi gì' : 'seeding'}\n`);
  console.log(`  ${data.modules.length} module · ${data.lessons.length} lesson · ${data.exercises.length} exercise`);
  const errors = validate(data.exercises, data.lessonCodes);
  if (errors.length) {
    console.error('\n❌ Dữ liệu seed có lỗi:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }
  console.log('\n✅ Validate xong: dữ liệu hợp lệ');
  tally(data.exercises);

  if (dry) process.exit(0);
  if (/media:[A-Za-z0-9_.-]+\.(?:jpg|png|webp)/.test(JSON.stringify(data))) {
    console.error('\n❌ Còn ảnh "media:" chưa upload — chạy scripts/seedMindsetMedia.js trước.');
    process.exit(1);
  }

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
