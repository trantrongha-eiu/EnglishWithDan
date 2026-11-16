// task2PracticeService destructures { gradeT2Question } from geminiService at
// module load, so the module itself must be mocked (a jest.spyOn on the
// property wouldn't reach that already-captured reference). Auto-mock is
// safe here — the other describe blocks never call geminiService.
jest.mock('../../../services/geminiService');

const svc = require('../../../services/task2PracticeService');
const geminiService = require('../../../services/geminiService');
const Task2Topic = require('../../../models/Task2Topic');
const Task2Attempt = require('../../../models/Task2Attempt');
const WritingTask2 = require('../../../models/WritingTask2');
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

  test('never exposes the raw correctAnswer / modelAnswer keys before submission', async () => {
    const topic = await makeTopic();
    const { questions } = await svc.getTopicQuestions(topic._id.toString(), 'all');
    for (const q of questions) {
      expect(q.correctAnswer).toBeUndefined();
      expect(q.modelAnswer).toBeUndefined();
    }
  });

  test('exposes translationAnswer for the word-by-word typing drill (topic practice only)', async () => {
    const topic = await makeTopic();
    const { questions } = await svc.getTopicQuestions(topic._id.toString(), 'all');
    const t = questions.find(q => q.type === 'translation');
    const fb = questions.find(q => q.type === 'fill_blank');
    // Intentional, exercise-specific reveal: the "Dịch câu" drill validates
    // every typed character in real time, so the client needs the exact
    // sentence. Non-translation types must NOT get it.
    expect(t.translationAnswer).toBe('Many students study online.');
    expect(fb.translationAnswer).toBeUndefined();
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
      expect(q.translationAnswer).toBeUndefined();
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

describe('getTopicPracticeStats — "Viết bài ngay" gate data', () => {
  async function topic() {
    return Task2Topic.create({
      week: 1, block: 'advantages_disadvantages', orderIndex: 1,
      topicName: 'Gate Topic', essayType: 'advantages_disadvantages', prompt: 'p',
    });
  }

  test('reports not practised when there are no practice attempts', async () => {
    const t = await topic();
    const student = await createStudent();
    const stats = await svc.getTopicPracticeStats(student._id, t._id);
    expect(stats).toMatchObject({ practiced: false, attempts: 0, bestScore: 0 });
  });

  test('best score is the max across this user\'s practice sessions for the topic', async () => {
    const t = await topic();
    const student = await createStudent();
    await Task2Attempt.create({ userId: student._id, topicId: t._id, sessionType: 'practice', totalQuestions: 10, correctCount: 5, scorePercentage: 50 });
    await Task2Attempt.create({ userId: student._id, topicId: t._id, sessionType: 'practice', totalQuestions: 10, correctCount: 8, scorePercentage: 80 });
    // an exam session must NOT count toward the practice gate
    await Task2Attempt.create({ userId: student._id, topicId: t._id, sessionType: 'exam', totalQuestions: 10, correctCount: 10, scorePercentage: 100 });

    const stats = await svc.getTopicPracticeStats(student._id, t._id);
    expect(stats.practiced).toBe(true);
    expect(stats.attempts).toBe(2);
    expect(stats.bestScore).toBe(80);
    expect(stats.lastScore).toBe(80);
    expect(stats.cumulativeScore).toBe(65); // (5+8)/(10+10)
  });

  test('another user\'s attempts do not leak in', async () => {
    const t = await topic();
    const [me, other] = [await createStudent(), await createStudent()];
    await Task2Attempt.create({ userId: other._id, topicId: t._id, sessionType: 'practice', totalQuestions: 10, correctCount: 10, scorePercentage: 100 });
    const stats = await svc.getTopicPracticeStats(me._id, t._id);
    expect(stats.practiced).toBe(false);
  });
});

describe('listTopicsForWeek — self-healing "Viết bài ngay" essay link', () => {
  test('links an unlinked topic to an existing WritingTask2 matched by prompt', async () => {
    const wt = await WritingTask2.create({ prompt: 'Some people think X. Discuss.', instructions: 'x', isActive: true });
    const t = await Task2Topic.create({
      week: 3, block: 'advantages_disadvantages', orderIndex: 1, topicName: 'Reuse', essayType: 'advantages_disadvantages',
      prompt: '  some people think x. discuss.  ', // differs only in case / whitespace
    });

    const [out] = await svc.listTopicsForWeek(3);
    expect(String(out.writingTask2Id)).toBe(String(wt._id));
    // persisted, not just in the response
    const reloaded = await Task2Topic.findById(t._id).lean();
    expect(String(reloaded.writingTask2Id)).toBe(String(wt._id));
    // no duplicate WritingTask2 created
    expect(await WritingTask2.countDocuments()).toBe(1);
  });

  test('creates a WritingTask2 when no prompt matches, and is a no-op on the next call', async () => {
    const t = await Task2Topic.create({
      week: 4, block: 'advantages_disadvantages', orderIndex: 1, topicName: 'New', essayType: 'advantages_disadvantages',
      prompt: 'A brand new essay prompt with no match anywhere.',
    });
    await svc.listTopicsForWeek(4);
    const linkedId = (await Task2Topic.findById(t._id).lean()).writingTask2Id;
    expect(linkedId).toBeTruthy();
    expect(await WritingTask2.countDocuments()).toBe(1);

    await svc.listTopicsForWeek(4); // second load must not create another
    expect(await WritingTask2.countDocuments()).toBe(1);
    expect(String((await Task2Topic.findById(t._id).lean()).writingTask2Id)).toBe(String(linkedId));
  });
});

describe('"Tự viết kết bài" (short_writing)', () => {
  const MODEL = 'In conclusion, work pressure is the main cause, but counselling can help.';
  async function conclusionTopic(extra = {}) {
    return Task2Topic.create({
      week: 5, block: 'cause_solution', orderIndex: 1, topicName: 'Stress', essayType: 'cause_solution',
      prompt: 'What are the causes of stress, and what solutions can be implemented?',
      questions: [{
        questionId: 'c_q1', level: 'intermediate', orderIndex: 1, type: 'short_writing',
        questionText: 'Tự viết ĐOẠN KẾT BÀI', modelAnswer: MODEL,
        fallbackKeywords: ['in conclusion', 'to sum up', 'overall', 'therefore'],
      }],
      ...extra,
    });
  }
  const GOOD = 'In conclusion, work pressure and social media are the main causes of rising stress. If schools and employers provide accessible counselling, public mental well-being will improve significantly.';

  test('the model conclusion is never shipped to the client', async () => {
    const topic = await conclusionTopic();
    const { questions } = await svc.getTopicQuestions(String(topic._id), 'all');
    expect(questions[0].translationAnswer).toBeUndefined();
    expect(questions[0].modelAnswer).toBeUndefined();
  });

  test('AI grading gets the essay prompt and whether an opinion is required', async () => {
    geminiService.gradeT2Question.mockResolvedValue({ isCorrect: true, score: 90, feedbackVi: 'Tốt' });
    const topic = await conclusionTopic();
    const res = await svc.checkAnswer(String(topic._id), 'c_q1', GOOD);
    expect(res).toMatchObject({ aiGraded: true, isCorrect: true, modelAnswer: MODEL });
    expect(geminiService.gradeT2Question).toHaveBeenCalledWith(expect.objectContaining({
      type: 'short_writing', essayPrompt: topic.prompt, asksOpinion: false, userAnswer: GOOD,
    }));
  });

  test('without AI, a well-shaped conclusion passes (not the 4-keyword ratio)', async () => {
    geminiService.gradeT2Question.mockRejectedValue(new Error('down'));
    const topic = await conclusionTopic();
    const ok = await svc.checkAnswer(String(topic._id), 'c_q1', GOOD);
    expect(ok).toMatchObject({ aiGraded: false, isCorrect: true });
    const bad = await svc.checkAnswer(String(topic._id), 'c_q1', 'Stress is bad.');
    expect(bad.isCorrect).toBe(false);
    expect(bad.feedbackVi).toMatch(/In conclusion/);
  });

  test('conclusionAsksOpinion / gradeConclusionLocally', () => {
    expect(svc.conclusionAsksOpinion({ essayType: 'agree_disagree', prompt: '' })).toBe(true);
    expect(svc.conclusionAsksOpinion({ essayType: 'advantages_disadvantages', prompt: 'Do the advantages outweigh the disadvantages?' })).toBe(true);
    expect(svc.conclusionAsksOpinion({ essayType: 'cause_solution', prompt: 'What are the causes?' })).toBe(false);
    const opinionTopic = { essayType: 'agree_disagree', prompt: '' };
    expect(svc.gradeConclusionLocally(opinionTopic, GOOD).isCorrect).toBe(false);
    expect(svc.gradeConclusionLocally(opinionTopic, GOOD + ' Personally, I believe this approach is the best.').isCorrect).toBe(true);
  });
});

describe('scripts/trimTask2Redundant plan()', () => {
  const { plan, conclusionText } = require('../../../scripts/trimTask2Redundant');
  const q = (id, type, text, ans, order) => ({ _id: id, type, questionText: text, correctAnswer: ans, orderIndex: order });
  test('drops the KẾT BÀI copy and the near-duplicate without a key phrase; rewords the conclusion task', () => {
    const topic = { prompt: 'P?', questions: [
      q('a', 'translation', 'Dịch câu sau:\n\n"x"', 'A high salary helps provide financial security for workers.', 1),
      q('b', 'translation', 'Dịch sang tiếng Anh (dùng từ "financial security"):\n\n"x"', 'A high salary helps provide financial security for workers.', 2),
      q('c', 'translation', 'Dịch câu sau:\n\n"y"', 'Remote work is popular.', 3),
      q('d', 'translation', 'Dịch câu KẾT BÀI', 'In conclusion, it helps.', 4),
      q('e', 'short_writing', 'Viết kết bài', 'In conclusion, it helps.', 5),
    ] };
    const { off, reword } = plan(topic);
    expect([...off.keys()].sort()).toEqual(['a', 'd']);
    expect(reword.map(x => x._id)).toEqual(['e']);
    expect(conclusionText('P?')).toMatch(/câu điều kiện loại 1 hoặc loại 2/);
  });
});

describe('scripts/seedTask2SampleSentences buildQuestions()', () => {
  const { buildQuestions } = require('../../../scripts/seedTask2SampleSentences');
  const sample = [
    { title: 'Introduction', content: 'In recent years, stress has become an increasingly serious problem. This essay will explore it.' },
    { title: 'Body 1', content: 'There are several underlying factors contributing to stress.  One of the main reasons is work.',
      highlights: [{ role: 'topic', text: 'There are several underlying factors contributing to stress.' }] },
    { title: 'Body 2', content: 'Nevertheless, several practical measures can be taken.' },
    { title: 'Conclusion', content: 'In conclusion, …' }
  ];
  const entry = (sentences) => ({ prefix: 'x_d', sentences });

  test('builds tagged translation questions in essay order from Daniel\'s sentences', () => {
    const qs = buildQuestions(entry([
      { sec: 'intro', key: 'an increasingly serious problem', en: 'In recent years, stress has become an increasingly serious problem.', vi: 'Gần đây…' },
      { sec: 'body1', key: 'underlying factors contributing to', en: 'There are several underlying factors contributing to stress.', vi: 'Có nhiều…' },
      { sec: 'body2', en: 'Nevertheless, several practical measures can be taken.', vi: 'Tuy nhiên…' },
    ]), sample);
    expect(qs.map(q => q.questionId)).toEqual(['x_d01', 'x_d02', 'x_d03']);
    expect(qs[0].questionText).toBe('MỞ BÀI · Dịch câu trong bài mẫu (dùng cấu trúc "an increasingly serious problem"):\n\n"Gần đây…"');
    expect(qs[1].explanationVi).toMatch(/THÂN BÀI 1 · câu chủ đề của đoạn/);
    expect(qs[2].questionText.startsWith('THÂN BÀI 2 · Dịch câu trong bài mẫu:')).toBe(true);
    expect(qs.every(q => q.type === 'translation' && q.correctAnswer === q.modelAnswer)).toBe(true);
  });

  test('refuses a sentence that is not in the sample, or a key not in the sentence', () => {
    expect(() => buildQuestions(entry([{ sec: 'body1', en: 'Invented sentence.', vi: 'x' }]), sample)).toThrow(/not in Daniel/);
    expect(() => buildQuestions(entry([{ sec: 'body1', key: 'nope', en: 'One of the main reasons is work.', vi: 'x' }]), sample)).toThrow(/key "nope"/);
  });
});

describe('retired questions (isActive:false)', () => {
  test('are never served in topic practice or Thi thử, but can still be checked', async () => {
    const topic = await Task2Topic.create({
      week: 3, block: 'cause_solution', orderIndex: 1, topicName: 'Retired', essayType: 'cause_solution', prompt: 'p',
      questions: [
        { questionId: 'r1', level: 'beginner', orderIndex: 1, type: 'fill_blank', questionText: 'A', correctAnswer: 'a' },
        { questionId: 'r2', level: 'beginner', orderIndex: 2, type: 'fill_blank', questionText: 'B', correctAnswer: 'b', isActive: false },
      ],
    });
    const { questions } = await svc.getTopicQuestions(String(topic._id), 'all');
    expect(questions.map(q => q.questionId)).toEqual(['r1']);
    const exam = await svc.getExam({ week: 3, level: 'all', count: 10 });
    expect(exam.questions.map(q => q.questionId)).not.toContain('r2');
    expect((await svc.checkAnswer(String(topic._id), 'r2', 'b')).isCorrect).toBe(true);
  });
});
