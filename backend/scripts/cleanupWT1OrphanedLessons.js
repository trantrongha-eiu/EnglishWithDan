// scripts/cleanupWT1OrphanedLessons.js
// The "full-v2" curriculum restructure (2026-09-05) merged/renumbered
// lessons, which left two kinds of stale leftovers behind — re-seeding only
// upserts by code, it never deletes, so neither kind cleans itself up:
//
// 1. Lessons that no longer exist at all: T1-L23 + T1-L24 (Natural Process
//    vocab/life-cycle/exam-practice) were merged INTO T1-L22 — their
//    content was copied there, not deleted, so the old lesson docs (and
//    their exercises) are now unreachable from the module tree.
//
// 2. Excess exercises at a REPURPOSED code (the more dangerous kind — these
//    are still `published:true` and their `lessonCode` still matches an
//    ACTIVE lesson, so they leak into that lesson's exercise list instead
//    of just sitting inert): whenever a lesson code's NEW content has FEWER
//    exercises than whatever previously lived at that code, the excess old
//    exercise docs (index > new count) are never overwritten by the
//    upsert. E.g. new T1-L07 ("Kết hợp nhiều xu hướng") has 5 exercises,
//    but old T1-L07 ("So sánh xu hướng") had 8 — T1-L07-E06/07/08 are 3
//    old paragraph_writing exercises about unrelated chart content that
//    would otherwise still show up appended to the new Buổi 7.
//
// Both kinds are soft-unpublished, never hard-deleted — WT1Submission rows
// may still reference them; unpublished just means getOverview/getLesson
// stop surfacing them.
//
//   node scripts/cleanupWT1OrphanedLessons.js --dry
//   node scripts/cleanupWT1OrphanedLessons.js
'use strict';

const ORPHANED_LESSON_CODES = ['T1-L23', 'T1-L24'];
// Found by diffing every T1- exercise code in the DB against every code in
// the new scripts/data/writingTask1/*.json files post-seed — see the
// commit that added this script for the exact diff.
const EXCESS_EXERCISE_CODES = ['T1-L07-E06', 'T1-L07-E07', 'T1-L07-E08', 'T1-L08-E05', 'T1-L13-E04', 'T1-L17-E03'];

async function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[cleanupWT1OrphanedLessons] ${dry ? 'DRY RUN' : 'LIVE'}`);

  require('dotenv').config();
  const mongoose = require('mongoose');
  const WT1Lesson = require('../models/WT1Lesson');
  const WT1Exercise = require('../models/WT1Exercise');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Đã kết nối MongoDB\n');

  const lessons = await WT1Lesson.find({ code: { $in: ORPHANED_LESSON_CODES } }).lean();
  const orphanedLessonExercises = await WT1Exercise.find({ lessonCode: { $in: ORPHANED_LESSON_CODES } }).lean();
  const excessExercises = await WT1Exercise.find({ code: { $in: EXCESS_EXERCISE_CODES } }).lean();
  console.log(`Lessons to unpublish: ${lessons.map((l) => l.code).join(', ') || '(none found)'}`);
  console.log(`Orphaned-lesson exercises to unpublish: ${orphanedLessonExercises.map((e) => e.code).join(', ') || '(none found)'}`);
  console.log(`Excess exercises (stale leftovers at repurposed codes) to unpublish: ${excessExercises.map((e) => e.code).join(', ') || '(none found)'}`);

  if (dry) { await mongoose.disconnect(); process.exit(0); }

  const rl = await WT1Lesson.updateMany({ code: { $in: ORPHANED_LESSON_CODES } }, { $set: { published: false } });
  const re = await WT1Exercise.updateMany({ lessonCode: { $in: ORPHANED_LESSON_CODES } }, { $set: { published: false } });
  const rex = await WT1Exercise.updateMany({ code: { $in: EXCESS_EXERCISE_CODES } }, { $set: { published: false } });
  console.log(`\nUnpublished ${rl.modifiedCount} lesson(s), ${re.modifiedCount} orphaned-lesson exercise(s), ${rex.modifiedCount} excess exercise(s).`);

  await mongoose.disconnect();
  console.log('Xong.');
}

main().catch((e) => { console.error(e); process.exit(1); });
