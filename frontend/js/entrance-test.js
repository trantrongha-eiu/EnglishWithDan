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
      var last = (d.attempts || [])[0];
      if (!last) return;
      if (last.status === 'in-progress') {
        $('et-start-btn').innerHTML = '<i class="fas fa-play"></i> Tiếp tục làm bài';
      } else {
        $('et-start-btn').disabled = true;
        $('et-start-btn').innerHTML = '<i class="fas fa-check"></i> Đã hoàn thành';
        $('et-resume-note').classList.remove('hidden');
        if (last.status === 'completed') {
          var link = $('et-view-result-link');
          link.classList.remove('hidden');
          link.onclick = function () { state.attemptId = last._id; openResult(); };
        }
      }
    }).catch(function () {});

    $('et-start-btn').onclick = startOrResume;
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

  function loadRunner() {
    apiFetch('/entrance-test/' + state.attemptId).then(function (d) {
      onAttemptLoaded(d.attempt);
    }).catch(function (e) {
      toast((e && e.message) || 'Không tải được bài làm', 'error');
      showScreen('et-landing');
    });
  }

  function onAttemptLoaded(attempt) {
    state.attempt = attempt;
    state.serverOffsetMs = new Date(attempt.serverNow).getTime() - Date.now();

    if (attempt.status !== 'in-progress' || attempt.currentSection === 'done') {
      stopTimer();
      if (window.EntranceTestProctor) window.EntranceTestProctor.stop();
      openResult();
      return;
    }

    showScreen('et-runner');
    if (window.EntranceTestProctor && !window.EntranceTestProctor.isActive()) {
      window.EntranceTestProctor.start({
        attemptId: state.attemptId,
        onDisqualified: function () { showScreen('et-landing'); initLanding(); },
      });
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
      if (remainingSec <= 0) {
        stopTimer();
        toast('Hết giờ phần ' + SECTION_LABEL[attempt.currentSection] + ' — đang tự động chuyển sang phần tiếp theo…', 'info', 4000);
        loadRunner();
      }
    }
    tick();
    state.timerHandle = setInterval(tick, 1000);
  }
  function stopTimer() { if (state.timerHandle) { clearInterval(state.timerHandle); state.timerHandle = null; } }

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
    if (section === 'grammar') body.innerHTML = renderGrammar(attempt.sections.grammar);
    else if (section === 'reading') body.innerHTML = renderReading(attempt.sections.reading);
    else if (section === 'listening') body.innerHTML = renderListening(attempt.sections.listening);
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

  function renderQuestionGroups(groups, savedByNum, kind) {
    return (groups || []).map(function (g) {
      var head = '';
      if (g.groupTitle) head += '<div class="et-group-title">' + esc(g.groupTitle) + '</div>';
      if (g.instruction) head += '<div class="et-group-instruction">' + esc(g.instruction) + '</div>';
      if (g.matchingOptions && g.matchingOptions.length) {
        head += '<div class="et-matching-options">' + g.matchingOptions.map(function (o) { return '<div>' + esc(o) + '</div>'; }).join('') + '</div>';
      }
      var qs = (g.questions || []).map(function (q) {
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
            var letter = String.fromCharCode(65 + oi);
            var checked = val === letter ? 'checked' : '';
            return '<label class="et-option"><input type="radio" name="q-' + q.questionNumber + '" value="' + letter + '" ' + checked
              + ' data-q="' + q.questionNumber + '" data-kind="' + kind + '"> ' + letter + '. ' + esc(o) + '</label>';
          }).join('') + '</div>';
        } else {
          input = '<input type="text" class="et-text-input" data-q="' + q.questionNumber + '" data-kind="' + kind + '" value="' + esc(val) + '" placeholder="Nhập câu trả lời…">';
        }
        return '<div class="et-question"><div class="et-q-num">Câu ' + q.questionNumber + '</div>'
          + '<div class="et-q-prompt">' + esc(q.questionText) + '</div>' + input + '</div>';
      }).join('');
      return '<div class="et-group">' + head + qs + '</div>';
    }).join('');
  }

  function renderReading(rSection) {
    var savedByNum = {};
    (rSection.answers || []).forEach(function (a) { savedByNum[a.questionNumber] = a.userAnswer; });
    var passage = rSection.passage || {};
    var content = '<div class="et-passage"><h3>' + esc(passage.title || '') + '</h3>'
      + '<div class="et-passage-content">' + esc(passage.content || '').split('\n').map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div></div>';
    var groups = passage.questionGroups && passage.questionGroups.length
      ? passage.questionGroups
      : [{ groupType: 'plain', questions: passage.questions || [] }];
    return '<div class="et-reading-layout">' + content
      + '<div class="et-questions">' + renderQuestionGroups(groups, savedByNum, 'reading') + '</div></div>';
  }

  function renderListening(lSection) {
    var savedByNum = {};
    (lSection.answers || []).forEach(function (a) { savedByNum[a.questionNumber] = a.userAnswer; });
    var sec = lSection.section || {};
    var audio = lSection.audioUrlSnapshot
      ? '<audio controls preload="metadata" src="' + esc(lSection.audioUrlSnapshot) + '" class="et-audio"></audio>'
      : '<div class="et-warning">Không tìm thấy file âm thanh.</div>';
    var groups = sec.questionGroups || [];
    return '<div class="et-listening-layout">' + audio
      + '<div class="et-questions">' + renderQuestionGroups(groups, savedByNum, 'listening') + '</div></div>';
  }

  function countWords(text) { return String(text || '').trim().split(/\s+/).filter(Boolean).length; }

  function renderWriting(wSection) {
    var prompt = wSection.prompt || {};
    var img = prompt.imageUrl ? '<img class="et-task-image" src="' + esc(prompt.imageUrl) + '" alt="Task 1 chart">' : '';
    var answer = wSection.writingAnswer || '';
    return '<div class="et-writing-layout">'
      + '<div class="et-task-instructions">' + esc(prompt.instructions || 'You should spend about 20 minutes on this task. Write at least 150 words.') + '</div>'
      + '<div class="et-task-prompt">' + esc(prompt.prompt || '') + '</div>' + img
      + '<textarea id="et-writing-textarea" class="et-writing-textarea" placeholder="Viết bài của bạn ở đây…">' + esc(answer) + '</textarea>'
      + '<div class="et-word-count" id="et-word-count">' + countWords(answer) + ' từ (tối thiểu 150 từ)</div>'
      + '</div>';
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
      if (!t || !t.dataset || !t.dataset.kind) return;
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
    apiFetch('/entrance-test/' + state.attemptId + '/section/' + section + '/submit', { method: 'POST' })
      .then(function () { loadRunner(); })
      .catch(function (e) {
        $('et-submit-btn').disabled = false;
        toast((e && e.message) || 'Không nộp được phần này', 'error');
      });
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
    initLanding();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
