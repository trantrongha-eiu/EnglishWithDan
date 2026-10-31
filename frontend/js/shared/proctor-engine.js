/**
 * shared/proctor-engine.js — the best-effort exam proctor shared by the
 * three proctored features:
 *   - js/shared/mock-test.js            Full 4-skill Mock Test   (MockTest.startProctor)
 *   - ExamProctor          Test Simulation  (further down this file)
 *   - EntranceTestProctor  Test đầu vào     (further down this file)
 *
 * A browser tab CANNOT stop the student switching away — so we detect it
 * (visibilitychange → hidden, window blur, a close/leave attempt) and:
 *   • sound a pulsing alarm that keeps going until they come back
 *   • flash the screen red + nag the tab title
 *   • bump the on-screen "gậy" counter
 *   • report the strike to the feature's own violation endpoint, which
 *     keeps the running count and voids the attempt on the last strike
 *   • screenshot the shared screen (shared/proctor-capture.js)
 * It also LOCKS navigation (_lockNav): the global nav is hidden and kept
 * hidden, and link clicks that would leave the page are swallowed with a
 * warning. Back button / reload / URL-bar / close still only get the
 * beforeunload confirm — a browser can't hard-block those.
 *
 * ProctorEngine.create(cfg) returns one independent engine. Each feature
 * keeps its own DOM ids so the engines can coexist on a page (mock-test.js
 * and ExamProctor are both loaded on every skill page; only one is
 * ever armed at a time in practice). cfg:
 *   ids            { badge, txt (badge text class), flash, navWarn, overlay }
 *   watchingText   badge text with no strikes yet
 *   navWarnMsg     shown when a link click is swallowed
 *   unloadMsg      beforeunload prompt text
 *   reportUrl(p)   violation endpoint;  reportBody(p, type, capture) its JSON
 *   shot(p, type)  ProctorCapture.shoot() payload
 *   dqHtml(p, mins)        disqualify overlay content
 *   afterDisqualify(p, cooldownSeconds)  what happens once it's shown
 *   onBlur(engine) optional window-blur handler (default: ignore focus
 *                  moving into an iframe of this page)
 */
