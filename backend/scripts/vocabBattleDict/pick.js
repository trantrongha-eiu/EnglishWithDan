'use strict';
// ⚔️ Đấu trường — "Từ điển mở" word bank, step 2: the everyday meaning.
//
//   node scripts/vocabBattleDict/pick.js [--limit 20] [--batch 150]
//
// Vietnamese Wiktionary lists a word's senses in no useful order ("mug" →
// "thằng ngốc" before "cái ca", "remove" opens with a noun sense). For each
// candidate (prepare.js) Gemini flash-lite is shown the dictionary's own
// glosses: it first writes the meaning an IELTS learner meets most (a few
// Vietnamese words), then names the dictionary gloss that says the same
// (src "dict"), or none (src "ai" — the admin page lists those to check).
// Asking it to choose among the glosses first made it copy rare senses
// ("affected" → "giả tạo", "addition" → "phép cộng"). It also keeps at most one synonym /
// antonym, and only from the candidates Wiktionary lists for that sense, and
// drops names, abbreviations, inflected forms and rare/technical words.
// Results are cached in scripts/data/vocabBattleDict/picks.json (re-runs only
// ask about words not answered yet). --limit caps the Gemini calls: the free
// tier is shared with students (see memory: Gemini quota), ~45 calls for the
// whole list. Next: build.js.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { GoogleGenAI } = require('@google/genai');

const DIR = path.join(__dirname, '..', 'data', 'vocabBattleDict');
const CAND = path.join(DIR, 'candidates.json.gz');
const PICKS = path.join(DIR, 'picks.json');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const LIMIT = arg('--limit', 20);
const BATCH = arg('--batch', 150);
const MODEL = 'gemini-flash-lite-latest';

const SYSTEM = `You write a Vietnamese–English word game for Vietnamese IELTS learners (band 4–7).
For every numbered English word you get its Vietnamese dictionary glosses (ids like n1, v2 — in no useful order), its English definitions, and candidate synonyms/antonyms.
Return a JSON array, one object per word, same order: {"i":<number>,"ok":true|false,"pos":"n|v|adj|adv|…","vi":"…","match":"n2"|"","syn":"…","ant":"…"}
- vi: FIRST decide the ONE meaning learners meet most often today (news, IELTS texts, everyday talk — not old, literary, technical or rare senses) and write it in natural Vietnamese, 1–5 words, lower case, no full stop.
- match: THEN the id of the Vietnamese gloss that says the same thing, or "" if none does.
- pos: the part of speech of that meaning.
- syn: ONE word from the synonym candidates that means the same in that meaning and can replace the word in most sentences, else "".
- ant: ONE word from the antonym candidates that is a clear, common opposite in that meaning, else "".
- ok:false when the word is mainly a name, a brand, an abbreviation, an interjection, offensive, very rare or technical for learners, or only an inflected form (plural, past tense, -ing…) of another word. Otherwise ok:true.`;

function line(i, c) {
  const vi = c.vi.map((p) => `${p.pos}: ${p.gl.map((g, k) => `[${p.pos}${k + 1}] ${g}`).join(' ')}`).join(' | ');
  const en = c.en.map((p) => `${p.pos}: ${p.gl.join('; ')}`).join(' | ');
  return `${i}. ${c.w}\n   VI ${vi}\n   EN ${en || '-'}\n   syn: ${c.syn.join(', ') || '-'}; ant: ${c.ant.join(', ') || '-'}`;
}

function parseJson(text) {
  const s = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '');
  return JSON.parse(s.slice(s.indexOf('['), s.lastIndexOf(']') + 1));
}

(async () => {
  const cands = JSON.parse(zlib.gunzipSync(fs.readFileSync(CAND)).toString('utf8'));
  const picks = fs.existsSync(PICKS) ? JSON.parse(fs.readFileSync(PICKS, 'utf8')) : {};
  const todo = cands.filter((c) => !picks[c.w]);
  console.log(`${cands.length} candidates, ${Object.keys(picks).length} picked, ${todo.length} to do; up to ${LIMIT} calls × ${BATCH}`);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let calls = 0;
  for (let k = 0; k < todo.length && calls < LIMIT; k += BATCH) {
    const batch = todo.slice(k, k + BATCH);
    calls += 1;
    let rows;
    for (let attempt = 0; attempt < 5 && !rows; attempt++) {
      try {
        const res = await ai.models.generateContent({
          model: MODEL,
          contents: batch.map((c, i) => line(i + 1, c)).join('\n'),
          config: { systemInstruction: SYSTEM, responseMimeType: 'application/json', temperature: 0.1, maxOutputTokens: 16000 },
        });
        rows = parseJson(res.text);
      } catch (e) {
        console.error(`call ${calls}: ${e.status || ''} ${String(e.message).slice(0, 160)}`);
        if (e.status === 429) { k = todo.length; break; } // daily quota: stop
        await new Promise((r) => setTimeout(r, 20000 * (attempt + 1))); // 503 overload / bad JSON: wait, retry
      }
    }
    if (!rows) continue;
    let got = 0;
    for (const r of rows) {
      const c = batch[Number(r.i) - 1];
      if (!c || typeof r.vi !== 'string') continue;
      picks[c.w] = {
        ok: r.ok !== false, pos: String(r.pos || ''), vi: r.vi.trim(), src: r.match ? 'dict' : 'ai', match: String(r.match || ''),
        syn: c.syn.includes(r.syn) ? r.syn : '', ant: c.ant.includes(r.ant) ? r.ant : '',
      };
      got += 1;
    }
    fs.writeFileSync(PICKS, JSON.stringify(picks, null, 0));
    console.log(`call ${calls}: ${got}/${batch.length} (${Object.keys(picks).length} total)`);
  }
})().catch((e) => { console.error(e); process.exit(1); });
