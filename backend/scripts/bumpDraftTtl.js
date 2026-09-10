// One-time migration: widen the TTL on the Task 2 / "Viết câu nâng cao"
// practice-draft collections from 7 days to 30 days (matches WritingDraft).
//
// Mongoose does NOT alter an existing index's options — recreating a TTL
// index with a different expireAfterSeconds throws IndexOptionsConflict and
// the old value silently stays in force. `collMod` is the only in-place way
// to change it without dropping data. Safe to re-run (idempotent).
//
// Run once against prod after deploying the model change:
//   node scripts/bumpDraftTtl.js
'use strict';

const NEW_TTL_SECONDS = 30 * 24 * 60 * 60;

// collectionName -> the TTL index's field. Index name is `<field>_1`.
const TARGETS = [
  { collection: 'task2drafts', field: 'savedAt' },
  { collection: 'advsentencedrafts', field: 'savedAt' },
];

async function runMigration() {
  const mongoose = require('mongoose');
  const db = mongoose.connection.db;

  for (const { collection, field } of TARGETS) {
    const indexName = `${field}_1`;
    const exists = (await db.listCollections({ name: collection }).toArray()).length > 0;
    if (!exists) {
      console.log(`[bumpDraftTtl] ${collection}: collection not found — skip`);
      continue;
    }
    const indexes = await db.collection(collection).indexes();
    const idx = indexes.find((i) => i.name === indexName);
    if (!idx) {
      console.log(`[bumpDraftTtl] ${collection}: no ${indexName} index yet — model init will create it at 30d`);
      continue;
    }
    if (idx.expireAfterSeconds === NEW_TTL_SECONDS) {
      console.log(`[bumpDraftTtl] ${collection}: already ${NEW_TTL_SECONDS}s — nothing to do`);
      continue;
    }
    await db.command({
      collMod: collection,
      index: { name: indexName, expireAfterSeconds: NEW_TTL_SECONDS },
    });
    console.log(`[bumpDraftTtl] ${collection}: ${idx.expireAfterSeconds}s -> ${NEW_TTL_SECONDS}s ✓`);
  }
}

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runMigration();
    } finally {
      await mongoose.disconnect();
    }
  })().catch((e) => { console.error('[bumpDraftTtl] FAILED', e); process.exit(1); });
}

module.exports = { runMigration };
