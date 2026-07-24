const svc = require('../../../services/vocabularyLessonService');
const VocabularyLesson = require('../../../models/VocabularyLesson');
const VocabularyLessonAttempt = require('../../../models/VocabularyLessonAttempt');
const VocabularyLessonAttemptLog = require('../../../models/VocabularyLessonAttemptLog');
const VocabularyLessonImportLog = require('../../../models/VocabularyLessonImportLog');
const { createTeacher, createStudent } = require('../../factories/userFactory');

const GOOD_LESSON = `@lesson
title=Week 12 - Environment
description=Environment Vocabulary
difficulty=B1
order=12

@word
word=sustainable
meaning=bền vững
example=Solar energy is a sustainable source of power.
definition=Able to continue without harming the environment.
distractors=renewable|temporary|harmful

@word
word=renewable
meaning=tái tạo
example=Wind power is renewable.
definition=Can naturally be replaced.
`;

const BAD_LESSON = `@lesson
title=Broken Lesson
difficulty=B1

@word
word=oops
meaning=x
`; // missing example/definition

describe('importLesson', () => {
  test('creates an unpublished lesson from valid text and copies the raw text into rawImport', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    expect(lesson.title).toBe('Week 12 - Environment');
    expect(lesson.published).toBe(false);
    expect(lesson.words).toHaveLength(2);
    expect(lesson.rawImport).toBe(GOOD_LESSON);
    expect(String(lesson.createdBy)).toBe(String(teacher._id));
  });

  test('logs a successful import to VocabularyLessonImportLog with the created lessonId', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    const entry = await VocabularyLessonImportLog.findOne({ lessonId: lesson._id });
    expect(entry).not.toBeNull();
    expect(entry.status).toBe('success');
    expect(entry.wordCount).toBe(2);
    expect(entry.title).toBe('Week 12 - Environment');
  });

  test('rejects invalid text, creates no lesson, but still logs the failed attempt with a recoverable title', async () => {
    const teacher = await createTeacher();
    await expect(svc.importLesson(teacher._id, BAD_LESSON)).rejects.toThrow(/Missing example/);

    const lessonCount = await VocabularyLesson.countDocuments({ title: 'Broken Lesson' });
    expect(lessonCount).toBe(0);

    const entry = await VocabularyLessonImportLog.findOne({ status: 'failed' });
    expect(entry).not.toBeNull();
    expect(entry.title).toBe('Broken Lesson'); // best-effort title even though it never became a lesson
    expect(entry.lessonId).toBeNull();
    expect(entry.errorMessages.some(e => e.includes('Missing example'))).toBe(true);
  });

  test('thrown validation error exposes the full error list as .validationErrors', async () => {
    const teacher = await createTeacher();
    try {
      await svc.importLesson(teacher._id, BAD_LESSON);
      throw new Error('should have thrown');
    } catch (err) {
      expect(err.validationErrors.length).toBeGreaterThan(0);
    }
  });
});

describe('reimportLesson', () => {
  test('replaces words/metadata and updates rawImport on success', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    const updatedText = GOOD_LESSON.replace('title=Week 12 - Environment', 'title=Week 12 (Updated)') + `
@word
word=pollution
meaning=ô nhiễm
example=Air pollution is a problem.
definition=Harmful substances in the environment.
`;
    const updated = await svc.reimportLesson(lesson._id, teacher._id, updatedText);
    expect(updated.title).toBe('Week 12 (Updated)');
    expect(updated.words).toHaveLength(3);
    expect(updated.rawImport).toBe(updatedText);
  });

  test('logs a second history entry pointing at the same lessonId', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);
    await svc.reimportLesson(lesson._id, teacher._id, GOOD_LESSON);

    const entries = await VocabularyLessonImportLog.find({ lessonId: lesson._id });
    expect(entries).toHaveLength(2);
  });

  test('rejects invalid text and leaves the existing lesson untouched', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    await expect(svc.reimportLesson(lesson._id, teacher._id, BAD_LESSON)).rejects.toThrow();

    const unchanged = await VocabularyLesson.findById(lesson._id).lean();
    expect(unchanged.words).toHaveLength(2);
    expect(unchanged.title).toBe('Week 12 - Environment');
  });

  test('returns null for a non-existent lesson id', async () => {
    const teacher = await createTeacher();
    const fakeId = new (require('mongoose').Types.ObjectId)();
    expect(await svc.reimportLesson(fakeId, teacher._id, GOOD_LESSON)).toBeNull();
  });
});

