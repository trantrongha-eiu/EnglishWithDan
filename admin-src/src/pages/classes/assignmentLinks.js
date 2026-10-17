import { FRONTEND_URL } from '../../utils/api';

// Student-site page an assigned internal resource opens on — the SAME deep
// links the student's homework card uses (frontend/js/dashboard-homework.js
// hwResourceHref); keep the two in sync. Lets the teacher click a resource
// name in the class's homework tab and see exactly what the class got.
// `r` = { resourceType, resourceId, resourceCode } (Assignment.resources[] or
// a catalog row picked in the editor, which has no resourceCode yet).
export function studentPathFor(r) {
  const id = r.resourceId || r._id;
  const code = r.resourceCode ? encodeURIComponent(r.resourceCode) : '';
  switch (r.resourceType) {
    case 'reading_test':           return `/reading.html?testId=${id}`;
    case 'reading_practice':       return `/reading.html?passageId=${id}`;
    case 'listening_test':         return `/listening.html?testId=${id}`;
    case 'listening_practice':     return `/listening.html?sectionId=${id}`;
    case 'listening_gapfill':      return `/listening.html?gapfillId=${id}`;
    case 'dictation':              return `/dictation.html?sectionId=${id}`;
    case 'writing_exam':           return `/writing.html?examId=${id}`;
    case 'task1_practice':         return `/writing.html?taskType=1&taskId=${id}`;
    case 'task2_practice':         return `/writing.html?taskType=2&taskId=${id}`;
    case 'task1_lesson':           return code ? `/writing-task1.html?lesson=${code}` : '/writing-task1.html';
    case 'task2_course_lesson':    return code ? `/writing-task2-course.html?lesson=${code}` : '/writing-task2-course.html';
    case 'speaking_course_lesson': return code ? `/speaking-course.html?lesson=${code}` : '/speaking-course.html';
    case 'task2':                  return code ? `/task2-practice.html?week=${code}&topicId=${id}` : '/task2-practice.html';
    case 'advanced_sentences':     return code ? `/advanced-sentences.html?week=${code}&groupId=${id}` : '/advanced-sentences.html';
    case 'speaking':               return `/speaking.html?questionId=${id}`;
    case 'speaking_full_mock':     return '/speaking.html?tab=fullmock';
    case 'grammar':                return code ? `/essential-grammar.html?lesson=${code}` : '/essential-grammar.html';
    case 'vocabulary_lesson':      return `/dashboard.html?view=lesson&lessonId=${id}`;
    case 'mock_test':              return '/mock-test.html';
    default:                       return null;
  }
}

export function studentUrlFor(r) {
  const path = studentPathFor(r);
  return path ? `${FRONTEND_URL}${path}` : null;
}

// One fixed class mock bundle → a link per skill's test.
const MOCK_PARTS = [
  { key: 'listeningTestId', type: 'listening_test' },
  { key: 'readingTestId', type: 'reading_test' },
  { key: 'writingExamId', type: 'writing_exam' },
  { key: 'speakingQuestionId', type: 'speaking' },
];
export function mockBundleUrls(bundle) {
  const out = {};
  if (!bundle) return out;
  for (const p of MOCK_PARTS) {
    if (bundle[p.key]) out[p.key] = studentUrlFor({ resourceType: p.type, resourceId: bundle[p.key] });
  }
  return out;
}
