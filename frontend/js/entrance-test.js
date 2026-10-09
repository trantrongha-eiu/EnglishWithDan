/**
 * entrance-test.js — the IELTS Entrance Test ("Test đầu vào") student page.
 * One page runs all five sections, so the proctor and the mandatory screen
 * share (shared/proctor-capture.js) live for the whole test. Reading and
 * Listening reuse the real "lẻ" practice UI by embedding reading.html /
 * listening.html in an iframe (?embed=entrance, see embedFrameHTML) instead
 * of a second copy of those renderers. Backend: backend/services/
 * entranceTestService.js, routes/entranceTest.js.
 *
 * Server timestamps are the only source of truth for timing — this file's
 * countdown is a display only; every GET/POST call re-syncs against
 * `serverNow`/`sectionExpiresAt` from the response, and the backend force-
 * finalizes an expired section on its own the moment any request arrives
 * after the deadline, whether or not this page's own timer ever fires.
 */
(function () {
  'use strict';

  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  function h() {
    return Object.assign({ 'Content-Type': 'application/json' },
      window.AuthService ? window.AuthService.authHeader() : {});
  }
  function apiFetch(path, opts) {
    opts = opts || {};
    return fetch(API + path, Object.assign({ headers: h() }, opts))
      .then(function (res) { return window.ApiClient.handleResponse(res); });
  }
  function toast(msg, kind, ms) {
    if (window.toast) window.toast(msg, kind, ms);
    else if (kind === 'error') alert(msg);
  }

  // Default order; each attempt also reports its own (attempt.sectionOrder)
  // — attempts started before Speaking existed end after Writing.
  var SECTION_ORDER = ['grammar', 'reading', 'listening', 'writing', 'speaking'];
  var SECTION_LABEL = { grammar: 'Grammar', reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' };
  var SECTION_ICON = { grammar: 'fa-spell-check', reading: 'fa-book-open', listening: 'fa-headphones', writing: 'fa-pen-nib', speaking: 'fa-microphone' };

  var state = {
    attemptId: null,
    attempt: null,
    serverOffsetMs: 0,     // serverNow - Date.now(), measured at last fetch
    timerHandle: null,
    saveTimers: {},        // debounce handles keyed by a per-input id
    pendingSaves: {},      // the debounced save fns themselves, so a submit can flush them
    submitting: false,     // a section submit is in flight — see doSubmitSection
    heartbeatHandle: null,
  };

  function sectionOrderOf(attempt) {
    return (attempt && attempt.sectionOrder && attempt.sectionOrder.length) ? attempt.sectionOrder : SECTION_ORDER;
  }
  function isLastSection(attempt, section) {
    var order = sectionOrderOf(attempt);
    return order[order.length - 1] === section;
  }

  // ── Submit overlay ───────────────────────────────────────────────────
  // Full-screen, blocks every click/keypress on the page while a section
  // submit is in flight — a student double-clicking "Nộp bài", or the timer
  // firing at the same moment, previously sent several submits at once.
  function showBusy(title, sub) {
    var ov = $('et-submit-overlay');
    if (!ov) return;
    $('et-submit-title').textContent = title || 'Đang nộp bài…';
    $('et-submit-sub').textContent = sub || 'Vui lòng không tắt hoặc tải lại trang.';
    ov.classList.remove('hidden');
    var shell = document.querySelector('.et-shell');
    if (shell) shell.inert = true;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }
  function hideBusy() {
    var ov = $('et-submit-overlay');
    if (ov) ov.classList.add('hidden');
    var shell = document.querySelector('.et-shell');
    if (shell) shell.inert = false;
  }

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function showScreen(id) {
    ['et-landing', 'et-runner', 'et-result'].forEach(function (x) {
      var el = $(x);
      if (el) el.classList.toggle('hidden', x !== id);
    });
    if (id !== 'et-runner') setWideShell(false);
    document.body.classList.toggle('et-running', id === 'et-runner'); // hides the public header's "Trang chủ" link mid-test
  }

  // Reading/Writing are split-screen (two panes side by side) — inside the
  // default 880px shell each pane is only ~400px wide, so the passage,
  // questions, chart and answer box all render cramped. Let the shell span
  // the full viewport for those two sections only; Grammar/Listening are
  // single-column lists that read better at the normal width.
  function setWideShell(on) {
    var shell = document.querySelector('.et-shell');
    if (shell) shell.classList.toggle('et-shell-wide', !!on);
  }

  // ── Landing ──────────────────────────────────────────────────────────

  function renderStructure(sections, totalMinutes) {
    var rows = sections.map(function (s) {
      return '<tr><td><i class="fas ' + SECTION_ICON[s.key] + '"></i> ' + esc(s.label) + '</td>'
        + '<td>' + s.minutes + ' phút</td><td>' + s.questionCount + ' câu</td></tr>';
    }).join('');
    $('et-structure-table').innerHTML = '<tbody>' + rows
      + '<tr class="et-total-row"><td>Tổng</td><td>' + totalMinutes + ' phút</td><td>—</td></tr></tbody>';
  }

  function isLoggedIn() { return !!(window.AuthService && window.AuthService.isLoggedIn()); }
  function currentUser() { return window.AuthService && window.AuthService.getUser ? window.AuthService.getUser() : null; }
  function isGuest() { var u = currentUser(); return !!(u && u.role === 'guest'); }

  function initLanding() {
    showScreen('et-landing');
    setResultUrl(null);
    // Public — the structure table shows before the visitor signs in.
    apiFetch('/entrance-test').then(function (d) {
      renderStructure(d.sections || [], d.totalMinutes || 70);
      if (!d.available) {
        $('et-start-btn').disabled = true;
        $('et-unavailable-note').classList.remove('hidden');
      }
    }).catch(function () {});

    renderCandidate();
    if (!isLoggedIn()) return; // the guest form's submit continues from here

    apiFetch('/entrance-test/history').then(function (d) {
      renderHistory(d.attempts || []);
    }).catch(function () {});

    $('et-start-btn').onclick = startOrResume;
  }

  // ── Visitor without an account: name + phone → guest session ─────────
  // POST /entrance-test/guest returns a token limited to this test (backend
  // middleware/auth.js); everything after that is the normal flow.
  function renderCandidate() {
    var form = $('et-guest-card');
    var bar = $('et-candidate-bar');
    var startBtn = $('et-start-btn');
    if (!isLoggedIn()) {
      form.classList.remove('hidden');
      bar.classList.add('hidden');
      startBtn.classList.add('hidden');
      form.onsubmit = submitGuest;
      return;
    }
    form.classList.add('hidden');
    startBtn.classList.remove('hidden');
    if (!isGuest()) { bar.classList.add('hidden'); return; }
    var u = currentUser();
    var name = [u.lastName, u.firstName].filter(Boolean).join(' ');
    bar.innerHTML = '<i class="fas fa-user-check"></i> Thí sinh: <b>' + esc(name) + '</b>'
      + (u.phone ? ' · <span class="et-candidate-phone">' + esc(u.phone) + '</span>' : '')
      + ' <button type="button" class="et-candidate-switch" id="et-candidate-switch">Không phải bạn? Đổi thí sinh</button>';
    bar.classList.remove('hidden');
    $('et-candidate-switch').onclick = function () {
      // A guest has no password to come back with — this device's token is
      // the only way back to their results, so ask first.
      var msg = 'Đổi thí sinh? Thiết bị này sẽ không còn xem được lịch sử / kết quả của ' + name + '.';
      if (window.confirm(msg)) { window.AuthService.clearSession(); location.reload(); }
    };
  }

  function submitGuest(ev) {
    ev.preventDefault();
    var err = $('et-guest-error');
    var btn = $('et-guest-submit');
    var name = $('et-guest-name').value.replace(/\s+/g, ' ').trim();
    var phone = $('et-guest-phone').value.trim();
    var showErr = function (m) { err.textContent = m; err.classList.remove('hidden'); };
    err.classList.add('hidden');
    if (name.length < 2) { showErr('Vui lòng nhập họ và tên.'); $('et-guest-name').focus(); return; }
    if (!/^(\+?84|0)\d{9,10}$/.test(phone.replace(/[\s.\-()]/g, ''))) { showErr('Số điện thoại không hợp lệ (VD: 0912 345 678).'); $('et-guest-phone').focus(); return; }
    btn.disabled = true;
    apiFetch('/entrance-test/guest', {
      method: 'POST', body: JSON.stringify({ name: name, phone: phone }),
    }).then(function (d) {
      window.AuthService.login(d.token, d.user);
      document.body.classList.add('et-public');
      initLanding();
      toast('Xin chào ' + name + '! Đọc kỹ hướng dẫn rồi bấm "Bắt đầu làm bài".', 'success', 5000);
      var start = $('et-start-btn');
      if (start && start.scrollIntoView) start.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }).catch(function (e) {
      showErr((e && e.message) || 'Không đăng ký được, vui lòng thử lại.');
    }).then(function () { btn.disabled = false; });
  }

  // Result view has its own URL (?result=<attemptId>, clean form
  // /test-dau-vao/ket-qua/<id> via clean-url-router.js) so it can be
  // refreshed / bookmarked; the landing drops it again.
  function setResultUrl(attemptId) {
    try {
      var params = new URLSearchParams(location.search);
      if (attemptId) params.set('result', attemptId); else params.delete('result');
      var qs = params.toString();
      var url = location.pathname + (qs ? '?' + qs : '');
      if (url !== location.pathname + location.search) history.replaceState(null, '', url);
    } catch (_) {}
  }

  var STATUS_LABEL = {
    completed: 'Hoàn thành', disqualified: 'Huỷ do vi phạm', abandoned: 'Bỏ dở',
  };

  // Drives both the start button's label (Bắt đầu / Tiếp tục / Làm lại) and
  // the history list — a student can now self-serve retake (backend no
  // longer blocks a second attempt), so "already has a finished attempt"
  // means "offer a retake", not "lock the button".
  function renderHistory(attempts) {
    var inProgress = attempts.filter(function (a) { return a.status === 'in-progress'; })[0];
    var finished = attempts.filter(function (a) { return a.status !== 'in-progress'; });
    var startBtn = $('et-start-btn');

    if (inProgress) {
      startBtn.innerHTML = '<i class="fas fa-play"></i> Tiếp tục làm bài';
    } else if (finished.length) {
      startBtn.innerHTML = '<i class="fas fa-rotate-right"></i> Làm lại Test đầu vào';
    }

    var card = $('et-history-card');
    if (!finished.length) { card.classList.add('hidden'); return; }
    card.classList.remove('hidden');
    $('et-history-list').innerHTML = finished.map(function (a) {
      var label = STATUS_LABEL[a.status] || a.status;
      var band = (a.resultStatus === 'COMPLETED' && a.overallBand != null)
        ? Number(a.overallBand).toFixed(1)
        : (a.status === 'completed' ? 'Chờ giáo viên duyệt' : '—');
      var canView = a.status !== 'in-progress';
      var dateStr = new Date(a.startedAt || a.createdAt).toLocaleString('vi-VN');
      return '<div class="et-history-row">'
        + '<div class="et-history-left">'
        + '<span class="et-history-date">' + esc(dateStr) + '</span>'
        + '<span class="et-history-status">' + esc(label) + '</span>'
        + '<span class="et-history-band">Band: ' + esc(band) + '</span>'
        + '</div>'
        + (canView ? '<button class="et-btn-secondary et-history-view" data-id="' + a._id + '">Xem kết quả</button>' : '')
        + '</div>';
    }).join('');
    Array.prototype.forEach.call($('et-history-list').querySelectorAll('.et-history-view'), function (btn) {
      btn.onclick = function () { state.attemptId = btn.getAttribute('data-id'); openResult(); };
    });
  }

  function startOrResume() {
    $('et-start-btn').disabled = true;
    // Proctored: the student shares their entire screen first (desktop) so
    // each strike can carry a screenshot — see shared/proctor-capture.js.
    var gate = window.ProctorCapture ? window.ProctorCapture.ensureShare({ cancelable: true }) : Promise.resolve(true);
    gate.then(function (ok) {
      if (!ok) { $('et-start-btn').disabled = false; return; }
      startAttempt();
    });
  }

  function startAttempt() {
    apiFetch('/entrance-test/start', { method: 'POST' }).then(function (d) {
      state.attemptId = d.attemptId;
      loadRunner();
    }).catch(function (e) {
      $('et-start-btn').disabled = false;
      if (e && e.status === 429) {
        var mins = Math.max(1, Math.ceil(((e.body && e.body.cooldownSeconds) || 300) / 60));
        toast('Bạn vừa bị huỷ một lượt Test đầu vào do vi phạm giám sát. Vui lòng đợi khoảng ' + mins + ' phút.', 'error', 7000);
        return;
      }
      toast((e && e.message) || 'Không thể bắt đầu Test đầu vào', 'error');
    });
  }

  // ── Runner ───────────────────────────────────────────────────────────

  // Retries transient failures (a network blip, a Render cold start) rather
  // than bouncing the student back to the landing screen — this is the
  // function timer expiry relies on to actually collect a section the
  // instant time runs out, so a single failed request here must not look
  // like "your attempt is gone" when the attempt is perfectly safe server-
  // side the whole time.
  function loadRunner(retryCount) {
    retryCount = retryCount || 0;
    apiFetch('/entrance-test/' + state.attemptId).then(function (d) {
      onAttemptLoaded(d.attempt);
    }).catch(function (e) {
      if (retryCount < 6) { setTimeout(function () { loadRunner(retryCount + 1); }, 2000); return; }
      state.submitting = false;
      hideBusy();
      toast((e && e.message) || 'Mất kết nối — vui lòng tải lại trang để tiếp tục bài làm', 'error', 8000);
    });
  }

  function onAttemptLoaded(attempt) {
    state.attempt = attempt;
    state.serverOffsetMs = new Date(attempt.serverNow).getTime() - Date.now();
    state.submitting = false;
    hideBusy();

    if (attempt.status !== 'in-progress' || attempt.currentSection === 'done') {
      stopTimer();
      stopHeartbeat();
      speakingTeardown();
      if (window.EntranceTestProctor) window.EntranceTestProctor.stop();
      if (state.pendingDoneAnnounce && attempt.status === 'completed') {
        state.pendingDoneAnnounce = false;
        showDoneModal();
        return;
      }
      state.pendingDoneAnnounce = false;
      openResult();
      return;
    }

    showScreen('et-runner');
    if (window.EntranceTestProctor && !window.EntranceTestProctor.isActive()) {
      var pr = attempt.proctor || {};
      window.EntranceTestProctor.start({ attemptId: state.attemptId, maxViolations: pr.maxViolations, initialCount: pr.violationCount });
    }
    renderProgress(attempt.currentSection);
    renderSection(attempt);
    startTimer(attempt);
    startHeartbeat((attempt.heartbeatSec || 30) * 1000);
  }

  // Keep-alive: the server abandons an attempt whose runner tab has gone
  // silent for a few minutes (tab closed), so it can't be resumed days
  // later. If this tab was suspended past that window, the reply says so
  // and we stop instead of letting the student work on a dead attempt.
  function sendHeartbeat() {
    if (!state.attemptId || !state.heartbeatHandle) return;
    apiFetch('/entrance-test/' + state.attemptId + '/heartbeat', { method: 'POST' }).then(function (d) {
      if (!d || !d.status || d.status === 'in-progress' || !state.heartbeatHandle) return;
      stopHeartbeat();
      if (d.status === 'abandoned') {
        stopTimer();
        speakingTeardown();
        if (window.EntranceTestProctor) window.EntranceTestProctor.stop();
        toast('Lượt Test đầu vào đã bị huỷ vì bạn rời khỏi bài thi quá lâu.', 'error', 8000);
        openResult();
        return;
      }
      loadRunner();
    }).catch(function () {});
  }
  function startHeartbeat(intervalMs) {
    if (state.heartbeatHandle) return;
    state.heartbeatHandle = setInterval(sendHeartbeat, intervalMs);
  }
  function stopHeartbeat() {
    if (state.heartbeatHandle) { clearInterval(state.heartbeatHandle); state.heartbeatHandle = null; }
  }

  function renderProgress(current) {
    var order = sectionOrderOf(state.attempt);
    var idx = order.indexOf(current);
    $('et-progress').innerHTML = order.map(function (s, i) {
      var cls = i < idx ? 'done' : (i === idx ? 'active' : '');
      return '<div class="et-progress-step ' + cls + '"><i class="fas ' + SECTION_ICON[s] + '"></i> ' + SECTION_LABEL[s] + '</div>';
    }).join('<div class="et-progress-sep"></div>');
  }

  function startTimer(attempt) {
    stopTimer();
    var section = attempt.sections[attempt.currentSection];
    var expiresAt = new Date(section.sectionExpiresAt).getTime();
    state.currentSectionExpiresAt = expiresAt; // read by the visibilitychange re-sync below
    var firedExpiry = false;
    var flushedEarly = false;
    function tick() {
      var now = Date.now() + state.serverOffsetMs;
      var remainingSec = Math.max(0, Math.round((expiresAt - now) / 1000));
      // Push any still-debounced keystrokes a moment BEFORE the deadline —
      // a save that lands after it is rejected (the section is finalized
      // first), so the last half-second of typing would otherwise be lost.
      if (remainingSec <= 3 && !flushedEarly) { flushedEarly = true; flushSaves(); }
      var m = Math.floor(remainingSec / 60), s = remainingSec % 60;
      var el = $('et-timer');
      if (el) {
        el.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        el.classList.toggle('et-timer-warn', remainingSec <= 120 && remainingSec > 0);
        el.classList.toggle('et-timer-danger', remainingSec === 0);
      }
      if (remainingSec <= 0 && !firedExpiry) {
        firedExpiry = true; // stopTimer() below already prevents a second tick, but a
        stopTimer();        // visibilitychange re-sync (see boot()) could race a pending tick
        if (state.submitting) return; // a manual submit is already on its way
        if (isLastSection(attempt, attempt.currentSection)) state.pendingDoneAnnounce = true;
        // Speaking: submit it ourselves WITH the recording — the server
        // holds the section open for a short grace period for exactly this.
        if (attempt.currentSection === 'speaking') {
          toast('Hết giờ phần Speaking — đang tự động nộp bài…', 'info', 4000);
          doSubmitSection('speaking');
          return;
        }
        toast('Hết giờ phần ' + SECTION_LABEL[attempt.currentSection] + ' — đang tự động chuyển sang phần tiếp theo…', 'info', 4000);
        if (attempt.currentSection === 'writing') showBusy('Đang nộp bài Writing…');
        loadRunner();
      }
    }
    tick();
    state.timerHandle = setInterval(tick, 1000);
  }
  function stopTimer() { if (state.timerHandle) { clearInterval(state.timerHandle); state.timerHandle = null; } }

  // Browsers throttle (or fully suspend) setInterval timers in a
  // backgrounded tab — a student who tabs away right as a section's time
  // runs out could otherwise sit on an expired section for well past 0:00
  // before the next tick actually fires. This re-syncs against the server
  // the instant the tab becomes visible again, so "collect immediately and
  // move on" holds even after the interval itself got throttled. Only acts
  // once the client-computed deadline has actually passed (not on every
  // ordinary tab switch), and armed once for the whole page lifetime.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible' || !state.attemptId) return;
    var runnerEl = $('et-runner');
    if (!runnerEl || runnerEl.classList.contains('hidden')) return;
    sendHeartbeat(); // back from a long absence -> learn right away if the attempt was abandoned
    var now = Date.now() + state.serverOffsetMs;
    if (state.currentSectionExpiresAt && now >= state.currentSectionExpiresAt) loadRunner();
  });

  function renderSection(attempt) {
    var body = $('et-section-body');
    var section = attempt.currentSection;
    $('et-section-title').innerHTML = '<i class="fas ' + SECTION_ICON[section] + '"></i> ' + SECTION_LABEL[section];
    // #et-submit-btn lives outside #et-section-body (a static sibling row,
    // never touched by the innerHTML replacement below), so a previous
    // section's doSubmitSection() disabling it while its request was in
    // flight would otherwise stay disabled forever once we land on the
    // next section — the button would then silently swallow every click.
    $('et-submit-btn').disabled = false;
    // A resync that lands on the Reading/Listening section already mounted
    // must not reload its frame — that would restart the audio and drop
    // un-synced answers and highlights.
    var mounted = $('et-embed-frame');
    if (mounted && mounted.getAttribute('data-kind') === section) return;
    // The previous listening audio element is about to be destroyed by the
    // innerHTML replacement below — stop it and clear its countdown/progress
    // interval first, so it doesn't keep silently playing in the background
    // (or leak a setInterval ticking against a detached DOM node) once the
    // student has moved on to another section.
    var prevAudio = $('et-listening-audio');
    if (prevAudio) prevAudio.pause();
    clearInterval(state.audioCountdownHandle);
    // A resync that lands on the Speaking section it's already showing must
    // not re-render it — that would throw away the recording (live or
    // finished) and the typed transcript. Any other section releases the mic.
    if (section !== 'speaking') speakingTeardown();
    else if (sp.active) return;
    setWideShell(section === 'reading' || section === 'listening' || section === 'writing');
    if (section === 'grammar') body.innerHTML = renderGrammar(attempt.sections.grammar);
    else if (section === 'reading') body.innerHTML = renderReading(attempt.sections.reading);
    else if (section === 'listening') { body.innerHTML = renderListening(attempt.sections.listening); setupLockedAudio(); }
    else if (section === 'writing') body.innerHTML = renderWriting(attempt.sections.writing);
    else if (section === 'speaking') { body.innerHTML = renderSpeaking(attempt.sections.speaking); setupSpeaking(attempt.sections.speaking); }
    wireSectionInputs(section, attempt);
    $('et-submit-btn').innerHTML = isLastSection(attempt, section)
      ? '<i class="fas fa-flag-checkered"></i> Nộp bài & hoàn thành'
      : '<i class="fas fa-paper-plane"></i> Nộp phần này';
    $('et-submit-btn').onclick = function () { confirmSubmitSection(section); };
  }

  // ── Grammar ──────────────────────────────────────────────────────────

  function renderGrammar(gSection) {
    var savedByQ = {};
    (gSection.answers || []).forEach(function (a) { savedByQ[a.questionId] = a.userAnswer; });
    return '<div class="et-grammar-list">' + (gSection.questions || []).map(function (q, i) {
      var val = savedByQ[q._id] || '';
      var input;
      if (q.type === 'mcq') {
        input = '<div class="et-options">' + (q.options || []).map(function (o) {
          var checked = val === o.id ? 'checked' : '';
          return '<label class="et-option"><input type="radio" name="gq-' + q._id + '" value="' + esc(o.id) + '" ' + checked
            + ' data-q="' + q._id + '" data-kind="grammar"> ' + esc(o.text) + '</label>';
        }).join('') + '</div>';
      } else {
        input = '<input type="text" class="et-text-input" data-q="' + q._id + '" data-kind="grammar" value="' + esc(val) + '" placeholder="Nhập câu trả lời…">';
      }
      return '<div class="et-question"><div class="et-q-num">Câu ' + (i + 1) + '</div>'
        + '<div class="et-q-prompt">' + esc(q.prompt) + '</div>' + input + '</div>';
    }).join('') + '</div>';
  }

  // ── Reading & Listening: the real practice UI, embedded ─────────────
  // Both sections run reading.html / listening.html in an iframe
  // (?embed=entrance) — the same split-screen passage view, question
  // renderers (tables, note forms, drag-and-drop, matching) and highlighter
  // students use for "lẻ" practice, with dictionary/translation blocked.
  // (This page used to carry its own simplified port of those renderers,
  // which escaped admin-authored HTML in note/table templates and showed
  // students raw "<div style=…>" markup.) This page keeps everything
  // exam-related: timer, submit, autosave, proctoring and, for Listening,
  // the locked single-play audio. The frame talks to us through
  // window.EntranceEmbedHost below.

  function answersMapOf(list) {
    var map = {};
    (list || []).forEach(function (a) { if (a.userAnswer) map[a.questionNumber] = a.userAnswer; });
    return map;
  }

  window.EntranceEmbedHost = {
    getSection: function (kind) {
      var s = state.attempt && state.attempt.sections[kind];
      if (!s || state.attempt.currentSection !== kind) return null;
      return kind === 'reading'
        ? { attemptId: state.attemptId, passage: s.passage, answers: answersMapOf(s.answers) }
        : { attemptId: state.attemptId, section: s.section, answers: answersMapOf(s.answers) };
    },
    onAnswers: function (kind, map) {
      if (!state.attempt || state.attempt.currentSection !== kind) return;
      debounceSave('embed-' + kind, function () { return saveAnswer({ section: kind, answers: map }); });
    },
    childReady: function (kind) {
      var loading = $('et-embed-loading');
      if (loading && state.attempt && state.attempt.currentSection === kind) loading.classList.add('hidden');
    },
    childBlur: function () {
      if (window.EntranceTestProctor && window.EntranceTestProctor.childBlur) window.EntranceTestProctor.childBlur();
    },
  };

  // The frame debounces its own reports — read its answers directly so a
  // submit / timer expiry never misses the last change.
  function pullEmbedAnswers() {
    var frame = $('et-embed-frame');
    var kind = frame && frame.getAttribute('data-kind');
    if (!kind || !state.attempt || state.attempt.currentSection !== kind) return;
    try {
      var api = frame.contentWindow && frame.contentWindow.__entranceEmbed;
      if (!api) return;
      var map = api.getAnswers();
      debounceSave('embed-' + kind, function () { return saveAnswer({ section: kind, answers: map }); });
    } catch (_) {}
  }

  function embedFrameHTML(kind) {
    var page = kind === 'reading' ? 'reading.html' : 'listening.html';
    return '<div class="et-embed-wrap">'
      + '<div class="et-embed-loading" id="et-embed-loading"><div class="et-spinner" aria-hidden="true"></div> Đang tải đề ' + SECTION_LABEL[kind] + '…</div>'
      + '<iframe class="et-embed-frame et-embed-' + kind + '" id="et-embed-frame" data-kind="' + kind + '" title="' + SECTION_LABEL[kind] + '"'
      + ' src="' + page + '?embed=entrance"></iframe></div>';
  }

  function renderReading() {
    return embedFrameHTML('reading');
  }

  var LISTENING_AUTOPLAY_DELAY_SEC = 30;

  function renderListening(lSection) {
    // No native `controls` — its built-in scrub bar/skip-ahead buttons would
    // let a student rewind or jump ahead, unlike a real Listening test's
    // one continuous playthrough. setupLockedAudio() (wired below, after
    // this HTML lands in the DOM) renders play progress into
    // #et-audio-status instead and auto-starts playback after a fixed delay
    // so students first get time to read the questions, same as a real exam.
    var audio = lSection.audioUrlSnapshot
      ? '<div class="et-audio-wrap"><audio id="et-listening-audio" preload="auto" src="' + esc(lSection.audioUrlSnapshot) + '"></audio>'
        + '<div id="et-audio-status"></div></div>'
      : '<div class="et-warning">Không tìm thấy file âm thanh.</div>';
    return '<div class="et-listening-layout">' + audio + embedFrameHTML('listening') + '</div>';
  }

  // Auto-starts playback after LISTENING_AUTOPLAY_DELAY_SEC (giving the
  // student that long to read the questions first, like a real exam), then
  // shows a read-only progress readout in place of any seek control. Guards
  // against a student forcing currentTime backward/forward anyway (a stray
  // media-key press, or "Hiện điều khiển" from the element's own right-click
  // context menu) by snapping back to the last naturally-reached position —
  // oncontextmenu is also blocked below so that menu option is never offered.
  function setupLockedAudio() {
    var audio = $('et-listening-audio');
    var status = $('et-audio-status');
    if (!audio || !status) return;
    audio.tabIndex = -1;
    audio.oncontextmenu = function () { return false; };
    audio.onkeydown = function (e) { e.preventDefault(); };

    var lastGoodTime = 0;
    var started = false;
    audio.addEventListener('timeupdate', function () {
      if (!audio.seeking) lastGoodTime = audio.currentTime;
      renderProgress();
    });
    audio.addEventListener('seeking', function () {
      if (Math.abs(audio.currentTime - lastGoodTime) > 1) audio.currentTime = lastGoodTime;
    });

    function fmt(sec) {
      sec = Math.max(0, Math.floor(sec || 0));
      var m = Math.floor(sec / 60), s = sec % 60;
      return m + ':' + (s < 10 ? '0' : '') + s;
    }
    function renderProgress() {
      var dur = audio.duration || 0;
      var pct = dur ? Math.min(100, (audio.currentTime / dur) * 100) : 0;
      status.innerHTML = '<div class="et-audio-playing">'
        + '<i class="fas fa-volume-up et-audio-icon"></i>'
        + '<div class="et-audio-bar"><div class="et-audio-bar-fill" style="width:' + pct + '%"></div></div>'
        + '<span class="et-audio-time">' + fmt(audio.currentTime) + ' / ' + fmt(dur) + '</span></div>'
        + '<div class="et-audio-note">Bài nghe tự động phát — không thể tua lại hoặc tua tới.</div>';
    }
    function startPlayback() {
      if (started) return;
      started = true;
      audio.play().catch(function () {
        // Autoplay-with-sound can be blocked by the browser without a prior
        // user gesture — surface a manual "Nhấn để phát" fallback rather
        // than silently leaving the student staring at a stuck countdown.
        status.innerHTML = '<div class="et-audio-countdown">'
          + '<button type="button" class="et-btn-primary" id="et-audio-manual-play"><i class="fas fa-play"></i> Nhấn để phát âm thanh</button></div>';
        var btn = $('et-audio-manual-play');
        if (btn) btn.onclick = function () { audio.play().then(renderProgress).catch(function () {}); };
      });
    }

    var remaining = LISTENING_AUTOPLAY_DELAY_SEC;
    function tickCountdown() {
      status.innerHTML = '<div class="et-audio-countdown">Âm thanh sẽ tự động phát sau <b>' + remaining + 's</b></div>';
      if (remaining <= 0) { clearInterval(state.audioCountdownHandle); startPlayback(); return; }
      remaining--;
    }
    clearInterval(state.audioCountdownHandle);
    tickCountdown();
    state.audioCountdownHandle = setInterval(tickCountdown, 1000);
  }

  function countWords(text) { return String(text || '').trim().split(/\s+/).filter(Boolean).length; }

  function renderWriting(wSection) {
    var prompt = wSection.prompt || {};
    var img = prompt.imageUrl ? '<img class="et-task-image" src="' + esc(prompt.imageUrl) + '" alt="Task 1 chart">' : '';
    var answer = wSection.writingAnswer || '';
    // Split screen (chart/prompt left, answer right) — same shape as the
    // real Writing exam page (writing.js's .exam-left/.exam-right) — instead
    // of stacking the chart above the textarea, where scrolling down to
    // write pushed the chart out of view.
    return '<div class="et-writing-layout">'
      + '<div class="et-writing-task">'
      + '<div class="et-task-instructions">' + esc(prompt.instructions || 'You should spend about 20 minutes on this task. Write at least 150 words.') + '</div>'
      + '<div class="et-task-prompt">' + esc(prompt.prompt || '') + '</div>' + img
      + '</div>'
      + '<div class="et-writing-answer">'
      + '<textarea id="et-writing-textarea" class="et-writing-textarea" placeholder="Viết bài của bạn ở đây…">' + esc(answer) + '</textarea>'
      + '<div class="et-word-count" id="et-word-count">' + countWords(answer) + ' từ (tối thiểu 150 từ)</div>'
      + '</div></div>';
  }

  // ── Speaking (Part 2) ────────────────────────────────────────────────
  // Same exam UI as the practice page (speaking.html / js/speaking.js):
  // cue card, notes box, prep countdown, record button + 2-minute cap,
  // live speech-to-text into an editable transcript — minus the sample
  // answer and vocab hints, and with NO feedback afterwards: the recording
  // + transcript go to the teacher. The student may also type (or fix) the
  // answer themselves. Recording engine is a trimmed port of speaking.js's
  // (SpeechRecognition with transparent auto-restart + an independent
  // MediaRecorder capture, so audio is kept even where STT is unavailable).

  var sp = {
    active: false, recording: false, done: false,
    recognition: null, recognitionDead: false, userStopped: false, restartAttempts: 0,
    baseText: '', finalText: '',
    stream: null, recorder: null, chunks: [], blob: null, mimeType: '',
    recordStart: 0, durationSec: 0,
    prepHandle: null, speakHandle: null, elapsedHandle: null,
    prepSec: 70, maxSpeakSec: 120,
  };

  function fmtClock(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function renderSpeaking(sSection) {
    var q = sSection.question || {};
    return '<div class="et-speaking">'
      + '<div class="et-sp-card">'
      + '<div class="et-sp-meta"><span class="et-sp-part">Part 2</span>'
      + (q.topic ? '<span class="et-sp-topic">' + esc(q.topic) + '</span>' : '') + '</div>'
      + '<div class="et-sp-q">' + esc(q.question || '') + '</div>'
      + (q.cueCard ? '<div class="et-sp-cue">' + esc(q.cueCard) + '</div>' : '')
      + '</div>'
      + '<div class="et-sp-box et-sp-notes">'
      + '<div class="et-sp-box-head"><span class="et-sp-label"><i class="fas fa-note-sticky"></i> Ghi chú của bạn</span>'
      + '<span class="et-sp-hint">Dàn ý, ý tưởng, từ vựng… — không được chấm, không lưu</span></div>'
      + '<textarea class="et-sp-textarea" id="et-sp-notes" placeholder="Ghi nhanh dàn ý trong thời gian chuẩn bị…"></textarea>'
      + '</div>'
      + '<div id="et-sp-prep" class="et-sp-prep hidden">'
      + '<div class="et-sp-prep-phase"><i class="fas fa-book-open"></i> Thời gian chuẩn bị</div>'
      + '<div class="et-sp-prep-clock" id="et-sp-prep-clock">1:10</div>'
      + '<div class="et-sp-prep-hint">Đọc cue card và lập dàn ý — hết giờ chuẩn bị sẽ tự động bắt đầu ghi âm</div>'
      + '<button type="button" class="et-sp-prep-skip" id="et-sp-prep-skip">Bắt đầu nói ngay <i class="fas fa-arrow-right"></i></button>'
      + '</div>'
      + '<div class="et-sp-record">'
      + '<div class="et-sp-record-area">'
      + '<button type="button" class="et-sp-rec-btn" id="et-sp-rec-btn"><span class="et-sp-rec-ring"></span>'
      + '<i class="fas fa-microphone" id="et-sp-rec-icon"></i><span class="et-sp-rec-label" id="et-sp-rec-label">Bắt đầu</span></button>'
      + '<div class="et-sp-rec-info">'
      + '<div class="et-sp-rec-status" id="et-sp-rec-status">Nhấn để ghi âm</div>'
      + '<div class="et-sp-rec-timers">'
      + '<span class="et-sp-elapsed hidden" id="et-sp-elapsed"><i class="fas fa-circle" style="font-size:7px"></i> <span id="et-sp-elapsed-time">0:00</span></span>'
      + '<span class="et-sp-countdown hidden" id="et-sp-countdown"><i class="fas fa-hourglass-half"></i> <b id="et-sp-speak-time">2:00</b> còn lại</span>'
      + '</div></div></div>'
      + '<div class="et-sp-interim" id="et-sp-interim"></div>'
      + '</div>'
      + '<div class="et-sp-box">'
      + '<div class="et-sp-box-head"><span class="et-sp-label"><i class="fas fa-file-alt"></i> Câu trả lời (transcript)</span>'
      + '<span class="et-sp-hint">Tự điền khi bạn nói — bạn có thể gõ hoặc sửa trực tiếp</span></div>'
      + '<textarea class="et-sp-textarea" id="et-sp-transcript" placeholder="Lời bạn nói sẽ hiện ở đây… hoặc gõ câu trả lời của bạn.">' + esc(sSection.transcript || '') + '</textarea>'
      + '</div>'
      + '</div>';
  }

  function spSetStatus(text, live) {
    var el = $('et-sp-rec-status');
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('live', !!live);
  }

  function spSetButton(mode) {
    var btn = $('et-sp-rec-btn');
    if (!btn) return;
    var icon = $('et-sp-rec-icon'), label = $('et-sp-rec-label');
    btn.classList.toggle('recording', mode === 'recording');
    btn.disabled = mode === 'disabled' || mode === 'done';
    if (icon) icon.className = 'fas ' + (mode === 'recording' ? 'fa-stop' : mode === 'done' ? 'fa-check' : 'fa-microphone');
    if (label) label.textContent = mode === 'recording' ? 'Dừng' : mode === 'done' ? 'Đã ghi' : 'Bắt đầu';
  }

  function setupSpeaking(sSection) {
    sp.active = true;
    sp.prepSec = sSection.prepSec || 70;
    sp.maxSpeakSec = sSection.maxSpeakSec || 120;
    var ta = $('et-sp-transcript');
    if (ta) {
      ta.addEventListener('input', function () {
        debounceSave('speaking', function () { return saveAnswer({ section: 'speaking', transcript: ta.value }); });
      });
    }
    var recBtn = $('et-sp-rec-btn');
    if (recBtn) recBtn.onclick = function () { if (sp.recording) spStopRecording(); else spStartRecording(); };
    var skip = $('et-sp-prep-skip');
    if (skip) skip.onclick = function () { spEndPrep(); spStartRecording(); };

    // Prep window is measured from the server's section start, so a
    // refresh doesn't hand out a fresh 1:10.
    var startedMs = new Date(sSection.startedAt).getTime();
    var prepLeft = Math.round((startedMs + sp.prepSec * 1000 - (Date.now() + state.serverOffsetMs)) / 1000);
    if (prepLeft > 0) {
      spSetButton('disabled');
      $('et-sp-prep').classList.remove('hidden');
      $('et-sp-prep-clock').textContent = fmtClock(prepLeft);
      spSetStatus('Đang trong thời gian chuẩn bị');
      sp.prepHandle = setInterval(function () {
        prepLeft--;
        var clock = $('et-sp-prep-clock');
        if (clock) clock.textContent = fmtClock(prepLeft);
        if (prepLeft <= 0) {
          spEndPrep();
          toast('⏰ Hết thời gian chuẩn bị — bắt đầu nói!', 'info');
          spStartRecording();
        }
      }, 1000);
    } else {
      spSetButton('idle');
      spSetStatus('Nhấn nút micro để bắt đầu ghi âm (tối đa 2 phút)');
    }
    // Ask for the mic now, during prep, so the permission prompt doesn't
    // eat into the 2 speaking minutes.
    spEnsureStream().catch(function () {});
  }

  function spEndPrep() {
    clearInterval(sp.prepHandle);
    sp.prepHandle = null;
    var prep = $('et-sp-prep');
    if (prep) prep.classList.add('hidden');
    if (!sp.recording && !sp.done) spSetButton('idle');
  }

  function spEnsureStream() {
    if (sp.stream) return Promise.resolve(sp.stream);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.reject(new Error('no-media'));
    if (window.EntranceTestProctor && window.EntranceTestProctor.allowBlurFor) window.EntranceTestProctor.allowBlurFor(20000);
    return navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    }).then(function (stream) {
      if (!sp.active) { stream.getTracks().forEach(function (t) { t.stop(); }); throw new Error('inactive'); }
      sp.stream = stream;
      return stream;
    }).catch(function (e) {
      var name = e && e.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        toast('Trình duyệt đang chặn micro. Bấm biểu tượng 🔒 trên thanh địa chỉ → cho phép Micro. Bạn vẫn có thể gõ câu trả lời.', 'error', 8000);
      } else if (name === 'NotFoundError') {
        toast('Không tìm thấy micro. Bạn có thể gõ câu trả lời vào ô bên dưới.', 'error', 7000);
      } else if (name === 'NotReadableError') {
        toast('Micro đang bị ứng dụng khác sử dụng (Zoom, Meet…). Đóng ứng dụng đó rồi thử lại.', 'error', 7000);
      }
      throw e;
    }).finally(function () {
      if (window.EntranceTestProctor && window.EntranceTestProctor.allowBlurFor) window.EntranceTestProctor.allowBlurFor(0);
    });
  }

  function spRenderTranscript(interim) {
    var ta = $('et-sp-transcript');
    var spoken = sp.finalText.trim();
    if (ta) ta.value = (sp.baseText ? sp.baseText + (spoken ? ' ' : '') : '') + spoken;
    var im = $('et-sp-interim');
    if (im) im.textContent = interim || '';
  }

  function spStartRecognition() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      sp.recognitionDead = true;
      toast('Trình duyệt này không tự chuyển giọng nói thành chữ — bài vẫn được ghi âm, bạn có thể gõ lại câu trả lời sau khi dừng.', 'info', 7000);
      return;
    }
    var rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = function (e) {
      sp.restartAttempts = 0;
      var interim = '';
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var t = e.results[i][0].transcript;
        if (e.results[i].isFinal) sp.finalText += t + ' ';
        else interim += t;
      }
      spRenderTranscript(interim);
    };
    rec.onerror = function (e) {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      // Only the speech-to-text SERVICE is unavailable (Brave/Firefox,
      // blocked network) or permission was refused — the raw recording
      // keeps going either way; the student types the answer afterwards.
      sp.recognitionDead = true;
      if (e.error === 'not-allowed' && !sp.stream) {
        toast('Bạn chưa cấp quyền micro. Hãy cho phép micro, hoặc gõ câu trả lời vào ô bên dưới.', 'error', 7000);
      } else {
        toast('Không nhận dạng được giọng nói trên trình duyệt này — bài vẫn đang được ghi âm. Sau khi dừng, hãy gõ lại câu trả lời.', 'info', 7000);
      }
    };
    rec.onend = function () {
      // Chrome ends "continuous" sessions on its own after a pause —
      // transparently resume (capped when nothing is being heard).
      if (sp.recording && !sp.userStopped && !sp.recognitionDead && sp.restartAttempts < 6) {
        sp.restartAttempts++;
        setTimeout(function () {
          if (!sp.recording || sp.userStopped) return;
          try { rec.start(); } catch (_) { sp.recognitionDead = true; }
        }, 250);
      }
    };
    sp.recognition = rec;
    try { rec.start(); } catch (_) { sp.recognitionDead = true; }
  }

  function spStartRecording() {
    if (sp.recording || sp.done || !sp.active) return;
    spEndPrep();
    spSetButton('disabled');
    spSetStatus('Đang bật micro…');
    spEnsureStream().then(function (stream) {
      if (!sp.active || sp.recording || sp.done) return;
      sp.recording = true;
      sp.userStopped = false;
      sp.recognitionDead = false;
      sp.restartAttempts = 0;
      sp.finalText = '';
      var ta = $('et-sp-transcript');
      sp.baseText = ta ? ta.value.trim() : '';
      if (ta) ta.readOnly = true;

      sp.chunks = [];
      try {
        sp.recorder = new MediaRecorder(stream);
        sp.mimeType = sp.recorder.mimeType || 'audio/webm';
        sp.recorder.ondataavailable = function (ev) { if (ev.data && ev.data.size > 0) sp.chunks.push(ev.data); };
        sp.recorder.start(1000);
      } catch (e) {
        sp.recorder = null;
      }
      spStartRecognition();

      sp.recordStart = Date.now();
      spSetButton('recording');
      spSetStatus('🔴 Đang ghi âm…', true);
      $('et-sp-elapsed').classList.remove('hidden');
      $('et-sp-countdown').classList.remove('hidden');
      var left = sp.maxSpeakSec;
      $('et-sp-speak-time').textContent = fmtClock(left);
      sp.elapsedHandle = setInterval(function () {
        var el = $('et-sp-elapsed-time');
        if (el) el.textContent = fmtClock((Date.now() - sp.recordStart) / 1000);
      }, 1000);
      sp.speakHandle = setInterval(function () {
        left--;
        var t = $('et-sp-speak-time');
        if (t) t.textContent = fmtClock(left);
        if (left === 30) toast('⚠️ Còn 30 giây!', 'warn');
        if (left <= 0) {
          toast('⏰ Hết 2 phút — ghi âm đã dừng.', 'info');
          spStopRecording();
        }
      }, 1000);
    }).catch(function () {
      if (!sp.active) return;
      spSetButton('idle');
      spSetStatus('Không bật được micro — bạn có thể gõ câu trả lời vào ô bên dưới');
    });
  }

  // Resolves with the recorded Blob (or null). Safe to call when idle.
  function spStopRecording() {
    if (!sp.recording) return Promise.resolve(sp.blob);
    sp.recording = false;
    sp.userStopped = true;
    sp.durationSec = Math.round((Date.now() - sp.recordStart) / 1000);
    clearInterval(sp.elapsedHandle);
    clearInterval(sp.speakHandle);
    sp.elapsedHandle = sp.speakHandle = null;
    if (sp.recognition) { try { sp.recognition.stop(); } catch (_) {} }
    spRenderTranscript('');
    var ta = $('et-sp-transcript');
    if (ta) ta.readOnly = false;
    var cd = $('et-sp-countdown');
    if (cd) cd.classList.add('hidden');

    var recorder = sp.recorder;
    sp.recorder = null;
    return new Promise(function (resolve) {
      if (!recorder || recorder.state === 'inactive') { resolve(null); return; }
      recorder.onstop = function () {
        resolve(sp.chunks.length ? new Blob(sp.chunks, { type: sp.mimeType || 'audio/webm' }) : null);
      };
      try { recorder.stop(); } catch (_) { resolve(null); }
    }).then(function (blob) {
      sp.blob = blob;
      if (sp.stream) { sp.stream.getTracks().forEach(function (t) { t.stop(); }); sp.stream = null; }
      if (blob && blob.size > 0) {
        sp.done = true; // one take, like the real exam
        spSetButton('done');
        spSetStatus('✓ Đã ghi âm xong — kiểm tra / sửa câu trả lời rồi bấm "Nộp bài & hoàn thành"');
      } else {
        spSetButton('idle');
        spSetStatus('Không ghi được âm thanh — thử lại hoặc gõ câu trả lời vào ô bên dưới');
      }
      if (ta) saveAnswer({ section: 'speaking', transcript: ta.value });
      return blob;
    });
  }

  function speakingTeardown() {
    if (!sp.active) return;
    sp.active = false;
    clearInterval(sp.prepHandle);
    clearInterval(sp.elapsedHandle);
    clearInterval(sp.speakHandle);
    sp.userStopped = true;
    sp.recording = false;
    if (sp.recognition) { try { sp.recognition.abort(); } catch (_) {} }
    if (sp.recorder && sp.recorder.state !== 'inactive') { try { sp.recorder.stop(); } catch (_) {} }
    if (sp.stream) sp.stream.getTracks().forEach(function (t) { t.stop(); });
    sp.recognition = sp.recorder = sp.stream = sp.blob = null;
    sp.chunks = [];
    sp.done = false;
    sp.finalText = sp.baseText = '';
    sp.durationSec = 0;
  }

  // Stops a live recording, then ships recording + transcript + duration
  // as one multipart submit.
  function submitSpeaking() {
    return spStopRecording().then(function (blob) {
      var ta = $('et-sp-transcript');
      var fd = new FormData();
      fd.append('transcript', ta ? ta.value : '');
      fd.append('durationSec', String(sp.durationSec || 0));
      if (blob && blob.size > 0) {
        var ext = /ogg/.test(blob.type) ? 'ogg' : /mp4|m4a/.test(blob.type) ? 'm4a' : 'webm';
        fd.append('audio', blob, 'speaking.' + ext);
      }
      var headers = window.AuthService ? window.AuthService.authHeader() : {};
      return fetch(API + '/entrance-test/' + state.attemptId + '/section/speaking/submit', { method: 'POST', headers: headers, body: fd })
        .then(function (res) { return window.ApiClient.handleResponse(res); });
    });
  }

  // ── Autosave wiring ──────────────────────────────────────────────────

  function debounceSave(key, fn) {
    clearTimeout(state.saveTimers[key]);
    state.pendingSaves[key] = fn;
    state.saveTimers[key] = setTimeout(function () {
      delete state.pendingSaves[key];
      fn();
    }, 500);
  }

  // Sends every still-debounced save right now; resolves once they land.
  function flushSaves() {
    pullEmbedAnswers();
    var fns = Object.keys(state.pendingSaves).map(function (k) {
      clearTimeout(state.saveTimers[k]);
      var fn = state.pendingSaves[k];
      delete state.pendingSaves[k];
      return fn;
    });
    return Promise.all(fns.map(function (fn) { return Promise.resolve(fn()).catch(function () {}); }));
  }

  function saveAnswer(body) {
    return apiFetch('/entrance-test/' + state.attemptId + '/answer', { method: 'POST', body: JSON.stringify(body) })
      .catch(function (e) {
        // A 409 here means the section already ended (expired/submitted from
        // another tab) — resync instead of silently dropping the keystroke.
        if (e && e.status === 409) loadRunner();
      });
  }

  // Grammar's inputs carry data-kind='grammar' (baked in at render time,
  // see renderGrammar; Reading/Listening answers arrive through
  // EntranceEmbedHost instead) — that, not a value captured in this function's
  // own closure, is what decides which section a save targets. This
  // matters because the listeners below are wired to #et-section-body only
  // ONCE (the `_etWired` guard) and then persist across every later
  // section's re-render: if they instead used a `section` parameter
  // captured when wireSectionInputs() was first called, every subsequent
  // section's inputs would keep firing an extra doomed-to-fail save
  // targeting that first, stale section (harmlessly 409-rejected by the
  // server, but real wasted requests and log noise) instead of the section
  // actually on screen.
  function wireSectionInputs(section, attempt) {
    if (section === 'writing') {
      var ta = $('et-writing-textarea');
      if (ta) {
        if (window.PasteGuard) window.PasteGuard.attach(ta, { hint: 'hãy tự gõ bài viết của bạn' });
        ta.addEventListener('input', function () {
          $('et-word-count').textContent = countWords(ta.value) + ' từ (tối thiểu 150 từ)';
          debounceSave('writing', function () { return saveAnswer({ section: 'writing', writingAnswer: ta.value }); });
        });
      }
      return;
    }
    var body = $('et-section-body');
    if (body._etWired) return; // listeners already attached once, below — nothing more to do
    body._etWired = true;
    body.addEventListener('change', function (e) {
      var t = e.target;
      if (!t || !t.dataset) return;
      // A 'checkbox'-type question ("choose N") is several checkboxes
      // sharing one data-checkbox-q — the saved answer is the JSON array of
      // every currently-checked option's letter, matching the backend's
      // matchSingleAnswer() checkbox branch.
      if (t.dataset.checkboxQ) {
        var qnum = Number(t.dataset.checkboxQ);
        var checked = Array.prototype.slice.call(body.querySelectorAll('[data-checkbox-q="' + qnum + '"]:checked'))
          .map(function (el) { return el.value; });
        saveAnswer({ section: t.dataset.kind, questionNumber: qnum, answer: JSON.stringify(checked) });
        return;
      }
      if (!t.dataset.kind) return;
      if (t.dataset.kind === 'grammar') {
        saveAnswer({ section: 'grammar', questionId: t.dataset.q, answer: t.value });
      } else {
        saveAnswer({ section: t.dataset.kind, questionNumber: Number(t.dataset.q), answer: t.value });
      }
    });
    body.addEventListener('input', function (e) {
      var t = e.target;
      if (!t || t.type !== 'text' || !t.dataset || !t.dataset.kind) return;
      var key = t.dataset.kind + '-' + t.dataset.q;
      var kind = t.dataset.kind, val = t.value;
      debounceSave(key, function () {
        if (kind === 'grammar') return saveAnswer({ section: 'grammar', questionId: t.dataset.q, answer: val });
        return saveAnswer({ section: kind, questionNumber: Number(t.dataset.q), answer: val });
      });
    });
  }

  // ── Submit ───────────────────────────────────────────────────────────

  function confirmSubmitSection(section) {
    if (state.submitting) return;
    var isLast = isLastSection(state.attempt, section);
    var msg = isLast
      ? 'Nộp phần ' + SECTION_LABEL[section] + ' và hoàn tất Test đầu vào? Bạn sẽ không thể sửa lại.'
      : 'Nộp phần ' + SECTION_LABEL[section] + '? Bạn sẽ không thể quay lại sửa câu trả lời.';
    if (section === 'speaking' && sp.recording) msg = 'Bạn đang ghi âm — bài ghi âm sẽ được dừng và nộp ngay. ' + msg;
    if (window.confirmDialog) {
      window.confirmDialog('Xác nhận nộp bài', msg, function () { doSubmitSection(section); }, { confirmLabel: 'Nộp bài', confirmClass: 'btn-primary' });
    } else if (confirm(msg)) {
      doSubmitSection(section);
    }
  }

  var BUSY_TITLE = {
    writing: 'Đang nộp bài Writing…',
    speaking: 'Đang nộp bài Speaking…',
  };

  // One submit at a time: `state.submitting` + the full-screen overlay
  // block every other button (and the timer's own auto-submit) until the
  // server has answered and the next section is loaded — see showBusy().
  function doSubmitSection(section) {
    if (state.submitting) return;
    state.submitting = true;
    $('et-submit-btn').disabled = true;
    if (isLastSection(state.attempt, section)) state.pendingDoneAnnounce = true;
    showBusy(BUSY_TITLE[section] || ('Đang nộp phần ' + SECTION_LABEL[section] + '…'),
      section === 'speaking' ? 'Đang tải bản ghi âm lên — vui lòng không tắt hoặc tải lại trang.' : null);

    var send = section === 'speaking'
      ? function () { return submitSpeaking(); }
      : function () { return apiFetch('/entrance-test/' + state.attemptId + '/section/' + section + '/submit', { method: 'POST' }); };

    // Flush still-debounced keystrokes first so the last few words typed
    // before clicking "Nộp" are part of what gets graded.
    flushSaves()
      .then(send)
      .then(function () {
        if (section === 'speaking') speakingTeardown();
        loadRunner(); // hides the overlay once the next state has loaded
      })
      .catch(function (e) {
        state.submitting = false;
        state.pendingDoneAnnounce = false;
        hideBusy();
        $('et-submit-btn').disabled = false;
        if (e && e.status === 409) { loadRunner(); return; } // section already ended server-side — resync
        toast((e && e.message) || 'Không nộp được phần này — vui lòng thử lại', 'error');
      });
  }

  function showDoneModal() {
    // PasteGuard's popup sits at a very high z-index (meant to float above
    // an exam's own fullscreen/proctor overlays) and lingers ~3.2s after a
    // blocked paste before fading — a student who pastes right before
    // submitting Writing could otherwise see it hanging over this modal.
    var pg = document.getElementById('paste-guard-popup');
    if (pg) pg.classList.remove('show');
    var modal = $('et-done-modal');
    if (isGuest()) {
      $('et-done-text').innerHTML = 'Bài làm của bạn đã được ghi nhận. Giáo viên sẽ <b>chấm và duyệt</b> toàn bộ kết quả '
        + 'rồi <b>liên hệ với bạn qua số điện thoại</b> đã đăng ký. Bạn cũng có thể mở lại trang này trên thiết bị này để xem kết quả khi đã được duyệt.';
    }
    modal.classList.remove('hidden');
    $('et-done-ok').onclick = function () {
      modal.classList.add('hidden');
      openResult();
    };
  }

  // ── Result ───────────────────────────────────────────────────────────

  function bandLabel(b) { return b == null ? 'Đang chờ chấm' : Number(b).toFixed(1); }

  function levelBadge(level) {
    var cls = level === 'Strong' ? 'et-badge-green' : level === 'Developing' ? 'et-badge-amber' : 'et-badge-red';
    var label = level === 'Strong' ? 'Tốt' : level === 'Developing' ? 'Đang phát triển' : 'Cần cải thiện';
    return '<span class="et-badge ' + cls + '">' + label + '</span>';
  }

  function openResult() {
    showScreen('et-result');
    setResultUrl(state.attemptId);
    $('et-result-body').innerHTML = '<div class="et-loading">Đang tải kết quả…</div>';
    apiFetch('/entrance-test/' + state.attemptId + '/result').then(renderResult).catch(function (e) {
      if (e && e.status === 409) {
        // Still in-progress somehow (e.g. opened result link from history
        // for a run that's actually still active) — go back to the runner.
        loadRunner();
        return;
      }
      $('et-result-body').innerHTML = '<div class="et-warning">' + esc((e && e.message) || 'Không tải được kết quả') + '</div>';
    });
  }

  function fmtDuration(sec) {
    var m = Math.floor((sec || 0) / 60), s = (sec || 0) % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function renderResult(r) {
    if (r.status === 'abandoned') {
      $('et-result-body').innerHTML = '<div class="et-warning et-warning-big">'
        + '<i class="fas fa-door-open"></i> Lượt Test đầu vào này đã bị huỷ vì bạn đóng tab / rời khỏi bài thi quá lâu, '
        + 'và không được tính kết quả. Bạn có thể bắt đầu một lượt mới.</div>'
        + '<div style="margin-top:var(--space-4)"><a class="et-btn-secondary" href="entrance-test.html">Quay lại trang Test đầu vào</a></div>';
      return;
    }
    if (r.status === 'disqualified') {
      $('et-result-body').innerHTML = '<div class="et-warning et-warning-big">'
        + '<i class="fas fa-ban"></i> Lượt Test đầu vào này đã bị huỷ do vi phạm giám sát nhiều lần và không được tính kết quả.</div>';
      return;
    }
    // Finished, but the teacher hasn't approved the compiled result yet —
    // no scores (not even the auto-graded ones) until then.
    if (r.pendingReview) {
      $('et-result-body').innerHTML = '<div class="et-overall et-overall-pending">'
        + '<div class="et-overall-label"><i class="fas fa-hourglass-half"></i> Đã nộp bài — đang chờ giáo viên duyệt</div>'
        + '<div class="et-overall-sub">Bài Writing và Speaking của bạn đang được chấm. Giáo viên sẽ xem xét toàn bộ kết quả, '
        + 'sau đó bạn sẽ nhận được thông báo trong hộp thư và có thể xem kết quả chi tiết tại đây.</div></div>'
        + '<div id="et-lulu"></div>';
      luluSays({ pct: 60, mood: 'think', text: 'Lulu đang ngồi hóng kết quả cùng cậu nè… giáo viên chấm xong là báo liền nha 🍊' });
      return;
    }

    var sections = r.sections;
    var cards = ['grammar', 'reading', 'listening'].map(function (k) {
      var s = sections[k];
      return '<div class="et-result-card"><div class="et-result-card-head"><i class="fas ' + SECTION_ICON[k] + '"></i> ' + SECTION_LABEL[k] + '</div>'
        + '<div class="et-result-band">' + bandLabel(s.band) + '</div>'
        + '<div class="et-result-sub">' + s.correctCount + ' / ' + s.totalQuestions + ' đúng · ' + fmtDuration(r.timeUsedSec[k]) + '</div></div>';
    }).join('');
    var w = sections.writing;
    cards += '<div class="et-result-card"><div class="et-result-card-head"><i class="fas ' + SECTION_ICON.writing + '"></i> Writing</div>'
      + '<div class="et-result-band">' + (w.status === 'graded' ? bandLabel(w.band) : 'Chờ giáo viên chấm') + '</div>'
      + '<div class="et-result-sub">' + w.wordCount + ' từ · ' + fmtDuration(r.timeUsedSec.writing) + '</div></div>';
    var spk = sections.speaking;
    if (spk) {
      cards += '<div class="et-result-card"><div class="et-result-card-head"><i class="fas ' + SECTION_ICON.speaking + '"></i> Speaking</div>'
        + '<div class="et-result-band">' + bandLabel(spk.band) + '</div>'
        + '<div class="et-result-sub">Part 2 · ' + fmtDuration(spk.durationSec) + ' nói</div></div>';
    }

    var overall = r.overallBand != null
      ? '<div class="et-overall"><div class="et-overall-label">Estimated Entrance Level</div><div class="et-overall-band">' + bandLabel(r.overallBand) + '</div></div>'
      : '<div class="et-overall et-overall-pending"><div class="et-overall-label">Đang chờ chấm Writing</div><div class="et-overall-sub">Kết quả tổng sẽ hiển thị sau khi giáo viên chấm xong bài Writing.</div></div>';

    var weaknesses = (r.grammarWeaknesses || []).length
      ? '<div class="et-weak-list">' + r.grammarWeaknesses.map(function (w2) {
          return '<div class="et-weak-row"><span>' + esc(w2.topic) + '</span>' + levelBadge(w2.level)
            + '<span class="et-weak-pct">' + w2.correct + '/' + w2.total + ' (' + w2.accuracyPct + '%)</span></div>';
        }).join('') + '</div>'
      : '<div class="et-muted">Chưa đủ dữ liệu để phân tích điểm yếu ngữ pháp theo chủ điểm.</div>';

    $('et-result-body').innerHTML =
      '<div class="et-disclaimer"><i class="fas fa-info-circle"></i> Đây là bài đánh giá xếp lớp nội bộ của EnglishWithDan. '
      + 'Các mức band ước tính chỉ dùng để xếp lớp, <b>không phải điểm IELTS chính thức</b>.</div>'
      + overall
      + (r.adminNote ? '<div class="et-card" style="margin-bottom:var(--space-5)"><b><i class="fas fa-comment-dots"></i> Nhận xét của giáo viên</b>'
          + '<div style="white-space:pre-wrap;margin-top:6px;color:var(--text2)">' + esc(r.adminNote) + '</div></div>' : '')
      + '<div class="et-result-grid">' + cards + '</div>'
      + '<h3 class="et-section-heading">Điểm yếu ngữ pháp theo chủ điểm</h3>' + weaknesses;
    var etOverall = $('et-result-body').querySelector('.et-overall');
    if (etOverall) etOverall.insertAdjacentHTML('afterend', '<div id="et-lulu"></div>');
    if (r.overallBand != null) {
      luluSays({ band: r.overallBand, text: 'Đây mới là điểm xuất phát thôi — Lulu sẽ đồng hành cùng cậu lên band nha! 🍊' });
    } else {
      luluSays({ pct: 60, mood: 'think', text: 'Còn chờ chấm Writing nữa thôi — sắp có kết quả tổng rồi nè!' });
    }
  }

  // Lulu (shared/playful.js) under the overall band — decorative, skipped
  // when the mascot isn't loaded.
  function luluSays(opts) {
    var host = $('et-lulu');
    if (host && window.Mascot && window.Mascot.react) window.Mascot.react(host, opts);
  }

  // ── Boot ─────────────────────────────────────────────────────────────

  function boot() {
    // Show the shareable address (/test-dau-vao — test-dau-vao.html forwards
    // here). One path segment, so every relative URL this page builds later
    // (iframes, images, links) still resolves from the site root.
    try {
      if (/^\/entrance-test(\.html)?$/.test(location.pathname)) {
        history.replaceState(history.state, '', '/test-dau-vao' + location.search + location.hash);
      }
    } catch (_) {}
    // No login needed: a visitor fills in name + phone (renderCandidate);
    // a logged-in student goes straight to the normal landing.
    if (isGuest() && window.hideTopNav) window.hideTopNav();
    if (!isLoggedIn() || isGuest()) document.body.classList.add('et-public');
    if (isLoggedIn()) {
      var resultId = null;
      try { resultId = new URLSearchParams(location.search).get('result'); } catch (_) {}
      if (resultId && /^[0-9a-f]{24}$/i.test(resultId)) {
        state.attemptId = resultId;
        openResult();
        return;
      }
    }
    // Landed here via the proctor's disqualify redirect (a real navigation,
    // not a JS screen swap — see shared/entrance-test-proctor.js) — surface
    // what happened, then drop the param so a refresh doesn't re-toast.
    try {
      if (new URLSearchParams(location.search).get('voided') === '1') {
        toast('Lượt Test đầu vào đã bị huỷ do vi phạm giám sát nhiều lần. Kết quả không được tính — hãy đợi khoảng 5 phút rồi bắt đầu lượt mới.', 'error', 8000);
        history.replaceState(null, '', location.pathname);
      }
    } catch (_) {}
    initLanding();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
