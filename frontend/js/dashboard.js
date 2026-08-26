'use strict';
/* ══════════════════════════════════════════════
   CONFIG & STATE
══════════════════════════════════════════════ */
const API = 'https://englishwithdan.onrender.com/api';
function authH() {
    return { ...window.AuthService.authHeader(), 'Content-Type': 'application/json' };
}

// ── UI State ──────────────────────────────────
let myBooks = [];
let currentBookId = null;
let currentBookData = null;
let selectedWordIds = new Set();

// ── Unit State ─────────────────────────────────
let currentUnit = null;
let practiceWords = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let currentMode = 'study';
let currentWord = null;
let isFlipped = false;
let hintUsed = false;
let answered = false;
let _listenHintCount = 0; // presses used so far on the current Listen-mode question — capped at 3
const LISTEN_HINT_MAX = 3;
// Sound on/off is now the shared js/shared/sound-effects.js toggle

// ── Spaced Repetition & Mixed Mode ─────────────
let wrongWordSet = new Set();   // word strings that were answered wrong this session
let requeuedWords = new Set();  // prevent infinite requeue
let mixedQueue = [];            // [{word, type}] for mixed mode
let mixedIndex = 0;
// Gates dictionary double-click/highlight lookup off during any scored vocab
// quiz (multipleChoice/fillBlank/listening/translation/mixed — all started
// via startPractice()), on during non-quiz browsing (word list/study mode/
// flashcard review) and once showResults() ends the session (both on normal
// completion and via stopPractice()'s early exit).
let _vocabQuizActive = false;
let _retryWordList = null;      // set by retryWrongWords, consumed by startPractice
// Real VocabBook words (have a Mongo _id) answered at least once this
// session, keyed by _id — populated centrally in _countAnswer() so every
// practice mode (Flashcard/Quiz/Listen/Translate/Mixed/Review-due/Weak-
// vocab) feeds the SAME end-of-session sync (_syncPracticeEvidence in
// showResults()) instead of each mode persisting evidence its own way.
// Words without a real _id (Paraphrase/curriculum Units) are never added
// here — there's no SRS state on the server to update for them.
let _vocabWordsSeen = new Map();

// ── Session streak tracking ────────────────────
let sessionAnsweredCount = 0;
// How much of sessionAnsweredCount/correctAnswers has already been sent to
// /vocabbook/practice-complete — reporting is batched in groups of 5 rather
// than once per session (see _reportSessionStreak()), so both of these
// track "as of the last successful report", not "ever reported at all".
let _lastReportedAnsweredCount = 0;
let _lastReportedCorrectCount = 0;
let _streakReportInFlight = false; // prevents two overlapping /practice-complete calls, not a "never again" gate
// Fresh per startPractice() call — sent with every batched /practice-complete
// report so the backend can scope the streak-bonus tier to THIS session's
// own running accuracy instead of re-evaluating it on every 5-answer batch
// (see backend/services/vocabBookService.js's reserveStreakBonusForSession
// for the "học xong ngay lập tức được 5 lửa" bug this fixes).
let _vocabSessionId = null;
function _newVocabSessionId() {
    return 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
let _persistedThisSession = false; // prevent double-counting wrongCount on multiple showResults calls

// ── Búa Daniel (streak-restore hammer) ─────────
let _hammerState = { streakHammers: 0, canUseHammer: false };
// _reportSessionStreak() fires every 5 new answers (first as soon as
// sessionAnsweredCount hits 5, then again at 10, 15, ...) — for any unit
// longer than 5 words that's mid-quiz, long before the student reaches
// the Results screen. A transient toast shown at that moment is
// gone by the time they actually get there, so a hammer award needs to be
// announced ON the Results screen instead of immediately: if resultsMode
// is already visible when the award arrives, show the banner right away;
// otherwise stash it and showResults() shows it when it renders.
let _pendingHammerAnnouncement = false;
function announceHammerEarned() {
    const banner = document.getElementById('hammer-earned-banner');
    const resultsVisible = document.getElementById('resultsMode')?.style.display !== 'none';
    if (banner && resultsVisible) {
        banner.style.display = 'block';
    } else {
        _pendingHammerAnnouncement = true;
    }
}

// ── Vocab book practice tracking ───────────────
let _isBookPractice = false;     // true khi luyện từ sổ cá nhân, false khi luyện unit
let _isDifficultPractice = false; // true khi ôn từ hay sai
// Separate from _isDifficultPractice above (which startPractice() resets on
// every mode switch, for its own wrongCount-persistence purpose) — this one
// stays true for the whole "Từ hay sai" sidebar session regardless of which
// practice mode tab is active, so _activateModeNow() can reliably skip URL
// syncing for it (an ephemeral, non-bookmarkable computed list, not a real
// book/unit resource).
let _isHardWordsSession = false;

// ── Flashcard auto-advance timer ──────────────
let _autoNextTimer = null;
function _clearAutoNext() {
    if (_autoNextTimer !== null) { clearTimeout(_autoNextTimer); _autoNextTimer = null; }
}

// ── Fullscreen toggle (unit study view) ───────
// Targets #view-unit itself (đồng bộ với reading/listening/writing's
// per-screen fullscreen), not document.documentElement — the global nav
// bar and the notebook sidebar are outside #view-unit, so this actually
// hides them for a distraction-free study view instead of just dropping
// the browser chrome while leaving the whole page layout in place.
function toggleDashFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen && document.exitFullscreen();
        return;
    }
    const el = document.getElementById('view-unit');
    (el || document.documentElement).requestFullscreen && (el || document.documentElement).requestFullscreen();
}
document.addEventListener('fullscreenchange', () => {
    const icon = document.getElementById('fs-icon-dash');
    if (icon) {
        const isFs = !!document.fullscreenElement;
        icon.className = isFs ? 'fas fa-compress' : 'fas fa-expand';
        const btn = document.getElementById('btn-fullscreen-dash');
        if (btn) btn.title = isFs ? 'Thoát toàn màn hình' : 'Toàn màn hình';
    }
    // Floating UI (quit-practice modal, dictionary popups, keyboard-shortcut
    // hint) all live outside #view-unit, appended near the end of <body> —
    // without moving them, they'd render invisible while #view-unit is the
    // fullscreen element, since only its own subtree is painted. Mirrors
    // writing.js's identical re-parenting for its own exam fullscreen.
    const fsEl = document.fullscreenElement;
    const floatingIds = ['modal-quit-practice', 'dict-popup', 'dict-vocab-modal', 'kbd-hint-panel'];
    if (fsEl) {
        floatingIds.forEach(id => {
            const m = document.getElementById(id);
            if (m && !fsEl.contains(m)) { m._fsPrev = m.parentNode; fsEl.appendChild(m); }
        });
    } else {
        floatingIds.forEach(id => {
            const m = document.getElementById(id);
            if (m && m._fsPrev) { m._fsPrev.appendChild(m); m._fsPrev = null; }
        });
    }
});

function _countAnswer() {
    sessionAnsweredCount++;
    // Every check*/markAs* function calls _countAnswer() exactly once per
    // answer, after wrongWordSet/correctAnswers already reflect this
    // answer's outcome — the single hook point where "this word was seen
    // this session" can be recorded without touching each mode individually.
    if (currentWord?._id) _vocabWordsSeen.set(currentWord._id, currentWord);
    if (sessionAnsweredCount - _lastReportedAnsweredCount >= 5) {
        _reportSessionStreak();
    }
}

// ── Save-word pending ──────────────────────────
let pendingSaveWord = null;
let selectedBookForSave = null;

// ── Audio ──────────────────────────────────────
// Sound effects + speakWord() TTS (with its multi-layer fallback) moved to
// js/dashboard-audio.js — loaded before this file, see dashboard.html.

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
    const user = window.AuthService.getUser() || {};
    const name = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || '';

    // Premium upsell banner — free-plan students only (staff always have
    // premium-equivalent access via hasPremiumAccess()). Same visual as
    // reading.html/listening.html's #premium-promo-banner, but this one is
    // dashboard-specific per the product ask ("thông báo nổi ngay trên
    // dashboard"), not a global nav.js banner shown on every page.
    const dashPremiumBanner = document.getElementById('dash-premium-banner');
    if (dashPremiumBanner && !window.AuthService.hasPremiumAccess(user)) {
        dashPremiumBanner.style.display = 'flex';
    }
    // Show avatar initial
    const navAv = document.getElementById('navAvatar');
    if (navAv && name) navAv.textContent = name[0].toUpperCase();
    if (navAv && user.avatar) {
      navAv.style.background = 'none';
      navAv.innerHTML = '';
      const navImg = document.createElement('img');
      navImg.src = user.avatar;
      navImg.alt = 'avatar';
      navImg.style.cssText = 'width:28px;height:28px;border-radius:50%;object-fit:cover;';
      navAv.appendChild(navImg);
    }

    // Preload voices (Chrome cần gọi getVoices trước)
    if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }

    setupEmojiPicker();
    // Only loadMyBooks() actually gates the deep-link restore below (openBook
    // looks the book up in myBooks) — everything else here is a decorative
    // home-screen widget (streak, leaderboards, weakness card, etc.) with no
    // bearing on what the URL asks to open. Firing those in parallel rather
    // than awaiting all 10 up front means a reload mid-unit/mid-lesson shows
    // the actual content the URL points at without waiting on a full page's
    // worth of secondary widgets first.
    loadStreakAndUpdateMascot(); loadWeeklyProgress(); updateDifficultBadge(); loadStreakLeaderboard(); loadClassroomAndTodaysLesson(); loadQuizLeaderboard(); loadMyVocabStats(); loadWeaknessProfile();
    await Promise.all([loadMyBooks(), loadUnits()]);

    // Restore whichever book/unit the URL points at (deep link, bookmark,
    // or a plain reload) — same "restore on load" idiom as reading-v2.js's
    // testIdParam/passageIdParam handling. replaceState first so
    // history.state is populated for THIS entry even on a bare load that
    // never ran through pushState (a direct load's history.state is
    // otherwise null, which popstate later needs to restore correctly).
    const params    = new URLSearchParams(location.search);
    const viewParam = params.get('view') || 'home';
    const bookIdParam = params.get('bookId');
    const unitParam = params.get('unit');
    const modeParam = params.get('mode');
    const lessonIdParam = params.get('lessonId');
    history.replaceState({ view: viewParam, bookId: bookIdParam, unit: unitParam, mode: modeParam, lessonId: lessonIdParam }, '', location.href);
    if (viewParam === 'book' && bookIdParam) {
        openBook(bookIdParam, false);
    } else if (viewParam === 'unit' && unitParam) {
        loadUnit(unitParam, false, modeParam);
    } else if (viewParam === 'lesson' && lessonIdParam) {
        openLesson(lessonIdParam, false);
    }
});

// Distinct from closeUnitView() (which returns to whatever book was open
// before entering unit-practice, or the welcome screen if none) — this
// unconditionally goes to the true homepage, which is what a popstate
// targeting {view:'home'} means regardless of what currentBookId was.
function goHomeView(push = true) {
    const doGo = () => {
        _clearAutoNext();
        currentBookId = null;
        document.querySelectorAll('.book-item, .sheet-book-item').forEach(el => el.classList.remove('active'));
        document.getElementById('view-unit').style.display = 'none';
        document.getElementById('view-lesson').style.display = 'none';
        document.getElementById('view-mybook').style.display = 'flex';
        document.getElementById('book-welcome').style.display = 'flex';
        document.getElementById('book-content').style.display = 'none';
        if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });
        syncViewUrl(push ? 'push' : 'replace', { view: 'home' });
    };
    askQuitPractice(doGo);
}

// Sidebar nav links / mobile hamburger menu (both rendered by the
// page-agnostic js/nav.js, which has no knowledge of this page's quiz/
// practice state) navigate away as a real page load with zero warning
// otherwise — the native browser confirm is the only hook that can catch
// every such exit path (plus tab close/refresh) in one place (student UI
// audit, Nhóm 3, 2026-07-25).
window.addEventListener('beforeunload', (e) => {
    if (_isActivePractice()) { // already covers both Unit practice and Lesson quiz
        e.preventDefault();
        e.returnValue = '';
    }
});

window.addEventListener('popstate', (e) => {
    const st = e.state || { view: 'home' };
    if (st.view === 'book' && st.bookId) {
        openBook(st.bookId, false);
    } else if (st.view === 'unit' && st.unit) {
        loadUnit(st.unit, false, st.mode);
    } else if (st.view === 'lesson' && st.lessonId) {
        openLesson(st.lessonId, false);
    } else {
        goHomeView(false);
    }
});

/* ══════════════════════════════════════════════
   ANIMATION UTILITIES
══════════════════════════════════════════════ */

/* Count-up từ giá trị hiện tại lên target */
function animateCount(el, target, duration = 480) {
    if (!el) return;
    const from = parseInt(el.textContent, 10) || 0;
    if (from === target) return;
    const startTime = performance.now();
    function step(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        el.textContent = Math.round(from + (target - from) * eased);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target; // đảm bảo chính xác
    }
    requestAnimationFrame(step);
}

/* Confetti burst – dùng khi đạt thành tích */
function spawnConfetti(count = 60) {
    const colors = ['#e53935','#3d8bff','#22c55e','#f59e0b','#a78bfa','#fb7185','#34d399'];
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-particle';
        const size = 5 + Math.random() * 8;
        el.style.cssText =
            `left:${8 + Math.random() * 84}%;` +
            `background:${colors[Math.floor(Math.random() * colors.length)]};` +
            `animation:confettiFall ${0.9 + Math.random() * 1.3}s ${Math.random() * 0.35}s linear forwards;` +
            `width:${size}px;height:${size}px;` +
            `border-radius:${Math.random() > .5 ? '50%' : '2px'};`;
        document.body.appendChild(el);
        el.addEventListener('animationend', () => el.remove(), { once: true });
    }
}

/* Kiểm tra xem sổ đã thuộc hết chưa → celebrate */
function checkBookCompletion() {
    if (!currentBookData?.words?.length) return;
    const total    = currentBookData.words.length;
    const mastered = currentBookData.words.filter(w => w.status === 'da-thuoc').length;
    if (mastered === total) {
        const fill = document.getElementById('book-progress-fill');
        if (fill) {
            fill.classList.remove('complete');
            // Force reflow để restart animation
            void fill.offsetWidth;
            fill.classList.add('complete');
            setTimeout(() => fill.classList.remove('complete'), 2800);
        }
        spawnConfetti(90);
        toast(`🎉 Excellent! You've mastered all ${total} words!`, 'success');
    }
}

/* ══════════════════════════════════════════════
   HELPERS
   toast() moved to js/shared/toast.js (single source of truth —
   Phase 3 audit). Page must load shared/toast.js before this file.
══════════════════════════════════════════════ */
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// confirm2() moved to js/shared/confirm-dialog.js (single source of truth —
// Phase 3 audit). dashboard.html's old static #modal-confirm markup is no
// longer used (shared/confirm-dialog.js builds its own) but was left in
// place rather than removed, to avoid touching unrelated markup.

function pad(n) { return String(n).padStart(2, '0'); }
// playCorrectSound()/playWrongSound() live in js/dashboard-audio.js
// alongside speakWord(); the on/off toggle itself is the shared global nav
// button (js/shared/sound-effects.js).
function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
}

/* ══════════════════════════════════════════════
   MASCOT PANDA – STREAK & MOTIVATION
══════════════════════════════════════════════ */
const MASCOT_MSGS = [
    ['🔥 {n}-day streak! Amazing – keep it up! 🌟', 7],
    ['😤 {n} days in a row! No joke, you\'re doing great!', 3],
    ['🥳 {n} days! Every word brings you closer to 7.0+!', 2],
    ['💪 Keep going! Daily study builds an amazing habit!', 0],
];
function getMascotMsg(streak) {
    for (const [msg, min] of MASCOT_MSGS) {
        if (streak >= min) return msg.replace('{n}', streak);
    }
    return '💪 Let\'s study! I believe in you!';
}
function getMascotEmoji(streak) {
    if (streak >= 30) return '🐼🎉';
    if (streak >= 14) return '🐼🌟';
    if (streak >= 7)  return '🐼🔥';
    if (streak >= 3)  return '🐼😊';
    return '🐼';
}

// Fire tier ladder — every fire icon/number pairing (homepage mascot card,
// book-content mascot banner, leaderboard rows) uses this so a student's
// streak color stays consistent everywhere it's shown. 500+ ("legendary")
// returns null color and instead relies on the .fire-legendary CSS class
// for a gradient effect that a flat color can't express.
const FIRE_TIERS = [
    { min: 500, color: null,      cls: 'fire-legendary' }, // gradient
    { min: 400, color: '#eab308', cls: '' },  // gold
    { min: 300, color: '#10b981', cls: '' },  // emerald
    { min: 200, color: '#06b6d4', cls: '' },  // cyan
    { min: 150, color: '#3b82f6', cls: '' },  // blue
    { min: 100, color: '#a855f7', cls: '' },  // purple
    { min: 60,  color: '#dc2626', cls: '' },  // crimson
    { min: 30,  color: '#ef4444', cls: '' },  // red
];
function getFireTier(streak) {
    for (const tier of FIRE_TIERS) {
        if (streak >= tier.min) return tier;
    }
    return { min: 0, color: null, cls: '' }; // default orange, from CSS
}
// Applies the tier color/class to a fire icon + its adjoining streak number.
function applyFireTier(fireEl, numEl, streak) {
    const tier = getFireTier(streak);
    [fireEl, numEl].forEach(el => {
        if (!el) return;
        el.classList.remove('fire-legendary');
        if (tier.cls) el.classList.add(tier.cls);
        el.style.color = tier.cls ? '' : (tier.color || '');
    });
}

// Sarcastic "Dan" (our panda mascot, named after thầy Daniel) reacting to a
// dead streak — angry if you just torched a streak bigger than 10 days,
// sad-but-forgiving otherwise. previousStreak comes from the backend and is
// only non-zero right after resetIfStale() detects a missed-day reset; it
// clears itself the moment the student studies again.
const ANGRY_MSGS = [
    n => `😡 Dan CỰC KỲ TỨC GIẬN vì bạn vừa làm bay màu ${n} ngày streak! ${n} NGÀY! Học 1 từ ngay đi, không Dan giận cả tuần cho xem.`,
    n => `😤 ${n} ngày công sức... đi tong trong một nốt nhạc. Dan không khóc đâu, Dan chỉ đang tức giận dữ dội thôi.`,
    n => `🔥💔 Streak ${n} ngày vừa nằm xuống. Dan đang thắp hương cho nó — còn bạn thì đang làm gì thế?`
];
const SAD_MSGS = [
    '😢 Dan đang buồn thiu vì hôm nay chưa thấy bạn học từ nào cả...',
    '🥺 0 ngày streak. Dan ngồi một mình cắn hạt dưa cả ngày, buồn ơi là buồn.',
    '😭 Dan tưởng bạn quên mất Dan rồi... học 1 từ thôi là Dan vui liền!'
];
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getMascotState(streak, previousStreak) {
    if (streak === 0 && previousStreak > 10) {
        return { mood: 'angry', img: 'img/loststreak.jpg', alt: 'Dan đang tức giận', msg: pick(ANGRY_MSGS)(previousStreak) };
    }
    if (streak === 0) {
        return { mood: 'sad', img: 'img/listening_readingbelow40%25.jpg', alt: 'Dan đang buồn', msg: pick(SAD_MSGS) };
    }
    return { mood: 'happy', emoji: getMascotEmoji(streak), msg: getMascotMsg(streak) };
}

