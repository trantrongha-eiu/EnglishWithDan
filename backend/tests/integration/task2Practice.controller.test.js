// Integration tests for controllers/task2Practice.controller.js
// (routes/task2Practice.js): premium gate on the actual content routes
// (templates/questions/vocabulary/check/exam), draft CRUD, and ownership
// scoping on history/progress/wrong-questions/drafts.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createTask2Topic } = require('../factories/contentFactory');

function question(overrides = {}) {
  return {
    level: 'beginner', type: 'fill_blank', questionText: 'The city ___ rapidly.',
    correctAnswer: 'grew', explanationVi: 'giải thích', ...overrides,
  };
}

describe('GET /api/task2/templates (premium gate)', () => {
  test('a free-plan student whose 24h trial has expired is blocked with 403 PLAN_REQUIRED', async () => {
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const res = await request(app).get('/api/task2/templates').set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('unauthenticated requests are rejected (401)', async () => {
    expect((await request(app).get('/api/task2/templates')).status).toBe(401);
  });

  test('a premium student passes the gate', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).get('/api/task2/templates').set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/task2/type-guides (premium gate + shape)', () => {
  const Task2TypeGuide = require('../../models/Task2TypeGuide');

  test('unauthenticated → 401; trial-expired free student → 403 PLAN_REQUIRED', async () => {
    expect((await request(app).get('/api/task2/type-guides')).status).toBe(401);
    const free = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const r = await request(app).get('/api/task2/type-guides').set('Authorization', `Bearer ${signTokenFor(free)}`);
    expect(r.status).toBe(403);
    expect(r.body.code).toBe('PLAN_REQUIRED');
  });

  test('a premium student gets the active guides ordered by orderIndex', async () => {
    await Task2TypeGuide.deleteMany({ typeId: /^typeTEST/ });
    await Task2TypeGuide.create([
      { typeId: 'typeTEST2', name: 'B', orderIndex: 2, isActive: true, upgradePairs: [['a', 'b']], mistakes: ['m'] },
      { typeId: 'typeTEST1', name: 'A', orderIndex: 1, isActive: true },
      { typeId: 'typeTEST9', name: 'Z hidden', orderIndex: 9, isActive: false },
    ]);
    const user = await createPremiumStudent();
    const res = await request(app).get('/api/task2/type-guides').set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    const codes = res.body.guides.map(g => g.typeId);
    expect(codes).toContain('typeTEST1');
    expect(codes).toContain('typeTEST2');
    expect(codes).not.toContain('typeTEST9'); // isActive:false excluded
    expect(codes.indexOf('typeTEST1')).toBeLessThan(codes.indexOf('typeTEST2'));
    const t2 = res.body.guides.find(g => g.typeId === 'typeTEST2');
    expect(t2.upgradePairs).toEqual([['a', 'b']]);
    await Task2TypeGuide.deleteMany({ typeId: /^typeTEST/ });
  });
});

describe('GET /api/task2/weeks and /api/task2/topics/week/:week (public metadata)', () => {
  test('weeks list is public (no auth) and reflects seeded topics', async () => {
    await createTask2Topic({ week: 3, questions: [question()] });
    const res = await request(app).get('/api/task2/weeks');
    expect(res.status).toBe(200);
    expect(res.body.weeks.some(w => w.week === 3)).toBe(true);
  });

  test('topics-for-week strips the questions/vocabularyList content (metadata only)', async () => {
    await createTask2Topic({ week: 4, topicName: 'Environment', questions: [question()] });
    const res = await request(app).get('/api/task2/topics/week/4');
    expect(res.status).toBe(200);
    expect(res.body.topics[0].topicName).toBe('Environment');
    expect(res.body.topics[0].questions).toBeUndefined();
  });
});

describe('GET /api/task2/questions/topic/:topicId and /api/task2/vocabulary/:topicId (premium gate + content)', () => {
  test('blocks a free-plan student whose 24h trial has expired (403 PLAN_REQUIRED)', async () => {
    const topic = await createTask2Topic({ questions: [question()] });
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const res = await request(app).get(`/api/task2/questions/topic/${topic._id}`).set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('a premium student gets questions with correctAnswer/modelAnswer stripped', async () => {
    const topic = await createTask2Topic({ questions: [question({ correctAnswer: 'secret answer' })] });
    const user = await createPremiumStudent();
    const res = await request(app).get(`/api/task2/questions/topic/${topic._id}`).set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(1);
    expect(res.body.questions[0].correctAnswer).toBeUndefined();
  });

  test('returns 404 for a nonexistent topic', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).get('/api/task2/questions/topic/000000000000000000000000').set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(404);
  });

  test('vocabulary route returns the topic\'s vocabularyList for a premium student', async () => {
    const topic = await createTask2Topic({ extra: { vocabularyList: [{ term: 'sustainable', definitionVi: 'bền vững' }] } });
    const user = await createPremiumStudent();
    const res = await request(app).get(`/api/task2/vocabulary/${topic._id}`).set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.vocabularyList).toHaveLength(1);
  });
});

describe('POST /api/task2/check', () => {
  test('rejects a request missing required fields (400)', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).post('/api/task2/check').set('Authorization', `Bearer ${signTokenFor(user)}`).send({});
    expect(res.status).toBe(400);
  });

  test('returns topic_not_found (404) for a bad topicId', async () => {
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/task2/check')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ topicId: '000000000000000000000000', questionId: 'q1', userAnswer: 'x' });
    expect(res.status).toBe(404);
  });

  test('grades a deterministic fill_blank question correctly (autoGrade path, no AI)', async () => {
    const topic = await createTask2Topic({ questions: [question({ type: 'fill_blank', correctAnswer: 'grew' })] });
    const q = topic.questions[0];
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/task2/check')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ topicId: String(topic._id), questionId: String(q._id), userAnswer: 'grew' });
    expect(res.status).toBe(200);
    expect(res.body.isCorrect).toBe(true);
    expect(res.body.aiGraded).toBe(false);
  });
});

