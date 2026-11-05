const { classifyGroup, questionTypesOf } = require('../../../utils/questionTypes');

const g = (groupType, qType, instruction = '', groupTitle = '') =>
  ({ groupType, groupTitle, instruction, questions: [{ questionNumber: 1, type: qType }] });

describe('classifyGroup — reading', () => {
  const R = grp => classifyGroup(grp, 'reading');

  test('TFNG / YNNG / headings come from question type', () => {
    expect(R(g('plain', 'true-false-ng'))).toBe('tfng');
    expect(R(g('plain', 'yes-no-ng'))).toBe('ynng');
    expect(R(g('matching-headings', 'matching-headings'))).toBe('matching-headings');
  });

  test('matching-options splits by instruction', () => {
    expect(R(g('matching-options', 'matching-info', 'Reading Passage 2 has seven paragraphs, A–G. Which paragraph contains the following information?'))).toBe('matching-information');
    expect(R(g('matching-options', 'matching-info', 'Look at the following statements (Questions 1-5) and the list of researchers below.'))).toBe('matching-features');
    expect(R(g('matching-options', 'matching-info', 'Complete each sentence with the correct ending, A–G, below.'))).toBe('sentence-endings');
    expect(R(g('matching-options', 'matching-info', 'Choose TWO letters, A–E.'))).toBe('multiple-choice');
    expect(R(g('matching-options', 'matching-info', 'Choose the correct letter, A–D. NB You may use any letter more than once.'))).toBe('matching-features');
    expect(R(g('matching-options', 'matching-info', 'Label the diagram below. Choose the correct letter, A-H, from the list below.'))).toBe('diagram-labelling');
  });

  test('note-form splits into summary / sentence / short answer / diagram', () => {
    expect(R(g('note-form', 'fill-blank', 'Complete the summary below. Choose ONE WORD ONLY'))).toBe('summary-completion');
    expect(R(g('note-form', 'fill-blank', 'Complete the sentences below.'))).toBe('sentence-completion');
    expect(R(g('note-form', 'fill-blank', 'Answer the questions below.'))).toBe('short-answer');
    expect(R(g('note-form', 'fill-blank', 'Label the diagram below.'))).toBe('diagram-labelling');
    expect(R(g('note-form', 'fill-blank', 'Complete the flow-chart below.'))).toBe('summary-completion');
    expect(R(g('note-form', 'fill-blank', ''))).toBe('summary-completion');
  });

  test('plain MCQ', () => {
    expect(R(g('plain', 'multiple-choice', 'Choose the correct letter, A, B, C or D.'))).toBe('multiple-choice');
    expect(R(g('plain', 'multi-answer-group', 'Choose TWO letters, A-E.'))).toBe('multiple-choice');
  });
});

describe('classifyGroup — listening', () => {
  const L = grp => classifyGroup(grp, 'listening');

  test('maps the listening question types', () => {
    expect(L(g('map', 'map-labelling', 'Label the map below.'))).toBe('diagram-labelling');
    expect(L(g('map', 'map-labelling', 'Complete the flow-chart below. Choose SIX answers from the box'))).toBe('summary-completion');
    expect(L(g('matching-options', 'matching-info', 'What comment does the speaker make about each of the following?'))).toBe('matching');
    expect(L(g('matching-options', 'matching-info', 'How does Jean feel about the facilities listed below? Choose the correct letter, A, B or C.'))).toBe('matching');
    expect(L(g('note-form', 'fill-blank', 'Complete the form below.'))).toBe('summary-completion');
    expect(L(g('table', 'fill-blank', 'Complete the table below.'))).toBe('summary-completion');
    expect(L(g('plain', 'fill-blank', 'Complete the sentences below.'))).toBe('sentence-completion');
    expect(L(g('plain', 'fill-blank', 'Answer the questions below.'))).toBe('short-answer');
  });
});

test('questionTypesOf keeps first-seen order, no duplicates', () => {
  const groups = [
    g('plain', 'true-false-ng'),
    g('note-form', 'fill-blank', 'Complete the summary below.'),
    g('plain', 'true-false-ng'),
  ];
  expect(questionTypesOf(groups, 'reading')).toEqual(['tfng', 'summary-completion']);
  expect(questionTypesOf(undefined, 'reading')).toEqual([]);
});
