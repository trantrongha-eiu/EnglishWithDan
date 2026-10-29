// listening.html — full-test flow: test list, exam screen, audio player,
// question renderers, submit/review, highlights and dictionary hooks.
// js/listening-practice.js (Bài lẻ) loads after it and reuses its globals.
'use strict';

ExamFullscreen.install({
    target: () => {
        // Fullscreen trên màn hình đang active (exam hoặc practice)
        const practice = document.getElementById('screen-practice');
        return (practice && practice.classList.contains('active')) ? practice : document.getElementById('screen-exam');
    },
    buttons: [['btn-fullscreen', 'fs-icon-exam'], ['btn-fullscreen-pr', 'fs-icon-pr']],
    carry: ['dict-popup', 'translate-popup', 'dict-vocab-modal', 'modal-submit', 'modal-exit', 'modal-lt-practice-exit', 'modal-history', 'toast', 'section-nav-fixed', 'settings-panel'],
});

const API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';

// Escapes a value for embedding inside a single-quoted JS string
// literal that itself sits inside a double-quoted HTML event-handler
// attribute (e.g. onclick="fn('${escH(word)}')") — escHtml() (which
// only escapes &/</>/") is NOT safe there: a drag-drop word/option
// containing an apostrophe (e.g. "don't", "it's" — common in real
// IELTS word banks, and sentence-endings "letter" is admin-editable
// free text) breaks out of the JS string and leaves that element's
// handler silently non-functional. `'` is escaped to `\'` (a JS
// string escape, not an HTML entity) so it survives HTML attribute
// parsing intact and is correctly unescaped by the JS engine.
function escH(s) { return (s || '').replace(/&/g, '&amp;').replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

const state = {
    tests: [],
    currentTestId: null,
    currentTest: null,
    attemptId: null,      // ListeningAttempt._id created by /start — sent back on /submit so it updates that same row instead of inserting a second one
    pendingTestId: null,   // testId đang chờ xác thực key
    answers: {},
    dragItem: null,
    partIdx: 0,
    isReview: false,
    reviewResult: null,
    tool: 'none',
    dictWord: '', dictMeaning: '', dictExample: '',
    submitted: false,
    startTime: null,
    // 'practice' (default) | 'simulation' — see reading-v2.js's
    // identical field for the full rationale.
    mode: 'practice',
    // "Chọn phần làm": section numbers picked for this attempt ([1, 3]),
    // or null = the whole test on its one recording. A partial attempt's
    // sections each carry their own audioUrl (the part's đề lẻ audio).
    parts: null,
    audioPartIdx: null,   // partial attempt: index of the section whose audio is loaded
};

// Partial attempt: where each section's audio was left (Practice — the
// student hops between parts and comes back to the same spot).
let _partAudioPos = {};

function _hasPartAudio(isReview) {
    const s = getSortedSections(isReview)[0];
    return !!(s && s.audioUrl);
}

// "Cam 19 - Test 1 · Section 1, 3" for a partial attempt.
function _titleWithParts(name, parts) {
    return parts && parts.length ? `${name} · Section ${parts.join(', ')}` : name;
}

// Partial attempt: put section idx's own audio in the player (no-op when
// it's already there). Practice resumes where that part was left.
function _loadPartAudio(idx, isReview) {
    const s = getSortedSections(isReview)[idx];
    if (!s || !s.audioUrl) return;
    if (state.audioPartIdx === idx && audio.getAttribute('src') === s.audioUrl) return;
    if (state.audioPartIdx != null) _partAudioPos[state.audioPartIdx] = audio.currentTime || 0;
    audio.pause();
    state.audioPartIdx = idx;
    audio.src = s.audioUrl;
    audio.load();
    const pos = _partAudioPos[idx];
    if (pos > 0) {
        audio.addEventListener('loadedmetadata', function seekOnce() {
            audio.currentTime = pos;
            audio.removeEventListener('loadedmetadata', seekOnce);
        });
    }
    if (!isReview) _syncPartPlayBtn();
}

// Practice on a partial attempt: no one-shot auto-play — the student
// plays each section's audio themself with this button (play/pause).
function _isPartPractice() {
    return state.mode === 'practice' && !_mockMode && !state.isReview && _hasPartAudio(false);
}
function _syncPartPlayBtn() {
    if (!_isPartPractice()) return;
    const btn = document.getElementById('aso-play-now-btn');
    const s = getSortedSections(false)[state.audioPartIdx];
    if (!btn || !s) return;
    btn.classList.remove('hidden');
    btn.innerHTML = audio.paused
        ? `<i class="fas fa-play"></i> Phát Section ${s.partNumber}`
        : `<i class="fas fa-pause"></i> Dừng`;
    if (audio.paused) {
        const el = document.getElementById('exam-audio-status');
        if (el) { el.innerHTML = `<i class="fas fa-headphones"></i> Audio Section ${s.partNumber}`; el.style.color = ''; }
    }
}
function examPlayBtn() {
    if (_isPartPractice()) { togglePlay(); return; }
    startAudioPlay();
}
window.examPlayBtn = examPlayBtn;

// Set when this page was opened as step 1 of a full mock test
// (?mock=<id>&skill=listening) — see the DOMContentLoaded handler and
// shared/mock-test.js. Changes /start's review-gate opt-out and makes
// the result screen hand off to the next skill instead of stopping.
let _mockMode = false;

/* Highlight cache – preserve <span class="hl"> spans across part switches */
const partHlCache = {};  // exam mode  : { partIdx: questionsPanelHTML }
const partHlCacheRv = {};  // review mode: { partIdx: { transcript, questions } }

/* ── Highlights surviving submission (localStorage, keyed by attemptId) ──
   goToReview() re-renders review-questions-inner fresh (adds correct/
   wrong indicators live exam markup doesn't have), which used to wipe
   any highlight made in questions-panel during the live exam. Passage
   markup (transcript) is identical live/review so raw HTML can be
   reused directly; questions markup can't, so only the highlighted
   TEXT is persisted and re-applied afterward via HighlightStore.applyTexts().
   Since 2026-10-07 the transcript half is kept as text offsets (not
   HTML) and everything is also saved on the server — see
   js/shared/highlight-store.js for why localStorage alone kept
   losing them. */
// partIdx -> { p: transcript offset ranges, q: question texts } restored
// from storage/server for a part not rendered yet this session.
// Applied (and dropped) by the fresh-render paths, and merged into
// every save until then so a part the student never reopens keeps its
// highlights (a resumed exam used to overwrite them all with only
// what was highlighted after the reload).
let _pendingHl = {};

function _lHlStorageKey(attemptId) { return `ews_listening_hl_${attemptId}`; }

// Applies a pending { p, q } entry to freshly rendered panels.
function _applyPendingHl(idx, transcriptEl, questionsEl) {
    window.HighlightStore.applyPending(_pendingHl, idx, transcriptEl, questionsEl, true);
}

function _saveListeningHighlightsToStorage() {
    const attemptId = state.isReview ? state.reviewResult?.attemptId : state.attemptId;
    if (!attemptId) return;
    if (state.isReview) {
        const tb = document.getElementById('transcript-body');
        const rv = document.getElementById('review-questions-inner');
        if (tb && rv) partHlCacheRv[state.partIdx] = { transcript: tb.innerHTML, questions: rv.innerHTML };
    } else {
        const qp = document.getElementById('questions-panel');
        if (qp) partHlCache[state.partIdx] = qp.innerHTML;
    }
    const HS = window.HighlightStore;
    const parts = Object.assign({}, _pendingHl);
    if (state.isReview) {
        for (const idx in partHlCacheRv) {
            const entry = partHlCacheRv[idx];
            parts[idx] = { p: HS.serializeHtml(entry.transcript), q: window.HighlightStore.extractTexts(entry.questions) };
        }
    } else {
        for (const idx in partHlCache) {
            parts[idx] = { p: _pendingHl[idx]?.p || [], q: window.HighlightStore.extractTexts(partHlCache[idx]) };
        }
    }
    const data = HS.build(parts);
    HS.writeLocal(_lHlStorageKey(attemptId), data);
    HS.saveRemote('listening', attemptId, data);
}

const audio = document.getElementById('audio-player');

// ══════════════════════════════════════════════
// LOCAL-STORAGE: AUTO-SAVE & RESUME
// ══════════════════════════════════════════════
const _LS_KEY = 'ews_listening_progress';
const _LS_MAX_MS = 2 * 60 * 60 * 1000; // expire after 2 hours
let _saveInterval = null;

function saveExamToStorage() {
    if (!state.currentTestId || state.submitted) return;
    try {
        // Tag the backup with the mock run it belongs to (if any) so
        // checkResumeExam() can tell a stale backup — left behind by a
        // run that later got disqualified/abandoned — from a
        // genuinely resumable one.
        const mockId = (window.MockTest && window.MockTest.active()) ? window.MockTest.params().mockId : null;
        localStorage.setItem(_LS_KEY, JSON.stringify({
            currentTestId: state.currentTestId,
            currentTest: state.currentTest,
            attemptId: state.attemptId,
            answers: state.answers,
            partIdx: state.partIdx,
            audioTime: audio.currentTime,
            startTime: state.startTime,
            mockId: mockId,
            // Test Simulation mode — see reading-v2.js's identical
            // fix (saveExamToStorage/resumeExam) for the full
            // rationale: without this, a page refresh
            // mid-Simulation would silently fall back to 'practice'
            // on resume.
            mode: state.mode,
            parts: state.parts,
            audioPartIdx: state.audioPartIdx,
            savedAt: Date.now()
        }));
        const lbl = document.getElementById('exam-autosave');
        if (lbl) { lbl.classList.add('saved'); clearTimeout(lbl._t); lbl._t = setTimeout(() => lbl.classList.remove('saved'), 1500); }
    } catch { /* storage quota – ignore */ }
}

function clearExamStorage() {
    localStorage.removeItem(_LS_KEY);
    clearInterval(_saveInterval);
    _saveInterval = null;
}

async function checkResumeExam() {
    try {
        const raw = localStorage.getItem(_LS_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data.currentTestId || !data.currentTest) { clearExamStorage(); return; }
        if (Date.now() - data.savedAt > _LS_MAX_MS) { clearExamStorage(); return; }

        // Backup was made mid mock-test — only worth offering if that
        // mock run is still actually alive server-side. See the
        // identical check + comment in js/reading-v2.js's
        // checkResumeExam() (same bug class, fixed together
        // 2026-09-11): MockTest.fetchCurrent() only ever returns a
        // doc while status is 'in-progress'/'awaiting-grading', so a
        // null/mismatched _id here means the run was disqualified
        // (10 "gậy"), abandoned, or already finished elsewhere.
        if (data.mockId) {
            try {
                const current = await window.MockTest.fetchCurrent();
                if (!current || String(current._id) !== String(data.mockId)) { clearExamStorage(); return; }
            } catch (_) { /* offline / API hiccup — offer the stale backup rather than losing it outright */ }
        }

        const banner = document.getElementById('resume-banner');
        if (!banner) return;
        const allQs = (data.currentTest.sections || [])
            .flatMap(s => (s.questionGroups || []).flatMap(g => g.questions || []));
        const answered = Object.keys(data.answers || {}).length;
        const total = data.currentTest.totalQuestions || allQs.length || '?';
        document.getElementById('resume-test-name').textContent = data.currentTest.name || 'bài thi';
        document.getElementById('resume-answered-count').textContent = `${answered}/${total} câu đã trả lời`;
        banner._resumeData = data;
        banner.style.display = 'flex';
    } catch { clearExamStorage(); }
}

function resumeExam() {
    // Same gate as goToStartTest() — without it, a plan downgrade/
    // expiry after an exam was started but before it was finished
    // let the student resume and complete the whole premium exam
    // free via this banner (localStorage still had the in-progress
    // exam saved, resumeExam() never re-checked the plan).
    if (!window.AuthService.hasPremiumAccess()) { openUpgradeModal(); return; }
    const banner = document.getElementById('resume-banner');
    const data = banner?._resumeData;
    if (!data) return;
    banner.style.display = 'none';

    const t = data.currentTest;
    state.currentTestId = data.currentTestId;
    state.currentTest = t;
    {
        const _url = `?testId=${data.currentTestId}&exam=${data.mode || 'practice'}${window.RouteParams ? window.RouteParams.partsSuffix(data.parts) : ''}`;
        const _st = { screen: 'exam', testId: data.currentTestId, testName: t.name };
        if (new URLSearchParams(location.search).get('testId') !== String(data.currentTestId)) history.pushState(_st, '', _url);
        else history.replaceState(_st, '', _url);
    }
    state.attemptId = data.attemptId || t.attemptId || null;
    state.answers = data.answers || {};
    state.partIdx = data.partIdx || 0;
    state.submitted = false;
    state.isReview = false;
    state.startTime = data.startTime || new Date().toISOString();
    // Restore the mode the attempt actually started as — pre-
    // existing saved payloads (from before this field existed)
    // have no `mode` key, so this correctly falls back to
    // 'practice', matching their real mode.
    state.mode = data.mode || 'practice';
    state.parts = data.parts || null;
    state.audioPartIdx = null;
    _partAudioPos = {};
    for (const k in partHlCache) delete partHlCache[k];
    for (const k in partHlCacheRv) delete partHlCacheRv[k];
    // Bring back what was highlighted before the reload — each part
    // gets it when first rendered and every save keeps the rest.
    _pendingHl = { ...(window.HighlightStore.readLocal(_lHlStorageKey(state.attemptId))?.parts || {}) };
    clearInterval(_asoTimer);
    audio.playbackRate = 1;
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.toggle('active', b.textContent.trim() === '×1'));

    document.getElementById('exam-title').textContent = _titleWithParts(t.name, state.parts);
    if (_hasPartAudio(false)) {
        // Partial attempt: back to the section whose audio was playing.
        const _aIdx = data.audioPartIdx || 0;
        _partAudioPos[_aIdx] = data.audioTime || 0;
        audio.src = '';
        _loadPartAudio(_aIdx, false);
    } else {
        audio.src = t.audioUrl || '';
        audio.load();

        // Restore audio position after metadata is ready
        if (data.audioTime > 0) {
            audio.addEventListener('loadedmetadata', function seekOnce() {
                audio.currentTime = data.audioTime;
                audio.removeEventListener('loadedmetadata', seekOnce);
            });
        }
    }

    buildPartTabs('part-tabs', false);
    renderPartQuestions(data.partIdx || 0);
    renderQNav('q-nav-grid', false);
    updateFooter();
    setToolExam('none');
    _updateExamToolbarForMode();
    showScreen('exam');

    // Resume mode: skip overlay, auto-play after 5s countdown
    document.getElementById('audio-start-overlay').classList.add('hidden');
    if (_isPartPractice()) {
        // Partial Practice: the student plays each section themself.
        _syncPartPlayBtn();
        clearInterval(_saveInterval);
        _saveInterval = setInterval(saveExamToStorage, 10000);
        window.onbeforeunload = e => { if (!state.submitted) { e.preventDefault(); e.returnValue = ''; } };
        return;
    }
    let _rCount = 5;
    updateExamAudioStatus(false, _rCount);
    clearInterval(_asoTimer);
    _asoTimer = setInterval(() => {
        _rCount--;
        if (_rCount <= 0) {
            clearInterval(_asoTimer);
            startAudioPlay();
        } else {
            updateExamAudioStatus(false, _rCount);
        }
    }, 1000);

    // Start periodic auto-save
    clearInterval(_saveInterval);
    _saveInterval = setInterval(saveExamToStorage, 10000);
    window.onbeforeunload = e => { if (!state.submitted) { e.preventDefault(); e.returnValue = ''; } };

    if (state.mode === 'simulation' && !_mockMode && window.ExamProctor && !window.ExamProctor.isActive()) {
        window.ExamProctor.start({
            skill: 'listening', attemptType: 'full', attemptId: state.attemptId,
            onDisqualified: _onSimulationDisqualified,
            saveAnswers: _saveDisqualifiedListening,
        });
    }
}

