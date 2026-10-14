/**
 * fillWritingTask2Vocab.js — give standalone Writing Task 2 prompts a
 * "Từ vựng chủ đề" list (WritingTask2.vocabularyList, shown under "Phân
 * tích đề" on writing.html). Sources: scripts/data/writingTask2Vocab.js —
 * FROM_TOPIC copies a course Task2Topic's list, LISTS are hand-written.
 *
 * Prompts identical to a course topic are skipped on purpose: they borrow
 * that topic's list live (writingService.attachTask2Vocab), so edits to the
 * topic show up without re-running this.
 *
 *   node backend/scripts/fillWritingTask2Vocab.js           # dry run
 *   node backend/scripts/fillWritingTask2Vocab.js --apply   # write
 *
 * Only fills tasks whose vocabularyList is empty — never overwrites.
 * Scoped updateOne by _id.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const WritingTask2 = require('../models/WritingTask2');
const Task2Topic = require('../models/Task2Topic');
const { FROM_TOPIC, LISTS, toVocab } = require('./data/writingTask2Vocab');

const APPLY = process.argv.includes('--apply');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const ids = [...new Set([...Object.keys(FROM_TOPIC), ...Object.keys(LISTS)])];
  const tasks = await WritingTask2.find({ _id: { $in: ids } }).select('_id prompt vocabularyList').lean();
  const topics = await Task2Topic.find({ topicName: { $in: [...new Set(Object.values(FROM_TOPIC))] } })
    .select('topicName vocabularyList').lean();
  const topicVocab = new Map(topics.map(t => [t.topicName, t.vocabularyList || []]));

  let filled = 0, skipped = 0;
  for (const id of ids) {
    const task = tasks.find(t => String(t._id) === id);
    if (!task) { console.warn(`!! ${id}: no such WritingTask2`); continue; }
    if ((task.vocabularyList || []).length) { skipped++; continue; }
    const list = LISTS[id]
      ? toVocab(LISTS[id])
      : (topicVocab.get(FROM_TOPIC[id]) || []).map(({ term, definitionVi, example }) => ({ term, definitionVi, example }));
    if (!list.length) { console.warn(`!! ${id}: topic "${FROM_TOPIC[id]}" has no vocab`); continue; }
    console.log(`${APPLY ? 'fill' : 'would fill'} ${id} (${list.length} terms${FROM_TOPIC[id] ? ` from "${FROM_TOPIC[id]}"` : ''}) — ${task.prompt.slice(0, 70)}…`);
    if (APPLY) await WritingTask2.updateOne({ _id: task._id }, { $set: { vocabularyList: list } });
    filled++;
  }
  console.log(`\n${APPLY ? 'Filled' : 'Would fill'} ${filled}, already had vocab ${skipped}.${APPLY ? '' : ' (dry run — add --apply)'}`);
  await mongoose.disconnect();
})().catch(err => { console.error(err); process.exit(1); });
