'use strict';

// Pre-listening warm-up for a ListeningSection ("Synonym Hunt" + "Paraphrase
// Detectives"). Students fill it in before listening; nothing is graded.
// The answer key is teacher-only, so ListeningSection.warmUp is `select:
// false` and students only ever receive toStudentWarmUp()'s copy.
//
// Everything here is pure (no DB, no AI) so the validation that guards the
// AI output can be unit-tested on its own.

const MAX_ITEMS = 10;
const BLANK = '____';

// Lowercase, straight quotes, punctuation → space, collapsed whitespace.
// Used for every "is this phrase really in the transcript / questions"
// check, so speaker labels, line breaks and punctuation never cause a miss.
function normText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsPhrase(haystackNorm, phrase) {
  const p = normText(phrase);
  return !!p && ` ${haystackNorm} `.includes(` ${p} `);
}

const STOP = new Set(['a', 'an', 'the', 'of', 'to', 'for', 'in', 'on', 'at', 'by', 'and', 'or', 'with', 'is', 'are', 'be', 'it', 'its', 'this', 'that', 'some', 'very', 'more', 'their', 'they', 'you', 'your']);
const contentTokens = (s) => normText(s).split(' ').filter((w) => w && !STOP.has(w));
// Crude word-family key: "helmet"/"helmets", "exploiting"/"exploitation",
// "smoke"/"smoking", "centre"/"center", "organiser's"/"organizer" collide —
// a pair that only changes the word form or spelling isn't a synonym, and a
// blank of the same family isn't a paraphrase.
function stem(w) {
  const x = w.replace(/'s$/, '').replace(/our$/, 'or').replace(/tre$/, 'ter')
    .replace(/is(e|es|ed|er|ers|ing|ation|ations)$/, 'iz$1')
    .replace(/(ations?|ions?|ings?|ed|es|s|ory|ly|e)$/, '');
  return x.slice(0, 5) || w;
}
const stems = (s) => contentTokens(s).map(stem);

// Spelling variants of the same phrase ("Aster Cottage"/"Astor Cottage",
// "fund-raising"/"fundraising") — small edit distance once spaces go.
function levenshtein(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
const squash = (s) => normText(s).replace(/[^a-z0-9]/g, '');
const isSpellingVariant = (a, b) => { const x = squash(a), y = squash(b); return x.length >= 4 && y.length >= 4 && levenshtein(x, y) <= 2; };

// Every number in a text, separators dropped: "091-463-8520" → "0914638520",
// "2,000" → "2000", "January the 12th" → "12".
const numbersIn = (s) => (String(s || '').match(/\d(?:[\d,.-]|\s(?=\d))*/g) || []).map((x) => x.replace(/\D/g, '')).filter(Boolean);

// Blanks that are names or filler words ("them", "way", "doing") test
// nothing about paraphrase.
const FILLER = new Set(['them', 'him', 'her', 'his', 'us', 'we', 'i', 'me', 'way', 'thing', 'things', 'people', 'do', 'does', 'doing', 'done', 'did',
  'make', 'made', 'get', 'got', 'go', 'going', 'put', 'let', 'letting', 'take', 'took', 'than', 'only', 'also', 'around', 'there', 'here', 'one', 'ones', 'lot']);
// A phrase cut off before its noun ("view of the", "doesn't have a", "make
// several") — a trailing preposition ("attached to", "lack of") is fine.
const ENDS_WEAK = new Set(['a', 'an', 'the', 'one', 'several', 'some', 'this', 'that', 'these', 'those', 'their', 'your', 'his', 'our', 'my', 'its', 'and', 'or']);
const endsWeak = (s) => { const t = normText(s).split(' '); return ENDS_WEAK.has(t[t.length - 1]); };

// Gap markers from the question paper ("__Q1__", "___", "Q21", "…") — a
// keyword or question copied with one in it is the test gap itself.
const PLACEHOLDER_RE = /_{2,}|\bQ\d{1,2}\b|…|\.{3,}/;

const wordCount = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;

// Everything a student reads in the question paper, as plain lines: the
// keywords the warm-up pairs against must come from here.
function buildQuestionMaterial(section) {
  const lines = [];
  const push = (s) => { const t = String(s || '').trim(); if (t) lines.push(t); };
  for (const g of section.questionGroups || []) {
    push(g.instruction);
    push(g.noteConfig && g.noteConfig.title);
    (g.noteConfig && g.noteConfig.lines || []).forEach(push);
    (g.tableConfig && g.tableConfig.headers || []).forEach(push);
    (g.tableConfig && g.tableConfig.rows || []).forEach((row) => push((row || []).join(' | ')));
    (g.bulletConfig && g.bulletConfig.items || []).forEach(push);
    push(g.summaryConfig && g.summaryConfig.text);
    push(g.matchingOptionsTitle);
    (g.matchingOptions || []).forEach(push);
    (g.endingsConfig && g.endingsConfig.endings || []).forEach((e) => push(e && e.text));
    push(g.dragDropConfig && g.dragDropConfig.text);
    for (const q of g.questions || []) {
      push(`${q.questionNumber}. ${q.questionText || ''}`);
      (q.options || []).forEach(push);
    }
  }
  return lines.join('\n');
}

// The test's own answers, normalised: completion answers as phrases (plus
// their numbers), and the numbers in a correct MC/matching option ("2,000"
// passengers). The warm-up is done BEFORE listening, so no item may contain
// one: a blank whose answer is "litter" for "keep the beach free of __Q1__"
// just hands out Q1. Digit-only entries are matched as numbers.
function buildTestAnswers(section) {
  const out = new Set();
  for (const g of section.questionGroups || []) {
    for (const q of g.questions || []) {
      const raw = String(q.correctAnswer || '');
      for (const alt of raw.split(/\s*(?:\/|\||;|\bor\b)\s*/i)) {
        for (const variant of [alt.replace(/\([^)]*\)/g, ' '), alt.replace(/[()]/g, ' ')]) {
          const n = normText(variant);
          if (!n || n.split(' ').every((w) => w.length === 1)) continue; // "A", "B C"
          out.add(n);
          numbersIn(variant).forEach((d) => out.add(d));
        }
      }
      // Letter answers: the chosen option's numbers ("C" → "about 2,000").
      for (const letter of raw.toUpperCase().match(/\b[A-Z]\b/g) || []) {
        const i = letter.charCodeAt(0) - 65;
        const opt = (q.options && q.options[i]) || (g.matchingOptions && g.matchingOptions[i]) || '';
        numbersIn(opt).forEach((d) => out.add(d));
      }
    }
  }
  return [...out];
}

// Teacher explanations quote where each answer is in the transcript — a
// strong hint for the generator about which paraphrases the test targets.
function buildExplanationHints(section) {
  const out = [];
  for (const g of section.questionGroups || []) {
    for (const q of g.questions || []) {
      const e = String(q.explanation || '').trim();
      if (e) out.push(`Q${q.questionNumber}: ${e.replace(/\s+/g, ' ').slice(0, 400)}`);
    }
  }
  return out.join('\n');
}

const cleanStr = (s, max) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, max);

