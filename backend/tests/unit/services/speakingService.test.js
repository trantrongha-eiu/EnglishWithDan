// Unit tests for services/speakingService.js.
const speakingService = require('../../../services/speakingService');
const SpeakingAttempt = require('../../../models/SpeakingAttempt');
const SpeakingMaterial = require('../../../models/SpeakingMaterial');
const { createStudent } = require('../../factories/userFactory');
const { createSpeakingQuestion } = require('../../factories/contentFactory');

// gradeSpeaking()/retryGrading() delegate to these — mocked so tests never
// make a real network call, and so both the overallBand-recompute and the
// broadened Groq-fallback trigger can be exercised deterministically.
jest.mock('../../../services/geminiService');
jest.mock('../../../services/groqService');
const geminiService = require('../../../services/geminiService');
const groqService = require('../../../services/groqService');

// The sampleAnswer/hints cache writes in speakingService are deliberately
// fire-and-forget (SpeakingQuestion.updateOne(...).catch(...), never
// awaited) so the response isn't delayed by the DB write. Waiting a fixed
// setTimeout for that write to land is inherently racy — it passed on a
// fast machine but flaked under `--coverage`'s heavier instrumentation
// (a real failure seen 2026-08-21). Poll instead of sleeping a fixed amount.
async function waitFor(predicate, { timeoutMs = 1000, intervalMs = 10 } = {}) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const result = await predicate();
    if (result) return result;
    if (Date.now() >= deadline) throw new Error(`waitFor: condition not met within ${timeoutMs}ms`);
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
}

describe('speakingService.listTopics', () => {
  test('returns sorted distinct topics, filtered by part when given', async () => {
    await createSpeakingQuestion({ topic: 'Zebra', part: 1 });
    await createSpeakingQuestion({ topic: 'Apple', part: 1 });
    await createSpeakingQuestion({ topic: 'Mango', part: 2 });
    await createSpeakingQuestion({ topic: 'Inactive', part: 1, isActive: false });

    const part1Topics = await speakingService.listTopics(1);
    expect(part1Topics).toEqual(['Apple', 'Zebra']);

    const allTopics = await speakingService.listTopics('all');
    expect(allTopics.sort()).toEqual(['Apple', 'Mango', 'Zebra'].sort());
  });
});

describe('speakingService.getRandomQuestion', () => {
  test('returns null when no question matches the filter', async () => {
    await createSpeakingQuestion({ topic: 'Travel', part: 1 });
    const result = await speakingService.getRandomQuestion({ topic: 'NoSuchTopic', part: 'all' });
    expect(result).toBeNull();
  });

  test('returns a question matching the topic/part filter', async () => {
    const q = await createSpeakingQuestion({ topic: 'Travel', part: 2, question: 'Describe a trip.' });
    await createSpeakingQuestion({ topic: 'Food', part: 2 });

    const result = await speakingService.getRandomQuestion({ topic: 'Travel', part: 2 });
    expect(result).not.toBeNull();
    expect(result._id.toString()).toBe(q._id.toString());
  });

  test('ignores inactive questions', async () => {
    await createSpeakingQuestion({ topic: 'OnlyInactive', part: 1, isActive: false });
    const result = await speakingService.getRandomQuestion({ topic: 'OnlyInactive', part: 1 });
    expect(result).toBeNull();
  });
});

