// Integration tests for homework "vocab_goal" items — "học N từ trong sổ từ
// vựng" (services/vocabGoalService.js + assignmentService) and the 5 fixed
// default books they target (Sổ 1..5: no rename, no delete, restored if
// missing). Focus: teacher validation, completion driven ONLY by graded
// practice in a default book, the 50-word floor, the manual status dropdown
// not counting, stickiness once reached, and the teacher progress table.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createVocabBook } = require('../factories/contentFactory');
const { createClassGroup, enrollStudent } = require('../factories/classFactory');
const AssignmentProgress = require('../../models/AssignmentProgress');
const VocabBook = require('../../models/VocabBook');

const authH = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

async function listBooks(student) {
  const res = await request(app).get('/api/vocabbook').set(authH(student));
  expect(res.status).toBe(200);
  return res.body.books || res.body.data || res.body;
}

// Default book `slot` of `student`, filled with `n` words (after listBooks
// has created the 5 defaults).
async function fillSlot(student, slot, n) {
  await listBooks(student);
  await VocabBook.updateOne(
    { userId: student._id, defaultSlot: slot },
    { $push: { words: { $each: Array.from({ length: n }, (_, i) => ({ word: `s${slot}w${i}` })) } } },
  );
  return VocabBook.findOne({ userId: student._id, defaultSlot: slot }).lean();
}

async function setup({ slot = 1, bookWords = 10, wordCount = 5, bookSlot = null } = {}) {
  const teacher = await createTeacher();
  const student = await createStudent();
  const cls = await createClassGroup({ teacher });
  await enrollStudent(cls, student);
  const book = await fillSlot(student, slot, bookWords);
  const res = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(teacher))
    .send({ title: 'Vocab HW', resources: [{ kind: 'vocab_goal', wordCount, bookSlot }] });
  expect(res.status).toBe(201);
  return { teacher, student, cls, book, assignment: res.body.assignment };
}

async function practise(student, book, index, correct) {
  const res = await request(app)
    .post(`/api/vocabbook/${book._id}/words/${book.words[index]._id}/practice-result`)
    .set(authH(student)).send({ correct });
  expect(res.status).toBe(200);
}

// Bulk-mark words [from, to) as practised now — same fields
// recordPracticeResult writes, without N HTTP round-trips.
async function markPractised(book, from, to, correct) {
  const set = {};
  for (let i = from; i < to; i++) {
    set[`words.${i}.lastPracticedAt`] = new Date();
    set[`words.${i}.lastPracticeCorrect`] = correct;
  }
  await VocabBook.updateOne({ _id: book._id }, { $set: set });
}

async function myVocabItem(student) {
  const res = await request(app).get('/api/assignments/mine').set(authH(student));
  expect(res.status).toBe(200);
  const a = res.body.assignments[0];
  return { assignment: a, item: a.resources.find((r) => r.kind === 'vocab_goal') };
}

