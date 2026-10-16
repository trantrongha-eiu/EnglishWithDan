import { describe, it, expect } from 'vitest';
import { studentPathFor, mockBundleUrls } from './assignmentLinks';

describe('studentPathFor', () => {
  it('links id-keyed resources by resourceId', () => {
    expect(studentPathFor({ resourceType: 'listening_gapfill', resourceId: 'abc' })).toBe('/listening.html?gapfillId=abc');
    expect(studentPathFor({ resourceType: 'task2_practice', resourceId: 'abc' })).toBe('/writing.html?taskType=2&taskId=abc');
  });

  it('uses resourceCode for code/week-keyed pages', () => {
    expect(studentPathFor({ resourceType: 'speaking_course_lesson', resourceId: 'x', resourceCode: 'SPK-A' })).toBe('/speaking-course.html?lesson=SPK-A');
    expect(studentPathFor({ resourceType: 'task2', resourceId: 'x', resourceCode: '9' })).toBe('/task2-practice.html?week=9&topicId=x');
  });

  it('falls back to a catalog row _id (editor picker)', () => {
    expect(studentPathFor({ resourceType: 'speaking', _id: 'q1' })).toBe('/speaking.html?questionId=q1');
  });

  it('returns null for unknown types', () => {
    expect(studentPathFor({ resourceType: 'nope', resourceId: 'x' })).toBeNull();
  });
});

describe('mockBundleUrls', () => {
  it('links each skill of a fixed bundle', () => {
    const u = mockBundleUrls({ listeningTestId: 'l', readingTestId: 'r', writingExamId: 'w', speakingQuestionId: 's' });
    expect(u.listeningTestId).toMatch(/\/listening\.html\?testId=l$/);
    expect(u.writingExamId).toMatch(/\/writing\.html\?examId=w$/);
    expect(u.speakingQuestionId).toMatch(/\/speaking\.html\?questionId=s$/);
  });
});
