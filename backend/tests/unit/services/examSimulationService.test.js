'use strict';

// Unit tests for services/examSimulationService.js — the "Test Simulation"
// mode strike-counting/disqualify/cooldown logic shared by standalone
// Reading, Listening and Writing (full test + "lẻ" practice). Deliberately
// mirrors mockTestService.test.js's own test shape for the 4-skill Mock
// Test's equivalent recordViolation/cooldown behavior, since this service
// is a parallel (not shared) reimplementation of that same pattern.
const mongoose = require('mongoose');
const examSimulationService = require('../../../services/examSimulationService');
const TestAttempt = require('../../../models/TestAttempt');
const User = require('../../../models/User');
const { createStudent } = require('../../factories/userFactory');
const { createTestAttempt } = require('../../factories/contentFactory');

async function createInProgressSimulation(userId, overrides = {}) {
  return createTestAttempt({
    userId,
    testId: new mongoose.Types.ObjectId(),
    status: 'in-progress',
    extra: { mode: 'simulation', ...overrides },
  });
}

describe('examSimulationService.checkCooldown / assertNotOnCooldown', () => {
  test('not on cooldown when simulationCooldownUntil is unset', async () => {
    const student = await createStudent();
    const { active, remainingSeconds } = await examSimulationService.checkCooldown(student._id);
    expect(active).toBe(false);
    expect(remainingSeconds).toBe(0);
    await expect(examSimulationService.assertNotOnCooldown(student._id)).resolves.toBeUndefined();
  });

  test('active with the correct remaining time when cooldownUntil is in the future', async () => {
    const student = await createStudent({ extra: { simulationCooldownUntil: new Date(Date.now() + 200 * 1000) } });
    const { active, remainingSeconds } = await examSimulationService.checkCooldown(student._id);
    expect(active).toBe(true);
    expect(remainingSeconds).toBeGreaterThan(190);
    expect(remainingSeconds).toBeLessThanOrEqual(200);
  });

  test('assertNotOnCooldown throws a 429 AppError with cooldownSeconds attached', async () => {
    const student = await createStudent({ extra: { simulationCooldownUntil: new Date(Date.now() + 60 * 1000) } });
    await expect(examSimulationService.assertNotOnCooldown(student._id)).rejects.toMatchObject({
      statusCode: 429,
      cooldownSeconds: expect.any(Number),
    });
  });

  test('not on cooldown once simulationCooldownUntil is in the past', async () => {
    const student = await createStudent({ extra: { simulationCooldownUntil: new Date(Date.now() - 1000) } });
    const { active } = await examSimulationService.checkCooldown(student._id);
    expect(active).toBe(false);
    await expect(examSimulationService.assertNotOnCooldown(student._id)).resolves.toBeUndefined();
  });
});

