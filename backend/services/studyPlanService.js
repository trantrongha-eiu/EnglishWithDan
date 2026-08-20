'use strict';

// Study Plan engine (Priority 2B). Answers "how should I distribute my
// available study time before my exam?" — a distinct layer from the
// Recommendation Engine ("what should I practice next based on my current
// data?") and the Goal ("what outcome am I trying to achieve?"). See
// architecture note at the bottom of this file.
//
// Reuses, never duplicates:
//   - goalService.getGoal()            -> target/exam/availability
//   - userService.getStats()           -> per-skill avgBand (already-
//     computed, already used by profile.html's band chart)
//   - weaknessService.getWeaknessProfile() -> per-skill weakest type/
//     criterion + severity (same source recommendationService reads)
//   - recommendationService.getRecommendations() -> ranked, ALREADY-scored
//     candidates; their .action/.reason are reused verbatim, never
//     re-derived
//
// No ML, no AI, no hidden state — every number below is a plain function
// of data these four services already expose.
const goalService = require('./goalService');
const userService = require('./userService');
const weaknessService = require('./weaknessService');
const recommendationService = require('./recommendationService');
const { todayVNDate } = require('./streakBonusService');

const MIN_SAMPLE_SIZE = weaknessService.MIN_SAMPLE_SIZE;

const CATEGORY_KEYS = ['reading', 'listening', 'writing', 'speaking', 'vocabulary'];

// ── Skill-priority scoring (§12) ────────────────────────────────────────
// skillPriority = skillGap*0.5 + weaknessSeverity*0.5 + recommendationSignal
// (all three 0-100-ish scaled, recommendationSignal a flat bonus) — a
// documented adaptation of the spec's conceptual formula, not a literal
// implementation of every term as an independent additive (see §16's
// "Known limitations" in the Priority 2B report for exactly what changed
// and why). Exam urgency is applied separately, as an ALLOCATION-time
// exponent (see allocateWeeklyMinutes) rather than a per-skill additive —
// urgency describes how concentrated the WHOLE plan should be, not one
// skill's own severity.
const GAP_WEIGHT = 0.5;
const SEVERITY_WEIGHT = 0.5;
const RECOMMENDATION_SIGNAL_BONUS = 30;
// A skill with no trustworthy band estimate gets this NEUTRAL gap score —
// not 0 (which would starve it of allocation, implying "you're fine") and
// not 100 (which would invent a weakness with no evidence). See §13/§14.
const INSUFFICIENT_DATA_NEUTRAL_GAP = 30;
// A 3-band gap saturates the gap score at 100 — wider than any realistic
// current->target gap within this product's 4.0-7.5 teaching scope, so in
// practice this only ever partially saturates.
const GAP_SATURATION_BANDS = 3;

function gapScore(currentEstimate, targetBand) {
  if (currentEstimate == null || targetBand == null) {
    return { score: INSUFFICIENT_DATA_NEUTRAL_GAP, dataStatus: 'insufficient_data', gap: null };
  }
  const gap = Math.max(0, targetBand - currentEstimate);
  const score = Math.min(100, (gap / GAP_SATURATION_BANDS) * 100);
  return { score, dataStatus: 'estimated', gap: Math.round(gap * 10) / 10 };
}

function severityScoreForType(entry) {
  if (!entry) return 0;
  return Math.max(0, Math.min(100, (1 - entry.accuracy) * 100));
}

function severityScoreForCriterion(criteriaArr) {
  if (!criteriaArr?.length) return 0;
  const weakest = criteriaArr[0];
  return Math.max(0, Math.min(100, ((9 - weakest.avgScore) / 9) * 100));
}

function vocabPriority(recommendations) {
  const rec = recommendations.find(r => r.type === 'VOCAB_REVIEW') || recommendations.find(r => r.type === 'VOCAB_WEAK');
  if (!rec) return { score: 0, dataStatus: 'insufficient_data', recommendation: null };
  const score = Math.max(rec.metadata.urgency || 0, rec.metadata.severity || 0);
  return { score, dataStatus: 'estimated', recommendation: rec };
}