// Applies one mascot state to every matching {panda, num, msg, card} group
// found on the page — dashboard.html has two copies (the welcome view's
// "dan-*" banner and the book-content view's "mascot-*" banner) that both
// need to reflect the same streak.
function applyMascotState(streak, previousStreak) {
    const state = getMascotState(streak, previousStreak);
    const groups = [
        { panda: 'mascot-panda', num: 'mascot-streak-num', msg: 'mascot-msg', card: null,             fire: 'mascot-fire' },
        { panda: 'dan-mascot',   num: 'dan-streak-num',   msg: 'dan-streak-msg', card: 'dan-streak-card', fire: 'dan-fire' }
    ];
    for (const g of groups) {
        const pandaEl = document.getElementById(g.panda);
        const numEl   = document.getElementById(g.num);
        const msgEl   = document.getElementById(g.msg);
        const cardEl  = g.card ? document.getElementById(g.card) : null;
        const fireEl  = document.getElementById(g.fire);
        if (numEl) numEl.textContent = streak;
        if (msgEl) msgEl.textContent = state.msg;
        if (pandaEl) {
            pandaEl.innerHTML = state.img
                ? `<img src="${state.img}" alt="${state.alt || ''}">`
                : '';
            if (!state.img) pandaEl.textContent = state.emoji;
        }
        if (cardEl) cardEl.classList.toggle('is-angry', state.mood === 'angry');
        if (cardEl) cardEl.classList.toggle('is-sad', state.mood === 'sad');
        applyFireTier(fireEl, numEl, streak);
    }
}

async function loadStreakAndUpdateMascot() {
    try {
        const res  = await fetch(`${API}/user/stats`, { headers: authH() });
        const data = await window.ApiClient.handleResponse(res);
        if (!data.success) return;
        const streak = data.stats?.streak ?? 0;
        const previousStreak = data.stats?.previousStreak ?? 0;
        applyMascotState(streak, previousStreak);
        _hammerState.streakHammers = data.stats?.streakHammers ?? 0;
        _hammerState.canUseHammer  = data.stats?.canUseHammer ?? false;
        renderHammerUI();
    } catch { /* silent */ }
}

// Búa Daniel badge (always shown when the student owns >=1) + the
// "restore streak" button (shown only while actually eligible — see
// User.canUseHammer() on the backend for the exact 3-day/streak-lost rule).
function renderHammerUI() {
    const badge   = document.getElementById('dan-hammer-badge');
    const countEl = document.getElementById('dan-hammer-count');
    const btn     = document.getElementById('btn-use-hammer');
    if (badge) badge.style.display = _hammerState.streakHammers > 0 ? 'inline-flex' : 'none';
    if (countEl) countEl.textContent = _hammerState.streakHammers;
    if (btn) btn.style.display = _hammerState.canUseHammer ? 'inline-flex' : 'none';
}

async function useHammer() {
    const btn = document.getElementById('btn-use-hammer');
    if (btn) { btn.disabled = true; }
    try {
        const res = await fetch(`${API}/user/streak/use-hammer`, { method: 'POST', headers: authH() });
        const d = await window.ApiClient.handleResponse(res);
        toast(`🔨 Đã khôi phục streak ${d.streak} ngày!`, 'success');
        await loadStreakAndUpdateMascot();
        loadWeeklyProgress();
    } catch (err) { toast(err.message || 'Không thể dùng búa lúc này', 'error'); }
    finally { if (btn) btn.disabled = false; }
}

// "My Vocabulary" stat tiles — aggregate totals across ALL of a student's
// books (GET /vocabbook/stats), distinct from the per-book counters already
// shown in the sidebar/book-detail view (those only ever reflect ONE book).
// Hidden entirely rather than showing all-zero tiles when a brand new
// student has no words saved anywhere yet.
async function loadMyVocabStats() {
    const wrap = document.getElementById('myvocab-stats');
    if (!wrap) return;
    try {
        const res = await fetch(`${API}/vocabbook/stats`, { headers: authH() });
        const data = await window.ApiClient.handleResponse(res);
        const s = data.stats || {};
        if (!s.totalWords) { wrap.style.display = 'none'; return; }
        document.getElementById('myvocab-saved').textContent = s.totalWords;
        document.getElementById('myvocab-review').textContent = s.dueToday;
        document.getElementById('myvocab-weak').textContent = s.weak;
        document.getElementById('myvocab-mastered').textContent = s.mastered;
        wrap.style.display = '';
    } catch {
        wrap.style.display = 'none';
    }
}

// Vietnamese labels for the raw enum values weaknessService returns —
// question `type` (Reading/Listening) and grading `criterion` (Writing/
// Speaking). Listening reuses most of Reading's type names but has its own
// enum (e.g. 'matching' instead of 'matching-headings'), so both maps are
// kept separate rather than merged.
const READING_TYPE_LABELS = {
    'true-false-ng': 'True/False/Not Given',
    'yes-no-ng': 'Yes/No/Not Given',
    'multiple-choice': 'Trắc nghiệm',
    'multi-answer-group': 'Chọn nhiều đáp án',
    'fill-blank': 'Điền từ',
    'sentence-completion': 'Hoàn thành câu',
    'matching-headings': 'Nối tiêu đề',
    'matching-info': 'Nối thông tin',
    'checkbox': 'Chọn nhiều đáp án',
    'map-labelling': 'Gắn nhãn bản đồ',
};
const LISTENING_TYPE_LABELS = {
    'multiple-choice': 'Trắc nghiệm',
    'fill-blank': 'Điền từ',
    'sentence-completion': 'Hoàn thành câu',
    'matching': 'Nối thông tin',
    'map-labelling': 'Gắn nhãn bản đồ',
    'checkbox': 'Chọn nhiều đáp án',
    'multi-answer-group': 'Chọn nhiều đáp án',
    'matching-info': 'Nối thông tin',
};
const WRITING_CRITERIA_LABELS = { ta: 'Task Achievement/Response', cc: 'Mạch lạc & Liên kết', lr: 'Từ vựng', gra: 'Ngữ pháp' };
const SPEAKING_CRITERIA_LABELS = { fluency: 'Độ trôi chảy', vocabulary: 'Từ vựng', grammar: 'Ngữ pháp', pronunciation: 'Phát âm' };

// "Điểm cần cải thiện" — shows, per skill, the single weakest question type
// (Reading/Listening) or grading criterion (Writing/Speaking) the student
// has enough history on to trust (see weaknessService.MIN_SAMPLE_SIZE).
// Hidden entirely for a student with no signal yet in any skill.
// Cached by the fetch below purely for _weaknessCardHasVocabSignal() to read
// synchronously elsewhere on the page (e.g. deciding whether the "Từ yếu"
// tile's click target should launch practice or explain there's nothing to
// practice yet) — always re-fetched fresh before actually launching a
// practice session (see practiceWeakVocab()), never trusted as the source
// of truth for an action.
let _cachedWeakVocabCount = null;

// Shows exactly one of three states — never silently identical to another:
//   1. Chips: at least one skill (incl. Vocabulary) has enough history.
//   2. Empty: request succeeded, genuinely not enough data yet anywhere.
//   3. Error: the request itself failed (network/500/etc.) — distinct
//      message + a Try Again button, so a real outage never looks like
//      "you just haven't practiced enough".
async function loadWeaknessProfile() {
    const card       = document.getElementById('weakness-card');
    const list       = document.getElementById('weakness-chips');
    const emptyState = document.getElementById('weakness-empty-state');
    const errorState = document.getElementById('weakness-error-state');
    if (!card || !list || !emptyState || !errorState) return;

    card.style.display = '';
    list.style.display = 'none';
    emptyState.style.display = 'none';
    errorState.style.display = 'none';

    let data, weakVocab;
    try {
        [data, weakVocab] = await Promise.all([
            fetch(`${API}/weakness`, { headers: authH() }).then(r => window.ApiClient.handleResponse(r)),
            fetch(`${API}/vocabbook/weak?limit=20`, { headers: authH() }).then(r => window.ApiClient.handleResponse(r)),
        ]);
    } catch {
        errorState.style.display = '';
        return;
    }

    const weakWords = weakVocab.words || [];
    _cachedWeakVocabCount = weakWords.length;

    const chips = [];
    if (data.reading?.length) {
        const w = data.reading[0];
        chips.push({ icon: 'fa-book-open', color: 'blue', skill: 'Reading', label: READING_TYPE_LABELS[w.type] || w.type, detail: `${Math.round(w.accuracy * 100)}% đúng`, href: 'reading.html' });
    }
    if (data.listening?.length) {
        const w = data.listening[0];
        chips.push({ icon: 'fa-headphones', color: 'purple', skill: 'Listening', label: LISTENING_TYPE_LABELS[w.type] || w.type, detail: `${Math.round(w.accuracy * 100)}% đúng`, href: 'listening.html' });
    }
    if (data.writing?.length) {
        const w = data.writing[0];
        chips.push({ icon: 'fa-pen-nib', color: 'pink', skill: 'Writing', label: WRITING_CRITERIA_LABELS[w.criterion] || w.criterion, detail: `Band ${w.avgScore.toFixed(1)}`, href: 'writing.html' });
    }
    if (data.speaking?.length) {
        const w = data.speaking[0];
        chips.push({ icon: 'fa-microphone', color: 'orange', skill: 'Speaking', label: SPEAKING_CRITERIA_LABELS[w.criterion] || w.criterion, detail: `Band ${w.avgScore.toFixed(1)}`, href: 'speaking.html' });
    }
    if (weakWords.length) {
        chips.push({
            icon: 'fa-bookmark', color: 'green', skill: 'Vocabulary',
            label: weakWords.length >= 20 ? '20+ weak words' : `${weakWords.length} weak words`,
            detail: 'Practice weak vocabulary', href: null, action: 'practiceWeakVocab()',
        });
    }

    if (!chips.length) {
        emptyState.style.display = '';
        return;
    }

    list.innerHTML = chips.map(c => {
        // href-based chips (Reading/Listening/Writing/Speaking) are real
        // <a> links; the Vocabulary chip launches a JS action instead, same
        // clickable-<div> convention as .myvocab-tile--clickable.
        const tag = c.href ? 'a' : 'div';
        const attrs = c.href ? `href="${c.href}"` : `onclick="${c.action}" role="button" tabindex="0"`;
        return `
            <${tag} class="weakness-chip weakness-chip--${c.color}" ${attrs}>
                <div class="weakness-chip-icon"><i class="fas ${c.icon}"></i></div>
                <div class="weakness-chip-body">
                    <div class="weakness-chip-skill">${c.skill}</div>
                    <div class="weakness-chip-label">${c.label}</div>
                    <div class="weakness-chip-detail">${c.detail}</div>
                </div>
            </${tag}>
        `;
    }).join('');
    list.style.display = '';
}

const RANK_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

async function loadStreakLeaderboard() {
    const listEl = document.getElementById('dan-lb-list');
    if (!listEl) return;
    try {
        const res  = await fetch(`${API}/user/streak-leaderboard`, { headers: authH() });
        const data = await window.ApiClient.handleResponse(res);
        const rows = data.leaderboard || [];
        if (!rows.length) {
            listEl.innerHTML = '<div class="dan-lb-empty">Chưa có ai đang giữ streak — hãy là người đầu tiên! 🔥</div>';
            return;
        }
        const myId = window.AuthService?.getUser()?._id;
        listEl.innerHTML = rows.map((r, i) => {
            const rank = i + 1;
            const medal = RANK_MEDAL[rank];
            const avatar = r.avatar
                ? `<img class="dan-lb-avatar" src="${_esc(r.avatar)}" alt="">`
                : `<span class="dan-lb-avatar-placeholder">${_esc((r.name || '?')[0].toUpperCase())}</span>`;
            const tier = getFireTier(r.streak);
            const streakStyle = tier.cls ? '' : (tier.color ? ` style="color:${tier.color}"` : '');
            const isMe = r._id === myId;
            return `
                <div class="dan-lb-row${isMe ? ' is-me' : ' dan-lb-clickable'}"${isMe ? '' : ` onclick="window.openPeerProfile('${r._id}')"`}>
                    <span class="dan-lb-rank${medal ? ' top' + rank : ''}">${medal || rank}</span>
                    ${avatar}
                    <span class="dan-lb-name">${_esc(r.name)}${isMe ? ' (Bạn)' : ''}</span>
                    <span class="dan-lb-streak${tier.cls ? ' ' + tier.cls : ''}"${streakStyle}><i class="fas fa-fire"></i> ${r.streak}</span>
                </div>`;
        }).join('');
    } catch {
        listEl.innerHTML = '<div class="dan-lb-empty">Không tải được bảng xếp hạng</div>';
    }
}

// Last 7 calendar days (VN time), rendered as a mini row of dots next to
// the streak banner — reuses the same activity-heatmap endpoint that
// powers profile.html's full GitHub-style calendar.
const WEEK_DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
async function loadWeeklyProgress() {
    const row = document.getElementById('dan-week-row');
    if (!row) return;
    try {
        const res  = await fetch(`${API}/user/activity-heatmap?days=8`, { headers: authH() });
        const data = await window.ApiClient.handleResponse(res);
        if (!data.success) return;
        const counts = {};
        data.activity.forEach(d => { counts[d.date] = d.count; });

        const localKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const toLevel = n => n === 0 ? 0 : n === 1 ? 1 : n <= 2 ? 2 : n <= 4 ? 3 : 4;
        const today = new Date();
        let html = '';
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = localKey(d);
            const n = counts[key] || 0;
            const isToday = i === 0;
            html += `<div class="dan-week-day${isToday ? ' today' : ''}">
                <div class="dan-week-dot" data-lvl="${toLevel(n)}" title="${key}: ${n} bài">${n > 0 ? '✓' : ''}</div>
                <span>${WEEK_DAY_LABELS[d.getDay()]}</span>
            </div>`;
        }
        row.innerHTML = html;
    } catch { /* non-critical widget — fail silently */ }
}

