/**
 * setWritingTask2EssayTypes.js — set WritingTask2.essayType (the 7 essay
 * groups students filter by on writing.html → Task 2) from
 * scripts/data/writingTask2EssayTypes.js.
 *
 *   node backend/scripts/setWritingTask2EssayTypes.js           # dry run
 *   node backend/scripts/setWritingTask2EssayTypes.js --apply   # write
 *
 * Scoped updateOne by _id; only touches the essayType field. Also lists
 * active prompts that are still missing a type.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const WritingTask2 = require('../models/WritingTask2');
const MAP = require('./data/writingTask2EssayTypes');

const APPLY = process.argv.includes('--apply');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const byId = new Map();
  for (const [type, ids] of Object.entries(MAP)) ids.forEach(id => byId.set(id, type));

  const tasks = await WritingTask2.find({}).select('_id prompt essayType isActive').lean();
  let changed = 0, same = 0;
  for (const t of tasks) {
    const type = byId.get(String(t._id));
    if (!type) continue;
    if (t.essayType === type) { same++; continue; }
    changed++;
    console.log(`${t._id}  ${t.essayType || '-'} → ${type}  ${t.prompt.replace(/\s+/g, ' ').slice(0, 70)}`);
    if (APPLY) await WritingTask2.updateOne({ _id: t._id }, { $set: { essayType: type } });
  }
  const missingIds = [...byId.keys()].filter(id => !tasks.some(t => String(t._id) === id));
  const untyped = tasks.filter(t => t.isActive && !byId.has(String(t._id)) && !t.essayType);

  console.log(`\n${APPLY ? 'Updated' : 'Would update'} ${changed}, already set ${same}.`);
  if (missingIds.length) console.log(`IDs in data file not found in DB: ${missingIds.join(', ')}`);
  if (untyped.length) {
    console.log(`Active prompts with no type (${untyped.length}):`);
    untyped.forEach(t => console.log(`  ${t._id}  ${t.prompt.replace(/\s+/g, ' ').slice(0, 90)}`));
  }
  if (!APPLY) console.log('Dry run — pass --apply to write.');
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
