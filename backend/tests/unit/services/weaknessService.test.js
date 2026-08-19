'use strict';

const mongoose = require('mongoose');
const weaknessService = require('../../../services/weaknessService');
const ListeningPracticeAttempt = require('../../../models/ListeningPracticeAttempt');
const { createStudent } = require('../../factories/userFactory');
const {
  createPassage, createReadingPracticeAttempt, createTestAttempt,
  createListeningSection, createListeningTest, createListeningAttempt,
  createWritingAttempt, createSpeakingAttempt,
} = require('../../factories/contentFactory');

describe('weaknessService', () => {
  describe('getReadingWeakness', () => {
    it('returns [] when the student has no reading history', async () => {
      const student = await createStudent();
      const result = await weaknessService.getReadingWeakness(student._id);
      expect(result).toEqual([]);
    });

    it('computes accuracy per question type from a practice attempt and sorts weakest first', async () => {
      const student = await createStudent();
      const passage = await createPassage({
        questionRange: { start: 1, end: 6 },
        questionGroups: [
          { groupType: 'plain', questions: [
            { questionNumber: 1, type: 'true-false-ng', questionText: 'Q1', correctAnswer: 'true' },
            { questionNumber: 2, type: 'true-false-ng', questionText: 'Q2', correctAnswer: 'true' },
            { questionNumber: 3, type: 'true-false-ng', questionText: 'Q3', correctAnswer: 'true' },
          ] },
          { groupType: 'matching-headings', questions: [
            { questionNumber: 4, type: 'matching-headings', questionText: 'Q4', correctAnswer: 'i' },
            { questionNumber: 5, type: 'matching-headings', questionText: 'Q5', correctAnswer: 'ii' },
            { questionNumber: 6, type: 'matching-headings', questionText: 'Q6', correctAnswer: 'iii' },
          ] },
        ],
      });

      await createReadingPracticeAttempt({
        userId: student._id,
        passageId: passage._id,
        answers: [
          { questionNumber: 1, userAnswer: 'true', correctAnswer: 'true', isCorrect: true },
          { questionNumber: 2, userAnswer: 'true', correctAnswer: 'true', isCorrect: true },
          { questionNumber: 3, userAnswer: 'false', correctAnswer: 'true', isCorrect: false },
          { questionNumber: 4, userAnswer: 'ii', correctAnswer: 'i', isCorrect: false },
          { questionNumber: 5, userAnswer: 'iii', correctAnswer: 'ii', isCorrect: false },
          { questionNumber: 6, userAnswer: 'iii', correctAnswer: 'iii', isCorrect: true },
        ],
      });

      const result = await weaknessService.getReadingWeakness(student._id);
      expect(result).toEqual([
        { type: 'matching-headings', correct: 1, total: 3, accuracy: 1 / 3 },
        { type: 'true-false-ng', correct: 2, total: 3, accuracy: 2 / 3 },
      ]);
    });

    it('excludes types below MIN_SAMPLE_SIZE', async () => {
      const student = await createStudent();
      const passage = await createPassage({
        questionRange: { start: 1, end: 2 },
        questionGroups: [
          { groupType: 'plain', questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'a' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Q2', correctAnswer: 'b' },
          ] },
        ],
      });
      await createReadingPracticeAttempt({
        userId: student._id,
        passageId: passage._id,
        answers: [
          { questionNumber: 1, userAnswer: 'a', correctAnswer: 'a', isCorrect: true },
          { questionNumber: 2, userAnswer: 'x', correctAnswer: 'b', isCorrect: false },
        ],
      });

      const result = await weaknessService.getReadingWeakness(student._id);
      expect(result).toEqual([]);
    });

    it('merges answers from a full mock test across its 3 passagesUsed', async () => {
      const student = await createStudent();
      const p1 = await createPassage({
        category: 'passage1',
        questionRange: { start: 1, end: 2 },
        questionGroups: [{ groupType: 'plain', questions: [
          { questionNumber: 1, type: 'yes-no-ng', questionText: 'Q1', correctAnswer: 'yes' },
          { questionNumber: 2, type: 'yes-no-ng', questionText: 'Q2', correctAnswer: 'no' },
        ] }],
      });
      const p2 = await createPassage({
        category: 'passage2',
        questionRange: { start: 3, end: 3 },
        questionGroups: [{ groupType: 'plain', questions: [
          { questionNumber: 3, type: 'yes-no-ng', questionText: 'Q3', correctAnswer: 'yes' },
        ] }],
      });

      await createTestAttempt({
        userId: student._id,
        testId: new mongoose.Types.ObjectId(),
        passagesUsed: [p1._id, p2._id],
        extra: {
          status: 'completed',
          answers: [
            { questionNumber: 1, userAnswer: 'yes', correctAnswer: 'yes', isCorrect: true },
            { questionNumber: 2, userAnswer: 'yes', correctAnswer: 'no', isCorrect: false },
            { questionNumber: 3, userAnswer: 'yes', correctAnswer: 'yes', isCorrect: true },
          ],
        },
      });

      const result = await weaknessService.getReadingWeakness(student._id);
      expect(result).toEqual([{ type: 'yes-no-ng', correct: 2, total: 3, accuracy: 2 / 3 }]);
    });

    it('ignores a TestAttempt that is not status:completed', async () => {
      const student = await createStudent();
      const p1 = await createPassage({
        questionRange: { start: 1, end: 3 },
        questionGroups: [{ groupType: 'plain', questions: [
          { questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'a' },
          { questionNumber: 2, type: 'fill-blank', questionText: 'Q2', correctAnswer: 'a' },
          { questionNumber: 3, type: 'fill-blank', questionText: 'Q3', correctAnswer: 'a' },
        ] }],
      });
      await createTestAttempt({
        userId: student._id,
        testId: new mongoose.Types.ObjectId(),
        passagesUsed: [p1._id],
        extra: {
          status: 'in-progress',
          answers: [
            { questionNumber: 1, userAnswer: 'a', correctAnswer: 'a', isCorrect: true },
            { questionNumber: 2, userAnswer: 'a', correctAnswer: 'a', isCorrect: true },
            { questionNumber: 3, userAnswer: 'a', correctAnswer: 'a', isCorrect: true },
          ],
        },
      });

      const result = await weaknessService.getReadingWeakness(student._id);
      expect(result).toEqual([]);
    });
  });

  describe('getListeningWeakness', () => {
    it('computes accuracy per type from a practice attempt against its ListeningSection', async () => {
      const student = await createStudent();
      const section = await createListeningSection({
        questionRange: { start: 1, end: 3 },
        questionGroups: [{ groupType: 'plain', questions: [
          { questionNumber: 1, type: 'map-labelling', questionText: 'Q1', correctAnswer: 'A' },
          { questionNumber: 2, type: 'map-labelling', questionText: 'Q2', correctAnswer: 'B' },
          { questionNumber: 3, type: 'map-labelling', questionText: 'Q3', correctAnswer: 'C' },
        ] }],
      });
      await ListeningPracticeAttempt.create({
        userId: student._id,
        sectionId: section._id,
        answers: [
          { questionNumber: 1, userAnswer: 'A', correctAnswer: 'A', isCorrect: true },
          { questionNumber: 2, userAnswer: 'X', correctAnswer: 'B', isCorrect: false },
          { questionNumber: 3, userAnswer: 'X', correctAnswer: 'C', isCorrect: false },
        ],
      });

      const result = await weaknessService.getListeningWeakness(student._id);
      expect(result).toEqual([{ type: 'map-labelling', correct: 1, total: 3, accuracy: 1 / 3 }]);
    });

    it('joins a full ListeningAttempt to its ListeningTest embedded sections', async () => {
      const student = await createStudent();
      const test = await createListeningTest({
        sections: [{
          partNumber: 1,
          title: 'Part 1',
          questionRange: { start: 1, end: 3 },
          questionGroups: [{ groupType: 'plain', questions: [
            { questionNumber: 1, type: 'matching', questionText: 'Q1', correctAnswer: 'A' },
            { questionNumber: 2, type: 'matching', questionText: 'Q2', correctAnswer: 'B' },
            { questionNumber: 3, type: 'matching', questionText: 'Q3', correctAnswer: 'C' },
          ] }],
        }],
      });
      await createListeningAttempt({
        userId: student._id,
        testId: test._id,
        answers: [
          { questionNumber: 1, userAnswer: 'A', correctAnswer: 'A', isCorrect: true },
          { questionNumber: 2, userAnswer: 'B', correctAnswer: 'B', isCorrect: true },
          { questionNumber: 3, userAnswer: 'X', correctAnswer: 'C', isCorrect: false },
        ],
      });

      const result = await weaknessService.getListeningWeakness(student._id);
      expect(result).toEqual([{ type: 'matching', correct: 2, total: 3, accuracy: 2 / 3 }]);
    });
  });

  describe('getWritingWeakness', () => {
    const gradeBlock = (ta, cc, lr, gra) => ({
      bandScore: (ta + cc + lr + gra) / 4,
      ta: { score: ta }, cc: { score: cc }, lr: { score: lr }, gra: { score: gra },
    });

    it('averages each criterion across confirmed-grading attempts, weakest first', async () => {
      const student = await createStudent();
      for (const [ta, cc, lr, gra] of [[6, 7, 7, 7], [6, 7, 7, 7], [6, 7, 7, 7]]) {
        await createWritingAttempt({
          userId: student._id,
          extra: { grading: { task1: gradeBlock(ta, cc, lr, gra) } },
        });
      }

      const result = await weaknessService.getWritingWeakness(student._id);
      expect(result[0]).toEqual({ criterion: 'ta', avgScore: 6, count: 3 });
      expect(result[result.length - 1].avgScore).toBe(7);
    });

    it('prefers teacher-confirmed grading over aiGrading for the same task', async () => {
      const student = await createStudent();
      for (let i = 0; i < 3; i++) {
        await createWritingAttempt({
          userId: student._id,
          extra: {
            grading: { task1: gradeBlock(8, 8, 8, 8) },
            aiGrading: { task1: gradeBlock(3, 3, 3, 3) },
          },
        });
      }

      const result = await weaknessService.getWritingWeakness(student._id);
      expect(result.every(c => c.avgScore === 8)).toBe(true);
    });

    it('falls back to aiGrading when no confirmed grading exists', async () => {
      const student = await createStudent();
      for (let i = 0; i < 3; i++) {
        await createWritingAttempt({
          userId: student._id,
          extra: { aiGrading: { task1: gradeBlock(5, 5, 5, 5) } },
        });
      }

      const result = await weaknessService.getWritingWeakness(student._id);
      expect(result.every(c => c.avgScore === 5)).toBe(true);
    });

    it('excludes criteria below MIN_SAMPLE_SIZE', async () => {
      const student = await createStudent();
      await createWritingAttempt({ userId: student._id, extra: { grading: { task1: gradeBlock(4, 4, 4, 4) } } });
      const result = await weaknessService.getWritingWeakness(student._id);
      expect(result).toEqual([]);
    });
  });

  describe('getSpeakingWeakness', () => {
    it('averages each criterion across analyzed attempts, weakest first', async () => {
      const student = await createStudent();
      for (let i = 0; i < 3; i++) {
        await createSpeakingAttempt({
          userId: student._id,
          extra: { aiFeedback: { fluency: 7, vocabulary: 7, grammar: 4, pronunciation: 7 } },
        });
      }

      const result = await weaknessService.getSpeakingWeakness(student._id);
      expect(result[0]).toEqual({ criterion: 'grammar', avgScore: 4, count: 3 });
    });

    it('ignores attempts that are not status:analyzed', async () => {
      const student = await createStudent();
      await createSpeakingAttempt({
        userId: student._id,
        status: 'pending',
        extra: { aiFeedback: { fluency: 4, vocabulary: 4, grammar: 4, pronunciation: 4 } },
      });
      await createSpeakingAttempt({
        userId: student._id,
        status: 'pending',
        extra: { aiFeedback: { fluency: 4, vocabulary: 4, grammar: 4, pronunciation: 4 } },
      });

      const result = await weaknessService.getSpeakingWeakness(student._id);
      expect(result).toEqual([]);
    });
  });

  describe('getWeaknessProfile', () => {
    it('combines all four skills into one object', async () => {
      const student = await createStudent();
      const result = await weaknessService.getWeaknessProfile(student._id);
      expect(result).toEqual({ reading: [], listening: [], writing: [], speaking: [] });
    });
  });
});