/* ══════════════════════════════════════════════
   MY BOOKS – SIDEBAR
══════════════════════════════════════════════ */
async function loadMyBooks() {
    try {
        const res  = await fetch(`${API}/vocabbook`, { headers: authH() });
        const data = await window.ApiClient.handleResponse(res);
        myBooks = data.books;
        renderBookSidebar();
    } catch (err) {
        console.error('loadMyBooks:', err);
        const isColdStart = err.coldStart;
        const wrap = document.getElementById('book-list-sidebar');
        if (wrap) {
            wrap.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">
              <div style="font-size:28px;margin-bottom:8px">${isColdStart ? '🔄' : '⚠️'}</div>
              <div style="margin-bottom:10px">${isColdStart ? 'Server is starting up,<br>please try again in a few seconds.' : 'Failed to load notebooks'}</div>
              <button onclick="loadMyBooks()" style="background:var(--brand);color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:12px;cursor:pointer;font-family:inherit">Retry</button>
            </div>`;
        }
    }
}

function renderBookSidebar() {
    const wrap = document.getElementById('book-list-sidebar');
    wrap.innerHTML = myBooks.map((b, i) => `
    <div class="book-item ${b._id === currentBookId ? 'active' : ''}"
         draggable="true"
         data-idx="${i}"
         id="bi-${b._id}"
         onclick="openBook('${b._id}')"
         ondragstart="bookDragStart(event,${i})"
         ondragover="bookDragOver(event)"
         ondragleave="bookDragLeave(event)"
         ondrop="bookDrop(event,${i})"
         ondragend="bookDragEnd(event)">
      <span class="book-drag-handle" title="Kéo để sắp xếp">⠿</span>
      <span class="book-emoji">${_esc(b.emoji)}</span>
      <span class="book-name">${_esc(b.name)}</span>
      <span class="book-count">${b.totalWords}</span>
      <button class="book-menu-btn" onclick="event.stopPropagation();openBookMenu('${b._id}')" title="Options">⋯</button>
    </div>
  `).join('');

    // Update book count badge & add button state
    const badge = document.getElementById('book-count-badge');
    if (badge) badge.textContent = `${myBooks.length}/15`;
    const addBtn = document.getElementById('btn-add-book');
    if (addBtn) {
        const atLimit = myBooks.length >= 15;
        addBtn.title  = atLimit ? 'Đã đạt giới hạn 15 sổ' : 'Add new notebook';
        addBtn.style.opacity = atLimit ? '0.4' : '';
        addBtn.style.cursor  = atLimit ? 'not-allowed' : '';
    }

    syncSheetBooks();
}

// Mirrors renderBookSidebar() into the mobile bottom sheet's own notebook
// list (#sheet-book-list) — the desktop sidebar is hidden on mobile
// (display:none), so this is the only way mobile users can pick/switch
// notebooks. No drag-reorder here; that's a desktop-only affordance.
function syncSheetBooks() {
    const wrap = document.getElementById('sheet-book-list');
    if (!wrap) return;

    if (!myBooks.length) {
        wrap.innerHTML = `<div style="padding:30px;text-align:center;color:var(--text3)">
          <div style="font-size:32px;margin-bottom:8px">📭</div>
          <div style="font-size:13px">No notebooks yet</div>
        </div>`;
        return;
    }

    wrap.innerHTML = myBooks.map(b => `
    <div class="sheet-book-item ${b._id === currentBookId ? 'active' : ''}" id="sbi-${b._id}"
         onclick="openBook('${b._id}');closeSheet()">
      <span class="book-emoji">${_esc(b.emoji)}</span>
      <span class="book-name">${_esc(b.name)}</span>
      <span class="sheet-book-count">${b.totalWords}</span>
      <button class="sheet-book-menu-btn" onclick="event.stopPropagation();openBookMenu('${b._id}')" title="Options">⋯</button>
    </div>
  `).join('');
}
window.syncSheetBooks = syncSheetBooks;

// ── Drag & drop reorder ───────────────────────
let _dragBookIdx = null;
let _saveOrderTimer = null;

function bookDragStart(e, idx) {
    _dragBookIdx = idx;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
}
function bookDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
}
function bookDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
function bookDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.book-item').forEach(el => el.classList.remove('drag-over'));
}
function bookDrop(e, targetIdx) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (_dragBookIdx === null || _dragBookIdx === targetIdx) return;
    // Same free-plan gate as openBook() — PUT /vocabbook/reorder is
    // premium-gated server-side now, so block the reorder itself (before
    // any local mutation) instead of letting saveBookOrder()'s PUT 403 into
    // a confusing "couldn't save order, reloading..." toast.
    if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
        _dragBookIdx = null;
        if (window.openUpgradeModal) openUpgradeModal();
        return;
    }
    const moved = myBooks.splice(_dragBookIdx, 1)[0];
    myBooks.splice(targetIdx, 0, moved);
    _dragBookIdx = null;
    renderBookSidebar();
    // Debounce save to backend
    clearTimeout(_saveOrderTimer);
    _saveOrderTimer = setTimeout(saveBookOrder, 600);
}
async function saveBookOrder() {
    try {
        const res = await fetch(`${API}/vocabbook/reorder`, {
            method: 'PUT',
            headers: authH(),
            body: JSON.stringify({ order: myBooks.map((b, i) => ({ _id: b._id, sortOrder: i })) })
        });
        await window.ApiClient.handleResponse(res);
    } catch (_) {
        toast('Không lưu được thứ tự sổ từ vựng, đang tải lại danh sách...', 'error');
        loadMyBooks();
    }
}

// ──────────────────────────────────────────────────────
// URL routing — mirrors reading/listening/speaking's own idiom: the
// current view (home/book/unit, + bookId/unit/mode) is reflected in the
// address bar so refresh, sharing, and browser back/forward all work.
// mode: 'push' creates a new history entry (real navigation the user
// should be able to back out of — opening a book/unit), 'replace' just
// updates the current one (switching a practice-mode tab within an
// already-open resource, or restoring state from a popstate event).
// ──────────────────────────────────────────────────────
function syncViewUrl(mode, st) {
    let url;
    if (st.view === 'home') {
        url = location.pathname;
    } else {
        const params = new URLSearchParams({ view: st.view });
        if (st.bookId)   params.set('bookId', st.bookId);
        if (st.unit)     params.set('unit', st.unit);
        if (st.mode)     params.set('mode', st.mode);
        if (st.lessonId) params.set('lessonId', st.lessonId);
        url = `?${params}`;
    }
    if (mode === 'push') history.pushState(st, '', url);
    else history.replaceState(st, '', url);
}

function openBook(bookId, push = true) {
    // Vocab used to be free/ungated (the intentional free-tier hook); now
    // gated the same as every other skill (full access for 24h, then
    // locked — see backend/utils/plan.js's hasFullAccess). Gating this one
    // entry point covers every deeper action (add/edit word, practice...)
    // since none of them are reachable without opening a book first.
    if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
        if (window.openUpgradeModal) openUpgradeModal();
        return;
    }
    const doOpen = async () => {
        _clearAutoNext(); // cancel any pending flashcard auto-advance from the session just left
        currentBookId = bookId;
        _isHardWordsSession = false;
        selectedWordIds.clear();

        // Clear search + status filter when switching books
        const searchEl = document.getElementById('book-search');
        if (searchEl) searchEl.value = '';
        currentStatusFilter = null;
        document.querySelectorAll('.stat-dot[data-status]').forEach(el => el.classList.remove('active'));

        document.querySelectorAll('.book-item').forEach(el => el.classList.remove('active'));
        const item = document.getElementById(`bi-${bookId}`);
        if (item) item.classList.add('active');
        document.querySelectorAll('.sheet-book-item').forEach(el => el.classList.remove('active'));
        const sheetItem = document.getElementById(`sbi-${bookId}`);
        if (sheetItem) sheetItem.classList.add('active');

        const content = document.getElementById('book-content');
        document.getElementById('view-mybook').style.display  = 'flex';
        document.getElementById('view-unit').style.display    = 'none';
        document.getElementById('view-lesson').style.display  = 'none';
        document.getElementById('book-welcome').style.display = 'none';
        content.style.display = 'flex';
        if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });

        // Show skeleton while loading
        document.getElementById('words-tbody').innerHTML = Array(5).fill(0).map(() => `
          <tr>
            <td></td>
            <td><div class="skeleton-cell" style="width:80px"></div></td>
            <td><div class="skeleton-cell" style="width:100px"></div></td>
            <td><div class="skeleton-cell" style="width:140px"></div></td>
            <td><div class="skeleton-cell" style="width:180px"></div></td>
            <td></td><td></td>
          </tr>`).join('');
        content.classList.add('loading');

        await refreshCurrentBook();
        content.classList.remove('loading');
        loadStreakAndUpdateMascot();
        syncViewUrl(push ? 'push' : 'replace', { view: 'book', bookId });
    };
    askQuitPractice(doOpen);
}

async function refreshCurrentBook() {
    // Guards against a stale response landing after the student has already
    // switched to a DIFFERENT book (e.g. rapid clicks in the sidebar before
    // the first fetch resolves) — only apply the result if currentBookId is
    // still the same book this call started fetching.
    const targetId = currentBookId;
    try {
        const res  = await fetch(`${API}/vocabbook/${targetId}`, { headers: authH() });
        const data = await window.ApiClient.handleResponse(res);
        if (currentBookId !== targetId) return;
        currentBookData = data.book;
        renderBookContent(data.book);
    } catch (err) {
        if (currentBookId !== targetId) return;
        toast('Error loading notebook: ' + err.message, 'error');
    }
}

function renderBookContent(book) {
    document.getElementById('book-top-emoji').textContent = book.emoji;
    document.getElementById('book-editable-name').value   = book.name;

    const total = book.words.length;
    const da    = book.words.filter(w => w.status === 'da-thuoc').length;
    const nho   = book.words.filter(w => w.status === 'nho-so-so').length;
    const chua  = book.words.filter(w => w.status === 'chua-thuoc').length;
    const pct   = total ? Math.round((da / total) * 100) : 0;

    // Animate stats count-up khi mở sổ
    animateCount(document.getElementById('stat-da-thuoc'),   da,   550);
    animateCount(document.getElementById('stat-nho-so-so'),  nho,  550);
    animateCount(document.getElementById('stat-chua-thuoc'), chua, 550);
    animateCount(document.getElementById('stat-total'),      total, 550);

    // Delay nhỏ để progress bar animate sau khi DOM render
    requestAnimationFrame(() => {
        document.getElementById('book-progress-fill').style.width = pct + '%';
    });

    // Re-apply any active search query and/or status-chip filter, otherwise
    // render the full list.
    const searchEl = document.getElementById('book-search');
    const q = searchEl?.value.trim().toLowerCase() || '';
    const isFiltered = !!(q || currentStatusFilter);
    if (isFiltered) {
        const filtered = _applyWordFilters(book.words, q);
        renderWordsTable(filtered);
        const totalEl = document.getElementById('stat-total');
        const limitEl = document.getElementById('stat-limit-label');
        if (totalEl) totalEl.textContent = filtered.length;
        if (limitEl) limitEl.textContent = ` / ${book.words.length} words`;
    } else {
        renderWordsTable(book.words);
        const limitEl = document.getElementById('stat-limit-label');
        if (limitEl) limitEl.textContent = ' / 300 words';
    }

    // Cập nhật nút "Ôn lại từ hay sai" — luôn hiện khi sổ mở
    const hardBtn = document.getElementById('btn-hard-words');
    if (hardBtn) {
        const hardCount = book.words.filter(w => (w.wrongCount || 0) >= 3).length;
        hardBtn.style.display = '';
        if (hardCount > 0) {
            hardBtn.innerHTML = `<i class="fas fa-fire"></i> Ôn lại từ hay sai (${hardCount})`;
            hardBtn.classList.add('has-hard-words');
        } else {
            hardBtn.innerHTML = `<i class="fas fa-fire"></i> Ôn lại từ hay sai`;
            hardBtn.classList.remove('has-hard-words');
        }
    }
}

function renderWordsTable(words) {
    const tbody = document.getElementById('words-tbody');
    const total = currentBookData?.words?.length ?? 0;

    // Sort: chưa thuộc → nhớ sơ sơ → đã thuộc, rồi A–Z trong mỗi nhóm
    const statusOrder = { 'chua-thuoc': 0, 'nho-so-so': 1, 'da-thuoc': 2 };
    words = [...words].sort((a, b) => {
        const sd = (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0);
        return sd !== 0 ? sd : a.word.localeCompare(b.word, 'vi', { sensitivity: 'base' });
    });

    if (!total) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:48px;color:var(--text3)">
      <div style="font-size:40px;margin-bottom:10px">📭</div>
      <div>No words in this notebook yet</div>
      <div style="font-size:12px;margin-top:6px">Add words manually or save them while reviewing Reading</div>
    </td></tr>`;
        return;
    }

    if (!words.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text3)">
      <div style="font-size:32px;margin-bottom:10px">🔍</div>
      <div>No matching words found</div>
    </td></tr>`;
        return;
    }

    tbody.innerHTML = words.map((w, i) => {
        const wc = w.wrongCount || 0;
        const diffBadge = wc >= 3
            ? `<span class="diff-badge diff-hard" title="${wc}x wrong">🔥 ${wc}</span>`
            : wc >= 1
            ? `<span class="diff-badge diff-medium" title="${wc}x wrong">⚡ ${wc}</span>`
            : '';
        return `
    <tr class="word-row-anim ${selectedWordIds.has(w._id) ? 'selected' : ''}" id="row-${w._id}"
        style="animation-delay:${Math.min(i * 22, 380)}ms">
      <td class="cb-wrap"><input type="checkbox" ${selectedWordIds.has(w._id) ? 'checked' : ''}
        onchange="toggleSelect('${w._id}', this.checked)"/></td>
      <td>
        <select class="status-select ${w.status}" onchange="updateWordStatus('${w._id}', this.value, this)">
          <option value="chua-thuoc" ${w.status === 'chua-thuoc' ? 'selected' : ''}>Not yet</option>
          <option value="nho-so-so"  ${w.status === 'nho-so-so'  ? 'selected' : ''}>So-so</option>
          <option value="da-thuoc"   ${w.status === 'da-thuoc'   ? 'selected' : ''}>Mastered</option>
        </select>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
          <span class="word-chip-main">${_esc(w.word)}</span>
          ${diffBadge}
          <button class="btn-audio" onclick="speakWord('${escH(w.word)}')" title="Pronounce">🔊</button>
        </div>
        ${w.phonetic ? `<div style="font-size:11px;color:var(--text3);font-family:'JetBrains Mono',monospace">${_esc(w.phonetic)}</div>` : ''}
      </td>
      <td style="color:var(--text2)">${_esc(w.meaning || '–')}</td>
      <td style="max-width:240px">
        ${w.example ? `<div style="font-size:12px;font-style:italic;color:var(--text2)">${_esc(w.example)}</div>` : ''}
        ${w.collocations?.length ? `<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px">${w.collocations.map(c => `<span class="colloc-chip">${_esc(c)}</span>`).join('')}</div>` : ''}
      </td>
      <td style="color:var(--text3);font-size:12px">${_esc(w.note || '')}</td>
      <td style="display:flex;gap:4px">
        <button class="btn btn-ghost btn-sm" onclick="openEditWordModal('${w._id}')" title="Edit word">✏️</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteWord('${w._id}')" title="Delete word">🗑</button>
      </td>
    </tr>`;
    }).join('');
    // Double-click a word/meaning/example to look it up and save it into
    // another notebook — setupDictionaryDouble() is idempotent (it removes
    // any previously-attached listener first), so re-calling it on every
    // render here is safe.
    setupDictionaryDouble('words-tbody', 'vocab-list');
}

/* ── Word search / filter ── */
let _filterTimer = null;
// Click a Mastered/So-so/Not-yet stat chip to filter the table to just that
// status (click the same one again to clear). Combines with the search box
// — both apply together, same as e.g. a spreadsheet's filter+search.
let currentStatusFilter = null;

function filterByStatus(status) {
    currentStatusFilter = currentStatusFilter === status ? null : status;
    document.querySelectorAll('.stat-dot[data-status]').forEach(el => {
        el.classList.toggle('active', el.dataset.status === currentStatusFilter);
    });
    if (currentBookData) renderBookContent(currentBookData);
}

// Shared by renderBookContent (re-applying an active filter after a data
// refresh) and filterWords (typing in the search box) — was hand-duplicated
// in both places before, one of which silently never applied the status
// filter at all.
function _applyWordFilters(words, query) {
    let result = words;
    if (query) {
        result = result.filter(w =>
            w.word.toLowerCase().includes(query) ||
            (w.meaning || '').toLowerCase().includes(query) ||
            (w.note || '').toLowerCase().includes(query));
    }
    if (currentStatusFilter) result = result.filter(w => w.status === currentStatusFilter);
    return result;
}

function filterWords(q) {
    clearTimeout(_filterTimer);
    _filterTimer = setTimeout(() => {
        if (!currentBookData) return;
        const query = q.trim().toLowerCase();
        const all   = currentBookData.words;
        const words = _applyWordFilters(all, query);
        renderWordsTable(words);
        // Update total count label to show filtered result
        const totalEl    = document.getElementById('stat-total');
        const limitEl    = document.getElementById('stat-limit-label');
        const isFiltered = !!(query || currentStatusFilter);
        if (totalEl) totalEl.textContent = isFiltered ? words.length : all.length;
        if (limitEl) limitEl.textContent = isFiltered ? ` / ${all.length} words` : ' / 300 words';
    }, 120);
}

/* ── Status update ── */
async function updateWordStatus(wordId, status, selectEl) {
    const w = currentBookData?.words?.find(x => x._id === wordId);
    const prevStatus = w?.status;
    try {
        selectEl.className = `status-select ${status}`;
        if (w) {
            w.status = status;
            updateStats(currentBookData);
            if (status === 'da-thuoc') {
                const row = document.getElementById(`row-${wordId}`);
                if (row) {
                    row.querySelectorAll('td').forEach(td => td.classList.add('word-mastered-flash'));
                    setTimeout(() => row.querySelectorAll('td').forEach(td => td.classList.remove('word-mastered-flash')), 700);
                }
            }
        }
        const res = await fetch(`${API}/vocabbook/${currentBookId}/words/${wordId}`, {
            method: 'PATCH', headers: authH(),
            body: JSON.stringify({ status })
        });
        const data = await window.ApiClient.handleResponse(res);
        if (typeof loadMyVocabStats === 'function') loadMyVocabStats();
        // Confetti only after server confirms — not on optimistic update
        if (w && status === 'da-thuoc') checkBookCompletion();
        if (window.showBadgeUnlocked && data?.newlyUnlocked?.length) window.showBadgeUnlocked(data.newlyUnlocked);
    } catch {
        toast('Update error', 'error');
        if (w && prevStatus !== undefined) {
            w.status = prevStatus;
            selectEl.className = `status-select ${prevStatus}`;
            updateStats(currentBookData);
        }
    }
}

function updateStats(book) {
    const da    = book.words.filter(w => w.status === 'da-thuoc').length;
    const nho   = book.words.filter(w => w.status === 'nho-so-so').length;
    const chua  = book.words.filter(w => w.status === 'chua-thuoc').length;
    const total = book.words.length;
    const pct   = total ? Math.round((da / total) * 100) : 0;

    function popStat(el, target) {
        if (!el) return;
        const prev = parseInt(el.textContent, 10) || 0;
        animateCount(el, target, 380);
        if (prev !== target) {
            el.classList.remove('stat-pop');
            void el.offsetWidth; // force reflow to restart animation
            el.classList.add('stat-pop');
            el.addEventListener('animationend', () => el.classList.remove('stat-pop'), { once: true });
        }
    }
    popStat(document.getElementById('stat-da-thuoc'),   da);
    popStat(document.getElementById('stat-nho-so-so'),  nho);
    popStat(document.getElementById('stat-chua-thuoc'), chua);

    requestAnimationFrame(() => {
        const fill = document.getElementById('book-progress-fill');
        if (fill) fill.style.width = pct + '%';
    });
}

/* ── Delete word ── */
function deleteWord(wordId) {
    confirm2('Delete Word', 'Are you sure you want to delete this word?', async () => {
        try {
            const res = await fetch(`${API}/vocabbook/${currentBookId}/words/${wordId}`, { method: 'DELETE', headers: authH() });
            await window.ApiClient.handleResponse(res);
            selectedWordIds.delete(wordId);
            updateBulkBar();
            toast('Word deleted');
            await Promise.all([refreshCurrentBook(), loadMyBooks()]);
        } catch (err) { toast(err.message || 'Delete failed', 'error'); }
    });
}

/* ── Edit word ── */
let editingWordId = null;
function openEditWordModal(wordId) {
    if (!currentBookData) return;
    const w = currentBookData.words.find(x => x._id === wordId);
    if (!w) return;
    editingWordId = wordId;
    document.getElementById('ew-word').value     = w.word     || '';
    document.getElementById('ew-phonetic').value = w.phonetic || '';
    document.getElementById('ew-meaning').value  = w.meaning  || '';
    document.getElementById('ew-example').value  = w.example  || '';
    document.getElementById('ew-note').value     = w.note     || '';
    openModal('modal-edit-word');
    setTimeout(() => document.getElementById('ew-word').focus(), 100);
}
async function saveEditWord() {
    const word = document.getElementById('ew-word').value.trim();
    if (!word) { toast('Word cannot be empty', 'error'); return; }
    try {
        const res = await fetch(`${API}/vocabbook/${currentBookId}/words/${editingWordId}`, {
            method: 'PATCH', headers: authH(),
            body: JSON.stringify({
                word,
                phonetic:    document.getElementById('ew-phonetic').value.trim(),
                meaning:     document.getElementById('ew-meaning').value.trim(),
                example:     document.getElementById('ew-example').value.trim(),
                note:        document.getElementById('ew-note').value.trim(),
            })
        });
        await window.ApiClient.handleResponse(res);
        closeModal('modal-edit-word');
        toast('Word updated ✅');
        await refreshCurrentBook();
    } catch (err) { toast(err.message, 'error'); }
}

/* ── Bulk select ── */
function toggleSelect(wordId, checked) {
    if (checked) selectedWordIds.add(wordId);
    else selectedWordIds.delete(wordId);
    updateBulkBar();
    const row = document.getElementById(`row-${wordId}`);
    if (row) row.classList.toggle('selected', checked);
}
function toggleSelectAll(cb) {
    if (!currentBookData) return;
    currentBookData.words.forEach(w => {
        if (cb.checked) selectedWordIds.add(w._id);
        else selectedWordIds.delete(w._id);
    });
    updateBulkBar();
    renderWordsTable(currentBookData.words);
}
function updateBulkBar() {
    const bar = document.getElementById('bulk-bar');
    if (selectedWordIds.size > 0) {
        bar.classList.add('show');
        document.getElementById('bulk-count').textContent = selectedWordIds.size;
    } else {
        bar.classList.remove('show');
        const allCb = document.getElementById('check-all');
        if (allCb) allCb.checked = false;
    }
}
async function bulkChangeStatus(status) {
    if (!status || !selectedWordIds.size) return;
    try {
        // Routed through handleResponse (not raw fetch+r.ok) so an expired
        // session 401s into the same logout/redirect every other write path
        // on this page gets, instead of silently failing in place.
        const results = await Promise.allSettled([...selectedWordIds].map(wid =>
            fetch(`${API}/vocabbook/${currentBookId}/words/${wid}`, {
                method: 'PATCH', headers: authH(), body: JSON.stringify({ status })
            }).then(r => window.ApiClient.handleResponse(r))
        ));
        const allOk = results.every(r => r.status === 'fulfilled');
        selectedWordIds.clear();
        document.getElementById('bulk-status-sel').value = '';
        toast(allOk ? 'Status updated' : 'Some updates failed', allOk ? 'success' : 'error');
        await Promise.all([refreshCurrentBook(), loadMyBooks()]);
    } catch (err) { toast(err.message || 'Update failed', 'error'); }
}
async function bulkDelete() {
    if (!selectedWordIds.size) return;
    confirm2('Delete Words', `Delete ${selectedWordIds.size} selected words?`, async () => {
        try {
            const res = await fetch(`${API}/vocabbook/${currentBookId}/words`, {
                method: 'DELETE', headers: authH(),
                body: JSON.stringify({ wordIds: [...selectedWordIds] })
            });
            await window.ApiClient.handleResponse(res);
            selectedWordIds.clear();
            updateBulkBar();
            toast('Deleted');
            await Promise.all([refreshCurrentBook(), loadMyBooks()]);
        } catch (err) { toast(err.message || 'Delete failed', 'error'); }
    });
}

/* ── Rename book ── */
async function renameBook() {
    const name = document.getElementById('book-editable-name').value.trim();
    if (!name) { toast('Tên sổ không được để trống', 'error'); return; }
    if (!currentBookId) return;
    try {
        const res = await fetch(`${API}/vocabbook/${currentBookId}`, {
            method: 'PUT', headers: authH(), body: JSON.stringify({ name })
        });
        await window.ApiClient.handleResponse(res);
        // Update local state so flashcard/practice titles reflect new name immediately
        if (currentBookData) currentBookData.name = name;
        const bEntry = myBooks.find(x => x._id === currentBookId);
        if (bEntry) bEntry.name = name;
        toast('Notebook renamed');
        await loadMyBooks();
    } catch (err) { toast(err.message || 'Error renaming', 'error'); }
}

/* ── Book menu – action sheet ── */
let _menuBookId = null; // book currently open in action sheet

function openBookMenu(bookId) {
    const book = myBooks.find(b => b._id === bookId);
    if (!book) return;
    _menuBookId = bookId;

    document.getElementById('book-actions-title').textContent = `${book.emoji} ${book.name}`;

    // Default books: chỉ cho đổi tên, ẩn gộp/xóa
    const isDefault = !!book.isDefault;
    document.getElementById('btn-merge-from-menu').style.display  = isDefault ? 'none' : 'flex';
    document.getElementById('btn-delete-from-menu').style.display = isDefault ? 'none' : 'flex';

    openModal('modal-book-actions');
}

function startRenameFromMenu() {
    closeModal('modal-book-actions');
    // Focus vào input tên sổ đang mở; nếu sổ chưa mở thì mở trước
    if (_menuBookId && currentBookId !== _menuBookId) openBook(_menuBookId);
    setTimeout(() => {
        const inp = document.getElementById('book-editable-name');
        if (inp) { inp.focus(); inp.select(); }
    }, 200);
}

function deleteBookFromMenu() {
    closeModal('modal-book-actions');
    const book = myBooks.find(b => b._id === _menuBookId);
    if (!book) return;
    confirm2(
        'Xóa sổ',
        `Xóa sổ "${book.name}"? Tất cả từ trong sổ sẽ bị mất.`,
        async () => {
            try {
                const res = await fetch(`${API}/vocabbook/${_menuBookId}`, { method: 'DELETE', headers: authH() });
                await window.ApiClient.handleResponse(res);
                if (currentBookId === _menuBookId) {
                    currentBookId = null;
                    document.getElementById('book-content').style.display  = 'none';
                    document.getElementById('book-welcome').style.display  = 'flex';
                }
                toast('Đã xóa sổ');
                await loadMyBooks();
            } catch (err) { toast(err.message || 'Xóa thất bại', 'error'); }
        }
    );
}

/* ── Merge books ── */
function openMergeModal() {
    closeModal('modal-book-actions');
    const destBook = myBooks.find(b => b._id === _menuBookId);
    if (!destBook) return;

    document.getElementById('merge-modal-title').textContent = `Gộp sổ vào "${destBook.name}"`;
    document.getElementById('merge-dest-name').textContent   = `"${destBook.name}"`;

    // Chỉ hiển thị sổ không phải default và không phải sổ đích
    const candidates = myBooks.filter(b => !b.isDefault && b._id !== _menuBookId);
    const list = document.getElementById('merge-book-list');

    if (!candidates.length) {
        list.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">
            Không có sổ nào khác để gộp.<br>
            <span style="font-size:12px">(Chỉ có thể gộp sổ do bạn tự tạo, không phải 5 sổ mặc định.)</span>
        </div>`;
        document.getElementById('btn-confirm-merge').style.display = 'none';
    } else {
        document.getElementById('btn-confirm-merge').style.display = '';
        list.innerHTML = candidates.map(b => `
            <label class="merge-book-item" id="merge-item-${b._id}">
                <input type="checkbox" value="${b._id}" onchange="toggleMergeItem('${b._id}', this.checked)">
                <span style="font-size:18px">${_esc(b.emoji)}</span>
                <span style="font-size:13px;font-weight:600">${_esc(b.name)}</span>
                <span class="merge-book-meta">${b.totalWords} từ</span>
            </label>`).join('');
    }

    openModal('modal-merge-books');
}

