// writing-task1.html — IELTS Task 1 Writing
// ══════════════════════════════════════════════════════════════════════
//  IELTS Task 1 Writing — WT1 course (Module → Lesson → Exercise).
//  The runner itself lives in js/shared/course-engine.js.
// ══════════════════════════════════════════════════════════════════════
window.CourseEngine.start({
  courseCode: 'IELTS-W-T1',
  overviewPath: '/wt1/overview',
  pagePath: '/writing-task1.html',
  cleanPath: /^\/writing\/task1-course\/([^/?#]+)$/,
  dictionaryKey: 'writing-task1-course',
  title: '📊 IELTS Task 1 Writing',
  paywallTitle: 'Khoá học Task 1 chỉ dành cho Premium',
  paywallBlurb: '5 module · 22 buổi học + 5 bài kiểm tra · nền tảng, biểu đồ động, biểu đồ tĩnh & kết hợp, bản đồ (Maps), sơ đồ quy trình (Process)',
  premiumBlurb: 'Toàn bộ 5 module · 22 buổi học + 5 bài kiểm tra Task 1',
  heroFallback: 'Khoá học Task 1: biểu đồ, bản đồ và quy trình',
});
