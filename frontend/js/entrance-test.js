/**
 * entrance-test.js — the IELTS Entrance Test ("Test đầu vào") student page.
 * One dedicated engine (unlike the Full Mock Test, which just hops between
 * the existing Reading/Listening/Writing pages) since Grammar has no
 * existing page to reuse and the other three sections don't match the
 * shape of a normal full test (1 passage/13Q, 1 section/10Q, not
 * 3 passages/40Q or 4 parts/40Q). Backend: backend/services/
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

  function initLanding() {
    showScreen('et-landing');
    apiFetch('/entrance-test').then(function (d) {
      renderStructure(d.sections || [], d.totalMinutes || 70);
      if (!d.available) {
        $('et-start-btn').disabled = true;
        $('et-unavailable-note').classList.remove('hidden');
      }
    }).catch(function () {});

    apiFetch('/entrance-test/history').then(function (d) {
      renderHistory(d.attempts || []);
    }).catch(function () {});

    $('et-start-btn').onclick = startOrResume;
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
      var canView = a.status === 'completed' || a.status === 'disqualified';
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
      window.EntranceTestProctor.start({ attemptId: state.attemptId });
    }
    renderProgress(attempt.currentSection);
    renderSection(attempt);
    startTimer(attempt);
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
    setWideShell(section === 'reading' || section === 'writing');
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

  // ── Question-group renderer (shared shape between Reading & Listening) ──
  // Mirrors the groupType dispatch reading-v2.js's/listening.html's own
  // "đề lẻ" (single passage/section) renderers use — ported rather than
  // shared, since neither source file exposes this as a reusable module;
  // both are ~700-line renderers duplicated almost line-for-line and
  // tightly coupled to their own page's globals/DOM ids. Drag-and-drop
  // chip interactions are deliberately simplified to plain
  // <input>/<select data-q data-kind> elements instead — they produce a
  // real 'input'/'change' DOM event, so the existing delegated autosave
  // listener in wireSectionInputs() picks them up with no extra wiring.
  // Appropriate scope for a placement test, not a full replica of the
  // richly-interactive practice UI's chip-and-drop-zone machinery.

  function letterFor(i) { return String.fromCharCode(65 + i); }

  // Ported from reading-v2.js/listening.html's resolvePlaceholders(): swaps
  // every __Qn__ token in `text` for an inline answer input. Matches by the
  // real questionNumber first, falling back to the nth question in the
  // group by document order — table/note-form authors sometimes write
  // __Qn__ using a local index rather than the absolute question number.
  function resolvePlaceholders(text, questions, savedByNum, kind) {
    var sorted = (questions || []).slice().sort(function (a, b) { return a.questionNumber - b.questionNumber; });
    return esc(text || '').replace(/__Q(\d+)__/g, function (_, numStr) {
      var idx = parseInt(numStr, 10);
      var q = (questions || []).filter(function (x) { return x.questionNumber === idx; })[0];
      if (!q && idx >= 1 && idx <= sorted.length) q = sorted[idx - 1];
      if (!q) return '[Q' + idx + ']';
      var val = savedByNum[q.questionNumber] || '';
      return '<span class="et-inline-q"><span class="et-inline-badge">' + q.questionNumber + '</span>'
        + '<input type="text" class="et-inline-input" data-q="' + q.questionNumber + '" data-kind="' + kind + '" value="' + esc(val) + '" placeholder="Q' + q.questionNumber + '"></span>';
    });
  }

  // One flat question — true-false-ng/yes-no-ng/multiple-choice as radios,
  // checkbox as a "choose N" checkbox set (JSON-array answer, matching the
  // backend's matchSingleAnswer checkbox branch), everything else
  // (fill-blank/sentence-completion/map-labelling/matching-info/
  // multi-answer-group) as a plain text input.
  function renderSingleQuestionHTML(q, savedByNum, kind) {
    var val = savedByNum[q.questionNumber] || '';
    var input;
    if (q.type === 'true-false-ng' || q.type === 'yes-no-ng') {
      var opts = q.type === 'true-false-ng' ? ['True', 'False', 'Not Given'] : ['Yes', 'No', 'Not Given'];
      input = '<div class="et-options">' + opts.map(function (o) {
        var checked = val.toLowerCase() === o.toLowerCase() ? 'checked' : '';
        return '<label class="et-option"><input type="radio" name="q-' + q.questionNumber + '" value="' + o + '" ' + checked
          + ' data-q="' + q.questionNumber + '" data-kind="' + kind + '"> ' + o + '</label>';
      }).join('') + '</div>';
    } else if (q.type === 'multiple-choice' && q.options && q.options.length) {
      input = '<div class="et-options">' + q.options.map(function (o, oi) {
        var letter = letterFor(oi);
        var checked = val === letter ? 'checked' : '';
        return '<label class="et-option"><input type="radio" name="q-' + q.questionNumber + '" value="' + letter + '" ' + checked
          + ' data-q="' + q.questionNumber + '" data-kind="' + kind + '"> ' + letter + '. ' + esc(o) + '</label>';
      }).join('') + '</div>';
    } else if (q.type === 'checkbox') {
      var checkedArr = [];
      try { checkedArr = JSON.parse(val || '[]'); } catch (e) { checkedArr = []; }
      input = '<div class="et-options">' + (q.options || []).map(function (o, oi) {
        var letter = letterFor(oi);
        var isChecked = checkedArr.indexOf(letter) !== -1;
        return '<label class="et-option"><input type="checkbox" value="' + letter + '" ' + (isChecked ? 'checked' : '')
          + ' data-checkbox-q="' + q.questionNumber + '" data-kind="' + kind + '"> ' + letter + '. ' + esc(o) + '</label>';
      }).join('') + '</div>';
    } else {
      input = '<input type="text" class="et-text-input" data-q="' + q.questionNumber + '" data-kind="' + kind + '" value="' + esc(val) + '" placeholder="Nhập câu trả lời…">';
    }
    return '<div class="et-question"><div class="et-q-num">Câu ' + q.questionNumber + '</div>'
      + '<div class="et-q-prompt">' + esc(q.questionText || '') + '</div>' + input + '</div>';
  }

  // One question answered by picking a letter/heading from a fixed list
  // (matching-headings / matching-options / sentence-endings) — a <select>
  // instead of the practice UI's drag-and-drop chip, same data-q/data-kind
  // convention as every other input here.
  function renderMatchQuestionHTML(q, options, savedByNum, kind) {
    var val = savedByNum[q.questionNumber] || '';
    var opts = '<option value="">—</option>' + options.map(function (o) {
      return '<option value="' + esc(o.letter) + '"' + (val === o.letter ? ' selected' : '') + '>' + esc(o.letter) + '</option>';
    }).join('');
    return '<div class="et-question"><div class="et-q-num">Câu ' + q.questionNumber + '</div>'
      + '<div class="et-q-prompt">' + esc(q.questionText || '') + '</div>'
      + '<select class="et-text-input" data-q="' + q.questionNumber + '" data-kind="' + kind + '">' + opts + '</select></div>';
  }

  function renderQuestionGroup(g, savedByNum, kind) {
    var head = '';
    if (g.groupTitle) head += '<div class="et-group-title">' + esc(g.groupTitle) + '</div>';
    if (g.instruction) head += '<div class="et-group-instruction">' + esc(g.instruction) + '</div>';

    var groupType = g.groupType || 'plain';
    var body = '';

    if (groupType === 'table' && g.tableConfig) {
      var headers = g.tableConfig.headers || [];
      var rows = g.tableConfig.rows || [];
      body = '<table class="et-inline-table">'
        + (headers.length ? '<thead><tr>' + headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead>' : '')
        + '<tbody>' + rows.map(function (row) {
          return '<tr>' + (row || []).map(function (cell) { return '<td>' + resolvePlaceholders(cell, g.questions, savedByNum, kind) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody></table>';
    } else if (groupType === 'note-form' && g.noteConfig) {
      body = (g.noteConfig.title ? '<div class="et-note-title">' + esc(g.noteConfig.title) + '</div>' : '')
        + '<div class="et-note-lines">' + (g.noteConfig.lines || []).map(function (line) {
          return '<div class="et-note-line">' + resolvePlaceholders(line, g.questions, savedByNum, kind) + '</div>';
        }).join('') + '</div>';
    } else if (groupType === 'bullet-list' && g.bulletConfig) {
      body = '<ul class="et-bullet-list">' + (g.bulletConfig.items || []).map(function (item) {
        return '<li>' + resolvePlaceholders(item, g.questions, savedByNum, kind) + '</li>';
      }).join('') + '</ul>';
    } else if (groupType === 'summary-completion' && g.summaryConfig) {
      body = '<div class="et-summary-text">' + resolvePlaceholders(g.summaryConfig.text, g.questions, savedByNum, kind) + '</div>';
      if (g.summaryConfig.wordBank && g.summaryConfig.wordBank.length) {
        body += '<div class="et-word-bank"><strong>Word bank:</strong> ' + g.summaryConfig.wordBank.map(function (w) {
          return esc(w.letter) + '. ' + esc(w.word);
        }).join(' &nbsp; ') + '</div>';
      }
    } else if (groupType === 'matching-headings' && g.headingsConfig) {
      var headings = g.headingsConfig.headings || [];
      var headingOpts = headings.map(function (h) { return { letter: h.numeral, text: h.text }; });
      body = '<div class="et-matching-options">' + headingOpts.map(function (h) { return '<div>' + esc(h.letter) + '. ' + esc(h.text) + '</div>'; }).join('') + '</div>'
        + (g.questions || []).map(function (q) { return renderMatchQuestionHTML(q, headingOpts, savedByNum, kind); }).join('');
    } else if (groupType === 'matching-options' || groupType === 'sentence-endings') {
      var optList = groupType === 'sentence-endings'
        ? (g.endingsConfig && g.endingsConfig.endings || []).map(function (e, i) { return { letter: letterFor(i), text: e.text }; })
        : (g.matchingOptions || []).map(function (o, i) { return { letter: letterFor(i), text: o }; });
      if (g.matchingOptionsTitle) body += '<div class="et-group-instruction">' + esc(g.matchingOptionsTitle) + '</div>';
      body += '<div class="et-matching-options">' + optList.map(function (o) { return '<div>' + esc(o.letter) + '. ' + esc(o.text) + '</div>'; }).join('') + '</div>';
      body += (g.questions || []).map(function (q) { return renderMatchQuestionHTML(q, optList, savedByNum, kind); }).join('');
    } else if (groupType === 'map') {
      if (g.imageUrl) body += '<img class="et-task-image" src="' + esc(g.imageUrl) + '" style="margin-bottom:12px">';
      if (g.dragDropConfig && g.dragDropConfig.text) {
        body += '<div class="et-summary-text">' + resolvePlaceholders(g.dragDropConfig.text, g.questions, savedByNum, kind) + '</div>';
      } else {
        body += (g.questions || []).map(function (q) { return renderSingleQuestionHTML(q, savedByNum, kind); }).join('');
      }
    } else {
      // 'plain' and any unrecognized groupType — flat per-question
      // rendering (also today's fallback for multi-answer-group clusters:
      // each slot as its own text input rather than replicating the
      // shared-checkbox-cluster UI for a type this simple renderer
      // doesn't special-case).
      body = (g.questions || []).map(function (q) { return renderSingleQuestionHTML(q, savedByNum, kind); }).join('');
    }

    return '<div class="et-group">' + head + body + '</div>';
  }

  function renderQuestionGroups(groups, savedByNum, kind) {
    return (groups || []).map(function (g) { return renderQuestionGroup(g, savedByNum, kind); }).join('');
  }

  function renderReading(rSection) {
    var savedByNum = {};
    (rSection.answers || []).forEach(function (a) { savedByNum[a.questionNumber] = a.userAnswer; });
    var passage = rSection.passage || {};
    // passage.content is real admin-authored HTML (paragraphs, <strong>,
    // etc.) — inject it as-is, matching reading-v2.js's switchPassage()
    // (only the title is escaped). Escaping it here was the bug: it made
    // students see literal "<p><strong>...</strong></p>" tags on screen.
    var content = '<div class="et-passage"><h3>' + esc(passage.title || '') + '</h3>'
      + '<div class="et-passage-content">' + (passage.content || '') + '</div></div>';
    var groups = passage.questionGroups && passage.questionGroups.length
      ? passage.questionGroups
      : [{ groupType: 'plain', questions: passage.questions || [] }];
    return '<div class="et-reading-layout">' + content
      + '<div class="et-questions">' + renderQuestionGroups(groups, savedByNum, 'reading') + '</div></div>';
  }

  var LISTENING_AUTOPLAY_DELAY_SEC = 30;

  function renderListening(lSection) {
    var savedByNum = {};
    (lSection.answers || []).forEach(function (a) { savedByNum[a.questionNumber] = a.userAnswer; });
    var sec = lSection.section || {};
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
    var groups = sec.questionGroups || [];
    return '<div class="et-listening-layout">' + audio
      + '<div class="et-questions">' + renderQuestionGroups(groups, savedByNum, 'listening') + '</div></div>';
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

  // Every rendered input already carries data-kind='grammar'|'reading'|
  //'listening' (baked in at render time, see renderGrammar/
  // renderQuestionGroups) — that, not a value captured in this function's
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
        + 'sau đó bạn sẽ nhận được thông báo trong hộp thư và có thể xem kết quả chi tiết tại đây.</div></div>';
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
  }

  // ── Boot ─────────────────────────────────────────────────────────────

  function boot() {
    if (!window.AuthService || !window.AuthService.isLoggedIn()) {
      var next = 'entrance-test.html';
      location.href = (window.AuthService && window.AuthService.buildLoginUrl) ? window.AuthService.buildLoginUrl(next) : 'login.html?next=' + encodeURIComponent(next);
      return;
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