describe('updateLessonMeta', () => {
  test('updates only the provided fields, leaving words untouched', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    const updated = await svc.updateLessonMeta(lesson._id, { title: 'Renamed', order: 99 });
    expect(updated.title).toBe('Renamed');
    expect(updated.order).toBe(99);
    expect(updated.description).toBe('Environment Vocabulary'); // untouched
    expect(updated.words).toHaveLength(2); // untouched
  });

  test('rejects an invalid difficulty', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);
    await expect(svc.updateLessonMeta(lesson._id, { difficulty: 'Z9' })).rejects.toThrow(/Invalid difficulty/);
  });

  test('toggles published via the same payload path', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);
    const updated = await svc.updateLessonMeta(lesson._id, { published: true });
    expect(updated.published).toBe(true);
  });
});

describe('publish / unpublish / list visibility', () => {
  test('an unpublished lesson is invisible to listPublicLessons/getPublicLesson', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    expect(await svc.listPublicLessons()).toHaveLength(0);
    expect(await svc.getPublicLesson(lesson._id)).toBeNull();
  });

  test('setPublished(true) makes it visible; setPublished(false) hides it again', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    await svc.setPublished(lesson._id, true);
    expect(await svc.listPublicLessons()).toHaveLength(1);
    expect(await svc.getPublicLesson(lesson._id)).not.toBeNull();

    await svc.setPublished(lesson._id, false);
    expect(await svc.listPublicLessons()).toHaveLength(0);
  });

  test('getPublicLesson never exposes rawImport', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);
    await svc.setPublished(lesson._id, true);

    const pub = await svc.getPublicLesson(lesson._id);
    expect(pub.rawImport).toBeUndefined();
  });

  test('listAdminLessons includes both published and unpublished lessons with wordCount', async () => {
    const teacher = await createTeacher();
    await svc.importLesson(teacher._id, GOOD_LESSON);

    const admin = await svc.listAdminLessons();
    expect(admin).toHaveLength(1);
    expect(admin[0].wordCount).toBe(2);
    expect(admin[0].published).toBe(false);
  });
});

describe('duplicateLesson', () => {
  test('creates an independent unpublished copy with "(Copy)" suffix', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);
    await svc.setPublished(lesson._id, true);

    const dup = await svc.duplicateLesson(lesson._id, teacher._id);
    expect(dup.title).toBe('Week 12 - Environment (Copy)');
    expect(dup.published).toBe(false);
    expect(dup.words).toHaveLength(2);
    expect(String(dup._id)).not.toBe(String(lesson._id));

    // Editing the copy must not affect the original.
    await svc.updateLessonMeta(dup._id, { title: 'Changed' });
    const original = await VocabularyLesson.findById(lesson._id).lean();
    expect(original.title).toBe('Week 12 - Environment');
  });
});

describe('deleteLesson', () => {
  test('cascade-deletes attempts and the attempt-history log, but leaves import history intact', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);
    await svc.setPublished(lesson._id, true);
    await svc.submitAttempt(student._id, lesson._id, { correctCount: 1, totalCount: 2, timeSpent: 30 });

    await svc.deleteLesson(lesson._id);

    expect(await VocabularyLessonAttempt.countDocuments({ lessonId: lesson._id })).toBe(0);
    expect(await VocabularyLessonAttemptLog.countDocuments({ lessonId: lesson._id })).toBe(0);
    expect(await VocabularyLessonImportLog.countDocuments({ lessonId: lesson._id })).toBe(1);
    expect(await VocabularyLesson.findById(lesson._id)).toBeNull();
  });

  test('returns null for a lesson that does not exist', async () => {
    const fakeId = new (require('mongoose').Types.ObjectId)();
    expect(await svc.deleteLesson(fakeId)).toBeNull();
  });
});