// Any run of 2+ underscores becomes the single canonical blank.
function canonicalBlank(evidence) {
  return cleanStr(evidence, 300).replace(/_{2,}/g, BLANK);
}

/**
 * Keeps only AI items that are provably grounded:
 *  - synonyms: keyword appears in the question paper; every " / "
 *    alternative of the answer appears verbatim in the transcript.
 *  - paraphrases: question appears in the question paper; evidence has
 *    exactly one blank and evidence-with-answer appears verbatim in the
 *    transcript.
 * Returns { synonyms, paraphrases, dropped } — dropped lists the reasons.
 */
function validateWarmUp(raw, { transcript, questionMaterial, testAnswers = [] }) {
  const tNorm = normText(transcript);
  const qNorm = normText(questionMaterial);
  const leaksAnswer = (text) => {
    const nums = new Set(numbersIn(text));
    const norm = normText(text);
    return testAnswers.some((a) => (/^\d+$/.test(a) ? nums.has(a) : containsPhrase(norm, a)));
  };
  const dropped = [];
  const synonyms = [];
  const paraphrases = [];
  const seenKw = new Set();
  const seenQ = new Set();

  for (const it of Array.isArray(raw && raw.synonyms) ? raw.synonyms : []) {
    const keyword = cleanStr(it && it.keyword, 120);
    const answer = cleanStr(it && it.answer, 160);
    if (!keyword || !answer) { dropped.push('syn:empty'); continue; }
    const k = normText(keyword);
    if (seenKw.has(k)) { dropped.push(`syn:dup "${keyword}"`); continue; }
    if (!containsPhrase(qNorm, keyword)) { dropped.push(`syn:keyword-not-in-questions "${keyword}"`); continue; }
    if (wordCount(keyword) > 6) { dropped.push(`syn:keyword-too-long "${keyword}"`); continue; }
    if (PLACEHOLDER_RE.test(keyword)) { dropped.push(`syn:keyword-has-gap "${keyword}"`); continue; }
    if (!contentTokens(keyword).some((w) => w.length >= 3)) { dropped.push(`syn:keyword-too-weak "${keyword}"`); continue; }
    if (endsWeak(keyword)) { dropped.push(`syn:keyword-fragment "${keyword}"`); continue; }
    const alts = answer.split(/\s+\/\s+/).map((a) => a.trim()).filter(Boolean);
    if (alts.some((a) => wordCount(a) > 7)) { dropped.push(`syn:answer-too-long "${answer}"`); continue; }
    if (!alts.length || alts.some((a) => !containsPhrase(tNorm, a))) { dropped.push(`syn:answer-not-in-transcript "${answer}"`); continue; }
    // "earplugs ≈ pair of earplugs" isn't a synonym — the answer must reword it.
    if (alts.some((a) => containsPhrase(normText(a), keyword))) { dropped.push(`syn:answer-repeats-keyword "${keyword}"`); continue; }
    // "swimming togs ≈ togs", "safety helmet ≈ helmets" — nothing new to learn.
    const kwStems = new Set(stems(keyword));
    if (alts.every((a) => stems(a).every((w) => kwStems.has(w)))) { dropped.push(`syn:answer-adds-nothing "${answer}"`); continue; }
    if (alts.some((a) => isSpellingVariant(a, keyword))) { dropped.push(`syn:spelling-variant "${keyword}" ≈ "${answer}"`); continue; }
    if (alts.some(leaksAnswer)) { dropped.push(`syn:gives-test-answer "${answer}"`); continue; }
    seenKw.add(k);
    synonyms.push({ keyword, answer: alts.join(' / ') });
  }

  for (const it of Array.isArray(raw && raw.paraphrases) ? raw.paraphrases : []) {
    const question = cleanStr(it && it.question, 160);
    const evidence = canonicalBlank(it && it.evidence);
    const answer = cleanStr(it && it.answer, 60);
    if (!question || !evidence || !answer) { dropped.push('para:empty'); continue; }
    const q = normText(question);
    if (seenQ.has(q)) { dropped.push(`para:dup "${question}"`); continue; }
    if (!containsPhrase(qNorm, question)) { dropped.push(`para:question-not-in-questions "${question}"`); continue; }
    if (PLACEHOLDER_RE.test(question)) { dropped.push(`para:question-has-gap "${question}"`); continue; }
    if (wordCount(question) < 3 || contentTokens(question).length < 2 || endsWeak(question)) { dropped.push(`para:question-fragment "${question}"`); continue; }
    if (evidence.split(BLANK).length !== 2) { dropped.push(`para:blank-count "${evidence}"`); continue; }
    if (wordCount(answer) > 4) { dropped.push(`para:answer-too-long "${answer}"`); continue; }
    if (wordCount(evidence) > 30) { dropped.push(`para:evidence-too-long "${evidence}"`); continue; }
    if (!containsPhrase(tNorm, evidence.replace(BLANK, answer))) { dropped.push(`para:evidence-not-in-transcript "${evidence}" + "${answer}"`); continue; }
    // The blank must be the paraphrase — a word lifted straight from the
    // question ("presenters" for "... marking male presenters", "a torch"
    // for "torch") trains nothing.
    const qStems = new Set(stems(question));
    const ansStems = stems(answer);
    if (!ansStems.length || ansStems.some((w) => qStems.has(w))) { dropped.push(`para:answer-repeats-question "${answer}"`); continue; }
    if (!contentTokens(answer).some((w) => !FILLER.has(w) && w.length >= 3)) { dropped.push(`para:filler-blank "${answer}"`); continue; }
    // A capitalised blank mid-sentence ("It's called ____" → "Jemima") is a name.
    if (evidence.indexOf(BLANK) > 0 && answer.split(/\s+/).every((w) => /^[A-Z][a-z'’-]+$/.test(w))) { dropped.push(`para:name-blank "${answer}"`); continue; }
    // Neither the blank nor the visible excerpt may give away a test answer.
    if (leaksAnswer(evidence.replace(BLANK, answer))) { dropped.push(`para:gives-test-answer "${evidence}" + "${answer}"`); continue; }
    // Same transcript spot under a reworded question = duplicate.
    const spot = normText(evidence.replace(BLANK, answer));
    if (seenQ.has(spot)) { dropped.push(`para:dup-evidence "${evidence}"`); continue; }
    seenQ.add(spot);
    seenQ.add(q);
    paraphrases.push({ question, evidence, answer });
  }

  return { synonyms: synonyms.slice(0, MAX_ITEMS), paraphrases: paraphrases.slice(0, MAX_ITEMS), dropped };
}

// Merges validated item lists from several AI passes (first pass wins on a
// duplicate), capped at MAX_ITEMS, ordered the way students meet them:
// synonyms by where the keyword sits in the question paper, paraphrases by
// where the evidence is heard in the transcript.
function mergeWarmUps(parts, { transcript, questionMaterial }) {
  const tNorm = normText(transcript);
  const qNorm = normText(questionMaterial);
  const pos = (hay, phrase) => { const i = ` ${hay} `.indexOf(` ${normText(phrase)} `); return i < 0 ? Infinity : i; };
  const uniq = (items, key) => { const seen = new Set(); return items.filter((x) => { const k = normText(key(x)); if (seen.has(k)) return false; seen.add(k); return true; }); };
  const synonyms = uniq(parts.flatMap((p) => p.synonyms || []), (x) => x.keyword)
    .sort((a, b) => pos(qNorm, a.keyword) - pos(qNorm, b.keyword)).slice(0, MAX_ITEMS);
  const paraphrases = uniq(uniq(parts.flatMap((p) => p.paraphrases || []), (x) => x.question), (x) => x.evidence.replace(BLANK, x.answer))
    .sort((a, b) => pos(tNorm, a.evidence.replace(BLANK, a.answer)) - pos(tNorm, b.evidence.replace(BLANK, b.answer))).slice(0, MAX_ITEMS);
  return { synonyms, paraphrases };
}

// What students get: prompts only, never an answer.
function toStudentWarmUp(warmUp) {
  if (!warmUp) return null;
  const synonyms = (warmUp.synonyms || []).map((s) => ({ keyword: s.keyword }));
  const paraphrases = (warmUp.paraphrases || []).map((p) => ({ question: p.question, evidence: p.evidence }));
  if (!synonyms.length && !paraphrases.length) return null;
  return { synonyms, paraphrases };
}

// Admin hand-edits: trimmed strings, capped lengths and counts, empty rows
// dropped. No grounding check — a teacher may deliberately reword.
function sanitizeWarmUpInput(body) {
  const b = body || {};
  const synonyms = (Array.isArray(b.synonyms) ? b.synonyms : [])
    .map((s) => ({ keyword: cleanStr(s && s.keyword, 120), answer: cleanStr(s && s.answer, 160) }))
    .filter((s) => s.keyword)
    .slice(0, 20);
  const paraphrases = (Array.isArray(b.paraphrases) ? b.paraphrases : [])
    .map((p) => ({ question: cleanStr(p && p.question, 160), evidence: canonicalBlank(p && p.evidence), answer: cleanStr(p && p.answer, 60) }))
    .filter((p) => p.question && p.evidence)
    .slice(0, 20);
  return { synonyms, paraphrases };
}

module.exports = {
  BLANK, MAX_ITEMS,
  normText, buildQuestionMaterial, buildExplanationHints, buildTestAnswers,
  validateWarmUp, mergeWarmUps, toStudentWarmUp, sanitizeWarmUpInput,
};
