// Homework "Speaking (Theo topic)" (resourceType speaking_topic): the admin
// assigns a whole Part 1 topic, or a Part 2 card that brings its topic's
// Part 3 along; the student answers the whole set in one run, saved as one
// SpeakingAttempt with sessionQuestionIds / answeredQuestionIds.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createSpeakingQuestion, createSpeakingAttempt } = require('../factories/contentFactory');
const { createClassGroup, enrollStudent } = require('../factories/classFactory');
const mongoose = require('mongoose');
const SpeakingAttempt = require('../../models/SpeakingAttempt');
const SpeakingQuestion = require('../../models/SpeakingQuestion');
const speakingService = require('../../services/speakingService');

// /analyze calls the AI — mocked (same as speakingExtra.controller.test.js).
jest.mock('../../services/geminiService');
const geminiService = require('../../services/geminiService');

const authH = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const ANSWER = 'Q1 (Part 1): question\nA1: I really enjoy watching TV in the evening with my family because it helps me relax a lot';

async function seedBank() {
  const tv1 = await createSpeakingQuestion({ part: 1, topic: 'Watching TV', question: 'Do you watch TV often?' });
  const tv2 = await createSpeakingQuestion({ part: 1, topic: 'Watching TV', question: 'What programmes do you like?' });
  const tv3 = await createSpeakingQuestion({ part: 1, topic: 'Watching TV', question: 'Did you watch TV as a child?' });
  const card = await createSpeakingQuestion({ part: 2, topic: 'Proud of a family member', group: 'people', question: 'Describe a time you felt proud of a family member' });
  const p3a = await createSpeakingQuestion({ part: 3, topic: 'Proud of a family member', question: 'Why do parents feel proud of their children?' });
  const p3b = await createSpeakingQuestion({ part: 3, topic: 'Proud of a family member', question: 'Should children be praised often?' });
  await createSpeakingQuestion({ part: 3, topic: 'Some other topic', question: 'Unrelated Part 3 question?' });
  return { tv: [tv1, tv2, tv3], card, p3: [p3a, p3b] };
}

async function assign(t, cls, resourceId) {
  const res = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(t))
    .send({ title: 'Speaking topic hw', resources: [{ kind: 'internal', resourceType: 'speaking_topic', resourceId: String(resourceId) }] });
  expect(res.status).toBe(201);
  return res.body.assignment;
}

async function doneFor(s, asgId) {
  const mine = await request(app).get('/api/assignments/mine').set(authH(s));
  return mine.body.assignments.find((a) => a._id === String(asgId)).done;
}

describe('speaking_topic — admin picker', () => {
  test('one row per Part 1 topic and per Part 2 card; the card row counts its Part 3', async () => {
    const t = await createTeacher();
    const { tv, card } = await seedBank();
    const all = await request(app).get('/api/classes/resources/catalog?type=speaking_topic').set(authH(t));
    expect(all.status).toBe(200);
    const tvRow = all.body.items.find((i) => i._id === String(tv[0]._id));
    expect(tvRow).toMatchObject({ label: 'Part 1 · Watching TV', meta: '3 câu' });
    const cardRow = all.body.items.find((i) => i._id === String(card._id));
    expect(cardRow.label).toBe('Part 2+3 · Proud of a family member');
    expect(cardRow.meta).toMatch(/^Cue card \+ 2 câu Part 3/);
    // no row per single question, no Part 3-only row
    expect(all.body.items.filter((i) => i.label.includes('Watching TV'))).toHaveLength(1);
    expect(all.body.items.some((i) => i.label.startsWith('Part 3'))).toBe(false);

    const p1 = await request(app).get('/api/classes/resources/catalog?type=speaking_topic&part=1').set(authH(t));
    expect(p1.body.items.every((i) => i.label.startsWith('Part 1'))).toBe(true);
    const p2 = await request(app).get('/api/classes/resources/catalog?type=speaking_topic&part=2&search=proud').set(authH(t));
    expect(p2.body.items.map((i) => i._id)).toEqual([String(card._id)]);
  });

  test('assigning snapshots the set label; a Part 3 id is not a valid set', async () => {
    const t = await createTeacher();
    const cls = await createClassGroup({ teacher: t });
    const { card, p3 } = await seedBank();
    const asg = await assign(t, cls, card._id);
    expect(asg.resources[0].label).toBe('Part 2+3 · Proud of a family member');
    const bad = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(t))
      .send({ title: 'x', resources: [{ kind: 'internal', resourceType: 'speaking_topic', resourceId: String(p3[0]._id) }] });
    expect(bad.status).toBe(400);
  });
});

