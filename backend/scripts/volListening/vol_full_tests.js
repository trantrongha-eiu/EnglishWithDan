// Build "Vol <V> - Test <T>" full Listening tests from the vol specs (specs/vol<V>_t<T>.js): each part is the section
// imported from that vol test (web/vol<V>/imported.json) or, for a part already in the bank, the reused section
// (spec part.reuse). Sections are copied like admin "assemble test"; the 4 part mp3s are joined into one test audio
// (ffmpeg, 192k) → Cloudinary. Created HIDDEN, then pw_fulltest.js, then --activate.
//   node vol_full_tests.js <vol> <test …> [--apply | --activate]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const ListeningSection = require('../../models/ListeningSection');
const ListeningTest = require('../../models/ListeningTest');
const W = f => path.join(__dirname, 'web', `vol${process.argv[2]}`, f);
const apply = process.argv.includes('--apply'), activate = process.argv.includes('--activate');

const VOL = process.argv[2];
const TESTS = process.argv.slice(3).filter(a => /^\d+$/.test(a)).map(Number);
const imported = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', `vol${VOL}`, 'imported.json'), 'utf8'));
const PLAN = TESTS.map(t => {
  const spec = require(`./specs/vol${VOL}_t${t}.js`);
  const ids = [1, 2, 3, 4].map(p => { const s = spec.sections.find(x => x.part === p); return s && (s.reuse || imported[`t${t}p${p}`]); });
  return { name: `Vol ${VOL} - Test ${t}`, seriesName: `Vol ${VOL}`, testNumber: t, file: `vol${VOL}-test${t}-full.mp3`, ids };
});

const ffmpeg = () => execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const upload = (file, opts) => new Promise((res, rej) => fs.createReadStream(file).pipe(cloudinary.uploader.upload_stream(opts, (e, r) => e ? rej(e) : res(r))));
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
      if (p.ids.some(x => !x)) { console.log(`${p.name}: ✗ missing part(s) ${p.ids.map((x, i) => x ? '' : 'P' + (i + 1)).join(' ')}`); continue; }
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
        '-map', '[a]', '-ac', '2', '-ar', '44100', '-b:a', '192k', out]);
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
      const up = await upload(out, { resource_type: 'video', folder: 'listening', public_id: `listening_${test._id}_${Date.now()}` });
      Object.assign(test, { audioUrl: up.secure_url, audioFileName: p.file, audioDuration: dur });
      await test.save();
      console.log(`   ✓ ${test._id} hidden, audio ${dur}s ${(fs.statSync(out).size / 1e6).toFixed(1)}MB`);
    }
  } finally { await mongoose.disconnect(); }
})();
