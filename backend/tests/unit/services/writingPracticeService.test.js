const mongoose = require('mongoose');
const svc = require('../../../services/writingPracticeService');
const WPExercise = require('../../../models/WPExercise');
const WritingPracticeAttempt = require('../../../models/WritingPracticeAttempt');
const { createStudent } = require('../../factories/userFactory');

// Audit finding (2026-08-02): the admin "Kết quả" list used to show one row
// per individual sentence a student answered, which made it unreadable for
// a class of any size. saveBatch() now waits for the client's buffered
// batch (flushed when the student switches topic/level or leaves) and
// collapses it into one row per (topic, level) with correct/total counts —
// "wait until the student finishes, then send correct/total for the topic".
function makeExercise(overrides = {}) {
  return WPExercise.create({
    topicKey: 'greetings', level: 'beginner', type: 'translation',
    question: 'Xin chào', sampleAnswer: 'Hello',
    ...overrides,
  });
}

describe('writingPracticeService.saveBatch — per-topic aggregation', () => {
  test('collapses multiple sentences from the same topic+level into one row with correct/total', async () => {
    const student = await createStudent();
    const ex1 = await makeExercise({ sampleAnswer: 'Hello' });
    const ex2 = await makeExercise({ sampleAnswer: 'Goodbye' });
    const ex3 = await makeExercise({ sampleAnswer: 'Thank you' });

    await svc.saveBatch(student._id, [
      { exerciseId: ex1._id, userAnswer: 'Hello' },       // correct
      { exerciseId: ex2._id, userAnswer: 'Goodbye' },     // correct
      { exerciseId: ex3._id, userAnswer: 'wrong answer' }, // wrong
    ]);

    const docs = await WritingPracticeAttempt.find({ studentId: student._id }).lean();
    expect(docs).toHaveLength(1);
    expect(docs[0].topic).toBe('greetings');
    expect(docs[0].level).toBe('beginner');
    expect(docs[0].totalItems).toBe(3);
    expect(docs[0].correctItems).toBe(2);
  });

  test('creates separate rows for different topics answered in the same flush ("Tất cả" filter)', async () => {
    const student = await createStudent();
    const exA = await makeExercise({ topicKey: 'greetings', sampleAnswer: 'Hello' });
    const exB = await makeExercise({ topicKey: 'shopping', sampleAnswer: 'How much?' });

    await svc.saveBatch(student._id, [
      { exerciseId: exA._id, userAnswer: 'Hello' },
      { exerciseId: exB._id, userAnswer: 'How much?' },
    ]);

    const docs = await WritingPracticeAttempt.find({ studentId: student._id }).lean();
    expect(docs).toHaveLength(2);
    const byTopic = Object.fromEntries(docs.map(d => [d.topic, d]));
    expect(byTopic.greetings.totalItems).toBe(1);
    expect(byTopic.shopping.totalItems).toBe(1);
  });

  test('skips answers for exercises that no longer exist without crashing', async () => {
    const student = await createStudent();
    const ex = await makeExercise({ sampleAnswer: 'Hello' });

    await svc.saveBatch(student._id, [
      { exerciseId: ex._id, userAnswer: 'Hello' },
      { exerciseId: new mongoose.Types.ObjectId(), userAnswer: 'ghost' },
    ]);

    const docs = await WritingPracticeAttempt.find({ studentId: student._id }).lean();
    expect(docs).toHaveLength(1);
    expect(docs[0].totalItems).toBe(1);
  });
});

describe('writingPracticeService — answer-key exposure for the word-by-word drill', () => {
  test('practice list ships translationAnswer for translation, but never the raw sampleAnswer field', async () => {
    await makeExercise({ type: 'translation', question: 'Xin chào', sampleAnswer: 'Hello there.' });
    const { exercises } = await svc.listExercises({ type: 'translation' });
    const ex = exercises.find(e => e.type === 'translation');
    expect(ex.translationAnswer).toBe('Hello there.');
    expect(ex.sampleAnswer).toBeUndefined();
    // the letter-pattern scaffold still comes along too
    expect(ex.answerWordCount).toBe(2);
  });

  test('practice list does NOT ship an answer for expand (sampleAnswer is only one valid rewrite)', async () => {
    await makeExercise({ type: 'expand', question: 'a cat', sampleAnswer: 'There is a black cat on the mat.' });
    const { exercises } = await svc.listExercises({ type: 'expand' });
    const ex = exercises.find(e => e.type === 'expand');
    expect(ex.translationAnswer).toBeUndefined();
    expect(ex.answerWordCount).toBeGreaterThan(0); // hint scaffold unchanged
  });

  test('test mode never ships translationAnswer', async () => {
    await makeExercise({ type: 'translation', sampleAnswer: 'Hello there.' });
    const { exercises } = await svc.getTestQuestions({ count: 10 });
    for (const ex of exercises) expect(ex.translationAnswer).toBeUndefined();
  });
});

describe('writingPracticeService.getMyStats — counts sentences, not batch rows', () => {
  test('totalDone sums totalItems across multiple aggregate rows', async () => {
    const student = await createStudent();
    const ex1 = await makeExercise({ sampleAnswer: 'Hello' });
    const ex2 = await makeExercise({ sampleAnswer: 'Goodbye' });
    await svc.saveBatch(student._id, [
      { exerciseId: ex1._id, userAnswer: 'Hello' },
      { exerciseId: ex2._id, userAnswer: 'Goodbye' },
    ]);
    const ex3 = await makeExercise({ sampleAnswer: 'Thanks' });
    await svc.saveBatch(student._id, [{ exerciseId: ex3._id, userAnswer: 'Thanks' }]);

    const stats = await svc.getMyStats(student._id);
    expect(stats.totalDone).toBe(3);
    expect(stats.byLevel.beginner).toBe(3);
  });
});
