// Integration tests for homework "vocab_list" items — "Bộ từ của lớp": the
// teacher's own word list (assignment.controller buildVocabList), the
// student's "Bắt đầu" (copies missing words into "📚 Từ của lớp"), completion
// from graded practice in ANY book (vocabGoalService.evaluateList), the
// class book's rules (no rename/delete/merge, outside the 10-book cap) and
// "Dùng lại bộ đã giao".
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createVocabBook } = require('../factories/contentFactory');
const { createClassGroup, enrollStudent } = require('../factories/classFactory');
const VocabBook = require('../../models/VocabBook');

const authH = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

const WORDS = [
  { word: 'mitigate', meaning: 'giảm nhẹ', example: 'We must mitigate the risks.' },
  { word: 'Sustainable', meaning: 'bền vững' },
  { word: 'deteriorate', meaning: 'xấu đi' },
  { word: 'alleviate', meaning: 'làm dịu' },
  { word: 'exacerbate', meaning: 'làm trầm trọng thêm' },
];

async function setup(words = WORDS) {
  const teacher = await createTeacher();
  const student = await createStudent();
  const cls = await createClassGroup({ teacher });
  await enrollStudent(cls, student);
  const res = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(teacher))
    .send({ title: 'Buổi 3', resources: [{ kind: 'vocab_list', title: 'Environment', words }] });
  expect(res.status).toBe(201);
  const assignment = res.body.assignment;
  const item = assignment.resources.find((r) => r.kind === 'vocab_list');
  return { teacher, student, cls, assignment, item };
}

async function start(student, assignment, item) {
  const res = await request(app)
    .post(`/api/assignments/${assignment._id}/items/${item._id}/vocab-list/start`).set(authH(student));
  return res;
}

async function myItem(student) {
  const res = await request(app).get('/api/assignments/mine').set(authH(student));
  expect(res.status).toBe(200);
  const a = res.body.assignments[0];
  return { assignment: a, item: a.resources.find((r) => r.kind === 'vocab_list') };
}

async function answer(student, entries) {
  const res = await request(app).post('/api/vocabbook/practice-results').set(authH(student))
    .send({ results: entries.map(([w, correct]) => ({ bookId: w.bookId, wordId: w.word._id, correct })) });
  expect(res.status).toBe(200);
}

describe('teacher validation', () => {
  test('dedupes words, needs a meaning for each, 3..100 words; label carries the count', async () => {
    const teacher = await createTeacher();
    const cls = await createClassGroup({ teacher });
    const post = (resources) => request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(teacher)).send({ title: 'x', resources });

    expect((await post([{ kind: 'vocab_list', words: [{ word: 'a', meaning: 'x' }, { word: 'b', meaning: 'y' }] }])).status).toBe(400);
    const noMeaning = await post([{ kind: 'vocab_list', words: [{ word: 'a', meaning: 'x' }, { word: 'b', meaning: 'y' }, { word: 'c' }] }]);
    expect(noMeaning.status).toBe(400);
    expect(noMeaning.body.message).toMatch(/c/);
    const tooMany = Array.from({ length: 101 }, (_, i) => ({ word: `w${i}`, meaning: 'm' }));
    expect((await post([{ kind: 'vocab_list', words: tooMany }])).status).toBe(400);

    const ok = await post([{ kind: 'vocab_list', title: 'Unit 1', words: [
      { word: ' Apple ', meaning: 'táo' }, { word: 'apple', meaning: 'dup' }, { word: 'pear', meaning: 'lê' }, { word: 'plum', meaning: 'mận' },
    ] }]);
    expect(ok.status).toBe(201);
    const item = ok.body.assignment.resources[0];
    expect(item.words.map((w) => w.word)).toEqual(['Apple', 'pear', 'plum']);
    expect(item.label).toBe('Unit 1 (3 từ)');
  });

  test('editing keeps the item id while the words stay the same, new id when they change', async () => {
    const { teacher, cls, assignment, item } = await setup();
    const put = (words) => request(app).put(`/api/classes/${cls._id}/assignments/${assignment._id}`).set(authH(teacher))
      .send({ title: 'Buổi 3', resources: [{ kind: 'vocab_list', title: 'Environment', words }] });
    const same = await put([...WORDS].reverse().map((w) => ({ ...w, meaning: `${w.meaning}!` })));
    expect(same.status).toBe(200);
    expect(String(same.body.assignment.resources[0]._id)).toBe(String(item._id));
    const changed = await put([...WORDS, { word: 'curb', meaning: 'kiềm chế' }]);
    expect(String(changed.body.assignment.resources[0]._id)).not.toBe(String(item._id));
  });
});