function toggleMergeItem(bookId, checked) {
    const item = document.getElementById(`merge-item-${bookId}`);
    if (item) item.classList.toggle('selected', checked);
}

async function confirmMerge() {
    const checkedIds = [...document.querySelectorAll('#merge-book-list input[type=checkbox]:checked')]
        .map(cb => cb.value);
    if (!checkedIds.length) { toast('Vui lòng chọn ít nhất 1 sổ', 'error'); return; }

    const destBook = myBooks.find(b => b._id === _menuBookId);
    const btn = document.getElementById('btn-confirm-merge');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gộp...';

    try {
        const res  = await fetch(`${API}/vocabbook/${_menuBookId}/merge`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ sourceIds: checkedIds })
        });
        const data = await window.ApiClient.handleResponse(res);

        closeModal('modal-merge-books');

        // Nếu đang xem một trong các sổ bị xóa → chuyển về sổ đích
        if (checkedIds.includes(currentBookId)) {
            currentBookId = _menuBookId;
        }

        await loadMyBooks();
        if (currentBookId === _menuBookId) await openBook(_menuBookId);

        toast(`Đã gộp ${data.mergedCount} sổ · thêm ${data.addedCount} từ mới vào "${destBook?.name}"`, 'success');
    } catch (err) {
        toast(err.message || 'Lỗi khi gộp sổ', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-object-group"></i> Xác nhận gộp';
    }
}

/* ── Add book modal ── */
let selectedEmoji = '📘';
function setupEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    const emojis = ['📘','📗','📙','📕','📓','📔','📒','📃','🗒️','🌟','⭐','🎯','🔥','💡','🚀'];
    picker.innerHTML = emojis.map(e =>
        `<span class="emoji-opt ${e === selectedEmoji ? 'selected' : ''}" onclick="selectEmoji('${e}')">${e}</span>`
    ).join('');
}
function selectEmoji(emoji) { selectedEmoji = emoji; setupEmojiPicker(); }
function openAddBookModal() {
    if (myBooks.length >= 15) {
        toast('Bạn đã đạt giới hạn 15 sổ. Hãy xóa hoặc gộp bớt sổ cũ trước khi tạo mới.', 'error');
        return;
    }
    document.getElementById('new-book-name').value = '';
    openModal('modal-add-book');
    setTimeout(() => document.getElementById('new-book-name').focus(), 100);
}
async function createBook() {
    // Same free-plan gate as openBook() — POST /vocabbook is premium-gated
    // server-side now (list stays open so a locked-out user still sees
    // their books, but creating a new one doesn't), so block here too
    // instead of letting the request 403 into a bare error toast.
    if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
        if (window.openUpgradeModal) openUpgradeModal();
        return;
    }
    const name = document.getElementById('new-book-name').value.trim();
    if (!name) { toast('Notebook name cannot be empty', 'error'); return; }
    try {
        const res  = await fetch(`${API}/vocabbook`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ name, emoji: selectedEmoji, color: '#3d8bff' })
        });
        const data = await window.ApiClient.handleResponse(res);
        closeModal('modal-add-book');
        toast('Notebook created');
        await loadMyBooks();
        openBook(data.book._id);
    } catch (err) { toast(err.message, 'error'); }
}

/* ── Add word manual ── */
let _lookupPhonetic = '';
let _lookupPartOfSpeech = '';

// MyMemory TM "segment" fields are frequently glossary scrapes, not real
// sentences (e.g. "Mammal class\t83" — a tab-separated glossary row), so a
// bare word-count check isn't enough to treat one as an example sentence.
// Shared by lookupNewWord (single "Add vocabulary") and _fetchWordInfo
// (bulk import), which both fall back to MyMemory when dictionaryapi.dev
// (Wiktionary-sourced) has no example — which is common even for everyday
// words like "mammal".
function _looksLikeSentence(seg) {
    if (/[\t\r\n]/.test(seg)) return false;
    const words = seg.split(/\s+/);
    if (words.length < 3) return false;
    if (/^\d+$/.test(words[words.length - 1])) return false;
    return true;
}

function openAddWordManual() {
    const wordCount = currentBookData?.words?.length ?? 0;
    if (wordCount >= 300) {
        toast('Sổ này đã đạt giới hạn 300 từ. Hãy tạo sổ mới hoặc xóa bớt từ cũ.', 'error');
        return;
    }
    _lookupPhonetic = '';
    _lookupPartOfSpeech = '';
    ['aw-word','aw-meaning','aw-example','aw-note'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('aw-example-suggestions').innerHTML = '';
    document.getElementById('aw-meaning-suggestions').innerHTML = '';
    openModal('modal-add-word');
    setTimeout(() => document.getElementById('aw-word').focus(), 100);
}
let _lookupSeq = 0;
async function lookupNewWord(word) {
    const suggestWrap   = document.getElementById('aw-example-suggestions');
    const meaningSugWrap = document.getElementById('aw-meaning-suggestions');
    clearTimeout(lookupNewWord._t); // always clear, even when word too short
    if (!word || word.length < 2) {
        _lookupPhonetic = '';
        _lookupPartOfSpeech = '';
        if (suggestWrap) suggestWrap.innerHTML = '';
        if (meaningSugWrap) meaningSugWrap.innerHTML = '';
        return;
    }
    _lookupPhonetic = '';
    _lookupPartOfSpeech = '';
    const requestId = ++_lookupSeq;
    lookupNewWord._t = setTimeout(async () => {
        try {
            const enc = encodeURIComponent;
            // Fetch dictionary (examples + phonetic), Google Translate (primary meaning), MyMemory (alternatives)
            const [dictRes, gtRes, memRes] = await Promise.allSettled([
                fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${enc(word)}`),
                fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${enc(word)}`).then(r => r.json()),
                fetch(`https://api.mymemory.translated.net/get?q=${enc(word)}&langpair=en|vi`).then(r => r.ok ? r.json() : null)
            ]);
            // Guards against a slower earlier lookup (e.g. for "cat") resolving
            // AFTER a faster later one (e.g. "category") and overwriting its
            // freshly-filled suggestion fields with stale data — only the
            // most recent lookupNewWord() call is allowed to touch the DOM.
            if (requestId !== _lookupSeq) return;
            const memMatches = (memRes.status === 'fulfilled' && memRes.value && memRes.value.matches) || [];

            // ── Dictionary API ──
            const examples = [];
            if (dictRes.status === 'fulfilled' && dictRes.value.ok) {
                const data = await dictRes.value.json();
                _lookupPhonetic     = data[0]?.phonetics?.find(p => p.text)?.text || '';
                _lookupPartOfSpeech = data[0]?.meanings?.[0]?.partOfSpeech || '';

                for (const entry of data) {
                    for (const meaning of entry.meanings || []) {
                        for (const def of meaning.definitions || []) {
                            if (def.example && !examples.includes(def.example)) {
                                examples.push(def.example);
                            }
                        }
                    }
                    if (examples.length >= 5) break;
                }
            }

            // dictionaryapi.dev (Wiktionary-sourced) very often has zero
            // example sentences even for common words — fall back to
            // MyMemory's sentence-level TM matches (segment = English
            // source text) that actually contain the word as a whole word,
            // rather than leaving the example field permanently empty.
            if (examples.length < 3 && memMatches.length) {
                const wordRe = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                for (const m of memMatches) {
                    if (examples.length >= 3) break;
                    const seg = (m.segment || '').trim();
                    if (!seg || seg.toLowerCase() === word.toLowerCase()) continue;
                    if (!_looksLikeSentence(seg) || !wordRe.test(seg)) continue;
                    if (!examples.includes(seg)) examples.push(seg);
                }
            }

            if (examples.length && !document.getElementById('aw-example').value) {
                document.getElementById('aw-example').value = examples[0];
            }
            if (suggestWrap) {
                if (!examples.length) { suggestWrap.innerHTML = ''; }
                else {
                    suggestWrap.innerHTML =
                        '<div class="example-suggestion-label">💡 Ví dụ phổ biến — bấm để chọn:</div>' +
                        examples.map(ex => {
                            const attr = ex.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
                            const html = ex.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                            return `<button class="example-suggestion" data-ex="${attr}" onclick="selectExampleSuggestion(this)">${html}</button>`;
                        }).join('');
                    const firstBtn = suggestWrap.querySelector('.example-suggestion');
                    if (firstBtn && !document.getElementById('aw-example').dataset.userEdited) {
                        firstBtn.classList.add('selected');
                    }
                }
            }

            // ── Vietnamese meaning: Google Translate (primary) + MyMemory (alternatives) ──
            if (meaningSugWrap) {
                const meanings = [];
                const seen = new Set();

                // Primary: Google Translate — short, accurate
                if (gtRes.status === 'fulfilled') {
                    const gt = gtRes.value?.[0]?.[0]?.[0]?.trim() || '';
                    if (gt && gt.toLowerCase() !== word.toLowerCase()) {
                        meanings.push(gt);
                        seen.add(gt.toLowerCase());
                    }
                }

                // Alternatives: MyMemory, ranked by quality — but only TM
                // entries whose SOURCE segment is the word itself count as
                // a genuine "other meaning". MyMemory is a fuzzy-matched
                // translation-memory search, not a dictionary: for a
                // rare/short query it can return entire unrelated sentences
                // that merely scored some fuzzy similarity (e.g. querying
                // "inexplicably" returning "Bubaye inexplicably falls" with
                // quality "0"), and treating their translation as a "meaning"
                // produced nonsense suggestions.
                if (memMatches.length) {
                    const normWord = word.trim().toLowerCase().replace(/[.,!?;:'"]+$/, '');
                    const matches = memMatches
                        .filter(m => m.translation && typeof m.translation === 'string' && m.segment)
                        .filter(m => m.segment.trim().toLowerCase().replace(/[.,!?;:'"]+$/, '') === normWord)
                        .sort((a, b) => (parseFloat(b.quality) || 0) - (parseFloat(a.quality) || 0));
                    for (const m of matches) {
                        if (meanings.length >= 4) break;
                        // Trim trailing punctuation left over from a comma-separated
                        // glossary-style TM segment (e.g. segment "mammal," yielding
                        // translation "động vật có vú,").
                        const val = m.translation.trim().replace(/[,.;:]+$/, '').trim();
                        if (!val || val.toLowerCase() === word.toLowerCase()) continue;
                        if (/^[a-z0-9\s\-,.']+$/i.test(val) && !/[àáảãạăắặẳẵằâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(val)) continue;
                        if (!seen.has(val.toLowerCase())) {
                            seen.add(val.toLowerCase());
                            meanings.push(val);
                        }
                    }
                }

                if (!meanings.length) { meaningSugWrap.innerHTML = ''; }
                else {
                    const meaningInp = document.getElementById('aw-meaning');
                    if (meaningInp && !meaningInp.value) meaningInp.value = meanings[0];
                    meaningSugWrap.innerHTML =
                        '<div class="example-suggestion-label meaning-suggestion-label">🇻🇳 Nghĩa gợi ý — bấm để chọn:</div>' +
                        meanings.map(m => {
                            const attr = m.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
                            const html = m.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                            return `<button class="example-suggestion meaning-suggestion" data-val="${attr}" onclick="selectMeaningSuggestion(this)">${html}</button>`;
                        }).join('');
                    const firstM = meaningSugWrap.querySelector('.meaning-suggestion');
                    if (firstM && document.getElementById('aw-meaning').value === meanings[0]) firstM.classList.add('selected');
                }
            }

        } catch { if (suggestWrap) suggestWrap.innerHTML = ''; if (meaningSugWrap) meaningSugWrap.innerHTML = ''; }
    }, 700);
}

window.selectExampleSuggestion = function(btn) {
    const ex = btn.dataset.ex;
    const inp = document.getElementById('aw-example');
    if (inp) inp.value = ex;
    btn.closest('.example-suggestions-wrap')?.querySelectorAll('.example-suggestion')
        .forEach(b => b.classList.toggle('selected', b === btn));
};

window.selectMeaningSuggestion = function(btn) {
    const val = btn.dataset.val;
    const inp = document.getElementById('aw-meaning');
    if (inp) inp.value = val;
    btn.closest('.example-suggestions-wrap')?.querySelectorAll('.meaning-suggestion')
        .forEach(b => b.classList.toggle('selected', b === btn));
};
async function addWordManual() {
    const word    = document.getElementById('aw-word').value.trim();
    const meaning = document.getElementById('aw-meaning').value.trim();
    const example = document.getElementById('aw-example').value.trim();
    const note    = document.getElementById('aw-note').value.trim();
    if (!word) { toast('Enter a word to add', 'error'); return; }
    if (!currentBookId) { toast('Please select a notebook first', 'error'); return; }
    try {
        const res  = await fetch(`${API}/vocabbook/${currentBookId}/words`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ word, meaning, example, note, source: 'manual', phonetic: _lookupPhonetic, partOfSpeech: _lookupPartOfSpeech })
        });
        const data = await window.ApiClient.handleResponse(res);
        if (!data.success) { toast(data.message, 'error'); return; }
        closeModal('modal-add-word');
        toast(data.message);
        await Promise.all([refreshCurrentBook(), loadMyBooks()]);
    } catch (err) { toast(err.message, 'error'); }
}

/* ══════════════════════════════════════════════
   SAVE WORD FROM READING / UNIT
══════════════════════════════════════════════ */
window.openSaveWordModal = async function (wordObj) {
    pendingSaveWord    = wordObj;
    selectedBookForSave = null;

    document.getElementById('sw-word').textContent     = wordObj.word     || '';
    document.getElementById('sw-phonetic').textContent = wordObj.phonetic  || '';
    document.getElementById('sw-meaning').textContent  = wordObj.meaning   || '';
    document.getElementById('sw-example').textContent  = wordObj.example   || '';
    document.getElementById('sw-note').value           = '';

    if (!myBooks.length) await loadMyBooks();
    const list = document.getElementById('sw-book-list');
    list.innerHTML = myBooks.map(b => {
        const isFull = b.totalWords >= 300;
        const isNear = b.totalWords >= 250 && !isFull;
        const countColor = isFull ? '#ef4444' : isNear ? '#f59e0b' : 'var(--text3)';
        const countLabel = isFull ? `${b.totalWords} / 300 (đầy)` : isNear ? `${b.totalWords} / 300` : `${b.totalWords} từ`;
        return `<div class="book-opt" id="bopt-${b._id}"
            onclick="${isFull ? '' : `selectBookForSave('${b._id}',this)`}"
            style="${isFull ? 'opacity:.45;cursor:not-allowed;pointer-events:none' : ''}">
          <span class="book-opt-emoji">${_esc(b.emoji)}</span>
          <div class="book-opt-info">
            <div class="book-opt-name">${_esc(b.name)}</div>
            <div class="book-opt-count" style="color:${countColor}">${countLabel}</div>
          </div>
          ${isFull ? '<span style="font-size:10px;color:#ef4444;font-weight:700;flex-shrink:0;padding:2px 6px;border:1px solid #fca5a5;border-radius:4px">FULL</span>' : ''}
        </div>`;
    }).join('');

    // Auto-select currently open book (if not full)
    if (currentBookId) {
        const curBook = myBooks.find(b => b._id === currentBookId);
        if (curBook && curBook.totalWords < 300) {
            selectedBookForSave = currentBookId;
            const opt = document.getElementById(`bopt-${currentBookId}`);
            if (opt) opt.classList.add('selected');
        }
    }

    openModal('modal-save-word');
};

function selectBookForSave(bookId, el) {
    selectedBookForSave = bookId;
    document.querySelectorAll('.book-opt').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
}

async function confirmSaveWord() {
    if (!selectedBookForSave) { toast('Please select a notebook', 'error'); return; }
    const note = document.getElementById('sw-note').value.trim();
    const w    = pendingSaveWord;
    try {
        const res  = await fetch(`${API}/vocabbook/${selectedBookForSave}/words`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ ...w, note })
        });
        const data = await window.ApiClient.handleResponse(res);
        closeModal('modal-save-word');
        toast(data.message, data.success ? 'success' : 'error');
        if (data.success) {
            await Promise.all([
                loadMyBooks(),
                currentBookId === selectedBookForSave ? refreshCurrentBook() : Promise.resolve()
            ]);
        }
    } catch (err) { toast(err.message, 'error'); }
}

/* ══════════════════════════════════════════════
   FLASHCARD / PREVIEW từ sổ cá nhân
══════════════════════════════════════════════ */
function openFlashcardMode() {
    if (!currentBookData?.words?.length) { toast('No words in this notebook yet', 'error'); return; }
    _isBookPractice = true;
    _isHardWordsSession = false;
    currentUnit = { words: currentBookData.words, title: currentBookData.name };
    document.getElementById('view-mybook').style.display = 'none';
    document.getElementById('view-unit').style.display   = 'flex';
    document.getElementById('unitTitle').textContent     = `📘 ${currentBookData.name}`;
    if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });
    showMode('fillBlank');
}
function openPreviewMode() {
    if (!currentBookData?.words?.length) { toast('No words in this notebook yet', 'error'); return; }
    _isBookPractice = true;
    _isHardWordsSession = false;
    currentUnit = { words: currentBookData.words, title: currentBookData.name };
    document.getElementById('view-mybook').style.display = 'none';
    document.getElementById('view-unit').style.display   = 'flex';
    document.getElementById('unitTitle').textContent     = `📘 ${currentBookData.name}`;
    if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });
    showMode('study');
}
function practiceHardWords() {
    if (!currentBookData?.words?.length) return;
    const hardWords = currentBookData.words
        .filter(w => (w.wrongCount || 0) >= 3)
        .sort((a, b) => (b.wrongCount || 0) - (a.wrongCount || 0));
    if (!hardWords.length) { toast('Chưa có từ nào sai từ 3 lần trở lên. Hãy tiếp tục luyện tập!', 'info'); return; }
    _isBookPractice = true;
    _isHardWordsSession = true;
    currentUnit = { words: hardWords, title: currentBookData.name };
    document.getElementById('view-mybook').style.display = 'none';
    document.getElementById('view-unit').style.display   = 'flex';
    document.getElementById('unitTitle').textContent = `🔥 Ôn lại từ hay sai – ${hardWords.length} từ`;
    if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });
    showMode('mixed');
}

