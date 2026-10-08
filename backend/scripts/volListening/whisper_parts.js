// Transcribe VOL part audio with Groq Whisper (whisper-large-v3) → web/vol<V>/whisper/t<T>p<P>.json (segments
// with times relative to the part file). Thầy 2026-10-07: transcripts may be fetched or self-generated; the
// .docx machine transcripts that come with the sets have errors (amounts, letters), Whisper is more accurate.
//   node whisper_parts.js specs/vol1_t6.js [more specs…]     (skips parts already transcribed)
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

const ff = execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const { partFile } = require('./vol_media');
const sleep = ms => new Promise(r => setTimeout(r, ms));

function volDir(vol) {
  const root = path.join(__dirname, '..', '..', '..');
  const outer = fs.readdirSync(root).find(d => new RegExp(`^VOL ${vol}\\b.*ORIGINAL EXAMS`, 'i').test(d) && fs.statSync(path.join(root, d)).isDirectory());
  const o = path.join(root, outer);
  return path.join(o, fs.readdirSync(o).find(d => fs.statSync(path.join(o, d)).isDirectory()));
}

async function transcribe(file) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const form = new FormData();
    form.append('file', new Blob([fs.readFileSync(file)]), 'part.mp3');
    form.append('model', 'whisper-large-v3');
    form.append('response_format', 'verbose_json');
    form.append('language', 'en');
    form.append('temperature', '0');
    // a punctuated prompt keeps Whisper from emitting long unpunctuated runs (and drops of apostrophes)
    form.append('prompt', "Good afternoon. I'd like some information, please. Well, it's £15 a day, isn't it? Yes, that's right.");
    const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: form });
    const j = await r.json().catch(() => ({}));
    if (r.ok) return j;
    const wait = r.status === 429 ? Math.min(120, +(r.headers.get('retry-after') || 30)) : 10;
    console.log(`   ${r.status} ${JSON.stringify(j).slice(0, 160)} — retry in ${wait}s`);
    await sleep(wait * 1000);
  }
  throw new Error('whisper failed');
}

(async () => {
  for (const specFile of process.argv.slice(2)) {
    const spec = require(path.resolve(specFile));
    const src = volDir(spec.vol);
    const out = path.join(__dirname, 'web', `vol${spec.vol}`, 'whisper');
    fs.mkdirSync(out, { recursive: true });
    for (const s of spec.sections) {
      const dst = path.join(out, `t${spec.test}p${s.part}.json`);
      if (fs.existsSync(dst)) { console.log(`- t${spec.test}p${s.part} cached`); continue; }
      const small = path.join(out, `t${spec.test}p${s.part}.mp3`);
      execFileSync(ff, ['-y', '-loglevel', 'error', '-i', partFile(spec.vol, spec.test, s.part, s.audio, s.clip), '-vn', '-ac', '1', '-ar', '16000', '-b:a', '48k', small]);
      const j = await transcribe(small);
      const segs = (j.segments || []).map(x => ({ start: x.start, end: x.end, text: x.text.trim() }));
      // long runs without punctuation (a Whisper failure mode) → re-transcribe just that span
      let fixed = 0;
      for (const sg of segs) {
        // only with REPUNCT=1: it costs many extra requests against Groq's audio-seconds limit
        if (!process.env.REPUNCT || sg.text.split(/\s+/).length <= 10 || /[.?!]/.test(sg.text.replace(/[.?!]$/, ''))) continue;
        const cut = path.join(out, `cut.mp3`);
        execFileSync(ff, ['-y', '-loglevel', 'error', '-ss', String(Math.max(0, sg.start - 0.3)), '-to', String(sg.end + 0.3), '-i', small, '-ac', '1', '-b:a', '48k', cut]);
        const r = await transcribe(cut);
        if (r.text && /[.?!,]/.test(r.text)) { sg.text = r.text.trim(); fixed++; }
        fs.unlinkSync(cut);
      }
      fs.writeFileSync(dst, JSON.stringify({ text: segs.map(x => x.text).join(' '), duration: j.duration, segments: segs }, null, 1));
      fs.unlinkSync(small);
      console.log(`✓ t${spec.test}p${s.part} ${Math.round(j.duration)}s ${segs.length} segments, ${fixed} re-punctuated`);
    }
  }
})();
