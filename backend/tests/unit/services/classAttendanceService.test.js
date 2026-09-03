'use strict';

// Pure-function tests for computeEnrollmentStats — no DB. Builds session /
// record arrays by hand (shape matches the Mongoose lean() docs the service
// passes in).
const { computeEnrollmentStats } = require('../../../services/classAttendanceService');

let idc = 0;
const oid = () => `id${++idc}`;

function session(over = {}) {
  return {
    _id: over._id || oid(),
    type: over.type || 'regular',
    status: over.status || 'held',
    date: over.date || new Date(Date.now() - 24 * 3600 * 1000),
    makeupForSessionId: over.makeupForSessionId || null,
  };
}
function rec(sessionId, status, over = {}) {
  return { sessionId, status, ...over };
}
const enr = (status = 'active') => ({ status });

describe('computeEnrollmentStats', () => {
  test('all present → 0 absence, rate 100, active', () => {
    const s = [session(), session(), session()];
    const r = s.map((x) => rec(x._id, 'present'));
    const out = computeEnrollmentStats({ enrollment: enr(), policy: {}, sessions: s, records: r });
    expect(out).toMatchObject({ heldSessions: 3, attendedCount: 3, absenceEquivalent: 0, attendanceRate: 100, derivedStatus: 'active' });
  });

  test('absent counts 1; excused counts 1 by default (excusedCountsAsAbsence=true)', () => {
    const s = [session(), session(), session(), session()];
    const r = [rec(s[0]._id, 'present'), rec(s[1]._id, 'absent'), rec(s[2]._id, 'excused'), rec(s[3]._id, 'present')];
    const out = computeEnrollmentStats({ enrollment: enr(), policy: { warnThreshold: 2, maxAbsencesAllowed: 3 }, sessions: s, records: r });
    expect(out.absentUnexcused).toBe(1);
    expect(out.absentExcused).toBe(1);
    expect(out.absenceEquivalent).toBe(2);
    expect(out.derivedStatus).toBe('warning'); // 2 >= warnThreshold 2
  });

  test('excusedCountsAsAbsence=false → excused adds 0', () => {
    const s = [session(), session()];
    const r = [rec(s[0]._id, 'excused'), rec(s[1]._id, 'excused')];
    const out = computeEnrollmentStats({ enrollment: enr(), policy: { excusedCountsAsAbsence: false, warnThreshold: 2 }, sessions: s, records: r });
    expect(out.absentExcused).toBe(2);
    expect(out.absenceEquivalent).toBe(0);
    expect(out.derivedStatus).toBe('active');
  });

  test('2 lates = 1 absence-equivalent (lateToAbsenceRatio default 2)', () => {
    const s = [session(), session(), session()];
    const r = [rec(s[0]._id, 'late'), rec(s[1]._id, 'late'), rec(s[2]._id, 'present')];
    const out = computeEnrollmentStats({ enrollment: enr(), policy: { warnThreshold: 1 }, sessions: s, records: r });
    expect(out.lateCount).toBe(2);
    expect(out.attendedCount).toBe(3); // late still = attended
    expect(out.absenceEquivalent).toBe(1);
    expect(out.derivedStatus).toBe('warning'); // 1 >= warnThreshold 1
  });

  test('future / scheduled / cancelled sessions are ignored', () => {
    const s = [
      session({ status: 'held', date: new Date(Date.now() - 24 * 3600 * 1000) }),
      session({ status: 'held', date: new Date(Date.now() + 7 * 24 * 3600 * 1000) }), // future
      session({ status: 'scheduled' }),
      session({ status: 'cancelled' }),
    ];
    const r = s.map((x) => rec(x._id, 'absent'));
    const out = computeEnrollmentStats({ enrollment: enr(), policy: {}, sessions: s, records: r });
    expect(out.heldSessions).toBe(1);
    expect(out.absenceEquivalent).toBe(1);
  });

  test('held past session with no mark for the student is not counted', () => {
    const s = [session(), session()];
    const r = [rec(s[0]._id, 'present')]; // s[1] unmarked
    const out = computeEnrollmentStats({ enrollment: enr(), policy: {}, sessions: s, records: r });
    expect(out.heldSessions).toBe(1);
  });

  test('makeup present cancels the linked original absence (net)', () => {
    const orig = session();
    const makeup = session({ type: 'makeup', makeupForSessionId: orig._id });
    const s = [orig, makeup];
    const r = [rec(orig._id, 'absent'), rec(makeup._id, 'present')];
    const out = computeEnrollmentStats({ enrollment: enr(), policy: { warnThreshold: 1 }, sessions: s, records: r });
    expect(out.absentUnexcused).toBe(0);
    expect(out.attendedCount).toBe(1);
    expect(out.absenceEquivalent).toBe(0);
    expect(out.derivedStatus).toBe('active');
  });

  test('exceeding maxAbsencesAllowed → failed (failOnExceed default true)', () => {
    const s = [session(), session(), session(), session()];
    const r = s.map((x) => rec(x._id, 'absent'));
    const out = computeEnrollmentStats({ enrollment: enr(), policy: { maxAbsencesAllowed: 3, warnThreshold: 2 }, sessions: s, records: r });
    expect(out.absenceEquivalent).toBe(4);
    expect(out.derivedStatus).toBe('failed');
  });

  test('failOnExceed=false → stays warning even past the max', () => {
    const s = [session(), session(), session(), session()];
    const r = s.map((x) => rec(x._id, 'absent'));
    const out = computeEnrollmentStats({ enrollment: enr(), policy: { maxAbsencesAllowed: 3, warnThreshold: 2, failOnExceed: false }, sessions: s, records: r });
    expect(out.derivedStatus).toBe('warning');
  });

  test('terminal enrollment status (completed/dropped) is never auto-changed', () => {
    const s = [session(), session(), session(), session()];
    const r = s.map((x) => rec(x._id, 'absent'));
    const out = computeEnrollmentStats({ enrollment: enr('completed'), policy: { maxAbsencesAllowed: 1 }, sessions: s, records: r });
    expect(out.derivedStatus).toBe('completed');
  });

  test('no held sessions → rate 0, active', () => {
    const out = computeEnrollmentStats({ enrollment: enr(), policy: {}, sessions: [], records: [] });
    expect(out).toMatchObject({ heldSessions: 0, attendanceRate: 0, derivedStatus: 'active' });
  });
});
