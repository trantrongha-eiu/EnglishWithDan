// Convert web/mini/x_<id>.json (neutral extract) → draft Passage doc (our schema).
// usage: node mini_convert.js <id> [<id>...]   → web/mini/draft_<id>.json + printed review
const fs = require('fs');
const path = require('path');
const D = path.join(__dirname, 'web', 'mini');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
const INSTR = /^(Do the following|In boxes|Write|TRUE if|FALSE if|YES if|NO if|NOT GIVEN if|Choose|Complete|Look at the following|Match|Answer the|Reading Passage|The reading Passage|Which (paragraph|section)s? contains?|NB|Classify|Label|Using|Use the information|List of)/i;

// split "A text B text C text" by looking for each expected letter in turn (letters may be wrapped as "(A)" or "A.")
function seqOptions(text, letters) {
  // OCR sometimes lower-cases a letter ("c David Meyer"); not for A/I, which are ordinary words in lower case
  const find = (L, from) => { const r = new RegExp(`(?:^|\\s)\\(?${/[AI]/.test(L) ? L : `[${L}${L.toLowerCase()}]`}[.)]?\\s+`, 'g'); r.lastIndex = from; const m = r.exec(text); return m && { i: m.index, end: m.index + m[0].length }; };
  const out = []; let cur = find(letters[0], 0);
  if (!cur || text.slice(0, cur.i).trim()) return [];
  for (let k = 0; k < letters.length; k++) {
    const nxt = k + 1 < letters.length ? find(letters[k + 1], cur.end) : null;
    if (k + 1 < letters.length && !nxt) return [];
    out.push(text.slice(cur.end, nxt ? nxt.i : undefined).trim());
    cur = nxt;
  }
  return out.every(Boolean) ? out : [];
}

