/**
 * shared/api-client.js — ApiClient (response-handling layer)
 *
 * Consolidates the response-handling logic that was independently
 * duplicated (with real behavioral gaps) across 5 files' own apiFetch():
 * reading-v2.js, writing.js, speaking.js, inbox.js, task2-practice.html.
 *
 * Scope decision: this does NOT unify request-building (URL-joining,
 * FormData header skipping, base-URL conventions) — each file already had
 * its own, slightly different, working convention there, and forcing a
 * single request-builder onto all 5 risks subtly breaking a working fetch
 * for no consolidation benefit (that part wasn't actually duplicated logic
 * so much as 5 valid variations of "build a URL"). What genuinely was
 * duplicated — and inconsistently, with real gaps — is what happens to the
 * Response afterwards: checking res.ok, detecting a 401 and logging out,
 * detecting a Render cold-start HTML error page instead of JSON, and
 * normalizing the thrown Error. That's what this file centralizes.
 *
 * Each consumer's own apiFetch() keeps its own fetch() call and headers,
 * then delegates to ApiClient.handleResponse(res) for everything after.
 *
 * Closes two real gaps found during the Phase 1 audit: inbox.js and
 * task2-practice.html's own apiFetch() never checked for 401 at all, so an
 * expired session there just produced a generic error forever instead of
 * returning the user to login. Both now get that handling automatically.
 */
(function () {
  'use strict';

  /**
   * @param {Response} res - the fetch() Response to interpret
   * @param {Object} [opts]
   * @param {boolean} [opts.skipAuthRedirect] - if true, a 401 throws
   *   normally instead of clearing the session and redirecting to login.
   *   (No current call site needs this; provided for a future caller that
   *   wants to handle 401 itself, e.g. a background poll.)
   * @returns {Promise<any>} parsed JSON body on success
   * @throws {Error} normalized error with .status and .body set when the
   *   server responded with a real (non-2xx) JSON error; .coldStart set
   *   when the response looks like a Render cold-start HTML page instead
   *   of JSON.
   */
  async function handleResponse(res, opts) {
    opts = opts || {};

    if (res.status === 401 && !opts.skipAuthRedirect) {
      // Delegate to AuthService.logout (Phase 5) — the single source of
      // truth for clearing session state. Falls back to window.logout
      // (auth.js's alias, same function) or an inline clear only if a
      // caller ever uses this module on a page that loaded neither.
      if (window.AuthService) {
        window.AuthService.logout();
      } else if (typeof window.logout === 'function') {
        window.logout();
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
      }
      throw new Error('Unauthorized');
    }

    var text = await res.text();
    if (text.trimStart().startsWith('<')) {
      var isColdStart = res.status === 502 || res.status === 503;
      var coldErr = new Error(isColdStart ? 'server-cold-start' : ('HTTP ' + res.status));
      coldErr.coldStart = isColdStart;
      coldErr.status = res.status;
      throw coldErr;
    }

    var data;
    try { data = text ? JSON.parse(text) : {}; }
    catch (e) { throw new Error('Phản hồi không hợp lệ từ server.'); }

    if (!res.ok) {
      var err = new Error(data.message || ('HTTP ' + res.status));
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  }

  window.ApiClient = { handleResponse: handleResponse };
})();