// One priority object per category — the single source every downstream
// step (allocation, session reasons/actions) reads from.
async function computeCategoryPriorities(userId, targetBand) {
  const [stats, profile, recResult] = await Promise.all([
    userService.getStats(userId),
    weaknessService.getWeaknessProfile(userId),
    recommendationService.getRecommendations(userId),
  ]);
  const recommendations = recResult.recommendations;

  const skillDefs = [
    { key: 'reading', stat: stats.reading, weakEntry: profile.reading[0], recType: 'READING_WEAK_TYPE', kind: 'type' },
    { key: 'listening', stat: stats.listening, weakEntry: profile.listening[0], recType: 'LISTENING_WEAK_TYPE', kind: 'type' },
    // writing.total counts every submission (graded or not), a slightly
    // looser proxy for "how many samples back avgBand" than reading/
    // listening/speaking (whose .total exactly matches their average's
    // sample count) — documented known limitation, not fixed here since it
    // would mean changing userService.getStats()'s return shape.
    { key: 'writing', stat: stats.writing, weakEntry: profile.writing, recType: 'WRITING_WEAK_CRITERION', kind: 'criterion' },
    { key: 'speaking', stat: stats.speaking, weakEntry: profile.speaking, recType: 'SPEAKING_WEAK_CRITERION', kind: 'criterion' },
  ];

  const categories = {};
  for (const def of skillDefs) {
    const sample = def.stat.total || 0;
    const currentEstimate = (sample >= MIN_SAMPLE_SIZE && def.stat.avgBand != null) ? parseFloat(def.stat.avgBand) : null;
    const gap = gapScore(currentEstimate, targetBand);
    const severity = def.kind === 'type' ? severityScoreForType(def.weakEntry) : severityScoreForCriterion(def.weakEntry);
    const matchingRec = recommendations.find(r => r.type === def.recType) || null;
    const recommendationSignal = matchingRec ? RECOMMENDATION_SIGNAL_BONUS : 0;
    categories[def.key] = {
      score: gap.score * GAP_WEIGHT + severity * SEVERITY_WEIGHT + recommendationSignal,
      dataStatus: gap.dataStatus,
      currentEstimate, targetBand, sample,
      gapScore: gap.score, gapBands: gap.gap, severityScore: severity, recommendationSignal,
      recommendation: matchingRec,
    };
  }

  const vocab = vocabPriority(recommendations);
  categories.vocabulary = { score: vocab.score, dataStatus: vocab.dataStatus, recommendation: vocab.recommendation };

  return categories;
}

// ── Weekly minute allocation (§14 baseline guarantee + §10.A exam urgency) ──
// Every category is guaranteed BASELINE_SHARE of the week regardless of
// score — an unmeasured skill is never starved to 0 (§13/§14). The
// remaining pool is split by score^exponent; exponent rises with exam
// urgency, so a closer exam concentrates the remaining time more sharply
// on the highest-priority categories ("closer exam -> more structured
// plan", §10.A) without ever touching the guaranteed baseline.
const BASELINE_SHARE = 0.08; // 8% x 5 categories = 40% of the week is baseline-guaranteed
const URGENCY_EXPONENT = { critical: 1.6, high: 1.4, moderate: 1.2, low: 1.0 };

function allocateWeeklyMinutes(categories, totalMinutes, examUrgency) {
  const exponent = URGENCY_EXPONENT[examUrgency] || 1.0;
  const baselineEach = Math.round(totalMinutes * BASELINE_SHARE);
  const pool = Math.max(0, totalMinutes - baselineEach * CATEGORY_KEYS.length);

  const weights = {};
  let weightSum = 0;
  for (const key of CATEGORY_KEYS) {
    // +1 so a category scored exactly 0 still gets a (small) share of the
    // pool rather than being fully excluded by weight^exponent = 0.
    const w = Math.pow(categories[key].score + 1, exponent);
    weights[key] = w;
    weightSum += w;
  }

  const minutesByCategory = {};
  for (const key of CATEGORY_KEYS) {
    const extra = weightSum > 0 ? Math.round(pool * (weights[key] / weightSum)) : 0;
    minutesByCategory[key] = baselineEach + extra;
  }
  return { minutesByCategory, baselineEach, exponent };
}

// ── Session generation ───────────────────────────────────────────────────
const MIN_CHUNK_MINUTES = 10;
const DAY_INDEX = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
const CATEGORY_LABEL = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking', vocabulary: 'Vocabulary' };
const CATEGORY_HREF = { reading: 'reading.html', listening: 'listening.html', writing: 'writing.html', speaking: 'speaking.html', vocabulary: 'dashboard.html' };

function buildReason(key, info) {
  if (info.recommendation) return info.recommendation.reason;
  if (key === 'vocabulary') return 'Keep your vocabulary fresh with regular review.';
  if (info.dataStatus === 'insufficient_data') return `${CATEGORY_LABEL[key]} performance data is not available yet — this is baseline exposure, not a measured weakness.`;
  if (info.gapBands > 0) return `Your estimated ${CATEGORY_LABEL[key]} band (${info.currentEstimate}) is below your target (${info.targetBand}) — the largest measured gap gets more time.`;
  return `Maintain your current ${CATEGORY_LABEL[key]} skill level.`;
}

