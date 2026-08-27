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

  // Small unobtrusive fixed pill so the student always knows they're inside
  // a mock test (and how far along). Bottom-left so it never covers an exam
  // bar / timer at the top of the page.
  function showBanner(skill) {
    if (document.getElementById('mock-test-pill')) return;
    var idx = STEP_INDEX[skill] || 1;
    var pill = document.createElement('div');
    pill.id = 'mock-test-pill';
    pill.style.cssText = [
      'position:fixed', 'left:12px', 'bottom:12px', 'z-index:2147483000',
      'background:linear-gradient(135deg,#e53935,#c62828)', 'color:#fff',
      'font:700 12px/1.3 inherit', 'padding:8px 12px', 'border-radius:999px',
      'box-shadow:0 4px 14px rgba(0,0,0,.28)', 'pointer-events:none',
      'max-width:70vw'
    ].join(';');
    pill.textContent = '🎯 Thi thử Full — Bước ' + idx + '/4: ' + (SKILL_LABEL[skill] || skill);
    document.body.appendChild(pill);
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