describe('examSimulationService.recordViolation', () => {
  test('increments violationCount and does not disqualify below MAX_VIOLATIONS', async () => {
    const student = await createStudent();
    const attempt = await createInProgressSimulation(student._id);

    for (let i = 1; i <= examSimulationService.MAX_VIOLATIONS; i++) {
      const result = await examSimulationService.recordViolation(student._id, {
        skill: 'reading', attemptType: 'full', attemptId: attempt._id, type: 'blur',
      });
      expect(result.violationCount).toBe(i);
      expect(result.disqualified).toBe(false);
      expect(result.cooldownSeconds).toBe(0);
    }

    const fresh = await TestAttempt.findById(attempt._id);
    expect(fresh.status).toBe('in-progress');
    expect(fresh.proctor.violationCount).toBe(examSimulationService.MAX_VIOLATIONS);
  });

  test('disqualifies on the (MAX_VIOLATIONS + 1)th violation and sets the global cooldown', async () => {
    const student = await createStudent();
    const attempt = await createInProgressSimulation(student._id);

    for (let i = 1; i <= examSimulationService.MAX_VIOLATIONS; i++) {
      await examSimulationService.recordViolation(student._id, {
        skill: 'reading', attemptType: 'full', attemptId: attempt._id, type: 'hidden',
      });
    }
    const result = await examSimulationService.recordViolation(student._id, {
      skill: 'reading', attemptType: 'full', attemptId: attempt._id, type: 'hidden',
    });

    expect(result.violationCount).toBe(examSimulationService.MAX_VIOLATIONS + 1);
    expect(result.disqualified).toBe(true);
    expect(result.cooldownSeconds).toBe(examSimulationService.COOLDOWN_SECONDS);

    const freshAttempt = await TestAttempt.findById(attempt._id);
    expect(freshAttempt.status).toBe('disqualified');
    expect(freshAttempt.proctor.disqualifiedAt).toBeTruthy();

    const freshUser = await User.findById(student._id);
    expect(freshUser.simulationCooldownUntil).toBeTruthy();
    expect(freshUser.simulationCooldownUntil.getTime()).toBeGreaterThan(Date.now());

    const { active } = await examSimulationService.checkCooldown(student._id);
    expect(active).toBe(true);
  });

  test('a late/duplicate report after disqualification is idempotent — echoes terminal state, does not throw', async () => {
    const student = await createStudent();
    const attempt = await createInProgressSimulation(student._id, {
      status: 'disqualified',
      proctor: { violationCount: 6, violated: true, disqualifiedAt: new Date() },
    });

    const result = await examSimulationService.recordViolation(student._id, {
      skill: 'reading', attemptType: 'full', attemptId: attempt._id, type: 'blur',
    });

    expect(result.disqualified).toBe(true);
    expect(result.violationCount).toBe(6); // unchanged — no further increment past disqualification
    const fresh = await TestAttempt.findById(attempt._id);
    expect(fresh.proctor.violationCount).toBe(6);
  });

  test('rejects an attempt that is not in Simulation mode', async () => {
    const student = await createStudent();
    const attempt = await createTestAttempt({
      userId: student._id, testId: new mongoose.Types.ObjectId(), status: 'in-progress',
      // mode defaults to 'practice'
    });

    await expect(examSimulationService.recordViolation(student._id, {
      skill: 'reading', attemptType: 'full', attemptId: attempt._id, type: 'blur',
    })).rejects.toMatchObject({ statusCode: 400 });
  });

  test('rejects an unknown attemptId', async () => {
    const student = await createStudent();
    await expect(examSimulationService.recordViolation(student._id, {
      skill: 'reading', attemptType: 'full', attemptId: new mongoose.Types.ObjectId(), type: 'blur',
    })).rejects.toMatchObject({ statusCode: 404 });
  });

  test('rejects an invalid violation type', async () => {
    const student = await createStudent();
    const attempt = await createInProgressSimulation(student._id);
    await expect(examSimulationService.recordViolation(student._id, {
      skill: 'reading', attemptType: 'full', attemptId: attempt._id, type: 'devtools-opened',
    })).rejects.toMatchObject({ statusCode: 400 });
  });

  test('does not let another user record a violation against this attempt', async () => {
    const student = await createStudent();
    const other = await createStudent();
    const attempt = await createInProgressSimulation(student._id);

    await expect(examSimulationService.recordViolation(other._id, {
      skill: 'reading', attemptType: 'full', attemptId: attempt._id, type: 'blur',
    })).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('examSimulationService.modelFor', () => {
  test('maps every skill/attemptType combination to the right model', () => {
    const TestAttemptModel = require('../../../models/TestAttempt');
    const ReadingPracticeAttempt = require('../../../models/ReadingPracticeAttempt');
    const ListeningAttempt = require('../../../models/ListeningAttempt');
    const ListeningPracticeAttempt = require('../../../models/ListeningPracticeAttempt');
    const WritingAttempt = require('../../../models/WritingAttempt');

    expect(examSimulationService.modelFor('reading', 'full')).toBe(TestAttemptModel);
    expect(examSimulationService.modelFor('reading', 'practice')).toBe(ReadingPracticeAttempt);
    expect(examSimulationService.modelFor('listening', 'full')).toBe(ListeningAttempt);
    expect(examSimulationService.modelFor('listening', 'practice')).toBe(ListeningPracticeAttempt);
    expect(examSimulationService.modelFor('writing', 'full')).toBe(WritingAttempt);
    expect(examSimulationService.modelFor('writing', 'practice')).toBe(WritingAttempt);
  });

  test('rejects an unknown skill or attemptType', () => {
    expect(() => examSimulationService.modelFor('speaking', 'full')).toThrow();
    expect(() => examSimulationService.modelFor('reading', 'bogus')).toThrow();
  });
});
