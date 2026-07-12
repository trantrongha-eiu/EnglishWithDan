// IDOR regressions: one student must never be able to read another
// student's resource by guessing/enumerating its ID. Covers three
// differently-shaped resources so the assertion isn't tied to one
// controller's error-handling style.
const request = require('supertest');
const app = require('../../app');
const { createStudent, signTokenFor } = require('../factories/userFactory');
const { createVocabBook, createCompletedTestAttempt, createWritingAttempt } = require('../factories/contentFactory');

describe('IDOR — vocab book', () => {
  test("student B cannot fetch student A's vocab book by ID", async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    const book = await createVocabBook({ userId: studentA._id, name: "A's secret book" });

    const res = await request(app)
      .get(`/api/vocabbook/${book._id}`)
      .set('Authorization', `Bearer ${signTokenFor(studentB)}`);

    expect(res.status).toBe(404);
    expect(res.body.book).toBeUndefined();
  });
});

describe('IDOR — reading attempt review', () => {
  test("student B cannot review student A's completed reading attempt", async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    const attempt = await createCompletedTestAttempt({ userId: studentA._id });

    const res = await request(app)
      .get(`/api/reading/attempt/${attempt._id}/review`)
      .set('Authorization', `Bearer ${signTokenFor(studentB)}`);

    expect(res.status).toBe(404);
    expect(res.body.attempt).toBeUndefined();
  });
});

describe('IDOR — writing attempt', () => {
  test("student B is forbidden from student A's writing attempt, not shown its content", async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    const attempt = await createWritingAttempt({ userId: studentA._id, extra: { task1Answer: 'secret answer text' } });

    const res = await request(app)
      .get(`/api/writing/attempt/${attempt._id}`)
      .set('Authorization', `Bearer ${signTokenFor(studentB)}`);

    expect(res.status).toBe(403);
    expect(res.body.attempt).toBeUndefined();
  });
});
