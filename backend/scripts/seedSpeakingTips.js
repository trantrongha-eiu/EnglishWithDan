"use strict";

// Seeds the Speaking Tips strategy articles shown on the Speaking page.
// Same upsert-by-{category,lessonKey} pattern as seedReadingTips.js.
const overview = require("./speakingTipsData/overview");
const part1 = require("./speakingTipsData/part1");
const part2 = require("./speakingTipsData/part2");
const part3 = require("./speakingTipsData/part3");
const language = require("./speakingTipsData/language");
const examStrategy = require("./speakingTipsData/examStrategy");
const reviewPlan = require("./speakingTipsData/reviewPlan");

const lessons = [
  ...overview,
  ...part1,
  ...part2,
  ...part3,
  ...language,
  ...examStrategy,
  ...reviewPlan,
];

async function runSeed() {
  const SpeakingTip = require("../models/SpeakingTip");

  const ops = lessons.map(l => ({
    replaceOne: { filter: { category: l.category, lessonKey: l.lessonKey }, replacement: l, upsert: true }
  }));

  const result = await SpeakingTip.bulkWrite(ops);
  console.log(`[SpeakingTipsSeed] upserted ${result.upsertedCount}, modified ${result.modifiedCount} lessons (${lessons.length} total)`);
}

// Allow direct execution: node backend/scripts/seedSpeakingTips.js
if (require.main === module) {
  require("dotenv").config();
  const mongoose = require("mongoose");
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      await runSeed();
      await mongoose.disconnect();
      console.log("[SpeakingTipsSeed] Done");
    })
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { runSeed, lessons };
