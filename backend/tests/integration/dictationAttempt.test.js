// Regression coverage for dictation.html actually reaching the server: it
// previously never sent anything to the backend at all (student-reported
// bug — dictation practice never showed up in admin's "Lịch sử làm bài").
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createListeningSection } = require('../factories/contentFactory');
const DictationAttempt = require('../../models/DictationAttempt');
const AttemptReview = require('../../models/AttemptReview');
const User = require('../../models/User');
const { getVNDay } = require('../../utils/streak');

describe('POST /api/listening/dictation/save-attempt', () => {
  test('counts for the streak (and 🔥) only when at least 5 sentences are saved', async () => {
    const yesterday = getVNDay(new Date(Date.now() - 864e5));
    const student = await createStudent({ extra: { learningStreak: 20, lastActivityDate: yesterday } });
    const section = await createListeningSection({ title: 'Part 1' });
    const save = (n) => request(app)
      .post('/api/listening/dictation/save-attempt')
      .set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({
        sectionId: section._id,
        answers: Array.from({ length: n }, (_, i) => ({ sentenceIndex: i, isCorrect: true, matchedWords: 5, totalWords: 5 })),
      });

    expect((await save(4)).status).toBe(200);
    expect((await User.findById(student._id).lean()).lastActivityDate.getTime()).toBe(yesterday.getTime());

    expect((await save(5)).status).toBe(200);
    const u = await User.findById(student._id).lean();
    expect(u.lastActivityDate.getTime()).toBe(getVNDay(new Date()).getTime());
    // 5/5 correct = 100% → drill tier +2 🔥.
    expect(u.learningStreak).toBe(22);

    // Saving the same section again the same day earns nothing new.
    expect((await save(6)).status).toBe(200);
    expect((await User.findById(student._id).lean()).learningStreak).toBe(22);
  });

  test('saves the session and never creates a mandatory-review record', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const section = await createListeningSection({ title: 'Part 3 — Campus Tour' });

    const res = await request(app)
      .post('/api/listening/dictation/save-attempt')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sectionId: section._id,
        sectionTitle: section.title,
        partNumber: section.partNumber,
        answers: [
          { sentenceIndex: 0, isCorrect: true, matchedWords: 8, totalWords: 8 },
          { sentenceIndex: 1, isCorrect: false, matchedWords: 5, totalWords: 9 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.correctCount).toBe(1);
    expect(res.body.totalSentences).toBe(2);

    const saved = await DictationAttempt.findOne({ userId: student._id });
    expect(saved).not.toBeNull();
    expect(saved.sectionTitle).toBe('Part 3 — Campus Tour');
    expect(saved.correctCount).toBe(1);
    expect(saved.totalSentences).toBe(2);

    // Dictation is deliberately exempt from the mandatory-review gate
    // (routes/listening.js's ?purpose=dictation) — saving an attempt must
    // never create a pending review the student would then be blocked on.
    const reviewCount = await AttemptReview.countDocuments({ userId: student._id });
    expect(reviewCount).toBe(0);
  });

  test('re-checking the same sentence overwrites its earlier result instead of duplicating it', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const section = await createListeningSection();

    const base = { sectionId: section._id, sectionTitle: section.title, partNumber: section.partNumber };
    await request(app).post('/api/listening/dictation/save-attempt').set('Authorization', `Bearer ${token}`)
      .send({ ...base, answers: [{ sentenceIndex: 0, isCorrect: false, matchedWords: 3, totalWords: 8 }] });

    // Frontend sends the whole session's answers array on every save
    // (dictSessionAnswers is deduped client-side by sentenceIndex) — a
    // second, corrected attempt at the same sentence produces a NEW
    // DictationAttempt row (each save is its own session/visit), but its
    // own row must reflect only the final result for that sentence.
    const res = await request(app).post('/api/listening/dictation/save-attempt').set('Authorization', `Bearer ${token}`)
      .send({ ...base, answers: [{ sentenceIndex: 0, isCorrect: true, matchedWords: 8, totalWords: 8 }] });

    expect(res.status).toBe(200);
    expect(res.body.correctCount).toBe(1);
    const rows = await DictationAttempt.find({ userId: student._id }).sort({ createdAt: 1 });
    expect(rows).toHaveLength(2);
    expect(rows[1].answers[0].isCorrect).toBe(true);
  });

  test('rejects a request with no answers or an unknown section', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);

    const noAnswers = await request(app).post('/api/listening/dictation/save-attempt')
      .set('Authorization', `Bearer ${token}`).send({ sectionId: '000000000000000000000000', answers: [] });
    expect(noAnswers.status).toBe(400);

    const unknownSection = await request(app).post('/api/listening/dictation/save-attempt')
      .set('Authorization', `Bearer ${token}`)
      .send({ sectionId: '000000000000000000000000', answers: [{ sentenceIndex: 0, isCorrect: true, matchedWords: 1, totalWords: 1 }] });
    expect(unknownSection.status).toBe(404);
  });
});

describe('GET /api/admin/recent-attempts — Dictation', () => {
  test('includes a saved dictation attempt', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const token = signTokenFor(teacher);
    const section = await createListeningSection({ title: 'Part 2 — Museum Tour', partNumber: 2 });

    await DictationAttempt.create({
      userId: student._id, sectionId: section._id, sectionTitle: section.title, partNumber: 2,
      answers: [{ sentenceIndex: 0, isCorrect: true, matchedWords: 6, totalWords: 6 }],
      totalSentences: 1, correctCount: 1,
    });

    const res = await request(app)
      .get('/api/admin/recent-attempts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const rows = res.body.attempts.filter(a => a.skill === 'dictation');
    expect(rows).toHaveLength(1);
    expect(rows[0].testName).toBe('Part 2 — Museum Tour');
    expect(rows[0].correctCount).toBe(1);
    expect(rows[0].totalQuestions).toBe(1);
  });
});

describe('DELETE /api/admin/dictation-attempts/:id', () => {
  test('removes the attempt', async () => {
    const admin = await createAdmin();
    const student = await createStudent();
    const token = signTokenFor(admin);
    const section = await createListeningSection();
    const attempt = await DictationAttempt.create({
      userId: student._id, sectionId: section._id, sectionTitle: section.title, partNumber: 1,
      answers: [{ sentenceIndex: 0, isCorrect: true, matchedWords: 1, totalWords: 1 }],
      totalSentences: 1, correctCount: 1,
    });

    const res = await request(app)
      .delete(`/api/admin/dictation-attempts/${attempt._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(await DictationAttempt.findById(attempt._id)).toBeNull();
  });
});
