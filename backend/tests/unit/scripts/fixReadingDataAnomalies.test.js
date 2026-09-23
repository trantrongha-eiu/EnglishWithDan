// Pure planning logic of the one-off Reading data fix — no DB involved.
const { stripOwnLetters, planForPassage } = require('../../../scripts/fixReadingDataAnomalies');

describe('stripOwnLetters', () => {
  test('strips "A …", "B. …", "C) …" when every entry carries its own letter in order', () => {
    expect(stripOwnLetters(['A predicting the future', 'B. describing a public', 'C) outlining', 'D   highlighting'])).toEqual(
      ['predicting the future', 'describing a public', 'outlining', 'highlighting']);
  });

  test('leaves real text alone: one entry without its letter, wrong order, or an article "A"', () => {
    expect(stripOwnLetters(['A new theory', 'Another idea', 'Criticising', 'Doubting'])).toBeNull();
    expect(stripOwnLetters(['B first', 'A second'])).toBeNull();
    expect(stripOwnLetters(['A', 'B', 'C', 'D'])).toBeNull(); // bare paragraph letters are fine as they are
    expect(stripOwnLetters(['A text', ''])).toBeNull();
    expect(stripOwnLetters(undefined)).toBeNull();
  });
});

describe('planForPassage', () => {
  test('plans option/matchingOptions prefix fixes with exact paths', () => {
    const plan = planForPassage({
      title: 'Some passage',
      questionGroups: [
        { groupTitle: 'Q1-2', questions: [
          { questionNumber: 1, options: ['A one', 'B two', 'C three'] },
          { questionNumber: 2, options: ['clean', 'options', 'here'] },
        ] },
        { groupTitle: 'Q3', matchingOptions: ['A   Matt Elliot', 'B   Karen Russell'], questions: [{ questionNumber: 3 }] },
      ],
      questions: [{ questionNumber: 1, options: ['A one', 'B two', 'C three'] }],
    });
    expect(plan.map(c => [c.path, c.to])).toEqual([
      ['questionGroups.0.questions.0.options', ['one', 'two', 'three']],
      ['questionGroups.1.matchingOptions', ['Matt Elliot', 'Karen Russell']],
      ['questions.0.options', ['one', 'two', 'three']],
    ]);
  });

  test('Robot Umpires Q27–32 become YES/NO/NOT GIVEN with the same verdicts', () => {
    const qs = [['TRUE', 28], ['FALSE', 27], ['NOT GIVEN', 29]].map(([k, n]) => ({
      questionNumber: n, type: 'true-false-ng', correctAnswer: k, explanation: k === 'FALSE' ? 'Phân tích … → FALSE' : 'x',
    }));
    const plan = planForPassage({ title: 'Invasion of the Robot Umpires', questionGroups: [{ questions: qs }] });
    const byPath = Object.fromEntries(plan.map(c => [c.path, c.to]));
    expect(byPath['questionGroups.0.questions.0.type']).toBe('yes-no-ng');
    expect(byPath['questionGroups.0.questions.0.correctAnswer']).toBe('YES');
    expect(byPath['questionGroups.0.questions.1.correctAnswer']).toBe('NO');
    expect(byPath['questionGroups.0.questions.1.explanation']).toBe('Phân tích … → NO');
    expect(byPath['questionGroups.0.questions.2.correctAnswer']).toBeUndefined(); // NOT GIVEN stays
  });

  test('is idempotent: an already-fixed passage plans nothing', () => {
    expect(planForPassage({
      title: 'Roman tunnels',
      questionGroups: [{ questions: [{ questionNumber: 13, questionText: 'What part of Seleuceia Pieria was the Çevlik tunnel built to protect?', correctAnswer: 'the harbor / harbor' }] }],
    })).toEqual([]);
    expect(planForPassage({
      title: 'Innovation in Business',
      questionGroups: [{ questions: [{ questionNumber: 35, questionText: 'According to the writer, companies like Previously Unavailable' }] }],
    })).toEqual([]);
  });
});
