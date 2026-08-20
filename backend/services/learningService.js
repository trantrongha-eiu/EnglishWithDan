'use strict';

// "Today's Learning" (Priority 2C). Answers "what should the student
// actually do right now?" — a thin CONSUMPTION/ORCHESTRATION layer over
// studyPlanService, which already computes a dated session for every one
// of the student's study days this week (Monday–Sunday). "Today" is just
// finding today's calendar date in that already-computed list — no new
// scoring, no new weakness calculation, no new data model.
//
// goalService -> studyPlanService -> recommendationService -> (this file)
// -> existing practice pages -> existing result/history systems.
//
// Read-only, deterministic, no AI, no persistent side effects: calling
// this 100 times for the same underlying state returns the same result.
const studyPlanService = require('./studyPlanService');
const { todayVNDate } = require('./streakBonusService');

// Returns today's actionable learning plan for the student. Never invents
// a claim beyond what studyPlanService/recommendationService already
// established — every session item's `action`/`reason` is copied from the
// study-plan item (itself copied from a recommendation when one exists),
// never re-derived here.
async function getTodayLearning(userId) {
  const plan = await studyPlanService.getStudyPlan(userId);
  const todayStr = todayVNDate().toISOString().slice(0, 10);

  // Case A/B: no goal, or a goal but no usable study plan yet (no
  // availability configured — see studyPlanService's own honest
  // hasPlan:false message, reused verbatim rather than re-worded).
  if (!plan.hasPlan) {
    const hasGoal = plan.goal?.hasGoal || false;
    return {
      hasGoal, hasPlan: false, isStudyDay: false,
      date: todayStr, totalMinutes: 0, sessions: [],
      message: hasGoal
        ? plan.message
        : 'Set your IELTS goal to receive a personalized study plan.',
      goal: plan.goal,
    };
  }

  // Case C: has a real plan, but today isn't one of the selected study
  // days — a valid, non-error state. Never borrows another day's sessions.
  const todaysSession = plan.sessions.find(s => s.date === todayStr);
  if (!todaysSession) {
    return {
      hasGoal: true, hasPlan: true, isStudyDay: false,
      date: todayStr, totalMinutes: 0, sessions: [],
      message: 'Today is not one of your scheduled study days.',
      goal: plan.goal,
    };
  }

  // Case D: today IS a study day, but the underlying weekly allocation
  // ran out before reaching it (the known Priority 2B "weeklyStudyMinutes
  // vs studyDays×preferredSessionMinutes" mismatch, tracked as separate
  // technical debt — not fixed here, just surfaced honestly rather than
  // silently returning an empty list with no explanation).
  if (!todaysSession.items.length) {
    return {
      hasGoal: true, hasPlan: true, isStudyDay: true,
      date: todaysSession.date, totalMinutes: 0, sessions: [],
      message: 'No specific practice was allocated for today — try adjusting your weekly study time or session length.',
      goal: plan.goal,
    };
  }

  // Case E/F/G/H/I: one or more categories scheduled, each already
  // carrying its own reason/action — from a matching recommendation when
  // one exists (Case G/I), or studyPlanService's own safe category-level
  // fallback text when none does (Case H) — never a weakness claim
  // invented here.
  return {
    hasGoal: true, hasPlan: true, isStudyDay: true,
    date: todaysSession.date, totalMinutes: todaysSession.totalMinutes,
    sessions: todaysSession.items.map(item => ({
      category: item.category,
      minutes: item.minutes,
      action: item.action?.label || `Practice ${item.category}`,
      reason: item.reason,
      recommendationType: item.recommendationType || null,
      practiceType: item.category,
      practiceUrl: item.action?.href || 'dashboard.html',
    })),
    goal: plan.goal,
  };
}

module.exports = { getTodayLearning };
