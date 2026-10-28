// Homework types added so every section of the student site can be assigned:
// "opened = done" (shadowing video, Tips lessons, Vocab/Paraphrase units) and
// the score-based Task 2 Templates / writing practice / Task 1 practice skill.
const request = require('supertest');
const app = require('../../app');
const { createPremiumStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createClassGroup, enrollStudent } = require('../factories/classFactory');
const ShadowingLesson = require('../../models/ShadowingLesson');
const ListeningTip = require('../../models/ListeningTip');
const VocabUnit = require('../../models/VocabUnit');
const Task2Template = require('../../models/Task2Template');
const Task2TemplateAttempt = require('../../models/Task2TemplateAttempt');
const Task2TemplateProgress = require('../../models/Task2TemplateProgress');
const WPTopic = require('../../models/WPTopic');
const WritingPracticeAttempt = require('../../models/WritingPracticeAttempt');
const Task1Attempt = require('../../models/Task1Attempt');
const rcs = require('../../services/resourceCompletionService');

const authH = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

async function setup() {
  const t = await createTeacher();
  const s = await createPremiumStudent();
  const cls = await createClassGroup({ teacher: t });
  await enrollStudent(cls, s);
  return { t, s, cls };
}

async function assign(t, cls, resources) {
  const res = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(t))
    .send({ title: 'HW', resources });
  expect(res.status).toBe(201);
  return res.body.assignment;
}

async function itemOf(s, asgId) {
  const mine = await request(app).get('/api/assignments/mine').set(authH(s));
  return mine.body.assignments.find((a) => a._id === String(asgId)).resources[0];
}

test('shadowing: opening the video ticks it', async () => {
  const { t, s, cls } = await setup();
  const lesson = await ShadowingLesson.create({ slug: 'sh-1', title: 'Clip 1', youtubeId: 'abc', category: 'fun-shorts', clipStart: 0, clipEnd: 30 });
  const cat = await request(app).get(`/api/classes/resources/catalog?type=shadowing`).set(authH(t));
  expect(cat.body.items.map((i) => i.label)).toContain('Clip 1');

  const asg = await assign(t, cls, [{ kind: 'internal', resourceType: 'shadowing', resourceId: lesson._id }]);
  let item = await itemOf(s, asg._id);
  expect(item.completed).toBe(false);
  expect(item.resourceCode).toBe('sh-1');

  expect((await request(app).get('/api/shadowing/lessons/sh-1').set(authH(s))).status).toBe(200);
  await new Promise((r) => setTimeout(r, 50)); // view is recorded fire-and-forget
  item = await itemOf(s, asg._id);
  expect(item.completed).toBe(true);
});

test('tips + vocab unit: the page beacon / unit open ticks them; bogus ids are refused', async () => {
  const { t, s, cls } = await setup();
  const tip = await ListeningTip.create({ category: 'Nền tảng', lessonKey: 'kw', title: 'Keywords', blocks: [] });
  const unit = await VocabUnit.create({ unitNumber: 901, title: 'Travel', words: [] });
  const asg = await assign(t, cls, [
    { kind: 'internal', resourceType: 'listening_tip', resourceId: tip._id },
    { kind: 'internal', resourceType: 'vocab_unit', resourceId: unit._id },
  ]);
  const bad = await request(app).post('/api/assignments/viewed').set(authH(s)).send({ resourceType: 'listening_tip', resourceId: unit._id });
  expect(bad.status).toBe(404);
  expect((await request(app).post('/api/assignments/viewed').set(authH(s)).send({ resourceType: 'listening_tip', resourceId: tip._id })).status).toBe(200);
  expect((await request(app).get('/api/vocab/unit/901').set(authH(s))).status).toBe(200);
  await new Promise((r) => setTimeout(r, 50));
  const mine = await request(app).get('/api/assignments/mine').set(authH(s));
  const row = mine.body.assignments.find((a) => a._id === String(asg._id));
  expect(row.resources.map((r) => r.completed)).toEqual([true, true]);
  expect(row.resources[0].resourceCode).toBe('kw||Nền tảng');
  expect(row.status).toBe('completed');
});

test('task2_template catalog: Band 6+ and Band 7+ are separate items, filterable by level', async () => {
  const { t } = await setup();
  await Task2Template.create([
    { typeId: 'type01', level: 'band6', label: 'Type 01', sub: 'x', name: 'Adv', orderIndex: 0, sections: [] },
    { typeId: 'type01', level: 'band7', label: 'Type 01', sub: 'x', name: 'Adv', orderIndex: 0, sections: [] },
  ]);
  const all = await request(app).get('/api/classes/resources/catalog?type=task2_template').set(authH(t));
  expect(all.body.items.map((i) => i.label).sort()).toEqual(['Type 01 – Adv (Band 6+)', 'Type 01 – Adv (Band 7+)']);
  const b6 = await request(app).get('/api/classes/resources/catalog?type=task2_template&level=band6').set(authH(t));
  expect(b6.body.items.map((i) => [i.label, i.resourceCode])).toEqual([['Type 01 – Adv (Band 6+)', 'type01||band6']]);
  const b7 = await request(app).get('/api/classes/resources/catalog?type=task2_template&level=band7').set(authH(t));
  expect(b7.body.items.map((i) => i.resourceCode)).toEqual(['type01||band7']);
});

