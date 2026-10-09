// Build full Listening tests from đề lẻ that are not yet part of any full test (web/orphans.json from
// orphan_sections.js). Sections are copied the way admin "assemble test" does (listeningService.assembleTest:
// questionGroups without _id), the 4 section mp3s are joined into one test audio (ffmpeg concat → 64k mono mp3,
// like the other full tests) and uploaded to Cloudinary listening/listening_<testId>_<ts>. Created HIDDEN;
// activate after checking:  node build_full_tests.js --activate
//   node build_full_tests.js            dry run: plan + numbering checks
//   node build_full_tests.js --apply    build (skips a test whose name already exists)
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const ListeningSection = require('../../models/ListeningSection');
const ListeningTest = require('../../models/ListeningTest');
const W = f => path.join(__dirname, 'web', f);
const apply = process.argv.includes('--apply'), activate = process.argv.includes('--activate');

// Complete Cambridge tests (all 4 sections imported) keep their book/test name; the rest continue "Actual Test N".
const orphans = JSON.parse(fs.readFileSync(W('orphans.json'), 'utf8'));
const camPlan = [];
const byTest = {};
for (const o of orphans) if (o.src && o.src.book) (byTest[`${o.src.book}-${o.src.test}`] ||= []).push(o);
for (const [k, list] of Object.entries(byTest).sort((a, b) => a[0].localeCompare(b[0], 'en', { numeric: true }))) {
  const [book, test] = k.split('-').map(Number);
  const parts = [1, 2, 3, 4].map(p => list.find(o => o.src.section === p));
  if (parts.every(Boolean)) camPlan.push({ name: `Cam ${book} - Test ${test}`, seriesName: `Cam ${book}`, testNumber: test, file: `cam${book}-test${test}-full.mp3`, ids: parts.map(o => o._id) });
}
const byTitle = t => orphans.find(o => o.title === t)._id;
const PLAN = [
  ...camPlan,
  // the only P4 left over is Cam 9 T2 S4, so one mixed test — all Cam 9 to keep the level even
  { name: 'Actual Test 16', seriesName: 'Actual Tests', testNumber: 16, file: 'actual-test-16-full.mp3',
    ids: [byTitle('Accommodation Form'), byTitle('Parks & Open Spaces'), byTitle('Course Feedback'), byTitle('Business Culture')] },
];

const ffmpeg = () => execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const upload = (file, opts) => new Promise((res, rej) => fs.createReadStream(file).pipe(cloudinary.uploader.upload_stream(opts, (e, r) => e ? rej(e) : res(r))));
const { uploadAudio } = require('../../services/r2Service'); // Listening audio → Cloudflare R2 (zero egress), see services/r2Service.js
const durationOf = (ff, file) => {
  let txt = '';
  try { execFileSync(ff, ['-i', file], { stdio: 'pipe' }); } catch (e) { txt = String(e.stderr); }
  const m = txt.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return m ? Math.round(+m[1] * 3600 + +m[2] * 60 + +m[3]) : 0;
};

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    if (activate) {
      for (const p of PLAN) {
        const t = await ListeningTest.findOne({ name: p.name });
        if (!t) { console.log(`- ${p.name}: not built`); continue; }
        if (!t.audioUrl || t.sections.length !== 4) { console.log(`✗ ${p.name}: missing audio/sections`); continue; }
        await ListeningTest.updateOne({ _id: t._id }, { $set: { isActive: true } });
        console.log(`ON  ${p.name}`);
      }
      return;
    }
    const tmp = W('fulltest_audio'); fs.mkdirSync(tmp, { recursive: true });
    for (const p of PLAN) {
      const secs = await ListeningSection.find({ _id: { $in: p.ids } }).lean();
      const ordered = p.ids.map(id => secs.find(s => String(s._id) === String(id)));
      const problems = [];
      ordered.forEach((s, i) => {
        if (!s) { problems.push(`P${i + 1} missing`); return; }
        if (s.partNumber !== i + 1) problems.push(`P${i + 1} is part ${s.partNumber}`);
        const nums = s.questionGroups.flatMap(g => g.questions.map(q => q.questionNumber)).sort((a, b) => a - b);
        const want = Array.from({ length: 10 }, (_, k) => i * 10 + 1 + k);
        if (nums.join() !== want.join()) problems.push(`P${i + 1} questions ${nums[0]}–${nums[nums.length - 1]} (${nums.length})`);
        if (!s.audioUrl) problems.push(`P${i + 1} no audio`);
        if (s.questionGroups.some(g => g.questions.some(q => !String(q.explanation || '').trim()))) problems.push(`P${i + 1} explanation missing`);
      });
      const total = ordered.reduce((n, s) => n + ((s && s.audioDuration) || 0), 0);
      console.log(`${p.name} [${p.seriesName} #${p.testNumber}] ~${Math.round(total / 60)} min`);
      ordered.forEach((s, i) => s && console.log(`   P${i + 1} ${s.title}`));
      if (problems.length) { console.log(`   ✗ ${problems.join('; ')}`); continue; }
      if (!apply) continue;
      if (await ListeningTest.exists({ name: p.name })) { console.log('   - already exists, skipped'); continue; }

      // audio: download the 4 section mp3s, concat (re-encode — sources differ in bitrate/sample rate)
      const ff = ffmpeg(), parts = [];
      for (const [i, s] of ordered.entries()) {
        const f = path.join(tmp, `${p.file}.p${i + 1}.mp3`);
        if (!fs.existsSync(f)) fs.writeFileSync(f, Buffer.from(await (await fetch(s.audioUrl)).arrayBuffer()));
        parts.push(f);
      }
      const out = path.join(tmp, p.file);
      execFileSync(ff, ['-y', '-loglevel', 'error', ...parts.flatMap(f => ['-i', f]),
        '-filter_complex', parts.map((_, i) => `[${i}:a]`).join('') + `concat=n=${parts.length}:v=0:a=1[a]`,
        '-map', '[a]', '-ac', '1', '-ar', '44100', '-b:a', '64k', out]);
      const dur = durationOf(ff, out);
      if (Math.abs(dur - total) > 5) throw new Error(`${p.name}: joined audio ${dur}s vs sections ${total}s`);

      const test = new ListeningTest({
        name: p.name, seriesName: p.seriesName, testNumber: p.testNumber, isActive: false,
        sections: ordered.map(src => ({
          partNumber: src.partNumber, title: src.title, description: src.description || '', transcript: src.transcript || '',
          questionRange: src.questionRange,
          questionGroups: src.questionGroups.map(({ _id, ...g }) => ({ ...g, questions: g.questions.map(({ _id: _q, ...q }) => q) })),
        })),
      });
      const up = await uploadAudio(out, { folder: 'listening', public_id: `listening_${test._id}_${Date.now()}` });
      Object.assign(test, { audioUrl: up.secure_url, audioFileName: p.file, audioDuration: dur });
      await test.save();
      console.log(`   ✓ ${test._id} hidden, audio ${dur}s ${(fs.statSync(out).size / 1e6).toFixed(1)}MB`);
    }
  } finally { await mongoose.disconnect(); }
})();
