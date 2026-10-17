// writing-practice.html — Luyện viết câu giao tiếp
// ════════════════════════════════════════════════════════
//  CONFIG
// ════════════════════════════════════════════════════════
const API = (window.AuthService && window.AuthService.API && window.AuthService.API.replace(/\/api\/?$/, '')) || 'https://englishwithdan.onrender.com';

// Sound effects (playOk/playWrong) and the on/off toggle now live in the
// shared js/shared/sound-effects.js, used via the global nav button.
document.addEventListener('DOMContentLoaded', () => {
  // #wp-main is a stable container across every state/mode — one
  // registration here covers all of them via event bubbling.
  // Gated by _wpDictGate so double-click lookup is disabled during an active
  // "Chế độ Thi thử" test session — the page promises no hints during a
  // timed test, but the dictionary previously had no gate at all here
  // (student UI audit, 2026-07-25).
  setupDictionaryDouble('wp-main', 'writing-practice', _wpDictGate);
});

// Blocks dictionary lookup only while the timed test screen is actually
// showing — #test-in-progress starts as display:none in markup and is only
// ever un-hidden while a test is in progress, so this reflects "test in
// progress" without needing separate state tracking.
function _wpDictGate() {
  if (currentMode !== 'test') return true;
  const el = document.getElementById('test-in-progress');
  return !el || el.style.display === 'none';
}

// "tra câu" sentence-lookup icon (js/shared/sentence-lookup.js) — same
// live-test condition as _wpDictGate above, just inverted (true = block).
window.__ewsExamActive = () => !_wpDictGate();

// showToast() moved to js/shared/toast.js (single source of truth — Phase 3 audit).

// ════════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════════
let currentMode  = 'practice';
// Practice
let exercises    = [];
let currentIdx   = 0;
let currentLevel = 'beginner';
let currentTopic = 'all';
let currentType  = 'all';
let sessionDone  = 0;
let sessionXP    = 0;
let sessionCorrect = 0;
let sessionAttempts = []; // buffer – gửi lên admin khi hoàn thành toàn bộ bài
let _isSubmitting = false;

// ── Per-topic completion tracking (bestScore/latestScore/completed/completedAt) ──
// Shared model with essential-grammar.html/task1-practice.html/task2-practice.html/
// task2-template.html. A topic "completes" when a practice session ending with
// that topic selected (currentTopic !== 'all') scores >=80% accuracy.
const WP_TOPIC_IDS = ['myself','family','hobbies','school','friends','food','technology','travel','health','environment'];
const TOPIC_SCORE_KEY = 'wp_topic_scores';
const TOPIC_COMPLETE_THRESHOLD = 80;
let _wpTopicScores = _safeParse(localStorage.getItem(TOPIC_SCORE_KEY), {});

function isWpTopicCompleted(topic) { const s = _wpTopicScores[topic]; return !!(s && s.completed); }

function saveWpTopicScore(topic, score) {
  const prev = _wpTopicScores[topic] || { bestScore: 0, latestScore: 0, completed: false, completedAt: null };
  const bestScore = Math.max(prev.bestScore, score);
  const completed = bestScore >= TOPIC_COMPLETE_THRESHOLD;
  const completedAt = (completed && !prev.completed) ? new Date().toISOString() : prev.completedAt;
  _wpTopicScores[topic] = { bestScore, latestScore: score, completed, completedAt };
  localStorage.setItem(TOPIC_SCORE_KEY, JSON.stringify(_wpTopicScores));
}

function wpTopicCompletedCount() {
  return WP_TOPIC_IDS.filter(isWpTopicCompleted).length;
}

function updateWpTopicChecks() {
  document.querySelectorAll('.wp-topic-btn[data-topic]').forEach(btn => {
    const topic = btn.dataset.topic;
    let icon = btn.querySelector('.wp-item-done-icon');
    if (topic !== 'all' && isWpTopicCompleted(topic)) {
      if (!icon) {
        icon = document.createElement('i');
        icon.className = 'fas fa-check-circle wp-item-done-icon';
        icon.title = 'Đã hoàn thành (≥80%)';
        btn.appendChild(icon);
      }
    } else if (icon) {
      icon.remove();
    }
  });
}

function doneTopicStatusHtml() {
  if (currentTopic === 'all') return '';
  const s = _wpTopicScores[currentTopic];
  let html = '';
  if (s && s.completed) html += '<span class="wp-status-badge wp-status-done"><i class="fas fa-check-circle"></i> Đã hoàn thành</span>';
  if (s) html += '<span class="wp-status-badge wp-status-best"><i class="fas fa-star"></i> Điểm cao nhất: ' + s.bestScore + '%</span>';
  html += '<span class="wp-status-badge"><i class="fas fa-chart-line"></i> Tiến trình: ' + wpTopicCompletedCount() + '/' + WP_TOPIC_IDS.length + ' chủ đề</span>';
  return html;
}
// Combo / timer / skip
let comboStreak    = 0;
let sessionStartTime = null;
let _timerInterval   = null;
let _skippedIds      = new Set();
// Test
let testLevel   = 'beginner';
let testCount   = 10;
let testExercises = [];
let testAnswers   = [];   // { exerciseId, userAnswer }
let testIdx       = 0;
let testRearrangeAnswer = [];
let testTimerInterval = null;
let testTimeLeft      = 0;
let testTotalTime     = 0;
let _isSubmittingTest = false;
// Rearrange
let rearrangeWords  = [];
let rearrangeAnswer = [];
// Feature toggles
let _wpAutoAdvance   = localStorage.getItem('wp_auto_advance') === 'on';
let _wpShuffle       = localStorage.getItem('wp_shuffle') === 'on';
let _autoAdvanceTick = null;
let _wpPracticeState = 'welcome';

const TYPE_LABELS = {
  translation:'🔄 Dịch câu', rearrange:'🔀 Sắp xếp từ',
  fill_blank:'✏️ Điền chỗ trống', expand:'🔡 Mở rộng câu', combine:'🔗 Nối câu'
};

// ════════════════════════════════════════════════════════
//  TEST MODE AUTO-SAVE (localStorage)
// ════════════════════════════════════════════════════════
const _WP_TEST_KEY = 'ews_wp_test';

function saveTestToStorage() {
  if (!testExercises.length || testIdx >= testExercises.length) return;
  try {
    localStorage.setItem(_WP_TEST_KEY, JSON.stringify({
      exercises: testExercises,
      answers:   testAnswers,
      idx:       testIdx,
      timeLeft:  testTimeLeft,
      level:     testLevel,
      count:     testCount,
      savedAt:   Date.now()
    }));
  } catch { /* quota – ignore */ }
}

function clearTestStorage() {
  localStorage.removeItem(_WP_TEST_KEY);
}

function _fmtWpTimeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  return `${Math.floor(s / 3600)} giờ trước`;
}

function checkResumeTest() {
  try {
    const raw = localStorage.getItem(_WP_TEST_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data.exercises?.length || data.idx == null) { clearTestStorage(); return; }
    if (Date.now() - data.savedAt > 4 * 60 * 60 * 1000) { clearTestStorage(); return; }
    const intro = document.getElementById('test-intro');
    if (!intro) return;
    let banner = document.getElementById('test-resume-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'test-resume-banner';
      banner.style.cssText = 'display:flex;align-items:center;gap:10px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;margin-top:14px;font-size:13px;flex-wrap:wrap';
      intro.appendChild(banner);
    }
    const answered = data.answers?.length || 0;
    const total    = data.exercises?.length || 0;
    const timeAgo  = _fmtWpTimeAgo(data.savedAt);
    banner.innerHTML = `
      <span style="flex:1;min-width:180px">
        📝 Bài thi dở dang: câu <strong>${answered + 1}/${total}</strong>
        <span style="color:#6b7280">(${timeAgo})</span>
      </span>
      <button onclick="resumeTest()"
        style="background:#3d8bff;color:#fff;border:none;border-radius:7px;padding:6px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">
        Tiếp tục thi
      </button>
      <button onclick="dismissTestResume()"
        style="background:none;border:1px solid #d1d5db;color:#6b7280;border-radius:7px;padding:6px 12px;font-size:12px;cursor:pointer;font-family:inherit">
        Bỏ qua
      </button>`;
    banner._resumeData = data;
    banner.style.display = 'flex';
  } catch { clearTestStorage(); }
}

