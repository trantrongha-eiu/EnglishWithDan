// Debug/regression tests for the two admin content-management surfaces
// shown on the users site:
//   - routes/admin/wt1.js          (WritingTask1Course.jsx  → "Task 1 Writing (khoá)")
//   - routes/admin/advSentences.js (AdvancedSentences.jsx    → "Viết câu nâng cao")
// Focus: the admin-page edit round-trip must not lose fields, and every
// CRUD route the pages call must actually work.
const request = require('supertest');
const app = require('../../app');
const { createTeacher, createAdmin, createStudent, signTokenFor } = require('../factories/userFactory');
const WT1Course = require('../../models/WT1Course');
const WT1Module = require('../../models/WT1Module');
const WT1Lesson = require('../../models/WT1Lesson');
const WT1Exercise = require('../../models/WT1Exercise');
const SentenceStructureGroup = require('../../models/SentenceStructureGroup');

const bearer = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

// A realistic seeded exercise — the shape the real WT1 seed produces,
// including the fields most at risk of being dropped on edit.
const RICH_EXERCISE = {
  code: 'T1-DBG-E01',
  lessonCode: 'T1-DBGL',
  order: 2,
  type: 'gap_fill',
  title: 'Điền từ',
  titleEn: 'Fill the gaps',
  instruction: 'Điền number / amount / percentage.',
  source: 'original',
  skillTags: ['data-nouns', 'countability'],
  difficulty: 2,
  estimatedMinutes: 8,
  points: 10,
  autoGrade: true,
  timerMinutes: 12,
  needsAsset: false,
  stimulus: {
    kind: 'table',
    caption: 'Phương tiện giao thông (2005)',
    headers: ['Loại', 'Triệu'],
    rows: [['Xe máy', '20'], ['Ô tô', '7']],
    note: 'Chú ý danh từ không đếm được.',
  },
  wordBank: ['number', 'amount', 'percentage'],
  categories: [],
  responseSlots: 0,
  items: [
    { id: 'q1', prompt: 'The ____ of cars was 7 million.', blanks: [{ accept: ['number'] }], explanation: 'countable' },
    { id: 'q2', prompt: 'The ____ of petrol used rose.', blanks: [{ accept: ['amount'] }], explanation: 'uncountable' },
  ],
  rubric: null,
  published: true,
};

async function seed() {
  await WT1Course.findOneAndUpdate({ code: 'IELTS-W-T1' }, { code: 'IELTS-W-T1', title: 'WT1' }, { upsert: true });
  await WT1Module.findOneAndUpdate({ code: 'T1-DBGM' },
    { code: 'T1-DBGM', courseCode: 'IELTS-W-T1', order: 1, title: 'Module debug' }, { upsert: true });
  await WT1Lesson.findOneAndUpdate({ code: 'T1-DBGL' }, {
    code: 'T1-DBGL', moduleCode: 'T1-DBGM', order: 2, title: 'Buổi debug', published: true,
    objectives: ['Phân biệt number/amount'], keyLanguage: ['the number of + N đếm được'],
    gate: { requireObjectiveCompletion: true, minObjectiveScorePercent: 70, minWritingSubmissions: 1 },
  }, { upsert: true });
  await WT1Exercise.deleteMany({ lessonCode: 'T1-DBGL' });
  await WT1Exercise.create(RICH_EXERCISE);
}

beforeEach(async () => {
  await WT1Exercise.deleteMany({ lessonCode: 'T1-DBGL' });
  await WT1Lesson.deleteMany({ code: 'T1-DBGL' });
  await WT1Module.deleteMany({ code: 'T1-DBGM' });
  await SentenceStructureGroup.deleteMany({ code: /^grp-dbg/ });
  await seed();
});

// ───────────────────────── WT1 admin ─────────────────────────
describe('admin/wt1 — tree + reads', () => {
  test('teacher: GET /admin/wt1/tree returns modules → lessons with exercise counts', async () => {
    const t = await createTeacher();
    const res = await request(app).get('/api/admin/wt1/tree').set(bearer(t));
    expect(res.status).toBe(200);
    const mod = res.body.modules.find((m) => m.code === 'T1-DBGM');
    expect(mod).toBeTruthy();
    const les = mod.lessons.find((l) => l.code === 'T1-DBGL');
    expect(les.exercises).toEqual({ total: 1, published: 1 });
  });

  test('student: tree is 403', async () => {
    const s = await createStudent();
    expect((await request(app).get('/api/admin/wt1/tree').set(bearer(s))).status).toBe(403);
  });

  test('GET /admin/wt1/lessons/:code and /exercises?lesson= work', async () => {
    const t = await createTeacher();
    expect((await request(app).get('/api/admin/wt1/lessons/T1-DBGL').set(bearer(t))).body.lesson.title).toBe('Buổi debug');
    const list = await request(app).get('/api/admin/wt1/exercises?lesson=T1-DBGL').set(bearer(t));
    expect(list.body.exercises).toHaveLength(1);
    expect(list.body.exercises[0].code).toBe('T1-DBG-E01');
  });
});

