const {
  buildQuestionMaterial, validateWarmUp, mergeWarmUps, toStudentWarmUp, sanitizeWarmUpInput, BLANK,
} = require('../../../utils/listeningWarmUp');

const transcript = `Sally:
They think the tutors are in favour of it because they don't have to spend so long marking.
Sally:
The real gain is the fact that the students learn to stand back and assess their own assignments objectively.
Steve:
Did you bring a torch? You'll need swimming togs too.`;

const section = {
  questionGroups: [{
    instruction: 'Choose the correct letter, A, B or C.',
    matchingOptions: ['They gave higher marks.'],
    questions: [
      { questionNumber: 21, questionText: 'Sally says many students see peer assessment as', options: ['a way for tutors to save time.', 'a useful learning tool'] },
      { questionNumber: 22, questionText: 'What is an advantage?', options: ["It increases students' self-awareness"] },
      { questionNumber: 23, questionText: 'Bring a torch and swimming togs', options: [] },
    ],
  }],
};
const ctx = { transcript, questionMaterial: buildQuestionMaterial(section) };

describe('buildQuestionMaterial', () => {
  test('collects instructions, question text and options', () => {
    expect(ctx.questionMaterial).toContain('21. Sally says many students see peer assessment as');
    expect(ctx.questionMaterial).toContain('a way for tutors to save time.');
    expect(ctx.questionMaterial).toContain('They gave higher marks.');
  });
});

describe('validateWarmUp', () => {
  test('keeps items grounded verbatim in questions and transcript (case/punctuation-insensitive)', () => {
    const v = validateWarmUp({
      synonyms: [{ keyword: 'save time', answer: "don't have to spend so long" }],
      paraphrases: [{ question: 'a way for tutors to save time', evidence: "they don't have to spend so long ___", answer: 'marking' }],
    }, ctx);
    expect(v.synonyms).toEqual([{ keyword: 'save time', answer: "don't have to spend so long" }]);
    expect(v.paraphrases).toEqual([{ question: 'a way for tutors to save time', evidence: `they don't have to spend so long ${BLANK}`, answer: 'marking' }]);
    expect(v.dropped).toEqual([]);
  });

  test('drops invented keywords, answers not in the transcript, and answers that just repeat the keyword', () => {
    const v = validateWarmUp({
      synonyms: [
        { keyword: 'beneficial', answer: 'useful' },            // keyword not in questions
        { keyword: 'useful', answer: 'helpful' },               // answer not in transcript
        { keyword: 'swimming togs', answer: 'togs' },           // adds nothing
        { keyword: 'torch', answer: 'a torch' },                // repeats keyword
      ],
      paraphrases: [],
    }, ctx);
    expect(v.synonyms).toEqual([]);
    expect(v.dropped).toHaveLength(4);
  });

  test('drops paraphrases whose blank repeats a question word, has no/two blanks, or does not rebuild the transcript', () => {
    const v = validateWarmUp({
      synonyms: [],
      paraphrases: [
        { question: 'Bring a torch', evidence: 'Did you bring ____?', answer: 'a torch' },
        { question: "It increases students' self-awareness", evidence: 'assess their own assignments objectively', answer: 'objectively' },
        { question: "It increases students' self-awareness", evidence: 'assess their ____ assignments ____', answer: 'own' },
        { question: "It increases students' self-awareness", evidence: 'assess their own essays ____', answer: 'objectively' },
      ],
    }, ctx);
    expect(v.paraphrases).toEqual([]);
    expect(v.dropped).toHaveLength(4);
  });

  test('a reworded question pointing at the same transcript spot is a duplicate', () => {
    const v = validateWarmUp({
      synonyms: [],
      paraphrases: [
        { question: "It increases students' self-awareness", evidence: 'assess their own assignments ____', answer: 'objectively' },
        { question: "increases students' self-awareness", evidence: 'assess their own assignments ____', answer: 'objectively' },
      ],
    }, ctx);
    expect(v.paraphrases).toHaveLength(1);
  });
});

describe('mergeWarmUps', () => {
  test('dedupes across passes and orders paraphrases by where they are heard', () => {
    const later = { question: "It increases students' self-awareness", evidence: 'assess their own assignments ____', answer: 'objectively' };
    const earlier = { question: 'a way for tutors to save time', evidence: "don't have to spend so long ____", answer: 'marking' };
    const m = mergeWarmUps([{ synonyms: [], paraphrases: [later] }, { synonyms: [], paraphrases: [earlier, later] }], ctx);
    expect(m.paraphrases.map((p) => p.answer)).toEqual(['marking', 'objectively']);
  });
});

describe('toStudentWarmUp', () => {
  test('never includes an answer', () => {
    const s = toStudentWarmUp({
      synonyms: [{ keyword: 'save time', answer: 'spend so long' }],
      paraphrases: [{ question: 'q', evidence: `e ${BLANK}`, answer: 'secret' }],
    });
    expect(JSON.stringify(s)).not.toMatch(/spend so long|secret/);
    expect(s).toEqual({ synonyms: [{ keyword: 'save time' }], paraphrases: [{ question: 'q', evidence: `e ${BLANK}` }] });
  });

  test('null when there is nothing to show', () => {
    expect(toStudentWarmUp(undefined)).toBeNull();
    expect(toStudentWarmUp({ synonyms: [], paraphrases: [] })).toBeNull();
  });
});

describe('sanitizeWarmUpInput', () => {
  test('trims, drops empty rows, normalises the blank', () => {
    expect(sanitizeWarmUpInput({
      synonyms: [{ keyword: '  useful ', answer: ' beneficial ' }, { keyword: '', answer: 'x' }],
      paraphrases: [{ question: 'q', evidence: 'spend so long _______', answer: 'marking' }, { question: '', evidence: 'x' }],
    })).toEqual({
      synonyms: [{ keyword: 'useful', answer: 'beneficial' }],
      paraphrases: [{ question: 'q', evidence: `spend so long ${BLANK}`, answer: 'marking' }],
    });
  });
});
