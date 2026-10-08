// Speaker-labelled transcript of a VOL part straight from its audio (Gemini multimodal) → web/vol<V>/gemini/t<T>p<P>.txt.
// Vol 2+ comes with Otter.ai PDFs (garbled words, speakers mostly unnamed) and Whisper drops words at pauses
// ("eye strain" → "eye") and runs sentences together, so neither is a usable base on its own. Gemini hears the
// whole recording and names the roles; diff_gemini.js then lists every place it disagrees with Whisper (and
// Otter) so slips/inventions are checked by hand before the text goes into the spec.
//   node gemini_transcribe.js specs/vol2_t1.js [part…]     (skips parts already done; FORCE=1 redoes)
// ⚠ 2026-10-07: GEMINI_API_KEY is the free tier (20 requests/day for gemini-2.5-flash) and the site's Speaking
// grading uses the same key — only Vol 2 T1 P1–P2 were made this way; the rest use merge_preview.js (Otter+Whisper).
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { findFile } = require('./vol_media');

const ff = execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const PROMPT = roles => `This is one part of an IELTS Listening test recording. Transcribe it VERBATIM.

Rules:
- Leave out the exam narration: the announcer's lines such as "Part 1. You will hear…", "First you have some time to look at questions 1 to 4", "Now listen carefully and answer questions…", "Before you hear the rest of the conversation…", "That is the end of part one. You now have … to check your answers". If an example is played first and then again, keep it only once.
- Write exactly the words that are spoken, in British spelling, with normal punctuation. Do not summarise, do not correct the speakers, do not add anything that is not said. Spelled-out words as letters with hyphens (A-T-K-I-N-S-O-N); numbers as digits the way they are said (875 934, £15.50, 1986).
- ${roles ? `The speakers are: ${roles}. Start every turn with the speaker name and a colon on its own line, then the words.` : 'Mark each change of speaker with a short role name and a colon on its own line (e.g. "Receptionist:"). If only one person speaks, do not add any names.'}
- One sentence per line.
Return only the transcript.`;

async function gemini(mp3, roles) {
  const body = {
    contents: [{ role: 'user', parts: [{ text: PROMPT(roles) }, { inlineData: { mimeType: 'audio/mp3', data: fs.readFileSync(mp3).toString('base64') } }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 16000, thinkingConfig: { thinkingBudget: 0 } },
  };
  for (let a = 0; a < 6; a++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    const text = j.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('');
    if (r.ok && text) return text.trim();
    console.log(`   ${r.status} ${JSON.stringify(j).slice(0, 200)} — retry`);
    await sleep(r.status === 429 ? 60000 : 8000);
  }
  throw new Error('gemini failed');
}

(async () => {
  const [specFile, ...only] = process.argv.slice(2);
  const spec = require(path.resolve(specFile));
  const out = path.join(__dirname, 'web', `vol${spec.vol}`, 'gemini');
  fs.mkdirSync(out, { recursive: true });
  for (const s of spec.sections) {
    if (s.reuse || (only.length && !only.includes(String(s.part)))) continue;
    const dst = path.join(out, `t${spec.test}p${s.part}.txt`);
    if (fs.existsSync(dst) && !process.env.FORCE) { console.log(`- t${spec.test}p${s.part} cached`); continue; }
    const small = path.join(out, `t${spec.test}p${s.part}.mp3`);
    execFileSync(ff, ['-y', '-loglevel', 'error', '-i', findFile(spec.vol, s.audio), '-vn', '-ac', '1', '-ar', '16000', '-b:a', '48k', small]);
    const roles = s.speakers ? [...new Set(Object.values(s.speakers))].join(', ') : '';
    const text = await gemini(small, roles);
    fs.writeFileSync(dst, text + '\n');
    fs.unlinkSync(small);
    console.log(`✓ t${spec.test}p${s.part} ${text.split('\n').length} lines`);
  }
})();
