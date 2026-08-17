"use strict";

// Seeds the Reading Tips strategy articles shown on the Reading page.
// Same upsert-by-{category,lessonKey} pattern as seedEssentialGrammar.js.
const byQuestionType = require("./readingTipsData/byQuestionType");
const byBand = require("./readingTipsData/byBand");

const lessons = [
  ...byQuestionType,
  ...byBand,
];

async function runSeed() {
  const ReadingTip = require("../models/ReadingTip");

  const ops = lessons.map(l => ({
    replaceOne: { filter: { category: l.category, lessonKey: l.lessonKey }, replacement: l, upsert: true }
  }));

  const result = await ReadingTip.bulkWrite(ops);
  console.log(`[ReadingTipsSeed] upserted ${result.upsertedCount}, modified ${result.modifiedCount} lessons (${lessons.length} total)`);
}

// Allow direct execution: node backend/scripts/seedReadingTips.js
if (require.main === module) {
  require("dotenv").config();
  const mongoose = require("mongoose");
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      await runSeed();
      await mongoose.disconnect();
      console.log("[ReadingTipsSeed] Done");
    })
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { runSeed, lessons };
