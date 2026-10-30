// Word-level timing for Listening transcripts — drives the "highlight what
// the speaker is saying" sync on the Gap-fill screen, the bài lẻ review /
// history and the full-test review.
//
// Two steps (the slow one is local, no API quota):
//   1. node backend/scripts/alignTranscriptTiming.js --export-jobs
//        → scripts/data/transcriptAsr/_jobs.json (every section + full test
//          audio that has no cached ASR yet; bài lẻ first)
//      py backend/scripts/transcriptTiming/asr_words.py
//        → scripts/data/transcriptAsr/<key>.json  (faster-whisper word times)
//   2. node backend/scripts/alignTranscriptTiming.js [--force] [--dry]
//        aligns each verified transcript against its cached ASR words
//        (transcriptTimingService) and saves `transcriptTiming` — sections
//        and full tests whose cache file exists; already-timed ones are
//        skipped unless --force. A full test's 4 parts share one audio, so
//        their transcripts are aligned as one stream and split back.
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');
const ListeningTest = require('../models/ListeningTest');
const { alignTranscripts, encodeTiming, timingQuality } = require('../services/transcriptTimingService');

const CACHE = path.join(__dirname, 'data', 'transcriptAsr');
const args = process.argv.slice(2);
const has = f => args.includes(f);

function loadAsr(key) {
  const f = path.join(CACHE, key + '.json');
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8')).words || [];
}

// Below this share of exactly-matched spoken words the alignment is not
// trusted (wrong audio for the transcript, heavy edits…) — nothing is saved.
const MIN_MATCH = 0.6;

async function exportJobs() {
  fs.mkdirSync(CACHE, { recursive: true });
  const secs = await ListeningSection.find({ audioUrl: { $ne: '' }, transcript: { $ne: '' } })
    .select('audioUrl gapFillPublished').sort({ gapFillPublished: -1, _id: 1 }).lean();
  const tests = await ListeningTest.find({ audioUrl: { $ne: '' } }).select('audioUrl').sort({ _id: 1 }).lean();
  const jobs = [
    ...secs.map(s => ({ key: `s_${s._id}`, url: s.audioUrl })),
    ...tests.map(t => ({ key: `t_${t._id}`, url: t.audioUrl })),
  ].filter(j => !fs.existsSync(path.join(CACHE, j.key + '.json')));
  fs.writeFileSync(path.join(CACHE, '_jobs.json'), JSON.stringify(jobs, null, 1));
  console.log(`${jobs.length} job(s) written to ${path.join(CACHE, '_jobs.json')}`);
}

async function align() {
  const force = has('--force'), dry = has('--dry');
  let ok = 0, low = 0, missing = 0, skipped = 0;
  const lowList = [];

  const secs = await ListeningSection.find({ transcript: { $ne: '' } }).select('title transcript transcriptTiming').lean();
  for (const s of secs) {
    if (s.transcriptTiming && !force) { skipped++; continue; }
    const words = loadAsr(`s_${s._id}`);
    if (!words) { missing++; continue; }
    const [timing] = alignTranscripts([s.transcript], words);
    const q = timingQuality(timing);
    if (q.match < MIN_MATCH) { low++; lowList.push(`section ${s._id} "${s.title}" match ${(q.match * 100).toFixed(0)}%`); continue; }
    if (!dry) await ListeningSection.updateOne({ _id: s._id }, { $set: { transcriptTiming: encodeTiming(timing), transcriptTimingAt: new Date() } });
    ok++;
  }

  const tests = await ListeningTest.find({}).select('name sections._id sections.partNumber sections.transcript sections.transcriptTiming').lean();
  for (const t of tests) {
    const parts = (t.sections || []).slice().sort((a, b) => a.partNumber - b.partNumber);
    if (!parts.some(p => p.transcript)) continue;
    if (parts.every(p => !p.transcript || p.transcriptTiming) && !force) { skipped++; continue; }
    const words = loadAsr(`t_${t._id}`);
    if (!words) { missing++; continue; }
    const timings = alignTranscripts(parts.map(p => p.transcript || ''), words);
    const set = {};
    const notes = [];
    parts.forEach((p, i) => {
      if (!p.transcript) return;
      const q = timingQuality(timings[i]);
      if (q.match < MIN_MATCH) { notes.push(`P${p.partNumber} ${(q.match * 100).toFixed(0)}%`); return; }
      const idx = t.sections.findIndex(x => String(x._id) === String(p._id));
      set[`sections.${idx}.transcriptTiming`] = encodeTiming(timings[i]);
    });
    if (notes.length) { low++; lowList.push(`test ${t._id} "${t.name}" low parts: ${notes.join(', ')}`); }
    if (Object.keys(set).length) {
      set.transcriptTimingAt = new Date();
      if (!dry) await ListeningTest.updateOne({ _id: t._id }, { $set: set });
      ok++;
    }
  }

  console.log(`saved ${ok}, low-match ${low}, no ASR cache yet ${missing}, already timed ${skipped}${dry ? ' (dry run)' : ''}`);
  lowList.forEach(l => console.log('  low:', l));
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    if (has('--export-jobs')) await exportJobs();
    else await align();
  } finally {
    await mongoose.disconnect();
  }
})().catch(e => { console.error(e); process.exit(1); });
