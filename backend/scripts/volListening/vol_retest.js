// Re-point an existing full Listening test to the 4 sections of a vol spec — for a test rebuilt from an updated source
// (2026-10-30: "Vol 1 - Test 5" from Vol 7's "đề update" folder, spec specs/vol1u_t5.js). Same checks and audio join as
// vol_full_tests.js (parts 1–4 in order, Q1–40, audio + explanations), then the test document keeps its _id / name /
// isActive and gets the new sections, the joined audio and no transcript timing (re-run alignTranscriptTiming.js).
// The old document is backed up to web/vol<V>/backup/test_<id>_<time>.json; the update is conditional on updatedAt.
//   node vol_retest.js <vol> <T> "<test name>" [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const mongoose = require('mongoose');
const ListeningSection = require('../../models/ListeningSection');
const { uploadAudio } = require('../../services/r2Service');
const { durationOf } = require('./vol_media');

const args = process.argv.slice(2), apply = args.includes('--apply');
const [VOL, T, NAME] = args.filter(a => !a.startsWith('--'));
const W = f => path.join(__dirname, 'web', `vol${VOL}`, f);
const ffmpeg = () => execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  try {
    const spec = require(`./specs/vol${VOL}_t${T}.js`);
    const imported = JSON.parse(fs.readFileSync(W('imported.json'), 'utf8'));
    const ids = [1, 2, 3, 4].map(p => { const s = spec.sections.find(x => x.part === p); return s && (s.reuse || imported[`t${T}p${p}`]); });
    const test = await db.collection('listeningtests').findOne({ name: NAME });
    if (!test) throw new Error(`no test "${NAME}"`);
    const attempts = await db.collection('listeningattempts').countDocuments({ testId: test._id });
    console.log(`${NAME} [${test._id}] active=${test.isActive} attempts=${attempts}`);
    console.log(`  old: ${test.sections.map(s => s.title).join(' / ')}`);
    if (ids.some(x => !x)) throw new Error(`missing part(s) ${ids.map((x, i) => x ? '' : 'P' + (i + 1)).join(' ')}`);
    const secs = await ListeningSection.find({ _id: { $in: ids } }).lean();
    const ordered = ids.map(id => secs.find(s => String(s._id) === String(id)));
    const problems = [];
    ordered.forEach((s, i) => {
      if (!s) return problems.push(`P${i + 1} missing`);
      if (!s.isActive) problems.push(`P${i + 1} inactive`);
      if (s.partNumber !== i + 1) problems.push(`P${i + 1} is part ${s.partNumber}`);
      const nums = s.questionGroups.flatMap(g => g.questions.map(q => q.questionNumber)).sort((a, b) => a - b);
      if (nums.join() !== Array.from({ length: 10 }, (_, k) => i * 10 + 1 + k).join()) problems.push(`P${i + 1} questions ${nums.join(',')}`);
      if (!s.audioUrl) problems.push(`P${i + 1} no audio`);
      if (s.questionGroups.some(g => g.questions.some(q => !String(q.explanation || '').trim()))) problems.push(`P${i + 1} explanation missing`);
    });
    const total = ordered.reduce((n, s) => n + ((s && s.audioDuration) || 0), 0);
    console.log(`  new: ${ordered.map(s => s && s.title).join(' / ')} (~${Math.round(total / 60)} min)`);
    if (problems.length) { console.log(`  ✗ ${problems.join('; ')}`); process.exitCode = 1; return; }
    if (!apply) return console.log('dry run — re-run with --apply');

    // audio: the 4 section mp3s joined (re-encoded, as vol_full_tests.js)
    const tmp = W('fulltest_audio'); fs.mkdirSync(tmp, { recursive: true });
    const file = `vol${VOL}-test${T}-full.mp3`, ff = ffmpeg(), parts = [];
    for (const [i, s] of ordered.entries()) {
      const f = path.join(tmp, `${file}.p${i + 1}.mp3`);
      if (!fs.existsSync(f)) fs.writeFileSync(f, Buffer.from(await (await fetch(s.audioUrl)).arrayBuffer()));
      parts.push(f);
    }
    const out = path.join(tmp, file);
    execFileSync(ff, ['-y', '-loglevel', 'error', ...parts.flatMap(f => ['-i', f]),
      '-filter_complex', parts.map((_, i) => `[${i}:a]`).join('') + `concat=n=${parts.length}:v=0:a=1[a]`,
      '-map', '[a]', '-ac', '1', '-ar', '44100', '-b:a', '64k', out]);
    const dur = durationOf(out);
    if (Math.abs(dur - total) > 5) throw new Error(`joined audio ${dur}s vs sections ${total}s`);

    const bdir = W('backup'); fs.mkdirSync(bdir, { recursive: true });
    fs.writeFileSync(path.join(bdir, `test_${test._id}_${Date.now()}.json`), JSON.stringify(test, null, 1));
    const sections = ordered.map(src => ({
      _id: new mongoose.Types.ObjectId(),
      partNumber: src.partNumber, title: src.title, description: src.description || '', transcript: src.transcript || '',
      transcriptTiming: '', questionRange: src.questionRange,
      questionGroups: src.questionGroups.map(({ _id, ...g }) => ({ ...g, _id: new mongoose.Types.ObjectId(),
        questions: g.questions.map(({ _id: _q, ...q }) => ({ ...q, _id: new mongoose.Types.ObjectId() })) })),
    }));
    const up = await uploadAudio(out, { folder: 'listening', public_id: `listening_${test._id}_${Date.now()}` });
    const r = await db.collection('listeningtests').updateOne({ _id: test._id, updatedAt: test.updatedAt }, { $set: {
      sections, audioUrl: up.secure_url, audioFileName: file, audioDuration: dur, transcriptTimingAt: null, updatedAt: new Date() } });
    console.log(r.modifiedCount ? `  ✓ updated, audio ${dur}s ${(fs.statSync(out).size / 1e6).toFixed(1)}MB` : '  ✗ not updated (changed meanwhile?)');
  } finally { await mongoose.disconnect(); }
})().catch(e => { console.error(e); process.exit(1); });
