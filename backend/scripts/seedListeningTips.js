"use strict";

// Seeds the Listening Tips strategy articles shown on the Listening page.
// Same upsert-by-{category,lessonKey} pattern as seedReadingTips.js.
const byQuestionType = require("./listeningTipsData/byQuestionType");
const byBand = require("./listeningTipsData/byBand");

const lessons = [
  ...byQuestionType,
  ...byBand,
];

async function runSeed() {
  const ListeningTip = require("../models/ListeningTip");

  const ops = lessons.map(l => ({
    replaceOne: { filter: { category: l.category, lessonKey: l.lessonKey }, replacement: l, upsert: true }
  }));

  const result = await ListeningTip.bulkWrite(ops);
  console.log(`[ListeningTipsSeed] upserted ${result.upsertedCount}, modified ${result.modifiedCount} lessons (${lessons.length} total)`);
}

// Allow direct execution: node backend/scripts/seedListeningTips.js
if (require.main === module) {
  require("dotenv").config();
  const mongoose = require("mongoose");
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      await runSeed();
      await mongoose.disconnect();
      console.log("[ListeningTipsSeed] Done");
    })
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { runSeed, lessons };
