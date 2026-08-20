'use strict';

// Smart Practice Recommendation Engine (Priority 2A).
//
// Answers "what should this student practice next?" by reading ONLY data
// that already exists — weaknessService's per-skill breakdown and
// vocabBookService's aggregate stats. No new analytics, no new weakness
// computation, no AI/Gemini call: deterministic, fast, cheap, explainable.
//
// ── Scoring design ──────────────────────────────────────────────────────
// Each recommendation TYPE sits in a fixed priority TIER matching the
// product's stated ladder (Due Review > Severe Reading/Listening Weakness
// > Weak Vocabulary > Weak Writing/Speaking Criterion > General). Tiers are
// spaced 500 points apart; the within-tier modifiers below (severity/
// confidence/urgency, each 0-100) can swing a recommendation's score by at
// most ~250 points — comfortably less than the 500-point gap, so the tier
// ladder is a hard guarantee, never just a tendency a bad roll could break.
//
//   score = tier + severity*1 + confidence*0.5 + urgency*1
//
// - severity: how bad is it (0 = fine, 100 = worst). Accuracy-based for
//   Reading/Listening, band-based for Writing/Speaking, count-based for
//   weak vocabulary.
// - confidence: how much evidence backs this (0-100, saturating at
//   SAMPLE_CONFIDENCE_CAP samples). Vocabulary counts (due/weak) are exact
//   DB counts, not statistical inferences, so they get confidence:100.
// - urgency: time pressure (0-100). Only vocabulary review currently has a
//   real due-date concept; other types are 0, not faked.
// - recency: deliberately NOT implemented in V1 — weaknessService's own
//   aggregation has no per-attempt timestamp to weight by, and adding one
//   would mean either changing weaknessService's calculation (explicitly
//   out of scope) or standing up a second analytics pass (explicitly
//   forbidden). See "Known limitations" in the Priority 2A report.
const weaknessService = require('./weaknessService');
const vocabBookService = require('./vocabBookService');

// Reused verbatim from weaknessService — both services must agree on what
// "enough data" means; duplicating the number here would let them drift.
const MIN_SAMPLE_SIZE = weaknessService.MIN_SAMPLE_SIZE;

const TIER = {
  VOCAB_REVIEW: 2000,             // Priority 1 — due review
  READING_WEAK_TYPE: 1500,        // Priority 2 — severe weakness (Reading)
  LISTENING_WEAK_TYPE: 1500,      // Priority 2 — severe weakness (Listening)
  VOCAB_WEAK: 1000,               // Priority 3 — weak vocabulary
  WRITING_WEAK_CRITERION: 500,    // Priority 4 — weak IELTS skill (Writing)
  SPEAKING_WEAK_CRITERION: 500,   // Priority 4 — weak IELTS skill (Speaking)
  GENERAL_REVIEW: 100,            // Priority 5 — fallback
};

// Product-relevance bars — distinct from MIN_SAMPLE_SIZE (which gates
// statistical trust). A 90%-accurate question type or a criterion barely
// below its siblings is real data, correctly computed, but not worth
// interrupting the student about.
const READING_LISTENING_ACCURACY_BAR = 0.7; // below 70% correct -> worth flagging
const SKILL_CRITERION_GAP_BAR = 0.5;        // >=0.5 band under sibling average -> worth flagging

const VOCAB_DUE_URGENCY_CAP = 20;   // 20+ words due today -> maximum urgency
const VOCAB_WEAK_SEVERITY_CAP = 10; // 10+ weak words -> maximum severity
const SAMPLE_CONFIDENCE_CAP = 10;   // 10+ samples -> maximum confidence

// A recommendation should point at a manageable NEXT ACTION, not just
// restate a (possibly huge) backlog — "574 words due" is true but isn't
// actionable on its own. The full count stays visible as context
// (metadata.dueCount/weakCount, and in the reason text), separate from the
// capped, actually-doable session the action itself proposes.
// GET /vocabbook/review/due and GET /vocabbook/weak both already accept a
// client-supplied ?limit= (see their controllers), so a future UI can pass
// recommendedSessionSize straight through as that limit with no change to
// either endpoint or the review/SRS engine itself — see this file's header
// comment and the Priority 2A refinement report for the verification.
const DEFAULT_SESSION_SIZE = 20;
function sessionSizeFor(totalCount, defaultSize = DEFAULT_SESSION_SIZE) {
  return Math.min(totalCount, defaultSize);
}

