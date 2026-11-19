// Full-test parts that have no stand-alone section of their own (no đề lẻ —
// e.g. Cam 20) never reached Luyện Dictation, which only lists sections.
// This cuts each such part out of the test's one recording and stores it as
// a DICTATION-ONLY ListeningSection (dictationOnly: true — hidden from the
// practice list, search and tips by utils/courseContent.js NOT_COURSE, shown
// only on the dictation page). Matching rule = listeningService.findPartAudios
// (title + part number), with gapFillSectionIdsFor's fallback (same opening
// 300 chars of transcript) — a part that already has a đề lẻ is skipped.
//
// Part boundaries come from the local ASR word cache of the test
// (scripts/data/transcriptAsr/t_<testId>.json, see alignTranscriptTiming.js):
// part N starts at the first "Part N" / "Section N" announcement after the
// last mention of part N-1 ("That is the end of part one … check your answers
// to part one"), and runs up to the next part's start — the part's own
// instructions + reading/checking pauses included, like a real đề lẻ file.
//
// Per new section it also writes the shifted ASR cache s_<id>.json and the
// shifted transcriptTiming, so the dictation step needs no new ASR:
//
//   node scripts/seedTestPartDictation.js                 # dry run: which parts, where they'd be cut
//   node scripts/seedTestPartDictation.js --apply         # cut → R2 → sections
//   node scripts/bulkAlignListeningDictation.js --local-asr --ids <ids printed above>
//   node scripts/seedTestPartDictation.js --tests "Cam 20"   # only tests whose name contains this
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const mongoose = require('mongoose');

const ASR_DIR = path.join(__dirname, 'data', 'transcriptAsr');
const WORK = process.env.TEST_PART_WORK || 'D:/tmp-testparts';
const NUM = { one: 1, two: 2, three: 3, four: 4, 1: 1, 2: 2, 3: 3, 4: 4 };
const LEAD = 0.3; // seconds of silence kept before the announcement

let ffPath;
const ffmpeg = () => ffPath || (ffPath = execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim());

// Every "Part N" / "Section N" mention in the ASR words: [{ n, s }]
function partMentions(words) {
  const out = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (!/^(part|section)$/i.test(words[i].w.replace(/[^a-z]/gi, ''))) continue;
    const n = NUM[words[i + 1].w.toLowerCase().replace(/[^a-z0-9]/g, '')];
    if (n) out.push({ n, s: words[i].s });
  }
  return out;
}

// [start, end) of parts 1..4 in seconds, or null when an announcement is missing
function partBounds(words, audioEnd) {
  const m = partMentions(words);
  const starts = [];
  let after = -1;
  for (let n = 1; n <= 4; n++) {
    const first = m.find((x) => x.n === n && x.s > after);
    if (!first) return null;
    starts.push(Math.max(0, first.s - LEAD));
    after = Math.max(...m.filter((x) => x.n === n).map((x) => x.s));
  }
  return starts.map((s, i) => [s, i < 3 ? starts[i + 1] : audioEnd]);
}

function shiftTiming(tt, encoded, start, end) {
  const t = tt.decodeTiming(encoded);
  if (!t) return '';
  return tt.encodeTiming(t.map((x) => (x && x[0] >= start && x[1] <= end ? [x[0] - start, x[1] - start] : null)));
}