function cleanAns(a) { return String(a || '').replace(/\s*\(adsbygoogle[\s\S]*$/, '').replace(/\s*Found a mistake[\s\S]*$/, '').trim(); }

function convert(x) {
  const warn = [];
  const answers = {};
  for (const [k, v] of Object.entries(x.answers)) if (+k <= 40) answers[+k] = cleanAns(v);
  const groups = [];
  for (const sec of x.sections) {
    // a list of questions flattened into one block ("[[Q6]] stmt [[Q7]] stmt…" or "1. Kovacs [[Q1]] 2. Rollier [[Q2]]") → one block per question
    const blocks = sec.blocks.flatMap(b => {
      if ((b.text.match(/\[\[Q\d+\]\]/g) || []).length < 2) return [b];
      let parts = null;
      if (/^\s*\[\[Q\d+\]\]/.test(b.text)) parts = b.text.split(/(?=\[\[Q\d+\]\])/);
      else if (/^\s*\d+\s*[.)]\s.*?\[\[Q\d+\]\]\s*\d+\s*[.)]\s/.test(b.text)) parts = b.text.split(/(?<=\[\[Q\d+\]\])\s*(?=\d+\s*[.)]\s)/);
      if (!parts) return [b];
      return parts.map(t => t.trim()).filter(Boolean).map(t => { const n = +(t.match(/\[\[Q(\d+)\]\]/) || [])[1]; return { text: t, ctrls: b.ctrls.filter(c => c.q === n) }; });
    });
    const qnums = [...new Set(blocks.flatMap(b => b.ctrls.map(c => c.q)))].sort((a, b) => a - b);
    const kinds = new Set(blocks.flatMap(b => b.ctrls.map(c => c.kind)));
    const plain = blocks.filter(b => !b.ctrls.length).map(b => b.text);
    const instrLines = []; const rest = [];
    let inInstr = true;
    for (const t of plain) { if (INSTR.test(t) && !/^\(?[A-Z][.)]?\s/.test(t)) instrLines.push(t); else { inInstr = false; rest.push(t); } }
    const instruction = instrLines.filter(t => !/^List of/i.test(t)).filter(t => !/^(TRUE|FALSE|YES|NO|NOT GIVEN) if/.test(t) || true).join(' ').replace(/\s+/g, ' ').trim();
    const allText = blocks.map(b => b.text).join('\n');
    const selOpts = blocks.flatMap(b => b.ctrls.filter(c => c.kind === 'select').map(c => c.options))[0] || [];
    const g = { groupTitle: sec.heading.replace(/Question\b/, 'Questions').replace(/\s*-\s*/, '–'), instruction, questions: [] };
    const stripQ = t => t.replace(/\[\[Q\d+\]\]/g, '').replace(/^\s*\d+\s*[.)]?\s+/, '').trim();

    if (kinds.has('select') && selOpts.includes('TRUE') || kinds.has('select') && selOpts.includes('YES')) {
      const yn = selOpts.includes('YES');
      g.groupType = 'plain';
      g.instruction = instrLines.join(' ').replace(/\s+/g, ' ');
      for (const b of blocks.filter(b => b.ctrls.length)) {
        const n = b.ctrls[0].q;
        g.questions.push({ questionNumber: n, type: yn ? 'yes-no-ng' : 'true-false-ng', questionText: stripQ(b.text), correctAnswer: (answers[n] || '').toUpperCase() });
      }
    } else if (/List of Headings/i.test(allText) || selOpts[0] === 'i') {
      g.groupType = 'matching-headings';
      const hs = rest.filter(t => /^[ivx]+\s+\S/i.test(t) && !/^List of/i.test(t));
      g.headingsConfig = { headings: hs.map((t, i) => ({ numeral: ROMAN[i], text: t.replace(/^[ivx]+\s+/i, '').replace(/^\w/, c => c.toUpperCase()) })) };
      hs.forEach((t, i) => { const own = t.match(/^([ivx]+)\s/i)[1].toLowerCase(); if (own !== ROMAN[i]) warn.push(`heading ${i + 1} typed "${own}" → ${ROMAN[i]}`); });
      for (const b of blocks.filter(b => b.ctrls.length)) {
        const n = b.ctrls[0].q;
        g.questions.push({ questionNumber: n, type: 'matching-headings', questionText: stripQ(b.text), correctAnswer: (answers[n] || '').toLowerCase() });
      }
    } else if (kinds.has('select') && /^[A-Z]$/.test(selOpts[0] || '') && blocks.some(b => b.ctrls.filter(c => c.kind === 'select').length >= 2)) {
      // summary with a lettered word list: several selects inside running text
      g.groupType = 'summary-completion';
      const bank = [];
      for (const t of plain) { const mm = t.match(/^([A-Z])\s+(.+)$/); if (mm && !INSTR.test(t)) bank.push({ letter: mm[1], word: mm[2].trim() }); }
      if (!bank.length) { const one = plain.find(t => /^A\s+\S+.*\sB\s+\S/.test(t)); if (one) { const r = /([A-Z])\s+(.+?)(?=\s+[A-Z]\s+\S|$)/g; let mm; while ((mm = r.exec(one))) bank.push({ letter: mm[1], word: mm[2].trim() }); } }
      if (bank.length < selOpts.length) {
        // several bank entries per line ("A severe B discharged C constructing a park…") → walk the letters in order
        const seq = seqOptions(plain.filter(t => !INSTR.test(t) && /^\(?[A-Z][.)]?\s/.test(t)).join(' '), selOpts);
        if (seq.length === selOpts.length) bank.splice(0, bank.length, ...seq.map((word, i) => ({ letter: selOpts[i], word })));
      }
      const textBlocks = blocks.filter(b => b.ctrls.length).map(b => b.text.replace(/\[\[Q(\d+)\]\]/g, '__Q$1__'));
      const titleL = rest.find(t => !/^[A-Z]\s/.test(t) && !INSTR.test(t) && t.length < 80);
      g.groupTitle = g.groupTitle + (titleL ? '' : '');
      g.summaryConfig = { text: (titleL ? `<strong>${titleL}</strong><br>` : '') + textBlocks.join('<br><br>'), wordBank: bank };
      if (bank.length < selOpts.length) warn.push(`${sec.heading}: word bank ${bank.length} < ${selOpts.length} letters`);
      for (const n of qnums) {
        const L = (answers[n] || '').trim().toUpperCase();
        const w = bank.find(b => b.letter === L);
        if (!w) warn.push(`Q${n} summary key "${answers[n]}" not in bank`);
        g.questions.push({ questionNumber: n, type: 'fill-blank', questionText: `Question ${n}`, correctAnswer: w ? w.word : (answers[n] || '') });
      }
    } else if (kinds.has('select') && /^[A-Z]$/.test(selOpts[0] || '')) {
      // letter-matching: option texts from rest lines "A text" (one per line or all on one line)
      let optText = rest.filter(t => !/^List of/i.test(t)).join(' \n ');
      const listLine = plain.find(t => /^List of \w+/i.test(t) && / A [A-Z]/.test(t));
      if (listLine) optText = listLine.replace(/^List of \w+\s*/i, '');
      const opts = [];
      const re = /(?:^|\s)([A-Z])\s+(.+?)(?=\s+[A-Z]\s+[A-Z(]|\s*\n|$)/g;
      let m; const seen = new Set();
      for (const part of optText.split(/\s*\n\s*/)) {
        const mm = part.match(/^\(?([A-Za-z])[.)]?\s+(.+)$/);
        if (mm && !seen.has(mm[1].toUpperCase())) { seen.add(mm[1].toUpperCase()); opts.push(mm[2].trim()); }
      }
      if (listLine) { opts.length = 0; const r = /([A-Z])\s+(.+?)(?=\s+[A-Z]\s+[A-Z]|$)/g; while ((m = r.exec(optText))) opts.push(m[2].trim()); }
      if (opts.length !== selOpts.length) {
        // fallbacks: "A the 18th century B the 19th…" / "(A) Parkes (B) Goodyear…" on one line → walk the letters in order;
        // an unlettered list with exactly as many lines as letters → letters by position
        const cand = rest.filter(t => !INSTR.test(t) && !/^List of/i.test(t) && !/^NB\b/i.test(t));
        const seq = seqOptions(cand.join(' '), selOpts);
        if (seq.length === selOpts.length) opts.splice(0, opts.length, ...seq);
        else if (cand.length === selOpts.length && !cand.some(t => /^\(?[A-Z][.)]?\s/.test(t))) opts.splice(0, opts.length, ...cand);
      }
      const isEndings = /correct ending/i.test(instruction);
      const isPara = /which (paragraph|section)s? contains?/i.test(instruction) || (!opts.length && /paragraph|section/i.test(instruction));
      const titleLine = plain.find(t => /^List of/i.test(t));
      if (isEndings) {
        g.groupType = 'sentence-endings';
        g.endingsConfig = { endings: opts.map((t, i) => ({ letter: String.fromCharCode(65 + i), text: t })) };
      } else {
        g.groupType = 'matching-options';
        g.matchingOptions = isPara && !opts.length ? selOpts : opts;
        if (titleLine && !listLine) g.matchingOptionsTitle = titleLine;
        else if (listLine) g.matchingOptionsTitle = (listLine.match(/^List of \w+/i) || [''])[0];
        g.matchingReuseAllowed = /more than once/i.test(instruction);
      }
      if (!isPara && opts.length !== selOpts.length) warn.push(`${sec.heading}: ${opts.length} option texts vs ${selOpts.length} letters`);
      for (const b of blocks.filter(b => b.ctrls.length)) {
        const n = b.ctrls[0].q;
        g.questions.push({ questionNumber: n, type: 'matching-info', questionText: stripQ(b.text), correctAnswer: (answers[n] || '').toUpperCase() });
      }
    } else if (kinds.has('radio')) {
      g.groupType = 'plain';
      g.instruction = instrLines.join(' ');
      // options are the blocks holding radio buttons (grouped by their question number); the stem is the plain text right
      // before a question's first option, whatever its numbering ("6. …", "9 …", "Question 10: …", or none)
      const byQ = new Map(); let buf = [];
      for (const b of blocks) {
        const radios = b.ctrls.filter(c => c.kind === 'radio');
        if (!radios.length) { if (!(INSTR.test(b.text) && !/\?\s*$/.test(b.text)) && !buf.some(t => t.endsWith(b.text))) buf.push(b.text); continue; }
        const n = radios[0].q;
        if (!byQ.has(n)) {
          const stem = buf.join(' ').replace(/^(Question\s*)?\d+\s*[:.)]?\s+/i, '').trim();
          byQ.set(n, { questionNumber: n, type: 'multiple-choice', questionText: stem, options: [], correctAnswer: (answers[n] || '').toUpperCase() });
          if (!stem) warn.push(`Q${n}: MC stem missing on the page`);
        }
        buf = [];
        const cur = byQ.get(n);
        for (const o of b.text.split(/\s+(?=[A-E]\s)/)) { const mm = o.match(/^([A-E])\s+(.+)$/); if (mm) cur.options.push(mm[2].trim()); }
      }
      g.questions.push(...[...byQ.values()].sort((a, b) => a.questionNumber - b.questionNumber));
      g.questions.forEach(q => { if (q.options.length < 3) warn.push(`Q${q.questionNumber}: only ${q.options.length} MC options`); });
      const gotMC = new Set(g.questions.map(q => q.questionNumber));
      qnums.filter(n => !gotMC.has(n)).forEach(n => warn.push(`Q${n}: MC stem not found`));
    } else if (kinds.has('checkbox')) {
      g.groupType = 'plain';
      g.instruction = instrLines.join(' ');
      const stemLine = rest.find(t => !/^\d+\s+[A-G]\s/.test(t)) || '';
      const opts = blocks.filter(b => b.ctrls.some(c => c.kind === 'checkbox')).map(b => b.text.replace(/^\d+\s+/, '').replace(/^[A-G]\s+/, '').trim());
      const [q0] = qnums;
      const nPick = blocks.flatMap(b => b.ctrls).find(c => c.kind === 'checkbox').n;
      const keyLetters = [];
      for (let n = q0; n < q0 + nPick; n++) keyLetters.push(...String(answers[n] || '').toUpperCase().split(/[^A-G]+/).filter(Boolean));
      for (let i = 0; i < nPick; i++) {
        const n = q0 + i;
        g.questions.push({ questionNumber: n, type: 'multi-answer-group', questionText: stemLine, options: opts, correctAnswer: keyLetters[i] || '' });
      }
      g.interchangeableAnswers = true;
    } else if (kinds.has('text')) {
      const lines = rest.concat(blocks.filter(b => b.ctrls.length).map(b => b.text));
      // keep original order
      const ordered = blocks.filter(b => b.ctrls.length || !INSTR.test(b.text)).map(b => b.text).filter(t => !instrLines.includes(t));
      const isHeadingsText = /Paragraph [A-H]/.test(allText) && /List of Headings/i.test(allText);
      const qByLine = ordered.every(t => (t.match(/\[\[Q\d+\]\]/g) || []).length <= 1) && ordered.filter(t => /\[\[Q/.test(t)).every(t => /^\d+\s*[.)]/.test(t));
      if (qByLine && /Answer the questions/i.test(instruction)) {
        g.groupType = 'plain';
        for (const b of blocks.filter(b => b.ctrls.length)) {
          const n = b.ctrls[0].q;
          g.questions.push({ questionNumber: n, type: 'fill-blank', questionText: stripQ(b.text), correctAnswer: answers[n] || '' });
        }
      } else {
        g.groupType = 'note-form';
        const titleIdx = ordered.findIndex(t => !/\[\[Q/.test(t));
        g.noteConfig = {
          title: '',
          lines: ordered.map(t => t.replace(/^\s*\d+\s*[.)]\s+/, '').replace(/\[\[Q(\d+)\]\]/g, '__Q$1__').replace(/\s+([.,;:])/g, '$1')),
        };
        for (const n of qnums) g.questions.push({ questionNumber: n, type: 'fill-blank', questionText: `Question ${n}`, correctAnswer: answers[n] || '' });
      }
    } else {
      warn.push(`unhandled section ${sec.heading} kinds=${[...kinds]}`);
      continue;
    }
    // a diagram/map/picture belongs with its question group (rendered above the questions)
    const simgs = sec.imgs || [];
    if (simgs.length) g.imageUrl = simgs[0];
    if (simgs.length > 1) warn.push(`${sec.heading}: ${simgs.length} images (one per question?) — only the first is kept, combine or drop`);
    const FIGURE = /\b(?:label|complete|on|in|shown in|look at|refer to)\s+the\s+(?:diagram|map|plan|flow-?chart|picture|figure)s?\b|\b(?:diagram|map|plan|flow-?chart|picture|figure)s?\s+(?:below|above)\b|\bwhich picture\b/i;
    if (!simgs.length && FIGURE.test(allText)) warn.push(`${sec.heading}: mentions a diagram/map but no image found — re-extract or drop`);
    groups.push(g);
  }
  // content: paragraphs; bold a leading paragraph letter
  // some pages put the paragraph letter in its own <p> ("A", then the text) → merge into the next paragraph
  const paras = [];
  let standalone = false;
  for (let i = 0; i < x.paras.length; i++) {
    const L = x.paras[i].trim().match(/^([A-J])\.?$/);
    if (L && i + 1 < x.paras.length) { paras.push(`${L[1]} ${x.paras[++i].trim()}`); standalone = true; }
    else paras.push(x.paras[i]);
  }
  const paraMatch = standalone || groups.some(g => g.groupType === 'matching-headings' || (g.groupType === 'matching-options' && /paragraph|section/i.test(g.instruction)));
  const content = `<h2>${esc(x.title)}</h2>\n\n` + paras.map(p => {
    const m = p.match(/^([A-J])[.\s]\s*(?=[A-Z‘'"“(0-9])(.+)$/);
    return m && paraMatch ? `<p><strong>${m[1]}</strong> ${esc(m[2])}</p>` : `<p>${esc(p)}</p>`;
  }).join('\n\n');
  const all = groups.flatMap(g => g.questions);
  const nQ = all.length;
  // passage position: 14 questions → P3; paragraph/people matching or headings → P2; else P1
  const hasMatch = groups.some(g => ['matching-headings', 'matching-options', 'sentence-endings'].includes(g.groupType));
  const category = nQ >= 14 ? 'passage3' : hasMatch ? 'passage2' : 'passage1';
  const start = { passage1: 1, passage2: 14, passage3: 27 }[category];
  const offset = start - Math.min(...all.map(q => q.questionNumber));
  if (offset) {
    for (const g of groups) {
      g.questions.forEach(q => { q.questionNumber += offset; if (q.questionText === `Question ${q.questionNumber - offset}`) q.questionText = `Question ${q.questionNumber}`; });
      if (g.noteConfig) g.noteConfig.lines = g.noteConfig.lines.map(l => l.replace(/__Q(\d+)__/g, (_, n) => `__Q${+n + offset}__`));
      if (g.summaryConfig) g.summaryConfig.text = g.summaryConfig.text.replace(/__Q(\d+)__/g, (_, n) => `__Q${+n + offset}__`);
      const shift = s => s.replace(/\b(\d{1,2})(\s*(?:[-–]|and|to)\s*)(\d{1,2})\b/g, (m, a, sep, b) => (+a >= 1 && +b <= 14 && +a < +b) ? `${+a + offset}${sep}${+b + offset}` : m);
      g.groupTitle = shift(g.groupTitle); g.instruction = shift(g.instruction);
      // the figure still shows the source's original numbers — tell students how they map
      if (g.imageUrl && g.questions.length) {
        const ns = g.questions.map(q => q.questionNumber), lo = Math.min(...ns), hi = Math.max(...ns);
        g.instruction += ` (Trên hình, ô ${lo - offset}–${hi - offset} tương ứng với câu ${lo}–${hi}.)`;
        warn.push(`${g.groupTitle}: figure keeps original numbers ${lo - offset}–${hi - offset} → mapping note added`);
      }
    }
  }
  const nums = all.map(q => q.questionNumber);
  for (let n = start; n < start + nQ; n++) if (!nums.includes(n)) warn.push(`missing Q${n}`);
  all.forEach(q => { if (!q.correctAnswer) warn.push(`Q${q.questionNumber} no answer`); });
  return {
    doc: {
      title: x.title.trim(), category, content, questionGroups: groups,
      questionRange: { start, end: start + nQ - 1 }, difficulty: 'medium',
      tags: ['mini-ielts', 'recent-actual-tests'], isActive: false, isActualTest: false,
    },
    warn,
  };
}

for (const id of process.argv.slice(2)) {
  const x = JSON.parse(fs.readFileSync(path.join(D, `x_${id}.json`), 'utf8'));
  const { doc, warn } = convert(x);
  fs.writeFileSync(path.join(D, `draft_${id}.json`), JSON.stringify(doc, null, 1));
  console.log(`\n##### ${id} ${doc.title} → ${doc.category} ${doc.questionRange.start}-${doc.questionRange.end}${warn.length ? '  WARN: ' + warn.join('; ') : ''}`);
  for (const g of doc.questionGroups) {
    console.log(` -- ${g.groupType} | ${g.groupTitle} | ${g.instruction.slice(0, 110)}`);
    if (g.headingsConfig) console.log('    headings:', g.headingsConfig.headings.map(h => `${h.numeral}:${h.text}`).join(' | '));
    if (g.matchingOptions) console.log('    options:', JSON.stringify(g.matchingOptions), g.matchingOptionsTitle || '');
    if (g.endingsConfig) console.log('    endings:', g.endingsConfig.endings.map(e => `${e.letter}:${e.text}`).join(' | '));
    if (g.noteConfig) g.noteConfig.lines.forEach(l => console.log('    |', l));
    for (const q of g.questions) console.log(`    Q${q.questionNumber} [${q.type}] ${q.questionText.slice(0, 95)}${q.options ? ' ' + JSON.stringify(q.options).slice(0, 120) : ''} => ${q.correctAnswer}`);
  }
}
