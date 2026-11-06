/**
 * linkWritingTask2Twins.js — mark Task 2 prompts that are the same IELTS
 * question under different wording (WritingTask2.duplicateOf).
 *
 *   node backend/scripts/linkWritingTask2Twins.js           # dry run + impact
 *   node backend/scripts/linkWritingTask2Twins.js --apply   # write
 *
 * Why: homework completion matches a student's essay to the assigned prompt
 * by id, by identical text, or by duplicateOf (resourceCompletionService
 * groupEquivalentDocs). The 27/08 and 03/09 batches entered several
 * questions twice with different wording, so a student who opened the other
 * copy from the Writing list wrote and got graded, but the homework stayed
 * unticked (prod 2026-11-06: "subsidise fruits and vegetables").
 *
 * Each group points at its oldest copy. Only touches duplicateOf.
 * Completion is computed live, so no backfill is needed after --apply.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const WritingTask2 = require('../models/WritingTask2');
const WritingAttempt = require('../models/WritingAttempt');
const Assignment = require('../models/Assignment');
const ClassEnrollment = require('../models/ClassEnrollment');
const { COUNTABLE_ATTEMPT } = require('../services/attemptVisibility');

const APPLY = process.argv.includes('--apply');

// Same question, same essay type, same two sides — only the wording differs.
// Left out on purpose (similar topic, different question):
//   6a905d2a31a29bc08f2e5a86 youth crime: causes + solutions
//     vs 6a99b18a5b413cfafa69978c youth crime: why + how to punish
//   6a905d2a31a29bc08f2e5a87 longer prison sentences vs other ways
//     vs 6a99b18a5b413cfafa69978d all offenders to prison vs community service
const GROUPS = [
  ['69ccec5d84749e2f69dfb2a4', '69ead8d512d21842dfb93022'], // many subjects vs few subjects in depth
  ['69ccec9b84749e2f69dfb2b8', '69ead86e12d21842dfb92fc5', '6a848738c4d5b5ac38bce88d'], // computer games vs sports
  ['6a857a10282c853ce33a92f0', '6a905d2131a29bc08f2e5a70'], // university dropouts: causes + effects
  ['6a905d2231a29bc08f2e5a71', '6a99b1875b413cfafa699785'], // too few science/STEM students: causes + effects
  ['6a905d2731a29bc08f2e5a7b', '6a99b1895b413cfafa699786'], // subsidise fruit & veg vs tax junk food
  ['6a905d2731a29bc08f2e5a7c', '6a9313479ca5a616963131a1', '6a99b1895b413cfafa699787'], // free public libraries
  ['6a905d2731a29bc08f2e5a7d', '6a99b1895b413cfafa699788'], // elite athletes vs sport for ordinary people
  ['6a905d2931a29bc08f2e5a81', '6a99b18a5b413cfafa699789'], // renewable energy: positive/negative
  ['6a905d2931a29bc08f2e5a82', '6a99b18a5b413cfafa69978a'], // community gardens: positive/negative
  ['6a905d2a31a29bc08f2e5a85', '6a99b18a5b413cfafa69978b'], // funding the arts vs other needs
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const allIds = GROUPS.flat();
  const docs = await WritingTask2.find({ _id: { $in: allIds } }).select('_id prompt createdAt duplicateOf').lean();
  const byId = new Map(docs.map((d) => [String(d._id), d]));
  const missing = allIds.filter((id) => !byId.has(id));
  if (missing.length) { console.error('Missing prompts:', missing); process.exit(1); }

  const groupOf = new Map();
  const writes = [];
  for (const g of GROUPS) {
    const sorted = g.map((id) => byId.get(id)).sort((a, b) => a.createdAt - b.createdAt);
    const keep = sorted[0];
    for (const id of g) groupOf.set(id, g);
    console.log(`\nkeep ${keep._id}: ${keep.prompt.slice(0, 90)}`);
    for (const d of sorted.slice(1)) {
      const already = String(d.duplicateOf || '') === String(keep._id);
      console.log(`  ${already ? 'ok  ' : 'link'} ${d._id}: ${d.prompt.slice(0, 90)}`);
      if (!already) writes.push({ updateOne: { filter: { _id: d._id }, update: { $set: { duplicateOf: keep._id } } } });
    }
  }

  // Impact: homework items on one of these prompts where the student has a
  // countable essay (>= 250 words, since the assignment) only on a twin.
  const assignments = await Assignment.find({ 'resources.resourceType': 'task2_practice' })
    .select('_id title classId createdAt resources').lean();
  let flips = 0;
  for (const a of assignments) {
    const items = a.resources.filter((r) => r.resourceType === 'task2_practice' && r.resourceId && groupOf.has(String(r.resourceId)));
    if (!items.length) continue;
    const students = await ClassEnrollment.find({ classId: a.classId, removedAt: null }).distinct('studentId');
    for (const r of items) {
      const own = String(r.resourceId);
      const twins = groupOf.get(own).filter((id) => id !== own);
      const base = { userId: { $in: students }, submissionType: 'practice', wordCount2: { $gte: 250 }, createdAt: { $gte: a.createdAt }, ...COUNTABLE_ATTEMPT };
      const [onOwn, onTwin] = await Promise.all([
        WritingAttempt.distinct('userId', { ...base, task2Id: own }),
        WritingAttempt.distinct('userId', { ...base, task2Id: { $in: twins } }),
      ]);
      const ownSet = new Set(onOwn.map(String));
      const gained = onTwin.map(String).filter((u) => !ownSet.has(u));
      if (gained.length) {
        flips += gained.length;
        console.log(`\n[${a.title}] ${own}: +${gained.length} student(s) ticked`);
      }
    }
  }
  console.log(`\nHomework items that become done: ${flips}`);

  if (!APPLY) { console.log(`Dry run — ${writes.length} prompt(s) to link. Re-run with --apply.`); }
  else if (writes.length) { const res = await WritingTask2.bulkWrite(writes); console.log(`Linked ${res.modifiedCount} prompt(s).`); }
  else console.log('Nothing to write.');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
