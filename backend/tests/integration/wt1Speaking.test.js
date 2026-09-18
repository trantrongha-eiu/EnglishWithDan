// Integration tests for the Speaking course (courseCode IELTS-SPEAKING)
// built on the WT1 stack: the new speaking_response exercise type + its
// POST /api/wt1/submit-speaking path. gradeSpeaking (Gemini) and the
// SpeakingAttempt mirror are stubbed so the tests stay offline.
jest.mock('../../services/speakingService', () => {
  const actual = jest.requireActual('../../services/speakingService');
  return {
    ...actual,
    gradeSpeaking: jest.fn().mockResolvedValue({
      overallBand: 6.5, fluency: 6, vocabulary: 7, grammar: 6, pronunciation: 7,
      overallFeedback: 'Khá tốt — cần thêm ví dụ cụ thể.',
      strengths: ['Trả lời thẳng câu hỏi'],
      mistakes: [{ original: 'It help me', corrected: 'It helps me', reason: 'ngôi thứ ba thêm -s' }],
      improvements: ['Thêm một chi tiết cá nhân thật'],
    }),
    saveAttempt: jest.fn().mockResolvedValue({ attemptId: null, newlyUnlocked: [] }),
  };
});

const request = require('supertest');
const app = require('../../app');
const speakingService = require('../../services/speakingService');
const { createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const WT1Course = require('../../models/WT1Course');
const WT1Module = require('../../models/WT1Module');
const WT1Lesson = require('../../models/WT1Lesson');
const WT1Exercise = require('../../models/WT1Exercise');
const WT1Submission = require('../../models/WT1Submission');
const WT1Progress = require('../../models/WT1Progress');

const bearer = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

async function seedSpeakingCourse() {
  await WT1Course.findOneAndUpdate({ code: 'IELTS-SPEAKING' }, { code: 'IELTS-SPEAKING', title: 'Speaking', skill: 'speaking' }, { upsert: true });
  await WT1Module.findOneAndUpdate({ code: 'SPKT-M1' }, { code: 'SPKT-M1', courseCode: 'IELTS-SPEAKING', order: 1, title: 'Phase 1' }, { upsert: true });
  await WT1Lesson.findOneAndUpdate({ code: 'SPKT-L1' },
    { code: 'SPKT-L1', moduleCode: 'SPKT-M1', order: 1, title: 'Buổi 1', published: true,
      gate: { minObjectiveScorePercent: 50, minWritingSubmissions: 1 } }, { upsert: true });
  await WT1Exercise.deleteMany({ lessonCode: 'SPKT-L1' });
  await WT1Exercise.create([
    { code: 'SPKT-L1-E1', lessonCode: 'SPKT-L1', order: 1, type: 'mcq', title: 'concept', published: true, autoGrade: true,
      items: [{ id: 'q1', prompt: 'p', options: [{ id: 'A', text: 'a' }, { id: 'B', text: 'b' }], answer: 'A' }] },
    { code: 'SPKT-L1-E2', lessonCode: 'SPKT-L1', order: 2, type: 'speaking_response', title: 'Nói', published: true,
      autoGrade: false, speakingPart: 1,
      items: [{ id: 's1', prompt: 'Do you like cooking?' }],
      rubric: { checklist: ['O.R.E.'], sampleAnswer: 'Yes, definitely. I find cooking therapeutic...', commonErrors: ['Trả lời cụt'] } },
    { code: 'SPKT-L1-E3', lessonCode: 'SPKT-L1', order: 3, type: 'gap_fill', title: 'Điền chỗ trống', published: true, autoGrade: true,
      items: [
        { id: 'g1', prompt: 'I prefer studying alone ____ it helps me concentrate better.', blanks: [{ accept: ['because'] }] },
        { id: 'g2', prompt: '____ example, I can finish my homework faster.', blanks: [{ accept: ['For'] }] },
      ] },
    // Multi-item Part 1 set — one mic/AI-grade per question (see the "per-item
    // speaking grading" describe block below), not one combined recording.
    { code: 'SPKT-L1-E4', lessonCode: 'SPKT-L1', order: 4, type: 'speaking_response', title: 'Nói (nhiều câu)', published: true,
      autoGrade: false, speakingPart: 1,
      items: [
        { id: 's1', prompt: 'Do you like cooking?' },
        { id: 's2', prompt: 'Do you enjoy watching films?' },
        { id: 's3', prompt: 'Do you like weekends more than weekdays?' },
      ] },
  ]);
}

beforeEach(async () => {
  await seedSpeakingCourse();
  speakingService.gradeSpeaking.mockClear();
  speakingService.saveAttempt.mockClear();
});

describe('Speaking course on the WT1 stack', () => {
  test('overview?course=IELTS-SPEAKING returns only the speaking course modules', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).get('/api/wt1/overview?course=IELTS-SPEAKING').set(bearer(u));
    expect(res.status).toBe(200);
    expect(res.body.modules.map((m) => m.code)).toEqual(['SPKT-M1']);
  });

  test('getLesson keeps the Band 7 model answer + commonErrors visible for speaking_response', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).get('/api/wt1/lesson/SPKT-L1').set(bearer(u));
    expect(res.status).toBe(200);
    const ex = res.body.exercises.find((e) => e.code === 'SPKT-L1-E2');
    expect(ex.type).toBe('speaking_response');
    expect(ex.speakingPart).toBe(1);
    expect(ex.rubric.sampleAnswer).toMatch(/therapeutic/);
    expect(ex.rubric.commonErrors).toContain('Trả lời cụt');
  });

  test('gap_fill in the Speaking course ships a shuffled gapBank (one chip per blank) instead of free typing, and grading is unaffected', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).get('/api/wt1/lesson/SPKT-L1').set(bearer(u));
    const ex = res.body.exercises.find((e) => e.code === 'SPKT-L1-E3');
    expect(ex.gapBank.sort()).toEqual(['For', 'because']);
    // the answer key itself is still gone from the item, same as every
    // other objective type — only the pooled/shuffled gapBank carries it.
    expect(ex.items[0].blanks).toBeUndefined();

    const ok = await request(app).post('/api/wt1/check').set(bearer(u))
      .send({ exerciseCode: 'SPKT-L1-E3', answers: { g1: ['because'], g2: ['For'] } });
    expect(ok.status).toBe(200);
    expect(ok.body.score).toBe(100);
  });

  test('submit-speaking bands the transcript, records a submission, and counts toward the gate', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).post('/api/wt1/submit-speaking').set(bearer(u))
      .send({ exerciseCode: 'SPKT-L1-E2', transcript: 'Yes I really enjoy cooking because it helps me relax after work.', duration: 22 });
    expect(res.status).toBe(200);
    expect(res.body.graded).toBe('speaking');
    expect(res.body.feedback.overallBand).toBe(6.5);
    expect(speakingService.gradeSpeaking).toHaveBeenCalledWith(expect.stringContaining('cooking'), expect.any(String), 1, null, 22);

    const sub = await WT1Submission.findOne({ userId: u._id, exerciseCode: 'SPKT-L1-E2' });
    expect(sub).toBeTruthy();
    expect(sub.aiFeedback.bandEstimate).toBe(6.5);

    const prog = await WT1Progress.findOne({ userId: u._id, lessonCode: 'SPKT-L1' });
    expect(prog.writingSubmissions).toBe(1); // speaking_response is not an OBJECTIVE type
  });

  test('a too-short transcript is rejected before calling Gemini', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).post('/api/wt1/submit-speaking').set(bearer(u))
      .send({ exerciseCode: 'SPKT-L1-E2', transcript: 'Yes I do.' });
    expect(res.status).toBe(400);
    expect(speakingService.gradeSpeaking).not.toHaveBeenCalled();
  });

  test('submit-speaking refuses a non-speaking exercise', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).post('/api/wt1/submit-speaking').set(bearer(u))
      .send({ exerciseCode: 'SPKT-L1-E1', transcript: 'this is a long enough sentence to pass the length guard' });
    expect(res.status).toBe(400);
  });
});