describe('GET /api/task2/topic-stats/:topicId ("Viết bài ngay" gate)', () => {
  test('401 without auth', async () => {
    expect((await request(app).get('/api/task2/topic-stats/000000000000000000000000')).status).toBe(401);
  });

  test('reports not practised for a topic the student has never done', async () => {
    const topic = await createTask2Topic({ questions: [question()] });
    const user = await createPremiumStudent();
    const res = await request(app).get(`/api/task2/topic-stats/${topic._id}`).set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.stats).toMatchObject({ practiced: false, bestScore: 0 });
  });

  test('reports the best practice score after a real session', async () => {
    const topic = await createTask2Topic({ questions: [question({ type: 'fill_blank', correctAnswer: 'grew' })] });
    const q = topic.questions[0];
    const user = await createPremiumStudent();
    const auth = { Authorization: `Bearer ${signTokenFor(user)}` };

    await request(app).post('/api/task2/save-attempt').set(auth).send({
      sessionType: 'practice', week: topic.week, topicId: String(topic._id), topicName: topic.topicName, level: 'beginner',
      questionsAttempted: [{ questionId: String(q._id), userAnswer: 'grew' }],
      totalQuestions: 1, correctCount: 1,
    });

    const res = await request(app).get(`/api/task2/topic-stats/${topic._id}`).set(auth);
    expect(res.body.stats.practiced).toBe(true);
    expect(res.body.stats.bestScore).toBe(100);
  });
});

describe('GET /api/task2/exam and POST /api/task2/exam/submit', () => {
  test('exam route requires premium and returns sanitized questions', async () => {
    await createTask2Topic({ week: 1, questions: [question({ correctAnswer: 'secret' })] });
    const user = await createPremiumStudent();
    const res = await request(app).get('/api/task2/exam?count=5').set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.questions.every(q => q.correctAnswer === undefined)).toBe(true);
  });

  test('submitExam rejects an empty answers array (400)', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).post('/api/task2/exam/submit').set('Authorization', `Bearer ${signTokenFor(user)}`).send({ answers: [] });
    expect(res.status).toBe(400);
  });

  test('submitExam grades real answers and reports a score', async () => {
    const topic = await createTask2Topic({ questions: [question({ type: 'fill_blank', correctAnswer: 'grew' })] });
    const q = topic.questions[0];
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/task2/exam/submit')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ answers: [{ topicId: String(topic._id), questionId: String(q._id), userAnswer: 'grew' }] });
    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(1);
    expect(res.body.score).toBe(100);
  });
});