async function download(url, file) {
  if (fs.existsSync(file)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`audio download HTTP ${res.status}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  const argv = process.argv.slice(2);
  const APPLY = argv.includes('--apply');
  const ti = argv.indexOf('--tests');
  const nameFilter = ti >= 0 ? argv[ti + 1] : null;

  const ListeningTest = require('../models/ListeningTest');
  const ListeningSection = require('../models/ListeningSection');
  const tt = require('../services/transcriptTimingService');
  const { uploadAudio } = require('../services/r2Service');

  await mongoose.connect(process.env.MONGO_URI);
  const tests = await ListeningTest.find({ isActive: true, audioUrl: { $nin: ['', null] } }).sort({ name: 1 }).lean();
  const txKey = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 300);
  const lone = await ListeningSection.find({ audioUrl: { $nin: ['', null] } }).select('title partNumber transcript').lean();
  const have = new Set(lone.map((s) => `${s.partNumber}|${s.title.toLowerCase()}`));
  const haveTx = new Set(lone.filter((s) => txKey(s.transcript)).map((s) => `${s.partNumber}|${txKey(s.transcript)}`));

  fs.mkdirSync(WORK, { recursive: true });
  const created = [];
  for (const test of tests) {
    if (nameFilter && !test.name.includes(nameFilter)) continue;
    const parts = (test.sections || []).filter((p) => txKey(p.transcript)
      && !have.has(`${p.partNumber}|${p.title.toLowerCase()}`) && !haveTx.has(`${p.partNumber}|${txKey(p.transcript)}`));
    if (!parts.length) continue;
    const asrFile = path.join(ASR_DIR, `t_${test._id}.json`);
    if (!fs.existsSync(asrFile)) { console.log(`${test.name}: no ASR cache t_${test._id}.json — run alignTranscriptTiming.js --export-jobs + asr_words.py`); continue; }
    const words = JSON.parse(fs.readFileSync(asrFile, 'utf8')).words || [];
    const audioEnd = test.audioDuration || (words.length ? words[words.length - 1].e + 1 : 0);
    const bounds = partBounds(words, audioEnd);
    if (!bounds) { console.log(`${test.name}: SKIP — "Part 1–4" announcements not all found in the ASR`); continue; }

    for (const p of parts) {
      const [start, end] = bounds[p.partNumber - 1];
      const tag = `${test.name} P${p.partNumber} "${p.title}" ${start.toFixed(1)}–${end.toFixed(1)}s`;
      if (!APPLY) { console.log(`${tag} (dry run)`); continue; }

      const src = path.join(WORK, `t_${test._id}.mp3`);
      await download(test.audioUrl, src);
      const out = path.join(WORK, `t_${test._id}_p${p.partNumber}.mp3`);
      execFileSync(ffmpeg(), ['-y', '-loglevel', 'error', '-ss', start.toFixed(2), '-to', end.toFixed(2), '-i', src,
        '-vn', '-ac', '1', '-ar', '44100', '-b:a', '64k', out]);
      const up = await uploadAudio(out, { folder: 'listening-sections', public_id: `testpart_${test._id}_p${p.partNumber}_${Date.now()}` });

      const timing = shiftTiming(tt, p.transcriptTiming, start, end);
      const doc = await ListeningSection.create({
        partNumber: p.partNumber,
        title: p.title,
        description: p.description || '',
        transcript: p.transcript,
        transcriptTiming: timing,
        transcriptTimingAt: timing ? new Date() : null,
        questionRange: p.questionRange,
        questionGroups: p.questionGroups,
        audioUrl: up.secure_url,
        audioFileName: `${test.name} – Part ${p.partNumber}.mp3`,
        audioDuration: Math.round(up.duration || end - start),
        isActualTest: true,
        dictationOnly: true,
        isActive: true,
      });
      // The section's own word cache, for bulkAlignListeningDictation --local-asr
      const own = words.filter((w) => w.s >= start && w.e <= end)
        .map((w) => ({ ...w, s: Math.round((w.s - start) * 100) / 100, e: Math.round((w.e - start) * 100) / 100 }));
      fs.writeFileSync(path.join(ASR_DIR, `s_${doc._id}.json`), JSON.stringify({ words: own }));
      created.push(String(doc._id));
      console.log(`${tag} → ${doc._id} ${up.secure_url}`);
    }
  }
  if (APPLY) {
    console.log(`\n${created.length} section(s) created.`);
    if (created.length) console.log(`next: node scripts/bulkAlignListeningDictation.js --local-asr --ids ${created.join(',')}`);
  } else console.log('\ndry run — add --apply');
  await mongoose.disconnect();
}

if (require.main === module) main().catch((e) => { console.error('✗', e); process.exit(1); });

module.exports = { partBounds, partMentions };
