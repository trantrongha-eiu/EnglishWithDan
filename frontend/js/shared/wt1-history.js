/**
 * shared/wt1-history.js — "Lịch sử luyện tập" for the three "Khoá học"
 * pages built on the WT1 stack (writing-task1.html, writing-task2-course.html,
 * speaking-course.html). One modal, two lists + a detail view:
 *
 *   WT1History.init({ api: pageApiFn, courseCode: 'IELTS-SPEAKING' })
 *   WT1History.openCourse()                 // every attempt in the course
 *   WT1History.openExercise(code, title)    // attempts at one exercise
 *
 * Clicking a row opens the full saved attempt (GET /wt1/attempt/:id →
 * `review`, built by wt1Service.buildReview): the student's answers with
 * right/wrong + answer key, or their writing / spoken transcript with the
 * AI or rubric feedback. Attempts are kept 3 months (WT1Submission TTL).
 * The admin panel renders the same `review` shape (Wt1ReviewModal.jsx).
 */
(function () {
  'use strict';

  var CSS = [
    '.wh-modal{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px}',
    '.wh-modal.wh-hidden{display:none}',
    '.wh-box{background:var(--surface,#fff);color:var(--text,#111827);border-radius:14px;max-width:640px;width:100%;max-height:86vh;display:flex;flex-direction:column;overflow:hidden}',
    '.wh-head{display:flex;align-items:center;gap:8px;padding:14px 18px;border-bottom:1px solid var(--border,#e5e7eb)}',
    '.wh-head h3{margin:0;font-size:15px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.wh-ib{border:none;background:none;color:var(--text3,#9ca3af);cursor:pointer;font-size:16px;padding:4px 6px}',
    '.wh-ib:hover{color:var(--text,#111827)}',
    '.wh-body{overflow-y:auto;padding:8px 18px 18px}',
    '.wh-note{font-size:11.5px;color:var(--text3,#9ca3af);padding:8px 0 4px}',
    '.wh-row{display:block;width:100%;text-align:left;background:none;border:none;border-top:1px dashed var(--border,#eef2f7);padding:10px 4px;cursor:pointer;color:inherit;font:inherit}',
    '.wh-row:first-of-type{border-top:none}',
    '.wh-row:hover{background:var(--surface2,#f8fafc)}',
    '.wh-row-top{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:13px}',
    '.wh-row-t{font-weight:700;min-width:0}',
    '.wh-row-s{font-weight:800;color:#0ea5e9;white-space:nowrap}',
    '.wh-row-m{font-size:11.5px;color:var(--text3,#9ca3af);margin-top:2px}',
    '.wh-empty{text-align:center;color:var(--text3,#9ca3af);font-size:13px;padding:24px 0}',
    '.wh-more{display:block;margin:12px auto 0;border:1px solid var(--border,#e5e7eb);background:var(--surface2,#f3f4f6);color:inherit;border-radius:8px;padding:6px 14px;font-size:12.5px;font-weight:600;cursor:pointer}',
    '.wh-sum{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;font-size:12.5px;color:var(--text2,#6b7280);padding:10px 0;border-bottom:1px solid var(--border,#eef2f7)}',
    '.wh-sum b{color:var(--text,#111827)}',
    '.wh-big{font-size:18px;font-weight:800;color:#0ea5e9}',
    '.wh-instr{font-size:12.5px;color:var(--text2,#6b7280);margin:10px 0 4px;line-height:1.6;white-space:pre-wrap}',
    '.wh-item{padding:10px 12px;border:1px solid var(--border,#e5e7eb);border-left:4px solid #22c55e;border-radius:10px;margin-top:8px;font-size:13px;line-height:1.55}',
    '.wh-item.bad{border-left-color:#ef4444}',
    '.wh-q{font-weight:600;margin-bottom:4px;white-space:pre-wrap}',
    '.wh-a{color:#16a34a}.wh-item.bad .wh-a{color:#dc2626}',
    '.wh-k{color:#16a34a;margin-top:2px}',
    '.wh-x{color:var(--text2,#6b7280);font-size:12px;margin-top:4px;white-space:pre-wrap}',
    '.wh-sec{margin-top:12px}',
    '.wh-h{font-size:11.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--text3,#9ca3af);margin-bottom:4px}',
    '.wh-text{white-space:pre-wrap;background:var(--surface2,#f8fafc);border:1px solid var(--border,#e5e7eb);border-radius:10px;padding:10px 12px;font-size:13px;line-height:1.7}',
    '.wh-bars{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px 12px}',
    '.wh-bar{display:flex;justify-content:space-between;font-size:12.5px;border-bottom:1px dotted var(--border,#e5e7eb);padding:3px 0}',
    '.wh-bar b{color:#0ea5e9}',
    '.wh-li{font-size:12.5px;margin-top:3px;line-height:1.55}',
    '.wh-chip{display:inline-block;font-size:11.5px;border-radius:999px;padding:2px 8px;margin:2px 4px 2px 0;background:#dcfce7;color:#166534}',
    '.wh-chip.miss{background:#fee2e2;color:#991b1b}',
    '.wh-warn{background:#fef3c7;border:1px solid #fcd34d;color:#92400e;border-radius:10px;padding:8px 12px;font-size:12.5px;margin-top:10px}',
    '.wh-sub{border:1px solid var(--border,#e5e7eb);border-radius:10px;padding:10px 12px;margin-top:8px}',
    'details.wh-det summary{cursor:pointer;font-size:12.5px;font-weight:700;color:#0ea5e9}',
  ].join('\n');

  var SCORE_LABELS = {
    taskAchievement: 'Task Achievement', coherence: 'Coherence & Cohesion', lexical: 'Lexical Resource', grammar: 'Grammar',
    fluency: 'Fluency & Coherence', vocabulary: 'Lexical Resource', pronunciation: 'Pronunciation',
  };

  var cfg = { api: null, courseCode: '' };
  var st = { mode: null, exCode: '', exTitle: '', rows: [], skip: 0, hasMore: false };
  var modal, titleEl, bodyEl, backBtn;

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtDate(d) {
    try { return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return ''; }
  }
  function num(n) { return (n == null || isNaN(n)) ? '–' : (Math.round(Number(n) * 10) / 10); }
  function scoreText(r) {
    if (r.band != null) return 'Band ' + num(r.band);
    if (r.correctCount != null && r.maxScore != null) return r.correctCount + '/' + r.maxScore + ' câu';
    if (r.score != null) return r.score + '%';
    return r.status === 'graded' ? 'Đã chấm' : 'Đã nộp';
  }

  function ensureDom() {
    if (modal) return;
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    modal = document.createElement('div');
    modal.className = 'wh-modal wh-hidden';
    modal.innerHTML = '<div class="wh-box" role="dialog" aria-modal="true" aria-labelledby="wh-title">' +
      '<div class="wh-head"><button class="wh-ib" id="wh-back" title="Quay lại" aria-label="Quay lại"><i class="fas fa-arrow-left"></i></button>' +
      '<h3 id="wh-title"></h3><button class="wh-ib" id="wh-close" title="Đóng" aria-label="Đóng"><i class="fas fa-times"></i></button></div>' +
      '<div class="wh-body" id="wh-body"></div></div>';
    document.body.appendChild(modal);
    titleEl = modal.querySelector('#wh-title');
    bodyEl = modal.querySelector('#wh-body');
    backBtn = modal.querySelector('#wh-back');
    backBtn.style.display = 'none';
    modal.querySelector('#wh-close').addEventListener('click', close);
    backBtn.addEventListener('click', function () { renderList(); });
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.classList.contains('wh-hidden')) close(); });
  }
  function open() { ensureDom(); modal.classList.remove('wh-hidden'); }
  function close() { if (modal) modal.classList.add('wh-hidden'); }
  function loading() { bodyEl.innerHTML = '<div class="wh-empty"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>'; }

  // ── lists ──────────────────────────────────────────────────────────
  async function openCourse() {
    open();
    st = { mode: 'course', rows: [], skip: 0, hasMore: false };
    loading();
    await loadMore();
  }
  async function openExercise(code, title) {
    open();
    st = { mode: 'exercise', exCode: code, exTitle: title || '', rows: [], skip: 0, hasMore: false };
    loading();
    try {
      var d = await cfg.api('/wt1/exercise/' + encodeURIComponent(code) + '/history');
      st.rows = d.history || [];
      renderList();
    } catch (e) { renderList('Không tải được lịch sử.'); }
  }
  async function loadMore() {
    try {
      var d = await cfg.api('/wt1/history?course=' + encodeURIComponent(cfg.courseCode) + '&limit=50&skip=' + st.skip);
      st.rows = st.rows.concat(d.rows || []);
      st.skip = st.rows.length;
      st.hasMore = !!d.hasMore;
      renderList();
    } catch (e) { renderList('Không tải được lịch sử.'); }
  }

  function renderList(err) {
    backBtn.style.display = 'none';
    titleEl.innerHTML = '<i class="fas fa-history"></i> ' + (st.mode === 'exercise' && st.exTitle ? 'Lịch sử — ' + esc(st.exTitle) : 'Lịch sử luyện tập');
    var note = '<div class="wh-note">Bấm vào một lượt để xem lại bài làm. Lịch sử được lưu 3 tháng, sau đó tự động xoá.</div>';
    if (err) { bodyEl.innerHTML = '<div class="wh-empty">' + esc(err) + '</div>'; return; }
    if (!st.rows.length) {
      bodyEl.innerHTML = '<div class="wh-empty">' + (st.mode === 'exercise' ? 'Bạn chưa làm bài này lần nào.' : 'Bạn chưa làm bài nào trong khoá học này (3 tháng gần nhất).') + '</div>';
      return;
    }
    bodyEl.innerHTML = note + st.rows.map(function (r, i) {
      var title = st.mode === 'course' ? esc(r.exerciseTitle) : 'Lượt ' + r.attempt;
      var meta = st.mode === 'course'
        ? esc(r.lessonTitle) + ' · lượt ' + r.attempt + ' · ' + fmtDate(r.createdAt)
        : fmtDate(r.createdAt);
      return '<button class="wh-row" data-i="' + i + '"><div class="wh-row-top"><span class="wh-row-t">' + title + '</span>' +
        '<span class="wh-row-s">' + esc(scoreText(r)) + '</span></div><div class="wh-row-m">' + meta + '</div></button>';
    }).join('') + (st.hasMore ? '<button class="wh-more" id="wh-more">Tải thêm</button>' : '');
    bodyEl.querySelectorAll('.wh-row').forEach(function (b) {
      b.addEventListener('click', function () { openAttempt(st.rows[+b.dataset.i].id); });
    });
    var more = bodyEl.querySelector('#wh-more');
    if (more) more.addEventListener('click', function () { more.disabled = true; more.textContent = 'Đang tải...'; loadMore(); });
  }

  // ── one attempt ────────────────────────────────────────────────────
  async function openAttempt(id) {
    backBtn.style.display = '';
    loading();
    try {
      var d = await cfg.api('/wt1/attempt/' + encodeURIComponent(id));
      titleEl.textContent = (d.review && d.review.exercise && d.review.exercise.title) || 'Bài làm';
      bodyEl.innerHTML = renderReview(d.review);
      bodyEl.scrollTop = 0;
    } catch (e) {
      bodyEl.innerHTML = '<div class="wh-empty">Không tải được bài làm này.</div>';
    }
  }

  function scoreBars(scores) {
    var keys = Object.keys(scores || {}).filter(function (k) { return scores[k] != null; });
    if (!keys.length) return '';
    return '<div class="wh-bars">' + keys.map(function (k) {
      return '<div class="wh-bar"><span>' + esc(SCORE_LABELS[k] || k) + '</span><b>' + num(scores[k]) + '</b></div>';
    }).join('') + '</div>';
  }
  function corrections(list) {
    if (!list || !list.length) return '';
    return '<div class="wh-sec"><div class="wh-h">Sửa lỗi</div>' + list.map(function (c) {
      return '<div class="wh-li">✎ <s style="color:#dc2626">' + esc(c.original) + '</s> → <b style="color:#16a34a">' + esc(c.corrected) + '</b>' +
        (c.note ? ' <span style="color:var(--text3,#9ca3af)">(' + esc(c.note) + ')</span>' : '') + '</div>';
    }).join('') + '</div>';
  }
  function bullets(title, list) {
    if (!list || !list.length) return '';
    return '<div class="wh-sec"><div class="wh-h">' + title + '</div>' + list.map(function (x) { return '<div class="wh-li">• ' + esc(x) + '</div>'; }).join('') + '</div>';
  }
  function structText(x) {
    if (typeof x === 'string') return x;
    if (x && typeof x === 'object') return x.text || x.name || x.label || '';
    return x == null ? '' : String(x);
  }

  function renderReview(r) {
    if (!r) return '<div class="wh-empty">Không có dữ liệu.</div>';
    var h = '<div class="wh-sum"><span class="wh-big">' + esc(scoreText(r)) + '</span>' +
      (r.kind === 'objective' && r.score != null && r.correctCount != null ? '<span><b>' + r.score + '%</b></span>' : '') +
      '<span>' + esc(r.lessonTitle) + '</span><span>Lượt <b>' + r.attempt + '</b></span><span>' + fmtDate(r.createdAt) + '</span></div>';
    if (r.exercise && r.exercise.instruction) h += '<div class="wh-instr">' + esc(r.exercise.instruction) + '</div>';

    if (r.kind === 'objective') {
      if (!(r.items || []).length) return h + '<div class="wh-empty">Bài tập này không còn trong khoá học.</div>';
      return h + r.items.map(function (it, i) {
        return '<div class="wh-item' + (it.correct ? '' : ' bad') + '">' +
          '<div class="wh-q">' + (i + 1) + '. ' + esc(it.prompt) + '</div>' +
          '<div class="wh-a">' + (it.correct ? '✔' : '✗') + ' Bạn trả lời: <b>' + (it.answer ? esc(it.answer) : '<i>(bỏ trống)</i>') + '</b></div>' +
          (!it.correct && it.correctAnswer ? '<div class="wh-k">Đáp án: <b>' + esc(it.correctAnswer) + '</b></div>' : '') +
          (it.explanation ? '<div class="wh-x">💡 ' + esc(it.explanation) + '</div>' : '') +
          '</div>';
      }).join('');
    }

    var isSpk = r.kind === 'speaking';
    if (isSpk && (r.speakingItems || []).length) {
      h += r.speakingItems.map(function (s, i) {
        return '<div class="wh-sub"><div class="wh-q">Câu ' + (i + 1) + ': ' + esc(s.prompt) + '</div>' +
          '<div class="wh-text">' + (s.transcript ? esc(s.transcript) : '<i>(không có lời thoại)</i>') + '</div>' +
          '<div class="wh-li" style="margin-top:6px"><b style="color:#0ea5e9">Band ' + num(s.band) + '</b>' + (s.feedbackVi ? ' — ' + esc(s.feedbackVi) : '') + '</div>' +
          corrections(s.corrections) + '</div>';
      }).join('');
    } else {
      if ((r.prompts || []).length) h += '<div class="wh-sec"><div class="wh-h">Câu hỏi</div>' + r.prompts.map(function (p) { return '<div class="wh-li">• ' + esc(p) + '</div>'; }).join('') + '</div>';
      var resp = (r.responses || []).filter(function (x) { return String(x || '').trim(); });
      h += '<div class="wh-sec"><div class="wh-h">' + (isSpk ? 'Lời thoại của bạn' : 'Bài viết của bạn') + '</div>' +
        (resp.length ? resp.map(function (t, i) {
          return (resp.length > 1 ? '<div class="wh-li" style="font-weight:700;margin-top:6px">Phần ' + (i + 1) + '</div>' : '') + '<div class="wh-text">' + esc(t) + '</div>';
        }).join('') : '<div class="wh-empty">(trống)</div>') + '</div>';
    }

    if (r.ai) {
      h += '<div class="wh-sec"><div class="wh-h">' + (isSpk ? 'AI chấm (trung bình)' : 'AI chấm') + '</div>' + scoreBars(r.ai.scores) + '</div>' +
        (r.ai.feedbackVi ? '<div class="wh-sec"><div class="wh-h">Nhận xét</div><div class="wh-li" style="white-space:pre-wrap">' + esc(r.ai.feedbackVi) + '</div></div>' : '') +
        (isSpk && (r.speakingItems || []).length ? '' : corrections(r.ai.corrections)) +
        bullets('Điểm mạnh', r.ai.strengths) + bullets('Cần cải thiện', r.ai.improvements);
      var used = r.ai.usedStructures || [], miss = r.ai.missingStructures || [];
      if (used.length || miss.length) {
        h += '<div class="wh-sec"><div class="wh-h">Cấu trúc mục tiêu</div>' +
          used.map(function (x) { return '<span class="wh-chip">✓ ' + esc(structText(x)) + '</span>'; }).join('') +
          miss.map(function (x) { return '<span class="wh-chip miss">✗ ' + esc(structText(x)) + '</span>'; }).join('') + '</div>';
      }
    } else if (r.local) {
      if (r.local.aiUnavailable) h += '<div class="wh-warn">Lúc nộp, AI chấm chi tiết đang bận — đây là điểm sơ bộ theo rubric.</div>';
      h += '<div class="wh-sec"><div class="wh-h">Chấm theo rubric</div>' +
        (r.local.feedbackVi ? '<div class="wh-li">' + esc(r.local.feedbackVi) + '</div>' : '') +
        (r.local.checklist || []).map(function (c) {
          var mark = c.ok === true ? '<span style="color:#16a34a">✔</span>' : c.ok === false ? '<span style="color:#dc2626">✗</span>' : '•';
          return '<div class="wh-li">' + mark + ' ' + esc(c.label) + (c.detail ? ' <span style="color:var(--text3,#9ca3af)">(' + esc(c.detail) + ')</span>' : '') + '</div>';
        }).join('') + '</div>';
    }
    if (r.sampleAnswer) {
      h += '<div class="wh-sec"><details class="wh-det"><summary>Xem bài mẫu</summary><div class="wh-text" style="margin-top:6px">' + esc(r.sampleAnswer) + '</div></details></div>';
    }
    return h;
  }

  window.WT1History = {
    init: function (o) { cfg.api = o.api; cfg.courseCode = o.courseCode || ''; },
    openCourse: openCourse,
    openExercise: openExercise,
    close: close,
  };
})();
