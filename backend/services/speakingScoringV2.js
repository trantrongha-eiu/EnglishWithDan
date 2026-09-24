'use strict';

/**
 * speakingScoringV2 — validates and normalises the AI's "speaking-v2"
 * criterion-by-criterion analysis (see geminiService.buildSpeakingGradingPrompt)
 * BEFORE anything is saved or shown. The model is asked for evidence-backed
 * output, but a prompt is advisory — this is where it actually holds:
 *
 *  - every quoted piece of evidence is checked against what the candidate
 *    really said; quotes that can't be found are dropped (never shown as
 *    "evidence" the student didn't produce);
 *  - bands are snapped to whole/half bands in 0–9;
 *  - Pronunciation is forced to "not assessable" (band null, no evidence)
 *    unless the real recording was actually heard — a transcript cannot show
 *    pronunciation, so nothing is guessed;
 *  - the overall band is calculated here from the criterion bands (IELTS
 *    half-band rounding), not taken from the model; without Pronunciation it
 *    is the mean of the three assessable criteria and flagged provisional;
 *  - the flat fields older consumers read (fluency / vocabulary / grammar /
 *    pronunciation, strengths, mistakes, vocabUpgrades, improvements,
 *    todaysFocus) are derived from the detailed analysis, so the Speaking
 *    course, Entrance Test, mock test and stats keep working unchanged.
 *
 * Pure functions only (no DB / network) — unit-tested in
 * tests/unit/services/speakingScoringV2.test.js.
 */

const SCORING_VERSION = 'speaking-v2';
const CRITERIA = ['fluencyCoherence', 'lexicalResource', 'grammaticalRangeAccuracy', 'pronunciation'];
// Legacy flat field for each criterion (SpeakingAttempt.aiFeedback, every
// existing UI / stats query).
const LEGACY_KEY = {
  fluencyCoherence: 'fluency',
  lexicalResource: 'vocabulary',
  grammaticalRangeAccuracy: 'grammar',
  pronunciation: 'pronunciation',
};
const LEVELS = ['low', 'moderate', 'high'];
const LEXICAL_FEATURES = ['lowFrequency', 'idioms', 'phrasalVerbs', 'collocations', 'paraphrasing'];
const ERROR_PATTERNS = ['none', 'occasional', 'frequent', 'systematic'];
const NO_AUDIO_REASON = 'Không có bản ghi âm — không thể đánh giá phát âm chỉ từ văn bản.';

// ── small coercion helpers ───────────────────────────────────────────────

function str(v, max = 600) {
  if (v == null) return '';
  const s = (typeof v === 'string' ? v : String(v)).replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s;
}

// Object-shaped list items (a model returning {text:"…"} instead of "…")
// are flattened instead of rendering "[object Object]".
function strList(arr, maxItems, maxLen = 300) {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => {
    if (typeof item === 'string') return str(item, maxLen);
    if (item && typeof item === 'object') {
      const c = item.text || item.point || item.strength || item.weakness || item.suggestion
        || item.content || item.description || Object.values(item).find(v => typeof v === 'string');
      return str(c, maxLen);
    }
    return item == null ? '' : str(item, maxLen);
  }).filter(Boolean).slice(0, maxItems);
}

function level(v) {
  const s = String(v || '').toLowerCase().trim();
  if (LEVELS.includes(s)) return s;
  if (/^(good|generally|mostly|fair|medium|mid)/.test(s)) return 'moderate';
  if (/^(very high|strong|wide|excellent)/.test(s)) return 'high';
  if (/^(weak|poor|limited|very low)/.test(s)) return 'low';
  return '';
}

// IELTS half-band convention: .25 → up to .5, .75 → up to the next whole.
function roundToHalfBand(n) {
  return Math.round(n * 2) / 2;
}

function toBand(v) {
  if (v === null || v === undefined || v === '') return null;
  // Tolerate "6.5" / "6.0 (approx.)" from engines without a JSON schema.
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(9, Math.max(0, roundToHalfBand(n)));
}

// ── quote verification ───────────────────────────────────────────────────

