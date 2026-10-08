// Listen to a stretch of a part by machine: cut <from>–<to> seconds of a vol part's audio and print Whisper's text
// (Groq whisper-large-v3-turbo: its own rate limit, so it works while whisper_parts.js waits on large-v3), plus the
// Whisper segments of the part around that time. For checking a word the merged transcript got wrong.
//   node wb.js <vol> <test> <part> <from> <to>          (times in seconds or m:ss)
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const { findFile } = require('./vol_media');
const [vol, test, part, from, to] = process.argv.slice(2);
const sec = t => String(t).includes(':') ? t.split(':').reduce((a, b) => a * 60 + +b, 0) : +t;
const ff = execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const { volDir } = require('./vol_media');
const dir = path.join(volDir(+vol), 'listening', `test ${test}`);
const audio = path.join(dir, fs.readdirSync(dir).find(f => /\.(mp3|m4a)$/i.test(f) && new RegExp(`(?:part|section)[ -]?${part}\\b`, 'i').test(f)));
(async () => {
  const cut = path.join(os.tmpdir(), `wb_${process.pid}.mp3`);
  execFileSync(ff, ['-y', '-loglevel', 'error', '-ss', String(sec(from)), '-to', String(sec(to)), '-i', audio, '-ac', '1', '-ar', '16000', '-b:a', '64k', cut]);
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(cut)]), 'cut.mp3');
  form.append('model', 'whisper-large-v3-turbo');
  form.append('language', 'en');
  form.append('temperature', '0');
  const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: form });
  const j = await r.json();
  fs.unlinkSync(cut);
  console.log(r.ok ? j.text.trim() : JSON.stringify(j).slice(0, 300));
})();
