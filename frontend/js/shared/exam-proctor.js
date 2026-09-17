/**
 * shared/exam-proctor.js — best-effort proctoring for standalone "Test
 * Simulation" attempts (Reading/Listening/Writing, full test + "lẻ"
 * practice). Backend: backend/services/examSimulationService.js,
 * POST /api/exam-simulation/violation.
 *
 * This is a deliberately GENERALIZED COPY of the proctor engine in
 * js/shared/mock-test.js (badge, alarm, screen flash, nav-lock, strike
 * reporting, disqualify overlay) — not a refactor of that file. mock-test.js
 * powers the already-working 4-skill Full Mock Test and is left completely
 * untouched; duplicating this ~300 lines trades a little repetition for
 * zero regression risk to that feature. If the two ever need to converge,
 * that's a separate follow-up cleanup, not part of shipping this feature.
 *
 * Differences from mock-test.js's engine:
 *   - Driven by an explicit start({skill, attemptType, attemptId,
 *     onDisqualified}) call instead of auto-arming from `?mock=&skill=`
 *     URL params — a skill page decides for itself when a Simulation
 *     attempt is live.
 *   - Reports to POST /api/exam-simulation/violation (skill + attemptType +
 *     attemptId in the body) instead of /api/mock-test/:id/violation.
 *   - `onDisqualified(cooldownSeconds)` is a caller-supplied callback
 *     instead of a hardcoded redirect — each skill page already has its
 *     own "abandon this attempt and go back" UX to reuse.
 *   - Own DOM element ids (exam-proctor-*) so it can never collide with
 *     mock-test.js's (both scripts are loaded on every skill page; only
 *     one of the two engines is ever actually armed at a time in practice,
 *     but distinct ids make that a non-issue regardless).
 */