function normForMatch(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[‘’`]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Only the candidate's own words count as evidence: in the multi-answer
// session format ("Q1 (Part 1): question\nA1: answer") the examiner lines
// are removed and the "A1:" labels stripped.
function candidateText(transcript) {
  return String(transcript || '')
    .split('\n')
    .filter(line => !/^\s*Q\d+\s*\(Part\s*\d\)\s*:/i.test(line))
    .map(line => line.replace(/^\s*A\d+\s*:\s*/i, ''))
    .join('\n');
}

// Word-level LCS length (quotes are short, so the O(n·m) table is tiny).
function lcs(a, b) {
  const dp = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let prev = 0;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev + 1 : Math.max(dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[b.length];
}

// True when `quote` is really something the candidate said. Exact
// (normalised) substring first; then each "…"-separated fragment on its
// own; then a tolerant word-level match (≥ 85% of the quote's words, in
// order, inside one window of the transcript) so speech-to-text
// punctuation or a dropped filler word doesn't throw out a genuine quote.
function makeQuoteChecker(transcript) {
  const norm = normForMatch(candidateText(transcript));
  const words = norm ? norm.split(' ') : [];
  function fragmentFound(fragment) {
    const q = normForMatch(fragment);
    if (!q) return false;
    if (` ${norm} `.includes(` ${q} `) || (q.length >= 6 && norm.includes(q))) return true;
    const qw = q.split(' ');
    if (qw.length < 3) return false;
    const win = qw.length + 2;
    for (let i = 0; i + 1 <= Math.max(1, words.length - qw.length + 1); i++) {
      if (lcs(qw, words.slice(i, i + win)) / qw.length >= 0.85) return true;
    }
    return false;
  }
  return function quoteFound(quote) {
    const fragments = String(quote || '').split(/\.{3,}|…|\s-{2,}\s/).map(f => f.trim()).filter(f => normForMatch(f));
    if (!fragments.length) return false;
    return fragments.every(fragmentFound);
  };
}

// ── per-criterion normalisation ──────────────────────────────────────────

function normEvidence(arr, found, stats, max = 4) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const e of arr) {
    if (!e || typeof e !== 'object') continue;
    const quote = str(e.studentQuote || e.quote, 300);
    if (!quote) continue;
    if (!found(quote)) { stats.droppedQuotes++; continue; }
    stats.verifiedQuotes++;
    out.push({
      studentQuote: quote,
      feature: str(e.feature, 120),
      evaluation: str(e.evaluation || e.assessment, 400),
      positive: e.positive !== false,
    });
    if (out.length >= max) break;
  }
  return out;
}

function normLimitations(arr, found, stats, max = 4) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const l of arr) {
    if (!l || typeof l !== 'object') continue;
    const quote = str(l.studentQuote || l.original || l.quote, 300);
    const problem = str(l.problem || l.issue, 300);
    if (!quote && !problem) continue;
    if (quote && !found(quote)) { stats.droppedQuotes++; continue; }
    if (quote) stats.verifiedQuotes++;
    out.push({
      studentQuote: quote,
      problem,
      correction: str(l.correction || l.corrected, 300),
      explanation: str(l.explanation || l.reason, 400),
    });
    if (out.length >= max) break;
  }
  return out;
}

function normFeatureList(arr, found, stats) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const f of arr) {
    if (!f || typeof f !== 'object') continue;
    const quote = str(f.studentQuote || f.quote, 200);
    if (!quote) continue;
    if (!found(quote)) { stats.droppedQuotes++; continue; }
    stats.verifiedQuotes++;
    out.push({ studentQuote: quote, natural: f.natural !== false, assessment: str(f.assessment || f.evaluation, 300) });
    if (out.length >= 3) break;
  }
  return out;
}

function normRepetition(arr, found) {
  if (!Array.isArray(arr)) return [];
  return arr.map(r => {
    if (!r || typeof r !== 'object') return null;
    const word = str(r.word, 60);
    const count = Math.round(Number(r.count));
    if (!word || !found(word) || !Number.isFinite(count) || count < 2) return null;
    return { word, count, alternatives: strList(r.alternatives, 4, 60) };
  }).filter(Boolean).slice(0, 3);
}

function normCriterion(key, raw, found, stats) {
  const c = raw && typeof raw === 'object' ? raw : {};
  const out = {
    band: toBand(c.band),
    descriptorMatch: strList(c.descriptorMatch, 3, 200),
    strengths: strList(c.strengths, 3),
    weaknesses: strList(c.weaknesses, 3),
    evidence: normEvidence(c.evidence, found, stats),
    limitations: normLimitations(c.limitations, found, stats),
    rangeLevel: level(c.rangeLevel),
    accuracyLevel: level(c.accuracyLevel),
    flexibilityLevel: level(c.flexibilityLevel),
    appropriacyLevel: level(c.appropriacyLevel),
    feedback: str(c.feedback, 1200),
    nextStep: str(c.nextStep, 600),
  };
  if (key === 'lexicalResource') {
    const f = c.features && typeof c.features === 'object' ? c.features : {};
    out.features = {};
    for (const k of LEXICAL_FEATURES) out.features[k] = normFeatureList(f[k], found, stats);
    out.features.repetition = normRepetition(f.repetition, found);
  }
  if (key === 'grammaticalRangeAccuracy') {
    out.structures = (Array.isArray(c.structures) ? c.structures : []).map(s => {
      if (!s || typeof s !== 'object') return null;
      const type = str(s.type, 80);
      const quote = str(s.studentQuote || s.quote, 300);
      if (!type) return null;
      if (quote && !found(quote)) { stats.droppedQuotes++; return null; }
      if (quote) stats.verifiedQuotes++;
      return { type, studentQuote: quote, correct: s.correct !== false };
    }).filter(Boolean).slice(0, 6);
    const d = c.errorDensity && typeof c.errorDensity === 'object' ? c.errorDensity : {};
    const int = v => { const n = Math.round(Number(v)); return Number.isFinite(n) && n >= 0 ? n : 0; };
    const pattern = String(d.pattern || '').toLowerCase().trim();
    out.errorDensity = {
      clauses: int(d.clauses), errors: int(d.errors), minor: int(d.minor), major: int(d.major),
      pattern: ERROR_PATTERNS.includes(pattern) ? pattern : '',
    };
  }
  return out;
}

function notAssessablePronunciation(reason) {
  return {
    assessable: false,
    band: null,
    reason: reason || NO_AUDIO_REASON,
    descriptorMatch: [], strengths: [], weaknesses: [], evidence: [], limitations: [],
    rangeLevel: '', accuracyLevel: '', flexibilityLevel: '', appropriacyLevel: '',
    feedback: 'Phần phát âm chưa được chấm vì hệ thống không có bản ghi âm của bạn — văn bản không thể cho biết bạn phát âm thế nào.',
    nextStep: 'Lần sau hãy ghi âm câu trả lời (cho phép micro) để AI nghe và chấm phát âm.',
  };
}

// ── public ───────────────────────────────────────────────────────────────

function isV2(raw) {
  return !!(raw && typeof raw === 'object' && raw.criteria && typeof raw.criteria === 'object');
}

/**
 * @param {object} raw          the model's parsed JSON (speaking-v2 shape)
 * @param {object} ctx
 * @param {string} ctx.transcript  what the candidate said (client STT/typed,
 *                                 or empty when the AI transcribed the audio)
 * @param {boolean} ctx.heardAudio the grading engine really received the audio
 * @param {function} [ctx.applyFloor] (legacyFlatFeedback) => void — the
 *                                 speakingService minimum-band-floor rule,
 *                                 applied to the assessable criteria
 */
function normalizeSpeakingV2(raw, { transcript = '', heardAudio = false, applyFloor } = {}) {
  const aiTranscript = heardAudio && typeof raw.transcript === 'string' ? raw.transcript.trim() : '';
  // Evidence is checked against what was actually said — the AI's own
  // transcription when the client had none.
  const evalTranscript = String(transcript || '').trim() || aiTranscript;
  const found = makeQuoteChecker(evalTranscript);
  const stats = { verifiedQuotes: 0, droppedQuotes: 0 };

  const criteria = {};
  for (const key of CRITERIA) criteria[key] = normCriterion(key, raw.criteria[key], found, stats);

  const rawPron = raw.criteria.pronunciation || {};
  const pronAssessable = heardAudio && rawPron.assessable !== false && criteria.pronunciation.band != null;
  if (pronAssessable) {
    criteria.pronunciation.assessable = true;
    criteria.pronunciation.reason = '';
  } else {
    criteria.pronunciation = notAssessablePronunciation(
      heardAudio ? (str(rawPron.reason, 300) || 'Bản ghi âm không đủ rõ để đánh giá phát âm.') : NO_AUDIO_REASON
    );
  }

  const anyEvidence = CRITERIA.some(k => criteria[k].evidence.length || criteria[k].limitations.length || criteria[k].strengths.length);
  const noGenuineAnswer = raw.noGenuineAnswer === true || !anyEvidence;

  // A real answer with a core criterion left unscored is an unusable
  // analysis — refuse it (gradeSpeaking then tries the next engine) rather
  // than inventing a 0 that would drag the overall band down.
  if (!noGenuineAnswer) {
    const missing = ['fluencyCoherence', 'lexicalResource', 'grammaticalRangeAccuracy'].filter(k => criteria[k].band == null);
    if (missing.length) {
      const err = new Error(`AI analysis is missing a band for: ${missing.join(', ')}`);
      err.code = 'INVALID_AI_OUTPUT';
      throw err;
    }
  }

  // Flat legacy bands (assessable criteria only), floor rule, write back.
  const flat = {};
  for (const key of CRITERIA) {
    if (key === 'pronunciation' && !pronAssessable) { flat.pronunciation = null; continue; }
    flat[LEGACY_KEY[key]] = noGenuineAnswer ? 0 : criteria[key].band;
  }
  if (!noGenuineAnswer && typeof applyFloor === 'function') applyFloor(flat);
  for (const key of CRITERIA) {
    if (key === 'pronunciation' && !pronAssessable) continue;
    criteria[key].band = flat[LEGACY_KEY[key]];
  }

  const assessed = ['fluency', 'vocabulary', 'grammar', ...(pronAssessable ? ['pronunciation'] : [])].map(k => flat[k]);
  const overallBand = roundToHalfBand(assessed.reduce((s, b) => s + b, 0) / assessed.length);

  const priorityImprovements = noGenuineAnswer
    ? ['Hãy trả lời câu hỏi để nhận đánh giá.']
    : strList(raw.priorityImprovements, 3, 400);

  const lex = criteria.lexicalResource;
  const gra = criteria.grammaticalRangeAccuracy;
  // Legacy "mistakes": the real errors, grammar first then vocabulary —
  // also what the practice page highlights inside the transcript.
  const mistakes = [...gra.limitations, ...lex.limitations]
    .filter(l => l.studentQuote && l.correction)
    .slice(0, 5)
    .map(l => ({ original: l.studentQuote, corrected: l.correction, reason: l.explanation || l.problem }));
  const vocabUpgrades = (lex.features ? lex.features.repetition : [])
    .filter(r => r.alternatives.length)
    .map(r => ({ original: r.word, upgrade: r.alternatives.join(' / '), reason: `Bạn dùng "${r.word}" khoảng ${r.count} lần — thay bằng từ cụ thể hơn cho đa dạng.` }));
  const strengths = [];
  for (const key of CRITERIA) {
    const s = criteria[key].strengths[0];
    if (s && strengths.length < 3) strengths.push(s);
  }

  const memorisedLanguage = (Array.isArray(raw.memorisedLanguage) ? raw.memorisedLanguage : [])
    .map(m => (m && typeof m === 'object' ? { studentQuote: str(m.studentQuote || m.quote, 300), note: str(m.note, 300) } : null))
    .filter(m => m && m.studentQuote && found(m.studentQuote))
    .slice(0, 2);
  const partAnalysis = (Array.isArray(raw.partAnalysis) ? raw.partAnalysis : [])
    .map(p => (p && typeof p === 'object' ? { part: Number(p.part) || null, comment: str(p.comment, 500) } : null))
    .filter(p => p && p.part && p.comment)
    .slice(0, 3);

  if (noGenuineAnswer) {
    for (const key of CRITERIA) {
      if (key === 'pronunciation' && !pronAssessable) continue;
      Object.assign(criteria[key], { descriptorMatch: [], strengths: [], weaknesses: [], evidence: [], limitations: [] });
      if (criteria[key].features) for (const k of Object.keys(criteria[key].features)) criteria[key].features[k] = [];
      if (criteria[key].structures) criteria[key].structures = [];
    }
  }

  const out = {
    scoringVersion: SCORING_VERSION,
    overallBand,
    provisional: !pronAssessable,
    pronunciationAssessable: pronAssessable,
    fluency: flat.fluency,
    vocabulary: flat.vocabulary,
    grammar: flat.grammar,
    pronunciation: pronAssessable ? flat.pronunciation : null,
    criteria,
    priorityImprovements,
    memorisedLanguage: noGenuineAnswer ? [] : memorisedLanguage,
    partAnalysis: noGenuineAnswer ? [] : partAnalysis,
    overallFeedback: str(raw.overallFeedback, 1000),
    todaysFocus: priorityImprovements[0] || '',
    strengths: noGenuineAnswer ? [] : strengths,
    mistakes: noGenuineAnswer ? [] : mistakes,
    vocabUpgrades: noGenuineAnswer ? [] : vocabUpgrades,
    improvements: noGenuineAnswer ? [] : priorityImprovements,
    noGenuineAnswer,
    qualityCheck: stats,
    analyzedAt: new Date(),
  };
  if (aiTranscript) out.transcript = aiTranscript;
  return out;
}

module.exports = {
  SCORING_VERSION,
  CRITERIA,
  NO_AUDIO_REASON,
  isV2,
  normalizeSpeakingV2,
  makeQuoteChecker,
  candidateText,
  roundToHalfBand,
  toBand,
};
