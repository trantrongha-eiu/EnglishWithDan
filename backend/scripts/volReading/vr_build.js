'use strict';
// Build Reading passages of the VOL 1–9 ORIGINAL EXAMS from hand-written specs (specs/vol<V>/t<T>p<P>.js) and check them.
//   node vr_build.js specs/vol1/t5p1.js […]   → web/vol<V>/draft/t<T>p<P>.json (Passage doc) + checks
//
// A spec = { vol, test, part, title, text: '<passage file next to the spec>', notes: [...], groups: [...], key: {n: answer},
//            expl: {n: [dịch, vị trí, trích, phân tích → đáp án]} } — groups made with the helpers exported below.
// Passage file: paragraphs separated by blank lines; "A " / "A. " at the start of a paragraph = paragraph letter (bold);
// a first line "# subtitle" = italic standfirst under the title.
const fs = require('fs'), path = require('path');

// ── group helpers ────────────────────────────────────────────────────────────
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const title = (a, b) => a === b ? `Question ${a}` : `Questions ${a}–${b}`;
const TFNG_I = (a, b, p) => `Do the following statements agree with the information given in Reading Passage ${p}? In boxes ${a}–${b} on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.`;
const YNNG_I = (a, b, p) => `Do the following statements agree with the claims of the writer in Reading Passage ${p}? In boxes ${a}–${b} on your answer sheet, write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.`;
const qs = (a, type, texts, extra = () => ({})) => texts.map((t, i) => ({ questionNumber: a + i, type, questionText: t, ...extra(a + i, i) }));

// statements: TRUE/FALSE/NOT GIVEN (yn: YES/NO/NOT GIVEN). o.instruction overrides the standard wording.
const tfng = (a, stmts, o = {}) => ({ groupType: 'plain', groupTitle: title(a, a + stmts.length - 1), _p: true,
  instruction: o.instruction, _instr: TFNG_I, questions: qs(a, 'true-false-ng', stmts) });
const ynng = (a, stmts, o = {}) => ({ groupType: 'plain', groupTitle: title(a, a + stmts.length - 1), _p: true,
  instruction: o.instruction, _instr: YNNG_I, questions: qs(a, 'yes-no-ng', stmts) });
// multiple choice: items = [[stem, [optA, optB, …]], …]
const mc = (a, items, o = {}) => ({ groupType: 'plain', groupTitle: title(a, a + items.length - 1),
  instruction: o.instruction || `Choose the correct letter, ${letters(items[0][1].length)}. Write the correct letter in boxes ${a}–${a + items.length - 1} on your answer sheet.`,
  questions: items.map(([stem, opts], i) => ({ questionNumber: a + i, type: 'multiple-choice', questionText: stem, options: opts })) });
// choose N letters from one list (one question per pick, answers interchangeable)
const multi = (a, n, stem, opts, o = {}) => ({ groupType: 'plain', groupTitle: title(a, a + n - 1), interchangeableAnswers: true,
  instruction: o.instruction || `Choose ${['', 'ONE', 'TWO', 'THREE', 'FOUR'][n]} letters, ${letters(opts.length)}. Write the correct letters in boxes ${a}–${a + n - 1} on your answer sheet.`,
  questions: range(a, a + n - 1).map(q => ({ questionNumber: q, type: 'multi-answer-group', questionText: stem, options: opts, checkboxCount: n })) });
// matching headings: heads = ['heading i', 'heading ii', …]; items = ['Paragraph B', …]
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
const headings = (a, heads, items, o = {}) => ({ groupType: 'matching-headings', groupTitle: title(a, a + items.length - 1),
  instruction: o.instruction || `Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–${ROMAN[heads.length - 1]}, in boxes ${a}–${a + items.length - 1} on your answer sheet.`,
  headingsConfig: { headings: heads.map((t, i) => ({ numeral: ROMAN[i], text: t })) },
  questions: qs(a, 'matching-headings', items) });
// matching letters: options = ['text A', 'text B', …] (or bare letters for "which paragraph"); o.title = list title; o.reuse
const matching = (a, options, items, o = {}) => ({ groupType: 'matching-options', groupTitle: title(a, a + items.length - 1),
  instruction: o.instruction, matchingOptionsTitle: o.title || '', matchingOptions: options, matchingReuseAllowed: !!o.reuse,
  questions: qs(a, 'matching-info', items) });
// sentence endings: endings = ['ending A', …]
const endings = (a, ends, items, o = {}) => ({ groupType: 'sentence-endings', groupTitle: title(a, a + items.length - 1),
  instruction: o.instruction || `Complete each sentence with the correct ending, ${letters(ends.length)}, below. Write the correct letter, ${letters(ends.length)}, in boxes ${a}–${a + items.length - 1} on your answer sheet.`,
  endingsConfig: { endings: ends.map((t, i) => ({ letter: String.fromCharCode(65 + i), text: t })) },
  questions: qs(a, 'matching-info', items) });
