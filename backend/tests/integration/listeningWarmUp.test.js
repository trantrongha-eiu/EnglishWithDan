// Pre-listening warm-up: an optional mode (GET /api/listening/warmup/section/:id)
// that gives students the prompts + transcript, never the answer key; the key
// is teacher/admin-only.
const request = require('supertest');
const app = require('../../app');
const ListeningSection = require('../../models/ListeningSection');
const { createPremiumStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createListeningSection } = require('../factories/contentFactory');

const warmUp = {
  synonyms: [{ keyword: 'save time', answer: 'SECRET_SYN_ANSWER' }],
  paraphrases: [{ question: 'a way for tutors to save time', evidence: 'spend so long ____', answer: 'SECRET_PARA_ANSWER' }],
  generatedAt: new Date(),
};

async function sectionWithWarmUp({ published = true } = {}) {
  return createListeningSection({ extra: { transcript: 'They spend so long marking.', warmUp, warmUpPublished: published } });
}

describe('Listening warm-up', () => {
  test('a student gets the warm-up prompts and transcript without any answer', async () => {
    const s = await sectionWithWarmUp();
    const token = signTokenFor(await createPremiumStudent());
    const res = await request(app).get(`/api/listening/warmup/section/${s._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.section.transcript).toBe('They spend so long marking.');
    expect(res.body.section.warmUp).toEqual({
      synonyms: [{ keyword: 'save time' }],
      paraphrases: [{ question: 'a way for tutors to save time', evidence: 'spend so long ____' }],
    });
    expect(JSON.stringify(res.body)).not.toMatch(/SECRET_/);
  });

  test('an unpublished (Chờ duyệt) warm-up is not available to students', async () => {
    const s = await sectionWithWarmUp({ published: false });
    const token = signTokenFor(await createPremiumStudent());
    const res = await request(app).get(`/api/listening/warmup/section/${s._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('the practice list flags which sections have a published warm-up', async () => {
    const pub = await sectionWithWarmUp();
    const unpub = await sectionWithWarmUp({ published: false });
    const token = signTokenFor(await createPremiumStudent());
    const res = await request(app).get('/api/listening/practice/list?part=1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const flag = (id) => res.body.sections.find((x) => x._id === String(id)).hasWarmUp;
    expect(flag(pub._id)).toBe(true);
    expect(flag(unpub._id)).toBe(false);
  });

  test('the practice fetch itself carries no warm-up', async () => {
    const s = await sectionWithWarmUp();
    const token = signTokenFor(await createPremiumStudent());
    const res = await request(app).get(`/api/listening/practice/by-id/${s._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.section.warmUp).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toMatch(/SECRET_/);
  });

  test('the admin list carries only the warm-up size and publish state, never the key', async () => {
    const s = await sectionWithWarmUp({ published: false });
    const token = signTokenFor(await createTeacher());
    const res = await request(app).get('/api/admin/listening/sections').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const row = res.body.sections.find((x) => x._id === String(s._id));
    expect(row.warmUpCount).toBe(2);
    expect(row.warmUpPublished).toBe(false);
    expect(JSON.stringify(res.body)).not.toMatch(/SECRET_/);
  });

  test('the answer key is not reachable by a student', async () => {
    const s = await sectionWithWarmUp();
    const token = signTokenFor(await createPremiumStudent());
    const res = await request(app).get(`/api/admin/listening/sections/${s._id}/warmup`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin section fetches do not carry the key by accident', async () => {
    const s = await sectionWithWarmUp();
    const token = signTokenFor(await createTeacher());
    const res = await request(app).get(`/api/admin/listening/sections/${s._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.section.warmUp).toBeUndefined();
  });

  test('a teacher reads and edits the key', async () => {
    const s = await sectionWithWarmUp();
    const token = signTokenFor(await createTeacher());
    const get = await request(app).get(`/api/admin/listening/sections/${s._id}/warmup`).set('Authorization', `Bearer ${token}`);
    expect(get.status).toBe(200);
    expect(get.body.warmUp.synonyms[0].answer).toBe('SECRET_SYN_ANSWER');
    expect(get.body.warmUp.published).toBe(true);

    // Saving without publish takes it back to "Chờ duyệt".
    const put = await request(app).put(`/api/admin/listening/sections/${s._id}/warmup`).set('Authorization', `Bearer ${token}`)
      .send({ synonyms: [{ keyword: 'useful', answer: 'beneficial' }], paraphrases: [] });
    expect(put.status).toBe(200);
    expect(put.body.warmUp.published).toBe(false);
    const saved = await ListeningSection.findById(s._id).select('+warmUp').lean();
    expect(saved.warmUp.synonyms).toEqual([{ keyword: 'useful', answer: 'beneficial' }]);
    expect(saved.warmUp.paraphrases).toEqual([]);
    expect(saved.warmUp.editedAt).toBeTruthy();
    expect(saved.warmUpPublished).toBe(false);

    const pub = await request(app).put(`/api/admin/listening/sections/${s._id}/warmup`).set('Authorization', `Bearer ${token}`)
      .send({ synonyms: [{ keyword: 'useful', answer: 'beneficial' }], paraphrases: [], published: true });
    expect(pub.body.warmUp.published).toBe(true);
    expect((await ListeningSection.findById(s._id).lean()).warmUpPublished).toBe(true);

    // An empty warm-up can't be published.
    const empty = await request(app).put(`/api/admin/listening/sections/${s._id}/warmup`).set('Authorization', `Bearer ${token}`)
      .send({ synonyms: [], paraphrases: [], published: true });
    expect(empty.body.warmUp.published).toBe(false);
  });

  test('a section without a warm-up → 404 on the warm-up endpoint', async () => {
    const s = await createListeningSection();
    const token = signTokenFor(await createPremiumStudent());
    const res = await request(app).get(`/api/listening/warmup/section/${s._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
