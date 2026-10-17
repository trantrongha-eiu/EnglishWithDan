// task1-practice.html — IELTS Task 1 Practice
// ════════════════════════════════════════════════════════
//  CONFIG
// ════════════════════════════════════════════════════════
const API = (window.AuthService && window.AuthService.API && window.AuthService.API.replace(/\/api\/?$/, '')) || 'https://englishwithdan.onrender.com';

// Delegates to js/shared/api-client.js so a 401 (expired session mid-test)
// triggers the same logout+redirect-to-login as reading/writing/speaking,
// instead of surfacing as a generic error forever (student UI audit, 2026-07-25).
async function safeJson(res) {
  return window.ApiClient.handleResponse(res);
}

// Sound effects (playOk/playWrong) and the on/off toggle now live in the
// shared js/shared/sound-effects.js, used via the global nav button.
document.addEventListener('DOMContentLoaded', () => {
  // #wp-main is a stable container across every state/mode (welcome, exercise,
  // test, done) — one registration here covers all of them via bubbling.
  // Gated by _t1DictGate so double-click lookup is disabled during an active
  // "Chế độ Thi thử" test session — the page promises no hints during a
  // timed test, but the dictionary previously had no gate at all here
  // (student UI audit, 2026-07-25).
  setupDictionaryDouble('wp-main', 'task1-practice', _t1DictGate);
});

// Blocks dictionary lookup only while the timed test screen is actually
// showing — #test-in-progress starts as display:none in markup and is only
// ever un-hidden by startTest()/shown between submitTest()/retakeTest()/
// stopTestMode() resetting it back, so this reflects "test in progress"
// without needing separate state tracking.
function _t1DictGate() {
  if (currentMode !== 'test') return true;
  const el = document.getElementById('test-in-progress');
  return !el || el.style.display === 'none';
}

// "tra câu" sentence-lookup icon (js/shared/sentence-lookup.js) — same
// live-test condition as _t1DictGate above, just inverted (true = block).
window.__ewsExamActive = () => !_t1DictGate();

// showToast() moved to js/shared/toast.js (single source of truth — Phase 3 audit).

// ════════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════════
let currentMode  = 'practice';
let exercises    = [];
let currentIdx   = 0;
let currentSkill = 'all';
let sessionDone  = 0;
let sessionXP    = 0;
let sessionCorrect = 0;
let sessionAttempts = [];
let comboStreak  = 0;
let _isSubmitting = false;
let _skippedIds  = new Set();
let autoNext     = localStorage.getItem('t1_autonext') === 'on';
let shuffleMode  = localStorage.getItem('t1_shuffle') === 'on';
let _t1PracticeState = 'welcome';
let _autoNextTimer = null;
let _vocabHintCount = 0;
let _vocabHintList  = [];

function revealVocabHint() {
  const maxHints = Math.min(3, _vocabHintList.length);
  if (_vocabHintCount >= maxHints) return;
  _vocabHintCount++;
  const row = document.getElementById('hints-row');
  if (!row) return;
  row.innerHTML = '';
  const lbl = document.createElement('span');
  lbl.className = 't1-hint-label'; lbl.textContent = '🍊 Lulu gợi ý:';
  row.appendChild(lbl);
  _vocabHintList.slice(0, _vocabHintCount).forEach(h => {
    const chip = document.createElement('span');
    chip.className = 't1-hint-chip'; chip.textContent = h;
    row.appendChild(chip);
  });
  const btn = document.getElementById('vocab-hint-btn');
  const countEl = document.getElementById('vocab-hint-count');
  if (countEl) countEl.textContent = `${_vocabHintCount}/${maxHints}`;
  if (btn) btn.disabled = _vocabHintCount >= maxHints;
  if (window.AskLulu) window.AskLulu.say(btn, `Thử dùng “${_vocabHintList[_vocabHintCount - 1]}” xem sao nè 🍊`);
}

// rearrange
let rearrangeWords  = [];
let rearrangeAnswer = [];

// retry-wrong support
let _originalExercises = null;
let _wrongAttemptCache = []; // lưu wrong attempts trước khi saveBatch() xóa sessionAttempts

// test
let testLevel     = 'beginner';
let testCount     = 10;
let testExercises = [];
let testAnswers   = [];
let testIdx       = 0;
let testRearrangeAnswer = [];
let testTimerInterval = null;
let testTimeLeft      = 0;
let testTotalTime     = 0;

const TYPE_LABELS = {
  fill_blank:'✏️ Điền chỗ trống', translation:'🔄 Dịch câu',
  rearrange:'🔀 Sắp xếp từ', multiple_choice:'☑️ Trắc nghiệm',
  error_correction:'🔧 Sửa lỗi', paraphrase_choose:'🔁 Paraphrase',
  data_transform:'✏️ Viết lại câu'
};

const SKILL_LABELS = {
  noun_phrase:'Noun Phrase', data_description:'Mô tả Data',
  comparison:'So sánh', trend_language:'Xu hướng',
  paraphrase:'Paraphrase', overview:'Overview', introduction:'Introduction'
};

// ── Per-skill completion tracking (bestScore/latestScore/completed/completedAt) ──
// Shared model with essential-grammar.html/task2-practice.html/task2-template.html/
// writing-practice.html. A skill "completes" when a practice session ending with
// that skill selected (currentSkill !== 'all') scores >=80% accuracy.
const SKILL_SCORE_KEY = 't1_skill_scores';
const SKILL_COMPLETE_THRESHOLD = 80;
let _skillScores = _safeParse(localStorage.getItem(SKILL_SCORE_KEY), {});

function isSkillCompleted(skill) { const s = _skillScores[skill]; return !!(s && s.completed); }

function saveSkillScore(skill, score) {
  const prev = _skillScores[skill] || { bestScore: 0, latestScore: 0, completed: false, completedAt: null };
  const bestScore = Math.max(prev.bestScore, score);
  const completed = bestScore >= SKILL_COMPLETE_THRESHOLD;
  const completedAt = (completed && !prev.completed) ? new Date().toISOString() : prev.completedAt;
  _skillScores[skill] = { bestScore, latestScore: score, completed, completedAt };
  localStorage.setItem(SKILL_SCORE_KEY, JSON.stringify(_skillScores));
}

function skillCompletedCount() {
  return Object.keys(SKILL_LABELS).filter(isSkillCompleted).length;
}

function updateSkillTabChecks() {
  document.querySelectorAll('.t1-skill-tab[data-skill]').forEach(btn => {
    const skill = btn.dataset.skill;
    let icon = btn.querySelector('.wp-item-done-icon');
    let redoPill = btn.querySelector('.t1-skill-redo-pill');
    if (skill !== 'all' && isSkillCompleted(skill)) {
      if (!icon) {
        icon = document.createElement('i');
        icon.className = 'fas fa-check-circle wp-item-done-icon';
        icon.title = 'Đã hoàn thành (≥80%)';
        btn.appendChild(icon);
      }
      if (!redoPill) {
        redoPill = document.createElement('span');
        redoPill.className = 't1-skill-redo-pill';
        redoPill.title = 'Bấm để luyện lại kỹ năng này';
        redoPill.innerHTML = '<i class="fas fa-redo" style="font-size:8px"></i> Làm lại';
        btn.appendChild(redoPill);
      }
    } else {
      if (icon) icon.remove();
      if (redoPill) redoPill.remove();
    }
  });
}

function doneSkillStatusHtml() {
  if (currentSkill === 'all') return '';
  const s = _skillScores[currentSkill];
  let html = '';
  if (s && s.completed) html += '<span class="wp-status-badge wp-status-done"><i class="fas fa-check-circle"></i> Đã hoàn thành</span>';
  if (s) html += '<span class="wp-status-badge wp-status-best"><i class="fas fa-star"></i> Điểm cao nhất: ' + s.bestScore + '%</span>';
  html += '<span class="wp-status-badge"><i class="fas fa-chart-line"></i> Tiến trình: ' + skillCompletedCount() + '/' + Object.keys(SKILL_LABELS).length + ' kỹ năng</span>';
  return html;
}