describe('speakingService.listQuestions', () => {
  test('filters by topic and part, "all" means no filter', async () => {
    await createSpeakingQuestion({ topic: 'Travel', part: 1 });
    await createSpeakingQuestion({ topic: 'Travel', part: 2 });
    await createSpeakingQuestion({ topic: 'Food', part: 1 });

    const travelOnly = await speakingService.listQuestions({ topic: 'Travel', part: 'all' });
    expect(travelOnly.length).toBe(2);

    const all = await speakingService.listQuestions({ topic: 'all', part: 'all' });
    expect(all.length).toBe(3);

    const travelPart1 = await speakingService.listQuestions({ topic: 'Travel', part: 1 });
    expect(travelPart1.length).toBe(1);
  });

  test('marks attempted:false for every question when no userId is given', async () => {
    await createSpeakingQuestion({ topic: 'Travel', part: 1 });
    const result = await speakingService.listQuestions({ topic: 'all', part: 'all' });
    expect(result.every(q => q.attempted === false)).toBe(true);
  });

  test('marks attempted:true only for questions this user has an attempt on', async () => {
    const student = await createStudent();
    const attempted = await createSpeakingQuestion({ topic: 'Travel', part: 1 });
    const untouched = await createSpeakingQuestion({ topic: 'Food', part: 1 });
    await SpeakingAttempt.create({ userId: student._id, questionId: attempted._id, topic: 'Travel', part: 1 });

    const result = await speakingService.listQuestions({ topic: 'all', part: 'all', userId: student._id });
    const byId = Object.fromEntries(result.map(q => [q._id.toString(), q.attempted]));
    expect(byId[attempted._id.toString()]).toBe(true);
    expect(byId[untouched._id.toString()]).toBe(false);
  });

  test("does not leak one user's attempts onto another user's attempted flag", async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    const q = await createSpeakingQuestion({ topic: 'Travel', part: 1 });
    await SpeakingAttempt.create({ userId: studentA._id, questionId: q._id, topic: 'Travel', part: 1 });

    const resultB = await speakingService.listQuestions({ topic: 'all', part: 'all', userId: studentB._id });
    expect(resultB[0].attempted).toBe(false);
  });

  // Regression coverage for BUG-006 (2026-08-27 audit): sampleAnswer/hints
  // are cached on the question doc the first time ANY student reveals them
  // via POST /sample-answer or /hints — once cached, every future listing
  // of that question leaked the answer/hints to every other student before
  // they'd ever attempted it.
  test('never includes sampleAnswer/hints even once they are cached on the question', async () => {
    const q = await createSpeakingQuestion({
      topic: 'Travel', part: 1,
      sampleAnswer: 'This is the model answer.', hints: { vocab: ['itinerary', 'excursion'] },
    });

    const listed = await speakingService.listQuestions({ topic: 'all', part: 'all' });
    const found = listed.find(item => item._id.toString() === q._id.toString());
    expect(found.sampleAnswer).toBeUndefined();
    expect(found.hints).toBeUndefined();
    expect(found.question).toBe(q.question); // real content still present

    const random = await speakingService.getRandomQuestion({ topic: 'Travel', part: 1 });
    expect(random.sampleAnswer).toBeUndefined();
    expect(random.hints).toBeUndefined();
  });
});

