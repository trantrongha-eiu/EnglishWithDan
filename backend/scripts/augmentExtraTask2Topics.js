/**
 * augmentExtraTask2Topics.js — apply brainstormHints + the evidence /
 * conclusion / short_writing drill questions to the Task2Topic docs that
 * were added through the admin panel and therefore are NOT in
 * seedTask2Exercises.js's `topics` array (so `augmentTopics` never touches
 * them during the normal seed).
 *
 *   node backend/scripts/augmentExtraTask2Topics.js           # dry run
 *   node backend/scripts/augmentExtraTask2Topics.js --apply   # write
 *
 * Also links each to a WritingTask2 (model essay + Phân tích đề) — the same
 * treatment the 38 seeded topics get from seedTask2TopicEssays.js, which
 * skips these because they are isActive:false (admin drafts).
 *
 * Idempotent — augmentTopics() strips any previous *-aug-* questions before
 * re-adding; scoped $set / updateOne by _id throughout.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Task2Topic = require('../models/Task2Topic');
const WritingTask2 = require('../models/WritingTask2');
const { AUG, augmentTopics } = require('./data/task2Augment');
const { buildEssaySections } = require('./data/task2Essays');

const DEFAULT_INSTRUCTIONS = 'You should spend about 40 minutes on this task. Write at least 250 words.';
const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').replace(/[."'’,\s]+$/g, '').trim();
const hasContent = (arr) => Array.isArray(arr) && arr.some((s) => (s.content || '').trim());

const APPLY = process.argv.includes('--apply');

// The topics live in AUG under a header comment "EXTRA topics added via the
// admin panel" — but rather than hard-code names, take every AUG key that
// is NOT one of the 38 in the main seed file.
const seededNames = new Set(require('./seedTask2Exercises').topics.map((t) => t.topicName));
const extraNames = Object.keys(AUG).filter((n) => !seededNames.has(n));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const docs = await Task2Topic.find({ topicName: { $in: extraNames } }).lean();
  const found = new Set(docs.map((d) => d.topicName));
  for (const n of extraNames) if (!found.has(n)) console.log(`(!)  "${n}" — has AUG data but no Task2Topic in the DB, skipping`);

  const allTasks = await WritingTask2.find({}).select('_id prompt sampleSections analysisSections').lean();
  const byPrompt = new Map();
  for (const w of allTasks) { const k = norm(w.prompt); if (k && !byPrompt.has(k)) byPrompt.set(k, w); }
  const byId = new Map(allTasks.map((w) => [String(w._id), w]));

  let wrote = 0;
  for (const doc of docs) {
    const before = (doc.questions || []).length;
    augmentTopics([doc]); // mutates doc.brainstormHints + doc.questions in place
    const after = doc.questions.length;

    // link + fill a WritingTask2 (model essay + Phân tích đề)
    const sec = buildEssaySections(doc.topicName, doc.essayType, doc.prompt);
    let task = doc.writingTask2Id ? byId.get(String(doc.writingTask2Id)) : null;
    let linkNote = '';
    if (!task) {
      const m = byPrompt.get(norm(doc.prompt));
      if (m) { task = m; linkNote = `link existing ${m._id}`; }
      else { linkNote = 'create new WritingTask2'; }
    }
    const needFill = sec && (!task || !hasContent(task.sampleSections) || !hasContent(task.analysisSections));

    console.log(`${APPLY ? 'WRITE' : 'PLAN '}  W${doc.week} · ${doc.topicName}` +
      `  → bh ${doc.brainstormHints.length}, q ${before}→${after}` +
      `${linkNote ? ' | ' + linkNote : ''}${needFill ? ' | +sample/analysis' : ''}`);

    if (APPLY) {
      await Task2Topic.updateOne(
        { _id: doc._id },
        { $set: { brainstormHints: doc.brainstormHints, questions: doc.questions } },
      );
      if (sec) {
        if (!task) {
          task = await WritingTask2.create({ prompt: doc.prompt, instructions: DEFAULT_INSTRUCTIONS, sampleSections: sec.sampleSections, analysisSections: sec.analysisSections, isActive: true });
          byPrompt.set(norm(doc.prompt), task);
        } else if (needFill) {
          await WritingTask2.updateOne({ _id: task._id }, { $set: { sampleSections: sec.sampleSections, analysisSections: sec.analysisSections } });
        }
        if (String(doc.writingTask2Id || '') !== String(task._id)) {
          await Task2Topic.updateOne({ _id: doc._id }, { $set: { writingTask2Id: task._id } });
        }
      }
      wrote++;
    }
  }

  console.log(`\n${APPLY ? 'Applied' : 'Dry run'} — ${extraNames.length} extra topic(s) with AUG data, ${docs.length} found in DB, ${wrote} written.`);
  if (!APPLY) console.log('Re-run with --apply.');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
