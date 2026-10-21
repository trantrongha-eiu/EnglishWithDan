// Check generated Listening warm-ups, prune bad items, publish the clean ones.
// Dry-run by default; --apply writes the pruned items and sets
// warmUpPublished:true for passing sections ONLY.
// Usage: node backend/scripts/_publish_warmup.js [--apply] [--min 6] [--ids id1,id2] [--verbose]
//   Re-runs utils/listeningWarmUp.validateWarmUp on the STORED items against
//   the section's CURRENT transcript, questions and test answers — so rules
//   added after generation (e.g. "never give away a test answer") and later
//   transcript/question edits apply. Failing items are dropped; a section is
//   published only if at least --min items survive in total.
//   Hand-edited warm-ups (editedAt set) are never touched — a teacher's own
//   edit is published from the admin panel.
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');
const { buildQuestionMaterial, buildTestAnswers, validateWarmUp } = require('../utils/listeningWarmUp');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const APPLY = process.argv.includes('--apply');
const VERBOSE = process.argv.includes('--verbose');
const MIN = Number(arg('--min', 6));
const IDS = arg('--ids', '') ? arg('--ids', '').split(',') : null;

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const filter = { isActive: true, $or: [{ 'warmUp.synonyms.0': { $exists: true } }, { 'warmUp.paraphrases.0': { $exists: true } }] };
  if (IDS) filter._id = { $in: IDS };
  const secs = await ListeningSection.find(filter)
    .select('title partNumber transcript questionGroups warmUpPublished +warmUp').sort({ partNumber: 1, title: 1 }).lean();

  const counts = { publish: 0, held: 0, edited: 0, pruned: 0, droppedItems: 0 };
  const ops = [];
  for (const s of secs) {
    const w = s.warmUp;
    if (w.editedAt) { counts.edited++; continue; }
    const ctx = { transcript: s.transcript, questionMaterial: buildQuestionMaterial(s), testAnswers: buildTestAnswers(s) };
    const v = validateWarmUp({ synonyms: w.synonyms, paraphrases: w.paraphrases }, ctx);
    const before = `${w.synonyms.length}/${w.paraphrases.length}`;
    const after = `${v.synonyms.length}/${v.paraphrases.length}`;
    const total = v.synonyms.length + v.paraphrases.length;
    const changed = v.dropped.length > 0;
    if (changed) { counts.pruned++; counts.droppedItems += v.dropped.length; }
    const ok = total >= MIN;
    if (ok) counts.publish++; else counts.held++;
    if (!ok || VERBOSE) {
      console.log(`${ok ? 'OK  ' : 'HOLD'} ${s._id} P${s.partNumber} ${s.title} — ${before} → ${after}`);
      if (VERBOSE) v.dropped.forEach((d) => console.log(`       dropped ${d}`));
    }
    const set = { warmUpPublished: ok };
    if (changed) set.warmUp = { ...w, synonyms: v.synonyms, paraphrases: v.paraphrases };
    if (changed || s.warmUpPublished !== ok) ops.push({ updateOne: { filter: { _id: s._id }, update: { $set: set } } });
  }

  console.log(`\n${secs.length} with a warm-up: ${counts.publish} publishable, ${counts.held} held (< ${MIN} items), ${counts.edited} hand-edited (skipped)`);
  console.log(`${counts.pruned} section(s) lose ${counts.droppedItems} item(s) to the current rules${APPLY ? '' : ' (dry run)'}`);
  if (APPLY && ops.length) {
    const r = await ListeningSection.bulkWrite(ops);
    console.log('updated:', r.modifiedCount);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