(function () {
  'use strict';

  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  function h() {
    return Object.assign({ 'Content-Type': 'application/json' },
      window.AuthService ? window.AuthService.authHeader() : {});
  }

  var _proctor = null;

  // Reading / Listening / Writing exams run inside a real Fullscreen API
  // element — a position:fixed node parented on <body> is invisible while
  // that's active, so the badge + flash must live inside the fullscreened
  // element instead (and move back when it exits). Same trick mock-test.js
  // uses.
  function _fsRoot() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.body;
  }

  function _makeBadge() {
    var b = document.createElement('div');
    b.id = 'exam-proctor-badge';
    b.style.cssText = [
      'position:fixed', 'left:12px', 'bottom:12px', 'z-index:2147483400',
      'font:700 12px/1.2 inherit', 'padding:7px 12px', 'border-radius:999px',
      'display:flex', 'align-items:center', 'gap:6px', 'pointer-events:none',
      'background:rgba(31,41,55,.92)', 'color:#e5e7eb',
      'box-shadow:0 4px 14px rgba(0,0,0,.28)', 'transition:background .2s,color .2s',
      'max-width:60vw', 'white-space:nowrap'
    ].join(';');
    b.innerHTML = '<span aria-hidden="true">👁️</span><span class="ep-txt">Test Simulation — Đang giám sát</span>';
    _fsRoot().appendChild(b);
    return b;
  }

  function _renderBadge() {
    if (!_proctor || !_proctor.badge) return;
    var n = _proctor.count;
    var txt = _proctor.badge.querySelector('.ep-txt');
    if (n > 0) {
      _proctor.badge.style.background = '#b91c1c';
      _proctor.badge.style.color = '#fff';
      if (txt) txt.textContent = 'Gậy: ' + n + '/' + (_proctor.maxViolations || 5) + ' — quay lại bài thi!';
    } else {
      _proctor.badge.style.background = 'rgba(31,41,55,.92)';
      _proctor.badge.style.color = '#e5e7eb';
      if (txt) txt.textContent = 'Test Simulation — Đang giám sát';
    }
  }

  // Continuous pulsing alarm — identical Web Audio approach to mock-test.js
  // (unaffected by background-tab timer throttling since it's gain-gated,
  // not setInterval-driven).
  var ALARM_MAX_MS = 120000;

  function _alarmOn() {
    try {
      if (!_proctor || _proctor.alarm) return;
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
      gate.gain.value = 0.11;
      var lfo = ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 4;
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
    var el = document.getElementById('exam-proctor-flash');
    if (!el) {
      el = document.createElement('div');
      el.id = 'exam-proctor-flash';
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
    if (!_proctor.origTitle) _proctor.origTitle = document.title;
    document.title = '⚠️ QUAY LẠI BÀI THI';
    clearTimeout(_proctor.titleTimer);
    _proctor.titleTimer = setTimeout(function () {
      if (_proctor && _proctor.origTitle) document.title = _proctor.origTitle;
    }, 4000);
  }

  function _report(type) {
    if (!_proctor) return;
    var body = JSON.stringify({
      skill: _proctor.skill, attemptType: _proctor.attemptType,
      attemptId: _proctor.attemptId, type: type
    });
    try {
      fetch(API + '/exam-simulation/violation', { method: 'POST', headers: h(), body: body, keepalive: true })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!_proctor) return;
          if (d && d.disqualified) { _disqualify(d.cooldownSeconds); return; }
          if (d && typeof d.violationCount === 'number') {
            _proctor.count = d.violationCount;
            _renderBadge();
          }
        })
        .catch(function () {});
    } catch (_) {}
  }

  // The run has been disqualified server-side. Tear down every proctoring
  // hook, throw up an unmissable full-screen notice, then hand off to the
  // caller's own onDisqualified callback (each skill page already knows
  // how to abandon its current attempt and where to send the student next
  // — this module doesn't hardcode a redirect the way mock-test.js does).
  function _disqualify(cooldownSeconds) {
    if (!_proctor || _proctor.disqualified) return;
    _proctor.disqualified = true;
    _proctor.navigatingAway = true;
    _alarmOff();
    _unlockNav();
    try { document.removeEventListener('visibilitychange', _proctor.onVis); } catch (_) {}
    try { window.removeEventListener('blur', _proctor.onBlur); } catch (_) {}
    try { window.removeEventListener('focus', _proctor.onFocus); } catch (_) {}
    try { window.onbeforeunload = null; } catch (_) {}

    var mins = Math.max(1, Math.ceil((Number(cooldownSeconds) || 300) / 60));
    var ov = document.createElement('div');
    ov.id = 'exam-proctor-dq-overlay';
    ov.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:2147483647', 'display:flex',
      'flex-direction:column', 'align-items:center', 'justify-content:center',
      'gap:14px', 'text-align:center', 'padding:24px',
      'background:rgba(127,29,29,.97)', 'color:#fff', 'font:600 15px/1.55 inherit'
    ].join(';');
    ov.innerHTML =
      '<div style="font-size:44px">🚫</div>' +
      '<div style="font-size:20px;font-weight:800">Bài Test Simulation đã bị huỷ</div>' +
      '<div style="max-width:460px">Bạn đã rời khỏi màn hình thi quá nhiều lần. '
      + 'Kết quả lần này <b>không được tính</b>. Bạn cần đợi khoảng <b>'
      + mins + ' phút</b> trước khi bắt đầu một lượt Test Simulation mới (ở bất kỳ kỹ năng nào).</div>' +
      '<div style="opacity:.85">Đang quay lại…</div>';
    (_fsRoot() || document.body).appendChild(ov);

    var onDisqualified = _proctor.onDisqualified;
    setTimeout(function () {
      if (typeof onDisqualified === 'function') { try { onDisqualified(cooldownSeconds); } catch (_) {} }
    }, 2800);
  }

  function _onLeave(type) {
    if (!_proctor || _proctor.navigatingAway) return;
    _alarmOn();
    var now = Date.now();
    if (now - _proctor.lastLeaveAt < 1500) return;
    _proctor.lastLeaveAt = now;
    _proctor.count += 1;
    _renderBadge();
    _flash();
    _report(type);
  }

  /* ── Navigation lock — identical approach to mock-test.js's own ── */
  function _navWarn() {
    var msg = 'Bạn đang trong bài Test Simulation — không thể rời trang. Hãy hoàn thành rồi nộp bài.';
    if (typeof window.showToast === 'function') { window.showToast(msg, 'error', 4000); return; }
    if (typeof window.toast === 'function') { window.toast(msg, 'error'); return; }
    var t = document.getElementById('exam-proctor-nav-warn');
    if (!t) {
      t = document.createElement('div');
      t.id = 'exam-proctor-nav-warn';
      t.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:2147483600;'
        + 'background:#b91c1c;color:#fff;font:700 13px/1.35 inherit;padding:10px 16px;border-radius:10px;'
        + 'box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:90vw;text-align:center;pointer-events:none';
      _fsRoot().appendChild(t);
    }
    t.textContent = '⚠️ ' + msg;
    t.style.opacity = '1';
    clearTimeout(t._hide);
    t._hide = setTimeout(function () { t.style.opacity = '0'; }, 3500);
  }

  function _lockNav() {
    if (!_proctor || _proctor.navLocked) return;
    _proctor.navLocked = true;

    var hide = function () { if (typeof window.hideTopNav === 'function') { try { window.hideTopNav(); } catch (_) {} } };
    hide();
    _proctor.navHideTimer = setInterval(function () {
      var n = document.getElementById('globalTopNav');
      if (n && n.style.display !== 'none') hide();
    }, 1000);

    _proctor.onClickCapture = function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || /^(javascript:|mailto:|tel:)/i.test(href)) return;
      if (a.target === '_blank') return;
      var dest;
      try { dest = new URL(a.href, location.href); } catch (_) { return; }
      if (dest.origin === location.origin && dest.pathname === location.pathname) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      _navWarn();
    };
    document.addEventListener('click', _proctor.onClickCapture, true);
  }

  function _unlockNav() {
    if (!_proctor || !_proctor.navLocked) return;
    _proctor.navLocked = false;
    clearInterval(_proctor.navHideTimer);
    if (_proctor.onClickCapture) document.removeEventListener('click', _proctor.onClickCapture, true);
  }

  function _onReturn() {
    if (!_proctor) return;
    if (document.hidden || !document.hasFocus()) return;
    _alarmOff();
    if (_proctor.origTitle) {
      clearTimeout(_proctor.titleTimer);
      document.title = _proctor.origTitle;
    }
  }

  // opts: { skill: 'reading'|'listening'|'writing', attemptType:
  // 'full'|'practice', attemptId, onDisqualified(cooldownSeconds), lockNav
  // (default true — set false for a page where students are expected to
  // navigate between screens, e.g. Listening's separate audio-start
  // overlay before the exam screen proper) }
  function start(opts) {
    opts = opts || {};
    if (_proctor || !opts.skill || !opts.attemptType || !opts.attemptId) return;
    _proctor = {
      skill: opts.skill, attemptType: opts.attemptType, attemptId: opts.attemptId,
      onDisqualified: opts.onDisqualified, maxViolations: opts.maxViolations || 5,
      count: 0, lastLeaveAt: 0, navigatingAway: false, navLocked: false, disqualified: false,
      badge: null, actx: null, alarm: null, alarmSafety: null,
      flashTimer: null, titleTimer: null, origTitle: null, navHideTimer: null
    };
    var doStart = function () {
      if (!_proctor) return;
      _proctor.badge = _makeBadge();
      _renderBadge();
    };
    if (document.body) doStart(); else document.addEventListener('DOMContentLoaded', doStart, { once: true });

    _proctor.onVis = function () {
      if (document.hidden) _onLeave('hidden'); else _onReturn();
    };
    _proctor.onFocus = function () { _onReturn(); };
    _proctor.onBlur = function () {
      setTimeout(function () { if (!document.hasFocus()) _onLeave('blur'); }, 120);
    };
    _proctor.onBeforeUnload = function (e) {
      if (!_proctor || _proctor.navigatingAway) return;
      _report('unload-attempt');
      e.preventDefault();
      e.returnValue = 'Bạn đang làm bài Test Simulation. Rời khỏi trang sẽ bị tính là vi phạm.';
      return e.returnValue;
    };
    _proctor.onFsChange = function () {
      if (!_proctor) return;
      var root = _fsRoot();
      if (_proctor.badge && _proctor.badge.parentNode !== root) root.appendChild(_proctor.badge);
      var fl = document.getElementById('exam-proctor-flash');
      if (fl && fl.parentNode !== root) root.appendChild(fl);
    };
    document.addEventListener('visibilitychange', _proctor.onVis);
    window.addEventListener('focus', _proctor.onFocus);
    window.addEventListener('blur', _proctor.onBlur);
    window.addEventListener('beforeunload', _proctor.onBeforeUnload);
    document.addEventListener('fullscreenchange', _proctor.onFsChange);
    document.addEventListener('webkitfullscreenchange', _proctor.onFsChange);

    if (opts.lockNav !== false) _lockNav();
  }

  function stop() {
    if (!_proctor) return;
    _proctor.navigatingAway = true;
    _alarmOff();
    _unlockNav();
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
    ['exam-proctor-flash', 'exam-proctor-nav-warn'].forEach(function (id) {
      var n = document.getElementById(id);
      if (n && n.parentNode) n.parentNode.removeChild(n);
    });
    _proctor = null;
  }

  function isActive() { return !!_proctor; }

  window.ExamProctor = { start: start, stop: stop, isActive: isActive };
})();
