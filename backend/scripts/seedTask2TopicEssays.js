/**
 * seedTask2TopicEssays.js — make sure every weekly Task 2 topic
 * (Task2Topic) has a matching full-essay task in the Writing Task 2 bank
 * (WritingTask2), and link them via Task2Topic.writingTask2Id.
 *
 * This is what the weekly practice screen's "Viết bài ngay" button needs:
 * it opens writing.html?taskType=2&taskId=<writingTask2Id> to reuse the
 * existing Task 2 essay practice flow (AI grading / drafts / history).
 *
 *   node backend/scripts/seedTask2TopicEssays.js           # dry run
 *   node backend/scripts/seedTask2TopicEssays.js --apply   # write
 *
 * For each active topic with no writingTask2Id:
 *   - reuse an existing WritingTask2 whose prompt matches (normalised), or
 *   - create a new WritingTask2 { prompt, default instructions, isActive }.
 * Then set topic.writingTask2Id (scoped updateOne, one _id at a time).
 * Never overwrites an already-set writingTask2Id.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Task2Topic = require('../models/Task2Topic');
const WritingTask2 = require('../models/WritingTask2');

const APPLY = process.argv.includes('--apply');
const DEFAULT_INSTRUCTIONS =
  'You should spend about 40 minutes on this task. Write at least 250 words.';

// Loose match: ignore case, collapse whitespace, drop trailing punctuation —
// enough to catch "same question, minor formatting difference".
function norm(s) {
  return (s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[."'’,\s]+$/g, '')
    .trim();
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const topics = await Task2Topic.find({ isActive: true })
    .select('_id week topicName prompt writingTask2Id')
    .sort({ week: 1, orderIndex: 1 })
    .lean();

  const tasks = await WritingTask2.find({}).select('_id prompt isActive').lean();
  const byPrompt = new Map();
  for (const t of tasks) {
    const k = norm(t.prompt);
    if (k && !byPrompt.has(k)) byPrompt.set(k, t);
  }

  let alreadyLinked = 0, linkedExisting = 0, created = 0;
  for (const topic of topics) {
    if (topic.writingTask2Id) { alreadyLinked++; continue; }

    const key = norm(topic.prompt);
    let match = byPrompt.get(key);
    let action;

    if (match) {
      action = `link existing WritingTask2 ${match._id}`;
      linkedExisting++;
    } else {
      action = 'CREATE new WritingTask2';
      created++;
    }
    console.log(`${APPLY ? 'WRITE' : 'PLAN '}  W${topic.week} · ${topic.topicName}`);
    console.log(`         ${action}`);
    console.log(`         "${(topic.prompt || '').slice(0, 90)}${topic.prompt.length > 90 ? '…' : ''}"`);

    if (!APPLY) continue;

    if (!match) {
      match = await WritingTask2.create({
        prompt: topic.prompt,
        instructions: DEFAULT_INSTRUCTIONS,
        isActive: true,
      });
      byPrompt.set(key, match); // a later topic with the same prompt reuses it
    }
    await Task2Topic.updateOne({ _id: topic._id }, { $set: { writingTask2Id: match._id } });
  }

  console.log(`\n${APPLY ? 'Applied' : 'Dry run'} — topics: ${topics.length} | already linked: ${alreadyLinked} | link to existing: ${linkedExisting} | new WritingTask2 to create: ${created}`);
  if (!APPLY) console.log('Re-run with --apply to write.');

  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
