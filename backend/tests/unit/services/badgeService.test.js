'use strict';

const badgeService = require('../../../services/badgeService');
const { createStudent } = require('../../factories/userFactory');
const {
  createVocabBook, createCompletedTestAttempt, createListeningAttempt,
  createWritingAttempt, createSpeakingAttempt,
} = require('../../factories/contentFactory');

function findBadge(badges, id) {
  return badges.find(b => b.id === id);
}

describe('badgeService.getBadges', () => {
  test('a brand-new student has every badge locked at 0 progress', async () => {
    const student = await createStudent();
    const { badges, earnedCount, totalCount } = await badgeService.getBadges(student._id);

    expect(totalCount).toBe(18);
    expect(earnedCount).toBe(0);
    expect(badges.every(b => b.earned === false)).toBe(true);
    expect(findBadge(badges, 'vocab_20').progress).toEqual({ current: 0, target: 20 });
  });

  test('vocab badges only count words at status da-thuoc, not chua-thuoc/nho-so-so', async () => {
    const student = await createStudent();
    await createVocabBook({
      userId: student._id,
      words: [
        ...Array.from({ length: 20 }, (_, i) => ({ word: `mastered${i}`, status: 'da-thuoc' })),
        ...Array.from({ length: 5 }, (_, i) => ({ word: `learning${i}`, status: 'nho-so-so' })),
        ...Array.from({ length: 5 }, (_, i) => ({ word: `new${i}`, status: 'chua-thuoc' })),
      ],
    });

    const { badges } = await badgeService.getBadges(student._id);
    expect(findBadge(badges, 'vocab_20').earned).toBe(true);
    expect(findBadge(badges, 'vocab_20').progress.current).toBe(20);
    expect(findBadge(badges, 'vocab_100').earned).toBe(false);
  });

  test('vocab words are summed across multiple VocabBooks for the same student', async () => {
    const student = await createStudent();
    await createVocabBook({ userId: student._id, words: Array.from({ length: 12 }, (_, i) => ({ word: `a${i}`, status: 'da-thuoc' })) });
    await createVocabBook({ userId: student._id, words: Array.from({ length: 12 }, (_, i) => ({ word: `b${i}`, status: 'da-thuoc' })) });

    const { badges } = await badgeService.getBadges(student._id);
    expect(findBadge(badges, 'vocab_20').progress.current).toBe(20); // capped at target, real total is 24
    expect(findBadge(badges, 'vocab_20').earned).toBe(true);
  });

  test('reading count/band badges only count status:completed attempts', async () => {
    const student = await createStudent();
    await createCompletedTestAttempt({ userId: student._id, bandScore: 6.5, status: 'completed' });
    await createCompletedTestAttempt({ userId: student._id, bandScore: 7.5, status: 'completed' });
    await createCompletedTestAttempt({ userId: student._id, bandScore: 9, status: 'in-progress' }); // ignored

    const { badges } = await badgeService.getBadges(student._id);
    expect(findBadge(badges, 'reading_first').earned).toBe(true);
    expect(findBadge(badges, 'reading_25').progress.current).toBe(2);
    expect(findBadge(badges, 'reading_band7').earned).toBe(true); // max is 7.5
  });

  test('listening band badge requires the max completed band to actually reach 7', async () => {
    const student = await createStudent();
    await createListeningAttempt({ userId: student._id, bandScore: 6.5, status: 'completed' });

    const { badges } = await badgeService.getBadges(student._id);
    expect(findBadge(badges, 'listening_first').earned).toBe(true);
    expect(findBadge(badges, 'listening_band7').earned).toBe(false);
  });

  test('writing count includes every submission, but the band badge only counts teacher-confirmed grading.overallBand', async () => {
    const student = await createStudent();
    await createWritingAttempt({ userId: student._id, extra: { aiGrading: { task1: { bandScore: 8 } } } }); // AI-only, ungraded by teacher
    await createWritingAttempt({ userId: student._id, extra: { grading: { overallBand: 7.5 } } });

    const { badges } = await badgeService.getBadges(student._id);
    expect(findBadge(badges, 'writing_first').earned).toBe(true);
    expect(findBadge(badges, 'writing_10').progress.current).toBe(2); // both submissions count
    expect(findBadge(badges, 'writing_band7').earned).toBe(true); // the one confirmed grade is 7.5
  });

  test('writing band badge is not earned from an AI-only grade alone', async () => {
    const student = await createStudent();
    await createWritingAttempt({ userId: student._id, extra: { aiGrading: { task1: { bandScore: 9 } } } });

    const { badges } = await badgeService.getBadges(student._id);
    expect(findBadge(badges, 'writing_band7').earned).toBe(false);
  });

  test('speaking badges only count status:analyzed attempts', async () => {
    const student = await createStudent();
    await createSpeakingAttempt({ userId: student._id, status: 'analyzed', extra: { aiFeedback: { overallBand: 7 } } });
    await createSpeakingAttempt({ userId: student._id, status: 'pending', extra: { aiFeedback: { overallBand: 9 } } }); // ignored

    const { badges } = await badgeService.getBadges(student._id);
    expect(findBadge(badges, 'speaking_first').earned).toBe(true);
    expect(findBadge(badges, 'speaking_20').progress.current).toBe(1);
    expect(findBadge(badges, 'speaking_band7').earned).toBe(true);
  });

  test('streak badges read maxLearningStreak, which stays earned after the live streak resets to 0', async () => {
    const student = await createStudent();
    student.updateStreak(10);
    await student.save();
    expect(student.maxLearningStreak).toBe(10);

    // Simulate a missed-day reset on the live counter — the badge must not un-earn.
    student.learningStreak = 0;
    await student.save();

    const { badges } = await badgeService.getBadges(student._id);
    expect(findBadge(badges, 'streak_7').earned).toBe(true);
    expect(findBadge(badges, 'streak_30').earned).toBe(false);
  });
});
