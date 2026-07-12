'use strict';
/**
 * Migrates the WritingDraft unique index from `{userId: 1}` (one draft
 * slot per student, globally) to `{userId: 1, taskType: 1, taskId: 1}` (up
 * to one draft per task, capped at 2 per {userId, taskType} in
 * writingService.saveDraft) — without this, MongoDB still enforces the old
 * one-draft-per-user constraint regardless of the updated model/service
 * code, since Mongoose's default autoIndex creates new indexes on connect
 * but never drops obsolete ones.
 *
 * Safe to run multiple times (syncIndexes is idempotent). Run once after
 * deploying the updated WritingDraft model:
 *   node backend/scripts/fixWritingDraftIndex.js
 */

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('Connected to MongoDB');
      await run();
      console.log('Done.');
      await mongoose.disconnect();
    })
    .catch(err => { console.error(err); process.exit(1); });
}

async function run() {
  const WritingDraft = require('../models/WritingDraft');
  const before = await WritingDraft.collection.indexes();
  console.log('Indexes before:', before.map(i => i.name));
  await WritingDraft.syncIndexes();
  const after = await WritingDraft.collection.indexes();
  console.log('Indexes after:', after.map(i => i.name));
}

module.exports = { run };