function dismissResume() {
    const banner = document.getElementById('resume-banner');
    if (banner) banner.style.display = 'none';
    clearExamStorage();
}

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
    // Delegates to the same AuthService.requirePageAuth() used by
    // auth.js's Guard 1 (Phase 5) — this used to be its own
    // redundant `if(!token)` check with no next= support.
    if (!window.AuthService.requirePageAuth(false)) return;
    const user = window.AuthService.getUser() || {};
    const name = user.firstName ? `${user.firstName} ${user.lastName}` : user.username || '';
    const el = document.getElementById('userName');
    if (el && name) el.textContent = `👋 ${name}`;
    setupHighlight();
    setupDictionaryDouble('questions-panel', 'listening', _ltDictGate);   // dict trong exam
    setupAudioEvents();

    // Entrance Test's Listening section (this page inside its iframe).
    const entranceHost = _ltEntranceEmbedHost();
    if (entranceHost) { _enterEntranceEmbedLT(entranceHost); return; }

    // Full mock test, step 1/4 (?mock=<id>&skill=listening): skip the
    // list screen entirely and jump straight into the assigned test.
    if (window.MockTest && window.MockTest.active() && window.MockTest.params().skill === 'listening') {
        try {
            const mt = await window.MockTest.fetchCurrent();
            const tid = mt && mt.bundle && mt.bundle.listeningTestId;
            if (!tid) { toast('Không tìm thấy đề Listening của bài thi thử', 'error'); location.href = 'dashboard.html'; return; }
            window.MockTest.showBanner('listening');
            _mockMode = true;
            // Run voided mid-Listening → save the answers so far for the teacher.
            if (window.MockTest.setDisqualifySaver) window.MockTest.setDisqualifySaver(_saveDisqualifiedListening);
            // Mandatory screen share first — no exam clock runs behind its prompt.
            if (window.MockTest.ready) await window.MockTest.ready();
            await startTest(tid);
        } catch (e) {
            toast('Lỗi mở bài thi thử', 'error');
            location.href = 'dashboard.html';
        }
        return;
    }

    // Deep-link into a past Listening review (?review=<attemptId>).
    // Used by review-history.html's mock-test history rows so students
    // can open the Listening portion of a full mock — mirrors
    // reading.html?review=<id>. reviewFromHistory() is self-contained
    // (fetches /listening/history/:id → goToReview()), so the test
    // list isn't needed here.
    const _ltReviewParam = new URLSearchParams(location.search).get('review');
    if (_ltReviewParam) {
        history.replaceState({ screen: 'review', reviewId: _ltReviewParam }, '', `?review=${_ltReviewParam}`);
        await reviewFromHistory(_ltReviewParam);
        return;
    }

    await loadTestList();
    checkResumeExam();

    // Handle browser Back/Forward button
    window.addEventListener('popstate', async (e) => {
        // Full-test exam / review deep-link states. Forward-navigating
        // (or reloading) onto one re-opens that test/review; pressing
        // Back while the exam/review screen is showing falls through to
        // the list instead (the exam auto-saves + checkResumeExam()
        // offers to resume). Mirrors reading-v2.js.
        const _inTestFlow = ['screen-exam', 'screen-result', 'screen-review']
            .some(id => document.getElementById(id)?.classList.contains('active'));
        if (!_inTestFlow && e.state?.screen === 'exam' && e.state.testId) {
            goToStartTest(e.state.testId);
            return;
        }
        if (!_inTestFlow && e.state?.screen === 'review' && e.state.reviewId) {
            reviewFromHistory(e.state.reviewId);
            return;
        }
        // Support both new {mode} and old {tab} history state keys for backward compat
        const mode = e.state?.mode ?? e.state?.tab;
        const part = e.state?.part ?? 'all';
        const isSingle = mode === 'single' || mode === 'lele';
        // Delegate to block-3 handler (which can access block-3 let vars)
        if (typeof window.handleLtPracticePopstate === 'function' &&
            window.handleLtPracticePopstate(mode, part)) {
            showScreen('list');
            document.querySelectorAll('#lele-picker-lt .plele-tab').forEach(t =>
                t.classList.toggle('plele-active', String(t.dataset.part) === String(part))
            );
            setListeningMode(mode === 'full' ? 'full' : mode === 'tips' ? 'tips' : 'lele', false);
            return;
        }
        showScreen('list');
        if (isSingle || e.state?.screen === 'practice') {
            document.querySelectorAll('#lele-picker-lt .plele-tab').forEach(t =>
                t.classList.toggle('plele-active', String(t.dataset.part) === String(part))
            );
            setListeningMode('lele', false);
        } else if (mode === 'tips') {
            setListeningMode('tips', false);
        } else {
            setListeningMode('full', false);
        }
    });

    // Check URL params — ?sectionId=xxx&part=1 deep-links into a section;
    // ?mode=single[&part=N] opens bài lẻ list; ?mode=full (or no param) opens full test list.
    // Legacy ?tab=lele is also accepted for backward compat with old shared links.
    const params = new URLSearchParams(location.search);
    const sectionIdParam = params.get('sectionId');
    const modeParam      = params.get('mode') ?? params.get('tab');
    const partRaw        = params.get('part');
    // No ?part= on the Bài lẻ list = the 'all' tab (every section mixed).
    const partParam      = _ltParsePart(partRaw);
    // ?exam=practice|simulation — mode-specific start link (see
    // RouteParams.examMode / reading-v2.js). Always via the
    // ExamModeSelect popup here: the click is also the user gesture
    // listening audio needs.
    const examParam      = window.RouteParams ? window.RouteParams.examMode() : null;
    // Clean path-based deep link (/listening/test/:id — see Phase 4
    // routing notes). Routing audit finding: this block used to run
    // unconditionally and always appended ?mode=full to whatever
    // pathname was showing, dirtying the clean URL on every single
    // visit (unlike reading-v2.js, which at least guarded its
    // premium branch). Skip the query-string branches entirely here;
    // renderTestList()'s own RouteParams match (below) auto-starts
    // the right test once tests are loaded, exactly as before.
    const _cleanLtTid = window.RouteParams ? window.RouteParams.match([
        { pattern: /^\/listening\/test\/([^/?#]+)$/, param: 'testId' }
    ]) : null;
    // ?gapfillId=<sectionId> — homework deep link straight into a
    // section's Gap-fill screen (dashboard-homework.js listening_gapfill).
    const gapfillParam = params.get('gapfillId');
    if (_cleanLtTid) {
        showScreen('list');
    } else if (gapfillParam) {
        history.replaceState({ screen: 'list', mode: 'single', part: 'all' }, '', '?mode=single');
        setListeningMode('lele', false);
        showScreen('list');
        await startGapFillSection(gapfillParam);
    } else if (sectionIdParam) {
        const partForSection = partRaw === 'actual' ? 'actual' : (parseInt(partRaw) || 1);
        history.replaceState({ screen: 'list', mode: 'single', part: partForSection }, '', `?mode=single&part=${partForSection}`);
        document.querySelectorAll('#lele-picker-lt .plele-tab').forEach(t =>
            t.classList.toggle('plele-active', String(t.dataset.part) === String(partForSection))
        );
        setListeningMode('lele', false);
        // No ?part= (homework links, /listening/practice/:id) is fine —
        // startPracticeSection() corrects it from the fetched section.
        await startPracticeSection(sectionIdParam, partForSection, false, null, examParam);
    } else if (modeParam === 'single' || modeParam === 'lele') {
        history.replaceState({ screen: 'list', mode: 'single', part: partParam }, '', _ltListUrl(partParam));
        document.querySelectorAll('#lele-picker-lt .plele-tab').forEach(t =>
            t.classList.toggle('plele-active', String(t.dataset.part) === String(partParam))
        );
        setListeningMode('lele', false);
        showScreen('list');
    } else if (modeParam === 'tips') {
        // Keep ?tip=/&tcat= — initListeningTips() opens that lesson.
        const tipQs = ['tip', 'tcat'].filter(k => params.get(k)).map(k => `&${k}=${encodeURIComponent(params.get(k))}`).join('');
        history.replaceState({ screen: 'list', mode: 'tips' }, '', `?mode=tips${tipQs}`);
        setListeningMode('tips', false);
        showScreen('list');
    } else {
        history.replaceState({ screen: 'list', mode: 'full' }, '', '?mode=full');
        showScreen('list');
    }
});

// ══════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════
// Delegates to AuthService (Phase 5) — kept as local wrappers so
// existing call sites below don't need to change.
function getToken() { return window.AuthService.getToken(); }
function authH() { return { ...window.AuthService.authHeader(), 'Content-Type': 'application/json' }; }
// logout() moved to js/auth.js (single source of truth — Phase 3 audit
// found this local copy never cleared 'lastLoginAt', unlike auth.js's).

// ══════════════════════════════════════════════
// SCREENS
// ══════════════════════════════════════════════
function showScreen(name) {
    // Returning to the list from an exam/review — drop the ?testId= /
    // ?review= param so the URL reflects the list again. Guarded on the
    // param still being present, so this is a no-op when the popstate
    // handler (which restores the correct ?mode= URL itself) calls us.
    if (name === 'list' && /[?&](testId|review)=/.test(location.search)) {
        history.replaceState({ screen: 'list', mode: 'full' }, '', '?mode=full');
    }
    document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active'); });
    const el = document.getElementById(`screen-${name}`);
    if (el) el.classList.add('active');
    // Show/hide fixed section nav bar only on exam and review screens
    const navBar = document.getElementById('section-nav-fixed');
    if (navBar) {
        navBar.classList.toggle('hidden', name !== 'exam' && name !== 'review');
    }
    // Exam screen uses the computer-delivered-test footer instead of
    // #section-nav-fixed (css/cd-exam.css keys off this class).
    document.body.classList.toggle('cd-exam-on', name === 'exam');
    if (typeof window.hideTopNav === 'function') {
        name === 'list' ? window.showTopNav() : window.hideTopNav();
    }
}
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
// toast() moved to js/shared/toast.js (single source of truth — Phase 3 audit).

// ══════════════════════════════════════════════
// SCREEN: LIST
// ══════════════════════════════════════════════
let _userPlan = 'free';
// Premium upgrade modal state now lives in the shared js/upgrade-modal.js
let _lsPage = 1;
const LS_PAGE_SIZE = 8; // 4-column grid → exactly 2 full rows per page (matches Reading)
let _testListCache = null; // { tests, userPlan } — avoids refetching /listening/tests on every list-screen return
let _testListCacheAt = 0;
const TEST_LIST_CACHE_TTL_MS = 60000;

async function loadTestList() {
    // Reuse the last fetch if still fresh — list-screen re-entry doesn't need
    // a fresh round-trip. Submit handler invalidates this cache so a just-
    // completed test's "done" status is never shown stale.
    if (_testListCache && (Date.now() - _testListCacheAt) < TEST_LIST_CACHE_TTL_MS) {
        state.tests = _testListCache.tests;
        _userPlan = _testListCache.userPlan;
        const promoBanner = document.getElementById('premium-promo-banner');
        if (promoBanner) promoBanner.style.display = _userPlan !== 'premium' ? 'flex' : 'none';
        _lsPage = 1;
        rerenderLsFilteredTests();
        _checkPendingReviewBanner();
        return;
    }
    try {
        const res = await fetch(`${API}/listening/tests`, { headers: authH() });
        const data = await safeJson(res);
        if (!data.success) throw new Error(data.message);
        state.tests = data.tests;
        _userPlan = data.userPlan || 'free';
        _testListCache = { tests: state.tests, userPlan: _userPlan };
        _testListCacheAt = Date.now();
        // Push fresh plan to localStorage so other pages stay in sync
        try {
            var _lu = window.AuthService.getUser() || {};
            _lu.plan = _userPlan;
            if (data.planExpiresAt !== undefined) _lu.planExpiresAt = data.planExpiresAt;
            window.AuthService.setUser(_lu);
        } catch(e) {}
        const promoBanner = document.getElementById('premium-promo-banner');
        if (promoBanner) promoBanner.style.display = _userPlan !== 'premium' ? 'flex' : 'none';
        _lsPage = 1;
        rerenderLsFilteredTests();
        _checkPendingReviewBanner();
    } catch (err) {
        // Fallback to cached plan so premium users aren't locked out on transient network failures
        try { _userPlan = (window.AuthService.getUser() || {}).plan || 'free'; } catch(e) {}
        document.getElementById('tests-wrapper').innerHTML =
            `<p class="ls-error-msg">Error loading tests: ${err.message}</p>`;
    }
}

// Mandatory Review System — proactive gate-check banner (mirrors
// reading-v2.js's _checkPendingReviewBanner()) + the jump-in helper
// both the proactive banner and reactive REVIEW_REQUIRED catches use.
let _pendingListeningReview = null;
let _checkingPendingReviewBanner = false;
async function _checkPendingReviewBanner() {
    // Re-entrancy guard — rapid repeated navigation to the list
    // screen (loadTestList's cache-hit path calls this every time)
    // can start a second call before the first's awaited fetch
    // resolves; both would otherwise see #review-required-banner as
    // not-yet-created and each insert their own copy.
    if (_checkingPendingReviewBanner) return;
    _checkingPendingReviewBanner = true;
    let count = 0, blocked = false, items = [];
    try {
        const res = await fetch(`${API}/review/pending?skill=listening`, { headers: authH() });
        const data = await safeJson(res);
        _pendingListeningReview = data.pending || null;
        count = data.count || 0;
        blocked = !!data.blocked;
        items = data.items || [];
    } catch (e) { _pendingListeningReview = null; }

    // Every pending review is listed (name, date, reviewed x/y) —
    // see reading-v2.js's _checkPendingReviewBanner().
    const goTo = (it) => _goToPendingReview(it || _pendingListeningReview);
    if (blocked && window.showReviewRequiredPopup) {
        window.showReviewRequiredPopup(_pendingListeningReview, count, goTo, items);
    }

    const wrap = document.getElementById('tests-wrapper');
    if (!wrap) { _checkingPendingReviewBanner = false; return; }
    let banner = document.getElementById('review-required-banner');
    if (count > 0) {
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'review-required-banner';
            wrap.parentNode.insertBefore(banner, wrap);
        }
        banner.style.cssText = blocked
            ? 'background:#fef3c7;border:1px solid #f59e0b;border-radius:12px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:13.5px;color:#92400e'
            : 'background:#f8f9fb;border:1px solid #e5e7eb;border-radius:12px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:13.5px;color:#374151';
        banner.innerHTML = (blocked
                ? `<span>🔒 Bạn có ${count} bài đang chờ Review — hoàn thành ít nhất 1 bài để mở khóa bài Listening mới.</span>`
                : `<span>🟡 Bạn có ${count} bài đang chờ Review — review khi rảnh để tránh lặp lại lỗi cũ.</span>`) +
            '<span style="display:flex;gap:8px;align-items:center">' +
              '<button class="btn-primary" style="padding:8px 16px" onclick="_goToPendingReview(_pendingListeningReview)">Review bài cũ nhất</button>' +
              (blocked ? '<button style="padding:8px 12px;background:none;border:1px solid currentColor;border-radius:8px;color:inherit;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit" onclick="window.showReviewBypassPrompt&&window.showReviewBypassPrompt()">Nhập mã bỏ qua</button>' : '') +
            '</span>' +
            (window.ReviewPendingList ? window.ReviewPendingList.html(items) : '');
        if (window.ReviewPendingList) window.ReviewPendingList.wire(banner, items, goTo);
    } else if (banner) {
        banner.remove();
    }
    _checkingPendingReviewBanner = false;
}

function _goToPendingReview(info) {
    if (!info || !info.attemptId) return;
    if (info.attemptType === 'listening') reviewFromHistory(info.attemptId);
    else if (info.attemptType === 'listening-practice') loadLTPracticeReview(info.attemptId);
}

// Mandatory Review System — after showing the normal review screen,
// fetch this attempt's guided-review doc (if any) and mount an
// inline "Review lỗi này" form (shared/review-inline.js) next to
// each wrong/skipped question's own already-visible answer. Runs
// regardless of review status (not just 'pending') so a returning
// student still sees their "✓ Đã review" badges. `questions` is a
// flat array with {questionNumber, questionText, options,
// audioTimestamp} per question — already fetched by the caller.
async function _mountInlineReviews(attemptType, attemptId, questions, containerId = 'review-questions-inner') {
    if (!window.ReviewInline) return;
    try {
        const res = await fetch(`${API}/review/by-attempt/${attemptType}/${attemptId}`, { headers: authH() });
        const data = await safeJson(res);
        const review = data.review;
        if (!review) { state.inlineReviewCtx = null; window.ReviewInline.setContext(null); return; }
        const qByNum = {};
        (questions || []).forEach(q => { qByNum[q.questionNumber] = q; });
        const mistakesByQNum = {};
        review.mistakes.forEach(m => { mistakesByQNum[m.questionNumber] = m; });
        // Stored on state so part-tab switches can re-run the mount
        // pass against the already-fetched data (see switchPart's
        // cache-restore branch) without another round-trip.
        state.inlineReviewCtx = { reviewId: review._id, mistakesByQNum, qByNum, containerId };
        // Every part's mistakes, not just the visible tab's — drives
        // the "Lưu review" bar's x/y count and draft auto-save.
        // onSaved fires when a mistake flips reviewed, from any save
        // path (auto-save, per-question "Lưu câu này", or the bar).
        window.ReviewInline.setContext({
            reviewId: review._id, skill: 'listening', mistakes: review.mistakes,
            onSaved: (updated) => {
                const c = state.inlineReviewCtx;
                if (!c || String(c.reviewId) !== String(review._id)) return;
                c.mistakesByQNum[updated.questionNumber] = updated;
                _checkPendingReviewBanner();
                _updatePartTabBadges();
            },
        });
        _runInlineReviewMountPass();
        _updatePartTabBadges();
    } catch (e) { /* server-side gate stands regardless */ }
}

// A 4-part full test's review screen only ever mounts ONE part's
// mistakes at a time (tab-switched — see switchPart), with nothing
// on the part tabs themselves indicating the OTHER parts still have
// unreviewed mistakes. A student who fully reviews just the
// (default-active) Section 1 has no way to know Sections 2-4 need
// attention too — confirmed as the actual cause of "I reviewed
// everything but the gate still blocks me" reports (same root cause
// as reading-v2.js's identical _updatePassageTabBadges): the
// mandatory-review gate itself works correctly, the student just
// never discovered the other parts' mistakes. Badges each part tab
// with its own still-pending count. Unlike reading's tabs, these
// buttons are never rebuilt on switchPart (just .active toggled), so
// a badge added here survives tab switching on its own.
function _updatePartTabBadges() {
    const ctx = state.inlineReviewCtx;
    const btnContainer = document.getElementById('snf-section-btns');
    if (!ctx || !btnContainer) return;
    const sections = getSortedSections(true);
    if (sections.length < 2) return;
    const buttons = btnContainer.querySelectorAll('.snf-section-btn');
    sections.forEach((section, i) => {
        const btn = buttons[i];
        if (!btn) return;
        const remaining = _ltGetAllQs(section).filter(q => {
            const m = ctx.mistakesByQNum[q.questionNumber];
            return m && !m.completedAt;
        }).length;
        let dot = btn.querySelector('.snf-section-pending-dot');
        if (remaining > 0) {
            if (!dot) {
                dot = document.createElement('span');
                dot.className = 'snf-section-pending-dot';
                btn.appendChild(dot);
            }
            dot.textContent = String(remaining);
        } else if (dot) {
            dot.remove();
        }
    });
}

// The actual DOM pass — separated from the fetch above so a part-tab
// switch's cache-restore can re-run it cheaply. Covers every
// question-group rendering variant the review screen uses; see each
// renderer's own data-qnum wiring (renderStandaloneQuestion, the
// multi-answer-cluster q-mistake-block wrapper,
// resolvePlaceholders' inline-answer-wrap span, and
// renderMatchingOptionsGroup's mo-q-row).
function _runInlineReviewMountPass() {
    const ctx = state.inlineReviewCtx;
    if (!ctx || !window.ReviewInline) return;
    const root = document.getElementById(ctx.containerId);
    if (!root) return;

    function mountFor(qnum, anchorEl, mode) {
        const mistake = ctx.mistakesByQNum[qnum];
        if (!mistake) return;
        const q = ctx.qByNum[qnum];
        // Saves report back through setContext()'s onSaved (see
        // _mountInlineReviews), which keeps ctx.mistakesByQNum
        // current for _updatePartTabBadges().
        window.ReviewInline.mount(anchorEl, mistake, {
            skill: 'listening', mode, reviewId: ctx.reviewId, questionType: q && q.type,
        });
    }

    // Plain questions + multi-answer-cluster sub-question rows —
    // both use the same container convention (a block-level element
    // carrying its own data-qnum).
    root.querySelectorAll('.question-item[data-qnum], .q-mistake-block[data-qnum]').forEach(el => {
        mountFor(+el.dataset.qnum, el, 'beforeend');
    });
    // Table/note-form/bullet-list/summary-completion templated
    // blanks — inline span mid-sentence/mid-cell; mount at the end
    // of its block-level container instead of splicing into the
    // middle of the text. Two different class names in this file
    // for the same pattern: resolvePlaceholders() (table/note-form/
    // bullet-list) uses .inline-answer-wrap, renderSummaryCompletionGroup
    // uses .rq-inline-wrap — both handled the same way.
    root.querySelectorAll('.inline-answer-wrap[data-qnum], .rq-inline-wrap[data-qnum]').forEach(span => {
        const container = span.closest('td, .note-line, .bullet-item, .rq-summary-text, .dd-text-col') || span.parentElement;
        mountFor(+span.dataset.qnum, container, 'beforeend');
    });
    // Map drag-drop rows — sibling insert; parent .map-dd-questions
    // is a column-flex container so a new row-level sibling stacks
    // for free.
    root.querySelectorAll('.map-dd-row[data-qnum]').forEach(row => {
        mountFor(+row.dataset.qnum, row, 'afterend');
    });
    // Matching-options rows — mount as an OUTER sibling (the row
    // itself is a flex row, not a column, so an inner append would
    // wrap awkwardly — same reason the existing .match-feedback
    // element for this row hard-codes width:100%).
    root.querySelectorAll('.mo-q-row[data-qnum]').forEach(row => {
        mountFor(+row.dataset.qnum, row, 'afterend');
    });
}

// Group filtered tests into pages of at most LS_PAGE_SIZE cards each.
// A named series (e.g. "Actual Tests") stays together across
// consecutive cards where possible, but a series bigger than
// LS_PAGE_SIZE on its own (e.g. 15 tests) is split into ≤LS_PAGE_SIZE
// chunks up front — otherwise a single oversized series would blow
// straight through the cap and show more than 8 cards on one page,
// the exact "not actually capped" bug this was written to avoid.
function getGroupedPages(tests) {
    const groupMap = {};
    const groupOrder = [];
    tests.forEach(t => {
        const g = t.seriesName || 'Tests';
        if (!groupMap[g]) { groupMap[g] = []; groupOrder.push(g); }
        groupMap[g].push(t);
    });
    const groups = [];
    groupOrder.forEach(g => {
        const list = groupMap[g];
        for (let i = 0; i < list.length; i += LS_PAGE_SIZE) {
            groups.push({ name: g, tests: list.slice(i, i + LS_PAGE_SIZE) });
        }
    });
    const pages = [];
    let curPage = [], curCount = 0;
    groups.forEach(group => {
        if (curPage.length > 0 && curCount + group.tests.length > LS_PAGE_SIZE) {
            pages.push(curPage);
            curPage = [group];
            curCount = group.tests.length;
        } else {
            curPage.push(group);
            curCount += group.tests.length;
        }
    });
    if (curPage.length) pages.push(curPage);
    return pages;
}