describe('submitAttempt / getAttempt', () => {
  test('creates the aggregate row on first submission', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    expect(await svc.getAttempt(student._id, lesson._id)).toBeNull();

    const attempt = await svc.submitAttempt(student._id, lesson._id, { correctCount: 1, totalCount: 2, timeSpent: 30 });
    expect(attempt.score).toBe(50);
    expect(attempt.bestScore).toBe(50);
    expect(attempt.attemptCount).toBe(1);
    expect(attempt.completed).toBe(true);
    expect(attempt.timeSpent).toBe(30);
  });

  test('bestScore only ever increases; attemptCount and timeSpent accumulate', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    await svc.submitAttempt(student._id, lesson._id, { correctCount: 1, totalCount: 2, timeSpent: 30 }); // 50%
    const better = await svc.submitAttempt(student._id, lesson._id, { correctCount: 2, totalCount: 2, timeSpent: 20 }); // 100%
    expect(better.bestScore).toBe(100);
    expect(better.attemptCount).toBe(2);
    expect(better.timeSpent).toBe(50);

    const worse = await svc.submitAttempt(student._id, lesson._id, { correctCount: 0, totalCount: 2, timeSpent: 10 }); // 0%
    expect(worse.score).toBe(0);
    expect(worse.bestScore).toBe(100); // must not regress
    expect(worse.attemptCount).toBe(3);
    expect(worse.timeSpent).toBe(60);
  });

  test('each (userId, lessonId) pair gets its own independent attempt row', async () => {
    const teacher = await createTeacher();
    const studentA = await createStudent();
    const studentB = await createStudent();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    await svc.submitAttempt(studentA._id, lesson._id, { correctCount: 2, totalCount: 2, timeSpent: 10 });
    await svc.submitAttempt(studentB._id, lesson._id, { correctCount: 1, totalCount: 2, timeSpent: 10 });

    expect((await svc.getAttempt(studentA._id, lesson._id)).bestScore).toBe(100);
    expect((await svc.getAttempt(studentB._id, lesson._id)).bestScore).toBe(50);
  });

  test('clamps an out-of-range correctCount instead of producing a score above 100%', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    const attempt = await svc.submitAttempt(student._id, lesson._id, { correctCount: 999, totalCount: 2, timeSpent: 10 });
    expect(attempt.score).toBe(100);
  });

  test('also writes a history-log row alongside the aggregate row, every submission (not just the first)', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    await svc.submitAttempt(student._id, lesson._id, { correctCount: 1, totalCount: 2, timeSpent: 30, wrongWords: ['renewable'] });
    await svc.submitAttempt(student._id, lesson._id, { correctCount: 2, totalCount: 2, timeSpent: 20, wrongWords: [] });

    const logs = await VocabularyLessonAttemptLog.find({ userId: student._id, lessonId: lesson._id }).lean();
    expect(logs).toHaveLength(2); // one per submission, unlike the single aggregate row
    expect(logs.some(l => l.score === 50 && l.correct === 1 && l.wrong === 1)).toBe(true);
    expect(logs.some(l => l.score === 100 && l.correct === 2 && l.wrong === 0)).toBe(true);
  });

  test('caps and stringifies a malicious/oversized wrongWords payload instead of trusting it raw', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    const hugeArray = Array.from({ length: 500 }, (_, i) => ({ toString: () => `word${i}` })); // non-string entries too
    await svc.submitAttempt(student._id, lesson._id, { correctCount: 0, totalCount: 2, timeSpent: 5, wrongWords: hugeArray });

    const log = await VocabularyLessonAttemptLog.findOne({ userId: student._id, lessonId: lesson._id }).lean();
    expect(log.wrongWords.length).toBeLessThanOrEqual(300);
    expect(typeof log.wrongWords[0]).toBe('string');
  });
});