describe('POST /api/task2/save-attempt (server-side re-grade) + ownership scoping', () => {
  test('re-grades questionsAttempted against the real topic instead of trusting client isCorrect', async () => {
    const topic = await createTask2Topic({ questions: [question({ type: 'fill_blank', correctAnswer: 'grew' })] });
    const q = topic.questions[0];
    const user = await createPremiumStudent();
    const token = signTokenFor(user);

    const res = await request(app)
      .post('/api/task2/save-attempt')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topicId: String(topic._id), topicName: topic.topicName, level: 'beginner',
        questionsAttempted: [{ questionId: String(q._id), userAnswer: 'totally wrong', isCorrect: true, score: 100 }],
        totalQuestions: 999, correctCount: 999,
      });
    expect(res.status).toBe(200);
    expect(res.body.attempt.correctCount).toBe(0);
    expect(res.body.attempt.totalQuestions).toBe(1);
  });

  test('history/progress/wrong-questions only reflect the requesting student\'s own attempts', async () => {
    const topic = await createTask2Topic({ questions: [question({ type: 'fill_blank', correctAnswer: 'grew' })] });
    const q = topic.questions[0];
    const studentA = await createPremiumStudent();
    const studentB = await createPremiumStudent();

    await request(app).post('/api/task2/save-attempt').set('Authorization', `Bearer ${signTokenFor(studentA)}`)
      .send({ topicId: String(topic._id), topicName: topic.topicName, level: 'beginner',
        questionsAttempted: [{ questionId: String(q._id), userAnswer: 'wrong' }] });
    await request(app).post('/api/task2/save-attempt').set('Authorization', `Bearer ${signTokenFor(studentB)}`)
      .send({ topicId: String(topic._id), topicName: topic.topicName, level: 'beginner',
        questionsAttempted: [{ questionId: String(q._id), userAnswer: 'grew' }] });

    const historyRes = await request(app).get('/api/task2/history').set('Authorization', `Bearer ${signTokenFor(studentA)}`);
    expect(historyRes.body.attempts).toHaveLength(1);

    const wrongRes = await request(app).get(`/api/task2/wrong-questions/${topic._id}`).set('Authorization', `Bearer ${signTokenFor(studentA)}`);
    expect(wrongRes.body.wrongIds).toContain(String(q._id));

    const wrongResB = await request(app).get(`/api/task2/wrong-questions/${topic._id}`).set('Authorization', `Bearer ${signTokenFor(studentB)}`);
    expect(wrongResB.body.wrongIds).not.toContain(String(q._id));
  });
});

describe('GET /api/task2/attempt/:attemptId (per-question review)', () => {
  test('expands each answered question with prompt text, model answer and explanation; scoped to owner', async () => {
    const topic = await createTask2Topic({ questions: [question({ type: 'fill_blank', correctAnswer: 'grew', questionText: 'The city ___ rapidly.', explanationVi: 'past simple' })] });
    const q = topic.questions[0];
    const owner = await createPremiumStudent();
    const other = await createPremiumStudent();

    const save = await request(app).post('/api/task2/save-attempt').set('Authorization', `Bearer ${signTokenFor(owner)}`)
      .send({ topicId: String(topic._id), topicName: topic.topicName, level: 'beginner',
        questionsAttempted: [{ questionId: String(q._id), userAnswer: 'wrong' }] });
    const attemptId = save.body.attempt._id;

    const res = await request(app).get(`/api/task2/attempt/${attemptId}`).set('Authorization', `Bearer ${signTokenFor(owner)}`);
    expect(res.status).toBe(200);
    expect(res.body.attempt.questions).toHaveLength(1);
    expect(res.body.attempt.questions[0]).toMatchObject({
      questionText: 'The city ___ rapidly.',
      userAnswer: 'wrong',
      isCorrect: false,
      modelAnswer: 'grew',
      explanationVi: 'past simple',
    });

    // another student can't read it
    const forbidden = await request(app).get(`/api/task2/attempt/${attemptId}`).set('Authorization', `Bearer ${signTokenFor(other)}`);
    expect(forbidden.status).toBe(404);

    // garbage id → 404, not 500
    const bad = await request(app).get('/api/task2/attempt/not-an-object-id').set('Authorization', `Bearer ${signTokenFor(owner)}`);
    expect(bad.status).toBe(404);
  });
});

