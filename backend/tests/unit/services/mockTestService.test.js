'use strict';

// Unit tests for services/mockTestService.js — the full 4-skill mock test:
// random bundle selection, the two-sitting progress cursor, overall-band
// computation, and the lazy re-grade that fills in Writing/Speaking bands
// (which aren't available at submit time).
const mockTestService = require('../../../services/mockTestService');
const MockTestAttempt = require('../../../models/MockTestAttempt');
const SpeakingAttempt = require('../../../models/SpeakingAttempt');
const WritingAttempt = require('../../../models/WritingAttempt');
const { createStudent } = require('../../factories/userFactory');
const {
  createReadingTest, createListeningTest, createWritingExam, createSpeakingQuestion,
  createListeningAttempt, createTestAttempt, createWritingAttempt, createSpeakingAttempt,
} = require('../../factories/contentFactory');

async function seedPools() {
  const [lt, rt, we, sq] = await Promise.all([
    createListeningTest(),
    createReadingTest(),
    createWritingExam(),
    createSpeakingQuestion({ part: 2, cueCard: 'Describe a book you enjoyed.' }),
  ]);
  return { lt, rt, we, sq };
}

describe('mockTestService.roundOverall', () => {
  test('rounds to nearest half, x.25 up', () => {
    expect(mockTestService.roundOverall((6 + 6 + 6 + 7) / 4)).toBe(6.5); // 6.25 -> 6.5
    expect(mockTestService.roundOverall((6 + 6 + 6 + 6) / 4)).toBe(6);
    expect(mockTestService.roundOverall((7 + 7 + 6 + 6) / 4)).toBe(6.5); // 6.5
    expect(mockTestService.roundOverall((5 + 5 + 5 + 6) / 4)).toBe(5.5); // 5.25 -> 5.5
  });
});

