/**
 * Bulk-generates and caches Band 7.5+ sample answers for every active
 * SpeakingQuestion that doesn't have one yet, so /api/speaking/sample-answer
 * can serve almost every request straight from MongoDB with zero Gemini
 * calls (see speakingService.getSampleAnswer's cache-aside logic).
 *
 * Safe to re-run: only processes questions where sampleAnswer is still
 * empty, so an interrupted run (or one capped with --limit) can just be
 * run again later to pick up where it left off.
 *
 * IMPORTANT — free-tier Gemini quota: this project's GEMINI_API_KEY has
 * been observed hitting GenerateRequestsPerDayPerProjectPerModel-FreeTier
 * (20 requests/day) during earlier testing. With ~565+ seeded questions,
 * generating the whole bank in one run WILL exhaust that quota almost
 * immediately and fail partway through. Use --limit to run in daily
 * batches (e.g. 15/day, leaving headroom for real student traffic on the
 * same key) until the bank is fully covered — or generate against a paid
 * tier / a dedicated key.
 *
 * Usage:
 *   node backend/scripts/generateSampleAnswers.js               # all missing
 *   node backend/scripts/generateSampleAnswers.js --limit 15    # cap this run
 *   node backend/scripts/generateSampleAnswers.js --part 2      # only Part 2
 *   node backend/scripts/generateSampleAnswers.js --delay 4000  # ms between calls (default 3000)
 */

require('dotenv').config();

function parseArgs(argv) {
  const args = { limit: Infinity, part: null, delay: 3000 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit') args.limit = parseInt(argv[++i], 10) || Infinity;
    else if (argv[i] === '--part') args.part = parseInt(argv[++i], 10) || null;
    else if (argv[i] === '--delay') args.delay = parseInt(argv[++i], 10) || 3000;
  }
  return args;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function run() {
  const mongoose = require('mongoose');
  const SpeakingQuestion = require('../models/SpeakingQuestion');
  const { generateSampleAnswer } = require('../services/geminiService');

  const args = parseArgs(process.argv.slice(2));

  await mongoose.connect(process.env.MONGO_URI);

  const filter = { isActive: true, $or: [{ sampleAnswer: { $exists: false } }, { sampleAnswer: '' }] };
  if (args.part) filter.part = args.part;

  const totalMissing = await SpeakingQuestion.countDocuments(filter);
  const questions = await SpeakingQuestion.find(filter).limit(args.limit).lean();

  console.log(`[generateSampleAnswers] ${totalMissing} questions still missing a sample answer` +
    (args.part ? ` (Part ${args.part})` : '') + `; generating ${questions.length} this run.`);

  let ok = 0, failed = 0;
  for (const [i, q] of questions.entries()) {
    try {
      const { sampleAnswer } = await generateSampleAnswer(q.question, q.part, q.cueCard || '');
      await SpeakingQuestion.updateOne({ _id: q._id }, { $set: { sampleAnswer } });
      ok++;
      console.log(`[${i + 1}/${questions.length}] OK  Part ${q.part} · ${q.topic} · "${q.question.slice(0, 60)}..."`);
    } catch (err) {
      failed++;
      console.error(`[${i + 1}/${questions.length}] FAIL Part ${q.part} · ${q.topic}: ${err.message}`);
      // A quota/overload error will fail every subsequent call identically —
      // stop the run instead of burning through the rest for nothing.
      if (err.isOverloaded) {
        console.error('[generateSampleAnswers] AI overloaded/quota exhausted — stopping run early. Re-run later to continue.');
        break;
      }
    }
    if (i < questions.length - 1) await sleep(args.delay);
  }

  console.log(`[generateSampleAnswers] Done. ${ok} generated, ${failed} failed, ${totalMissing - ok} still missing.`);
  await mongoose.disconnect();
}

if (require.main === module) {
  run().catch(err => { console.error(err); process.exit(1); });
}

module.exports = { run };
