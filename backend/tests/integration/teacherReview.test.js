// Teacher review queue — "Chấm bài khoá học & Speaking"
// (services/teacherReviewService.js, routes/admin/submissionReviews.js):
// course writing + course/standalone speaking land in the queue after the AI
// grade; the teacher grades/comments, the student gets an inbox message and
// sees it in Lịch sử. R2 + Gemini are mocked.
jest.mock('../../services/r2Service', () => {
  const host = 'https://media.test';
  return {
    isConfigured: jest.fn(() => true),
    keyOf: jest.fn((u) => (typeof u === 'string' && u.startsWith(host + '/') ? u.slice(host.length + 1) : null)),
    uploadAudio: jest.fn(async (buf, { folder, public_id, ext }) => ({ secure_url: `${host}/${folder}/${public_id}.${ext}`, duration: 0 })),
    deleteObjects: jest.fn(async (keys) => keys.length),
    listOldKeys: jest.fn(async () => []),
  };
});
jest.mock('../../services/geminiService');
jest.mock('../../services/speakingService', () => {
  const actual = jest.requireActual('../../services/speakingService');
  return {
    ...actual,
    gradeSpeaking: jest.fn().mockResolvedValue({
      overallBand: 6, fluency: 6, vocabulary: 6, grammar: 6, pronunciation: 6,
      overallFeedback: 'OK', strengths: [], mistakes: [], improvements: [],
    }),
  };
});

const request = require('supertest');
const app = require('../../app');
const geminiService = require('../../services/geminiService');
const { createPremiumStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createSpeakingAttempt } = require('../factories/contentFactory');
const WT1Course = require('../../models/WT1Course');
const WT1Module = require('../../models/WT1Module');
const WT1Lesson = require('../../models/WT1Lesson');
const WT1Exercise = require('../../models/WT1Exercise');
const WT1Submission = require('../../models/WT1Submission');
const SpeakingAttempt = require('../../models/SpeakingAttempt');
const Message = require('../../models/Message');
const svc = require('../../services/teacherReviewService');

const bearer = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const ESSAY = 'Hi Hannah, last summer I went to Da Nang with my family. We swam in the sea every morning and ate a lot of seafood. How was your holiday?';

async function seed() {
  await WT1Course.findOneAndUpdate({ code: 'MINDSET-0' }, { code: 'MINDSET-0', title: 'Mindset Foundation', skill: 'writing' }, { upsert: true });
  await WT1Module.findOneAndUpdate({ code: 'TR-M1' }, { code: 'TR-M1', courseCode: 'MINDSET-0', order: 1, title: 'Unit 1' }, { upsert: true });
  await WT1Lesson.findOneAndUpdate({ code: 'TR-L1' },
    { code: 'TR-L1', moduleCode: 'TR-M1', order: 1, title: 'Holidays', published: true }, { upsert: true });
  await WT1Exercise.deleteMany({ lessonCode: 'TR-L1' });
  await WT1Exercise.create([
    { code: 'TR-L1-W', lessonCode: 'TR-L1', order: 1, type: 'paragraph_writing', title: 'Writing: holiday email', published: true,
      autoGrade: false, instruction: 'Write an email to Hannah (150–175 words).', rubric: { minWords: 140, sampleAnswer: 'Dear Hannah…' } },
    { code: 'TR-L1-S', lessonCode: 'TR-L1', order: 2, type: 'speaking_response', title: 'Speaking: holidays', published: true,
      autoGrade: false, speakingPart: 1, items: [{ id: 's1', prompt: 'Where did you go last holiday?' }] },
    { code: 'TR-L1-S3', lessonCode: 'TR-L1', order: 3, type: 'speaking_response', title: 'Speaking: 2 questions', published: true,
      autoGrade: false, speakingPart: 1, items: [{ id: 's1', prompt: 'Q one?' }, { id: 's2', prompt: 'Q two?' }] },
    { code: 'TR-L1-M', lessonCode: 'TR-L1', order: 4, type: 'mcq', title: 'quiz', published: true, autoGrade: true,
      items: [{ id: 'q1', prompt: 'p', options: [{ id: 'A', text: 'a' }], answer: 'A' }] },
  ]);
}

beforeEach(async () => {
  jest.clearAllMocks();
  await seed();
  geminiService.checkEssay.mockResolvedValue({
    overallBand: 5.5, scores: { taskAchievement: 6, coherence: 5, lexical: 5.5, grammar: 5 }, feedbackVi: 'Ổn', corrections: [],
  });
});

