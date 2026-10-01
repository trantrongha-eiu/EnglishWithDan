/**
 * shared/attempt-history.js — the ONE "Lịch sử làm bài" table for Reading
 * and Listening: Full đề and Bài lẻ attempts merged into a single newest-
 * first list (they used to be two separate modals), each row named clearly
 * (test name + passages used / section, "Mock test" tag for 4-skill mock
 * runs) and flagged "Chưa review" while its mandatory review is pending.
 *
 * Rows come from GET /api/{reading|listening}/history/combined (backend
 * services/attemptHistoryService.js). The host page owns the modal shell and
 * the fetch; this file only renders:
 *
 *   AttemptHistory.render(rootEl, data, {
 *     onOpen(row),   // "Xem lại" / "Review" — host opens the right review screen
 *     onMore(),      // "Tải thêm" (only shown while data.hasMore)
 *   });
 *
 * data = { items, total, hasMore }.
 */
(function () {
  'use strict';

  function _injectStyles() {
    if (document.getElementById('ah-styles')) return;
    var s = document.createElement('style');
    s.id = 'ah-styles';
    s.textContent =
      '.ah-filters{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px}' +
      '.ah-chip{padding:6px 12px;border:1px solid var(--border,#e5e7eb);border-radius:999px;background:var(--surface,#fff);color:var(--text2,#374151);font-size:12.5px;font-weight:600;font-family:inherit;cursor:pointer}' +
      '.ah-chip.active{background:var(--text,#111827);border-color:var(--text,#111827);color:var(--surface,#fff)}' +
      '.ah-chip .ah-n{opacity:.7;font-weight:500;margin-left:3px}' +
      '.ah-name{display:flex;flex-direction:column;gap:3px;min-width:200px;max-width:340px}' +
      '.ah-name-top{display:flex;align-items:center;gap:6px;flex-wrap:wrap}' +
      '.ah-title{font-weight:700;color:var(--text,#111827)}' +
      '.ah-detail{font-size:11.5px;color:var(--text3,#6b7280);line-height:1.4}' +
      '.ah-tag{font-size:10px;font-weight:700;padding:2px 7px;border-radius:999px;color:#fff;white-space:nowrap}' +
      '.ah-tag.full{background:#e11d48}.ah-tag.mock{background:#7c3aed}.ah-tag.lele{background:#3d8bff}' +
      '.ah-rv{font-size:10.5px;font-weight:700;padding:2px 7px;border-radius:999px;white-space:nowrap}' +
      '.ah-rv.pending{background:#fef3c7;color:#92400e;border:1px solid #f59e0b}' +
      '.ah-rv.done{background:transparent;color:var(--success,#16a34a)}' +
      '.ah-rv.void{background:transparent;color:var(--text3,#9ca3af)}' +
      '.ah-row-pending td{background:rgba(245,158,11,.06)}' +
      '.ah-btn{padding:5px 11px;border-radius:8px;border:1px solid var(--border,#e5e7eb);background:var(--surface,#fff);color:var(--text,#111827);font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;white-space:nowrap}' +
      '.ah-btn.review{background:#f59e0b;border-color:#f59e0b;color:#fff}' +
      '.ah-empty{text-align:center;padding:22px 8px;color:var(--text3,#9ca3af)}' +
      '.ah-footer{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px;font-size:12.5px;color:var(--text3,#6b7280)}' +
      '.ah-footer button{padding:6px 14px;border-radius:8px;border:1px solid var(--border,#e5e7eb);background:var(--surface,#fff);color:var(--text,#111827);font-family:inherit;cursor:pointer}' +
      '.ah-table-wrap{overflow-x:auto}';
    document.head.appendChild(s);
  }

  function _esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function _date(d) {
    if (!d) return '–';
    var dt = new Date(d);
    if (isNaN(dt)) return '–';
    return dt.toLocaleDateString('vi-VN') + '<br><span class="ah-detail">' + dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + '</span>';
  }
  function _dur(sec) {
    sec = Math.round(sec || 0);
    if (!sec) return '–';
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  var FILTERS = [
    { id: 'all', label: 'Tất cả', test: function () { return true; } },
    { id: 'full', label: 'Full đề', test: function (r) { return r.kind === 'full'; } },
    { id: 'practice', label: 'Bài lẻ', test: function (r) { return r.kind === 'practice'; } },
    { id: 'pending', label: 'Chưa review', test: function (r) { return r.reviewStatus === 'pending'; } },
  ];

  function _reviewBadge(r) {
    if (r.reviewStatus === 'pending') {
      return '<span class="ah-rv pending">Chưa review · ' + (r.reviewedCount || 0) + '/' + (r.reviewMistakeCount || 0) + '</span>';
    }
    if (r.reviewStatus === 'completed') return '<span class="ah-rv done">✓ Đã review</span>';
    if (r.reviewStatus === 'bypassed') return '<span class="ah-rv void">Bỏ qua bằng mã</span>';
    return '';
  }

  function _row(r, i) {
    var tagCls = r.kind === 'practice' ? 'lele' : (r.tag === 'Mock test' ? 'mock' : 'full');
    var pending = r.reviewStatus === 'pending';
    var result;
    if (r.status === 'disqualified') result = '<span class="ah-rv void">Bị huỷ</span>';
    else if (r.kind === 'full') result = '<strong>' + (r.bandScore != null ? Number(r.bandScore).toFixed(1) : '–') + '</strong>';
    else result = (r.totalQuestions ? Math.round(r.correctCount / r.totalQuestions * 100) : 0) + '%';
    return '<tr class="' + (pending ? 'ah-row-pending' : '') + '">' +
      '<td><div class="ah-name">' +
        '<div class="ah-name-top"><span class="ah-tag ' + tagCls + '">' + _esc(r.tag) + '</span>' +
          '<span class="ah-title">' + _esc(r.title) + '</span>' + _reviewBadge(r) + '</div>' +
        (r.detail ? '<div class="ah-detail">' + _esc(r.detail) + '</div>' : '') +
      '</div></td>' +
      '<td>' + _date(r.date) + '</td>' +
      '<td>' + _dur(r.duration) + '</td>' +
      '<td class="ah-c">' + (r.correctCount != null ? r.correctCount : '–') + '/' + (r.totalQuestions || '–') + '</td>' +
      '<td>' + (r.wrongCount != null ? r.wrongCount : '–') + '</td>' +
      '<td>' + (r.skippedCount != null ? r.skippedCount : '–') + '</td>' +
      '<td>' + result + '</td>' +
      '<td><button class="ah-btn' + (pending ? ' review' : '') + '" data-ah-idx="' + i + '">' + (pending ? 'Review' : 'Xem lại') + '</button></td>' +
    '</tr>';
  }

  function render(root, data, opts) {
    if (!root) return;
    _injectStyles();
    opts = opts || {};
    var items = (data && data.items) || [];
    var filterId = root.getAttribute('data-ah-filter') || 'all';
    var f = FILTERS.filter(function (x) { return x.id === filterId; })[0] || FILTERS[0];
    var shown = items.filter(f.test);

    var chips = '<div class="ah-filters">' + FILTERS.map(function (x) {
      var n = items.filter(x.test).length;
      return '<button class="ah-chip' + (x.id === f.id ? ' active' : '') + '" data-ah-filter="' + x.id + '">' +
        x.label + '<span class="ah-n">' + n + '</span></button>';
    }).join('') + '</div>';

    var body = shown.length
      ? shown.map(function (r) { return _row(r, items.indexOf(r)); }).join('')
      : '<tr><td colspan="8" class="ah-empty">' + (items.length ? 'Không có bài nào trong mục này.' : 'Chưa có lịch sử làm bài.') + '</td></tr>';

    root.innerHTML = chips +
      '<div class="ah-table-wrap"><table class="history-table"><thead><tr>' +
        '<th>Tên bài</th><th>Ngày nộp</th><th>Thời gian</th><th>Đúng</th><th>Sai</th><th>Bỏ qua</th><th>Kết quả</th><th></th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div>' +
      (items.length
        ? '<div class="ah-footer"><span>Đang hiển thị ' + items.length + '/' + (data.total || items.length) + ' lần làm bài</span>' +
          (data.hasMore && opts.onMore ? '<button data-ah-more="1">Tải thêm</button>' : '') + '</div>'
        : '');

    root.querySelectorAll('[data-ah-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        root.setAttribute('data-ah-filter', b.getAttribute('data-ah-filter'));
        render(root, data, opts);
      });
    });
    root.querySelectorAll('[data-ah-idx]').forEach(function (b) {
      b.addEventListener('click', function () {
        var r = items[+b.getAttribute('data-ah-idx')];
        if (r && opts.onOpen) opts.onOpen(r);
      });
    });
    var more = root.querySelector('[data-ah-more]');
    if (more) more.addEventListener('click', function () { more.disabled = true; opts.onMore(); });
  }

  function loading(root, text) {
    if (!root) return;
    _injectStyles();
    root.innerHTML = '<div class="ah-empty">' + _esc(text || 'Đang tải...') + '</div>';
  }

  window.AttemptHistory = { render: render, loading: loading };
})();
