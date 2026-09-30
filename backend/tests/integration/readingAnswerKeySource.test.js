'use strict';

// getPassageAnswerKey must read the same keys the grader and the renderer
// use: questionGroups when present, the legacy flat questions[] only when a
// passage has no groups. A stale legacy copy used to override the group key
// ("The persistence and peril of misinformation" Q31–36: flat "G" vs group
// "frequent exposure"), so practice "Kiểm tra đáp án" marked right answers wrong.
const readingService = require('../../services/readingService');
const { createPassage } = require('../factories/contentFactory');

const q = (n, correctAnswer, extra = {}) => ({
  questionNumber: n, type: 'fill-blank', questionText: `Q${n}`, correctAnswer, ...extra,
});

describe('readingService.getPassageAnswerKey — key source', () => {
  test('questionGroups win over a stale legacy questions[] copy', async () => {
    const passage = await createPassage({
      questionGroups: [{ groupType: 'plain', questions: [q(31, 'frequent exposure', { explanation: 'group expl' }), q(32, 'different ideas')] }],
      questions: [q(31, 'G', { explanation: 'stale expl' }), q(32, 'J')],
    });
    const key = await readingService.getPassageAnswerKey(passage._id);
    expect(key[31]).toEqual({ correctAnswer: 'frequent exposure', explanation: 'group expl' });
    expect(key[32].correctAnswer).toBe('different ideas');
  });

  test('legacy passages without groups still get their flat keys', async () => {
    const passage = await createPassage({ questionGroups: [], questions: [q(1, 'TRUE'), q(2, 'river')] });
    const key = await readingService.getPassageAnswerKey(passage._id);
    expect(key[1].correctAnswer).toBe('TRUE');
    expect(key[2].correctAnswer).toBe('river');
  });
});