function resumeTest() {
  const banner = document.getElementById('test-resume-banner');
  const data = banner?._resumeData;
  if (!data) return;
  banner.style.display = 'none';
  testExercises = data.exercises;
  testAnswers   = data.answers || [];
  testIdx       = data.idx || 0;
  testLevel     = data.level || testLevel;
  testCount     = data.count || testCount;
  document.getElementById('test-intro').style.display       = 'none';
  document.getElementById('test-in-progress').style.display = '';
  document.getElementById('test-results').style.display     = 'none';
  showTestQuestion(testIdx);
  startTestTimer(data.timeLeft ?? testExercises.length * 90);
}

function dismissTestResume() {
  const banner = document.getElementById('test-resume-banner');
  if (banner) banner.style.display = 'none';
  clearTestStorage();
}

// ════════════════════════════════════════════════════════
//  SESSION TIMER
// ════════════════════════════════════════════════════════
function startSessionTimer() {
  sessionStartTime = Date.now();
  clearInterval(_timerInterval);
  _timerInterval = setInterval(() => {
    if (!sessionStartTime) return;
    const s = Math.floor((Date.now() - sessionStartTime) / 1000);
    const m = Math.floor(s / 60), sec = s % 60;
    const txt = m + ':' + String(sec).padStart(2,'0');
    const el = document.getElementById('stat-timer');
    if (el) el.textContent = txt;
  }, 1000);
}

function stopSessionTimer() {
  clearInterval(_timerInterval);
  _timerInterval = null;
}

function getSessionElapsed() {
  if (!sessionStartTime) return 0;
  return Math.floor((Date.now() - sessionStartTime) / 1000);
}