function submitWriting(u) {
  return request(app).post('/api/wt1/submit-writing').set(bearer(u)).send({ exerciseCode: 'TR-L1-W', responses: [ESSAY] });
}
function submitSpeaking(u, extra = {}) {
  const r = request(app).post('/api/wt1/submit-speaking').set(bearer(u))
    .field('exerciseCode', extra.code || 'TR-L1-S').field('transcript', 'I went to Da Nang with my family last summer.').field('duration', '20');
  if (extra.itemIndex != null) r.field('itemIndex', String(extra.itemIndex));
  return r.attach('audio', Buffer.from('fake-opus'), { filename: 'a.webm', contentType: 'audio/webm' });
}

describe('course writing → teacher review queue', () => {
  test('an AI-graded course essay waits in the writing queue; the teacher grade reaches the student', async () => {
    const student = await createPremiumStudent({ firstName: 'Lan' });
    const teacher = await createTeacher({ firstName: 'Thầy', lastName: 'Hà' });
    expect((await submitWriting(student)).status).toBe(200);

    const list = await request(app).get('/api/admin/submission-reviews?kind=writing').set(bearer(teacher));
    expect(list.status).toBe(200);
    expect(list.body.total).toBe(1);
    const row = list.body.rows[0];
    expect(row).toMatchObject({ source: 'course', title: 'Writing: holiday email', exerciseType: 'paragraph_writing', aiBand: 5.5, reviewedAt: null });
    expect(row.context).toContain('Mindset Foundation');
    expect(row.words).toBeGreaterThan(20);
    expect((await svc.counts()).writing).toBe(1);

    const detail = await request(app).get(`/api/admin/submission-reviews/course/${row.id}`).set(bearer(teacher));
    expect(detail.status).toBe(200);
    expect(detail.body.kind).toBe('writing');
    expect(detail.body.review.responses[0]).toBe(ESSAY);
    expect(detail.body.rubric.minWords).toBe(140);

    const put = await request(app).put(`/api/admin/submission-reviews/course/${row.id}`).set(bearer(teacher))
      .send({ band: 6, note: 'Dùng thì quá khứ tốt. Viết thêm cho đủ 150 từ.' });
    expect(put.status).toBe(200);

    const sub = await WT1Submission.findById(row.id).lean();
    expect(sub.teacherReview).toMatchObject({ band: 6, reviewerName: 'Thầy Hà' });
    expect(sub.teacherReview.reviewedAt).toBeTruthy();

    const msg = await Message.findOne({ toId: student._id }).lean();
    expect(msg.subject).toContain('Writing: holiday email');
    expect(msg.body).toContain('Band giáo viên chấm: 6.0');
    expect(msg.body).toContain('Viết thêm cho đủ 150 từ');
    expect(msg.body).toContain('mindset-0.html');

    // Out of the pending queue, into "đã chấm".
    expect((await request(app).get('/api/admin/submission-reviews?kind=writing').set(bearer(teacher))).body.total).toBe(0);
    expect((await request(app).get('/api/admin/submission-reviews?kind=writing&status=done').set(bearer(teacher))).body.total).toBe(1);

    // Student sees it in Lịch sử (list chip + detail block).
    const hist = await request(app).get('/api/wt1/exercise/TR-L1-W/history').set(bearer(student));
    expect(hist.body.history[0]).toMatchObject({ teacherReviewed: true, teacherBand: 6 });
    const att = await request(app).get(`/api/wt1/attempt/${row.id}`).set(bearer(student));
    expect(att.body.review.teacher).toMatchObject({ band: 6, note: expect.stringContaining('150 từ'), reviewerName: 'Thầy Hà' });
  });

  test('re-running the AI replaces the rubric-only fallback grade', async () => {
    const student = await createPremiumStudent();
    const teacher = await createTeacher();
    geminiService.checkEssay.mockRejectedValueOnce(Object.assign(new Error('busy'), { isOverloaded: true }));
    expect((await submitWriting(student)).body.aiUnavailable).toBe(true);
    const sub = await WT1Submission.findOne({ userId: student._id }).lean();
    expect(sub.aiFeedback?.bandEstimate ?? null).toBeNull();

    const res = await request(app).post(`/api/admin/submission-reviews/course/${sub._id}/ai-grade`).set(bearer(teacher));
    expect(res.status).toBe(200);
    expect(res.body.review.ai.band).toBe(5.5);
    expect((await WT1Submission.findById(sub._id).lean()).aiFeedback.bandEstimate).toBe(5.5);
  });

  test('validates the grade and is staff-only', async () => {
    const student = await createPremiumStudent();
    const teacher = await createTeacher();
    await submitWriting(student);
    const sub = await WT1Submission.findOne({ userId: student._id }).lean();
    const url = `/api/admin/submission-reviews/course/${sub._id}`;
    expect((await request(app).put(url).set(bearer(teacher)).send({ band: 6.3 })).status).toBe(400);
    expect((await request(app).put(url).set(bearer(teacher)).send({ band: null, note: '  ' })).status).toBe(400);
    expect((await request(app).put(url).set(bearer(student)).send({ band: 6 })).status).toBe(403);
    expect((await request(app).get('/api/admin/submission-reviews?kind=writing').set(bearer(student))).status).toBe(403);
  });

  test('objective exercises never enter the queue', async () => {
    const student = await createPremiumStudent();
    const teacher = await createTeacher();
    await request(app).post('/api/wt1/check').set(bearer(student)).send({ exerciseCode: 'TR-L1-M', answers: { q1: 'A' } });
    const sub = await WT1Submission.findOne({ userId: student._id }).lean();
    expect(sub).toBeTruthy();
    expect((await svc.counts()).writing).toBe(0);
    expect((await request(app).put(`/api/admin/submission-reviews/course/${sub._id}`).set(bearer(teacher)).send({ band: 6 })).status).toBe(400);
  });
});