// notes / flow-chart / sentence or summary completion typed from the passage: lines with __Qn__ blanks
const notes = (a, b, lines, o = {}) => ({ groupType: 'note-form', groupTitle: title(a, b), instruction: o.instruction,
  noteConfig: { title: o.title || '', lines }, questions: range(a, b).map(n => ({ questionNumber: n, type: 'fill-blank', questionText: `Question ${n}` })) });
// summary with a lettered word bank (key = the word, as the bank's other passages do)
const summary = (a, b, text, bank, o = {}) => ({ groupType: 'summary-completion', groupTitle: title(a, b),
  instruction: o.instruction || `Complete the summary using the list of words, ${letters(bank.length)}, below. Write the correct letter, ${letters(bank.length)}, in boxes ${a}–${b} on your answer sheet.`,
  summaryConfig: { text: (o.title ? `<strong>${o.title}</strong><br>` : '') + text, wordBank: bank.map((w, i) => ({ letter: String.fromCharCode(65 + i), word: w })) },
  questions: range(a, b).map(n => ({ questionNumber: n, type: 'fill-blank', questionText: `Question ${n}` })) });
// table / flow-chart as a table: headers + rows of cells with __Qn__ blanks
const table = (a, b, headers, rows, o = {}) => ({ groupType: 'table', groupTitle: title(a, b), instruction: o.instruction,
  tableConfig: { headers, rows }, questions: range(a, b).map(n => ({ questionNumber: n, type: 'fill-blank', questionText: `Question ${n}` })) });
// short-answer questions (one input per question)
const short = (a, texts, o = {}) => ({ groupType: 'plain', groupTitle: title(a, a + texts.length - 1), instruction: o.instruction,
  questions: qs(a, 'fill-blank', texts) });
// "A, B, C or D" for short lists, "A–H" for long ones (as printed in IELTS papers)
const letters = n => { const L = 'ABCDEFGHIJKL'.slice(0, n).split(''); return n > 5 ? `A–${L[n - 1]}` : n < 2 ? 'A' : `${L.slice(0, -1).join(', ')} or ${L[n - 1]}`; };

