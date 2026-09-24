/**
 * shared/clean-url-router.js — CleanUrlRouter
 *
 * Production (Render Static Site) does NOT apply frontend/_redirects: every
 * clean path in it (/reading/test/:id, /vocabulary, /admin/users, …) used to
 * land on 404.html. Render does serve 404.html for any unknown path, so
 * 404.html loads this file first and, when the path is one of ours,
 * location.replace()s to the equivalent real page + ?query URL (which every
 * page already understands). Only truly unknown paths show the 404 page.
 *
 * Keep in step with the _redirects file (still used by any host that does
 * honour it) and with the query params each page reads.
 *
 * Shareable clean forms (every one also accepts a trailing slash):
 *   /reading/test/:id[/practice|/simulation]      full test
 *   /reading/review/:id                           past full-test review
 *   /reading/practice/:id[/practice|/simulation]  one passage (Bài lẻ)
 *   /reading/single[/:category]                   Bài lẻ list (passage1..3, actual-test)
 *   /reading/tips[/:tip]                          Reading Tips (one lesson)
 *   /listening/…                                  same shapes; single/:part is 1-4|actual
 *   /writing/task1|task2[/:id[/practice|/simulation]]
 *   /writing/exam[/practice|/simulation]  /writing/tips[/:tip]  /writing/samples
 *   /speaking/tips[/:tip]  /speaking/practice|history|materials  /speaking/question/:id
 *   /essential-grammar/:lesson  /dictation/:sectionId  /vocab/lesson/:id  …
 */