function closeUnitView(push = true) {
    const doClose = () => {
        _clearAutoNext(); // cancel any pending flashcard auto-advance from the session just left
        document.getElementById('view-unit').style.display   = 'none';
        document.getElementById('view-mybook').style.display = 'flex';
        const panel = document.getElementById('kbd-hint-panel');
        if (panel) panel.style.display = 'none';
        if (!currentBookId) {
            document.getElementById('book-welcome').style.display = 'flex';
            document.getElementById('book-content').style.display = 'none';
        }
        if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });
        // Re-render word list to show updated wrongCount badges after book practice
        if (_isBookPractice && currentBookId && currentBookData) {
            renderBookContent(currentBookData);
        }
        syncViewUrl(push ? 'push' : 'replace',
            currentBookId ? { view: 'book', bookId: currentBookId } : { view: 'home' });
    };
    askQuitPractice(doClose);
}

/* ══════════════════════════════════════════════
   UNIT LOADING
══════════════════════════════════════════════ */
async function loadUnits() {
    try {
        const res   = await fetch(`${API}/vocab/units`, { headers: authH() });
        const units = await window.ApiClient.handleResponse(res);
        if (!Array.isArray(units)) return;
        const sel   = document.getElementById('unitSelect');
        sel.innerHTML = '<option value="">-- Chọn Paraphrase Unit --</option>';
        units.forEach(u => {
            const opt = document.createElement('option');
            opt.value       = u.unitNumber;
            opt.textContent = `Unit ${u.unitNumber} – ${u.title}`;
            sel.appendChild(opt);
        });
        if (window._upSetUnits) window._upSetUnits(units);
        if (window.syncSheetUnits) window.syncSheetUnits();
    } catch { }
}

let _loadUnitSeq = 0;
async function loadUnit(unitNumberOverride, push = true, modeOverride) {
    // Same free-plan gate as openBook()/openLesson() — GET /vocab/unit/:number
    // is premium-gated server-side now, so block here too instead of letting
    // the request 403 into a bare error toast.
    if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
        if (window.openUpgradeModal) openUpgradeModal();
        return;
    }
    const sel = document.getElementById('unitSelect');
    const num = unitNumberOverride ?? sel?.value;
    if (!num) { toast('Vui lòng chọn một Paraphrase Unit trước', 'error'); return; }
    const requestId = ++_loadUnitSeq;
    try {
        const res     = await fetch(`${API}/vocab/unit/${num}`, { headers: authH() });
        const newUnit = await window.ApiClient.handleResponse(res);
        // Guards against rapid unit switching (e.g. via the <select> or a
        // popstate-triggered loadUnit) resolving out of order — only the
        // most recently-requested unit is allowed to become currentUnit.
        if (requestId !== _loadUnitSeq) return;
        if (!newUnit.words) {
            toast('Unable to load Unit', 'error');
            return;
        }
        // Assign currentUnit only after user confirms (or if not mid-practice)
        askQuitPractice(() => {
            _isBookPractice = false;
            _isDifficultPractice = false;
            _isHardWordsSession = false;
            currentUnit = newUnit;
            if (sel) sel.value = String(newUnit.unitNumber);
            document.getElementById('unitTitle').textContent     = `Unit ${currentUnit.unitNumber}: ${currentUnit.title}`;
            document.getElementById('view-mybook').style.display = 'none';
            document.getElementById('view-lesson').style.display = 'none';
            document.getElementById('view-unit').style.display   = 'flex';
            if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });
            // Push (or replace, when restoring) THIS unit's own entry
            // before _activateModeNow() runs — opening a unit is real
            // navigation the user should be able to back out of. Order
            // matters: _activateModeNow() below also syncs the URL, but
            // only ever via replaceState, which updates whatever entry is
            // currently on top — if that ran first, it would silently
            // overwrite the *previous* entry (e.g. the book) instead of
            // this unit's own, since nothing would have pushed a new one
            // yet at that point.
            syncViewUrl(push ? 'push' : 'replace', { view: 'unit', unit: newUnit.unitNumber, mode: modeOverride || 'study' });
            _activateModeNow(modeOverride || 'study');
        });
    } catch (err) { toast(err.message || 'Unable to load Unit', 'error'); }
}

/* ══════════════════════════════════════════════
   MODE SWITCHING
══════════════════════════════════════════════ */
function _activateModeNow(mode) {
    _clearAutoNext();
    ['studyMode','multipleChoiceMode','fillBlankMode','listeningMode','translationMode','mixedMode','resultsMode']
        .forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    currentMode = mode;
    const tabMap = { study: 0, multipleChoice: 1, fillBlank: 2, listening: 3, translation: 4, mixed: 5 };
    const tabs = document.querySelectorAll('.tab-btn');
    if (tabs[tabMap[mode]] !== undefined) tabs[tabMap[mode]].classList.add('active');

    const stopBtn = document.getElementById('btnStopPractice');
    if (stopBtn) stopBtn.style.display = mode === 'study' ? 'none' : 'inline-flex';

    if (mode === 'study') { document.getElementById('studyMode').style.display = 'block'; renderStudyGrid(); }
    else startPractice(mode);
    updateKbdHint();

    // Reflect the active practice-mode tab in the URL — replaceState since
    // switching tabs within an already-open resource is a filter change,
    // not new navigation (matches reading/listening's own push-vs-replace
    // split). Skipped for the ephemeral "Hard Words" retry list, which
    // isn't a real bookmarkable resource.
    if (currentUnit?.unitNumber) {
        syncViewUrl('replace', { view: 'unit', unit: currentUnit.unitNumber, mode });
    } else if (_isBookPractice && currentBookId && !_isHardWordsSession) {
        syncViewUrl('replace', { view: 'book', bookId: currentBookId, mode });
    }
}

function showMode(mode) {
    if (!currentUnit) return;
    const inActiveSession = currentMode !== 'study' && currentQuestionIndex > 0 &&
        !document.getElementById('resultsMode')?.style.display?.includes('block');
    if (inActiveSession) {
        // confirm2() hardcodes its button to "Confirm delete" (it's meant
        // for the 4 actually-destructive call sites elsewhere in this
        // file) — neither of these two is a delete, so they call
        // confirmDialog() directly with a label that matches the action.
        if (mode !== currentMode) {
            confirmDialog('Switch Learning Mode?', 'Your current progress will be lost. Do you want to switch?',
                () => _activateModeNow(mode), { confirmLabel: 'Switch', confirmClass: 'btn-primary' });
        } else {
            // Re-clicking the same active tab → confirm restart
            confirmDialog('Restart Practice?', 'This will reset your current progress. Restart?',
                () => _activateModeNow(mode), { confirmLabel: 'Restart', confirmClass: 'btn-primary' });
        }
        return;
    }
    _activateModeNow(mode);
}

/* ══════════════════════════════════════════════
   STUDY GRID
══════════════════════════════════════════════ */
function renderStudyGrid() {
    const grid = document.getElementById('vocabGrid');
    const vocabWords = currentUnit.words.filter(w => (w.type || 'vocab') === 'vocab');
    const paraWords  = currentUnit.words.filter(w => w.type === 'paraphrase');

    let html = '';

    // ── Vocab cards ──────────────────────────────
    if (vocabWords.length) {
        html += vocabWords.map((w, i) => `
        <div class="vocab-card">
          <div class="vocab-card-top">
            <span class="vocab-num">${i + 1}</span>
            <span class="vocab-word-big">${_esc(w.word)}</span>
            <button class="btn-audio" onclick="speakWord('${escH(w.word)}')" title="Pronounce">🔊</button>
            ${w.partOfSpeech ? `<span class="vocab-pos">${_esc(w.partOfSpeech)}</span>` : ''}
          </div>
          ${w.phonetic ? `<div class="vocab-phonetic">${_esc(w.phonetic)}</div>` : ''}
          <div class="vocab-meaning">${_esc(w.meaning || '')}</div>
          ${w.example ? `<div class="vocab-example">"${_esc(w.example)}"</div>` : ''}
          <button class="btn-save-to-book" onclick="openSaveWordFromUnit('${escH(w.word)}')">
            <i class="fas fa-bookmark"></i> Save to notebook
          </button>
        </div>`).join('');
    }

    grid.innerHTML = html;

    // ── Paraphrase table (below grid, full width) ──
    const existingTable = document.getElementById('paraphrase-table-section');
    if (existingTable) existingTable.remove();

    if (paraWords.length) {
        const section = document.createElement('div');
        section.id = 'paraphrase-table-section';
        section.className = 'paraphrase-section';
        section.innerHTML = renderParaphraseTable(paraWords, currentUnit.title);
        grid.parentElement.insertBefore(section, grid.nextSibling);
    }

    setupDictionaryDouble('studyMode', 'vocab-study');
}

function renderParaphraseTable(words, title) {
    const rows = words.map(w => `
        <tr class="para-row">
            <td class="para-cell-original">
                <span class="para-original-text">${_esc(w.word)}</span>
            </td>
            <td class="para-cell-paraphrase">
                <span class="para-para-text">${_esc(w.paraphrase || '–')}</span>
            </td>
            <td class="para-cell-meaning">${_esc(w.meaning || '–')}</td>
            <td class="para-cell-explain">${_esc(w.explanation || '')}</td>
        </tr>`).join('');

    return `
    <div class="para-table-header">
        <div class="para-table-title">
            <span class="para-icon">📊</span>
            PARAPHRASE TABLE + EXPLANATION
        </div>
        ${title ? `<div class="para-passage-label">◆ ${title.toUpperCase()}</div>` : ''}
        <button class="para-copy-btn" onclick="copyParaphraseTable()" title="Copy table">⧉</button>
    </div>
    <div class="para-table-wrap">
        <table class="para-table">
            <thead>
                <tr>
                    <th>Text (in passage)</th>
                    <th>Paraphrase (in question)</th>
                    <th>Meaning</th>
                    <th>Detailed Explanation</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    </div>`;
}

function copyParaphraseTable() {
    if (!currentUnit?.words) return;
    const paraWords = currentUnit.words.filter(w => w.type === 'paraphrase');
    const text = paraWords.map(w =>
        `${w.word}\t${w.paraphrase || ''}\t${w.meaning || ''}\t${w.explanation || ''}`
    ).join('\n');
    navigator.clipboard.writeText(text).then(() => toast('Paraphrase table copied ✅'));
}

function openSaveWordFromUnit(wordText) {
    const w = currentUnit?.words?.find(x => x.word === wordText);
    if (!w) return;
    const src = currentUnit.unitNumber
        ? `Unit ${currentUnit.unitNumber}`
        : (currentUnit.title || '');
    window.openSaveWordModal({
        word: w.word, meaning: w.meaning, example: w.example || '',
        phonetic: w.phonetic || '', partOfSpeech: w.partOfSpeech || '',
        source: src
    });
}

/* ══════════════════════════════════════════════
   PRACTICE
══════════════════════════════════════════════ */
// A Paraphrase Unit session is one loaded via loadUnit() (not the personal
// book, not the "Từ hay sai" retry list — both also set currentUnit but
// _isBookPractice stays true for the book, and the retry unit has no real
// backend _id) whose words include at least one paraphrase-type entry.
function _isParaphraseUnitSession() {
    return !_isBookPractice && !!currentUnit?._id &&
        (currentUnit.words || []).some(w => w.type === 'paraphrase');
}

// Shared UI refresh after any POST /vocabbook/practice-complete call —
// updates both mascot widgets, the hammer count, and weekly progress from
// the response. Extracted so other practice surfaces on this page (e.g.
// dashboard-lesson.js's vocabulary-lesson quiz) can report their own
// session numbers through the same endpoint and get the same feedback,
// without duplicating this ~30-line UI block per caller.
function _applyStreakResult(d) {
    if (!d.success) return;
    const numEl = document.getElementById('mascot-streak-num');
    if (numEl) animateCount(numEl, d.streak, 500);
    const msgEl = document.getElementById('mascot-msg');
    if (msgEl) msgEl.textContent = getMascotMsg(d.streak);
    const pandaEl = document.getElementById('mascot-panda');
    if (pandaEl) pandaEl.textContent = getMascotEmoji(d.streak);
    applyFireTier(document.getElementById('mascot-fire'), numEl, d.streak);

    const danNumEl = document.getElementById('dan-streak-num');
    if (danNumEl) animateCount(danNumEl, d.streak, 500);
    const danMsgEl = document.getElementById('dan-streak-msg');
    if (danMsgEl) danMsgEl.textContent = getMascotMsg(d.streak);
    const danMascotEl = document.getElementById('dan-mascot');
    if (danMascotEl) { danMascotEl.innerHTML = ''; danMascotEl.textContent = getMascotEmoji(d.streak); }
    applyFireTier(document.getElementById('dan-fire'), danNumEl, d.streak);
    if (d.streak > 0) {
        // Only a real streak (bonus>0 this call, or restored) ends the
        // "just lost a streak" mascot state — a 0-bonus (<80%) session
        // right after a gap can legitimately still land at streak 0.
        const danCardEl = document.getElementById('dan-streak-card');
        if (danCardEl) danCardEl.classList.remove('is-angry', 'is-sad');
    }

    _hammerState.streakHammers = d.streakHammers ?? _hammerState.streakHammers;
    renderHammerUI();
    if (d.hammerEarned) {
        toast('🔨 Bạn vừa nhận 1 búa Daniel vì học Paraphrase Unit xuất sắc (>=90%)!', 'success');
        announceHammerEarned();
    }
    loadWeeklyProgress();
}

// Reports only the answers/correct-count since the LAST successful report
// (a "batch"), not the whole session — the backend's daily word-engagement
// total (see streakBonusService.reachedDailyWordThreshold, gating the
// streak at 35 words/day) is accumulated server-side via $inc, so sending
// the running session total on every call would massively over-count once
// a session crosses 5 answers more than once. Previously this fired once
// per session and then never again (a `_streakReportedThisSession` flag
// that only ever flipped true), which silently capped every session's
// contribution at its first 5 answers no matter how long the student kept
// going — the exact reason "học hơn 35 chữ vẫn không cộng chuỗi lửa" reports
// started after the 35-word threshold shipped: a single long session could
// never report more than 5 words toward that day's total.
async function _reportSessionStreak() {
    if (_streakReportInFlight) return;
    const batchAnswered = sessionAnsweredCount - _lastReportedAnsweredCount;
    if (batchAnswered < 5) return;
    const batchCorrect = correctAnswers - _lastReportedCorrectCount;
    _streakReportInFlight = true;
    // Snapshot before the await — sessionAnsweredCount/correctAnswers can
    // keep advancing while this request is in flight (the next answer's
    // _countAnswer() call doesn't wait for us), so what we mark "reported"
    // must match exactly what this specific request's body claimed.
    const reportedAnswered = sessionAnsweredCount;
    const reportedCorrect  = correctAnswers;
    try {
        const isParaphrase = _isParaphraseUnitSession();
        const res = await fetch(`${API}/vocabbook/practice-complete`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({
                wordsAnswered: batchAnswered,
                correctAnswered: batchCorrect,
                unitId: isParaphrase ? currentUnit._id : null,
                unitType: isParaphrase ? 'paraphrase' : null,
                sessionId: _vocabSessionId
            })
        });
        const d = await window.ApiClient.handleResponse(res);
        _lastReportedAnsweredCount = reportedAnswered;
        _lastReportedCorrectCount  = reportedCorrect;
        _applyStreakResult(d);
        if (window.showBadgeUnlocked && d?.newlyUnlocked?.length) window.showBadgeUnlocked(d.newlyUnlocked);
    } catch { /* silent — batch stays unreported, picked up by the next trigger */ }
    finally { _streakReportInFlight = false; }
}

function startPractice(mode) {
    _vocabQuizActive = true;
    wrongWordSet.clear();
    requeuedWords.clear();
    _vocabWordsSeen.clear();
    _persistedThisSession = false;
    _isDifficultPractice = false;
    mixedQueue = [];
    mixedIndex = 0;
    currentQuestionIndex = 0;
    correctAnswers = 0;
    wrongAnswers   = 0;
    answered = false;
    sessionAnsweredCount = 0;
    _lastReportedAnsweredCount = 0;
    _lastReportedCorrectCount = 0;
    _vocabSessionId = _newVocabSessionId();
    const wrongListEl = document.getElementById('wrong-words-list');
    if (wrongListEl) wrongListEl.style.display = 'none';

    // Lấy tất cả từ (vocab + paraphrase); _retryWordList is set by retryWrongWords
    const allPracticeWords = (_retryWordList || currentUnit.words).filter(w => w.word && w.meaning);
    _retryWordList = null;
    if (!allPracticeWords.length) { toast('No words in this unit to practice', 'info'); return; }

    if (mode === 'mixed') {
        // Xây hàng đợi hỗn hợp: mỗi từ được gán ngẫu nhiên 1 trong 3 kiểu
        const types = ['multipleChoice', 'listening', 'translation'];
        const words = [...allPracticeWords];
        shuffleArray(words);
        mixedQueue = words.map((w, i) => ({ word: w, type: types[i % types.length] }));
        shuffleArray(mixedQueue);
        document.getElementById('mixedMode').style.display = 'block';
        showMixedQuestion();
        return;
    }

    practiceWords = [...allPracticeWords];
    shuffleArray(practiceWords);
    const modeEl = {
        multipleChoice: 'multipleChoiceMode',
        fillBlank:      'fillBlankMode',
        listening:      'listeningMode',
        translation:    'translationMode'
    }[mode];
    if (modeEl) document.getElementById(modeEl).style.display = 'block';
    showQuestion(mode);
}

function showQuestion(mode) {
    if (currentQuestionIndex >= practiceWords.length) { showResults(mode); return; }
    currentWord = practiceWords[currentQuestionIndex];
    if (mode === 'multipleChoice') showMultipleChoiceQuestion();
    else if (mode === 'fillBlank') showFillBlankQuestion();
    else if (mode === 'listening') showListeningQuestion();
    else if (mode === 'translation') showTranslationQuestion();
}

function updateProgress(prefix) {
    const total = currentMode === 'mixed' ? mixedQueue.length : practiceWords.length;
    const cur   = currentMode === 'mixed' ? mixedIndex : currentQuestionIndex;
    // (cur+1) to match the "N/total" text below — otherwise the bar always
    // lagged one question behind (0% on question 1, never 100% until the
    // results screen appeared).
    const pct   = total ? ((cur + 1) / total) * 100 : 0;
    const fill  = document.getElementById(`${prefix}ProgressFill`);
    const txt   = document.getElementById(`${prefix}ProgressText`);
    if (fill) fill.style.width = pct + '%';
    if (txt)  txt.textContent = `${cur + 1}/${total}`;
}

// Spaced repetition: đưa từ sai vào 3 vị trí sau trong hàng đợi
function requeueWrongWord(word) {
    const key = word.word;
    if (requeuedWords.has(key)) return;
    requeuedWords.add(key);
    if (currentMode === 'mixed') {
        const types = ['multipleChoice', 'listening', 'translation'];
        const type  = types[Math.floor(Math.random() * types.length)];
        const insertAt = Math.min(mixedIndex + 4, mixedQueue.length);
        mixedQueue.splice(insertAt, 0, { word, type, _isRepeat: true });
    } else {
        const insertAt = Math.min(currentQuestionIndex + 4, practiceWords.length);
        practiceWords.splice(insertAt, 0, word);
    }
}