(function () {
  'use strict';

  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  function h() {
    return Object.assign({ 'Content-Type': 'application/json' },
      window.AuthService ? window.AuthService.authHeader() : {});
  }

  // Reading / Listening / Writing exams run inside a real Fullscreen API
  // element — a position:fixed node parented on <body> is invisible while
  // that's active, so the badge + flash must live inside the fullscreened
  // element instead (and move back when it exits).
  function _fsRoot() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.body;
  }

  function _isStaff() {
    try {
      if (window.AuthService && window.AuthService.isStaff) return window.AuthService.isStaff();
      var u = JSON.parse(localStorage.getItem('user') || 'null');
      return !!(u && (u.role === 'admin' || u.role === 'teacher'));
    } catch (_) { return false; }
  }

  // The full "Gậy: n/5 — quay lại bài thi!" pill used to sit permanently in
  // the bottom-left corner and covered Reading/Listening questions and the
  // Writing Task 1 ⇄ Task 2 switcher. Now it shows the full text only for a
  // few seconds of on-screen time after each change (a new strike, or the
  // start of the exam), then shrinks to a small "👁️ n/5" (or just 👁️).
  var BADGE_EXPAND_MS = 5000;

  // Continuous pulsing alarm ("beep-beep-beep…") that keeps sounding for as
  // long as the student is away. Built entirely with Web Audio nodes — a
  // square LFO gates the tone's gain — so it isn't affected by the timer
  // throttling browsers apply to background tabs. Stops on _alarmOff().
  var ALARM_MAX_MS = 120000; // safety cap so a stuck state can't siren forever

  function create(cfg) {
    var ids = cfg.ids;
    var _proctor = null;

    function _makeBadge() {
      var b = document.createElement('div');
      b.id = ids.badge;
      b.style.cssText = [
        'position:fixed', 'left:12px', 'bottom:12px', 'z-index:2147483400',
        'font:700 12px/1.2 inherit', 'padding:5px 10px', 'border-radius:999px',
        'display:flex', 'align-items:center', 'gap:6px', 'pointer-events:none',
        'background:rgba(31,41,55,.92)', 'color:#e5e7eb',
        'box-shadow:0 4px 14px rgba(0,0,0,.28)', 'transition:background .2s,color .2s,opacity .2s',
        'max-width:60vw', 'white-space:nowrap'
      ].join(';');
      b.innerHTML = '<span aria-hidden="true">👁️</span><span class="' + ids.txt + '">' + cfg.watchingText + '</span>';
      _fsRoot().appendChild(b);
      return b;
    }

    function _expandBadge() {
      var p = _proctor;
      if (!p) return;
      clearInterval(p.badgeTimer);
      p.badgeExpanded = true;
      var shown = 0;
      // Count only time the student can actually see the page — a strike
      // happens while they're away, so the message must still be there when
      // they come back.
      p.badgeTimer = setInterval(function () {
        if (_proctor !== p) { clearInterval(p.badgeTimer); return; }
        if (!document.hidden) shown += 500;
        if (shown >= BADGE_EXPAND_MS) {
          clearInterval(p.badgeTimer);
          p.badgeExpanded = false;
          _renderBadge();
        }
      }, 500);
    }

    function _renderBadge() {
      if (!_proctor || !_proctor.badge) return;
      var n = _proctor.count;
      var max = _proctor.maxViolations || 5;
      var txt = _proctor.badge.querySelector('.' + ids.txt);
      if (n !== _proctor.badgeCount) { _proctor.badgeCount = n; _expandBadge(); }
      var full, compact;
      if (n > 0) {
        _proctor.badge.style.background = '#b91c1c';
        _proctor.badge.style.color = '#fff';
        full = 'Gậy: ' + n + '/' + max + ' — quay lại bài thi!';
        compact = n + '/' + max;
      } else {
        _proctor.badge.style.background = 'rgba(31,41,55,.92)';
        _proctor.badge.style.color = '#e5e7eb';
        full = cfg.watchingText;
        compact = '';
      }
      var label = _proctor.badgeExpanded ? full : compact;
      if (txt) { txt.textContent = label; txt.style.display = label ? '' : 'none'; }
      _proctor.badge.style.opacity = _proctor.badgeExpanded ? '1' : '.8';
    }

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
      var el = document.getElementById(ids.flash);
      if (!el) {
        el = document.createElement('div');
        el.id = ids.flash;
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
      var body = JSON.stringify(cfg.reportBody(_proctor, type, window.ProctorCapture ? window.ProctorCapture.mode() : 'none'));
      try {
        fetch(cfg.reportUrl(_proctor), { method: 'POST', headers: h(), body: body, keepalive: true })
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (!_proctor) return;
            // Server voided the attempt for too many exam-screen exits.
            if (d && d.disqualified) { _disqualify(d.cooldownSeconds); return; }
            if (d && d.maxViolations) _proctor.maxViolations = d.maxViolations;
            if (d && typeof d.violationCount === 'number') {
              _proctor.count = d.violationCount;
              _renderBadge();
            }
          })
          .catch(function () {});
      } catch (_) {}
    }

    // One strike: badge, flash, server report, screenshot of the shared screen.
    function _strike(type) {
      _proctor.count += 1;
      _renderBadge();
      _flash();
      _report(type);
      if (window.ProctorCapture) window.ProctorCapture.shoot(cfg.shot(_proctor, type));
    }

    // The attempt has been disqualified server-side (last strike). Tear down
    // every proctoring hook, throw up an unmissable full-screen notice, then
    // hand over to the feature (save what's there, navigate away).
    function _disqualify(cooldownSeconds) {
      if (!_proctor || _proctor.disqualified) return;
      _proctor.disqualified = true;
      _proctor.navigatingAway = true;   // silences the proctor's own beforeunload
      _alarmOff();
      _unlockNav();
      if (window.ProctorCapture) window.ProctorCapture.release();
      try { document.removeEventListener('visibilitychange', _proctor.onVis); } catch (_) {}
      try { window.removeEventListener('blur', _proctor.onBlur); } catch (_) {}
      try { window.removeEventListener('focus', _proctor.onFocus); } catch (_) {}
      // The page keeps its own window.onbeforeunload ("Rời trang sẽ dừng
      // bài") armed during an exam — clear it so the forced redirect doesn't
      // stack a native "Leave site?" dialog on top of the notice.
      try { window.onbeforeunload = null; } catch (_) {}

      var mins = Math.max(1, Math.ceil((Number(cooldownSeconds) || 300) / 60));
      var ov = document.createElement('div');
      ov.id = ids.overlay;
      ov.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:2147483647', 'display:flex',
        'flex-direction:column', 'align-items:center', 'justify-content:center',
        'gap:14px', 'text-align:center', 'padding:24px',
        'background:rgba(127,29,29,.97)', 'color:#fff', 'font:600 15px/1.55 inherit'
      ].join(';');
      ov.innerHTML = '<div style="font-size:44px">🚫</div>' + cfg.dqHtml(_proctor, mins);
      (_fsRoot() || document.body).appendChild(ov);
      cfg.afterDisqualify(_proctor, cooldownSeconds);
    }

    // A tab switch fires blur AND visibilitychange — collapse to one "leave".
    function _onLeave(type) {
      if (!_proctor || _proctor.navigatingAway || _proctor.staff) return;
      // The browser's own screen-share picker takes focus — not a leave.
      if (window.ProctorCapture && window.ProctorCapture.isPicking()) return;
      _alarmOn();          // start (or keep) the continuous alarm every time
      var now = Date.now();
      if (now - _proctor.lastLeaveAt < 1500) return;
      _proctor.lastLeaveAt = now;
      _strike(type);
    }

    /* ── Navigation lock ──────────────────────────────────────────────
       While a proctored exam is open the student must stay on it until they
       submit. A browser can't fully block navigation, but we can: hide the
       global nav, swallow link clicks that leave the page. Tab close /
       reload / URL-bar still hit the beforeunload confirm. */
    function _navWarn() {
      var msg = cfg.navWarnMsg;
      if (typeof window.showToast === 'function') { window.showToast(msg, 'error', 4000); return; }
      if (typeof window.toast === 'function') { window.toast(msg, 'error'); return; }
      var t = document.getElementById(ids.navWarn);
      if (!t) {
        t = document.createElement('div');
        t.id = ids.navWarn;
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

      // 1) global nav / hamburger / chat bubble — hide it and keep it hidden
      var hide = function () { if (typeof window.hideTopNav === 'function') { try { window.hideTopNav(); } catch (_) {} } };
      hide();
      _proctor.navHideTimer = setInterval(function () {
        var n = document.getElementById('globalTopNav');
        if (n && n.style.display !== 'none') hide();
      }, 1000);

      // 2) swallow link clicks that would navigate away from this page
      //    (nav bar, footer "Trang chủ", any in-content link). The exam's own
      //    controls are <button>s driven by JS, so they're untouched.
      _proctor.onClickCapture = function (e) {
        var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
        if (!a) return;
        var href = a.getAttribute('href') || '';
        if (!href || href.charAt(0) === '#' || /^(javascript:|mailto:|tel:)/i.test(href)) return;
        if (a.target === '_blank') return;                 // new tab, exam stays put
        var dest;
        try { dest = new URL(a.href, location.href); } catch (_) { return; }
        if (dest.origin === location.origin &&
            dest.pathname === location.pathname) return;    // same page (hash / query only)
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

    // fields: the feature's own attempt identity (+ maxViolations / count
    // overrides, callbacks it reads back in its cfg hooks). opts.lockNav
    // false skips the navigation lock. Returns the armed proctor record.
    function arm(fields, opts) {
      opts = opts || {};
      _proctor = Object.assign({
        count: 0, maxViolations: 5,
        lastLeaveAt: 0, navigatingAway: false, navLocked: false, disqualified: false,
        badge: null, actx: null, alarm: null, alarmSafety: null,
        flashTimer: null, titleTimer: null, origTitle: null, navHideTimer: null
      }, fields);
      // Admin/teacher accounts are never proctored: no badge, alarm, strikes,
      // nav lock or screen share. The record still exists so callers'
      // isActive()/stop() flow works the same (the server also ignores
      // staff violation reports).
      if (_isStaff()) { _proctor.staff = true; return _proctor; }
      var mount = function () {
        if (!_proctor) return;
        _proctor.badge = _makeBadge();
        _renderBadge();
      };
      if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount, { once: true });

      _proctor.onVis = function () {
        if (document.hidden) _onLeave('hidden'); else _onReturn();
      };
      _proctor.onFocus = function () { _onReturn(); };
      _proctor.onBlur = cfg.onBlur ? function () { cfg.onBlur(engine); } : function () {
        // Ignore blur caused by focus moving to an element inside our own page
        // (iframes, some widgets). Real "left the window" → document has no focus.
        setTimeout(function () {
          if (document.hasFocus()) return;
          if (document.activeElement && document.activeElement.tagName === 'IFRAME') return;
          _onLeave('blur');
        }, 120);
      };
      _proctor.onBeforeUnload = function (e) {
        if (!_proctor || _proctor.navigatingAway) return;
        _report('unload-attempt');
        e.preventDefault();
        e.returnValue = cfg.unloadMsg;
        return e.returnValue;
      };
      // Keep the badge/flash inside whatever element is currently fullscreen.
      _proctor.onFsChange = function () {
        if (!_proctor) return;
        var root = _fsRoot();
        if (_proctor.badge && _proctor.badge.parentNode !== root) root.appendChild(_proctor.badge);
        var fl = document.getElementById(ids.flash);
        if (fl && fl.parentNode !== root) root.appendChild(fl);
      };
      document.addEventListener('visibilitychange', _proctor.onVis);
      window.addEventListener('focus', _proctor.onFocus);
      window.addEventListener('blur', _proctor.onBlur);
      window.addEventListener('beforeunload', _proctor.onBeforeUnload);
      document.addEventListener('fullscreenchange', _proctor.onFsChange);
      document.addEventListener('webkitfullscreenchange', _proctor.onFsChange);

      if (opts.lockNav !== false) _lockNav();

      if (window.ProctorCapture) {
        window.ProctorCapture.onStopped(function () { if (_proctor && !_proctor.navigatingAway) _strike('share-stopped'); });
        // A fresh start already shared before the attempt was created; a
        // reload-resume lost the stream with the page and must share again.
        window.ProctorCapture.ensureShare({ cancelable: false });
      }
      return _proctor;
    }

    function stop() {
      if (!_proctor) return;
      _proctor.navigatingAway = true;
      _alarmOff();
      _unlockNav();
      if (window.ProctorCapture) window.ProctorCapture.release();
      document.removeEventListener('visibilitychange', _proctor.onVis);
      window.removeEventListener('focus', _proctor.onFocus);
      window.removeEventListener('blur', _proctor.onBlur);
      window.removeEventListener('beforeunload', _proctor.onBeforeUnload);
      document.removeEventListener('fullscreenchange', _proctor.onFsChange);
      document.removeEventListener('webkitfullscreenchange', _proctor.onFsChange);
      clearInterval(_proctor.flashTimer);
      clearInterval(_proctor.badgeTimer);
      clearTimeout(_proctor.titleTimer);
      if (_proctor.origTitle) document.title = _proctor.origTitle;
      if (_proctor.badge && _proctor.badge.parentNode) _proctor.badge.parentNode.removeChild(_proctor.badge);
      [ids.flash, ids.navWarn].forEach(function (id) {
        var n = document.getElementById(id);
        if (n && n.parentNode) n.parentNode.removeChild(n);
      });
      _proctor = null;
    }

    var engine = {
      arm: arm,
      stop: stop,
      isActive: function () { return !!_proctor; },
      current: function () { return _proctor; },
      leave: _onLeave,
      renderBadge: _renderBadge,
      disqualify: _disqualify,
    };
    return engine;
  }

  window.ProctorEngine = { create: create, API: API, headers: h };
})();

