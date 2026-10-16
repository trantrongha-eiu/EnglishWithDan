// writing-task2-course.html — IELTS Task 2 Writing
// ══════════════════════════════════════════════════════════════════════
//  IELTS Task 2 Writing — WT2 course (reuses the WT1 system, courseCode
//  IELTS-W-T2). The runner itself lives in js/shared/course-engine.js.
// ══════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  // Module 2 (Bảy dạng đề) lessons T2-L05..T2-L11 map 1:1 onto the 7
  // typeId's already seeded into Task2Template (type01..type07 — see
  // backend/scripts/seedTask2TemplatesBand6.js). Rather than re-authoring
  // that template content inside the WT1-course exercise system, each of
  // those 7 lessons links straight into the existing task2-template.html
  // drills (deep-linked via its own ?type=&mode= URL params) for "Dịch câu"
  // / "Chunks" practice on that essay type's templates. Free extra
  // practice, not a course exercise — doesn't touch lesson completion or
  // the unlock gate.
  var LESSON_TPL_TYPE = {
    'T2-L05': 'type01', 'T2-L06': 'type02', 'T2-L07': 'type03', 'T2-L08': 'type04',
    'T2-L09': 'type05', 'T2-L10': 'type06', 'T2-L11': 'type07',
  };

  window.CourseEngine.start({
    courseCode: 'IELTS-W-T2',
    overviewPath: '/wt1/overview?course=IELTS-W-T2',
    pagePath: '/writing-task2-course.html',
    cleanPath: /^\/writing\/task2-course\/([^/?#]+)$/,
    dictionaryKey: 'writing-task2-course',
    title: '✍️ IELTS Task 2 Writing',
    paywallTitle: 'Khoá học Task 2 chỉ dành cho Premium',
    paywallBlurb: '3 module · 18 buổi học · nền tảng Task 2, 7 dạng đề (Adv/Disadv, Discuss Both Views, Cause–Solution…) và 12 cấu trúc câu nâng band',
    premiumBlurb: 'Toàn bộ 3 module · 18 buổi học Task 2',
    heroFallback: 'Khoá học Task 2: nền tảng 4 tiêu chí + 9 chức năng câu, và 7 dạng đề',
    lessonExtra: function (l) {
      var tplType = LESSON_TPL_TYPE[l.code];
      if (!tplType) return '';
      return '<div class="t1-tpl-drill"><div class="t1-tpl-drill-t">🧠 Luyện thuộc template dạng này</div>' +
        '<div class="t1-tpl-drill-links">' +
        '<a class="t1-btn" href="/task2-template.html?type=' + tplType + '&mode=translation" target="_blank" rel="noopener"><i class="fas fa-language"></i> Luyện Dịch câu</a>' +
        '<a class="t1-btn" href="/task2-template.html?type=' + tplType + '&mode=chunks" target="_blank" rel="noopener"><i class="fas fa-puzzle-piece"></i> Luyện Chunks</a>' +
        '</div></div>';
    },
  });
})();
