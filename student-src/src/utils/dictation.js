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