describe('listImportHistory', () => {
  test('newest first, with the destination lesson\'s live title/published state joined in', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);
    await svc.setPublished(lesson._id, true);
    await svc.updateLessonMeta(lesson._id, { title: 'Renamed After Import' });

    const history = await svc.listImportHistory(10);
    expect(history).toHaveLength(1);
    expect(history[0].currentTitle).toBe('Renamed After Import'); // reflects the rename, not the log's own snapshot
    expect(history[0].published).toBe(true);
    expect(history[0].lessonExists).toBe(true);
  });

  test('falls back to the log\'s own snapshot title when the lesson has since been deleted', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);
    await svc.deleteLesson(lesson._id);

    const history = await svc.listImportHistory(10);
    expect(history).toHaveLength(1);
    expect(history[0].currentTitle).toBe('Week 12 - Environment');
    expect(history[0].lessonExists).toBe(false);
    expect(history[0].published).toBe(false);
  });

  test('never includes rawText in the list view (fetched separately via getImportHistoryEntry)', async () => {
    const teacher = await createTeacher();
    await svc.importLesson(teacher._id, GOOD_LESSON);
    const history = await svc.listImportHistory(10);
    expect(history[0].rawText).toBeUndefined();
  });

  test('getImportHistoryEntry returns the full raw text for recovery', async () => {
    const teacher = await createTeacher();
    await svc.importLesson(teacher._id, GOOD_LESSON);
    const history = await svc.listImportHistory(10);
    const entry = await svc.getImportHistoryEntry(history[0]._id);
    expect(entry.rawText).toBe(GOOD_LESSON);
  });
});

// Regression coverage for the production audit's "no cap before hitting
// MongoDB's own 16MB/document BSON ceiling" finding — these enforce
// friendly, specific rejections well before that point.
describe('import limits', () => {
  function lessonWithWordCount(n, title) {
    let text = `@lesson\ntitle=${title}\ndifficulty=B1\n\n`;
    for (let i = 0; i < n; i++) {
      text += `@word\nword=testword${i}\nmeaning=nghia${i}\nexample=Sentence with testword${i} in it.\ndefinition=Def ${i}.\n\n`;
    }
    return text;
  }

  test('rejects raw text over 200KB with a friendly message, not a raw parse attempt', () => {
    const huge = '@lesson\ntitle=Huge\ndifficulty=B1\n\n' + '#'.repeat(210 * 1024);
    const result = svc.parseText(huge);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/quá lớn.*200KB/);
    expect(result.lesson).toBeNull();
  });

  test('rejects a lesson over 300 words even though every word itself is valid', () => {
    const result = svc.parseText(lessonWithWordCount(301, 'Big'));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('301 từ') && e.includes('300'))).toBe(true);
  });

  test('accepts exactly 300 words (boundary)', () => {
    const result = svc.parseText(lessonWithWordCount(300, 'Exactly300'));
    expect(result.valid).toBe(true);
    expect(result.words).toHaveLength(300);
  });

  test('importLesson() rejects an over-limit lesson before ever calling VocabularyLesson.create', async () => {
    const teacher = await createTeacher();
    await expect(svc.importLesson(teacher._id, lessonWithWordCount(301, 'TooBig'))).rejects.toThrow(/300/);
    expect(await VocabularyLesson.countDocuments({ title: 'TooBig' })).toBe(0);
  });

  test('importLesson() rejects once the lesson-count cap (100) is reached, without touching existing lessons', async () => {
    const teacher = await createTeacher();
    const filler = Array.from({ length: 100 }, (_, i) => ({
      title: `Filler ${i}`, difficulty: 'B1', order: i, published: false, createdBy: teacher._id,
      words: [{ word: 'x', meaning: 'y', example: 'x.', definition: 'x' }],
    }));
    await VocabularyLesson.insertMany(filler);

    await expect(svc.importLesson(teacher._id, lessonWithWordCount(1, 'OneTooMany'))).rejects.toThrow(/100 bài học/);
    expect(await VocabularyLesson.countDocuments({})).toBe(100); // no partial/extra doc created
  });

  test('reimportLesson() is subject to the same word-count limit as import', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);
    await expect(svc.reimportLesson(lesson._id, teacher._id, lessonWithWordCount(301, lesson.title))).rejects.toThrow(/300/);
    const unchanged = await VocabularyLesson.findById(lesson._id).lean();
    expect(unchanged.words).toHaveLength(2); // untouched
  });
});

