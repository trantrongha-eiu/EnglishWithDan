// READ-ONLY structural check of the imported mini-ielts passages (reads passages.json — run dump_passages.js first).
// Checks: ≥13 questions with a contiguous questionRange; MC questions have ≥3 options; every question has an
// explanation whose text after the last "→" contains the main key; every __Qn__ placeholder has a question and
// every note/table question has a placeholder; matching groups have as many options as letters used;
// word-bank keys are words, not letters; group images load (HTTP 200); no leftover garbage in the content;
// no duplicate titles across the whole bank. Main-key problems from key_audit.js are repeated here
// (only the FIRST "/" alternative — extra variants added for lenient grading are ignored).
// Usage: node mini_debug_check.js [--no-images] [TAG]
const ps = require('./passages.json');
const args = process.argv.slice(2);
const tag = args.find(a => !a.startsWith('--')) || 'mini-ielts';
const mine = ps.filter(p => (p.tags || []).includes(tag));
const norm = s => ' ' + String(s || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .toLowerCase().replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—−-]/g, '-').replace(/­/g, '').replace(/…/g, '...').replace(/\s+/g, ' ') + ' ';
const LIMIT = { 'ONE WORD': 1, 'TWO WORDS': 2, 'THREE WORDS': 3, 'FOUR WORDS': 4 };
const letters = n => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, n).split('');

const report = {};
const add = (p, msg) => (report[p.title] ||= []).push(msg);
const images = [];

