'use strict';

const searchService = require('../../../services/searchService');
const ReadingTip = require('../../../models/ReadingTip');
const VocabularyLesson = require('../../../models/VocabularyLesson');
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
