// Integration tests for controllers/advSentence.controller.js
// (routes/advSentence.js) — "Viết câu nâng cao": premium gate, local
// grading, exam re-grade, save-attempt re-grade, the draft mass-delete
// guard, and history/attempt ownership scoping.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const SentenceStructureGroup = require('../../models/SentenceStructureGroup');
const AdvSentenceAttempt = require('../../models/AdvSentenceAttempt');
const AdvSentenceDraft = require('../../models/AdvSentenceDraft');

let _n = 0;
async function createGroup(overrides = {}) {
  _n += 1;
  return SentenceStructureGroup.create({
    code: overrides.code || `grp-${_n}-${Date.now()}`,
    order: overrides.order ?? _n,
    week: overrides.week ?? 1,
    slotInWeek: overrides.slotInWeek ?? 1,
    nameVi: overrides.nameVi || 'Câu phức',
    nameEn: overrides.nameEn || 'Complex Sentences',
    emoji: overrides.emoji || '🧩',
    targetStructure: overrides.targetStructure || 'Sử dụng: although, because...',
    isActive: overrides.isActive ?? true,
    sentences: overrides.sentences || [
      { order: 1, promptVi: 'Mặc dù trời mưa, tôi vẫn đi học.', answerEn: 'Although it was raining, I still went to school.', hintWords: ['although', 'go to school'] },
      { order: 2, promptVi: 'Vì trời nắng nên chúng tôi ở nhà.', answerEn: 'Because it was sunny, we stayed at home.', hintWords: ['because', 'stay at home'] },
    ],
  });
}

const bearer = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

describe('premium gate', () => {
  test('unauthenticated → 401', async () => {
    expect((await request(app).get('/api/adv-sentence/weeks')).status).toBe(401);
  });

  test('free student past the 24h trial → 403 PLAN_REQUIRED', async () => {
    const u = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 864e5) } });
    const res = await request(app).get('/api/adv-sentence/weeks').set(bearer(u));
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('premium student passes', async () => {
    await createGroup({ week: 2 });
    const u = await createPremiumStudent();
    const res = await request(app).get('/api/adv-sentence/weeks').set(bearer(u));
    expect(res.status).toBe(200);
    expect(res.body.weeks.some((w) => w.week === 2)).toBe(true);
  });
});

describe('GET /group/:id', () => {
  test('ships translationAnswer for the drill but never the raw answerEn field', async () => {
    const g = await createGroup();
    const u = await createPremiumStudent();
    const res = await request(app).get(`/api/adv-sentence/group/${g._id}`).set(bearer(u));
    expect(res.status).toBe(200);
    expect(res.body.sentences).toHaveLength(2);
    expect(res.body.sentences[0].answerEn).toBeUndefined();
    expect(res.body.sentences[0].translationAnswer).toBe('Although it was raining, I still went to school.');
    expect(res.body.sentences[0].answerLetterHint).toBeTruthy();
  });

  test('404 for a missing group', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).get('/api/adv-sentence/group/000000000000000000000000').set(bearer(u));
    expect(res.status).toBe(404);
  });
});

describe('POST /check (local grading)', () => {
  test('exact match → correct 100', async () => {
    const g = await createGroup();
    const u = await createPremiumStudent();
    const res = await request(app).post('/api/adv-sentence/check').set(bearer(u)).send({
      groupId: g._id, sentenceId: g.sentences[0]._id,
      userAnswer: 'Although it was raining, I still went to school.',
    });
    expect(res.status).toBe(200);
    expect(res.body.isCorrect).toBe(true);
    expect(res.body.score).toBe(100);
  });

  test('near match (minor typo) still counts as correct', async () => {
    const g = await createGroup();
    const u = await createPremiumStudent();
    const res = await request(app).post('/api/adv-sentence/check').set(bearer(u)).send({
      groupId: g._id, sentenceId: g.sentences[0]._id,
      userAnswer: 'Although it was rainning, I still went to school',
    });
    expect(res.body.isCorrect).toBe(true);
  });

  test('wrong answer → not correct, returns the model answer', async () => {
    const g = await createGroup();
    const u = await createPremiumStudent();
    const res = await request(app).post('/api/adv-sentence/check').set(bearer(u)).send({
      groupId: g._id, sentenceId: g.sentences[0]._id, userAnswer: 'I like pizza.',
    });
    expect(res.body.isCorrect).toBe(false);
    expect(res.body.modelAnswer).toBe('Although it was raining, I still went to school.');
  });
});