for (const p of mine) {
  const qs = (p.questionGroups || []).flatMap(g => g.questions || []);
  const nums = qs.map(q => q.questionNumber);
  if (qs.length < 13) add(p, `only ${qs.length} questions`);
  const { start, end } = p.questionRange || {};
  const sorted = [...nums].sort((a, b) => a - b);
  if (sorted[0] !== start || sorted[sorted.length - 1] !== end || end - start + 1 !== qs.length) add(p, `questionRange ${start}-${end} vs numbers ${sorted[0]}…${sorted[sorted.length - 1]} (${qs.length})`);
  if (new Set(nums).size !== nums.length) add(p, `duplicate question numbers`);
  for (let i = 1; i < nums.length; i++) if (nums[i] !== nums[i - 1] + 1) { add(p, `numbers not in order at Q${nums[i - 1]}→Q${nums[i]}`); break; }
  const body = norm(p.content);

  // content garbage
  const raw = String(p.content || '') + JSON.stringify(p.questionGroups);
  const junk = raw.match(/##a|##qi|&lt;div|&lt;p|\{[A-Z]\}|[\u0000-\u0008\u000b\u000c\u000e-\u001f]|\bhttps?:\/\/(?!res\.cloudinary|upload\.wikimedia|commons\.wikimedia)[^\s"'<]+|�/g);
  if (junk) add(p, `garbage: ${[...new Set(junk)].slice(0, 5).join(' ')}`);
  const glued = String(p.content).replace(/<[^>]+>/g, ' ').match(/\b(the|and|of|to|in|that|with)(the|and|of|which|this|that|was|were|is|are)\b/gi);
  if (glued) add(p, `glued words? ${[...new Set(glued)].slice(0, 5).join(' ')}`);
  if (/<img/i.test(p.content || '') === false) add(p, `no image in content`);

  for (const [gi, g] of (p.questionGroups || []).entries()) {
    const gname = `G${gi + 1}(${g.groupType})`;
    const gq = g.questions || [];
    if (!gq.length) add(p, `${gname} empty group`);
    if (g.imageUrl) images.push({ p, url: g.imageUrl, where: gname });
    const ins = String(g.instruction || '');

    // placeholders
    const holder = [g.noteConfig?.title, ...(g.noteConfig?.lines || []), JSON.stringify(g.tableConfig || {}), g.summaryConfig?.text, g.dragDropConfig?.text, ...(g.bulletConfig?.items || [])].join('\n');
    const ph = [...holder.matchAll(/__Q(\d+)__/g)].map(m => +m[1]);
    const fillQs = gq.filter(q => q.type === 'fill-blank').map(q => q.questionNumber);
    if (['note-form', 'table'].includes(g.groupType) || ph.length) {
      for (const n of ph) if (!gq.some(q => q.questionNumber === n)) add(p, `${gname} __Q${n}__ has no question`);
      for (const n of fillQs) if (!ph.includes(n)) add(p, `${gname} Q${n} has no __Q${n}__ placeholder`);
      if (new Set(ph).size !== ph.length) add(p, `${gname} placeholder repeated`);
    }
    if (/__Q\d*_*|\[Q\d+\]/.test(gq.map(q => q.questionText).join(' ') + ins)) add(p, `${gname} placeholder in question text/instruction`);

    // word bank keys must be words (and one of the bank's words)
    const bank = [...(g.summaryConfig?.wordBank || []), ...(g.dragDropConfig?.words || [])].map(w => String(w && typeof w === 'object' ? w.word || w.text || '' : w).trim().toLowerCase());
    if (bank.length) for (const q of gq) {
      if (/^[A-Z]$/.test(String(q.correctAnswer).trim())) add(p, `${gname} Q${q.questionNumber} word-bank key is a letter "${q.correctAnswer}"`);
      else if (!String(q.correctAnswer).split(/\s*\/\s*/).some(a => bank.includes(a.trim().toLowerCase()))) add(p, `${gname} Q${q.questionNumber} key "${q.correctAnswer}" not a bank word`);
    }

    // matching groups: options vs letters
    if (g.groupType === 'matching-options' || g.groupType === 'sentence-endings') {
      const opts = g.groupType === 'sentence-endings' ? (g.endingsConfig?.endings || []) : (g.matchingOptions || []);
      if (opts.length < 2) add(p, `${gname} only ${opts.length} options`);
      const allowed = letters(opts.length);
      for (const q of gq) for (const a of String(q.correctAnswer).split(/\s*\/\s*/)) if (!allowed.includes(a.trim())) add(p, `${gname} Q${q.questionNumber} key "${a}" outside A-${allowed[allowed.length - 1]}`);
      const rng = ins.match(/\b([A-H])\s*[-–—]\s*([A-Z])\b/);
      if (rng && /letters?|section|paragraph|ending|person|people|list/i.test(ins)) {
        const n = rng[2].charCodeAt(0) - rng[1].charCodeAt(0) + 1;
        if (n !== opts.length && !(opts.every(o => /^[A-Z]$/.test(o)) && n <= opts.length)) add(p, `${gname} instruction says ${rng[0]} (${n}) but ${opts.length} options`);
      }
      // paragraph-letter groups: letters must exist as paragraph labels in the passage
      if (opts.every(o => /^[A-Z]$/.test(o))) {
        const missing = opts.filter(L => !new RegExp(`(^|>|\\n)\\s*(<strong>|<b>)?\\s*(Paragraph\\s+|Section\\s+)?${L}(</strong>|</b>)?[\\s.:)]`, 'm').test(p.content));
        if (missing.length) add(p, `${gname} paragraph labels not found in content: ${missing.join(',')}`);
      }
    }
    if (g.groupType === 'matching-headings') {
      const hs = g.headingsConfig?.headings || [];
      const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv'];
      for (const q of gq) for (const a of String(q.correctAnswer).split(/\s*\/\s*/)) { const i = romans.indexOf(a.trim().toLowerCase()); if (i < 0 || i >= hs.length) add(p, `${gname} Q${q.questionNumber} heading key "${a}" not among ${hs.length} headings`); }
      if (hs.length < gq.length) add(p, `${gname} fewer headings (${hs.length}) than questions`);
    }

    // question-level checks
    const m = ins.toUpperCase().match(/(ONE WORD|TWO WORDS|THREE WORDS|FOUR WORDS)/);
    const limit = m ? LIMIT[m[1]] : 3;
    const allowNumber = /NUMBER/i.test(ins);
    for (const q of gq) {
      const key = String(q.correctAnswer || '').trim();
      if (!key) add(p, `Q${q.questionNumber} empty key`);
      if (q.type === 'multiple-choice') {
        const opts = (q.options || []).filter(o => String(o).trim());
        if (opts.length < 3) add(p, `Q${q.questionNumber} MC has ${opts.length} options`);
        for (const a of key.split(/\s*\/\s*/)) if (!letters(opts.length).includes(a)) add(p, `Q${q.questionNumber} MC key "${a}" outside options`);
        if (!String(q.questionText || '').trim()) add(p, `Q${q.questionNumber} MC has empty question text`);
      }
      if (q.type === 'multi-answer-group') {
        const opts = (q.options || []).filter(o => String(o).trim());
        if (opts.length < 4) add(p, `Q${q.questionNumber} choose-N has ${opts.length} options`);
        if (!letters(opts.length).includes(key)) add(p, `Q${q.questionNumber} choose-N key "${key}" outside options`);
        if (key.includes('/')) add(p, `Q${q.questionNumber} choose-N key has alternatives (not supported)`);
      }
      if (q.type === 'true-false-ng') for (const a of key.split(/\s*\/\s*/)) if (!['TRUE', 'FALSE', 'NOT GIVEN'].includes(a)) add(p, `Q${q.questionNumber} TFNG key "${a}"`);
      if (q.type === 'yes-no-ng') for (const a of key.split(/\s*\/\s*/)) if (!['YES', 'NO', 'NOT GIVEN'].includes(a)) add(p, `Q${q.questionNumber} YNNG key "${a}"`);
      if (q.type === 'true-false-ng' && /YES|NO\b/.test(ins) && !/TRUE/.test(ins)) add(p, `Q${q.questionNumber} TFNG question under YES/NO instruction`);
      if (q.type === 'yes-no-ng' && /TRUE/.test(ins) && !/YES/.test(ins)) add(p, `Q${q.questionNumber} YNNG question under TRUE/FALSE instruction`);
      if (q.type === 'fill-blank' && !bank.length) {
        const main = key.split(/\s*\/\s*/)[0];
        const words = main.split(/\s+/).filter(w => !(allowNumber && /^[\d.,$%]+$/.test(w)));
        if (words.length > limit) add(p, `Q${q.questionNumber} main key "${main}" is ${words.length} words > ${limit}`);
        if (/^[\s'"‘’“”.,;:]|[\s'"‘’“”,;:.]$/.test(main)) add(p, `Q${q.questionNumber} main key "${main}" has punctuation`);
        if (!body.includes(norm(main).trim())) add(p, `Q${q.questionNumber} main key "${main}" not in passage`);
      }
      // explanation
      const e = String(q.explanation || '');
      if (!e.trim()) add(p, `Q${q.questionNumber} no explanation`);
      else {
        let k = key; try { const j = JSON.parse(k); if (Array.isArray(j)) k = j.join(' '); } catch { /* plain */ }
        const main = norm(k.split(/\s*\/\s*/)[0]).trim();
        if (!e.includes('→') || !norm(e.split('→').pop()).includes(main)) add(p, `Q${q.questionNumber} explanation conclusion ≠ key "${key}"  [${e.split('→').pop().trim().slice(0, 60)}]`);
        if (key.includes(' / ') && q.type !== 'fill-blank') {
          const alts = key.split(/\s*\/\s*/).map(a => norm(a).trim());
          if (!alts.every(a => norm(e).includes(a))) add(p, `Q${q.questionNumber} alternative key "${key}" but explanation doesn't mention all`);
        }
      }
    }
  }
}

// duplicate titles across the whole bank
const byTitle = {};
for (const p of ps) (byTitle[p.title.trim().toLowerCase()] ||= []).push(p);
for (const [t, list] of Object.entries(byTitle)) if (list.length > 1 && list.some(p => (p.tags || []).includes(tag))) add(list[0], `duplicate title ×${list.length}: ${t}`);

(async () => {
  if (!args.includes('--no-images')) {
    for (const im of images) {
      try {
        const r = await fetch(im.url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (r.status !== 200) add(im.p, `${im.where} image HTTP ${r.status}: ${im.url}`);
        else if (!/^image\//.test(r.headers.get('content-type') || '')) add(im.p, `${im.where} image content-type ${r.headers.get('content-type')}`);
      } catch (e) { add(im.p, `${im.where} image fetch failed: ${e.message}`); }
    }
  }
  const titles = Object.keys(report);
  for (const t of titles) console.log(`✗ ${t}\n   ${report[t].join('\n   ')}`);
  console.log(`\n${mine.length} ${tag} passages; ${titles.length} with findings; ${images.length} group images checked`);
})();
