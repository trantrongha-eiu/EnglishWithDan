// Admin "Lịch sử làm bài" → click a row → see what the student answered.
//  - GET /api/admin/attempt-detail/:skill/:id (routes/admin/attemptDetail.js)
//  - staff may open any student's Reading/Listening "bài lẻ" review
//    (GET /api/reading|listening/practice/history/:id), students only their own.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const {
  createListeningSection, createTask1Exercise, createPassage, createReadingPracticeAttempt,
} = require('../factories/contentFactory');
const GapFillAttempt = require('../../models/GapFillAttempt');
const DictationAttempt = require('../../models/DictationAttempt');
const Task1Attempt = require('../../models/Task1Attempt');
const EssentialGrammarAttemptLog = require('../../models/EssentialGrammarAttemptLog');
const ListeningPracticeAttempt = require('../../models/ListeningPracticeAttempt');

const get = (path, user) => request(app).get(path).set('Authorization', `Bearer ${signTokenFor(user)}`);

describe('GET /api/admin/attempt-detail/:skill/:id', () => {
  test('gap-fill: every blank with the answer key', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const section = await createListeningSection({ extra: { gapFillAnswers: ['river', 'bridge'] } });
    const a = await GapFillAttempt.create({
      userId: student._id, sectionId: section._id, sectionTitle: 'Walk',
      answers: [{ blankIndex: 0, userAnswer: 'river', isCorrect: true }, { blankIndex: 1, userAnswer: 'brige', isCorrect: false }],
      totalBlanks: 2, correctCount: 1,
    });
    const res = await get(`/api/admin/attempt-detail/listening-gapfill/${a._id}`, teacher);
    expect(res.status).toBe(200);
    expect(res.body.detail.title).toBe('Walk');
    expect(res.body.detail.items).toEqual([
      expect.objectContaining({ answer: 'river', correct: true, correctAnswer: 'river' }),
      expect.objectContaining({ answer: 'brige', correct: false, correctAnswer: 'bridge' }),
    ]);
  });

  test('dictation: sentence text from the section', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const section = await createListeningSection({ extra: { dictationSentences: [{ text: 'Hello there.', start: 0, end: 1 }] } });
    const a = await DictationAttempt.create({
      userId: student._id, sectionId: section._id,
      answers: [{ sentenceIndex: 0, isCorrect: false, matchedWords: 1, totalWords: 2 }],
      totalSentences: 1, correctCount: 0,
    });
    const res = await get(`/api/admin/attempt-detail/dictation/${a._id}`, teacher);
    expect(res.status).toBe(200);
    expect(res.body.detail.items[0]).toEqual(expect.objectContaining({ prompt: 'Hello there.', answer: '1/2 từ khớp', correct: false }));
  });

  test('task1-practice: the whole session, not just the one row doc', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const other = await createStudent();
    const ex = await createTask1Exercise({ instruction: 'Fill in', extra: { primaryAnswer: 'rose sharply' } });
    const first = await Task1Attempt.create({ userId: student._id, exerciseId: ex._id, userAnswer: 'rose sharp', isCorrect: false, sessionId: 's1' });
    await Task1Attempt.create({ userId: student._id, exerciseId: ex._id, userAnswer: 'rose sharply', isCorrect: true, sessionId: 's1' });
    await Task1Attempt.create({ userId: student._id, exerciseId: ex._id, userAnswer: 'x', isCorrect: false, sessionId: 's2' });
    await Task1Attempt.create({ userId: other._id, exerciseId: ex._id, userAnswer: 'y', isCorrect: false, sessionId: 's1' });
    const res = await get(`/api/admin/attempt-detail/task1-practice/${first._id}`, teacher);
    expect(res.status).toBe(200);
    expect(res.body.detail.items.map(i => i.answer).sort()).toEqual(['rose sharp', 'rose sharply']);
    expect(res.body.detail.items[0].correctAnswer).toBe('rose sharply');
  });

  test('essential-grammar: per-question answers', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const a = await EssentialGrammarAttemptLog.create({
      userId: student._id, lessonId: '507f1f77bcf86cd799439011', score: 50, correct: 1, wrong: 1, total: 2,
      answers: [
        { ref: 'q:0:0', question: 'She ___ home.', chosen: 1, chosenText: 'go', correctIndex: 0, correctText: 'goes', isCorrect: false },
        { ref: 'q:0:1', question: 'They ___ here.', chosen: 0, chosenText: 'are', correctIndex: 0, correctText: 'are', isCorrect: true },
      ],
    });
    const res = await get(`/api/admin/attempt-detail/essential-grammar/${a._id}`, teacher);
    expect(res.status).toBe(200);
    expect(res.body.detail.items[0]).toEqual(expect.objectContaining({ prompt: 'She ___ home.', answer: 'go', correct: false, correctAnswer: 'goes' }));
  });

  test('students are refused; unknown skill → 400; missing → 404', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const a = await GapFillAttempt.create({ userId: student._id, sectionId: '507f1f77bcf86cd799439011', totalBlanks: 1, correctCount: 0 });
    expect((await get(`/api/admin/attempt-detail/listening-gapfill/${a._id}`, student)).status).toBe(403);
    expect((await get(`/api/admin/attempt-detail/constructor/${a._id}`, teacher)).status).toBe(400);
    expect((await get('/api/admin/attempt-detail/dictation/507f1f77bcf86cd799439099', teacher)).status).toBe(404);
  });
});

describe('practice history detail — staff may open any student\'s attempt', () => {
  test('reading bài lẻ', async () => {
    const teacher = await createTeacher();
    const owner = await createStudent();
    const stranger = await createStudent();
    const passage = await createPassage();
    const a = await createReadingPracticeAttempt({ userId: owner._id, passageId: passage._id });
    expect((await get(`/api/reading/practice/history/${a._id}`, teacher)).status).toBe(200);
    expect((await get(`/api/reading/practice/history/${a._id}`, owner)).status).toBe(200);
    expect((await get(`/api/reading/practice/history/${a._id}`, stranger)).status).toBe(404);
  });

  test('listening bài lẻ', async () => {
    const teacher = await createTeacher();
    const owner = await createStudent();
    const stranger = await createStudent();
    const section = await createListeningSection();
    const a = await ListeningPracticeAttempt.create({ userId: owner._id, sectionId: section._id, answers: [], totalQuestions: 1 });
    expect((await get(`/api/listening/practice/history/${a._id}`, teacher)).status).toBe(200);
    expect((await get(`/api/listening/practice/history/${a._id}`, stranger)).status).toBe(404);
  });
});
