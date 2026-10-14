/**
 * applyTask2BrainstormEn.js — switch existing Task2Topic.brainstormHints to
 * the English ideas in scripts/data/task2BrainstormEn.js (new seeds get them
 * from augmentTopics() already). Touches brainstormHints only.
 *
 *   node backend/scripts/applyTask2BrainstormEn.js           # dry run
 *   node backend/scripts/applyTask2BrainstormEn.js --apply   # write
 *
 * Idempotent; to go back, revert the data file and re-run.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Task2Topic = require('../models/Task2Topic');
const { AUG, brainstormHintsFor } = require('./data/task2Augment');

const APPLY = process.argv.includes('--apply');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const docs = await Task2Topic.find({}).select('_id topicName essayType brainstormHints isActive').lean();

  let changed = 0, unchanged = 0;
  const noData = [];
  for (const d of docs) {
    if (!AUG[d.topicName]) {
      if ((d.brainstormHints || []).length) noData.push(d.topicName);
      continue;
    }
    const next = brainstormHintsFor(d.topicName, d.essayType);
    const cur = (d.brainstormHints || []).map((h) => ({ side: h.side, points: h.points }));
    if (same(cur, next)) { unchanged++; continue; }
    changed++;
    console.log(`${APPLY ? 'UPDATE' : 'would update'}  ${d.topicName}${d.isActive ? '' : ' (inactive)'}  → ${next[0].side} / ${next[1].side}`);
    if (APPLY) await Task2Topic.updateOne({ _id: d._id }, { $set: { brainstormHints: next } });
  }

  console.log(`\n${docs.length} topics · ${changed} ${APPLY ? 'updated' : 'to update'} · ${unchanged} already English`);
  if (noData.length) console.log(`(!) brainstormHints but no English data: ${noData.join(', ')}`);
  if (!APPLY && changed) console.log('Dry run — re-run with --apply to write.');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