describe('Draft CRUD (save/get/delete/list) — ownership scoping', () => {
  test('a saved draft is only visible/gettable by its owner', async () => {
    const topic = await createTask2Topic();
    const owner = await createPremiumStudent();
    const intruder = await createPremiumStudent();
    const ownerToken = signTokenFor(owner);

    const saveRes = await request(app)
      .post('/api/task2/draft')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ topicId: String(topic._id), topicName: topic.topicName, week: topic.week, level: 'beginner', currentIdx: 2 });
    expect(saveRes.status).toBe(200);

    const ownerGet = await request(app).get(`/api/task2/draft/${topic._id}`).set('Authorization', `Bearer ${ownerToken}`);
    expect(ownerGet.body.draft.currentIdx).toBe(2);

    const intruderGet = await request(app).get(`/api/task2/draft/${topic._id}`).set('Authorization', `Bearer ${signTokenFor(intruder)}`);
    expect(intruderGet.body.draft).toBeNull();

    const listRes = await request(app).get('/api/task2/drafts').set('Authorization', `Bearer ${ownerToken}`);
    expect(listRes.body.drafts).toHaveLength(1);

    const delRes = await request(app).delete(`/api/task2/draft/${topic._id}`).set('Authorization', `Bearer ${ownerToken}`);
    expect(delRes.status).toBe(200);
    const afterDelete = await request(app).get(`/api/task2/draft/${topic._id}`).set('Authorization', `Bearer ${ownerToken}`);
    expect(afterDelete.body.draft).toBeNull();
  });

  // Regression coverage for BUG-026 (2026-08-27 audit). Two distinct
  // findings, not just one:
  //  1) sessionAttempts/questionIds/questionStatus not being real arrays
  //     used to hit a raw Mongoose CastError -> 500.
  //  2) WORSE (found while designing this fix, confirmed directly against
  //     a real Mongo query): a missing/malformed topicId reached
  //     saveDraft()'s Task2Draft.deleteMany({userId, topicId:{$ne:topicId}})
  //     BEFORE the cast error — with topicId undefined, that filter
  //     effectively matched every draft for the user, silently deleting
  //     ALL of them (not just "other topics") before the request then
  //     still 500'd. The tests below assert that a pre-existing OTHER
  //     draft survives a malformed save attempt — not just that the
  //     malformed request itself gets a clean 400.
  describe('POST /api/task2/draft — malformed body (BUG-026)', () => {
    async function setUp() {
      const topicA = await createTask2Topic();
      const topicB = await createTask2Topic();
      const user = await createPremiumStudent();
      const token = signTokenFor(user);
      // A real, pre-existing draft on a DIFFERENT topic — this must survive
      // every malformed request below.
      await request(app).post('/api/task2/draft').set('Authorization', `Bearer ${token}`)
        .send({ topicId: String(topicA._id), topicName: topicA.topicName, level: 'beginner', currentIdx: 1 });
      return { topicA, topicB, token };
    }

    async function expectRejectedAndTopicAIntact(token, topicA, body) {
      const res = await request(app).post('/api/task2/draft').set('Authorization', `Bearer ${token}`).send(body);
      expect(res.status).toBe(400);
      const stillThere = await request(app).get(`/api/task2/draft/${topicA._id}`).set('Authorization', `Bearer ${token}`);
      expect(stillThere.body.draft).not.toBeNull();
      expect(stillThere.body.draft.currentIdx).toBe(1);
    }

    test('missing topicId is rejected 400, and does NOT wipe an existing draft on another topic', async () => {
      const { topicA, token } = await setUp();
      await expectRejectedAndTopicAIntact(token, topicA, { level: 'beginner', currentIdx: 2 });
    });

    test('null topicId is rejected 400, and does NOT wipe an existing draft on another topic', async () => {
      const { topicA, token } = await setUp();
      await expectRejectedAndTopicAIntact(token, topicA, { topicId: null, currentIdx: 2 });
    });

    test('sessionAttempts as an object instead of an array is rejected 400', async () => {
      const { topicA, topicB, token } = await setUp();
      await expectRejectedAndTopicAIntact(token, topicA, { topicId: String(topicB._id), sessionAttempts: {} });
    });

    test('questionIds as a string instead of an array is rejected 400', async () => {
      const { topicA, topicB, token } = await setUp();
      await expectRejectedAndTopicAIntact(token, topicA, { topicId: String(topicB._id), questionIds: 'not-an-array' });
    });

    test('questionStatus as an object instead of an array is rejected 400', async () => {
      const { topicA, topicB, token } = await setUp();
      await expectRejectedAndTopicAIntact(token, topicA, { topicId: String(topicB._id), questionStatus: {} });
    });

    test('a valid save with real arrays still works, and KEEPS the draft for the OTHER topic (parallel homework)', async () => {
      const { topicA, topicB, token } = await setUp();
      const res = await request(app).post('/api/task2/draft').set('Authorization', `Bearer ${token}`)
        .send({
          topicId: String(topicB._id), topicName: topicB.topicName, currentIdx: 0,
          questionIds: ['q1', 'q2'], sessionAttempts: [], questionStatus: ['pending', 'pending'],
        });
      expect(res.status).toBe(200);

      // A student can have an in-progress draft on more than one Task 2 topic
      // at once (was "max 1 draft", which silently wiped progress on a
      // parallel assignment — see task2PracticeService.MAX_DRAFTS_PER_USER).
      const aStill = await request(app).get(`/api/task2/draft/${topicA._id}`).set('Authorization', `Bearer ${token}`);
      expect(aStill.body.draft).not.toBeNull();
      expect(aStill.body.draft.currentIdx).toBe(1);
      const bThere = await request(app).get(`/api/task2/draft/${topicB._id}`).set('Authorization', `Bearer ${token}`);
      expect(bThere.body.draft.questionIds).toEqual(['q1', 'q2']);
    });
  });
});

