// Bulk sentence-level forced-alignment for Listening dictation practice —
// scoped to standalone ListeningSection docs only ("bài lẻ"), each of which
// has its own dedicated audio file small enough for a single Groq Whisper
// call (unlike ListeningTest, where all 4 parts share one ~30-40 MB audio
// file that would need chunking — deliberately out of scope here).
//
// For every ListeningSection with a non-empty transcript + audioUrl and no
// dictationSentences yet, this: splits the transcript into sentences
// (listeningTranscriptSplitter), transcribes the audio via Groq Whisper
// with word-level timestamps (listeningAlignmentService), aligns the known
// sentences against those timestamps, and saves the result. Safe to re-run:
// only processes sections where dictationSentences is still empty, so an
// interrupted run can just be run again to pick up where it left off.
//
// Usage:
//   node backend/scripts/bulkAlignListeningDictation.js               # all missing
//   node backend/scripts/bulkAlignListeningDictation.js --limit 20    # cap this run
//   node backend/scripts/bulkAlignListeningDictation.js --force       # re-align even if already done
//   node backend/scripts/bulkAlignListeningDictation.js --delay 2000  # ms between sections (default 1500)
'use strict';

require('dotenv').config();

function parseArgs(argv) {
  const args = { limit: Infinity, force: false, delay: 1500 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit') args.limit = parseInt(argv[++i], 10) || Infinity;
    else if (argv[i] === '--force') args.force = true;
    else if (argv[i] === '--delay') args.delay = parseInt(argv[++i], 10) || 1500;
  }
  return args;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// A section is flagged for manual review (logged, not blocked) if the
// overall word-match rate against the ASR is suspiciously low — usually
// means the transcript text doesn't actually match this audio file (wrong
// pairing) rather than an alignment-algorithm problem.
const REVIEW_THRESHOLD = 0.85;

async function run() {
  const mongoose = require('mongoose');
  const ListeningSection = require('../models/ListeningSection');
  const { splitTranscriptIntoSentences } = require('../services/listeningTranscriptSplitter');
  const { transcribeWithWordTimestamps, alignSentences } = require('../services/listeningAlignmentService');

  const args = parseArgs(process.argv.slice(2));

  await mongoose.connect(process.env.MONGO_URI);

  const filter = { transcript: { $ne: '' }, audioUrl: { $ne: '' } };
  // Existing docs predate this field entirely (no retroactive default on
  // already-saved documents), so "not yet aligned" means EITHER the field
  // is missing outright OR it's an empty array — $size:0 alone only
  // matches the second case and silently skipped every real document.
  if (!args.force) {
    filter.$or = [{ dictationSentences: { $exists: false } }, { dictationSentences: { $size: 0 } }];
  }

  const totalMissing = await ListeningSection.countDocuments(filter);
  const sections = await ListeningSection.find(filter).select('title audioUrl audioDuration transcript').limit(args.limit).lean();

  console.log(`[bulkAlign] ${totalMissing} section(s) need alignment; processing ${sections.length} this run.`);

  let ok = 0, failed = 0, needsReview = [];
  for (const [i, section] of sections.entries()) {
    const tag = `[${i + 1}/${sections.length}] "${section.title}"`;
    try {
      const sentences = splitTranscriptIntoSentences(section.transcript);
      if (sentences.length === 0) {
        console.log(`${tag} SKIP — 0 sentences after splitting`);
        failed++;
        continue;
      }

      const res = await fetch(section.audioUrl);
      if (!res.ok) throw new Error(`audio download HTTP ${res.status}`);
      const audioBuffer = Buffer.from(await res.arrayBuffer());

      const asrWords = await transcribeWithWordTimestamps(audioBuffer, 'section.mp3');
      const aligned = alignSentences(sentences, asrWords);

      let matched = 0, total = 0;
      aligned.forEach(a => { matched += a.matchedWords; total += a.totalWords; });
      const matchRate = total > 0 ? matched / total : 0;

      await ListeningSection.updateOne(
        { _id: section._id },
        { $set: {
            dictationSentences: aligned.map(a => ({ text: a.text, start: a.start, end: a.end })),
            dictationAlignedAt: new Date(),
          }
        }
      );

      if (matchRate < REVIEW_THRESHOLD) {
        needsReview.push({ title: section.title, matchRate });
        console.log(`${tag} OK but LOW MATCH RATE ${(matchRate * 100).toFixed(1)}% — flagged for review`);
      } else {
        console.log(`${tag} OK — ${aligned.length} sentences, ${(matchRate * 100).toFixed(1)}% word match`);
      }
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
    }
    if (i < sections.length - 1) await sleep(args.delay);
  }

  console.log(`\n[bulkAlign] Done. ${ok} aligned, ${failed} failed, ${totalMissing - ok} still missing.`);
  if (needsReview.length) {
    console.log(`[bulkAlign] ${needsReview.length} section(s) flagged for manual review (match rate < ${REVIEW_THRESHOLD * 100}%):`);
    needsReview.forEach(r => console.log(`  - "${r.title}": ${(r.matchRate * 100).toFixed(1)}%`));
  }

  await mongoose.disconnect();
}

run().catch(e => { console.error('[bulkAlign] FAILED', e); process.exit(1); });
