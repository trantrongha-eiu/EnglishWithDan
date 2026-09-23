// Reading Tips → "Luyện tập" (Phase 1: Skimming + Scanning). Covers the
// access gate, that practices are built only from existing passages and
// only from questions of the right kind (in original order), that the
// payload never carries the answer key, and that /check grades one answer
// server-side before revealing answer + explanation + evidence.
const request = require('supertest');
const app = require('../../app');
const ReadingTip = require('../../models/ReadingTip');
const Passage = require('../../models/Passage');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createPassage, createReadingTest } = require('../factories/contentFactory');

const FOUR_PARAS = '<h2>Stress and judgement</h2>'
  + '<p><strong>A neuroscientist explains how stress changes the way we think.</strong></p>'
  + '<p>Some of the most important decisions of our lives occur while we are stressed. We weigh information under pressure.</p>'
  + '<p>My colleague and I wanted to investigate how the mind operates under threat. We studied firefighters in Virginia.</p>'
  + '<p>We found that perceived threat triggered a stress reaction. The task became harder for them.</p>'
  + '<p>This is how we arrived at these results. We asked the firefighters to estimate their likelihood of 40 adverse events.</p>';

function mcq(n, text, correct, explanation) {
  return { questionNumber: n, type: 'multiple-choice', questionText: text, options: ['one', 'two', 'three', 'four'], correctAnswer: correct, explanation };
}
function tfng(n, text, correct) {
  return { questionNumber: n, type: 'true-false-ng', questionText: text, correctAnswer: correct, explanation: 'x' };
}

async function seedTips() {
  await ReadingTip.create([
    { category: 'Kỹ thuật', lessonKey: 'skimming', title: 'Skimming – Đọc lấy ý chính', blocks: [] },
    { category: 'Kỹ thuật', lessonKey: 'scanning', title: 'Scanning – Tìm thông tin cụ thể', blocks: [] },
    { category: 'Kỹ thuật', lessonKey: 'keyword-to-paraphrase', title: 'Paraphrase', blocks: [] },
  ]);
}

// Deep scan: no answer-key field anywhere in a practice payload.
function collectKeys(obj, out = new Set()) {
  if (Array.isArray(obj)) obj.forEach(v => collectKeys(v, out));
  else if (obj && typeof obj === 'object') Object.entries(obj).forEach(([k, v]) => { out.add(k); collectKeys(v, out); });
  return out;
}

let token;
beforeEach(async () => {
  await seedTips();
  token = signTokenFor(await createPremiumStudent());
});

const get = (key) => request(app).get(`/api/reading-tips/${key}/practice`).set('Authorization', `Bearer ${token}`);
const check = (key, body) => request(app).post(`/api/reading-tips/${key}/practice/check`).set('Authorization', `Bearer ${token}`).send(body);

