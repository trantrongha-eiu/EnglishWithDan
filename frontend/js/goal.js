// goal.html — Mục tiêu &amp; Kế hoạch học IELTS
const API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
function authH() { return { ...window.AuthService.authHeader(), 'Content-Type': 'application/json' }; }

const BANDS = []; // 4.0 .. 7.5 step 0.5
for (let b = 4.0; b <= 7.5 + 1e-9; b += 0.5) BANDS.push(Math.round(b * 10) / 10);
const DAY_LABEL = { mon: 'Thứ 2', tue: 'Thứ 3', wed: 'Thứ 4', thu: 'Thứ 5', fri: 'Thứ 6', sat: 'Thứ 7', sun: 'Chủ nhật' };
// Skill names stay as-is; only the non-skill categories get a VN label.
const CAT_LABEL = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking', vocabulary: 'Từ vựng', grammar: 'Ngữ pháp' };
const catLabel = (c) => CAT_LABEL[String(c || '').toLowerCase()] || c;
let selectedDays = new Set();

function populateBandSelects() {
  const currentSel = document.getElementById('f-current');
  const targetSel = document.getElementById('f-target');
  BANDS.forEach(b => {
    currentSel.insertAdjacentHTML('beforeend', `<option value="${b}">${b.toFixed(1)}</option>`);
    targetSel.insertAdjacentHTML('beforeend', `<option value="${b}">${b.toFixed(1)}</option>`);
  });
}

function toggleDay(el) {
  const day = el.dataset.day;
  if (selectedDays.has(day)) { selectedDays.delete(day); el.classList.remove('active'); }
  else { selectedDays.add(day); el.classList.add('active'); }
}

async function loadGoal() {
  try {
    const res = await fetch(`${API}/goals`, { headers: authH() });
    const data = await window.ApiClient.handleResponse(res);
    const g = data.goal || {}; // a "no goal yet" response may omit it entirely
    if (g.currentBand != null) document.getElementById('f-current').value = g.currentBand;
    if (g.targetBand != null) document.getElementById('f-target').value = g.targetBand;
    if (g.examDate) document.getElementById('f-exam').value = g.examDate.slice(0, 10);
    if (g.weeklyStudyMinutes != null) document.getElementById('f-weekly').value = g.weeklyStudyMinutes;
    if (g.preferredSessionMinutes != null) document.getElementById('f-session').value = g.preferredSessionMinutes;
    (g.studyDays || []).forEach(d => {
      selectedDays.add(d);
      document.querySelector(`.goal-day-chip[data-day="${d}"]`)?.classList.add('active');
    });
    renderSummary(g);
  } catch (e) {
    document.getElementById('goal-msg').textContent = 'Không thể tải mục tiêu.';
    document.getElementById('goal-msg').className = 'goal-msg error';
  }
}

function renderSummary(g) {
  const card = document.getElementById('summary-card');
  if (!g.hasGoal) { card.style.display = 'none'; return; }
  card.style.display = '';
  const stats = document.getElementById('summary-stats');
  const parts = [];
  parts.push(`<div class="goal-stat"><div class="goal-stat-val">${g.targetBand ?? '—'}</div><div class="goal-stat-label">Band mục tiêu</div></div>`);
  parts.push(`<div class="goal-stat"><div class="goal-stat-val">${g.currentBand ?? '—'}</div><div class="goal-stat-label">Hiện tại (${g.currentBandSource === 'self_assessed' ? 'tự đánh giá' : '—'})</div></div>`);
  if (g.gapBands != null) parts.push(`<div class="goal-stat"><div class="goal-stat-val">${g.gapBands >= 0 ? '+' : ''}${g.gapBands}</div><div class="goal-stat-label">Chênh lệch</div></div>`);
  if (g.daysRemaining != null) parts.push(`<div class="goal-stat"><div class="goal-stat-val">${g.isPastExamDate ? 'Đã qua' : g.daysRemaining}</div><div class="goal-stat-label">Ngày còn lại</div></div>`);
  if (g.weeklyStudyMinutes) parts.push(`<div class="goal-stat"><div class="goal-stat-val">${g.weeklyStudyMinutes}</div><div class="goal-stat-label">Phút/tuần</div></div>`);
  if (g.studyDays?.length) parts.push(`<div class="goal-stat"><div class="goal-stat-val">${g.studyDays.length}</div><div class="goal-stat-label">Ngày/tuần</div></div>`);
  stats.innerHTML = parts.join('');

  const feasEl = document.getElementById('summary-feasibility');
  if (g.feasibility) {
    feasEl.style.display = '';
    feasEl.className = `goal-feasibility ${g.feasibility.level}`;
    feasEl.textContent = g.feasibility.message;
  } else {
    feasEl.style.display = 'none';
  }
}

