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

  window.RouteParams = { match: match };
})();
