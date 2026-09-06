// One-off migration: restore whole-sentence dictation clips.
//
// An earlier pass split dictation clips hard at ~4s, which chopped many
// sentences mid-thought ("...a research study I did over |", "Right. Well,
// the plan was to have a |"). Policy is now: a dictation clip is a WHOLE
// sentence; only a sentence running well over ~9s is broken up, and only at
// a strong internal boundary (semicolon / colon / dash / internal full stop
// / comma-before-a-new-clause) so no piece is ever left cut off.
//
// This walks every ListeningSection with dictationSentences and:
//   1. mergeAdjacentFragments — rejoins clips the old splitter cut out of
//      one sentence (a clip not ending in . ! ? whose neighbour starts right
//      where it ends).
//   2. drops leftovers that still can't be a whole sentence — no
//      sentence-final punctuation, or not starting with a capital — which is
//      what's left when the name filter earlier removed a sibling fragment.
//   3. re-applies the unspellable-name filter (dictationNameFilter) to the
//      now-whole sentences.
//   4. normalizeDictationUnits — splits only the genuinely long ones, at
//      strong boundaries, and folds away any sub-second stub.
// A section is left untouched if this would drop it below MIN_KEEP clips.
//
// No Groq call — it only re-joins / re-slices already-aligned timings.
// Idempotent; per-doc updateOne with an explicit _id filter, never updateMany.
//
// Usage:
//   node backend/scripts/rebuildDictationSentences.js            # apply
//   node backend/scripts/rebuildDictationSentences.js --dry      # report only
//   node backend/scripts/rebuildDictationSentences.js --max 10   # soft length cap (s, default 9)
//   node backend/scripts/rebuildDictationSentences.js --ids a,b  # only these _ids
'use strict';

require('dotenv').config();

function parseArgs(argv) {
  const args = { dry: false, max: 9, ids: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dry') args.dry = true;
    else if (argv[i] === '--max') args.max = parseFloat(argv[++i]) || 9;
    else if (argv[i] === '--ids') args.ids = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
  }
  return args;
}

const ENDS_SENTENCE = /[.!?]["'”’)\]]*\s*$/;
const STARTS_CAPITAL = /^[^A-Za-z]*[A-Z]/;

async function run() {
  const mongoose = require('mongoose');
  const ListeningSection = require('../models/ListeningSection');
  const {
    mergeAdjacentFragments, normalizeDictationUnits,
  } = require('../services/listeningTranscriptSplitter');
  const { buildLexicon, dropNameHeavySentences } = require('../services/dictationNameFilter');

  const args = parseArgs(process.argv.slice(2));
  await mongoose.connect(process.env.MONGO_URI);

  const MIN_KEEP = 5;
  const BROKEN_ALIGN_SEC = 25;

  const corpus = await ListeningSection.find({ transcript: { $ne: '' } })
    .select('transcript dictationSentences').lean();
  const texts = [];
  for (const c of corpus) {
    if (c.transcript) texts.push(c.transcript);
    for (const u of c.dictationSentences || []) texts.push(u.text);
  }
  const lexicon = buildLexicon(texts);

  const filter = { dictationSentences: { $exists: true, $not: { $size: 0 } } };
  if (args.ids) {
    const ok = [];
    for (const id of args.ids) {
      try { ok.push(new mongoose.Types.ObjectId(id)); }
      catch (e) { console.error(`[rebuild] bad --ids "${id}": ${e.message}`); }
    }
    filter._id = { $in: ok };
  }
  const sections = await ListeningSection.find(filter).select('title dictationSentences').lean();
  console.log(`[rebuild] ${sections.length} section(s)${args.dry ? ' · DRY RUN' : ''} · soft max ${args.max}s\n`);

  const sameArr = (a, b) => a.length === b.length && a.every((u, i) =>
    u.text === b[i].text && u.start === b[i].start && u.end === b[i].end);

  let changed = 0, joinedTot = 0, orphanTot = 0, nameTot = 0, splitTot = 0, thin = 0;
  for (const s of sections) {
    const before = (s.dictationSentences || []).map(u => ({ text: u.text, start: u.start, end: u.end }));

    // 1. rejoin fragments
    const merged = mergeAdjacentFragments(before);
    // 2. drop what still isn't a whole sentence (lost a sibling earlier)
    const whole = [], orphans = [];
    for (const u of merged) {
      if (ENDS_SENTENCE.test(u.text) && STARTS_CAPITAL.test(u.text)) whole.push(u);
      else orphans.push(u);
    }
    // 3. re-apply the name filter on whole sentences
    const nf = dropNameHeavySentences(whole, lexicon);
    // 4. conservative split of the genuinely long ones
    const after = normalizeDictationUnits(nf.kept, { maxSec: args.max, maxSplittableSec: BROKEN_ALIGN_SEC });

    if (sameArr(before, after)) continue;

    if (after.length < MIN_KEEP) {
      thin++;
      console.log(`• "${s.title}" — SKIPPED (would leave ${after.length})`);
      continue;
    }

    const joined = merged.length - before.length; // negative = clips joined away
    changed++;
    joinedTot += Math.max(0, before.length - merged.length);
    orphanTot += orphans.length;
    nameTot += nf.dropped.length;
    splitTot += Math.max(0, after.length - nf.kept.length);
    console.log(`• "${s.title}" — ${before.length} → ${after.length}  (rejoined ${before.length - merged.length}, `
      + `orphans dropped ${orphans.length}, names dropped ${nf.dropped.length}, long-splits +${after.length - nf.kept.length})`);
    for (const o of orphans) console.log(`    orphan: "${o.text.slice(0, 90)}"`);
    for (const d of nf.dropped) console.log(`    name:   "${d.text.slice(0, 90)}"`);

    if (!args.dry) {
      await ListeningSection.updateOne(
        { _id: s._id },
        { $set: { dictationSentences: after, dictationRebuiltAt: new Date() } }
      );
    }
  }

  console.log(`\n[rebuild] ${args.dry ? 'would change' : 'changed'} ${changed} section(s): `
    + `${joinedTot} fragment-joins, ${orphanTot} orphans dropped, ${nameTot} name sentences dropped, ${splitTot} long-sentence splits`
    + `${thin ? `; ${thin} section(s) left intact (too few would remain)` : ''}.`);
  await mongoose.disconnect();
}

run().catch(e => { console.error('[rebuild] FAILED', e); process.exit(1); });