function renderTestList(groups) {
    const wrap = document.getElementById('tests-wrapper');
    if (!groups.length) { wrap.innerHTML = '<p class="ls-empty-msg">No listening tests available.</p>'; return; }
    wrap.innerHTML = groups.map(({ name, tests }) => `
                <div class="test-group">
                    <div class="test-group-title">${name}</div>
                    <div class="test-grid">${tests.map(renderTestCard).join('')}</div>
                </div>`).join('');
    // Auto-navigate if ?testId= present (shareable link to a specific
    // test), or if the clean path /listening/test/:id was used
    // (served via a _redirects rewrite — see Phase 4 routing notes;
    // js/shared/route-params.js reads it from location.pathname
    // since a rewrite doesn't populate location.search).
    const _cleanTid = window.RouteParams ? window.RouteParams.match([
        { pattern: /^\/listening\/test\/([^/?#]+)$/, param: 'testId' }
    ]) : null;
    const _tid = (_cleanTid && _cleanTid.testId) || new URLSearchParams(location.search).get('testId');
    if (_tid) {
        // Search the full unpaginated/unfiltered list, not just the
        // groups on the currently-rendered page — renderTestList()
        // is only ever called with one page's worth of groups
        // (rerenderLsFilteredTests), so a deep link to a test outside
        // the first LS_PAGE_SIZE tests (or filtered out by an active
        // search/category) previously never matched and silently did
        // nothing.
        const _t = (state.tests || []).find(t => String(t._id) === _tid);
        if (_t) setTimeout(() => {
            // Reloading a running exam's URL: its "Tiếp tục" banner is
            // the way back in — starting a new attempt here would
            // clear the saved answers (startTest → clearExamStorage).
            const _saved = document.getElementById('resume-banner')?._resumeData;
            if (_saved && String(_saved.currentTestId) === String(_tid)) {
                document.getElementById('resume-banner').scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            goToStartTest(_tid, window.RouteParams ? window.RouteParams.examMode() : null,
                window.RouteParams ? window.RouteParams.examParts(4) : null);
        }, 80);
    }
}

// 🟠 pending / 🔵 completed badge for a test's lastAttempt — mirrors
// reading-v2.js's identical helper. 'none' (perfect score) renders
// nothing, the existing done-tick already covers that case.
function reviewStatusBadge(lastAttempt, testId) {
    if (!lastAttempt || !lastAttempt.reviewStatus || lastAttempt.reviewStatus === 'none') return '';
    if (lastAttempt.reviewStatus === 'pending') {
        return `<div class="review-status-badge pending" onclick="reviewFromHistory('${lastAttempt._id}')">🟠 Chờ Review — ${lastAttempt.reviewMistakeCount} câu</div>`;
    }
    return `<div class="review-status-badge completed" onclick="reviewFromHistory('${lastAttempt._id}')">🔵 Đã Review</div>`;
}

function renderTestCard(t) {
    const dur = t.audioDuration ? `${Math.floor(t.audioDuration / 60)}:${pad(t.audioDuration % 60)} min` : '–';
    const done = !!t.lastAttempt;
    const band = t.lastAttempt?.bandScore?.toFixed(1) || '';
    const cor = t.lastAttempt?.correctCount ?? '';
    const tot = t.lastAttempt?.totalQuestions ?? t.totalQuestions ?? '';
    const dateStr = t.lastAttempt?.submittedAt
        ? new Date(t.lastAttempt.submittedAt).toLocaleDateString('en-GB')
        : '';
    // Colourful "TEST n" card (css/playful.css .tid-card) — two
    // entry points straight into ExamModeSelect, pre-picked.
    const locked = _userPlan !== 'premium';
    const testNo = window.TestCardArt ? window.TestCardArt.label(t) : escHtml(t.name);
    return `
                <div class="test-card tid-card tid-c${(t.testNumber || 1) % 4}" id="tcard-${t._id}" data-done="${done}" data-name="${escHtml((t.name || '').toLowerCase())}" title="${escAttr(t.name || '')}">
                    <div class="tid-card-top">
                        <span class="tid-brand">english | with | dan</span>
                        <button class="pc-share-btn" onclick="copyTestLink('${t._id}',event)" title="Sao chép link bài thi"><i class="fas fa-link"></i></button>
                        <i class="fas fa-headphones tid-skill-ic"></i>
                    </div>
                    ${done ? '<div class="test-done-tick">✓</div>' : ''}
                    <div class="tid-card-title">${testNo}</div>
                    <div class="tid-card-stats">
                        <span><i class="fas fa-music"></i> ${dur} · ${t.totalQuestions} câu</span>
                        ${done ? `<span class="tid-sep"></span><span><i class="far fa-circle-check"></i> Band ${band} · ${cor}/${tot}</span>` : ''}
                    </div>
                    ${reviewStatusBadge(t.lastAttempt, t._id)}
                    <div class="tid-card-actions">
                        ${locked
                    ? `<button class="tid-act tid-act-wide" onclick="goToStartTest('${t._id}')"><span class="tid-act-ic"><i class="fas fa-lock"></i></span>Upgrade gói<i class="fas fa-chevron-right"></i></button>`
                    : `<button class="tid-act" onclick="goToStartTest('${t._id}','practice')"><span class="tid-act-ic"><i class="fas fa-pen"></i></span>Luyện tập<i class="fas fa-chevron-right"></i></button>
                               <button class="tid-act" onclick="goToStartTest('${t._id}','simulation')"><span class="tid-act-ic"><i class="far fa-clock"></i></span>Thi thật<i class="fas fa-chevron-right"></i></button>`}
                    </div>
                    ${done ? `<button class="tid-review-link" onclick="reviewFromHistory('${t.lastAttempt._id}')"><i class="fas fa-search"></i> Xem lại lần cuối${dateStr ? ` · ${dateStr}` : ''}</button>` : ''}
                </div>`;
}

let _activeFilter = 'all';

function filterTests(mode, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    _activeFilter = mode;
    _lsPage = 1;
    rerenderLsFilteredTests();
}

// Debounced — was rebuilding the whole filtered test list on every
// keystroke (same pattern as filterWords() in dashboard.js).
let _testFilterTimer = null;
function applyTestFilters() {
    clearTimeout(_testFilterTimer);
    _testFilterTimer = setTimeout(() => {
        _lsPage = 1;
        rerenderLsFilteredTests();
    }, 250);
}

function getLsFilteredTests() {
    const q = (document.getElementById('test-search')?.value || '').trim().toLowerCase();
    return (state.tests || []).filter(t => {
        const done = !!t.lastAttempt;
        const matchFilter = _activeFilter === 'all' || (_activeFilter === 'done' ? done : !done);
        const matchSearch = !q || (t.name || '').toLowerCase().includes(q);
        return matchFilter && matchSearch;
    });
}

function rerenderLsFilteredTests() {
    const filtered = getLsFilteredTests();
    const pages = getGroupedPages(filtered);
    renderTestList(pages[_lsPage - 1] || []);
    renderLsPagination(pages.length, _lsPage, filtered.length);
}

function renderLsPagination(totalPages, page, totalTests) {
    const container = document.getElementById('tests-pagination');
    if (!container) return;
    if (totalPages <= 1) { container.innerHTML = ''; return; }
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);
    if (end - start < 4) {
        if (start === 1) end = Math.min(totalPages, 5);
        else start = Math.max(1, end - 4);
    }
    let html = '<div class="pg-wrap">';
    html += `<button class="pg-btn" onclick="goToLsPage(${page - 1})" ${page === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
    if (start > 1) {
        html += `<button class="pg-btn" onclick="goToLsPage(1)">1</button>`;
        if (start > 2) html += `<span class="pg-ellipsis">…</span>`;
    }
    for (let i = start; i <= end; i++) {
        html += `<button class="pg-btn${i === page ? ' pg-active' : ''}" onclick="goToLsPage(${i})">${i}</button>`;
    }
    if (end < totalPages) {
        if (end < totalPages - 1) html += `<span class="pg-ellipsis">…</span>`;
        html += `<button class="pg-btn" onclick="goToLsPage(${totalPages})">${totalPages}</button>`;
    }
    html += `<button class="pg-btn" onclick="goToLsPage(${page + 1})" ${page === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
    html += `<span class="pg-info">Trang ${page}/${totalPages} · ${totalTests} đề</span>`;
    html += '</div>';
    container.innerHTML = html;
}

function goToLsPage(p) {
    const filtered = getLsFilteredTests();
    const totalPages = getGroupedPages(filtered).length || 1;
    if (p < 1 || p > totalPages) return;
    _lsPage = p;
    rerenderLsFilteredTests();
    document.getElementById('tests-wrapper')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ══════════════════════════════════════════════
// PLAN-GATED START
// ══════════════════════════════════════════════
// pickedParts: sections to pre-pick in "Chọn phần làm" (a ?parts= link).
function goToStartTest(testId, preferred = null, pickedParts = null) {
    // Was `_userPlan !== 'premium'` — see reading-v2.js's identical
    // fix (Phase 5 audit finding): staff accounts were incorrectly
    // blocked here even though startPracticeSection() already
    // correctly used hasPremiumAccess().
    if (!window.AuthService.hasPremiumAccess()) { openUpgradeModal(); return; }
    state.pendingTestId = testId;
    // Full Mock Test (_mockMode) never reaches this function — it
    // calls startTest(tid) directly from the mock-detection block,
    // bypassing the list screen entirely — so this popup only ever
    // shows for a standalone student-initiated start.
    if (window.ExamModeSelect) {
        const _t = (state.tests || []).find(t => String(t._id) === String(testId));
        window.ExamModeSelect.open({
            skill: 'listening', preferred,
            parts: { count: 4, unit: 'Section', available: !!(_t && _t.partsPickable), picked: pickedParts },
            onPractice: parts => startTest(testId, 'practice', parts),
            onSimulation: parts => startTest(testId, 'simulation', parts),
        });
    } else {
        startTest(testId, 'practice');
    }
}

// Listening's own equivalent of the 4-skill Mock Test's disqualify
// handoff — see reading-v2.js's _onSimulationDisqualified for why
// this just abandons the exam UI and reloads rather than redirecting
// to a dashboard.
// The proctor voided the attempt (Simulation, or the Full Mock Test
// run): send the answers given so far with disqualified:true — the
// server saves them graded but keeps the attempt voided
// (listeningService.submitTest), so the teacher sees how far the
// student got. Resolves to the attempt id.
function _saveDisqualifiedListening() {
    if (!state.attemptId || !state.currentTestId) return Promise.resolve(null);
    return fetch(`${API}/listening/tests/${state.currentTestId}/submit`, {
        method: 'POST', headers: authH(), keepalive: true,
        body: JSON.stringify({ answers: state.answers || {}, startTime: state.startTime, attemptId: state.attemptId, disqualified: true }),
    }).then(r => r.json()).then(d => (d && d.result && d.result.attemptId) || null);
}

function _onSimulationDisqualified() {
    clearInterval(_asoTimer);
    clearInterval(_saveInterval);
    try { audio.pause(); } catch (_) {}
    state.submitted = true;
    window.onbeforeunload = null;
    clearExamStorage();
    location.href = 'listening.html';
}

// Premium upgrade modal (openUpgradeModal, closeUpgradeModal,
// selectUpgradePlan, submitUpgradeRequest, copyUpgradeAccount) is
// now the shared, site-wide js/upgrade-modal.js component.

window.goToStartTest = goToStartTest;

// Delegates to js/shared/api-client.js so a 401 here (e.g. an expired
// session during a 40-60min listening exam) triggers the same
// logout+redirect-to-login as every other page, instead of silently
// surfacing as a generic error forever (student UI audit, 2026-07-25).
// `opts` lets submitExam() opt OUT of that auto-redirect (see its own
// comment) — everywhere else keeps the default hard-logout behavior.
async function safeJson(res, opts) {
    return window.ApiClient.handleResponse(res, opts);
}

// A dropped connection (Render redeploy / instance swap, flaky wifi)
// rejects fetch() with "Failed to fetch" and the student saw "Lỗi tải
// bài thi" on the first click, then it worked on the second. Retry those
// and Render's 502/503/504 gateway errors a couple of times before
// giving up. Safe for /start: the server reuses the open in-progress
// attempt (BUG-010), so a repeated request never creates a second one.
async function _fetchRetryTransient(url, opts, tries = 3) {
    for (let i = 1; ; i++) {
        try {
            const res = await fetch(url, opts);
            if (i < tries && [502, 503, 504].includes(res.status)) throw new TypeError('HTTP ' + res.status);
            return res;
        } catch (err) {
            if (!(err instanceof TypeError) || i >= tries) throw err;
            await new Promise(r => setTimeout(r, 1000 * i));
        }
    }
}

// ══════════════════════════════════════════════
// START EXAM
// ══════════════════════════════════════════════
// parts: section numbers to do ("Chọn phần làm") — null = the whole test.
async function startTest(testId, mode = 'practice', parts = null) {
    // Guards against clicking "Bắt đầu" on test B before test A's
    // /start request resolves — without this, whichever response
    // arrives last wins and silently overwrites state.currentTest/
    // audio.src/screen back to the test the student already navigated
    // away from.
    state.pendingTestId = testId;
    try {
        clearExamStorage(); // clear any previous in-progress exam
        const res = await _fetchRetryTransient(`${API}/listening/tests/${testId}/start${_mockMode ? '?purpose=mocktest' : ''}`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ mode, ...(parts ? { parts } : {}) })
        });
        const data = await safeJson(res);
        if (testId !== state.pendingTestId) return; // superseded by a later startTest() call
        if (!data.success) throw new Error(data.message);
        const t = data.test;
        state.currentTestId = testId;
        state.currentTest = t;
        // Shareable / bookmarkable per-test URL, same as Reading's
        // ?testId=. Skipped in mock-test mode (mock-test.js owns the
        // URL there) and when we're already on this test's URL
        // (deep-link auto-start — renderTestList()).
        if (!_mockMode) {
            // Practice and Simulation runs of one test get different
            // links (?exam=), and so does a "Chọn phần làm" pick (?parts=1,2)
            // — the teacher copies the address bar to send exactly that
            // attempt. A clean /listening/test/:id keeps its path.
            const _u = new URL(location.href);
            const _st = { screen: 'exam', testId, testName: t.name };
            const _onClean = /^\/listening\/test\/[^/]+$/.test(_u.pathname);
            const _parts = t.parts || parts;
            if (_u.searchParams.get('testId') === String(testId) || _onClean) {
                _u.searchParams.set('exam', mode);
                if (_parts && _parts.length) _u.searchParams.set('parts', _parts.join(','));
                else _u.searchParams.delete('parts');
                history.replaceState(_st, '', _u.pathname + _u.search.replace(/%2C/gi, ','));
            } else {
                history.pushState(_st, '', `?testId=${testId}&exam=${mode}${window.RouteParams ? window.RouteParams.partsSuffix(_parts) : ''}`);
            }
        }
        state.attemptId = t.attemptId || null;
        state.answers = {};
        state.partIdx = 0;
        state.submitted = false;
        state.isReview = false;
        state.startTime = new Date().toISOString();
        state.mode = t.mode || mode;
        state.parts = t.parts || null;
        state.audioPartIdx = null;
        _partAudioPos = {};
        for (const k in partHlCache) delete partHlCache[k];
        for (const k in partHlCacheRv) delete partHlCacheRv[k];
        _pendingHl = {};
        clearInterval(_asoTimer);
        audio.playbackRate = 1;
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.toggle('active', b.textContent.trim() === '×1'));
        document.getElementById('exam-title').textContent = _titleWithParts(t.name, state.parts);
        if (_hasPartAudio(false)) {
            // Partial attempt: each picked section plays its own audio,
            // starting with the first one.
            audio.src = '';
            _loadPartAudio(0, false);
        } else {
            audio.src = t.audioUrl || '';
            audio.load();
        }
        const _cdRem = document.getElementById('cd-remaining-ls-txt');
        if (_cdRem) _cdRem.textContent = 'Audio chưa phát';
        buildPartTabs('part-tabs', false);
        renderPartQuestions(0);
        renderQNav('q-nav-grid', false);
        updateFooter();
        setToolExam('none');
        _updateExamToolbarForMode();
        showScreen('exam');
        const playNowBtn = document.getElementById('aso-play-now-btn');
        if (_isPartPractice()) {
            // Partial Practice: no "plays once" warning or countdown —
            // the student plays each section's audio with the button.
            document.getElementById('audio-start-overlay').classList.add('hidden');
            _syncPartPlayBtn();
        } else if (state.mode === 'simulation' && !_mockMode) {
            // Test Simulation: no overlay to click through — audio
            // auto-plays 10s after the test opens, like the real exam.
            document.getElementById('audio-start-overlay').classList.add('hidden');
            if (playNowBtn) playNowBtn.classList.remove('hidden');
            startAudioCountdown(10);
        } else {
            // Show overlay — học sinh đọc cảnh báo rồi tự bấm để bắt đầu đếm ngược
            document.getElementById('audio-start-overlay').classList.remove('hidden');
            if (playNowBtn) playNowBtn.classList.add('hidden');
            updateExamAudioStatus(false);
        }
        window.onbeforeunload = e => { if (!state.submitted) { e.preventDefault(); e.returnValue = ''; } };
        // Start periodic auto-save every 10s
        clearInterval(_saveInterval);
        _saveInterval = setInterval(saveExamToStorage, 10000);

        // Full Mock Test (_mockMode) has its own proctoring already
        // armed by mock-test.js's own auto-start — never double-arm
        // both engines on the same page.
        if (state.mode === 'simulation' && !_mockMode && window.ExamProctor) {
            window.ExamProctor.start({
                skill: 'listening', attemptType: 'full', attemptId: state.attemptId,
                onDisqualified: _onSimulationDisqualified,
                saveAnswers: _saveDisqualifiedListening,
            });
        }
    } catch (err) {
        if (testId !== state.pendingTestId) return; // superseded — don't surface a stale error
        if (err.status === 429 && err.body && err.body.code === 'SIMULATION_COOLDOWN') {
            toast(err.body.message || 'Vui lòng đợi trước khi bắt đầu Test Simulation mới', 'error');
        } else if (err.body && err.body.code === 'REVIEW_REQUIRED') {
            toast('Bạn cần hoàn thành review bài trước đó trước khi bắt đầu bài mới', 'warning');
            _goToPendingReview(err.body);
        } else if (err.body && err.body.code === 'PARTS_UNAVAILABLE') {
            toast(err.body.message, 'warning');
        } else {
            toast('Lỗi tải bài thi: ' + err.message, 'error');
        }
    }
}

// ══════════════════════════════════════════════
// AUDIO PLAYER
// ══════════════════════════════════════════════
function setupAudioEvents() {
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', () => {
        const dur = audio.duration || 0;
        setTimeDisplay('audio-current', 0); setTimeDisplay('audio-total', dur);
        setTimeDisplay('audio-current-rv', 0); setTimeDisplay('audio-total-rv', dur);
        setTimeDisplay('audio-current-pr', 0); setTimeDisplay('audio-total-pr', dur);
        document.getElementById('audio-seek').max = dur;
        document.getElementById('audio-seek-rv').max = dur;
        const prSeek = document.getElementById('audio-seek-pr');
        if (prSeek) { prSeek.max = dur; prSeek.value = 0; }
    });
    audio.addEventListener('play', () => {
        ['play-btn', 'play-btn-rv', 'play-btn-pr'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<i class="fas fa-pause"></i>';
        });
        if (!state.isReview) updateExamAudioStatus(true);
        if (!state.isReview) _syncPartPlayBtn();
    });
    audio.addEventListener('pause', () => {
        ['play-btn', 'play-btn-rv', 'play-btn-pr'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<i class="fas fa-play"></i>';
        });
        if (!state.isReview) updateExamAudioStatus(false);
        if (!state.isReview) _syncPartPlayBtn();
    });
    audio.addEventListener('ended', () => {
        if (!state.isReview) updateExamAudioStatus(false);
        if (!state.isReview) _syncPartPlayBtn();
        // Full Mock Test / Test Simulation: audio is over, nothing
        // left to play — give the student a short window to check
        // their answers before the exam force-submits. Practice keeps
        // today's behavior (submit whenever they like, no timer).
        // "Lẻ" practice shares this audio element but runs its own
        // countdown from audio.onended (_enterLTPracticeScreen).
        if (state.isReview || state.submitted || window.isLtPracticeActive?.()) return;
        // Partial Simulation: one section's audio is over — go straight
        // on to the next picked section (questions + its audio), like the
        // real exam running through the parts.
        if (state.mode === 'simulation' && _hasPartAudio(false)) {
            const next = (state.audioPartIdx ?? 0) + 1;
            if (next < getSortedSections(false).length) {
                switchPart(next, false);
                _loadPartAudio(next, false);
                startAudioPlay();
                return;
            }
        }
        const secs = _mockMode ? LISTENING_REVIEW_SECONDS
                   : state.mode === 'simulation' ? SIMULATION_REVIEW_SECONDS : 0;
        if (secs) _startListeningReviewCountdown(secs, () => { if (!state.submitted) submitExam(); });
    });
    // Genuine load failure (bad/missing audioUrl, network error,
    // unsupported format) — previously nothing listened for this at
    // all, so a broken audio file failed completely silently with no
    // indication to the student that anything was wrong.
    audio.addEventListener('error', () => {
        // submitExam() / closing a part-practice clear the player
        // with `audio.src = ''`, which the browser reports as an
        // error too — that showed this "contact your teacher"
        // message right after submitting a Full Mock Test even
        // though the audio itself was fine.
        if (state.isReview || state.submitted || !audio.getAttribute('src')) return;
        console.error('[audio] load error:', audio.error);
        const el = document.getElementById('exam-audio-status');
        if (el) {
            el.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Lỗi tải audio — vui lòng liên hệ giáo viên';
            el.style.color = '#dc2626';
        }
    });
}

// Cached seek-bar elements — onTimeUpdate fires many times/sec during
// playback, was re-querying these 3 ids on every tick.
let _audioSeekEl = null, _audioSeekRvEl = null, _audioSeekPrEl = null;
function onTimeUpdate() {
    const t = audio.currentTime;
    setTimeDisplay('audio-current', t);
    setTimeDisplay('audio-current-rv', t);
    setTimeDisplay('audio-current-pr', t);
    if (!_audioSeekEl) _audioSeekEl = document.getElementById('audio-seek');
    if (_audioSeekEl) _audioSeekEl.value = t;
    if (!_audioSeekRvEl) _audioSeekRvEl = document.getElementById('audio-seek-rv');
    if (_audioSeekRvEl) _audioSeekRvEl.value = t;
    if (!_audioSeekPrEl) _audioSeekPrEl = document.getElementById('audio-seek-pr');
    if (_audioSeekPrEl) _audioSeekPrEl.value = t;
    // Exam top bar: "29:56 remaining" of audio, like the real test.
    if (!_cdRemainingEl) _cdRemainingEl = document.getElementById('cd-remaining-ls-txt');
    if (_cdRemainingEl && audio.duration) {
        const left = Math.max(0, Math.round(audio.duration - t));
        _cdRemainingEl.textContent = `${pad(Math.floor(left / 60))}:${pad(left % 60)} remaining`;
    }
}
let _cdRemainingEl = null;

// Cached by id — setTimeDisplay is called from both the (low-frequency)
// loadedmetadata handler and the (high-frequency) onTimeUpdate above;
// memoizing here benefits every caller without changing the signature.
const _timeDisplayElCache = {};
function setTimeDisplay(id, secs) {
    let el = _timeDisplayElCache[id];
    if (el === undefined) { el = document.getElementById(id); _timeDisplayElCache[id] = el; }
    if (el) el.textContent = `${pad(Math.floor(secs / 60))}:${pad(Math.floor(secs % 60))}`;
}
function togglePlay() { if (audio.paused) audio.play(); else audio.pause(); }
function skipAudio(secs) { audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + secs)); }
function onSeekInput(val) { audio.currentTime = parseFloat(val); }
let _prevVolume = 1;

const _allVolSliders = ['volume-seek-exam', 'volume-seek-rv', 'volume-seek-pr'];
const _allVolIcons   = ['vol-icon-exam', 'vol-icon-rv', 'vol-icon-pr'];

function setVolume(val, source) {
    const v = parseInt(val) / 100;
    audio.volume = v;
    _allVolSliders.forEach(id => {
        if (id !== `volume-seek-${source}`) {
            const el = document.getElementById(id);
            if (el) el.value = val;
        }
    });
    const iconHTML = v === 0 ? '<i class="fas fa-volume-mute"></i>' : v < 0.4 ? '<i class="fas fa-volume-down"></i>' : '<i class="fas fa-volume-up"></i>';
    _allVolIcons.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = iconHTML;
    });
    if (v > 0) _prevVolume = v;
}

function toggleMute() {
    if (audio.volume > 0) {
        _prevVolume = audio.volume;
        audio.volume = 0;
        _allVolSliders.forEach(id => { const el = document.getElementById(id); if (el) el.value = 0; });
        _allVolIcons.forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = '<i class="fas fa-volume-mute"></i>'; });
    } else {
        const restore = Math.round(_prevVolume * 100);
        audio.volume = _prevVolume;
        _allVolSliders.forEach(id => { const el = document.getElementById(id); if (el) el.value = restore; });
        const iconHTML = _prevVolume < 0.4 ? '<i class="fas fa-volume-down"></i>' : '<i class="fas fa-volume-up"></i>';
        _allVolIcons.forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = iconHTML; });
    }
}