describe('speaking_topic — student run', () => {
  test('GET /api/speaking/topic-set returns the Part 2 card then its Part 3, in bank order', async () => {
    const s = await createPremiumStudent();
    const { card, p3, tv } = await seedBank();
    const res = await request(app).get(`/api/speaking/topic-set/${card._id}`).set(authH(s));
    expect(res.status).toBe(200);
    expect(res.body.questions.map((q) => q._id)).toEqual([card, ...p3].map((q) => String(q._id)));
    const p1 = await request(app).get(`/api/speaking/topic-set/${tv[0]._id}`).set(authH(s));
    expect(p1.body.questions.map((q) => q._id)).toEqual(tv.map((q) => String(q._id)));
    expect(p1.body.questions[0].sampleAnswer).toBeUndefined();
  });

  test('ticks only when a run answered every question of the set', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await createClassGroup({ teacher: t });
    await enrollStudent(cls, s);
    const { card, p3 } = await seedBank();
    const asg = await assign(t, cls, card._id);
    const ids = [card, ...p3].map((q) => q._id);

    // A single-question answer to the card isn't the whole set.
    await createSpeakingAttempt({ userId: s._id, status: 'analyzed', extra: { questionId: card._id, transcript: ANSWER, aiFeedback: { overallBand: 6 } } });
    expect(await doneFor(s, asg._id)).toBe(0);

    // A run that skipped one Part 3 question.
    await createSpeakingAttempt({ userId: s._id, status: 'analyzed', extra: {
      topic: card.topic, part: 2, transcript: ANSWER, aiFeedback: { overallBand: 6 },
      sessionQuestionIds: ids, answeredQuestionIds: ids.slice(0, 2) } });
    expect(await doneFor(s, asg._id)).toBe(0);

    // Everything answered but the grader found nothing usable (band 0).
    await createSpeakingAttempt({ userId: s._id, status: 'analyzed', extra: {
      topic: card.topic, part: 2, transcript: ANSWER, aiFeedback: { overallBand: 0 },
      sessionQuestionIds: ids, answeredQuestionIds: ids } });
    expect(await doneFor(s, asg._id)).toBe(0);

    // The full mock never counts, even if it happened to ask the same questions.
    await createSpeakingAttempt({ userId: s._id, status: 'analyzed', extra: {
      topic: 'Full Mock Test', part: 1, transcript: ANSWER, aiFeedback: { overallBand: 6 },
      sessionQuestionIds: ids, answeredQuestionIds: ids } });
    expect(await doneFor(s, asg._id)).toBe(0);

    await createSpeakingAttempt({ userId: s._id, status: 'analyzed', extra: {
      topic: card.topic, part: 2, transcript: ANSWER, aiFeedback: { overallBand: 5 },
      sessionQuestionIds: ids, answeredQuestionIds: ids } });
    expect(await doneFor(s, asg._id)).toBe(1);

    // A Part 3 question added to the topic later doesn't undo the tick.
    // (ids carry their creation time — give it one from a minute later)
    const later = mongoose.Types.ObjectId.createFromTime(Math.floor(Date.now() / 1000) + 60);
    await SpeakingQuestion.create({ _id: later, part: 3, topic: card.topic, question: 'A brand new follow-up?' });
    expect(await doneFor(s, asg._id)).toBe(1);
  });

  test('a Part 1 topic run started from "Luyện topic này" also counts', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await createClassGroup({ teacher: t });
    await enrollStudent(cls, s);
    const { tv } = await seedBank();
    const asg = await assign(t, cls, tv[0]._id);
    const ids = tv.map((q) => q._id);
    await createSpeakingAttempt({ userId: s._id, status: 'error', extra: {
      topic: 'Watching TV', part: 1, transcript: ANSWER, sessionQuestionIds: ids, answeredQuestionIds: ids } });
    expect(await doneFor(s, asg._id)).toBe(1);
  });
});