function nextQuestion(mode) { currentQuestionIndex++; showQuestion(mode); }
function restartPractice() {
    // Ưu tiên ôn lại từ sai; nếu không có từ sai thì làm lại toàn bộ
    if (wrongWordSet.size > 0) {
        retryWrongWords();
    } else {
        _activateModeNow(currentMode); // _activateModeNow ẩn resultsMode trước khi bắt đầu
    }
}

/* ── Quit-practice confirmation modal ── */
let _quitCallback = null;

function _isActivePractice() {
    // A Lesson quiz (dashboard-lesson.js's separate state/engine) also
    // counts as "active practice to warn about" — closes the gap where
    // the browser Back button (popstate → goHomeView/loadUnit/openBook,
    // all of which already route through askQuitPractice()) silently
    // abandoned a mid-run Lesson quiz with no warning at all (student UI
    // audit, Nhóm 3, 2026-07-25). openLesson()/closeLessonView()'s own
    // confirm2() guard still handles their own direct exit buttons.
    if (typeof isQuizInProgress === 'function' && isQuizInProgress()) return true;
    if (currentMode === 'study') return false;
    const resultsEl = document.getElementById('resultsMode');
    if (resultsEl && resultsEl.style.display === 'block') return false;
    const total = currentMode === 'mixed' ? mixedQueue.length : practiceWords.length;
    if (total === 0) return false;
    return (correctAnswers + wrongAnswers) > 0;
}

function askQuitPractice(onQuit) {
    if (!_isActivePractice()) { onQuit(); return; }

    _quitCallback = onQuit;

    // Lesson quiz doesn't share Unit-practice's currentMode/practiceWords/
    // wrongWordSet globals used below — build its own message instead of
    // falling through to an empty one.
    if (typeof isQuizInProgress === 'function' && isQuizInProgress()) {
        const q = lessonState.quiz;
        const remaining = Math.max(0, q.queue.length - q.index);
        const titleEl = document.getElementById('quit-title');
        const subEl   = document.getElementById('quit-sub');
        const emoji   = document.getElementById('quit-mascot-emoji');
        if (titleEl) titleEl.textContent = 'Bạn đang làm dở quiz!';
        if (subEl)   subEl.textContent   = remaining > 0 ? `Còn ${remaining} câu chưa làm — tiến độ sẽ không được lưu` : 'Tiến độ lần này sẽ không được lưu';
        if (emoji)   emoji.textContent   = '🐼';
        openModal('modal-quit-practice');
        return;
    }

    const remaining = currentMode === 'mixed'
        ? Math.max(0, mixedQueue.length - mixedIndex)
        : Math.max(0, practiceWords.length - currentQuestionIndex);
    const wrongCount = wrongWordSet.size;

    const parts = [];
    if (remaining > 0)   parts.push(`${remaining} words still left`);
    if (wrongCount > 0)  parts.push(`${wrongCount} words still being reviewed`);
    const streakEl = document.getElementById('mascot-streak-num');
    const streak   = streakEl ? (parseInt(streakEl.textContent) || 0) : 0;
    if (streak > 0)      parts.push(`Your ${streak}-day streak is waiting! 🔥`);

    const titleEl = document.getElementById('quit-title');
    const subEl   = document.getElementById('quit-sub');
    const emoji   = document.getElementById('quit-mascot-emoji');

    if (titleEl) titleEl.textContent = wrongCount > 0
        ? 'You still have words to review!'
        : 'Do you want to keep studying?';
    if (subEl)   subEl.textContent   = parts.join(' · ');
    if (emoji)   emoji.textContent   = streak >= 7 ? '🐼🔥' : '🐼';

    openModal('modal-quit-practice');
}

function confirmQuit() {
    closeModal('modal-quit-practice');
    _reportSessionStreak(); // tính streak nếu đã trả lời >= 5 từ trước khi thoát
    if (_quitCallback) { const cb = _quitCallback; _quitCallback = null; cb(); }
}

function cancelQuit() {
    closeModal('modal-quit-practice');
    _quitCallback = null;
}

/* ── Stop practice mid-session ── */
function stopPractice() {
    askQuitPractice(() => showResults(currentMode));
}

/* ══════════════════════════════════════════════
   MIXED MODE
══════════════════════════════════════════════ */
function showMixedQuestion() {
    if (mixedIndex >= mixedQueue.length) { showResults('mixed'); return; }
    answered = false;
    const item = mixedQueue[mixedIndex];
    currentWord = item.word;
    const type  = item.type;

    // Update mixed progress bar. (mixedIndex+1) to match the "N/total" text
    // below — see updateProgress()'s comment for why the bare index lags.
    const total = mixedQueue.length;
    const pct   = ((mixedIndex + 1) / total) * 100;
    const fill  = document.getElementById('mixProgressFill');
    const txt   = document.getElementById('mixProgressText');
    if (fill) fill.style.width = pct + '%';
    if (txt)  txt.textContent = `${mixedIndex + 1}/${total}`;

    // Badge ôn tập nếu là từ bị requeue
    const repeatBadge = item._isRepeat
        ? '<span style="background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:12px;padding:2px 10px;font-size:11px;font-weight:700;margin-bottom:10px;display:inline-block">🔁 Review again</span>'
        : '';

    // Render question theo type vào #mixQuestionWrap
    const wrap = document.getElementById('mixQuestionWrap');
    if (type === 'multipleChoice') {
        const opts = generateOptions(currentWord);
        wrap.innerHTML = `
          <div class="question-card">
            ${repeatBadge}
            <div class="question-number" style="font-size:11px;color:var(--text3);text-transform:uppercase;font-weight:700;letter-spacing:.6px;margin-bottom:12px">
              <i class="fas fa-check-circle"></i> Multiple Choice
            </div>
            <div class="question-text" style="font-size:18px;font-weight:700;margin-bottom:20px">
              What does "<strong>${_esc(currentWord.word)}</strong>" mean?
              <button class="btn-audio" onclick="speakWord('${escH(currentWord.word)}')" title="Pronounce" style="font-size:17px;vertical-align:middle;margin-left:6px;opacity:.75">🔊</button>
            </div>
            <div class="answer-options" id="mixAnswerOptions">
              ${opts.map(o => `<button class="answer-option" onclick="checkMixedMC(this,'${escH(o)}','${escH(currentWord.meaning)}')">${_esc(o)}</button>`).join('')}
            </div>
            <button class="btn-next" id="mixBtnNext" onclick="advanceMixed()" style="display:none">Next <i class="fas fa-arrow-right"></i></button>
          </div>`;
    } else if (type === 'listening') {
        wrap.innerHTML = `
          <div class="question-card">
            ${repeatBadge}
            <div class="question-number" style="font-size:11px;color:var(--text3);text-transform:uppercase;font-weight:700;letter-spacing:.6px;margin-bottom:12px">
              <i class="fas fa-headphones"></i> Listening
            </div>
            <button class="btn-play-audio" onclick="speakWord('${escH(currentWord.word)}')"><i class="fas fa-volume-up" style="font-size:24px"></i> Play Audio</button>
            <div class="listen-hint" style="font-size:13px;color:var(--text2);margin:10px 0">💡 The word has ${currentWord.word.length} letters</div>
            <div class="fb-input-row">
              <input class="listen-input" id="mixListenInput" placeholder="Type what you hear..." onkeypress="if(event.key==='Enter')checkMixedListen()"/>
              <button class="btn-check" onclick="checkMixedListen()">Check</button>
            </div>
            <div id="mixListenFeedback" style="margin-top:10px"></div>
            <button class="btn-next" id="mixBtnNext" onclick="advanceMixed()" style="display:none">Next <i class="fas fa-arrow-right"></i></button>
          </div>`;
    } else {
        const ex = currentWord.example || `The word is: ${currentWord.word}`;
        const exEsc = _esc(ex);
        const wordEsc = _esc(currentWord.word);
        const exHtml = exEsc.replace(new RegExp(`\\b${escR(wordEsc)}\\b`, 'gi'),
            `<strong class="highlight-word">${wordEsc}</strong>`);
        wrap.innerHTML = `
          <div class="question-card">
            ${repeatBadge}
            <div class="question-number" style="font-size:11px;color:var(--text3);text-transform:uppercase;font-weight:700;letter-spacing:.6px;margin-bottom:12px">
              <i class="fas fa-language"></i> Translation
            </div>
            <div class="trans-example" style="font-size:15px;color:var(--text2);background:var(--surface2);border-radius:var(--radius-sm);padding:14px 18px;margin-bottom:14px;line-height:1.6">${exHtml}</div>
            <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:10px">Translate: <strong>${_esc(currentWord.word)}</strong> <button class="btn-audio" onclick="speakWord('${escH(currentWord.word)}')" title="Pronounce" style="font-size:17px;vertical-align:middle;margin-left:6px;opacity:.75">🔊</button></div>
            <div class="fb-input-row">
              <input class="trans-input" id="mixTransInput" placeholder="Enter the meaning..." onkeypress="if(event.key==='Enter')checkMixedTrans()"/>
              <button class="btn-check" onclick="checkMixedTrans()">Check</button>
            </div>
            <div id="mixTransFeedback" style="margin-top:10px"></div>
            <button class="btn-next" id="mixBtnNext" onclick="advanceMixed()" style="display:none">Next <i class="fas fa-arrow-right"></i></button>
          </div>`;
        setTimeout(() => document.getElementById('mixTransInput')?.focus(), 50);
    }
    setupDictionaryDouble('mixQuestionWrap', 'vocab-quiz', () => !_vocabQuizActive);
}

function advanceMixed() { mixedIndex++; currentQuestionIndex = mixedIndex; showMixedQuestion(); }

// ── Shared answer-checking helpers ──────────────────────────────────────
// Each of MC / Listening / Translation has both a standalone mode AND a
// Mixed-mode sub-type that graded a question the exact same way, differing
// only in which DOM ids they read/write — see comments at each call site.

function _checkMCAnswer(btn, selected, correct, optionsSelector, nextBtnId) {
    if (answered) return; answered = true;
    // .opt-locked (class, not the native `disabled` attribute) — disabling
    // for real would stop the button from ever firing dblclick again,
    // breaking double-click word lookup on the option just answered.
    document.querySelectorAll(`${optionsSelector} .answer-option`).forEach(b => b.classList.add('opt-locked'));
    if (selected === correct) {
        btn.classList.add('correct'); correctAnswers++; playCorrectSound();
    } else {
        btn.classList.add('wrong'); wrongAnswers++; playWrongSound();
        wrongWordSet.add(currentWord.word);
        requeueWrongWord(currentWord);
        document.querySelectorAll(`${optionsSelector} .answer-option`)
            .forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
    }
    // Called after correctAnswers/wrongAnswers are tallied for THIS answer —
    // _reportSessionStreak() (triggered once sessionAnsweredCount hits 5)
    // reads those counts, so it must see the current answer's result too.
    _countAnswer();
    document.getElementById(nextBtnId).style.display = 'flex';
}

function _checkExactWordMatch(inputId, feedbackId, nextBtnId) {
    if (answered) return; answered = true;
    const inputEl = document.getElementById(inputId);
    const ua = inputEl?.value.trim().toLowerCase() || '';
    inputEl.disabled = true;
    const ok = ua === currentWord.word.toLowerCase();
    const feedbackEl = document.getElementById(feedbackId);
    if (ok) {
        feedbackEl.innerHTML =
            `<div class="feedback-correct">✅ Correct! <strong>${_esc(currentWord.word)}</strong> – ${_esc(currentWord.meaning)}</div>`;
        correctAnswers++; playCorrectSound();
    } else {
        feedbackEl.innerHTML =
            `<div class="feedback-wrong">❌ Answer: <strong>${_esc(currentWord.word)}</strong> – ${_esc(currentWord.meaning)}
             <button class="btn-check" style="margin-top:8px" onclick="speakWord('${escH(currentWord.word)}')">🔊 Listen again</button></div>`;
        wrongAnswers++; playWrongSound();
        wrongWordSet.add(currentWord.word);
        requeueWrongWord(currentWord);
    }
    _countAnswer();
    document.getElementById(nextBtnId).style.display = 'flex';
}

// minWordLen: standalone Translation mode and Mixed mode's translation
// sub-type used to duplicate this exact fuzzy-match algorithm with one
// subtle difference — Mixed filtered out single-letter words before
// comparing (`length > 1`) while standalone Translation kept them
// (`filter(Boolean)`, i.e. length >= 1). Preserved here via this param
// instead of silently unifying the two (a real, if minor, behavioural
// difference — not something this cleanup should change).
function _isMeaningMatch(userAnswer, correctMeaningRaw, minWordLen) {
    const ua    = (userAnswer || '').trim().toLowerCase();
    const caRaw = (correctMeaningRaw || '').toLowerCase();
    const alts  = caRaw.split(/[\/,]/).map(s => s.trim()).filter(s => s.length > 0);
    const norm  = s => s.replace(/[^a-z0-9àáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹý一-鿿㐀-䶿가-힯]/gi, '').trim();
    return alts.some(alt => {
        const normAlt = norm(alt), normUa = norm(ua);
        if (normUa === normAlt) return true;
        const altWords = normAlt.split(/\s+/).filter(w => w.length >= minWordLen);
        const uaWords  = normUa.split(/\s+/).filter(w => w.length >= minWordLen);
        if (altWords.length === 0) return false;
        return altWords.every(w => uaWords.some(u => u.includes(w) || w.includes(u)));
    });
}

function checkMixedMC(btn, selected, correct) {
    _checkMCAnswer(btn, selected, correct, '#mixAnswerOptions', 'mixBtnNext');
}

function checkMixedListen() {
    _checkExactWordMatch('mixListenInput', 'mixListenFeedback', 'mixBtnNext');
}

function checkMixedTrans() {
    if (answered) return; answered = true;
    const inputEl = document.getElementById('mixTransInput');
    const ua = inputEl?.value.trim().toLowerCase() || '';
    inputEl.disabled = true;
    const ok = _isMeaningMatch(ua, currentWord.meaning, 2);
    if (ok) {
        document.getElementById('mixTransFeedback').innerHTML =
            `<div class="feedback-correct">✅ Well done! Answer: <em>${_esc(currentWord.meaning)}</em></div>`;
        correctAnswers++; playCorrectSound();
    } else {
        document.getElementById('mixTransFeedback').innerHTML =
            `<div class="feedback-wrong">❌ Correct answer: <strong>${_esc(currentWord.meaning)}</strong></div>`;
        wrongAnswers++; playWrongSound();
        wrongWordSet.add(currentWord.word);
        requeueWrongWord(currentWord);
    }
    _countAnswer();
    document.getElementById('mixBtnNext').style.display = 'flex';
}

