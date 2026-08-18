// Bulk sentence-level forced-alignment for Listening dictation practice —
// scoped to standalone ListeningSection docs only ("bài lẻ"), each of which
// has its own dedicated audio file small enough for a single Groq Whisper
// call (unlike ListeningTest, where all 4 parts share one ~30-40 MB audio
// file that would need chunking — deliberately out of scope here).
//
// For every ListeningSection with a non-empty transcript + audioUrl and no
// dictationSentences yet, this: splits the transcript into sentences
// (listeningTranscriptSplitter — merges any sub-3-word fragment into its
// neighbour, since a lone word like "Fine." gives the aligner nothing to
// anchor on reliably), transcribes the audio via Groq Whisper with
// word-level timestamps (listeningAlignmentService — which also skips past
// the audio's pre-dialogue instructions via a 4-word anchor match, so they
// can never be mismatched into), aligns the known sentences against those
// timestamps, then KEEPS only the sentences that are both accurately timed
// AND substantive (see selectDictationSentences()) — per product decision,
// a dictation section doesn't need every sentence from the passage:
// spelled-out words/phone numbers/emails (exactly what routinely fails
// Whisper's word-match) and short filler turns ("Okay.", "Hello.") are
// dropped rather than failing the whole section. A section is only skipped
// outright if too FEW usable sentences remain (< MIN_SECTION_SENTENCES) to
// be worth having as a practice unit at all. Safe to re-run: the default
// filter only picks up sections that are still genuinely untried, so an
// interrupted run can just be run again to pick up where it left off.
//
// A section that's skipped (too little usable content, or a permanent error
// like Groq's 413 "file too large") is marked with dictationSkippedAt so
// the DEFAULT run leaves it alone from then on — otherwise every hourly
// re-run would spend its limited quota re-attempting the same handful of
// deterministically-doomed sections first, before ever reaching untried
// ones (this is exactly what happened before this flag existed: the same
// ~7 sections ate most of each run's quota, run after run).
//
// Usage:
//   node backend/scripts/bulkAlignListeningDictation.js                  # untried sections only
//   node backend/scripts/bulkAlignListeningDictation.js --limit 20       # cap this run
//   node backend/scripts/bulkAlignListeningDictation.js --include-skipped # also retry content-rejected sections (e.g. after a transcript/code fix) — still skips permanent failures like "file too large"
//   node backend/scripts/bulkAlignListeningDictation.js --force          # re-align EVERYTHING, including already-successful and permanently-failed sections
//   node backend/scripts/bulkAlignListeningDictation.js --delay 2000     # ms between sections (default 1500)
//   node backend/scripts/bulkAlignListeningDictation.js --ids id1,id2    # re-align ONLY these specific _ids (always force-mode for exactly this set — for
//                                                                        # targeted re-fixes, e.g. sections whose transcript was edited after their last
//                                                                        # alignment and drifted out of sync, without re-touching the rest of the catalogue)
'use strict';

require('dotenv').config();