function setSpeed(speed, btn) {
    audio.playbackRate = speed;
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.speed-btn').forEach(b => {
        if (b.textContent.trim() === (btn?.textContent?.trim() || '')) b.classList.add('active');
    });
}
function jumpToTime(start) { audio.currentTime = start; if (audio.paused) audio.play(); }

let _asoTimer = null;

// Student clicks "Understood" on overlay → close overlay, start 30s countdown in audio bar
function startReadingTime() {
    document.getElementById('audio-start-overlay').classList.add('hidden');
    const playNowBtn = document.getElementById('aso-play-now-btn');
    if (playNowBtn) playNowBtn.classList.remove('hidden');
    startAudioCountdown();
}

function startAudioCountdown(seconds) {
    let count = seconds || 30;
    updateExamAudioStatus(false, count);
    clearInterval(_asoTimer);
    _asoTimer = setInterval(() => {
        count--;
        if (count <= 0) {
            clearInterval(_asoTimer);
            startAudioPlay();
        } else {
            updateExamAudioStatus(false, count);
        }
    }, 1000);
}

function startAudioPlay() {
    clearInterval(_asoTimer);
    document.getElementById('audio-start-overlay').classList.add('hidden');
    const playNowBtn = document.getElementById('aso-play-now-btn');
    // "Playing" status is set by the audio element's own 'play' event
    // listener (setupAudioEvents()) — only fires on genuine playback
    // start, unlike the unconditional updateExamAudioStatus(true) this
    // used to call immediately regardless of outcome. That's what let
    // audio.play()'s rejection get silently swallowed: this is called
    // from unattended setInterval countdowns (the 30s reading-time
    // auto-start, or resumeExam()'s 5s auto-countdown) with no user
    // gesture in the call stack, exactly when a browser's autoplay
    // policy is most likely to block it — the student would see a
    // confident green "Playing" pill while hearing nothing, with no
    // way to recover on a one-time-only, no-rewind audio.
    if (playNowBtn) playNowBtn.classList.add('hidden');
    audio.play().catch(err => {
        console.error('[startAudioPlay] play() failed:', err);
        if (playNowBtn) playNowBtn.classList.remove('hidden');
        const el = document.getElementById('exam-audio-status');
        if (el) {
            el.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Không tự phát được — bấm "Phát ngay"';
            el.style.color = '#dc2626';
        }
    });
}

function updateExamAudioStatus(playing, countdown) {
    const el = document.getElementById('exam-audio-status');
    if (!el) return;
    if (playing) {
        el.innerHTML = '<i class="fas fa-headphones"></i> Playing';
        el.style.color = '#22c55e';
    } else if (countdown != null) {
        el.innerHTML = `<i class="fas fa-clock"></i> Auto-play in: ${countdown}s`;
        el.style.color = countdown <= 10 ? '#f59e0b' : '';
    } else {
        el.innerHTML = '<i class="fas fa-headphones"></i> Chờ audio...';
        el.style.color = '';
    }
}

// ══════════════════════════════════════════════
// PART TABS
// ══════════════════════════════════════════════
// Sort sections theo partNumber để tránh lỗi render sai Part khi data không theo thứ tự
function getSortedSections(isReview) {
    const raw = isReview ? (state.reviewResult?.sections || []) : (state.currentTest?.sections || []);
    return [...raw].sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0));
}

function buildPartTabs(containerId, isReview) {
    const sections = getSortedSections(isReview);
    // Build buttons in unified fixed nav bar
    const btnContainer = document.getElementById('snf-section-btns');
    if (btnContainer) {
        btnContainer.innerHTML = sections.map((s, i) =>
            `<button class="snf-section-btn ${i === 0 ? 'active' : ''}"
                             onclick="switchPart(${i}, ${isReview})"
                             data-part-idx="${i}">
                        <span class="snf-btn-section-label">Section</span>
                        <span class="snf-btn-num">${s.partNumber}</span>
                    </button>`
        ).join('');
    }
    // Show/hide exam-only controls (answered count + submit)
    const examControls = document.getElementById('snf-exam-controls');
    if (examControls) examControls.style.display = isReview ? 'none' : 'flex';
}

function switchPart(idx, isReview) {
    const prevIdx = state.partIdx;

    // Save current part's highlights before switching
    if (prevIdx !== idx) {
        if (isReview) {
            const tb = document.getElementById('transcript-body');
            const rv = document.getElementById('review-questions-inner');
            if (tb && rv) partHlCacheRv[prevIdx] = { transcript: tb.innerHTML, questions: rv.innerHTML };
        } else {
            const qp = document.getElementById('questions-panel');

            if (qp) {
                // ✅ THÊM: flush input values vào DOM trước khi snapshot
                qp.querySelectorAll('input.fill-input, input.fill-input-inline').forEach(inp => {
                    inp.setAttribute('value', inp.value);
                });
                partHlCache[prevIdx] = qp.innerHTML;
            }
        }
    }

    state.partIdx = idx;
    // Update active state in fixed nav bar
    document.querySelectorAll('#snf-section-btns .snf-section-btn')
        .forEach((b, i) => b.classList.toggle('active', i === idx));
    if (isReview) {
        // A part already rendered this session is restored from the
        // in-memory cache; otherwise it's freshly rendered and any saved
        // highlights (goToReview's _pendingHl) are applied on top.
        const cachedRv = partHlCacheRv[idx];
        if (cachedRv !== undefined) {
            document.getElementById('transcript-body').innerHTML = cachedRv.transcript;
            document.getElementById('review-questions-inner').innerHTML = cachedRv.questions;
        } else {
            const section = getSortedSections(true)[idx];
            renderTranscript(section?.transcript || '');
            renderReviewPartQuestions(idx);
            _applyPendingHl(idx, document.getElementById('transcript-body'), document.getElementById('review-questions-inner'));
        }
        // Whichever branch ran above, #review-questions-inner's HTML
        // was just replaced wholesale — any inline review toggle/form
        // listeners from before this switch are gone with the old
        // nodes, so re-run the mount pass. Cheap: reuses
        // state.inlineReviewCtx, no network call. See reading-v2.js's
        // identical switchReviewPassage wiring.
        _runInlineReviewMountPass();
        _updatePartTabBadges();
        if (_hasPartAudio(true)) _loadPartAudio(idx, true);
        // Scroll về đầu sau khi switch part
        const rvInner = document.getElementById('review-questions-inner');
        if (rvInner) rvInner.scrollTop = 0;
        const rvPanel = document.getElementById('review-questions-panel');
        if (rvPanel) rvPanel.scrollTop = 0;
    } else {
        if (partHlCache[idx] !== undefined) {
            // Restore highlights from cache, then re-setup event listeners
            const panel = document.getElementById('questions-panel');
            panel.innerHTML = partHlCache[idx];
            setupDragDrop(panel);
            setupDictionaryDouble('questions-panel', 'listening', _ltDictGate);
            const section = getSortedSections(false)[idx];
            (section?.questionGroups || []).forEach(g =>
                (g.questions || []).forEach(q => restoreAnswer(q))
            );
            refreshWordChips();
        } else {
            renderPartQuestions(idx);
        }
        _renderCdPartHeaderLs(idx);
        if (window.CDFooter && window.CDFooter.isMounted()) window.CDFooter.setActivePart(idx);
        // Partial Practice: each section's tab brings its own audio.
        if (_isPartPractice()) _loadPartAudio(idx, false);
        // Scroll về đầu sau khi switch part
        const qPanel = document.getElementById('questions-panel');
        if (qPanel) qPanel.scrollTop = 0;
    }
}

// ══════════════════════════════════════════════
// RENDER QUESTIONS (với questionGroups)
// ══════════════════════════════════════════════
function renderPartQuestions(partIdx) {
    const section = getSortedSections(false)[partIdx];
    if (!section) return;
    const panel = document.getElementById('questions-panel');
    let html = `
                <div class="section-header-card">
                    <div class="section-part-label">Part ${section.partNumber}</div>
                    <div class="section-title-text">${escHtml(section.title)}</div>
                    ${section.description ? `<div class="section-desc">${escHtml(section.description)}</div>` : ''}
                    <div class="section-range">Câu ${section.questionRange?.start ?? ''}–${section.questionRange?.end ?? ''}</div>
                </div>`;
    (section.questionGroups || []).forEach((group, gi) => {
        html += renderQuestionGroup(group, gi, false);
    });
    panel.innerHTML = html;
    _renderCdPartHeaderLs(partIdx);
    _applyPendingHl(partIdx, null, panel);
    (section.questionGroups || []).forEach(g => g.questions.forEach(q => restoreAnswer(q)));
    refreshWordChips();
    setupDragDrop(panel);
    // re-attach dict to questions-panel sau khi re-render
    setupDictionaryDouble('questions-panel', 'listening', _ltDictGate);
}

// ── Helpers ───────────────────────────────────────────────
// escHtml() moved to js/shared/utils.js (single source of truth — Phase 3 audit).

// ── Group dispatcher ──────────────────────────────────────
function renderQuestionGroup(group, gi, isReview) {
    const groupType = group.groupType || 'plain';
    const titleHtml = group.groupTitle
        ? `<div class="group-title">${escHtml(group.groupTitle)}</div>` : '';
    const instruction = group.instruction
        ? `<div class="group-instruction">${escHtml(group.instruction)}</div>` : '';

    let wordBankHtml = '';
    if (!isReview) {
        const wbQs = group.questions.filter(q => ['sentence-completion', 'matching'].includes(q.type) && q.wordBank?.length);
        if (wbQs.length) {
            const allWords = [...new Set(wbQs.flatMap(q => q.wordBank))];
            wordBankHtml = renderWordBankHtml(allWords, group.questions[0]?.questionNumber || gi);
        }
    }

    let contentHtml = '';
    switch (groupType) {
        case 'table': contentHtml = renderTableGroup(group, isReview); break;
        case 'note-form': contentHtml = renderNoteFormGroup(group, isReview); break;
        case 'bullet-list': contentHtml = renderBulletListGroup(group, isReview); break;
        case 'map': contentHtml = renderMapGroup(group, isReview); break;
        case 'matching-options':
        case 'sentence-endings': contentHtml = renderMatchingOptionsGroup(group, isReview); break;
        case 'drag-drop':          contentHtml = renderDragDropGroup(group, isReview); break;
        case 'summary-completion': contentHtml = renderSummaryCompletionGroup(group, isReview); break;
        default: contentHtml = renderPlainGroup(group, isReview); break;
    }

    // Pasted full-document HTML (<style> body{…}) must not restyle the page.
    if (window.scopeEmbeddedHtml) contentHtml = window.scopeEmbeddedHtml(contentHtml);

    const summary = isReview ? renderGroupReviewSummary(group) : '';
    // Student's own notes for this group — js/shared/question-notes.js
    const notesHtml = window.QuestionNotes ? window.QuestionNotes.html('listening', group) : '';
    return `<div class="question-group" data-type="${groupType}">${titleHtml}${instruction}${wordBankHtml}${contentHtml}${notesHtml}${summary}</div>`;
}

function renderTableGroup(group, isReview) {
    const { headers = [], rows = [] } = group.tableConfig || {};
    // All-blank headers rendered as an empty grey strip above the table.
    const headerHtml = headers.some(h => String(h || '').trim())
        ? `<thead><tr>${headers.map(h => `<th>${escHtml(h)}</th>`).join('')}</tr></thead>` : '';
    const bodyHtml = rows.map(cells =>
        `<tr>${cells.map(cell =>
            `<td>${resolvePlaceholders(cell, group.questions, isReview)}</td>`
        ).join('')}</tr>`
    ).join('');
    return `<div class="group-table-wrap"><table class="group-table">${headerHtml}<tbody>${bodyHtml}</tbody></table></div>`;
}

function renderNoteFormGroup(group, isReview) {
    const { title = '', lines = [] } = group.noteConfig || {};
    const linesHtml = lines.map(line => {
        const isIndent = line.startsWith('>>');
        const cleanLine = isIndent ? line.slice(2) : line;
        // Dòng trống → khoảng cách
        if (cleanLine.trim() === '') return `<div class="note-line-spacer"></div>`;
        return `<div class="note-line${isIndent ? ' note-line-indent' : ''}">${resolvePlaceholders(cleanLine, group.questions, isReview)}</div>`;
    }).join('');
    return `<div class="group-note-form">
                ${title ? `<div class="note-form-title">${escHtml(title)}</div>` : ''}
                <div class="note-form-body">${linesHtml}</div>
            </div>`;
}

function renderBulletListGroup(group, isReview) {
    const { items = [] } = group.bulletConfig || {};
    const itemsHtml = items.map(item => {
        const isIndent = item.startsWith('>>');
        const cleanItem = isIndent ? item.slice(2) : item;
        // Item trống → khoảng cách
        if (cleanItem.trim() === '') return `<li class="bullet-item-spacer"></li>`;
        return `<li class="bullet-item${isIndent ? ' bullet-item-indent' : ''}">${resolvePlaceholders(cleanItem, group.questions, isReview)}</li>`;
    }).join('');
    return `<div class="group-bullet-list"><ul>${itemsHtml}</ul></div>`;
}

function renderMapGroup(group, isReview) {
    const { imageUrl = '', dragDropConfig = {}, questions = [] } = group;
    const words = dragDropConfig.words || [];
    const imgHtml = imageUrl
        ? `<div class="map-img-wrap"><img src="${escHtml(imageUrl)}" class="map-img" alt="Diagram" loading="lazy"/></div>`
        : '';

    // ── Drag-drop mode when word bank is configured ───────────
    if (words.length > 0) {
        const groupId = 'lmapg-' + questions.map(q => q.questionNumber).join('-');
        const qMap = {};
        questions.forEach(q => { qMap[q.questionNumber] = q; });

        const chipsHtml = words.map(word => {
            const isUsed = !isReview && questions.some(q => state.answers[q.questionNumber] === word);
            return `<span class="drag-chip sc-chip${isUsed ? ' used' : ''}"
                        data-value="${escHtml(word)}" data-groupid="${groupId}" data-reuse="0"
                        draggable="${isReview ? 'false' : 'true'}"
                        ondragstart="ltDragStart(event,'${escH(word)}')"
                        onclick="ltClickSCChip('${escH(word)}','${groupId}')">
                        <i class="fas fa-grip-vertical" style="color:#c4b5fd;font-size:10px;flex-shrink:0"></i>${escHtml(word)}
                    </span>`;
        }).join('');

        const qRowsHtml = questions.map(q => {
            const num = q.questionNumber;
            const labelHtml = q.questionText ? `<span class="map-dd-label">${escHtml(q.questionText)}</span>` : '';
            if (isReview) {
                const cls = q.isCorrect ? 'rq-ans-ok' : q.userAnswer ? 'rq-ans-wrong' : 'rq-ans-skip';
                const hint = !q.isCorrect ? `<span class="rq-ans-correct">(✓${escHtml(q.correctAnswer || '')})</span>` : '';
                return `<div class="map-dd-row" id="mapdd-${num}" data-qnum="${num}"><span class="rq-q-badge">${num}</span><span class="rq-inline-ans ${cls}">${escHtml(q.userAnswer || '–')}</span>${hint}${labelHtml}</div>`;
            }
            const ans = state.answers[num] || '';
            return `<div class="map-dd-row">
                        <span class="rq-q-badge">${num}</span>
                        <span class="drop-zone sc-drop${ans ? ' filled' : ''}" data-qnum="${num}" data-groupid="${groupId}"
                            ondragover="event.preventDefault();this.classList.add('dragover')"
                            ondragleave="this.classList.remove('dragover')"
                            ondrop="ltDropSC(event,${num},'${groupId}')">
                            ${ans ? `${escHtml(ans)}<span class="clear-drop" onclick="ltClearDragDrop(${num},'${groupId}')"><i class="fas fa-times"></i></span>` : 'Thả vào'}
                        </span>${labelHtml}
                    </div>`;
        }).join('');

        const explHtml = isReview
            ? questions.filter(q => q.explanation).map(q =>
                `<div class="q-explanation"><span class="rq-q-badge">${q.questionNumber}</span> <strong>Giải thích:</strong> ${escHtml(q.explanation)}</div>`
              ).join('')
            : '';

        return `<div class="map-dd-group">
                    ${imgHtml}
                    <div class="map-dd-body">
                        <div class="map-dd-questions">${qRowsHtml}${explHtml}</div>
                        <div class="dd-bank-col" id="${groupId}-bank">
                            <div class="dd-bank-header">
                                <span class="dd-bank-title">KÉO VÀO SƠ ĐỒ</span>
                                <span class="dd-bank-count">${words.length} lựa chọn</span>
                            </div>
                            <div class="dd-bank-chips">${chipsHtml}</div>
                        </div>
                    </div>
                </div>`;
    }

    // ── Fallback: text-input mode ─────────────────────────────
    const qsHtml = questions.map(q => renderStandaloneQuestion(q, isReview)).join('');
    return `<div class="group-map">
                ${imgHtml}
                <div class="map-questions">${qsHtml}</div>
            </div>`;
}

// ── Matching-options / sentence-endings ───────────────────
function renderMatchingOptionsGroup(group, isReview) {
    const { matchingReuseAllowed = false, questions = [] } = group;
    // sentence-endings stores options in endingsConfig.endings
    const matchingOptions = group.matchingOptions?.length
        ? group.matchingOptions
        : (group.endingsConfig?.endings || []).map(e => e.text || '');
    // L7: sentence-endings use stored letter; matching-options use positional A,B,C...
    const optLetters = (group.groupType === 'sentence-endings' && group.endingsConfig?.endings?.length)
        ? group.endingsConfig.endings.map((e, i) => e.letter || String.fromCharCode(65 + i))
        : matchingOptions.map((_, i) => String.fromCharCode(65 + i));
    const groupId = 'lmog-' + questions.map(q => q.questionNumber).join('-');
    // Fewer options than questions (e.g. A/B/C for Q11-16) → letters
    // must be reusable, or the last questions can never be answered.
    const reuse = matchingReuseAllowed || matchingOptions.length < questions.length;

    const reuseNote = matchingReuseAllowed
        ? `<div class="match-reuse-note"><strong>NB</strong> &nbsp;You may use any letter more than once.</div>` : '';

    // Cột trái: danh sách options dọc (A–G)
    const optListHtml = matchingOptions.map((opt, i) => {
        const letter = optLetters[i];
        const isUsed = !isReview && !reuse &&
            questions.some(q => state.answers[q.questionNumber] === letter);
        return `<div class="mo-opt-row${isUsed ? ' mo-opt-used' : ''}"
                    data-value="${letter}" data-groupid="${groupId}"
                    data-reuse="${reuse ? 1 : 0}"
                    draggable="${isReview ? 'false' : 'true'}"
                    ondragstart="ltDragStart(event,'${escH(letter)}')"
                    onclick="${isReview ? '' : `ltClickMOChip('${escH(letter)}','${groupId}')`}">
                    <span class="mo-opt-letter">${letter}</span>
                    <span class="mo-opt-text">${escHtml(opt)}</span>
                </div>`;
    }).join('');

    // Cột phải: các câu hỏi với ô điền
    const qRowsHtml = questions.map(q => {
        const qNum = q.questionNumber;
        const ans = isReview ? (q.userAnswer || '') : (state.answers[qNum] || '');
        if (isReview) {
            const isCorrect = !!q.isCorrect;
            const expl = q.explanation
                ? `<div class="match-feedback q-explanation" style="width:100%;font-size:12px;margin-top:4px"><strong>Giải thích:</strong> ${escHtml(q.explanation)}</div>` : '';
            return `<div class="mo-q-row" id="qi-${qNum}" data-qnum="${qNum}">
                        <span class="mo-q-num">${qNum}</span>
                        <span class="mo-q-text">${escHtml(q.questionText || '')}</span>
                        <div class="mo-q-answer">
                            <span class="mo-ans-letter ${isCorrect ? 'correct' : ans ? 'wrong' : 'skip'}">${escHtml(ans || '–')}</span>
                            ${!isCorrect ? `<span class="mo-correct-ans">✓ ${escHtml(q.correctAnswer || '')}</span>` : ''}
                        </div>
                        ${expl}
                    </div>`;
        }
        const dropInner = ans
            ? `<span class="mo-ans-letter">${escHtml(ans)}</span><span class="clear-drop" onclick="event.stopPropagation();ltClearDragDrop(${qNum},'${groupId}')"><i class="fas fa-times"></i></span>`
            : `<span class="mo-ans-placeholder">?</span>`;
        return `<div class="mo-q-row" id="qi-${qNum}" data-qnum="${qNum}">
                    <span class="mo-q-num">${qNum}</span>
                    <span class="mo-q-text">${escHtml(q.questionText || '')}</span>
                    <div class="mo-q-answer">
                        <div class="mo-ans-drop rq-mo-drop${ans ? ' filled' : ''}"
                             data-qnum="${qNum}" data-groupid="${groupId}"
                             ondragover="event.preventDefault();this.classList.add('dragover')"
                             ondragleave="this.classList.remove('dragover')"
                             ondrop="this.classList.remove('dragover');ltDropMO(event,${qNum},'${groupId}')">
                            ${dropInner}
                        </div>
                    </div>
                </div>`;
    }).join('');

    const moTitle = group.matchingOptionsTitle?.trim();
    const optColHtml = moTitle
        ? `<div class="mo-options-box"><div class="mo-options-title">${escHtml(moTitle)}</div><div class="mo-options-col" id="${groupId}-bank">${optListHtml}</div></div>`
        : `<div class="mo-options-col" id="${groupId}-bank">${optListHtml}</div>`;
    return `<div class="rq-mo-group">
                ${reuseNote}
                <div class="mo-two-col">
                    ${optColHtml}
                    <div class="mo-questions-col">${qRowsHtml}</div>
                </div>
            </div>`;
}

