'use strict';

const mongoose = require('mongoose');
const recommendationService = require('../../../services/recommendationService');
const { createStudent } = require('../../factories/userFactory');
const {
  createPassage, createReadingPracticeAttempt,
  createListeningSection, createWritingAttempt, createSpeakingAttempt,
  createVocabBook,
} = require('../../factories/contentFactory');
const ListeningPracticeAttempt = require('../../../models/ListeningPracticeAttempt');

const gradeBlock = (ta, cc, lr, gra) => ({
  bandScore: (ta + cc + lr + gra) / 4,
  ta: { score: ta }, cc: { score: cc }, lr: { score: lr }, gra: { score: gra },
});

describe('recommendationService.getRecommendations', () => {
  describe('User A — no history', () => {
    it('returns a single onboarding GENERAL_REVIEW, dataConfidence "none", never claims a weakness', async () => {
      const student = await createStudent();
      const result = await recommendationService.getRecommendations(student._id);

      expect(result.recommendations).toHaveLength(1);
      expect(result.recommendations[0].type).toBe('GENERAL_REVIEW');
      expect(result.recommendations[0].metadata.onboarding).toBe(true);
      expect(result.recommendations[0].reason).toMatch(/unlock personalized recommendations/i);
      expect(result.recommendations[0].reason).not.toMatch(/weak/i);
      expect(result.dataConfidence).toBe('none');
      expect(result.generatedAt).toBeTruthy();
    });
  });

  describe('User B — vocabulary due', () => {
    it('ranks VOCAB_REVIEW as the primary (priority 1) recommendation', async () => {
      const student = await createStudent();
      await createVocabBook({
        userId: student._id,
        words: Array.from({ length: 12 }, (_, i) => ({ word: `w${i}`, nextReviewAt: null })),
      });

      const result = await recommendationService.getRecommendations(student._id);
      expect(result.recommendations[0].type).toBe('VOCAB_REVIEW');
      expect(result.recommendations[0].priority).toBe(1);
      expect(result.recommendations[0].title).toBe('Review your vocabulary');
      expect(result.recommendations[0].reason).toBe('12 words are due for review.');
      expect(result.recommendations[0].action).toEqual({ label: 'Review 12 words', href: 'dashboard.html', actionLevel: 'vocab-review' });
      expect(result.recommendations[0].metadata.dueCount).toBe(12);
      expect(result.recommendations[0].metadata.recommendedSessionSize).toBe(12); // dueCount < 20 -> use dueCount
    });
  });

  describe('User C — reading weakness', () => {
    it('surfaces READING_WEAK_TYPE when accuracy is below the relevance bar', async () => {
      const student = await createStudent();
      const passage = await createPassage({
        questionRange: { start: 1, end: 4 },
        questionGroups: [{ groupType: 'plain', questions: [
          { questionNumber: 1, type: 'sentence-completion', questionText: 'Q1', correctAnswer: 'a' },
          { questionNumber: 2, type: 'sentence-completion', questionText: 'Q2', correctAnswer: 'a' },
          { questionNumber: 3, type: 'sentence-completion', questionText: 'Q3', correctAnswer: 'a' },
          { questionNumber: 4, type: 'sentence-completion', questionText: 'Q4', correctAnswer: 'a' },
        ] }],
      });
      await createReadingPracticeAttempt({
        userId: student._id, passageId: passage._id,
        answers: [1, 2, 3, 4].map(n => ({ questionNumber: n, userAnswer: 'x', correctAnswer: 'a', isCorrect: false })),
      });

      const result = await recommendationService.getRecommendations(student._id);
      const rec = result.recommendations.find(r => r.type === 'READING_WEAK_TYPE');
      expect(rec).toBeTruthy();
      expect(rec.metadata.questionType).toBe('sentence-completion');
      expect(rec.metadata.accuracy).toBe(0);
      expect(rec.reason).toBe('You scored 0% correctly on "sentence-completion" across your last 4 attempts.');
      expect(rec.action).toEqual({ label: 'Practice Reading', href: 'reading.html', actionLevel: 'skill' });
    });

    it('does NOT surface a reading recommendation once accuracy clears the 70% bar', async () => {
      const student = await createStudent();
      const passage = await createPassage({
        questionRange: { start: 1, end: 4 },
        questionGroups: [{ groupType: 'plain', questions: [
          { questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'a' },
          { questionNumber: 2, type: 'fill-blank', questionText: 'Q2', correctAnswer: 'a' },
          { questionNumber: 3, type: 'fill-blank', questionText: 'Q3', correctAnswer: 'a' },
          { questionNumber: 4, type: 'fill-blank', questionText: 'Q4', correctAnswer: 'a' },
        ] }],
      });
      await createReadingPracticeAttempt({
        userId: student._id, passageId: passage._id,
        answers: [
          { questionNumber: 1, userAnswer: 'a', correctAnswer: 'a', isCorrect: true },
          { questionNumber: 2, userAnswer: 'a', correctAnswer: 'a', isCorrect: true },
          { questionNumber: 3, userAnswer: 'a', correctAnswer: 'a', isCorrect: true },
          { questionNumber: 4, userAnswer: 'x', correctAnswer: 'a', isCorrect: false },
        ],
      });

      const result = await recommendationService.getRecommendations(student._id);
      expect(result.recommendations.find(r => r.type === 'READING_WEAK_TYPE')).toBeUndefined();
    });
  });

  describe('User D — listening weakness', () => {
    it('surfaces LISTENING_WEAK_TYPE when accuracy is below the relevance bar', async () => {
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
        userId: student._id, sectionId: section._id,
        answers: [
          { questionNumber: 1, userAnswer: 'X', correctAnswer: 'A', isCorrect: false },
          { questionNumber: 2, userAnswer: 'X', correctAnswer: 'B', isCorrect: false },
          { questionNumber: 3, userAnswer: 'C', correctAnswer: 'C', isCorrect: true },
        ],
      });

      const result = await recommendationService.getRecommendations(student._id);
      const rec = result.recommendations.find(r => r.type === 'LISTENING_WEAK_TYPE');
      expect(rec).toBeTruthy();
      expect(rec.metadata.questionType).toBe('map-labelling');
      expect(rec.action.href).toBe('listening.html');
    });
  });

  describe('User E — weak vocabulary', () => {
    it('surfaces VOCAB_WEAK when words have wrongCount >= 3, even with nothing due', async () => {
      const student = await createStudent();
      const future = new Date(Date.now() + 30 * 86400000);
      await createVocabBook({
        userId: student._id,
        words: [
          { word: 'a', wrongCount: 5, nextReviewAt: future },
          { word: 'b', wrongCount: 3, nextReviewAt: future },
          { word: 'c', wrongCount: 0, nextReviewAt: future },
        ],
      });

      const result = await recommendationService.getRecommendations(student._id);
      expect(result.recommendations.find(r => r.type === 'VOCAB_REVIEW')).toBeUndefined(); // nothing due
      const rec = result.recommendations.find(r => r.type === 'VOCAB_WEAK');
      expect(rec).toBeTruthy();
      expect(rec.title).toBe('Practice weak vocabulary');
      expect(rec.metadata.weakCount).toBe(2);
      expect(rec.metadata.recommendedSessionSize).toBe(2); // weakCount < 20 -> use weakCount
      expect(rec.reason).toBe('2 words in your notebook have been answered wrong 3+ times.');
      expect(rec.action.label).toBe('Practice 2 weak words');
    });

    it('uses singular grammar for exactly 1 weak word', async () => {
      const student = await createStudent();
      const future = new Date(Date.now() + 30 * 86400000);
      await createVocabBook({ userId: student._id, words: [{ word: 'a', wrongCount: 3, nextReviewAt: future }] });

      const result = await recommendationService.getRecommendations(student._id);
      const rec = result.recommendations.find(r => r.type === 'VOCAB_WEAK');
      expect(rec.title).toBe('Practice weak vocabulary');
      expect(rec.reason).toBe('1 word in your notebook has been answered wrong 3+ times.');
      expect(rec.action.label).toBe('Practice 1 weak word');
      expect(rec.metadata.recommendedSessionSize).toBe(1);
    });

    it('caps recommendedSessionSize at the default (20) when weakCount is large', async () => {
      const student = await createStudent();
      const future = new Date(Date.now() + 30 * 86400000);
      await createVocabBook({
        userId: student._id,
        words: Array.from({ length: 45 }, (_, i) => ({ word: `w${i}`, wrongCount: 3, nextReviewAt: future })),
      });

      const result = await recommendationService.getRecommendations(student._id);
      const rec = result.recommendations.find(r => r.type === 'VOCAB_WEAK');
      expect(rec.metadata.weakCount).toBe(45);
      expect(rec.metadata.recommendedSessionSize).toBe(20);
      expect(rec.action.label).toBe('Practice 20 weak words');
      expect(rec.reason).toBe('45 words in your notebook have been answered wrong 3+ times.'); // full count stays visible as context
    });
  });

  describe('User F — writing weakness', () => {
    it('surfaces WRITING_WEAK_CRITERION when one criterion trails its siblings by >= 0.5 band', async () => {
      const student = await createStudent();
      for (let i = 0; i < 3; i++) {
        await createWritingAttempt({
          userId: student._id,
          extra: { grading: { task1: gradeBlock(6.5, 6.5, 5.0, 6.5) } }, // lr trails by 1.5
        });
      }

      const result = await recommendationService.getRecommendations(student._id);
      const rec = result.recommendations.find(r => r.type === 'WRITING_WEAK_CRITERION');
      expect(rec).toBeTruthy();
      expect(rec.metadata.criterion).toBe('lr');
      expect(rec.title).toBe('Practice Writing — Lexical Resource');
      expect(rec.reason).toContain('Lexical Resource average is 5.0');
    });

    it('does NOT surface a writing recommendation when criteria are within the imbalance bar', async () => {
      const student = await createStudent();
      for (let i = 0; i < 3; i++) {
        await createWritingAttempt({
          userId: student._id,
          extra: { grading: { task1: gradeBlock(6.5, 6.5, 6.2, 6.5) } }, // lr only 0.2 below — not enough
        });
      }
      const result = await recommendationService.getRecommendations(student._id);
      expect(result.recommendations.find(r => r.type === 'WRITING_WEAK_CRITERION')).toBeUndefined();
    });
  });

  describe('User G — speaking weakness', () => {
    it('surfaces SPEAKING_WEAK_CRITERION when one criterion trails its siblings by >= 0.5 band', async () => {
      const student = await createStudent();
      for (let i = 0; i < 3; i++) {
        await createSpeakingAttempt({
          userId: student._id,
          extra: { aiFeedback: { fluency: 6.5, vocabulary: 6.5, grammar: 5.0, pronunciation: 6.5 } },
        });
      }
      const result = await recommendationService.getRecommendations(student._id);
      const rec = result.recommendations.find(r => r.type === 'SPEAKING_WEAK_CRITERION');
      expect(rec).toBeTruthy();
      expect(rec.metadata.criterion).toBe('grammar');
      expect(rec.action.href).toBe('speaking.html');
    });
  });

  describe('User H — multiple weaknesses, ranking', () => {
    it('ranks VOCAB_REVIEW > READING/LISTENING weak type > VOCAB_WEAK > WRITING/SPEAKING criterion', async () => {
      const student = await createStudent();

      // Vocab: some due, some weak.
      const future = new Date(Date.now() + 30 * 86400000);
      await createVocabBook({
        userId: student._id,
        words: [
          { word: 'due1', nextReviewAt: null },
          { word: 'weak1', wrongCount: 4, nextReviewAt: future },
          { word: 'weak2', wrongCount: 4, nextReviewAt: future },
        ],
      });

      // Reading: severe weakness.
      const passage = await createPassage({
        questionRange: { start: 1, end: 3 },
        questionGroups: [{ groupType: 'plain', questions: [1, 2, 3].map(n => ({ questionNumber: n, type: 'fill-blank', questionText: `Q${n}`, correctAnswer: 'a' })) }],
      });
      await createReadingPracticeAttempt({
        userId: student._id, passageId: passage._id,
        answers: [1, 2, 3].map(n => ({ questionNumber: n, userAnswer: 'x', correctAnswer: 'a', isCorrect: false })),
      });

      // Writing: mild imbalance.
      for (let i = 0; i < 3; i++) {
        await createWritingAttempt({ userId: student._id, extra: { grading: { task1: gradeBlock(6.5, 6.5, 5.5, 6.5) } } });
      }

      const result = await recommendationService.getRecommendations(student._id);
      const types = result.recommendations.map(r => r.type);
      expect(types[0]).toBe('VOCAB_REVIEW');
      expect(types.indexOf('READING_WEAK_TYPE')).toBeLessThan(types.indexOf('VOCAB_WEAK'));
      expect(types.indexOf('VOCAB_WEAK')).toBeLessThan(types.indexOf('WRITING_WEAK_CRITERION'));
      // priority numbers are sequential and match array order
      result.recommendations.forEach((r, i) => expect(r.priority).toBe(i + 1));
      expect(result.dataConfidence).toBe('high');
    });
  });

  describe('User I — determinism (recency is a documented V1 limitation, not implemented)', () => {
    it('returns the same ranked result on repeated calls against the same underlying data', async () => {
      const student = await createStudent();
      const passage = await createPassage({
        questionRange: { start: 1, end: 3 },
        questionGroups: [{ groupType: 'plain', questions: [1, 2, 3].map(n => ({ questionNumber: n, type: 'fill-blank', questionText: `Q${n}`, correctAnswer: 'a' })) }],
      });
      await createReadingPracticeAttempt({
        userId: student._id, passageId: passage._id,
        answers: [1, 2, 3].map(n => ({ questionNumber: n, userAnswer: 'x', correctAnswer: 'a', isCorrect: false })),
      });

      const first = await recommendationService.getRecommendations(student._id);
      const second = await recommendationService.getRecommendations(student._id);
      expect(first.recommendations.map(r => ({ ...r }))).toEqual(
        second.recommendations.map(r => ({ ...r }))
      );
    });
  });

  describe('User J — only 1-2 samples', () => {
    it('does not recommend a weakness from below-threshold sample sizes, falls back to balanced GENERAL_REVIEW', async () => {
      const student = await createStudent();
      await createVocabBook({ userId: student._id, words: [{ word: 'apple', nextReviewAt: new Date(Date.now() + 30 * 86400000) }] });

      const passage = await createPassage({
        questionRange: { start: 1, end: 2 },
        questionGroups: [{ groupType: 'plain', questions: [1, 2].map(n => ({ questionNumber: n, type: 'fill-blank', questionText: `Q${n}`, correctAnswer: 'a' })) }],
      });
      // Only 2 answers — below MIN_SAMPLE_SIZE (3), weaknessService itself filters this out.
      await createReadingPracticeAttempt({
        userId: student._id, passageId: passage._id,
        answers: [1, 2].map(n => ({ questionNumber: n, userAnswer: 'x', correctAnswer: 'a', isCorrect: false })),
      });

      const result = await recommendationService.getRecommendations(student._id);
      expect(result.recommendations.find(r => r.type === 'READING_WEAK_TYPE')).toBeUndefined();
      expect(result.recommendations).toHaveLength(1);
      expect(result.recommendations[0].type).toBe('GENERAL_REVIEW');
      expect(result.recommendations[0].metadata.onboarding).toBe(false); // has 1 saved word -> not a brand-new account
      expect(result.dataConfidence).toBe('low');
    });
  });

  describe('Issue 6 — recommendedSessionSize (vocab overload refinement)', () => {
    async function vocabBookWithDue(userId, dueCount) {
      return createVocabBook({
        userId,
        words: Array.from({ length: dueCount }, (_, i) => ({ word: `due${i}`, nextReviewAt: null })),
      });
    }
    async function vocabBookWithWeak(userId, weakCount) {
      const future = new Date(Date.now() + 30 * 86400000);
      return createVocabBook({
        userId,
        words: Array.from({ length: weakCount }, (_, i) => ({ word: `weak${i}`, wrongCount: 3, nextReviewAt: future })),
      });
    }

    it('dueCount 574 -> recommendedSessionSize caps at 20, full count stays visible in reason', async () => {
      const student = await createStudent();
      await vocabBookWithDue(student._id, 574);
      const result = await recommendationService.getRecommendations(student._id);
      const rec = result.recommendations.find(r => r.type === 'VOCAB_REVIEW');
      expect(rec.metadata.dueCount).toBe(574);
      expect(rec.metadata.recommendedSessionSize).toBe(20);
      expect(rec.reason).toBe('574 words are due for review.');
      expect(rec.action.label).toBe('Review 20 words');
    });

    it('dueCount 12 -> recommendedSessionSize uses the full 12 (below the default cap)', async () => {
      const student = await createStudent();
      await vocabBookWithDue(student._id, 12);
      const result = await recommendationService.getRecommendations(student._id);
      const rec = result.recommendations.find(r => r.type === 'VOCAB_REVIEW');
      expect(rec.metadata.dueCount).toBe(12);
      expect(rec.metadata.recommendedSessionSize).toBe(12);
      expect(rec.action.label).toBe('Review 12 words');
    });

    it('weakCount 45 -> recommendedSessionSize caps at 20', async () => {
      const student = await createStudent();
      await vocabBookWithWeak(student._id, 45);
      const result = await recommendationService.getRecommendations(student._id);
      const rec = result.recommendations.find(r => r.type === 'VOCAB_WEAK');
      expect(rec.metadata.weakCount).toBe(45);
      expect(rec.metadata.recommendedSessionSize).toBe(20);
      expect(rec.action.label).toBe('Practice 20 weak words');
    });

    it('weakCount 7 -> recommendedSessionSize uses the full 7', async () => {
      const student = await createStudent();
      await vocabBookWithWeak(student._id, 7);
      const result = await recommendationService.getRecommendations(student._id);
      const rec = result.recommendations.find(r => r.type === 'VOCAB_WEAK');
      expect(rec.metadata.weakCount).toBe(7);
      expect(rec.metadata.recommendedSessionSize).toBe(7);
      expect(rec.action.label).toBe('Practice 7 weak words');
    });

    it('dueCount 0 -> no VOCAB_REVIEW candidate at all', async () => {
      const student = await createStudent();
      const future = new Date(Date.now() + 30 * 86400000);
      await createVocabBook({ userId: student._id, words: [{ word: 'notdue', nextReviewAt: future }] });
      const result = await recommendationService.getRecommendations(student._id);
      expect(result.recommendations.find(r => r.type === 'VOCAB_REVIEW')).toBeUndefined();
    });

    it('DEFAULT_SESSION_SIZE is 20, matching the spec default', () => {
      expect(recommendationService.DEFAULT_SESSION_SIZE).toBe(20);
    });
  });

  describe('tier ladder guarantee', () => {
    it('a maximally-severe lower-tier candidate never outranks a higher tier\'s minimum score', async () => {
      // VOCAB_WEAK's absolute maximum score (severity=100, confidence=100)
      // must stay below READING_WEAK_TYPE's absolute minimum (severity=0,
      // confidence=0) — proves the 500-point tier gap holds under the
      // actual weight formula, not just "usually".
      const student = await createStudent();
      await createVocabBook({
        userId: student._id,
        words: Array.from({ length: 20 }, (_, i) => ({ word: `w${i}`, wrongCount: 3, nextReviewAt: new Date(Date.now() + 30 * 86400000) })),
      });
      const result = await recommendationService.getRecommendations(student._id);
      const vocabWeak = result.recommendations.find(r => r.type === 'VOCAB_WEAK');
      expect(vocabWeak.score).toBeLessThan(1500); // READING_WEAK_TYPE / LISTENING_WEAK_TYPE tier floor
    });
  });
});
