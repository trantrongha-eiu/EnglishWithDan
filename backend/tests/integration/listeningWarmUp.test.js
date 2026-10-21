// Pre-listening warm-up: students get the prompts inside the practice fetch,
// never the answer key; the key is teacher/admin-only.
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

async function sectionWithWarmUp() {
  return createListeningSection({ extra: { transcript: 'They spend so long marking.', warmUp } });
}

describe('Listening warm-up', () => {
  test('a student sees the warm-up prompts without any answer', async () => {
    const s = await sectionWithWarmUp();
    const token = signTokenFor(await createPremiumStudent());
    const res = await request(app).get(`/api/listening/practice/by-id/${s._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.section.warmUp).toEqual({
      synonyms: [{ keyword: 'save time' }],
      paraphrases: [{ question: 'a way for tutors to save time', evidence: 'spend so long ____' }],
    });
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

    const put = await request(app).put(`/api/admin/listening/sections/${s._id}/warmup`).set('Authorization', `Bearer ${token}`)
      .send({ synonyms: [{ keyword: 'useful', answer: 'beneficial' }], paraphrases: [] });
    expect(put.status).toBe(200);
    const saved = await ListeningSection.findById(s._id).select('+warmUp').lean();
    expect(saved.warmUp.synonyms).toEqual([{ keyword: 'useful', answer: 'beneficial' }]);
    expect(saved.warmUp.paraphrases).toEqual([]);
    expect(saved.warmUp.editedAt).toBeTruthy();
  });

  test('a section without a warm-up returns warmUp: null', async () => {
    const s = await createListeningSection();
    const token = signTokenFor(await createPremiumStudent());
    const res = await request(app).get(`/api/listening/practice/by-id/${s._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.section.warmUp).toBeNull();
  });
});