// Deep-link/action is taken verbatim from the recommendation when one
// exists (never re-derived) — same actionLevel honesty rule
// recommendationService already established: 'skill' for a generic page,
// never claiming a filter that doesn't exist.
function buildAction(key, info) {
  if (info.recommendation) return info.recommendation.action;
  return { label: `Practice ${CATEGORY_LABEL[key]}`, href: CATEGORY_HREF[key], actionLevel: key === 'vocabulary' ? 'vocab-review' : 'skill' };
}

// Greedy proportional fill: each day's session budget (preferredSessionMinutes)
// is filled from the category with the most REMAINING weekly minutes first,
// in chunks capped at roughly half a session — so one day rarely ends up
// 100% one category, matching §16's example (Writing + Vocabulary + Reading
// in the same day) while still spending each category's minutes roughly in
// priority order across the week.
function generateSessions(minutesByCategory, categories, studyDays, preferredSessionMinutes, weekStartDate) {
  const queue = CATEGORY_KEYS
    .map(key => ({ key, remaining: minutesByCategory[key] }))
    .filter(c => c.remaining > 0);

  const sortedDays = [...studyDays].sort((a, b) => DAY_INDEX[a] - DAY_INDEX[b]);
  const chunkCap = Math.max(MIN_CHUNK_MINUTES, Math.round(preferredSessionMinutes / 2));

  return sortedDays.map(dayCode => {
    const date = new Date(weekStartDate.getTime() + DAY_INDEX[dayCode] * 86400000);
    let budget = preferredSessionMinutes;
    const items = [];
    while (budget >= MIN_CHUNK_MINUTES && queue.some(c => c.remaining > 0)) {
      queue.sort((a, b) => b.remaining - a.remaining);
      const top = queue.find(c => c.remaining > 0);
      if (!top) break;
      const chunk = Math.min(top.remaining, budget, chunkCap);
      items.push({
        category: top.key,
        minutes: chunk,
        reason: buildReason(top.key, categories[top.key]),
        recommendationType: categories[top.key].recommendation?.type || null,
        action: buildAction(top.key, categories[top.key]),
      });
      top.remaining -= chunk;
      budget -= chunk;
    }
    return {
      date: date.toISOString().slice(0, 10),
      day: dayCode,
      totalMinutes: items.reduce((s, i) => s + i.minutes, 0),
      items,
    };
  });
}

function mondayOfCurrentVNWeek() {
  const today = todayVNDate();
  const dow = today.getUTCDay(); // 0=Sun..6=Sat
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today.getTime() + diffToMonday * 86400000);
  const sunday = new Date(monday.getTime() + 6 * 86400000);
  return { monday, sunday };
}

// Main entry point. Returns { hasPlan:false, message, goal } when the
// student hasn't set up availability yet — never a fabricated generic
// calendar (§8).
async function getStudyPlan(userId) {
  const goal = await goalService.getGoal(userId);
  if (!goal.weeklyStudyMinutes || !goal.studyDays.length || !goal.preferredSessionMinutes) {
    return {
      hasPlan: false,
      message: 'Set up your study availability (days per week and session length) to generate a personalized plan.',
      goal,
    };
  }

  const categories = await computeCategoryPriorities(userId, goal.targetBand);
  const { minutesByCategory, baselineEach, exponent } = allocateWeeklyMinutes(categories, goal.weeklyStudyMinutes, goal.examUrgency);
  const { monday, sunday } = mondayOfCurrentVNWeek();
  const sessions = generateSessions(minutesByCategory, categories, goal.studyDays, goal.preferredSessionMinutes, monday);

  return {
    hasPlan: true,
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: sunday.toISOString().slice(0, 10),
    totalMinutes: goal.weeklyStudyMinutes,
    allocation: CATEGORY_KEYS.map(key => ({
      category: key,
      minutes: minutesByCategory[key],
      baselineMinutes: baselineEach,
      score: Math.round(categories[key].score),
      dataStatus: categories[key].dataStatus,
    })),
    urgencyExponent: exponent,
    sessions,
    goal,
  };
}

module.exports = {
  getStudyPlan, computeCategoryPriorities, allocateWeeklyMinutes, generateSessions,
  CATEGORY_KEYS, BASELINE_SHARE, URGENCY_EXPONENT, INSUFFICIENT_DATA_NEUTRAL_GAP,
  RECOMMENDATION_SIGNAL_BONUS, MIN_SAMPLE_SIZE,
};

// ── Architecture (§18) ───────────────────────────────────────────────────
// USER GOAL (goalService) -> STUDY PLAN (this file) -> RECOMMENDATIONS
// (recommendationService, reused not duplicated) -> PRACTICE (existing
// vocab/reading/listening/writing/speaking flows) -> RESULTS -> WEAKNESS
// (weaknessService, reused) -> UPDATED PLAN (next getStudyPlan() call
// naturally reflects new data — nothing here is cached/stored).
