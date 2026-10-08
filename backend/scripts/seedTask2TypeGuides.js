'use strict';

// Seeds the per-essay-type reference guides for the Task 2 Templates page
// (Task2TypeGuide model) from scripts/data/task2/typeGuides.js.
//
//   node scripts/seedTask2TypeGuides.js --dry   # print the plan
//   node scripts/seedTask2TypeGuides.js         # upsert to the DB
//
// Idempotent: upserts by `typeId` (findOneAndUpdate $set). Content is
// verbatim from PART B of the Task 2 Template Bank docx.
require('dotenv').config();
const mongoose = require('mongoose');
const Task2TypeGuide = require('../models/Task2TypeGuide');
const GUIDES = require('./data/task2/typeGuides');
const { highlightsFromSpec } = require('./data/task2SampleHighlights');

// modelEssay.highlightSpecs (sentence-index specs for intro/body1/body2/conclusion)
// → per-section `highlights`, the shape the frontend renders.
function withHighlights(g) {
  const { highlightSpecs, ...essay } = g.modelEssay;
  const sections = essay.sections.map((s, i) =>
    (highlightSpecs && highlightSpecs[i]) ? { ...s, highlights: highlightsFromSpec(s.text, highlightSpecs[i]) } : s);
  return { ...g, modelEssay: { ...essay, sections } };
}

async function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[seedTask2TypeGuides] ${dry ? 'DRY RUN' : 'LIVE'} — ${GUIDES.length} type guides\n`);
  for (const g of GUIDES) {
    const hl = withHighlights(g).modelEssay.sections.reduce((n, s) => n + (s.highlights || []).length, 0);
    console.log(`  ${g.typeId}  ${g.name}  · ${g.upgradePairs.length} upgrade pairs · ${g.usefulLanguage.length} ngôn ngữ · ${g.modelEssay.sections.length} đoạn mẫu (${hl} câu tô màu) · ${g.mistakes.length} lỗi`);
  }
  if (dry) { console.log('\n(dry)'); process.exit(0); }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('\nĐã kết nối MongoDB\n');

  let n = 0;
  for (const g of GUIDES) {
    await Task2TypeGuide.findOneAndUpdate(
      { typeId: g.typeId },
      { $set: { ...withHighlights(g), isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    n += 1;
    console.log(`  ✓ ${g.typeId}`);
  }
  console.log(`\nĐã upsert ${n}/${GUIDES.length} type guides.`);
  await mongoose.disconnect();
  console.log('Xong.');
}

main().catch((e) => { console.error(e); process.exit(1); });