describe('speaking → recordings kept + manual grading', () => {
  test('course speaking saves the recording and its SpeakingAttempt mirror is not queued twice', async () => {
    const student = await createPremiumStudent();
    const teacher = await createTeacher();
    expect((await submitSpeaking(student)).status).toBe(200);

    const sub = await WT1Submission.findOne({ userId: student._id, exerciseCode: 'TR-L1-S' }).lean();
    expect(sub.audioUrl).toMatch(/^https:\/\/media\.test\/speaking-recordings\/sp_wt1_.+\.webm$/);
    const mirror = await SpeakingAttempt.findOne({ userId: student._id }).lean();
    expect(mirror).toMatchObject({ source: 'course', audioUrl: sub.audioUrl });

    const list = await request(app).get('/api/admin/submission-reviews?kind=speaking').set(bearer(teacher));
    expect(list.body.total).toBe(1);
    expect(list.body.rows[0]).toMatchObject({ source: 'course', hasAudio: true });

    const put = await request(app).put(`/api/admin/submission-reviews/course/${sub._id}`).set(bearer(teacher))
      .send({ scores: { fluency: 6, vocabulary: 5.5, grammar: 6, pronunciation: 7 }, band: 6, note: 'Phát âm tốt.' });
    expect(put.status).toBe(200);
    const saved = await WT1Submission.findById(sub._id).lean();
    expect(saved.teacherReview.scores).toEqual({ fluency: 6, vocabulary: 5.5, grammar: 6, pronunciation: 7 });
    expect((await Message.findOne({ toId: student._id }).lean()).body).toContain('Pronunciation: 7.0');
  });

  test('multi-item course speaking keeps one recording per question', async () => {
    const student = await createPremiumStudent();
    expect((await submitSpeaking(student, { code: 'TR-L1-S3', itemIndex: 0 })).status).toBe(200);
    expect((await submitSpeaking(student, { code: 'TR-L1-S3', itemIndex: 1 })).body.isLast).toBe(true);
    const sub = await WT1Submission.findOne({ userId: student._id, exerciseCode: 'TR-L1-S3' }).lean();
    expect(sub.itemResults.map((r) => !!r.audioUrl)).toEqual([true, true]);
    const att = await request(app).get(`/api/wt1/attempt/${sub._id}`).set(bearer(student));
    expect(att.body.review.speakingItems.every((s) => /speaking-recordings/.test(s.audioUrl))).toBe(true);
  });

  test('standalone Speaking practice is queued; course mirrors and pre-cutoff attempts are not', async () => {
    const student = await createPremiumStudent();
    const teacher = await createTeacher();
    const own = await createSpeakingAttempt({ userId: student._id, extra: { audioUrl: 'https://media.test/speaking-recordings/x.webm', aiFeedback: { overallBand: 6 } } });
    await createSpeakingAttempt({ userId: student._id, extra: { source: 'course' } });
    const old = await createSpeakingAttempt({ userId: student._id });
    await SpeakingAttempt.collection.updateOne({ _id: old._id }, { $set: { createdAt: new Date('2026-11-01T00:00:00Z') } });

    const list = await request(app).get('/api/admin/submission-reviews?kind=speaking').set(bearer(teacher));
    expect(list.body.rows.map((r) => String(r.id))).toEqual([String(own._id)]);
    expect(list.body.rows[0]).toMatchObject({ source: 'speaking', hasAudio: true, aiBand: 6 });

    const put = await request(app).put(`/api/admin/submission-reviews/speaking/${own._id}`).set(bearer(teacher)).send({ band: 6.5, note: 'Tốt' });
    expect(put.status).toBe(200);
    // The student's own Speaking history returns the full doc → teacher card.
    const hist = await request(app).get('/api/speaking/history').set(bearer(student));
    const a = (hist.body.attempts || hist.body.history || []).find((x) => String(x._id) === String(own._id));
    expect(a.teacherReview).toMatchObject({ band: 6.5, note: 'Tốt' });
  });

  test('sidebar badge counts both queues', async () => {
    const student = await createPremiumStudent();
    const teacher = await createTeacher();
    await submitWriting(student);
    await createSpeakingAttempt({ userId: student._id });
    const res = await request(app).get('/api/admin/sidebar-badges').set(bearer(teacher));
    expect(res.status).toBe(200);
    expect(res.body.pendingReviews).toBe(2);
  });
});

