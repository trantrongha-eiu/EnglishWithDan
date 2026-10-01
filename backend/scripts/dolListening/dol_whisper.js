// Transcribe a time range of a DOL section's audio with Groq Whisper — used to fill gaps where DOL's
// transcript is missing the sentence that holds an answer.
//   node dol_whisper.js <dolId> <fromSec> <toSec>
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const W = f => path.join(__dirname, 'web', f);
const [id, from, to] = process.argv.slice(2);
(async () => {
  const d = JSON.parse(fs.readFileSync(W(`draft/${id}.json`), 'utf8'));
  fs.mkdirSync(W('audio'), { recursive: true });
  const mp3 = W(`audio/${id}.mp3`);
  if (!fs.existsSync(mp3)) {
    const r = await fetch(d._audio, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://tuhoc.dolenglish.vn/' } });
    fs.writeFileSync(mp3, Buffer.from(await r.arrayBuffer()));
  }
  const ffmpeg = execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
  const cut = W(`audio/${id}_${from}_${to}.mp3`);
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', String(from), '-to', String(to), '-i', mp3, '-ac', '1', '-b:a', '64k', cut]);
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(cut)]), 'cut.mp3');
  form.append('model', 'whisper-large-v3');
  form.append('response_format', 'verbose_json');
  form.append('language', 'en');
  const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: form });
  const j = await r.json();
  if (!r.ok) { console.log(j); return; }
  for (const s of j.segments || []) console.log(`${(+from + s.start).toFixed(1)}–${(+from + s.end).toFixed(1)}  ${s.text.trim()}`);
})();