describe('getAttemptHistory', () => {
  test('returns this user+lesson\'s submissions newest-first, without exposing wrongWords', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    await svc.submitAttempt(student._id, lesson._id, { correctCount: 1, totalCount: 2, timeSpent: 30, wrongWords: ['renewable'] });
    await new Promise(r => setTimeout(r, 5));
    await svc.submitAttempt(student._id, lesson._id, { correctCount: 2, totalCount: 2, timeSpent: 20, wrongWords: [] });

    const history = await svc.getAttemptHistory(student._id, lesson._id);
    expect(history).toHaveLength(2);
    expect(history[0].score).toBe(100); // most recent first
    expect(history[1].score).toBe(50);
    expect(history[0].wrongWords).toBeUndefined();
    expect(history[0].createdAt).toBeDefined();
  });

  test('is scoped to exactly (userId, lessonId) — never leaks another student\'s or another lesson\'s rows', async () => {
    const teacher = await createTeacher();
    const studentA = await createStudent();
    const studentB = await createStudent();
    const lessonA = await svc.importLesson(teacher._id, GOOD_LESSON);
    const lessonB = await svc.importLesson(teacher._id, GOOD_LESSON.replace('Week 12 - Environment', 'Week 13'));

    await svc.submitAttempt(studentA._id, lessonA._id, { correctCount: 1, totalCount: 2, timeSpent: 1 });
    await svc.submitAttempt(studentB._id, lessonA._id, { correctCount: 1, totalCount: 2, timeSpent: 1 });
    await svc.submitAttempt(studentA._id, lessonB._id, { correctCount: 1, totalCount: 2, timeSpent: 1 });

    expect(await svc.getAttemptHistory(studentA._id, lessonA._id)).toHaveLength(1);
  });

  test('respects the limit parameter', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);
    for (let i = 0; i < 5; i++) {
      await svc.submitAttempt(student._id, lesson._id, { correctCount: 1, totalCount: 2, timeSpent: 1 });
    }
    expect(await svc.getAttemptHistory(student._id, lesson._id, 3)).toHaveLength(3);
  });
});

describe('getLessonStudentBreakdown', () => {
  test('one row per student who has attempted, with populated name fields', async () => {
    const teacher = await createTeacher();
    const studentA = await createStudent({ firstName: 'Nguyen', lastName: 'A' });
    const studentB = await createStudent({ firstName: 'Tran', lastName: 'B' });
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    await svc.submitAttempt(studentA._id, lesson._id, { correctCount: 2, totalCount: 2, timeSpent: 10 });
    await svc.submitAttempt(studentB._id, lesson._id, { correctCount: 1, totalCount: 2, timeSpent: 10 });

    const rows = await svc.getLessonStudentBreakdown(lesson._id);
    expect(rows).toHaveLength(2);
    const a = rows.find(r => String(r.userId) === String(studentA._id));
    expect(a.firstName).toBe('Nguyen');
    expect(a.bestScore).toBe(100);
    expect(a.attemptCount).toBe(1);
  });

  test('returns an empty list for a lesson nobody has attempted yet', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);
    expect(await svc.getLessonStudentBreakdown(lesson._id)).toEqual([]);
  });
});

