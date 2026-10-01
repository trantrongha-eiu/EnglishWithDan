// Transcribe (part of) an OLD section's audio with Groq Whisper, to complete a truncated transcript.
//   node old_whisper.js <sectionId> [fromSec] [toSec]          (prints timed segments)
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const W = f => path.join(__dirname, 'web', f);
const [id, from = '0', to = ''] = process.argv.slice(2);
(async () => {
  const s = JSON.parse(fs.readFileSync(W('sections.json'), 'utf8')).find(x => String(x._id) === id);
  fs.mkdirSync(W('audio'), { recursive: true });
  const src = W(`audio/old_${id}${path.extname(s.audioUrl.split('?')[0]) || '.mp3'}`);
  if (!fs.existsSync(src)) fs.writeFileSync(src, Buffer.from(await (await fetch(s.audioUrl)).arrayBuffer()));
  const ffmpeg = execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
  const cut = W(`audio/old_${id}_${from}_${to || 'end'}.mp3`);
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', from, ...(to ? ['-to', to] : []), '-i', src, '-ac', '1', '-b:a', '48k', cut]);
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(cut)]), 'cut.mp3');
  form.append('model', 'whisper-large-v3');
  form.append('response_format', 'verbose_json');
  form.append('language', 'en');
  const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: form });
  const j = await r.json();
  if (!r.ok) { console.log(j); return; }
  for (const g of j.segments || []) console.log(`${(+from + g.start).toFixed(1)}  ${g.text.trim()}`);
})();
