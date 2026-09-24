'use strict';

// shared/clean-url-router.js — 404.html's table of clean paths → real pages
// (production ignores _redirects; see the file header).
const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  loadScript('clean-url-router.js');
});

const r = (path, search, hash) => window.CleanUrlRouter.resolve(path, search, hash);

describe('CleanUrlRouter.resolve', () => {
  test.each([
    ['/reading/test/abc', '/reading.html?testId=abc'],
    ['/reading/test/abc/simulation', '/reading.html?testId=abc&exam=simulation'],
    ['/reading/test/abc/practice/', '/reading.html?testId=abc&exam=practice'],
    ['/reading/review/r1', '/reading.html?review=r1'],
    ['/reading/practice/p9', '/reading.html?passageId=p9'],
    ['/reading/passage/p9/simulation', '/reading.html?passageId=p9&exam=simulation'],
    ['/reading/single/passage2', '/reading.html?mode=single&category=passage2'],
    ['/reading/single', '/reading.html?mode=single'],
    ['/reading/tips', '/reading.html?mode=tips'],
    ['/reading/tips/skimming', '/reading.html?mode=tips&tip=skimming'],
    ['/listening/test/t1/simulation', '/listening.html?testId=t1&exam=simulation'],
    ['/listening/practice/s1', '/listening.html?sectionId=s1'],
    ['/listening/single/actual', '/listening.html?mode=single&part=actual'],
    ['/listening/tips/30-second-strategy', '/listening.html?mode=tips&tip=30-second-strategy'],
    ['/writing/task2/w1/simulation', '/writing.html?taskType=2&taskId=w1&exam=simulation'],
    ['/writing/task1', '/writing.html?taskType=1'],
    ['/writing/exam/practice', '/writing.html?view=exam&exam=practice'],
    ['/writing/tips/cohesion', '/writing.html?view=writing-tips&tip=cohesion'],
    ['/writing/template/opinion', '/task2-template.html?type=opinion'],
    ['/writing/task1-course/L3', '/writing-task1.html?lesson=L3'],
    ['/speaking/tips', '/speaking.html?tab=speaking-tips'],
    ['/speaking/history', '/speaking.html?tab=history'],
    ['/speaking/question/q1', '/speaking.html?questionId=q1'],
    ['/speaking/course/SP-1', '/speaking-course.html?lesson=SP-1'],
    ['/essential-grammar/tenses', '/essential-grammar.html?lesson=tenses'],
    ['/dictation/s1', '/dictation.html?sectionId=s1'],
    ['/vocab/lesson/v1', '/dashboard.html?view=lesson&lessonId=v1'],
    ['/vocabulary', '/dashboard.html'],
    ['/admin/users', '/admin/#/users'],
  ])('%s → %s', (path, expected) => {
    expect(r(path)).toBe(expected);
  });

  test('keeps the original query string and hash', () => {
    expect(r('/reading/tips/x', '?tcat=Band', '#top')).toBe('/reading.html?mode=tips&tip=x&tcat=Band#top');
    expect(r('/vocabulary', '?view=home')).toBe('/dashboard.html?view=home');
  });

  test('does not double up a hash on admin routes', () => {
    expect(r('/admin/users', '', '#x')).toBe('/admin/#/users');
  });

  test.each([
    ['/nonexistent-page'],
    ['/reading/test'],
    ['/reading/test/abc/cheat'],
    ['/reading/single/passage9'],
    ['/listening/single/7'],
    ['/'],
    [''],
  ])('%s is a real 404 (null)', (path) => {
    expect(r(path)).toBeNull();
  });
});
