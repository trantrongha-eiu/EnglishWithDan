// "Chọn phần làm" — a student doing only some passages (Reading) / sections
// (Listening) of a full test. Covers utils/partSelection.js plus how
// readingService / listeningService start, grade and list partial attempts.
const readingService = require('../../../services/readingService');
const listeningService = require('../../../services/listeningService');
const TestAttempt = require('../../../models/TestAttempt');
const ListeningAttempt = require('../../../models/ListeningAttempt');
const { normalizeParts, scaledCorrect } = require('../../../utils/partSelection');
const { bandScoreTable } = require('../../../utils/bandScore');
const { createStudent } = require('../../factories/userFactory');
const { createPassage, createReadingTest, createListeningTest, createListeningSection } = require('../../factories/contentFactory');

describe('normalizeParts', () => {
  test('absent, malformed, empty or every part → null (the whole test)', () => {
    expect(normalizeParts(undefined, 3)).toBeNull();
    expect(normalizeParts('1,2', 3)).toBeNull();
    expect(normalizeParts([], 3)).toBeNull();
    expect(normalizeParts([9, 'x'], 3)).toBeNull();
    expect(normalizeParts([3, 1, 2], 3)).toBeNull();
  });

  test('a subset comes back sorted, de-duplicated, out-of-range dropped', () => {
    expect(normalizeParts([3, '1', 3, 7], 3)).toEqual([1, 3]);
  });

  test('scaledCorrect maps the score onto 40 questions', () => {
    expect(scaledCorrect(13, 13)).toBe(40);
    expect(scaledCorrect(10, 20)).toBe(20);
    expect(scaledCorrect(0, 0)).toBe(0);
  });
});

function q(n, answer) {
  return { questionNumber: n, type: 'fill-blank', questionText: `Q${n}`, correctAnswer: answer };
}

describe('readingService — partial attempt', () => {
  async function fixedTest() {
    const ps = [];
    for (const n of [1, 2, 3]) {
      ps.push(await createPassage({
        category: `passage${n}`, title: `P${n}`,
        questionGroups: [{ groupType: 'plain', questions: [q(n * 10, 'a'), q(n * 10 + 1, 'b')] }],
      }));
    }
    return createReadingTest({ passageIds: ps.map(p => p._id) });
  }

  test('2 passages → only those passages, 40 minutes, parts stored on the attempt', async () => {
    const student = await createStudent();
    const test = await fixedTest();

    const res = await readingService.startTest(test._id, student._id, 'practice', [3, 1]);

    expect(res.status).toBe('ok');
    expect(res.passages.map(p => p.title)).toEqual(['P1', 'P3']);
    expect(res.duration).toBe(2400);
    expect(res.parts).toEqual([1, 3]);
    const row = await TestAttempt.findById(res.attemptId).lean();
    expect(row.parts).toEqual([1, 3]);
  });

  test('the whole test is unchanged: 60 minutes, no parts field', async () => {
    const student = await createStudent();
    const test = await fixedTest();
    const res = await readingService.startTest(test._id, student._id, 'practice', [1, 2, 3]);
    expect(res.duration).toBe(3600);
    expect(res.parts).toBeNull();
    const row = await TestAttempt.findById(res.attemptId).lean();
    expect(row.parts).toBeUndefined();
  });

  test('an open partial attempt is never resumed as the full test (or another pick)', async () => {
    const student = await createStudent();
    const test = await fixedTest();
    const p1 = await readingService.startTest(test._id, student._id, 'practice', [1]);
    const full = await readingService.startTest(test._id, student._id, 'practice');
    const p2 = await readingService.startTest(test._id, student._id, 'practice', [2]);
    const p1again = await readingService.startTest(test._id, student._id, 'practice', [1]);

    expect(full.attemptId.toString()).not.toBe(p1.attemptId.toString());
    expect(p2.attemptId.toString()).not.toBe(p1.attemptId.toString());
    expect(p1again.attemptId.toString()).toBe(p1.attemptId.toString());
  });

  test('grades only the picked passages with a band scaled to 40, and does not mark the test card done', async () => {
    const student = await createStudent();
    const test = await fixedTest();
    const res = await readingService.startTest(test._id, student._id, 'practice', [2]);

    const result = await readingService.submitTest(res.attemptId, { 20: 'a', 21: 'x' }, student);

    expect(result.totalQuestions).toBe(2);
    expect(result.correctCount).toBe(1);
    expect(result.parts).toEqual([2]);
    expect(result.bandScore).toBe(bandScoreTable('reading', 20));

    const list = await readingService.listTestsForUser(student._id);
    expect(list.find(t => String(t._id) === String(test._id)).lastAttempt).toBeNull();
  });
});

