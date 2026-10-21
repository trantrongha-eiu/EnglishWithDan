// Bulk pre-listening warm-up generation ("Synonym Hunt" + "Paraphrase
// Detectives") for every active Listening section — see
// listeningService.buildSectionWarmUp. Every saved item is verbatim-grounded
// in the section's questions and transcript (utils/listeningWarmUp.js); the
// answer key stays teacher-only (ListeningSection.warmUp is select:false).
// Saved as unpublished ("Chờ duyệt") — students see it only after an admin
// publishes it, from the admin panel or scripts/_publish_warmup.js.
//
// Safe to re-run: by default only sections with no warm-up yet that weren't
// already marked skipped are picked up.
//
// Usage:
//   node backend/scripts/generateListeningWarmUp.js                     # sections without a warm-up
//   node backend/scripts/generateListeningWarmUp.js --limit 20          # cap this run
//   node backend/scripts/generateListeningWarmUp.js --concurrency 3     # parallel sections (default 3)
//   node backend/scripts/generateListeningWarmUp.js --include-skipped   # retry previously failed sections
//   node backend/scripts/generateListeningWarmUp.js --below 6           # ALSO redo unpublished, un-edited warm-ups with < 6 items
//   node backend/scripts/generateListeningWarmUp.js --ids id1,id2       # (re)generate exactly these
//   node backend/scripts/generateListeningWarmUp.js --force             # regenerate everything (overwrites hand edits!)
//   node backend/scripts/generateListeningWarmUp.js --verbose           # also print every dropped item and why
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

function parseArgs(argv) {
  const args = { limit: Infinity, force: false, includeSkipped: false, ids: null, concurrency: 3, verbose: false, below: 0 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit') args.limit = parseInt(argv[++i], 10) || Infinity;
    else if (argv[i] === '--force') args.force = true;
    else if (argv[i] === '--include-skipped') args.includeSkipped = true;
    else if (argv[i] === '--verbose') args.verbose = true;
    else if (argv[i] === '--below') args.below = parseInt(argv[++i], 10) || 0;
    else if (argv[i] === '--concurrency') args.concurrency = Math.max(1, parseInt(argv[++i], 10) || 3);
    else if (argv[i] === '--ids') args.ids = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
  }
  return args;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  const mongoose = require('mongoose');
  const ListeningSection = require('../models/ListeningSection');
  const listeningService = require('../services/listeningService');

  const args = parseArgs(process.argv.slice(2));
  await mongoose.connect(process.env.MONGO_URI);

  const filter = { isActive: true, transcript: { $nin: ['', null] }, 'questionGroups.0': { $exists: true } };
  if (args.ids) {
    filter._id = { $in: args.ids.map(id => new mongoose.Types.ObjectId(id)) };
  } else if (!args.force) {
    const missing = { 'warmUp.synonyms.0': { $exists: false }, 'warmUp.paraphrases.0': { $exists: false } };
    // Thin AI drafts nobody has published or hand-edited yet — safe to redo.
    const thin = {
      warmUpPublished: { $ne: true },
      'warmUp.editedAt': null,
      $expr: { $lt: [{ $add: [{ $size: { $ifNull: ['$warmUp.synonyms', []] } }, { $size: { $ifNull: ['$warmUp.paraphrases', []] } }] }, args.below] },
    };
    filter.$or = args.below > 0 ? [missing, thin] : [missing];
    if (!args.includeSkipped) filter.warmUpSkippedAt = null;
  }

  const total = await ListeningSection.countDocuments(filter);
  const sections = await ListeningSection.find(filter)
    .select('_id title partNumber transcript questionGroups')
    .sort({ createdAt: 1 })
    .limit(args.limit)
    .lean();
  console.log(`[warmup] ${total} section(s) need a warm-up; processing ${sections.length} (concurrency ${args.concurrency}).`);

  let next = 0, ok = 0, failed = 0;
  const thin = [];
  const failedList = [];

  async function worker() {
    while (next < sections.length) {
      const i = next++;
      const s = sections[i];
      const tag = `[${i + 1}/${sections.length}] P${s.partNumber} "${s.title}"`;
      for (let waits = 0; ; waits++) {
        try {
          const { synonyms, paraphrases, dropped } = await listeningService.buildSectionWarmUp(s);
          await ListeningSection.updateOne({ _id: s._id }, { $set: {
            warmUp: { synonyms, paraphrases, generatedAt: new Date(), editedAt: null },
            warmUpPublished: false, warmUpSkippedAt: null, warmUpSkipReason: '',
          } });
          ok++;
          if (synonyms.length < 6 || paraphrases.length < 6) thin.push(`${s._id} ${s.title} (${synonyms.length}/${paraphrases.length})`);
          console.log(`${tag} OK — ${synonyms.length} synonym, ${paraphrases.length} paraphrase`);
          if (args.verbose) dropped.forEach(d => console.log(`    dropped ${d}`));
        } catch (err) {
          // Gemini free tier is rate limited per minute — wait it out a few times.
          if (err.isOverloaded && waits < 4) { console.log(`${tag} rate limited — waiting 65s`); await sleep(65000); continue; }
          failed++;
          failedList.push(`${s._id} ${s.title}: ${err.message}`);
          if (!err.isOverloaded) {
            await ListeningSection.updateOne({ _id: s._id }, { $set: { warmUpSkippedAt: new Date(), warmUpSkipReason: String(err.message).slice(0, 300) } });
          }
          console.log(`${tag} FAILED — ${err.message}`);
        }
        break;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(args.concurrency, sections.length) }, worker));

  console.log(`\n[warmup] Done. ${ok} generated, ${failed} failed.`);
  if (thin.length) console.log(`[warmup] ${thin.length} with fewer than 6 items in an activity (synonym/paraphrase):\n  - ${thin.join('\n  - ')}`);
  if (failedList.length) console.log(`[warmup] Failed:\n  - ${failedList.join('\n  - ')}`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