describe('Lessons — /api/task2/sessions + /api/task2/lesson/:topicId', () => {
  test('sessions list is public and ordered by (week, orderIndex)', async () => {
    const b = await createTask2Topic({ week: 16, orderIndex: 1, topicName: 'Lesson B', questions: [question()] });
    const a = await createTask2Topic({ week: 16, orderIndex: 0, topicName: 'Lesson A', questions: [question()] });
    const res = await request(app).get('/api/task2/sessions');
    expect(res.status).toBe(200);
    const ids = res.body.sessions.map(s => String(s._id));
    expect(ids.indexOf(String(a._id))).toBeLessThan(ids.indexOf(String(b._id)));
    expect(res.body.sessions[0].questions).toBeUndefined();
  });

  test('lesson work is premium-gated, saved per student, and returns the student\'s own translations', async () => {
    const topic = await createTask2Topic({ questions: [
      question({ type: 'translation', questionText: 'Dịch: "Xin chào"', correctAnswer: 'Hello.', modelAnswer: 'Hello.' }),
      question({ type: 'fill_blank' }),
    ] });
    const tq = topic.questions[0];
    const studentA = await createPremiumStudent();
    const studentB = await createPremiumStudent();
    const authA = `Bearer ${signTokenFor(studentA)}`;
    const url = `/api/task2/lesson/${topic._id}`;

    expect((await request(app).get(url)).status).toBe(401);

    await request(app).post('/api/task2/save-attempt').set('Authorization', authA)
      .send({ topicId: String(topic._id), topicName: topic.topicName, level: 'beginner',
        questionsAttempted: [{ questionId: String(tq._id), userAnswer: 'Hi there.', isCorrect: true, score: 100 }] });

    const put = await request(app).put(url).set('Authorization', authA)
      .send({ brainstorm: ['idea 1'], sections: { intro: 'My intro', body1: 'x'.repeat(7000), bogus: 'no' } });
    expect(put.status).toBe(200);
    expect(put.body.work.sections.intro).toBe('My intro');
    expect(put.body.work.sections.body1).toHaveLength(6000);
    expect(put.body.work.sections.bogus).toBeUndefined();

    const getA = await request(app).get(url).set('Authorization', authA);
    expect(getA.status).toBe(200);
    expect(getA.body.work.brainstorm).toEqual(['idea 1']);
    expect(getA.body.sentences).toHaveLength(1); // fill_blank isn't a sentence-building question
    expect(getA.body.sentences[0].en).toBe('Hi there.');
    expect(getA.body.sentences[0].model).toBe('Hello.');

    const getB = await request(app).get(url).set('Authorization', `Bearer ${signTokenFor(studentB)}`);
    expect(getB.body.work).toBeNull();
    expect(getB.body.sentences[0].en).toBe('');

    const prog = await request(app).get('/api/task2/lessons/progress').set('Authorization', authA);
    expect(prog.body.progress).toEqual([{ topicId: String(topic._id), written: 2, submitted: false }]);
  });

  test('translations from an unfinished run survive "Dịch tiếp" (new session overwrites, then deletes, the draft)', async () => {
    const topic = await createTask2Topic({ questions: [
      question({ type: 'translation', questionText: 'Dịch 1', correctAnswer: 'One.' }),
      question({ type: 'translation', questionText: 'Dịch 2', correctAnswer: 'Two.' }),
    ] });
    const [q1, q2] = topic.questions.map(q => String(q._id));
    const user = await createPremiumStudent();
    const auth = `Bearer ${signTokenFor(user)}`;
    const topicId = String(topic._id);
    const url = `/api/task2/lesson/${topicId}`;
    const draft = (ids, attempts) => request(app).post('/api/task2/draft').set('Authorization', auth)
      .send({ topicId, mode: 'practice', questionIds: ids, sessionAttempts: attempts, questionStatus: [], sessionDone: attempts.length });

    // Run 1: q1 answered correctly, then the student leaves.
    expect((await draft([q1, q2], [{ questionId: q1, userAnswer: 'One.', isCorrect: true, type: 'translation' }])).status).toBe(200);
    // Run 2 ("Dịch tiếp 1 câu"): only q2 — the draft no longer holds q1, and
    // a later wrong retry of q1 must not replace the correct one.
    await draft([q2], [{ questionId: q2, userAnswer: 'Two.', isCorrect: true, type: 'translation' }]);
    await draft([q1], [{ questionId: q1, userAnswer: 'Wrong', isCorrect: false, type: 'translation' }]);
    await request(app).delete(`/api/task2/draft/${topicId}`).set('Authorization', auth);

    const res = await request(app).get(url).set('Authorization', auth);
    expect(res.status).toBe(200);
    expect(res.body.sentences.map(s => s.en)).toEqual(['One.', 'Two.']);
    expect(res.body.work.sentences).toBeUndefined();
    expect(res.body.work.sections.intro).toBe('');
  });

  test('a draft saved before the lesson copy existed is still kept when the next session replaces it', async () => {
    const Task2Draft = require('../../models/Task2Draft');
    const topic = await createTask2Topic({ questions: [
      question({ type: 'translation', questionText: 'Dịch 1', correctAnswer: 'One.' }),
      question({ type: 'translation', questionText: 'Dịch 2', correctAnswer: 'Two.' }),
    ] });
    const [q1, q2] = topic.questions.map(q => String(q._id));
    const user = await createPremiumStudent();
    const auth = `Bearer ${signTokenFor(user)}`;
    const topicId = String(topic._id);
    await Task2Draft.create({ userId: user._id, topicId, questionIds: [q1, q2],
      sessionAttempts: [{ questionId: q1, userAnswer: 'One.', isCorrect: true, type: 'translation' }] });

    await request(app).post('/api/task2/draft').set('Authorization', auth)
      .send({ topicId, mode: 'practice', questionIds: [q2], sessionAttempts: [{ questionId: q2, userAnswer: 'Two.', isCorrect: true, type: 'translation' }] });
    await request(app).delete(`/api/task2/draft/${topicId}`).set('Authorization', auth);

    const res = await request(app).get(`/api/task2/lesson/${topicId}`).set('Authorization', auth);
    expect(res.body.sentences.map(s => s.en)).toEqual(['One.', 'Two.']);
  });

  test('malformed body / unknown topic are rejected', async () => {
    const user = await createPremiumStudent();
    const auth = `Bearer ${signTokenFor(user)}`;
    const topic = await createTask2Topic({ questions: [question()] });
    const url = `/api/task2/lesson/${topic._id}`;
    expect((await request(app).put(url).set('Authorization', auth).send({ brainstorm: 'nope' })).status).toBe(400);
    expect((await request(app).put(url).set('Authorization', auth).send({ sections: ['x'] })).status).toBe(400);
    expect((await request(app).put('/api/task2/lesson/not-an-id').set('Authorization', auth).send({})).status).toBe(404);
    expect((await request(app).get('/api/task2/lesson/507f1f77bcf86cd799439011').set('Authorization', auth)).status).toBe(404);
  });
});