// ── building ─────────────────────────────────────────────────────────────────
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function contentHtml(spec, raw) {
  const paras = raw.replace(/\r/g, '').split(/\n\s*\n/).map(s => s.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
  let sub = null;
  if (paras[0].startsWith('# ')) sub = paras.shift().slice(2);
  const body = paras.map(p => {
    const m = p.match(/^([A-J])\.?\s+(?=\S)(.+)$/);
    return m && spec.lettered !== false ? `<p><strong>${m[1]}</strong> ${esc(m[2])}</p>` : `<p>${esc(p)}</p>`;
  });
  return [`<h2>${esc(spec.title)}</h2>`, ...(sub ? [`<p><em>${esc(sub)}</em></p>`] : []), ...body].join('\n\n');
}
const plain = s => String(s).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, ' ');
const nrm = s => plain(s).toLowerCase().replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/[^a-z0-9'%£$,.-]+/g, ' ').replace(/[,.](?=\s|$)/g, '').replace(/\s+/g, ' ').trim();

function build(specPath) {
  const spec = require(path.resolve(specPath));
  const warn = [];
  const P = spec.part, cat = `passage${P}`;
  const raw = fs.readFileSync(path.resolve(path.dirname(specPath), spec.text), 'utf8');
  const content = contentHtml(spec, raw);
  const groups = spec.groups.map(g => {
    const all = g.questions.map(q => q.questionNumber), a = Math.min(...all), b = Math.max(...all);
    const instruction = g.instruction || (g._instr ? g._instr(a, b, P) : '');
    const out = { ...g, instruction };
    delete out._instr; delete out._p;
    out.questions = g.questions.map(q => {
      const key = spec.key[q.questionNumber];
      const e = spec.expl[q.questionNumber];
      if (key == null) warn.push(`Q${q.questionNumber}: no key`);
      if (!e) warn.push(`Q${q.questionNumber}: no explanation`);
      const explanation = e ? `Dịch: ${e[0]}\n\nVị trí: ${e[1]}\n\nTrích: ${e[2]}\n\nPhân tích: ${e[3]}` : '';
      return { ...q, correctAnswer: key == null ? '' : String(key), explanation };
    });
    return out;
  });
  const nums = groups.flatMap(g => g.questions.map(q => q.questionNumber));
  const start = spec.start || { 1: 1, 2: 14, 3: 27 }[P];
  const end = Math.max(...nums);
  const doc = { title: spec.title, category: cat, content, questionGroups: groups, questions: [], questionRange: { start, end },
    difficulty: 'medium', tags: [`vol-${spec.vol}`, 'vol-original-exams'], isActive: false, isActualTest: true, thumbnailUrl: '' };

  // ── checks ──
  const exp = range(start, end);
  if (nums.join() !== exp.join()) warn.push(`numbering ${nums.join(',')} ≠ ${start}–${end}`);
  if (!(spec.allowCount || [13, 14]).includes(nums.length)) warn.push(`${nums.length} questions`);
  const C = nrm(content);
  for (const g of groups) {
    const lim = (g.instruction.match(/NO MORE THAN (ONE|TWO|THREE|FOUR) WORDS?/i) || g.instruction.match(/(ONE) WORD ONLY/i) || [])[1];
    const maxW = lim ? { ONE: 1, TWO: 2, THREE: 3, FOUR: 4 }[lim.toUpperCase()] : null;
    const num = /AND\/OR A NUMBER/i.test(g.instruction);
    const blanks = (g.noteConfig?.lines || []).join(' ') + ' ' + (g.summaryConfig?.text || '') + ' ' + (g.tableConfig?.rows || []).flat().join(' ');
    for (const q of g.questions) {
      const n = q.questionNumber, k = q.correctAnswer, variants = k.split(/\s*\/\s*/);
      if (['note-form', 'summary-completion', 'table'].includes(g.groupType) && !blanks.includes(`__Q${n}__`)) warn.push(`Q${n}: no __Q${n}__ blank`);
      switch (q.type) {
        case 'true-false-ng': if (!['TRUE', 'FALSE', 'NOT GIVEN'].includes(variants[0])) warn.push(`Q${n}: TFNG key "${k}"`); break;
        case 'yes-no-ng': if (!['YES', 'NO', 'NOT GIVEN'].includes(variants[0])) warn.push(`Q${n}: YNNG key "${k}"`); break;
        case 'multiple-choice': if (variants.some(v => !/^[A-L]$/.test(v) || v.charCodeAt(0) - 65 >= q.options.length)) warn.push(`Q${n}: MC key "${k}" / ${q.options.length} options`); break;
        case 'multi-answer-group': if (!/^[A-L]$/.test(k) || k.charCodeAt(0) - 65 >= q.options.length) warn.push(`Q${n}: multi key "${k}" / ${q.options.length} options`); break;
        case 'matching-headings': if (!ROMAN.slice(0, g.headingsConfig.headings.length).includes(k)) warn.push(`Q${n}: heading key "${k}"`); break;
        case 'matching-info': {
          const L = g.matchingOptions?.length || g.endingsConfig?.endings?.length || 0;
          if (variants.some(v => !/^[A-L]$/.test(v) || v.charCodeAt(0) - 65 >= L)) warn.push(`Q${n}: letter key "${k}" / ${L} options`); break;
        }
        case 'fill-blank':
          if (g.groupType === 'summary-completion') { if (!g.summaryConfig.wordBank.some(w => w.word === variants[0])) warn.push(`Q${n}: key "${k}" not a bank word`); break; }
          for (const v of variants) {
            if (!C.includes(nrm(v)) && !(spec.free || []).includes(v)) warn.push(`Q${n}: key variant "${v}" not in passage`);
            const wc = v.split(/\s+/).filter(w => !/^\d[\d,.]*$/.test(w) || !num).length;
            if (maxW && wc > maxW) warn.push(`Q${n}: "${v}" has ${wc} words > ${maxW}`);
          }
      }
      // explanation: quotes must be in the passage, conclusion must match the key
      const e = spec.expl[n];
      if (e) {
        for (const quote of e[2].match(/“([^”]+)”/g) || []) for (const part of quote.slice(1, -1).split(/\s*…\s*/)) {
          if (part.trim().length > 3 && !C.includes(nrm(part))) warn.push(`Q${n}: quote not in passage: "${part.slice(0, 80)}"`);
        }
        if (!/“/.test(e[2])) warn.push(`Q${n}: explanation without a “quote”`);
        const concl = (e[3].match(/→\s*([^→]+)$/) || [])[1];
        const shown = concl ? concl.trim().replace(/[.\s]+$/, '') : null;
        if (!shown) warn.push(`Q${n}: analysis does not end "→ answer"`);
        else if (nrm(shown) !== nrm(variants[0]) && !(q.type === 'matching-headings' && nrm(shown).startsWith(nrm(variants[0]) + ' '))
          && !(q.type === 'fill-blank' && variants.some(v => nrm(v) === nrm(shown)))) warn.push(`Q${n}: analysis concludes "${shown}" but key is "${k}"`);
      }
    }
  }
  const out = path.join(__dirname, 'web', `vol${spec.vol}`, 'draft', `t${spec.test}p${P}.json`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ source: `Vol ${spec.vol} - Test ${spec.test} - Passage ${P}`, imageUrl: null, notes: spec.notes || [], doc }, null, 1));
  const words = plain(content).split(/\s+/).filter(Boolean).length;
  console.log(`${warn.length ? '✗' : '✓'} T${spec.test}P${P} "${spec.title}" ${cat} Q${start}-${end} (${nums.length} q, ${words} words) → ${path.relative(__dirname, out)}`);
  for (const w of warn) console.log('   ! ' + w);
  return warn.length;
}

module.exports = { tfng, ynng, mc, multi, headings, matching, endings, notes, summary, table, short, TFNG_I, YNNG_I };
if (require.main === module) {
  let bad = 0;
  for (const f of process.argv.slice(2)) bad += build(f);
  process.exitCode = bad ? 1 : 0;
}