describe('access', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/reading-tips/skimming/practice');
    expect(res.status).toBe(401);
  });

  test('an expired free trial gets 403 PLAN_REQUIRED (same gate as Reading practice)', async () => {
    const expired = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const res = await request(app).get('/api/reading-tips/skimming/practice').set('Authorization', `Bearer ${signTokenFor(expired)}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('a tip without a practice (or an unknown key) is a clean 404', async () => {
    expect((await get('keyword-to-paraphrase')).status).toBe(404);
    expect((await get('no-such-tip')).body.code).toBe('NO_PRACTICE');
  });

  test('the public lesson list is unchanged (no auth)', async () => {
    const res = await request(app).get('/api/reading-tips/lessons');
    expect(res.status).toBe(200);
    expect(res.body.lessons.length).toBe(3);
  });
});

describe('Skimming practice', () => {
  test('uses only real main-idea / purpose / title MCQs, shows only the paragraph asked about, leaks no answers', async () => {
    const p = await createPassage({
      content: FOUR_PARAS,
      questionGroups: [
        { groupType: 'plain', instruction: 'Choose the correct letter, A, B, C or D.', questions: [
          mcq(27, 'In the first paragraph, the writer introduces the topic of the text by', 'C',
            'Transcript: Some of the most important decisions of our lives occur while we are stressed.'),
          mcq(28, 'What did the firefighters estimate?', 'A', 'x'), // detail question, not skimming
          mcq(29, 'What is the writer doing in the fourth paragraph?', 'D',
            '“We asked the firefighters to estimate their likelihood of 40 adverse events.”'),
        ] },
        { groupType: 'plain', questions: [tfng(30, 'Firefighters were studied.', 'TRUE')] },
        { groupType: 'plain', questions: [mcq(31, 'What would be the best title for this passage?', 'B', 'x')] },
      ],
    });
    await createReadingTest({ name: 'Orange Test 20', passageIds: [p._id] });

    const res = await get('skimming');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    const { items } = res.body.practice;
    expect(items.map(i => i.questionNumber)).toEqual([27, 29, 31]);
    expect(items[0]).toMatchObject({ scope: 'paragraph', targetLabel: 'Đoạn 1', focus: 'paragraph_purpose', sourceName: 'Orange Test 20' });
    expect(items[0].paragraphs).toHaveLength(1);
    expect(items[0].paragraphs[0].text).toMatch(/^Some of the most important decisions/);
    expect(items[1].paragraphs[0].text).toMatch(/^This is how we arrived/); // standfirst not counted
    expect(items[2]).toMatchObject({ scope: 'passage', targetLabel: 'Toàn bài', focus: 'overall_topic' });
    const keys = collectKeys(res.body);
    expect(keys.has('correctAnswer')).toBe(false);
    expect(keys.has('explanation')).toBe(false);
  });

  test('drops a question whose stem and explanation point at different paragraphs (inconsistent data)', async () => {
    await createPassage({
      content: FOUR_PARAS,
      questionGroups: [{ groupType: 'plain', questions: [
        // Stem says third paragraph; the explanation quotes the fourth.
        mcq(35, 'What is the writer doing in the third paragraph?', 'A',
          '“We asked the firefighters to estimate their likelihood of 40 adverse events.”'),
      ] }],
    });
    const res = await get('skimming');
    expect(res.status).toBe(200);
    expect(res.body.practice).toBeNull();
    expect(res.body.message).toMatch(/Chưa tìm thấy/);
  });

  test('check grades server-side, then reveals answer + explanation + evidence', async () => {
    const p = await createPassage({
      content: FOUR_PARAS,
      questionGroups: [{ groupType: 'plain', questions: [
        mcq(27, 'In the first paragraph, the writer introduces the topic of the text by', 'C',
          'Transcript: Some of the most important decisions of our lives occur while we are stressed.'),
      ] }],
    });
    const wrong = await check('skimming', { passageId: String(p._id), questionNumber: 27, answer: 'A' });
    expect(wrong.status).toBe(200);
    expect(wrong.body.result).toMatchObject({ isCorrect: false, correctAnswer: 'C' });
    expect(wrong.body.result.explanation).toMatch(/Transcript/);
    expect(wrong.body.result.evidence.text).toBe('Some of the most important decisions of our lives occur while we are stressed');
    const right = await check('skimming', { passageId: String(p._id), questionNumber: 27, answer: 'c' });
    expect(right.body.result.isCorrect).toBe(true);
  });
});

describe('Scanning practice', () => {
  const SCAN_CONTENT = '<h2>Climate adaptation</h2>'
    + '<p>The stormwater-management programme in Miami Beach has involved the installation of efficient pumps.</p>'
    + '<p>In Indonesia, the construction of dams was the first stage of a mangrove project.</p>'
    + '<p>A project in Los Angeles has increased the number of trees on the city streets.</p>'
    + '<p>In Bangladesh, farmers now grow salt-tolerant crops. Records began in 1856.</p>';
  const noteGroup = (questions) => ({
    groupType: 'note-form', instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
    noteConfig: { title: '', lines: [
      '● Miami Beach: installation of efficient __Q1__',
      '● The construction of __Q2__ was the first stage of the project in Indonesia',
      '● A project in Los Angeles increased the number of __Q3__ on the streets',
      '● Temperature records in Bangladesh began in __Q5__',
    ] },
    questions,
  });
  const fill = (n, ans, explanation = '') => ({ questionNumber: n, type: 'fill-blank', questionText: `Question ${n}`, correctAnswer: ans, explanation });

  test('keeps only typed-answer questions (original order), never TFNG/MCQ; no answers in the payload', async () => {
    await createPassage({
      content: SCAN_CONTENT,
      questionGroups: [
        noteGroup([fill(1, 'pumps'), fill(2, 'dams'), fill(3, 'trees')]),
        { groupType: 'plain', questions: [tfng(4, 'Miami Beach installed pumps.', 'TRUE')] },
        noteGroup([fill(5, '1856')]),
        { groupType: 'plain', questions: [mcq(6, 'Which city planted trees?', 'B', 'x')] },
      ],
    });
    const res = await get('scanning');
    expect(res.status).toBe(200);
    const pr = res.body.practice;
    expect(pr.kind).toBe('scanning');
    expect(pr.questions.map(q => q.questionNumber)).toEqual([1, 2, 3, 5]);
    expect(pr.questions[0]).toMatchObject({ text: 'Miami Beach: installation of efficient _____', anchors: ['Miami Beach'], wordLimit: 'ONE WORD ONLY' });
    expect(pr.paragraphs.filter(x => !x.heading)).toHaveLength(4);
    const keys = collectKeys(res.body);
    expect(keys.has('correctAnswer')).toBe(false);
    expect(keys.has('explanation')).toBe(false);
  });

  test('skips a passage without enough suitable questions and picks one that has them', async () => {
    await createPassage({ content: SCAN_CONTENT, questionGroups: [{ groupType: 'plain', questions: [tfng(1, 'Pumps were installed.', 'TRUE')] }] });
    const good = await createPassage({ content: SCAN_CONTENT, questionGroups: [noteGroup([fill(1, 'pumps'), fill(2, 'dams'), fill(3, 'trees')])] });
    for (let i = 0; i < 3; i++) {
      const res = await get('scanning');
      expect(res.body.practice.passageId).toBe(String(good._id));
    }
  });

  test('leaves out typed answers that never occur in the passage, and answer keys the explanation contradicts', async () => {
    await createPassage({
      content: SCAN_CONTENT,
      questionGroups: [noteGroup([
        fill(1, 'pumps'),
        fill(2, 'bridges'), // not in the passage at all
        fill(3, 'dams', '“A project in Los Angeles has increased the number of trees on the city streets.”'), // key belongs elsewhere
        fill(5, '1856'),
      ])],
    });
    const res = await get('scanning');
    expect(res.body.practice).toBeNull();
  });

  test('no suitable passage at all → empty state, not an error', async () => {
    const res = await get('scanning');
    expect(res.status).toBe(200);
    expect(res.body.practice).toBeNull();
  });

  test('check: accepts "/" alternatives case-insensitively, reveals evidence, rejects questions outside the practice', async () => {
    const p = await createPassage({
      content: SCAN_CONTENT,
      questionGroups: [
        noteGroup([fill(1, 'pumps / pump'), fill(2, 'dams'), fill(3, 'trees')]),
        { groupType: 'plain', questions: [tfng(4, 'Miami Beach installed pumps.', 'TRUE')] },
      ],
    });
    const ok = await check('scanning', { passageId: String(p._id), questionNumber: 1, answer: ' Pump ' });
    expect(ok.status).toBe(200);
    expect(ok.body.result).toMatchObject({ isCorrect: true, correctAnswer: 'pumps / pump' });
    expect(ok.body.result.evidence.text).toMatch(/Miami Beach has involved the installation of efficient pumps/);

    const outside = await check('scanning', { passageId: String(p._id), questionNumber: 4, answer: 'TRUE' });
    expect(outside.status).toBe(400);
    expect(outside.body.code).toBe('NOT_IN_PRACTICE');

    expect((await check('scanning', { passageId: 'nope', questionNumber: 1, answer: 'x' })).status).toBe(400);
    expect((await check('scanning', { passageId: String(p._id), questionNumber: 1, answer: ['x'] })).status).toBe(400);
  });

  test('a passage hidden by an admin is never used', async () => {
    await createPassage({ content: SCAN_CONTENT, isActive: false, questionGroups: [noteGroup([fill(1, 'pumps'), fill(2, 'dams'), fill(3, 'trees')])] });
    const res = await get('scanning');
    expect(res.body.practice).toBeNull();
  });

  test('never writes to the passage bank', async () => {
    await createPassage({ content: SCAN_CONTENT, questionGroups: [noteGroup([fill(1, 'pumps'), fill(2, 'dams'), fill(3, 'trees')])] });
    const before = await Passage.find().lean();
    await get('scanning');
    expect(await Passage.find().lean()).toEqual(before);
  });
});
