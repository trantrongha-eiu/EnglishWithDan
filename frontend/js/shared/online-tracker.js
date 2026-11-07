// shared/online-tracker.js — measures how long a student actually studies.
//
// Counts "active" seconds only while a site page is in front (visible and
// focused) AND the student interacted within the last 3 minutes — or
// audio/video is playing, or they're inside an embedded player (YouTube).
// Along the way it records two kinds of breaks:
//   'tab'  — left the site (other tab / app / minimised) for 5 s or more
//   'idle' — page in front but no interaction for over 3 minutes
// A session spans pages and tabs (shared through localStorage) and ends
// after 30 minutes without activity or at midnight VN time.
// Reported to POST /api/activity/beat every 30 s and when the page hides;
// admins read it in Theo dõi luyện tập → Thời gian online.
// Only students are tracked. Never throws — tracking must not break a page.
(function () {
  'use strict';
  try {
    var AS = window.AuthService;
    if (!AS || !AS.getToken || !AS.getToken() || window.__ewdOnlineTracker) return;
    var me = AS.getUser ? AS.getUser() : null;
    if (!me || me.role !== 'student') return;
    window.__ewdOnlineTracker = true;
  } catch (e) { return; }

  var API = window.AuthService.API || 'https://englishwithdan.onrender.com/api';
  var KEY = 'ewdOnline';
  var TICK_MS = 2000;
  var IDLE_MS = 3 * 60 * 1000;
  var IFRAME_MAX_MS = 20 * 60 * 1000;   // inside a video embed: active up to 20 min without parent input
  var AWAY_MIN_MS = 5000;               // shorter absences (file pickers, dialogs) are not breaks
  var SESSION_GAP_MS = 30 * 60 * 1000;
  var NAV_GRACE_MS = 60 * 1000;         // going page → page inside the site
  var FLUSH_MS = 30 * 1000;

  var memState = null;  // fallback when localStorage is unavailable
  var stopped = false;
  var lastInput = Date.now();
  var lastTick = Date.now();
  var pending = null;
  var mediaEls = [];

  function vnDay(t) { return new Date(t + 7 * 3600 * 1000).toISOString().slice(0, 10); }
  function newSid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      return s && typeof s === 'object' ? s : null;
    } catch (e) { return memState; }
  }
  function save(s) {
    memState = s;
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* memState keeps it */ }
  }

  function attending() {
    try { return document.visibilityState === 'visible' && document.hasFocus(); } catch (e) { return false; }
  }

  // Audio created with `new Audio()` never enters the DOM, so remember every
  // element play() is called on.
  try {
    var proto = window.HTMLMediaElement && window.HTMLMediaElement.prototype;
    if (proto && proto.play && !proto.__ewdTracked) {
      var origPlay = proto.play;
      proto.play = function () {
        if (mediaEls.indexOf(this) < 0) mediaEls.push(this);
        return origPlay.apply(this, arguments);
      };
      proto.__ewdTracked = true;
    }
  } catch (e) { /* ignore */ }

  function mediaPlaying() {
    mediaEls = mediaEls.filter(function (el) { return !el.paused || el.isConnected; });
    var els = mediaEls.concat(Array.prototype.slice.call(document.querySelectorAll('audio,video')));
    for (var i = 0; i < els.length; i++) {
      if (!els[i].paused && !els[i].ended) return true;
    }
    return false;
  }

  function inEmbed(now) {
    var a = document.activeElement;
    return !!(a && a.tagName === 'IFRAME' && now - lastInput < IFRAME_MAX_MS);
  }

  function freshPending(s) {
    return { sid: s.sid, startedAt: s.start, active: 0, tabSwitches: 0, idlePauses: 0, breaks: [] };
  }
  function hasData(p) {
    return p && (p.active >= 1 || p.tabSwitches || p.idlePauses || p.breaks.length);
  }

  function tick() {
    if (stopped) return;
    var now = Date.now();
    var dt = Math.min(now - lastTick, TICK_MS * 2.5); // a throttled/sleeping timer can't add a big chunk
    lastTick = now;
    if (!attending()) return;  // only the tab in front measures

    var engaged = now - lastInput < IDLE_MS || mediaPlaying() || inEmbed(now);
    var s = load();
    var today = vnDay(now);

    if (!s || !s.sid || s.day !== today || now - (s.lastActive || 0) > SESSION_GAP_MS) {
      if (!engaged) { if (s) { s.lastAttend = now; save(s); } return; }
      s = { sid: newSid(), start: now, day: today, lastActive: now, lastAttend: now };
      dt = 0;
    }
    if (!pending || pending.sid !== s.sid) {
      if (hasData(pending)) flush(false);
      pending = freshPending(s);
    }

    if (engaged) {
      if (s.idleAt) {
        pending.idlePauses++;
        pending.breaks.push({ type: 'idle', at: s.idleAt, seconds: Math.round((now - s.idleAt) / 1000) });
        s.idleAt = null;
        dt = 0;
      } else if (now - (s.lastAttend || now) > AWAY_MIN_MS) {
        var gap = now - s.lastAttend;
        if (s.nav && s.nav >= s.lastAttend && gap < NAV_GRACE_MS) {
          dt = gap;  // page load inside the site counts as study time
        } else {
          pending.tabSwitches++;
          pending.breaks.push({ type: 'tab', at: s.lastAttend, seconds: Math.round(gap / 1000) });
          dt = 0;
        }
      }
      s.nav = null;
      pending.active += dt / 1000;
      s.lastActive = now;
    } else if (!s.idleAt) {
      s.idleAt = s.lastActive || now;
    }
    s.lastAttend = now;
    save(s);
  }

  function flush(keepalive) {
    if (stopped || !hasData(pending)) return;
    var token = window.AuthService.getToken();
    if (!token) { stopped = true; return; }
    var s = load() || {};
    var p = pending;
    var whole = Math.floor(p.active);
    var body = {
      sid: p.sid, startedAt: p.startedAt,
      lastActiveAt: s.sid === p.sid ? s.lastActive : Date.now(),
      active: whole, tabSwitches: p.tabSwitches, idlePauses: p.idlePauses,
      breaks: p.breaks.slice(0, 50), page: location.pathname,
    };
    // Keep the fractional second so short beats don't lose time.
    pending = { sid: p.sid, startedAt: p.startedAt, active: p.active - whole, tabSwitches: 0, idlePauses: 0, breaks: [] };
    try {
      fetch(API + '/activity/beat', {
        method: 'POST', keepalive: !!keepalive,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(body),
      }).then(function (r) {
        if (r.status === 401 || r.status === 403) stopped = true;
        else if (r.status >= 500) requeue(body);
      }).catch(function () { requeue(body); });
    } catch (e) { /* ignore */ }
  }

  // A failed beat goes back into the next one (same session only).
  function requeue(body) {
    if (!pending || pending.sid !== body.sid) return;
    pending.active += body.active;
    pending.tabSwitches += body.tabSwitches;
    pending.idlePauses += body.idlePauses;
    pending.breaks = body.breaks.concat(pending.breaks).slice(0, 50);
  }

  function onInput() { lastInput = Date.now(); }
  function onReturn() { if (attending()) { lastInput = Date.now(); tick(); } }
  function onLeave() {
    var s = load();
    // Leaving right after being in front = probably a click to another page.
    if (s && Date.now() - (s.lastAttend || 0) < TICK_MS * 2) { s.nav = Date.now(); s.lastAttend = s.nav; save(s); }
    flush(true);
  }

  ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart', 'pointerdown', 'input'].forEach(function (ev) {
    document.addEventListener(ev, onInput, { passive: true, capture: true });
  });
  window.addEventListener('scroll', onInput, { passive: true, capture: true });
  window.addEventListener('focus', onReturn);
  window.addEventListener('blur', function () { setTimeout(tick, 0); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') onReturn();
    else flush(true);
  });
  window.addEventListener('pagehide', onLeave);

  setInterval(tick, TICK_MS);
  setInterval(function () { flush(false); }, FLUSH_MS);
  tick();
})();
