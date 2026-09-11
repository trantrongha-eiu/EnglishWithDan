'use strict';

/**
 * One-off content/data fix for "Aims of the geography lesson"
 * (ListeningSection 6a43fbfbe56e021a6ea6b49f) — two pre-existing bugs
 * found while writing explanations (chat log 2026-09-11), not introduced
 * by this fix:
 *
 *  1. The "Questions 25-30" flow-chart group's last three items were
 *     numbered 29/30/31 instead of 28/29/30 (an off-by-one slip) — this
 *     both fabricated a nonexistent "Q31" outside the section's declared
 *     questionRange (21-30) and left "Q28" completely missing.
 *  2. Q23's stored correctAnswer was "D" ("the teacher coordination"), but
 *     the transcript has Dean say "Neither of us was too dominant, and we
 *     supported each other" (coordination worked FINE) and separately
 *     identifies "organizing the children in sets of six didn't work very
 *     well" as an actual problem — i.e. student grouping, "B". "D" cannot
 *     be reconciled with the transcript; "B" can, cleanly. Corrected to B.
 *
 * Run: node backend/scripts/fixGeographyLessonSection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');

const SECTION_ID = '6a43fbfbe56e021a6ea6b49f';

async function run() {
  const section = await ListeningSection.findById(SECTION_ID);
  if (!section) throw new Error(`Section ${SECTION_ID} not found`);
  if (section.title !== 'Aims of the geography lesson') {
    throw new Error(`Refusing to run: expected title "Aims of the geography lesson", found "${section.title}"`);
  }

  let renumbered = 0, answerFixed = false;
  for (const g of section.questionGroups) {
    for (const q of g.questions) {
      if (q.questionNumber === 29) { q.questionNumber = 28; renumbered++; }
      else if (q.questionNumber === 30) { q.questionNumber = 29; renumbered++; }
      else if (q.questionNumber === 31) { q.questionNumber = 30; renumbered++; }
      else if (q.questionNumber === 23) {
        if (q.correctAnswer !== 'B') { q.correctAnswer = 'B'; answerFixed = true; }
      }
    }
  }
  if (renumbered !== 3) throw new Error(`Expected to renumber exactly 3 questions, renumbered ${renumbered} — aborting, check the document by hand.`);

  section.markModified('questionGroups');
  await section.save();
  console.log(`[fix] renumbered ${renumbered} questions (29->28, 30->29, 31->30); Q23 correctAnswer fixed: ${answerFixed}`);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await run();
  } finally {
    await mongoose.disconnect();
  }
})().catch(e => { console.error('[fix] FAILED', e); process.exit(1); });