async function saveGoal() {
  const msgEl = document.getElementById('goal-msg');
  msgEl.textContent = ''; msgEl.className = 'goal-msg';
  const body = {
    currentBand: document.getElementById('f-current').value ? parseFloat(document.getElementById('f-current').value) : null,
    targetBand: document.getElementById('f-target').value ? parseFloat(document.getElementById('f-target').value) : null,
    examDate: document.getElementById('f-exam').value || null,
    weeklyStudyMinutes: document.getElementById('f-weekly').value ? parseInt(document.getElementById('f-weekly').value, 10) : null,
    preferredSessionMinutes: document.getElementById('f-session').value ? parseInt(document.getElementById('f-session').value, 10) : null,
    studyDays: [...selectedDays],
  };
  // A plan can't be built without a target band — flag it here rather than
  // letting the save "succeed" into an empty plan.
  if (body.targetBand == null) {
    msgEl.textContent = 'Hãy chọn band mục tiêu để Dan lập kế hoạch cho bạn.';
    msgEl.className = 'goal-msg error';
    return;
  }
  const btn = document.getElementById('goal-save-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Đang lưu…'; }
  try {
    const res = await fetch(`${API}/goals`, { method: 'PUT', headers: authH(), body: JSON.stringify(body) });
    const data = await window.ApiClient.handleResponse(res);
    msgEl.textContent = 'Đã lưu!'; msgEl.className = 'goal-msg ok';
    renderSummary(data.goal || {});
    loadPlan();
    loadTodayLearning();
  } catch (e) {
    msgEl.textContent = e.message || 'Không thể lưu mục tiêu.';
    msgEl.className = 'goal-msg error';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Lưu mục tiêu'; }
  }
}

async function loadPlan() {
  const el = document.getElementById('plan-content');
  el.className = 'goal-loading'; el.textContent = 'Đang tải…';
  try {
    const res = await fetch(`${API}/study-plan/current`, { headers: authH() });
    const plan = await window.ApiClient.handleResponse(res);
    if (!plan.hasPlan) {
      el.className = 'plan-empty';
      el.textContent = plan.message || 'Thiết lập mục tiêu ở trên để tạo kế hoạch.';
      return;
    }
    el.className = '';
    const maxMin = Math.max(...plan.allocation.map(a => a.minutes));
    const allocHtml = plan.allocation.map(a => `
      <div class="plan-alloc-row">
        <div>${catLabel(a.category)}</div>
        <div class="plan-alloc-bar-wrap"><div class="plan-alloc-bar" style="width:${maxMin ? Math.round(a.minutes / maxMin * 100) : 0}%"></div></div>
        <div class="plan-alloc-min">${a.minutes}p</div>
      </div>`).join('');

    const sessionsHtml = plan.sessions.map(s => `
      <div class="plan-day">
        <div class="plan-day-head">
          <span class="plan-day-title">${DAY_LABEL[s.day] || s.day} · ${s.date}</span>
          <span class="plan-day-total">${s.totalMinutes} phút</span>
        </div>
        ${s.items.map(i => `
          <div class="plan-item">
            <div class="plan-item-cat">${catLabel(i.category)}</div>
            <div class="plan-item-reason">${escapeHtml(i.reason)}</div>
            <div class="plan-item-min">${i.minutes} phút</div>
          </div>`).join('')}
      </div>`).join('');

    el.innerHTML = `
      <div class="plan-week">Tuần ${plan.weekStart} → ${plan.weekEnd} · Tổng ${plan.totalMinutes} phút</div>
      <div class="plan-alloc">${allocHtml}</div>
      ${sessionsHtml}
    `;
  } catch (e) {
    el.className = 'plan-empty';
    el.textContent = 'Không thể tải kế hoạch học.';
  }
}

function escapeHtml(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

async function loadTodayLearning() {
  const el = document.getElementById('today-content');
  el.className = 'goal-loading'; el.textContent = 'Đang tải…';
  try {
    const res = await fetch(`${API}/learning/today`, { headers: authH() });
    const today = await window.ApiClient.handleResponse(res);

    if (!today.hasGoal) {
      el.className = 'today-empty';
      el.innerHTML = `${escapeHtml(today.message)} <a href="#f-target">Đặt mục tiêu bên dưới ↓</a>`;
      return;
    }
    if (!today.hasPlan || !today.isStudyDay || !today.sessions.length) {
      el.className = 'today-empty';
      el.textContent = today.message || 'Hôm nay chưa có lịch học nào.';
      return;
    }

    el.className = '';
    const sessionsHtml = today.sessions.map(s => `
      <div class="today-session">
        <div class="today-session-head">
          <span class="today-session-cat">${escapeHtml(catLabel(s.category))}</span>
          <span class="today-session-min">${s.minutes} phút</span>
        </div>
        <div class="today-session-reason">${escapeHtml(s.reason)}</div>
        <a class="today-start-btn" href="${escapeHtml(s.practiceUrl)}"><i class="fas fa-play"></i> ${escapeHtml(s.action)}</a>
      </div>`).join('');
    el.innerHTML = `<div class="today-total">${today.totalMinutes} phút hôm nay</div><div class="today-sessions">${sessionsHtml}</div>`;
  } catch (e) {
    el.className = 'today-empty';
    el.textContent = 'Không thể tải nội dung học hôm nay.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!window.AuthService?.getUser?.()) { window.location.href = 'login.html'; return; }
  populateBandSelects();
  // No point picking an exam date in the past.
  document.getElementById('f-exam').min = new Date().toISOString().slice(0, 10);
  document.querySelectorAll('.goal-day-chip').forEach(el => el.addEventListener('click', () => toggleDay(el)));
  loadGoal();
  loadPlan();
  loadTodayLearning();
});
