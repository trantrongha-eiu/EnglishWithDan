// "Tài liệu in (Tips)": per-tip Markdown packs (AI prompt + tip content +
// the fixed practice WITH its answer key) for teachers/admins only.
const request = require('supertest');
const app = require('../../app');
const ReadingTip = require('../../models/ReadingTip');
const WritingTip = require('../../models/WritingTip');
const { createStudent, createPremiumStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createPassage } = require('../factories/contentFactory');

const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const CONTENT = '<h2>Bees</h2>' + LETTERS.map((l, i) =>
  `<p><strong>${l}</strong> Paragraph ${l} says bees in Kenya were counted in 19${10 + i}.</p>`).join('');
const tfng = (n, key) => ({ questionNumber: n, type: 'true-false-ng', questionText: `Statement ${n} about bees.`, correctAnswer: key,
  explanation: 'Transcript: “Paragraph B says bees in Kenya were counted in 1911.” Phân tích: khớp.' });

const BLOCKS = [
  { type: 'overview', data: 'TRUE = đúng với bài.' },
  { type: 'steps', data: [{ title: 'Bước 1', description: 'Gạch chân keyword.' }] },
  { type: 'table', data: { title: 'Bẫy', headers: ['Dấu hiệu', 'Ý nghĩa'], rows: [['all | every', 'tuyệt đối']] } },
  { type: 'example', data: [{ label: 'VD', passage: 'Bees live in Kenya.', statement: 'Bees live in Africa.', note: 'TRUE' }] },
];

const get = (path, token) => request(app).get(`/api/admin${path}`).set('Authorization', `Bearer ${token}`);

beforeEach(async () => {
  await ReadingTip.create({ category: 'Dạng bài', lessonKey: 'true-false-not-given', title: 'True / False / Not Given', blocks: BLOCKS });
  await WritingTip.create({ category: 'Task 2', lessonKey: 'task2-intro', title: 'Viết mở bài Task 2', blocks: BLOCKS.slice(0, 2) });
  await createPassage({
    content: CONTENT,
    questionGroups: [{ groupType: 'plain', instruction: 'Do the following statements agree with the information given in Reading Passage 1?',
      questions: ['TRUE', 'FALSE', 'NOT GIVEN', 'TRUE', 'FALSE'].map((k, i) => tfng(i + 1, k)) }],
  });
});

test('students (even premium) cannot get packs — they carry answer keys', async () => {
  for (const u of [await createStudent(), await createPremiumStudent()]) {
    expect((await get('/tip-packs', signTokenFor(u))).status).toBe(403);
    expect((await get('/tip-packs/reading/true-false-not-given', signTokenFor(u))).status).toBe(403);
  }
});

test('teachers list every active tip of the four skills, flagged when a practice comes with it', async () => {
  const res = await get('/tip-packs', signTokenFor(await createTeacher()));
  expect(res.status).toBe(200);
  expect(res.body.skills.map(s => s.skill)).toEqual(['reading', 'listening', 'writing', 'speaking']);
  const reading = res.body.skills.find(s => s.skill === 'reading').tips;
  expect(reading).toEqual([expect.objectContaining({ lessonKey: 'true-false-not-given', hasPractice: true })]);
  expect(res.body.skills.find(s => s.skill === 'writing').tips[0]).toMatchObject({ lessonKey: 'task2-intro', hasPractice: false });
});

test('a Reading pack: prompt + tip content + the practice with every answer key', async () => {
  const res = await get('/tip-packs/reading/true-false-not-given', signTokenFor(await createAdmin()));
  expect(res.status).toBe(200);
  expect(res.headers['cache-control']).toBe('no-store');
  const { filename, prompt, markdown, hasPractice } = res.body;
  expect(filename).toBe('bai-giang-reading-true-false-not-given.md');
  expect(hasPractice).toBe(true);
  expect(prompt).toContain('True / False / Not Given');
  expect(prompt).toContain('không đổi đáp án');
  expect(markdown.startsWith('# IELTS Reading Tips — True / False / Not Given')).toBe(true);
  expect(markdown).toContain(prompt);
  // tip blocks as Markdown (table pipes escaped)
  expect(markdown).toContain('1. **Bước 1** — Gạch chân keyword.');
  expect(markdown).toContain('| all \\| every | tuyệt đối |');
  expect(markdown).toContain('*Statement / Question:* Bees live in Africa.');
  // the passage, the questions, then (after a page break) the keys
  const [sheet, keys] = markdown.split('### C2.');
  expect(sheet).toContain('Paragraph B says bees in Kenya were counted in 1911.');
  expect(sheet).toContain('**1.** Statement 1 about bees.');
  expect(sheet).not.toContain('Đáp án:');
  ['TRUE', 'FALSE', 'NOT GIVEN', 'TRUE', 'FALSE'].forEach((k, i) => expect(keys).toMatch(new RegExp(`\\*\\*${i + 1}\\.\\*\\*[^*]*\\n- \\*\\*Đáp án:\\*\\* ${k}\\n`)));
  expect(keys).not.toContain('không lấy được');
});

test('a tip without a bank practice asks the AI to write (clearly labelled) exercises; unknown tips 404', async () => {
  const token = signTokenFor(await createTeacher());
  const res = await get('/tip-packs/writing/task2-intro', token);
  expect(res.status).toBe(200);
  expect(res.body.hasPractice).toBe(false);
  expect(res.body.prompt).toContain('AI soạn — giáo viên duyệt');
  expect(res.body.markdown).not.toContain('PHẦN C');
  expect((await get('/tip-packs/writing/nope', token)).status).toBe(404);
  expect((await get('/tip-packs/cooking/task2-intro', token)).status).toBe(404);
});
