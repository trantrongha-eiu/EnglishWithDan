// Compact authoring helpers for the Mindset courses (scripts/mindset/<level>/uNN.js).
// buildMindset.js turns a unit file into the seedCourse.js JSON layout
// (lessons-uNN.json / exercises-uNN.json) + seedMindsetMedia.js's
// practice-uNN.json. Codes, order, points and gates are filled in there.
'use strict';

const L = 'ABCDEFGHIJKLMNOP';
const letterOf = (a) => (typeof a === 'number' ? L[a] : String(a).trim().toUpperCase());

// ── WT1 course exercises ─────────────────────────────────────────────
// items: [prompt, options[], answer (letter | index), explanation?]
function mcq(title, instruction, items, o = {}) {
  return {
    type: 'mcq', title, instruction, ...o,
    items: items.map(([prompt, opts, ans, explanation], i) => ({
      id: 'q' + (i + 1), prompt,
      options: opts.map((t, k) => ({ id: L[k], text: t })),
      answer: letterOf(ans), explanation: explanation || '',
    })),
  };
}

// items: [prompt with ____ markers, answers, explanation?] — answers: one
// string per marker ("a|b" = alternatives) or an array of them.
function gap(title, instruction, items, o = {}) {
  return {
    type: 'gap_fill', title, instruction, ...o,
    items: items.map(([prompt, answers, explanation], i) => {
      const arr = Array.isArray(answers) ? answers : [answers];
      return {
        id: 'g' + (i + 1), prompt,
        blanks: arr.map((a) => ({ accept: String(a).split('|').map((x) => x.trim()).filter(Boolean) })),
        explanation: explanation || '',
      };
    }),
  };
}

// pairs: [left, right, explanation?]
function match(title, instruction, pairs, o = {}) {
  return {
    type: 'matching', title, instruction, ...o,
    items: pairs.map(([left, right, explanation], i) => ({ id: 'm' + (i + 1), left, right, explanation: explanation || '' })),
  };
}

// items: [correct sentence, explanation?] — tokens = the words (server shuffles).
function order(title, instruction, items, o = {}) {
  return {
    type: 'ordering', title, instruction, ...o,
    items: items.map(([sentence, explanation], i) => {
      const tokens = String(sentence).trim().split(/\s+/);
      return { id: 'o' + (i + 1), prompt: '', tokens, answer: tokens, explanation: explanation || '' };
    }),
  };
}

// cats: { id: label }, items: [text, catId, explanation?]
function cat(title, instruction, cats, items, o = {}) {
  return {
    type: 'categorize', title, instruction, ...o,
    categories: Object.entries(cats).map(([id, label]) => ({ id, label })),
    items: items.map(([text, category, explanation], i) => ({ id: 'c' + (i + 1), text, category, explanation: explanation || '' })),
  };
}

// items: [prompt (sentence with the wrong word), corrected sentence, explanation?]
function fix(title, instruction, items, o = {}) {
  return {
    type: 'error_correction', title, instruction, ...o,
    items: items.map(([prompt, answer, explanation], i) => ({ id: 'e' + (i + 1), prompt, answer, explanation: explanation || '' })),
  };
}

// AI-graded paragraph (Gemini) — r: { minWords, maxWords, checklist[], targetVocab[],
// targetStructures[], mustUse, sampleAnswer, commonErrors[] }
function write(title, instruction, r, o = {}) {
  return { type: 'paragraph_writing', title, instruction, autoGrade: false, responseSlots: 1, ...o, rubric: { bandFocus: ['A2 (Mindset Foundation, mục tiêu Band 4.0–4.5)'], ...r } };
}

// Recorded answer, AI bands (Speaking course type). items: [prompt, sampleAnswer, sampleNote?]
function speak(title, instruction, part, items, o = {}) {
  return {
    type: 'speaking_response', title, instruction, autoGrade: false,
    speakingPart: part, speakingPrepSeconds: part === 2 ? 60 : 10, ...o,
    items: items.map(([prompt, sampleAnswer, sampleNote], i) => ({
      id: 's' + (i + 1), prompt, sampleAnswer: sampleAnswer || '', sampleNote: sampleNote || '', sampleSource: 'new',
    })),
  };
}

const passage = (text, extra = {}) => ({ kind: 'passage', text, ...extra });
const picture = (imageUrl, caption) => ({ kind: 'image', imageUrl, caption: caption || '' });

// Theory card: { title, titleEn, formula[], usage[], examples[[en, vi]], notes[] }
function card(title, titleEn, { formula = [], usage = [], examples = [], notes = [] } = {}) {
  return { title, titleEn, formula, usage, examples: examples.map(([en, vi]) => ({ en, vi: vi || '' })), notes };
}