describe('speakingService.saveAttempt', () => {
  test('maps the feedback object onto aiFeedback fields, including mistake->correction mapping', async () => {
    const student = await createStudent();
    const feedback = {
      overallBand: 7,
      fluency: 6.5,
      vocabulary: 7,
      grammar: 6,
      pronunciation: 7.5,
      overallFeedback: 'Good performance overall.',
      todaysFocus: 'Work on subject-verb agreement.',
      strengths: ['Clear pronunciation'],
      mistakes: [
        { original: 'He go to school', corrected: 'He goes to school', reason: 'Subject-verb agreement' },
      ],
      improvements: ['Use more linking words'],
    };

    const { attemptId } = await speakingService.saveAttempt(student, {
      questionId: null, topic: 'Travel', part: 2,
      questionText: 'Describe a memorable trip.', transcript: 'He go to school yesterday for a trip',
      duration: 45, feedback,
    });

    expect(attemptId).not.toBeNull();
    const saved = await SpeakingAttempt.findOne({ userId: student._id }).lean();
    expect(saved).not.toBeNull();
    expect(saved.status).toBe('analyzed');
    expect(saved.aiFeedback.overallBand).toBe(7);
    expect(saved.aiFeedback.fluency).toBe(6.5);
    expect(saved.aiFeedback.overallFeedback).toBe('Good performance overall.');
    expect(saved.aiFeedback.todaysFocus).toBe('Work on subject-verb agreement.');
    // Stage 1 no longer generates a corrected version — stays empty on save.
    expect(saved.aiFeedback.correctedVersion).toBe('');
    expect(saved.aiFeedback.strengths).toEqual(['Clear pronunciation']);
    expect(saved.aiFeedback.suggestions).toEqual(['Use more linking words']);
    // corrections is a subdocument array (not {_id:false}), so each entry
    // carries a Mongo-assigned _id alongside the mapped fields.
    expect(saved.aiFeedback.corrections).toEqual([
      expect.objectContaining({ original: 'He go to school', corrected: 'He goes to school', explanation: 'Subject-verb agreement' }),
    ]);
  });

  test('coerces object-shaped strengths/improvements to plain strings instead of "[object Object]"', async () => {
    // Regression test: the AI occasionally returns {"phrase":..,"reason":..}
    // instead of a plain string for strengths/improvements (the prompt's
    // "quoting a specific word/phrase" wording reads similarly to the
    // structured mistakes/vocabUpgrades rules). The frontend renders these
    // with a bare `${s}`, so an un-coerced object silently rendered as the
    // literal text "[object Object]" in the student UI.
    const student = await createStudent();
    const feedback = {
      overallBand: 6, fluency: 6, vocabulary: 6, grammar: 6, pronunciation: 6,
      overallFeedback: 'ok', todaysFocus: 'ok',
      strengths: [
        { phrase: "Used 'largely because' correctly", reason: 'adds reasoning' },
        'Already a plain string',
      ],
      mistakes: [],
      improvements: [{ suggestion: 'Use more linking words' }],
    };

    await speakingService.saveAttempt(student, {
      questionId: null, topic: 'Travel', part: 2,
      questionText: 'Describe a memorable trip.', transcript: 'Some transcript',
      duration: 45, feedback,
    });

    const saved = await SpeakingAttempt.findOne({ userId: student._id }).lean();
    expect(saved.aiFeedback.strengths).toEqual([
      "Used 'largely because' correctly", 'Already a plain string',
    ]);
    expect(saved.aiFeedback.suggestions).toEqual(['Use more linking words']);
  });

  test('never throws even when persistence fails (invalid part enum) — resolves null', async () => {
    const student = await createStudent();
    const feedback = { overallBand: 5, mistakes: [], strengths: [], improvements: [] };

    const result = await speakingService.saveAttempt(student, {
      questionId: null, topic: 'Travel', part: 99, // not in enum [1,2,3] -> save() validation fails
      questionText: 'Q', transcript: 'T', duration: 10, feedback,
    });
    expect(result.attemptId).toBeNull();
    expect(result.newlyUnlocked).toEqual([]);

    const count = await SpeakingAttempt.countDocuments({ userId: student._id });
    expect(count).toBe(0); // the failed save left nothing behind
  });
});