// Multi-item speaking_response exercises: a mic + AI grade per question,
// instead of one continuous recording covering the whole set. Each item is
// its own POST (itemIndex) that grades and returns feedback immediately;
// nothing is written to WT1Submission until every item has one, at which
// point the SERVER (not the client) computes the averaged aggregate from
// what it already persisted — see wt1Service.recordSpeakingItem.
describe('submit-speaking — per-item grading (multi-item exercises)', () => {
  const ANSWER = 'Yes I really enjoy this because it helps me relax after a long day.';

  test('grades each item as its own call, writes nothing until the last one, then finalizes with a server-computed average', async () => {
    const u = await createPremiumStudent();

    const r0 = await request(app).post('/api/wt1/submit-speaking').set(bearer(u))
      .send({ exerciseCode: 'SPKT-L1-E4', itemIndex: 0, transcript: ANSWER, duration: 18 });
    expect(r0.status).toBe(200);
    expect(r0.body).toMatchObject({ graded: 'speaking-item', itemIndex: 0, isLast: false });
    expect(r0.body.feedback.overallBand).toBe(6.5);
    expect(r0.body.aggregate).toBeUndefined();

    // Not counted toward the lesson gate yet — only 1 of 3 items graded.
    let prog = await WT1Progress.findOne({ userId: u._id, lessonCode: 'SPKT-L1' });
    expect(prog?.writingSubmissions || 0).toBe(0);
    let draft = await WT1Submission.findOne({ userId: u._id, exerciseCode: 'SPKT-L1-E4' });
    expect(draft.status).toBe('draft');
    expect(draft.itemResults).toHaveLength(1);

    const r1 = await request(app).post('/api/wt1/submit-speaking').set(bearer(u))
      .send({ exerciseCode: 'SPKT-L1-E4', itemIndex: 1, transcript: ANSWER, duration: 20 });
    expect(r1.body).toMatchObject({ graded: 'speaking-item', itemIndex: 1, isLast: false });

    const r2 = await request(app).post('/api/wt1/submit-speaking').set(bearer(u))
      .send({ exerciseCode: 'SPKT-L1-E4', itemIndex: 2, transcript: ANSWER, duration: 19 });
    expect(r2.status).toBe(200);
    expect(r2.body.isLast).toBe(true);
    // Every item graded identically by the mock (6/7/6/7 -> band 6.5) — the
    // aggregate must equal that, proving it's a real average, not a copy of
    // one item's raw feedback.
    expect(r2.body.aggregate).toMatchObject({ fluency: 6, vocabulary: 7, grammar: 6, pronunciation: 7, overallBand: 6.5 });

    const sub = await WT1Submission.findOne({ userId: u._id, exerciseCode: 'SPKT-L1-E4' });
    expect(sub.status).toBe('graded');
    expect(sub.itemResults).toHaveLength(3);
    expect(sub.aiFeedback.bandEstimate).toBe(6.5);
    expect(sub.responses).toHaveLength(3);

    // NOW it counts toward the gate — exactly once, not 3 times.
    prog = await WT1Progress.findOne({ userId: u._id, lessonCode: 'SPKT-L1' });
    expect(prog.writingSubmissions).toBe(1);

    // Mirrored into SpeakingAttempt exactly once (on the final item only).
    expect(speakingService.saveAttempt).toHaveBeenCalledTimes(1);
  });

  test('an invalid itemIndex is rejected before calling Gemini', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).post('/api/wt1/submit-speaking').set(bearer(u))
      .send({ exerciseCode: 'SPKT-L1-E4', itemIndex: 9, transcript: ANSWER });
    expect(res.status).toBe(400);
    expect(speakingService.gradeSpeaking).not.toHaveBeenCalled();
  });

  test('a too-short answer on one item is rejected the same way the legacy path rejects it', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).post('/api/wt1/submit-speaking').set(bearer(u))
      .send({ exerciseCode: 'SPKT-L1-E4', itemIndex: 0, transcript: 'Yes I do.' });
    expect(res.status).toBe(400);
    expect(speakingService.gradeSpeaking).not.toHaveBeenCalled();
  });

  test('retrying from item 0 after finishing once starts a fresh attempt, not a collision with the graded one', async () => {
    const u = await createPremiumStudent();
    for (let i = 0; i < 3; i++) {
      await request(app).post('/api/wt1/submit-speaking').set(bearer(u))
        .send({ exerciseCode: 'SPKT-L1-E4', itemIndex: i, transcript: ANSWER });
    }
    const firstDone = await WT1Submission.findOne({ userId: u._id, exerciseCode: 'SPKT-L1-E4', status: 'graded' });
    expect(firstDone.attempt).toBe(1);

    const retry = await request(app).post('/api/wt1/submit-speaking').set(bearer(u))
      .send({ exerciseCode: 'SPKT-L1-E4', itemIndex: 0, transcript: ANSWER });
    expect(retry.status).toBe(200);

    const draft2 = await WT1Submission.findOne({ userId: u._id, exerciseCode: 'SPKT-L1-E4', status: 'draft' });
    expect(draft2.attempt).toBe(2);
    // The first (already-graded) attempt is untouched.
    const stillGraded = await WT1Submission.findOne({ userId: u._id, exerciseCode: 'SPKT-L1-E4', attempt: 1 });
    expect(stillGraded.status).toBe('graded');
    expect(stillGraded.itemResults).toHaveLength(3);
  });
});
