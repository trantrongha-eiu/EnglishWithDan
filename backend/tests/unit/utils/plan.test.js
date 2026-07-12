// Unit tests for utils/plan.js — computePlanExpiry(currentExpiresAt, months).
// Locks in the "stacking" behavior: an active (still-in-the-future) plan's
// remaining time is preserved and the new months are added on top of it,
// while an expired/absent plan starts counting fresh from now.
const { computePlanExpiry } = require('../../../utils/plan');

const DAY_MS = 24 * 60 * 60 * 1000;
const TOLERANCE_MS = 5000; // allow a few seconds of test-execution drift

describe('computePlanExpiry', () => {
  test('null currentExpiresAt computes from now + months*30 days', () => {
    const before = Date.now();
    const result = computePlanExpiry(null, 1);
    const after = Date.now();

    const expectedMin = before + 1 * 30 * DAY_MS;
    const expectedMax = after + 1 * 30 * DAY_MS + TOLERANCE_MS;
    expect(result.getTime()).toBeGreaterThanOrEqual(expectedMin);
    expect(result.getTime()).toBeLessThanOrEqual(expectedMax);
  });

  test('a currentExpiresAt in the past computes from now, not from the past date', () => {
    const past = new Date(Date.now() - 10 * DAY_MS);
    const before = Date.now();
    const result = computePlanExpiry(past, 2);
    const after = Date.now();

    const expectedMin = before + 2 * 30 * DAY_MS;
    const expectedMax = after + 2 * 30 * DAY_MS + TOLERANCE_MS;
    expect(result.getTime()).toBeGreaterThanOrEqual(expectedMin);
    expect(result.getTime()).toBeLessThanOrEqual(expectedMax);
  });

  test('a currentExpiresAt in the future STACKS the new months on top of it', () => {
    const future = new Date(Date.now() + 15 * DAY_MS);
    const result = computePlanExpiry(future, 1);

    const expected = new Date(future.getTime() + 1 * 30 * DAY_MS);
    expect(result.getTime()).toBe(expected.getTime());
  });

  test('stacking works with a different months value (3 months)', () => {
    const future = new Date(Date.now() + 45 * DAY_MS);
    const result = computePlanExpiry(future, 3);

    const expected = new Date(future.getTime() + 3 * 30 * DAY_MS);
    expect(result.getTime()).toBe(expected.getTime());
  });

  test('stacking works with a large months value (12 months)', () => {
    const future = new Date(Date.now() + 1 * DAY_MS);
    const result = computePlanExpiry(future, 12);

    const expected = new Date(future.getTime() + 12 * 30 * DAY_MS);
    expect(result.getTime()).toBe(expected.getTime());
  });

  test('undefined currentExpiresAt behaves the same as null (computes from now)', () => {
    const before = Date.now();
    const result = computePlanExpiry(undefined, 6);
    const after = Date.now();

    const expectedMin = before + 6 * 30 * DAY_MS;
    const expectedMax = after + 6 * 30 * DAY_MS + TOLERANCE_MS;
    expect(result.getTime()).toBeGreaterThanOrEqual(expectedMin);
    expect(result.getTime()).toBeLessThanOrEqual(expectedMax);
  });
});