describe('speakingService pending attempt flow', () => {
  // Regression coverage for the bug where a Part 2/3 submission that hit
  // Gemini's JSON-truncation retry (or failed outright) never appeared in
  // admin/student history at all — analyze() used to call gradeSpeaking()
  // and only ever save an attempt AFTER it succeeded.
  test('createPendingAttempt persists immediately with status pending, before any feedback exists', async () => {
    const student = await createStudent();
    const pendingId = await speakingService.createPendingAttempt(student._id, {
      questionId: null, topic: 'Travel', part: 2,
      questionText: 'Describe a memorable trip.', transcript: 'Some long part 2 transcript...',
      duration: 90,
    });

    expect(pendingId).not.toBeNull();
    const saved = await SpeakingAttempt.findById(pendingId).lean();
    expect(saved.status).toBe('pending');
    expect(saved.transcript).toBe('Some long part 2 transcript...');
    expect(saved.aiFeedback.overallBand).toBe(0);
  });

  test('finalizeAttempt fills in feedback and flips status to analyzed on the SAME document', async () => {
    const student = await createStudent();
    const pendingId = await speakingService.createPendingAttempt(student._id, {
      questionId: null, topic: 'Travel', part: 2,
      questionText: 'Describe a memorable trip.', transcript: 'transcript', duration: 90,
    });

    const { attemptId: finalId } = await speakingService.finalizeAttempt(pendingId, {
      overallBand: 6.5, fluency: 6, vocabulary: 7, grammar: 6, pronunciation: 6.5,
      overallFeedback: 'Solid attempt.', strengths: ['Good range'], mistakes: [], improvements: [],
    });

    expect(String(finalId)).toBe(String(pendingId));
    const count = await SpeakingAttempt.countDocuments({ userId: student._id });
    expect(count).toBe(1); // finalize updates in place, does not create a second row

    const saved = await SpeakingAttempt.findById(pendingId).lean();
    expect(saved.status).toBe('analyzed');
    expect(saved.aiFeedback.overallBand).toBe(6.5);
    expect(saved.aiFeedback.overallFeedback).toBe('Solid attempt.');
  });

  test('markAttemptError flips a pending attempt to error instead of leaving/deleting it', async () => {
    const student = await createStudent();
    const pendingId = await speakingService.createPendingAttempt(student._id, {
      questionId: null, topic: 'Travel', part: 2,
      questionText: 'Describe a memorable trip.', transcript: 'transcript', duration: 90,
    });

    await speakingService.markAttemptError(pendingId);

    const saved = await SpeakingAttempt.findById(pendingId).lean();
    expect(saved.status).toBe('error');
    expect(saved.transcript).toBe('transcript'); // the student's answer is not lost
  });
});

describe('speakingService.gradeSpeaking', () => {
  const ORIGINAL_GROQ_KEY = process.env.GROQ_API_KEY;
  afterEach(() => {
    jest.clearAllMocks();
    if (ORIGINAL_GROQ_KEY === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = ORIGINAL_GROQ_KEY;
  });

  test('recomputes overallBand as the rounded average of the 4 sub-scores, ignoring a divergent self-reported value', async () => {
    // Gemini reports overallBand: 0 despite valid, non-zero sub-scores —
    // exactly the "band 0.0 despite a real grade" bug from the audit.
    geminiService.checkSpeaking.mockResolvedValue({
      overallBand: 0, fluency: 6, vocabulary: 6, grammar: 6, pronunciation: 6,
      overallFeedback: 'ok', strengths: [], mistakes: [], improvements: [],
    });
    const result = await speakingService.gradeSpeaking('Q', 'transcript', 1);
    expect(result.overallBand).toBe(6);
  });

  test('rounds a mixed average to the nearest 0.5 (same convention as Writing grading)', async () => {
    geminiService.checkSpeaking.mockResolvedValue({
      overallBand: 9, fluency: 6, vocabulary: 7, grammar: 6, pronunciation: 6.5, // avg 6.375 -> 6.5
      overallFeedback: '', strengths: [], mistakes: [], improvements: [],
    });
    const result = await speakingService.gradeSpeaking('Q', 'transcript', 1);
    expect(result.overallBand).toBe(6.5);
  });

  test('falls back to Groq on a plain (non-overloaded) Gemini error when GROQ_API_KEY is set', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const plainErr = new Error('Malformed JSON response');
    geminiService.checkSpeaking.mockRejectedValue(plainErr);
    groqService.checkSpeakingGroq.mockResolvedValue({
      overallBand: 0, fluency: 7, vocabulary: 7, grammar: 7, pronunciation: 7,
      overallFeedback: 'from groq', strengths: [], mistakes: [], improvements: [],
    });

    const result = await speakingService.gradeSpeaking('Q', 'transcript', 1);
    expect(groqService.checkSpeakingGroq).toHaveBeenCalled();
    expect(result.overallFeedback).toBe('from groq');
    expect(result.overallBand).toBe(7); // recomputed after the fallback result too
  });

  test('falls back to Groq on an isOverloaded Gemini error (existing behavior preserved)', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const overloadedErr = new Error('AI đang quá tải');
    overloadedErr.isOverloaded = true;
    geminiService.checkSpeaking.mockRejectedValue(overloadedErr);
    groqService.checkSpeakingGroq.mockResolvedValue({
      overallBand: 5, fluency: 5, vocabulary: 5, grammar: 5, pronunciation: 5,
      overallFeedback: 'from groq', strengths: [], mistakes: [], improvements: [],
    });

    const result = await speakingService.gradeSpeaking('Q', 'transcript', 1);
    expect(groqService.checkSpeakingGroq).toHaveBeenCalled();
    expect(result.overallBand).toBe(5);
  });

  test('propagates the original Gemini error when GROQ_API_KEY is not set (no fallback attempted)', async () => {
    delete process.env.GROQ_API_KEY;
    const plainErr = new Error('Malformed JSON response');
    geminiService.checkSpeaking.mockRejectedValue(plainErr);

    await expect(speakingService.gradeSpeaking('Q', 'transcript', 1)).rejects.toThrow('Malformed JSON response');
    expect(groqService.checkSpeakingGroq).not.toHaveBeenCalled();
  });

  test('propagates the ORIGINAL Gemini error (not the Groq one) when Groq fallback also fails', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    geminiService.checkSpeaking.mockRejectedValue(new Error('Gemini failed'));
    groqService.checkSpeakingGroq.mockRejectedValue(new Error('Groq also failed'));

    await expect(speakingService.gradeSpeaking('Q', 'transcript', 1)).rejects.toThrow('Gemini failed');
  });
});

