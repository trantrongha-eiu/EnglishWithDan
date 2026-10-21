const {
  buildQuestionMaterial, buildTestAnswers, validateWarmUp, mergeWarmUps, toStudentWarmUp, sanitizeWarmUpInput, BLANK,
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

describe('validateWarmUp — never helps with the test itself', () => {
  const formSection = {
    questionGroups: [{
      noteConfig: { lines: ['keep the beach free of __Q1__', 'Activities: making wooden __Q9__ for children', 'safety helmet required'] },
      questions: [{ questionNumber: 1, questionText: '', correctAnswer: 'litter' }, { questionNumber: 9, questionText: '', correctAnswer: '(wooden) spoons' }],
    }],
  };
  const formTranscript = 'One of the regular ones is trying to keep the beach free of litter. You will be making spoons from wood. Helmets are issued at the gate.';
  const formCtx = { transcript: formTranscript, questionMaterial: buildQuestionMaterial(formSection), testAnswers: buildTestAnswers(formSection) };

  test('buildTestAnswers keeps word answers (with/without bracketed words), skips letters', () => {
    expect(buildTestAnswers({ questionGroups: [{ questions: [{ correctAnswer: 'A' }, { correctAnswer: 'B, C' }, { correctAnswer: '(the) island' }, { correctAnswer: 'litter/rubbish' }] }] }))
      .toEqual(['island', 'the island', 'litter', 'rubbish']);
  });

  test('drops a blank (or excerpt) that is a test answer, and gap markers in the question', () => {
    const v = validateWarmUp({
      synonyms: [{ keyword: 'free of __Q1__', answer: 'free of litter' }],
      paraphrases: [
        { question: 'keep the beach free of __Q1__', evidence: 'keep the beach free of ____', answer: 'litter' },
        { question: 'making wooden', evidence: 'making ____ from wood', answer: 'spoons' },
      ],
    }, formCtx);
    expect(v.synonyms).toEqual([]);
    expect(v.paraphrases).toEqual([]);
    expect(v.dropped.join(' ')).toMatch(/keyword-has-gap/);
    expect(v.dropped.join(' ')).toMatch(/question-has-gap/);
  });

  test('a different form of the same word is not a synonym', () => {
    const v = validateWarmUp({ synonyms: [{ keyword: 'safety helmet', answer: 'Helmets' }], paraphrases: [] }, formCtx);
    expect(v.synonyms).toEqual([]);
    expect(v.dropped[0]).toMatch(/adds-nothing/);
  });

  test('fragment questions are dropped', () => {
    const v = validateWarmUp({ synonyms: [], paraphrases: [{ question: 'making wooden', evidence: 'Helmets are ____ at the gate', answer: 'issued' }] }, formCtx);
    expect(v.dropped[0]).toMatch(/question-fragment/);
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
