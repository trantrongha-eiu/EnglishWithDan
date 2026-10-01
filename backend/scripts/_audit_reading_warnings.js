'use strict';
// READ-ONLY audit: replicates admin QuestionGroupBuilder warnings + structural checks
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const passages = await db.collection('passages').find({}).toArray();
  const tests = await db.collection('readingtests').find({}).toArray();
  const inTests = {};
  for (const t of tests) (t.passageIds || []).forEach((id, i) => {
    (inTests[String(id)] ||= []).push(`${t.name} P${i + 1}${t.isActive === false ? ' (inactive)' : ''}`);
  });

  const out = [];
  for (const p of passages) {
    const warns = [];
    const groups = p.questionGroups || [];
    const allQs = groups.flatMap(g => g.questions || []);
    const nums = allQs.map(q => q.questionNumber);
    const from = p.questionRange?.start, to = p.questionRange?.end;
    const dup = [...new Set(nums.filter((n, i) => nums.indexOf(n) !== i))];
    if (dup.length) warns.push(`DUP numbers ${dup}`);
    if (to) {
      const miss = []; for (let i = from; i <= to; i++) if (!nums.includes(i)) miss.push(i);
      if (miss.length) warns.push(`MISSING numbers ${miss}`);
      const extra = nums.filter(n => n < from || n > to);
      if (extra.length) warns.push(`OUT OF RANGE ${extra} (range ${from}-${to})`);
    }
    // order: groups in ascending order & questions ascending within group
    let last = -Infinity; let orderBad = false;
    groups.forEach(g => (g.questions || []).forEach(q => { if (q.questionNumber < last) orderBad = true; last = q.questionNumber; }));
    if (orderBad) warns.push(`ORDER not ascending: ${groups.map(g => (g.questions || []).map(q => q.questionNumber).join(',')).join(' | ')}`);
    if (!groups.length) warns.push(`NO GROUPS (flat questions: ${(p.questions || []).length})`);

    groups.forEach((g, gi) => {
      const label = `G${gi + 1}[${g.groupType}]`;
      const qs = g.questions || [];
      if (!qs.length) warns.push(`${label}: empty group`);
      if (g.groupType === 'map' && !g.imageUrl?.trim()) warns.push(`${label}: no image`);
      if (g.groupType === 'summary-completion') {
        if (!g.summaryConfig?.text?.trim()) warns.push(`${label}: no summary text`);
        if (!(g.summaryConfig?.wordBank || []).some(w => w.word?.trim())) warns.push(`${label}: summary wordbank empty`);
      }
      if (g.groupType === 'note-form' && !(g.noteConfig?.lines || []).some(l => l.trim())) warns.push(`${label}: note no lines`);
      if (g.groupType === 'table' && !(g.tableConfig?.rows || []).length) warns.push(`${label}: table no rows`);
      if (g.groupType === 'matching-options' && !(g.matchingOptions || []).some(o => o.trim())) warns.push(`${label}: matchingOptions empty`);
      if (g.groupType === 'sentence-endings' && !(g.endingsConfig?.endings || []).some(e => e.text?.trim())) warns.push(`${label}: endings empty`);
      if (g.groupType === 'matching-headings' && !(g.headingsConfig?.headings || []).some(h => h.text?.trim())) warns.push(`${label}: headings empty`);
      // placeholders present for table/note/bullet/summary
      const tpl = g.groupType === 'table' ? (g.tableConfig?.rows || []).flat().join('\n')
        : g.groupType === 'note-form' ? (g.noteConfig?.lines || []).join('\n')
        : g.groupType === 'bullet-list' ? (g.bulletConfig?.items || []).join('\n')
        : g.groupType === 'summary-completion' ? (g.summaryConfig?.text || '') : null;
      if (tpl != null) {
        const missPh = qs.filter(q => !new RegExp(`__Q?${q.questionNumber}__|\\[${q.questionNumber}\\]|\\{${q.questionNumber}\\}`).test(tpl)).map(q => q.questionNumber);
        if (missPh.length) warns.push(`${label}: placeholder missing for ${missPh}`);
      }
      // ── deep render/grade consistency checks ──
      const key = q => String(q.correctAnswer || '').trim();
      const allTpl = JSON.stringify([g.tableConfig, g.noteConfig, g.bulletConfig, g.summaryConfig?.text, g.dragDropConfig?.text]);
      const bad = allTpl.match(/(?<!_)_Q\d+__|__Q\d+_(?!_)|__\s+Q\d+__|__Q\s+\d+__/g);
      if (bad) warns.push(`${label}: malformed placeholder ${bad}`);
      const phNums = [...allTpl.matchAll(/__Q(\d+)__/g)].map(m => +m[1]);
      const strayPh = phNums.filter(n => !qs.some(q => q.questionNumber === n));
      if (strayPh.length) warns.push(`${label}: placeholder for question not in group ${strayPh}`);
      if (g.groupType === 'summary-completion' && (g.summaryConfig?.wordBank || []).length) {
        const words = g.summaryConfig.wordBank.map(w => String(w.word || '').trim().toLowerCase());
        qs.forEach(q => { if (!key(q).split(/\s*\/\s*/).some(a => words.includes(a.toLowerCase()))) warns.push(`Q${q.questionNumber}: SUMMARY key "${key(q)}" not a bank word (ungradeable)`); });
      }
      if (g.groupType === 'map' && (g.dragDropConfig?.words || []).length) {
        const words = g.dragDropConfig.words.map(w => String(w).trim().toLowerCase());
        qs.forEach(q => { if (!words.includes(key(q).toLowerCase())) warns.push(`Q${q.questionNumber}: MAP key "${key(q)}" not in words`); });
      }
      if (g.groupType === 'sentence-endings' && g.endingsConfig?.endings?.length) {
        const L = g.endingsConfig.endings.map((e, i) => e.letter || String.fromCharCode(65 + i));
        qs.forEach(q => { if (!L.includes(key(q).toUpperCase())) warns.push(`Q${q.questionNumber}: ENDINGS key "${key(q)}" not in ${L.join('')}`); });
      }
      if (g.groupType === 'matching-options' || (g.groupType === 'sentence-endings' && !g.endingsConfig?.endings?.length)) {
        const n = (g.matchingOptions || []).length || (g.endingsConfig?.endings || []).length;
        const txt = [g.instruction, g.groupTitle, ...qs.map(q => q.questionText)].filter(Boolean).join(' ');
        const m = txt.match(/\b([A-Z])\s*(?:[-–—]|to)\s*([A-Z])\b/);
        const maxL = Math.max(n ? 64 + n : 0, m ? m[2].charCodeAt(0) : 0);
        // a key may hold alternatives ("A / B") when the passage genuinely allows both — every one must be a valid letter
        qs.forEach(q => key(q).split(/\s*\/\s*/).forEach(a => {
          if (!/^[A-Z]$/i.test(a)) warns.push(`Q${q.questionNumber}: MATCH key "${key(q)}" not a letter`);
          else if (a.toUpperCase().charCodeAt(0) > maxL) warns.push(`Q${q.questionNumber}: MATCH key ${key(q)} beyond options (${n}${m ? ', instr ' + m[0] : ''})`);
        }));
        if (m && n && n < m[2].charCodeAt(0) - 64 && (g.matchingOptions || []).every(o => o.trim().length <= 1)) warns.push(`${label}: letter list ${n} < instr ${m[0]}`);
        if (m && n && n !== m[2].charCodeAt(0) - 64 && (g.matchingOptions || []).some(o => o.trim().length > 1)) warns.push(`${label}: ${n} described options vs instr ${m[0]}`);
      }
      if (g.groupType === 'matching-headings') {
        const nums = (g.headingsConfig?.headings || []).map(h => h.numeral);
        qs.forEach(q => { if (!nums.includes(key(q))) warns.push(`Q${q.questionNumber}: HEADING key "${key(q)}" not in list`); });
      }
      const instr = (g.instruction || '') + ' ' + (g.groupTitle || '');
      if (qs.some(q => q.type === 'true-false-ng') && /\bYES\b/.test(instr)) warns.push(`${label}: TFNG questions but YES/NO instruction`);
      if (qs.some(q => q.type === 'yes-no-ng') && /\bTRUE\b/.test(instr)) warns.push(`${label}: YNNG questions but TRUE/FALSE instruction`);
      if (qs.length && !String(g.instruction || '').trim() && !String(g.groupTitle || '').trim()) warns.push(`${label}: no instruction/title`);
      qs.forEach(q => {
        const n = q.questionNumber;
        if (q.type === 'multi-answer-group' && /^[A-Z]$/i.test(key(q)) && key(q).toUpperCase().charCodeAt(0) - 65 >= (q.options || []).length) warns.push(`Q${n}: MULTI key ${key(q)} beyond options`);
        if (!String(q.correctAnswer || '').trim()) warns.push(`Q${n}: no answer`);
        if (['multiple-choice', 'true-false-ng', 'yes-no-ng'].includes(q.type) && !String(q.questionText || '').trim()) warns.push(`Q${n}: no text`);
        if (q.type === 'multiple-choice' && (q.options || []).filter(o => String(o).trim()).length < 2) warns.push(`Q${n}: MC <2 options`);
        if (q.type === 'sentence-completion' && !(q.wordBank || []).length) warns.push(`Q${n}(${label}): SC wordBank empty`);
        // a key may list accepted alternatives ("FALSE / NOT GIVEN") when sources disagree — graders and the review screen split on "/"
        if (q.type === 'true-false-ng' && !/^(TRUE|FALSE|NOT GIVEN)(\s*\/\s*(TRUE|FALSE|NOT GIVEN))*$/i.test(String(q.correctAnswer).trim())) warns.push(`Q${n}: TFNG key "${q.correctAnswer}"`);
        if (q.type === 'yes-no-ng' && !/^(YES|NO|NOT GIVEN)(\s*\/\s*(YES|NO|NOT GIVEN))*$/i.test(String(q.correctAnswer).trim())) warns.push(`Q${n}: YNNG key "${q.correctAnswer}"`);
        if (q.type === 'multiple-choice' && /^[A-Z]$/i.test(String(q.correctAnswer).trim())) {
          const idx = String(q.correctAnswer).trim().toUpperCase().charCodeAt(0) - 65;
          if (idx >= (q.options || []).length) warns.push(`Q${n}: MC key ${q.correctAnswer} beyond ${q.options.length} options`);
        }
      });
    });
    const errs = warns;
    if (errs.length) out.push({ id: String(p._id), title: p.title, cat: p.category, active: p.isActive, actual: p.isActualTest,
      range: `${from}-${to}`, tests: inTests[String(p._id)] || [], warns: errs });
  }
  fs.writeFileSync(process.argv[2] || 'audit.json', JSON.stringify(out, null, 2));
  console.log(`passages=${passages.length} tests=${tests.length} withWarnings=${out.length}`);
  const cnt = {};
  out.forEach(o => o.warns.forEach(w => { const k = w.replace(/Q\d+/g, 'Q#').replace(/G\d+/g, 'G#').replace(/[\d,]+/g, 'N').slice(0, 60); cnt[k] = (cnt[k] || 0) + 1; }));
  console.log(Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 40));
  await mongoose.disconnect();
})();
