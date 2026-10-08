// Who says each sentence, by voice pitch: Groq whisper-large-v3-turbo with word timestamps (cached in
// web/vol<V>/words/t<T>p<P>.json) + an autocorrelation pitch track (f0.py) → one line per sentence with its median
// pitch and M (< 165 Hz) / F (> 175 Hz). For writing a part's turns when the vol's transcript has no speakers (Vol 5).
// Only tells a man from a woman; two voices of the same sex need the content.
//   node speaker_pitch.js <stub or spec> <part> [from s] [to s]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { partFile } = require('./vol_media');
const [specFile, part, from = 0, to = 1e9] = process.argv.slice(2);
const spec = require(path.resolve(specFile));
const s = spec.sections.find(x => x.part === +part);
const ff = execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();

(async () => {
  const audio = partFile(spec.vol, spec.test, s.part, s.audio, s.clip);
  const cache = path.join(__dirname, 'web', `vol${spec.vol}`, 'words', `t${spec.test}p${s.part}.json`);
  fs.mkdirSync(path.dirname(cache), { recursive: true });
  if (!fs.existsSync(cache)) {
    const small = cache.replace(/\.json$/, '.mp3');
    execFileSync(ff, ['-y', '-loglevel', 'error', '-i', audio, '-vn', '-ac', '1', '-ar', '16000', '-b:a', '48k', small]);
    const form = new FormData();
    form.append('file', new Blob([fs.readFileSync(small)]), 'part.mp3');
    form.append('model', 'whisper-large-v3-turbo');
    form.append('response_format', 'verbose_json');
    form.append('timestamp_granularities[]', 'word');
    form.append('timestamp_granularities[]', 'segment');
    form.append('language', 'en');
    form.append('temperature', '0');
    form.append('prompt', "Good afternoon. I'd like some information, please. Well, it's £15 a day, isn't it? Yes, that's right.");
    const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: form });
    const j = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(j).slice(0, 300));
    fs.writeFileSync(cache, JSON.stringify({ words: j.words, segments: (j.segments || []).map(x => ({ start: x.start, end: x.end, text: x.text.trim() })) }));
    fs.unlinkSync(small);
  }
  const { words } = JSON.parse(fs.readFileSync(cache, 'utf8'));
  const f0 = JSON.parse(execFileSync('py', [path.join(__dirname, 'f0.py'), audio, ff], { maxBuffer: 1 << 26 }).toString());
  // sentences: words up to . ? ! (Whisper words carry their punctuation)
  const sents = [];
  let cur = [];
  for (const w of words) { cur.push(w); if (/[.?!]["']?$/.test(w.word.trim())) { sents.push(cur); cur = []; } }
  if (cur.length) sents.push(cur);
  for (const ws of sents) {
    const a = ws[0].start, b = ws[ws.length - 1].end;
    if (b < +from || a > +to) continue;
    const v = f0.slice(Math.floor(a * 100), Math.ceil(b * 100)).filter(x => x > 0).sort((p, q) => p - q);
    const med = v.length >= 5 ? v[v.length >> 1] : 0;
    const who = !med ? '?' : med < 165 ? 'M' : med > 175 ? 'F' : '~';
    console.log(`[${a.toFixed(1)}] ${who} ${String(med).padStart(3)}  ${ws.map(w => w.word.trim()).join(' ')}`);
  }
})().catch(e => { console.error(e.message); process.exit(1); });
