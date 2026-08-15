// One-time cleanup: writingService.saveDraft() used to save a draft even
// when the student wrote nothing (0 words, empty/whitespace answer) —
// opening a Task 1/2 prompt and leaving without typing was enough to trip
// the "Bạn có bài luyện tập chưa nộp" banner on their next visit. Now fixed
// to skip/delete instead of saving blank content (see saveDraft()), but
// existing ghost drafts already in the DB (TTL: 30 days) would otherwise
// keep showing that false banner until they age out on their own.
//
// Run: node scripts/cleanupEmptyWritingDrafts.js
'use strict';

async function runCleanup() {
  const WritingDraft = require('../models/WritingDraft');
  const filter = {
    wordCount: { $lte: 0 },
    $or: [{ answer: { $exists: false } }, { answer: '' }, { answer: /^\s*$/ }],
  };
  const count = await WritingDraft.countDocuments(filter);
  const result = await WritingDraft.deleteMany(filter);
  console.log(`[CleanupEmptyWritingDrafts] found ${count}, deleted ${result.deletedCount}`);
}

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runCleanup();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[CleanupEmptyWritingDrafts] FAILED', e); process.exit(1); });
}

module.exports = { runCleanup };
