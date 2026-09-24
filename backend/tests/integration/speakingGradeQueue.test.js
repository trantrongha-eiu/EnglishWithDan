// The "AI đang xử lý — điểm sẽ gửi sau" queue: a Speaking answer whose AI
// grade failed at submit time is re-graded later by
// speakingGradeQueueService.processDueJobs (run every minute by
// cron/speakingGradeQueue.js), with backoff, a give-up limit, and an inbox
// message to the student either way. Gemini is mocked.
const speakingGradeQueue = require('../../services/speakingGradeQueueService');
const SpeakingGradeJob = require('../../models/SpeakingGradeJob');
const SpeakingAttempt = require('../../models/SpeakingAttempt');
const Message = require('../../models/Message');
const { createStudent, createAdmin } = require('../factories/userFactory');
const { sweepStaleAttempts } = require('../../cron/attemptTimeoutSweep');

jest.mock('../../services/geminiService');
const geminiService = require('../../services/geminiService');

const T = 'I usually go jogging in the park near my house because it helps me clear my head after work.';
const crit = band => ({
  band, descriptorMatch: [], strengths: ['Trả lời trực tiếp'], weaknesses: [],
  evidence: [{ studentQuote: 'it helps me clear my head', feature: 'idiom', evaluation: 'ok', positive: true }],
  limitations: [], feedback: 'x', nextStep: 'y',
});
const v2 = () => ({
  noGenuineAnswer: false,
  criteria: { fluencyCoherence: crit(6), lexicalResource: crit(6.5), grammaticalRangeAccuracy: crit(6), pronunciation: { ...crit(7), assessable: true } },
  overallFeedback: 'Ổn.', priorityImprovements: ['A', 'B', 'C'],
});

async function queuedAttempt(user, { audio = null } = {}) {
  const attempt = await SpeakingAttempt.create({ userId: user._id, part: 1, question: 'Do you like sport?', transcript: T, status: 'pending' });
  const ok = await speakingGradeQueue.enqueue(attempt._id, {
    userId: user._id, questionText: 'Do you like sport?', transcript: T, part: 1, durationSec: 30, audio,
  });
  expect(ok).toBe(true);
  await SpeakingGradeJob.updateOne({ attemptId: attempt._id }, { $set: { nextRunAt: new Date(Date.now() - 1000) } }); // due now
  return attempt;
}

const ORIGINAL_GROQ_KEY = process.env.GROQ_API_KEY;
const ORIGINAL_MISTRAL_KEY = process.env.MISTRAL_API_KEY;
beforeEach(async () => {
  delete process.env.GROQ_API_KEY;
  delete process.env.MISTRAL_API_KEY;
  await createAdmin(); // the inbox-message sender
});
afterEach(() => {
  jest.clearAllMocks();
  if (ORIGINAL_GROQ_KEY !== undefined) process.env.GROQ_API_KEY = ORIGINAL_GROQ_KEY;
  if (ORIGINAL_MISTRAL_KEY !== undefined) process.env.MISTRAL_API_KEY = ORIGINAL_MISTRAL_KEY;
});

describe('speaking grade queue', () => {
  test('a due job is graded: attempt analyzed, job deleted, student gets the band in the inbox', async () => {
    geminiService.checkSpeaking.mockResolvedValue(v2());
    const student = await createStudent();
    const attempt = await queuedAttempt(student, { audio: { buffer: Buffer.from('opus'), mimetype: 'audio/webm' } });

    const out = await speakingGradeQueue.processDueJobs();
    expect(out.graded).toBe(1);

    const saved = await SpeakingAttempt.findById(attempt._id).lean();
    expect(saved.status).toBe('analyzed');
    expect(saved.gradingQueued).toBe(false);
    expect(saved.aiFeedback.scoringVersion).toBe('speaking-v2');
    expect(saved.aiFeedback.pronunciation).toBe(7); // the stored recording was re-sent and heard
    expect(geminiService.checkSpeaking.mock.calls[0][3]).toMatchObject({ mimeType: 'video/webm' });
    expect(await SpeakingGradeJob.countDocuments()).toBe(0);

    const msgs = await Message.find({ toId: student._id }).lean();
    expect(msgs).toHaveLength(1);
    expect(msgs[0].subject).toMatch(/Band 6\.5/);
  });

  test('a job that is not due yet is left alone', async () => {
    geminiService.checkSpeaking.mockResolvedValue(v2());
    const student = await createStudent();
    const attempt = await queuedAttempt(student);
    await SpeakingGradeJob.updateOne({ attemptId: attempt._id }, { $set: { nextRunAt: new Date(Date.now() + 60000) } });
    await speakingGradeQueue.processDueJobs();
    expect(geminiService.checkSpeaking).not.toHaveBeenCalled();
  });

  test('still overloaded: the try is counted and the job is pushed back (backoff), attempt stays pending', async () => {
    const err = new Error('overloaded'); err.isOverloaded = true;
    geminiService.checkSpeaking.mockRejectedValue(err);
    const student = await createStudent();
    const attempt = await queuedAttempt(student);

    await speakingGradeQueue.processDueJobs();
    const job = await SpeakingGradeJob.findOne({ attemptId: attempt._id }).lean();
    expect(job.tries).toBe(1);
    expect(job.nextRunAt.getTime()).toBeGreaterThan(Date.now());
    expect((await SpeakingAttempt.findById(attempt._id).lean()).status).toBe('pending');
    expect(await Message.countDocuments({ toId: student._id })).toBe(0);
  });

  test('gives up after MAX_TRIES: attempt marked error, job removed, student told to retry from History', async () => {
    geminiService.checkSpeaking.mockRejectedValue(new Error('still broken'));
    const student = await createStudent();
    const attempt = await queuedAttempt(student);
    await SpeakingGradeJob.updateOne({ attemptId: attempt._id }, { $set: { tries: speakingGradeQueue.MAX_TRIES - 1 } });

    await speakingGradeQueue.processDueJobs();
    expect((await SpeakingAttempt.findById(attempt._id).lean()).status).toBe('error');
    expect(await SpeakingGradeJob.countDocuments()).toBe(0);
    const msg = await Message.findOne({ toId: student._id }).lean();
    expect(msg.body).toMatch(/Thử chấm lại/);
  });

  test('no genuine answer on re-grade: the phantom attempt is discarded and the student is told', async () => {
    geminiService.checkSpeaking.mockResolvedValue({ ...v2(), noGenuineAnswer: true });
    const student = await createStudent();
    const attempt = await queuedAttempt(student);
    await speakingGradeQueue.processDueJobs();
    expect(await SpeakingAttempt.findById(attempt._id)).toBeNull();
    const msg = await Message.findOne({ toId: student._id }).lean();
    expect(msg.subject).toMatch(/không phát hiện/);
  });

  test('the stale-pending sweep leaves queued attempts alone', async () => {
    const student = await createStudent();
    const attempt = await queuedAttempt(student);
    const old = new Date(Date.now() - 60 * 60 * 1000);
    await SpeakingAttempt.collection.updateOne({ _id: attempt._id }, { $set: { createdAt: old } });
    const stuck = await SpeakingAttempt.create({ userId: student._id, part: 1, question: 'q', transcript: T, status: 'pending' });
    await SpeakingAttempt.collection.updateOne({ _id: stuck._id }, { $set: { createdAt: old } });

    await sweepStaleAttempts();
    expect((await SpeakingAttempt.findById(attempt._id).lean()).status).toBe('pending');
    expect((await SpeakingAttempt.findById(stuck._id).lean()).status).toBe('error');
  });
});