// ════════════════════════════════════════════════════════════════════════
//  Test Simulation — window.ExamProctor
// ════════════════════════════════════════════════════════════════════════
/**
 * ExamProctor — best-effort proctoring for standalone "Test
 * Simulation" attempts (Reading/Listening/Writing, full test + "lẻ"
 * practice). Backend: backend/services/examSimulationService.js,
 * POST /api/exam-simulation/violation.
 *
 * The badge/alarm/flash/nav-lock/disqualify engine is shared with the Full
 * Mock Test and the Entrance Test — see shared/proctor-engine.js. What's
 * specific to Test Simulation:
 *   - Driven by an explicit start({skill, attemptType, attemptId,
 *     onDisqualified}) call instead of auto-arming from `?mock=&skill=`
 *     URL params — a skill page decides for itself when a Simulation
 *     attempt is live.
 *   - Reports to POST /api/exam-simulation/violation (skill + attemptType +
 *     attemptId in the body).
 *   - `onDisqualified(cooldownSeconds)` is a caller-supplied callback
 *     instead of a hardcoded redirect — each skill page already has its
 *     own "abandon this attempt and go back" UX to reuse.
 *   - On (re)arm it reads the attempt's server-side state (_syncState).
 */
(function () {
  'use strict';

  var API = window.ProctorEngine.API;
  var h = window.ProctorEngine.headers;

  // On disqualification the page's saveAnswers() sends the answers given so
  // far (they're voided, but the teacher still gets them). Leave the notice
  // up at least 2.8s so it can be read, and never wait on a hung request for
  // more than ~10s.
  function _saveThenLeave(saveAnswers, statusEl, leave) {
    var save = Promise.resolve(null);
    if (typeof saveAnswers === 'function') {
      try { save = Promise.resolve(saveAnswers()); } catch (e) { save = Promise.reject(e); }
    }
    var setStatus = function (txt) { if (statusEl) statusEl.textContent = txt; };
    var saved = save.then(function () { setStatus('Đã gửi bài làm cho giáo viên. Đang quay lại…'); },
      function () { setStatus('Không gửi được bài làm (có thể đã gửi trước đó). Đang quay lại…'); });
    var minWait = new Promise(function (r) { setTimeout(r, 2800); });
    var maxWait = new Promise(function (r) { setTimeout(r, 10000); });
    Promise.race([Promise.all([saved, minWait]), maxWait]).then(leave);
  }

  var engine = window.ProctorEngine.create({
    ids: { badge: 'exam-proctor-badge', txt: 'ep-txt', flash: 'exam-proctor-flash', navWarn: 'exam-proctor-nav-warn', overlay: 'exam-proctor-dq-overlay' },
    watchingText: 'Test Simulation — Đang giám sát',
    navWarnMsg: 'Bạn đang trong bài Test Simulation — không thể rời trang. Hãy hoàn thành rồi nộp bài.',
    unloadMsg: 'Bạn đang làm bài Test Simulation. Rời khỏi trang sẽ bị tính là vi phạm.',
    reportUrl: function () { return API + '/exam-simulation/violation'; },
    reportBody: function (p, type, capture) {
      return { skill: p.skill, attemptType: p.attemptType, attemptId: p.attemptId, type: type, capture: capture };
    },
    shot: function (p, type) {
      return { context: 'simulation', skill: p.skill, attemptType: p.attemptType, attemptId: p.attemptId, type: type };
    },
    dqHtml: function (p, mins) {
      return '<div style="font-size:20px;font-weight:800">Bài Test Simulation đã bị huỷ</div>' +
        '<div style="max-width:460px">Bạn đã vi phạm giám sát <b>' + (p.maxViolations || 5) + ' lần</b>. '
        + 'Kết quả lần này <b>không được tính</b>, nhưng bài làm đến thời điểm này vẫn được gửi cho giáo viên. '
        + 'Bạn cần đợi khoảng <b>' + mins + ' phút</b> trước khi bắt đầu một lượt Test Simulation mới (ở bất kỳ kỹ năng nào).</div>' +
        '<div style="opacity:.85" id="exam-proctor-dq-status">Đang gửi bài làm cho giáo viên…</div>';
    },
    // Hand off to the caller's own onDisqualified callback (each skill page
    // already knows how to abandon its current attempt and where to send the
    // student next) once the answers so far are saved.
    afterDisqualify: function (p, cooldownSeconds) {
      var onDisqualified = p.onDisqualified;
      _saveThenLeave(p.saveAnswers, document.getElementById('exam-proctor-dq-status'), function () {
        if (typeof onDisqualified === 'function') { try { onDisqualified(cooldownSeconds); } catch (_) {} }
      });
    },
  });

  // After a reload the proctor re-arms on the same attempt: show the real
  // server-side strike count/limit, and refuse to carry on with an attempt
  // that already ended (voided, swept as abandoned, submitted elsewhere).
  function _syncState() {
    var p = engine.current();
    var qs = '?skill=' + encodeURIComponent(p.skill) + '&attemptType=' + encodeURIComponent(p.attemptType)
      + '&attemptId=' + encodeURIComponent(p.attemptId);
    try {
      fetch(API + '/exam-simulation/attempt-state' + qs, { headers: h() })
        .then(function (r) { return r && r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || engine.current() !== p) return;
          if (d.maxViolations) p.maxViolations = d.maxViolations;
          if (typeof d.violationCount === 'number' && d.violationCount > p.count) p.count = d.violationCount;
          engine.renderBadge();
          if (d.status === 'disqualified') { engine.disqualify(300); return; }
          if (d.status && d.status !== 'in-progress') {
            var onEnd = p.onDisqualified;
            engine.stop();
            if (typeof window.showToast === 'function') window.showToast('Lượt Test Simulation này đã kết thúc — hãy bắt đầu lượt mới.', 'error', 5000);
            if (typeof onEnd === 'function') { try { onEnd(0); } catch (_) {} }
          }
        })
        .catch(function () {});
    } catch (_) {}
  }

  // opts: { skill: 'reading'|'listening'|'writing', attemptType:
  // 'full'|'practice', attemptId, onDisqualified(cooldownSeconds),
  // saveAnswers() (returns a Promise — sends the answers so far with
  // disqualified:true, run before onDisqualified), lockNav
  // (default true — set false for a page where students are expected to
  // navigate between screens, e.g. Listening's separate audio-start
  // overlay before the exam screen proper) }
  function start(opts) {
    opts = opts || {};
    if (engine.isActive() || !opts.skill || !opts.attemptType || !opts.attemptId) return;
    engine.arm({
      skill: opts.skill, attemptType: opts.attemptType, attemptId: opts.attemptId,
      onDisqualified: opts.onDisqualified, saveAnswers: opts.saveAnswers, maxViolations: opts.maxViolations || 5,
    }, { lockNav: opts.lockNav });
    _syncState();
  }

  window.ExamProctor = { start: start, stop: engine.stop, isActive: engine.isActive };
})();

