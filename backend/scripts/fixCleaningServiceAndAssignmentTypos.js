'use strict';

/**
 * Two small one-off data fixes found while writing explanations (chat log
 * 2026-09-11), both low-risk single-field corrections:
 *
 *  1. "Customer Inquiring About A Cleaning Service"
 *     (6a50acb0c7a497a299b38a3b): Q10's questionText was a copy-paste
 *     duplicate of Q7 ("general films") even though the matching group is
 *     "Questions 7-10" (4 distinct items expected). Per the transcript's
 *     actual 4th category discussed (comedy TV programmes — "I'm inclined
 *     to leave it alone"), Q10 should read "comedy TV programmes", not
 *     "general films" again. Its correctAnswer ("C" = prices kept at
 *     current level) was already right either way — only the label was
 *     wrong.
 *
 *  2. "Assignment Notes & Presentation Guidance"
 *     (6a5129c52bf801f4090e8111): Q23's stored correctAnswer was the typo
 *     "at net siminar" instead of "at next seminar" (matches the
 *     transcript: "you agreed to do it at the next seminar").
 *
 * Run: node backend/scripts/fixCleaningServiceAndAssignmentTypos.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');

async function fixCleaningService() {
  const id = '6a50acb0c7a497a299b38a3b';
  const section = await ListeningSection.findById(id);
  if (!section) throw new Error(`Section ${id} not found`);
  if (section.title !== 'Customer Inquiring About A Cleaning Service') {
    throw new Error(`Refusing to run: unexpected title "${section.title}" for ${id}`);
  }
  let fixed = 0;
  for (const g of section.questionGroups) {
    for (const q of g.questions) {
      if (q.questionNumber === 10 && q.questionText === 'general films') {
        q.questionText = 'comedy TV programmes';
        fixed++;
      }
    }
  }
  if (fixed === 0) { console.log('[fix] cleaning-service Q10 already corrected — nothing to do.'); return; }
  section.markModified('questionGroups');
  await section.save();
  console.log('[fix] cleaning-service Q10 questionText corrected.');
}

async function fixAssignmentTypo() {
  const id = '6a5129c52bf801f4090e8111';
  const section = await ListeningSection.findById(id);
  if (!section) throw new Error(`Section ${id} not found`);
  if (section.title !== 'Assignment Notes & Presentation Guidance') {
    throw new Error(`Refusing to run: unexpected title "${section.title}" for ${id}`);
  }
  let fixed = 0;
  for (const g of section.questionGroups) {
    for (const q of g.questions) {
      if (q.questionNumber === 23 && q.correctAnswer === 'at net siminar') {
        q.correctAnswer = 'at next seminar';
        fixed++;
      }
    }
  }
  if (fixed === 0) { console.log('[fix] assignment Q23 already corrected — nothing to do.'); return; }
  section.markModified('questionGroups');
  await section.save();
  console.log('[fix] assignment Q23 correctAnswer typo fixed.');
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await fixCleaningService();
    await fixAssignmentTypo();
  } finally {
    await mongoose.disconnect();
  }
})().catch(e => { console.error('[fix] FAILED', e); process.exit(1); });