describe('speakingService.getSampleAnswer', () => {
  afterEach(() => jest.clearAllMocks());

  test('serves a cached sampleAnswer with zero Gemini calls', async () => {
    const q = await createSpeakingQuestion({ sampleAnswer: 'Already cached answer.' });
    const result = await speakingService.getSampleAnswer(q._id.toString(), q.question, q.part, '');
    expect(result.sampleAnswer).toBe('Already cached answer.');
    expect(geminiService.generateSampleAnswer).not.toHaveBeenCalled();
  });

  test('generates and caches sampleAnswer + vocab together on a cache miss', async () => {
    const q = await createSpeakingQuestion({ sampleAnswer: '' });
    geminiService.generateSampleAnswer.mockResolvedValue({
      sampleAnswer: 'Fresh answer.', vocab: ['strike a balance', 'take a keen interest'],
    });

    const result = await speakingService.getSampleAnswer(q._id.toString(), q.question, q.part, '');
    expect(result.sampleAnswer).toBe('Fresh answer.');

    const SpeakingQuestion = require('../../../models/SpeakingQuestion');
    const saved = await waitFor(async () => {
      const doc = await SpeakingQuestion.findById(q._id).lean();
      return doc.sampleAnswer ? doc : null;
    });
    expect(saved.sampleAnswer).toBe('Fresh answer.');
    expect(saved.hints.vocab).toEqual(['strike a balance', 'take a keen interest']);
  });
});