/* ── Multiple Choice ── */
function showMultipleChoiceQuestion() {
    answered = false;
    updateProgress('mc');
    document.getElementById('mcQuestionNumber').textContent = `Question ${currentQuestionIndex + 1}/${practiceWords.length}`;
    document.getElementById('mcQuestionText').innerHTML =
        `What does "<strong>${_esc(currentWord.word)}</strong>" mean?
        <button class="btn-audio" onclick="speakWord('${escH(currentWord.word)}')" title="Pronounce" style="font-size:17px;vertical-align:middle;margin-left:6px;opacity:.75">🔊</button>`;
    const opts      = generateOptions(currentWord);
    const container = document.getElementById('mcAnswerOptions');
    container.innerHTML = opts.map(o =>
        `<button class="answer-option" onclick="checkMultipleChoice(this,'${escH(o)}','${escH(currentWord.meaning)}')">${_esc(o)}</button>`
    ).join('');
    document.getElementById('mcBtnNext').style.display = 'none';
    setupDictionaryDouble('multipleChoiceMode', 'vocab-quiz', () => !_vocabQuizActive);
}
function generateOptions(cw) {
    const opts  = [cw.meaning];
    const other = currentUnit.words.filter(w => w.word !== cw.word);
    while (opts.length < 4 && other.length) {
        const i = Math.floor(Math.random() * other.length);
        if (!opts.includes(other[i].meaning)) opts.push(other[i].meaning);
        other.splice(i, 1);
    }
    shuffleArray(opts);
    return opts;
}
function checkMultipleChoice(btn, selected, correct) {
    _checkMCAnswer(btn, selected, correct, '#mcAnswerOptions', 'mcBtnNext');
}
// Backslash MUST be escaped before the quote-escaping step below — otherwise
// a word/meaning ending in a literal backslash (e.g. `x\`) lets the quote it
// precedes close the onclick="...('...')" JS string early, turning the rest
// of the attribute into executable script.
function escH(s) { return (s || '').replace(/\\/g, '\\\\').replace(/&/g, '&amp;').replace(/'/g, "\\'").replace(/"/g, '&quot;'); }
function escR(s) { return (s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/* ── Flashcard ── */
function showFillBlankQuestion() {
    answered = false; isFlipped = false; hintUsed = false;
    updateProgress('fb');
    document.getElementById('fbQuestionNumber').textContent = `Question ${currentQuestionIndex + 1}/${practiceWords.length}`;
    document.getElementById('fbMeaning').textContent  = currentWord.meaning;
    document.getElementById('fbWord').textContent     = currentWord.word;
    document.getElementById('fbPhonetic').textContent = currentWord.phonetic || '';

    const isPara = currentWord.type === 'paraphrase';
    const labelEl = document.getElementById('fcBackLabel');
    if (labelEl) labelEl.textContent = isPara ? 'Text in passage' : 'English word';
    const paraEl = document.getElementById('fbParaphrase');
    if (paraEl) {
        paraEl.textContent = currentWord.paraphrase ? `→ Paraphrase: ${currentWord.paraphrase}` : '';
        paraEl.style.display = currentWord.paraphrase ? '' : 'none';
    }

    document.getElementById('flashcard').classList.remove('flipped');
    document.getElementById('fbInput').value    = '';
    document.getElementById('fbInput').disabled = false;
    document.getElementById('fbFeedback').innerHTML = '';
    document.getElementById('fbBtnNext').style.display   = 'none';
    document.getElementById('quick-btns').style.display  = 'none';
    document.getElementById('fbInputArea').style.display = 'none';
    setupDictionaryDouble('flashcard', 'vocab-flashcard', () => !_vocabQuizActive);

    // FIX: re-enable buttons bị disable từ lần trước
    document.querySelectorAll('.btn-remembered,.btn-not-remembered').forEach(b => b.disabled = false);
}
function flipCard() {
    const fc = document.getElementById('flashcard');
    if (!isFlipped) {
        fc.classList.add('flipped');
        isFlipped = true;
        setTimeout(() => {
            document.getElementById('quick-btns').style.display  = 'flex';
            document.getElementById('fbInputArea').style.display = 'block';
            // FIX: dùng speakWord (có fallback) thay vì speechSynth trực tiếp
            speakWord(currentWord?.word);
            document.getElementById('fbInput').focus();
        }, 300);
    } else {
        fc.classList.remove('flipped');
        isFlipped = false;
        document.getElementById('quick-btns').style.display  = 'none';
        document.getElementById('fbInputArea').style.display = 'none';
    }
}
function markAsRemembered() {
    if (!isFlipped) { toast('Flip the card first!', 'error'); return; }
    if (answered) return; answered = true;
    correctAnswers++; playCorrectSound();
    _countAnswer();
    document.getElementById('fbFeedback').innerHTML = '<div class="feedback-correct">✅ Great job! You remembered this word! 🎉</div>';
    disableFlashcardBtns();
    setTimeout(() => { currentQuestionIndex++; showQuestion('fillBlank'); }, 1500);
}
function markAsNotRemembered() {
    if (!isFlipped) { toast('Flip the card first!', 'error'); return; }
    if (answered) return; answered = true;
    wrongAnswers++; playWrongSound();
    wrongWordSet.add(currentWord.word);
    requeueWrongWord(currentWord);
    _countAnswer();

    // Hiện feedback + nút Tiếp theo ngay để học sinh tự review rồi bấm
    document.getElementById('fbFeedback').innerHTML =
        `<div class="feedback-wrong">💪 Keep going! Word: <strong>${_esc(currentWord.word)}</strong> – ${_esc(currentWord.meaning)}</div>`;
    disableFlashcardBtns();

    // Hiện nút Tiếp theo ngay (học sinh tự bấm khi sẵn sàng)
    const btnNext = document.getElementById('fbBtnNext');
    if (btnNext) btnNext.style.display = 'flex';

    // Tự động chuyển sau 15 giây nếu học sinh không bấm
    _clearAutoNext();
    _autoNextTimer = setTimeout(() => { _autoNextTimer = null; currentQuestionIndex++; showQuestion('fillBlank'); }, 15000);

    // Nếu học sinh bấm nút Tiếp theo → huỷ timer tự động
    if (btnNext) {
        btnNext.onclick = function() {
            _clearAutoNext();
            currentQuestionIndex++; showQuestion('fillBlank');
        };
    }
}
function disableFlashcardBtns() {
    document.querySelectorAll('.btn-remembered,.btn-not-remembered').forEach(b => b.disabled = true);
    const inp = document.getElementById('fbInput');
    if (inp) inp.disabled = true;
}
function showHint() {
    if (!document.getElementById('flashcard').classList.contains('flipped')) return;
    const rawHint = currentWord.word[0] + '_'.repeat(currentWord.word.length - 1);
    const hint = _esc(rawHint);
    document.getElementById('fbFeedback').innerHTML =
        `<div class="feedback-hint">💡 Hint: <strong>${hint}</strong> (${currentWord.word.length} letters)</div>`;
    hintUsed = true;
}
function checkFillBlank() {
    if (answered || !isFlipped) return;
    const ua = document.getElementById('fbInput').value.trim().toLowerCase();
    const ca = currentWord.word.toLowerCase();
    if (!ua) { toast('Type a word first', 'error'); return; }
    answered = true;
    document.getElementById('fbInput').disabled = true;
    disableFlashcardBtns();
    if (ua === ca) {
        document.getElementById('fbFeedback').innerHTML = '<div class="feedback-correct">✅ Correct! 🎉</div>';
        correctAnswers++; playCorrectSound();
    } else {
        document.getElementById('fbFeedback').innerHTML =
            `<div class="feedback-wrong">❌ Answer: <strong>${_esc(currentWord.word)}</strong></div>`;
        wrongAnswers++; playWrongSound();
        wrongWordSet.add(currentWord.word);
        requeueWrongWord(currentWord);
    }
    _countAnswer();
    document.getElementById('fbBtnNext').style.display = 'flex';
}

/* ── Listening – FIX: không auto-play khi load, chỉ play khi bấm nút ── */
function showListeningQuestion() {
    answered = false;
    _listenHintCount = 0;
    updateProgress('listen');
    document.getElementById('listenQuestionNumber').textContent = `Question ${currentQuestionIndex + 1}/${practiceWords.length}`;
    document.getElementById('listenHint').textContent = `💡 The word has ${currentWord.word.length} letters`;
    const meaningRow = document.getElementById('listenMeaning');
    if (meaningRow) {
        const hasMeaning = !!currentWord.meaning;
        meaningRow.style.display = hasMeaning ? '' : 'none';
        document.getElementById('listenMeaningText').textContent = hasMeaning ? currentWord.meaning : '';
    }
    const letterHintEl = document.getElementById('listenLetterHint');
    if (letterHintEl) { letterHintEl.textContent = ''; letterHintEl.style.display = 'none'; }
    const hintBtn = document.getElementById('listenHintBtn');
    if (hintBtn) {
        hintBtn.disabled = false;
        document.getElementById('listenHintBtnLabel').textContent = `Hint (${LISTEN_HINT_MAX})`;
    }
    document.getElementById('listenInput').value   = '';
    document.getElementById('listenInput').disabled = false;
    document.getElementById('listenFeedback').innerHTML = '';
    document.getElementById('listenBtnNext').style.display = 'none';
    // FIX: bỏ auto-play speakWord() — người dùng tự bấm nút "Phát Âm Thanh"
    // Thiết bị Android không Google TTS sẽ crash/im lặng nếu auto-play
    setupDictionaryDouble('listeningMode', 'vocab-quiz', () => !_vocabQuizActive);
}
function playAudio() { speakWord(currentWord?.word); }
// Progressive letter reveal — each press shows one more letter of the answer
// (1st press: 1 letter, 2nd: 2, 3rd: 3), capped at LISTEN_HINT_MAX presses so
// it stays a hint rather than just handing over the whole word.
function showListenHint() {
    if (answered || !currentWord?.word || _listenHintCount >= LISTEN_HINT_MAX) return;
    _listenHintCount++;
    const word = currentWord.word;
    const revealed = _esc(word.slice(0, _listenHintCount));
    const masked = '_ '.repeat(Math.max(0, word.length - _listenHintCount)).trim();
    const letterHintEl = document.getElementById('listenLetterHint');
    if (letterHintEl) {
        letterHintEl.textContent = `💡 ${revealed}${masked ? ' ' + masked : ''}`;
        letterHintEl.style.display = '';
    }
    const remaining = LISTEN_HINT_MAX - _listenHintCount;
    const hintBtn = document.getElementById('listenHintBtn');
    if (hintBtn) {
        document.getElementById('listenHintBtnLabel').textContent = remaining > 0 ? `Hint (${remaining})` : 'Hint';
        if (remaining <= 0) hintBtn.disabled = true;
    }
}
function checkListening() {
    _checkExactWordMatch('listenInput', 'listenFeedback', 'listenBtnNext');
}

/* ── Translation ── */
function showTranslationQuestion() {
    answered = false;
    updateProgress('trans');
    document.getElementById('transQuestionNumber').textContent = `Question ${currentQuestionIndex + 1}/${practiceWords.length}`;
    const ex = currentWord.example || `The word is: ${currentWord.word}`;
    const exEsc = _esc(ex);
    const wordEsc = _esc(currentWord.word);
    document.getElementById('transExample').innerHTML =
        exEsc.replace(new RegExp(`\\b${escR(wordEsc)}\\b`, 'gi'),
            `<strong class="highlight-word">${wordEsc}</strong>`);
    setupDictionaryDouble('transExample', 'vocab-quiz', () => !_vocabQuizActive);
    document.getElementById('transWordHighlight').innerHTML = `Translate: <strong>${wordEsc}</strong> <button class="btn-audio" onclick="speakWord('${escH(currentWord.word)}')" title="Pronounce" style="font-size:17px;vertical-align:middle;margin-left:6px;opacity:.75">🔊</button>`;
    document.getElementById('transInput').value   = '';
    document.getElementById('transInput').disabled = false;
    document.getElementById('transFeedback').innerHTML = '';
    document.getElementById('transBtnNext').style.display = 'none';
    document.getElementById('transInput').focus();
}
function checkTranslation() {
    if (answered) return; answered = true;
    const inputEl = document.getElementById('transInput');
    const ua = inputEl.value.trim().toLowerCase();
    inputEl.disabled = true;
    const ok = _isMeaningMatch(ua, currentWord.meaning, 1);
    if (ok) {
        document.getElementById('transFeedback').innerHTML =
            `<div class="feedback-correct">✅ Well done! Answer: <em>${_esc(currentWord.meaning)}</em></div>`;
        correctAnswers++; playCorrectSound();
    } else {
        document.getElementById('transFeedback').innerHTML =
            `<div class="feedback-wrong">❌ Correct answer: <strong>${_esc(currentWord.meaning)}</strong></div>`;
        wrongAnswers++; playWrongSound();
        wrongWordSet.add(currentWord.word);
        requeueWrongWord(currentWord);
    }
    _countAnswer();
    document.getElementById('transBtnNext').style.display = 'flex';
}

/* ── Results ── */
function showResults(mode) {
    _vocabQuizActive = false;
    _clearAutoNext();
    ['studyMode','multipleChoiceMode','fillBlankMode','listeningMode','translationMode','mixedMode']
        .forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    document.getElementById('resultsMode').style.display = 'block';

    // Reset any hammer banner left over from a previous "Restart" run in the
    // same session, then show it immediately if a hammer was already
    // awarded earlier this session (long unit — the report fired mid-quiz,
    // well before this screen existed).
    const hammerBanner = document.getElementById('hammer-earned-banner');
    if (hammerBanner) hammerBanner.style.display = _pendingHammerAnnouncement ? 'block' : 'none';
    _pendingHammerAnnouncement = false;

    _reportSessionStreak(); // tính streak nếu đã trả lời >= 5 từ

    const stopBtn = document.getElementById('btnStopPractice');
    if (stopBtn) stopBtn.style.display = 'none';
    updateKbdHint(); // hide shortcut panel on results screen

    const total     = mode === 'mixed' ? mixedQueue.length : practiceWords.length;
    const answered_ = correctAnswers + wrongAnswers;
    const pct       = answered_ ? Math.round((correctAnswers / answered_) * 100) : 0;
    const modeNames = { multipleChoice: 'Quiz', fillBlank: 'Flashcard', listening: 'Listen', translation: 'Translate', mixed: 'Mixed' };
    document.getElementById('resultModeTitle').textContent = `Mode: ${modeNames[mode] || mode}`;
    document.getElementById('scorePercent').textContent    = pct + '%';
    document.getElementById('correctCount').textContent    = correctAnswers;
    document.getElementById('wrongCount').textContent      = wrongAnswers;
    const scoreMsgEl = document.getElementById('resultScoreMsg');
    if (scoreMsgEl) {
        const { emoji, message } = getScoreMessage(pct);
        scoreMsgEl.textContent = `${emoji} ${message}`;
    }

    // Hiện nút ôn tập từ sai nếu có
    const wrongCount = wrongWordSet.size;
    const wrongWrap  = document.getElementById('wrongRetryWrap');
    const wrongCntEl = document.getElementById('wrongRetryCount');
    if (wrongWrap) wrongWrap.style.display = wrongCount > 0 ? 'block' : 'none';
    if (wrongCntEl) wrongCntEl.textContent = wrongCount;

    const circ   = 2 * Math.PI * 68;
    const offset = circ - (pct / 100) * circ;
    const circle = document.getElementById('scoreCircle');
    circle.style.stroke = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#e53935';
    // Reset to full offset first, then animate to target via CSS transition
    circle.style.transition = 'none';
    circle.style.strokeDashoffset = circ;
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            circle.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)';
            circle.style.strokeDashoffset = offset;
        });
    });
    if (pct === 100) {
        setTimeout(() => spawnConfetti(100), 400);
    }
    void total; // total used for reference only

    // Vocab result image
    const vocabImgEl = document.getElementById('vocab-result-img');
    if (vocabImgEl) {
        vocabImgEl.src = pct >= 90 ? 'img/vocab_writingabove90%25.jpg'
                       : pct >= 70 ? 'img/above7.5.jpg'
                       : pct >= 50 ? 'img/vocab50_70%25.jpg'
                       : pct >= 20 ? 'img/vocabbelow50%25.jpg'
                       :             'img/verylowscore.jpg';
        vocabImgEl.style.display = 'block';
    }

    // Hiện danh sách từ đã sai
    const wrongListEl = document.getElementById('wrong-words-list');
    if (wrongListEl) {
        if (wrongWordSet.size > 0) {
            const allWords = currentUnit?.words || [];
            const wrongWords = [...wrongWordSet].map(ws => allWords.find(x => x.word === ws) || { word: ws, meaning: '' });
            wrongListEl.innerHTML = `<div class="wl-title">Words to review (${wrongWords.length}):</div>` +
                wrongWords.map(w => `<div class="wl-item"><span class="wl-word">${_esc(w.word)}</span>${w.meaning ? `<span class="wl-meaning">${_esc(w.meaning)}</span>` : ''}</div>`).join('');
            wrongListEl.style.display = 'block';
        } else {
            wrongListEl.style.display = 'none';
        }
    }
    // Sync graded-practice evidence (SRS box, wrongCount/correctCount,
    // derived status) to the server — chỉ 1 lần mỗi session để tránh
    // double-count, same guard the old wrongCount-only persist used.
    if (_vocabWordsSeen.size > 0 && !_persistedThisSession) {
        _persistedThisSession = true;
        _syncPracticeEvidence();
    }
    if (wrongWordSet.size > 0) _reportDifficultWords(); // track across all sessions

    // Priority 2C — only for a session launched via the Today's Learning
    // popup's "Start" button; normal vocab practice is unaffected.
    if (window.EWSLearning && window.EWSLearning.consumeStart('vocabulary')) {
        window.EWSLearning.showReviewPopup('vocabulary', {
            emoji: pct >= 80 ? '🎉' : '📚',
            scoreLabel: `${correctAnswers}/${answered_} correct`,
            subLabel: wrongCount > 0 ? `${wrongCount} word${wrongCount === 1 ? '' : 's'} still to review` : '',
            nextAction: wrongCount > 0 ? 'Practice your wrong words again, then continue your plan.' : 'Great result — keep it up!',
        });
    }
}

/* ══════════════════════════════════════════════
   KEYBOARD SHORTCUT HINT PANEL
══════════════════════════════════════════════ */
function updateKbdHint() {
    const panel = document.getElementById('kbd-hint-panel');
    const list  = document.getElementById('kbd-hint-list');
    if (!panel || !list) return;

    const isResults = document.getElementById('resultsMode')?.style.display === 'block';
    if (currentMode === 'study' || isResults) { panel.style.display = 'none'; return; }

    const hints = [];
    if (currentMode === 'fillBlank') {
        hints.push(['Space', 'Flip card']);
        hints.push(['Enter', 'Next question']);
    } else if (currentMode === 'multipleChoice' || currentMode === 'mixed') {
        hints.push(['1 – 4', 'Choose answer']);
        hints.push(['Enter / →', 'Next question']);
    } else {
        hints.push(['Enter / →', 'Next question']);
    }
    hints.push(['Esc', 'Stop studying']);

    list.innerHTML = hints.map(([key, label]) => `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;justify-content:space-between">
        <kbd style="background:var(--surface2);border:1px solid var(--border2);border-radius:5px;padding:2px 8px;font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--text);white-space:nowrap;flex-shrink:0">${key}</kbd>
        <span style="font-size:11px;color:var(--text2);text-align:right">${label}</span>
      </div>`).join('');

    panel.style.display = 'block';
}

/* ══════════════════════════════════════════════
   KEYBOARD SHORTCUTS during practice
   Space / → : flip flashcard or advance to next
   Enter     : advance to next question (after answering)
   1–4       : select multiple-choice option
   Esc       : trigger quit modal
══════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
    // Skip if typing in an input / textarea
    if (e.target.matches('input,textarea,select')) return;

    const unitView = document.getElementById('view-unit');
    if (!unitView || unitView.style.display === 'none') return;

    // Skip if any modal is open
    if (document.querySelector('.modal-overlay:not(.hidden)')) return;

    const _nextBtn = () => {
        const nextIds = ['mcBtnNext','fbBtnNext','listenBtnNext','transBtnNext','mixBtnNext'];
        for (const id of nextIds) {
            const btn = document.getElementById(id);
            if (btn && btn.style.display !== 'none') { btn.click(); return true; }
        }
        return false;
    };

    // Space / → : flip flashcard or advance
    if (e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentMode === 'fillBlank' && !answered) { flipCard(); return; }
        _nextBtn();
        return;
    }

    // Enter: flip if card not yet revealed, otherwise advance
    if (e.key === 'Enter') {
        e.preventDefault();
        if (currentMode === 'fillBlank' && !answered && !isFlipped) { flipCard(); return; }
        _nextBtn();
        return;
    }

    // 1–4: pick multiple-choice answer
    if (['1','2','3','4'].includes(e.key)) {
        if ((currentMode === 'multipleChoice' || currentMode === 'mixed') && !answered) {
            const opts = document.querySelectorAll(
                '#mcAnswerOptions .answer-option:not(.opt-locked), #mixAnswerOptions .answer-option:not(.opt-locked)'
            );
            const idx = parseInt(e.key) - 1;
            if (opts[idx]) { opts[idx].click(); }
        }
        return;
    }

    // Esc: quit practice
    if (e.key === 'Escape') {
        if (_isActivePractice()) stopPractice();
    }
});

/* ── Retry wrong words ── */
function retryWrongWords() {
    if (!wrongWordSet.size) return;
    const wordsToRetry = (currentUnit.words || []).filter(w => wrongWordSet.has(w.word));
    if (!wordsToRetry.length) { toast('No words found to retry', 'error'); return; }
    // Use _retryWordList instead of mutating currentUnit so Restart still has the full word list
    _retryWordList = wordsToRetry;
    _activateModeNow(currentMode === 'study' ? 'mixed' : currentMode);
}

/* ── Sync graded-practice evidence to the server (fire-and-forget) ──
   Single call site every practice mode funnels through at session end —
   replaces the old _persistWrongCounts() (wrongCount-only, in-book practice
   only) AND dashboard-review.js's former per-word status PATCH (review-due
   only). Server computes the actual SRS box movement, wrongCount/
   correctCount, and derived status (see vocabBookService.recordPracticeResult) —
   this only decides WHICH book each word belongs to and whether it was
   "ever wrong this session" (wins over any correct answer along the way,
   same rule the old review-due flow already used — not "last answer wins"). */
async function _syncPracticeEvidence() {
    if (!_vocabWordsSeen.size) return;
    const calls = [];
    for (const w of _vocabWordsSeen.values()) {
        const bookId = w._reviewBookId || (_isBookPractice ? currentBookId : null);
        if (!bookId) continue; // no resolvable book context (e.g. a curriculum Unit word) — nothing to sync
        const correct = !wrongWordSet.has(w.word);
        calls.push(
            fetch(`${API}/vocabbook/${bookId}/words/${w._id}/practice-result`, {
                method: 'POST', headers: authH(),
                body: JSON.stringify({ correct })
            })
            .then(r => window.ApiClient.handleResponse(r))
            // Reflect the server-computed outcome (status/srsBox/wrongCount/
            // correctCount) back onto THIS word object. For a book-practice
            // session `w` is the exact same object referenced by
            // currentBookData.words (openFlashcardMode/practiceHardWords
            // build currentUnit.words from that array, never a deep copy),
            // so this is what closeUnitView()'s re-render actually reads —
            // without it, the table would show pre-session wrongCount/status
            // until the next full page load. For review-due/weak-vocab
            // sessions `w` is a throwaway spread copy with nothing reading
            // it afterward, so the assign is harmless there.
            .then(data => {
                if (data?.word) Object.assign(w, data.word);
                if (window.showBadgeUnlocked && data?.newlyUnlocked?.length) window.showBadgeUnlocked(data.newlyUnlocked);
            })
            .catch(() => {})
        );
    }
    if (!calls.length) return;
    await Promise.all(calls);
    if (typeof loadMyVocabStats === 'function') loadMyVocabStats();
}

/* ══════════════════════════════════════════════
   DIFFICULT WORDS TRACKER
══════════════════════════════════════════════ */

/* Report wrong words from any session → server accumulates wrongCount */
async function _reportDifficultWords() {
    if (!wrongWordSet.size) return;
    const allWords = currentUnit?.words || [];
    const words = [...wrongWordSet].map(ws => {
        const found = allWords.find(x => x.word === ws);
        return found
            ? { word: found.word, meaning: found.meaning || '', phonetic: found.phonetic || '', partOfSpeech: found.partOfSpeech || '', example: found.example || '' }
            : { word: ws, meaning: '' };
    });
    const source = _isBookPractice
        ? (currentBookData?.name || 'Sổ cá nhân')
        : (_isDifficultPractice ? 'Từ hay sai' : (currentUnit?.unitNumber ? `Unit ${currentUnit.unitNumber}` : (currentUnit?.title || 'Unit')));
    try {
        const res = await fetch(`${API}/difficult-words/report`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ words, source })
        });
        await window.ApiClient.handleResponse(res);
        updateDifficultBadge();
    } catch {}
}

