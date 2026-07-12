// Unit tests for services/speakingService.js. gradeSpeaking() is a thin
// delegate to geminiService.checkSpeaking and is deliberately NOT exercised
// here — no real/mocked Gemini call is made in this file.
const speakingService = require('../../../services/speakingService');
const SpeakingAttempt = require('../../../models/SpeakingAttempt');
const SpeakingMaterial = require('../../../models/SpeakingMaterial');
const { createStudent } = require('../../factories/userFactory');
const { createSpeakingQuestion } = require('../../factories/contentFactory');

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
});

describe('speakingService.saveAttempt', () => {
  test('maps the feedback object onto aiFeedback fields, including error->correction mapping', async () => {
    const student = await createStudent();
    const feedback = {
      overall_band: 7,
      fluency: 6.5,
      vocabulary: 7,
      grammar: 6,
      pronunciation: 7.5,
      overall_feedback: 'Good performance overall.',
      corrected: 'Corrected transcript text.',
      strengths: ['Clear pronunciation'],
      errors: [
        { wrong: 'He go to school', right: 'He goes to school', tip: 'Subject-verb agreement' },
      ],
      improvements: ['Use more linking words'],
    };

    await speakingService.saveAttempt(student._id, {
      questionId: null, topic: 'Travel', part: 2,
      questionText: 'Describe a memorable trip.', transcript: 'He go to school yesterday for a trip',
      duration: 45, feedback,
    });

    const saved = await SpeakingAttempt.findOne({ userId: student._id }).lean();
    expect(saved).not.toBeNull();
    expect(saved.status).toBe('analyzed');
    expect(saved.aiFeedback.overallBand).toBe(7);
    expect(saved.aiFeedback.fluency).toBe(6.5);
    expect(saved.aiFeedback.overallFeedback).toBe('Good performance overall.');
    expect(saved.aiFeedback.correctedVersion).toBe('Corrected transcript text.');
    expect(saved.aiFeedback.strengths).toEqual(['Clear pronunciation']);
    expect(saved.aiFeedback.suggestions).toEqual(['Use more linking words']);
    // corrections is a subdocument array (not {_id:false}), so each entry
    // carries a Mongo-assigned _id alongside the mapped fields.
    expect(saved.aiFeedback.corrections).toEqual([
      expect.objectContaining({ original: 'He go to school', corrected: 'He goes to school', explanation: 'Subject-verb agreement' }),
    ]);
  });

  test('never throws even when persistence fails (invalid part enum)', async () => {
    const student = await createStudent();
    const feedback = { overall_band: 5, errors: [], strengths: [], improvements: [] };

    await expect(speakingService.saveAttempt(student._id, {
      questionId: null, topic: 'Travel', part: 99, // not in enum [1,2,3] -> save() validation fails
      questionText: 'Q', transcript: 'T', duration: 10, feedback,
    })).resolves.toBeUndefined();

    const count = await SpeakingAttempt.countDocuments({ userId: student._id });
    expect(count).toBe(0); // the failed save left nothing behind
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

    const history = await speakingService.getHistory(student._id);
    expect(history.length).toBe(2);
    expect(history[0]._id.toString()).toBe(second._id.toString());
    expect(history[1]._id.toString()).toBe(first._id.toString());
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
