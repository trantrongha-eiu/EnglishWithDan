'use strict';
/* ══════════════════════════════════════════════
   🎤 ĐĂNG KÍ THI SPEAKING — block for a class (shown in "Lớp học của tôi" on
   the dashboard, js/dashboard-classinfo.js, and in the "Thi Speaking" tab of
   classroom.html). The teacher opens free time on the class page (admin
   "🎤 Thi Speaking" tab); each slot is 25 minutes = 15' thi + 10' feedback.
   The student picks a day → a time → online (Google Meet) / offline (tại nhà
   giáo viên), and can swap to another open slot in one step.

   API (backend/controllers/speakingExam.controller.js):
     GET  /api/classes/my/speaking-exam
     POST /api/classes/my/speaking-exam/:slotId/book   { mode, replaceBooking? }
     POST /api/classes/my/speaking-exam/:slotId/cancel

   Globals: API / authH() (dashboard.js or classroom.js), escHtml()
   (js/shared/utils.js), confirm2() (js/shared/confirm-dialog.js),
   window.ApiClient, showToast, loadClassInfo() (re-render after a change).
══════════════════════════════════════════════ */

const SE_WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const SE_MODE = {
  online: { icon: '💻', label: 'Online qua Google Meet' },
  offline: { icon: '🏠', label: 'Offline tại nhà giáo viên' },
};
const SE_PARTS = [['Sáng', 0, 12], ['Chiều', 12, 18], ['Tối', 18, 24]];
let seData = null; // last GET /my/speaking-exam payload

function seDayLabel(key) {
  const d = new Date(`${key}T00:00:00Z`);
  return `${SE_WD[d.getUTCDay()]}, ${key.slice(8, 10)}/${key.slice(5, 7)}`;
}