describe('student: Bắt đầu + progress', () => {
  test('copies only missing words into "Từ của lớp"; a word already saved elsewhere is reused', async () => {
    const { student, assignment, item } = await setup();
    const own = await createVocabBook({ userId: student._id, name: 'Mine', words: [{ word: 'sustainable', meaning: 'của tôi' }] });

    const res = await start(student, assignment, item);
    expect(res.status).toBe(200);
    expect(res.body.added).toBe(4);
    expect(res.body.words.map((w) => w.word.word)).toEqual(['mitigate', 'sustainable', 'deteriorate', 'alleviate', 'exacerbate']);
    expect(String(res.body.words[1].bookId)).toBe(String(own._id));

    const classBook = await VocabBook.findOne({ userId: student._id, classBook: true }).lean();
    expect(classBook.name).toBe('Từ của lớp');
    expect(classBook.words.map((w) => w.word)).toEqual(['mitigate', 'deteriorate', 'alleviate', 'exacerbate']);
    expect(classBook.words[0].example).toBe('We must mitigate the risks.');

    // second start adds nothing, one class book only
    const again = await start(student, assignment, item);
    expect(again.body.added).toBe(0);
    expect(await VocabBook.countDocuments({ userId: student._id, classBook: true })).toBe(1);
  });

  test('done when every word is practised with >= 70% right; earlier practice does not count', async () => {
    const { student, assignment, item } = await setup(); // 5 words → need 4 right
    const { body } = await start(student, assignment, item);
    const w = body.words;

    await answer(student, [[w[0], true], [w[1], true], [w[2], true], [w[3], false]]);
    let r = await myItem(student);
    expect(r.item.completed).toBe(false);
    expect(r.item.vocabGoal).toMatchObject({ mode: 'list', practiced: 4, correct: 3, target: 5, needCorrect: 4, present: 5 });
    expect(r.assignment.status).toBe('in_progress');

    await answer(student, [[w[4], false]]);
    r = await myItem(student);
    expect(r.item.completed).toBe(false); // all practised but 3/5 right

    await answer(student, [[w[3], true]]); // re-practise a missed word
    r = await myItem(student);
    expect(r.item.completed).toBe(true);
    expect(r.assignment.status).toBe('completed');
  });

  test('another class / unknown item: 403 / 404', async () => {
    const { assignment, item } = await setup();
    const outsider = await createStudent();
    expect((await start(outsider, assignment, item)).status).toBe(403);
    const { student, assignment: a2 } = await setup();
    const goalItemId = '64b000000000000000000000';
    const res = await request(app).post(`/api/assignments/${a2._id}/items/${goalItemId}/vocab-list/start`).set(authH(student));
    expect(res.status).toBe(404);
  });

  test('a free student past the 24h trial gets the upgrade answer (same gate as vocab-book writes)', async () => {
    const { cls, assignment, item } = await setup();
    const expired = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    await enrollStudent(cls, expired);
    const res = await start(expired, assignment, item);
    expect(res.status).toBe(403);
    expect(await VocabBook.countDocuments({ userId: expired._id, classBook: true })).toBe(0);
  });

  test('student cannot tick it manually', async () => {
    const { student, assignment, item } = await setup();
    const res = await request(app).post(`/api/assignments/${assignment._id}/items/${item._id}/complete`).set(authH(student)).send({ done: true });
    expect(res.status).toBe(400);
  });
});

describe('class book rules', () => {
  test('not renamable / deletable / mergeable away, and outside the 10-book cap', async () => {
    const { student, assignment, item } = await setup();
    await start(student, assignment, item);
    const classBook = await VocabBook.findOne({ userId: student._id, classBook: true }).lean();

    expect((await request(app).put(`/api/vocabbook/${classBook._id}`).set(authH(student)).send({ name: 'X' })).status).toBe(400);
    expect((await request(app).delete(`/api/vocabbook/${classBook._id}`).set(authH(student))).status).toBe(400);
    const own = await createVocabBook({ userId: student._id, name: 'Dest', words: [] });
    const merge = await request(app).post(`/api/vocabbook/${own._id}/merge`).set(authH(student)).send({ sourceIds: [classBook._id] });
    expect(merge.status).toBe(400);
    expect(await VocabBook.findById(classBook._id)).toBeTruthy();

    // 5 defaults + "Dest" + 4 more own books = 10, class book not counted
    for (let i = 0; i < 4; i++) {
      expect((await request(app).post('/api/vocabbook').set(authH(student)).send({ name: `Own ${i}` })).status).toBe(201);
    }
    expect((await request(app).post('/api/vocabbook').set(authH(student)).send({ name: 'Too many' })).status).toBe(400);
    const list = await request(app).get('/api/vocabbook').set(authH(student));
    expect(list.body.books.find((b) => b.classBook)).toBeTruthy();
  });
});

describe('teacher: progress + reuse', () => {
  test('progress table shows the list progress', async () => {
    const { teacher, student, cls, assignment, item } = await setup();
    const { body } = await start(student, assignment, item);
    await answer(student, body.words.map((w) => [w, true]));
    const res = await request(app).get(`/api/classes/${cls._id}/assignments/${assignment._id}`).set(authH(teacher));
    expect(res.status).toBe(200);
    const row = res.body.rows[0];
    expect(row.completed).toBe(1);
    expect(row.items[0]).toMatchObject({ kind: 'vocab_list', completed: true });
  });

  test('"Dùng lại bộ đã giao": own classes only, one row per distinct list, searchable', async () => {
    const { teacher } = await setup();
    const other = await setup([{ word: 'zebra', meaning: 'ngựa vằn' }, { word: 'lion', meaning: 'sư tử' }, { word: 'tiger', meaning: 'hổ' }]);

    const res = await request(app).get('/api/classes/resources/vocab-lists').set(authH(teacher));
    expect(res.status).toBe(200);
    expect(res.body.lists).toHaveLength(1);
    expect(res.body.lists[0]).toMatchObject({ title: 'Environment' });
    expect(res.body.lists[0].words).toHaveLength(5);

    const search = await request(app).get('/api/classes/resources/vocab-lists?search=zebra').set(authH(other.teacher));
    expect(search.body.lists.map((l) => l.words[0].word)).toEqual(['zebra']);
    const miss = await request(app).get('/api/classes/resources/vocab-lists?search=mitigate').set(authH(other.teacher));
    expect(miss.body.lists).toHaveLength(0);
  });
});