/* Update badge count on the sidebar button */
async function updateDifficultBadge() {
    try {
        const data = await fetch(`${API}/difficult-words`, { headers: authH() }).then(r => window.ApiClient.handleResponse(r));
        const count = (data.words || []).length;
        ['difficultCountBadge', 'difficultCountBadgeMob'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    } catch {}
}

/* Open the modal and load words */
async function openDifficultWordsModal() {
    // Same free-plan gate as openBook()/openLesson() — GET /difficult-words
    // is premium-gated server-side now, so block here too instead of
    // opening an empty modal that just shows a generic load-error.
    if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
        if (window.openUpgradeModal) openUpgradeModal();
        return;
    }
    openModal('modal-difficult-words');
    const body = document.getElementById('difficult-words-body');
    body.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text3)"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';
    document.getElementById('btn-practice-difficult').style.display = 'none';
    try {
        const data = await fetch(`${API}/difficult-words`, { headers: authH() }).then(r => window.ApiClient.handleResponse(r));
        _renderDifficultWords(data.words || []);
    } catch (err) {
        if (err.status === 403 && err.body?.requiresPremium) {
            closeDifficultWordsModal();
            if (window.openUpgradeModal) openUpgradeModal('trial_expired');
            return;
        }
        body.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text3)">Không thể tải danh sách. Vui lòng thử lại.</div>';
    }
}

function closeDifficultWordsModal() { closeModal('modal-difficult-words'); }

/* Render word list inside modal */
function _renderDifficultWords(words) {
    document.getElementById('difficult-words-count').textContent = words.length ? `(${words.length} từ)` : '';
    const body = document.getElementById('difficult-words-body');
    const practiceBtn = document.getElementById('btn-practice-difficult');

    if (!words.length) {
        body.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:var(--text3)">
                <div style="font-size:48px;margin-bottom:12px">🎉</div>
                <p style="font-size:14px;font-weight:600;color:var(--text2)">Chưa có từ nào trong danh sách!</p>
                <p style="font-size:13px;margin-top:6px;line-height:1.6">Từ sẽ được thêm tự động khi bạn trả lời sai từ đó<br>từ 3 lần trở lên trong bất kỳ session luyện tập nào.</p>
            </div>`;
        practiceBtn.style.display = 'none';
        return;
    }

    practiceBtn.style.display = 'flex';
    window._difficultWordsList = words;

    body.innerHTML = words.map(w => `
        <div class="dw-item" id="dw-item-${w._id}">
            <div class="dw-item-header">
                <div style="min-width:0">
                    <span class="dw-word">${_esc(w.word)}</span>
                    ${w.phonetic    ? `<span class="dw-phonetic"> ${_esc(w.phonetic)}</span>` : ''}
                    ${w.partOfSpeech ? `<span class="dw-pos"> · ${_esc(w.partOfSpeech)}</span>` : ''}
                </div>
                <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
                    <span class="dw-wrong-badge">🔥 ${w.wrongCount} lần</span>
                    <div class="dw-actions">
                        <button class="dw-btn-edit" onclick="startEditDifficultWord('${w._id}')" title="Chỉnh sửa nghĩa"><i class="fas fa-pen"></i></button>
                        <button class="dw-btn-del"  onclick="deleteDifficultWord('${w._id}')"    title="Xóa khỏi danh sách"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            </div>
            <div class="dw-meaning" id="dw-meaning-${w._id}">${w.meaning ? _esc(w.meaning) : '<em style="color:var(--text3)">Chưa có nghĩa</em>'}</div>
            ${w.example ? `<div class="dw-example">${_esc(w.example)}</div>` : ''}
            ${w.source  ? `<div class="dw-source"><i class="fas fa-tag" style="font-size:10px"></i> ${_esc(w.source)}</div>` : ''}
            <div class="dw-edit-form" id="dw-edit-${w._id}" style="display:none">
                <input class="dw-edit-input" id="dw-edit-meaning-${w._id}" value="${_esc(w.meaning || '')}" placeholder="Nhập nghĩa của từ...">
                <div style="display:flex;gap:6px;margin-top:8px">
                    <button class="btn-primary" style="font-size:12px;padding:5px 14px" onclick="saveDifficultWordEdit('${w._id}')">Lưu</button>
                    <button class="btn-outline" style="font-size:12px;padding:5px 14px" onclick="cancelDifficultWordEdit('${w._id}')">Hủy</button>
                </div>
            </div>
        </div>`).join('');
}

function startEditDifficultWord(id) {
    document.getElementById(`dw-edit-${id}`).style.display = 'block';
    document.getElementById(`dw-edit-meaning-${id}`).focus();
}

function cancelDifficultWordEdit(id) {
    document.getElementById(`dw-edit-${id}`).style.display = 'none';
}

async function saveDifficultWordEdit(id) {
    const meaning = document.getElementById(`dw-edit-meaning-${id}`).value.trim();
    try {
        const res = await fetch(`${API}/difficult-words/${id}`, {
            method: 'PATCH', headers: authH(),
            body: JSON.stringify({ meaning })
        });
        await window.ApiClient.handleResponse(res);
        const el = document.getElementById(`dw-meaning-${id}`);
        el.innerHTML = meaning ? _esc(meaning) : '<em style="color:var(--text3)">Chưa có nghĩa</em>';
        document.getElementById(`dw-edit-${id}`).style.display = 'none';
        if (window._difficultWordsList) {
            const w = window._difficultWordsList.find(x => x._id === id);
            if (w) w.meaning = meaning;
        }
        toast('Đã cập nhật', 'success');
    } catch { toast('Lỗi khi lưu', 'error'); }
}

async function deleteDifficultWord(id) {
    confirm2('Xóa khỏi danh sách', 'Bạn đã nhớ từ này rồi và muốn xóa khỏi danh sách hay sai?', async () => {
        try {
            const res = await fetch(`${API}/difficult-words/${id}`, { method: 'DELETE', headers: authH() });
            await window.ApiClient.handleResponse(res);
            document.getElementById(`dw-item-${id}`)?.remove();
            window._difficultWordsList = (window._difficultWordsList || []).filter(w => w._id !== id);
            const remaining = window._difficultWordsList.length;
            if (remaining === 0) {
                _renderDifficultWords([]);
            } else {
                document.getElementById('difficult-words-count').textContent = `(${remaining} từ)`;
            }
            updateDifficultBadge();
            toast('Đã xóa', 'success');
        } catch { toast('Lỗi khi xóa', 'error'); }
    });
}

/* Start a practice session using the difficult words list */
function startDifficultWordsPractice() {
    const words = window._difficultWordsList;
    if (!words?.length) return;

    closeDifficultWordsModal();

    const practiceWordsList = words.map(w => ({
        word:         w.word,
        meaning:      w.meaning      || '',
        phonetic:     w.phonetic     || '',
        partOfSpeech: w.partOfSpeech || '',
        example:      w.example      || '',
        type: 'vocab'
    }));

    _isBookPractice      = false;
    _isDifficultPractice = true;
    currentUnit = { title: 'Từ hay sai', unitNumber: null, words: practiceWordsList };

    document.getElementById('view-mybook').style.display = 'none';
    document.getElementById('view-unit').style.display   = 'flex';
    document.getElementById('unitTitle').textContent     = '🔥 Ôn lại từ hay sai';

    showMode('mixed');
}

/* ══════════════════════════════════════════════
   LOGOUT
══════════════════════════════════════════════ */
// logout() moved to js/auth.js (single source of truth — Phase 3 audit
// found this local copy never cleared 'lastLoginAt', unlike auth.js's).

/* ══════════════════════════════════════════════
   EXPOSE globals
══════════════════════════════════════════════ */
window.loadMyBooks        = loadMyBooks;
window.loadUnit           = loadUnit;
window.showMode           = showMode;
window.toggleDashFullscreen = toggleDashFullscreen;
window.openAddBookModal   = openAddBookModal;
window.createBook         = createBook;
window.openBook           = openBook;
window.openBookMenu          = openBookMenu;
window.startRenameFromMenu   = startRenameFromMenu;
window.deleteBookFromMenu    = deleteBookFromMenu;
window.openMergeModal        = openMergeModal;
window.toggleMergeItem       = toggleMergeItem;
window.confirmMerge          = confirmMerge;
window.renameBook            = renameBook;
window.deleteWord         = deleteWord;
window.updateWordStatus   = updateWordStatus;
window.toggleSelect       = toggleSelect;
window.toggleSelectAll    = toggleSelectAll;
window.bulkChangeStatus   = bulkChangeStatus;
window.bulkDelete         = bulkDelete;
window.openAddWordManual  = openAddWordManual;
window.addWordManual      = addWordManual;
window.selectBookForSave  = selectBookForSave;
window.confirmSaveWord    = confirmSaveWord;
window.openFlashcardMode  = openFlashcardMode;
window.openPreviewMode    = openPreviewMode;
window.closeUnitView      = closeUnitView;
window.speakWord          = speakWord;
window.flipCard           = flipCard;
window.markAsRemembered   = markAsRemembered;
window.markAsNotRemembered = markAsNotRemembered;
window.showHint           = showHint;
window.checkFillBlank     = checkFillBlank;
window.nextQuestion       = nextQuestion;
window.restartPractice    = restartPractice;
window.playAudio          = playAudio;
window.checkListening     = checkListening;
window.checkTranslation   = checkTranslation;
window.checkMultipleChoice = checkMultipleChoice;
window.closeModal         = closeModal;
window.selectEmoji        = selectEmoji;
window.lookupNewWord      = lookupNewWord;
window.openSaveWordFromUnit    = openSaveWordFromUnit;
window.copyParaphraseTable     = copyParaphraseTable;
window.stopPractice       = stopPractice;
window.confirmQuit        = confirmQuit;
window.cancelQuit         = cancelQuit;
window.retryWrongWords    = retryWrongWords;
window.advanceMixed       = advanceMixed;
window.checkMixedMC       = checkMixedMC;
window.checkMixedListen   = checkMixedListen;
window.checkMixedTrans    = checkMixedTrans;
window.practiceHardWords         = practiceHardWords;
window.openDifficultWordsModal   = openDifficultWordsModal;
window.closeDifficultWordsModal  = closeDifficultWordsModal;
window.startDifficultWordsPractice = startDifficultWordsPractice;
window.deleteDifficultWord       = deleteDifficultWord;
window.startEditDifficultWord    = startEditDifficultWord;
window.cancelDifficultWordEdit   = cancelDifficultWordEdit;
window.saveDifficultWordEdit     = saveDifficultWordEdit;
window.updateDifficultBadge      = updateDifficultBadge;

/* ── Mobile helpers ── */
window.openCurrentBookMenu = function() {
    if (currentBookId) openBookMenu(currentBookId);
};
window.filterWords = filterWords;
window.openEditWordModal = openEditWordModal;

// ── Bulk import ──────────────────────────────────────────────────────────────

let _bulkRows = []; // [{word, meaning, example, phonetic, partOfSpeech, status}]

function openBulkImport() {
    if (!currentBookId) { toast('Chọn sổ từ vựng trước', 'error'); return; }
    document.getElementById('bulk-textarea').value = '';
    document.getElementById('bulk-parse-error').style.display = 'none';
    document.getElementById('bulk-step-1').style.display = '';
    document.getElementById('bulk-step-2').style.display = 'none';
    _bulkRows = [];
    openModal('modal-bulk-import');
}

function bulkGoBack() {
    document.getElementById('bulk-step-1').style.display = '';
    document.getElementById('bulk-step-2').style.display = 'none';
}

async function parseBulkInput() {
    const raw = document.getElementById('bulk-textarea').value.trim();
    const errEl = document.getElementById('bulk-parse-error');
    if (!raw) { errEl.textContent = 'Vui lòng nhập ít nhất một từ.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';

    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed = [];
    const existingSet = new Set((currentBookData?.words || []).map(w => w.word.toLowerCase().trim()));

    for (const line of lines) {
        let word = '', meaning = '';
        const colonIdx = line.indexOf(':');
        const dashIdx  = line.indexOf(' - ');
        const tabIdx   = line.indexOf('\t');
        if (colonIdx > 0) {
            word    = line.slice(0, colonIdx).trim();
            meaning = line.slice(colonIdx + 1).trim();
        } else if (dashIdx > 0) {
            word    = line.slice(0, dashIdx).trim();
            meaning = line.slice(dashIdx + 3).trim();
        } else if (tabIdx > 0) {
            word    = line.slice(0, tabIdx).trim();
            meaning = line.slice(tabIdx + 1).trim();
        } else {
            word = line.trim();
        }
        if (!word) continue;
        const isDup = existingSet.has(word.toLowerCase());
        parsed.push({ word, meaning, example: '', phonetic: '', partOfSpeech: '', status: isDup ? 'dup' : 'loading', selected: !isDup });
    }

    if (!parsed.length) { errEl.textContent = 'Không tìm thấy từ nào hợp lệ.'; errEl.style.display = ''; return; }

    _bulkRows = parsed;
    document.getElementById('bulk-step-1').style.display = 'none';
    document.getElementById('bulk-step-2').style.display = '';
    _renderBulkPreview();

    // Auto-fetch examples concurrently for non-dup words
    const fetches = _bulkRows.map((row, i) => {
        if (row.status === 'dup') return Promise.resolve();
        return _fetchWordInfo(row.word).then(info => {
            _bulkRows[i].example      = info.example;
            _bulkRows[i].phonetic     = info.phonetic;
            _bulkRows[i].partOfSpeech = info.partOfSpeech;
            _bulkRows[i].status       = 'ok';
            _updateBulkRow(i);
        }).catch(() => {
            _bulkRows[i].status = 'ok';
            _updateBulkRow(i);
        });
    });
    await Promise.all(fetches);
    _updateBulkStepInfo();
}

async function _fetchWordInfo(word) {
    const [dictRes, memRes] = await Promise.allSettled([
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`),
        fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`).then(r => r.ok ? r.json() : null),
    ]);

    let phonetic = '', partOfSpeech = '', example = '';
    if (dictRes.status === 'fulfilled' && dictRes.value.ok) {
        const data = await dictRes.value.json();
        const entry = Array.isArray(data) ? data[0] : null;
        if (entry) {
            phonetic     = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '';
            partOfSpeech = entry.meanings?.[0]?.partOfSpeech || '';
            for (const m of entry.meanings || []) {
                const def = m.definitions?.find(d => d.example);
                if (def) { example = def.example; break; }
            }
        }
    }

    // dictionaryapi.dev (Wiktionary-sourced) very often has zero example
    // sentences even for common words ("mammal" has none) — fall back to
    // MyMemory's sentence-level TM matches (segment = English source text)
    // that actually contain the word as a whole word, same fallback used
    // by the single "Add vocabulary" lookup.
    if (!example) {
        const memMatches = (memRes.status === 'fulfilled' && memRes.value && memRes.value.matches) || [];
        if (memMatches.length) {
            const wordRe = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            const candidate = memMatches.find(m => {
                const seg = (m.segment || '').trim();
                return seg && seg.toLowerCase() !== word.toLowerCase() && _looksLikeSentence(seg) && wordRe.test(seg);
            });
            if (candidate) example = candidate.segment.trim();
        }
    }

    return { phonetic, partOfSpeech, example };
}

function _renderBulkPreview() {
    const tbody = document.getElementById('bulk-preview-body');
    tbody.innerHTML = _bulkRows.map((r, i) => `
        <tr id="bulk-row-${i}" class="${r.status === 'dup' ? 'bulk-row-dup' : ''}">
          <td><input type="checkbox" id="bulk-chk-${i}" ${r.selected ? 'checked' : ''} ${r.status === 'dup' ? 'disabled' : ''} onchange="_bulkRows[${i}].selected=this.checked;_updateBulkStepInfo()"/></td>
          <td><strong>${_esc(r.word)}</strong>${r.phonetic ? `<br><span class="bulk-phonetic">${_esc(r.phonetic)}</span>` : ''}</td>
          <td>${_esc(r.meaning) || '<em style="color:var(--text3)">—</em>'}</td>
          <td id="bulk-ex-${i}" class="bulk-ex-cell">
            ${r.status === 'loading' ? '<span class="bulk-spinner"></span>' :
              (r.example ? `<span class="bulk-example-text">${_esc(r.example)}</span>` : '<em style="color:var(--text3)">—</em>')}
          </td>
          <td id="bulk-st-${i}">${_bulkStatusBadge(r.status)}</td>
        </tr>`).join('');
    _updateBulkStepInfo();
}

function _updateBulkRow(i) {
    const r = _bulkRows[i];
    const exCell = document.getElementById(`bulk-ex-${i}`);
    const stCell = document.getElementById(`bulk-st-${i}`);
    const wordCell = document.querySelector(`#bulk-row-${i} td:nth-child(2)`);
    if (exCell) exCell.innerHTML = r.example
        ? `<span class="bulk-example-text">${_esc(r.example)}</span>`
        : '<em style="color:var(--text3)">—</em>';
    if (stCell) stCell.innerHTML = _bulkStatusBadge(r.status);
    if (wordCell) wordCell.innerHTML = `<strong>${_esc(r.word)}</strong>${r.phonetic ? `<br><span class="bulk-phonetic">${_esc(r.phonetic)}</span>` : ''}`;
}

function _bulkStatusBadge(status) {
    if (status === 'loading') return '<span class="bulk-spinner"></span>';
    if (status === 'dup')     return '<span class="bulk-badge bulk-badge-dup">Trùng</span>';
    return '<span class="bulk-badge bulk-badge-ok">OK</span>';
}

function _updateBulkStepInfo() {
    const el = document.getElementById('bulk-step2-info');
    if (!el) return;
    const total    = _bulkRows.length;
    const dups     = _bulkRows.filter(r => r.status === 'dup').length;
    const selected = _bulkRows.filter(r => r.selected).length;
    el.innerHTML = `<span>${total} từ được nhập</span>${dups ? `<span class="bulk-info-dup">· ${dups} từ trùng (bỏ qua)</span>` : ''}<span class="bulk-info-sel">· <strong>${selected}</strong> từ sẽ được thêm</span>`;
}

function bulkToggleAll(chk) {
    _bulkRows.forEach((r, i) => {
        if (r.status === 'dup') return;
        r.selected = chk.checked;
        const c = document.getElementById(`bulk-chk-${i}`);
        if (c) c.checked = chk.checked;
    });
    _updateBulkStepInfo();
}

async function confirmBulkImport() {
    const toAdd = _bulkRows.filter(r => r.selected && r.status !== 'dup');
    if (!toAdd.length) { toast('Không có từ nào được chọn', 'error'); return; }

    const btn = document.getElementById('btn-confirm-bulk');
    btn.disabled = true;
    btn.innerHTML = '<span class="bulk-spinner"></span> Đang thêm…';

    try {
        const res  = await fetch(`${API}/vocabbook/${currentBookId}/words/bulk`, {
            method: 'POST',
            headers: authH(),
            body: JSON.stringify({ words: toAdd })
        });
        const data = await window.ApiClient.handleResponse(res);
        toast(data.message, 'success');
        closeModal('modal-bulk-import');
        await refreshCurrentBook();
    } catch (err) {
        toast(err.message || 'Lỗi kết nối', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-plus"></i> Thêm vào sổ';
    }
}

function _esc(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function openGuideModal() { openModal('modal-guide'); }
window.openGuideModal    = openGuideModal;
window.openBulkImport    = openBulkImport;
window.parseBulkInput    = parseBulkInput;
window.confirmBulkImport = confirmBulkImport;
window.bulkGoBack        = bulkGoBack;
window.bulkToggleAll     = bulkToggleAll;