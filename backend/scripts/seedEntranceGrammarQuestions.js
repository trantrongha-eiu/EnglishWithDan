/**
 * Seed script for EntranceGrammarQuestion — the 25-question Grammar section
 * of the IELTS Entrance Test ("Test đầu vào"). Content lives in
 * scripts/data/entranceGrammar.json (kept out of code per the feature spec
 * — easy for a teacher/dev to revise without touching entranceTestService.js).
 *
 * Run from backend/:
 *   node scripts/seedEntranceGrammarQuestions.js          # upsert into the DB
 *   node scripts/seedEntranceGrammarQuestions.js --dry     # print a summary, touch nothing
 *   node scripts/seedEntranceGrammarQuestions.js --setKey=default   # (default) target set
 *
 * Upsert key: (setKey, order) — reruns overwrite the matching question, so
 * once teachers start editing questions via the admin panel, prefer editing
 * there over re-running this script.
 */
'use strict';

const questions = require('./data/entranceGrammar.json');

const TYPE_COUNTS_EXPECTED = { mcq: 10, gap_fill: 5, sentence_transform: 5, vn_to_en: 5 };

function summarise() {
  const counts = {};
  for (const q of questions) counts[q.type] = (counts[q.type] || 0) + 1;
  console.log(`  Tổng: ${questions.length} câu`);
  for (const [type, expected] of Object.entries(TYPE_COUNTS_EXPECTED)) {
    const actual = counts[type] || 0;
    console.log(`  ${type.padEnd(20)} ${actual}${actual !== expected ? `  ⚠ expected ${expected}` : ''}`);
  }
  const badMcq = questions.filter(q => q.type === 'mcq' && (!q.options || !q.options.some(o => o.id === q.answer)));
  const badAccept = questions.filter(q => q.type !== 'mcq' && (!q.accept || q.accept.filter(Boolean).length < 1));
  if (badMcq.length) console.warn(`  ⚠ ${badMcq.length} MCQ question(s) with no matching answer option`);
  if (badAccept.length) console.warn(`  ⚠ ${badAccept.length} question(s) with no accepted-answer array`);
  return questions.length;
}

async function runSeed(setKey) {
  const EntranceGrammarQuestion = require('../models/EntranceGrammarQuestion');
  const ops = questions.map((q, i) => ({
    updateOne: {
      filter: { setKey, order: q.order != null ? q.order : i + 1 },
      update: { $set: { ...q, setKey, order: q.order != null ? q.order : i + 1, isActive: true } },
      upsert: true,
    },
  }));
  const result = await EntranceGrammarQuestion.bulkWrite(ops);
  console.log(`[EntranceGrammarSeed] upserted ${result.upsertedCount}, modified ${result.modifiedCount} questions (setKey="${setKey}")`);
}

if (require.main === module) {
  const dry = process.argv.includes('--dry');
  const setKeyArg = process.argv.find(a => a.startsWith('--setKey='));
  const setKey = setKeyArg ? setKeyArg.split('=')[1] : 'default';

  console.log(`[EntranceGrammarSeed] ${dry ? 'DRY RUN — nothing will be written' : 'seeding'} (setKey="${setKey}"):\n`);
  const total = summarise();
  if (total !== 25) console.warn(`\n[EntranceGrammarSeed] ⚠ expected 25 questions, found ${total}`);

  if (dry) { process.exit(0); }

  require('dotenv').config();
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(() => runSeed(setKey))
    .then(() => mongoose.disconnect())
    .then(() => console.log('[EntranceGrammarSeed] Done'))
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { runSeed, questions };