describe('teacherReviewService helpers', () => {
  test('messageBody lists band, criteria and note; speaking has no course page', () => {
    const body = svc._messageBody({ title: 'T', context: 'C', review: { band: 6.5, scores: { fluency: 6 }, note: 'N' }, page: '', updated: true });
    expect(body).toContain('cập nhật');
    expect(body).toContain('Fluency & Coherence: 6.0');
    expect(body).toContain('trang Luyện Speaking');
  });
  test('cleanReview drops unknown criteria and rejects out-of-range bands', () => {
    expect(svc._cleanReview('speaking', { band: 7, scores: { fluency: 7, bogus: 3 } })).toEqual({ band: 7, scores: { fluency: 7 }, note: '' });
    expect(() => svc._cleanReview('writing', { band: 9.5 })).toThrow(/0 đến 9/);
  });
});

describe('course writing the AI missed → auto re-grade every 10 min + external-AI prompt', () => {
  async function busySubmission() {
    const student = await createPremiumStudent();
    geminiService.checkEssay.mockRejectedValueOnce(Object.assign(new Error('busy'), { isOverloaded: true }));
    expect((await submitWriting(student)).body.aiUnavailable).toBe(true);
    return { student, sub: await WT1Submission.findOne({ userId: student._id }).lean() };
  }

  test('autoRegradePending grades it, clears "AI lỗi/bận" and tells the student', async () => {
    await createAdmin(); // the inbox message's sender
    const teacher = await createTeacher();
    const { student, sub } = await busySubmission();
    let row = (await request(app).get('/api/admin/submission-reviews?kind=writing').set(bearer(teacher))).body.rows[0];
    expect(row.aiUnavailable).toBe(true);

    const out = await svc.autoRegradePending({ delayMs: 0 });
    expect(out).toMatchObject({ graded: 1, failed: 0 });
    const [prompt] = geminiService.checkEssay.mock.calls.at(-1);
    expect(prompt).toContain('Write an email to Hannah');
    expect(prompt).toContain('Writing: holiday email');

    const after = await WT1Submission.findById(sub._id).lean();
    expect(after.aiFeedback.bandEstimate).toBe(5.5);
    expect(after.localFeedback.aiUnavailable).toBe(false);
    row = (await request(app).get('/api/admin/submission-reviews?kind=writing').set(bearer(teacher))).body.rows[0];
    expect(row).toMatchObject({ aiBand: 5.5, aiUnavailable: false });
    const msg = await Message.findOne({ toId: student._id }).lean();
    expect(msg.subject).toContain('Band 5.5');

    // Nothing left to do on the next tick.
    expect(await svc.autoRegradePending({ delayMs: 0 })).toMatchObject({ graded: 0 });
  });

  test('an overload stops the run without counting a try; real errors give up after the cap', async () => {
    await busySubmission();
    geminiService.checkEssay.mockRejectedValueOnce(Object.assign(new Error('busy'), { isOverloaded: true }));
    expect(await svc.autoRegradePending({ delayMs: 0 })).toMatchObject({ graded: 0, overloaded: true });
    expect((await WT1Submission.findOne({}).lean()).aiRetry?.tries ?? 0).toBe(0);

    geminiService.checkEssay.mockRejectedValue(new Error('bad json'));
    for (let i = 0; i < svc.AUTO_MAX_TRIES; i++) await svc.autoRegradePending({ delayMs: 0 });
    expect((await WT1Submission.findOne({}).lean()).aiRetry.tries).toBe(svc.AUTO_MAX_TRIES);
    const calls = geminiService.checkEssay.mock.calls.length;
    await svc.autoRegradePending({ delayMs: 0 });
    expect(geminiService.checkEssay.mock.calls.length).toBe(calls); // given up
  });

  test('ai-prompt returns the question, rubric and the student answer for an outside AI', async () => {
    const teacher = await createTeacher();
    const { sub } = await busySubmission();
    const res = await request(app).get(`/api/admin/submission-reviews/course/${sub._id}/ai-prompt`).set(bearer(teacher));
    expect(res.status).toBe(200);
    expect(res.body.kind).toBe('writing');
    expect(res.body.prompt).toContain('Write an email to Hannah');
    expect(res.body.prompt).toContain('≥ 140 từ');
    expect(res.body.prompt).toContain(ESSAY);
    expect(res.body.prompt).toContain('Dear Hannah'); // sample answer for reference
  });
});
