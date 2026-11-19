// Grading for the Dictation page (same rules as js/dictation.js).

export function fmtTime(seconds) {
  const s = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

// Curly apostrophes count as a plain ' (transcripts use ’, keyboards ')
export const normWord = (w) => w.toLowerCase().replace(/[’‘ʼ`´]/g, "'").replace(/[^a-z0-9']/g, '');

// Scorable words; pure punctuation tokens ("–", "…") are dropped
export const dictWords = (text) => (text || '').trim().split(/\s+/).filter((w) => normWord(w) !== '');

// A drill answer: hyphens split ("091-463-8520"), consecutive digit groups
// join ("0491 577 248" = "0491577248") so the grouping never matters.
export function answerWords(text) {
  const out = [];
  let joinNext = false;
  for (const w of (text || '').replace(/[-–—]/g, ' ').split(/\s+/).filter((x) => normWord(x) !== '')) {
    const digits = /^\d+$/.test(normWord(w));
    if (digits && joinNext) out[out.length - 1] += w; else out.push(w);
    joinNext = digits;
  }
  return out;
}

// LCS word alignment → ordered ops: ok (typed word matches), bad (typed word
// with no match), gap (reference word not typed). `r` = reference word index.
export function alignWords(typedWords, refWords) {
  const n = typedWords.length;
  const m = refWords.length;
  const a = typedWords.map(normWord);
  const b = refWords.map(normWord);
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const ops = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) { ops.push({ type: 'ok', word: typedWords[i - 1], r: j - 1 }); i--; j--; }
    else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) { ops.push({ type: 'bad', word: typedWords[i - 1] }); i--; }
    else { ops.push({ type: 'gap', r: j - 1 }); j--; }
  }
  return ops.reverse();
}

// One check of what was typed for a sentence (a drill grades only `answer`)
export function gradeSentence(typed, sentence) {
  const isDrill = !!sentence.answer;
  const refWords = isDrill ? answerWords(sentence.answer) : dictWords(sentence.text);
  const typedWords = isDrill ? answerWords(typed) : dictWords(typed);
  const ops = alignWords(typedWords, refWords);
  const okRefs = new Set(ops.filter((o) => o.type === 'ok').map((o) => o.r));
  let perfect = okRefs.size === refWords.length && typedWords.length === refWords.length;
  // A name / number also counts when only the spacing differs ("se100dx")
  if (isDrill && !perfect && typedWords.map(normWord).join('') === refWords.map(normWord).join('')) perfect = true;

  // The first reference word not typed right, and the typed word standing in
  // for it (a misspelling): "Show answer immediately" reveals that word.
  let firstWrong = -1;
  let typedFor = '';
  if (!perfect) {
    firstWrong = refWords.findIndex((_, r) => !okRefs.has(r));
    let run = []; // unmatched ops between two matched words
    for (const o of ops) {
      if (o.type !== 'ok') { run.push(o); continue; }
      if (run.some((x) => x.type === 'gap' && x.r === firstWrong)) break;
      run = [];
    }
    typedFor = run.find((o) => o.type === 'bad')?.word || '';
  }
  return {
    refCount: refWords.length,
    okRefs: perfect ? new Set(refWords.map((_, r) => r)) : okRefs,
    firstWrong, typedFor, perfect,
  };
}

// The masked answer line: { kind: 'ok' | 'show' | 'hide', word } per word
export function maskWords(sentence, result, showAnswer) {
  const isDrill = !!sentence.answer;
  const words = isDrill ? sentence.answer.split(/\s+/).filter(Boolean) : dictWords(sentence.text);
  // A drill's digit groups were joined for scoring: reveal a group only when
  // the whole joined token was right.
  const scored = isDrill ? answerWords(sentence.answer) : words;
  let at = 0;
  let joined = '';
  return words.map((word) => {
    const r = at;
    joined += normWord(word);
    if (joined === normWord(scored[at] || '')) { at += 1; joined = ''; }
    if (result.okRefs.has(r)) return { kind: 'ok', word };
    if (showAnswer && r === result.firstWrong) return { kind: 'show', word };
    return { kind: 'hide', word: word.replace(/[A-Za-z0-9]/g, '*') };
  });
}

// Where the revealed word first differs from what was typed, or -1
export function firstDiff(word, typed) {
  if (!typed) return -1;
  const b = typed.toLowerCase();
  let k = 0;
  while (k < word.length && k < b.length && word[k].toLowerCase() === b[k]) k += 1;
  return k < word.length ? k : -1;
}

// A sentence counts as done from this share of its words right (a drill's
// name / number still has to be exact).
export const PASS_RATIO = 0.8;

function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

// Close enough to be the same word misspelt ("recieve" for "receive")
export function isTypo(typed, word) {
  const a = normWord(typed);
  const b = normWord(word);
  if (!a || !b) return false;
  const dist = editDistance(a, b);
  return dist <= Math.max(1, Math.floor(b.length / 3));
}

// The check, word by word in the sentence's order:
//   ok    — typed right
//   typo  — a typed word standing in for it, spelt wrong (or another word)
//   miss  — not typed at all
//   extra — typed but not in the sentence
// plus the counts and the score. `word` is the sentence's own spelling.
export function diffSentence(typed, sentence) {
  const isDrill = !!sentence.answer;
  const refWords = isDrill ? answerWords(sentence.answer) : dictWords(sentence.text);
  const typedWords = isDrill ? answerWords(typed) : dictWords(typed);
  const ops = alignWords(typedWords, refWords);
  const tokens = [];
  let run = [];
  const flush = () => {
    const bads = run.filter((o) => o.type === 'bad');
    const gaps = run.filter((o) => o.type === 'gap');
    // pair them up in order: a typed word in the place of a missing one
    gaps.forEach((g, k) => {
      const b = bads[k];
      if (b) tokens.push({ kind: isTypo(b.word, refWords[g.r]) ? 'typo' : 'wrong', typed: b.word, word: refWords[g.r], r: g.r });
      else tokens.push({ kind: 'miss', word: refWords[g.r], r: g.r });
    });
    bads.slice(gaps.length).forEach((b) => tokens.push({ kind: 'extra', typed: b.word }));
    run = [];
  };
  for (const o of ops) {
    if (o.type === 'ok') { flush(); tokens.push({ kind: 'ok', word: refWords[o.r], r: o.r }); } else run.push(o);
  }
  flush();
  const count = (k) => tokens.filter((t) => t.kind === k).length;
  const ok = count('ok');
  const total = refWords.length;
  let perfect = ok === total && !count('extra');
  if (isDrill && !perfect && typedWords.map(normWord).join('') === refWords.map(normWord).join('')) perfect = true;
  const ratio = perfect ? 1 : total ? ok / total : 0;
  return {
    tokens: perfect ? refWords.map((word, r) => ({ kind: 'ok', word, r })) : tokens,
    ok: perfect ? total : ok, total, ratio, perfect,
    passed: perfect || (!isDrill && ratio >= PASS_RATIO),
    typos: perfect ? 0 : count('typo'), wrong: perfect ? 0 : count('wrong'),
    missing: perfect ? 0 : count('miss'), extra: perfect ? 0 : count('extra'),
  };
}