describe('speaking_topic — end to end', () => {
  test('the run the student page sends to /analyze ticks the homework', async () => {
    geminiService.checkSpeaking.mockResolvedValue({
      fluency: 6, vocabulary: 6, grammar: 6, pronunciation: 6, overallFeedback: 'Good',
      strengths: ['Clear'], mistakes: [], vocabUpgrades: [], improvements: [],
    });
    const t = await createTeacher();
    const s = await createPremiumStudent();
    const cls = await createClassGroup({ teacher: t });
    await enrollStudent(cls, s);
    const { card, p3 } = await seedBank();
    const asg = await assign(t, cls, card._id);

    // what speaking.js finishSequentialSession() posts for a homework run
    const set = await request(app).get(`/api/speaking/topic-set/${card._id}`).set(authH(s));
    const ids = set.body.questions.map((q) => q._id);
    expect(ids).toEqual([card, ...p3].map((q) => String(q._id)));
    const post = (answered) => request(app).post('/api/speaking/analyze').set(authH(s)).send({
      transcript: ANSWER, question: 'PART 2+3 — Proud of a family member (3 câu hỏi)',
      topic: card.topic, part: 2, duration: 300, sessionQuestionIds: ids, answeredQuestionIds: answered,
    });

    expect((await post(ids.slice(0, 1))).status).toBe(200);
    expect(await doneFor(s, asg._id)).toBe(0);
    expect((await post(ids)).status).toBe(200);
    expect(await doneFor(s, asg._id)).toBe(1);
  });

  test('topic-set: unknown or malformed id → 404', async () => {
    const s = await createPremiumStudent();
    expect((await request(app).get('/api/speaking/topic-set/507f1f77bcf86cd799439011').set(authH(s))).status).toBe(404);
    expect((await request(app).get('/api/speaking/topic-set/nope').set(authH(s))).status).toBe(404);
  });
});

describe('speakingService session ids', () => {
  test('createPendingAttempt keeps valid ids only, answered ⊆ session', async () => {
    const s = await createStudent();
    const { tv } = await seedBank();
    const ids = tv.map((q) => String(q._id));
    const id = await speakingService.createPendingAttempt(s._id, {
      topic: 'Watching TV', part: 1, questionText: 'x', transcript: 'y', duration: 1,
      sessionQuestionIds: [...ids, 'not-an-id', ids[0]], answeredQuestionIds: [ids[1], '507f1f77bcf86cd799439011'],
    });
    const doc = await SpeakingAttempt.findById(id).lean();
    expect(doc.sessionQuestionIds.map(String)).toEqual(ids);
    expect(doc.answeredQuestionIds.map(String)).toEqual([ids[1]]);

    // single-question attempts carry neither field
    const single = await speakingService.createPendingAttempt(s._id, { questionId: tv[0]._id, part: 1, questionText: 'x', transcript: 'y' });
    const d2 = await SpeakingAttempt.findById(single).lean();
    expect(d2.sessionQuestionIds).toBeUndefined();
  });

  test('a question answered inside a run shows as attempted in the list', async () => {
    const s = await createStudent();
    const { tv } = await seedBank();
    await createSpeakingAttempt({ userId: s._id, extra: { sessionQuestionIds: tv.map((q) => q._id), answeredQuestionIds: [tv[1]._id] } });
    const list = await speakingService.listQuestions({ topic: 'Watching TV', userId: s._id });
    expect(list.filter((q) => q.attempted).map((q) => String(q._id))).toEqual([String(tv[1]._id)]);
  });
});
