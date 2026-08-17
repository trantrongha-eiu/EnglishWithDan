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
// timestamps, and — only if EVERY sentence passes strict validation (100%
// word match + a plausible speech rate, see validateAlignment()) — saves
// the result. A section that fails validation is never saved as-is, rather
// than shipping a partially-broken practice unit — see dictationSkippedAt
// below. Safe to re-run: the default filter only picks up sections that are
// still genuinely untried, so an interrupted run can just be run again to
// pick up where it left off.
//
// A section that fails (rejected by validateAlignment, or a permanent error
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
//   node backend/scripts/bulkAlignListeningDictation.js --include-skipped # also retry previously-skipped sections (e.g. after a transcript/code fix)
//   node backend/scripts/bulkAlignListeningDictation.js --force          # re-align EVERYTHING, including already-successful sections
//   node backend/scripts/bulkAlignListeningDictation.js --delay 2000     # ms between sections (default 1500)
'use strict';

require('dotenv').config();

function parseArgs(argv) {
  const args = { limit: Infinity, force: false, delay: 1500, includeSkipped: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit') args.limit = parseInt(argv[++i], 10) || Infinity;
    else if (argv[i] === '--force') args.force = true;
    else if (argv[i] === '--delay') args.delay = parseInt(argv[++i], 10) || 1500;
    else if (argv[i] === '--include-skipped') args.includeSkipped = true;
  }
  return args;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function run() {
  const mongoose = require('mongoose');
  const ListeningSection = require('../models/ListeningSection');
  const { splitTranscriptIntoSentences } = require('../services/listeningTranscriptSplitter');
  const { transcribeWithWordTimestamps, alignSentences, validateAlignment } = require('../services/listeningAlignmentService');

  const args = parseArgs(process.argv.slice(2));

  await mongoose.connect(process.env.MONGO_URI);

  const filter = { transcript: { $ne: '' }, audioUrl: { $ne: '' } };
  // Existing docs predate this field entirely (no retroactive default on
  // already-saved documents), so "not yet aligned" means EITHER the field
  // is missing outright OR it's an empty array — $size:0 alone only
  // matches the second case and silently skipped every real document.
  if (!args.force) {
    filter.$or = [{ dictationSentences: { $exists: false } }, { dictationSentences: { $size: 0 } }];
    // { field: null } matches both "missing" and "explicitly null" in
    // Mongo, so this works uniformly for pre-existing docs too.
    if (!args.includeSkipped) filter.dictationSkippedAt = null;
  }

  const totalMissing = await ListeningSection.countDocuments(filter);
  const sections = await ListeningSection.find(filter).select('title audioUrl audioDuration transcript').limit(args.limit).lean();

  console.log(`[bulkAlign] ${totalMissing} section(s) need alignment; processing ${sections.length} this run.`);

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
      const { valid, issues } = validateAlignment(aligned);

      if (!valid) {
        rejected++;
        rejectedList.push({ title: section.title, issues });
        console.log(`${tag} REJECTED — ${issues.length}/${aligned.length} sentence(s) failed strict validation:`);
        issues.forEach(iss => console.log(`    #${iss.index} "${iss.text}" — ${iss.reason}`));
        await ListeningSection.updateOne(
          { _id: section._id },
          { $set: {
              dictationSkippedAt: new Date(),
              dictationSkipReason: issues.map(iss => `#${iss.index} ${iss.reason}`).join('; ').slice(0, 500),
            }
          }
        );
        continue;
      }

      await ListeningSection.updateOne(
        { _id: section._id },
        { $set: {
            dictationSentences: aligned.map(a => ({ text: a.text, start: a.start, end: a.end })),
            dictationAlignedAt: new Date(),
            dictationSkippedAt: null,
            dictationSkipReason: '',
          }
        }
      );
      console.log(`${tag} OK — ${aligned.length} sentences, 100% verified (every word matched, plausible timing)`);
      ok++;
    } catch (err) {
      if (err.isRateLimited) {
        // Groq's free-tier "seconds of audio per hour" cap has been hit —
        // every subsequent call will fail identically until the rolling
        // hourly window frees up (the ~11.5 hours of total audio across all
        // 99 sections is far more than one hour's 7200s/2h allowance, so
        // waiting out a single item's retry window doesn't help the rest).
        // Stop here instead of burning through the remaining items on
        // guaranteed failures — this script is safe to just re-run later
        // (or after upgrading to Groq's Dev Tier) to pick up where it left off.
        console.error(`${tag} STOPPED — Groq free-tier audio/hour quota reached. Re-run this script later (rolling hourly limit) or upgrade to Dev Tier at https://console.groq.com/settings/billing.`);
        break;
      }
      failed++;
      console.error(`${tag} FAIL: ${err.message}`);
      // Permanent errors (e.g. Groq's 413 "file too large") will fail
      // identically every time — skip on future default runs rather than
      // re-attempting a doomed call each hour.
      await ListeningSection.updateOne(
        { _id: section._id },
        { $set: { dictationSkippedAt: new Date(), dictationSkipReason: `error: ${err.message}`.slice(0, 500) } }
      ).catch(() => {});
    }
    if (i < sections.length - 1) await sleep(args.delay);
  }

  console.log(`\n[bulkAlign] Done. ${ok} accepted, ${rejected} rejected (failed strict validation), ${failed} errored, ${totalMissing - ok - rejected - failed} still pending.`);
  if (rejectedList.length) {
    console.log(`[bulkAlign] ${rejectedList.length} section(s) rejected — marked skipped, won't be retried by default (use --include-skipped or --force):`);
    rejectedList.forEach(r => console.log(`  - "${r.title}" (${r.issues.length} bad sentence(s))`));
  }

  await mongoose.disconnect();
}

run().catch(e => { console.error('[bulkAlign] FAILED', e); process.exit(1); });