const WRITING_CRITERIA_LABELS = { ta: 'Task Achievement', cc: 'Coherence & Cohesion', lr: 'Lexical Resource', gra: 'Grammar' };
const SPEAKING_CRITERIA_LABELS = { fluency: 'Fluency', vocabulary: 'Vocabulary', grammar: 'Grammar', pronunciation: 'Pronunciation' };

function clamp01(n) { return Math.max(0, Math.min(1, n)); }

function scoreOf(tier, { severity = 0, confidence = 0, urgency = 0 } = {}) {
  return tier + severity * 1 + confidence * 0.5 + urgency * 1;
}

function buildVocabReviewCandidate(stats) {
  if (!stats.dueToday) return null;
  const urgency = clamp01(stats.dueToday / VOCAB_DUE_URGENCY_CAP) * 100;
  const n = stats.dueToday;
  const sessionSize = sessionSizeFor(n);
  return {
    type: 'VOCAB_REVIEW',
    title: 'Review your vocabulary',
    reason: `${n} word${n === 1 ? ' is' : 's are'} due for review.`,
    // No standalone page for this action — it lives inside dashboard.html's
    // "Ôn tập hôm nay" flow (openReviewDueModal()). actionLevel is 'vocab-
    // review' rather than 'skill' since it isn't a generic skill page link.
    // label deliberately proposes the CAPPED session, not the full backlog
    // — see DEFAULT_SESSION_SIZE's comment above.
    action: { label: `Review ${sessionSize} word${sessionSize === 1 ? '' : 's'}`, href: 'dashboard.html', actionLevel: 'vocab-review' },
    metadata: { dueCount: n, recommendedSessionSize: sessionSize, sampleSize: n, confidence: 100, urgency, severity: 0 },
    score: scoreOf(TIER.VOCAB_REVIEW, { confidence: 100, urgency }),
  };
}

function buildVocabWeakCandidate(stats) {
  if (!stats.weak) return null;
  const severity = clamp01(stats.weak / VOCAB_WEAK_SEVERITY_CAP) * 100;
  const n = stats.weak;
  const sessionSize = sessionSizeFor(n);
  return {
    type: 'VOCAB_WEAK',
    title: 'Practice weak vocabulary',
    reason: `${n} word${n === 1 ? '' : 's'} in your notebook ${n === 1 ? 'has' : 'have'} been answered wrong 3+ times.`,
    // Lives inside dashboard.html's practiceWeakVocab() flow (GET
    // /vocabbook/weak), not a standalone page.
    action: { label: `Practice ${sessionSize} weak word${sessionSize === 1 ? '' : 's'}`, href: 'dashboard.html', actionLevel: 'vocab-weak' },
    metadata: { weakCount: n, recommendedSessionSize: sessionSize, sampleSize: n, confidence: 100, urgency: 0, severity },
    score: scoreOf(TIER.VOCAB_WEAK, { severity, confidence: 100 }),
  };
}

function buildSkillTypeCandidate(type, skillEntry, skillLabel, hrefPage) {
  if (!skillEntry) return null;
  if (skillEntry.accuracy >= READING_LISTENING_ACCURACY_BAR) return null; // not severe enough to surface
  const severity = clamp01(1 - skillEntry.accuracy) * 100;
  const confidence = clamp01(skillEntry.total / SAMPLE_CONFIDENCE_CAP) * 100;
  const pct = Math.round(skillEntry.accuracy * 100);
  return {
    type,
    title: `Practice ${skillLabel} — ${skillEntry.type}`,
    reason: `You scored ${pct}% correctly on "${skillEntry.type}" across your last ${skillEntry.total} attempt${skillEntry.total === 1 ? '' : 's'}.`,
    // No per-question-type filter/deep-link exists yet (confirmed in the
    // Priority 1 audit) — action correctly points at the generic skill
    // page, and actionLevel says so explicitly rather than pretending a
    // question-type filter is available.
    action: { label: `Practice ${skillLabel}`, href: hrefPage, actionLevel: 'skill' },
    metadata: { questionType: skillEntry.type, accuracy: skillEntry.accuracy, sampleSize: skillEntry.total, confidence, urgency: 0, severity },
    score: scoreOf(TIER[type], { severity, confidence }),
  };
}

