// One-off migration: normalise dictation clip lengths.
//
// SUPERSEDED by scripts/rebuildDictationSentences.js (2026-09) — the ~4s cap
// this script enforced chopped sentences mid-thought; the rebuild script
// rejoins those and only splits genuinely long sentences at strong
// boundaries. Kept for history; do not run.
//
// Some already-aligned ListeningSection.dictationSentences entries play for
// 8-12+ seconds (e.g. "Bankside Recruitment Agency", câu 10 = 37 words / 12s),
// which is hard to hold in working memory while typing back. This walks every
// ListeningSection that has dictationSentences and runs normalizeDictationUnits
// on each: any clip longer than --max seconds (default 4) is cut into
// consecutive sub-clips at the most natural in-sentence boundary near each
// ~4s mark (comma / semicolon / dash, then a conjunction, then a plain word
// gap), timings interpolated across the original clip's real [start,end] by
// characters spoken; then any sub-second stub is folded back into a
// contiguous neighbour. Clips over 25s are left whole (that length means the
// forced-alignment drifted, not real speech) and reported for manual
// re-alignment. No Groq call — it only re-slices already-aligned timings.
//
// Idempotent: normalizeDictationUnits is a fixpoint, and the script only
// writes when the normalised array actually differs. Per-doc updateOne with
// an explicit _id filter only — never an unscoped updateMany.
//
// Usage:
//   node backend/scripts/splitLongDictationSentences.js              # apply to all sections
//   node backend/scripts/splitLongDictationSentences.js --dry        # report only, write nothing
//   node backend/scripts/splitLongDictationSentences.js --max 4.5    # threshold in seconds (default 4)
//   node backend/scripts/splitLongDictationSentences.js --ids a,b    # only these ListeningSection _ids
'use strict';

require('dotenv').config();

function parseArgs(argv) {
  const args = { dry: false, max: 4, ids: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dry') args.dry = true;
    else if (argv[i] === '--max') args.max = parseFloat(argv[++i]) || 4;
    else if (argv[i] === '--ids') args.ids = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
  }
  return args;
}

async function run() {
  const mongoose = require('mongoose');
  const ListeningSection = require('../models/ListeningSection');
  const { normalizeDictationUnits } = require('../services/listeningTranscriptSplitter');

  const args = parseArgs(process.argv.slice(2));
  await mongoose.connect(process.env.MONGO_URI);

  const filter = { dictationSentences: { $exists: true, $not: { $size: 0 } } };
  if (args.ids) {
    const validIds = [];
    for (const id of args.ids) {
      try { validIds.push(new mongoose.Types.ObjectId(id)); }
      catch (err) { console.error(`[splitLong] skipping invalid --ids entry "${id}": ${err.message}`); }
    }
    filter._id = { $in: validIds };
  }

  const sections = await ListeningSection.find(filter)
    .select('title dictationSentences').lean();
  console.log(`[splitLong] ${sections.length} section(s) to inspect · max ${args.max}s${args.dry ? ' · DRY RUN' : ''}\n`);

  // A clip running longer than this almost always means the forced-alignment
  // for that sentence drifted (interpolated across a big unmatched gap), not
  // that someone really spoke one sentence for 25+ seconds. Slicing that by
  // character-proportion just produces several equally-wrong micro-clips, so
  // leave it whole and flag it for a manual re-align instead.
  const BROKEN_ALIGN_SEC = 25;

  const sameArr = (a, b) => a.length === b.length && a.every((u, i) =>
    u.text === b[i].text && u.start === b[i].start && u.end === b[i].end);

  let changedDocs = 0, addedUnits = 0, longestBefore = 0;
  const suspect = [];
  for (const s of sections) {
    const before = (s.dictationSentences || []).map(u => ({ text: u.text, start: u.start, end: u.end }));

    for (const u of before) {
      if ((u.end - u.start) > BROKEN_ALIGN_SEC) {
        suspect.push({ title: s.title, sec: +(u.end - u.start).toFixed(1), text: u.text.slice(0, 80) });
      }
    }

    const after = normalizeDictationUnits(before, { maxSec: args.max, maxSplittableSec: BROKEN_ALIGN_SEC });
    if (sameArr(before, after)) continue;

    const splitFromLong = before.filter(u => {
      const d = u.end - u.start;
      return d > args.max && d <= BROKEN_ALIGN_SEC;
    });
    changedDocs++;
    addedUnits += after.length - before.length;
    const maxLen = splitFromLong.length ? Math.max(...splitFromLong.map(u => +(u.end - u.start).toFixed(1))) : 0;
    longestBefore = Math.max(longestBefore, maxLen);
    console.log(`• "${s.title}" — ${before.length} → ${after.length} units (${splitFromLong.length} over ${args.max}s, longest ${maxLen}s)`);
    for (const u of splitFromLong) {
      console.log(`    was ${(u.end - u.start).toFixed(1)}s: "${u.text.slice(0, 90)}${u.text.length > 90 ? '…' : ''}"`);
    }

    if (!args.dry) {
      await ListeningSection.updateOne(
        { _id: s._id },
        { $set: { dictationSentences: after, dictationSplitLongAt: new Date() } }
      );
    }
  }

  console.log(`\n[splitLong] ${args.dry ? 'would change' : 'changed'} ${changedDocs} section(s), net ${addedUnits >= 0 ? '+' : ''}${addedUnits} clips, longest clip split ${longestBefore.toFixed(1)}s.`);
  if (suspect.length) {
    console.log(`\n[splitLong] ${suspect.length} clip(s) left WHOLE — over ${BROKEN_ALIGN_SEC}s, alignment likely broken, re-align these sections:`);
    suspect.forEach(x => console.log(`  ${x.sec}s · "${x.title}" · "${x.text}"`));
  }
  await mongoose.disconnect();
}

run().catch(e => { console.error('[splitLong] FAILED', e); process.exit(1); });
