// One-off migration: drop dictation sentences that hinge on an unspellable
// proper name.
//
// A dictation exercise checks exact spelling of what you heard. A sentence
// built around an invented/foreign place or person name ("Bishlama",
// "Wivenhoe", "Antikythera", "Santander", "Prensky") or one that spells a
// name out letter by letter ("J-A-M-I-E-S-O-N") is unfair — there's no way
// to know the spelling from the audio. This walks every ListeningSection
// with dictationSentences and removes those, keeping ordinary spellable
// proper nouns (countries, days, months, common first names, well-known
// cities, and real words that only look like names inside a title).
//
// Detection: services/dictationNameFilter.js — a mid-sentence capitalised
// word that is neither a real English word (an-array-of-english-words) nor
// in its allowlist, checked against a lowercase lexicon built from every
// listening transcript for extra precision. Idempotent (re-running finds
// nothing); per-doc updateOne with an explicit _id filter, never updateMany.
// A section is left untouched if dropping would leave it with < MIN_KEEP
// usable sentences (better a few name-heavy lines than a dead exercise).
//
// Usage:
//   node backend/scripts/dropNameHeavyDictation.js            # apply to all
//   node backend/scripts/dropNameHeavyDictation.js --dry      # report only
//   node backend/scripts/dropNameHeavyDictation.js --ids a,b  # only these _ids
'use strict';

require('dotenv').config();

function parseArgs(argv) {
  const args = { dry: false, ids: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dry') args.dry = true;
    else if (argv[i] === '--ids') args.ids = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
  }
  return args;
}

async function run() {
  const mongoose = require('mongoose');
  const ListeningSection = require('../models/ListeningSection');
  const { buildLexicon, dropNameHeavySentences } = require('../services/dictationNameFilter');

  const args = parseArgs(process.argv.slice(2));
  await mongoose.connect(process.env.MONGO_URI);

  // A section that would keep fewer than this isn't worth gutting.
  const MIN_KEEP = 5;

  // Lexicon from EVERY listening transcript (not just the sections being
  // edited) so a word written lowercase anywhere counts as spellable.
  const corpus = await ListeningSection.find({ transcript: { $ne: '' } }).select('transcript dictationSentences').lean();
  const texts = [];
  for (const c of corpus) {
    if (c.transcript) texts.push(c.transcript);
    for (const u of c.dictationSentences || []) texts.push(u.text);
  }
  const lexicon = buildLexicon(texts);
  console.log(`[dropNames] lexicon: ${lexicon.size} lowercase words from ${corpus.length} transcripts`);

  const filter = { dictationSentences: { $exists: true, $not: { $size: 0 } } };
  if (args.ids) {
    const ok = [];
    for (const id of args.ids) {
      try { ok.push(new mongoose.Types.ObjectId(id)); }
      catch (e) { console.error(`[dropNames] bad --ids "${id}": ${e.message}`); }
    }
    filter._id = { $in: ok };
  }

  const sections = await ListeningSection.find(filter).select('title dictationSentences').lean();
  console.log(`[dropNames] ${sections.length} section(s) to inspect${args.dry ? ' · DRY RUN' : ''}\n`);

  let changed = 0, removed = 0, skippedThin = 0;
  const reasonCount = new Map();
  for (const s of sections) {
    const before = s.dictationSentences || [];
    const { kept, dropped } = dropNameHeavySentences(
      before.map(u => ({ text: u.text, start: u.start, end: u.end })), lexicon);
    if (!dropped.length) continue;

    if (kept.length < MIN_KEEP) {
      skippedThin++;
      console.log(`• "${s.title}" — SKIPPED (would leave only ${kept.length} of ${before.length})`);
      continue;
    }

    changed++;
    removed += dropped.length;
    for (const d of dropped) {
      const k = d.reason.replace(/"[^"]*"/, 'name');
      reasonCount.set(k, (reasonCount.get(k) || 0) + 1);
    }
    console.log(`• "${s.title}" — ${before.length} → ${kept.length} (drop ${dropped.length})`);
    for (const d of dropped) console.log(`    [${d.reason}] ${d.text}`);

    if (!args.dry) {
      await ListeningSection.updateOne(
        { _id: s._id },
        { $set: { dictationSentences: kept, dictationNamesFilteredAt: new Date() } }
      );
    }
  }

  console.log(`\n[dropNames] ${args.dry ? 'would remove' : 'removed'} ${removed} sentence(s) from ${changed} section(s)`
    + `${skippedThin ? `; ${skippedThin} section(s) left intact (too few would remain)` : ''}.`);
  console.log('[dropNames] reasons: ' + [...reasonCount.entries()].map(([k, n]) => `${k} × ${n}`).join('  |  '));
  await mongoose.disconnect();
}

run().catch(e => { console.error('[dropNames] FAILED', e); process.exit(1); });