// ── Drag & Drop (Listening) ───────────────────────────────
function renderDragDropGroup(group, isReview) {
    const { dragDropConfig = {}, questions = [] } = group;
    const { text = '', words = [] } = dragDropConfig;
    if (!words.length && !text) return '<div class="form-hint">Chưa có nội dung. Vui lòng cấu hình nhóm câu hỏi này.</div>';
    const groupId = 'lddg-' + questions.map(q => q.questionNumber).join('-');
    const qMap = {};
    questions.forEach(q => { qMap[q.questionNumber] = q; });
    // Same rule as matching-options: fewer chips than blanks → reusable.
    const reuse = group.matchingReuseAllowed || words.length < questions.length;

    const chipsHtml = words.map(word => {
        const isUsed = !isReview && !reuse && questions.some(q => state.answers[q.questionNumber] === word);
        return `<span class="drag-chip sc-chip${isUsed ? ' used' : ''}"
                    data-value="${escHtml(word)}" data-groupid="${groupId}"
                    data-reuse="${reuse ? 1 : 0}"
                    draggable="${isReview ? 'false' : 'true'}"
                    ondragstart="ltDragStart(event,'${escH(word)}')"
                    onclick="ltClickSCChip('${escH(word)}','${groupId}')">
                    <i class="fas fa-grip-vertical" style="color:#c4b5fd;font-size:10px;flex-shrink:0"></i>${escHtml(word)}
                </span>`;
    }).join('');

    const contentHtml = text.replace(/__Q(\d+)__/g, (_, numStr) => {
        const qNum = parseInt(numStr);
        const q = qMap[qNum];
        if (!q) return `[Q${qNum}]`;
        if (isReview) {
            const cls = q.isCorrect ? 'rq-ans-ok' : q.userAnswer ? 'rq-ans-wrong' : 'rq-ans-skip';
            const hint = !q.isCorrect ? `<span class="rq-ans-correct">(✓${escHtml(q.correctAnswer || '')})</span>` : '';
            return `<span class="rq-inline-wrap" id="rv-q${qNum}" data-qnum="${qNum}"><span class="rq-q-badge">${qNum}</span><span class="rq-inline-ans ${cls}">${escHtml(q.userAnswer || '–')}</span>${hint}</span>`;
        }
        const ans = state.answers[qNum] || '';
        return `<span class="rq-inline-wrap"><span class="rq-q-badge">${qNum}</span><span class="drop-zone sc-drop${ans ? ' filled' : ''}" data-qnum="${qNum}" data-groupid="${groupId}" ondragover="event.preventDefault();this.classList.add('dragover')" ondragleave="this.classList.remove('dragover')" ondrop="ltDropSC(event,${qNum},'${groupId}')">${ans ? `${escHtml(ans)}<span class="clear-drop" onclick="ltClearDragDrop(${qNum},'${groupId}')"><i class="fas fa-times"></i></span>` : 'Thả vào'}</span></span>`;
    });

    const explHtml = isReview
        ? questions.filter(q => q.explanation).map(q => `<div class="q-explanation"><span class="rq-q-badge">${q.questionNumber}</span> <strong>Giải thích:</strong> ${escHtml(q.explanation)}</div>`).join('')
        : '';

    return `<div class="rq-drag-drop-group">
                <div class="dd-text-col">${contentHtml}${explHtml}</div>
                <div class="dd-bank-col" id="${groupId}-bank">
                    <div class="dd-bank-header">
                        <span class="dd-bank-title">KÉO OPTION VÀO CÂU HỎI</span>
                        <span class="dd-bank-count">${words.length} lựa chọn</span>
                    </div>
                    <div class="dd-bank-chips">${chipsHtml}</div>
                </div>
            </div>`;
}

// ── Summary completion ────────────────────────────────────
function renderSummaryCompletionGroup(group, isReview) {
    const { summaryConfig = {}, questions = [] } = group;
    const { text = '', wordBank = [] } = summaryConfig;
    if (!wordBank.length) return '<div class="form-hint">No word bank available.</div>';
    const groupId = 'lscg-' + questions.map(q => q.questionNumber).join('-');
    const qMap = {};
    questions.forEach(q => { qMap[q.questionNumber] = q; });

    const chipsHtml = wordBank.map(w => {
        const word = w.word || '';
        const isUsed = !isReview && questions.some(q => state.answers[q.questionNumber] === word);
        return `<span class="drag-chip sc-chip${isUsed ? ' used' : ''}"
                    data-value="${escHtml(word)}" data-groupid="${groupId}"
                    data-reuse="0"
                    draggable="${isReview ? 'false' : 'true'}"
                    ondragstart="ltDragStart(event,'${escH(word)}')"
                    onclick="ltClickSCChip('${escH(word)}','${groupId}')">
                    <i class="fas fa-grip-vertical" style="color:#c4b5fd;font-size:10px;flex-shrink:0"></i><strong>${escHtml(w.letter || '')}</strong>. ${escHtml(word)}
                </span>`;
    }).join('');

    const summaryHtml = text.replace(/__Q(\d+)__/g, (_, numStr) => {
        const qNum = parseInt(numStr);
        const q = qMap[qNum];
        if (!q) return `[Q${qNum}]`;
        if (isReview) {
            const cls = q.isCorrect ? 'rq-ans-ok' : q.userAnswer ? 'rq-ans-wrong' : 'rq-ans-skip';
            const hint = !q.isCorrect ? `<span class="rq-ans-correct">(✓${escHtml(q.correctAnswer || '')})</span>` : '';
            return `<span class="rq-inline-wrap" id="rv-q${qNum}" data-qnum="${qNum}"><span class="rq-q-badge">${qNum}</span><span class="rq-inline-ans ${cls}">${escHtml(q.userAnswer || '–')}</span>${hint}</span>`;
        }
        const ans = state.answers[qNum] || '';
        return `<span class="rq-inline-wrap"><span class="rq-q-badge">${qNum}</span><span class="drop-zone sc-drop${ans ? ' filled' : ''}" data-qnum="${qNum}" data-groupid="${groupId}" ondragover="event.preventDefault();this.classList.add('dragover')" ondragleave="this.classList.remove('dragover')" ondrop="ltDropSC(event,${qNum},'${groupId}')">${ans ? `${escHtml(ans)}<span class="clear-drop" onclick="ltClearDragDrop(${qNum},'${groupId}')"><i class="fas fa-times"></i></span>` : 'Thả vào'}</span></span>`;
    });

    // Explanation blocks (below summary text, one per question that has explanation)
    const explHtml = isReview
        ? questions
            .filter(q => q.explanation)
            .map(q => `<div class="q-explanation"><span class="rq-q-badge">${q.questionNumber}</span> <strong>Giải thích:</strong> ${escHtml(q.explanation)}</div>`)
            .join('')
        : '';

    return `<div class="rq-summary-group">
                <div class="rq-summary-text">${summaryHtml}${explHtml}</div>
                <div class="rq-sc-bank" id="${groupId}-bank">
                    <div class="rq-sc-bank-header">
                        <span class="rq-sc-bank-title">KÉO TỪ VÀO CÂU HỎI</span>
                        <span class="rq-sc-bank-count">${wordBank.length} từ gợi ý</span>
                    </div>
                    <div class="rq-sc-bank-chips">${chipsHtml}</div>
                </div>
            </div>`;
}

function renderPlainGroup(group, isReview) {
    // Gom các câu multi-answer-group liên tiếp có chung options thành 1 cluster UI
    // Cũng hỗ trợ legacy 'checkbox' type (backward-compatible)
    const isMAGType = t => t === 'multi-answer-group';
    const normOpts = opts => JSON.stringify((opts || []).map(o => (o || '').trim().toLowerCase()));
    const items = [];
    let i = 0;
    while (i < group.questions.length) {
        const q = group.questions[i];
        if (isMAGType(q.type)) {
            const cluster = [q];
            while (
                i + 1 < group.questions.length &&
                isMAGType(group.questions[i + 1].type) &&
                normOpts(group.questions[i + 1].options) === normOpts(q.options)
            ) {
                i++;
                cluster.push(group.questions[i]);
            }
            items.push(renderMultiAnswerCluster(cluster, isReview));
        } else {
            items.push(renderStandaloneQuestion(q, isReview));
        }
        i++;
    }
    return items.join('');
}

// Render nhóm "Choose N letters A-G" gộp thành 1 UI chung
// Hỗ trợ 2, 3, 4 letters (Q18-20 Choose THREE letters, etc.)
function renderMultiAnswerCluster(cluster, isReview) {
    const count = cluster.length;   // = số đáp án cần chọn = số câu trong cluster
    const firstNum = cluster[0].questionNumber;
    const lastNum = cluster[cluster.length - 1].questionNumber;
    const opts = cluster[0].options || [];

    // Đáp án đúng từng câu trong cluster (mảng chữ cái)
    const caLetters = cluster.map(q => (q.correctAnswer || '').trim().toUpperCase()).filter(Boolean);

    // Đáp án học sinh (lưu chung tại firstNum)
    // Review: đọc từ cluster[0].userAnswer (được merge từ reviewMap)
    let uaArr = [];
    if (isReview) {
        // Thử đọc từ câu đầu cluster (sau khi merge reviewMap)
        const rawUA = cluster[0].userAnswer || '';
        try { uaArr = JSON.parse(rawUA).map(x => x.toUpperCase()); } catch { uaArr = []; }
    } else {
        try { uaArr = JSON.parse(state.answers[firstNum] || '[]').map(x => x.toUpperCase()); } catch { }
    }

    // Label range: "Questions 18, 19 and 20" hoặc "Questions 17 and 18"
    let rangeLabel;
    if (count === 1) {
        rangeLabel = `Câu ${firstNum}`;
    } else if (count === 2) {
        rangeLabel = `Câu ${firstNum} và ${lastNum}`;
    } else {
        const nums = cluster.map(q => q.questionNumber);
        rangeLabel = `Câu ${nums.slice(0, -1).join(', ')} và ${nums[nums.length - 1]}`;
    }

    // Tên chữ cái: A, B, C, D, E, F, G
    const LETTERS = 'ABCDEFGHIJ';
    const optHtml = opts.map((opt, idx) => {
        const letter = LETTERS[idx] || String.fromCharCode(65 + idx);
        let cls = '';
        if (isReview) {
            if (caLetters.includes(letter)) cls = 'correct-ans';
            else if (uaArr.includes(letter)) cls = 'wrong-ans';
        } else {
            if (uaArr.includes(letter)) cls = 'selected';
        }
        const onclick = isReview ? '' : `onclick="toggleMultiAnswer(${firstNum}, '${letter}', ${count}, ${lastNum})"`;
        const label = opt.replace(/^[A-Ja-j]\s+/, '');
        return `<div class="checkbox-opt ${cls}" data-cluster="${firstNum}" data-value="${letter}" ${onclick}>
                    <span class="check-box"></span>
                    <label><strong>${letter}</strong>&nbsp;&nbsp;${label}</label>
                </div>`;
    }).join('');

    // Review: kết quả từng câu riêng
    let reviewExtra = '';
    if (isReview) {
        reviewExtra = cluster.map(q => {
            // q.isCorrect đã được tính ở backend
            const ok = !!q.isCorrect;
            const qUA = (q.userAnswer || '').trim();
            const qCA = (q.correctAnswer || '').trim().toUpperCase();
            // Wrapped in its own data-qnum block (unlike the plain
            // per-question case, a cluster shares ONE .question-item
            // across several question numbers) so the inline review
            // mount pass has a per-mistake anchor — see
            // _runInlineReviewMountPass().
            return `<div class="q-mistake-block" id="qfb-${q.questionNumber}" data-qnum="${q.questionNumber}">
                        <div class="q-correct-ans ${ok ? 'right' : qUA ? 'wrong' : 'skip'}" style="margin-top:4px">
                            Q${q.questionNumber}: ${ok ? '✓ Đúng'
                      : (qUA ? '✗ Sai' : '⊘ Bỏ qua') + (qCA ? ` — Đáp án: <strong>${escHtml(qCA)}</strong>` : '')}
                        </div>${q.explanation ? `<div class="q-explanation"><strong>Giải thích:</strong> ${escHtml(q.explanation)}</div>` : ''}
                    </div>`;
        }).join('');
    }

    // Hint text
    const letterWord = count.toString();

    return `<div class="question-item" id="qi-${firstNum}" data-cluster-start="${firstNum}" data-cluster-end="${lastNum}">
                <div class="q-header">
                    <span class="q-badge">${rangeLabel}</span>
                    <div class="q-text">${escHtml(cluster[0].questionText || '')}</div>
                </div>
                <div class="checkbox-hint">Chọn <strong>${letterWord}</strong> chữ cái, A–${LETTERS[opts.length - 1] || 'E'}</div>
                <div class="checkbox-opts">${optHtml}</div>
                ${reviewExtra}
            </div>`;
}

function renderStandaloneQuestion(q, isReview) {
    const num = q.questionNumber;
    const ua = isReview ? (q.userAnswer || '') : (state.answers[num] || '');
    const ca = isReview ? (q.correctAnswer || '') : '';
    const ok = isReview ? !!q.isCorrect : false;

    let inputHtml = '';
    switch (q.type) {
        case 'multiple-choice': inputHtml = renderRadioOpts(num, q.options || [], ua, ca, isReview); break;
        case 'checkbox': inputHtml = renderCheckboxOpts(num, q.options || [], ua, ca, isReview, q.checkboxCount || 2); break;
        case 'multi-answer-group': inputHtml = renderMultiAnswerCluster([q], isReview); break;
        case 'fill-blank':
        case 'map-labelling':
        case 'matching-info': inputHtml = renderFillBlank(num, ua, ca, isReview); break;
        case 'sentence-completion':
        case 'matching': inputHtml = renderInlineDrop(num, q.questionText, ua, ca, isReview); break;
        default: inputHtml = renderFillBlank(num, ua, ca, isReview);
    }

    // Typed-answer question whose text has a blank ("... as that of
    // the _____.") — put the box right in the blank instead of a
    // full-width input under the sentence.
    const inlineFill = !['multiple-choice', 'checkbox', 'multi-answer-group', 'sentence-completion', 'matching'].includes(q.type)
        && INLINE_BLANK_RE.test(q.questionText || '');
    const showText = !['sentence-completion', 'matching'].includes(q.type);
    const textHtml = inlineFill
        ? `<div class="q-text">${renderInlineFill(num, q.questionText, ua, ok, isReview)}</div>`
        : showText ? `<div class="q-text">${escHtml(q.questionText || '')}</div>` : '';
    const reviewExtra = isReview ? `
                <div class="q-correct-ans ${ok ? 'right' : ua ? 'wrong' : 'skip'}">
                    ${ok ? '✓ Đúng' : (ua ? '✗ Sai' : '⊘ Bỏ qua') + (ca ? ` — Đáp án: <strong>${escHtml(ca)}</strong>` : '')}
                </div>
                ${q.explanation ? `<div class="q-explanation"><strong>Giải thích:</strong> ${escHtml(q.explanation)}</div>` : ''}` : '';

    return `<div class="question-item" id="qi-${num}" data-qnum="${num}">
                <div class="q-header">
                    <span class="q-badge">${num}</span>
                    ${textHtml}
                </div>
                ${inlineFill ? '' : inputHtml}${reviewExtra}
            </div>`;
}

function resolvePlaceholders(template, questions, isReview) {
    return template.replace(/__Q(\d+)__/g, (match, numStr) => {
        const num = parseInt(numStr);
        const q = questions.find(q => q.questionNumber === num);
        if (!q) return match;
        const ua = isReview ? (q.userAnswer || '') : (state.answers[num] || '');
        const ca = isReview ? (q.correctAnswer || '') : '';
        if (isReview) {
            const ok = !!q.isCorrect;
            // NOT injecting the explanation here as a trailing block
            // element — __Qn__ can sit mid-sentence (more text may
            // follow on the same line/cell), so a block-level div
            // right in the replacement would break the surrounding
            // text flow. The mount pass appends the explanation
            // (and the review form) at the END of the whole line's
            // container instead — see _runInlineReviewMountPass().
            return `<span class="inline-answer-wrap" id="rv-q${num}" data-qnum="${num}">
                        <span class="q-badge-inline">${num}</span>
                        <span class="inline-answer ${ok ? 'inline-correct' : ua ? 'inline-wrong' : 'inline-skip'}">${escHtml(ua || '–')}</span>
                        ${!ok ? `<span class="inline-correct-ans">(${escHtml(ca)})</span>` : ''}
                    </span>`;
        }
        return `<span class="inline-input-wrap" id="q${num}" data-qnum="${num}">
                    <span class="q-badge-inline">${num}</span>
                    <input id="fi-${num}" class="fill-input-inline" type="text"
                        value="${escAttr(ua)}" placeholder="..." autocomplete="off"
                        oninput="saveText(${num}, this.value)" />
                </span>`;
    });
}

function renderGroupReviewSummary(group) {
    if (!group.questions?.length) return '';
    const total = group.questions.length;
    const correct = group.questions.filter(q => q.isCorrect).length;
    return `<div class="group-review-summary">
                Nhóm này: <strong style="color:${correct === total ? '#16a34a' : '#e53935'}">${correct}/${total}</strong> đúng
            </div>`;
}

// ══════════════════════════════════════════════
// REVIEW
// ══════════════════════════════════════════════
// Shared band→result-image mapping (also used on the review screen so
// the same funny/celebratory picture that appears right after
// submitting still shows up when reopening the review later, e.g.
// via "Xem lại" from the test list or history).
function resultImgSrcForBand(band) {
    return band >= 7.5 ? 'img/above7.5.jpg'
         : band >= 6.0 ? 'img/band_6_7.jpg'
         : band >= 5.0 ? 'img/listening_readingbelow60%25.jpg'
         : band >= 4.0 ? 'img/listening_readingbelow50%25.jpg'
         : band >= 2.0 ? 'img/listening_readingbelow40%25.jpg'
         : band >= 1.0 ? 'img/listening_readingbelow30%25.jpg'
         :                'img/listening_readingbelow20%25.jpg';
}

function goToReview() {
    const r = state.reviewResult;
    if (!r) return;
    // Shareable review URL (mirrors reading.html?review=). Don't stack a
    // duplicate entry when we're already on this attempt's ?review= URL
    // (i.e. arrived via a deep link, which replaceState'd it already).
    if (r.attemptId && new URLSearchParams(location.search).get('review') !== String(r.attemptId)) {
        history.pushState({ screen: 'review', reviewId: r.attemptId }, '', `?review=${r.attemptId}`);
    }
    state.isReview = true;
    state.partIdx = 0;
    for (const k in partHlCacheRv) delete partHlCacheRv[k];

    // Restore highlights made while taking this exam (and in earlier
    // visits to this review) — the server copy (r.highlights) or this
    // browser's, whichever is newer (see _saveListeningHighlightsToStorage).
    const savedHl = window.HighlightStore.choose('listening', r.attemptId,
        window.HighlightStore.readLocal(_lHlStorageKey(r.attemptId)), r.highlights);
    _pendingHl = { ...(savedHl?.parts || {}) };

    document.getElementById('review-title').textContent = r.testName;
    document.getElementById('review-band-badge').textContent = `Band Score: ${r.bandScore.toFixed(1)}`;
    window.setTimeBadge?.('review-time-badge', r.timeTaken);
    const reviewImgEl = document.getElementById('review-result-img');
    if (reviewImgEl) { reviewImgEl.src = resultImgSrcForBand(r.bandScore || 0); reviewImgEl.style.display = ''; }
    state.audioPartIdx = null;
    _partAudioPos = {};
    if (_hasPartAudio(true)) {
        audio.src = '';
        _loadPartAudio(0, true);
    } else {
        audio.src = r.audioUrl || '';
        audio.load();
        audio.currentTime = 0;
    }
    const firstSection = (r.sections || [])[0];
    renderTranscript(firstSection?.transcript || '');
    buildPartTabs('part-tabs-rv', true);
    renderReviewPartQuestions(0);
    _applyPendingHl(0, document.getElementById('transcript-body'), document.getElementById('review-questions-inner'));
    renderQNav('q-nav-grid-rv', true);
    setupDictionaryDouble('transcript-body', 'listening', _ltDictGate);
    setupDictionaryDouble('review-questions-inner', 'listening', _ltDictGate);
    // Auto-enable Dict lookup on entering review — the transcript's
    // own hint text ("Double-click để tra từ") promises this works
    // immediately, and leaving Highlight mode's crosshair cursor
    // dangling here would be the actual leftover-state problem, not
    // Dict (which has no such visual side effect to clean up).
    setTool('dict', true);
    showScreen('review');

    // Built from r.sections (not the flatter r.questions) so each
    // question carries its group's tableConfig/noteConfig/
    // summaryConfig/etc. — needed for findTemplateContext to find
    // the real gap-fill sentence, see _ltGetAllQs.
    const _reviewAllQs = (r.sections || []).flatMap(_ltGetAllQs);
    _mountInlineReviews('listening', r.attemptId, _reviewAllQs);
}

// Shown atop the review question list when the server withheld the
// answer key (correctAnswer + explanation) — account no longer has
// full access. Scores / band / right-wrong are still shown.
function _ltReviewLockedNotice() {
    return `<div class="review-locked-notice" style="background:#fef3c7;border:1px solid #fcd34d;color:#92400e;border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:13px;line-height:1.5">
                🔒 Bản dùng thử / Premium đã hết hạn — bạn vẫn xem được kết quả và câu đúng/sai, nhưng <strong>đáp án đúng và giải thích chi tiết</strong> chỉ dành cho tài khoản Premium.
            </div>`;
}