// ════════════════════════════════════════════════════════
//  SHAREABLE URL
// ════════════════════════════════════════════════════════
function _syncShareUrl(push = false) {
  const params = `skill=${currentSkill}&mode=${currentMode}`;
  const url = `task1-practice.html?${params}`;
  if (push) history.pushState(null, '', url);
  else history.replaceState(null, '', url);
}

// Reads skill/mode off the URL and applies them — shared by the initial
// page load and the popstate handler below (selectSkill/_doSetMode now
// push a new history entry per change via _syncShareUrl(true), so browser
// back/forward needs to be able to re-derive and re-apply the same state).
function _applyT1UrlFilters() {
  const _t1p = new URLSearchParams(location.search);
  const _t1Skill = _t1p.get('skill');
  const _t1Mode  = _t1p.get('mode');
  const _validT1Skills = ['all','noun_phrase','data_description','comparison','trend_language','paraphrase','overview','introduction'];
  if (_validT1Skills.includes(_t1Skill)) {
    currentSkill = _t1Skill;
    document.querySelectorAll('.t1-skill-tab[data-skill]').forEach(b =>
      b.classList.toggle('active', b.dataset.skill === currentSkill));
  }
  _doSetMode(_t1Mode === 'test' ? 'test' : 'practice');
}

window.addEventListener('popstate', () => {
  // Mirrors selectSkill/_doSetMode's own confirm-gated changes — a
  // popstate has already changed the URL/browser state by the time this
  // fires, so there's no confirm-before-navigating gate possible here;
  // save progress instead of losing it.
  stopTestTimer();
  saveBatch();
  _applyT1UrlFilters();
  if (currentMode === 'practice') loadExercises();
});

function copyShareUrl() {
  const url = location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => showToast('Đã sao chép link chia sẻ! 🔗', 'info', 2500)).catch(_copyFallback);
  } else { _copyFallback(); }
  function _copyFallback() {
    const el = document.createElement('textarea');
    el.value = url; el.style.position = 'fixed'; el.style.opacity = '0';
    document.body.appendChild(el); el.select();
    try { document.execCommand('copy'); showToast('Đã sao chép link chia sẻ! 🔗', 'info', 2500); } catch { showToast('Không sao chép được, hãy copy thủ công.', 'warn'); }
    document.body.removeChild(el);
  }
}

// ════════════════════════════════════════════════════════
//  QUIT MODAL
// ════════════════════════════════════════════════════════
let _quitCb = null;
function askWpQuit(cb, opts = {}) {
  _quitCb = cb;
  document.getElementById('quit-title').textContent = opts.title || 'Dừng luyện tập?';
  document.getElementById('quit-sub').textContent   = opts.sub   || '';
  document.getElementById('quit-continue-btn').innerHTML = '<i class="fas fa-arrow-left"></i> ' + (opts.continueText || 'Tiếp tục học');
  document.getElementById('quit-leave-btn').innerHTML    = '<i class="fas fa-sign-out-alt"></i> ' + (opts.confirmText || 'Dừng lại');
  document.getElementById('wp-quit-overlay').classList.remove('hidden');
}
document.getElementById('quit-continue-btn').onclick = () => {
  document.getElementById('wp-quit-overlay').classList.add('hidden');
};
document.getElementById('quit-leave-btn').onclick = () => {
  document.getElementById('wp-quit-overlay').classList.add('hidden');
  if (_quitCb) { _quitCb(); _quitCb = null; }
};

// ════════════════════════════════════════════════════════
//  XP FLOAT
// ════════════════════════════════════════════════════════
function floatXP(amount) {
  const anchor = document.getElementById('header-xp');
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'wp-xp-float';
  el.textContent = '+' + amount + ' XP ⭐';
  el.style.left = rect.left + 'px';
  el.style.top  = rect.top  + 'px';
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// ════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════
function setAutoNext(val) {
  autoNext = val;
  localStorage.setItem('t1_autonext', val ? 'on' : 'off');
  document.getElementById('toggle-autonext').checked       = val;
  document.getElementById('sheet-toggle-autonext').checked = val;
}

function setShuffleMode(val) {
  shuffleMode = val;
  localStorage.setItem('t1_shuffle', val ? 'on' : 'off');
  document.getElementById('toggle-shuffle').checked       = val;
  document.getElementById('sheet-toggle-shuffle').checked = val;
}

document.addEventListener('DOMContentLoaded', () => {
  loadXPFromStorage();
  loadMeta();
  showState('welcome');
  updateSkillTabChecks();

  // Read URL params to pre-configure filters (shareable links)
  _applyT1UrlFilters();

  // Restore toggle states
  document.getElementById('toggle-autonext').checked       = autoNext;
  document.getElementById('sheet-toggle-autonext').checked = autoNext;
  document.getElementById('toggle-shuffle').checked        = shuffleMode;
  document.getElementById('sheet-toggle-shuffle').checked  = shuffleMode;
  window.addEventListener('beforeunload', () => saveBatch());
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    const quitOpen = !document.getElementById('wp-quit-overlay').classList.contains('hidden');
    if (quitOpen) return;
    const fc = document.getElementById('feedback-card');
    if (fc && !fc.classList.contains('hidden')) { e.preventDefault(); nextExercise(); }
  });
});

function loadXPFromStorage() {
  const stored = _safeParse(localStorage.getItem('t1_progress'), { xp: 0, lastDate: "" });
  const today  = new Date().toISOString().slice(0, 10);
  if (stored.lastDate !== today) {
    stored.lastDate = today;
    localStorage.setItem('t1_progress', JSON.stringify(stored));
  }
  document.getElementById('header-xp').textContent     = stored.xp || 0;
  document.getElementById('header-streak').textContent = 0; // combo streak bắt đầu từ 0
}

function updateXPStorage(earned) {
  const stored = _safeParse(localStorage.getItem('t1_progress'), { xp: 0, lastDate: "" });
  stored.xp = (stored.xp || 0) + earned;
  localStorage.setItem('t1_progress', JSON.stringify(stored));
  document.getElementById('header-xp').textContent = stored.xp;
  document.getElementById('header-streak').textContent = comboStreak;
}

function showState(state) {
  _t1PracticeState = state;
  ['welcome','loading','empty','exercise','done'].forEach(s =>
    document.getElementById('state-' + s)?.classList.toggle('hidden', s !== state));
  const widget = document.getElementById('t1-stats-widget');
  if (widget) widget.style.display = (state === 'exercise' || state === 'done') ? '' : 'none';
}

// ════════════════════════════════════════════════════════
//  SESSION STATS
// ════════════════════════════════════════════════════════
function updateSessionStats() {
  const pct = sessionDone > 0 ? Math.round((sessionCorrect / sessionDone) * 100) + '%' : '–';
  document.getElementById('mob-stat-done').textContent    = sessionDone;
  document.getElementById('mob-stat-xp').textContent      = sessionXP;
  document.getElementById('mob-stat-correct').textContent = pct;
  const wd = document.getElementById('widget-done');
  if (wd) {
    wd.textContent = sessionDone;
    document.getElementById('widget-xp').textContent      = sessionXP;
    document.getElementById('widget-correct').textContent = pct;
  }
}