describe('exam', () => {
  test('GET /exam never ships answers', async () => {
    await createGroup({ week: 5 });
    const u = await createPremiumStudent();
    const res = await request(app).get('/api/adv-sentence/exam?week=5&count=5').set(bearer(u));
    expect(res.status).toBe(200);
    expect(res.body.questions.length).toBeGreaterThan(0);
    res.body.questions.forEach((q) => {
      expect(q.translationAnswer).toBeUndefined();
      expect(q.answerEn).toBeUndefined();
    });
  });

  test('POST /exam/submit re-grades server-side (client cannot fake isCorrect)', async () => {
    const g = await createGroup();
    const u = await createPremiumStudent();
    const res = await request(app).post('/api/adv-sentence/exam/submit').set(bearer(u)).send({
      answers: [
        { groupId: g._id, sentenceId: g.sentences[0]._id, userAnswer: 'Although it was raining, I still went to school.', isCorrect: false },
        { groupId: g._id, sentenceId: g.sentences[1]._id, userAnswer: 'totally wrong', isCorrect: true },
      ],
    });
    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(1);
    expect(res.body.total).toBe(2);
  });
});

describe('POST /save-attempt', () => {
  test('re-grades and drops sentence ids not in the group', async () => {
    const g = await createGroup();
    const u = await createPremiumStudent();
    const res = await request(app).post('/api/adv-sentence/save-attempt').set(bearer(u)).send({
      sessionType: 'practice', groupId: g._id, groupName: g.nameVi,
      sentencesAttempted: [
        { sentenceId: String(g.sentences[0]._id), userAnswer: 'Although it was raining, I still went to school.', isCorrect: true, score: 100 },
        { sentenceId: '111111111111111111111111', userAnswer: 'ghost', isCorrect: true, score: 100 },
      ],
      totalQuestions: 2, correctCount: 2,
    });
    expect(res.status).toBe(200);
    expect(res.body.attempt.totalQuestions).toBe(1);
    expect(res.body.attempt.correctCount).toBe(1);
  });
});

describe('drafts', () => {
  test('POST /draft with no groupId → 400 and deletes nothing', async () => {
    const u = await createPremiumStudent();
    const g = await createGroup();
    await AdvSentenceDraft.create({ userId: u._id, groupId: String(g._id), sentenceIds: ['a'], currentIdx: 0 });

    const res = await request(app).post('/api/adv-sentence/draft').set(bearer(u)).send({ currentIdx: 1 });
    expect(res.status).toBe(400);
    expect(await AdvSentenceDraft.countDocuments({ userId: u._id })).toBe(1);
  });

  test('saving a draft for a new group wipes drafts for the user other groups only', async () => {
    const u = await createPremiumStudent();
    const other = await createStudent();
    const g1 = await createGroup();
    const g2 = await createGroup();
    await AdvSentenceDraft.create({ userId: u._id, groupId: String(g1._id), sentenceIds: ['a', 'b'], currentIdx: 1 });
    await AdvSentenceDraft.create({ userId: other._id, groupId: String(g1._id), sentenceIds: ['a'], currentIdx: 0 });

    const res = await request(app).post('/api/adv-sentence/draft').set(bearer(u)).send({
      groupId: String(g2._id), sentenceIds: ['x', 'y'], currentIdx: 0, sessionAttempts: [], sentenceStatus: [],
    });
    expect(res.status).toBe(200);
    expect(await AdvSentenceDraft.countDocuments({ userId: u._id })).toBe(1);
    expect(await AdvSentenceDraft.countDocuments({ userId: u._id, groupId: String(g2._id) })).toBe(1);
    expect(await AdvSentenceDraft.countDocuments({ userId: other._id })).toBe(1); // untouched
  });
});

describe('GET /attempt/:id ownership', () => {
  test("another user's attempt → 404", async () => {
    const owner = await createPremiumStudent();
    const other = await createPremiumStudent();
    const g = await createGroup();
    const att = await AdvSentenceAttempt.create({
      userId: owner._id, groupId: g._id, groupName: g.nameVi, week: 1,
      sentencesAttempted: [{ sentenceId: String(g.sentences[0]._id), userAnswer: 'x', isCorrect: false, score: 0 }],
      totalQuestions: 1, correctCount: 0, scorePercentage: 0,
    });
    const res = await request(app).get(`/api/adv-sentence/attempt/${att._id}`).set(bearer(other));
    expect(res.status).toBe(404);
  });
});
