// Reading Tips → practice for the 8 question-type tips (phase 2): one
// existing passage, filtered to the tip's question type by CONTENT (not
// the hand-entered type fields), original order kept, no answer key in the
// payload, one-answer-at-a-time grading.
const request = require('supertest');
const app = require('../../app');
const ReadingTip = require('../../models/ReadingTip');
const { createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createPassage } = require('../factories/contentFactory');

const TYPE_TIPS = ['true-false-not-given', 'yes-no-not-given', 'matching-headings', 'matching-information',
  'matching-features', 'sentence-summary-note-completion', 'multiple-choice', 'short-answer-questions'];

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
// Seven labelled paragraphs, in the "<p><strong>A</strong> text" shape the bank uses.
const LABELLED = '<h2>Test passage</h2>' + LETTERS.map((l, i) =>
  `<p><strong>${l}</strong> Paragraph ${l} opens with its main idea number ${i}. It then adds detail ${i} about bees in Kenya in 19${10 + i}.</p>`).join('');

const tfng = (n, key) => ({ questionNumber: n, type: 'true-false-ng', questionText: `Statement ${n} about bees.`, correctAnswer: key, explanation: `Transcript: It then adds detail 1 about bees in Kenya in 1911.` });
const mcq = (n, key) => ({ questionNumber: n, type: 'multiple-choice', questionText: `Question ${n} asks what the writer says?`, options: ['one', 'two', 'three', 'four'], correctAnswer: key, explanation: 'x' });
const letterQ = (n, key, text = `Statement ${n} to match`) => ({ questionNumber: n, type: 'matching-info', questionText: text, correctAnswer: key, explanation: '' });

function keysOf(obj, out = new Set()) {
  if (Array.isArray(obj)) obj.forEach(v => keysOf(v, out));
  else if (obj && typeof obj === 'object') Object.entries(obj).forEach(([k, v]) => { out.add(k); keysOf(v, out); });
  return out;
}

let token;
beforeEach(async () => {
  await ReadingTip.create(TYPE_TIPS.map((lessonKey, i) => ({ category: 'Dạng bài', lessonKey, title: lessonKey, orderIndex: i, blocks: [] })));
  token = signTokenFor(await createPremiumStudent());
});
const get = (key) => request(app).get(`/api/reading-tips/${key}/practice`).set('Authorization', `Bearer ${token}`);
const check = (key, body) => request(app).post(`/api/reading-tips/${key}/practice/check`).set('Authorization', `Bearer ${token}`).send(body);

