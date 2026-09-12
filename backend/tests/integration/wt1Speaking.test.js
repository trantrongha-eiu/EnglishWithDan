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
    expect(speakingService.gradeSpeaking).toHaveBeenCalledWith(expect.stringContaining('cooking'), expect.any(String), 1, null);

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
