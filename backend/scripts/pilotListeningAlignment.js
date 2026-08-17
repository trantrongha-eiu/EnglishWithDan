// One-off PILOT script — does NOT write anything to the database. Picks a
// handful of real standalone ListeningSection docs (single dedicated audio
// file per doc, so no chunking needed — the simple case), runs the
// transcript-splitter + Groq Whisper alignment pipeline end to end, and
// prints the resulting sentence timestamps + match-quality stats so the
// alignment approach can be sanity-checked against real content before
// committing to a schema change + bulk rollout across all ~179 candidate
// units + building the dictation UI.
//
// Run: node backend/scripts/pilotListeningAlignment.js [--limit 3]
'use strict';

require('dotenv').config();

function parseArgs(argv) {
  const args = { limit: 3 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit') args.limit = parseInt(argv[++i], 10) || 3;
  }
  return args;
}

async function run() {
  const mongoose = require('mongoose');
  const ListeningSection = require('../models/ListeningSection');
  const { splitTranscriptIntoSentences } = require('../services/listeningTranscriptSplitter');
  const { transcribeWithWordTimestamps, alignSentences } = require('../services/listeningAlignmentService');

  const args = parseArgs(process.argv.slice(2));

  await mongoose.connect(process.env.MONGO_URI);

  const candidates = await ListeningSection.find({
    transcript: { $ne: '' },
    audioUrl: { $ne: '' },
  }).select('title partNumber audioUrl audioDuration transcript').limit(args.limit).lean();

  console.log(`[pilot] ${candidates.length} candidate section(s) picked (limit ${args.limit})\n`);

  for (const section of candidates) {
    console.log('═'.repeat(70));
    console.log(`[pilot] "${section.title}" (Part ${section.partNumber}) — audioDuration=${section.audioDuration}s`);

    const sentences = splitTranscriptIntoSentences(section.transcript);
    console.log(`[pilot] split into ${sentences.length} sentences`);
    if (sentences.length === 0) {
      console.log('[pilot] SKIP — splitter produced 0 sentences, check transcript format');
      continue;
    }

    let audioBuffer;
    try {
      const res = await fetch(section.audioUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      audioBuffer = Buffer.from(await res.arrayBuffer());
      console.log(`[pilot] downloaded audio: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    } catch (err) {
      console.log(`[pilot] SKIP — failed to download audio: ${err.message}`);
      continue;
    }

    let asrWords;
    try {
      const t0 = Date.now();
      asrWords = await transcribeWithWordTimestamps(audioBuffer, 'section.mp3');
      console.log(`[pilot] Groq transcription: ${asrWords.length} words, ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    } catch (err) {
      console.log(`[pilot] SKIP — Groq transcription failed: ${err.message}`);
      continue;
    }

    const aligned = alignSentences(sentences, asrWords);

    let totalMatched = 0, totalWords = 0, fullyUnmatched = 0;
    aligned.forEach(a => { totalMatched += a.matchedWords; totalWords += a.totalWords; if (a.matchedWords === 0) fullyUnmatched++; });
    const matchRate = totalWords > 0 ? (100 * totalMatched / totalWords).toFixed(1) : '0.0';

    // Monotonicity check — every start should be >= previous end (allowing
    // tiny overlap from ASR word-boundary noise), and the last end should be
    // reasonably close to the section's own audioDuration.
    let monotonic = true;
    for (let i = 1; i < aligned.length; i++) {
      if (aligned[i].start < aligned[i - 1].start) { monotonic = false; break; }
    }
    const lastEnd = aligned[aligned.length - 1]?.end || 0;

    console.log(`[pilot] word match rate: ${matchRate}% (${totalMatched}/${totalWords}), ${fullyUnmatched} sentence(s) fully unmatched (interpolated)`);
    console.log(`[pilot] monotonic timestamps: ${monotonic}, last sentence ends at ${lastEnd.toFixed(1)}s vs audioDuration ${section.audioDuration}s`);
    console.log('[pilot] first 5 sentences:');
    aligned.slice(0, 5).forEach((a, i) => {
      console.log(`  ${i + 1}. [${a.start.toFixed(2)}s - ${a.end.toFixed(2)}s] (${a.matchedWords}/${a.totalWords} words matched) "${a.text}"`);
    });
    console.log('[pilot] last 3 sentences:');
    aligned.slice(-3).forEach((a, i) => {
      console.log(`  ${aligned.length - 3 + i + 1}. [${a.start.toFixed(2)}s - ${a.end.toFixed(2)}s] (${a.matchedWords}/${a.totalWords} words matched) "${a.text}"`);
    });
    console.log('');
  }

  await mongoose.disconnect();
}

run().catch(e => { console.error('[pilot] FAILED', e); process.exit(1); });