describe('listeningService — partial attempt', () => {
  async function testWithParts({ withAudio = [1, 2, 3, 4] } = {}) {
    const sections = [1, 2, 3, 4].map(n => ({
      partNumber: n, title: `Sec ${n}`, questionRange: { start: n * 10, end: n * 10 + 1 },
      questionGroups: [{ groupType: 'plain', questions: [q(n * 10, 'a'), q(n * 10 + 1, 'b')] }],
    }));
    const test = await createListeningTest({ audioUrl: 'https://cdn.example/full.mp3', sections });
    for (const n of withAudio) {
      await createListeningSection({ partNumber: n, title: `Sec ${n}`, extra: { audioUrl: `https://cdn.example/p${n}.mp3`, audioDuration: 300 } });
    }
    return test;
  }

  test('picked sections only, each with its own đề lẻ audio; the joined recording is not sent', async () => {
    const student = await createStudent();
    const test = await testWithParts();

    const res = await listeningService.startTest(test._id.toString(), student._id, 'practice', [2, 4]);

    expect(res.parts).toEqual([2, 4]);
    expect(res.audioUrl).toBe('');
    expect(res.sections.map(s => [s.partNumber, s.audioUrl])).toEqual([
      [2, 'https://cdn.example/p2.mp3'], [4, 'https://cdn.example/p4.mp3'],
    ]);
    const row = await ListeningAttempt.findById(res.attemptId).lean();
    expect(row.parts).toEqual([2, 4]);
    expect(row.totalQuestions).toBe(4);
  });

  test('a picked section with no audio of its own → partsUnavailable', async () => {
    const student = await createStudent();
    const test = await testWithParts({ withAudio: [1, 2] });
    expect(await listeningService.startTest(test._id.toString(), student._id, 'practice', [1, 3])).toEqual({ partsUnavailable: true });
    expect((await listeningService.startTest(test._id.toString(), student._id, 'practice', [1, 2])).parts).toEqual([1, 2]);
  });

  test('grades only the picked sections, band scaled to 40; review keeps per-section audio', async () => {
    const student = await createStudent();
    const test = await testWithParts();
    const res = await listeningService.startTest(test._id.toString(), student._id, 'practice', [1]);

    const result = await listeningService.submitTest(test._id.toString(), { answers: { 10: 'a', 11: 'b', 20: 'a' }, attemptId: res.attemptId }, student);

    expect(result.totalQuestions).toBe(2);
    expect(result.correctCount).toBe(2);
    expect(result.parts).toEqual([1]);
    expect(result.bandScore).toBe(listeningService.calcBandScore(40));
    expect(result.sections.map(s => s.audioUrl)).toEqual(['https://cdn.example/p1.mp3']);

    const detail = await listeningService.getHistoryDetail(res.attemptId, student._id);
    expect(detail.result.parts).toEqual([1]);
    expect(detail.result.sections.map(s => s.audioUrl)).toEqual(['https://cdn.example/p1.mp3']);
  });

  test('the test list flags partsPickable and ignores partial attempts for the done tick', async () => {
    const student = await createStudent();
    const ok = await testWithParts();
    const missing = await createListeningTest({
      sections: [1, 2, 3, 4].map(n => ({ partNumber: n, title: `Orphan ${n}`, questionRange: { start: n, end: n }, questionGroups: [{ groupType: 'plain', questions: [q(n, 'a')] }] })),
    });
    const res = await listeningService.startTest(ok._id.toString(), student._id, 'practice', [1]);
    await listeningService.submitTest(ok._id.toString(), { answers: {}, attemptId: res.attemptId }, student);

    const list = await listeningService.listStudentTests(student._id);
    const okRow = list.find(t => String(t._id) === String(ok._id));
    expect(okRow.partsPickable).toBe(true);
    expect(okRow.lastAttempt).toBeNull();
    expect(list.find(t => String(t._id) === String(missing._id)).partsPickable).toBe(false);
  });
});
