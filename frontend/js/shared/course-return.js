// js/shared/course-return.js — "Về khóa học" for exam pages opened from a course
// ══════════════════════════════════════════════════════════════════════
//  A course lesson (mindset-course.js practiceLinks) opens reading.html /
//  listening.html with &returnTo=<lesson page path>. Those pages rewrite
//  their URL right away (replaceState to the Bài lẻ list), so the value is
//  captured here at script load, before that happens.
//
//  While it is set, the practice screen's "Chọn bài khác" exit becomes
//  "Về khóa học" and closing the practice goes back to the lesson instead
//  of the section/passage list.
//
//  Only a same-origin path is accepted ("/x…", not "//host" or "/\host"),
//  so the parameter cannot be used as an open redirect.
// ══════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var url = null;
  try {
    var raw = new URLSearchParams(location.search).get('returnTo');
    if (raw && /^\/(?![\/\\])/.test(raw)) url = raw;
  } catch (e) { /* no URLSearchParams — no return link */ }

  window.CourseReturn = {
    url: function () { return url; },
    // Label for the practice footer's exit button.
    exitLabel: function (fallback) {
      return url ? '<i class="fas fa-graduation-cap"></i> Về khóa học'
        : '<i class="fas fa-arrow-left"></i> ' + (fallback || 'Chọn bài khác');
    },
    // true = navigating back to the course (caller should stop).
    go: function () {
      if (!url) return false;
      window.onbeforeunload = null;
      location.href = url;
      return true;
    },
  };
})();