// ════════════════════════════════════════════════════════
//  XP FLOAT ANIMATION
// ════════════════════════════════════════════════════════
function floatXP(amount) {
  // Prefer the always-visible header XP badge; fall back to stats widget
  const anchor = document.getElementById('header-xp') || document.getElementById('stat-xp');
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
//  SKIP EXERCISE
// ════════════════════════════════════════════════════════
function skipExercise() {
  const ex = exercises[currentIdx];
  if (!ex) return;
  if (_skippedIds.has(ex._id)) {
    showToast('Câu này đã bỏ qua rồi – hãy trả lời nhé! 😊', 'warn');
    return;
  }
  _skippedIds.add(ex._id);
  exercises.splice(currentIdx, 1);
  exercises.push(ex);
  showToast('Đã bỏ qua – câu này sẽ xuất hiện lại ở cuối 👋', 'info', 2000);
  showExercise(currentIdx);
}

// ════════════════════════════════════════════════════════
//  META – exercise counts per level / topic
// ════════════════════════════════════════════════════════
let _wpMeta = null;

async function loadMeta() {
  try {
    const res  = await fetch(`${API}/api/writing-practice/meta`);
    const data = await res.json();
    if (!data.success) return;
    _wpMeta = data;
    updateLevelCounts();
    updateTopicCounts();
  } catch (e) { /* silent */ }
}

function updateLevelCounts() {
  if (!_wpMeta) return;
  ['beginner', 'elementary', 'intermediate'].forEach(lvl => {
    const count = _wpMeta.counts?.[lvl]?._total || 0;
    if (!count) return;
    // Update both practice [data-level] and test [data-tlevel] buttons
    document.querySelectorAll(`.wp-level-btn[data-level="${lvl}"], .wp-level-btn[data-tlevel="${lvl}"]`).forEach(btn => {
      let badge = btn.querySelector('.wp-lc-badge');
      if (!badge) { badge = document.createElement('span'); badge.className = 'wp-lc-badge'; btn.appendChild(badge); }
      badge.textContent = count;
    });
  });
}

function updateTopicCounts() {
  if (!_wpMeta) return;
  const levelData = _wpMeta.counts?.[currentLevel] || {};
  document.querySelectorAll('.wp-topic-btn[data-topic]').forEach(btn => {
    const topic = btn.dataset.topic;
    const count = topic === 'all' ? (levelData._total || 0) : (levelData[topic] || 0);
    let badge = btn.querySelector('.wp-lc-badge');
    if (!badge) { badge = document.createElement('span'); badge.className = 'wp-lc-badge'; btn.appendChild(badge); }
    badge.textContent = count || '';
    btn.style.opacity = (count || topic === 'all') ? '' : '0.5';
  });
}

// ════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════
function setAutoAdvance(val) {
  _wpAutoAdvance = val;
  localStorage.setItem('wp_auto_advance', val ? 'on' : 'off');
  document.getElementById('toggle-auto-advance').checked       = val;
  document.getElementById('sheet-toggle-auto-advance').checked = val;
}

function setShuffleSentences(val) {
  _wpShuffle = val;
  localStorage.setItem('wp_shuffle', val ? 'on' : 'off');
  document.getElementById('toggle-shuffle').checked       = val;
  document.getElementById('sheet-toggle-shuffle').checked = val;
}

function _clearAutoAdvance() {
  clearTimeout(_autoAdvanceTick);
  _autoAdvanceTick = null;
  const cdBar = document.getElementById('wp-countdown-bar');
  if (cdBar) cdBar.style.display = 'none';
}

// Reads level/topic/type off the URL and applies them to filter state +
// button active-classes — shared by the initial page load and the
// popstate handler below (selectLevel/selectTopic/selectType now push a
// new history entry per change, so browser back/forward needs to be able
// to re-derive and re-apply the same filter state this function does).
function _applyWpUrlFilters() {
  const _wpp = new URLSearchParams(location.search);
  const _wpLvl   = _wpp.get('level');
  const _wpTopic = _wpp.get('topic');
  const _wpType  = _wpp.get('type');
  const _validWpLevels = ['beginner','elementary','intermediate'];
  const _validWpTopics = ['all','myself','family','hobbies','school','friends','food','technology','travel','health','environment'];
  const _validWpTypes  = ['all','translation','rearrange','fill_blank','expand','combine'];
  let _isWpDeepLink = false;
  if (_validWpLevels.includes(_wpLvl)) {
    currentLevel = _wpLvl;
    document.querySelectorAll('.wp-level-btn[data-level]').forEach(b =>
      b.classList.toggle('active', b.dataset.level === currentLevel));
    _isWpDeepLink = true;
  }
  if (_validWpTopics.includes(_wpTopic)) {
    currentTopic = _wpTopic;
    document.querySelectorAll('.wp-topic-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.topic === currentTopic));
    _isWpDeepLink = true;
  }
  if (_validWpTypes.includes(_wpType)) {
    currentType = _wpType;
    document.querySelectorAll('.wp-type-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.type === currentType));
    _isWpDeepLink = true;
  }
  history.replaceState(null, '', `writing-practice.html?level=${currentLevel}&topic=${currentTopic}&type=${currentType}`);
  return _isWpDeepLink;
}

// Browser back/forward after a filter change (selectLevel/selectTopic/
// selectType below now pushState instead of replaceState) — re-derive the
// filter from the URL and reload the matching exercise set.
window.addEventListener('popstate', () => {
  // Mirrors selectLevel/selectTopic/selectType's own doChange() — a
  // popstate has already changed the URL/browser state by the time this
  // fires, so there's no confirm-before-navigating gate possible here
  // (unlike the click handlers); save progress instead of losing it.
  stopSessionTimer();
  saveBatch();
  _applyWpUrlFilters();
  updateTopicCounts();
  loadExercises();
});

document.addEventListener('DOMContentLoaded', () => {
  loadXPFromStorage();
  loadMeta();
  showState('welcome');
  updateWpTopicChecks();

  // Premium promo banner (site-wide UX unification, 2026-08-26) — same
  // browsable-with-a-nudge pattern as reading/listening/speaking/writing.
  // Actual gating unchanged: startPractice()/startTest()/submit still do
  // their own proactive hasPremiumAccess() check + openUpgradeModal().
  const promoBanner = document.getElementById('premium-promo-banner');
  if (promoBanner) promoBanner.style.display = (window.AuthService && !window.AuthService.hasPremiumAccess()) ? 'flex' : 'none';

  // Read URL params to pre-configure filters (shareable links). Deep link
  // (e.g. shared/nav link with a level/topic/type in the URL) should jump
  // straight into practice instead of stopping at the welcome screen — but
  // still through startPractice() so the premium gate isn't bypassed by a
  // bookmarked/shared URL.
  if (_applyWpUrlFilters()) startPractice();

  // Init toggles from saved prefs
  document.getElementById('toggle-auto-advance').checked       = _wpAutoAdvance;
  document.getElementById('sheet-toggle-auto-advance').checked = _wpAutoAdvance;
  document.getElementById('toggle-shuffle').checked            = _wpShuffle;
  document.getElementById('sheet-toggle-shuffle').checked      = _wpShuffle;
  window.addEventListener('beforeunload', e => {
    saveBatch();
    if (currentMode === 'test' && testIdx > 0 && testIdx < testExercises.length) {
      saveTestToStorage();
      e.preventDefault();
      e.returnValue = '';
    }
  });
  checkResumeTest();
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    const quitOpen = !document.getElementById('wp-quit-overlay').classList.contains('hidden');
    if (quitOpen) return;
    const fc = document.getElementById('feedback-card');
    if (fc && !fc.classList.contains('hidden')) { e.preventDefault(); nextExercise(); }
  });
});

// logout() moved to js/auth.js (single source of truth — Phase 3 audit).
// This local copy was a real bug: it only ever cleared 'token', leaving
// 'user' (name/avatar) behind in localStorage after "logging out" — a
// session-hygiene issue on shared devices. auth.js's version clears
// 'token' + 'user' + 'lastLoginAt'.

function loadXPFromStorage() {
  const stored = _safeParse(localStorage.getItem('wp_progress'), { xp: 0, streak: 0, lastDate: "" });
  const today  = new Date().toISOString().slice(0, 10);
  if (stored.lastDate !== today) {
    stored.todayXP = 0; stored.todayDone = 0; stored.lastDate = today;
    localStorage.setItem('wp_progress', JSON.stringify(stored));
  }
  document.getElementById('header-xp').textContent     = stored.xp     || 0;
  document.getElementById('header-streak').textContent = stored.streak  || 0;
}

// ════════════════════════════════════════════════════════
//  MODE TOGGLE
// ════════════════════════════════════════════════════════
function setMode(mode) {
  if (mode === currentMode) return;
  const needConfirm = (currentMode === 'practice' && sessionDone > 0)
    || (currentMode === 'test' && testIdx > 0 && testIdx < testExercises.length);
  if (needConfirm) {
    askWpQuit(() => { stopTestTimer(); stopSessionTimer(); saveBatch(); _doSetMode(mode); }, {
      title: 'Đổi chế độ học?',
      sub: currentMode === 'practice'
        ? `Bạn đã làm ${sessionDone} bài. Chuyển chế độ sẽ mất tiến độ hiện tại.`
        : `Bài thi đang dở (câu ${testIdx + 1}/${testExercises.length}). Tiến độ sẽ bị mất.`,
      confirmText: 'Đổi chế độ',
      continueText: 'Giữ nguyên'
    });
  } else { _doSetMode(mode); }
}

function _doSetMode(mode) {
  _clearAutoAdvance();
  currentMode = mode;
  document.getElementById('btn-mode-practice').classList.toggle('active', mode === 'practice');
  document.getElementById('btn-mode-test').classList.toggle('active', mode === 'test');
  document.getElementById('practice-filters').style.display = mode === 'practice' ? '' : 'none';
  document.getElementById('test-setup').style.display        = mode === 'test'     ? '' : 'none';
  document.getElementById('mode-practice').style.display     = mode === 'practice' ? '' : 'none';
  document.getElementById('mode-test').style.display         = mode === 'test'     ? '' : 'none';
  // Sync sheet buttons
  document.getElementById('sheet-btn-mode-practice').classList.toggle('active', mode === 'practice');
  document.getElementById('sheet-btn-mode-test').classList.toggle('active', mode === 'test');
  document.getElementById('sheet-practice-filters').style.display = mode === 'practice' ? '' : 'none';
  document.getElementById('sheet-test-setup').style.display        = mode === 'test'     ? '' : 'none';
  if (mode === 'test') {
    document.getElementById('test-intro').style.display        = '';
    document.getElementById('test-in-progress').style.display  = 'none';
    document.getElementById('test-results').style.display      = 'none';
    document.getElementById('vocab-hint-btn')?.classList.add('hidden');
  }
  const widget = document.getElementById('wp-stats-widget');
  if (widget) {
    widget.style.display = (mode === 'practice' && (_wpPracticeState === 'exercise' || _wpPracticeState === 'done')) ? '' : 'none';
  }
}

// ════════════════════════════════════════════════════════
//  PRACTICE – FILTERS
// ════════════════════════════════════════════════════════
function selectLevel(level) {
  if (level === currentLevel) return;
  const doChange = () => {
    stopSessionTimer(); saveBatch();
    currentLevel = level;
    document.querySelectorAll('.wp-level-btn[data-level]').forEach(b =>
      b.classList.toggle('active', b.dataset.level === level));
    history.pushState(null, '', `writing-practice.html?level=${currentLevel}&topic=${currentTopic}&type=${currentType}`);
    updateTopicCounts();
    loadExercises();
  };
  if (sessionDone > 0) {
    askWpQuit(doChange, {
      title: 'Đổi cấp độ?',
      sub: 'Bắt đầu lại với bộ bài mới. Tiến độ hiện tại sẽ được lưu.',
      confirmText: 'Đổi ngay', continueText: 'Giữ nguyên'
    });
  } else { doChange(); }
}
function selectTopic(topic) {
  if (topic === currentTopic) return;
  const doChange = () => {
    stopSessionTimer(); saveBatch();
    currentTopic = topic;
    document.querySelectorAll('.wp-topic-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.topic === topic));
    history.pushState(null, '', `writing-practice.html?level=${currentLevel}&topic=${currentTopic}&type=${currentType}`);
    loadExercises();
  };
  if (sessionDone > 0) {
    askWpQuit(doChange, {
      title: 'Đổi chủ đề?',
      sub: 'Bắt đầu lại với chủ đề mới. Tiến độ hiện tại sẽ được lưu.',
      confirmText: 'Đổi ngay', continueText: 'Giữ nguyên'
    });
  } else { doChange(); }
}
function selectType(type) {
  if (type === currentType) return;
  const doChange = () => {
    stopSessionTimer(); saveBatch();
    currentType = type;
    document.querySelectorAll('.wp-type-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.type === type));
    history.pushState(null, '', `writing-practice.html?level=${currentLevel}&topic=${currentTopic}&type=${currentType}`);
    loadExercises();
  };
  if (sessionDone > 0) {
    askWpQuit(doChange, {
      title: 'Đổi dạng bài?',
      sub: 'Bắt đầu lại với dạng bài mới. Tiến độ hiện tại sẽ được lưu.',
      confirmText: 'Đổi ngay', continueText: 'Giữ nguyên'
    });
  } else { doChange(); }
}

// ════════════════════════════════════════════════════════
//  PRACTICE – LOAD  (no shuffle – ordered)
// ════════════════════════════════════════════════════════
async function loadExercises() {
  // A pending auto-advance timeout armed by the exercise set we're about to
  // replace must not survive into the new set — it would fire on whatever
  // ends up at the same currentIdx and silently skip that exercise.
  _clearAutoAdvance();
  showState('loading');
  try {
    const params = new URLSearchParams({ level: currentLevel, topic: currentTopic, type: currentType });
    const token = window.AuthService.getToken();
    const res  = await fetch(`${API}/api/writing-practice/exercises?${params}`, {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    const data = await window.ApiClient.handleResponse(res);
    if (!data.success || !data.exercises?.length) { showState('empty'); return; }

    exercises = _wpShuffle ? shuffle(data.exercises) : data.exercises;
    currentIdx = 0;
    sessionDone = 0; sessionXP = 0; sessionCorrect = 0; sessionAttempts = [];
    comboStreak = 0; _skippedIds = new Set();
    updateSessionStats();
    showExercise(0);
    showState('exercise');
    startSessionTimer();
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
  if (!ex) { showState('done'); showDoneSummary(); return; }

  document.getElementById('feedback-card').classList.add('hidden');
  document.getElementById('exercise-card').classList.remove('hidden');
  document.getElementById('submit-btn').classList.remove('hidden');
  document.getElementById('submit-btn').disabled = false;
  const skipBtn = document.getElementById('skip-btn');
  if (skipBtn) skipBtn.classList.toggle('hidden', _skippedIds.has(exercises[idx]?._id));

  const pct = Math.round((idx / exercises.length) * 100);
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('ex-counter').textContent  = `${idx + 1} / ${exercises.length}`;
  document.getElementById('grammar-badge').textContent = ex.grammarPoint || '';
  document.getElementById('type-tag').textContent      = TYPE_LABELS[ex.type] || ex.type;

  ['translation','rearrange','fill-blank','combine'].forEach(v =>
    document.getElementById('view-' + v).classList.add('hidden'));
  wbwTeardown(); // drop any previous word-by-word drill; showTranslationView re-inits if needed

  if (ex.type === 'translation' || ex.type === 'expand') showTranslationView(ex);
  else if (ex.type === 'rearrange')  showRearrangeView(ex);
  else if (ex.type === 'fill_blank') showFillBlankView(ex);
  else if (ex.type === 'combine')    showCombineView(ex);
}

let _vocabHintCount = 0;
let _vocabHintList  = [];

function revealVocabHint() {
  const maxHints = Math.min(3, _vocabHintList.length);
  if (_vocabHintCount >= maxHints) return;
  _vocabHintCount++;
  const row = document.getElementById('hints-row');
  row.innerHTML = '';
  const lbl = document.createElement('span');
  lbl.className = 'wp-hint-label'; lbl.textContent = '🍊';
  row.appendChild(lbl);
  _vocabHintList.slice(0, _vocabHintCount).forEach(h => {
    const chip = document.createElement('span');
    chip.className = 'wp-hint-chip';
    chip.textContent = h;
    row.appendChild(chip);
  });
  const btn = document.getElementById('vocab-hint-btn');
  const countEl = document.getElementById('vocab-hint-count');
  if (countEl) countEl.textContent = `${_vocabHintCount}/${maxHints}`;
  if (btn) btn.disabled = _vocabHintCount >= maxHints;
  if (window.AskLulu) window.AskLulu.say(btn, `Thử dùng “${_vocabHintList[_vocabHintCount - 1]}” xem sao nè 🍊`);
}

function showTranslationView(ex) {
  document.getElementById('view-translation').classList.remove('hidden');
  document.getElementById('task-instruction').textContent = ex.instruction || 'Dịch sang tiếng Anh:';
  document.getElementById('question-text').textContent    = ex.type === 'expand' ? ex.baseText || ex.question : ex.question;

  // Word-by-word "Dịch câu" drill for translation exercises: the server ships
  // ex.translationAnswer in practice mode only (never for `expand`, whose
  // sampleAnswer is just one valid rewrite). Its own bar shows the word
  // count, so the separate answerWordCount/answerLetterHint scaffold — also
  // computed server-side from the never-sent sample answer, see
  // writingPracticeService.js's sanitizeExerciseForClient — is redundant there.
  const useWbw = ex.type === 'translation' && !!ex.translationAnswer;

  const hintRow = document.getElementById('answer-hint-row');
  if (ex.answerWordCount && !useWbw) {
    document.getElementById('answer-hint-count').textContent   = `📏 ${ex.answerWordCount} từ`;
    document.getElementById('answer-hint-pattern').textContent = ex.answerLetterHint || '';
    hintRow.classList.remove('hidden');
  } else {
    hintRow.classList.add('hidden');
  }

  const box = document.getElementById('answer-box');
  box.value = '';
  document.getElementById('hints-row').innerHTML = '';
  _vocabHintList  = ex.hints || [];
  _vocabHintCount = 0;
  const btn = document.getElementById('vocab-hint-btn');
  const countEl = document.getElementById('vocab-hint-count');
  if (btn) {
    if (_vocabHintList.length > 0 && !useWbw) {
      btn.classList.remove('hidden');
      btn.disabled = false;
      if (countEl) countEl.textContent = '';
    } else {
      btn.classList.add('hidden');
    }
  }

  if (useWbw) {
    box.classList.add('hidden');
    wbwInit(ex.translationAnswer);
  }
  if (!useWbw || !_wbw) {
    // Plain textarea for `expand`, and as a safety net if the drill declined
    // the answer (e.g. no typable characters).
    box.classList.remove('hidden');
    box.focus();
  }
}

function showRearrangeView(ex) {
  document.getElementById('vocab-hint-btn')?.classList.add('hidden');
  document.getElementById('view-rearrange').classList.remove('hidden');
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
  document.getElementById('fill-sentence').innerHTML =
    _escHtml(ex.question || '').replace('___', '<span class="wp-blank-underline">___</span>');
  const opts = document.getElementById('fill-options');
  opts.innerHTML = '';
  (ex.options || []).forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'wp-option-btn'; btn.textContent = opt;
    btn.onclick = () => {
      document.getElementById('fill-input').value = opt;
      document.querySelectorAll('.wp-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
    opts.appendChild(btn);
  });
  document.getElementById('fill-input').value = '';
}

function showCombineView(ex) {
  document.getElementById('vocab-hint-btn')?.classList.add('hidden');
  document.getElementById('view-combine').classList.remove('hidden');
  document.getElementById('combine-label').textContent = ex.instruction || 'Nối hai câu thành một:';
  document.getElementById('combine-sentences').innerHTML =
    (ex.sentences || []).map(s => `<div class="wp-combine-sent">"${_escHtml(s)}"</div>`).join('');
  document.getElementById('connector-hint').innerHTML = ex.connector
    ? `<span class="wp-connector-badge">💡 Dùng: <strong>${_escHtml(ex.connector)}</strong></span>` : '';
  const combineHintRow = document.getElementById('combine-answer-hint-row');
  if (ex.answerWordCount) {
    document.getElementById('combine-answer-hint-count').textContent   = `📏 ${ex.answerWordCount} từ`;
    document.getElementById('combine-answer-hint-pattern').textContent = ex.answerLetterHint || '';
    combineHintRow.classList.remove('hidden');
  } else {
    combineHintRow.classList.add('hidden');
  }
  document.getElementById('combine-answer-box').value = '';
  document.getElementById('combine-answer-box').focus();
}

// ════════════════════════════════════════════════════════
//  PRACTICE – SUBMIT
// ════════════════════════════════════════════════════════
function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const fc = document.getElementById('feedback-card');
    if (fc && !fc.classList.contains('hidden')) { nextExercise(); }
    else { submitAnswer(); }
  }
}

function getUserAnswer() {
  const ex = exercises[currentIdx];
  if (!ex) return '';
  if (ex.type === 'rearrange')  return document.getElementById('rearrange-input').value.trim();
  if (ex.type === 'fill_blank') return document.getElementById('fill-input').value.trim();
  if (ex.type === 'combine')    return document.getElementById('combine-answer-box').value.trim();
  return document.getElementById('answer-box').value.trim();
}

async function submitAnswer() {
  if (_isSubmitting) return;
  const ex     = exercises[currentIdx];
  const answer = getUserAnswer();
  if (!answer) { showToast('Vui lòng nhập câu trả lời!', 'warn'); return; }

  _isSubmitting = true;
  document.getElementById('submit-btn').disabled = true;
  document.getElementById('checking-loader').classList.remove('hidden');

  // Abort a hung grade after 30s so the "Đang chấm…" loader can't spin
  // forever on a cold-started backend.
  const _ctrl = new AbortController();
  const _killer = setTimeout(() => _ctrl.abort(), 30000);

  try {
    const token = window.AuthService.getToken();
    const res  = await fetch(`${API}/api/writing-practice/check`, {
      method: 'POST',
      signal: _ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': 'Bearer ' + token } : {}) },
      body: JSON.stringify({ exerciseId: ex._id, userAnswer: answer })
    });
    clearTimeout(_killer);
    const data = await window.ApiClient.handleResponse(res);
    if (!data.success) throw new Error(data.message || 'Lỗi server');

    showFeedback(answer, data);
    updateProgress(data.xpEarned || 5, data.feedback?.isCorrect);
    // Buffer – không gửi ngay, chờ hoàn thành toàn bộ buổi luyện
    sessionAttempts.push({
      exerciseId: ex._id, userAnswer: answer, xpEarned: data.xpEarned || 5,
      isCorrect: data.feedback?.isCorrect ?? null,
      sampleAnswer: data.sampleAnswer || '',
      question: ex.type === 'combine' ? (ex.sentences || []).join(' + ') : (ex.question || ''),
      type: ex.type,
      grammarPoint: ex.grammarPoint || ''
    });
  } catch (err) {
    clearTimeout(_killer);
    console.error(err);
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

function showFeedback(userAnswer, data) {
  const { feedback, sampleAnswer } = data;
  document.getElementById('submit-btn').classList.add('hidden');
  const skipBtn = document.getElementById('skip-btn');
  if (skipBtn) skipBtn.classList.add('hidden');
  document.getElementById('feedback-card').classList.remove('hidden');

  const isExpand  = exercises[currentIdx]?.type === 'expand';
  const isCorrect = feedback.isCorrect;
  const banner = document.getElementById('result-banner');
  if (isExpand) {
    banner.className = 'wp-result-banner wp-result-info';
    banner.textContent = '📖 Xem câu mẫu để so sánh';
  } else if (isCorrect) {
    banner.className = 'wp-result-banner wp-result-correct';
    banner.textContent = '✅ Chính xác! Rất tốt!';
    playOk();
  } else {
    banner.className = 'wp-result-banner wp-result-wrong';
    banner.textContent = '❌ Chưa đúng – xem đáp án gợi ý';
    playWrong();
  }
  const stEl = document.getElementById('student-answer-display');
  stEl.className = 'wp-cmp-text ' + (isExpand ? '' : isCorrect ? 'wp-answer-good' : 'wp-answer-bad');
  if (!isExpand && !isCorrect && sampleAnswer) {
    stEl.innerHTML = buildAnswerDiff(userAnswer, sampleAnswer);
  } else {
    stEl.textContent = userAnswer;
  }
  document.getElementById('sample-answer-display').textContent = sampleAnswer || '';
  document.getElementById('feedback-text').textContent = feedback.feedbackVi || '';

  const exNow = exercises[currentIdx];
  const expEl = document.getElementById('explanation-box');
  if (expEl) {
    if (exNow?.explanation) {
      expEl.textContent = exNow.explanation;
      expEl.classList.remove('hidden');
    } else {
      expEl.classList.add('hidden');
    }
  }

  document.getElementById('feedback-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Auto-advance countdown
  _clearAutoAdvance();
  const cdBar = document.getElementById('wp-countdown-bar');
  if (cdBar) cdBar.style.display = 'none';
  if (_wpAutoAdvance) {
    const dur = 2000;
    if (cdBar) {
      cdBar.innerHTML = `<div class="wp-countdown-bar-inner" style="--cd-dur:${dur}ms"></div>`;
      cdBar.style.display = 'block';
    }
    _autoAdvanceTick = setTimeout(() => {
      if (cdBar) cdBar.style.display = 'none';
      nextExercise();
    }, dur);
  }
}

function updateProgress(xpEarned, isCorrect) {
  sessionDone++;
  sessionXP += xpEarned;
  if (isCorrect === true) {
    sessionCorrect++;
    comboStreak++;
    // Combo milestone toasts
    if      (comboStreak === 3)  showToast('🔥 3 đúng liên tiếp! Tuyệt vời!', 'info', 2500);
    else if (comboStreak === 5)  showToast('🔥🔥 5 đúng liên tiếp! Xuất sắc!', 'info', 2500);
    else if (comboStreak === 10) showToast('🏆 10 đúng liên tiếp! Bạn là thiên tài!', 'info', 3000);
    // Update combo badge
    const badge = document.getElementById('combo-badge');
    if (badge) {
      if (comboStreak >= 3) {
        badge.textContent = '🔥 ×' + comboStreak;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
    floatXP(xpEarned);
  } else if (isCorrect === false) {
    comboStreak = 0;
    const badge = document.getElementById('combo-badge');
    if (badge) badge.classList.add('hidden');
  }
  updateSessionStats();
  const stored = _safeParse(localStorage.getItem('wp_progress'), { xp: 0, streak: 0 });
  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  // First exercise of this calendar day → update streak
  if (!stored.todayDone) {
    if (stored.lastPracticeDate === yesterday) {
      stored.streak = (stored.streak || 0) + 1;  // consecutive day
    } else if (stored.lastPracticeDate !== today) {
      stored.streak = 1;                          // gap — restart
    }
    document.getElementById('header-streak').textContent = stored.streak || 1;
  }
  stored.todayDone = (stored.todayDone || 0) + 1;
  stored.lastPracticeDate = today;
  stored.xp = (stored.xp || 0) + xpEarned;
  stored.lastDate = today;
  localStorage.setItem('wp_progress', JSON.stringify(stored));
  document.getElementById('header-xp').textContent = stored.xp;
}

function updateSessionStats() {
  const correctStr = sessionDone ? sessionCorrect + '/' + sessionDone : '–';
  document.getElementById('stat-done').textContent    = sessionDone;
  document.getElementById('stat-xp').textContent      = sessionXP;
  document.getElementById('stat-correct').textContent = correctStr;
  document.getElementById('mob-stat-done').textContent    = sessionDone;
  document.getElementById('mob-stat-xp').textContent      = sessionXP;
  document.getElementById('mob-stat-correct').textContent = correctStr;
}

function saveBatch() {
  const token = window.AuthService.getToken();
  if (!token || !sessionAttempts.length) return;
  const attempts = [...sessionAttempts];
  sessionAttempts = []; // xoá ngay để tránh gửi 2 lần
  _saveBatchWithRetry(attempts);
}
// Cố ý KHÔNG tự động thử lại: /save-batch dùng insertMany (không idempotent),
// gọi lại tự động có thể tạo bản ghi trùng lặp nếu request đầu đã thành công
// ở server nhưng phản hồi bị mất trên client.
async function _saveBatchWithRetry(attempts) {
  const token = window.AuthService.getToken();
  if (!token) return;
  try {
    // keepalive lets this survive a beforeunload-triggered call (tab close/
    // navigation right after finishing an exercise) — a plain fetch can be
    // aborted mid-flight by the browser once the page starts unloading.
    const res = await fetch(`${API}/api/writing-practice/save-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ attempts }),
      keepalive: true
    });
    await window.ApiClient.handleResponse(res);
  } catch (e) {
    showToast('Không lưu được kết quả buổi luyện tập lên server.', 'warn');
  }
}

function nextExercise() {
  _clearAutoAdvance();
  currentIdx++;
  if (currentIdx >= exercises.length) {
    stopSessionTimer();
    showState('done'); showDoneSummary();
    saveBatch();
  } else showExercise(currentIdx);
}

function showDoneSummary() {
  const gradable = sessionAttempts.filter(a => a.type !== 'expand').length;
  const expandCount = sessionDone - gradable;
  const pct = gradable ? Math.round((sessionCorrect / gradable) * 100) : (sessionDone ? 100 : 0);
  const elapsed = getSessionElapsed();
  const m = Math.floor(elapsed / 60), s = elapsed % 60;
  const expandNote = expandCount > 0 ? ` (+${expandCount} mở rộng)` : '';
  document.getElementById('done-summary').textContent =
    `Bạn đã hoàn thành ${sessionDone} bài và kiếm được ${sessionXP} XP!`;
  // Lulu's face for the score (js/shared/playful.js).
  if (window.Mascot && window.Mascot.mount) window.Mascot.mount(document.getElementById('done-icon'), window.Mascot.moodForScore(pct));
  document.getElementById('done-stats').innerHTML =
    `<span>🎯 Đúng: ${sessionCorrect}/${gradable}${expandNote} (${pct}%)</span><span>⭐ XP: ${sessionXP}</span><span>⏱ ${m}:${String(s).padStart(2,'0')}</span>`;

  if (currentTopic !== 'all' && gradable > 0) saveWpTopicScore(currentTopic, pct);
  const topicStatusEl = document.getElementById('done-topic-status');
  if (topicStatusEl) topicStatusEl.innerHTML = doneTopicStatusHtml();
  updateWpTopicChecks();

  const wrongAttempts = sessionAttempts.filter(a => a.isCorrect === false);
  const wrongCount = wrongAttempts.length;
  const reviewDiv = document.getElementById('done-wrong-review');
  if (!reviewDiv) return;
  if (wrongCount > 0) {
    reviewDiv.innerHTML = `
      <h3 class="wp-wr-title">📋 Chi tiết câu sai (${wrongCount})</h3>
      ${wrongAttempts.map((a, i) => `
        <div class="wp-wr-item">
          <div class="wp-wr-num">❌ Câu ${i+1} — ${TYPE_LABELS[a.type] || a.type}</div>
          <div class="wp-wr-q">${_escHtml(a.question || '')}</div>
          <div class="wp-wr-row"><span class="wp-wr-lbl-you">Bạn:</span> <span class="wp-wr-your">${_escHtml(a.userAnswer || '') || '(bỏ trống)'}</span></div>
          <div class="wp-wr-row"><span class="wp-wr-lbl-ans">Đáp án:</span> <span class="wp-wr-ans">${_escHtml(a.sampleAnswer || '')}</span></div>
          ${a.grammarPoint ? `<div class="wp-wr-gp">📌 ${_escHtml(a.grammarPoint)}</div>` : ''}
        </div>`).join('')}`;
  } else if (sessionDone > 0) {
    reviewDiv.innerHTML = `<div style="text-align:center;color:#16a34a;font-weight:700;font-size:14px;margin-top:8px">🌟 Không có câu nào sai!</div>`;
  }
}

function restartExercises() {
  _clearAutoAdvance();
  if (_wpShuffle) exercises = shuffle(exercises);
  currentIdx = 0; sessionDone = 0; sessionXP = 0; sessionCorrect = 0; sessionAttempts = [];
  comboStreak = 0; _skippedIds = new Set();
  const badge = document.getElementById('combo-badge');
  if (badge) badge.classList.add('hidden');
  updateSessionStats(); showExercise(0); showState('exercise');
  startSessionTimer();
}

function tryMoreTopics() {
  if (window.innerWidth <= 768) {
    openWpSheet();
  } else {
    document.getElementById('wp-sidebar').scrollIntoView({ behavior: 'smooth' });
  }
}

function showState(state) {
  _wpPracticeState = state;
  ['welcome','loading','empty','exercise','done'].forEach(s =>
    document.getElementById('state-' + s)?.classList.toggle('hidden', s !== state));
  const widget = document.getElementById('wp-stats-widget');
  if (widget) widget.style.display = (state === 'exercise' || state === 'done') ? '' : 'none';
}

// ════════════════════════════════════════════════════════
//  TEST MODE
// ════════════════════════════════════════════════════════

async function startTest() {
  if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
    if (window.openUpgradeModal) window.openUpgradeModal();
    return;
  }
  // Disable ALL start-test buttons (desktop sidebar + mobile sheet)
  const allStartBtns = document.querySelectorAll('.wp-start-test-btn');
  allStartBtns.forEach(b => { b.disabled = true; b.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...'; });

  document.getElementById('test-intro').style.display       = 'none';
  document.getElementById('test-in-progress').style.display = '';
  document.getElementById('test-results').style.display     = 'none';

  const restoreStartBtn = () => {
    allStartBtns.forEach(b => { b.disabled = false; b.innerHTML = '<i class="fas fa-play"></i> Bắt đầu thi'; });
  };

  try {
    const params = new URLSearchParams({ level: testLevel, count: testCount });
    const token = window.AuthService.getToken();
    const res  = await fetch(`${API}/api/writing-practice/test-questions?${params}`, {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    const data = await window.ApiClient.handleResponse(res);
    if (!data.success || !data.exercises?.length) {
      showToast('Không tải được câu hỏi. Vui lòng thử lại.', 'error');
      document.getElementById('test-intro').style.display = '';
      document.getElementById('test-in-progress').style.display = 'none';
      restoreStartBtn();
      return;
    }
    testExercises = data.exercises;
    testAnswers   = [];
    testIdx       = 0;
    restoreStartBtn();
    showTestQuestion(0);
    startTestTimer(testExercises.length * 90);
    saveTestToStorage();
  } catch (err) {
    console.error(err);
    showToast('Lỗi tải câu hỏi: ' + err.message, 'error');
    document.getElementById('test-intro').style.display = '';
    document.getElementById('test-in-progress').style.display = 'none';
    restoreStartBtn();
  }
}

function showTestQuestion(idx) {
  const ex = testExercises[idx];
  if (!ex) { submitTest(); return; }

  const pct = Math.round((idx / testExercises.length) * 100);
  document.getElementById('test-progress-bar').style.width = pct + '%';
  document.getElementById('test-counter').textContent      = `${idx + 1} / ${testExercises.length}`;
  document.getElementById('test-grammar-badge').textContent = ex.grammarPoint || '';
  document.getElementById('test-type-tag').textContent      = TYPE_LABELS[ex.type] || ex.type;

  const btnNext = document.getElementById('test-next-btn');
  btnNext.innerHTML = idx === testExercises.length - 1
    ? 'Nộp bài <i class="fas fa-check"></i>'
    : 'Tiếp theo <i class="fas fa-arrow-right"></i>';

  ['test-view-text','test-view-rearrange','test-view-fill'].forEach(id =>
    document.getElementById(id).classList.add('hidden'));

  if (ex.type === 'rearrange') {
    showTestRearrange(ex);
  } else if (ex.type === 'fill_blank') {
    showTestFill(ex);
  } else {
    // translation / expand / combine
    document.getElementById('test-view-text').classList.remove('hidden');
    document.getElementById('test-instruction').textContent = ex.instruction || 'Dịch sang tiếng Anh:';
    if (ex.type === 'combine') {
      document.getElementById('test-question').textContent = '';
      document.getElementById('test-combine-sentences').innerHTML =
        (ex.sentences || []).map(s => `<div class="wp-combine-sent">"${_escHtml(s)}"</div>`).join('');
      document.getElementById('test-connector-hint').innerHTML =
        ex.connector ? `<span class="wp-connector-badge">💡 Dùng: <strong>${_escHtml(ex.connector)}</strong></span>` : '';
    } else {
      document.getElementById('test-question').textContent = ex.type === 'expand' ? (ex.baseText || ex.question) : ex.question;
      document.getElementById('test-combine-sentences').innerHTML = '';
      document.getElementById('test-connector-hint').innerHTML    = '';
    }
    document.getElementById('test-answer-box').value = '';
    document.getElementById('test-answer-box').focus();
  }
}

function showTestRearrange(ex) {
  document.getElementById('test-view-rearrange').classList.remove('hidden');
  testRearrangeAnswer = [];
  const words = shuffle([...(ex.baseWords || [])]);
  const bank  = document.getElementById('test-rearrange-bank');
  bank.innerHTML = '';
  words.forEach((w, i) => {
    const chip = document.createElement('span');
    chip.className = 'wp-word-chip'; chip.textContent = w;
    chip.dataset.word = w; chip.dataset.index = i; chip.dataset.used = 'false';
    chip.onclick = () => {
      if (chip.dataset.used === 'true') return;
      chip.dataset.used = 'true'; chip.classList.add('wp-chip-used');
      testRearrangeAnswer.push(w);
      renderTestRearrange();
    };
    bank.appendChild(chip);
  });
  document.getElementById('test-rearrange-answer').innerHTML =
    '<span class="wp-rearrange-placeholder">Bấm vào các từ để sắp xếp...</span>';
  document.getElementById('test-rearrange-input').value = '';
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
  renderTestRearrange();
}

function renderTestRearrange() {
  const area = document.getElementById('test-rearrange-answer');
  area.innerHTML = '';
  if (!testRearrangeAnswer.length) {
    area.innerHTML = '<span class="wp-rearrange-placeholder">Bấm vào các từ để sắp xếp...</span>';
  } else {
    testRearrangeAnswer.forEach((w, i) => {
      const chip = document.createElement('span');
      chip.className = 'wp-answer-chip'; chip.textContent = w;
      chip.dataset.word = w; chip.dataset.idx = i; chip.title = 'Bấm để bỏ';
      area.appendChild(chip);
    });
  }
  document.getElementById('test-rearrange-input').value = testRearrangeAnswer.join(' ');
}

function showTestFill(ex) {
  document.getElementById('test-view-fill').classList.remove('hidden');
  document.getElementById('test-fill-label').textContent = ex.instruction || 'Điền vào chỗ trống:';
  document.getElementById('test-fill-sentence').innerHTML =
    _escHtml(ex.question || '').replace('___', '<span class="wp-blank-underline">___</span>');
  const opts = document.getElementById('test-fill-options');
  opts.innerHTML = '';
  (ex.options || []).forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'wp-option-btn'; btn.textContent = opt;
    btn.onclick = () => {
      document.getElementById('test-fill-input').value = opt;
      document.querySelectorAll('#test-fill-options .wp-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
    opts.appendChild(btn);
  });
  document.getElementById('test-fill-input').value = '';
}

function getTestAnswer() {
  const ex = testExercises[testIdx];
  if (!ex) return '';
  if (ex.type === 'rearrange')  return document.getElementById('test-rearrange-input').value.trim();
  if (ex.type === 'fill_blank') return document.getElementById('test-fill-input').value.trim();
  return document.getElementById('test-answer-box').value.trim();
}

function testNextQuestion() {
  const answer = getTestAnswer();
  const ex = testExercises[testIdx];
  if (!answer && ex?.type !== 'expand') {
    showToast('Vui lòng nhập câu trả lời!', 'warn');
    return;
  }
  testAnswers.push({ exerciseId: ex._id, userAnswer: answer });
  testIdx++;
  if (testIdx >= testExercises.length) { submitTest(); }
  else { showTestQuestion(testIdx); saveTestToStorage(); }
}

async function submitTest() {
  if (_isSubmittingTest) return;
  _isSubmittingTest = true;
  stopTestTimer();
  clearTestStorage();
  document.getElementById('test-in-progress').style.display = 'none';
  document.getElementById('test-results').style.display = '';
  document.getElementById('test-score-header').innerHTML = '<div class="wp-spinner"></div><p>Đang chấm bài...</p>';
  document.getElementById('test-review-list').innerHTML = '';
  // Abort a hung multi-question grade after 45s.
  const _ctrl = new AbortController();
  const _killer = setTimeout(() => _ctrl.abort(), 45000);
  try {
    const token = window.AuthService.getToken();
    const res  = await fetch(`${API}/api/writing-practice/check-test`, {
      method:  'POST',
      signal:  _ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': 'Bearer ' + token } : {}) },
      body:    JSON.stringify({ answers: testAnswers })
    });
    clearTimeout(_killer);
    const data = await window.ApiClient.handleResponse(res);
    if (!data.success) throw new Error('Lỗi chấm bài');
    showTestResults(data);
  } catch (err) {
    clearTimeout(_killer);
    console.error(err);
    const aborted = err && (err.name === 'AbortError' || /abort/i.test(err.message || ''));
    const msg = aborted
      ? 'Chấm bài quá lâu — server có thể đang khởi động. Bài làm của bạn vẫn còn, hãy thử chấm lại.'
      : 'Lỗi khi nộp bài: ' + (err.message || '');
    document.getElementById('test-score-header').innerHTML =
      `<p style="color:#dc2626;margin-bottom:12px">${msg}</p>` +
      `<button onclick="submitTest()" style="background:var(--brand,#e53935);color:#fff;border:none;border-radius:8px;padding:9px 20px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Thử chấm lại</button>`;
  } finally {
    _isSubmittingTest = false;
  }
}

function showTestResults(data) {
  document.getElementById('test-results').style.display = '';
  const { correct, score, countable, results } = data;
  const expandCount = results.length - (countable ?? results.length);
  const { emoji, message: msg } = getScoreMessage(score);
  const expandNote = expandCount > 0 ? ` <span style="font-size:13px;opacity:.7">(+ ${expandCount} câu mở rộng)</span>` : '';
  const wpImgSrc = score >= 90 ? '/img/vocab_writingabove90%25.jpg'
                  : score >= 70 ? '/img/above7.5.jpg'
                  : score >= 60 ? '/img/band_6_7.jpg'
                  : score >= 50 ? '/img/writingbelow60%25.jpg'
                  : score >= 45 ? '/img/writingbelow50%25.jpg'
                  : '/img/writingbelow45%25.jpg';
  document.getElementById('test-score-header').innerHTML = `
    <img src="${wpImgSrc}" alt="" style="display:block;width:100%;max-width:220px;border-radius:12px;margin:0 auto 12px;object-fit:cover">
    ${window.Mascot && window.Mascot.reactHtml ? window.Mascot.reactHtml({ pct: score, text: msg, stacked: true }) : ''}
    <div class="wp-test-big-score">${window.Mascot && window.Mascot.reactHtml ? '' : emoji + ' '}${score}%</div>
    <div class="wp-test-score-msg">${window.Mascot && window.Mascot.reactHtml ? '' : msg + ' '}Đúng ${correct}/${countable || results.length} câu${expandNote}.</div>`;

  const list = document.getElementById('test-review-list');
  list.innerHTML = '';
  results.forEach((r, i) => {
    const q = r.isExpand ? (r.baseText || r.question) :
              r.type === 'combine' ? (r.sentences || []).join(' + ') : r.question;
    const statusIcon = r.isExpand ? '📖' : r.isCorrect ? '✅' : '❌';
    list.innerHTML += `
      <div class="wp-review-item ${r.isCorrect ? 'wp-review-correct' : r.isExpand ? 'wp-review-info' : 'wp-review-wrong'}">
        <div class="wp-review-num">${i + 1}</div>
        <div class="wp-review-body">
          <div class="wp-review-q">${statusIcon} ${_escHtml(q)}</div>
          <div class="wp-review-your">📝 Bạn: <em>${_escHtml(r.userAnswer || '') || '(bỏ qua)'}</em></div>
          <div class="wp-review-ans">✅ Đáp án: <strong>${_escHtml(r.sampleAnswer)}</strong></div>
          ${r.grammarPoint ? `<div class="wp-review-gp">📌 ${_escHtml(r.grammarPoint)}</div>` : ''}
          ${r.explanation ? `<div class="wp-review-gp wp-review-gp-explain">💡 ${_escHtml(r.explanation)}</div>` : ''}
        </div>
      </div>`;
  });
}

function retakeTest() {
  stopTestTimer();
  clearTestStorage();
  testIdx = 0; testExercises = []; testAnswers = [];
  document.getElementById('test-results').style.display     = 'none';
  document.getElementById('test-intro').style.display       = '';
}

// ════════════════════════════════════════════════════════
//  UTILS
// ════════════════════════════════════════════════════════
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ════════════════════════════════════════════════════════
//  MOBILE BOTTOM SHEET
// ════════════════════════════════════════════════════════

// Mobile sheet: update state only, no immediate load
function mobSetLevel(level) {
  currentLevel = level;
  document.querySelectorAll('.wp-level-btn[data-level]').forEach(b =>
    b.classList.toggle('active', b.dataset.level === level));
  updateTopicCounts();
}
function mobSetTopic(topic) {
  currentTopic = topic;
  document.querySelectorAll('.wp-topic-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.topic === topic));
}
function mobSetType(type) {
  currentType = type;
  document.querySelectorAll('.wp-type-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.type === type));
}
function mobStartLearning() {
  if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
    closeWpSheet();
    if (window.openUpgradeModal) window.openUpgradeModal();
    return;
  }
  if (sessionDone > 0) {
    closeWpSheet();
    askWpQuit(() => { stopSessionTimer(); saveBatch(); loadExercises(); }, {
      title: 'Bắt đầu bộ mới?',
      sub: 'Tiến độ hiện tại sẽ được lưu.',
      confirmText: 'Bắt đầu', continueText: 'Tiếp tục'
    });
  } else {
    stopSessionTimer(); saveBatch();
    loadExercises();
    closeWpSheet();
  }
}

// ════════════════════════════════════════════════════════
//  QUIT / STOP MODAL
// ════════════════════════════════════════════════════════
let _wpQuitCb = null;

function askWpQuit(callback, opts = {}) {
  _wpQuitCb = callback;
  const titleEl  = document.getElementById('wp-quit-title');
  const subEl    = document.getElementById('wp-quit-sub');
  const leaveBtn = document.getElementById('wp-quit-leave-btn');
  const contBtn  = document.getElementById('wp-quit-continue-btn');
  if (titleEl)  titleEl.textContent = opts.title || 'Bạn muốn dừng học?';
  if (leaveBtn) leaveBtn.innerHTML  = `<i class="fas fa-sign-out-alt"></i> ${opts.confirmText || 'Dừng lại'}`;
  if (contBtn)  contBtn.innerHTML   = `<i class="fas fa-play-circle"></i> ${opts.continueText || 'Tiếp tục học'}`;

  const showResults = sessionDone > 0 && currentMode === 'practice';
  const resultsEl = document.getElementById('wp-quit-results');
  if (resultsEl) {
    resultsEl.style.display = showResults ? '' : 'none';
    if (showResults) {
      const pct  = Math.round((sessionCorrect / sessionDone) * 100);
      const wrong = sessionDone - sessionCorrect;
      const circumference = 289.03; // 2 * π * 46
      const offset = circumference - (pct / 100) * circumference;
      const color  = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';
      const circle = document.getElementById('wp-quit-score-circle');
      if (circle) {
        circle.setAttribute('stroke-dashoffset', offset.toFixed(2));
        circle.setAttribute('stroke', color);
      }
      document.getElementById('wp-quit-ring-pct').textContent = pct + '%';
      document.getElementById('wp-quit-correct').textContent  = sessionCorrect;
      document.getElementById('wp-quit-wrong').textContent    = wrong;
      document.getElementById('wp-quit-xp').textContent       = sessionXP;
    }
  }

  if (subEl) {
    if (showResults) {
      subEl.textContent = opts.sub !== undefined ? opts.sub : 'Chuyển sẽ mất tiến độ hiện tại.';
    } else {
      subEl.textContent = opts.sub !== undefined ? opts.sub
        : sessionDone
          ? `Bạn đã làm ${sessionDone} bài và kiếm được ${sessionXP} XP hôm nay.`
          : 'Tiến độ hôm nay chưa được lưu.';
    }
  }

  document.getElementById('wp-quit-overlay').classList.remove('hidden');
}

function cancelWpQuit() {
  document.getElementById('wp-quit-overlay').classList.add('hidden');
  _wpQuitCb = null;
}

function confirmWpQuit() {
  document.getElementById('wp-quit-overlay').classList.add('hidden');
  if (_wpQuitCb) { const cb = _wpQuitCb; _wpQuitCb = null; cb(); }
}

function stopPracticeMode() {
  _clearAutoAdvance();
  if (sessionDone > 0) {
    askWpQuit(() => { stopSessionTimer(); showDoneSummary(); showState('done'); saveBatch(); });
  } else {
    stopSessionTimer();
    showState('welcome');
  }
}

function stopTestMode() {
  const resetTest = () => {
    stopTestTimer();
    clearTestStorage();
    testExercises = []; testAnswers = []; testIdx = 0;
    document.getElementById('test-in-progress').style.display = 'none';
    document.getElementById('test-results').style.display     = 'none';
    document.getElementById('test-intro').style.display       = '';
  };
  if (testIdx > 0) {
    askWpQuit(resetTest, {
      title: 'Dừng bài thi?',
      sub: `Câu ${testIdx + 1}/${testExercises.length} đang dở. Tiến độ sẽ bị mất.`,
      confirmText: 'Dừng lại', continueText: 'Tiếp tục thi'
    });
  } else {
    resetTest();
  }
}

// ── History modal ─────────────────────────────────────────────
const TYPE_LABELS_WP = { translation:'Dịch câu', rearrange:'Sắp xếp từ', fill_blank:'Điền chỗ trống', expand:'Viết lại', combine:'Kết hợp' };
const LEVEL_LABELS_WP = { beginner:'Beginner', elementary:'Elementary', intermediate:'Intermediate' };

async function openHistory() {
  document.getElementById('t1-hist-overlay').classList.remove('hidden');
  const body = document.getElementById('t1-hist-body');
  body.innerHTML = '<div style="text-align:center;padding:32px"><div class="wp-spinner"></div><p style="color:#9ca3af;margin-top:10px;font-size:13px">Đang tải...</p></div>';
  try {
    const token = window.AuthService.getToken();
    if (!token) { body.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:24px;font-size:13px">Vui lòng đăng nhập để xem lịch sử.</p>'; return; }
    const res   = await fetch(`${API}/api/writing-practice/history?limit=200`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data  = await window.ApiClient.handleResponse(res);
    if (!data.success) throw new Error(data.message);
    renderWpHistory(data.attempts || []);
  } catch (e) {
    body.innerHTML = `<p style="color:#e53935;text-align:center;padding:24px;font-size:13px">Không thể tải: ${e.message}</p>`;
  }
}

function renderWpHistory(attempts) {
  const body = document.getElementById('t1-hist-body');
  if (!attempts.length) {
    body.innerHTML = '<div class="t1-hist-empty"><div class="t1-hist-empty-icon">📭</div><p>Chưa có lịch sử. Hãy bắt đầu luyện tập!</p></div>';
    return;
  }
  // Rows are now one per topic completion (correct/total), not one per
  // sentence — a legacy row saved before this change has no totalItems and
  // counts as a single sentence ("1/1"), same fallback the admin panel uses.
  const itemCount = a => a.totalItems ?? 1;
  const total   = attempts.reduce((s, a) => s + itemCount(a), 0);
  const totalXP = attempts.reduce((s, a) => s + (a.xpEarned || 0), 0);

  // Group by date (day)
  const byDay = {};
  attempts.forEach(a => {
    const key = new Date(a.createdAt).toISOString().slice(0, 10);
    if (!byDay[key]) byDay[key] = { date: a.createdAt, list: [] };
    byDay[key].list.push(a);
  });

  const allDays = Object.values(byDay).sort((a, b) => new Date(b.date) - new Date(a.date));
  const dayCount = allDays.length;

  const rows = allDays
    .slice(0, 30)
    .map(d => {
      const xp      = d.list.reduce((s, a) => s + (a.xpEarned || 0), 0);
      const done    = d.list.reduce((s, a) => s + itemCount(a), 0);
      const correct = d.list.reduce((s, a) => s + (a.correctItems ?? (a.xpEarned >= 15 ? 1 : 0)), 0);
      const date = new Date(d.date).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
      const types = [...new Set(d.list.flatMap(a => a.types || (a.type ? [a.type] : [])).map(t => TYPE_LABELS_WP[t]).filter(Boolean))];
      const levels = [...new Set(d.list.map(a => LEVEL_LABELS_WP[a.level]).filter(Boolean))];
      return `<div class="t1-hist-row">
        <div class="t1-hist-row-date">${date}</div>
        <div class="t1-hist-row-skills">${levels.join(' · ')}${types.length ? ' · ' + types.slice(0,2).join(', ') : ''}</div>
        <div class="t1-hist-row-stats">
          <span class="t1-hist-row-count">${correct}/${done} câu đúng</span>
          <span class="t1-hist-row-xp">+${xp} XP</span>
        </div>
      </div>`;
    }).join('');

  body.innerHTML = `
    <div class="t1-hist-summary">
      <div class="t1-hist-stat"><div class="t1-hist-num">${total}</div><div class="t1-hist-lbl">Tổng bài</div></div>
      <div class="t1-hist-stat"><div class="t1-hist-num">${dayCount}</div><div class="t1-hist-lbl">Ngày học</div></div>
      <div class="t1-hist-stat"><div class="t1-hist-num">+${totalXP}</div><div class="t1-hist-lbl">Tổng XP</div></div>
    </div>
    <div>${rows}</div>`;
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('t1-hist-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('t1-hist-overlay')) closeHistory();
  });
});