describe('default books (Sổ 1..5)', () => {
  test('created with slots, cannot be renamed or deleted; emoji still editable', async () => {
    const student = await createStudent();
    await listBooks(student);
    const books = await VocabBook.find({ userId: student._id, isDefault: true }).sort({ defaultSlot: 1 }).lean();
    expect(books.map((b) => [b.defaultSlot, b.name])).toEqual([[1, 'Sổ 1'], [2, 'Sổ 2'], [3, 'Sổ 3'], [4, 'Sổ 4'], [5, 'Sổ 5']]);

    const b2 = books[1];
    const rename = await request(app).put(`/api/vocabbook/${b2._id}`).set(authH(student)).send({ name: 'My topic' });
    expect(rename.status).toBe(400);
    const del = await request(app).delete(`/api/vocabbook/${b2._id}`).set(authH(student));
    expect(del.status).toBe(400);
    const emoji = await request(app).put(`/api/vocabbook/${b2._id}`).set(authH(student)).send({ emoji: '🔥' });
    expect(emoji.status).toBe(200);
    expect((await VocabBook.findById(b2._id).lean())).toMatchObject({ name: 'Sổ 2', emoji: '🔥' });
  });

  test('custom books can still be renamed', async () => {
    const student = await createStudent();
    const own = await createVocabBook({ userId: student._id, name: 'Mine' });
    const res = await request(app).put(`/api/vocabbook/${own._id}`).set(authH(student)).send({ name: 'Renamed' });
    expect(res.status).toBe(200);
  });

  test('a student with only custom books gets the 5 defaults restored', async () => {
    const student = await createStudent();
    await createVocabBook({ userId: student._id, name: 'Own book', words: [{ word: 'keep' }] });
    await listBooks(student);
    const all = await VocabBook.find({ userId: student._id }).lean();
    expect(all).toHaveLength(6);
    expect(all.filter((b) => b.isDefault).map((b) => b.defaultSlot).sort()).toEqual([1, 2, 3, 4, 5]);
    expect(all.find((b) => b.name === 'Own book').words).toHaveLength(1);
  });

  test('legacy defaults: tagged with slots, renamed ones get their name back, missing slot restored, words kept', async () => {
    const student = await createStudent();
    // pre-defaultSlot shape: isDefault but no slot; Sổ 3 deleted; Sổ 2 renamed
    for (const name of ['Sổ 1', 'UNIT 8: Plans', 'Sổ 4', 'Sổ 5']) {
      await createVocabBook({ userId: student._id, name, isDefault: true, words: [{ word: `w-${name}` }] });
    }
    await listBooks(student);
    await listBooks(student); // idempotent
    const books = await VocabBook.find({ userId: student._id, isDefault: true }).sort({ defaultSlot: 1 }).lean();
    expect(books.map((b) => [b.defaultSlot, b.name])).toEqual([[1, 'Sổ 1'], [2, 'Sổ 2'], [3, 'Sổ 3'], [4, 'Sổ 4'], [5, 'Sổ 5']]);
    expect(books[1].words[0].word).toBe('w-UNIT 8: Plans');
    expect(books[2].words).toHaveLength(0);
  });

  test('ordinary books named "Sổ N" (isDefault lost in the Aug restore) are promoted, words kept, no duplicates', async () => {
    const student = await createStudent();
    const s1 = await createVocabBook({ userId: student._id, name: 'Sổ 1', words: [{ word: 'a' }, { word: 'b' }] });
    await createVocabBook({ userId: student._id, name: 'speaking', words: [{ word: 'c' }] });
    const s2 = await createVocabBook({ userId: student._id, name: 'sổ 2', words: [{ word: 'd' }] });
    await listBooks(student);
    await listBooks(student); // idempotent
    const all = await VocabBook.find({ userId: student._id }).lean();
    expect(all).toHaveLength(6); // 3 own + Sổ 3..5 restored empty
    const defaults = all.filter((b) => b.isDefault).sort((a, b) => a.defaultSlot - b.defaultSlot);
    expect(defaults.map((b) => [b.defaultSlot, b.name, b.words.length])).toEqual([[1, 'Sổ 1', 2], [2, 'Sổ 2', 1], [3, 'Sổ 3', 0], [4, 'Sổ 4', 0], [5, 'Sổ 5', 0]]);
    expect(String(defaults[0]._id)).toBe(String(s1._id));
    expect(String(defaults[1]._id)).toBe(String(s2._id));
    expect(all.find((b) => b.name === 'speaking').isDefault).toBe(false);
  });

  test('an EMPTY auto-restored default is replaced by the real "Sổ N" book', async () => {
    const student = await createStudent();
    // state left by the first version of the restore: real Sổ 1 not flagged,
    // plus an empty slotted Sổ 1 created next to it
    const real = await createVocabBook({ userId: student._id, name: 'Sổ 1', words: [{ word: 'a' }] });
    const empty = await createVocabBook({ userId: student._id, name: 'Sổ 1', isDefault: true, defaultSlot: 1, words: [] });
    await listBooks(student);
    const books = await VocabBook.find({ userId: student._id, name: 'Sổ 1' }).lean();
    expect(books).toHaveLength(1);
    expect(String(books[0]._id)).toBe(String(real._id));
    expect(books[0]).toMatchObject({ isDefault: true, defaultSlot: 1 });
    expect(await VocabBook.findById(empty._id)).toBeNull();
  });

  test('a default with words is never replaced by a same-named ordinary book', async () => {
    const student = await createStudent();
    const def = await createVocabBook({ userId: student._id, name: 'Sổ 1', isDefault: true, defaultSlot: 1, words: [{ word: 'x' }] });
    await createVocabBook({ userId: student._id, name: 'Sổ 1', words: [{ word: 'y' }, { word: 'z' }] });
    await listBooks(student);
    const slotted = await VocabBook.findOne({ userId: student._id, defaultSlot: 1 }).lean();
    expect(String(slotted._id)).toBe(String(def._id));
    expect(await VocabBook.countDocuments({ userId: student._id, name: 'Sổ 1' })).toBe(2);
  });

  test('"Sổ 1".."Sổ 5" are reserved for the default books (create / rename)', async () => {
    const student = await createStudent();
    const create = await request(app).post('/api/vocabbook').set(authH(student)).send({ name: 'sổ 3' });
    expect(create.status).toBe(400);
    const own = await createVocabBook({ userId: student._id, name: 'Mine' });
    const rename = await request(app).put(`/api/vocabbook/${own._id}`).set(authH(student)).send({ name: 'Sổ 2' });
    expect(rename.status).toBe(400);
    const ok = await request(app).post('/api/vocabbook').set(authH(student)).send({ name: 'Sổ 6' });
    expect(ok.status).toBe(201);
  });
});

