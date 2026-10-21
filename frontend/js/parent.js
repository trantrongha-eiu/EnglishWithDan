// parent.html — Phụ huynh: read-only view of a parent's linked children
// (backend routes/parent.js). auth.js already bounced anyone not logged in;
// a non-parent who lands here is sent to their own home.
(function () {
  'use strict';

  var AS = window.AuthService;
  var API = AS.API; // ends in /api
  var esc = window.escapeHtml;

  var user = AS.getUser();
  if (!user) return;
  if (user.role !== 'parent') {
    window.location.replace(AS.isStaff(user) ? '/admin/' : '/dashboard.html');
    return;
  }

  var $main = document.getElementById('phMain');
  var state = { children: [], childId: null, scoreTab: 'mock' };

  document.getElementById('phUserName').textContent =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || '';
  document.getElementById('phLogout').addEventListener('click', function () { AS.logout(); });

  function api(path, opts) {
    opts = opts || {};
    return fetch(API + path, Object.assign({}, opts, {
      headers: Object.assign({ 'Content-Type': 'application/json' }, AS.authHeader(), opts.headers || {}),
    })).then(function (res) { return window.ApiClient.handleResponse(res); });
  }

  // ── formatting ─────────────────────────────────────
  function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
  }
  function fmtShort(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
  }
  function fmtVND(n) { return Number(n || 0).toLocaleString('vi-VN') + ' ₫'; }
  function band(n) { return n == null ? '–' : Number(n).toFixed(1); }
  function initials(name) {
    var parts = String(name || '?').trim().split(/\s+/);
    return esc((parts[parts.length - 1] || '?').charAt(0).toUpperCase());
  }

  var STATUS = {
    active:    { cls: 'ph-status-ok',      icon: 'fa-circle-check',         text: 'Bình thường' },
    warning:   { cls: 'ph-status-warn',    icon: 'fa-triangle-exclamation', text: 'Cần chú ý' },
    failed:    { cls: 'ph-status-bad',     icon: 'fa-circle-xmark',         text: 'Nguy cơ không đạt khóa' },
    completed: { cls: 'ph-status-neutral', icon: 'fa-flag-checkered',       text: 'Đã hoàn thành khóa' },
    dropped:   { cls: 'ph-status-neutral', icon: 'fa-user-slash',           text: 'Đã nghỉ học' },
  };
  function statusPill(s) {
    var st = STATUS[s];
    if (!st) return '';
    return '<span class="ph-status ' + st.cls + '"><i class="fas ' + st.icon + '"></i> ' + st.text + '</span>';
  }

  var HW = {
    completed:   { cls: 'ph-status-ok',      text: 'Đã xong' },
    in_progress: { cls: 'ph-status-warn',    text: 'Đang làm' },
    not_started: { cls: 'ph-status-neutral', text: 'Chưa làm' },
    overdue:     { cls: 'ph-status-bad',     text: 'Quá hạn' },
  };

  var MARK = {
    present: { cls: 'ph-sess-present', letter: '✓', text: 'Có mặt' },
    late:    { cls: 'ph-sess-late',    letter: 'T', text: 'Đi trễ' },
    absent:  { cls: 'ph-sess-absent',  letter: 'V', text: 'Vắng không phép' },
    excused: { cls: 'ph-sess-excused', letter: 'P', text: 'Vắng có phép' },
  };

  function section(icon, title, body, extraHead) {
    return '<section class="ph-section">' +
      '<div class="ph-section-head"><h2 class="ph-section-title"><i class="fas ' + icon + '"></i> ' + title + '</h2>' + (extraHead || '') + '</div>' +
      body + '</section>';
  }
  function loadingBody() { return '<div class="ph-section-body"><div class="ph-empty">Đang tải…</div></div>'; }
  function errorBody(msg) { return '<div class="ph-section-body"><div class="ph-empty">' + esc(msg || 'Không tải được dữ liệu.') + '</div></div>'; }

  // ── password gate ──────────────────────────────────
  function needPasswordChange() {
    var modal = document.getElementById('phPwModal');
    var form = document.getElementById('phPwForm');
    var err = document.getElementById('phPwError');
    var btn = document.getElementById('phPwSubmit');
    modal.hidden = false;
    document.getElementById('phPwCurrent').focus();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.hidden = true;
      var cur = document.getElementById('phPwCurrent').value;
      var nw = document.getElementById('phPwNew').value;
      var cf = document.getElementById('phPwConfirm').value;
      if (nw.length < 8) { err.textContent = 'Mật khẩu mới phải có ít nhất 8 ký tự.'; err.hidden = false; return; }
      if (nw !== cf) { err.textContent = 'Hai mật khẩu mới không khớp.'; err.hidden = false; return; }
      if (nw === cur) { err.textContent = 'Mật khẩu mới phải khác mật khẩu tạm.'; err.hidden = false; return; }
      btn.disabled = true;
      api('/user/change-password', { method: 'PUT', body: JSON.stringify({ currentPassword: cur, newPassword: nw }) })
        .then(function (body) {
          if (body.token) AS.setToken(body.token);
          user.mustChangePassword = false;
          AS.setUser(user);
          modal.hidden = true;
          if (window.showToast) window.showToast('Đã đổi mật khẩu', 'success');
          start();
        })
        .catch(function (e2) {
          err.textContent = (e2 && e2.message) || 'Không đổi được mật khẩu.';
          err.hidden = false;
        })
        .then(function () { btn.disabled = false; });
    });
  }

  // ── notifications (bell) ───────────────────────────
  var notif = { list: [], unread: 0 };
  var NOTIF_KIND = {
    absence:          { cls: 'ph-notif-absence',  icon: 'fa-user-xmark', target: 'phClasses' },
    homework_overdue: { cls: 'ph-notif-homework', icon: 'fa-list-check', target: 'phHomework' },
    tuition_due:      { cls: 'ph-notif-tuition',  icon: 'fa-receipt',    target: 'phTuition' },
    tuition_reminder: { cls: 'ph-notif-tuition',  icon: 'fa-receipt',    target: 'phTuition' },
  };
  var $bell = document.getElementById('phBell');
  var $badge = document.getElementById('phBellBadge');
  var $notifModal = document.getElementById('phNotifModal');

  function fmtWhen(d) {
    return new Date(d).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
  }

  function loadNotifications() {
    api('/parent/notifications')
      .then(function (body) {
        notif.list = body.notifications || [];
        notif.unread = body.unreadCount || 0;
        renderBell();
      })
      .catch(function () { /* the bell is optional — the page works without it */ });
  }

  function renderBell() {
    $bell.hidden = false;
    $badge.hidden = !notif.unread;
    $badge.textContent = notif.unread > 9 ? '9+' : String(notif.unread);
    var slot = document.getElementById('phAlertSlot');
    if (!slot) return;
    slot.innerHTML = notif.unread
      ? '<button class="ph-alert" type="button" id="phAlertBtn"><i class="fas fa-bell"></i><span>Có ' + notif.unread +
        ' thông báo mới về việc học của con</span><i class="fas fa-chevron-right"></i></button>'
      : '';
    var btn = document.getElementById('phAlertBtn');
    if (btn) btn.addEventListener('click', openNotifications);
  }

  function openNotifications() {
    var $list = document.getElementById('phNotifList');
    $list.innerHTML = notif.list.length
      ? notif.list.map(function (n, i) {
        var k = NOTIF_KIND[n.kind] || NOTIF_KIND.tuition_reminder;
        return '<div class="ph-notif ' + k.cls + (n.read ? '' : ' ph-notif-unread') + '" data-i="' + i + '" role="button" tabindex="0">' +
          '<div class="ph-notif-icon"><i class="fas ' + k.icon + '"></i></div>' +
          '<div class="ph-notif-main"><div class="ph-notif-title">' + esc(n.title) + '</div>' +
          (n.body ? '<div class="ph-notif-body">' + esc(n.body) + '</div>' : '') +
          '<div class="ph-notif-meta">' + (state.children.length > 1 ? esc(n.studentName) + ' · ' : '') + fmtWhen(n.createdAt) + '</div></div></div>';
      }).join('')
      : '<div class="ph-empty">Chưa có thông báo nào.</div>';
    $notifModal.hidden = false;
    document.getElementById('phNotifClose').focus();
    Array.prototype.forEach.call($list.querySelectorAll('.ph-notif'), function (el) {
      var go = function () { openFromNotification(notif.list[Number(el.getAttribute('data-i'))]); };
      el.addEventListener('click', go);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    if (notif.unread) {
      api('/parent/notifications/read', { method: 'POST' })
        .then(function () {
          notif.unread = 0;
          notif.list.forEach(function (n) { n.read = true; });
          renderBell();
        })
        .catch(function () { /* stays unread; retried next open */ });
    }
  }

  function closeNotifications() { $notifModal.hidden = true; $bell.focus(); }

  // Jump to the child + section the alert is about.
  function openFromNotification(n) {
    closeNotifications();
    if (!n) return;
    var target = (NOTIF_KIND[n.kind] || {}).target;
    var scroll = function () {
      var el = target && document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (String(n.studentId) !== state.childId && state.children.some(function (c) { return String(c._id) === String(n.studentId); })) {
      selectChild(n.studentId);
      setTimeout(scroll, 300);
    } else {
      scroll();
    }
  }

  $bell.addEventListener('click', openNotifications);
  document.getElementById('phNotifClose').addEventListener('click', closeNotifications);
  $notifModal.addEventListener('click', function (e) { if (e.target === $notifModal) closeNotifications(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$notifModal.hidden) closeNotifications(); });

  // ── children ───────────────────────────────────────
  function start() {
    loadNotifications();
    api('/parent/children')
      .then(function (body) {
        state.children = body.children || [];
        if (!state.children.length) {
          $main.innerHTML = '<div class="ph-section"><div class="ph-section-body">' +
            '<p><b>Chưa có học sinh nào được liên kết với tài khoản này.</b></p>' +
            '<p class="ph-muted">Vui lòng liên hệ giáo viên hoặc trung tâm để được liên kết với tài khoản của con.</p></div></div>';
          return;
        }
        var saved = null;
        try { saved = localStorage.getItem('parentChildId'); } catch (e) { /* storage off */ }
        var match = state.children.filter(function (c) { return String(c._id) === saved; })[0];
        selectChild((match || state.children[0])._id);
      })
      .catch(function () {
        $main.innerHTML = '<div class="ph-section">' + errorBody('Không tải được danh sách học sinh. Vui lòng tải lại trang.') + '</div>';
      });
  }

  function selectChild(id) {
    state.childId = String(id);
    try { localStorage.setItem('parentChildId', state.childId); } catch (e) { /* storage off */ }
    var child = state.children.filter(function (c) { return String(c._id) === state.childId; })[0];
    renderShell(child);
    loadClasses(child);
    loadHomework();
    loadScores();
    loadTuition();
  }

  function renderShell(child) {
    var kids = state.children.length > 1
      ? '<div class="ph-kids" role="tablist">' + state.children.map(function (c) {
        var alert = c.status === 'failed' || c.status === 'warning' || c.homeworkMissed > 0;
        return '<button class="ph-kid' + (String(c._id) === state.childId ? ' active' : '') + '" data-kid="' + esc(String(c._id)) + '" role="tab" type="button">' +
          esc(c.name) + (alert ? '<span class="ph-kid-dot" title="Cần chú ý"></span>' : '') + '</button>';
      }).join('') + '</div>'
      : '';

    var avatar = child.avatar
      ? '<img src="' + esc(child.avatar) + '" alt="">'
      : initials(child.name);

    var tiles =
      tile('classes', 'Lớp đang học', child.classCount, '') +
      tile('absent', 'Buổi vắng', child.absentTotal, child.absentTotal > 0 ? 'warn' : '') +
      tile('late', 'Đi trễ', child.lateCount, child.lateCount > 0 ? 'warn' : '') +
      tile('homework', 'Bài tập quá hạn', child.homeworkMissed, child.homeworkMissed > 0 ? 'bad' : '');

    $main.innerHTML = '<div id="phAlertSlot"></div>' + kids +
      '<div class="ph-child-head"><div class="ph-avatar">' + avatar + '</div>' +
      '<div><h1 class="ph-child-name">' + esc(child.name) + '</h1>' + (statusPill(child.status) || '<span class="ph-muted">Chưa vào lớp nào</span>') + '</div></div>' +
      '<div class="ph-tiles">' + tiles + '</div>' +
      '<div id="phClasses">' + section('fa-calendar-check', 'Chuyên cần', loadingBody()) + '</div>' +
      '<div id="phHomework">' + section('fa-list-check', 'Bài tập về nhà', loadingBody()) + '</div>' +
      '<div id="phScores">' + section('fa-chart-line', 'Kết quả học tập', loadingBody()) + '</div>' +
      '<div id="phTuition">' + section('fa-receipt', 'Học phí', loadingBody()) + '</div>' +
      '<p class="ph-foot">Kết quả bài làm được lưu trong 3 tháng gần nhất.</p>';

    if (notif.list.length || notif.unread) renderBell();
    Array.prototype.forEach.call($main.querySelectorAll('[data-kid]'), function (b) {
      b.addEventListener('click', function () { if (b.getAttribute('data-kid') !== state.childId) selectChild(b.getAttribute('data-kid')); });
    });
  }

  function tile(key, label, value, level) {
    return '<div class="ph-tile' + (level ? ' ph-tile-' + level : '') + '" data-tile="' + key + '"><div class="ph-tile-label">' + label + '</div><div class="ph-tile-value">' + esc(String(value || 0)) + '</div></div>';
  }
  function setTile(key, value, level) {
    var el = $main.querySelector('[data-tile="' + key + '"]');
    if (!el) return;
    el.className = 'ph-tile' + (value > 0 && level ? ' ph-tile-' + level : '');
    el.querySelector('.ph-tile-value').textContent = String(value || 0);
  }

  // A child switch can land while an older request is still in flight —
  // drop responses for a child no longer shown.
  function forCurrent(id, fn) { return function (body) { if (String(id) === state.childId) fn(body); }; }
  function failInto(elId, title, icon) {
    var id = state.childId;
    return function () {
      if (id !== state.childId) return;
      document.getElementById(elId).innerHTML = section(icon, title, errorBody());
    };
  }

  // ── attendance ─────────────────────────────────────
  function loadClasses() {
    var id = state.childId;
    api('/parent/children/' + id + '/classes')
      .then(forCurrent(id, function (body) {
        var classes = body.classes || [];
        // The children list reads cached counters; these are live (the
        // overview recomputes overdue homework on read), so refresh the tiles.
        var sum = function (k) { return classes.reduce(function (n, c) { return n + (c[k] || 0); }, 0); };
        setTile('classes', classes.length, '');
        setTile('absent', sum('absentTotal'), 'warn');
        setTile('late', sum('lateCount'), 'warn');
        setTile('homework', sum('homeworkMissedCount'), 'bad');
        var html = classes.length
          ? '<div class="ph-section-body">' + classes.map(renderClass).join('') + legend() + '</div>'
          : '<div class="ph-section-body"><div class="ph-empty">Con chưa được xếp vào lớp nào đang học.</div></div>';
        document.getElementById('phClasses').innerHTML = section('fa-calendar-check', 'Chuyên cần', html);
      }))
      .catch(failInto('phClasses', 'Chuyên cần', 'fa-calendar-check'));
  }

  function renderClass(c) {
    var p = c.progress || {};
    var attended = Math.max(0, (c.heldSessions || 0) - (c.absentTotal || 0));
    var rate = c.heldSessions ? Math.round((attended / c.heldSessions) * 100) : null;
    var next = p.nextSession
      ? 'Buổi tiếp theo: ' + fmtShort(p.nextSession.date) + (p.startTime ? ' · ' + esc(p.startTime) : '')
      : '';
    var meta = [
      c.teacherName ? 'GV: ' + esc(c.teacherName) : '',
      c.totalSessions ? 'Đã học ' + (p.currentSessionOrdinal || c.heldSessions || 0) + '/' + c.totalSessions + ' buổi' : '',
      next,
    ].filter(Boolean).join(' · ');

    var warn = '';
    if (c.attendanceLevel === 'warn' || c.attendanceLevel === 'fail') {
      warn += '<div class="ph-reason"><i class="fas fa-triangle-exclamation"></i> Con đã nghỉ ' + c.absenceEquivalent +
        ' buổi (tính cả đi trễ), giới hạn ' + c.maxAbsencesAllowed + ' buổi. Còn được nghỉ ' + c.remainingAbsences + ' buổi.</div>';
    }
    if (c.homeworkLevel === 'warn' || c.homeworkLevel === 'fail') {
      warn += '<div class="ph-reason"><i class="fas fa-triangle-exclamation"></i> Con đang thiếu ' + c.homeworkMissedCount +
        ' bài tập quá hạn (đến ' + c.homeworkFailThreshold + ' bài sẽ không đạt khóa).</div>';
    }

    var strip = (c.sessions || []).map(function (s) {
      var m = MARK[s.mark];
      var title = 'Buổi ' + s.sessionNumber + ' · ' + fmtShort(s.date);
      if (s.sessionStatus === 'cancelled') return '<span class="ph-sess ph-sess-cancelled" title="' + title + ' · Hủy">–</span>';
      if (m) return '<span class="ph-sess ' + m.cls + '" title="' + title + ' · ' + m.text + '">' + m.letter + '</span>';
      return '<span class="ph-sess" title="' + title + ' · Chưa học">' + s.sessionNumber + '</span>';
    }).join('');

    return '<div class="ph-class">' +
      '<div class="ph-class-top"><span class="ph-class-name">' + esc(c.className) + '</span>' + statusPill(c.status) + '</div>' +
      (meta ? '<div class="ph-class-meta">' + meta + '</div>' : '') +
      (rate != null ? '<div class="ph-bar" aria-hidden="true"><span style="width:' + rate + '%"></span></div><div class="ph-class-meta">Chuyên cần ' + rate + '% (' + attended + '/' + c.heldSessions + ' buổi đã diễn ra)</div>' : '') +
      '<div class="ph-kv">' +
        '<div><b>' + (c.heldSessions || 0) + '</b><span>Buổi đã diễn ra</span></div>' +
        '<div><b>' + (c.absentUnexcused || 0) + '</b><span>Vắng không phép</span></div>' +
        '<div><b>' + (c.absentExcused || 0) + '</b><span>Vắng có phép</span></div>' +
        '<div><b>' + (c.lateCount || 0) + '</b><span>Đi trễ</span></div>' +
      '</div>' +
      warn +
      (strip ? '<div class="ph-strip">' + strip + '</div>' : '') +
      '</div>';
  }

  function legend() {
    return '<div class="ph-legend">' +
      ['present', 'late', 'excused', 'absent'].map(function (k) {
        return '<span><i class="' + MARK[k].cls + '"></i>' + MARK[k].letter + ' ' + MARK[k].text + '</span>';
      }).join('') + '</div>';
  }

  // ── homework ───────────────────────────────────────
  function loadHomework() {
    var id = state.childId;
    api('/parent/children/' + id + '/homework')
      .then(forCurrent(id, function (body) {
        var list = body.assignments || [];
        var done = list.filter(function (a) { return a.status === 'completed'; }).length;
        var head = list.length ? '<span class="ph-muted">Đã xong ' + done + '/' + list.length + '</span>' : '';
        var html = list.length
          ? '<div class="ph-section-body"><ul class="ph-list">' + list.map(function (a) {
            var st = HW[a.status] || HW.not_started;
            var sub = [esc(a.className), a.deadline ? 'Hạn ' + fmtDate(a.deadline) : 'Không có hạn'].join(' · ');
            return '<li class="ph-row"><div class="ph-row-main"><div class="ph-row-title">' + esc(a.title) + '</div>' +
              '<div class="ph-row-sub">' + sub + '</div></div>' +
              '<div class="ph-row-side"><span class="ph-status ' + st.cls + '">' + st.text + '</span>' +
              (a.total ? '<div class="ph-row-sub">' + a.done + '/' + a.total + ' phần</div>' : '') + '</div></li>';
          }).join('') + '</ul></div>'
          : '<div class="ph-section-body"><div class="ph-empty">Chưa có bài tập nào được giao.</div></div>';
        document.getElementById('phHomework').innerHTML = section('fa-list-check', 'Bài tập về nhà', html, head);
      }))
      .catch(failInto('phHomework', 'Bài tập về nhà', 'fa-list-check'));
  }

  // ── scores ─────────────────────────────────────────
  var SCORE_TABS = [
    ['mock', 'Thi thử'], ['reading', 'Reading'], ['listening', 'Listening'], ['writing', 'Writing'], ['speaking', 'Speaking'],
  ];
  var scoreData = null;

  function loadScores() {
    var id = state.childId;
    scoreData = null;
    api('/parent/children/' + id + '/scores')
      .then(forCurrent(id, function (body) {
        scoreData = {
          mock: body.mockTests || [], reading: body.reading || [], listening: body.listening || [],
          writing: body.writing || [], speaking: body.speaking || [],
        };
        // Open on the first tab that has something in it.
        if (!scoreData[state.scoreTab].length) {
          var firstFull = SCORE_TABS.filter(function (t) { return scoreData[t[0]].length; })[0];
          if (firstFull) state.scoreTab = firstFull[0];
        }
        renderScores();
      }))
      .catch(failInto('phScores', 'Kết quả học tập', 'fa-chart-line'));
  }

  function renderScores() {
    var tabs = '<div class="ph-tabs" role="tablist">' + SCORE_TABS.map(function (t) {
      return '<button class="ph-tab' + (t[0] === state.scoreTab ? ' active' : '') + '" data-tab="' + t[0] + '" role="tab" type="button">' +
        t[1] + ' <span class="ph-tab-count">' + scoreData[t[0]].length + '</span></button>';
    }).join('') + '</div>';
    var rows = scoreData[state.scoreTab];
    var body = rows.length
      ? '<ul class="ph-list">' + rows.map(SCORE_ROW[state.scoreTab]).join('') + '</ul>'
      : '<div class="ph-empty">' + (state.scoreTab === 'writing'
        ? 'Chưa có bài Writing nào được giáo viên chấm.'
        : 'Chưa có bài làm nào trong 3 tháng gần nhất.') + '</div>';
    document.getElementById('phScores').innerHTML = section('fa-chart-line', 'Kết quả học tập', tabs + '<div class="ph-section-body">' + body + '</div>');
    Array.prototype.forEach.call(document.querySelectorAll('#phScores [data-tab]'), function (b) {
      b.addEventListener('click', function () { state.scoreTab = b.getAttribute('data-tab'); renderScores(); });
    });
  }

  function note(label, text) {
    return text ? '<div class="ph-note"><b>' + label + '</b>' + esc(text) + '</div>' : '';
  }
  function chips(list) {
    var items = list.filter(function (x) { return x[1] != null; });
    return items.length ? '<div class="ph-chips">' + items.map(function (x) { return '<span class="ph-chip">' + x[0] + ' ' + band(x[1]) + '</span>'; }).join('') + '</div>' : '';
  }

  var SCORE_ROW = {
    mock: function (m) {
      return '<li class="ph-row"><div class="ph-row-main"><div class="ph-row-title">Thi thử 4 kỹ năng</div>' +
        '<div class="ph-row-sub">' + fmtDate(m.date) + (m.status === 'awaiting-grading' ? ' · Đang chờ chấm' : '') + '</div>' +
        chips([['L', m.bands.listening], ['R', m.bands.reading], ['W', m.bands.writing], ['S', m.bands.speaking]]) +
        note('Nhận xét của giáo viên', m.teacherNote) + '</div>' +
        '<div class="ph-row-side"><div class="ph-band">' + band(m.overallBand) + '</div><div class="ph-row-sub">Overall</div></div></li>';
    },
    reading: rlRow,
    listening: rlRow,
    writing: function (w) {
      return '<li class="ph-row"><div class="ph-row-main"><div class="ph-row-title">' + esc(w.name) + '</div>' +
        '<div class="ph-row-sub">Nộp ' + fmtDate(w.date) + (w.gradedAt ? ' · Chấm ' + fmtDate(w.gradedAt) : '') + '</div>' +
        chips([['Task 1', w.task1Band], ['Task 2', w.task2Band]]) +
        note('Nhận xét của giáo viên', w.teacherNote) +
        note('Task 1', w.task1Comment) +
        note('Task 2', w.task2Comment) + '</div>' +
        '<div class="ph-row-side"><div class="ph-band">' + band(w.overallBand) + '</div><div class="ph-row-sub">Band</div></div></li>';
    },
    speaking: function (s) {
      return '<li class="ph-row"><div class="ph-row-main"><div class="ph-row-title">' + esc(s.topic || 'Speaking') + ' <span class="ph-muted">· Part ' + esc(String(s.part || '')) + '</span></div>' +
        '<div class="ph-row-sub">' + fmtDate(s.date) + ' · Chấm tự động (AI)' + (s.provisional ? ' · chưa tính phát âm' : '') + '</div>' +
        chips([['Trôi chảy', s.fluency], ['Từ vựng', s.vocabulary], ['Ngữ pháp', s.grammar], ['Phát âm', s.pronunciation]]) + '</div>' +
        '<div class="ph-row-side"><div class="ph-band">' + band(s.overallBand) + '</div><div class="ph-row-sub">Band</div></div></li>';
    },
  };

  function rlRow(r) {
    var tags = [fmtDate(r.date), r.partial ? 'Làm một phần' : '', r.simulation ? 'Chế độ thi thật' : ''].filter(Boolean).join(' · ');
    return '<li class="ph-row"><div class="ph-row-main"><div class="ph-row-title">' + esc(r.name) + '</div>' +
      '<div class="ph-row-sub">' + tags + '</div></div>' +
      '<div class="ph-row-side"><div class="ph-band">' + r.correct + '/' + r.total + '</div>' +
      '<div class="ph-row-sub">' + (r.partial || !r.band ? 'câu đúng' : 'Band ' + band(r.band)) + '</div></div></li>';
  }

  // ── tuition ────────────────────────────────────────
  var MONTHS = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  function feeLabel(f) {
    return f.feeType === 'monthly' ? 'Học phí ' + (MONTHS[f.month] || 'tháng ' + f.month).toLowerCase() + '/' + f.year : 'Học phí khóa ' + (f.courseName || '');
  }

  function loadTuition() {
    var id = state.childId;
    api('/parent/children/' + id + '/tuition')
      .then(forCurrent(id, function (body) {
        var fees = body.fees || [];
        var unpaid = fees.filter(function (f) { return !f.isPaid; });
        var paidCount = fees.length - unpaid.length;
        var total = unpaid.reduce(function (s, f) { return s + (f.amount || 0); }, 0);
        var html;
        if (!fees.length) {
          html = '<div class="ph-section-body"><div class="ph-empty">Chưa có thông tin học phí.</div></div>';
        } else if (!unpaid.length) {
          html = '<div class="ph-section-body"><span class="ph-status ph-status-ok"><i class="fas fa-circle-check"></i> Đã đóng đủ học phí</span>' +
            '<div class="ph-row-sub" style="margin-top:6px">' + paidCount + ' khoản đã đóng</div></div>';
        } else {
          var pay = body.payment || {};
          var payHtml = (pay.bankAccount || pay.qrImageUrl)
            ? '<div class="ph-pay"><div class="ph-pay-info">' +
              (pay.bankName ? '<div>Ngân hàng: <b>' + esc(pay.bankName) + '</b></div>' : '') +
              (pay.bankAccount ? '<div>Số tài khoản: <b>' + esc(pay.bankAccount) + '</b></div>' : '') +
              (pay.accountName ? '<div>Chủ tài khoản: <b>' + esc(pay.accountName) + '</b></div>' : '') +
              (pay.paymentNote ? '<div class="ph-muted">' + esc(pay.paymentNote) + '</div>' : '') +
              '</div>' + (pay.qrImageUrl ? '<img class="ph-qr" src="' + esc(pay.qrImageUrl) + '" alt="Mã QR chuyển khoản">' : '') + '</div>'
            : '';
          html = '<div class="ph-section-body"><div class="ph-debt"><span>Còn cần đóng</span><span class="ph-debt-amount">' + fmtVND(total) + '</span></div>' +
            '<ul class="ph-list">' + unpaid.map(function (f) {
              return '<li class="ph-row"><div class="ph-row-main"><div class="ph-row-title">' + esc(feeLabel(f)) + '</div>' +
                (f.note ? '<div class="ph-row-sub">' + esc(f.note) + '</div>' : '') + '</div>' +
                '<div class="ph-row-side"><b>' + fmtVND(f.amount) + '</b><div class="ph-row-sub">' +
                (f.studentNotified ? 'Đang chờ trung tâm xác nhận' : 'Chưa đóng') + '</div></div></li>';
            }).join('') + '</ul>' +
            (paidCount ? '<div class="ph-row-sub">' + paidCount + ' khoản khác đã đóng</div>' : '') + payHtml + '</div>';
        }
        document.getElementById('phTuition').innerHTML = section('fa-receipt', 'Học phí', html);
      }))
      .catch(failInto('phTuition', 'Học phí', 'fa-receipt'));
  }

  if (user.mustChangePassword) needPasswordChange();
  else start();
})();