(function () {
  'use strict';

  var MODE = '(?:/(practice|simulation))?';
  var SEG = '([^/]+)';

  function exam(m) { return m ? '&exam=' + m : ''; }
  function opt(key, v) { return v ? '&' + key + '=' + v : ''; }

  // [pattern (matched against the path with trailing slashes removed), builder]
  var ROUTES = [
    // Admin SPA uses a HashRouter — /admin/users means /admin/#/users.
    [/^\/admin\/(.+)$/, function (m) { return '/admin/#/' + m[1]; }],

    // ── Reading ──
    [new RegExp('^/reading/test/' + SEG + MODE + '$'), function (m) { return '/reading.html?testId=' + m[1] + exam(m[2]); }],
    [new RegExp('^/reading/review/' + SEG + '$'), function (m) { return '/reading.html?review=' + m[1]; }],
    [new RegExp('^/reading/(?:practice|passage)/' + SEG + MODE + '$'), function (m) { return '/reading.html?passageId=' + m[1] + exam(m[2]); }],
    [/^\/reading\/single(?:\/(passage[123]|actual-test))?$/, function (m) { return '/reading.html?mode=single' + opt('category', m[1]); }],
    [new RegExp('^/reading/tips(?:/' + SEG + ')?$'), function (m) { return '/reading.html?mode=tips' + opt('tip', m[1]); }],
    [/^\/reading\/full$/, function () { return '/reading.html?mode=full'; }],

    // ── Listening ──
    [new RegExp('^/listening/test/' + SEG + MODE + '$'), function (m) { return '/listening.html?testId=' + m[1] + exam(m[2]); }],
    [new RegExp('^/listening/review/' + SEG + '$'), function (m) { return '/listening.html?review=' + m[1]; }],
    [new RegExp('^/listening/(?:practice|section)/' + SEG + MODE + '$'), function (m) { return '/listening.html?sectionId=' + m[1] + exam(m[2]); }],
    [/^\/listening\/single(?:\/([1-4]|actual))?$/, function (m) { return '/listening.html?mode=single' + opt('part', m[1]); }],
    [new RegExp('^/listening/tips(?:/' + SEG + ')?$'), function (m) { return '/listening.html?mode=tips' + opt('tip', m[1]); }],
    [/^\/listening\/full$/, function () { return '/listening.html?mode=full'; }],

    // ── Writing ──
    [new RegExp('^/writing/task([12])/' + SEG + MODE + '$'), function (m) { return '/writing.html?taskType=' + m[1] + '&taskId=' + m[2] + exam(m[3]); }],
    [/^\/writing\/task([12])$/, function (m) { return '/writing.html?taskType=' + m[1]; }],
    [new RegExp('^/writing/exam' + MODE + '$'), function (m) { return '/writing.html?view=exam' + exam(m[1]); }],
    [new RegExp('^/writing/tips(?:/' + SEG + ')?$'), function (m) { return '/writing.html?view=writing-tips' + opt('tip', m[1]); }],
    [/^\/writing\/samples$/, function () { return '/writing.html?view=samples'; }],
    [new RegExp('^/writing/template/' + SEG + '$'), function (m) { return '/task2-template.html?type=' + m[1]; }],
    [/^\/writing\/templates$/, function () { return '/task2-template.html'; }],
    [/^\/writing\/practice$/, function () { return '/writing-practice.html'; }],
    [new RegExp('^/writing/task1-course(?:/' + SEG + ')?$'), function (m) { return '/writing-task1.html' + (m[1] ? '?lesson=' + m[1] : ''); }],
    [new RegExp('^/writing/task2-course(?:/' + SEG + ')?$'), function (m) { return '/writing-task2-course.html' + (m[1] ? '?lesson=' + m[1] : ''); }],
    [/^\/writing\/(?:task2-foundations|advanced-sentences)$/, function () { return '/writing-task2-course.html'; }],

    // ── Speaking ──
    [new RegExp('^/speaking/tips(?:/' + SEG + ')?$'), function (m) { return '/speaking.html?tab=speaking-tips' + opt('tip', m[1]); }],
    [/^\/speaking\/(practice|history|materials)$/, function (m) { return '/speaking.html?tab=' + m[1]; }],
    [new RegExp('^/speaking/question/' + SEG + '$'), function (m) { return '/speaking.html?questionId=' + m[1]; }],
    [new RegExp('^/speaking/course(?:/' + SEG + ')?$'), function (m) { return '/speaking-course.html' + (m[1] ? '?lesson=' + m[1] : ''); }],

    // ── Other pages ──
    [new RegExp('^/essential-grammar/' + SEG + '$'), function (m) { return '/essential-grammar.html?lesson=' + m[1]; }],
    [new RegExp('^/dictation/' + SEG + '$'), function (m) { return '/dictation.html?sectionId=' + m[1]; }],
    [new RegExp('^/task2-practice/' + SEG + '$'), function (m) { return '/task2-practice.html?topicId=' + m[1]; }],
    [new RegExp('^/vocab/lesson/' + SEG + '$'), function (m) { return '/dashboard.html?view=lesson&lessonId=' + m[1]; }],
    [/^\/vocabulary$/, function () { return '/dashboard.html'; }],
    [/^\/noun-phrase-writing(?:\.html)?$/, function () { return '/writing-task1.html'; }],
  ];

  /**
   * @param {string} pathname  e.g. location.pathname
   * @param {string} [search]  e.g. location.search — its params are kept
   * @param {string} [hash]
   * @returns {string|null} the URL to go to, or null for a real 404
   */
  function resolve(pathname, search, hash) {
    var path = String(pathname || '').replace(/\/+$/, '');
    if (!path) return null;
    for (var i = 0; i < ROUTES.length; i++) {
      var m = path.match(ROUTES[i][0]);
      if (!m) continue;
      var target = ROUTES[i][1](m);
      var extra = String(search || '').replace(/^\?/, '');
      if (extra) target += (target.indexOf('?') === -1 ? '?' : '&') + extra;
      // Never double up a hash (admin targets already carry one).
      if (hash && target.indexOf('#') === -1) target += hash;
      return target;
    }
    return null;
  }

  window.CleanUrlRouter = { resolve: resolve };
})();
