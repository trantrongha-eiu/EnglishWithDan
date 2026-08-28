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
    stopProctor();  // legit end-of-skill navigation must not log a violation
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

  /* ══════════════════════════════════════════════════════════════════
     Proctoring (best-effort). A browser tab CANNOT stop the student
     switching away — so we detect it (visibilitychange → hidden, window
     blur, a close/leave attempt) and:
       • sound a pulsing alarm that keeps going until they come back
       • flash the screen red + nag the tab title
       • bump the on-screen "gậy" counter
       • POST /mock-test/:id/violation  → server flags the run "violated"
         and keeps the running count (visible later to a teacher).
     Auto-starts on any skill page opened in mock mode; stops the moment
     the student legitimately advances to the next skill.
     ══════════════════════════════════════════════════════════════════ */
  var _proctor = null;

  // Reading / Listening / Writing exams run inside a real Fullscreen API
  // element — a position:fixed node parented on <body> is invisible while
  // that's active, so the badge + flash must live inside the fullscreened
  // element instead (and move back when it exits).
  function _fsRoot() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.body;
  }

  function _makeBadge() {
    var b = document.createElement('div');
    b.id = 'mock-proctor-badge';
    b.style.cssText = [
      'position:fixed', 'left:12px', 'bottom:12px', 'z-index:2147483400',
      'font:700 12px/1.2 inherit', 'padding:7px 12px', 'border-radius:999px',
      'display:flex', 'align-items:center', 'gap:6px', 'pointer-events:none',
      'background:rgba(31,41,55,.92)', 'color:#e5e7eb',
      'box-shadow:0 4px 14px rgba(0,0,0,.28)', 'transition:background .2s,color .2s',
      'max-width:60vw', 'white-space:nowrap'
    ].join(';');
    b.innerHTML = '<span aria-hidden="true">👁️</span><span class="mp-txt">Đang giám sát</span>';
    _fsRoot().appendChild(b);
    return b;
  }

  function _renderBadge() {
    if (!_proctor || !_proctor.badge) return;
    var n = _proctor.count;
    var txt = _proctor.badge.querySelector('.mp-txt');
    if (n > 0) {
      _proctor.badge.style.background = '#b91c1c';
      _proctor.badge.style.color = '#fff';
      if (txt) txt.textContent = 'Gậy: ' + n + ' — quay lại bài thi!';
    } else {
      _proctor.badge.style.background = 'rgba(31,41,55,.92)';
      _proctor.badge.style.color = '#e5e7eb';
      if (txt) txt.textContent = 'Đang giám sát';
    }
  }

  // Continuous pulsing alarm ("beep-beep-beep…") that keeps sounding for as
  // long as the student is away. Built entirely with Web Audio nodes — a
  // square LFO gates the tone's gain — so it isn't affected by the timer
  // throttling browsers apply to background tabs. Stops on _alarmOff().
  var ALARM_MAX_MS = 120000; // safety cap so a stuck state can't siren forever

  function _alarmOn() {
    try {
      if (!_proctor || _proctor.alarm) return;      // already sounding
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!_proctor.actx) _proctor.actx = new AC();
      var ctx = _proctor.actx;
      if (ctx.state === 'suspended' && ctx.resume) {
        var p = ctx.resume(); if (p && p.catch) p.catch(function () {});
      }
      var osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 850;
      var gate = ctx.createGain();
      gate.gain.value = 0.11;                        // mid-point; LFO swings it 0 … 0.22
      var lfo = ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 4;                       // 4 beeps per second
      var lfoAmt = ctx.createGain();
      lfoAmt.gain.value = 0.11;
      lfo.connect(lfoAmt); lfoAmt.connect(gate.gain);
      osc.connect(gate); gate.connect(ctx.destination);
      osc.start(); lfo.start();
      _proctor.alarm = { osc: osc, lfo: lfo };
      _proctor.alarmSafety = setTimeout(_alarmOff, ALARM_MAX_MS);
    } catch (_) {}
  }

  function _alarmOff() {
    if (!_proctor || !_proctor.alarm) return;
    clearTimeout(_proctor.alarmSafety);
    _proctor.alarmSafety = null;
    try { _proctor.alarm.osc.stop(); _proctor.alarm.osc.disconnect(); } catch (_) {}
    try { _proctor.alarm.lfo.stop(); _proctor.alarm.lfo.disconnect(); } catch (_) {}
    _proctor.alarm = null;
  }

  function _flash() {
    var el = document.getElementById('mock-proctor-flash');
    if (!el) {
      el = document.createElement('div');
      el.id = 'mock-proctor-flash';
      el.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:2147483600', 'pointer-events:none',
        'background:#ef4444', 'opacity:0', 'transition:opacity .18s ease'
      ].join(';');
    }
    var root = _fsRoot();
    if (el.parentNode !== root) root.appendChild(el);
    var pulses = 6, i = 0;
    clearInterval(_proctor && _proctor.flashTimer);
    var timer = setInterval(function () {
      el.style.opacity = (i % 2 === 0) ? '0.6' : '0';
      if (++i >= pulses) { clearInterval(timer); el.style.opacity = '0'; }
    }, 200);
    if (_proctor) _proctor.flashTimer = timer;
    // Title nag
    if (!_proctor.origTitle) _proctor.origTitle = document.title;
    document.title = '⚠️ QUAY LẠI BÀI THI';
    clearTimeout(_proctor.titleTimer);
    _proctor.titleTimer = setTimeout(function () {
      if (_proctor && _proctor.origTitle) document.title = _proctor.origTitle;
    }, 4000);
  }

  function _report(type) {
    if (!_proctor) return;
    var body = JSON.stringify({ type: type, skill: _proctor.skill });
    var url = API + '/mock-test/' + encodeURIComponent(_proctor.mockId) + '/violation';
    try {
      fetch(url, { method: 'POST', headers: h(), body: body, keepalive: true })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && typeof d.violationCount === 'number') {
            _proctor.count = d.violationCount;
            _renderBadge();
          }
        })
        .catch(function () {});
    } catch (_) {}
  }

  // A tab switch fires blur AND visibilitychange — collapse to one "leave".
  function _onLeave(type) {
    if (!_proctor || _proctor.navigatingAway) return;
    _alarmOn();          // start (or keep) the continuous alarm every time
    var now = Date.now();
    if (now - _proctor.lastLeaveAt < 1500) return;
    _proctor.lastLeaveAt = now;
    _proctor.count += 1;
    _renderBadge();
    _flash();
    _report(type);
  }

  // Back on the exam tab / window — silence the alarm, drop the title nag.
  function _onReturn() {
    if (!_proctor) return;
    if (document.hidden || !document.hasFocus()) return;
    _alarmOff();
    if (_proctor.origTitle) {
      clearTimeout(_proctor.titleTimer);
      document.title = _proctor.origTitle;
    }
  }

  function startProctor() {
    var x = params();
    if (!x.mockId || !x.skill || _proctor) return;
    _proctor = {
      mockId: x.mockId, skill: x.skill, count: 0,
      lastLeaveAt: 0, navigatingAway: false,
      badge: null, actx: null, alarm: null, alarmSafety: null,
      flashTimer: null, titleTimer: null, origTitle: null
    };
    var start = function () {
      if (!_proctor) return;
      _proctor.badge = _makeBadge();
      _renderBadge();
    };
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });

    _proctor.onVis = function () {
      if (document.hidden) _onLeave('hidden'); else _onReturn();
    };
    _proctor.onFocus = function () { _onReturn(); };
    _proctor.onBlur = function () {
      // Ignore blur caused by focus moving to an element inside our own page
      // (iframes, some widgets). Real "left the window" → document has no focus.
      setTimeout(function () { if (!document.hasFocus()) _onLeave('blur'); }, 120);
    };
    _proctor.onBeforeUnload = function (e) {
      if (!_proctor || _proctor.navigatingAway) return;
      _report('unload-attempt');
      e.preventDefault();
      e.returnValue = 'Bạn đang làm bài thi thử. Rời khỏi trang sẽ bị tính là vi phạm.';
      return e.returnValue;
    };
    // Keep the badge/flash inside whatever element is currently fullscreen.
    _proctor.onFsChange = function () {
      if (!_proctor) return;
      var root = _fsRoot();
      if (_proctor.badge && _proctor.badge.parentNode !== root) root.appendChild(_proctor.badge);
      var fl = document.getElementById('mock-proctor-flash');
      if (fl && fl.parentNode !== root) root.appendChild(fl);
    };
    document.addEventListener('visibilitychange', _proctor.onVis);
    window.addEventListener('focus', _proctor.onFocus);
    window.addEventListener('blur', _proctor.onBlur);
    window.addEventListener('beforeunload', _proctor.onBeforeUnload);
    document.addEventListener('fullscreenchange', _proctor.onFsChange);
    document.addEventListener('webkitfullscreenchange', _proctor.onFsChange);
  }

  function stopProctor() {
    if (!_proctor) return;
    _proctor.navigatingAway = true;
    _alarmOff();
    document.removeEventListener('visibilitychange', _proctor.onVis);
    window.removeEventListener('focus', _proctor.onFocus);
    window.removeEventListener('blur', _proctor.onBlur);
    window.removeEventListener('beforeunload', _proctor.onBeforeUnload);
    document.removeEventListener('fullscreenchange', _proctor.onFsChange);
    document.removeEventListener('webkitfullscreenchange', _proctor.onFsChange);
    clearInterval(_proctor.flashTimer);
    clearTimeout(_proctor.titleTimer);
    if (_proctor.origTitle) document.title = _proctor.origTitle;
    if (_proctor.badge && _proctor.badge.parentNode) _proctor.badge.parentNode.removeChild(_proctor.badge);
    var fl = document.getElementById('mock-proctor-flash');
    if (fl && fl.parentNode) fl.parentNode.removeChild(fl);
    _proctor = null;
  }

  window.MockTest = {
    params: params,
    active: active,
    pageUrl: pageUrl,
    fetchCurrent: fetchCurrent,
    advance: advance,
    showBanner: showBanner,
    startProctor: startProctor,
    stopProctor: stopProctor,
    SKILL_PAGE: SKILL_PAGE,
    SKILL_LABEL: SKILL_LABEL,
    STEP_INDEX: STEP_INDEX
  };

  // Auto-arm on any skill page loaded in mock mode.
  if (active()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startProctor, { once: true });
    } else {
      startProctor();
    }
  }
})();