// "hôm nay" / "ngày mai" / "còn 3 ngày" on the Vietnam calendar ('' if past).
function seRelDay(key) {
  const today = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
  const n = Math.round((Date.parse(`${key}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 864e5);
  if (n < 0) return '';
  return n === 0 ? 'hôm nay' : n === 1 ? 'ngày mai' : `còn ${n} ngày`;
}

// Called by loadClassInfo() / classroom.js — best-effort: on error the class
// simply renders without the speaking block.
async function seFetch() {
  try {
    const res = await fetch(`${API}/classes/my/speaking-exam`, { headers: authH() });
    seData = await window.ApiClient.handleResponse(res);
  } catch (err) {
    console.error('seFetch:', err);
    seData = null;
  }
  return seData;
}
window.seFetch = seFetch;

function seClass(classId) {
  if (!seData || !Array.isArray(seData.classes)) return null;
  return seData.classes.find((x) => String(x.classId) === String(classId)) || null;
}
window.seClassFor = seClass;

function seSafeUrl(u) {
  return /^https?:\/\//i.test(u || '') ? u : '';
}

function seFeedback(h) {
  return h.feedbackNote
    ? `<details class="se-fb"><summary>Xem feedback của giáo viên</summary><div>${escHtml(h.feedbackNote).replace(/\n/g, '<br>')}</div></details>`
    : '';
}

function seResultLine(h) {
  if (!h) return '';
  if (h.result === 'no_show') {
    return `<div class="se-result se-result--miss">Buổi thi ${seDayLabel(h.dayKey)}: <b>vắng thi</b>.</div>`;
  }
  if (h.result !== 'done') return '';
  return `<div class="se-result">✅ Đã thi ${seDayLabel(h.dayKey)}${h.band != null ? ` · Band <b>${h.band}</b>` : ''}${seFeedback(h)}</div>`;
}

// HTML for one class (classId from /my/overview). '' when the teacher has
// opened nothing and the student has no booking/result in this class.
function seBlockFor(classId) {
  const c = seClass(classId);
  if (!c) return '';
  const last = (c.history || [])[0];
  const mins = `${seData.examMinutes || 15}' thi + ${seData.feedbackMinutes || 10}' feedback`;
  const n = (c.openSlots || []).length;
  const b = c.booking;
  if (b) {
    const m = SE_MODE[b.mode] || {};
    const meet = seSafeUrl(b.meetLink);
    const rel = seRelDay(b.dayKey);
    const where = b.mode === 'online'
      ? (meet ? `<a class="se-link" href="${escHtml(meet)}" target="_blank" rel="noopener noreferrer"><i class="fas fa-video" aria-hidden="true"></i> Vào Google Meet</a>` : '<span class="se-muted">Giáo viên sẽ gửi link Meet sau.</span>')
      : (b.address ? `<span class="se-addr"><i class="fas fa-location-dot" aria-hidden="true"></i> ${escHtml(b.address)}</span>` : '');
    const actions = b.canCancel
      ? `${n ? `<button type="button" class="se-btn" onclick="seOpenPicker('${c.classId}', true)">Đổi buổi</button>` : ''}
         <button type="button" class="se-btn se-btn--ghost" onclick="seCancel('${b._id}', this)">Hủy buổi</button>`
      : `<span class="se-muted">Muốn đổi/hủy trong ${seData.lockHours || 2} tiếng trước giờ thi — hãy nhắn giáo viên.</span>`;
    return `<div class="se-block se-block--booked">
      <div class="se-head">🎤 Lịch thi Speaking của bạn${rel ? ` <span class="se-rel">${rel}</span>` : ''}</div>
      <div class="se-when"><b>${seDayLabel(b.dayKey)}</b> · <b>${b.startTime}–${b.endTime}</b> <span class="se-muted">(${mins})</span></div>
      <div class="se-mode">${m.icon || ''} ${m.label || ''}</div>
      ${where ? `<div class="se-where">${where}</div>` : ''}
      ${b.note ? `<div class="se-note">📝 ${escHtml(b.note)}</div>` : ''}
      <div class="se-actions">${actions}</div>
    </div>`;
  }
  if (!n && !last) return '';
  return `<div class="se-block">
    <div class="se-row">
      <div>
        <div class="se-head">🎤 Thi Speaking 1-1 với giáo viên</div>
        <div class="se-sub">${mins} · ${n ? `còn <b>${n}</b> buổi trống` : 'chưa có buổi trống'}</div>
      </div>
      ${n ? `<button type="button" class="se-btn" onclick="seOpenPicker('${c.classId}')">Đăng kí thi</button>` : ''}
    </div>
    ${seResultLine(last)}
  </div>`;
}
window.seBlockFor = seBlockFor;

// Past exams of a class, newest first (classroom.html "Thi Speaking" tab).
function seHistoryFor(classId) {
  const c = seClass(classId);
  const list = (c && c.history) || [];
  if (!list.length) return '';
  return `<div class="se-hist">${list.map((h) => {
    const badge = h.result === 'done'
      ? `<span class="se-hist-tag se-hist-tag--done">Đã thi${h.band != null ? ` · Band ${h.band}` : ''}</span>`
      : h.result === 'no_show'
        ? '<span class="se-hist-tag se-hist-tag--miss">Vắng thi</span>'
        : '<span class="se-hist-tag">Chờ giáo viên ghi kết quả</span>';
    return `<div class="se-hist-row">
      <div class="se-hist-head"><span><b>${seDayLabel(h.dayKey)}</b> · ${h.startTime}–${h.endTime}</span>${badge}</div>
      ${seFeedback(h)}
    </div>`;
  }).join('')}</div>`;
}
window.seHistoryFor = seHistoryFor;

// ── Picker modal: ① ngày → ② giờ → ③ hình thức ──────────────────────────
function seDayPanel(d) {
  const parts = SE_PARTS.map(([label, from, to]) => {
    const items = d.items.filter((s) => { const h = Number(s.startTime.slice(0, 2)); return h >= from && h < to; });
    if (!items.length) return '';
    return `<div class="se-part">
      <div class="se-day-title">${label}</div>
      <div class="se-slots">${items.map((s) => `<label class="se-slot">
          <input type="radio" name="se-slot" value="${s._id}" data-modes="${s.modes.join(',')}">
          <span>${s.startTime}–${s.endTime}</span>
        </label>`).join('')}</div>
    </div>`;
  }).join('');
  return `<div class="se-day" data-day="${d.dayKey}" hidden>${parts}</div>`;
}

// change = true → swap the current booking for the slot picked here.
function seOpenPicker(classId, change) {
  const c = seClass(classId);
  if (!c || !c.openSlots.length) return;
  if (document.getElementById('se-modal')) return;
  const swapping = !!(change && c.booking);

  const days = [];
  c.openSlots.forEach((s) => {
    const last = days[days.length - 1];
    if (last && last.dayKey === s.dayKey) last.items.push(s);
    else days.push({ dayKey: s.dayKey, items: [s] });
  });
  const chips = days.map((d) => {
    const [wd, date] = seDayLabel(d.dayKey).split(', ');
    return `<button type="button" class="se-daychip" data-day="${d.dayKey}" aria-pressed="false">
      <b>${wd}</b><span>${date}</span><small>${d.items.length} buổi</small>
    </button>`;
  }).join('');
  const submitLabel = swapping ? 'Xác nhận đổi buổi' : 'Xác nhận đăng kí';

  const modal = document.createElement('div');
  modal.id = 'se-modal';
  modal.className = 'ci-warn-overlay';
  modal.innerHTML = `<div class="ci-warn-box se-box" role="dialog" aria-modal="true" aria-labelledby="se-title">
    <div class="ci-warn-title" id="se-title">🎤 ${swapping ? 'Đổi buổi thi Speaking' : 'Đăng kí thi Speaking'}</div>
    <div class="se-intro">${escHtml(c.className)}${c.teacherName ? ` · GV ${escHtml(c.teacherName)}` : ''}<br>
      Mỗi buổi ${seData.slotMinutes || 25} phút: <b>${seData.examMinutes || 15}' thi</b> + <b>${seData.feedbackMinutes || 10}' nhận feedback</b>.</div>
    ${swapping ? `<div class="se-current">Buổi hiện tại: <b>${seDayLabel(c.booking.dayKey)} · ${c.booking.startTime}–${c.booking.endTime}</b>. Buổi này vẫn giữ nguyên cho tới khi đổi thành công.</div>` : ''}
    <div class="se-step">1. Chọn ngày</div>
    <div class="se-daychips">${chips}</div>
    <div class="se-step">2. Chọn giờ</div>
    <div class="se-days">${days.map(seDayPanel).join('')}</div>
    <div class="se-mode-pick" hidden>
      <div class="se-step">3. Chọn hình thức thi</div>
      <div class="se-modes"></div>
    </div>
    <div class="se-slot-note se-muted" hidden></div>
    <div class="se-summary" hidden></div>
    <div class="ci-warn-actions">
      <button type="button" class="ci-warn-btn ci-warn-btn--ghost" data-close>Đóng</button>
      <button type="button" class="ci-warn-btn se-submit" disabled>${submitLabel}</button>
    </div>
  </div>`;

  const modesBox = modal.querySelector('.se-modes');
  const modeWrap = modal.querySelector('.se-mode-pick');
  const noteBox = modal.querySelector('.se-slot-note');
  const summary = modal.querySelector('.se-summary');
  const submit = modal.querySelector('.se-submit');
  const picked = () => {
    const slot = modal.querySelector('input[name="se-slot"]:checked');
    const mode = modal.querySelector('input[name="se-mode"]:checked');
    return { slot: slot && slot.value, mode: mode && mode.value };
  };
  const refresh = () => {
    const p = picked();
    submit.disabled = !(p.slot && p.mode);
    const s = p.slot && c.openSlots.find((x) => x._id === p.slot);
    summary.hidden = !(s && p.mode);
    summary.innerHTML = s && p.mode
      ? `✅ <b>${seDayLabel(s.dayKey)}</b> · <b>${s.startTime}–${s.endTime}</b> · ${SE_MODE[p.mode].icon} ${SE_MODE[p.mode].label}`
      : '';
  };
  const showDay = (key) => {
    modal.querySelectorAll('.se-daychip').forEach((b) => {
      const on = b.getAttribute('data-day') === key;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    modal.querySelectorAll('.se-day').forEach((p) => { p.hidden = p.getAttribute('data-day') !== key; });
  };
  showDay(days[0].dayKey);

  modal.addEventListener('change', (e) => {
    if (e.target.name === 'se-slot') {
      const prev = picked().mode || (swapping ? c.booking.mode : null);
      const allowed = (e.target.getAttribute('data-modes') || '').split(',').filter(Boolean);
      modesBox.innerHTML = allowed.map((m) => `<label class="se-mode-opt">
          <input type="radio" name="se-mode" value="${m}"${allowed.length === 1 || m === prev ? ' checked' : ''}>
          <span>${SE_MODE[m].icon} ${SE_MODE[m].label}</span>
        </label>`).join('');
      modeWrap.hidden = false;
      const slot = c.openSlots.find((s) => s._id === e.target.value);
      noteBox.hidden = !(slot && slot.note);
      noteBox.textContent = slot && slot.note ? `📝 ${slot.note}` : '';
    }
    refresh();
  });

  function close() {
    modal.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  modal.addEventListener('click', (e) => {
    const chip = e.target.closest('.se-daychip');
    if (chip) { showDay(chip.getAttribute('data-day')); return; }
    if (e.target === modal || e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', onKey);

  submit.addEventListener('click', async () => {
    const p = picked();
    if (!p.slot || !p.mode) return;
    submit.disabled = true;
    submit.textContent = swapping ? 'Đang đổi…' : 'Đang đăng kí…';
    try {
      const res = await fetch(`${API}/classes/my/speaking-exam/${p.slot}/book`, {
        method: 'POST',
        headers: { ...authH(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: p.mode, ...(swapping ? { replaceBooking: true } : {}) }),
      });
      await window.ApiClient.handleResponse(res);
      close();
      if (window.showToast) window.showToast(swapping ? 'Đã đổi buổi thi Speaking!' : 'Đã đăng kí thi Speaking!', 'success');
      if (window.loadClassInfo) window.loadClassInfo();
    } catch (err) {
      if (window.showToast) window.showToast(err.message || 'Không đăng kí được', 'error');
      submit.textContent = submitLabel;
      refresh();
      // Slot probably got taken by a classmate — refresh the list behind.
      if (window.loadClassInfo) window.loadClassInfo();
    }
  });

  document.body.appendChild(modal);
  const first = modal.querySelector('.se-daychip');
  if (first) first.focus();
}
window.seOpenPicker = seOpenPicker;

function seCancel(slotId, btn) {
  const run = async () => {
    if (btn) btn.disabled = true;
    try {
      const res = await fetch(`${API}/classes/my/speaking-exam/${slotId}/cancel`, { method: 'POST', headers: authH() });
      await window.ApiClient.handleResponse(res);
      if (window.showToast) window.showToast('Đã hủy buổi thi — bạn có thể chọn buổi khác.', 'success');
      if (window.loadClassInfo) window.loadClassInfo();
    } catch (err) {
      if (window.showToast) window.showToast(err.message || 'Không hủy được', 'error');
      if (btn) btn.disabled = false;
    }
  };
  if (typeof window.confirm2 === 'function') window.confirm2('Hủy buổi thi Speaking?', 'Buổi này sẽ mở lại cho bạn khác. Bạn có thể chọn buổi khác ngay sau đó.', run);
  else run();
}
window.seCancel = seCancel;