function renderReviewPartQuestions(partIdx) {
    const r = state.reviewResult;
    if (!r) return;
    const section = getSortedSections(true)[partIdx];
    if (!section) return;

    const reviewMap = {};
    (r.questions || []).forEach(q => { reviewMap[q.questionNumber] = q; });

    let html = (state.reviewAnswerKeyWithheld ? _ltReviewLockedNotice() : '') + `
                <div class="section-header-card">
                    <div class="section-part-label">Part ${section.partNumber}</div>
                    <div class="section-title-text">${escHtml(section.title)}</div>
                    ${section.description ? `<div class="section-desc">${escHtml(section.description)}</div>` : ''}
                    <div class="section-range">Câu ${section.questionRange?.start ?? ''}–${section.questionRange?.end ?? ''}</div>
                </div>`;

    (section.questionGroups || []).forEach((group, gi) => {
        const groupWithReview = {
            ...group,
            questions: group.questions.map(q => { const r = reviewMap[q.questionNumber]; return r ? { ...q, ...r } : q; })
        };
        html += renderQuestionGroup(groupWithReview, gi, true);
    });

    document.getElementById('review-questions-inner').innerHTML = html;
}

function renderTranscript(transcript) {
    const tb = document.getElementById('transcript-body');
    if (!transcript) { tb.innerHTML = '<p class="ls-transcript-empty">Chưa có transcript.</p>'; return; }
    tb.innerHTML = transcript.split('\n').map(line =>
        line.trim() ? `<p style="margin-bottom:8px">${line}</p>` : '<br>'
    ).join('');
}

// ══════════════════════════════════════════════
// INPUT RENDERERS
// ══════════════════════════════════════════════
function renderRadioOpts(num, opts, ua, ca, isReview) {
    const LETTERS = ['A', 'B', 'C', 'D', 'E'];
    // Chuẩn hoá: so sánh chỉ bằng chữ cái (A/B/C/D), bỏ qua text đầy đủ
    const uaNorm = (ua || '').trim().toUpperCase();
    const caNorm = (ca || '').trim().toUpperCase();
    return `<div class="q-options">${opts.map((opt, idx) => {
        const letter = LETTERS[idx] || String.fromCharCode(65 + idx);
        // Strip letter prefix nếu admin nhập "A text..." hoặc "A. text..."
        const displayText = opt.replace(/^[A-Ea-e][\.\)]\s*|^[A-Ea-e]\s+/, '').trim() || opt;
        let cls = '';
        if (isReview) {
            if (letter === caNorm) cls = 'correct-ans';
            else if (letter === uaNorm && letter !== caNorm) cls = 'wrong-ans';
        } else {
            if (letter === uaNorm) cls = 'selected';
        }
        return `<div class="radio-opt ${cls}" data-qnum="${num}" data-value="${letter}" ${isReview ? '' : `onclick="pickRadio(${num}, '${letter}')"`}>
                    <span class="radio-dot"></span><label><strong>${letter}.</strong> ${escHtml(displayText)}</label>
                </div>`;
    }).join('')}</div>`;
}

function renderCheckboxOpts(num, opts, ua, ca, isReview, count) {
    let uaArr = [], caArr = [];
    try { uaArr = JSON.parse(ua || '[]'); } catch { }
    try { caArr = JSON.parse(ca || '[]'); } catch { }
    // Normalize to uppercase letters for comparison
    const normLetter = str => str ? str.trim().charAt(0).toUpperCase() : '';
    const caLetters = caArr.map(x => normLetter(x));
    const uaLetters = uaArr.map(x => normLetter(x));
    return `
                <div class="checkbox-hint">Chọn <strong>${count}</strong> đáp án đúng</div>
                <div class="checkbox-opts">${opts.map((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        let cls = '';
        if (isReview) {
            if (caLetters.includes(letter)) cls = 'correct-ans';
            else if (uaLetters.includes(letter) && !caLetters.includes(letter)) cls = 'wrong-ans';
        } else {
            if (uaLetters.includes(letter)) cls = 'selected';
        }
        return `<div class="checkbox-opt ${cls}" data-qnum="${num}" data-value="${letter}" data-count="${count}" ${isReview ? '' : `onclick="toggleCheckbox(${num}, '${letter}', ${count})"`}>
                        <span class="check-box"></span><label><strong>${letter}</strong> ${escHtml(opt.replace(/^[A-Ga-g]\s+/, ''))}</label>
                    </div>`;
    }).join('')}</div>`;
}

function renderFillBlank(num, ua, ca, isReview) {
    if (isReview) {
        const alts = ca.split(/\s*\/\s*/).map(s => s.toLowerCase().trim()).filter(Boolean);
        const ok = alts.length > 0 && alts.some(a => a === ua.toLowerCase().trim());
        const cls = ok ? 'inline-correct' : ua ? 'inline-wrong' : 'inline-skip';
        return `<span class="inline-answer ${cls}" style="display:inline-block;min-width:80px;padding:4px 14px;border-radius:6px;font-size:14px;font-weight:600;margin:4px 0">${escHtml(ua || '–')}</span>`;
    }
    return `<input id="fi-${num}" class="fill-input" type="text"
                placeholder="Nhập câu trả lời..." value="${escAttr(ua)}" autocomplete="off"
                oninput="saveText(${num}, this.value)" />`;
}

// Blank marker in a typed-answer question's text: "_____", "…" or "[blank]".
const INLINE_BLANK_RE = /_{2,}|…|\[blank\]/i;

// Question text with the answer box spliced into its blank — same
// escape-then-splice order as renderInlineDrop below.
function renderInlineFill(num, questionText, ua, ok, isReview) {
    const boxHtml = isReview
        ? `<span class="inline-answer ${ok ? 'inline-correct' : ua ? 'inline-wrong' : 'inline-skip'}">${escHtml(ua || '–')}</span>`
        : `<input id="fi-${num}" class="fill-input-inline" type="text"
                    value="${escAttr(ua)}" placeholder="..." autocomplete="off"
                    oninput="saveText(${num}, this.value)" />`;
    return escHtml(questionText || '').replace(INLINE_BLANK_RE, boxHtml);
}

function renderInlineDrop(num, questionText, ua, ca, isReview) {
    // Same accepted-alternates split as renderFillBlank (ca can be
    // "colour/color") — without it, an answer the backend already
    // graded correct rendered wrong-drop here, visibly contradicting
    // the "✓ Đúng" shown by the standalone question block below it.
    const cls = isReview
        ? (ca.split(/\s*\/\s*/).map(s => s.toLowerCase().trim()).filter(Boolean).includes(ua.toLowerCase().trim())
            ? 'correct-drop' : ua ? 'wrong-drop' : 'skip-drop')
        : '';
    const dzHtml = `<div class="drop-zone ${ua ? 'filled' : ''} ${isReview ? cls : ''}" data-qnum="${num}"
                ${isReview ? '' : `ondragover="dzOver(event)" ondrop="dzDrop(event,${num})" onclick="dzClick(event,${num})"`}>
                ${ua ? `${escHtml(ua)}<span class="clear-drop" onclick="clearDz(event,${num})"><i class="fas fa-times"></i></span>` : '&nbsp;&nbsp;kéo vào&nbsp;&nbsp;'}
            </div>`;
    // Escape the surrounding admin-authored text first, then splice in
    // the (already-safe, self-built) drop-zone markup at the blank
    // marker — this must happen in that order so dzHtml's real tags
    // don't get escaped along with the text around them.
    const safeText = escHtml(questionText || '');
    const filled = safeText.replace(/_{2,}|\[blank\]/i, dzHtml);
    return `<div class="q-text" style="margin-top:-6px">${filled !== safeText ? filled : safeText + ' ' + dzHtml}</div>`;
}

function renderWordBankHtml(words, startNum) {
    return `<div style="margin-bottom:16px">
                <div class="word-bank-label">📦 Word Bank – kéo thả vào ô trống</div>
                <div class="word-bank" id="bank-${startNum}">
                    ${words.map(w => `<div class="word-chip" data-word="${escAttr(w)}" draggable="true">${escHtml(w)}</div>`).join('')}
                </div>
            </div>`;
}

// ══════════════════════════════════════════════
// ANSWER HANDLERS
// ══════════════════════════════════════════════
function pickRadio(qnum, value) {
    if (state._justHighlighted) return;
    state.answers[qnum] = value;
    document.getElementById(`qi-${qnum}`)?.querySelectorAll('.radio-opt')
        .forEach(o => o.classList.toggle('selected', o.dataset.value === value));
    updateQNav(); updateFooter(); saveExamToStorage();
}

function toggleCheckbox(qnum, value, maxCount) {
    if (state._justHighlighted) return;
    let arr = [];
    try { arr = JSON.parse(state.answers[qnum] || '[]'); } catch { }
    if (arr.includes(value)) { arr = arr.filter(v => v !== value); }
    else {
        if (arr.length >= maxCount) { toast(`Chỉ được chọn tối đa ${maxCount} đáp án`, 'info'); return; }
        arr.push(value);
    }
    arr.sort();
    state.answers[qnum] = JSON.stringify(arr);
    document.getElementById(`qi-${qnum}`)?.querySelectorAll('.checkbox-opt')
        .forEach(o => o.classList.toggle('selected', arr.includes(o.dataset.value)));
    updateQNav(); updateFooter(); saveExamToStorage();
}

// Toggle đáp án cho nhóm multi-answer-group (Choose TWO letters)
// firstNum: số câu đầu cluster, lastNum: số câu cuối
function toggleMultiAnswer(firstNum, letter, maxCount, lastNum) {
    let arr = [];
    try { arr = JSON.parse(state.answers[firstNum] || '[]'); } catch { }

    if (arr.includes(letter)) {
        arr = arr.filter(v => v !== letter);
    } else {
        if (arr.length >= maxCount) {
            toast(`Chỉ chọn tối đa ${maxCount} đáp án`, 'info');
            return;
        }
        arr.push(letter);
    }
    arr.sort();
    const val = JSON.stringify(arr);

    // Lưu cùng giá trị cho TẤT CẢ câu trong cluster
    for (let n = firstNum; n <= lastNum; n++) {
        state.answers[n] = val;
    }

    // Cập nhật UI
    document.querySelectorAll(`[data-cluster="${firstNum}"]`).forEach(o =>
        o.classList.toggle('selected', arr.includes(o.dataset.value))
    );
    updateQNav(); updateFooter(); saveExamToStorage();
}

function saveText(qnum, value) {
    state.answers[qnum] = value.trim();
    updateQNav(); updateFooter(); saveExamToStorage();
}

function restoreAnswer(q) {
    const num = q.questionNumber;
    const saved = state.answers[num];
    if (!saved) return;

    // Radio (multiple-choice)
    if (q.type === 'multiple-choice') {
        const container = document.getElementById(`qi-${num}`);
        if (container) {
            container.querySelectorAll('.radio-opt').forEach(o => {
                o.classList.toggle('selected', o.dataset.value === saved);
            });
        }
        return;
    }

    // Checkbox
    if (q.type === 'checkbox') {
        const container = document.getElementById(`qi-${num}`);
        if (container) {
            let arr = []; try { arr = JSON.parse(saved); } catch {}
            container.querySelectorAll('.checkbox-opt').forEach(o => {
                o.classList.toggle('selected', arr.includes(o.dataset.value));
            });
        }
        return;
    }

    if (['sentence-completion', 'matching'].includes(q.type)) {
        const dz = document.querySelector(`.drop-zone[data-qnum="${num}"]`);
        if (dz) { dz.classList.add('filled'); dz.innerHTML = `${escHtml(saved)}<span class="clear-drop" onclick="clearDz(event,${num})"><i class="fas fa-times"></i></span>`; }
    } else if (['fill-blank', 'map-labelling', 'matching-info'].includes(q.type)) {
        const inp = document.getElementById(`fi-${num}`);
        if (inp) inp.value = saved;
    }
    // matching-options / sentence-endings drop zones
    const moDz = document.querySelector(`.rq-mo-drop[data-qnum="${num}"]`);
    if (moDz) {
        const groupId = moDz.dataset.groupid;
        _ltRefreshMOZone(num, groupId);
        _ltRefreshGroupChips(groupId);
    }
    // summary-completion drop zones
    const scDz = document.querySelector(`.sc-drop[data-qnum="${num}"]`);
    if (scDz) {
        const groupId = scDz.dataset.groupid;
        _ltRefreshSCZone(num, groupId);
        _ltRefreshGroupChips(groupId);
    }
}

// ══════════════════════════════════════════════
// DRAG & DROP – matching-options / summary
// ══════════════════════════════════════════════
let _ltDragVal = '';
function ltDragStart(e, val) { _ltDragVal = val; e.dataTransfer.effectAllowed = 'copy'; }

function _ltRefreshGroupChips(groupId) {
    const usedVals = new Set();
    // Gom tất cả drop-zones của group (rq-mo-drop + sc-drop + drop-zone cũ)
    document.querySelectorAll(`.rq-mo-drop[data-groupid="${groupId}"],.sc-drop[data-groupid="${groupId}"],.drop-zone[data-groupid="${groupId}"]`).forEach(dz => {
        const ans = state.answers[parseInt(dz.dataset.qnum)];
        if (ans) usedVals.add(ans);
    });
    // Cập nhật matching option rows (mo-opt-row) và summary chips (drag-chip)
    document.querySelectorAll(`[data-groupid="${groupId}"].mo-opt-row,[data-groupid="${groupId}"].drag-chip`).forEach(el => {
        const isUsed = el.dataset.reuse === '1' ? false : usedVals.has(el.dataset.value);
        el.classList.toggle('mo-opt-used', isUsed);
        el.classList.toggle('used', isUsed);
    });
}

function ltDropMO(e, qNum, groupId) {
    e.preventDefault();
    const val = _ltDragVal || e.dataTransfer.getData('text');
    if (!val) return;
    state.answers[qNum] = val;
    _ltRefreshMOZone(qNum, groupId);
    _ltRefreshGroupChips(groupId);
    updateQNav(); updateFooter(); saveExamToStorage();
}
function ltClickMOChip(letter, groupId) {
    const optRow = document.querySelector(`.mo-opt-row[data-groupid="${groupId}"][data-value="${letter}"]`);
    if (optRow && optRow.dataset.reuse === '0' && optRow.classList.contains('mo-opt-used')) return;
    const emptyDz = document.querySelector(`.rq-mo-drop[data-groupid="${groupId}"]:not(.filled)`);
    if (!emptyDz) return;
    const qNum = parseInt(emptyDz.dataset.qnum);
    state.answers[qNum] = letter;
    _ltRefreshMOZone(qNum, groupId);
    _ltRefreshGroupChips(groupId);
    updateQNav(); updateFooter(); saveExamToStorage();
}
function _ltRefreshMOZone(qNum, groupId) {
    const dz = document.querySelector(`.rq-mo-drop[data-qnum="${qNum}"]`);
    if (!dz) return;
    const letter = state.answers[qNum] || '';
    if (!letter) {
        dz.classList.remove('filled');
        dz.innerHTML = `<span class="mo-ans-placeholder">?</span>`;
        return;
    }
    dz.classList.add('filled');
    dz.innerHTML = `<span class="mo-ans-letter">${escHtml(letter)}</span><span class="clear-drop" onclick="event.stopPropagation();ltClearDragDrop(${qNum},'${groupId}')"><i class="fas fa-times"></i></span>`;
}

function ltDropSC(e, qNum, groupId) {
    e.preventDefault();
    const val = _ltDragVal || e.dataTransfer.getData('text');
    if (!val) return;
    state.answers[qNum] = val;
    _ltRefreshSCZone(qNum, groupId);
    _ltRefreshGroupChips(groupId);
    updateQNav(); updateFooter(); saveExamToStorage();
}
function ltClickSCChip(word, groupId) {
    const chips = document.querySelectorAll(`.sc-chip[data-groupid="${groupId}"]`);
    const matchingChip = Array.from(chips).find(c => c.dataset.value === word);
    if (matchingChip && matchingChip.dataset.reuse === '0' && matchingChip.classList.contains('used')) return;
    const emptyDz = document.querySelector(`.sc-drop[data-groupid="${groupId}"]:not(.filled)`);
    if (!emptyDz) return;
    const qNum = parseInt(emptyDz.dataset.qnum);
    state.answers[qNum] = word;
    _ltRefreshSCZone(qNum, groupId);
    _ltRefreshGroupChips(groupId);
    updateQNav(); updateFooter(); saveExamToStorage();
}
function _ltRefreshSCZone(qNum, groupId) {
    const dz = document.querySelector(`.sc-drop[data-qnum="${qNum}"]`);
    if (!dz) return;
    const word = state.answers[qNum] || '';
    if (!word) {
        dz.classList.remove('filled', 'dragover');
        dz.textContent = 'Thả vào';
        return;
    }
    dz.classList.add('filled');
    dz.innerHTML = `${escHtml(word)}<span class="clear-drop" onclick="ltClearDragDrop(${qNum},'${groupId}')"><i class="fas fa-times"></i></span>`;
}

function ltClearDragDrop(qNum, groupId) {
    delete state.answers[qNum];
    const dz = document.querySelector(`.rq-mo-drop[data-qnum="${qNum}"],.sc-drop[data-qnum="${qNum}"],.drop-zone[data-qnum="${qNum}"]`);
    if (dz) {
        dz.classList.remove('filled');
        dz.innerHTML = dz.classList.contains('sc-drop') ? 'Thả vào' : '<span class="mo-ans-placeholder">?</span>';
    }
    _ltRefreshGroupChips(groupId);
    updateQNav(); updateFooter(); saveExamToStorage();
}

// ══════════════════════════════════════════════
// DRAG & DROP – word bank (sentence-completion/matching)
// ══════════════════════════════════════════════
function setupDragDrop(container) {
    container.querySelectorAll('.word-chip:not(.used)').forEach(chip => {
        chip.addEventListener('dragstart', e => { state.dragItem = chip.dataset.word; chip.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
        chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
    });
}

function dzOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }

function dzDrop(e, qnum) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const word = state.dragItem || e.dataTransfer.getData('text');
    if (word) placeAnswer(qnum, word);
}

function dzClick(e, qnum) {
    if (e.target.classList.contains('clear-drop')) return;
    const section = (state.currentTest?.sections || [])[state.partIdx];
    let wordBank = [];
    for (const g of (section?.questionGroups || [])) {
        const q = g.questions.find(q => q.questionNumber === qnum);
        if (q?.wordBank?.length) { wordBank = q.wordBank; break; }
    }
    if (!wordBank.length) return;
    const existing = document.getElementById('word-picker');
    if (existing) existing.remove();
    const rect = e.currentTarget.getBoundingClientRect();
    const picker = document.createElement('div');
    picker.id = 'word-picker';
    Object.assign(picker.style, {
        position: 'fixed', top: (rect.bottom + 6) + 'px', left: rect.left + 'px',
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
        padding: '12px', boxShadow: '0 8px 24px rgba(0,0,0,.15)', zIndex: '500',
        display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '300px'
    });
    const usedElsewhere = new Set(
        Object.entries(state.answers)
            .filter(([k]) => Number(k) !== qnum)
            .map(([, v]) => v)
    );
    wordBank.filter(w => !usedElsewhere.has(w)).forEach(w => {
        const chip = document.createElement('div');
        chip.className = 'word-chip'; chip.textContent = w;
        chip.onclick = () => { placeAnswer(qnum, w); picker.remove(); };
        picker.appendChild(chip);
    });
    (document.fullscreenElement || document.body).appendChild(picker);
    setTimeout(() => document.addEventListener('click', function closeP(ev) {
        if (!picker.contains(ev.target)) { picker.remove(); document.removeEventListener('click', closeP); }
    }), 0);
}

function updateDropZone(qnum) {
    const dz = document.querySelector(`.drop-zone[data-qnum="${qnum}"]`);
    if (!dz) { renderPartQuestions(state.partIdx); return; }
    const ua = state.answers[qnum] || '';
    if (ua) {
        dz.classList.add('filled');
        dz.innerHTML = `${escHtml(ua)}<span class="clear-drop" onclick="clearDz(event,${qnum})"><i class="fas fa-times"></i></span>`;
    } else {
        dz.classList.remove('filled');
        dz.innerHTML = '&nbsp;&nbsp;kéo vào&nbsp;&nbsp;';
    }
}

function clearDz(e, qnum) {
    e.stopPropagation();
    delete state.answers[qnum];
    saveExamToStorage();
    updateDropZone(qnum);
    refreshWordChips();
    updateQNav(); updateFooter();
}

function placeAnswer(qnum, word) {
    state.answers[qnum] = word;
    updateDropZone(qnum);
    refreshWordChips();
    updateQNav(); state.dragItem = null; updateFooter(); saveExamToStorage();
}

function refreshWordChips() {
    const used = new Set(Object.values(state.answers));
    document.querySelectorAll('.word-chip[data-word]').forEach(c => {
        c.classList.toggle('used', used.has(c.dataset.word));
    });
}

// ══════════════════════════════════════════════
// Q NAV
// ══════════════════════════════════════════════
function getAllQuestions(isReview) {
    if (isReview) return state.reviewResult?.questions || [];
    return getSortedSections(false)
        .flatMap(s => (s.questionGroups || []).flatMap(g => g.questions))
        .sort((a, b) => a.questionNumber - b.questionNumber);
}

