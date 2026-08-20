"use strict";

// Seeds the Writing Tips strategy articles shown on the Writing page.
// Same upsert-by-{category,lessonKey} pattern as seedReadingTips.js.
const general = require("./writingTipsData/general");
const byType = require("./writingTipsData/byType");
const byBand = require("./writingTipsData/byBand");
const realWorldExamples = require("./writingTipsData/realWorldExamples");
const task1Types = require("./writingTipsData/task1Types");

const lessons = [
  ...general,
  ...byType,
  ...byBand,
  ...realWorldExamples,
  ...task1Types,
];

async function runSeed() {
  const WritingTip = require("../models/WritingTip");

  const ops = lessons.map(l => ({
    replaceOne: { filter: { category: l.category, lessonKey: l.lessonKey }, replacement: l, upsert: true }
  }));

  const result = await WritingTip.bulkWrite(ops);
  console.log(`[WritingTipsSeed] upserted ${result.upsertedCount}, modified ${result.modifiedCount} lessons (${lessons.length} total)`);
}

// Allow direct execution: node backend/scripts/seedWritingTips.js
if (require.main === module) {
  require("dotenv").config();
  const mongoose = require("mongoose");
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      await runSeed();
      await mongoose.disconnect();
      console.log("[WritingTipsSeed] Done");
    })
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { runSeed, lessons };
