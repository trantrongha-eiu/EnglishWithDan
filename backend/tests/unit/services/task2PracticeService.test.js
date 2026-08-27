// task2PracticeService destructures { gradeT2Question } from geminiService at
// module load, so the module itself must be mocked (a jest.spyOn on the
// property wouldn't reach that already-captured reference). Auto-mock is
// safe here — the other describe blocks never call geminiService.
jest.mock('../../../services/geminiService');

const svc = require('../../../services/task2PracticeService');
const geminiService = require('../../../services/geminiService');
const Task2Topic = require('../../../models/Task2Topic');
const Task2Attempt = require('../../../models/Task2Attempt');
const { createStudent } = require('../../factories/userFactory');

afterEach(() => jest.clearAllMocks());

describe('saveAttempt', () => {
  // Regression test for the bug where every practice session saved as
  // 0/0 in admin history: saveAttempt's server-side re-verification map
  // was keyed only by q._id, but the frontend sends q.questionId (the
  // stable seed-defined string like "w1t1_q02"), which every real
  // question has — so the map lookup never matched and every submitted
  // answer was silently dropped.
  test('counts questions submitted by their questionId string, not just Mongo _id', async () => {
    const topic = await Task2Topic.create({
      week: 1, block: 'advantages_disadvantages', orderIndex: 1,
      topicName: 'Test Topic', essayType: 'advantages_disadvantages',
      prompt: 'Test prompt',
      questions: [
        { questionId: 'w1t1_q01', level: 'beginner', orderIndex: 1, type: 'fill_blank', questionText: 'Fill it', correctAnswer: 'years' },
        { questionId: 'w1t1_q02', level: 'beginner', orderIndex: 2, type: 'fill_blank', questionText: 'Fill it too', correctAnswer: 'months' },
      ],
    });

    const student = await createStudent();
    const attempt = await svc.saveAttempt(student._id, {
      sessionType: 'practice',
      week: 1,
      topicId: topic._id.toString(),
      topicName: topic.topicName,
      level: 'beginner',
      questionsAttempted: [
        { questionId: 'w1t1_q01', userAnswer: 'years' },   // correct
        { questionId: 'w1t1_q02', userAnswer: 'wrong' },   // incorrect
      ],
      totalQuestions: 2,
      correctCount: 1,
    });

    expect(attempt.totalQuestions).toBe(2);
    expect(attempt.correctCount).toBe(1);

    const saved = await Task2Attempt.findById(attempt._id).lean();
    expect(saved.totalQuestions).toBe(2);
    expect(saved.correctCount).toBe(1);
  });
});

describe('getTopicQuestions — answer-key stripping and word/letter hints', () => {
  async function makeTopic() {
    return Task2Topic.create({
      week: 2, block: 'cause_effect', orderIndex: 1,
      topicName: 'Hint Topic', essayType: 'cause_effect',
      prompt: 'Test prompt',
      questions: [
        {
          questionId: 'q_translation', level: 'beginner', orderIndex: 1, type: 'translation',
          questionText: 'Dịch câu này', correctAnswer: 'Many students study online.',
          modelAnswer: 'Many students study online.',
        },
        {
          questionId: 'q_fillblank', level: 'beginner', orderIndex: 2, type: 'fill_blank',
          questionText: 'Fill it', correctAnswer: 'years',
        },
      ],
    });
  }

  test('never exposes correctAnswer or modelAnswer before submission', async () => {
    const topic = await makeTopic();
    const { questions } = await svc.getTopicQuestions(topic._id.toString(), 'all');
    for (const q of questions) {
      expect(q.correctAnswer).toBeUndefined();
      expect(q.modelAnswer).toBeUndefined();
    }
  });

  test('adds a word-count + first-letter hint for translation, derived from the answer but not revealing it', async () => {
    const topic = await makeTopic();
    const { questions } = await svc.getTopicQuestions(topic._id.toString(), 'all');
    const q = questions.find(q => q.type === 'translation');
    expect(q.answerWordCount).toBe(4); // "Many students study online."
    expect(q.answerLetterHint).toBe('M___ s_______ s____ o_____.');
    expect(q.answerLetterHint.toLowerCase()).not.toContain('many students study online');
  });

  test('does not add a hint for question types outside the hinted set (e.g. fill_blank)', async () => {
    const topic = await makeTopic();
    const { questions } = await svc.getTopicQuestions(topic._id.toString(), 'all');
    const q = questions.find(q => q.type === 'fill_blank');
    expect(q.answerWordCount).toBeUndefined();
    expect(q.answerLetterHint).toBeUndefined();
  });
});

describe('getExam — no answer-key or hints leaked, matches "no hints" exam design', () => {
  test('exam questions never carry answerWordCount/answerLetterHint even for translation', async () => {
    await Task2Topic.create({
      week: 3, block: 'cause_effect', orderIndex: 1,
      topicName: 'Exam Hint Topic', essayType: 'cause_effect',
      prompt: 'Test prompt',
      questions: [
        {
          questionId: 'q_translation', level: 'beginner', orderIndex: 1, type: 'translation',
          questionText: 'Dịch câu này', correctAnswer: 'Many students study online.',
          modelAnswer: 'Many students study online.',
        },
      ],
    });
    const { questions } = await svc.getExam({ week: 3, level: 'all', count: 10 });
    expect(questions.length).toBeGreaterThan(0);
    for (const q of questions) {
      expect(q.correctAnswer).toBeUndefined();
      expect(q.modelAnswer).toBeUndefined();
      expect(q.answerWordCount).toBeUndefined();
      expect(q.answerLetterHint).toBeUndefined();
    }
  });
});

describe('checkAnswer — AI grading timeout', () => {
  async function makeTranslationTopic() {
    return Task2Topic.create({
      week: 1, block: 'advantages_disadvantages', orderIndex: 1,
      topicName: 'AI Timeout Topic', essayType: 'advantages_disadvantages',
      prompt: 'Test prompt',
      questions: [{
        questionId: 't_q1', level: 'beginner', orderIndex: 1, type: 'translation',
        questionText: 'Dịch: Nhiều người học trực tuyến.',
        correctAnswer: 'Many people study online.',
        modelAnswer: 'Many people study online.',
        fallbackKeywords: ['many', 'people', 'study', 'online'],
      }],
    });
  }

  test('falls back to keyword grading when Gemini does not answer within the timeout', async () => {
    // Never resolves — stands in for an overloaded / very slow Gemini.
    geminiService.gradeT2Question.mockImplementation(() => new Promise(() => {}));

    const topic = await makeTranslationTopic();
    const q = topic.questions[0];

    const started = Date.now();
    const res = await svc.checkAnswer(String(topic._id), String(q._id), 'Many people study online.');
    const elapsed = Date.now() - started;

    expect(res.status).toBe('ok');
    expect(res.aiGraded).toBe(false);          // keyword fallback, not AI
    expect(res.isCorrect).toBe(true);          // keyword match still grades it right
    expect(elapsed).toBeLessThan(6500);        // returned on the ~5s timeout, not hung
  }, 15000);

  test('still uses the AI result when Gemini answers in time', async () => {
    geminiService.gradeT2Question.mockResolvedValue({
      isCorrect: true, score: 100, feedbackVi: 'Tốt',
    });

    const topic = await makeTranslationTopic();
    const q = topic.questions[0];
    const res = await svc.checkAnswer(String(topic._id), String(q._id), 'Many people study online.');

    expect(res.aiGraded).toBe(true);
    expect(res.score).toBe(100);
  });
});
