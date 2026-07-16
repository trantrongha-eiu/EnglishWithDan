"use strict";

// Seeds the Essential Grammar handbook (~37 lessons across 7 categories).
// Each lesson stores structured JSON blocks (not HTML/Markdown) so the
// frontend can render/reorder/reuse the content freely. Content lives in
// ./essentialGrammarData/*.js, split by category to keep files manageable.
const tenses = require("./essentialGrammarData/tenses");
const conditionals = require("./essentialGrammarData/conditionals");
const linkingSequencing = require("./essentialGrammarData/linkingSequencing");
const directions = require("./essentialGrammarData/directions");
const grammarEssentials = require("./essentialGrammarData/grammarEssentials");

const lessons = [
  ...tenses,
  ...conditionals,
  ...linkingSequencing,
  ...directions,
  ...grammarEssentials
];

async function runSeed() {
  const EssentialGrammarLesson = require("../models/EssentialGrammarLesson");

  // Unique key: {category, lessonKey} — matches the model's compound index
  const ops = lessons.map(l => ({
    replaceOne: { filter: { category: l.category, lessonKey: l.lessonKey }, replacement: l, upsert: true }
  }));

  const result = await EssentialGrammarLesson.bulkWrite(ops);
  console.log(`[EssentialGrammarSeed] upserted ${result.upsertedCount}, modified ${result.modifiedCount} lessons (${lessons.length} total)`);
}

// Allow direct execution: node backend/scripts/seedEssentialGrammar.js
if (require.main === module) {
  require("dotenv").config();
  const mongoose = require("mongoose");
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      await runSeed();
      await mongoose.disconnect();
      console.log("[EssentialGrammarSeed] Done");
    })
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { runSeed, lessons };