function renderQNav(gridId, isReview) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    const sections = getSortedSections(isReview);
    const rvMap = {};
    if (isReview) (state.reviewResult?.questions || []).forEach(q => { rvMap[q.questionNumber] = q; });
    const parts = sections.map(s => {
        const qs = (s.questionGroups || []).flatMap(g => g.questions || [])
            .sort((a, b) => a.questionNumber - b.questionNumber);
        const btns = qs.map(q => {
            const num = q.questionNumber;
            let cls = '';
            if (isReview) { const r = rvMap[num]; cls = r?.isCorrect ? 'correct' : (r?.userAnswer ? 'wrong' : 'skipped'); }
            else cls = state.answers[num] ? 'answered' : '';
            return `<button class="q-nav-btn ${cls}" id="qnb-${num}" onclick="scrollToQ(${num})">${num}</button>`;
        }).join('');
        return `<span class="q-nav-section-label">S${s.partNumber}</span>${btns}`;
    });
    grid.innerHTML = parts.join('');
    if (!isReview && gridId === 'q-nav-grid') _mountCdFooterLs();
}

// Computer-delivered-IELTS footer for the exam screen (see
// js/shared/cd-footer.js). Its buttons use cdq-N ids so they never
// collide with the (hidden) sidebar grid's qnb-N buttons.
function _mountCdFooterLs() {
    const el = document.getElementById('cd-footer-ls');
    if (!el || !window.CDFooter) return;
    const sections = getSortedSections(false);
    window.CDFooter.mount(el, {
        parts: sections.map(s => ({
            label: `Part ${s.partNumber}`,
            questions: (s.questionGroups || []).flatMap(g => g.questions || [])
                .map(q => q.questionNumber).sort((a, b) => a - b),
        })),
        activePart: state.partIdx || 0,
        btnId: n => `cdq-${n}`,
        isAnswered: n => isAnswered(n),
        onJump: n => { scrollToQ(n); _markCurrentQuestionLs(n); },
        onSubmit: confirmSubmit,
    });
    if (!el._cdTracking) {
        el._cdTracking = true;
        const panel = document.getElementById('questions-panel');
        const onTouch = e => {
            const host = e.target.closest('[data-qnum], [id^="qi-"]');
            const n = host ? parseInt(host.dataset.qnum || host.id.slice(3), 10) : NaN;
            if (!n) return;
            window.CDFooter.setCurrent(n);
            _markCurrentQuestionLs(n);
        };
        panel?.addEventListener('focusin', onTouch);
        panel?.addEventListener('click', onTouch);
    }
}
function _markCurrentQuestionLs(n) {
    document.querySelectorAll('#questions-panel .cd-current').forEach(x => x.classList.remove('cd-current'));
    const el = document.getElementById(`qi-${n}`) || document.getElementById(`q${n}`);
    if (el) el.classList.add('cd-current');
}
function _renderCdPartHeaderLs(idx) {
    const s = getSortedSections(false)[idx];
    const t = document.getElementById('cd-part-title-ls');
    const sub = document.getElementById('cd-part-sub-ls');
    if (!s || !t || !sub) return;
    t.textContent = `Part ${s.partNumber}`;
    const r = s.questionRange || {};
    sub.textContent = (r.start && r.end)
        ? `Listen and answer questions ${r.start}–${r.end}`
        : 'Listen and answer the questions';
}

function isAnswered(qnum) {
    const val = state.answers[qnum];
    if (val) {
        try { const arr = JSON.parse(val); return Array.isArray(arr) ? arr.length > 0 : !!val; } catch { }
        return !!val;
    }
    // Multi-answer-group: câu 2..N không có key riêng, answer lưu ở firstNum của cluster
    // Tìm cluster element chứa câu này
    const clusterEl = [...document.querySelectorAll('[data-cluster-start]')].find(el => {
        const s = parseInt(el.dataset.clusterStart);
        const e = parseInt(el.dataset.clusterEnd);
        return qnum >= s && qnum <= e;
    });
    if (clusterEl) {
        const firstNum = parseInt(clusterEl.dataset.clusterStart);
        const clusterVal = state.answers[firstNum];
        if (clusterVal) {
            try { const arr = JSON.parse(clusterVal); return Array.isArray(arr) ? arr.length > 0 : !!clusterVal; } catch { }
            return !!clusterVal;
        }
    }
    return false;
}

function updateQNav() {
    getAllQuestions(false).forEach(q => {
        const btn = document.getElementById(`qnb-${q.questionNumber}`);
        if (!btn) return;
        let answered = isAnswered(q.questionNumber);
        // Với multi-answer-group: câu có thể được lưu ở firstNum của cluster
        // isAnswered đã handle qua state.answers[num]
        btn.className = `q-nav-btn ${answered ? 'answered' : ''}`;
    });
    if (window.CDFooter && window.CDFooter.isMounted()) window.CDFooter.refresh();
}

function scrollToQ(num) {
    // Nếu câu thuộc part khác → switch part trước
    const sections = getSortedSections(state.isReview);
    let partIdx = sections.findIndex(s =>
        s.questionRange && num >= s.questionRange.start && num <= s.questionRange.end
    );
    if (partIdx < 0) {
        // questionRange missing/stale on this section (known to happen —
        // see b2affd66) silently broke jump-to-question across parts:
        // findIndex above returned -1, needSwitch stayed false, and
        // switchPart() was never called, leaving whichever part was
        // already on screen "stuck". Fall back to scanning each
        // section's actual authored question numbers instead of
        // trusting the range metadata (same approach reading-v2.js
        // already uses via getAllQuestionsFromPassage).
        partIdx = sections.findIndex(s =>
            (s.questionGroups || []).some(g => (g.questions || []).some(q => q.questionNumber === num))
        );
    }
    const needSwitch = partIdx >= 0 && partIdx !== state.partIdx;
    if (needSwitch) {
        switchPart(partIdx, state.isReview);
    }
    // Dùng requestAnimationFrame để chờ DOM render xong sau switchPart
    const doScroll = () => {
        // 1. Standalone question (matching, plain, map, mo-q-row)
        let el = document.getElementById(`qi-${num}`);
        if (!el && state.isReview) {
            // 2a. Review inline: note-form / bullet / table / summary inline answer
            const rv = document.getElementById(`rv-q${num}`);
            if (rv) el = rv.closest('.note-line, .bullet-item, td, .rq-summary-text') || rv;
        }
        if (!el) {
            // 2b. Exam inline fill-blank: note-form / bullet / table
            const fi = document.getElementById(`fi-${num}`);
            if (fi) {
                el = fi.closest('.note-line, .bullet-item, td') ||
                    fi.closest('.group-note-form, .group-bullet-list, .group-table-wrap') || fi;
            }
        }
        if (!el) {
            // 2c. Exam inline wrap (q${num} id added by resolvePlaceholders)
            el = document.getElementById(`q${num}`);
        }
        if (!el) {
            // 3. Multi-answer cluster
            document.querySelectorAll('[data-cluster-start]').forEach(c => {
                const s = parseInt(c.dataset.clusterStart);
                const e = parseInt(c.dataset.clusterEnd);
                if (num >= s && num <= e) el = c;
            });
        }
        if (!el) return;
        // Scroll element vào view
        const panelId = state.isReview ? 'review-questions-panel' : 'questions-panel';
        const panel = document.getElementById(panelId);
        if (panel) {
            const panelRect = panel.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            // Tính offset: 16px margin từ top của panel (trừ sticky nav trong review)
            const stickyBar = panel.querySelector('.review-qnav-bar');
            const stickyH = stickyBar ? stickyBar.offsetHeight + 8 : 16;
            panel.scrollTop += (elRect.top - panelRect.top) - stickyH;
        } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // Flash highlight để người dùng dễ nhận ra câu vừa nhảy tới
        el.classList.remove('q-scroll-flash');
        void el.offsetWidth; // reflow để reset animation
        el.classList.add('q-scroll-flash');
        setTimeout(() => el.classList.remove('q-scroll-flash'), 950);
    };
    if (needSwitch) {
        // Double rAF: chờ render 2 frame sau khi switch
        requestAnimationFrame(() => requestAnimationFrame(doScroll));
    } else {
        requestAnimationFrame(doScroll);
    }
}

function updateFooter() {
    const allQs = getAllQuestions(false);
    const total = allQs.length;
    const answered = allQs.filter(q => isAnswered(q.questionNumber)).length;
    document.getElementById('footer-answered').textContent = answered;
    document.getElementById('footer-total').textContent = total;
    document.getElementById('modal-answered').textContent = answered;
    document.getElementById('modal-total').textContent = total;
    const unanswered = total - answered;
    document.getElementById('modal-warning').innerHTML = unanswered > 0 ? `<i class="fas fa-exclamation-triangle"></i> Còn ${unanswered} câu chưa trả lời.` : '';
    const progAns = document.getElementById('prog-answered');
    const progTot = document.getElementById('prog-total');
    if (progAns) progAns.textContent = answered;
    if (progTot) progTot.textContent = total;
    const pill = document.getElementById('exam-progress-pill');
    if (pill) {
        const pct = total > 0 ? (answered / total) * 100 : 0;
        if (pct === 100) { pill.style.background = '#ecfdf5'; pill.style.color = '#065f46'; pill.style.borderColor = '#6ee7b7'; }
        else if (pct > 50) { pill.style.background = '#fffbeb'; pill.style.color = '#92400e'; pill.style.borderColor = '#fde68a'; }
        else { pill.style.background = ''; pill.style.color = ''; pill.style.borderColor = ''; }
    }
}

// ══════════════════════════════════════════════
// SUBMIT
// ══════════════════════════════════════════════
function confirmSubmit() { updateFooter(); openModal('modal-submit'); }

// "Check your answers" window after the audio finishes, then a
// forced auto-submit — mirrors reading-v2.js's time's-up auto-submit
// for the 60-minute Reading clock. Full Mock Test gets 2 minutes,
// Test Simulation (full test and "lẻ" part) 30 seconds; Practice has
// no timer. A manual submit at any point short-circuits straight to
// submitExam()/submitLTPractice(), which clear this timer themselves.
const LISTENING_REVIEW_SECONDS = 2 * 60;
const SIMULATION_REVIEW_SECONDS = 30;
let _reviewTimer = null;

function _startListeningReviewCountdown(seconds, onTimeUp) {
    if (_reviewTimer) return;
    let secondsLeft = seconds;
    _renderReviewBanner(secondsLeft);
    _reviewTimer = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
            _cancelListeningReviewCountdown();
            onTimeUp();
        } else {
            _renderReviewBanner(secondsLeft);
        }
    }, 1000);
}

function _cancelListeningReviewCountdown() {
    if (_reviewTimer) { clearInterval(_reviewTimer); _reviewTimer = null; }
    _hideReviewBanner();
}

function _renderReviewBanner(secondsLeft) {
    let el = document.getElementById('listening-review-banner');
    if (!el) {
        el = document.createElement('div');
        el.id = 'listening-review-banner';
        el.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:2147483600;'
            + 'background:#111827;color:#fff;font:700 13px/1.35 inherit;padding:10px 16px;border-radius:10px;'
            + 'box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:90vw;text-align:center;pointer-events:none';
        (document.fullscreenElement || document.body).appendChild(el);
    }
    const m = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const s = String(secondsLeft % 60).padStart(2, '0');
    el.innerHTML = `<i class="fas fa-clock"></i> Audio đã kết thúc — kiểm tra lại đáp án, tự nộp bài sau ${m}:${s}`;
    el.style.background = secondsLeft <= 10 ? '#b91c1c' : '#111827';
}

function _hideReviewBanner() {
    const el = document.getElementById('listening-review-banner');
    if (el) el.remove();
}

// Full mock test only: the student clicked through the waiting
// screen shown after Listening was graded — start Reading now.
function continueToReadingFromMock() {
    location.href = window.MockTest.pageUrl('reading', window.MockTest.params().mockId);
}

// Shared by submitExam()'s success path and its timeout-retry recovery
// path (fetches the same shape from GET /listening/history/:attemptId
// when a resubmit is correctly rejected because the exam was actually
// already saved server-side).
function _renderExamResult(r, answerKeyWithheld) {
    state.reviewResult = r;
    state.reviewAnswerKeyWithheld = !!answerKeyWithheld;
    state.submitted = true;
    // refresh test list để cập nhật trạng thái đã làm — bỏ qua ở
    // mock mode vì sắp điều hướng sang trang kỹ năng kế tiếp ngay.
    if (!_mockMode) {
        _testListCache = null; // force a fresh fetch so the new "done" status isn't stale
        loadTestList();
    }
    document.getElementById('result-band').textContent = r.bandScore.toFixed(1);
    document.getElementById('result-total').textContent = `${r.correctCount}/${r.totalQuestions || 40} câu đúng`
        + (r.parts && r.parts.length ? ` · Section ${r.parts.join(', ')} (band quy đổi theo 40 câu)` : '');
    document.getElementById('r-correct').textContent = r.correctCount;
    document.getElementById('r-wrong').textContent = r.wrongCount;
    document.getElementById('r-skip').textContent = r.skippedCount;

    const band = r.bandScore || 0;

    // Result image (full listening test only — section practice uses inline ls-result-bar)
    const imgEl = document.getElementById('result-img');
    if (imgEl) { imgEl.src = resultImgSrcForBand(band); imgEl.style.display = ''; }

    // Message (funny/sarcastic for very low scores)
    const isLow = band < 5.0;
    const resultEmojiEl = document.getElementById('result-emoji');
    resultEmojiEl.textContent = band >= 7 ? '🎉' : band >= 5.5 ? '💪' : '📚';
    if (isLow) {
        const funnyMsgs = [
            'Hmm, hôm nay tai không muốn làm việc à? 😅 Nghe lại nhiều lần, tốc độ sẽ quen thôi!',
            'Lần này nghe hơi... trật nhỉ 🎧 Luyện shadowing mỗi ngày, tuần sau sẽ khác liền!',
            'Band này thấp hơn cả giọng hát của mình 🎤 Nhưng không sao, cứ luyện là lên!',
        ];
        document.getElementById('result-msg').textContent = funnyMsgs[Math.floor(Math.random() * funnyMsgs.length)];
    } else {
        document.getElementById('result-msg').textContent = getBandMsg(r.bandScore);
    }
    // Lulu reads the message out (js/shared/playful.js); emoji + plain
    // paragraph above stay as the fallback without the mascot.
    const resultMsgEl = document.getElementById('result-msg');
    if (window.Mascot && window.Mascot.react) {
        window.Mascot.react(resultEmojiEl, { band, text: resultMsgEl.textContent, stacked: true });
        resultMsgEl.hidden = true;
    } else {
        resultMsgEl.hidden = false;
    }
    showScreen('result');

    // Full mock test: don't auto-navigate to Reading — record this
    // sub-attempt in the background (advanceWithoutNav still runs
    // stopProctor() + the same 401/retry/pending-recovery handling
    // as advance(), it just doesn't self-navigate on success) and
    // show a waiting screen so Reading's own 60-minute clock only
    // starts once the student clicks through on their own terms.
    if (_mockMode && window.MockTest && window.MockTest.active()) {
        window.MockTest.advanceWithoutNav('listening', state.attemptId);
        const ov = document.getElementById('listening-done-overlay');
        if (ov) { ov.classList.remove('hidden'); (document.fullscreenElement || document.body).appendChild(ov); }
        return;
    }

    if (window.showPostSubmitReminder) window.showPostSubmitReminder({ skill: 'listening', onReview: () => goToReview() });

    // Priority 2C — only fires for a session launched via the
    // Today's Learning popup's "Start" button; normal practice is
    // unaffected (see learning-popups.js's markStart/consumeStart).
    if (window.EWSLearning && window.EWSLearning.consumeStart('listening')) {
        window.EWSLearning.showReviewPopup('listening', {
            emoji: band >= 6.5 ? '🎉' : '📊',
            scoreLabel: `${r.correctCount}/${r.totalQuestions || 40} câu đúng`,
            subLabel: r.bandScore != null ? `Band ${r.bandScore.toFixed(1)}` : '',
            nextAction: r.wrongCount > 0 ? 'Nghe lại các câu sai và xem transcript.' : 'Kết quả tốt — giữ vững nhé!',
            onReview: () => goToReview(),
        });
    }
}

async function submitExam() {
    closeModal('modal-submit');
    if (state.submitted) return;
    state.submitted = true;
    // BUG FIX: used to clearExamStorage() right here, before the submit
    // even reached the server. If that request then failed (network
    // blip, a 401 mid-exam forcing a re-login, a timeout) the local
    // backup was ALREADY gone — the student lost every answer and had
    // to redo the whole test (reported 2026-09). Now mirrors
    // js/reading-v2.js's submitExam(): only cleared once success (or
    // the timeout-recovery path below) is confirmed. window.onbeforeunload
    // also stays armed until then, so a stray reload still warns first.
    clearInterval(_asoTimer);
    _cancelListeningReviewCountdown();
    audio.pause();
    audio.src = '';
    if (state.mode === 'simulation' && window.ExamProctor) window.ExamProctor.stop();
    window.HighlightStore?.flush(); // don't leave the last highlights waiting on the debounce

    // Show loading overlay (works in both normal and fullscreen mode)
    let overlay = document.getElementById('submit-loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'submit-loading-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;';
        overlay.innerHTML = '<div style="width:52px;height:52px;border:5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:submitSpin .8s linear infinite"></div><p style="color:#fff;font-size:16px;font-weight:600;margin:0;text-shadow:0 1px 4px rgba(0,0,0,.4)">Đang nộp bài, vui lòng chờ…</p>';
        if (!document.getElementById('submit-spin-style')) {
            const s = document.createElement('style');
            s.id = 'submit-spin-style';
            s.textContent = '@keyframes submitSpin{to{transform:rotate(360deg)}}';
            document.head.appendChild(s);
        }
        document.body.appendChild(overlay);
    }
    // Nếu đang ở fullscreen, chuyển overlay vào fullscreen element
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (fsEl && !fsEl.contains(overlay)) {
        fsEl.appendChild(overlay);
        overlay.style.position = 'absolute';
    }
    overlay.style.display = 'flex';

    const controller = new AbortController();
    const submitTimeout = setTimeout(() => controller.abort(), 30000);
    try {
        const res = await fetch(`${API}/listening/tests/${state.currentTestId}/submit`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ answers: state.answers, startTime: state.startTime, attemptId: state.attemptId }),
            signal: controller.signal
        });
        clearTimeout(submitTimeout);
        // skipAuthRedirect: a 401 here (session expired mid-exam) must
        // NOT let ApiClient hard-redirect to login right now — see the
        // 401 branch in the catch block below for why.
        const data = await safeJson(res, { skipAuthRedirect: true });
        if (!data.success) throw new Error(data.message);
        clearExamStorage(); // confirmed saved server-side — safe to drop the local backup now
        overlay.style.display = 'none';
        if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
        if (window.showBadgeUnlocked && data.result?.newlyUnlocked?.length) window.showBadgeUnlocked(data.result.newlyUnlocked);
        _renderExamResult(data.result);
    } catch (err) {
        clearTimeout(submitTimeout);
        // A slow/timed-out request can still succeed server-side after the
        // client gives up waiting (see backend/services/listeningService.js's
        // submitTest — attemptId no longer matches an in-progress row once
        // it's completed, so a naive retry used to silently create a
        // duplicate attempt; it now correctly 404s instead). Recover the
        // REAL already-graded result from history rather than just
        // showing "submission failed" when the exam was actually saved.
        if (state.attemptId) {
            try {
                const rres = await fetch(`${API}/listening/history/${state.attemptId}`, { headers: authH() });
                // Same skipAuthRedirect as the submit call above — an
                // expired token 401s this recovery check too.
                const rdata = await safeJson(rres, { skipAuthRedirect: true });
                if (rdata.success && rdata.result) {
                    clearExamStorage(); // it really was saved — safe to drop the local backup now
                    overlay.style.display = 'none';
                    toast('Bài thi đã được nộp trước đó — đang hiện kết quả.', 'info');
                    _renderExamResult(rdata.result, rdata.answerKeyWithheld);
                    return;
                }
            } catch { /* fall through to the generic error below */ }
        }
        overlay.style.display = 'none';

        // BUG FIX (reported 2026-09-11): a 401 here means the session
        // expired mid-exam (Listening + Reading back-to-back in a mock
        // sitting can outlast the token). Before the skipAuthRedirect
        // change above, safeJson()'s ApiClient.handleResponse would
        // immediately window.location.href to login — while, in mock
        // mode, js/shared/mock-test.js's proctor beforeunload listener
        // was STILL ARMED (stopProctor() only ever runs after a
        // successful submit reaches MockTest.advance(), which a failed
        // submit never reaches). That forced navigation tripped the
        // proctor's own beforeunload handler, popping the browser's
        // native "Leave site? Changes may not be saved" dialog — and
        // AuthService.logout() had already wiped the token by then, so
        // the student was stuck: no way to submit, no clear reason why.
        // Now: disarm the proctor ourselves, explain plainly what
        // happened, and send them to log back in on THIS SAME page —
        // the local backup (never cleared) is still here waiting, so
        // checkResumeExam() offers it back and they can retry submit.
        if (err.status === 401) {
            if (window.MockTest && window.MockTest.stopProctor) window.MockTest.stopProctor();
            // Same fix as reading-v2.js's equivalent 401 branch — this file's
            // own Test Simulation engine (ExamProctor) is a SEPARATE proctor
            // from MockTest's; stopping only the latter left the former's
            // beforeunload listener armed through this exact forced redirect.
            if (state.mode === 'simulation' && window.ExamProctor) window.ExamProctor.stop();
            (window.showToast || toast)('Phiên đăng nhập đã hết hạn — bài làm của bạn vẫn được lưu, hãy đăng nhập lại để nộp bài.', 'info', 6000);
            if (window.AuthService && window.AuthService.clearSession) window.AuthService.clearSession();
            state.submitted = false;
            const next = (window.AuthService && window.AuthService.buildLoginUrl)
                ? window.AuthService.buildLoginUrl(location.pathname + location.search)
                : ('/login.html?next=' + encodeURIComponent(location.pathname + location.search));
            location.href = next;
            return;
        }

        // Genuinely failed (or we couldn't confirm either way) — the local
        // backup (state.answers etc., autosaved every 10s) is deliberately
        // left in place so checkResumeExam() offers it back next load,
        // including after a forced re-login. Re-arm the periodic autosave
        // too, in case the student keeps working before retrying submit.
        toast('Lỗi nộp bài: ' + err.message + ' — bài làm của bạn vẫn được lưu, hãy thử nộp lại.', 'error');
        state.submitted = false;
        if (!_saveInterval) _saveInterval = setInterval(saveExamToStorage, 10000);
        saveExamToStorage();
    }
}