describe('getMostMissedWords', () => {
  test('counts wrongWords across all students/attempts for the lesson, most-missed first', async () => {
    const teacher = await createTeacher();
    const studentA = await createStudent();
    const studentB = await createStudent();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    await svc.submitAttempt(studentA._id, lesson._id, { correctCount: 0, totalCount: 2, timeSpent: 1, wrongWords: ['sustainable', 'renewable'] });
    await svc.submitAttempt(studentB._id, lesson._id, { correctCount: 1, totalCount: 2, timeSpent: 1, wrongWords: ['renewable'] });

    const missed = await svc.getMostMissedWords(lesson._id);
    expect(missed[0]).toEqual({ word: 'renewable', count: 2 });
    expect(missed.some(m => m.word === 'sustainable' && m.count === 1)).toBe(true);
  });

  test('is case-insensitive when grouping the same word', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    await svc.submitAttempt(student._id, lesson._id, { correctCount: 0, totalCount: 2, timeSpent: 1, wrongWords: ['Sustainable'] });
    await svc.submitAttempt(student._id, lesson._id, { correctCount: 0, totalCount: 2, timeSpent: 1, wrongWords: ['sustainable'] });

    const missed = await svc.getMostMissedWords(lesson._id);
    expect(missed).toHaveLength(1);
    expect(missed[0].count).toBe(2);
  });

  test('empty list when nobody has missed anything yet', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);
    expect(await svc.getMostMissedWords(lesson._id)).toEqual([]);
  });
});

describe('listAdminLessons — averageScore / lastActivity', () => {
  test('averageScore is the mean bestScore across attempt rows; null when nobody has attempted', async () => {
    const teacher = await createTeacher();
    const studentA = await createStudent();
    const studentB = await createStudent();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);

    let rows = await svc.listAdminLessons();
    expect(rows.find(r => String(r._id) === String(lesson._id)).averageScore).toBeNull();

    await svc.submitAttempt(studentA._id, lesson._id, { correctCount: 2, totalCount: 2, timeSpent: 1 }); // 100
    await svc.submitAttempt(studentB._id, lesson._id, { correctCount: 1, totalCount: 2, timeSpent: 1 }); // 50

    rows = await svc.listAdminLessons();
    const row = rows.find(r => String(r._id) === String(lesson._id));
    expect(row.averageScore).toBe(75);
    expect(row.completedCount).toBe(2);
    expect(row.lastActivity).toBeTruthy();
  });
});

describe('exportLessonStudentsCsv', () => {
  test('produces a header row plus one row per student, CRLF-separated', async () => {
    const teacher = await createTeacher();
    const student = await createStudent({ firstName: 'Nguyen', lastName: 'Van A', username: 'nguyenvana' });
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);
    await svc.submitAttempt(student._id, lesson._id, { correctCount: 2, totalCount: 2, timeSpent: 42 });

    const { title, csv } = await svc.exportLessonStudentsCsv(lesson._id);
    expect(title).toBe('Week 12 - Environment');
    const lines = csv.split('\r\n');
    expect(lines).toHaveLength(2); // header + 1 student
    expect(lines[0]).toContain('Student');
    expect(lines[1]).toContain('Nguyen Van A');
    expect(lines[1]).toContain('100'); // score
  });

  test('neutralizes a formula-leading name (CSV/Excel injection guard)', async () => {
    const teacher = await createTeacher();
    const student = await createStudent({ firstName: '=cmd|"/c calc"!A1', lastName: '' });
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);
    await svc.submitAttempt(student._id, lesson._id, { correctCount: 1, totalCount: 2, timeSpent: 1 });

    const { csv } = await svc.exportLessonStudentsCsv(lesson._id);
    expect(csv).toContain("\"'=cmd"); // leading quote defuses the formula
  });

  test('empty class still produces a valid header-only CSV', async () => {
    const teacher = await createTeacher();
    const lesson = await svc.importLesson(teacher._id, GOOD_LESSON);
    const { csv } = await svc.exportLessonStudentsCsv(lesson._id);
    expect(csv.split('\r\n')).toHaveLength(1);
  });
});
