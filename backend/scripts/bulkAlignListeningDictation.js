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
//   node backend/scripts/bulkAlignListeningDictation.js --local-asr      # use the local faster-whisper word cache
//                                                                        # (scripts/data/transcriptAsr/s_<id>.json, built for transcript sync) instead of
//                                                                        # Groq — no API quota, and no 25MB cap so "file too large" sections become eligible
//   node backend/scripts/bulkAlignListeningDictation.js --parts 2,3,4    # only these IELTS parts
//   node backend/scripts/bulkAlignListeningDictation.js --ids id1,id2    # re-align ONLY these specific _ids (always force-mode for exactly this set — for
//                                                                        # targeted re-fixes, e.g. sections whose transcript was edited after their last
//                                                                        # alignment and drifted out of sync, without re-touching the rest of the catalogue)
'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { limit: Infinity, force: false, delay: 1500, includeSkipped: false, ids: null, localAsr: false, parts: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit') args.limit = parseInt(argv[++i], 10) || Infinity;
    else if (argv[i] === '--force') args.force = true;
    else if (argv[i] === '--delay') args.delay = parseInt(argv[++i], 10) || 1500;
    else if (argv[i] === '--include-skipped') args.includeSkipped = true;
    else if (argv[i] === '--local-asr') args.localAsr = true;
    else if (argv[i] === '--parts') args.parts = argv[++i].split(',').map(Number).filter(Boolean);
    else if (argv[i] === '--ids') args.ids = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
  }
  return args;
}

// Local base.en word timestamps end a sentence ~0.4s earlier than Groq's
// (median, measured 2026-11-17 on the 92 Groq-aligned sections) — played
// raw, the clip would clip the last word. Pad each unit out into the
// surrounding silence only: never past the next / before the previous
// spoken ASR word, so no neighbouring speech leaks in. Brings the median
// end within ~0.1s of Groq's.
function padUnitsIntoSilence(units, asrWords, endPad = 0.4, startPad = 0.15) {
  const r2 = n => Math.round(n * 100) / 100;
  return units.map(u => {
    let prevEnd = 0, nextStart = Infinity;
    for (const w of asrWords) {
      if (w.end <= u.start + 0.01) prevEnd = Math.max(prevEnd, w.end);
      if (w.start >= u.end - 0.01 && w.start < nextStart) nextStart = w.start;
    }
    return {
      ...u,
      start: r2(Math.max(u.start - startPad, prevEnd, 0)),
      end: r2(Math.max(u.end, Math.min(u.end + endPad, nextStart))),
    };
  });
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function run() {
  const mongoose = require('mongoose');
  const ListeningSection = require('../models/ListeningSection');
  const { NOT_COURSE } = require('../utils/courseContent');
  const { splitTranscriptIntoSentences, normalizeDictationUnits } = require('../services/listeningTranscriptSplitter');
  const { transcribeWithWordTimestamps, alignSentences, selectDictationSentences } = require('../services/listeningAlignmentService');
  const { dropNameHeavySentences, buildLexicon } = require('../services/dictationNameFilter');

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
    if (args.localAsr) {
      // Local ASR has no upload-size cap, so the "permanent" Groq 413
      // failures are retryable here; content rejections still need
      // --include-skipped.
      if (!args.includeSkipped) filter.$and = [{ $or: [{ dictationSkippedAt: null }, { dictationSkipPermanent: true }] }];
    } else if (!args.includeSkipped) filter.dictationSkippedAt = null;
    else filter.dictationSkipPermanent = { $ne: true };
  }
  if (args.parts) filter.partNumber = { $in: args.parts };
  // Course-only sections (giáo trình audio) stay out of the public
  // dictation list, same as the practice catalogue — only --ids reaches them.
  if (!args.ids) Object.assign(filter, NOT_COURSE);
  if (args.localAsr) args.delay = 0;

  const totalMissing = await ListeningSection.countDocuments(filter);
  const sections = await ListeningSection.find(filter).select('title audioUrl audioDuration transcript').limit(args.limit).lean();

  console.log(`[bulkAlign] ${totalMissing} section(s) need alignment; processing ${sections.length} this run.`);

  // A section kept fewer usable sentences than this isn't worth having as a
  // dictation practice unit at all — skip it outright rather than saving a
  // near-empty exercise.
  const MIN_SECTION_SENTENCES = 5;

  let ok = 0, rejected = 0, failed = 0, noCache = 0;
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

      let asrWords;
      if (args.localAsr) {
        const cacheFile = path.join(__dirname, 'data', 'transcriptAsr', `s_${section._id}.json`);
        if (!fs.existsSync(cacheFile)) {
          // Not an alignment failure — just not transcribed locally yet.
          // Leave it untouched (no skip mark) so a later run picks it up.
          console.log(`${tag} NO LOCAL ASR — run alignTranscriptTiming.js --export-jobs + asr_words.py first`);
          noCache++;
          continue;
        }
        asrWords = (JSON.parse(fs.readFileSync(cacheFile, 'utf8')).words || [])
          .map(w => ({ word: w.w, start: w.s, end: w.e }));
      } else {
        const res = await fetch(section.audioUrl);
        if (!res.ok) throw new Error(`audio download HTTP ${res.status}`);
        const audioBuffer = Buffer.from(await res.arrayBuffer());
        asrWords = await transcribeWithWordTimestamps(audioBuffer, 'section.mp3');
      }
      const aligned = alignSentences(sentences, asrWords);
      const sel = selectDictationSentences(aligned);
      const dropped = sel.dropped;
      // Remove sentences built around an unspellable proper name / a name
      // spelled out letter by letter — a dictation exercise grades exact
      // spelling, and there's no way to get "Wivenhoe" or "J-A-M-I-E-S-O-N"
      // from the audio. Lexicon from this section's own transcript so a word
      // it uses in lowercase still counts as spellable.
      const nameLex = buildLexicon(sentences);
      const nf = dropNameHeavySentences(sel.kept, nameLex);
      nf.dropped.forEach(d => dropped.push({ index: -1, text: d.text, reason: d.reason }));
      // Then: keep whole sentences, but a sentence running well over ~9s is
      // broken at a strong internal boundary (semicolon / dash / comma-
      // before-a-new-clause) so no piece is left mid-thought; sub-second
      // stubs are folded away (normalizeDictationUnits). Both run AFTER
      // selectDictationSentences so its MIN_DICTATION_WORDS / words-per-
      // second gates judge real aligned sentences, not fragments.
      let kept = normalizeDictationUnits(nf.kept, { maxSec: 9 });
      if (args.localAsr) kept = padUnitsIntoSilence(kept, asrWords);

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

  console.log(`\n[bulkAlign] Done. ${ok} accepted, ${rejected} rejected (too few usable sentences left after filtering), ${failed} errored, ${noCache} without local ASR, ${totalMissing - ok - rejected - failed - noCache} still pending.`);
  if (rejectedList.length) {
    console.log(`[bulkAlign] ${rejectedList.length} section(s) rejected — marked skipped, won't be retried by default (use --include-skipped or --force):`);
    rejectedList.forEach(r => console.log(`  - "${r.title}" (${r.issues.length} dropped sentence(s))`));
  }

  await mongoose.disconnect();
}

run().catch(e => { console.error('[bulkAlign] FAILED', e); process.exit(1); });
