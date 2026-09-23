// Reading Tips practice: Phase 3 guided questions ("I do" example with
// its key, "We do" hints without it), the Keyword → Paraphrase practice
// (teacher-written pairs, highlight grading) and the 7-step workflow.
const request = require('supertest');
const app = require('../../app');
const ReadingTip = require('../../models/ReadingTip');
const { createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createPassage } = require('../factories/contentFactory');

const TIPS = ['true-false-not-given', 'keyword-to-paraphrase', 'skim-scan-workflow'];
const CONTENT = '<h2>Frozen food</h2>'
  + '<p><strong>A</strong> Frozen food has a long history. In 1851, railroads first began putting blocks of ice in insulated rail cars to send butter.</p>'
  + '<p><strong>B</strong> During the freezing process, crystals formed within the cells of the food, and when it thawed the method spoilt the flavor of the meat.</p>'
  + '<p><strong>C</strong> By 1953, 33 million US families owned a refrigerator, and manufacturers were gradually expanding their freezer compartments.</p>'
  + '<p><strong>D</strong> Clarence Birdseye developed quick-freezing techniques that reduced the damage that crystals caused.</p>';

const tf = (n, key, text, explanation) => ({ questionNumber: n, type: 'true-false-ng', questionText: text, correctAnswer: key, explanation });

function keysOf(obj, out = new Set()) {
  if (Array.isArray(obj)) obj.forEach(v => keysOf(v, out));
  else if (obj && typeof obj === 'object') Object.entries(obj).forEach(([k, v]) => { out.add(k); keysOf(v, out); });
  return out;
}

let token;
let passage;
beforeEach(async () => {
  await ReadingTip.create(TIPS.map((lessonKey, i) => ({ category: 'x', lessonKey, title: lessonKey, orderIndex: i, blocks: [] })));
  token = signTokenFor(await createPremiumStudent());
  passage = await createPassage({
    content: CONTENT,
    questionGroups: [
      { groupType: 'plain', instruction: 'Choose the correct letter, A, B, C or D.', questions: [
        { questionNumber: 1, type: 'multiple-choice', questionText: 'What is the main idea of paragraph B?', options: ['how ice was sold', 'a problem with freezing', 'the price of meat', 'refrigerator sales'], correctAnswer: 'B',
          explanation: 'Transcript: “when it thawed the method spoilt the flavor of the meat”' },
      ] },
      { groupType: 'plain', instruction: 'Do the following statements agree with the information given in Reading Passage 1?', questions: [
        tf(2, 'TRUE', 'Specially adapted trains carried butter in the 1850s.', 'Transcript: “railroads first began putting blocks of ice in insulated rail cars to send butter”. “Specially adapted trains” khớp với “insulated rail cars”.'),
        tf(3, 'TRUE', 'The early freezing method affected the taste of meat.', 'Transcript: “the method spoilt the flavor of the meat”. “Affected the taste” tương ứng với “spoilt the flavor”.'),
        tf(4, 'TRUE', 'A large number of homes had a refrigerator by 1953.', 'Transcript: “By 1953, 33 million US families owned a refrigerator”. “A large number of homes” = “33 million US families”.'),
        tf(5, 'NOT GIVEN', 'Birdseye sold his techniques abroad.', 'Transcript: “Clarence Birdseye developed quick-freezing techniques”. “freezing process” = “freezing process”.'),
      ] },
    ],
  });
});
const get = (key) => request(app).get(`/api/reading-tips/${key}/practice`).set('Authorization', `Bearer ${token}`);
const check = (key, body) => request(app).post(`/api/reading-tips/${key}/practice/check`).set('Authorization', `Bearer ${token}`).send(body);

describe('Phase 3 guided questions (spec cases 6–8)', () => {
  test('Q1 is a worked example with its key; Q2 gets hints only; Q3+ carry nothing', async () => {
    const pr = (await get('true-false-not-given')).body.practice;
    const [q1, q2, ...rest] = pr.questions;
    expect(q1.isGuidedExample).toBe(true);
    expect(q1.guided).toMatchObject({ mode: 'example', answer: 'TRUE' });
    expect(q1.guided.explanation).toMatch(/Transcript/);
    // the whole sentence around the quoted fragment, not its neighbours
    expect(q1.guided.evidence.text).toBe('In 1851, railroads first began putting blocks of ice in insulated rail cars to send butter.');
    expect(q1.guided.keywords).toEqual(expect.arrayContaining(['butter']));

    expect(q2.isGuidedExample).toBeUndefined();
    expect(q2.guided.mode).toBe('hint');
    expect(Object.keys(q2.guided).sort()).toEqual(['evidence', 'keywords', 'mode']);
    for (const q of rest) expect(q.guided).toBeUndefined();

    // no key anywhere outside the worked example
    const others = keysOf({ q2, rest });
    ['answer', 'correctAnswer', 'explanation'].forEach(k => expect(others.has(k)).toBe(false));
  });

  test('CASE 9: Q3 is only graded — and revealed — on submit', async () => {
    const res = await check('true-false-not-given', { passageId: String(passage._id), questionNumber: 4, answer: 'FALSE' });
    expect(res.body.result).toMatchObject({ isCorrect: false, correctAnswer: 'TRUE' });
    expect(res.body.result.explanation).toMatch(/33 million/);
  });
});