describe('mockTestService.startMockTest', () => {
  test('picks one active test per skill and starts at listening', async () => {
    const student = await createStudent();
    await seedPools();

    const { resumed, attempt } = await mockTestService.startMockTest(student._id);

    expect(resumed).toBe(false);
    expect(attempt.progress).toBe('listening');
    expect(attempt.status).toBe('in-progress');
    expect(attempt.bundle.listeningTestId).toBeTruthy();
    expect(attempt.bundle.readingTestId).toBeTruthy();
    expect(attempt.bundle.writingExamId).toBeTruthy();
    expect(attempt.bundle.speakingQuestionId).toBeTruthy();
    expect(attempt.bundle.speakingCueCard).toBe('Describe a book you enjoyed.');
  });

  test('returns the existing open run instead of stacking a second', async () => {
    const student = await createStudent();
    await seedPools();

    const first = await mockTestService.startMockTest(student._id);
    const second = await mockTestService.startMockTest(student._id);

    expect(second.resumed).toBe(true);
    expect(second.attempt._id).toBe(first.attempt._id);
    expect(await MockTestAttempt.countDocuments({ userId: student._id })).toBe(1);
  });

  test('rejects with 400 when a skill pool is empty', async () => {
    const student = await createStudent();
    await createListeningTest();
    await createReadingTest();
    await createWritingExam();
    // no active Part 2 speaking question

    await expect(mockTestService.startMockTest(student._id)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

describe('mockTestService.advance', () => {
  test('walks the skill order, sets sitting timestamps, computes overall band when all 4 graded', async () => {
    const student = await createStudent();
    await seedPools();
    const { attempt } = await mockTestService.startMockTest(student._id);
    const mockId = attempt._id;

    const la = await createListeningAttempt({ userId: student._id, bandScore: 6.5 });
    let r = await mockTestService.advance(student._id, mockId, { skill: 'listening', attemptId: la._id });
    expect(r.attempt.progress).toBe('reading');
    expect(r.nav).toEqual({ nextSkill: 'reading', nextTargetId: attempt.bundle.readingTestId });
    expect(r.attempt.steps.listening.band).toBe(6.5);

    const ra = await createTestAttempt({ userId: student._id, testId: attempt.bundle.readingTestId, status: 'completed', extra: { bandScore: 7 } });
    r = await mockTestService.advance(student._id, mockId, { skill: 'reading', attemptId: ra._id });
    expect(r.attempt.progress).toBe('writing');
    expect(r.nav.sittingBreak).toBe(true);
    expect(r.attempt.sitting1CompletedAt).toBeTruthy();
    expect(r.attempt.status).toBe('in-progress');

    const wa = await createWritingAttempt({ userId: student._id, extra: { grading: { overallBand: 6 } } });
    r = await mockTestService.advance(student._id, mockId, { skill: 'writing', attemptId: wa._id });
    expect(r.attempt.progress).toBe('speaking');
    // Writing and Speaking are separate self-started steps — Writing ends in
    // a sitting break (back to the dashboard), not an auto-chain to Speaking.
    expect(r.nav).toEqual({ sittingBreak: true, nextSkill: 'speaking', breakAfter: 'writing' });

    const sa = await createSpeakingAttempt({ userId: student._id, part: 2, extra: { aiFeedback: { overallBand: 6 } } });
    r = await mockTestService.advance(student._id, mockId, { skill: 'speaking', attemptId: sa._id });
    expect(r.attempt.progress).toBe('done');
    expect(r.nav).toEqual({ done: true });
    expect(r.attempt.sitting2CompletedAt).toBeTruthy();
    // (6.5 + 7 + 6 + 6) / 4 = 6.375 -> 6.5
    expect(r.attempt.overallBand).toBe(6.5);
    expect(r.attempt.status).toBe('completed');
  });

  test('marks awaiting-grading when done but a band is still missing', async () => {
    const student = await createStudent();
    await seedPools();
    const { attempt } = await mockTestService.startMockTest(student._id);
    const mockId = attempt._id;

    const la = await createListeningAttempt({ userId: student._id, bandScore: 6 });
    await mockTestService.advance(student._id, mockId, { skill: 'listening', attemptId: la._id });
    const ra = await createTestAttempt({ userId: student._id, testId: attempt.bundle.readingTestId, status: 'completed', extra: { bandScore: 6 } });
    await mockTestService.advance(student._id, mockId, { skill: 'reading', attemptId: ra._id });
    const wa = await createWritingAttempt({ userId: student._id }); // gradingStatus pending, no band
    await mockTestService.advance(student._id, mockId, { skill: 'writing', attemptId: wa._id });
    const sa = await createSpeakingAttempt({ userId: student._id, part: 2 }); // no aiFeedback band
    const r = await mockTestService.advance(student._id, mockId, { skill: 'speaking', attemptId: sa._id });

    expect(r.attempt.progress).toBe('done');
    expect(r.attempt.status).toBe('awaiting-grading');
    expect(r.attempt.overallBand).toBeNull();
  });

  test('rejects advancing a skill that is not the current step', async () => {
    const student = await createStudent();
    await seedPools();
    const { attempt } = await mockTestService.startMockTest(student._id);

    await expect(
      mockTestService.advance(student._id, attempt._id, { skill: 'writing', attemptId: null })
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('mockTestService.getHistory', () => {
  test('lazily patches the Writing band once it has been graded', async () => {
    const student = await createStudent();
    await seedPools();
    const { attempt } = await mockTestService.startMockTest(student._id);
    const mockId = attempt._id;

    const la = await createListeningAttempt({ userId: student._id, bandScore: 7 });
    await mockTestService.advance(student._id, mockId, { skill: 'listening', attemptId: la._id });
    const ra = await createTestAttempt({ userId: student._id, testId: attempt.bundle.readingTestId, status: 'completed', extra: { bandScore: 7 } });
    await mockTestService.advance(student._id, mockId, { skill: 'reading', attemptId: ra._id });
    const wa = await createWritingAttempt({ userId: student._id }); // pending
    await mockTestService.advance(student._id, mockId, { skill: 'writing', attemptId: wa._id });
    const sa = await createSpeakingAttempt({ userId: student._id, part: 2, extra: { aiFeedback: { overallBand: 7 } } });
    await mockTestService.advance(student._id, mockId, { skill: 'speaking', attemptId: sa._id });

    let hist = await mockTestService.getHistory(student._id, {});
    expect(hist.items[0].status).toBe('awaiting-grading');
    expect(hist.items[0].steps.writing.band).toBeNull();

    // Teacher/AI confirms the Writing grade later.
    wa.grading = { overallBand: 6.5 };
    await wa.save();

    hist = await mockTestService.getHistory(student._id, {});
    expect(hist.items[0].steps.writing.band).toBe(6.5);
    expect(hist.items[0].status).toBe('completed');
    // (7 + 7 + 6.5 + 7) / 4 = 6.875 -> 7
    expect(hist.items[0].overallBand).toBe(7);
  });
});

describe('mockTestService.recordViolation — disqualification', () => {
  async function startRun(student) {
    await seedPools();
    const { attempt } = await mockTestService.startMockTest(student._id);
    return attempt._id;
  }

  test('voids the run once violations exceed MAX_VIOLATIONS', async () => {
    const student = await createStudent();
    const mockId = await startRun(student);

    let res;
    for (let i = 0; i < mockTestService.MAX_VIOLATIONS; i++) {
      res = await mockTestService.recordViolation(student._id, mockId, { type: 'hidden' });
      expect(res.disqualified).toBe(false);
    }
    // The one that tips it over the limit.
    res = await mockTestService.recordViolation(student._id, mockId, { type: 'hidden' });
    expect(res.disqualified).toBe(true);
    expect(res.cooldownSeconds).toBe(mockTestService.DQ_COOLDOWN_SECONDS);

    const doc = await MockTestAttempt.findById(mockId);
    expect(doc.status).toBe('disqualified');
    expect(doc.proctor.disqualifiedAt).toBeTruthy();
    expect(doc.overallBand).toBeNull();
  });

  test('a later violation report on a voided run still echoes disqualified', async () => {
    const student = await createStudent();
    const mockId = await startRun(student);
    for (let i = 0; i <= mockTestService.MAX_VIOLATIONS; i++) {
      await mockTestService.recordViolation(student._id, mockId, { type: 'blur' });
    }
    const late = await mockTestService.recordViolation(student._id, mockId, { type: 'blur' });
    expect(late.disqualified).toBe(true);
  });
});

describe('mockTestService.startMockTest — cooldown after disqualification', () => {
  test('blocks a new run within the cooldown window, then allows it after', async () => {
    const student = await createStudent();
    await seedPools();
    const { attempt } = await mockTestService.startMockTest(student._id);
    for (let i = 0; i <= mockTestService.MAX_VIOLATIONS; i++) {
      await mockTestService.recordViolation(student._id, attempt._id, { type: 'hidden' });
    }

    await expect(mockTestService.startMockTest(student._id)).rejects.toMatchObject({ statusCode: 429 });

    // Wind the clock back past the cooldown.
    await MockTestAttempt.updateOne(
      { _id: attempt._id },
      { $set: { 'proctor.disqualifiedAt': new Date(Date.now() - (mockTestService.DQ_COOLDOWN_SECONDS + 60) * 1000) } }
    );
    const again = await mockTestService.startMockTest(student._id);
    expect(again.resumed).toBe(false);
    expect(again.attempt.status).toBe('in-progress');
  });
});

describe('mockTestService.setManualScores', () => {
  async function runThroughReading(student) {
    await seedPools();
    const { attempt } = await mockTestService.startMockTest(student._id);
    const la = await createListeningAttempt({ userId: student._id, bandScore: 6 });
    await mockTestService.advance(student._id, attempt._id, { skill: 'listening', attemptId: la._id });
    const ra = await createTestAttempt({ userId: student._id, testId: attempt.bundle.readingTestId, status: 'completed', extra: { bandScore: 7 } });
    await mockTestService.advance(student._id, attempt._id, { skill: 'reading', attemptId: ra._id });
    return attempt._id;
  }

  test('pins a hand-entered band, flags it manual, recomputes overall', async () => {
    const student = await createStudent();
    const mockId = await runThroughReading(student);

    const shape = await mockTestService.setManualScores(mockId, {
      steps: { writing: 6.5, speaking: 7 }, note: 'Speaking chấm trực tiếp', actorId: student._id,
    });
    expect(shape.steps.writing.band).toBe(6.5);
    expect(shape.steps.writing.manual).toBe(true);
    expect(shape.steps.speaking.band).toBe(7);
    expect(shape.adminNote).toBe('Speaking chấm trực tiếp');
    // (6 + 7 + 6.5 + 7) / 4 = 6.625 -> 6.5 (nearest half)
    expect(shape.overallBand).toBe(6.5);
  });

  test('a manual band survives the lazy re-grade (getHistory)', async () => {
    const student = await createStudent();
    await seedPools();
    const { attempt } = await mockTestService.startMockTest(student._id);
    const mockId = attempt._id;
    const la = await createListeningAttempt({ userId: student._id, bandScore: 7 });
    await mockTestService.advance(student._id, mockId, { skill: 'listening', attemptId: la._id });
    const ra = await createTestAttempt({ userId: student._id, testId: attempt.bundle.readingTestId, status: 'completed', extra: { bandScore: 7 } });
    await mockTestService.advance(student._id, mockId, { skill: 'reading', attemptId: ra._id });
    const wa = await createWritingAttempt({ userId: student._id, extra: { grading: { overallBand: 6 } } });
    await mockTestService.advance(student._id, mockId, { skill: 'writing', attemptId: wa._id });
    const sa = await createSpeakingAttempt({ userId: student._id, part: 2, extra: { aiFeedback: { overallBand: 5 } } });
    await mockTestService.advance(student._id, mockId, { skill: 'speaking', attemptId: sa._id });

    // Teacher overrides Speaking to 8 (they ran it live).
    await mockTestService.setManualScores(mockId, { steps: { speaking: 8 }, actorId: student._id });

    const hist = await mockTestService.getHistory(student._id, {});
    expect(hist.items[0].steps.speaking.band).toBe(8);
    // (7 + 7 + 6 + 8) / 4 = 7.0
    expect(hist.items[0].overallBand).toBe(7);
  });

  test('rejects an off-scale band', async () => {
    const student = await createStudent();
    const mockId = await runThroughReading(student);
    await expect(
      mockTestService.setManualScores(mockId, { steps: { writing: 6.2 }, actorId: student._id })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('clearing a manual band (null) drops the manual flag', async () => {
    const student = await createStudent();
    const mockId = await runThroughReading(student);
    await mockTestService.setManualScores(mockId, { steps: { writing: 6 }, actorId: student._id });
    const shape = await mockTestService.setManualScores(mockId, { steps: { writing: null }, actorId: student._id });
    expect(shape.steps.writing.band).toBeNull();
    expect(shape.steps.writing.manual).toBe(false);
  });

  test('mirrors a hand-entered Speaking/Writing band onto the sub-attempt', async () => {
    const student = await createStudent();
    await seedPools();
    const { attempt } = await mockTestService.startMockTest(student._id);
    const mockId = attempt._id;

    const la = await createListeningAttempt({ userId: student._id, bandScore: 6 });
    await mockTestService.advance(student._id, mockId, { skill: 'listening', attemptId: la._id });
    const ra = await createTestAttempt({ userId: student._id, testId: attempt.bundle.readingTestId, status: 'completed', extra: { bandScore: 6 } });
    await mockTestService.advance(student._id, mockId, { skill: 'reading', attemptId: ra._id });
    const wa = await createWritingAttempt({ userId: student._id }); // pending, no band
    await mockTestService.advance(student._id, mockId, { skill: 'writing', attemptId: wa._id });
    const sa = await createSpeakingAttempt({ userId: student._id, part: 2 }); // pending, no aiFeedback band
    await mockTestService.advance(student._id, mockId, { skill: 'speaking', attemptId: sa._id });

    await mockTestService.setManualScores(mockId, {
      steps: { speaking: 7.5, writing: 6.5 }, note: 'chấm trực tiếp', actorId: student._id, actorName: 'thayha',
    });

    const freshSa = await SpeakingAttempt.findById(sa._id).lean();
    expect(freshSa.aiFeedback.overallBand).toBe(7.5);
    expect(freshSa.status).toBe('analyzed');
    expect(freshSa.aiFeedback.overallFeedback).toMatch(/thi thử/i);

    const freshWa = await WritingAttempt.findById(wa._id).lean();
    expect(freshWa.grading.overallBand).toBe(6.5);
    expect(freshWa.gradingStatus).toBe('confirmed');
    expect(freshWa.grading.confirmedBy).toBe('thayha');
    expect(freshWa.feedbackRead).toBe(false);
  });

  test('does not mirror when the step has no sub-attempt yet (pre-entered)', async () => {
    const student = await createStudent();
    const mockId = await runThroughReading(student); // speaking step not reached
    // No throw even though steps.speaking.attemptId is undefined.
    const shape = await mockTestService.setManualScores(mockId, { steps: { speaking: 8 }, actorId: student._id });
    expect(shape.steps.speaking.band).toBe(8);
    expect(shape.steps.speaking.manual).toBe(true);
  });
});