describe('speakingService.getSpeakingHints', () => {
  afterEach(() => jest.clearAllMocks());

  test('serves cached hints.vocab with zero AI calls when already cached', async () => {
    const q = await createSpeakingQuestion({
      sampleAnswer: 'Cached sample.',
      hints: { vocab: ['a great way to unwind'] },
    });
    const result = await speakingService.getSpeakingHints(q._id.toString(), q.question, q.part, '');
    expect(result.hints.vocab).toEqual(['a great way to unwind']);
    expect(geminiService.generateSampleAnswer).not.toHaveBeenCalled();
  });

  test('never needs a separate hints-extraction AI call — vocab rides on the sample generation', async () => {
    const q = await createSpeakingQuestion({ sampleAnswer: '' });
    geminiService.generateSampleAnswer.mockResolvedValue({
      sampleAnswer: 'Freshly generated sample.', vocab: ['make a lasting impression'],
    });

    const result = await speakingService.getSpeakingHints(q._id.toString(), q.question, q.part, '');
    expect(result.hints.vocab).toEqual(['make a lasting impression']);
    expect(geminiService.generateSampleAnswer).toHaveBeenCalledTimes(1);

    const SpeakingQuestion = require('../../../models/SpeakingQuestion');
    const saved = await waitFor(async () => {
      const doc = await SpeakingQuestion.findById(q._id).lean();
      return doc.sampleAnswer ? doc : null;
    });
    expect(saved.hints.vocab).toEqual(['make a lasting impression']);
    expect(saved.sampleAnswer).toBe('Freshly generated sample.'); // no sampleAnswer was cached yet, so this regen's is kept
  });

  test('self-heals a legacy question that has a cached sampleAnswer but no vocab yet, without overwriting the existing sampleAnswer', async () => {
    const q = await createSpeakingQuestion({ sampleAnswer: 'Original curated answer.', hints: { vocab: [] } });
    geminiService.generateSampleAnswer.mockResolvedValue({
      sampleAnswer: 'A different regenerated answer.', vocab: ['a specific time you did this'],
    });

    const result = await speakingService.getSpeakingHints(q._id.toString(), q.question, q.part, '');
    expect(result.hints.vocab).toEqual(['a specific time you did this']);

    const SpeakingQuestion = require('../../../models/SpeakingQuestion');
    const saved = await waitFor(async () => {
      const doc = await SpeakingQuestion.findById(q._id).lean();
      return doc.hints.vocab.length ? doc : null;
    });
    expect(saved.sampleAnswer).toBe('Original curated answer.'); // untouched — never clobbered
    expect(saved.hints.vocab).toEqual(['a specific time you did this']);
  });

  test('falls back to Groq for vocab generation on a plain Gemini error', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const q = await createSpeakingQuestion({ sampleAnswer: '' });
    geminiService.generateSampleAnswer.mockRejectedValue(new Error('Gemini failed'));
    groqService.generateSampleAnswerGroq.mockResolvedValue({
      sampleAnswer: 'From groq.', vocab: ['from groq vocab'],
    });

    const result = await speakingService.getSpeakingHints(q._id.toString(), q.question, q.part, '');
    expect(result.hints.vocab).toEqual(['from groq vocab']);
    expect(groqService.generateSampleAnswerGroq).toHaveBeenCalled();
  });
});

describe('speakingService.retryGrading', () => {
  afterEach(() => jest.clearAllMocks());

  test('returns not_found for a nonexistent attempt or one belonging to a different user', async () => {
    const student = await createStudent();
    const other = await createStudent();
    const attempt = await SpeakingAttempt.create({ userId: other._id, part: 1, question: 'Q', transcript: 't', status: 'error' });

    const result = await speakingService.retryGrading(attempt._id, student);
    expect(result.status).toBe('not_found');
  });

  test('refuses to re-grade an already-analyzed attempt', async () => {
    const student = await createStudent();
    const attempt = await SpeakingAttempt.create({
      userId: student._id, part: 1, question: 'Q', transcript: 't', status: 'analyzed',
      aiFeedback: { overallBand: 6, fluency: 6, vocabulary: 6, grammar: 6, pronunciation: 6 },
    });

    const result = await speakingService.retryGrading(attempt._id, student);
    expect(result.status).toBe('already_analyzed');
    expect(geminiService.checkSpeaking).not.toHaveBeenCalled();
  });

  test('re-grades a pending/error attempt against its own stored transcript and finalizes it', async () => {
    process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'test-key';
    const student = await createStudent();
    const attempt = await SpeakingAttempt.create({
      userId: student._id, part: 2, question: 'Describe a trip.', transcript: 'my stored transcript', status: 'error',
    });
    geminiService.checkSpeaking.mockResolvedValue({
      overallBand: 0, fluency: 6, vocabulary: 6, grammar: 6, pronunciation: 6,
      overallFeedback: 'retried ok', strengths: [], mistakes: [], improvements: [],
    });

    const result = await speakingService.retryGrading(attempt._id, student);
    expect(result.status).toBe('ok');
    expect(geminiService.checkSpeaking).toHaveBeenCalledWith('Describe a trip.', 'my stored transcript', 2);

    const saved = await SpeakingAttempt.findById(attempt._id).lean();
    expect(saved.status).toBe('analyzed');
    expect(saved.aiFeedback.overallBand).toBe(6);
  });

  test('marks the attempt error again (not deleted) when the re-grade also fails', async () => {
    delete process.env.GROQ_API_KEY;
    const student = await createStudent();
    const attempt = await SpeakingAttempt.create({
      userId: student._id, part: 1, question: 'Q', transcript: 't', status: 'pending',
    });
    geminiService.checkSpeaking.mockRejectedValue(new Error('still failing'));

    await expect(speakingService.retryGrading(attempt._id, student)).rejects.toThrow('still failing');

    const saved = await SpeakingAttempt.findById(attempt._id).lean();
    expect(saved.status).toBe('error');
  });
});

