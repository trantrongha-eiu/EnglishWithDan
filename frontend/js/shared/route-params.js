/**
 * shared/route-params.js — RouteParams
 *
 * Bridges clean, path-based deep links (e.g. /reading/test/68abc123 —
 * served via a css/../_redirects rewrite rule so the address bar keeps
 * showing the clean path forever) to pages that currently read their
 * deep-link state from location.search (e.g. reading.html's ?testId=...).
 *
 * A _redirects "200" rewrite does NOT populate location.search on the
 * page it serves — the browser only ever sees the URL the user actually
 * requested. So a page that wants a permanent, address-bar-stable clean
 * URL for one of its resources must additionally check location.pathname
 * for that route's pattern. This module is that check, kept in one place
 * so every page uses the same matching logic instead of hand-rolling its
 * own regex.
 *
 * This is purely additive: it does not touch, replace, or run before any
 * existing ?param=value handling — a page calls RouteParams.match() first
 * and falls back to its existing URLSearchParams(location.search) parsing
 * exactly as before when there's no pathname match (i.e. every existing
 * bookmarked/shared query-string link keeps working unchanged).
 *
 * NOTE (2026-09-25): production (Render Static Site) does NOT apply
 * frontend/_redirects — those clean paths reach 404.html, whose router
 * redirects them to the equivalent ?query= URL. See 404.html.
 *
 * Also hosts the small query-param helpers shared by every page:
 * examMode()/examSuffix() for ?exam=practice|simulation start links and
 * findTip()/syncTip() for per-lesson ?tip= URLs on the Tips pages.
 */
(function () {
  'use strict';

  /**
   * @param {Array<{pattern: RegExp, param: string}>} routes - checked in
   *   order, first match wins. `pattern` must have exactly one capture
   *   group (the ID/slug); `param` is the key name to return it under.
   * @returns {Object|null} e.g. { testId: '68abc123' }, or null if
   *   location.pathname didn't match any given pattern.
   */
  function match(routes) {
    var path = window.location.pathname;
    for (var i = 0; i < routes.length; i++) {
      var m = path.match(routes[i].pattern);
      if (m && m[1]) {
        var result = {};
        result[routes[i].param] = decodeURIComponent(m[1]);
        return result;
      }
    }
    return null;
  }

  // ── ?exam=practice|simulation ──────────────────────────────────────
  // A start link (reading passage / full test, listening section / full
  // test, writing task) can carry the mode it was started in, so the
  // Practice link and the Test Simulation link of the same resource are
  // two different URLs. The page still shows ExamModeSelect with that
  // mode pre-selected — a link never silently starts a proctored attempt
  // (and listening audio needs the click as a user gesture anyway).
  var EXAM_MODES = { practice: true, simulation: true };

  /** @returns {'practice'|'simulation'|null} */
  function examMode() {
    var m = new URLSearchParams(window.location.search).get('exam');
    return EXAM_MODES[m] ? m : null;
  }

  /** "&exam=<mode>" for a valid mode, '' otherwise — for URL-building. */
  function examSuffix(mode) {
    return EXAM_MODES[mode] ? '&exam=' + mode : '';
  }

  // ── ?tip=<lessonKey>[&tcat=<category>] ─────────────────────────────
  // One URL per Tips lesson (Reading/Listening/Writing/Speaking Tips).
  // lessonKey is only unique per category (see the {category, lessonKey}
  // unique index on each *Tip model), so tcat is added only when the key
  // is ambiguous within the loaded lesson list — the common case stays a
  // short ?tip=30-second-strategy.

  /** The lesson the current URL points at, or null. */
  function findTip(lessons) {
    var p = new URLSearchParams(window.location.search);
    var tip = p.get('tip');
    if (!tip || !lessons) return null;
    var hits = lessons.filter(function (l) { return l.lessonKey === tip; });
    var cat = p.get('tcat');
    if (cat) {
      for (var i = 0; i < hits.length; i++) if (hits[i].category === cat) return hits[i];
    }
    return hits[0] || null;
  }

  /**
   * Writes `lesson` into the URL (keeps every other param and the
   * current history.state, adding {tip}). push=true for a student click,
   * false for the initial/restored selection. No-op when unchanged.
   */
  function syncTip(lesson, lessons, push) {
    if (!lesson) return;
    var url = new URL(window.location.href);
    url.searchParams.set('tip', lesson.lessonKey);
    var dup = (lessons || []).filter(function (l) { return l.lessonKey === lesson.lessonKey; }).length > 1;
    if (dup) url.searchParams.set('tcat', lesson.category);
    else url.searchParams.delete('tcat');
    var next = url.pathname + url.search + url.hash;
    if (next === window.location.pathname + window.location.search + window.location.hash) return;
    var st = Object.assign({}, window.history.state || {}, { tip: lesson.lessonKey });
    if (push) window.history.pushState(st, '', next);
    else window.history.replaceState(st, '', next);
  }

  window.RouteParams = {
    match: match,
    examMode: examMode,
    examSuffix: examSuffix,
    findTip: findTip,
    syncTip: syncTip,
  };
})();