async function saveBatch() {
  if (!sessionAttempts.length) return;
  const token = window.AuthService.getToken();
  if (!token) return;
  const toSave = [...sessionAttempts];
  sessionAttempts = [];
  await _saveBatchWithRetry(toSave, Date.now().toString());
}
// Cố ý KHÔNG tự động thử lại: /save-batch dùng insertMany (không idempotent),
// gọi lại tự động có thể tạo bản ghi trùng lặp nếu request đầu đã thành công
// ở server nhưng phản hồi bị mất trên client.
async function _saveBatchWithRetry(toSave, sessionId) {
  const token = window.AuthService.getToken();
  if (!token) return;
  try {
    // keepalive lets this survive a beforeunload-triggered call (tab close/
    // navigation right after finishing an exercise) — a plain fetch can be
    // aborted mid-flight by the browser once the page starts unloading.
    const res = await fetch(`${API}/api/task1/save-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ attempts: toSave, sessionId }),
      keepalive: true
    });
    await safeJson(res);
  } catch (e) {
    if (typeof showToast === 'function') showToast('Không lưu được kết quả buổi luyện tập lên server.', 'warn');
  }
}

// ════════════════════════════════════════════════════════
//  MODE TOGGLE
// ════════════════════════════════════════════════════════
function setMode(mode) {
  if (mode === currentMode) return;
  const needConfirm = (currentMode === 'practice' && sessionDone > 0)
    || (currentMode === 'test' && testIdx > 0 && testIdx < testExercises.length);
  if (needConfirm) {
    askWpQuit(() => { stopTestTimer(); saveBatch(); _doSetMode(mode, true); }, {
      title: 'Đổi chế độ?',
      sub: 'Tiến độ hiện tại sẽ bị mất.',
      confirmText: 'Đổi chế độ', continueText: 'Giữ nguyên'
    });
  } else { _doSetMode(mode, true); }
}
// push=true when this is a real user-initiated mode change (setMode above)
// that should be back-button-able; false (default) when just restoring
// state from the URL on load/popstate, which must not push a new entry.
function _doSetMode(mode, push = false) {
  currentMode = mode;
  _syncShareUrl(push);
  document.getElementById('btn-mode-practice').classList.toggle('active', mode === 'practice');
  document.getElementById('btn-mode-test').classList.toggle('active', mode === 'test');
  document.getElementById('practice-filters').style.display = mode === 'practice' ? '' : 'none';
  document.getElementById('test-setup').style.display        = mode === 'test'     ? '' : 'none';
  document.getElementById('mode-practice').style.display     = mode === 'practice' ? '' : 'none';
  document.getElementById('mode-test').style.display         = mode === 'test'     ? '' : 'none';
  // Sync mobile sheet
  document.getElementById('sheet-btn-mode-practice').classList.toggle('active', mode === 'practice');
  document.getElementById('sheet-btn-mode-test').classList.toggle('active', mode === 'test');
  document.getElementById('sheet-practice-filters').style.display = mode === 'practice' ? '' : 'none';
  document.getElementById('sheet-test-setup').style.display        = mode === 'test'     ? '' : 'none';
  if (mode === 'test') {
    document.getElementById('test-intro').style.display       = '';
    document.getElementById('test-in-progress').style.display = 'none';
    document.getElementById('test-results').style.display     = 'none';
  }
  const widget = document.getElementById('t1-stats-widget');
  if (widget) {
    widget.style.display = (mode === 'practice' && (_t1PracticeState === 'exercise' || _t1PracticeState === 'done')) ? '' : 'none';
  }
}

// ════════════════════════════════════════════════════════
//  MOBILE SHEET
// ════════════════════════════════════════════════════════

// Mobile sheet: update state only, no immediate load
function mobSetSkill(skill) {
  currentSkill = skill;
  document.querySelectorAll('.t1-skill-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.skill === skill));
}
function mobStartLearning() {
  if (sessionDone > 0) {
    closeWpSheet();
    askWpQuit(() => { saveBatch(); loadExercises(); }, {
      title: 'Bắt đầu bộ mới?',
      sub: 'Tiến độ hiện tại sẽ được lưu.',
      confirmText: 'Bắt đầu', continueText: 'Tiếp tục'
    });
  } else {
    saveBatch();
    loadExercises();
    closeWpSheet();
  }
}

// ════════════════════════════════════════════════════════
//  PRACTICE – FILTERS
// ════════════════════════════════════════════════════════
function selectSkill(skill) {
  if (skill === currentSkill) return;
  const doChange = () => {
    saveBatch(); currentSkill = skill;
    document.querySelectorAll('.t1-skill-tab').forEach(b =>
      b.classList.toggle('active', b.dataset.skill === skill));
    _syncShareUrl(true);
    loadExercises();
  };
  if (sessionDone > 0) {
    askWpQuit(doChange, { title:'Đổi kỹ năng?', sub:'Tiến độ sẽ được lưu.', confirmText:'Đổi ngay', continueText:'Giữ nguyên' });
  } else doChange();
}

// ════════════════════════════════════════════════════════
//  META – số câu theo level / skill
// ════════════════════════════════════════════════════════
let _t1Meta = null;

async function loadMeta() {
  try {
    const res  = await fetch(`${API}/api/task1/meta`);
    const data = await safeJson(res);
    if (!data.success) return;
    _t1Meta = data;
    updateLevelCounts();
    updateSkillCounts();
  } catch (_) { /* silent */ }
}

function updateLevelCounts() {
  if (!_t1Meta) return;
  ['beginner', 'elementary', 'intermediate', 'all'].forEach(lvl => {
    const count = _t1Meta.counts?.[lvl]?._total || 0;
    if (!count) return;
    // Only the "Thi thử" (test) level buttons remain — practice always
    // shows every level for the selected skill, no level picker anymore.
    document.querySelectorAll(`.wp-level-btn[data-tlevel="${lvl}"]`).forEach(btn => {
      let badge = btn.querySelector('.wp-lc-badge');
      if (!badge) { badge = document.createElement('span'); badge.className = 'wp-lc-badge'; btn.appendChild(badge); }
      badge.textContent = count;
    });
  });
}

function updateSkillCounts() {
  if (!_t1Meta) return;
  // Practice has no level filter anymore — skill counts always reflect
  // totals across all levels.
  const levelData = _t1Meta.counts?.all || {};
  document.querySelectorAll('.t1-skill-tab[data-skill]').forEach(btn => {
    const skill = btn.dataset.skill;
    const count = skill === 'all' ? (levelData._total || 0) : (levelData[skill] || 0);
    let badge = btn.querySelector('.wp-lc-badge');
    if (!badge) { badge = document.createElement('span'); badge.className = 'wp-lc-badge'; btn.appendChild(badge); }
    badge.textContent = count || '';
    btn.style.opacity = (count || skill === 'all') ? '' : '0.6';
  });
}

// ════════════════════════════════════════════════════════
//  PRACTICE – LOAD
// ════════════════════════════════════════════════════════
async function loadExercises() {
  showState('loading');
  try {
    const params = new URLSearchParams({ level: 'all', skillType: currentSkill });
    const token = window.AuthService.getToken();
    const res  = await fetch(`${API}/api/task1/exercises?${params}`, {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    const data = await safeJson(res);
    if (!data.success || !data.exercises?.length) { showState('empty'); return; }
    exercises    = data.exercises;
    if (shuffleMode) {
      for (let i = exercises.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [exercises[i], exercises[j]] = [exercises[j], exercises[i]];
      }
    }
    currentIdx   = 0;
    sessionDone  = 0; sessionXP = 0; sessionCorrect = 0;
    sessionAttempts = []; comboStreak = 0; _skippedIds = new Set();
    updateSessionStats();
    showExercise(0);
    showState('exercise');
  } catch (err) {
    console.error(err);
    showState('empty');
  }
}

// ════════════════════════════════════════════════════════
//  PRACTICE – SHOW EXERCISE
// ════════════════════════════════════════════════════════
function showExercise(idx) {
  const ex = exercises[idx];
  if (!ex) { showDoneSummary(); showState('done'); return; }

  clearTimeout(_autoNextTimer);
  document.getElementById('t1-countdown-bar').style.display = 'none';
  document.getElementById('next-btn-practice').innerHTML = 'Câu tiếp theo <i class="fas fa-arrow-right"></i>';
  document.getElementById('feedback-card').classList.add('hidden');
  document.getElementById('exercise-card').classList.remove('hidden');
  document.getElementById('submit-btn').disabled = false;

  const skipBtn = document.getElementById('skip-btn');
  skipBtn.classList.toggle('hidden', _skippedIds.has(ex._id));

  const pct = Math.round((idx / exercises.length) * 100);
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('ex-counter').textContent   = `${idx + 1} / ${exercises.length}`;
  document.getElementById('grammar-badge').textContent = ex.skillType ? (SKILL_LABELS[ex.skillType] || ex.skillType) : '';
  document.getElementById('type-tag').textContent      = TYPE_LABELS[ex.type] || ex.type;

  // hide all views
  ['translation','rearrange','fill-blank','multiple-choice'].forEach(v =>
    document.getElementById('view-' + v).classList.add('hidden'));
  wbwTeardown(); // drop any previous word-by-word drill; showTranslationView re-inits if needed

  if (['translation', 'error_correction', 'data_transform'].includes(ex.type)) {
    showTranslationView(ex);
  } else if (ex.type === 'rearrange') {
    showRearrangeView(ex);
  } else if (ex.type === 'fill_blank') {
    showFillBlankView(ex);
  } else if (ex.type === 'multiple_choice' || ex.type === 'paraphrase_choose') {
    showMultipleChoiceView(ex);
  }
}

function showTranslationView(ex) {
  document.getElementById('view-translation').classList.remove('hidden');
  document.getElementById('task-instruction').textContent = ex.instruction || '';

  // grammar focus (don't show for error_correction — the focus is obvious)
  const transCtx = document.getElementById('trans-ctx-note');
  if (ex.grammarPoint && ex.type !== 'error_correction') {
    document.getElementById('trans-ctx-content').textContent = ex.grammarPoint;
    transCtx.classList.remove('hidden');
  } else transCtx.classList.add('hidden');

  // data context
  const ctxBox = document.getElementById('data-ctx-box');
  if (ex.dataContext?.subject) {
    document.getElementById('data-ctx-content').textContent =
      `${ex.dataContext.subject} | ${ex.dataContext.year || ''} | ${ex.dataContext.value || ''} ${ex.dataContext.unit || ''}`;
    ctxBox.classList.remove('hidden');
  } else ctxBox.classList.add('hidden');

  // error correction: show original sentence
  const errWrap = document.getElementById('view-error-orig');
  if (ex.type === 'error_correction' && ex.sentenceWithBlanks) {
    document.getElementById('error-orig-text').textContent = ex.sentenceWithBlanks;
    errWrap.classList.remove('hidden');
  } else errWrap.classList.add('hidden');

  // question
  const qEl = document.getElementById('question-text');
  qEl.textContent = ex.questionVi || ex.questionEn || '';

  // Word-by-word "Dịch câu" drill for translation exercises (server ships
  // ex.translationAnswer in practice mode only). Its own bar shows the word
  // count, so the separate letter-pattern hint row is redundant there.
  const useWbw = ex.type === 'translation' && !!ex.translationAnswer;

  // word-count + first-letter hint (translation/error_correction/data_transform
  // only — server only ever sends answerWordCount for those types)
  const hintRow = document.getElementById('answer-hint-row');
  if (ex.answerWordCount && !useWbw) {
    document.getElementById('answer-hint-count').textContent   = `📏 ${ex.answerWordCount} từ`;
    document.getElementById('answer-hint-pattern').textContent = ex.answerLetterHint || '';
    hintRow.classList.remove('hidden');
  } else {
    hintRow.classList.add('hidden');
  }

  document.getElementById('hints-row').innerHTML = '';
  _vocabHintList  = (ex.type !== 'error_correction' && ex.hints?.length) ? ex.hints : [];
  _vocabHintCount = 0;
  const hintBtn = document.getElementById('vocab-hint-btn');
  const hintCountEl = document.getElementById('vocab-hint-count');
  if (hintBtn) {
    if (_vocabHintList.length > 0) { hintBtn.classList.remove('hidden'); hintBtn.disabled = false; if (hintCountEl) hintCountEl.textContent = ''; }
    else { hintBtn.classList.add('hidden'); }
  }

  const box = document.getElementById('answer-box');
  box.value = '';
  if (useWbw) {
    box.classList.add('hidden');
    document.getElementById('vocab-hint-btn')?.classList.add('hidden'); // typing the exact answer — a vocab hint adds nothing
    wbwInit(ex.translationAnswer);
  }
  if (!useWbw || !_wbw) {
    // Plain textarea for non-translation types, and as a safety net if the
    // drill declined the answer (e.g. no typable characters).
    box.classList.remove('hidden');
    box.focus();
  }
}

function showRearrangeView(ex) {
  document.getElementById('vocab-hint-btn')?.classList.add('hidden');
  document.getElementById('view-rearrange').classList.remove('hidden');
  document.getElementById('rearrange-instruction').textContent = ex.instruction || 'Sắp xếp các từ thành câu đúng:';

  // Grammar focus
  const ctxNote = document.getElementById('rearrange-ctx-note');
  if (ex.grammarPoint) {
    document.getElementById('rearrange-ctx-content').textContent = ex.grammarPoint;
    ctxNote.classList.remove('hidden');
  } else ctxNote.classList.add('hidden');

  document.getElementById('rearrange-context').textContent = ex.questionEn || ex.questionVi || '';

  rearrangeWords  = shuffle([...(ex.baseWords || [])]);
  rearrangeAnswer = [];

  const bank = document.getElementById('rearrange-bank');
  bank.innerHTML = '';
  rearrangeWords.forEach((w, i) => {
    const chip = document.createElement('span');
    chip.className = 'wp-word-chip'; chip.textContent = w;
    chip.dataset.index = i; chip.dataset.word = w; chip.dataset.used = 'false';
    chip.onclick = () => selectWord(chip);
    bank.appendChild(chip);
  });
  document.getElementById('rearrange-answer').innerHTML =
    '<span class="wp-rearrange-placeholder">Bấm vào các từ để sắp xếp...</span>';
  document.getElementById('rearrange-input').value = '';
}

function showFillBlankView(ex) {
  document.getElementById('vocab-hint-btn')?.classList.add('hidden');
  document.getElementById('view-fill-blank').classList.remove('hidden');
  document.getElementById('fill-label').textContent = ex.instruction || 'Điền vào chỗ trống:';

  // Data context (from/to table — shown BEFORE the sentence so student has full context)
  const fillDataCtx = document.getElementById('fill-data-ctx-box');
  const dc = ex.dataContext;
  if (dc && (dc.subject || dc.value)) {
    const add = dc.additionalData || {};
    // Main line: Subject | Year | From → To  unit
    let mainLine = dc.subject || '';
    if (dc.year) mainLine += ' · ' + dc.year;
    if (dc.value) mainLine += ' · ' + dc.value + (dc.unit ? ' ' + dc.unit : '');
    document.getElementById('fill-data-ctx-content').textContent = mainLine;
    // Note line: highlight what the blank number means
    const noteEl = document.getElementById('fill-data-ctx-note');
    if (add.note) {
      noteEl.textContent = '→ ' + add.note;
      noteEl.classList.remove('hidden');
    } else noteEl.classList.add('hidden');
    fillDataCtx.classList.remove('hidden');
  } else fillDataCtx.classList.add('hidden');

  // Grammar focus
  const ctxNote = document.getElementById('fill-ctx-note');
  if (ex.grammarPoint) {
    document.getElementById('fill-ctx-content').textContent = ex.grammarPoint;
    ctxNote.classList.remove('hidden');
  } else ctxNote.classList.add('hidden');

  // Sentence
  const sentence = ex.sentenceWithBlanks || ex.questionEn || '';
  document.getElementById('fill-sentence').innerHTML =
    _escHtml(sentence).replace(/___/g, '<span class="wp-blank-underline">___</span>');

  // Hints — 2 chips for short answers (≤6 words), 3 for longer
  const hRow = document.getElementById('fill-hints-row');
  hRow.innerHTML = '';
  if (ex.hints?.length) {
    const ansWords = ex.answerWordCount || 1;
    const hintCount = ansWords <= 6 ? 2 : 3;
    const lbl = document.createElement('span');
    lbl.className = 't1-hint-label'; lbl.textContent = '💡 Gợi ý:';
    hRow.appendChild(lbl);
    ex.hints.slice(0, hintCount).forEach(h => {
      const chip = document.createElement('span');
      chip.className = 't1-hint-chip'; chip.textContent = h;
      hRow.appendChild(chip);
    });
  }

  const inp = document.getElementById('fill-input');
  const blankCount = (sentence.match(/___/g) || []).length;
  if (blankCount > 1) {
    inp.placeholder = `Nhập ${blankCount} từ theo thứ tự, cách nhau bằng dấu phẩy (vd: from, to, of)`;
    const lbl = document.getElementById('fill-label');
    if (lbl && !lbl.textContent.includes('dấu phẩy'))
      lbl.textContent = lbl.textContent + ` — điền ${blankCount} chỗ trống, cách nhau bằng dấu phẩy`;
  } else {
    inp.placeholder = 'Nhập từ cần điền vào chỗ trống...';
  }
  inp.value = ''; inp.focus();
}

function showMultipleChoiceView(ex) {
  document.getElementById('vocab-hint-btn')?.classList.add('hidden');
  document.getElementById('view-multiple-choice').classList.remove('hidden');
  document.getElementById('mc-instruction').textContent = ex.instruction || '';

  // Grammar focus
  const ctxNote = document.getElementById('mc-ctx-note');
  if (ex.grammarPoint) {
    document.getElementById('mc-ctx-content').textContent = ex.grammarPoint;
    ctxNote.classList.remove('hidden');
  } else ctxNote.classList.add('hidden');

  document.getElementById('mc-question').textContent    = ex.questionEn || ex.questionVi || '';
  document.getElementById('mc-selected-index').value    = '';

  const container = document.getElementById('mc-options');
  container.innerHTML = '';
  const letters = ['A','B','C','D'];
  (ex.options || []).forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 't1-mc-option';
    btn.innerHTML = `<span class="t1-opt-letter">${letters[i]}</span><span>${_escHtml(opt)}</span>`;
    btn.onclick = () => {
      container.querySelectorAll('.t1-mc-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('mc-selected-index').value = i;
    };
    container.appendChild(btn);
  });
}

// ════════════════════════════════════════════════════════
//  REARRANGE HELPERS
// ════════════════════════════════════════════════════════
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ════════════════════════════════════════════════════════
//  PRACTICE – SUBMIT
// ════════════════════════════════════════════════════════
function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const fc = document.getElementById('feedback-card');
    if (fc && !fc.classList.contains('hidden')) nextExercise();
    else submitAnswer();
  }
}

function getUserAnswer() {
  const ex = exercises[currentIdx];
  if (!ex) return '';
  if (ex.type === 'rearrange') return document.getElementById('rearrange-input').value.trim();
  if (ex.type === 'fill_blank') return document.getElementById('fill-input').value.trim();
  if (ex.type === 'multiple_choice' || ex.type === 'paraphrase_choose')
    return document.getElementById('mc-selected-index').value;
  return document.getElementById('answer-box').value.trim();
}

async function submitAnswer() {
  if (_isSubmitting) return;
  const ex     = exercises[currentIdx];
  if (!ex) return;
  const answer = getUserAnswer();

  if (answer === '' || answer === null || answer === undefined) {
    showToast('Vui lòng nhập/chọn câu trả lời!', 'warn'); return;
  }

  _isSubmitting = true;
  document.getElementById('submit-btn').disabled = true;
  document.getElementById('checking-loader').classList.remove('hidden');

  // Abort a hung grade after 30s — a cold-started backend used to leave the
  // "Đang chấm…" loader spinning forever with no way out.
  const _ctrl = new AbortController();
  const _killer = setTimeout(() => _ctrl.abort(), 30000);

  try {
    const token = window.AuthService.getToken();
    const res  = await fetch(`${API}/api/task1/check`, {
      method: 'POST',
      signal: _ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': 'Bearer ' + token } : {}) },
      body: JSON.stringify({ exerciseId: ex._id, userAnswer: answer })
    });
    clearTimeout(_killer);
    const data = await safeJson(res);
    if (!data.success) throw new Error(data.message || 'Lỗi server');
    showFeedback(answer, data, ex);
    const earned = data.xpEarned || 5;
    sessionDone++;
    sessionXP += earned;
    if (data.isCorrect) {
      sessionCorrect++; comboStreak++; playOk();
      if (comboStreak >= 3) {
        const badge = document.getElementById('combo-badge');
        badge.textContent = `🔥 ×${comboStreak}`;
        badge.classList.add('hidden');
        void badge.offsetWidth;
        badge.classList.remove('hidden');
      }
    } else {
      comboStreak = 0; playWrong();
      document.getElementById('combo-badge').classList.add('hidden');
    }
    updateXPStorage(earned);
    floatXP(earned);
    updateSessionStats();
    sessionAttempts.push({
      exerciseId: ex._id, userAnswer: answer,
      isCorrect: data.isCorrect, score: data.score || 0,
      xpEarned: earned, skillType: ex.skillType, module: ex.module,
      questionText: ex.questionVi || ex.questionEn || '',
      instruction: ex.instruction || '',
      sampleAnswer: data.sampleAnswer || '',
      feedbackVi: data.feedbackVi || '',
      type: ex.type
    });
  } catch (err) {
    clearTimeout(_killer);
    const aborted = err && (err.name === 'AbortError' || /abort/i.test(err.message || ''));
    showToast(aborted
      ? 'Chấm bài quá lâu — server có thể đang khởi động. Hãy thử lại sau vài giây.'
      : 'Lỗi khi chấm bài: ' + err.message, 'error', aborted ? 7000 : undefined);
    document.getElementById('submit-btn').disabled = false;
  } finally {
    document.getElementById('checking-loader').classList.add('hidden');
    _isSubmitting = false;
  }
}

function showFeedback(userAnswer, data, ex) {
  // highlight MC options
  if (ex.type === 'multiple_choice' || ex.type === 'paraphrase_choose') {
    const idx = parseInt(userAnswer);
    const correctIdx = data.correctOptionIndex ?? -1;
    document.querySelectorAll('.t1-mc-option').forEach((btn, i) => {
      if (i === idx) btn.classList.add(data.isCorrect ? 'correct' : 'wrong');
      if (!data.isCorrect) {
        if (correctIdx >= 0 ? i === correctIdx : btn.querySelector('span:last-child')?.textContent === data.sampleAnswer)
          btn.classList.add('correct');
      }
    });
    document.getElementById('comparison-box').style.display = 'none';
  } else {
    document.getElementById('comparison-box').style.display = '';
    document.getElementById('student-answer-display').innerHTML =
      data.sampleAnswer ? buildAnswerDiff(userAnswer, data.sampleAnswer) : _escHtml(userAnswer);
    document.getElementById('sample-answer-display').textContent = data.sampleAnswer || '—';
  }

  // grammar explanation
  const expBox = document.getElementById('grammar-explanation');
  if (data.grammarPoint || data.explanation) {
    document.getElementById('grammar-explanation-text').textContent =
      [data.grammarPoint, data.explanation].filter(Boolean).join(' — ');
    expBox.classList.remove('hidden');
  } else expBox.classList.add('hidden');

  const isOk = data.isCorrect;
  const bannerEl = document.getElementById('result-banner');
  bannerEl.innerHTML = isOk ? '✅ Chính xác!' : '❌ Chưa đúng';
  bannerEl.className = 'wp-result-banner ' + (isOk ? 'wp-result-correct' : 'wp-result-wrong');
  document.getElementById('feedback-text').textContent = data.feedbackVi || '';

  document.getElementById('exercise-card').classList.add('hidden');
  document.getElementById('feedback-card').classList.remove('hidden');

  // auto-next on correct answer
  clearTimeout(_autoNextTimer);
  const cdBar = document.getElementById('t1-countdown-bar');
  cdBar.style.display = 'none';
  if (autoNext && isOk) {
    const dur = 1500;
    cdBar.innerHTML = `<div class="t1-countdown-bar" style="--cd-dur:${dur}ms"></div>`;
    cdBar.style.display = 'block';
    _autoNextTimer = setTimeout(nextExercise, dur);
  }
}

function nextExercise() {
  clearTimeout(_autoNextTimer);
  currentIdx++;
  showExercise(currentIdx);
}

function skipExercise() {
  // Without this guard, skipping while submitAnswer()'s /check request for
  // the current exercise is still in flight lets that response arrive after
  // showExercise() has already moved on — showFeedback() then yanks the UI
  // back to the skipped exercise's feedback screen mid-way through the next
  // one. See submitAnswer()'s _isSubmitting flag, set for the same reason.
  if (_isSubmitting) return;
  const ex = exercises[currentIdx];
  if (!ex || _skippedIds.has(ex._id)) {
    showToast('Câu này đã bỏ qua rồi – hãy trả lời nhé! 😊', 'warn'); return;
  }
  _skippedIds.add(ex._id);
  exercises.splice(currentIdx, 1);
  exercises.push(ex);
  showToast('Đã bỏ qua – câu này sẽ xuất hiện lại ở cuối 👋', 'info', 2000);
  showExercise(currentIdx);
}

function stopPracticeMode() {
  if (sessionDone === 0) { showState('welcome'); return; }
  askWpQuit(() => { showDoneSummary(); showState('done'); }, {
    title: 'Dừng luyện tập?',
    sub: `Bạn đã làm ${sessionDone} câu. Xem tổng kết nhé!`,
    confirmText: 'Xem kết quả', continueText: 'Tiếp tục học'
  });
}

function showDoneSummary() {
  const pct = sessionDone > 0 ? Math.round((sessionCorrect / sessionDone) * 100) : 0;
  const wrongAttempts = sessionAttempts.filter(a => !a.isCorrect);
  const wrongCount = wrongAttempts.length;

  const doneIcon = document.getElementById('done-icon');
  // Lulu's face for the score (js/shared/playful.js); emoji without it.
  if (window.Mascot && window.Mascot.mount) window.Mascot.mount(doneIcon, window.Mascot.moodForScore(pct));
  else doneIcon.textContent = pct >= 80 ? '😎' : pct >= 50 ? '🤔' : '😤';
  document.getElementById('done-title').textContent = pct >= 80 ? 'Giỏi dữ hen!' : pct >= 50 ? 'Tạm ổn thôi...' : 'Học đàng hoàng zô!';
  document.getElementById('done-summary').textContent = `Hoàn thành ${sessionDone} câu — tỉ lệ đúng ${pct}%`;
  document.getElementById('done-stats').innerHTML =
    `<span>✅ Đúng: ${sessionCorrect}</span><span>❌ Sai: ${wrongCount}</span><span>⭐ XP: +${sessionXP}</span>`;

  if (currentSkill !== 'all' && sessionDone > 0) saveSkillScore(currentSkill, pct);
  const skillStatusEl = document.getElementById('done-skill-status');
  if (skillStatusEl) skillStatusEl.innerHTML = doneSkillStatusHtml();
  updateSkillTabChecks();

  // Lưu cache TRƯỚC khi saveBatch() xóa sessionAttempts
  _wrongAttemptCache = wrongAttempts;

  const retryBtn = document.getElementById('done-retry-wrong-btn');
  if (wrongCount > 0) {
    document.getElementById('done-retry-count').textContent = `Làm lại ${wrongCount} câu sai`;
    retryBtn.style.display = '';
  } else {
    retryBtn.style.display = 'none';
  }

  const reviewDiv = document.getElementById('done-wrong-review');
  if (wrongCount > 0) {
    reviewDiv.innerHTML = `
      <h3 class="wp-wr-title">📋 Chi tiết câu sai (${wrongCount})</h3>
      ${wrongAttempts.map((a, i) => `
        <div class="wp-wr-item">
          <div class="wp-wr-num">❌ Câu ${i+1} — ${TYPE_LABELS[a.type] || a.type}<span class="wp-wr-skill">${SKILL_LABELS[a.skillType] || ''}</span></div>
          <div class="wp-wr-q">${a.instruction ? _escHtml(a.instruction) + ' ' : ''}${_escHtml(a.questionText || '')}</div>
          <div class="wp-wr-row"><span class="wp-wr-lbl-you">Bạn:</span> <span class="wp-wr-your">${_escHtml(a.userAnswer || '') || '(bỏ trống)'}</span></div>
          <div class="wp-wr-row"><span class="wp-wr-lbl-ans">Đáp án:</span> <span class="wp-wr-ans">${_escHtml(a.sampleAnswer || '')}</span></div>
          ${a.feedbackVi ? `<div class="wp-wr-gp">${_escHtml(a.feedbackVi)}</div>` : ''}
        </div>`).join('')}`;
  } else {
    reviewDiv.innerHTML = `<div class="wp-wr-all-ok">🌟 Không có câu nào sai!</div>`;
  }

  saveBatch();
}

function restartExercises() {
  if (_originalExercises) { exercises = _originalExercises; _originalExercises = null; }
  _wrongAttemptCache = [];
  currentIdx = 0; sessionDone = 0; sessionXP = 0;
  sessionCorrect = 0; sessionAttempts = []; comboStreak = 0; _skippedIds = new Set();
  updateSessionStats();
  showExercise(0);
  showState('exercise');
}

function retryWrongT1() {
  const wrongIds = new Set(_wrongAttemptCache.map(a => a.exerciseId));
  const wrongExercises = exercises.filter(ex => wrongIds.has(String(ex._id)));
  if (!wrongExercises.length) { showToast('Không còn câu sai!', 'info'); return; }
  // Only capture the true original set once — retrying wrong answers a
  // second time (from a subset session) must not clobber it with that
  // subset, or restartExercises()'s "start over" would only restore the
  // subset instead of the real original set.
  if (!_originalExercises) _originalExercises = exercises;
  exercises = wrongExercises;
  currentIdx = 0; sessionDone = 0; sessionXP = 0;
  sessionCorrect = 0; sessionAttempts = []; comboStreak = 0; _skippedIds = new Set();
  updateSessionStats();
  showExercise(0);
  showState('exercise');
}

function tryMoreSkills() {
  saveBatch(); showState('welcome');
  sessionDone = 0; sessionXP = 0; sessionCorrect = 0; sessionAttempts = [];
  comboStreak = 0;
  document.getElementById('combo-badge')?.classList.add('hidden');
}

// ════════════════════════════════════════════════════════
//  TEST MODE
// ════════════════════════════════════════════════════════

async function startTest() {
  if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
    if (window.openUpgradeModal) window.openUpgradeModal();
    return;
  }
  const startBtns = document.querySelectorAll('.wp-start-test-btn');
  startBtns.forEach(b => { b.disabled = true; b.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...'; });
  try {
    const params = new URLSearchParams({ level: testLevel, count: testCount });
    const token = window.AuthService.getToken();
    const res  = await fetch(`${API}/api/task1/test-questions?${params}`, {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    const data = await safeJson(res);
    if (!data.success || !data.exercises?.length) {
      showToast('Chưa có bài tập. Vui lòng thử lại!', 'error');
      startBtns.forEach(b => { b.disabled = false; b.innerHTML = '<i class="fas fa-play"></i> Bắt đầu thi'; });
      return;
    }
    testExercises = data.exercises;
    testAnswers   = [];
    testIdx       = 0;
    testRearrangeAnswer = [];
    startBtns.forEach(b => { b.disabled = false; b.innerHTML = '<i class="fas fa-play"></i> Bắt đầu thi'; });
    document.getElementById('test-intro').style.display       = 'none';
    document.getElementById('test-in-progress').style.display = '';
    document.getElementById('test-results').style.display     = 'none';
    showTestQuestion(0);
    startTestTimer(testExercises.length * 90);
  } catch (err) {
    showToast('Lỗi tải đề: ' + err.message, 'error');
    startBtns.forEach(b => { b.disabled = false; b.innerHTML = '<i class="fas fa-play"></i> Bắt đầu thi'; });
  }
}

function showTestQuestion(idx) {
  const ex = testExercises[idx];
  if (!ex) { submitTest(); return; }

  const pct = Math.round((idx / testExercises.length) * 100);
  document.getElementById('test-progress-bar').style.width = pct + '%';
  document.getElementById('test-counter').textContent = `${idx + 1} / ${testExercises.length}`;
  document.getElementById('test-type-tag').textContent = TYPE_LABELS[ex.type] || ex.type;

  ['text','rearrange','fill','mc'].forEach(v =>
    document.getElementById('test-view-' + v).classList.add('hidden'));

  testRearrangeAnswer = [];

  if (['translation', 'error_correction', 'data_transform'].includes(ex.type)) {
    document.getElementById('test-view-text').classList.remove('hidden');
    document.getElementById('test-instruction').textContent = ex.instruction || '';
    // data context (needed for translation exercises)
    const testCtxBox = document.getElementById('test-data-ctx-box');
    if (ex.dataContext?.subject) {
      document.getElementById('test-data-ctx-content').textContent =
        `${ex.dataContext.subject}${ex.dataContext.year ? ' · ' + ex.dataContext.year : ''}${ex.dataContext.value ? ' · ' + ex.dataContext.value + (ex.dataContext.unit ? ' ' + ex.dataContext.unit : '') : ''}`;
      testCtxBox.classList.remove('hidden');
    } else testCtxBox.classList.add('hidden');
    const errWrap = document.getElementById('test-error-orig-wrap');
    if (ex.type === 'error_correction' && ex.sentenceWithBlanks) {
      document.getElementById('test-error-orig').textContent = ex.sentenceWithBlanks;
      errWrap.classList.remove('hidden');
    } else errWrap.classList.add('hidden');
    document.getElementById('test-question').textContent = ex.questionVi || ex.questionEn || '';
    document.getElementById('test-answer-box').value = '';

  } else if (ex.type === 'rearrange') {
    document.getElementById('test-view-rearrange').classList.remove('hidden');
    document.getElementById('test-rearrange-instruction').textContent = ex.instruction || 'Sắp xếp các từ:';
    document.getElementById('test-rearrange-context').textContent = ex.questionEn || ex.questionVi || '';
    const words = shuffle([...(ex.baseWords || [])]);
    const bank = document.getElementById('test-rearrange-bank');
    bank.innerHTML = '';
    words.forEach((w, i) => {
      const chip = document.createElement('span');
      chip.className = 'wp-word-chip'; chip.textContent = w;
      chip.dataset.index = i; chip.dataset.word = w; chip.dataset.used = 'false';
      chip.onclick = () => selectTestWord(chip);
      bank.appendChild(chip);
    });
    document.getElementById('test-rearrange-answer').innerHTML =
      '<span class="wp-rearrange-placeholder">Bấm vào các từ để sắp xếp...</span>';
    document.getElementById('test-rearrange-input').value = '';

  } else if (ex.type === 'fill_blank') {
    document.getElementById('test-view-fill').classList.remove('hidden');
    document.getElementById('test-fill-label').textContent = ex.instruction || 'Điền vào chỗ trống:';
    const sentence = ex.sentenceWithBlanks || ex.questionEn || '';
    document.getElementById('test-fill-sentence').innerHTML =
      _escHtml(sentence).replace(/___/g, '<span class="wp-blank-underline">___</span>');
    document.getElementById('test-fill-input').value = '';

  } else if (ex.type === 'multiple_choice' || ex.type === 'paraphrase_choose') {
    document.getElementById('test-view-mc').classList.remove('hidden');
    document.getElementById('test-mc-instruction').textContent = ex.instruction || '';
    document.getElementById('test-mc-question').textContent    = ex.questionEn || ex.questionVi || '';
    document.getElementById('test-mc-selected').value          = '';
    const container = document.getElementById('test-mc-options');
    container.innerHTML = '';
    const letters = ['A','B','C','D'];
    (ex.options || []).forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 't1-mc-option';
      btn.innerHTML = `<span class="t1-opt-letter">${letters[i]}</span><span>${_escHtml(opt)}</span>`;
      btn.onclick = () => {
        document.querySelectorAll('#test-mc-options .t1-mc-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('test-mc-selected').value = i;
      };
      container.appendChild(btn);
    });
  }

  document.getElementById('test-next-btn').innerHTML =
    idx < testExercises.length - 1
      ? 'Tiếp theo <i class="fas fa-arrow-right"></i>'
      : 'Nộp bài <i class="fas fa-check"></i>';
}

function selectTestWord(chip) {
  if (chip.dataset.used === 'true') return;
  chip.dataset.used = 'true'; chip.classList.add('wp-chip-used');
  testRearrangeAnswer.push(chip.dataset.word);
  renderTestRearrangeAnswer();
}

function returnTestWord(e) {
  if (!e.target.classList.contains('wp-answer-chip')) return;
  const word = e.target.dataset.word;
  testRearrangeAnswer.splice(parseInt(e.target.dataset.idx), 1);
  let unmarked = false;
  document.querySelectorAll('#test-rearrange-bank .wp-word-chip').forEach(c => {
    if (!unmarked && c.dataset.word === word && c.dataset.used === 'true') {
      c.dataset.used = 'false'; c.classList.remove('wp-chip-used');
      unmarked = true;
    }
  });
  renderTestRearrangeAnswer();
}

function renderTestRearrangeAnswer() {
  const area = document.getElementById('test-rearrange-answer');
  area.innerHTML = '';
  if (!testRearrangeAnswer.length) {
    area.innerHTML = '<span class="wp-rearrange-placeholder">Bấm vào các từ để sắp xếp...</span>';
  } else {
    testRearrangeAnswer.forEach((w, i) => {
      const chip = document.createElement('span');
      chip.className = 'wp-answer-chip'; chip.textContent = w;
      chip.dataset.word = w; chip.dataset.idx = i;
      chip.title = 'Bấm để bỏ từ này';
      area.appendChild(chip);
    });
  }
  document.getElementById('test-rearrange-input').value = testRearrangeAnswer.join(' ');
}

function getTestAnswer() {
  const ex = testExercises[testIdx];
  if (!ex) return '';
  if (ex.type === 'rearrange')   return document.getElementById('test-rearrange-input').value.trim();
  if (ex.type === 'fill_blank')  return document.getElementById('test-fill-input').value.trim();
  if (ex.type === 'multiple_choice' || ex.type === 'paraphrase_choose')
    return document.getElementById('test-mc-selected').value;
  return document.getElementById('test-answer-box').value.trim();
}

function testNextQuestion() {
  const ex     = testExercises[testIdx];
  const answer = getTestAnswer();
  if (!answer && answer !== 0) {
    showToast('Vui lòng nhập/chọn câu trả lời trước khi tiếp tục!', 'warn'); return;
  }
  testAnswers.push({ exerciseId: ex._id, userAnswer: answer });
  testIdx++;
  if (testIdx < testExercises.length) {
    showTestQuestion(testIdx);
  } else {
    submitTest();
  }
}

async function submitTest() {
  stopTestTimer();
  // Abort a hung grade after 45s (multi-question AI grade — allow a bit
  // longer than the single-exercise 30s) so the "Đang chấm bài..." spinner
  // can't run forever on a cold-started backend.
  const _ctrl = new AbortController();
  const _killer = setTimeout(() => _ctrl.abort(), 45000);
  try {
    document.getElementById('test-in-progress').style.display = 'none';
    document.getElementById('test-results').style.display     = '';
    document.getElementById('test-score-header').innerHTML    = '<div class="wp-spinner"></div><p>Đang chấm bài...</p>';

    const token = window.AuthService.getToken();
    const res  = await fetch(`${API}/api/task1/check-test`, {
      method: 'POST',
      signal: _ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': 'Bearer ' + token } : {}) },
      body: JSON.stringify({ answers: testAnswers })
    });
    clearTimeout(_killer);
    const data = await safeJson(res);
    if (!data.success) throw new Error(data.message);

    const scoreClass = data.score >= 70 ? 'wp-score-good' : data.score >= 40 ? 'wp-score-mid' : 'wp-score-bad';
    const t1ImgSrc = data.score >= 90 ? 'img/vocab_writingabove90%25.jpg'
                    : data.score >= 70 ? 'img/above7.5.jpg'
                    : data.score >= 60 ? 'img/band_6_7.jpg'
                    : data.score >= 50 ? 'img/writingbelow60%25.jpg'
                    : data.score >= 45 ? 'img/writingbelow50%25.jpg'
                    : 'img/writingbelow45%25.jpg';
    const { emoji, message } = getScoreMessage(data.score);
    // Lulu says the message (js/shared/playful.js); emoji + text without it.
    const lulu = window.Mascot && window.Mascot.reactHtml;
    document.getElementById('test-score-header').innerHTML = `
      <img src="${t1ImgSrc}" alt="" style="display:block;width:100%;max-width:220px;border-radius:12px;margin:0 auto 12px;object-fit:cover">
      ${lulu ? lulu({ pct: data.score, text: message, stacked: true }) : `<div class="wp-done-icon">${emoji}</div>`}
      <h2 class="${scoreClass}">${data.score}%</h2>
      <p>${lulu ? '' : message + ' '}Đúng ${data.correct} / ${data.total} câu</p>`;

    const list = document.getElementById('test-review-list');
    list.innerHTML = '';
    (data.results || []).forEach((r, i) => {
      const div = document.createElement('div');
      div.className = r.isCorrect ? 'wp-wr-item-ok' : 'wp-wr-item';
      div.innerHTML = `
        <div class="${r.isCorrect ? 'wp-wr-num-ok' : 'wp-wr-num'}">
          ${r.isCorrect ? '✅' : '❌'} Câu ${i + 1} — ${TYPE_LABELS[r.type] || r.type}
          <span class="wp-wr-skill">${SKILL_LABELS[r.skillType] || ''}</span>
        </div>
        ${r.instruction ? `<div class="wp-wr-instr">${_escHtml(r.instruction)}</div>` : ''}
        ${r.questionVi || r.questionEn ? `<div class="wp-wr-q-i">${_escHtml(r.questionVi || r.questionEn)}</div>` : ''}
        <div class="wp-wr-row"><span class="wp-wr-lbl-you">Bạn:</span> <span class="${r.isCorrect ? 'wp-wr-ans' : 'wp-wr-your'}">${_escHtml(r.userAnswer || '') || '(bỏ trống)'}</span></div>
        ${!r.isCorrect ? `<div class="wp-wr-row"><span class="wp-wr-lbl-ans">Đáp án:</span> <span class="wp-wr-ans">${_escHtml(r.sampleAnswer || '')}</span></div>` : ''}
        ${r.grammarPoint ? `<div class="wp-wr-gp">💡 ${_escHtml(r.grammarPoint)}</div>` : ''}`;
      list.appendChild(div);
    });
  } catch (err) {
    clearTimeout(_killer);
    const aborted = err && (err.name === 'AbortError' || /abort/i.test(err.message || ''));
    const msg = aborted
      ? 'Chấm bài quá lâu — server có thể đang khởi động. Bài làm của bạn vẫn còn, hãy thử chấm lại.'
      : 'Lỗi chấm bài: ' + _escHtml(err.message || '');
    document.getElementById('test-score-header').innerHTML =
      `<p style="color:#dc2626;margin-bottom:12px">${msg}</p>` +
      `<button onclick="submitTest()" style="background:var(--brand,#e53935);color:#fff;border:none;border-radius:8px;padding:9px 20px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Thử chấm lại</button>`;
  }
}

function retakeTest() {
  stopTestTimer();
  testIdx = 0; testAnswers = []; testExercises = [];
  document.getElementById('test-intro').style.display       = '';
  document.getElementById('test-in-progress').style.display = 'none';
  document.getElementById('test-results').style.display     = 'none';
}

function stopTestMode() {
  const reset = () => {
    stopTestTimer();
    document.getElementById('test-intro').style.display       = '';
    document.getElementById('test-in-progress').style.display = 'none';
    document.getElementById('test-results').style.display     = 'none';
    testIdx = 0; testAnswers = [];
  };
  if (testIdx === 0) { reset(); return; }
  askWpQuit(reset, {
    title: 'Dừng bài thi?',
    sub: `Câu ${testIdx + 1}/${testExercises.length}. Kết quả sẽ bị mất.`,
    confirmText: 'Dừng lại', continueText: 'Tiếp tục thi'
  });
}

// ════════════════════════════════════════════════════════
//  HISTORY MODAL
// ════════════════════════════════════════════════════════
async function openHistory() {
  document.getElementById('t1-hist-overlay').classList.remove('hidden');
  const body = document.getElementById('t1-hist-body');
  const token = window.AuthService.getToken();
  if (!token) {
    body.innerHTML = '<div class="t1-hist-empty"><div class="t1-hist-empty-icon">🔒</div><p>Vui lòng <a href="login.html" style="color:#e53935;font-weight:700">đăng nhập</a> để xem lịch sử luyện tập.</p></div>';
    return;
  }
  body.innerHTML = '<div style="text-align:center;padding:32px"><div class="wp-spinner"></div><p style="color:#9ca3af;margin-top:10px;font-size:13px">Đang tải...</p></div>';
  try {
    const res  = await fetch(`${API}/api/task1/history?limit=200`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await safeJson(res);
    if (!data.success) throw new Error(data.message);
    renderHistory(data.attempts || []);
  } catch (e) {
    body.innerHTML = `<p style="color:#e53935;text-align:center;padding:24px;font-size:13px">Không thể tải: ${e.message}</p>`;
  }
}

function renderHistory(attempts) {
  const body = document.getElementById('t1-hist-body');
  if (!attempts.length) {
    body.innerHTML = '<div class="t1-hist-empty"><div class="t1-hist-empty-icon">📭</div><p>Chưa có lịch sử luyện tập.<br>Hãy bắt đầu làm bài nhé!</p></div>';
    return;
  }

  const total    = attempts.length;
  const correct  = attempts.filter(a => a.isCorrect).length;
  const totalXP  = attempts.reduce((s, a) => s + (a.xpEarned || 0), 0);
  const accuracy = Math.round((correct / total) * 100);

  // Group by sessionId (fallback: by date string)
  const sessions = {};
  attempts.forEach(a => {
    const key = a.sessionId || new Date(a.createdAt).toISOString().slice(0, 13); // hour bucket
    if (!sessions[key]) sessions[key] = { date: a.createdAt, attempts: [] };
    sessions[key].attempts.push(a);
  });

  const rows = Object.values(sessions)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 40)
    .map(s => {
      const sc   = s.attempts.filter(a => a.isCorrect).length;
      const xp   = s.attempts.reduce((sum, a) => sum + (a.xpEarned || 0), 0);
      const acc  = Math.round((sc / s.attempts.length) * 100);
      const cls  = acc >= 70 ? 'good' : acc >= 50 ? 'mid' : 'bad';
      const date = new Date(s.date).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
      const skills = [...new Set(s.attempts.map(a => SKILL_LABELS[a.skillType]).filter(Boolean))];
      return `
        <div class="t1-hist-row">
          <div class="t1-hist-row-date">${date}</div>
          <div class="t1-hist-row-skills">${skills.slice(0, 3).join(' · ') || 'Tổng hợp'}</div>
          <div class="t1-hist-row-stats">
            <span class="t1-hist-row-count">${s.attempts.length} câu</span>
            <span class="t1-hist-row-acc ${cls}">${sc}/${s.attempts.length} đúng · ${acc}%</span>
            <span class="t1-hist-row-xp">+${xp} XP</span>
          </div>
        </div>`;
    }).join('');

  body.innerHTML = `
    <div class="t1-hist-summary">
      <div class="t1-hist-stat"><div class="t1-hist-num">${total}</div><div class="t1-hist-lbl">Tổng câu</div></div>
      <div class="t1-hist-stat"><div class="t1-hist-num">${accuracy}%</div><div class="t1-hist-lbl">Tỉ lệ đúng</div></div>
      <div class="t1-hist-stat"><div class="t1-hist-num">+${totalXP}</div><div class="t1-hist-lbl">Tổng XP</div></div>
    </div>
    <div class="t1-hist-list">${rows}</div>`;
}

// Close history on overlay click
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('t1-hist-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('t1-hist-overlay')) closeHistory();
  });
});
