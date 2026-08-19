'use strict';

const searchService = require('../../../services/searchService');
const ReadingTip = require('../../../models/ReadingTip');
const VocabularyLesson = require('../../../models/VocabularyLesson');
const ListeningSection = require('../../../models/ListeningSection');
const WritingTask1 = require('../../../models/WritingTask1');
const WritingTask2 = require('../../../models/WritingTask2');
const SpeakingQuestion = require('../../../models/SpeakingQuestion');
const { createReadingTest, createListeningTest, createVocabUnit } = require('../../factories/contentFactory');
const { createStudent, createTeacher } = require('../../factories/userFactory');

describe('searchService.search', () => {
  it('finds a Reading test by a partial, case-insensitive name match', async () => {
    await createReadingTest({ name: 'Orange Test 20' });
    const student = await createStudent();

    const results = await searchService.search('orange', student);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ category: 'Reading', label: 'Orange Test 20' });
    expect(results[0].url).toMatch(/^reading\.html\?testId=/);
  });

  it('finds a Listening test by its name field (not a nested section title)', async () => {
    await createListeningTest({ name: 'Cambridge 18 Test 3' });
    const student = await createStudent();

    const results = await searchService.search('cambridge 18', student);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ category: 'Listening', label: 'Cambridge 18 Test 3' });
    expect(results[0].url).toMatch(/^listening\.html\?testId=/);
  });

  it('finds a Vocab Paraphrase unit by title', async () => {
    await createVocabUnit({ title: 'Environment Vocabulary' });
    const student = await createStudent();

    const results = await searchService.search('environment', student);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ category: 'Vocab · Paraphrase', label: 'Environment Vocabulary' });
  });

  it('excludes an inactive Reading test', async () => {
    await createReadingTest({ name: 'Hidden Test', isActive: false });
    const student = await createStudent();

    const results = await searchService.search('hidden', student);
    expect(results).toHaveLength(0);
  });

  it('finds a Reading Tip by title', async () => {
    await ReadingTip.create({ category: 'skimming', lessonKey: 'l1', title: 'Skimming for gist' });
    const student = await createStudent();

    const results = await searchService.search('skimming', student);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ category: 'Reading Tips', label: 'Skimming for gist', url: 'reading.html?mode=tips' });
  });

  it('finds a standalone Listening section ("bài lẻ") by title, linking to its sectionId/part', async () => {
    await ListeningSection.create({ title: 'Booking Flights', partNumber: 1, transcript: 't', audioUrl: 'a' });
    const student = await createStudent();

    const results = await searchService.search('booking', student);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ category: 'Listening · Bài lẻ', label: 'Booking Flights' });
    expect(results[0].url).toMatch(/^listening\.html\?sectionId=.+&part=1$/);
  });

  it('finds a Writing Task 1 by prompt text, truncating a long prompt for the label', async () => {
    const longPrompt = 'The bar chart below shows '.repeat(6) + 'life expectancy in several countries.';
    await WritingTask1.create({ prompt: longPrompt });
    const student = await createStudent();

    const results = await searchService.search('life expectancy', student);

    expect(results).toHaveLength(1);
    expect(results[0].category).toBe('Writing Task 1');
    expect(results[0].label.length).toBeLessThan(longPrompt.length);
    expect(results[0].label.endsWith('…')).toBe(true);
    expect(results[0].url).toMatch(/^writing\.html\?taskType=1&taskId=/);
  });

  it('finds a Writing Task 2 by prompt text', async () => {
    await WritingTask2.create({ prompt: 'Some people believe technology makes life more complex.' });
    const student = await createStudent();

    const results = await searchService.search('technology', student);

    expect(results).toHaveLength(1);
    expect(results[0].category).toBe('Writing Task 2');
    expect(results[0].url).toMatch(/^writing\.html\?taskType=2&taskId=/);
  });

  it('finds a Speaking topic, deduplicating across multiple questions on the same topic', async () => {
    await SpeakingQuestion.create({ topic: 'A memorable holiday', part: 1, question: 'Where did you go?' });
    await SpeakingQuestion.create({ topic: 'A memorable holiday', part: 3, question: 'Why do people travel?' });
    const student = await createStudent();

    const results = await searchService.search('memorable holiday', student);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ category: 'Speaking', label: 'A memorable holiday' });
    expect(results[0].url).toBe('speaking.html?tab=practice&topic=A%20memorable%20holiday');
  });

  it('excludes an inactive Speaking question from topic results', async () => {
    await SpeakingQuestion.create({ topic: 'Retired topic', part: 1, question: 'Q?', isActive: false });
    const student = await createStudent();

    const results = await searchService.search('retired topic', student);
    expect(results).toHaveLength(0);
  });

  describe('VocabularyLesson class-scoping (mirrors listPublicLessons)', () => {
    it('includes an unscoped (no targetClass) published lesson for any student', async () => {
      const teacher = await createTeacher();
      await VocabularyLesson.create({ title: 'General Vocabulary', published: true, createdBy: teacher._id });
      const student = await createStudent({ extra: { className: '6.5' } });

      const results = await searchService.search('general vocabulary', student);
      expect(results).toHaveLength(1);
    });

    it('excludes a lesson scoped to a different class', async () => {
      const teacher = await createTeacher();
      await VocabularyLesson.create({ title: 'Class 7 Only', published: true, createdBy: teacher._id, targetClass: '7.0' });
      const student = await createStudent({ extra: { className: '6.5' } });

      const results = await searchService.search('class 7 only', student);
      expect(results).toHaveLength(0);
    });

    it('excludes an unpublished lesson', async () => {
      const teacher = await createTeacher();
      await VocabularyLesson.create({ title: 'Draft Lesson', published: false, createdBy: teacher._id });
      const student = await createStudent();

      const results = await searchService.search('draft lesson', student);
      expect(results).toHaveLength(0);
    });
  });

  it('escapes regex special characters in the query instead of throwing/matching too broadly', async () => {
    await createReadingTest({ name: 'C++ Basics Test' });
    const student = await createStudent();

    const results = await searchService.search('C++', student);
    expect(results).toHaveLength(1);
    expect(results[0].label).toBe('C++ Basics Test');
  });

  it('returns an empty array for a blank query', async () => {
    const student = await createStudent();
    const results = await searchService.search('   ', student);
    expect(results).toEqual([]);
  });

  it('caps results at 5 per category', async () => {
    for (let i = 0; i < 7; i++) {
      await createReadingTest({ name: `Repeated Match ${i}` });
    }
    const student = await createStudent();

    const results = await searchService.search('repeated match', student);
    expect(results).toHaveLength(5);
  });
});
