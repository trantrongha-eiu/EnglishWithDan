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

  var SECTION_ORDER = ['grammar', 'reading', 'listening', 'writing'];
  var SECTION_LABEL = { grammar: 'Grammar', reading: 'Reading', listening: 'Listening', writing: 'Writing' };
  var SECTION_ICON = { grammar: 'fa-spell-check', reading: 'fa-book-open', listening: 'fa-headphones', writing: 'fa-pen-nib' };

  var state = {
    attemptId: null,
    attempt: null,
    serverOffsetMs: 0,     // serverNow - Date.now(), measured at last fetch
    timerHandle: null,
    saveTimers: {},        // debounce handles keyed by a per-input id
  };

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
      var band = a.overallBand != null ? Number(a.overallBand).toFixed(1) : (a.status === 'completed' ? 'Chờ chấm' : '—');
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
      toast((e && e.message) || 'Mất kết nối — vui lòng tải lại trang để tiếp tục bài làm', 'error', 8000);
    });
  }

  function onAttemptLoaded(attempt) {
    state.attempt = attempt;
    state.serverOffsetMs = new Date(attempt.serverNow).getTime() - Date.now();

    if (attempt.status !== 'in-progress' || attempt.currentSection === 'done') {
      stopTimer();
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
    var idx = SECTION_ORDER.indexOf(current);
    $('et-progress').innerHTML = SECTION_ORDER.map(function (s, i) {
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
    function tick() {
      var now = Date.now() + state.serverOffsetMs;
      var remainingSec = Math.max(0, Math.round((expiresAt - now) / 1000));
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
        if (attempt.currentSection === 'writing') state.pendingDoneAnnounce = true;
        toast('Hết giờ phần ' + SECTION_LABEL[attempt.currentSection] + ' — đang tự động chuyển sang phần tiếp theo…', 'info', 4000);
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
    setWideShell(section === 'reading' || section === 'writing');
    if (section === 'grammar') body.innerHTML = renderGrammar(attempt.sections.grammar);
    else if (section === 'reading') body.innerHTML = renderReading(attempt.sections.reading);
    else if (section === 'listening') { body.innerHTML = renderListening(attempt.sections.listening); setupLockedAudio(); }
    else if (section === 'writing') body.innerHTML = renderWriting(attempt.sections.writing);
    wireSectionInputs(section, attempt);
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

  // ── Autosave wiring ──────────────────────────────────────────────────

  function debounceSave(key, fn) {
    clearTimeout(state.saveTimers[key]);
    state.saveTimers[key] = setTimeout(fn, 500);
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
          debounceSave('writing', function () { saveAnswer({ section: 'writing', writingAnswer: ta.value }); });
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
        if (kind === 'grammar') saveAnswer({ section: 'grammar', questionId: t.dataset.q, answer: val });
        else saveAnswer({ section: kind, questionNumber: Number(t.dataset.q), answer: val });
      });
    });
  }

  // ── Submit ───────────────────────────────────────────────────────────

  function confirmSubmitSection(section) {
    var isLast = section === 'writing';
    var msg = isLast
      ? 'Nộp bài Writing và hoàn tất Test đầu vào? Bạn sẽ không thể sửa lại.'
      : 'Nộp phần ' + SECTION_LABEL[section] + '? Bạn sẽ không thể quay lại sửa câu trả lời.';
    if (window.confirmDialog) {
      window.confirmDialog('Xác nhận nộp bài', msg, function () { doSubmitSection(section); }, { confirmLabel: 'Nộp bài', confirmClass: 'btn-primary' });
    } else if (confirm(msg)) {
      doSubmitSection(section);
    }
  }

  function doSubmitSection(section) {
    $('et-submit-btn').disabled = true;
    if (section === 'writing') state.pendingDoneAnnounce = true;
    apiFetch('/entrance-test/' + state.attemptId + '/section/' + section + '/submit', { method: 'POST' })
      .then(function () { loadRunner(); })
      .catch(function (e) {
        state.pendingDoneAnnounce = false;
        $('et-submit-btn').disabled = false;
        toast((e && e.message) || 'Không nộp được phần này', 'error');
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
