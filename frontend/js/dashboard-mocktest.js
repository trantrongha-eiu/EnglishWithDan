'use strict';
/* ══════════════════════════════════════════════════════════════════
   IELTS Full Mock Test card on the dashboard home screen.

   - No open run     → "Bắt đầu thi thử"  → POST /mock-test/start → go to
                       listening.html in mock mode.
   - Run in progress → "Tiếp tục — Bước N" → jump straight to the page for
                       whichever skill is next (progress cursor).
   - Awaiting grade / completed → show last overall band + link to history.

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
    // here. `mockbreak` says which step just finished: 'reading' = end of
    // sitting 1 (legacy value '1'); 'writing' = Writing done, Speaking is
    // now its own self-started step. 'mockvoid' = the run was disqualified
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
        if (window.toast) window.toast('Lượt thi thử đã bị huỷ do rời khỏi màn hình thi quá 10 lần. Kết quả lượt đó không được tính — hãy đợi khoảng 5 phút rồi bắt đầu lượt mới.', 'error', 9000);
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
          // Writing and Speaking are separate self-started steps now.
          var sittingNote = a.progress === 'speaking' ? 'Phần cuối: Speaking (Nói)'
            : a.progress === 'writing' ? 'Lượt 2: Writing (Viết)'
            : 'Lượt 1: Listening + Reading';
          var btnLabel = (a.progress === 'writing' || a.progress === 'speaking')
            ? 'Bắt đầu ' + nextLabel
            : 'Tiếp tục — ' + nextLabel;
          setCard({
            title: 'Đang thi thử — Bước ' + idx + '/4',
            meta: sittingNote + ' · tiếp theo: ' + nextLabel,
            btnLabel: btnLabel,
            onClick: function () { window.location.href = pageForSkill(a.progress, a._id); },
            showAbandon: true
          });
          return;
        }

        // progress === 'done' but still the "current" (awaiting-grading) run.
        setCard({
          title: 'Bài thi thử gần nhất',
          meta: a.overallBand != null
            ? ('Band tổng: ' + a.overallBand)
            : 'Đang chờ chấm Writing / Speaking…',
          btnLabel: 'Xem lịch sử',
          onClick: function () { window.location.href = 'review-history.html?view=mock'; }
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

  window.renderMockTestCard = renderMockTestCard;
})();
