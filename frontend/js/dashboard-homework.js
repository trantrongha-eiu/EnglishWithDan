'use strict';
/* ══════════════════════════════════════════════
   📚 BÀI TẬP CẦN LÀM — homework the teacher assigned to this student's
   class(es). Data: GET /api/assignments/mine (backend
   controllers/assignment.controller.js → services/assignmentService.js).

   Internal resources show their real completion (auto, from the student's
   attempt history); external links + images have a manual "Đánh dấu hoàn
   thành" checkbox. Card is hidden entirely if the student is in no class;
   shows "Hiện tại không có bài tập nào." if enrolled but nothing assigned.

   Globals: API / authH() (dashboard.js), escHtml() (js/shared/utils.js),
   window.ApiClient.handleResponse.
══════════════════════════════════════════════ */

const HW_STATUS = {
  not_started: { label: 'Chưa làm', cls: 'hw-pill--todo' },
  in_progress: { label: 'Đang làm', cls: 'hw-pill--progress' },
  completed:   { label: 'Đã hoàn thành', cls: 'hw-pill--done' },
  overdue:     { label: 'Quá hạn', cls: 'hw-pill--overdue' },
};

// Per-type "how this one counts as done" tag + hint, shown on each resource
// row so a student doesn't have to remember the rule from the notice above —
// mirrors backend/services/resourceCompletionService.js's scoreGate (≥70%)
// vs wordCountGate (real minimum word count, not just "submitted") split.
// Types with neither (speaking, task1_lesson, mock_test, external/image) get
// no tag — "submitted/ticked = done" needs no extra explanation.
const HW_QUIZ_TYPES = new Set(['reading_test', 'listening_test', 'reading_practice', 'listening_practice', 'dictation', 'grammar', 'vocabulary_lesson', 'task2']);
const MIN_WORDS_T1 = 150, MIN_WORDS_T2 = 250; // matches backend's resourceCompletionService.MIN_WORDS
const HW_WORD_MIN = { task1_practice: MIN_WORDS_T1, task2_practice: MIN_WORDS_T2 };
function hwRuleTag(resourceType) {
  if (HW_QUIZ_TYPES.has(resourceType)) return '<span class="hw-res-tag hw-res-tag--quiz" title="Cần đạt từ 70% số điểm trở lên mới tính hoàn thành">≥70%</span>';
  if (resourceType === 'writing_exam') return `<span class="hw-res-tag hw-res-tag--writing" title="Cần nộp đủ Task 1 ≥${MIN_WORDS_T1} từ và Task 2 ≥${MIN_WORDS_T2} từ">≥${MIN_WORDS_T1}/${MIN_WORDS_T2} từ</span>`;
  if (HW_WORD_MIN[resourceType]) return `<span class="hw-res-tag hw-res-tag--writing" title="Cần nộp đủ ít nhất ${HW_WORD_MIN[resourceType]} từ mới tính hoàn thành">≥${HW_WORD_MIN[resourceType]} từ</span>`;
  return '';
}

// internal resourceType → best-effort deep link on the student site
function hwResourceHref(r) {
  const id = r.resourceId;
  switch (r.resourceType) {
    case 'reading_test':       return `reading.html?testId=${id}`;
    case 'reading_practice':   return `reading.html?passageId=${id}`;
    case 'listening_test':     return `listening.html?testId=${id}`;
    case 'listening_practice': return `listening.html?sectionId=${id}`;
    case 'dictation':          return `listening.html?sectionId=${id}&mode=dictation`;
    case 'writing_exam':       return 'writing.html';
    // WT1 lessons are looked up by `code` (re-seeding-safe), not the Mongo
    // _id in `id` above — resourceCode is the snapshot taken at assign time
    // (see backend/services/resourceCompletionService.js's deepLinkKeyFor).
    case 'task1_lesson':       return r.resourceCode ? `writing-task1.html?lesson=${encodeURIComponent(r.resourceCode)}` : null;
    case 'task1_practice':     return `writing.html?taskType=1&taskId=${id}`;
    case 'task2_practice':     return `writing.html?taskType=2&taskId=${id}`;
    case 'task2':              return 'task2-practice.html';
    case 'speaking':           return `speaking.html?questionId=${id}`;
    case 'grammar':            return 'essential-grammar.html';
    case 'vocabulary_lesson':  return `dashboard.html?view=lesson&lessonId=${id}`;
    case 'mock_test':          return 'dashboard.html';
    default:                   return null;
  }
}

