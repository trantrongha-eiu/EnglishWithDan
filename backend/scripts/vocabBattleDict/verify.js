'use strict';
// ⚔️ Đấu trường — "Từ điển mở" word bank, step 3: cross-check the meanings.
//
//   node scripts/vocabBattleDict/verify.js [--limit 30] [--batch 300]
//
// pick.js still copies a rare dictionary sense now and then ("resort" →
// "phương kế", "globally" → "tổng thể"). Here Gemini translates every picked
// word WITHOUT seeing the dictionary glosses (just the word + part of speech);
// seedBattleWords.js then keeps the picked meaning when both agree (share a
// content word) and otherwise uses this blind translation, flagged origin
// 'ai' so the admin page lists it under "Nghĩa do AI viết — nên xem".
// Cached in scripts/data/vocabBattleDict/blind.json (~23 calls for 6.7k words).
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const DIR = path.join(__dirname, '..', 'data', 'vocabBattleDict');
const PICKS = path.join(DIR, 'picks.json');
const BLIND = path.join(DIR, 'blind.json');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const LIMIT = arg('--limit', 30);
const BATCH = arg('--batch', 300);

const SYSTEM = `You translate English words for Vietnamese IELTS learners (band 4–7).
For each numbered "word (part of speech)" give the ONE meaning learners meet most often today in news, IELTS texts and conversation, in natural Vietnamese, 1–5 words, lower case, no full stop.
Return a JSON array: [{"i":1,"vi":"…"}], same order.`;

(async () => {
  const picks = JSON.parse(fs.readFileSync(PICKS, 'utf8'));
  const blind = fs.existsSync(BLIND) ? JSON.parse(fs.readFileSync(BLIND, 'utf8')) : {};
  const todo = Object.entries(picks).filter(([w, p]) => p.ok && !blind[w]).map(([w, p]) => ({ w, pos: p.pos }));
  console.log(`${todo.length} to translate; up to ${LIMIT} calls × ${BATCH}`);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let calls = 0;
  for (let k = 0; k < todo.length && calls < LIMIT; k += BATCH) {
    const batch = todo.slice(k, k + BATCH);
    calls += 1;
    let rows;
    for (let attempt = 0; attempt < 5 && !rows; attempt++) {
      try {
        const res = await ai.models.generateContent({
          model: 'gemini-flash-lite-latest',
          contents: batch.map((c, i) => `${i + 1}. ${c.w} (${c.pos || '?'})`).join('\n'),
          config: { systemInstruction: SYSTEM, responseMimeType: 'application/json', temperature: 0.1, maxOutputTokens: 16000 },
        });
        const t = String(res.text || '');
        rows = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1));
      } catch (e) {
        console.error(`call ${calls}: ${e.status || ''} ${String(e.message).slice(0, 160)}`);
        if (e.status === 429) { k = todo.length; break; }
        await new Promise((r) => setTimeout(r, 20000 * (attempt + 1)));
      }
    }
    if (!rows) continue;
    let got = 0;
    for (const r of rows) {
      const c = batch[Number(r.i) - 1];
      if (c && typeof r.vi === 'string' && r.vi.trim()) { blind[c.w] = r.vi.trim(); got += 1; }
    }
    fs.writeFileSync(BLIND, JSON.stringify(blind));
    console.log(`call ${calls}: ${got}/${batch.length} (${Object.keys(blind).length} total)`);
  }
})().catch((e) => { console.error(e); process.exit(1); });
