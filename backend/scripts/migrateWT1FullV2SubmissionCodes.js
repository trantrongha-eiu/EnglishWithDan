// scripts/migrateWT1FullV2SubmissionCodes.js
// Debug pass on the "full-v2" restructure (see cleanupWT1OrphanedLessons.js
// for the content-side leftovers): the remap didn't just move CONTENT to
// new codes, it also silently stranded any WT1Submission/WT1Progress rows
// already recorded against a code that got REPURPOSED for different
// content — e.g. old T1-L12 ("Từ vựng chỉ phương hướng", Maps) moved to
// T1-L13, but code T1-L12 itself now means "Biểu đồ kết hợp" (Mixed Chart
// Type, unrelated content). A submission still filed under the OLD code
// would join (via getAttemptDetail) against the NEW, unrelated exercise —
// a genuinely confusing "review" screen for whoever submitted it.
//
// Found by checking every live WT1Submission/WT1Progress against the
// lesson-code mapping table used to build the new course (only ONE row
// was affected, on the one account that exercised the course while it was
// being built) — MOVES below is that same table, restated explicitly so
// this script is self-contained and safe to re-run (idempotent: a
// doc already at its new code is simply not matched a second time).
//
//   node scripts/migrateWT1FullV2SubmissionCodes.js --dry
//   node scripts/migrateWT1FullV2SubmissionCodes.js
'use strict';

// old exerciseCode -> where that content actually lives now. Only a code
// with a real historical WT1Submission needs an entry here — checked
// against the live DB (WT1Submission.find({}), 6 rows total when this
// script was written) rather than enumerated theoretically, since a
// "moved" code only matters if something was actually submitted under it.
const EXERCISE_MOVES = {
  'T1-L12-E02': { exerciseCode: 'T1-L13-E02', lessonCode: 'T1-L13' },
};

async function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[migrateWT1FullV2SubmissionCodes] ${dry ? 'DRY RUN' : 'LIVE'}`);

  require('dotenv').config();
  const mongoose = require('mongoose');
  const WT1Submission = require('../models/WT1Submission');
  const WT1Progress = require('../models/WT1Progress');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Đã kết nối MongoDB\n');

  for (const [oldCode, dest] of Object.entries(EXERCISE_MOVES)) {
    const subs = await WT1Submission.find({ exerciseCode: oldCode }).lean();
    console.log(`${oldCode} -> ${dest.exerciseCode}: ${subs.length} submission(s)`);
    if (!subs.length) continue; // already migrated, or never had any — nothing to do
    if (dry) continue;

    const oldLessonCode = subs[0].lessonCode;
    await WT1Submission.updateMany(
      { exerciseCode: oldCode },
      { $set: { exerciseCode: dest.exerciseCode, lessonCode: dest.lessonCode } }
    );

    // Rebuild progress at the new lesson code per affected user, dropping
    // the now-stale doc at the old code (recomputing from scratch is
    // simplest and matches what wt1Service._recompute would produce for a
    // lesson whose only completed exercise is this one submission).
    const userIds = [...new Set(subs.map((s) => String(s.userId)))];
    for (const userId of userIds) {
      await WT1Progress.deleteOne({ userId, lessonCode: oldLessonCode });
      const userSubs = await WT1Submission.find({ userId, exerciseCode: dest.exerciseCode }).lean();
      const best = userSubs.reduce((m, s) => (s.score > (m ? m.score : -1) ? s : m), null);
      await WT1Progress.findOneAndUpdate(
        { userId, lessonCode: dest.lessonCode },
        {
          $set: {
            courseCode: 'IELTS-W-T1',
            completedExercises: [dest.exerciseCode],
            objectiveScorePercent: best ? best.score : 0,
            writingSubmissions: 0,
            unlocked: false,
            completedAt: null,
          },
        },
        { upsert: true }
      );
      console.log(`  ✓ user ${userId}: progress moved to ${dest.lessonCode}`);
    }
  }

  await mongoose.disconnect();
  console.log('\nXong.');
}

main().catch((e) => { console.error(e); process.exit(1); });