describe('filtering by question type (spec cases 1–3)', () => {
  let passage;
  beforeEach(async () => {
    passage = await createPassage({
      content: LABELLED,
      questionGroups: [
        { groupType: 'plain', instruction: 'Do the following statements agree with the information given in Reading Passage 1?',
          questions: ['TRUE', 'FALSE', 'NOT GIVEN', 'TRUE', 'FALSE', 'NOT GIVEN', 'TRUE'].map((k, i) => tfng(i + 1, k)) },
        { groupType: 'plain', instruction: 'Choose the correct letter, A, B, C or D.',
          questions: ['A', 'B', 'C', 'D', 'A', 'B'].map((k, i) => mcq(i + 8, k)) },
      ],
    });
  });

  test('CASE 1: 7 T/F/NG + 6 MCQ → the T/F/NG practice has exactly the 7 T/F/NG, in order, no answers', async () => {
    const res = await get('true-false-not-given');
    expect(res.status).toBe(200);
    const pr = res.body.practice;
    expect(pr).toMatchObject({ kind: 'questions', questionType: 'tfng', passageId: String(passage._id) });
    expect(pr.questions.map(q => q.questionNumber)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(pr.questions[0].choices.map(c => c.key)).toEqual(['TRUE', 'FALSE', 'NOT GIVEN']);
    // Only the worked example (Q1, Phase 3) may carry its key.
    expect(pr.questions[0].isGuidedExample).toBe(true);
    const keys = keysOf({ ...res.body, practice: { ...pr, questions: pr.questions.slice(1) } });
    ['correctAnswer', 'explanation', 'answer'].forEach(k => expect(keys.has(k)).toBe(false));
  });

  test('CASE 2: the MCQ practice contains no T/F/NG', async () => {
    const pr = (await get('multiple-choice')).body.practice;
    expect(pr.questions.map(q => q.questionNumber)).toEqual([8, 9, 10, 11, 12, 13]);
    expect(pr.questions[0].choices).toEqual([
      { key: 'A', label: 'one' }, { key: 'B', label: 'two' }, { key: 'C', label: 'three' }, { key: 'D', label: 'four' }]);
  });

  test('check: grades one answer server-side, then reveals key + explanation + evidence', async () => {
    const wrong = await check('true-false-not-given', { passageId: String(passage._id), questionNumber: 2, answer: 'TRUE' });
    expect(wrong.body.result).toMatchObject({ isCorrect: false, correctAnswer: 'FALSE' });
    expect(wrong.body.result.evidence.text).toBe('It then adds detail 1 about bees in Kenya in 1911');
    const right = await check('true-false-not-given', { passageId: String(passage._id), questionNumber: 3, answer: 'not given' });
    expect(right.body.result.isCorrect).toBe(true);
    // An MCQ question number is not part of the T/F/NG practice.
    const outside = await check('true-false-not-given', { passageId: String(passage._id), questionNumber: 9, answer: 'B' });
    expect(outside.status).toBe(400);
    expect(outside.body.code).toBe('NOT_IN_PRACTICE');
  });
});

test('CASE 3: matching headings returns only the headings questions, each pointing at its paragraph', async () => {
  await createPassage({
    content: LABELLED,
    questionGroups: [
      { groupType: 'matching-headings', instruction: 'Choose the correct heading for each paragraph from the list of headings below.',
        headingsConfig: { headings: ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'].map((numeral, i) => ({ numeral, text: `Heading ${i + 1}` })) },
        questions: ['A', 'B', 'C', 'D', 'E'].map((l, i) => ({ questionNumber: 14 + i, type: 'matching-headings', questionText: `Paragraph ${l}`, correctAnswer: ['iii', 'i', 'v', 'ii', 'viii'][i], explanation: '' })) },
      { groupType: 'plain', questions: [tfng(19, 'TRUE'), tfng(20, 'FALSE'), tfng(21, 'TRUE')] },
    ],
  });
  const res = await get('matching-headings');
  const pr = res.body.practice;
  expect(pr.questions.map(q => q.questionNumber)).toEqual([14, 15, 16, 17, 18]);
  expect(pr.questions[0].choices).toHaveLength(8);
  const paraB = pr.paragraphs.find(p => p.label === 'B');
  expect(pr.questions[1].targetParagraph).toBe(paraB.i);
  const ok = await check('matching-headings', { passageId: pr.passageId, questionNumber: 15, answer: 'I' });
  expect(ok.body.result.isCorrect).toBe(true);
});

test('same-type questions split by another type keep their original order (spec §6)', async () => {
  await createPassage({
    content: LABELLED,
    questionGroups: [
      { groupType: 'plain', questions: [tfng(1, 'TRUE'), tfng(2, 'FALSE')] },
      { groupType: 'matching-options', instruction: 'Which paragraph contains the following information?', matchingOptions: [], questions: [letterQ(3, 'C')] },
      { groupType: 'plain', questions: [tfng(4, 'NOT GIVEN'), tfng(5, 'TRUE')] },
    ],
  });
  const pr = (await get('true-false-not-given')).body.practice;
  expect(pr.questions.map(q => q.questionNumber)).toEqual([1, 2, 4, 5]);
});

test('CASE 4: a passage without the target type is skipped; CASE 5: none at all → empty state', async () => {
  expect((await get('yes-no-not-given')).body.practice).toBeNull();
  await createPassage({ content: LABELLED, questionGroups: [{ groupType: 'plain', questions: [tfng(1, 'TRUE'), tfng(2, 'FALSE'), tfng(3, 'TRUE')] }] });
  const ynng = await createPassage({
    content: LABELLED,
    questionGroups: [{ groupType: 'plain', instruction: 'Do the following statements agree with the claims of the writer?',
      questions: ['YES', 'NO', 'NOT GIVEN'].map((k, i) => ({ questionNumber: 27 + i, type: 'yes-no-ng', questionText: `Claim ${i}`, correctAnswer: k, explanation: '' })) }],
  });
  for (let i = 0; i < 3; i++) {
    const pr = (await get('yes-no-not-given')).body.practice;
    expect(pr.passageId).toBe(String(ynng._id));
    expect(pr.questions[0].choices.map(c => c.key)).toEqual(['YES', 'NO', 'NOT GIVEN']);
  }
});

describe('content-based classification (the hand-entered types are unreliable)', () => {
  test('matching-options groups are told apart by what they contain', async () => {
    await createPassage({
      content: LABELLED,
      questionGroups: [
        // paragraph letters, no instruction at all → Matching Information
        { groupType: 'matching-options', instruction: '', matchingOptions: ['', '', '', ''], questions: [letterQ(1, 'B'), letterQ(2, 'D'), letterQ(3, 'G')] },
        // a list of names → Matching Features
        { groupType: 'matching-options', instruction: 'Match each statement with the correct person, A, B or C.',
          matchingOptions: ['Matt Elliot', 'Karen Russell', 'Peter Bourne'], questions: [letterQ(4, 'B'), letterQ(5, 'A'), letterQ(6, 'C')] },
        // "Choose TWO letters" and sentence endings → neither
        { groupType: 'matching-options', instruction: 'Choose TWO letters, A–E.', interchangeableAnswers: true,
          matchingOptions: ['a', 'bb', 'cc', 'dd', 'ee'], questions: [letterQ(7, 'A'), letterQ(8, 'C')] },
        { groupType: 'matching-options', instruction: 'Complete each sentence with the correct ending, A–D, below.',
          matchingOptions: ['end one', 'end two', 'end three', 'end four'], questions: [letterQ(9, 'A'), letterQ(10, 'B'), letterQ(11, 'C')] },
      ],
    });
    const info = (await get('matching-information')).body.practice;
    expect(info.questions.map(q => q.questionNumber)).toEqual([1, 2, 3]);
    expect(info.questions[0].choices.map(c => c.key)).toEqual(LETTERS);
    const features = (await get('matching-features')).body.practice;
    expect(features.questions.map(q => q.questionNumber)).toEqual([4, 5, 6]);
    expect(features.questions[0].choices[1]).toEqual({ key: 'B', label: 'Karen Russell' });
  });

  test('a TFNG-typed group keyed YES/NO, and a matching group flagged "interchangeable", are both left out', async () => {
    await createPassage({
      content: LABELLED,
      questionGroups: [
        { groupType: 'plain', questions: ['YES', 'NO', 'YES'].map((k, i) => ({ ...tfng(i + 1, k) })) },
        { groupType: 'matching-options', instruction: 'Match each statement with the correct person, A, B or C.', interchangeableAnswers: true,
          matchingOptions: ['Ben Novak', 'Michael Archer', 'Beth Shapiro'], questions: [letterQ(4, 'B'), letterQ(5, 'C'), letterQ(6, 'A')] },
      ],
    });
    expect((await get('true-false-not-given')).body.practice).toBeNull();
    expect((await get('yes-no-not-given')).body.practice).toBeNull();
    expect((await get('matching-features')).body.practice).toBeNull();
  });

  test('matching information needs the key paragraph to exist and the explanation to agree with it', async () => {
    await createPassage({
      content: LABELLED,
      questionGroups: [{ groupType: 'matching-options', instruction: 'Which paragraph contains the following information?', matchingOptions: [],
        questions: [
          letterQ(1, 'B'), letterQ(2, 'C'),
          letterQ(3, 'H'), // no paragraph H in the passage
          { ...letterQ(4, 'A'), explanation: '“Paragraph D opens with its main idea number 3.”' }, // quote is from D
          letterQ(5, 'E'),
        ] }],
    });
    const pr = (await get('matching-information')).body.practice;
    expect(pr.questions.map(q => q.questionNumber)).toEqual([1, 2, 5]);
  });
});

test('completion vs short answer: blanks vs questions, typed answers checked against the passage', async () => {
  await createPassage({
    content: LABELLED,
    questionGroups: [
      { groupType: 'note-form', instruction: 'Complete the notes below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.',
        noteConfig: { title: '', lines: ['Paragraph B gives detail about bees in __Q1__', 'The detail in paragraph C dates from __Q2__', 'Paragraph D is about __Q3__ in Kenya'] },
        questions: [
          { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'Kenya', explanation: '' },
          { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: '1912', explanation: '' },
          { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'bees', explanation: '' },
        ] },
      { groupType: 'plain', instruction: 'Answer the questions below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage.',
        questions: [
          { questionNumber: 4, type: 'fill-blank', questionText: 'In which country were the bees studied?', correctAnswer: 'Kenya', explanation: '' },
          { questionNumber: 5, type: 'fill-blank', questionText: 'In which year was the detail in paragraph E recorded?', correctAnswer: '1914', explanation: '' },
          { questionNumber: 6, type: 'fill-blank', questionText: 'What insects does paragraph F describe?', correctAnswer: 'bees', explanation: '' },
        ] },
    ],
  });
  const completion = (await get('sentence-summary-note-completion')).body.practice;
  expect(completion.questions.map(q => q.questionNumber)).toEqual([1, 2, 3]);
  expect(completion.questions[0]).toMatchObject({ input: 'text', text: 'Paragraph B gives detail about bees in _____', wordLimit: 'ONE WORD AND/OR A NUMBER' });
  const short = (await get('short-answer-questions')).body.practice;
  expect(short.questions.map(q => q.questionNumber)).toEqual([4, 5, 6]);
  const ok = await check('short-answer-questions', { passageId: short.passageId, questionNumber: 5, answer: '1914' });
  expect(ok.body.result.isCorrect).toBe(true);
  expect(ok.body.result.evidence.text).toMatch(/1914/);
});

test('/lessons marks every question-type tip as having a practice', async () => {
  const res = await request(app).get('/api/reading-tips/lessons');
  expect(res.body.lessons.every(l => l.hasPractice)).toBe(true);
});

// Phase 4: the browser sends the passages of the student's last practices
// (newest first) so "Bài khác" gives a different passage.
describe('?exclude= — "Bài khác" avoids recently practised passages', () => {
  const tfPassage = () => createPassage({
    content: LABELLED,
    questionGroups: [{ groupType: 'plain', instruction: 'Do the following statements agree with the information given in Reading Passage 1?',
      questions: ['TRUE', 'FALSE', 'NOT GIVEN', 'TRUE', 'FALSE'].map((k, i) => tfng(i + 1, k)) }],
  });
  const getExcluding = (ids) => request(app).get('/api/reading-tips/true-false-not-given/practice')
    .query({ exclude: ids.map(String).join(',') }).set('Authorization', `Bearer ${token}`);

  test('an excluded passage is never picked while another one fits', async () => {
    const a = await tfPassage();
    const b = await tfPassage();
    for (let i = 0; i < 5; i++) {
      expect((await getExcluding([a._id])).body.practice.passageId).toBe(String(b._id));
      expect((await getExcluding([b._id])).body.practice.passageId).toBe(String(a._id));
    }
  });

  test('when every passage is excluded the oldest exclusions go first (never the last one); junk ids are ignored', async () => {
    const a = await tfPassage();
    const b = await tfPassage();
    // newest first: b was the last practice, a the one before
    for (let i = 0; i < 5; i++) expect((await getExcluding([b._id, a._id])).body.practice.passageId).toBe(String(a._id));
    const res = await getExcluding(['not-an-id', '{"$ne":null}', b._id]);
    expect(res.status).toBe(200);
    expect(res.body.practice.passageId).toBe(String(a._id));
    // a single suitable passage is still served even if it was just done
    await b.deleteOne();
    expect((await getExcluding([a._id])).body.practice.passageId).toBe(String(a._id));
  });
});
