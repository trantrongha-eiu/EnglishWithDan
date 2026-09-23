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

  test('Robots and us Q38 key E (4 options) → C, and the "lt" typo in Q37', () => {
    const plan = planForPassage({ title: 'Robots and us', questionGroups: [{ questions: [
      { questionNumber: 37, options: ['lt has grown alongside robots.', 'Other', 'Third', 'Fourth'] },
      { questionNumber: 38, options: ['w', 'x', 'y', 'z'], correctAnswer: 'E' },
    ] }] });
    expect(plan.map(c => [c.path, c.to])).toEqual([
      ['questionGroups.0.questions.1.correctAnswer', 'C'],
      ['questionGroups.0.questions.0.options', ['It has grown alongside robots.', 'Other', 'Third', 'Fourth']],
    ]);
  });

  test('a person-matching group loses the wrong "interchangeable" flag; a Choose-TWO group keeps it', () => {
    const plan = planForPassage({ title: 'Should we try to bring extinct species back to life?', questionGroups: [
      { instruction: 'Choose TWO letters, A–E.', interchangeableAnswers: true, questions: [] },
      { instruction: 'Match each statement with the correct person, A, B or C.', interchangeableAnswers: true, questions: [] },
    ] });
    expect(plan.map(c => [c.path, c.to])).toEqual([['questionGroups.1.interchangeableAnswers', false]]);
  });

  test('Answers Underground gets A–J on its ten paragraphs, once', () => {
    const content = 'Subtitle\n' + Array.from({ length: 10 }, (_, i) => `<p>Para ${i}.</p>`).join('');
    const [c] = planForPassage({ title: 'Answers Underground', content });
    expect(c.path).toBe('content');
    expect(c.to.startsWith('Subtitle\n<p><strong>A</strong> Para 0.</p><p><strong>B</strong> Para 1.</p>')).toBe(true);
    expect(c.to).toContain('<p><strong>J</strong> Para 9.</p>');
    expect(planForPassage({ title: 'Answers Underground', content: c.to })).toEqual([]);
  });

  test('companies Q38: rewrites an explanation copied from Q37, leaves an original one alone', () => {
    const copied = planForPassage({ title: 'What should companies do to survive?', questionGroups: [{ questions: [
      { questionNumber: 37, explanation: 'Giải thích: Đoạn E …' },
      { questionNumber: 38, explanation: 'Giải thích: Đoạn E …' },
    ] }] });
    expect(copied).toHaveLength(1);
    expect(copied[0].path).toBe('questionGroups.0.questions.1.explanation');
    expect(copied[0].to).toMatch(/^Giải thích: Đoạn F/);
    expect(planForPassage({ title: 'What should companies do to survive?', questionGroups: [{ questions: [
      { questionNumber: 37, explanation: 'Giải thích: Đoạn E …' },
      { questionNumber: 38, explanation: copied[0].to },
    ] }] })).toEqual([]);
  });

  test('monkey life: restores the cut-off ending once', () => {
    const content = '<p><strong>F</strong> The howlers moved in. This strange habitat seems to support about</p>\n\n';
    const [c] = planForPassage({ title: 'The return of monkey life', content });
    expect(c.to).toContain('as many monkeys as would a same-sized patch of wild forest.');
    expect(c.to).toContain('<p><strong>G</strong> Estrada believes');
    expect(planForPassage({ title: 'The return of monkey life', content: c.to })).toEqual([]);
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