describe('admin/wt1 — exercise edit round-trip (data-loss check)', () => {
  // Mirrors WritingTask1Course.jsx ExerciseModal.buildPayload(): meta +
  // stimulus rebuilt field-by-field, items/rubric passed through as-is.
  function buildPayloadLikeAdminPage(ex) {
    const st = ex.stimulus || {};
    const stimulus = st.kind ? {
      kind: st.kind, caption: st.caption || '', imageUrl: st.imageUrl || '', note: st.note || '',
      headers: Array.isArray(st.headers) ? st.headers : [],
      rows: st.rows || [],
    } : null;
    return {
      code: ex.code, lessonCode: ex.lessonCode, order: Number(ex.order) || 0, type: ex.type,
      title: ex.title, titleEn: ex.titleEn, instruction: ex.instruction, source: ex.source,
      skillTags: Array.isArray(ex.skillTags) ? ex.skillTags : [],
      difficulty: Number(ex.difficulty) || 1, estimatedMinutes: Number(ex.estimatedMinutes) || undefined,
      points: Number(ex.points) || 0, autoGrade: !!ex.autoGrade,
      timerMinutes: ex.timerMinutes || undefined,
      needsAsset: !!ex.needsAsset, published: !!ex.published,
      stimulus, wordBank: Array.isArray(ex.wordBank) ? ex.wordBank : [],
      categories: Array.isArray(ex.categories) ? ex.categories : [],
      responseSlots: Number(ex.responseSlots) || 0, items: ex.items || [], rubric: ex.rubric ?? null,
    };
  }

  test('open an exercise, save it back unchanged → nothing is lost', async () => {
    const admin = await createAdmin();
    const got = await request(app).get('/api/admin/wt1/exercises/T1-DBG-E01').set(bearer(admin));
    expect(got.status).toBe(200);
    const payload = buildPayloadLikeAdminPage(got.body.exercise);

    const put = await request(app).put('/api/admin/wt1/exercises/T1-DBG-E01').set(bearer(admin)).send(payload);
    expect(put.status).toBe(200);

    const after = (await request(app).get('/api/admin/wt1/exercises/T1-DBG-E01').set(bearer(admin))).body.exercise;
    // fields the page never puts in its payload must survive the edit
    expect(after.skillTags).toEqual(['data-nouns', 'countability']);
    expect(after.stimulus.headers).toEqual(['Loại', 'Triệu']);
    expect(after.stimulus.rows).toEqual([['Xe máy', '20'], ['Ô tô', '7']]);
    expect(after.timerMinutes).toBe(12);
    expect(after.estimatedMinutes).toBe(8);
    expect(after.items).toHaveLength(2);
    expect(after.items[0].blanks[0].accept).toEqual(['number']);
  });

  test('POST /admin/wt1/validate accepts the seeded exercise as-is', async () => {
    const t = await createTeacher();
    const got = await request(app).get('/api/admin/wt1/exercises/T1-DBG-E01').set(bearer(t));
    const res = await request(app).post('/api/admin/wt1/validate').set(bearer(t)).send(got.body.exercise);
    expect(res.body.errors).toEqual([]);
  });
});

