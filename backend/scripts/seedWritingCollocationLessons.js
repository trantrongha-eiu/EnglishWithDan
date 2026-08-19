/**
 * One-off import for the Writing Task 1/2 collocation vocabulary lessons
 * (post-incident recovery request, 2026-08-19) — drafted from
 * https://zim.vn/bo-tu-vung-ielts-writing-task-1 (Task 1, by chart type)
 * and https://ielts-nguyenhuyen.com/tu-vung-ielts-theo-chu-de/ (Task 2, by
 * essay topic), reworked into proper multi-word collocations with
 * meaning/example/definition/collocations/distractors for each entry.
 *
 * Reads each source .txt (one or more `@lesson` blocks in "EnglishWithDan
 * Lesson Format"), splits on `@lesson`, validates each block with the same
 * parser the admin UI uses, and imports via vocabularyLessonService so
 * every existing invariant (MAX_LESSONS cap, duplicate-word check, import
 * logging) is respected exactly as if pasted through the admin panel.
 * Publishes each created lesson immediately (students only see published
 * lessons).
 *
 * Run: node backend/scripts/seedWritingCollocationLessons.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const ADMIN_USER_ID = '697f122cba33544fa9772c89'; // tranhadeeptry@gmail.com, role: admin

const DATA_DIR = path.join(__dirname, 'data', 'writing-collocations');
const SOURCE_FILES = [
  'writing_collocations_env_edu.txt',
  'writing_collocations_health_crime.txt',
  'writing_collocations_gov_transport.txt',
  'writing_collocations_work_tech.txt',
  'writing_collocations_bar_line_pie.txt',
  'writing_collocations_process_map_table_connectors.txt',
].map(f => path.join(DATA_DIR, f));

// Splits a file containing multiple `@lesson ... @word ... @word ...` blocks
// back apart into one raw-text chunk per lesson (the parser only accepts
// exactly one `@lesson` block per import call).
function splitIntoLessonBlocks(raw) {
  const lines = raw.split(/\r?\n/);
  const blocks = [];
  let current = null;
  for (const line of lines) {
    if (line.trim() === '@lesson') {
      if (current) blocks.push(current.join('\n').trim() + '\n');
      current = [line];
    } else if (current) {
      current.push(line);
    }
  }
  if (current) blocks.push(current.join('\n').trim() + '\n');
  return blocks;
}

async function run() {
  const { parseLessonText } = require('../services/vocabularyLessonParser');
  const vocabularyLessonService = require('../services/vocabularyLessonService');
  const User = require('../models/User');

  await mongoose.connect(process.env.MONGO_URI);

  const admin = await User.findById(ADMIN_USER_ID).select('_id role').lean();
  if (!admin) throw new Error(`Admin user ${ADMIN_USER_ID} not found — aborting.`);

  const VocabularyLesson = require('../models/VocabularyLesson');

  let imported = 0, skipped = 0, failed = 0, totalWords = 0;
  const results = [];

  for (const filePath of SOURCE_FILES) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const blocks = splitIntoLessonBlocks(raw);
    console.log(`\n[${path.basename(filePath)}] ${blocks.length} lesson block(s) found`);

    for (const block of blocks) {
      const parsed = parseLessonText(block);
      if (!parsed.valid) {
        failed++;
        console.error(`  FAILED to parse "${parsed.title || '(untitled)'}":`, parsed.errors);
        continue;
      }
      // Safe to re-run: skip a lesson that's already been imported by title
      // (importLesson has no dedupe of its own, unlike the seed*Analysis*
      // scripts' upsert:false-by-prompt matching).
      const existing = await VocabularyLesson.findOne({ title: parsed.lesson.title }).select('_id').lean();
      if (existing) {
        skipped++;
        console.log(`  SKIP (already exists): "${parsed.lesson.title}"`);
        continue;
      }
      try {
        const lesson = await vocabularyLessonService.importLesson(ADMIN_USER_ID, block);
        await vocabularyLessonService.setPublished(lesson._id, true);
        imported++;
        totalWords += lesson.words.length;
        results.push({ title: lesson.title, words: lesson.words.length, id: lesson._id.toString() });
        console.log(`  OK: "${lesson.title}" — ${lesson.words.length} words, published`);
      } catch (err) {
        failed++;
        console.error(`  FAILED to import "${parsed.lesson?.title}":`, err.message);
      }
    }
  }

  console.log(`\n=== SUMMARY === imported ${imported} lessons, ${totalWords} total words, ${skipped} skipped (already existed), ${failed} failed`);
  console.log(JSON.stringify(results, null, 2));

  await mongoose.disconnect();
}

if (require.main === module) {
  run().catch(err => { console.error('[seedWritingCollocationLessons] Failed:', err); process.exit(1); });
}
