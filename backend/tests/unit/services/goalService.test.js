'use strict';

const goalService = require('../../../services/goalService');
const User = require('../../../models/User');
const { createStudent } = require('../../factories/userFactory');
const { todayVNDate } = require('../../../services/streakBonusService');

// goalService.getGoal() computes daysRemaining from todayVNDate() (VN-midnight),
// not from the precise current instant — see streakBonusService.js's
// todayVNDate(). future()/past() must anchor to that same VN-midnight, not
// Date.now(), or these tests flake depending on what hour it happens to be
// in Vietnam when the suite runs: Date.now() can be up to ~24h ahead of
// todayVNDate() (whenever it's already past midnight VN time but not yet a
// full UTC day later), which was silently inflating daysRemaining by up to
// a day and intermittently failing the <=90 / <=1 assertions below.
const future = days => new Date(todayVNDate().getTime() + days * 86400000);
const past = days => new Date(todayVNDate().getTime() - days * 86400000);

describe('goalService.validateGoalInput', () => {
  it('accepts a fully valid goal', () => {
    const errors = goalService.validateGoalInput({
      currentBand: 5.5, targetBand: 7.0, examDate: future(90),
      weeklyStudyMinutes: 240, studyDays: ['mon', 'tue', 'thu', 'sat'], preferredSessionMinutes: 60,
    });
    expect(errors).toEqual([]);
  });

  it('rejects targetBand above 7.5 (Issue M)', () => {
    const errors = goalService.validateGoalInput({ targetBand: 8.0 });
    expect(errors.some(e => /targetBand/.test(e))).toBe(true);
  });

  it('rejects currentBand greater than targetBand (Issue N)', () => {
    const errors = goalService.validateGoalInput({ currentBand: 7.0, targetBand: 5.5 });
    expect(errors.some(e => /currentBand must not be greater/.test(e))).toBe(true);
  });

  it('accepts currentBand === targetBand', () => {
    const errors = goalService.validateGoalInput({ currentBand: 6.5, targetBand: 6.5 });
    expect(errors).toEqual([]);
  });

  it('rejects a band not on a 0.5 step', () => {
    const errors = goalService.validateGoalInput({ targetBand: 6.3 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects a band below 4.0', () => {
    const errors = goalService.validateGoalInput({ currentBand: 3.5 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects a past exam date', () => {
    const errors = goalService.validateGoalInput({ examDate: past(5) });
    expect(errors.some(e => /examDate/.test(e))).toBe(true);
  });

  it('accepts an exam date of today or tomorrow', () => {
    expect(goalService.validateGoalInput({ examDate: future(0) })).toEqual([]);
    expect(goalService.validateGoalInput({ examDate: future(1) })).toEqual([]);
  });

  it('rejects weeklyStudyMinutes <= 0', () => {
    expect(goalService.validateGoalInput({ weeklyStudyMinutes: 0 }).length).toBeGreaterThan(0);
    expect(goalService.validateGoalInput({ weeklyStudyMinutes: -10 }).length).toBeGreaterThan(0);
  });

  it('rejects an unreasonable preferredSessionMinutes', () => {
    expect(goalService.validateGoalInput({ preferredSessionMinutes: 1 }).length).toBeGreaterThan(0);
    expect(goalService.validateGoalInput({ preferredSessionMinutes: 500 }).length).toBeGreaterThan(0);
  });

  it('rejects an invalid weekday code in studyDays', () => {
    const errors = goalService.validateGoalInput({ studyDays: ['mon', 'someday'] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('leaves fields not present in the input untouched/unvalidated (partial update)', () => {
    expect(goalService.validateGoalInput({ weeklyStudyMinutes: 120 })).toEqual([]);
  });
});

describe('goalService.getGoal', () => {
  it('User A — new user with no goal: hasGoal false, all derived fields null', async () => {
    const student = await createStudent();
    const goal = await goalService.getGoal(student._id);
    expect(goal.hasGoal).toBe(false);
    expect(goal.currentBand).toBeNull();
    expect(goal.targetBand).toBeNull();
    expect(goal.daysRemaining).toBeNull();
    expect(goal.examUrgency).toBeNull();
    expect(goal.gapBands).toBeNull();
    expect(goal.feasibility).toBeNull();
  });

  it('computes daysRemaining/weeksRemaining/examUrgency/gapBands from a real goal', async () => {
    const student = await createStudent();
    await User.updateOne({ _id: student._id }, { $set: {
      currentBand: 5.5, targetBand: 7.0, targetExamDate: future(90),
      weeklyStudyMinutes: 240, studyDays: ['mon', 'wed', 'fri'], preferredSessionMinutes: 60,
    } });

    const goal = await goalService.getGoal(student._id);
    expect(goal.hasGoal).toBe(true);
    expect(goal.gapBands).toBe(1.5);
    expect(goal.daysRemaining).toBeGreaterThanOrEqual(89);
    expect(goal.daysRemaining).toBeLessThanOrEqual(90);
    expect(goal.weeksRemaining).toBeGreaterThanOrEqual(12);
    expect(goal.examUrgency).toBe('low'); // 90 days out
    expect(goal.isPastExamDate).toBe(false);
  });

  it('exam date tomorrow -> examUrgency critical (Issue D)', async () => {
    const student = await createStudent();
    await User.updateOne({ _id: student._id }, { $set: { targetExamDate: future(1) } });
    const goal = await goalService.getGoal(student._id);
    expect(goal.examUrgency).toBe('critical');
    expect(goal.daysRemaining).toBeLessThanOrEqual(1);
  });

  it('exam date in 90 days -> examUrgency low (Issue E)', async () => {
    const student = await createStudent();
    await User.updateOne({ _id: student._id }, { $set: { targetExamDate: future(90) } });
    const goal = await goalService.getGoal(student._id);
    expect(goal.examUrgency).toBe('low');
  });

  it('past exam date -> isPastExamDate true, examUrgency null, feasibility null (Issue F)', async () => {
    const student = await createStudent();
    await User.updateOne({ _id: student._id }, { $set: {
      targetExamDate: past(10), currentBand: 5.5, targetBand: 7.0, weeklyStudyMinutes: 120,
    } });
    const goal = await goalService.getGoal(student._id);
    expect(goal.isPastExamDate).toBe(true);
    expect(goal.examUrgency).toBeNull();
    expect(goal.feasibility).toBeNull();
  });
});

describe('goalService.updateGoal', () => {
  it('User B — sets current 5.5 -> target 7.0, both persisted and re-readable', async () => {
    const student = await createStudent();
    const result = await goalService.updateGoal(student._id, { currentBand: 5.5, targetBand: 7.0 });
    expect(result.status).toBe('ok');
    expect(result.goal.currentBand).toBe(5.5);
    expect(result.goal.targetBand).toBe(7.0);
    expect(result.goal.currentBandSource).toBe('self_assessed');
  });

  it('rejects targetBand above 7.5 without writing anything (Issue M)', async () => {
    const student = await createStudent();
    const result = await goalService.updateGoal(student._id, { targetBand: 8.0 });
    expect(result.status).toBe('invalid');
    const goal = await goalService.getGoal(student._id);
    expect(goal.targetBand).toBeNull();
  });

  it('rejects currentBand greater than targetBand (Issue N)', async () => {
    const student = await createStudent();
    const result = await goalService.updateGoal(student._id, { currentBand: 7.5, targetBand: 5.5 });
    expect(result.status).toBe('invalid');
  });

  it('catches currentBand > targetBand across a PARTIAL update against the already-saved value', async () => {
    const student = await createStudent();
    await goalService.updateGoal(student._id, { targetBand: 5.5 });
    const result = await goalService.updateGoal(student._id, { currentBand: 6.5 }); // 6.5 > saved targetBand 5.5
    expect(result.status).toBe('invalid');
  });

  it('Issue L — updating the goal only changes goal fields; a partial update leaves other fields untouched, and can be updated again', async () => {
    const student = await createStudent();
    await goalService.updateGoal(student._id, {
      currentBand: 5.5, targetBand: 7.0, weeklyStudyMinutes: 120, studyDays: ['mon', 'wed'], preferredSessionMinutes: 60,
    });
    const updated = await goalService.updateGoal(student._id, { weeklyStudyMinutes: 300 });
    expect(updated.status).toBe('ok');
    expect(updated.goal.weeklyStudyMinutes).toBe(300);
    // Untouched fields survive the partial update.
    expect(updated.goal.currentBand).toBe(5.5);
    expect(updated.goal.targetBand).toBe(7.0);
    expect(updated.goal.studyDays).toEqual(['mon', 'wed']);
  });

  it('setting currentBand marks currentBandSource self_assessed; clearing it clears the source too', async () => {
    const student = await createStudent();
    await goalService.updateGoal(student._id, { currentBand: 6.0 });
    let goal = await goalService.getGoal(student._id);
    expect(goal.currentBandSource).toBe('self_assessed');

    await goalService.updateGoal(student._id, { currentBand: null });
    goal = await goalService.getGoal(student._id);
    expect(goal.currentBand).toBeNull();
    expect(goal.currentBandSource).toBeNull();
  });
});

describe('goalService.assessFeasibility', () => {
  it('Issue 24 — 5.5 -> 7.5 in 14 days at 2h/week is flagged challenging, never promises the outcome', () => {
    const result = goalService.assessFeasibility({ currentBand: 5.5, targetBand: 7.5, weeksRemaining: 2, weeklyStudyMinutes: 120 });
    expect(result.level).toBe('challenging');
    expect(result.message).toMatch(/short timeframe/i);
    expect(result.message).not.toMatch(/on track for/i);
    expect(result.message).not.toMatch(/\bwill\b/i); // never a promise/prediction
  });

  it('a modest gap with ample time is reasonable', () => {
    const result = goalService.assessFeasibility({ currentBand: 6.5, targetBand: 7.0, weeksRemaining: 26, weeklyStudyMinutes: 300 });
    expect(result.level).toBe('reasonable');
  });

  it('current === target is on_track regardless of time available', () => {
    const result = goalService.assessFeasibility({ currentBand: 6.5, targetBand: 6.5, weeksRemaining: 1, weeklyStudyMinutes: 30 });
    expect(result.level).toBe('on_track');
  });

  it('returns null when currentBand is not set (Issue 5 — never invents a starting point)', () => {
    const result = goalService.assessFeasibility({ currentBand: null, targetBand: 7.0, weeksRemaining: 10, weeklyStudyMinutes: 200 });
    expect(result).toBeNull();
  });
});

describe('goalService.getEstimatedPerformance', () => {
  it('User A — no history anywhere: every skill insufficient_data, overallEstimate null', async () => {
    const student = await createStudent();
    const estimate = await goalService.getEstimatedPerformance(student._id);
    expect(estimate.skills.reading.status).toBe('insufficient_data');
    expect(estimate.skills.writing.status).toBe('insufficient_data');
    expect(estimate.overallEstimate).toBeNull();
  });
});