// ── Reading passage / Listening section question groups ──────────────
// Numbering is explicit (n = first question number) so groups can follow
// the book's 1-7 etc.
// image: a picture the questions refer to ("which picture is…") — rendered
// above the questions via the 'map' group (reading.html + listening.html).
function qMcq(n, instruction, qs, groupTitle, { image } = {}) {
  return {
    groupType: image ? 'map' : 'plain', groupTitle: groupTitle || '', instruction,
    ...(image ? { imageUrl: image } : {}),
    questions: qs.map(([text, options, ans, explanation], i) => ({
      questionNumber: n + i, type: 'multiple-choice', questionText: text, options, correctAnswer: letterOf(ans), explanation: explanation || '',
    })),
  };
}
// True/False as a 2-option MCQ (Listening has no TFNG type).
function qTF(n, instruction, qs, groupTitle) {
  return qMcq(n, instruction, qs.map(([t, ans, ex]) => [t, ['True', 'False'], /^t/i.test(ans) ? 'A' : 'B', ex]), groupTitle);
}
// Reading TRUE/FALSE/NOT GIVEN. qs: [text, 'TRUE'|'FALSE'|'NOT GIVEN', expl]
function qTFNG(n, instruction, qs, groupTitle) {
  return {
    groupType: 'plain', groupTitle: groupTitle || '', instruction,
    questions: qs.map(([text, ans, explanation], i) => ({ questionNumber: n + i, type: 'true-false-ng', questionText: text, correctAnswer: ans, explanation: explanation || '' })),
  };
}
// Letter matching against a list (people/features). options: ['A cooking', ...]
function qMatch(n, instruction, options, qs, { title = '', reuse = false, optionsTitle = '', type = 'matching-info' } = {}) {
  // The UI prints the letter itself (positional A, B, C…) — drop "A " prefixes.
  if (options.every((o, i) => String(o).startsWith(L[i] + ' '))) options = options.map((o) => String(o).slice(2));
  return {
    groupType: 'matching-options', groupTitle: title, instruction,
    matchingOptions: options, matchingOptionsTitle: optionsTitle, matchingReuseAllowed: reuse,
    questions: qs.map(([text, ans, explanation], i) => ({ questionNumber: n + i, type, questionText: text, correctAnswer: letterOf(ans), explanation: explanation || '' })),
  };
}
// Note / form completion. lines use __Qn__ placeholders; answers: { n: 'a / b' | ['a','b'] }
function qNote(instruction, title, lines, answers, explanations = {}, groupTitle) {
  return {
    groupType: 'note-form', groupTitle: groupTitle || '', instruction,
    noteConfig: { title: title || '', lines },
    questions: Object.entries(answers).map(([n, a]) => ({
      questionNumber: Number(n), type: 'fill-blank', questionText: 'Question ' + n,
      correctAnswer: Array.isArray(a) ? a.join(' / ') : a, explanation: explanations[n] || '',
    })),
  };
}
// Table completion. rows use __Qn__ placeholders.
function qTable(instruction, headers, rows, answers, explanations = {}, groupTitle) {
  return {
    groupType: 'table', groupTitle: groupTitle || '', instruction,
    tableConfig: { headers, rows },
    questions: Object.entries(answers).map(([n, a]) => ({
      questionNumber: Number(n), type: 'fill-blank', questionText: 'Question ' + n,
      correctAnswer: Array.isArray(a) ? a.join(' / ') : a, explanation: explanations[n] || '',
    })),
  };
}
// Short-answer / sentence completion, one question per line.
function qFill(n, instruction, qs, groupTitle) {
  return {
    groupType: 'plain', groupTitle: groupTitle || '', instruction,
    questions: qs.map(([text, ans, explanation], i) => ({
      questionNumber: n + i, type: 'fill-blank', questionText: text,
      correctAnswer: Array.isArray(ans) ? ans.join(' / ') : ans, explanation: explanation || '',
    })),
  };
}

