'use strict';

const { computeClassProgress, vnTodayKey } = require('../../../utils/classProgress');

const d = (key) => new Date(`${key}T00:00:00Z`);
let n = 0;
const sess = (key, extra = {}) => ({ _id: `s${++n}`, sessionNumber: n, date: d(key), status: 'scheduled', type: 'regular', topic: '', ...extra });

// Tue/Thu class, 2026-09-01 (Tue) → 2026-09-24 (Thu): 4 weeks, 8 sessions.
function termSessions() {
  n = 0;
  return ['2026-09-01', '2026-09-03', '2026-09-08', '2026-09-10', '2026-09-15', '2026-09-17', '2026-09-22', '2026-09-24'].map((k) => sess(k));
}
const cls = { startDate: d('2026-09-01'), endDate: d('2026-09-24'), totalSessions: 8 };

describe('vnTodayKey', () => {
  it('uses the Vietnam calendar day (UTC+7)', () => {
    expect(vnTodayKey(new Date('2026-09-09T18:00:00Z'))).toBe('2026-09-10'); // 01:00 ICT
    expect(vnTodayKey(new Date('2026-09-09T16:59:00Z'))).toBe('2026-09-09'); // 23:59 ICT
  });
});

describe('computeClassProgress', () => {
  it('reports week and session number mid-term, counting today as the current session', () => {
    const p = computeClassProgress(cls, termSessions(), new Date('2026-09-10T03:00:00Z'));
    expect(p.phase).toBe('ongoing');
    expect(p.currentWeek).toBe(2);
    expect(p.totalWeeks).toBe(4);
    expect(p.currentSessionOrdinal).toBe(4);
    expect(p.totalSessions).toBe(8);
    expect(p.percent).toBe(50);
    expect(p.todaySession.dayKey).toBe('2026-09-10');
    expect(p.nextSession.dayKey).toBe('2026-09-15');
    expect(p.weekSessions.map((s) => s.dayKey)).toEqual(['2026-09-08', '2026-09-10']);
    expect(p.pendingPastSessions).toBe(3);
  });

  it('skips cancelled sessions and makeups when numbering', () => {
    const s = termSessions();
    s[1].status = 'cancelled';
    s.push(sess('2026-09-05', { type: 'makeup' }));
    const p = computeClassProgress({ ...cls, totalSessions: 0 }, s, new Date('2026-09-09T03:00:00Z'));
    expect(p.currentSessionOrdinal).toBe(2); // 01, 08 (03 cancelled, 05 is makeup)
    expect(p.totalSessions).toBe(7);
    expect(p.currentSession.dayKey).toBe('2026-09-08');
  });

  it('is upcoming before the start date', () => {
    const p = computeClassProgress(cls, termSessions(), new Date('2026-08-28T03:00:00Z'));
    expect(p.phase).toBe('upcoming');
    expect(p.daysUntilStart).toBe(4);
    expect(p.currentSessionOrdinal).toBe(0);
    expect(p.currentWeek).toBeNull();
    expect(p.nextSession.dayKey).toBe('2026-09-01');
    expect(p.weekSessions).toHaveLength(2);
  });

  it('is ended after the end date', () => {
    const p = computeClassProgress(cls, termSessions(), new Date('2026-10-05T03:00:00Z'));
    expect(p.phase).toBe('ended');
    expect(p.currentWeek).toBe(4);
    expect(p.percent).toBe(100);
    expect(p.nextSession).toBeNull();
  });

  it('falls back to session dates when the class has no start/end date', () => {
    const p = computeClassProgress({}, termSessions(), new Date('2026-09-16T03:00:00Z'));
    expect(p.startDate).toBe('2026-09-01');
    expect(p.endDate).toBe('2026-09-24');
    expect(p.currentWeek).toBe(3);
  });

  it('is unscheduled with no dates and no sessions', () => {
    const p = computeClassProgress({ totalSessions: 20 }, [], new Date('2026-09-16T03:00:00Z'));
    expect(p.phase).toBe('unscheduled');
    expect(p.totalSessions).toBe(20);
    expect(p.currentSessionOrdinal).toBe(0);
    expect(p.weekSessions).toEqual([]);
  });
});
