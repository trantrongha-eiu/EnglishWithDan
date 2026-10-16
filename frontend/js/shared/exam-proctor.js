/**
 * shared/exam-proctor.js — best-effort proctoring for standalone "Test
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
