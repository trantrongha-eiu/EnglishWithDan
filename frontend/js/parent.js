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

  // ── change password (optional) ─────────────────────
  var $pwModal = document.getElementById('phPwModal');
  var $pwForm = document.getElementById('phPwForm');
  var $pwErr = document.getElementById('phPwError');
  var $pwBtn = document.getElementById('phPwSubmit');
  function openPasswordModal() {
    $pwForm.reset();
    $pwErr.hidden = true;
    document.getElementById('phPwHint').hidden = !user.mustChangePassword;
    $pwModal.hidden = false;
    document.getElementById('phPwCurrent').focus();
  }
  function closePasswordModal() { $pwModal.hidden = true; }
  function pwError(msg) { $pwErr.textContent = msg; $pwErr.hidden = false; }
  document.getElementById('phPwOpen').addEventListener('click', openPasswordModal);
  document.getElementById('phPwClose').addEventListener('click', closePasswordModal);
  $pwModal.addEventListener('click', function (e) { if (e.target === $pwModal) closePasswordModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$pwModal.hidden) closePasswordModal(); });
  $pwForm.addEventListener('submit', function (e) {
    e.preventDefault();
    $pwErr.hidden = true;
    var cur = document.getElementById('phPwCurrent').value;
    var nw = document.getElementById('phPwNew').value;
    var cf = document.getElementById('phPwConfirm').value;
    if (nw.length < 8) return pwError('Mật khẩu mới phải có ít nhất 8 ký tự.');
    if (nw !== cf) return pwError('Hai mật khẩu mới không khớp.');
    if (nw === cur) return pwError('Mật khẩu mới phải khác mật khẩu hiện tại.');
    $pwBtn.disabled = true;
    api('/user/change-password', { method: 'PUT', body: JSON.stringify({ currentPassword: cur, newPassword: nw }) })
      .then(function (body) {
        // The change revokes old tokens; keep this session on the fresh one.
        if (body.token) AS.setToken(body.token);
        user.mustChangePassword = false;
        AS.setUser(user);
        closePasswordModal();
        if (window.showToast) window.showToast('Đã đổi mật khẩu', 'success');
      })
      .catch(function (e2) { pwError((e2 && e2.message) || 'Không đổi được mật khẩu.'); })
      .then(function () { $pwBtn.disabled = false; });
  });

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

    $main.innerHTML = '<div id="phAlertSlot"></div>' + kids +
      '<div class="ph-child-head"><div class="ph-avatar">' + avatar + '</div>' +
      '<div><h1 class="ph-child-name">' + esc(child.name) + '</h1>' + (statusPill(child.status) || '<span class="ph-muted">Chưa vào lớp nào</span>') + '</div></div>' +
      '<div class="ph-overview">' +
        '<div id="phSumAtt">' + attSummary(null, child) + '</div>' +
        '<div id="phSumHw">' + hwSummary(null, child) + '</div>' +
      '</div>' +
      '<div id="phClasses">' + section('fa-calendar-check', 'Chuyên cần theo lớp', loadingBody()) + '</div>' +
      '<div id="phHomework">' + section('fa-list-check', 'Bài tập về nhà', loadingBody()) + '</div>' +
      '<div id="phScores">' + section('fa-chart-line', 'Kết quả học tập', loadingBody()) + '</div>' +
      '<div id="phTuition">' + section('fa-receipt', 'Học phí', loadingBody()) + '</div>' +
      '<p class="ph-foot">Kết quả bài làm được lưu trong 3 tháng gần nhất.</p>';

    if (notif.list.length || notif.unread) renderBell();
    bindJumps();
    Array.prototype.forEach.call($main.querySelectorAll('[data-kid]'), function (b) {
      b.addEventListener('click', function () { if (b.getAttribute('data-kid') !== state.childId) selectChild(b.getAttribute('data-kid')); });
    });
  }

  // ── overview cards ─────────────────────────────────
  // One card per topic: the headline number big, then every count that
  // makes it up on its own labelled line, so nothing has to be inferred.
  function sumRow(label, value, tone) {
    return '<div class="ph-sum-row' + (tone && value > 0 ? ' ph-tone-' + tone : '') + '"><span>' + label + '</span><b>' +
      (value == null ? '…' : esc(String(value))) + '</b></div>';
  }
  function sumCard(icon, title, bigLabel, bigValue, bigTone, rows, foot, target) {
    return '<a class="ph-sum" href="#' + target + '" data-jump="' + target + '">' +
      '<div class="ph-sum-head"><span><i class="fas ' + icon + '"></i> ' + title + '</span><span class="ph-sum-more">Xem chi tiết <i class="fas fa-chevron-down"></i></span></div>' +
      '<div class="ph-sum-big' + (bigTone && bigValue > 0 ? ' ph-tone-' + bigTone : '') + '"><span class="ph-sum-num">' +
        (bigValue == null ? '…' : esc(String(bigValue))) + '</span><span class="ph-sum-label">' + bigLabel + '</span></div>' +
      (rows ? '<div class="ph-sum-rows">' + rows + '</div>' : '') +
      (foot ? '<div class="ph-sum-foot ph-tone-' + foot.tone + '"><i class="fas ' + foot.icon + '"></i> ' + foot.text + '</div>' : '') +
      '</a>';
  }

  // `classes` null = still loading: show the cached counts from the child list.
  function attSummary(classes, child) {
    if (!classes) {
      return sumCard('fa-calendar-check', 'Chuyên cần', 'buổi nghỉ', child.absentTotal, 'bad',
        sumRow('Đi trễ', child.lateCount, 'warn'), null, 'phClasses');
    }
    if (!classes.length) {
      return sumCard('fa-calendar-check', 'Chuyên cần', 'buổi nghỉ', 0, '',
        '<div class="ph-empty">Con chưa vào lớp nào đang học.</div>', null, 'phClasses');
    }
    var sum = function (k) { return classes.reduce(function (n, c) { return n + (c[k] || 0); }, 0); };
    var held = sum('heldSessions'), absent = sum('absentTotal'), late = sum('lateCount');
    var over = classes.some(function (c) { return c.attendanceLevel === 'fail'; });
    var near = classes.some(function (c) { return c.attendanceLevel === 'warn'; });
    var foot = over ? { tone: 'bad', icon: 'fa-circle-xmark', text: 'Số buổi nghỉ đã vượt giới hạn cho phép' }
      : near ? { tone: 'warn', icon: 'fa-triangle-exclamation', text: 'Số buổi nghỉ sắp chạm giới hạn cho phép' }
        : absent === 0 && late === 0 ? { tone: 'ok', icon: 'fa-circle-check', text: 'Con đi học đầy đủ, đúng giờ' }
          : { tone: 'ok', icon: 'fa-circle-check', text: 'Vẫn trong giới hạn nghỉ cho phép' };
    return sumCard('fa-calendar-check', 'Chuyên cần', 'buổi nghỉ', absent, 'bad',
      sumRow('Số buổi đã học', held) +
      sumRow('Có mặt đúng giờ', Math.max(0, held - absent - late)) +
      sumRow('Đi trễ', late, 'warn') +
      sumRow('Vắng có phép', sum('absentExcused'), 'info') +
      sumRow('Vắng không phép', sum('absentUnexcused'), 'bad'),
      foot, 'phClasses');
  }

  function hwSummary(list, child) {
    if (!list) {
      return sumCard('fa-list-check', 'Bài tập về nhà', 'bài còn thiếu', child.homeworkMissed, 'bad', '', null, 'phHomework');
    }
    if (!list.length) {
      return sumCard('fa-list-check', 'Bài tập về nhà', 'bài còn thiếu', 0, '',
        '<div class="ph-empty">Chưa có bài tập nào được giao.</div>', null, 'phHomework');
    }
    var g = groupHomework(list);
    var foot = g.missed.length
      ? { tone: 'bad', icon: 'fa-triangle-exclamation', text: 'Con vẫn có thể làm bù các bài còn thiếu' }
      : { tone: 'ok', icon: 'fa-circle-check', text: 'Không có bài nào bị thiếu' };
    return sumCard('fa-list-check', 'Bài tập về nhà', 'bài còn thiếu', g.missed.length, 'bad',
      sumRow('Tổng số bài được giao', list.length) +
      sumRow('Đã hoàn thành', g.done.length, 'ok') +
      sumRow('Chưa đến hạn, chưa xong', g.todo.length, 'warn') +
      sumRow('Quá hạn, chưa làm xong', g.missed.length, 'bad'),
      foot, 'phHomework');
  }

  function bindJumps() {
    Array.prototype.forEach.call($main.querySelectorAll('[data-jump]'), function (a) {
      if (a.getAttribute('data-bound')) return;
      a.setAttribute('data-bound', '1');
      a.addEventListener('click', function (e) {
        var el = document.getElementById(a.getAttribute('data-jump'));
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
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

  // Calendar-day difference in VN time: > 0 means d is in the future.
  function dayKey(d) { return new Date(d).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }); }
  function daysFromToday(d) {
    var a = dayKey(new Date()).split('-'), b = dayKey(d).split('-');
    return Math.round((Date.UTC(+b[0], b[1] - 1, +b[2]) - Date.UTC(+a[0], a[1] - 1, +a[2])) / 86400000);
  }
  function fmtDay(d) {
    return new Date(d).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
  }

  // ── attendance ─────────────────────────────────────
  function loadClasses() {
    var id = state.childId;
    api('/parent/children/' + id + '/classes')
      .then(forCurrent(id, function (body) {
        var classes = body.classes || [];
        // The children list reads cached counters; these are live (the
        // overview recomputes overdue homework on read).
        document.getElementById('phSumAtt').innerHTML = attSummary(classes);
        bindJumps();
        var html = classes.length
          ? '<div class="ph-section-body ph-stack">' + classes.map(renderClass).join('') + '</div>'
          : '<div class="ph-section-body"><div class="ph-empty">Con chưa được xếp vào lớp nào đang học.</div></div>';
        document.getElementById('phClasses').innerHTML = section('fa-calendar-check', 'Chuyên cần theo lớp', html);
      }))
      .catch(failInto('phClasses', 'Chuyên cần theo lớp', 'fa-calendar-check'));
  }

  function statCell(label, value, tone) {
    return '<div class="ph-stat' + (tone && value > 0 ? ' ph-tone-' + tone : '') + '"><b>' + esc(String(value || 0)) + '</b><span>' + label + '</span></div>';
  }

  function renderClass(c) {
    var p = c.progress || {};
    var held = c.heldSessions || 0;
    var absent = c.absentTotal || 0;
    var late = c.lateCount || 0;
    var attended = Math.max(0, held - absent);
    var rate = held ? Math.round((attended / held) * 100) : null;
    var meta = [
      c.teacherName ? '<span><i class="fas fa-chalkboard-user"></i> GV: ' + esc(c.teacherName) + '</span>' : '',
      c.totalSessions ? '<span><i class="fas fa-book-open"></i> Đã học ' + (p.currentSessionOrdinal || held) + '/' + c.totalSessions + ' buổi</span>' : '',
      p.nextSession ? '<span><i class="fas fa-clock"></i> Buổi tiếp theo: ' + fmtDay(p.nextSession.date) + (p.startTime ? ' · ' + esc(p.startTime) : '') + '</span>' : '',
    ].filter(Boolean).join('');

    var stats = '<div class="ph-stats">' +
      statCell('Buổi đã học', held, '') +
      statCell('Có mặt đúng giờ', Math.max(0, held - absent - late), '') +
      statCell('Đi trễ', late, 'warn') +
      statCell('Vắng có phép', c.absentExcused, 'info') +
      statCell('Vắng không phép', c.absentUnexcused, 'bad') +
      '</div>';

    // Limits, spelled out in full sentences.
    var notes = '';
    if (c.maxAbsencesAllowed) {
      var lvl = c.attendanceLevel === 'fail' ? 'bad' : c.attendanceLevel === 'warn' ? 'warn' : 'ok';
      notes += '<div class="ph-callout ph-tone-' + lvl + '"><i class="fas ' + (lvl === 'ok' ? 'fa-circle-info' : 'fa-triangle-exclamation') + '"></i><div>' +
        'Số buổi nghỉ đã tính: <b>' + c.absenceEquivalent + '/' + c.maxAbsencesAllowed + '</b> buổi cho phép' +
        (late && c.lateToAbsenceRatio ? ' (cứ ' + c.lateToAbsenceRatio + ' lần đi trễ tính 1 buổi nghỉ)' : '') +
        '. Còn được nghỉ <b>' + c.remainingAbsences + '</b> buổi.</div></div>';
    }
    if (c.homeworkMissedCount > 0) {
      var hl = c.homeworkLevel === 'fail' ? 'bad' : 'warn';
      notes += '<div class="ph-callout ph-tone-' + hl + '"><i class="fas fa-triangle-exclamation"></i><div>' +
        'Lớp này con đang thiếu <b>' + c.homeworkMissedCount + '</b> bài tập' +
        (c.homeworkFailThreshold ? ' (thiếu đến ' + c.homeworkFailThreshold + ' bài sẽ không đạt khóa)' : '') +
        '. Xem danh sách ở mục Bài tập về nhà.</div></div>';
    }

    // Every missed / late session with its date — the "nghỉ hôm nào?" a parent asks.
    var sessions = c.sessions || [];
    var misses = sessions.filter(function (s) {
      return s.sessionStatus !== 'cancelled' && (s.mark === 'absent' || s.mark === 'excused' || s.mark === 'late');
    });
    var missList = misses.length
      ? '<ul class="ph-miss-list">' + misses.map(function (s) {
        var m = MARK[s.mark];
        return '<li><span><b>Buổi ' + s.sessionNumber + '</b> · ' + fmtDay(s.date) + '</span>' +
          '<span class="ph-tag ' + m.cls + '">' + m.text + '</span></li>';
      }).join('') + '</ul>'
      : '<div class="ph-empty">' + (held ? 'Con chưa nghỉ hay đi trễ buổi nào.' : 'Lớp chưa có buổi học nào.') + '</div>';

    var strip = sessions.map(function (s) {
      var m = MARK[s.mark];
      var title = 'Buổi ' + s.sessionNumber + ' · ' + fmtShort(s.date);
      if (s.sessionStatus === 'cancelled') return '<span class="ph-sess ph-sess-cancelled" title="' + title + ' · Hủy">–</span>';
      if (m) return '<span class="ph-sess ' + m.cls + '" title="' + title + ' · ' + m.text + '">' + m.letter + '</span>';
      return '<span class="ph-sess" title="' + title + ' · Chưa học">' + s.sessionNumber + '</span>';
    }).join('');

    return '<article class="ph-class">' +
      '<div class="ph-class-top"><span class="ph-class-name">' + esc(c.className) + '</span>' + statusPill(c.status) + '</div>' +
      (meta ? '<div class="ph-class-meta">' + meta + '</div>' : '') +
      '<div class="ph-block"><div class="ph-block-title">Thống kê buổi học</div>' + stats +
        (rate != null ? '<div class="ph-bar" aria-hidden="true"><span style="width:' + rate + '%"></span></div>' +
          '<div class="ph-muted">Tỉ lệ đi học ' + rate + '% (' + attended + '/' + held + ' buổi)</div>' : '') +
        notes +
      '</div>' +
      '<div class="ph-block"><div class="ph-block-title">Các buổi nghỉ / đi trễ' + (misses.length ? ' <span class="ph-count">' + misses.length + '</span>' : '') + '</div>' + missList + '</div>' +
      (strip ? '<div class="ph-block"><div class="ph-block-title">Toàn bộ buổi học</div><div class="ph-strip">' + strip + '</div>' + legend() + '</div>' : '') +
      '</article>';
  }

  function legend() {
    return '<div class="ph-legend">' +
      ['present', 'late', 'excused', 'absent'].map(function (k) {
        return '<span><i class="' + MARK[k].cls + '"></i>' + MARK[k].letter + ' ' + MARK[k].text + '</span>';
      }).join('') + '<span><i class="ph-sess-future"></i>Số = buổi chưa học</span></div>';
  }

  // ── homework ───────────────────────────────────────
  function groupHomework(list) {
    var byDeadline = function (x, y) {
      var dx = x.deadline ? new Date(x.deadline).getTime() : Infinity;
      var dy = y.deadline ? new Date(y.deadline).getTime() : Infinity;
      return dx - dy;
    };
    return {
      missed: list.filter(function (a) { return a.status === 'overdue'; }).sort(byDeadline),
      todo: list.filter(function (a) { return a.status === 'not_started' || a.status === 'in_progress'; }).sort(byDeadline),
      done: list.filter(function (a) { return a.status === 'completed'; }).sort(function (x, y) { return byDeadline(y, x); }),
    };
  }

  function deadlineText(a) {
    if (!a.deadline) return 'Không có hạn nộp';
    var base = 'Hạn ' + fmtDate(a.deadline);
    if (a.status === 'completed') return base;
    var n = daysFromToday(a.deadline);
    if (a.status === 'overdue') return base + ' · <b class="ph-tone-bad">' + (n < 0 ? 'quá hạn ' + (-n) + ' ngày' : 'đã quá hạn') + '</b>';
    if (n <= 0) return base + ' · <b class="ph-tone-warn">hết hạn hôm nay</b>';
    if (n === 1) return base + ' · <b class="ph-tone-warn">còn 1 ngày</b>';
    return base + ' · còn ' + n + ' ngày';
  }

  function hwRow(a) {
    var st = HW[a.status] || HW.not_started;
    var sub = [esc(a.className), deadlineText(a)];
    if (a.archived && a.status === 'overdue') sub.push('giáo viên đã đóng bài, vẫn tính là thiếu');
    return '<li class="ph-row"><div class="ph-row-main"><div class="ph-row-title">' + esc(a.title) + '</div>' +
      '<div class="ph-row-sub">' + sub.join(' · ') + '</div></div>' +
      '<div class="ph-row-side"><span class="ph-status ' + st.cls + '">' + st.text + '</span>' +
      (a.total ? '<div class="ph-row-sub">Xong ' + a.done + '/' + a.total + ' phần</div>' : '') + '</div></li>';
  }

  function hwGroup(tone, icon, title, hint, items, emptyText, collapsed) {
    var head = '<span class="ph-group-title"><i class="fas ' + icon + '"></i> ' + title + '</span><span class="ph-count">' + items.length + '</span>';
    var body = '<div class="ph-group-body">' + (hint && items.length ? '<div class="ph-group-hint">' + hint + '</div>' : '') +
      (items.length ? '<ul class="ph-list">' + items.map(hwRow).join('') + '</ul>' : '<div class="ph-empty">' + emptyText + '</div>') + '</div>';
    if (collapsed && items.length) {
      return '<details class="ph-group ph-tone-' + tone + '"><summary class="ph-group-head">' + head +
        '<span class="ph-group-toggle">Xem <i class="fas fa-chevron-down"></i></span></summary>' + body + '</details>';
    }
    return '<div class="ph-group ph-tone-' + tone + '"><div class="ph-group-head">' + head + '</div>' + body + '</div>';
  }

  function loadHomework() {
    var id = state.childId;
    api('/parent/children/' + id + '/homework')
      .then(forCurrent(id, function (body) {
        var list = body.assignments || [];
        document.getElementById('phSumHw').innerHTML = hwSummary(list);
        bindJumps();
        var html;
        if (!list.length) {
          html = '<div class="ph-section-body"><div class="ph-empty">Chưa có bài tập nào được giao.</div></div>';
        } else {
          var g = groupHomework(list);
          html = '<div class="ph-section-body ph-stack">' +
            hwGroup('bad', 'fa-circle-exclamation', 'Còn thiếu — đã quá hạn',
              'Con vẫn làm bù được: làm xong thì bài không còn bị tính là thiếu.', g.missed, 'Không có bài nào bị thiếu.', false) +
            hwGroup('warn', 'fa-hourglass-half', 'Cần làm — chưa đến hạn', '', g.todo, 'Không có bài nào đang chờ làm.', false) +
            hwGroup('ok', 'fa-circle-check', 'Đã hoàn thành', '', g.done, 'Chưa có bài nào hoàn thành.', true) +
            '</div>';
        }
        var doneCount = list.filter(function (a) { return a.status === 'completed'; }).length;
        var head = list.length ? '<span class="ph-muted">Đã xong ' + doneCount + '/' + list.length + ' bài</span>' : '';
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
        // Bank details + QR are shown whatever the fee state — parents may pay
        // ahead, or before the centre has entered this month's fee.
        var pay = body.payment || {};
        var payHtml = (pay.bankAccount || pay.qrImageUrl)
          ? '<div class="ph-pay"><div class="ph-pay-info">' +
            '<div class="ph-pay-title">Thông tin chuyển khoản</div>' +
            (pay.bankName ? '<div>Ngân hàng: <b>' + esc(pay.bankName) + '</b></div>' : '') +
            (pay.bankAccount ? '<div>Số tài khoản: <b>' + esc(pay.bankAccount) + '</b></div>' : '') +
            (pay.accountName ? '<div>Chủ tài khoản: <b>' + esc(pay.accountName) + '</b></div>' : '') +
            (pay.paymentNote ? '<div class="ph-muted">' + esc(pay.paymentNote) + '</div>' : '') +
            '</div>' +
            (pay.qrImageUrl
              ? '<a class="ph-qr-wrap" href="' + esc(pay.qrImageUrl) + '" target="_blank" rel="noopener">' +
                '<img class="ph-qr" src="' + esc(pay.qrImageUrl) + '" alt="Mã QR chuyển khoản">' +
                '<span class="ph-row-sub">Quét mã để chuyển khoản · bấm để mở ảnh lớn / lưu ảnh</span></a>'
              : '') +
            '</div>'
          : '';
        var html;
        if (!fees.length) {
          html = '<div class="ph-section-body"><div class="ph-empty">Chưa có khoản học phí nào.</div>' + payHtml + '</div>';
        } else if (!unpaid.length) {
          html = '<div class="ph-section-body"><span class="ph-status ph-status-ok"><i class="fas fa-circle-check"></i> Đã đóng đủ học phí</span>' +
            '<div class="ph-row-sub" style="margin-top:6px">' + paidCount + ' khoản đã đóng</div>' + payHtml + '</div>';
        } else {
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

  start();
})();