function hwCountdown(deadline) {
  if (!deadline) return '';
  const ms = new Date(deadline) - Date.now();
  if (ms <= 0) return '<span class="hw-due hw-due--over">Đã quá hạn</span>';
  const h = Math.floor(ms / 3600000);
  if (h < 24) return `<span class="hw-due hw-due--soon">Còn ${h} giờ</span>`;
  const d = Math.floor(h / 24);
  return `<span class="hw-due">Còn ${d} ngày</span>`;
}

function hwFmtDeadline(deadline) {
  if (!deadline) return 'Không có hạn';
  const d = new Date(deadline);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function hwResourceRow(assignmentId, r) {
  const doneCls = r.completed ? 'hw-res--done' : '';
  const check = r.completed ? '☑' : '☐';
  let name = '';
  let action = '';
  if (r.kind === 'internal') {
    name = escHtml(r.label || r.resourceType);
    const href = hwResourceHref(r);
    action = href
      ? `<a class="hw-res-btn" href="${href}">${r.completed ? 'Xem lại' : 'Bắt đầu'}</a>`
      : '<span class="hw-res-na">(nội dung không còn khả dụng)</span>';
  } else if (r.kind === 'external') {
    name = escHtml(r.title || r.url);
    action = `<a class="hw-res-btn" href="${escHtml(r.url)}" target="_blank" rel="noopener">Mở link</a>`
      + hwManualToggle(assignmentId, r);
  } else if (r.kind === 'image') {
    name = escHtml(r.title || 'Bài tập hình ảnh');
    const thumbs = (r.images || []).map((im) => `<a href="${escHtml(im.url)}" target="_blank" rel="noopener"><img class="hw-res-thumb" src="${escHtml(im.url)}" alt=""></a>`).join('');
    action = thumbs + hwManualToggle(assignmentId, r);
  }
  const ruleTag = r.kind === 'internal' ? hwRuleTag(r.resourceType) : '';
  return `<div class="hw-res ${doneCls}">
    <span class="hw-res-check">${check}</span>
    <span class="hw-res-name">${name}${ruleTag}${r.description ? `<span class="hw-res-desc">${escHtml(r.description)}</span>` : ''}${r.instruction ? `<span class="hw-res-desc">${escHtml(r.instruction)}</span>` : ''}</span>
    <span class="hw-res-action">${action}</span>
  </div>`;
}

function hwManualToggle(assignmentId, r) {
  return `<label class="hw-manual">
    <input type="checkbox" ${r.completed ? 'checked' : ''}
      onchange="hwToggleItem('${assignmentId}','${r.itemId}',this.checked,this)">
    <span>Đánh dấu hoàn thành</span>
  </label>`;
}

function hwAssignmentBlock(a) {
  const st = HW_STATUS[a.status] || HW_STATUS.not_started;
  const pct = a.total ? Math.round((a.done / a.total) * 100) : 0;
  return `<div class="hw-item" data-id="${a._id}">
    <div class="hw-item-head">
      <div>
        <div class="hw-item-title">${escHtml(a.title)}</div>
        <div class="hw-item-sub">${escHtml(a.className)}${a.teacherName ? ` · ${escHtml(a.teacherName)}` : ''}</div>
      </div>
      <span class="hw-pill ${st.cls}">${st.label}</span>
    </div>
    ${a.instruction ? `<div class="hw-item-instruction">${escHtml(a.instruction)}</div>` : ''}
    <div class="hw-progress">
      <div class="hw-progress-bar"><div class="hw-progress-fill" style="width:${pct}%"></div></div>
      <span class="hw-progress-text">${a.done}/${a.total} hoàn thành</span>
    </div>
    <div class="hw-reslist">${a.resources.map((r) => hwResourceRow(a._id, r)).join('')}</div>
    <div class="hw-item-foot">
      <span class="hw-deadline">⏰ ${hwFmtDeadline(a.deadline)}</span>
      ${a.status !== 'completed' ? hwCountdown(a.deadline) : '<span class="hw-due hw-due--ok">✔ Đã xong</span>'}
    </div>
  </div>`;
}

async function loadHomework() {
  const card = document.getElementById('homework-card');
  if (!card) return;
  let data;
  try {
    const res = await fetch(`${API}/assignments/mine`, { headers: authH() });
    data = await window.ApiClient.handleResponse(res);
  } catch (err) {
    console.error('loadHomework:', err);
    return; // stay hidden on error
  }
  if (!data || !data.hasClasses) { card.style.display = 'none'; return; }

  card.style.display = 'block';
  const warn = data.homeworkWarning
    ? `<div class="hw-warn">⚠️ Bạn đang có <b>${data.homeworkWarning.missedCount} buổi</b> chưa hoàn thành đầy đủ bài tập${data.homeworkWarning.className ? ` ở lớp <b>${escHtml(data.homeworkWarning.className)}</b>` : ''}. Vui lòng hoàn thành homework đúng hạn để không bị tụt lại.</div>`
    : '';
  const rules = `<details class="hw-rules">
    <summary>ℹ️ Cách tính bài tập đã hoàn thành</summary>
    <ul>
      <li><span class="hw-res-tag hw-res-tag--quiz">≥70%</span> Bài trắc nghiệm/quiz: cần đạt <b>từ 70% số điểm trở lên</b> mới tính hoàn thành.</li>
      <li><span class="hw-res-tag hw-res-tag--writing">≥${MIN_WORDS_T1}/${MIN_WORDS_T2} từ</span> Bài viết (Writing): chỉ cần <b>nộp bài và viết đủ số từ tối thiểu</b> (Task 1 ≥${MIN_WORDS_T1} từ, Task 2 ≥${MIN_WORDS_T2} từ) là tính hoàn thành, không yêu cầu điểm.</li>
      <li>⚠️ Làm thiếu bài tập nhiều sẽ ảnh hưởng chuyên cần của lớp: bắt đầu <b>cảnh báo từ 5 bài</b> chưa hoàn thành đúng hạn, và <b>rớt khóa học</b> nếu thiếu tới <b>10 bài</b>.</li>
    </ul>
  </details>`;

  if (!data.assignments.length) {
    card.innerHTML = `<div class="hw-head"><h3>📚 Bài tập cần làm</h3></div>${warn}
      <div class="hw-empty">Hiện tại không có bài tập nào.</div>`;
    return;
  }
  card.innerHTML = `<div class="hw-head"><h3>📚 Bài tập cần làm</h3>
      <span class="hw-count">${data.assignments.filter((a) => a.status !== 'completed').length} chưa xong</span></div>
    ${rules}
    ${warn}
    <div class="hw-list">${data.assignments.map(hwAssignmentBlock).join('')}</div>`;
}

async function hwToggleItem(assignmentId, itemId, done, el) {
  el.disabled = true;
  try {
    const res = await fetch(`${API}/assignments/${assignmentId}/items/${itemId}/complete`, {
      method: 'POST', headers: { ...authH(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ done }),
    });
    await window.ApiClient.handleResponse(res);
    loadHomework(); // re-render (progress bar, status pill, ordering)
  } catch (err) {
    el.checked = !done;
    if (window.showToast) window.showToast(err.message || 'Không lưu được', 'error');
  } finally {
    el.disabled = false;
  }
}
window.hwToggleItem = hwToggleItem;
window.loadHomework = loadHomework;
