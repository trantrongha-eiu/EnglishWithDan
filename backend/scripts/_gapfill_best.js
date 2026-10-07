// Best-of-N gap-fill generation for sections the bulk script left short/failed.
// Each run: geminiService.generateGapFillBlanks (strict fidelity + rebuild-from-answers
// fallback), then blanks that are real person/place names are un-punched (put back as
// plain text, tokens renumbered). Keeps the run with the most blanks; stops early at
// GOOD. Writes template/answers with gapFillPublished:false — publish via _publish_gapfill.js.
// Usage: node backend/scripts/_gapfill_best.js <idsFile> [--runs 3] [--good 22] [--names Iceland,Egypt]
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');
const geminiService = require('../services/geminiService');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const RUNS = Number(arg('--runs', 3));
const GOOD = Number(arg('--good', 22));
const EXTRA_NAMES = new Set(String(arg('--names', '')).split(',').filter(Boolean).map((s) => s.toLowerCase()));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Remove blanks whose answer is in `drop` (put the text back), renumber the rest.
function unpunch(template, answers, dropFn) {
  const kept = [];
  const tpl = template.replace(/\[\[(\d+)\]\]/g, (_m, n) => {
    const a = answers[Number(n) - 1];
    if (dropFn(a)) return a;
    kept.push(a);
    return `[[${kept.length}]]`;
  });
  return { template: tpl, answers: kept };
}

(async () => {
  const ids = fs.readFileSync(process.argv[2], 'utf8').split(/[\s,]+/).filter(Boolean);
  await mongoose.connect(process.env.MONGO_URI);
  for (const [i, id] of ids.entries()) {
    const s = await ListeningSection.findById(id).select('title transcript isActive').lean();
    if (!s || !s.isActive || !String(s.transcript || '').trim()) { console.log(`[${i + 1}/${ids.length}] ${id} skipped (inactive/no transcript)`); continue; }
    let best = null;
    let waits = 0;
    for (let r = 0; r < RUNS; r++) {
      try {
        const g = await geminiService.generateGapFillBlanks(s.transcript);
        const flagged = new Set((g.flaggedNames || []).map((x) => x.toLowerCase()));
        const res = unpunch(g.template, g.answers, (a) => flagged.has(String(a).toLowerCase()) || EXTRA_NAMES.has(String(a).toLowerCase()));
        console.log(`   run ${r + 1}: ${g.answers.length} blanks${flagged.size ? ` (-${g.answers.length - res.answers.length} names: ${[...flagged].join(', ')})` : ''} → ${res.answers.length}`);
        if (!best || res.answers.length > best.answers.length) best = res;
        if (best.answers.length >= GOOD) break;
      } catch (e) {
        if (e.isOverloaded) {
          // free tier is 15 requests/minute — wait it out (a few times) rather than stop
          if ((waits = (waits || 0) + 1) > 4) { console.log('   Gemini quota/overload — stopping'); await mongoose.disconnect(); return; }
          console.log('   Gemini rate limit — waiting 65s'); await sleep(65000); r--; continue;
        }
        console.log(`   run ${r + 1}: FAIL ${e.message.slice(0, 80)}`);
      }
      await sleep(2000);
    }
    if (best) {
      await ListeningSection.updateOne({ _id: id }, { $set: {
        gapFillTemplate: best.template, gapFillAnswers: best.answers, gapFillGeneratedAt: new Date(),
        gapFillPublished: false, gapFillSkippedAt: null, gapFillSkipReason: '',
      } });
    }
    console.log(`[${i + 1}/${ids.length}] ${s.title}: ${best ? `saved ${best.answers.length} blanks` : 'NO RESULT'}`);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