describe('admin/wt1 — module/lesson/exercise create + delete', () => {
  test('teacher can create a module + lesson + exercise; admin can delete', async () => {
    const t = await createTeacher();
    const admin = await createAdmin();

    const m = await request(app).post('/api/admin/wt1/modules').set(bearer(t))
      .send({ code: 'T1-DBGM2', order: 9, title: 'M2 debug' });
    expect(m.status).toBe(201);

    const l = await request(app).post('/api/admin/wt1/lessons').set(bearer(t))
      .send({ code: 'T1-DBGL2', moduleCode: 'T1-DBGM2', order: 1, title: 'L2 debug', published: true });
    expect(l.status).toBe(201);

    const e = await request(app).post('/api/admin/wt1/exercises').set(bearer(t))
      .send({ code: 'T1-DBGL2-E01', lessonCode: 'T1-DBGL2', order: 1, type: 'mcq', title: 'x', autoGrade: true,
        items: [{ id: 'q1', prompt: 'p', options: [{ id: 'A', text: 'a' }, { id: 'B', text: 'b' }], answer: 'A' }] });
    expect(e.status).toBe(201);

    // teacher cannot delete
    expect((await request(app).delete('/api/admin/wt1/exercises/T1-DBGL2-E01').set(bearer(t))).status).toBe(403);
    // admin can
    expect((await request(app).delete('/api/admin/wt1/exercises/T1-DBGL2-E01').set(bearer(admin))).status).toBe(200);
    expect((await request(app).delete('/api/admin/wt1/lessons/T1-DBGL2').set(bearer(admin))).status).toBe(200);
    const modId = m.body.module._id;
    expect((await request(app).delete(`/api/admin/wt1/modules/${modId}`).set(bearer(admin))).status).toBe(200);
  });

  test('validate rejects a broken gap_fill (marker/blank mismatch)', async () => {
    const t = await createTeacher();
    const res = await request(app).post('/api/admin/wt1/exercises').set(bearer(t)).send({
      code: 'T1-DBG-BAD', lessonCode: 'T1-DBGL', order: 3, type: 'gap_fill', title: 'bad', autoGrade: true,
      items: [{ id: 'q1', prompt: 'no marker here', blanks: [{ accept: ['x'] }] }],
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/marker/);
  });
});

// ─────────────────────── adv-sentence admin ───────────────────────
async function seedGroup() {
  return SentenceStructureGroup.create({
    code: 'grp-dbg-1', order: 1, week: 1, slotInWeek: 1,
    nameVi: 'Câu điều kiện', nameEn: 'Conditionals', emoji: '🔀',
    targetStructure: 'If + past, would + V', isActive: true,
    sentences: [
      { order: 1, promptVi: 'Nếu tôi giàu, tôi sẽ đi du lịch.', answerEn: 'If I were rich, I would travel.', altAnswers: ['If I was rich, I would travel.'], hintWords: ['if', 'travel'], structureNote: 'Type 2' },
      { order: 2, promptVi: 'Nếu trời mưa, tôi sẽ ở nhà.', answerEn: 'If it rained, I would stay home.', hintWords: ['if', 'stay home'] },
    ],
  });
}

describe('admin/adv-sentence — CRUD + sentence-bank round-trip', () => {
  test('teacher: list + detail', async () => {
    const t = await createTeacher();
    const g = await seedGroup();
    const list = await request(app).get('/api/admin/adv-sentence/groups').set(bearer(t));
    expect(list.status).toBe(200);
    const row = list.body.groups.find((x) => x.code === 'grp-dbg-1');
    expect(row.sentenceCount).toBe(2);
    const detail = await request(app).get(`/api/admin/adv-sentence/groups/${g._id}`).set(bearer(t));
    expect(detail.body.group.sentences).toHaveLength(2);
  });

  test('PUT .../sentences replaces the bank and keeps altAnswers + structureNote', async () => {
    const admin = await createAdmin();
    const g = await seedGroup();
    const detail = (await request(app).get(`/api/admin/adv-sentence/groups/${g._id}`).set(bearer(admin))).body.group;

    // mimic GroupModal.save(): map rows straight back
    const put = await request(app).put(`/api/admin/adv-sentence/groups/${g._id}/sentences`).set(bearer(admin))
      .send({ sentences: detail.sentences });
    expect(put.status).toBe(200);

    const after = (await request(app).get(`/api/admin/adv-sentence/groups/${g._id}`).set(bearer(admin))).body.group;
    expect(after.sentences).toHaveLength(2);
    expect(after.sentences[0].altAnswers).toEqual(['If I was rich, I would travel.']);
    expect(after.sentences[0].structureNote).toBe('Type 2');
  });

  test('teacher cannot delete a group; admin can', async () => {
    const t = await createTeacher();
    const admin = await createAdmin();
    const g = await seedGroup();
    expect((await request(app).delete(`/api/admin/adv-sentence/groups/${g._id}`).set(bearer(t))).status).toBe(403);
    expect((await request(app).delete(`/api/admin/adv-sentence/groups/${g._id}`).set(bearer(admin))).status).toBe(200);
  });
});