// Reading YES/NO/NOT GIVEN (writer's views). qs: [text, 'YES'|'NO'|'NOT GIVEN', expl]
function qYNNG(n, instruction, qs, groupTitle) {
  return {
    groupType: 'plain', groupTitle: groupTitle || '', instruction,
    questions: qs.map(([text, ans, explanation], i) => ({ questionNumber: n + i, type: 'yes-no-ng', questionText: text, correctAnswer: ans, explanation: explanation || '' })),
  };
}
// Matching headings. headings: ['i text', 'ii text', …] or [['i','text'],…]; qs: ['Paragraph B', 'iv', expl]
function qHeadings(n, instruction, headings, qs, groupTitle) {
  const hs = headings.map((h) => {
    if (Array.isArray(h)) return { numeral: h[0], text: h[1] };
    const m = /^([ivxl]+)[.)]?\s+(.*)$/i.exec(String(h));
    return { numeral: m[1].toLowerCase(), text: m[2] };
  });
  return {
    groupType: 'matching-headings', groupTitle: groupTitle || '', instruction,
    headingsConfig: { headings: hs },
    questions: qs.map(([text, ans, explanation], i) => ({ questionNumber: n + i, type: 'matching-headings', questionText: text, correctAnswer: String(ans).toLowerCase(), explanation: explanation || '' })),
  };
}
// Summary completion from a word bank (drag & drop). text uses __Qn__; bank: ['A word', …] or ['word', …];
// answers: { n: 'word' } — the WORD, not its letter (that is what the UI stores).
function qSummary(instruction, text, bank, answers, explanations = {}, groupTitle) {
  const wb = bank.map((w, i) => {
    const m = /^([A-P])\s+(.*)$/.exec(String(w));
    return m && m[1] === L[i] ? { letter: m[1], word: m[2] } : { letter: L[i], word: String(w) };
  });
  for (const a of Object.values(answers)) if (!wb.some((w) => w.word === a)) throw new Error('qSummary: "' + a + '" không có trong word bank');
  return {
    groupType: 'summary-completion', groupTitle: groupTitle || '', instruction,
    summaryConfig: { text, wordBank: wb },
    questions: Object.entries(answers).map(([n, a]) => ({
      questionNumber: Number(n), type: 'fill-blank', questionText: 'Question ' + n, correctAnswer: a, explanation: explanations[n] || '',
    })),
  };
}
// Sentence endings. endings: ['A text', …]; qs: [sentence start, letter, expl]
function qEndings(n, instruction, endings, qs, groupTitle) {
  const es = endings.map((e, i) => {
    const m = /^([A-P])\s+(.*)$/.exec(String(e));
    return m && m[1] === L[i] ? { letter: m[1], text: m[2] } : { letter: L[i], text: String(e) };
  });
  return {
    groupType: 'sentence-endings', groupTitle: groupTitle || '', instruction,
    endingsConfig: { endings: es },
    questions: qs.map(([text, ans, explanation], i) => ({ questionNumber: n + i, type: 'sentence-completion', questionText: text, correctAnswer: letterOf(ans), explanation: explanation || '' })),
  };
}

// "Choose TWO/THREE letters" cluster: one question per correct letter, all sharing the
// text + options (reading-v2.js / listening.js render one checkbox list; each question
// is correct if the student's selection includes its letter).
// letters: ['B', 'D'], explanations: one per letter.
function qMulti(n, instruction, text, options, letters, explanations = [], groupTitle) {
  return {
    groupType: 'plain', groupTitle: groupTitle || '', instruction,
    questions: letters.map((l, i) => ({
      questionNumber: n + i, type: 'multi-answer-group', questionText: text, options,
      checkboxCount: letters.length, correctAnswer: letterOf(l), explanation: explanations[i] || '',
    })),
  };
}

// Listening explanation in the site's "Dịch / Vị trí / Transcript / Phân tích" format.
function lx(d, v, t, p) {
  const parts = ['Dịch: ' + d];
  if (v) parts.push('Vị trí: ' + v);
  if (t) parts.push('Transcript: ' + (Array.isArray(t) ? t : [t]).map((x) => '“' + x + '”').join(' … '));
  if (p) parts.push('Phân tích: ' + p);
  return parts.join('\n\n');
}

// Paragraph text → passage HTML (blank line = new paragraph, **bold**, ## heading).
function html(text) {
  return String(text).trim().split(/\n\s*\n/).map((p) => {
    const t = p.trim();
    if (t.startsWith('## ')) return '<h3>' + t.slice(3) + '</h3>';
    if (t.startsWith('# ')) return '<h2>' + t.slice(2) + '</h2>';
    if (t.startsWith('<')) return t;
    return '<p>' + t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') + '</p>';
  }).join('\n\n');
}

module.exports = {
  mcq, gap, match, order, cat, fix, write, speak, passage, picture, card,
  qMcq, qMulti, qTF, qTFNG, qYNNG, qMatch, qHeadings, qSummary, qEndings, qNote, qTable, qFill, lx, html,
};