test('task2_template (legacy modes): one old-mode run with >= 70% of ALL the items still counts', async () => {
  const { t, s, cls } = await setup();
  const items = Array.from({ length: 10 }, (_, i) => ({ en: `s${i}` }));
  const tpl = await Task2Template.create({ typeId: 'type01', level: 'band7', label: 'Type 01', sub: 'x', name: 'Opinion', sections: [{ title: 'Intro', items }] });
  const asg = await assign(t, cls, [{ kind: 'internal', resourceType: 'task2_template', resourceId: tpl._id }]);
  // exam run with only 3 attempted items, all right → 3/10, not done
  await Task2TemplateAttempt.create({ userId: s._id, templateType: 'type01', level: 'band7', totalItems: 3, correctItems: 3, isExam: true });
  // other level doesn't count
  await Task2TemplateAttempt.create({ userId: s._id, templateType: 'type01', level: 'band6', totalItems: 10, correctItems: 10 });
  expect((await itemOf(s, asg._id)).completed).toBe(false);
  await Task2TemplateAttempt.create({ userId: s._id, templateType: 'type01', level: 'band7', totalItems: 10, correctItems: 7, mode: 'translation' });
  expect((await itemOf(s, asg._id)).completed).toBe(true);
});

test('task2_template (practice path): all 5 steps done AND a whole-template recall >= 70% since assigned', async () => {
  const { t, s, cls } = await setup();
  const items = Array.from({ length: 10 }, (_, i) => ({ en: `s${i}` }));
  const tpl = await Task2Template.create({ typeId: 'type02', level: 'band6', label: 'Type 02', sub: 'x', name: 'Discuss', sections: [{ title: 'Intro', items }] });
  // A passing run BEFORE the assignment doesn't count.
  await Task2TemplateAttempt.create({ userId: s._id, templateType: 'type02', level: 'band6', totalItems: 10, correctItems: 10, mode: 'path', createdAt: new Date(Date.now() - 60000) });
  const asg = await assign(t, cls, [{ kind: 'internal', resourceType: 'task2_template', resourceId: tpl._id }]);

  // 70% memorised, but the path isn't finished yet (step ⑤ missing) → not done.
  const now = new Date();
  await Task2TemplateProgress.create({ userId: s._id, level: 'band6', typeId: 'type02',
    steps: { warmup: now, read: now, drill: now, assemble: now } });
  await Task2TemplateAttempt.create({ userId: s._id, templateType: 'type02', level: 'band6', totalItems: 10, correctItems: 7, mode: 'path' });
  expect((await itemOf(s, asg._id)).completed).toBe(false);

  // A quick review with every answer right is only a few sentences → never enough.
  await Task2TemplateProgress.updateOne({ userId: s._id, level: 'band6', typeId: 'type02' }, { $set: { 'steps.apply': new Date() } });
  await Task2TemplateAttempt.deleteMany({ userId: s._id, mode: 'path', correctItems: 7 });
  await Task2TemplateAttempt.create({ userId: s._id, templateType: 'type02', level: 'band6', totalItems: 6, correctItems: 6, mode: 'review' });
  expect((await itemOf(s, asg._id)).completed).toBe(false);

  // Below 70% of the sentences → not done; a mock test submitted early is
  // measured against the whole template.
  await Task2TemplateAttempt.create({ userId: s._id, templateType: 'type02', level: 'band6', totalItems: 10, correctItems: 6, mode: 'path' });
  await Task2TemplateAttempt.create({ userId: s._id, templateType: 'type02', level: 'band6', totalItems: 10, correctItems: 5, mode: 'path', isExam: true });
  expect((await itemOf(s, asg._id)).completed).toBe(false);

  // Path finished + 7/10 memorised → done.
  await Task2TemplateAttempt.create({ userId: s._id, templateType: 'type02', level: 'band6', totalItems: 10, correctItems: 7, mode: 'path', isExam: true });
  const item = await itemOf(s, asg._id);
  expect(item.completed).toBe(true);
  expect(item.resourceCode).toBe('type02||band6');
});

test('writing_practice / task1_skill: >= 10 answers since assigned, >= 70% correct', async () => {
  const { t, s, cls } = await setup();
  const topic = await WPTopic.create({ key: 'travel-x', title: 'Travel', titleVi: 'Du lịch' });
  const skill = rcs.REGISTRY.task1_skill.catalog.static.find((x) => x.code === 'overview');
  const asg = await assign(t, cls, [
    { kind: 'internal', resourceType: 'writing_practice', resourceId: topic._id },
    { kind: 'internal', resourceType: 'task1_skill', resourceId: skill._id },
  ]);
  await WritingPracticeAttempt.create({ studentId: s._id, level: 'beginner', topic: 'travel-x', totalItems: 6, correctItems: 6 });
  for (let i = 0; i < 9; i++) {
    await Task1Attempt.create({ userId: s._id, exerciseId: skill._id, userAnswer: 'x', isCorrect: i < 7, skillType: 'overview' });
  }
  let row = (await request(app).get('/api/assignments/mine').set(authH(s))).body.assignments.find((a) => a._id === String(asg._id));
  expect(row.resources.map((r) => r.completed)).toEqual([false, false]); // 6 and 9 answers — too few
  await WritingPracticeAttempt.create({ studentId: s._id, level: 'beginner', topic: 'travel-x', totalItems: 4, correctItems: 2 });
  await Task1Attempt.create({ userId: s._id, exerciseId: skill._id, userAnswer: 'x', isCorrect: true, skillType: 'overview' });
  row = (await request(app).get('/api/assignments/mine').set(authH(s))).body.assignments.find((a) => a._id === String(asg._id));
  expect(row.resources.map((r) => r.completed)).toEqual([true, true]); // 8/10 and 8/10
  expect(row.resources[1].resourceCode).toBe('overview');
});