function buildCriterionCandidate(type, criteriaArr, skillLabel, hrefPage, labels) {
  if (!criteriaArr?.length) return null;
  const [weakest, ...others] = criteriaArr; // already sorted ascending by weaknessService
  if (!others.length) return null; // need at least 1 sibling to judge "imbalance"
  const othersAvg = others.reduce((s, c) => s + c.avgScore, 0) / others.length;
  const gap = othersAvg - weakest.avgScore;
  if (gap < SKILL_CRITERION_GAP_BAR) return null; // not meaningfully imbalanced
  const severity = clamp01((9 - weakest.avgScore) / 9) * 100;
  const confidence = clamp01(weakest.count / SAMPLE_CONFIDENCE_CAP) * 100;
  const criterionLabel = labels[weakest.criterion] || weakest.criterion;
  return {
    type,
    title: `Practice ${skillLabel} — ${criterionLabel}`,
    reason: `Your ${criterionLabel} average is ${weakest.avgScore.toFixed(1)}, ${gap.toFixed(1)} band${gap.toFixed(1) === '1.0' ? '' : 's'} below your other ${skillLabel} criteria.`,
    action: { label: `Practice ${skillLabel}`, href: hrefPage, actionLevel: 'skill' },
    metadata: { criterion: weakest.criterion, avgScore: weakest.avgScore, sampleSize: weakest.count, confidence, urgency: 0, severity, gapFromSiblings: gap },
    score: scoreOf(TIER[type], { severity, confidence }),
  };
}

function buildGeneralReviewCandidate(hasAnyDataAtAll) {
  const score = scoreOf(TIER.GENERAL_REVIEW, {});
  if (!hasAnyDataAtAll) {
    // True onboarding case — per spec, never claim a weakness ("You are
    // weak at Reading") when there's no real signal yet.
    return {
      type: 'GENERAL_REVIEW',
      title: 'Get started',
      reason: 'Complete a few practice sessions to unlock personalized recommendations.',
      action: { label: 'Start Practicing', href: 'reading.html', actionLevel: 'skill' },
      metadata: { onboarding: true, sampleSize: 0, confidence: 0, urgency: 0, severity: 0 },
      score,
    };
  }
  return {
    type: 'GENERAL_REVIEW',
    title: 'Keep your skills balanced',
    reason: 'No specific weakness stands out in your recent activity — keep practicing across skills.',
    action: { label: 'Practice', href: 'dashboard.html', actionLevel: 'skill' },
    metadata: { onboarding: false, sampleSize: 0, confidence: 0, urgency: 0, severity: 0 },
    score,
  };
}

// Returns { recommendations, generatedAt, dataConfidence }. Every
// recommendation carries {type, priority(=rank), title, reason, action,
// metadata, score} — never text without a traceable data source (§8).
async function getRecommendations(userId) {
  const [profile, stats] = await Promise.all([
    weaknessService.getWeaknessProfile(userId),
    vocabBookService.getVocabStats(userId),
    // Deliberately NOT calling getWeakWords() here — stats.weak (from
    // getVocabStats, one aggregate we're already fetching) is the exact
    // same wrongCount>=3 count that endpoint's list would total to; the
    // recommendation only needs the count, not the word list itself, so
    // fetching the list would be a duplicate aggregation (§13).
  ]);

  const candidates = [
    buildVocabReviewCandidate(stats),
    buildVocabWeakCandidate(stats),
    buildSkillTypeCandidate('READING_WEAK_TYPE', profile.reading[0], 'Reading', 'reading.html'),
    buildSkillTypeCandidate('LISTENING_WEAK_TYPE', profile.listening[0], 'Listening', 'listening.html'),
    buildCriterionCandidate('WRITING_WEAK_CRITERION', profile.writing, 'Writing', 'writing.html', WRITING_CRITERIA_LABELS),
    buildCriterionCandidate('SPEAKING_WEAK_CRITERION', profile.speaking, 'Speaking', 'speaking.html', SPEAKING_CRITERIA_LABELS),
  ].filter(Boolean);

  candidates.sort((a, b) => b.score - a.score);
  candidates.forEach((c, i) => { c.priority = i + 1; });

  if (!candidates.length) {
    const hasAnyDataAtAll = stats.totalWords > 0; // cheapest available "not a brand-new account" signal
    const fallback = buildGeneralReviewCandidate(hasAnyDataAtAll);
    fallback.priority = 1;
    return {
      recommendations: [fallback],
      generatedAt: new Date().toISOString(),
      dataConfidence: hasAnyDataAtAll ? 'low' : 'none',
    };
  }

  return {
    recommendations: candidates,
    generatedAt: new Date().toISOString(),
    dataConfidence: candidates.length >= 3 ? 'high' : 'medium',
  };
}

module.exports = {
  getRecommendations,
  MIN_SAMPLE_SIZE,
  READING_LISTENING_ACCURACY_BAR,
  SKILL_CRITERION_GAP_BAR,
  DEFAULT_SESSION_SIZE,
};
