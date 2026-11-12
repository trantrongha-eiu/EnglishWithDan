// Mindset courses (MINDSET-0 …) on the WT1 stack: lessons carry vocabSave /
// practiceLinks / images, and the course's own Reading passages / Listening
// sections (courseRef set) open by id but never show up in the IELTS
// practice lists (utils/courseContent.js NOT_COURSE).
const request = require('supertest');
const app = require('../../app');
const { createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const WT1Course = require('../../models/WT1Course');
const WT1Module = require('../../models/WT1Module');
const WT1Lesson = require('../../models/WT1Lesson');
const WT1Exercise = require('../../models/WT1Exercise');
const Passage = require('../../models/Passage');
const ListeningSection = require('../../models/ListeningSection');

const bearer = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

beforeEach(async () => {
  await WT1Course.findOneAndUpdate({ code: 'MINDSET-0' }, { code: 'MINDSET-0', title: 'Mindset Foundation' }, { upsert: true });
  await WT1Module.findOneAndUpdate({ code: 'M0-U01' }, { code: 'M0-U01', courseCode: 'MINDSET-0', order: 1, title: 'Unit 1' }, { upsert: true });
  await WT1Lesson.findOneAndUpdate({ code: 'M0-U01-L1' }, {
    code: 'M0-U01-L1', moduleCode: 'M0-U01', order: 1, title: 'Vocab', published: true,
    vocabSave: { slot: 1, title: 'Unit 1', words: [{ word: 'get up', meaning: 'thức dậy', example: 'I get up at 7.' }] },
    practiceLinks: [{ kind: 'grammar', title: 'Present Simple', url: '/essential-grammar.html?lesson=present-simple' }],
    images: [{ url: 'https://example.com/a.jpg', caption: 'Lead-in' }],
  }, { upsert: true });
  await WT1Exercise.deleteMany({ lessonCode: 'M0-U01-L1' });
  await WT1Exercise.create({
    code: 'M0-U01-L1-E01', lessonCode: 'M0-U01-L1', order: 1, type: 'mcq', title: 'x', published: true, autoGrade: true,
    stimulus: { kind: 'passage', text: 'Para one.\n\nPara two.' },
    items: [{ id: 'q1', prompt: 'p', options: [{ id: 'A', text: 'a' }, { id: 'B', text: 'b' }], answer: 'A' }],
  });
});

describe('Mindset course on the WT1 stack', () => {
  test('overview?course=MINDSET-0 lists only Mindset units', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).get('/api/wt1/overview?course=MINDSET-0').set(bearer(u));
    expect(res.status).toBe(200);
    expect(res.body.course.code).toBe('MINDSET-0');
    expect(res.body.modules.map((m) => m.code)).toEqual(['M0-U01']);
  });

  test('lesson returns vocabSave, practiceLinks, images and the passage stimulus', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).get('/api/wt1/lesson/M0-U01-L1').set(bearer(u));
    expect(res.status).toBe(200);
    expect(res.body.lesson.vocabSave.slot).toBe(1);
    expect(res.body.lesson.vocabSave.words[0].word).toBe('get up');
    expect(res.body.lesson.practiceLinks[0].url).toContain('present-simple');
    expect(res.body.lesson.images[0].caption).toBe('Lead-in');
    expect(res.body.exercises[0].stimulus.kind).toBe('passage');
    expect(res.body.exercises[0].stimulus.text).toContain('Para two.');
  });
});

describe('course passages / sections stay out of the IELTS practice lists', () => {
  beforeEach(async () => {
    await Passage.deleteMany({});
    await ListeningSection.deleteMany({});
    await Passage.create([
      { title: 'IELTS passage', category: 'passage1', content: '<p>x</p>', questionRange: { start: 1, end: 13 }, isActive: true },
      { title: 'Mindset passage', category: 'passage1', content: '<p>y</p>', questionRange: { start: 1, end: 7 }, isActive: true, courseRef: 'M0-U01-R1' },
    ]);
    await ListeningSection.create([
      { partNumber: 1, title: 'IELTS section', isActive: true, questionRange: { start: 1, end: 10 } },
      { partNumber: 1, title: 'Mindset section', isActive: true, questionRange: { start: 1, end: 7 }, courseRef: 'M0-U01-L1' },
    ]);
  });

  test('reading practice list excludes the course passage', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).get('/api/reading/practice/list?category=all').set(bearer(u));
    expect(res.status).toBe(200);
    const titles = JSON.stringify(res.body);
    expect(titles).toContain('IELTS passage');
    expect(titles).not.toContain('Mindset passage');
  });

  test('listening practice list excludes the course section', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).get('/api/listening/practice/list?part=1').set(bearer(u));
    expect(res.status).toBe(200);
    const titles = JSON.stringify(res.body);
    expect(titles).toContain('IELTS section');
    expect(titles).not.toContain('Mindset section');
  });

  test('the course passage still opens by id', async () => {
    const u = await createPremiumStudent();
    const p = await Passage.findOne({ courseRef: 'M0-U01-R1' }).lean();
    const res = await request(app).get('/api/reading/practice/by-id/' + p._id).set(bearer(u));
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).toContain('Mindset passage');
  });
});
