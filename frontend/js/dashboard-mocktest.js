'use strict';
/* ══════════════════════════════════════════════════════════════════
   IELTS Full Mock Test card — was on the dashboard home screen, now
   its own standalone page (mock-test.html), reached from the "Mocktest"
   nav dropdown. Purely #mocktest-* DOM-id driven, so it works unchanged
   wherever that markup lives.

   - No open run     → "Bắt đầu thi thử"  → POST /mock-test/start → go to
                       listening.html in mock mode.
   - Run in progress → "Tiếp tục — Bước N" → jump straight to the page for
                       whichever skill is next (progress cursor).
   - Finished (even if still awaiting grade) → back to "Bắt đầu thi thử";
                       results live in history (review-history.html?view=mock).

   Premium-gated the same way as openLesson() in dashboard-lesson.js: a
   free/expired account gets the upgrade modal instead.

   API()/mtHeaders() are self-contained here (this file loads before
   dashboard.js, so its `API`/`authH` aren't in scope yet at load time).
   ══════════════════════════════════════════════════════════════════ */
(function () {
  var MT_API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  function mtHeaders() {
    return Object.assign({ 'Content-Type': 'application/json' },
      window.AuthService ? window.AuthService.authHeader() : {});
  }

  var SKILL_LABEL = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };
  var STEP_INDEX  = { listening: 1, reading: 2, writing: 3, speaking: 4 };

  function pageForSkill(skill, mockId) {
    return (window.MockTest ? window.MockTest.pageUrl(skill, mockId)
      : skill + '.html?mock=' + encodeURIComponent(mockId) + '&skill=' + skill);
  }

  function setCard(opts) {
    var card = document.getElementById('mocktest-card');
    if (!card) return;
    card.style.display = 'flex';
    var titleEl = document.getElementById('mocktest-title');
    var metaEl  = document.getElementById('mocktest-meta');
    var btn     = document.getElementById('mocktest-btn');
    var abandon = document.getElementById('mocktest-abandon');
    if (titleEl) titleEl.textContent = opts.title;
    if (metaEl)  metaEl.textContent  = opts.meta;
    if (btn) {
      btn.textContent = opts.btnLabel;
      btn.onclick = opts.onClick;
    }
    // "Bỏ qua & làm lại" only makes sense while a run is actually open.
    if (abandon) {
      abandon.style.display = opts.showAbandon ? '' : 'none';
      abandon.onclick = opts.showAbandon ? abandonCurrentMock : null;
    }
  }

  // Discard the open run so the student can start a fresh mock test. The
  // completed Listening/Reading sub-attempts stay in their own histories;
  // only the mock wrapper is closed (server marks it 'abandoned').
  function abandonCurrentMock() {
    var ok = window.confirm(
      'Bỏ qua bài thi thử đang làm dở? Tiến trình 4 kỹ năng của lượt này sẽ bị huỷ và bạn có thể bắt đầu một bài thi thử mới.'
    );
    if (!ok) return;
    var link = document.getElementById('mocktest-abandon');
    if (link) { link.disabled = true; link.textContent = 'Đang huỷ…'; }
    fetch(MT_API + '/mock-test/current', { method: 'DELETE', headers: mtHeaders() })
      .then(function (r) { return window.ApiClient.handleResponse(r); })
      .then(function () {
        // Reset the link too — it's only hidden now, and the next open run
        // would otherwise show a dead "Đang huỷ…" button.
        if (link) { link.disabled = false; link.textContent = 'Bỏ qua & làm lại'; }
        if (window.toast) window.toast('Đã huỷ bài thi thử đang làm dở.', 'success');
        renderMockTestCard();
      })
      .catch(function (e) {
        if (link) { link.disabled = false; link.textContent = 'Bỏ qua & làm lại'; }
        var msg = (e && e.body && e.body.message) || (e && e.message) || 'Không huỷ được bài thi thử';
        if (window.toast) window.toast(msg, 'error'); else alert(msg);
      });
  }

  function startNewMock() {
    if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
      if (window.openUpgradeModal) window.openUpgradeModal();
      return;
    }
    var btn = document.getElementById('mocktest-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Đang tạo đề…'; }
    fetch(MT_API + '/mock-test/start', { method: 'POST', headers: mtHeaders() })
      .then(function (r) { return window.ApiClient.handleResponse(r); })
      .then(function (data) {
        var a = data.attempt;
        if (!a) throw new Error('no attempt');
        var skill = (a.progress && a.progress !== 'done') ? a.progress : 'listening';
        window.location.href = pageForSkill(skill, a._id);
      })
      .catch(function (e) {
        if (btn) { btn.disabled = false; btn.textContent = 'Bắt đầu thi thử'; }
        var msg = (e && e.body && e.body.message) || (e && e.message) || 'Không tạo được bài thi thử';
        if (window.toast) window.toast(msg, 'error'); else alert(msg);
      });
  }

  function renderMockTestCard() {
    var card = document.getElementById('mocktest-card');
    if (!card) return;

    // Break toast, shown when a mock skill page bounced the student back
    // here. `mockbreak` says which step just finished: 'writing' = end of
    // sitting 1, Speaking is its own self-started step; 'reading' / '1' =
    // legacy values from when sitting 1 was only Listening + Reading. 'mockvoid' = the run was disqualified
    // for too many exam-screen exits.
    try {
      var _sp = new URLSearchParams(location.search);
      var _brk = _sp.get('mockbreak');
      if (_brk === 'writing') {
        if (window.toast) window.toast('Đã nộp Writing. Khi sẵn sàng, bấm "Bắt đầu Speaking" để thi phần Nói (bạn có thể chờ giáo viên chấm trực tiếp).', 'success', 7000);
        history.replaceState(null, '', location.pathname);
      } else if (_brk === 'reading' || _brk === '1') {
        if (window.toast) window.toast('Đã xong Listening + Reading. Khi sẵn sàng, bấm "Tiếp tục" để làm Writing.', 'success', 6000);
        history.replaceState(null, '', location.pathname);
      } else if (_sp.get('mockvoid') === '1') {
        if (window.toast) window.toast('Lượt thi thử đã bị huỷ do vi phạm giám sát 5 lần. Kết quả lượt đó không được tính (bài làm đến lúc bị huỷ vẫn được gửi cho giáo viên) — hãy đợi khoảng 5 phút rồi bắt đầu lượt mới.', 'error', 9000);
        history.replaceState(null, '', location.pathname);
      }
    } catch (_) {}

    fetch(MT_API + '/mock-test/current', { headers: mtHeaders() })
      .then(function (r) { return window.ApiClient.handleResponse(r); })
      .then(function (data) {
        var a = data.attempt;

        if (!a) {
          setCard({
            title: 'Thi thử 4 kỹ năng',
            meta: 'Đề ngẫu nhiên · Listening → Reading → Writing → Speaking',
            btnLabel: 'Bắt đầu thi thử',
            onClick: startNewMock
          });
          return;
        }

        if (a.progress && a.progress !== 'done') {
          var idx = STEP_INDEX[a.progress] || 1;
          var nextLabel = SKILL_LABEL[a.progress] || a.progress;
          // Sitting 1 = Listening → Reading → Writing; Speaking is its own
          // self-started step afterwards.
          var sittingNote = a.progress === 'speaking' ? 'Lượt 2: Speaking (Nói)'
            : 'Lượt 1: Listening + Reading + Writing';
          var btnLabel = a.progress === 'speaking'
            ? 'Bắt đầu ' + nextLabel
            : 'Tiếp tục — ' + nextLabel;
          setCard({
            title: (a.assignmentId ? 'Đang làm bài thi của lớp — Bước ' : 'Đang thi thử — Bước ') + idx + '/4',
            meta: sittingNote + ' · tiếp theo: ' + nextLabel,
            btnLabel: btnLabel,
            onClick: function () { window.location.href = pageForSkill(a.progress, a._id); },
            showAbandon: true
          });
          return;
        }

        // Server no longer returns finished runs as "current" (they move to
        // history the moment the last step lands), so this is only a guard
        // against an older backend: still let the student start a new one.
        setCard({
          title: 'Thi thử 4 kỹ năng',
          meta: 'Đề ngẫu nhiên · Listening → Reading → Writing → Speaking',
          btnLabel: 'Bắt đầu thi thử',
          onClick: startNewMock
        });
      })
      .catch(function () {
        // Keep the card usable even if the status check failed.
        setCard({
          title: 'Thi thử 4 kỹ năng',
          meta: 'Đề ngẫu nhiên · Listening → Reading → Writing → Speaking',
          btnLabel: 'Bắt đầu thi thử',
          onClick: startNewMock
        });
      });
  }

  // ── "Bài thi Full Mock Test của lớp" ────────────────────────────────
  // The class mock(s) the teacher set up in admin Lớp học (an Assignment
  // mock_test item: one fixed bundle for the whole class, picked Listening
  // sections / Reading passages, a "tự ghép" Writing). GET /mock-test/class
  // lists the ones still to sit; starting = POST /mock-test/start with
  // { assignmentId, itemId } (same as the homework card's hwStartAssignedMock).
  function esc(s) {
    return window.escHtml ? window.escHtml(String(s == null ? '' : s))
      : String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function fmtDeadline(d) {
    try {
      return new Date(d).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', weekday: 'long', day: '2-digit', month: '2-digit' });
    } catch (_) { return ''; }
  }
  function partsText(p) {
    var out = [];
    out.push('Listening: ' + (p && p.listening && p.listening.length ? 'Section ' + p.listening.join(', ') : 'cả đề'));
    out.push('Reading: ' + (p && p.reading && p.reading.length ? 'Passage ' + p.reading.join(', ') : 'cả đề'));
    out.push('Writing: Task 1 + Task 2');
    return out.join(' · ');
  }

  function classMockCard(m, i) {
    var open = !!m.open;
    var next = open && m.mock ? (SKILL_LABEL[m.mock.progress] || m.mock.progress) : '';
    var btnLabel = open ? (m.mock.progress === 'speaking' ? 'Bắt đầu Speaking' : 'Tiếp tục — ' + next) : 'Bắt đầu làm bài thi';
    var band = m.requiredBand ? (Number(m.requiredBand) % 1 ? String(m.requiredBand) : Number(m.requiredBand).toFixed(1)) : '';
    var disq = m.mock && m.mock.status === 'disqualified';
    return '<div class="cm-card" data-i="' + i + '">'
      + '<span class="cm-kicker"><i class="fas fa-school"></i> Bài thi Full Mock Test của lớp ' + esc(m.className) + '</span>'
      + '<div class="cm-title">' + esc(m.title) + '</div>'
      + '<div class="cm-meta">'
      + (m.teacherName ? '<span><i class="fas fa-chalkboard-user"></i> GV <b>' + esc(m.teacherName) + '</b></span>' : '')
      + (m.deadline ? '<span><i class="far fa-clock"></i> Hạn: <b>' + esc(fmtDeadline(m.deadline)) + '</b></span>' : '')
      + (band ? '<span><i class="fas fa-bullseye"></i> Điểm yêu cầu: <b>Overall ' + esc(band) + '</b></span>' : '')
      + '</div>'
      + '<div class="cm-meta" style="margin-top:6px">' + esc(partsText(m.parts)) + ' · Speaking làm sau</div>'
      + (m.instruction ? '<div class="cm-teacher-note">' + esc(m.instruction) + '</div>' : '')
      + '<div class="cm-rules"><div class="cm-rules-title"><i class="fas fa-triangle-exclamation"></i> Lưu ý trước khi thi</div><ul>'
      + '<li>Làm bài <b>nghiêm túc, tự lực</b> — <b>không gian lận</b>, không dùng tài liệu, từ điển, AI hay người khác hỗ trợ. Hệ thống giám sát và gửi ảnh màn hình mỗi lần vi phạm cho giáo viên.</li>'
      + '<li><b>Ôn bài đầy đủ</b> trước khi thi (template Writing trong sách / trên web, từ vựng, cách làm từng dạng bài).</li>'
      + '<li>Làm đúng thời gian của từng kỹ năng; Listening → Reading → Writing làm liền mạch.</li>'
      + '<li class="cm-penalty">Bài thi dưới điểm yêu cầu' + (band ? ' (Overall ' + esc(band) + ')' : '') + ' sẽ phải <u>chép phạt</u>.</li>'
      + '</ul></div>'
      + (disq ? '<div class="cm-lock" style="color:#b45309">Lượt trước bị huỷ do rời màn hình thi — hãy làm lại nghiêm túc.</div>' : '')
      + (m.locked
        ? '<div class="cm-lock"><i class="fas fa-lock"></i> Bài thi đang bị khoá vì bạn còn bài tập cũ chưa xong — vào <a href="/app/classroom">Lớp học</a> để làm bài cũ trước.</div>'
        : (open ? '' : '<label class="cm-commit"><input type="checkbox" class="cm-commit-box"> Tôi đã ôn bài đầy đủ và cam kết làm bài nghiêm túc, không gian lận.</label>')
          + '<div class="cm-actions"><button type="button" class="btn btn-primary cm-start"' + (open ? '' : ' disabled') + '>' + esc(btnLabel) + '</button>'
          + (open ? '<span class="cm-status">Đang làm — bước tiếp theo: <b>' + esc(next) + '</b></span>' : '')
          + '</div>')
      + '</div>';
  }

  function startClassMock(m, btn) {
    if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
      if (window.openUpgradeModal) window.openUpgradeModal();
      return;
    }
    var old = btn.textContent;
    btn.disabled = true; btn.textContent = 'Đang mở đề…';
    var post = function () {
      return fetch(MT_API + '/mock-test/start', {
        method: 'POST', headers: mtHeaders(),
        body: JSON.stringify({ assignmentId: m.assignmentId, itemId: m.itemId })
      });
    };
    post()
      .then(function (res) {
        if (res.status !== 409) return res;
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (body.code !== 'MOCK_OPEN_OTHER') throw new Error(body.message || 'Không mở được bài thi');
          if (!window.confirm('Bạn đang có một bài thi thử khác làm dở. Bỏ bài đó để làm bài thi của lớp?')) throw null;
          return fetch(MT_API + '/mock-test/current', { method: 'DELETE', headers: mtHeaders() })
            .then(function (r) { return window.ApiClient.handleResponse(r); })
            .then(post);
        });
      })
      .then(function (r) { return window.ApiClient.handleResponse(r); })
      .then(function (data) {
        var a = data.attempt;
        if (!a) throw new Error('Không mở được bài thi');
        var skill = (a.progress && a.progress !== 'done') ? a.progress : 'listening';
        window.location.href = pageForSkill(skill, a._id);
      })
      .catch(function (e) {
        btn.disabled = false; btn.textContent = old;
        if (!e) return; // cancelled
        var msg = (e.body && e.body.message) || e.message || 'Không mở được bài thi';
        if (window.toast) window.toast(msg, 'error'); else alert(msg);
      });
  }

  function renderClassMocks() {
    var box = document.getElementById('class-mock-list');
    if (!box) return;
    fetch(MT_API + '/mock-test/class', { headers: mtHeaders() })
      .then(function (r) { return window.ApiClient.handleResponse(r); })
      .then(function (data) {
        var list = (data && data.mocks) || [];
        if (!list.length) { box.style.display = 'none'; box.innerHTML = ''; return; }
        box.innerHTML = list.map(classMockCard).join('')
          + '<div class="cm-practice-label">Hoặc tự luyện thêm với đề ngẫu nhiên:</div>';
        box.style.display = '';
        Array.prototype.forEach.call(box.querySelectorAll('.cm-card'), function (card) {
          var m = list[Number(card.getAttribute('data-i'))];
          var btn = card.querySelector('.cm-start');
          var box2 = card.querySelector('.cm-commit-box');
          if (box2 && btn) box2.onchange = function () { btn.disabled = !box2.checked; };
          if (btn) btn.onclick = function () { startClassMock(m, btn); };
        });
      })
      .catch(function () { box.style.display = 'none'; });
  }

  window.renderMockTestCard = renderMockTestCard;
  window.renderClassMocks = renderClassMocks;
})();
