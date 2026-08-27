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

  // Called by a skill page after it has successfully submitted its own
  // sub-attempt. Never rejects — on any failure it bails the student back
  // to the dashboard rather than trapping them on a finished exam screen.
  async function advance(skill, subAttemptId) {
    var x = params();
    if (!x.mockId) return;
    try {
      var res = await fetch(API + '/mock-test/' + encodeURIComponent(x.mockId) + '/advance', {
        method: 'POST',
        headers: h(),
        body: JSON.stringify({ skill: skill, attemptId: subAttemptId || null })
      });
      var data = await window.ApiClient.handleResponse(res);
      var nav = data.nav || {};
      if (nav.done)        { location.href = 'review-history.html?view=mock'; return; }
      if (nav.sittingBreak) { location.href = 'dashboard.html?mockbreak=1'; return; }
      if (nav.nextSkill)   { location.href = pageUrl(nav.nextSkill, x.mockId); return; }
      location.href = 'dashboard.html';
    } catch (e) {
      console.error('[MockTest] advance failed:', e);
      try { if (window.toast) window.toast('Không lưu được tiến độ thi thử — quay lại trang chủ', 'error'); } catch (_) {}
      location.href = 'dashboard.html';
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

  window.MockTest = {
    params: params,
    active: active,
    pageUrl: pageUrl,
    fetchCurrent: fetchCurrent,
    advance: advance,
    showBanner: showBanner,
    SKILL_PAGE: SKILL_PAGE,
    SKILL_LABEL: SKILL_LABEL,
    STEP_INDEX: STEP_INDEX
  };
})();