describe('Keyword → Paraphrase', () => {
  test('builds items from teacher-written pairs (≤2 per passage) and never sends the passage phrase', async () => {
    const res = await get('keyword-to-paraphrase');
    expect(res.status).toBe(200);
    const items = res.body.practice.items;
    // Q2–Q4 have real pairs (Q5's maps a phrase to itself → not a
    // paraphrase); one passage contributes at most two items.
    expect(items).toHaveLength(2);
    items.forEach(it => expect([2, 3, 4]).toContain(it.questionNumber));
    const byKeyword = { 'Specially adapted trains': 'A', 'Affected the taste': 'B', 'A large number of homes': 'C' };
    items.forEach(it => {
      expect(Object.keys(byKeyword)).toContain(it.keyword);
      expect(it.paragraphLabel).toBe(byKeyword[it.keyword]);
    });
    const json = JSON.stringify(res.body);
    expect(json).not.toMatch(/"(phrase|correctAnswer|explanation)"/);
  });

  test('grades the highlighted span, then reveals the pair', async () => {
    const body = { passageId: String(passage._id), questionNumber: 3, pairIndex: 0 };
    const exact = await check('keyword-to-paraphrase', { ...body, answer: 'spoilt the flavor' });
    expect(exact.body.result).toMatchObject({ isCorrect: true, correctAnswer: 'spoilt the flavor', keyword: 'Affected the taste' });
    expect((await check('keyword-to-paraphrase', { ...body, answer: 'the method spoilt the flavor of' })).body.result.isCorrect).toBe(true);
    expect((await check('keyword-to-paraphrase', { ...body, answer: 'crystals formed within the cells' })).body.result.isCorrect).toBe(false);
    const bad = await check('keyword-to-paraphrase', { ...body, pairIndex: 9, answer: 'x' });
    expect(bad.status).toBe(400);
    expect(bad.body.code).toBe('NOT_IN_PRACTICE');
  });
});

describe('Quy trình làm bài (workflow)', () => {
  test('one passage: a main-idea question + detail questions with the paragraph to find, no answer keys', async () => {
    const res = await get('skim-scan-workflow');
    const pr = res.body.practice;
    expect(pr).toMatchObject({ kind: 'workflow', passageId: String(passage._id) });
    expect(pr.main).toMatchObject({ questionNumber: 1, kind: 'mcq' });
    expect(pr.questions.length).toBe(3);
    expect(pr.questions.map(q => q.questionNumber)).not.toContain(1); // main idea isn't repeated as a detail
    const paraOf = (label) => pr.paragraphs.find(p => p.label === label).i;
    const q2 = pr.questions.find(q => q.questionNumber === 2);
    expect(q2.locationParagraph).toBe(paraOf('A'));
    expect(q2.keywords.length).toBeGreaterThan(0);
    const keys = keysOf(res.body);
    ['correctAnswer', 'explanation', 'answer'].forEach(k => expect(keys.has(k)).toBe(false));

    const main = await check('skim-scan-workflow', { passageId: pr.passageId, questionNumber: 1, answer: 'B' });
    expect(main.body.result.isCorrect).toBe(true);
    const detail = await check('skim-scan-workflow', { passageId: pr.passageId, questionNumber: 2, answer: 'TRUE' });
    expect(detail.body.result.isCorrect).toBe(true);
  });

  test('?exclude= : "Bài khác" moves to another passage (workflow and paraphrase)', async () => {
    const other = await createPassage({ content: CONTENT, questionGroups: passage.questionGroups });
    const getEx = (key, ids) => request(app).get(`/api/reading-tips/${key}/practice`)
      .query({ exclude: ids.map(String).join(',') }).set('Authorization', `Bearer ${token}`);
    for (let i = 0; i < 4; i++) {
      expect((await getEx('skim-scan-workflow', [passage._id])).body.practice.passageId).toBe(String(other._id));
      expect((await getEx('skim-scan-workflow', [other._id])).body.practice.passageId).toBe(String(passage._id));
      // paraphrase mixes passages; the recently practised one comes last
      expect((await getEx('keyword-to-paraphrase', [passage._id])).body.practice.items[0].passageId).toBe(String(other._id));
    }
  });

  test('empty state when no passage has a main-idea question', async () => {
    await passage.deleteOne();
    await createPassage({ content: CONTENT, questionGroups: [{ groupType: 'plain', questions: [tf(1, 'TRUE', 'x', ''), tf(2, 'FALSE', 'y', '')] }] });
    const res = await get('skim-scan-workflow');
    expect(res.status).toBe(200);
    expect(res.body.practice).toBeNull();
  });
});