// ════════════════════════════════════════════════════════════════════════
//  Test đầu vào — window.EntranceTestProctor
// ════════════════════════════════════════════════════════════════════════
/**
 * EntranceTestProctor — best-effort proctoring for the IELTS
 * Entrance Test ("Test đầu vào"). Backend: backend/services/
 * entranceTestService.js, POST /api/entrance-test/:attemptId/violation.
 *
 * The badge/alarm/flash/nav-lock/disqualify engine is shared with the Full
 * Mock Test and Test Simulation — see shared/proctor-engine.js. What's
 * specific to the Entrance Test:
 *   - One attemptId covers ALL four sections (Grammar/Reading/Listening/
 *     Writing all live on a single EntranceTestAttempt doc) — the violation
 *     report body is just { type }.
 *   - maxViolations default 5, matching the backend's shared
 *     proctorPolicy.MAX_VIOLATIONS; the runner passes the server's value
 *     and the strikes already on a resumed attempt (initialCount).
 *   - Window blur also arrives from the embedded Reading/Listening frame
 *     (childBlur), and can be paused while the mic-permission prompt is
 *     open (allowBlurFor).
 *   - Disqualified → a real navigation back to entrance-test.html?voided=1.
 */
(function () {
  'use strict';

  var API = window.ProctorEngine.API;

  // Window blur, from this page or from the embedded Reading/Listening
  // frame (reading.html / listening.html ?embed=entrance forward their own
  // blur here). Focus moving between this page and that frame is not a
  // leave; focus leaving both is.
  function _checkBlur() {
    var p = engine.current();
    if (!p) return;
    // The browser's own microphone-permission prompt (Speaking section)
    // can take focus from the page — that's not the student leaving.
    if (p.blurGraceUntil && Date.now() < p.blurGraceUntil) return;
    setTimeout(function () {
      if (document.hasFocus()) return;
      var f = document.activeElement;
      if (f && f.tagName === 'IFRAME') {
        try { if (f.contentDocument && f.contentDocument.hasFocus()) return; } catch (_) { return; }
      }
      engine.leave('blur');
    }, 120);
  }

  var engine = window.ProctorEngine.create({
    ids: { badge: 'entrance-proctor-badge', txt: 'etp-txt', flash: 'entrance-proctor-flash', navWarn: 'entrance-proctor-nav-warn', overlay: 'entrance-proctor-dq-overlay' },
    watchingText: 'Test đầu vào — Đang giám sát',
    navWarnMsg: 'Bạn đang trong Test đầu vào — không thể rời trang. Hãy hoàn thành rồi nộp bài.',
    unloadMsg: 'Bạn đang làm Test đầu vào. Rời khỏi trang sẽ bị tính là vi phạm.',
    reportUrl: function (p) { return API + '/entrance-test/' + encodeURIComponent(p.attemptId) + '/violation'; },
    reportBody: function (p, type, capture) { return { type: type, capture: capture }; },
    shot: function (p, type) { return { context: 'entrance', attemptId: p.attemptId, type: type }; },
    dqHtml: function (p, mins) {
      return '<div style="font-size:20px;font-weight:800">Test đầu vào đã bị huỷ</div>' +
        '<div style="max-width:460px">Bạn đã rời khỏi màn hình làm bài quá nhiều lần. '
        + 'Kết quả lần này <b>không được tính</b>. Bạn cần đợi khoảng <b>'
        + mins + ' phút</b> trước khi bắt đầu một lượt Test đầu vào mới.</div>' +
        '<div style="opacity:.85">Đang quay lại…</div>';
    },
    // A real navigation, not a JS-only screen swap: guarantees the overlay
    // (appended directly to <body>/the fullscreen root, outside the app's
    // own et-landing/et-runner/et-result containers) actually goes away —
    // a soft "hide this screen, show that one" callback left it stuck on
    // top of the page forever, since nothing ever removed the node itself.
    afterDisqualify: function () {
      setTimeout(function () { location.href = 'entrance-test.html?voided=1'; }, 2800);
    },
    onBlur: _checkBlur,
  });

  // opts: { attemptId, maxViolations (default 5), initialCount (strikes
  // already on the attempt, for a resumed run), lockNav (default true) }
  function start(opts) {
    opts = opts || {};
    if (engine.isActive() || !opts.attemptId) return;
    engine.arm({
      attemptId: opts.attemptId,
      maxViolations: opts.maxViolations || 5,
      count: Number(opts.initialCount) || 0,
    }, { lockNav: opts.lockNav });
  }

  // Ignore window 'blur' (NOT tab-hidden) for the next `ms` — used while the
  // mic-permission prompt is open; pass 0 to end the grace early.
  function allowBlurFor(ms) {
    var p = engine.current();
    if (p) p.blurGraceUntil = ms > 0 ? Date.now() + ms : 0;
  }

  window.EntranceTestProctor = { start: start, stop: engine.stop, isActive: engine.isActive, allowBlurFor: allowBlurFor, childBlur: _checkBlur };
})();
