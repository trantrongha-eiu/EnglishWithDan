'use strict';
// READ-ONLY audit of the "Vol V - Test N" Reading tests: test active with 3 active passages P1/P2/P3, question numbers
// increasing without overlap, every question has a key and an explanation, an explanation's final "→ X" agrees with the key
// (first alternative), every “quoted” part of a "Trích:" line occurs in the passage, a cover (thumbnailUrl or <img>).
//   node vr_audit.js <vol>
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const mongoose = require('mongoose');
const vol = process.argv[2];
const plain = s => String(s).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, ' ');
const nrm = s => plain(s).toLowerCase().replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/[^a-z0-9'%£$,.-]+/g, ' ').replace(/[,.](?=\s|$)/g, '').replace(/\s+/g, ' ').trim();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  let problems = 0, quotes = 0, qn = 0;
  try {
    const tests = (await db.collection('readingtests').find({ seriesName: `Vol ${vol}` }).toArray()).sort((a, b) => a.testNumber - b.testNumber);
    for (const t of tests) {
      const out = [];
      if (!t.isActive) out.push('test inactive');
      if (t.name !== `Vol ${vol} - Test ${t.testNumber}`) out.push(`name/number mismatch`);
      const ps = await db.collection('passages').find({ _id: { $in: t.passageIds } }).toArray();
      let last = 0;
      t.passageIds.forEach((id, i) => {
        const p = ps.find(x => String(x._id) === String(id));
        if (!p) return out.push(`P${i + 1} missing`);
        if (!p.isActive) out.push(`P${i + 1} inactive`);
        if (p.category !== `passage${i + 1}`) out.push(`P${i + 1} is ${p.category}`);
        if (!p.thumbnailUrl && !/<img\s/.test(p.content)) out.push(`P${i + 1} no cover`);
        const C = nrm(p.content);
        for (const g of p.questionGroups) for (const q of g.questions) {
          qn++;
          if (q.questionNumber <= last) out.push(`Q${q.questionNumber} out of order`);
          last = q.questionNumber;
          if (!q.correctAnswer) out.push(`Q${q.questionNumber} empty key`);
          if (!q.explanation) { out.push(`Q${q.questionNumber} no explanation`); continue; }
          // a trailing note in brackets is allowed: "→ E (Sound)", "→ E (có thể dùng một chữ cái nhiều lần)"
          const concl = ((q.explanation.match(/→\s*([^→\n]+)\s*$/) || [])[1] || '').replace(/\s*\([^()]*\)\s*\.?\s*$/, '') || null;
          const k1 = q.correctAnswer.split(/\s*\/\s*/)[0];
          // heading answers may be followed by the heading text ("→ vii How the number…"), as vr_build.js allows
          const headingOk = concl && /^[ivx]+$/i.test(k1) && nrm(concl).startsWith(nrm(k1) + ' ');
          if (concl && !headingOk && /^Phân tích/m.test(q.explanation) && nrm(concl) !== nrm(k1) && !q.correctAnswer.split(/\s*\/\s*/).some(v => nrm(v) === nrm(concl)))
            out.push(`Q${q.questionNumber} explanation → "${concl.trim()}" vs key "${q.correctAnswer}"`);
          const tr = (q.explanation.match(/^Trích:(.*)$/m) || [])[1] || '';
          for (const m of tr.match(/“([^”]+)”/g) || []) for (const part of m.slice(1, -1).split(/\s*…\s*/)) {
            if (part.trim().length <= 3) continue;
            quotes++;
            if (!C.includes(nrm(part))) out.push(`Q${q.questionNumber} quote not in passage: "${part.slice(0, 60)}"`);
          }
        }
      });
      problems += out.length;
      console.log(`${out.length ? '✗' : '✓'} ${t.name}${out.length ? '\n   ' + out.join('\n   ') : ''}`);
    }
    console.log(`\n${tests.length} tests, ${qn} questions, ${quotes} quotes checked, ${problems} problem(s)`);
  } finally { await mongoose.disconnect(); }
})();
