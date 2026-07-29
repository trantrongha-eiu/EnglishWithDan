const svc = require('../../../services/task2PracticeService');
const Task2Topic = require('../../../models/Task2Topic');
const Task2Attempt = require('../../../models/Task2Attempt');
const { createStudent } = require('../../factories/userFactory');

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
