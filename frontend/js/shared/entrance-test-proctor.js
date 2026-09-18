/**
 * shared/entrance-test-proctor.js — best-effort proctoring for the IELTS
 * Entrance Test ("Test đầu vào"). Backend: backend/services/
 * entranceTestService.js, POST /api/entrance-test/:attemptId/violation.
 *
 * A deliberately GENERALIZED COPY of js/shared/exam-proctor.js (itself a
 * documented copy of js/shared/mock-test.js's engine) — same badge/alarm/
 * flash/nav-lock/disqualify-overlay UX, not a refactor of either file. This
 * codebase's own established convention (see exam-proctor.js's header
 * comment) is to duplicate this ~300-line engine per feature rather than
 * force a shared abstraction across independent proctored features —
 * trading a little repetition for zero regression risk to the already-
 * shipped Full Mock Test / Test Simulation proctors.
 *
 * Differences from exam-proctor.js:
 *   - One attemptId covers ALL four sections (Grammar/Reading/Listening/
 *     Writing all live on a single EntranceTestAttempt doc) — no skill/
 *     attemptType split needed in the violation report body.
 *   - Reports to POST /api/entrance-test/:attemptId/violation with just
 *     { type } in the body.
 *   - maxViolations default 5, matching entranceTestService.MAX_VIOLATIONS
 *     (independent of the Full Mock Test's own threshold of 10).
 *   - Own DOM element ids (entrance-proctor-*) so all three proctor engines
 *     can coexist on a page without id collisions, even though only one is
 *     ever actually armed at a time in practice.
 */
(function () {
  'use strict';

  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  function h() {
    return Object.assign({ 'Content-Type': 'application/json' },
      window.AuthService ? window.AuthService.authHeader() : {});
  }

  var _proctor = null;

  function _fsRoot() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.body;
  }

  function _makeBadge() {
    var b = document.createElement('div');
    b.id = 'entrance-proctor-badge';
    b.style.cssText = [
      'position:fixed', 'left:12px', 'bottom:12px', 'z-index:2147483400',
      'font:700 12px/1.2 inherit', 'padding:7px 12px', 'border-radius:999px',
      'display:flex', 'align-items:center', 'gap:6px', 'pointer-events:none',
      'background:rgba(31,41,55,.92)', 'color:#e5e7eb',
      'box-shadow:0 4px 14px rgba(0,0,0,.28)', 'transition:background .2s,color .2s',
      'max-width:60vw', 'white-space:nowrap'
    ].join(';');
    b.innerHTML = '<span aria-hidden="true">👁️</span><span class="etp-txt">Test đầu vào — Đang giám sát</span>';
    _fsRoot().appendChild(b);
    return b;
  }

  function _renderBadge() {
    if (!_proctor || !_proctor.badge) return;
    var n = _proctor.count;
    var txt = _proctor.badge.querySelector('.etp-txt');
    if (n > 0) {
      _proctor.badge.style.background = '#b91c1c';
      _proctor.badge.style.color = '#fff';
      if (txt) txt.textContent = 'Gậy: ' + n + '/' + (_proctor.maxViolations || 5) + ' — quay lại bài thi!';
    } else {
      _proctor.badge.style.background = 'rgba(31,41,55,.92)';
      _proctor.badge.style.color = '#e5e7eb';
      if (txt) txt.textContent = 'Test đầu vào — Đang giám sát';
    }
  }

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
    var el = document.getElementById('entrance-proctor-flash');
    if (!el) {
      el = document.createElement('div');
      el.id = 'entrance-proctor-flash';
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
    var body = JSON.stringify({ type: type });
    var url = API + '/entrance-test/' + encodeURIComponent(_proctor.attemptId) + '/violation';
    try {
      fetch(url, { method: 'POST', headers: h(), body: body, keepalive: true })
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
    ov.id = 'entrance-proctor-dq-overlay';
    ov.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:2147483647', 'display:flex',
      'flex-direction:column', 'align-items:center', 'justify-content:center',
      'gap:14px', 'text-align:center', 'padding:24px',
      'background:rgba(127,29,29,.97)', 'color:#fff', 'font:600 15px/1.55 inherit'
    ].join(';');
    ov.innerHTML =
      '<div style="font-size:44px">🚫</div>' +
      '<div style="font-size:20px;font-weight:800">Test đầu vào đã bị huỷ</div>' +
      '<div style="max-width:460px">Bạn đã rời khỏi màn hình làm bài quá nhiều lần. '
      + 'Kết quả lần này <b>không được tính</b>. Bạn cần đợi khoảng <b>'
      + mins + ' phút</b> trước khi bắt đầu một lượt Test đầu vào mới.</div>' +
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

  function _navWarn() {
    var msg = 'Bạn đang trong Test đầu vào — không thể rời trang. Hãy hoàn thành rồi nộp bài.';
    if (typeof window.showToast === 'function') { window.showToast(msg, 'error', 4000); return; }
    if (typeof window.toast === 'function') { window.toast(msg, 'error'); return; }
    var t = document.getElementById('entrance-proctor-nav-warn');
    if (!t) {
      t = document.createElement('div');
      t.id = 'entrance-proctor-nav-warn';
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

  // opts: { attemptId, onDisqualified(cooldownSeconds), maxViolations
  // (default 5), lockNav (default true) }
  function start(opts) {
    opts = opts || {};
    if (_proctor || !opts.attemptId) return;
    _proctor = {
      attemptId: opts.attemptId,
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
      e.returnValue = 'Bạn đang làm Test đầu vào. Rời khỏi trang sẽ bị tính là vi phạm.';
      return e.returnValue;
    };
    _proctor.onFsChange = function () {
      if (!_proctor) return;
      var root = _fsRoot();
      if (_proctor.badge && _proctor.badge.parentNode !== root) root.appendChild(_proctor.badge);
      var fl = document.getElementById('entrance-proctor-flash');
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
    ['entrance-proctor-flash', 'entrance-proctor-nav-warn'].forEach(function (id) {
      var n = document.getElementById(id);
      if (n && n.parentNode) n.parentNode.removeChild(n);
    });
    _proctor = null;
  }

  function isActive() { return !!_proctor; }

  window.EntranceTestProctor = { start: start, stop: stop, isActive: isActive };
})();