function getBandMsg(band) {
    if (band >= 7.5) return 'Xuất sắc! Kết quả vượt trội 🎉';
    if (band >= 6.5) return 'Tốt lắm! Tiếp tục luyện tập để đạt band cao hơn 💪';
    if (band >= 5.5) return 'Cố gắng tốt! Bạn đang tiến bộ rõ rệt 📚';
    return 'Hãy tiếp tục – luyện tập đều đặn sẽ giúp bạn tiến bộ! 🌱';
}

// ══════════════════════════════════════════════
// HIGHLIGHT
// ══════════════════════════════════════════════
function setupHighlight() {
    document.addEventListener('mouseup', e => {
        if (state.tool !== 'highlight') return;
        // Don't highlight when clicking on interactive inputs. .radio-opt/
        // .checkbox-opt themselves ARE display:flex, but their option text
        // sits inside a nested <label> (not a flex item's direct text node),
        // so surroundContents() splitting it doesn't create new flex items —
        // safe to allow highlighting inside them.
        if (e.target.closest('input, textarea, select, button, .drag-chip, .drop-zone, .lt-drop')) return;
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        const tb  = document.getElementById('transcript-body');
        const qp  = document.getElementById('questions-panel');
        const rv  = document.getElementById('review-questions-inner');
        const pq  = document.getElementById('lt-practice-questions-inner');
        const ptb = document.getElementById('lt-practice-transcript-body');
        const inTranscript  = tb  && tb.contains(range.commonAncestorContainer);
        const inQPanel      = qp  && qp.contains(range.commonAncestorContainer);
        const inReviewQ     = rv  && rv.contains(range.commonAncestorContainer);
        const inPracticeQ   = pq  && pq.contains(range.commonAncestorContainer);
        const inPracticeTb  = ptb && ptb.contains(range.commonAncestorContainer);
        if (!inTranscript && !inQPanel && !inReviewQ && !inPracticeQ && !inPracticeTb) return;
        const span = document.createElement('span');
        span.className = 'hl';
        try { range.surroundContents(span); } catch { }
        state._justHighlighted = true;
        setTimeout(() => { state._justHighlighted = false; }, 0);
        sel.removeAllRanges();
        if (inPracticeQ || inPracticeTb) window._saveLtPracticeHighlightsToStorage?.();
        else _saveListeningHighlightsToStorage();
    });

    // Fired by js/shared/highlight-remove.js after the student re-colors
    // or deletes an EXISTING highlight (that module is self-contained and
    // doesn't know about this page's two separate highlight-storage
    // systems). 'hl:willChange' fires first, span still attached, so the
    // same practice-vs-main routing as the mouseup handler above can run;
    // 'hl:changed' fires after the DOM mutation, once the span may already
    // be detached (removal unwraps it) — that's when the actual save runs.
    var _hlChangeIsPractice = false;
    document.addEventListener('hl:willChange', e => {
        const span = e.detail && e.detail.span;
        const pq  = document.getElementById('lt-practice-questions-inner');
        const ptb = document.getElementById('lt-practice-transcript-body');
        _hlChangeIsPractice = !!span && ((pq && pq.contains(span)) || (ptb && ptb.contains(span)));
    });
    document.addEventListener('hl:changed', () => {
        if (_hlChangeIsPractice) window._saveLtPracticeHighlightsToStorage?.();
        else _saveListeningHighlightsToStorage();
    });
}

// ══════════════════════════════════════════════
// DICTIONARY — js/shared/dictionary-lookup.js does the actual lookup/
// render/save-to-vocab now; this page only supplies the gate (dict
// lookup fires only while the "Dict" toolbar tool is on, in review/
// lt-practice mode) via setupDictionaryDouble(containerId, source, gate).
// ══════════════════════════════════════════════
// lt-practice (isLtPracticeActive/isLtPracticeSubmitted) is now ALSO
// gated by mode: _ltPracticeMode is 'simulation' only when
// _enterLTPracticeScreen() was entered via the Test Simulation
// choice (see startPracticeSection()) — 'practice' for every other
// case. `!_mockMode && state.mode === 'practice'` extends this to
// the FULL-TEST exam screen too (previously always blocked hints
// outright — see reading-v2.js's identical gate for the full
// rationale, incl. why the 4-skill Full Mock Test is excluded).
//
// BUG: state.mode defaults to 'practice' and is only ever reassigned
// by the full-test start/resume paths — lt-practice never touches
// it. So during an lt-practice Test Simulation attempt
// (_ltPracticeMode === 'simulation'), state.mode was still sitting
// at its untouched default 'practice', and this third clause —
// meant ONLY for the full-test screen — fired anyway and handed
// back dictionary/translate access despite the (correctly
// evaluating) second clause already blocking it. Requiring
// `!inLtPractice` makes the third clause fire only when we're
// genuinely NOT in an lt-practice session, i.e. only for the real
// full-test screen state.mode actually describes.
//
// A SUBMITTED lt-practice (the post-submit screen, or "Xem lại" from
// history) is a review, so lookups are allowed whatever the mode —
// _ltPracticeMode keeps 'simulation' after a Test Simulation attempt
// (loadLTPracticeReview never resets it), which used to leave the
// forced review after a simulation with double-click lookup dead.
//
// On a graded review (state.isReview / submitted lt-practice) lookup works
// without the Tra từ tool being on — Esc or a click on the (already
// active) button used to switch it off and leave double-click dead. Only
// Highlight mode suppresses it, since its mouseup handler owns the selection.
function _ltDictGate() {
    const ltSubmitted = !!window.isLtPracticeSubmitted?.();
    const inLtPractice = ltSubmitted || window.isLtPracticeActive?.();
    if (state.tool === 'highlight') return false;
    // state.isReview lingers after leaving the review, so also require the
    // review screen to be the one showing.
    const onReview = state.isReview && !!document.getElementById('screen-review')?.classList.contains('active');
    if (onReview || ltSubmitted) return true;
    return state.tool === 'dict' && (
        state.isReview
        || ltSubmitted
        || (inLtPractice && _ltPracticeMode !== 'simulation')
        || (!inLtPractice && !_mockMode && state.mode === 'practice')
    );
}

// "tra câu" sentence-lookup icon (js/shared/sentence-lookup.js) must not
// help during a live timed attempt — same condition as _ltDictGate
// above, minus its own "Dict tool toggled on" requirement.
window.__ewsExamActive = () => {
    const ltSubmitted = !!window.isLtPracticeSubmitted?.();
    const inLtPractice = ltSubmitted || window.isLtPracticeActive?.();
    return !(
        state.isReview
        || ltSubmitted
        || (inLtPractice && _ltPracticeMode !== 'simulation')
        || (!inLtPractice && !_mockMode && state.mode === 'practice')
    );
};

// Dictionary/translate lookups hit 3rd-party APIs with no SLA — abort instead of hanging forever.
function fetchWithTimeout(url, ms = 7000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(t));
}

// ── Translate Popup ────────────────────────────────────────────────
async function translateSelected() {
    // Same Practice/Test Simulation gating as _ltDictGate/
    // window.__ewsExamActive above — this toolbar "T" translate
    // popup is the same class of hint tool.
    if (window.__ewsExamActive && window.__ewsExamActive()) return;
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : '';
    if (!text) return;
    const PW = 350, PH = 180;
    let lx = window.innerWidth / 2 - PW / 2;
    let ly = 200;
    try {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        lx = rect.left + rect.width / 2 - PW / 2;
        ly = (window.innerHeight - rect.bottom >= PH + 16) ? rect.bottom + 10 : rect.top - PH - 10;
    } catch (_) {}
    const srcEl = document.getElementById('translate-src');
    const resEl = document.getElementById('translate-result');
    srcEl.textContent = text;
    resEl.innerHTML = '<span class="translate-loading">Đang dịch...</span>';
    positionTranslatePopup(lx, ly);
    document.getElementById('translate-popup').classList.remove('hidden');
    const query = text.length > 500 ? text.slice(0, 500) : text;
    try {
        const res = await fetchWithTimeout(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        resEl.textContent = data?.[0]?.map(s => s?.[0]).filter(Boolean).join('') || 'Không dịch được';
    } catch (_) {
        resEl.textContent = 'Lỗi kết nối';
    }
}

function positionTranslatePopup(x, y) {
    const popup = document.getElementById('translate-popup');
    const PW = 350;
    popup.style.left = Math.max(8, Math.min(x, window.innerWidth - PW - 8)) + 'px';
    popup.style.top = Math.max(8, y) + 'px';
}

function closeTranslatePopup() { document.getElementById('translate-popup').classList.add('hidden'); }

// saveVocabWord/openBookPicker/createBookAndSave/pickBook moved to
// js/shared/dictionary-lookup.js (saveDictWordToVocab, openVocabBookPicker,
// createDictBookAndSave, saveDictWordToBook) — the dict-vocab-modal
// markup near #dict-popup uses those names now.

// ══════════════════════════════════════════════
// TOOL
// ══════════════════════════════════════════════
function setTool(tool, force) {
    // force skips the toggle-off check — used to unconditionally turn a
    // tool ON (e.g. auto-enabling Dict when a review screen appears)
    // without accidentally toggling it back off if it happened to
    // already be on.
    const next = (!force && tool !== 'none' && state.tool === tool) ? 'none' : tool;
    state.tool = next;
    document.querySelectorAll('.tool-btn-rv, #lt-practice-toolbar .tool-btn').forEach(b => b.classList.remove('active'));
    if (next === 'highlight') {
        document.getElementById('tool-hl-rv')?.classList.add('active');
        document.getElementById('tool-hl-pr')?.classList.add('active');
    }
    if (next === 'dict') {
        document.getElementById('tool-dict-rv')?.classList.add('active');
        document.getElementById('tool-dict-pr')?.classList.add('active');
    }
    document.body.style.cursor = next === 'highlight' ? 'crosshair' : 'default';
    // .radio-opt/.checkbox-opt default to user-select:none (so a quick
    // answer-pick click doesn't flash a text selection) — 'tool-hl'
    // lifts that. The Dict tool needs it too: double-click word lookup
    // reads window.getSelection(), which the browser never populates
    // while user-select:none is in effect.
    document.body.classList.toggle('tool-hl', next === 'highlight' || next === 'dict');
}

// The exam screen's Tra từ button only exists to be clickable when
// it'd actually work — see reading-v2.js's identical helper for
// the full rationale. Called from startTest()/resumeExam() after
// state.mode is set. Practice also unlocks the audio seek bar and
// ±5s skips; Simulation and Mock Test keep them read-only, like
// the real exam.
function _updateExamToolbarForMode() {
    const show = !_mockMode && state.mode === 'practice';
    const dictBtn = document.getElementById('tool-dict-exam');
    if (dictBtn) dictBtn.style.display = show ? '' : 'none';
    const seek = document.getElementById('audio-seek');
    if (seek) {
        seek.classList.toggle('exam-seek-readonly', !show);
        seek.tabIndex = show ? 0 : -1;
        seek.oninput = show ? () => onSeekInput(seek.value) : null;
    }
    document.querySelectorAll('.exam-skip-btn').forEach(b => { b.style.display = show ? '' : 'none'; });
}

function setToolExam(tool) {
    const next = (tool !== 'none' && state.tool === tool) ? 'none' : tool;
    state.tool = next;
    document.querySelectorAll('#exam-toolbar .tool-btn').forEach(b => b.classList.remove('active'));
    if (next === 'highlight') document.getElementById('tool-hl-exam')?.classList.add('active');
    if (next === 'dict') document.getElementById('tool-dict-exam')?.classList.add('active');
    document.body.style.cursor = next === 'highlight' ? 'crosshair' : 'default';
    document.body.classList.toggle('tool-hl', next === 'highlight' || next === 'dict');
}

// ══════════════════════════════════════════════
// REVIEW FROM HISTORY
// ══════════════════════════════════════════════
async function reviewFromHistory(attemptId) {
    closeModal('modal-history');
    toast('Đang tải kết quả...', 'info');
    try {
        const res = await fetch(`${API}/listening/history/${attemptId}`, { headers: authH() });
        const data = await safeJson(res);
        if (!data.success) throw new Error(data.message);
        state.reviewResult = data.result;
        state.reviewAnswerKeyWithheld = !!data.answerKeyWithheld;
        goToReview();
    } catch (err) {
        toast('Lỗi tải kết quả: ' + err.message, 'error');
    }
}

// ══════════════════════════════════════════════
// HISTORY MODAL
// BUG-013 fix: /api/listening/history now reports an honest
// total/hasMore instead of silently cutting off past its .limit()
// with no indication — rendered as "Đang hiển thị N/Y" + "Tải thêm"
// instead of just dumping whatever page-1 happened to return.
// ══════════════════════════════════════════════
const LISTENING_HISTORY_STEP = 50; // matches the backend's own default limit
let _listeningHistoryLimit = LISTENING_HISTORY_STEP;

// Full đề + Bài lẻ merged (GET /listening/history/combined), rows
// named clearly + "Chưa review" flag — rendered by the shared
// js/shared/attempt-history.js (same table as Reading).
async function showHistoryModal() {
    _listeningHistoryLimit = LISTENING_HISTORY_STEP;
    const root = document.getElementById('attempt-history-root');
    if (root) root.removeAttribute('data-ah-filter');
    window.AttemptHistory.loading(root);
    openModal('modal-history');
    await loadListeningHistoryPage();
}

async function loadListeningHistoryPage() {
    const root = document.getElementById('attempt-history-root');
    try {
        const res = await fetch(`${API}/listening/history/combined?limit=${_listeningHistoryLimit}`, { headers: authH() });
        const data = await safeJson(res);
        if (!data.success) throw new Error(data.message || 'Lỗi tải lịch sử');
        window.AttemptHistory.render(root, data, {
            onOpen: (row) => {
                closeModal('modal-history');
                if (row.kind === 'practice') loadLTPracticeReview(row._id);
                else reviewFromHistory(row._id);
            },
            onMore: _loadMoreListeningHistory,
        });
    } catch (err) {
        window.AttemptHistory.loading(root, 'Không tải được lịch sử: ' + err.message);
    }
}

function _loadMoreListeningHistory() {
    _listeningHistoryLimit += LISTENING_HISTORY_STEP;
    loadListeningHistoryPage();
}

// ══════════════════════════════════════════════
// MODALS & EXIT
// ══════════════════════════════════════════════
function confirmExit() { openModal('modal-exit'); }
async function forceExit() {
    closeModal('modal-exit');
    // Leaving without submitting must disarm proctoring too — only the
    // submit path did this before, so a Simulation attempt abandoned
    // via "Thoát" kept the badge, violation counting and nav-lock
    // armed indefinitely (BUG-108).
    if (state.mode === 'simulation' && window.ExamProctor) window.ExamProctor.stop();
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    // Save current position so resume banner appears on list screen
    saveExamToStorage();
    setToolExam('none'); // reset cursor before leaving exam
    clearInterval(_asoTimer);
    _cancelListeningReviewCountdown();
    clearInterval(_saveInterval);
    _saveInterval = null;
    audio.pause();
    audio.playbackRate = 1;
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.toggle('active', b.textContent.trim() === '×1'));
    window.onbeforeunload = null;
    showScreen('list');
    checkResumeExam();
}

// ══════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════
function toggleSettings() {
    document.getElementById('settings-panel').classList.toggle('hidden');
}
function toggleEyeProtection() {
    document.body.classList.toggle('eye-protection', document.getElementById('toggle-eye').checked);
}
function setFontSize(s) {
    const map = { S: '13px', M: '15px', L: '17px' };
    document.documentElement.style.setProperty('--ls-font-size', map[s]);
    document.querySelectorAll('.fs-btn').forEach(b => b.classList.toggle('active', b.textContent === s));
}

// ── Keyboard shortcuts ─────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeDictPopup(); closeTranslatePopup(); setTool('none'); setToolExam('none'); return; }
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    const onExam = document.getElementById('screen-exam')?.classList.contains('active');
    const onReview = document.getElementById('screen-review')?.classList.contains('active');
    const onPractice = document.getElementById('screen-practice')?.classList.contains('active');
    if (!onExam && !onReview && !onPractice) return;
    if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (onExam) setToolExam('highlight');
        else setTool('highlight');
    }
    if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (!onExam) setTool('dict');
    }
    if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.altKey && !e.metaKey) translateSelected();
    // switchPart() operates on exam/review-only DOM and state
    // (state.partIdx, #questions-panel/#transcript-body/
    // #review-questions-inner) — LT Practice (onPractice) uses its
    // own separate part mechanism, so this must not fire there. It
    // previously fired regardless of screen, silently corrupting a
    // stale exam's state.partIdx/partHlCache while the student was
    // actually in an unrelated practice session.
    if ((onExam || onReview) && ['1', '2', '3', '4'].includes(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const idx = parseInt(e.key) - 1;
        const sections = getSortedSections(state.isReview);
        if (sections[idx]) switchPart(idx, state.isReview);
    }
});

// ── Click-outside to close translate popup ─────────────────
document.addEventListener('mousedown', e => {
    const popup = document.getElementById('translate-popup');
    if (popup && !popup.classList.contains('hidden')) {
        if (!popup.contains(e.target) &&
            !e.target.closest('#tool-translate-rv') &&
            !e.target.closest('#tool-translate-pr')) {
            closeTranslatePopup();
        }
    }
});

// ── Click-outside to close settings ───────────────────────
document.addEventListener('click', e => {
    const panel = document.getElementById('settings-panel');
    if (!panel || panel.classList.contains('hidden')) return;
    const btn  = document.getElementById('btn-settings');
    const btnPr = document.getElementById('btn-settings-pr');
    if (!e.target.closest('#settings-panel')
        && !btn?.contains(e.target) && e.target !== btn
        && !btnPr?.contains(e.target) && e.target !== btnPr) {
        panel.classList.add('hidden');
    }
});

// ══════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════
function pad(n) { return String(n).padStart(2, '0'); }

function copyTestLink(testId, e) {
    e.stopPropagation();
    const url = `${location.origin}/listening.html?testId=${testId}`;
    navigator.clipboard.writeText(url).then(
        () => toast('Link bài thi đã được sao chép!', 'success'),
        () => toast('Không thể sao chép link', 'error')
    );
}

// Expose globals
window.showScreen = showScreen;
window.openModal = openModal; window.closeModal = closeModal;
window.filterTests = filterTests; window.applyTestFilters = applyTestFilters;
window.goToLsPage = goToLsPage;
// goToLtPracticePage lives in js/listening-practice.js and doesn't need
// exposing here — it's a plain top-level function declaration, so it's
// already global once that file runs. Exporting it from THIS file threw
// "goToLtPracticePage is not defined" on every page load (it isn't
// defined yet when this file executes) and silently aborted every line
// after it in this "Expose globals" list, including the state/audio/
// renderer sharing js/listening-practice.js actually depends on.
window.startAudioPlay = startAudioPlay; window.startReadingTime = startReadingTime;
window.togglePlay = togglePlay; window.skipAudio = skipAudio;
window.onSeekInput = onSeekInput; window.setSpeed = setSpeed;
window.switchPart = switchPart;
window.pickRadio = pickRadio; window.toggleCheckbox = toggleCheckbox; window.toggleMultiAnswer = toggleMultiAnswer; window.saveText = saveText;
window.dzOver = dzOver; window.dzDrop = dzDrop; window.dzClick = dzClick; window.clearDz = clearDz; window.updateDropZone = updateDropZone;
window.ltDragStart = ltDragStart; window.ltClickMOChip = ltClickMOChip; window.ltDropMO = ltDropMO;
window.ltClickSCChip = ltClickSCChip; window.ltDropSC = ltDropSC; window.ltClearDragDrop = ltClearDragDrop;
window.scrollToQ = scrollToQ; window.jumpToTime = jumpToTime;
window.confirmSubmit = confirmSubmit; window.submitExam = submitExam;
window.goToReview = goToReview;
window.confirmExit = confirmExit; window.forceExit = forceExit;
window.setTool = setTool;
window.setToolExam = setToolExam;
window.showHistoryModal = showHistoryModal;
window.reviewFromHistory = reviewFromHistory;
window.translateSelected = translateSelected; window.closeTranslatePopup = closeTranslatePopup;
window.toggleSettings = toggleSettings; window.toggleEyeProtection = toggleEyeProtection; window.setFontSize = setFontSize;
window.copyTestLink = copyTestLink;
// Shared with js/listening-practice.js (Bài lẻ)
window.state = state; window.audio = audio; window.pad = pad; window.toast = toast;
window.renderQuestionGroup = renderQuestionGroup; window.restoreAnswer = restoreAnswer;
window.setupDragDrop = setupDragDrop; window.setupDictionaryDouble = setupDictionaryDouble;
window._ltDictGate = _ltDictGate;