function parseArgs(argv) {
  const args = { limit: Infinity, force: false, delay: 1500, includeSkipped: false, ids: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit') args.limit = parseInt(argv[++i], 10) || Infinity;
    else if (argv[i] === '--force') args.force = true;
    else if (argv[i] === '--delay') args.delay = parseInt(argv[++i], 10) || 1500;
    else if (argv[i] === '--include-skipped') args.includeSkipped = true;
    else if (argv[i] === '--ids') args.ids = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
  }
  return args;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function run() {
  const mongoose = require('mongoose');
  const ListeningSection = require('../models/ListeningSection');
  const { splitTranscriptIntoSentences } = require('../services/listeningTranscriptSplitter');
  const { transcribeWithWordTimestamps, alignSentences, selectDictationSentences } = require('../services/listeningAlignmentService');

  const args = parseArgs(process.argv.slice(2));

  await mongoose.connect(process.env.MONGO_URI);

  const filter = { transcript: { $ne: '' }, audioUrl: { $ne: '' } };
  // --ids always behaves like --force for exactly that set — the whole
  // point is re-aligning specific sections regardless of their current
  // dictationSentences/skipped state (e.g. already-aligned-but-stale ones).
  if (args.ids) {
    // A single malformed id (e.g. a copy-paste typo) must not abort the
    // whole run before any section is touched — skip and report it instead,
    // same "don't let one bad input take down the batch" spirit as the
    // per-section try/catch below.
    const validIds = [];
    for (const id of args.ids) {
      try { validIds.push(new mongoose.Types.ObjectId(id)); }
      catch (err) { console.error(`[bulkAlign] Skipping invalid --ids entry "${id}": ${err.message}`); }
    }
    filter._id = { $in: validIds };
  } else if (!args.force) {
    // Existing docs predate this field entirely (no retroactive default on
    // already-saved documents), so "not yet aligned" means EITHER the field
    // is missing outright OR it's an empty array — $size:0 alone only
    // matches the second case and silently skipped every real document.
    filter.$or = [{ dictationSentences: { $exists: false } }, { dictationSentences: { $size: 0 } }];
    // { field: null } matches both "missing" and "explicitly null" in
    // Mongo, so this works uniformly for pre-existing docs too.
    // --include-skipped retries content-validation rejections (a transcript
    // fix might resolve those) but still excludes permanent failures like
    // "file too large" — no transcript/code change can ever fix those, so
    // retrying them is pure wasted time on every single run. Only --force
    // (skipped this whole block) touches those.
    if (!args.includeSkipped) filter.dictationSkippedAt = null;
    else filter.dictationSkipPermanent = { $ne: true };
  }

  const totalMissing = await ListeningSection.countDocuments(filter);
  const sections = await ListeningSection.find(filter).select('title audioUrl audioDuration transcript').limit(args.limit).lean();

  console.log(`[bulkAlign] ${totalMissing} section(s) need alignment; processing ${sections.length} this run.`);

  // A section kept fewer usable sentences than this isn't worth having as a
  // dictation practice unit at all — skip it outright rather than saving a
  // near-empty exercise.
  const MIN_SECTION_SENTENCES = 5;

  let ok = 0, rejected = 0, failed = 0;
  const rejectedList = [];
  for (const [i, section] of sections.entries()) {
    const tag = `[${i + 1}/${sections.length}] "${section.title}"`;
    try {
      const sentences = splitTranscriptIntoSentences(section.transcript);
      if (sentences.length === 0) {
        console.log(`${tag} SKIP — 0 sentences after splitting`);
        failed++;
        await ListeningSection.updateOne(
          { _id: section._id },
          { $set: { dictationSkippedAt: new Date(), dictationSkipReason: 'error: 0 sentences after splitting' } }
        ).catch(() => {});
        continue;
      }

      const res = await fetch(section.audioUrl);
      if (!res.ok) throw new Error(`audio download HTTP ${res.status}`);
      const audioBuffer = Buffer.from(await res.arrayBuffer());

      const asrWords = await transcribeWithWordTimestamps(audioBuffer, 'section.mp3');
      const aligned = alignSentences(sentences, asrWords);
      const { kept, dropped } = selectDictationSentences(aligned);

      if (kept.length < MIN_SECTION_SENTENCES) {
        rejected++;
        rejectedList.push({ title: section.title, issues: dropped });
        console.log(`${tag} REJECTED — only ${kept.length}/${aligned.length} usable sentence(s) (need >= ${MIN_SECTION_SENTENCES}):`);
        dropped.forEach(d => console.log(`    #${d.index} "${d.text}" — ${d.reason}`));
        await ListeningSection.updateOne(
          { _id: section._id },
          { $set: {
              dictationSkippedAt: new Date(),
              dictationSkipReason: `only ${kept.length}/${aligned.length} usable sentences: ` + dropped.map(d => `#${d.index} ${d.reason}`).join('; ').slice(0, 400),
            }
          }
        );
        continue;
      }

      await ListeningSection.updateOne(
        { _id: section._id },
        { $set: {
            dictationSentences: kept,
            dictationAlignedAt: new Date(),
            dictationSkippedAt: null,
            dictationSkipReason: '',
            dictationSkipPermanent: false,
          }
        }
      );
      console.log(`${tag} OK — ${kept.length}/${aligned.length} sentences kept (${dropped.length} dropped: Whisper-mismatched/spelled-out/short filler)`);
      ok++;
    } catch (err) {
      if (err.isRateLimited) {
        // Groq's free-tier cap is on SECONDS OF AUDIO PER DAY (ASPD, a
        // rolling 24h window), not per hour — confirmed from the real 429
        // body ("Limit 28800, Used 28432... on seconds of audio per day").
        // Every subsequent call fails identically until enough of the
        // window ages out. Stop here instead of burning through the
        // remaining items on guaranteed failures — this script is safe to
        // just re-run later (or after upgrading to Groq's Dev Tier) to pick
        // up where it left off.
        console.error(`${tag} STOPPED — Groq free-tier daily audio-seconds quota reached. Re-run this script later (rolling 24h window) or upgrade to Dev Tier at https://console.groq.com/settings/billing.`);
        break;
      }
      failed++;
      console.error(`${tag} FAIL: ${err.message}`);
      // isFileTooLarge (Groq 413) will fail identically forever — no
      // transcript/code fix can ever resolve it, so mark it permanent so
      // even --include-skipped leaves it alone. Other errors (network
      // blips, unexpected exceptions) might be transient or fixable, so
      // they only get the regular skip (still retried by --include-skipped).
      await ListeningSection.updateOne(
        { _id: section._id },
        { $set: {
            dictationSkippedAt: new Date(),
            dictationSkipReason: `error: ${err.message}`.slice(0, 500),
            dictationSkipPermanent: !!err.isFileTooLarge,
          }
        }
      ).catch(() => {});
    }
    if (i < sections.length - 1) await sleep(args.delay);
  }

  console.log(`\n[bulkAlign] Done. ${ok} accepted, ${rejected} rejected (too few usable sentences left after filtering), ${failed} errored, ${totalMissing - ok - rejected - failed} still pending.`);
  if (rejectedList.length) {
    console.log(`[bulkAlign] ${rejectedList.length} section(s) rejected — marked skipped, won't be retried by default (use --include-skipped or --force):`);
    rejectedList.forEach(r => console.log(`  - "${r.title}" (${r.issues.length} dropped sentence(s))`));
  }

  await mongoose.disconnect();
}

run().catch(e => { console.error('[bulkAlign] FAILED', e); process.exit(1); });
