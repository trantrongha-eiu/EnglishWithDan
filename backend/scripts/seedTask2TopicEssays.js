/**
 * seedTask2TopicEssays.js — make sure every weekly Task 2 topic
 * (Task2Topic) has a matching full-essay task in the Writing Task 2 bank
 * (WritingTask2), linked via Task2Topic.writingTask2Id, AND that this
 * WritingTask2 carries a worked model essay (sampleSections) + a Vietnamese
 * "Phân tích đề" (analysisSections) from scripts/data/task2Essays.js.
 *
 * This is what the weekly practice screen's "Viết bài ngay" button needs:
 * it opens writing.html?taskType=2&taskId=<writingTask2Id> and reuses the
 * existing Task 2 essay flow (AI grading / drafts / history), now with an
 * example and a breakdown attached.
 *
 *   node backend/scripts/seedTask2TopicEssays.js             # dry run
 *   node backend/scripts/seedTask2TopicEssays.js --apply     # create/link + fill missing sample/analysis
 *   node backend/scripts/seedTask2TopicEssays.js --apply --refresh
 *                                                            # also re-sync prompt + sample + analysis on
 *                                                            # topics that are ALREADY linked (use after a
 *                                                            # prompt change)
 *
 * Safe to re-run. Without --refresh it never overwrites an existing prompt
 * or non-empty sample/analysis; it only fills gaps.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Task2Topic = require('../models/Task2Topic');
const WritingTask2 = require('../models/WritingTask2');
const { buildEssaySections } = require('./data/task2Essays');

const APPLY = process.argv.includes('--apply');
const REFRESH = process.argv.includes('--refresh');
const DEFAULT_INSTRUCTIONS =
  'You should spend about 40 minutes on this task. Write at least 250 words.';

// Loose match: ignore case, collapse whitespace, drop trailing punctuation.
function norm(s) {
  return (s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[."'’,\s]+$/g, '')
    .trim();
}
const hasContent = (arr) => Array.isArray(arr) && arr.some((s) => (s.content || '').trim());

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const topics = await Task2Topic.find({ isActive: true })
    .select('_id week topicName prompt essayType writingTask2Id')
    .sort({ week: 1, orderIndex: 1 })
    .lean();

  const tasks = await WritingTask2.find({}).select('_id prompt sampleSections analysisSections').lean();
  const byId = new Map(tasks.map((t) => [String(t._id), t]));
  const byPrompt = new Map();
  for (const t of tasks) {
    const k = norm(t.prompt);
    if (k && !byPrompt.has(k)) byPrompt.set(k, t);
  }

  let linkedNew = 0, created = 0, filled = 0, refreshed = 0, skipped = 0, noData = 0;

  for (const topic of topics) {
    const sections = buildEssaySections(topic.topicName, topic.essayType, topic.prompt);
    if (!sections) { noData++; console.log(`(!)  W${topic.week} · ${topic.topicName} — no essay data in task2Essays.js, skipping`); continue; }

    // 1) ensure the topic has a writingTask2Id
    let task = topic.writingTask2Id ? byId.get(String(topic.writingTask2Id)) : null;
    if (!task) {
      const match = byPrompt.get(norm(topic.prompt));
      if (match) {
        task = match;
        if (APPLY) await Task2Topic.updateOne({ _id: topic._id }, { $set: { writingTask2Id: task._id } });
        linkedNew++;
        console.log(`${APPLY ? 'LINK ' : 'PLAN '}  W${topic.week} · ${topic.topicName} → existing WritingTask2 ${task._id}`);
      } else {
        console.log(`${APPLY ? 'CREATE' : 'PLAN '}  W${topic.week} · ${topic.topicName} → new WritingTask2`);
        if (APPLY) {
          task = await WritingTask2.create({
            prompt: topic.prompt,
            instructions: DEFAULT_INSTRUCTIONS,
            sampleSections: sections.sampleSections,
            analysisSections: sections.analysisSections,
            isActive: true,
          });
          byId.set(String(task._id), task);
          byPrompt.set(norm(topic.prompt), task);
          await Task2Topic.updateOne({ _id: topic._id }, { $set: { writingTask2Id: task._id } });
        }
        created++;
        continue; // freshly created with everything
      }
    }

    // 2) ensure that WritingTask2 has sample + analysis (+ prompt in sync on --refresh)
    const update = {};
    const needSample = !hasContent(task.sampleSections);
    const needAnalysis = !hasContent(task.analysisSections);
    const promptDrifted = norm(task.prompt) !== norm(topic.prompt);

    if (needSample || (REFRESH && sections)) update.sampleSections = sections.sampleSections;
    if (needAnalysis || (REFRESH && sections)) update.analysisSections = sections.analysisSections;
    if (REFRESH && promptDrifted) update.prompt = topic.prompt;

    if (!Object.keys(update).length) { skipped++; continue; }

    const tag = (REFRESH && (promptDrifted || !needSample || !needAnalysis)) ? 'REFRESH' : 'FILL ';
    if (tag.trim() === 'REFRESH') refreshed++; else filled++;
    console.log(`${APPLY ? tag : 'PLAN  ' + tag}  W${topic.week} · ${topic.topicName}` +
      `${update.prompt ? ' [prompt re-synced]' : ''}${update.sampleSections ? ' [+sample]' : ''}${update.analysisSections ? ' [+analysis]' : ''}`);

    if (APPLY) await WritingTask2.updateOne({ _id: task._id }, { $set: update });
  }

  console.log(
    `\n${APPLY ? 'Applied' : 'Dry run'} — topics: ${topics.length}` +
    ` | created: ${created} | linked to existing: ${linkedNew}` +
    ` | sample/analysis filled: ${filled} | refreshed: ${refreshed}` +
    ` | already complete: ${skipped}${noData ? ` | no data: ${noData}` : ''}`,
  );
  if (!APPLY) console.log('Re-run with --apply (add --refresh to re-sync already-linked tasks).');

  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