describe('teacher validation', () => {
  test('rejects a bad wordCount / bookSlot, a repeated book, and "any book" mixed with others', async () => {
    const teacher = await createTeacher();
    const cls = await createClassGroup({ teacher });
    const post = (resources) => request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(teacher)).send({ title: 'x', resources });
    expect((await post([{ kind: 'vocab_goal' }])).status).toBe(400);
    expect((await post([{ kind: 'vocab_goal', wordCount: 2 }])).status).toBe(400);
    expect((await post([{ kind: 'vocab_goal', wordCount: 301 }])).status).toBe(400);
    expect((await post([{ kind: 'vocab_goal', wordCount: 10.5 }])).status).toBe(400);
    expect((await post([{ kind: 'vocab_goal', wordCount: 10, bookSlot: 6 }])).status).toBe(400);
    expect((await post([{ kind: 'vocab_goal', wordCount: 10 }, { kind: 'vocab_goal', wordCount: 20 }])).status).toBe(400);
    expect((await post([{ kind: 'vocab_goal', wordCount: 10, bookSlot: 1 }, { kind: 'vocab_goal', wordCount: 20, bookSlot: 1 }])).status).toBe(400);
    expect((await post([{ kind: 'vocab_goal', wordCount: 10, bookSlot: 1 }, { kind: 'vocab_goal', wordCount: 20 }])).status).toBe(400);
    expect((await post([{ kind: 'vocab_goal', wordCount: 10 }, { kind: 'vocab_goal', wordCount: 20, bookSlot: 2 }])).status).toBe(400);
    const multi = await post([{ kind: 'vocab_goal', wordCount: 50, bookSlot: 1 }, { kind: 'vocab_goal', wordCount: 50, bookSlot: 2 }]);
    expect(multi.status).toBe(201);
    expect(multi.body.assignment.resources.map((r) => r.label)).toEqual(['Học 50 từ trong Sổ 1', 'Học 50 từ trong Sổ 2']);
    const any = await post([{ kind: 'vocab_goal', wordCount: '100' }]);
    expect(any.status).toBe(201);
    expect(any.body.assignment.resources[0]).toMatchObject({ kind: 'vocab_goal', wordCount: 100, bookSlot: null, label: 'Học 100 từ trong 1 sổ mặc định (Sổ 1–5)' });
    const slot = await post([{ kind: 'vocab_goal', wordCount: 100, bookSlot: '3' }]);
    expect(slot.status).toBe(201);
    expect(slot.body.assignment.resources[0]).toMatchObject({ bookSlot: 3, label: 'Học 100 từ trong Sổ 3' });
  });
});

