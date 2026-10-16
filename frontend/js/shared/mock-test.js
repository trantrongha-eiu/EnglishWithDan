/**
 * shared/mock-test.js — client glue for the full 4-skill IELTS mock test.
 *
 * The mock test has no exam engine of its own: each skill page
 * (listening/reading/writing/speaking.html), when opened with
 * `?mock=<mockAttemptId>&skill=<skill>`, starts the ASSIGNED test through
 * its own normal /start flow and, right after its own /submit, calls
 * MockTest.advance(skill, subAttemptId). The backend (routes/mockTest.js)
 * records the sub-attempt + tells us where to send the student next:
 *   listening -> reading  (same sitting, auto-chained)
 *   reading   -> dashboard "sitting break" (Writing+Speaking done later)
 *   writing   -> speaking
 *   speaking  -> review-history.html?view=mock
 *
 * Backend model/service: backend/models/MockTestAttempt.js,
 * backend/services/mockTestService.js.
 */
(function () {
  'use strict';

  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  function h() {
    return Object.assign({ 'Content-Type': 'application/json' },
      window.AuthService ? window.AuthService.authHeader() : {});
  }

  var SKILL_PAGE  = { listening: 'listening.html', reading: 'reading.html', writing: 'writing.html', speaking: 'speaking.html' };
  var SKILL_LABEL = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };
  var STEP_INDEX  = { listening: 1, reading: 2, writing: 3, speaking: 4 };

  function params() {
    var p = new URLSearchParams(location.search);
    var mockId = p.get('mock');
    var skill = p.get('skill');
    return { mockId: mockId || null, skill: (skill && SKILL_PAGE[skill]) ? skill : null };
  }
  function active() {
    var x = params();
    return !!(x.mockId && x.skill);
  }

  function pageUrl(skill, mockId) {
    return SKILL_PAGE[skill] + '?mock=' + encodeURIComponent(mockId) + '&skill=' + skill;
  }

  // The full mock attempt (bundle + progress) for the current user — used by
  // each skill page to look up which assigned test to start, and by the
  // dashboard card to render Start/Continue.
  async function fetchCurrent() {
    var res = await fetch(API + '/mock-test/current', { headers: h() });
    var data = await window.ApiClient.handleResponse(res);
    return data.attempt || null;
  }

  // Where the frontend should send the student after `skill` was recorded.
  // Shared by advance()'s success path and flushPendingAdvance() below.
  function _navigateByResult(nav, mockId) {
    nav = nav || {};
    if (nav.done)         { location.href = 'review-history.html?view=mock'; return; }
    // Sitting break — back to the mock-test card page; the student self-
    // starts the next skill. `breakAfter` ('reading' | 'writing') picks the
    // copy. (Was 'dashboard.html?mockbreak=' before the card moved to its
    // own page under the "Mocktest" nav dropdown.)
    if (nav.sittingBreak) {
      location.href = 'mock-test.html?mockbreak=' + encodeURIComponent(nav.breakAfter || 'reading');
      return;
    }
    if (nav.nextSkill)    { location.href = pageUrl(nav.nextSkill, mockId); return; }
    location.href = 'mock-test.html';
  }

  function _sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // One POST /advance, never auto-logging-out on a 401 (skipAuthRedirect) —
  // advance() and flushPendingAdvance() both need to inspect a 401
  // themselves instead of ApiClient hard-redirecting mid-call.
  function _postAdvanceOnce(mockId, skill, subAttemptId) {
    return fetch(API + '/mock-test/' + encodeURIComponent(mockId) + '/advance', {
      method: 'POST',
      headers: h(),
      body: JSON.stringify({ skill: skill, attemptId: subAttemptId || null })
    }).then(function (res) { return window.ApiClient.handleResponse(res, { skipAuthRedirect: true }); });
  }

  // Bug found 2026-09: a skill page calls this right after ITS OWN /submit
  // already succeeded (the answers are safe server-side) — this call only
  // records the mock wrapper's "next step" bookkeeping. The old version
  // routed every failure (a network blip, or a token that expired mid-test)
  // straight through ApiClient's hard logout+redirect with no way back,
  // which a student hit after submitting Listening — bounced to login and,
  // because the wrapper's progress cursor was never advanced, told to redo
  // Listening from scratch even though it had already been graded.
  //
  // Now: the intent to advance is written to localStorage BEFORE the network
  // call (see PENDING_KEY) so it survives the tab dying mid-request; a
  // transient failure retries with backoff; and a real 401 sends the
  // student to log back in WITHOUT losing that intent — flushPendingAdvance()
  // (called on every page load, see the bottom of this file) silently
  // finishes the exact same idempotent call the moment they're signed back
  // in, so the run resumes on the correct next skill instead of restarting.
  // Does the actual work described above and returns the server's `nav`
  // decision on success — `null` on any failure (every failure branch
  // already navigates away itself, so there's nothing left for a caller to
  // do with a null return). Split out of advance() so a caller that wants
  // to show its own screen before moving on (listening.html's post-review
  // waiting screen, see advanceWithoutNav below) can get the same
  // battle-tested 401/retry/pending-recovery handling without also being
  // forced into the immediate auto-navigate on success.
  async function _advanceCore(skill, subAttemptId) {
    var x = params();
    if (!x.mockId) return null;
    stopProctor();  // legit end-of-skill navigation must not log a violation
    _savePending(x.mockId, skill, subAttemptId);

    var data = null, lastErr = null;
    for (var i = 0; i < 3; i++) {
      try { data = await _postAdvanceOnce(x.mockId, skill, subAttemptId); lastErr = null; break; }
      catch (e) {
        lastErr = e;
        if (e && e.status === 401) break;      // a real auth failure — retrying won't help
        if (i < 2) await _sleep(900 * (i + 1)); // network hiccup / 5xx — brief backoff, try again
      }
    }

    if (lastErr) {
      if (lastErr.status === 401) {
        try {
          if (window.toast) window.toast(
            'Phiên đăng nhập đã hết hạn. Bài "' + (SKILL_LABEL[skill] || skill) + '" của bạn đã được lưu — đăng nhập lại để tiếp tục.',
            'info', 6000
          );
        } catch (_) {}
        if (window.AuthService && window.AuthService.clearSession) window.AuthService.clearSession();
        else { try { localStorage.removeItem('token'); localStorage.removeItem('user'); } catch (_) {} }
        // Straight to the mock-test card page, not back to this same skill
        // page — the skill was already submitted, so reopening it in mock
        // mode would start a brand-new attempt. flushPendingAdvance()
        // finishes the bookkeeping there and the card then offers the real
        // next step.
        var next = (window.AuthService && window.AuthService.buildLoginUrl)
          ? window.AuthService.buildLoginUrl('mock-test.html')
          : ('/login.html?next=' + encodeURIComponent('mock-test.html'));
        location.href = next;
        return null;
      }
      console.error('[MockTest] advance failed:', lastErr);
      try { if (window.toast) window.toast('Chưa lưu được tiến độ thi thử — sẽ tự đồng bộ khi bạn quay lại trang Mocktest', 'error'); } catch (_) {}
      location.href = 'mock-test.html'; // _PENDING_KEY stays set; flushed from there
      return null;
    }

    _clearPending();
    return data.nav;
  }

  async function advance(skill, subAttemptId) {
    var nav = await _advanceCore(skill, subAttemptId);
    if (nav) _navigateByResult(nav, params().mockId);
  }

  // Same as advance(), but on success returns the server's `nav` decision to
  // the caller instead of auto-navigating — for a skill page that wants to
  // show its own screen (instructions, a manual "continue" button) before
  // moving on. Failure paths (401 / persistent error) still navigate
  // immediately, exactly like advance() — those are "you can't stay here"
  // states either way.
  async function advanceWithoutNav(skill, subAttemptId) {
    return _advanceCore(skill, subAttemptId);
  }

  // ── Recovery for an advance() interrupted by a session expiry ──────────
  var PENDING_KEY = 'ews_mock_pending_advance';
  function _savePending(mockId, skill, subAttemptId) {
    try { localStorage.setItem(PENDING_KEY, JSON.stringify({ mockId: mockId, skill: skill, subAttemptId: subAttemptId || null, ts: Date.now() })); }
    catch (_) {}
  }
  function _clearPending() { try { localStorage.removeItem(PENDING_KEY); } catch (_) {} }
  function _readPending() {
    try {
      var raw = localStorage.getItem(PENDING_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || !d.mockId || !d.skill) { _clearPending(); return null; }
      if (Date.now() - (d.ts || 0) > 24 * 60 * 60 * 1000) { _clearPending(); return null; } // stale — drop it
      return d;
    } catch (_) { return null; }
  }

  // Runs on every page that loads this file (every skill page + dashboard).
  // A no-op almost always — only does anything when a previous advance() was
  // interrupted by a 401. Idempotent server-side (mockTestService.advance's
  // `alreadyDone` check), so calling it again here is always safe even if
  // the original request actually made it through before the client saw
  // the failure. Deliberately quiet: fixes the wrapper's progress cursor in
  // the background and lets the dashboard card render the real state,
  // rather than yanking the student off a page they navigated to on
  // purpose — EXCEPT when they've landed back on the exact stale skill page
  // (mock=&skill= still match the pending record), where staying put would
  // otherwise silently start that already-completed skill over from zero.
  async function flushPendingAdvance() {
    var pending = _readPending();
    if (!pending) return;
    if (!(window.AuthService && window.AuthService.isLoggedIn())) return; // still signed out — retry next load
    try {
      var data = await _postAdvanceOnce(pending.mockId, pending.skill, pending.subAttemptId);
      _clearPending();
      var cur = params();
      var onStaleSkillPage = cur.mockId === pending.mockId && cur.skill === pending.skill;
      if (onStaleSkillPage) _navigateByResult(data.nav, pending.mockId);
    } catch (e) {
      if (e && e.status === 401) return;   // not really signed in yet — leave pending, try again later
      _clearPending(); // a definitive rejection (409 wrong step / 404 run gone) — this record is stale
    }
  }

  // Brief orientation cue ("you're in a mock test, step N/4"). Delivered as
  // a normal auto-dismissing toast — a persistent fixed pill in any corner
  // ended up covering the exam chrome pinned to the page edges (Writing's
  // Task 1/Task 2 switcher, the nav arrows, Nộp bài). Falls back to a
  // short-lived top-centre pill only if the toast helper isn't loaded.
  function showBanner(skill) {
    var idx = STEP_INDEX[skill] || 1;
    var msg = '🎯 Thi thử Full — Bước ' + idx + '/4: ' + (SKILL_LABEL[skill] || skill);
    if (window.showToast) { window.showToast(msg, 'info', 5000); return; }
    if (document.getElementById('mock-test-pill')) return;
    var pill = document.createElement('div');
    pill.id = 'mock-test-pill';
    pill.style.cssText = [
      'position:fixed', 'left:50%', 'top:10px', 'transform:translateX(-50%)',
      'z-index:2147483000', 'background:linear-gradient(135deg,#e53935,#c62828)',
      'color:#fff', 'font:700 12px/1.3 inherit', 'padding:8px 14px',
      'border-radius:999px', 'box-shadow:0 4px 14px rgba(0,0,0,.28)',
      'pointer-events:none', 'max-width:90vw', 'white-space:nowrap',
      'transition:opacity .4s ease'
    ].join(';');
    pill.textContent = msg;
    document.body.appendChild(pill);
    setTimeout(function () {
      pill.style.opacity = '0';
      setTimeout(function () { if (pill.parentNode) pill.parentNode.removeChild(pill); }, 500);
    }, 5000);
  }

  /* ══════════════════════════════════════════════════════════════════
     Proctoring (best-effort) — the engine (alarm, flash, "gậy" badge,
     nav lock, disqualify overlay) is shared/proctor-engine.js; this is the
     Mock Test's wiring: POST /mock-test/:id/violation, strikes counted
     across the whole run (all 4 skill pages), and a void sends the student
     back to the Mocktest page. Auto-starts on any skill page opened in mock
     mode; everything is torn down the moment the student legitimately
     advances (MockTest.advance → stopProctor).
     ══════════════════════════════════════════════════════════════════ */

  // A skill page registers how to save its answers so far if the run gets
  // voided mid-skill: fn() → Promise resolving to the saved sub-attempt id
  // (sent with disqualified:true), or null when there's nothing to save.
  var _dqSaver = null;
  function setDisqualifySaver(fn) { _dqSaver = fn; }

  var _engine = window.ProctorEngine.create({
    ids: { badge: 'mock-proctor-badge', txt: 'mp-txt', flash: 'mock-proctor-flash', navWarn: 'mock-nav-warn', overlay: 'mock-dq-overlay' },
    watchingText: 'Đang giám sát',
    navWarnMsg: 'Bạn đang trong bài thi thử — không thể rời trang. Hãy hoàn thành rồi nộp bài.',
    unloadMsg: 'Bạn đang làm bài thi thử. Rời khỏi trang sẽ bị tính là vi phạm.',
    reportUrl: function (p) { return API + '/mock-test/' + encodeURIComponent(p.mockId) + '/violation'; },
    reportBody: function (p, type, capture) { return { type: type, skill: p.skill, capture: capture }; },
    shot: function (p, type) { return { context: 'mock', skill: p.skill, attemptId: p.mockId, type: type }; },
    dqHtml: function (p, mins) {
      return '<div style="font-size:20px;font-weight:800">Lượt thi thử đã bị huỷ</div>' +
        '<div style="max-width:460px">Bạn đã vi phạm giám sát <b>' + (p.maxViolations || 5) + ' lần</b>. '
        + 'Kết quả lượt này <b>không được tính</b>, nhưng bài làm đến thời điểm này vẫn được gửi cho giáo viên. '
        + 'Hãy quay lại trang Mocktest và đợi khoảng <b>' + mins + ' phút</b> trước khi bắt đầu lượt thi mới.</div>' +
        '<div style="opacity:.85" id="mock-dq-status">Đang gửi bài làm cho giáo viên…</div>';
    },
    // Save the answers so far, link them to the run, then back to the
    // Mocktest page — which explains the cooldown.
    afterDisqualify: function (p) {
      var setStatus = function (txt) { var s = document.getElementById('mock-dq-status'); if (s) s.textContent = txt; };
      var save = Promise.resolve(null);
      if (typeof _dqSaver === 'function') {
        try { save = Promise.resolve(_dqSaver()); } catch (e) { save = Promise.reject(e); }
      }
      // The skill page saved its answers as a voided sub-attempt — link it to
      // this run so the teacher's monitor shows the step.
      var saved = save.then(function (subAttemptId) {
        if (!subAttemptId) return;
        return fetch(API + '/mock-test/' + encodeURIComponent(p.mockId) + '/disqualified-step', {
          method: 'POST', headers: h(), keepalive: true,
          body: JSON.stringify({ skill: p.skill, attemptId: String(subAttemptId) })
        });
      }).then(function () { setStatus('Đã gửi bài làm cho giáo viên. Đang chuyển về trang Mocktest…'); },
        function () { setStatus('Không gửi được bài làm (có thể đã gửi trước đó). Đang chuyển về trang Mocktest…'); });
      var minWait = new Promise(function (r) { setTimeout(r, 3200); });
      var maxWait = new Promise(function (r) { setTimeout(r, 10000); });
      Promise.race([Promise.all([saved, minWait]), maxWait]).then(function () {
        location.href = 'mock-test.html?mockvoid=1';
      });
    },
  });

  function startProctor() {
    var x = params();
    if (!x.mockId || !x.skill || _engine.isActive()) return;
    var armed = _engine.arm({ mockId: x.mockId, skill: x.skill });

    // Strikes count across the whole run (all 4 skill pages) — show the
    // run's real tally, not 0, on every newly opened page.
    fetchCurrent().then(function (cur) {
      var n = cur && cur.proctor && cur.proctor.violationCount;
      if (_engine.current() !== armed || typeof n !== 'number' || n <= armed.count) return;
      armed.count = n;
      _engine.renderBadge();
    }).catch(function () {});
  }

  // Resolves once the mandatory screen share is live (instantly on devices
  // that can't share). Skill pages await this before starting their exam
  // in mock mode, so no timer/audio runs behind the share prompt.
  function ready() {
    return window.ProctorCapture ? window.ProctorCapture.ensureShare({ cancelable: false }) : Promise.resolve(true);
  }

  function stopProctor() { _engine.stop(); }

  window.MockTest = {
    params: params,
    active: active,
    pageUrl: pageUrl,
    fetchCurrent: fetchCurrent,
    advance: advance,
    advanceWithoutNav: advanceWithoutNav,
    setDisqualifySaver: setDisqualifySaver,
    flushPendingAdvance: flushPendingAdvance,
    showBanner: showBanner,
    startProctor: startProctor,
    stopProctor: stopProctor,
    ready: ready,
    SKILL_PAGE: SKILL_PAGE,
    SKILL_LABEL: SKILL_LABEL,
    STEP_INDEX: STEP_INDEX
  };

  // Recover a step whose /advance call was interrupted (e.g. a session
  // expiry landed right as the student submitted a skill) — see advance()'s
  // 401 branch above. Runs on every page load; a no-op the vast majority of
  // the time (nothing pending).
  flushPendingAdvance();

  // Auto-arm on any skill page loaded in mock mode.
  if (active()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startProctor, { once: true });
    } else {
      startProctor();
    }
  }
})();