describe('speakingService.getHistory', () => {
  test('returns only the requesting user\'s attempts, most recent first', async () => {
    const student = await createStudent();
    const other = await createStudent();

    await SpeakingAttempt.create({ userId: other._id, part: 1, question: 'Other', transcript: 't' });
    const first = await SpeakingAttempt.create({ userId: student._id, part: 1, question: 'First', transcript: 't' });
    await new Promise(r => setTimeout(r, 5));
    const second = await SpeakingAttempt.create({ userId: student._id, part: 1, question: 'Second', transcript: 't' });

    const { attempts, total } = await speakingService.getHistory(student._id);
    expect(attempts.length).toBe(2);
    expect(attempts[0]._id.toString()).toBe(second._id.toString());
    expect(attempts[1]._id.toString()).toBe(first._id.toString());
    expect(total).toBe(2);
  });

  // Regression coverage for BUG-013 (2026-08-27 audit): same fix as
  // reading/listening — an honest total independent of the requested limit.
  test('getHistory() reports an honest total independent of the limit', async () => {
    const student = await createStudent();
    for (let i = 0; i < 4; i++) {
      await SpeakingAttempt.create({ userId: student._id, part: 1, question: `Q${i}`, transcript: 't' });
    }

    const page = await speakingService.getHistory(student._id, 2);
    expect(page.attempts).toHaveLength(2);
    expect(page.total).toBe(4);
  });
});

describe('speakingService.listMaterials / getMaterialFilters', () => {
  async function seedMaterials() {
    await SpeakingMaterial.create([
      { title: 'M1', quarter: 'Q1 2025', topic: 'Environment', pdfUrl: 'a.pdf' },
      { title: 'M2', quarter: 'Q2 2025', topic: 'Technology', pdfUrl: 'b.pdf' },
      { title: 'M3', quarter: 'Q1 2025', topic: 'Technology', pdfUrl: 'c.pdf' },
    ]);
  }

  test('listMaterials filters by quarter/topic, "all" means no filter', async () => {
    await seedMaterials();
    const q1 = await speakingService.listMaterials({ quarter: 'Q1 2025', topic: 'all' });
    expect(q1.length).toBe(2);

    const techOnly = await speakingService.listMaterials({ quarter: 'all', topic: 'Technology' });
    expect(techOnly.length).toBe(2);

    const combined = await speakingService.listMaterials({ quarter: 'Q1 2025', topic: 'Technology' });
    expect(combined.length).toBe(1);
    expect(combined[0].title).toBe('M3');
  });

  test('getMaterialFilters returns distinct quarters (desc) and topics (asc)', async () => {
    await seedMaterials();
    const filters = await speakingService.getMaterialFilters();
    expect(filters.quarters).toEqual(['Q2 2025', 'Q1 2025']);
    expect(filters.topics).toEqual(['Environment', 'Technology']);
  });
});
