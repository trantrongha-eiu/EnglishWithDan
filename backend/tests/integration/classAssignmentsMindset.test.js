// Mindset for IELTS lessons as class homework (mindset_course_lesson):
// a teacher (not only an admin) can pick them, the picker labels them by book
// / unit / lesson, and a lesson ticks only when every exercise is done, the
// quiz-style ones average ≥70% AND each Reading/Listening test linked from the
// lesson (practiceLinks) has a best attempt ≥70% (owner, 2026-11-13).
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createListeningSection, createPassage } = require('../factories/contentFactory');
const { createClassGroup, enrollStudent } = require('../factories/classFactory');
const WT1Lesson = require('../../models/WT1Lesson');
const WT1Module = require('../../models/WT1Module');
const WT1Progress = require('../../models/WT1Progress');
const WT1Exercise = require('../../models/WT1Exercise');
const ReadingPracticeAttempt = require('../../models/ReadingPracticeAttempt');
const ListeningPracticeAttempt = require('../../models/ListeningPracticeAttempt');

const authH = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

async function mindsetLesson() {
  await WT1Module.create({ code: 'M1-U03', courseCode: 'MINDSET-1', order: 3, title: 'Unit 3 · Giáo dục' });
  const passage = await createPassage();
  const section = await createListeningSection();
  const lesson = await WT1Lesson.create({
    code: 'M1-U03-L2', moduleCode: 'M1-U03', order: 2, title: '📖 Reading: multiple-choice questions', published: true,
    practiceLinks: [
      { kind: 'reading', title: 'Globalisation (Ex. 4, 7)', url: `/reading.html?passageId=${passage._id}&category=passage1&exam=practice`, step: 1 },
      { kind: 'listening', title: 'A talk (Ex. 9)', url: `/listening.html?sectionId=${section._id}&exam=practice`, step: 2 },
      { kind: 'grammar', title: 'Present Perfect', url: '/essential-grammar.html?lesson=present-perfect' },
    ],
  });
  await WT1Exercise.create({ code: 'M1-U03-L2-E01', lessonCode: 'M1-U03-L2', type: 'mcq', title: 'Which paragraph? (Ex. 4)', published: true });
  return { lesson, passage, section };
}

describe('mindset_course_lesson homework', () => {
  test('teacher picker: label "Mindset 1 · Unit 3 · Buổi 2 — …", meta = book · unit, searchable by those words', async () => {
    const t = await createTeacher();
    await mindsetLesson();
    const all = await request(app).get('/api/classes/resources/catalog?type=mindset_course_lesson').set(authH(t));
    expect(all.status).toBe(200);
    const row = all.body.items.find((r) => r.resourceCode === 'M1-U03-L2');
    expect(row.label).toBe('Mindset 1 · Unit 3 · Buổi 2 — 📖 Reading: multiple-choice questions');
    expect(row.meta).toBe('Mindset 1 · Unit 3');
    const hit = await request(app).get('/api/classes/resources/catalog?type=mindset_course_lesson&search=mindset%201%20unit%203').set(authH(t));
    expect(hit.body.items.map((r) => r.resourceCode)).toEqual(['M1-U03-L2']);
    const miss = await request(app).get('/api/classes/resources/catalog?type=mindset_course_lesson&search=mindset%200').set(authH(t));
    expect(miss.body.items).toHaveLength(0);
  });

  test('ticks only when exercises ≥70% AND every Reading/Listening test ≥70% (best attempt)', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await createClassGroup({ teacher: t });
    await enrollStudent(cls, s);
    const { lesson, passage, section } = await mindsetLesson();

    const made = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(t)).send({
      title: 'Mindset 1 · Unit 3', resources: [{ kind: 'internal', resourceType: 'mindset_course_lesson', resourceId: String(lesson._id) }],
    });
    expect(made.status).toBe(201);
    const asgId = String(made.body.assignment._id);
    const item = async () => (await request(app).get('/api/assignments/mine').set(authH(s))).body.assignments.find((a) => a._id === asgId);

    // every exercise done, quiz 90% — but the R/L tests not done yet
    await WT1Progress.create({ userId: s._id, courseCode: 'MINDSET-1', lessonCode: 'M1-U03-L2', completedAt: new Date(), objectiveScorePercent: 90 });
    expect((await item()).status).not.toBe('completed');

    // reading 80%, listening 60% → still not ticked
    await ReadingPracticeAttempt.create({ userId: s._id, passageId: passage._id, totalQuestions: 10, correctCount: 8, status: 'completed' });
    await ListeningPracticeAttempt.create({ userId: s._id, sectionId: section._id, totalQuestions: 10, correctCount: 6, status: 'completed' });
    const mid = await item();
    expect(mid.status).not.toBe('completed');

    // a retry at 70% → ticked (best attempt counts)
    await ListeningPracticeAttempt.create({ userId: s._id, sectionId: section._id, totalQuestions: 10, correctCount: 7, status: 'completed' });
    expect((await item()).status).toBe('completed');
  });

  test('lesson page returns each Reading/Listening link with the student\'s best result', async () => {
    const s = await createStudent({ plan: 'premium' });
    const { passage } = await mindsetLesson();
    await ReadingPracticeAttempt.create({ userId: s._id, passageId: passage._id, totalQuestions: 5, correctCount: 2, status: 'completed' });
    await ReadingPracticeAttempt.create({ userId: s._id, passageId: passage._id, totalQuestions: 5, correctCount: 4, status: 'completed' });
    const wt1Service = require('../../services/wt1Service');
    const data = await wt1Service.getLesson('M1-U03-L2', s._id, { staff: true });
    const [reading, listening, grammar] = data.lesson.practiceLinks;
    expect(reading.result).toMatchObject({ correct: 4, total: 5, percent: 80, attempts: 2 });
    expect(reading.step).toBe(1);
    expect(listening.result).toBeNull();
    expect(grammar.result).toBeUndefined();
  });
});