describe('student progress', () => {
  test('quota: completes once N words practised with >= 70% correct', async () => {
    const { student, book } = await setup({ bookWords: 10, wordCount: 5 }); // need 4/5 correct
    await practise(student, book, 0, true);
    await practise(student, book, 1, true);
    await practise(student, book, 2, true);
    await practise(student, book, 3, false);
    await practise(student, book, 4, false);
    let { assignment, item } = await myVocabItem(student);
    expect(item.completed).toBe(false);
    expect(item.vocabGoal).toMatchObject({ mode: 'quota', practiced: 5, correct: 3, target: 5, needCorrect: 4, bookName: 'Sổ 1', bookSlot: 1 });
    expect(assignment.status).toBe('in_progress');

    await practise(student, book, 3, true); // re-practise a missed word
    ({ assignment, item } = await myVocabItem(student));
    expect(item.completed).toBe(true);
    expect(assignment.status).toBe('completed');
  });

  test('50 <= book < N: practising every word passes regardless of accuracy', async () => {
    const { student, book } = await setup({ bookWords: 50, wordCount: 100 });
    await markPractised(book, 0, 49, false);
    expect((await myVocabItem(student)).item.vocabGoal).toMatchObject({ mode: 'whole_book', practiced: 49, target: 50 });
    await practise(student, book, 49, false);
    expect((await myVocabItem(student)).item.completed).toBe(true);
  });

  test('a book under 50 words is not eligible even when fully practised', async () => {
    const { student, book } = await setup({ bookWords: 49, wordCount: 100 });
    await markPractised(book, 0, 49, true);
    const { item } = await myVocabItem(student);
    expect(item.completed).toBe(false);
    expect(item.vocabGoal).toMatchObject({ mode: 'too_small', bookSize: 49, minSize: 50 });
  });

  test('words in a custom (non-default) book never count', async () => {
    const { student } = await setup({ bookWords: 0, wordCount: 5 });
    const own = await createVocabBook({ userId: student._id, name: 'Own', words: Array.from({ length: 10 }, (_, i) => ({ word: `o${i}` })) });
    for (let i = 0; i < 5; i++) await practise(student, own, i, true);
    const { item } = await myVocabItem(student);
    expect(item.completed).toBe(false);
    expect(item.vocabGoal.bookSlot).not.toBeNull();
  });

  test('bookSlot: practice in another default book does not count', async () => {
    const { student } = await setup({ slot: 1, bookWords: 10, wordCount: 5, bookSlot: 2 });
    const sổ1 = await VocabBook.findOne({ userId: student._id, defaultSlot: 1 }).lean();
    for (let i = 0; i < 5; i++) await practise(student, sổ1, i, true);
    let { item } = await myVocabItem(student);
    expect(item.completed).toBe(false);
    expect(item.vocabGoal).toMatchObject({ bookSlot: 2, requiredSlot: 2, mode: 'too_small' });

    const sổ2 = await fillSlot(student, 2, 10);
    for (let i = 0; i < 5; i++) await practise(student, sổ2, i, true);
    ({ item } = await myVocabItem(student));
    expect(item.completed).toBe(true);
  });

  test('several books in one assignment: each goal tracked on its own book, done only when all are', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const cls = await createClassGroup({ teacher });
    await enrollStudent(cls, student);
    const sổ1 = await fillSlot(student, 1, 10);
    const sổ2 = await fillSlot(student, 2, 10);
    const res = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(teacher))
      .send({ title: 'Vocab HW', resources: [{ kind: 'vocab_goal', wordCount: 5, bookSlot: 1 }, { kind: 'vocab_goal', wordCount: 5, bookSlot: 2 }] });
    expect(res.status).toBe(201);

    for (let i = 0; i < 5; i++) await practise(student, sổ1, i, true);
    let mine = (await request(app).get('/api/assignments/mine').set(authH(student))).body.assignments[0];
    let goals = mine.resources.filter((r) => r.kind === 'vocab_goal');
    expect(goals.map((g) => [g.bookSlot, g.completed])).toEqual([[1, true], [2, false]]);
    expect(mine.status).toBe('in_progress');

    for (let i = 0; i < 5; i++) await practise(student, sổ2, i, true);
    mine = (await request(app).get('/api/assignments/mine').set(authH(student))).body.assignments[0];
    goals = mine.resources.filter((r) => r.kind === 'vocab_goal');
    expect(goals.every((g) => g.completed)).toBe(true);
    expect(mine.status).toBe('completed');

    const table = await request(app).get(`/api/classes/${cls._id}/assignments/${res.body.assignment._id}`).set(authH(teacher));
    expect(table.body.rows[0].items.map((it) => [it.bookSlot, it.completed])).toEqual([[1, true], [2, true]]);
  });

  test('the manual status dropdown does not count as practice', async () => {
    const { student, book } = await setup({ bookWords: 5, wordCount: 5 });
    for (const w of book.words) {
      const r = await request(app).patch(`/api/vocabbook/${book._id}/words/${w._id}`).set(authH(student)).send({ status: 'da-thuoc' });
      expect(r.status).toBe(200);
    }
    const { item } = await myVocabItem(student);
    expect(item.completed).toBe(false);
    expect(item.vocabGoal.practiced).toBe(0);
  });

  test('sticky: stays completed after later wrong answers / deleting the words', async () => {
    const { student, book, assignment } = await setup({ bookWords: 5, wordCount: 5 });
    for (let i = 0; i < 5; i++) await practise(student, book, i, true);
    expect((await myVocabItem(student)).item.completed).toBe(true);

    const prog = await AssignmentProgress.findOne({ assignmentId: assignment._id, studentId: student._id }).lean();
    expect(prog.items.filter((it) => it.source === 'auto' && it.status === 'completed')).toHaveLength(1);

    for (let i = 0; i < 5; i++) await practise(student, book, i, false);
    await VocabBook.updateOne({ _id: book._id }, { $set: { words: [] } });
    const { item } = await myVocabItem(student);
    expect(item.completed).toBe(true);
  });

  test('student cannot tick a vocab_goal item manually', async () => {
    const { student, assignment } = await setup();
    const itemId = assignment.resources[0]._id;
    const res = await request(app).post(`/api/assignments/${assignment._id}/items/${itemId}/complete`).set(authH(student)).send({ done: true });
    expect(res.status).toBe(400);
  });
});

describe('teacher progress table', () => {
  test('shows per-student vocab progress and completion', async () => {
    const { teacher, student, cls, book, assignment } = await setup({ bookWords: 10, wordCount: 5 });
    await practise(student, book, 0, true);
    await practise(student, book, 1, true);
    let res = await request(app).get(`/api/classes/${cls._id}/assignments/${assignment._id}`).set(authH(teacher));
    expect(res.status).toBe(200);
    let row = res.body.rows[0];
    expect(row.items[0].vocabGoal).toMatchObject({ practiced: 2, correct: 2, target: 5, bookName: 'Sổ 1' });
    expect(row.status).toBe('in_progress');

    for (let i = 2; i < 5; i++) await practise(student, book, i, true);
    res = await request(app).get(`/api/classes/${cls._id}/assignments/${assignment._id}`).set(authH(teacher));
    row = res.body.rows[0];
    expect(row.items[0].completed).toBe(true);
    expect(row.status).toBe('completed');
  });
});
