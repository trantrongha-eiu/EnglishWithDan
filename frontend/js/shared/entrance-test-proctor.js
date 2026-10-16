/**
 * shared/entrance-test-proctor.js — best-effort proctoring for the IELTS
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
