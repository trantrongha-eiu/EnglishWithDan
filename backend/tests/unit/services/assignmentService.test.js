'use strict';

// Pure-function tests for deriveAssignmentStatus — no DB.
const { deriveAssignmentStatus } = require('../../../services/assignmentService');

let n = 0;
const oid = () => `item${++n}`;
function assignment(resourceCount, deadline) {
  return { deadline, resources: Array.from({ length: resourceCount }, () => ({ _id: oid() })) };
}

describe('deriveAssignmentStatus', () => {
  const future = new Date(Date.now() + 5 * 864e5);
  const pastD = new Date(Date.now() - 5 * 864e5);

  test('nothing done, deadline ahead → not_started', () => {
    const a = assignment(3, future);
    expect(deriveAssignmentStatus(a, new Set()).status).toBe('not_started');
  });

  test('some done, deadline ahead → in_progress', () => {
    const a = assignment(3, future);
    expect(deriveAssignmentStatus(a, new Set([String(a.resources[0]._id)])).status).toBe('in_progress');
  });

  test('all done → completed (even past deadline)', () => {
    const a = assignment(2, pastD);
    const all = new Set(a.resources.map((r) => String(r._id)));
    expect(deriveAssignmentStatus(a, all).status).toBe('completed');
  });

  test('past deadline, not all done → overdue', () => {
    const a = assignment(3, pastD);
    expect(deriveAssignmentStatus(a, new Set([String(a.resources[0]._id)])).status).toBe('overdue');
  });

  test('no deadline, partial → in_progress (never overdue)', () => {
    const a = assignment(2, null);
    expect(deriveAssignmentStatus(a, new Set([String(a.resources[0]._id)])).status).toBe('in_progress');
  });

  test('done/total counts reported', () => {
    const a = assignment(4, future);
    const r = deriveAssignmentStatus(a, new Set([String(a.resources[0]._id), String(a.resources[2]._id)]));
    expect(r).toMatchObject({ done: 2, total: 4 });
  });

  test('zero-resource assignment is not "completed"', () => {
    const a = assignment(0, future);
    expect(deriveAssignmentStatus(a, new Set()).status).toBe('not_started');
  });
});
