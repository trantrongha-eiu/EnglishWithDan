'use strict';
/* ══════════════════════════════════════════════
   VOCABULARY LESSONS — Classroom / Today's Lesson / Lesson Detail
   (Learn / Quiz / Results tabs).

   Self-contained on purpose: reuses dashboard.css's generic practice-UI
   classes (vocab-card, question-card, answer-option, progress-bar…) but
   keeps its own state, separate from the Unit-practice engine further
   down in dashboard.js. Unit words and Lesson words are shaped
   differently (Lesson words carry definition/collocations/distractors;
   Unit words don't, and auto-generate distractors from a cross-unit
   pool instead) — sharing that engine's mutable state/functions would be
   fragile. dashboard.js's routing (syncViewUrl/popstate/init) has small,
   additive "view: 'lesson'" branches wired in to call into this file's
   openLesson()/closeLessonView().

   API/authH() are globals defined at the top of dashboard.js; escHtml()/
   shuffleArray() are shared globals (js/shared/utils.js, dashboard.js) —
   safe to call here since script tags execute before any event fires.
══════════════════════════════════════════════ */

const lessonState = {
    publicLessons: [],      // all published lessons (Classroom sidebar list)
    currentLesson: null,    // full lesson doc incl. words[], while view-lesson is open
    quiz: {
        queue: [],           // [{ type, word }]
        index: 0,
        correct: 0,
        wrong: 0,
        wrongWords: [],      // words missed this run — for "Review Wrong Answers"
        startTime: null,
        answered: false,
        rearrangeTokens: null,  // { remaining: [...], picked: [...] } while a rearrange question is in progress
        currentOptions: null,   // the current MCQ-family question's option list, kept here (not re-serialized
        currentAnswer: null,    // into the DOM) so answer checking never round-trips lesson text through HTML/JS source — see answerWordChoice().
        currentWord: null,      // the current question's full word object — used by showQuizFeedback() to show meaning+example after any answer.
        timerInterval: null,    // setInterval id for the live elapsed-time display; always cleared via resetQuizState()/startLessonQuiz() before being reassigned.
    },
    lastSession: null,      // { lessonId, score, correct, wrong, total, timeSpentSec, wrongWords } — set right after finishing a quiz, read once by the Results tab
};

/* ──────────────────────────────────────────────
   HOME: Classroom sidebar + Today's Lesson card
────────────────────────────────────────────── */
async function loadClassroomAndTodaysLesson() {
    try {
        const res = await fetch(`${API}/vocabulary-lessons`, { headers: authH() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        lessonState.publicLessons = data.lessons || [];
    } catch (err) {
        console.error('loadClassroomAndTodaysLesson:', err);
        lessonState.publicLessons = [];
    }
    renderClassroomSidebar();
    syncSheetClassroom();
    await renderTodaysLessonCard();
}

// Home screen's "Top 10 Quiz điểm cao" card — mirrors loadStreakLeaderboard()
// in dashboard.js (same row markup classes, RANK_MEDAL, avatar-or-initial
// pattern) but ranks by quiz score/time instead of streak length.
async function loadQuizLeaderboard() {
    const listEl = document.getElementById('quiz-lb-list');
    if (!listEl) return;
    try {
        const res = await fetch(`${API}/vocabulary-lessons/leaderboard`, { headers: authH() });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'load failed');
        const rows = data.leaderboard || [];
        if (!rows.length) {
            listEl.innerHTML = '<div class="dan-lb-empty">Chưa có ai làm Quiz đủ điều kiện xếp hạng — hãy là người đầu tiên! ⏱</div>';
            return;
        }
        const myId = window.AuthService?.getUser()?._id;
        const mm = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
        listEl.innerHTML = rows.map((r, i) => {
            const rank = i + 1;
            const medal = typeof RANK_MEDAL !== 'undefined' ? RANK_MEDAL[rank] : null;
            const avatar = r.avatar
                ? `<img class="dan-lb-avatar" src="${escHtml(r.avatar)}" alt="">`
                : `<span class="dan-lb-avatar-placeholder">${escHtml((r.name || '?')[0].toUpperCase())}</span>`;
            return `
                <div class="dan-lb-row${r.userId === myId ? ' is-me' : ''}">
                    <span class="dan-lb-rank${medal ? ' top' + rank : ''}">${medal || rank}</span>
                    ${avatar}
                    <span class="dan-lb-name">${escHtml(r.name)}${r.userId === myId ? ' (Bạn)' : ''}</span>
                    <span class="dan-lb-quiz-score">${r.score}% <span class="dan-lb-quiz-time">· ${mm(r.timeSpent)}</span></span>
                </div>`;
        }).join('');
    } catch {
        listEl.innerHTML = '<div class="dan-lb-empty">Không tải được bảng xếp hạng</div>';
    }
}

function renderClassroomSidebar() {
    const list = document.getElementById('classroom-list-sidebar');
    if (!list) return;
    buildClassroomPicker(list, {});
}

// Mirrors renderClassroomSidebar() into the mobile bottom sheet's
// "Classroom" tab — the desktop sidebar is display:none on mobile
// (same reasoning as dashboard.js's syncSheetBooks() for notebooks), so
// without this, mobile students could only ever reach whichever lesson
// happens to be "Today's Lesson" and had no way to browse the rest.
function syncSheetClassroom() {
    const list = document.getElementById('sheet-classroom-list');
    if (!list) return;
    buildClassroomPicker(list, { heading: 'Chọn bài Quiz', closeSheetOnPick: true, mobileInput: true });
}

// Renders the Classroom section as a collapsed picker (input + dropdown
// list) instead of an always-expanded stack of lesson cards — same
// interaction/visual pattern as the "Học Paraphrase" Unit picker right
// above it in the sidebar: click the 📖 icon, a list drops down, pick a
// lesson. Rebuilds the container's markup from scratch each call (called
// once per page load from loadClassroomAndTodaysLesson()), so no stale
// listener buildup across re-renders.
function buildClassroomPicker(container, opts) {
    const lessons = lessonState.publicLessons;
    // up-mob on both the input AND the dropdown — same enlarged, touch-
    // friendly sizing as the Paraphrase unit picker right above this one
    // in the mobile sheet (css/dashboard.css), so the two pickers read as
    // one consistent component instead of two differently-sized ones.
    const mobCls = opts.mobileInput ? ' up-mob' : '';
    container.innerHTML = `
        ${opts.heading ? `<h4><i class="fas fa-book"></i> ${escHtml(opts.heading)}</h4>` : ''}
        <div class="unit-picker">
            <div style="position:relative">
                <input class="unit-picker-input${mobCls}" placeholder="-- Chọn bài Quiz --" autocomplete="off" readonly inputmode="none">
                <i class="fas fa-book unit-picker-caret" style="font-style:normal"></i>
            </div>
            <div class="unit-picker-dd${mobCls}"></div>
        </div>
    `;
    const inp = container.querySelector('.unit-picker-input');
    const dd = container.querySelector('.unit-picker-dd');
    let isOpen = false;
    // Grouped by targetClass so a student picking from a list that spans
    // several classes can actually tell which quiz is theirs — previously
    // every lesson (own class + other classes + unscoped) was one flat list
    // with only a difficulty badge, no class indicator at all.
    function render() {
        if (!lessons.length) { dd.innerHTML = '<div class="up-empty">Chưa có bài học nào</div>'; return; }
        const groups = new Map();
        lessons.forEach(l => {
            const key = l.targetClass || '';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(l);
        });
        const keys = [...groups.keys()].sort((a, b) => {
            if (a === '') return 1;
            if (b === '') return -1;
            return a.localeCompare(b, 'vi', { numeric: true });
        });
        dd.innerHTML = keys.map(key => `
            <div class="up-group-label">${key ? `Lớp ${escHtml(key)}` : 'Chung (mọi lớp)'}</div>
            ${groups.get(key).map(l => `
                <div class="up-item" data-id="${l._id}" style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                    <span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(l.title)}</span>
                    <span class="classroom-item-badge">${escHtml(l.difficulty)}</span>
                </div>
            `).join('')}
        `).join('');
    }
    function open() { render(); dd.style.display = 'block'; isOpen = true; }
    function close() { dd.style.display = 'none'; isOpen = false; }
    inp.addEventListener('click', () => (isOpen ? close() : open()));
    dd.addEventListener('mousedown', e => {
        const item = e.target.closest('.up-item');
        if (!item) return;
        e.preventDefault();
        close();
        openLesson(item.dataset.id);
        if (opts.closeSheetOnPick && window.closeSheet) closeSheet();
    });
    document.addEventListener('mousedown', e => {
        if (isOpen && !container.contains(e.target)) close();
    });
}

async function renderTodaysLessonCard() {
    const card = document.getElementById('todays-lesson-card');
    if (!card) return;
    const lessons = lessonState.publicLessons;
    if (!lessons.length) { card.style.display = 'none'; return; }

    // Lessons are sorted ascending by `order` (teacher's session sequence) —
    // the last one is the most recently assigned, i.e. "today's".
    const today = lessons[lessons.length - 1];
    card.style.display = 'flex';
    document.getElementById('todays-lesson-title').textContent = today.title;
    document.getElementById('todays-lesson-meta').textContent  = `${today.difficulty} · ${today.wordCount} từ`;

    let attempt = null;
    try {
        const res = await fetch(`${API}/vocabulary-lessons/${today._id}/attempt`, { headers: authH() });
        if (res.ok) { const d = await res.json(); attempt = d.attempt; }
    } catch (err) { /* best-effort — progress bar just shows 0% */ }

    const bestScore = attempt?.bestScore || 0;
    const fill = document.getElementById('todays-lesson-progress-fill');
    if (fill) fill.style.width = bestScore + '%';
    const text = document.getElementById('todays-lesson-progress-text');
    if (text) text.textContent = bestScore + '%';

    const btn = document.getElementById('todays-lesson-btn');
    if (btn) {
        btn.textContent = !attempt ? 'Start' : (bestScore >= 90 ? 'Review' : 'Continue');
        btn.onclick = () => openLesson(today._id);
    }
}

/* ──────────────────────────────────────────────
   LESSON DETAIL — open/close + tabs
────────────────────────────────────────────── */
function openLesson(lessonId, push = true) {
    const doOpen = async () => {
        if (typeof _clearAutoNext === 'function') _clearAutoNext();
        document.getElementById('view-mybook').style.display = 'none';
        document.getElementById('view-unit').style.display   = 'none';
        document.getElementById('view-lesson').style.display = 'flex';
        // The FAB opens the notebook/paraphrase/classroom picker sheet —
        // meaningless (and, worse, visually overlaps card content while
        // scrolling) while already inside a lesson, so hide it for the
        // duration; restored by closeLessonView(). Only relevant on mobile
        // (.mob-fab is display:none on desktop regardless), but harmless to
        // set unconditionally — the inline style just yields to that rule.
        const fab = document.getElementById('mobFab');
        if (fab) fab.style.display = 'none';
        if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });

        document.getElementById('lesson-title').textContent = 'Đang tải...';
        try {
            const res = await fetch(`${API}/vocabulary-lessons/${lessonId}`, { headers: authH() });
            if (!res.ok) throw new Error(res.status === 404 ? 'Không tìm thấy bài học' : `HTTP ${res.status}`);
            const data = await res.json();
            lessonState.currentLesson = data.lesson;
            document.getElementById('lesson-title').textContent = data.lesson.title;
            resetQuizState();
            switchLessonTab('learn');
        } catch (err) {
            toast('Lỗi tải bài học: ' + err.message, 'error');
        }
        syncViewUrl(push ? 'push' : 'replace', { view: 'lesson', lessonId });
    };

    // Only guard if a quiz is genuinely mid-run — reuses the shared
    // confirm2() dialog rather than dashboard.js's askQuitPractice(), which
    // is wired to Unit-practice-specific state (currentMode/practiceWords)
    // and would not recognize a Lesson quiz in progress at all.
    if (isQuizInProgress()) {
        confirm2('Thoát bài quiz?', 'Bạn đang làm dở quiz, tiến độ lần này sẽ không được lưu.', doOpen);
    } else {
        doOpen();
    }
}

function closeLessonView() {
    // A quiz may have just been submitted (bestScore/attemptCount changed
    // server-side) — refresh the card so the student sees updated progress
    // immediately instead of only after a full page reload.
    const doClose = () => {
        resetQuizState(); // stops the elapsed-time interval if a quiz was abandoned mid-run
        const fab = document.getElementById('mobFab');
        if (fab) fab.style.display = ''; // let the existing mobile/desktop media-query rules decide again
        if (typeof goHomeView === 'function') goHomeView();
        renderTodaysLessonCard();
    };
    if (isQuizInProgress()) {
        confirm2('Thoát bài quiz?', 'Bạn đang làm dở quiz, tiến độ lần này sẽ không được lưu.', doClose);
    } else {
        doClose();
    }
}

function isQuizInProgress() {
    const q = lessonState.quiz;
    return q.queue.length > 0 && q.index < q.queue.length;
}

function switchLessonTab(tab) {
    // A mid-run quiz must not be escapable into the Learn tab (which shows
    // every word's meaning/example) or Results — that's a direct answer-key
    // peek. Only switching to 'quiz' itself is ever allowed while in progress;
    // leaving the lesson entirely still goes through openLesson()/
    // closeLessonView()'s own confirm2() abandon-quiz guard, which is a
    // separate, explicit "give up" action rather than a free peek.
    if (tab !== 'quiz' && isQuizInProgress()) {
        if (typeof toast === 'function') toast('Hoàn thành Quiz trước khi xem tab khác!', 'error');
        return;
    }
    document.querySelectorAll('#lesson-tabs .tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    ['learn', 'quiz', 'results'].forEach(t => {
        const el = document.getElementById(`lesson-tab-${t}`);
        if (el) el.style.display = (t === tab) ? 'block' : 'none';
    });
    if (tab === 'learn') renderLearnTab();
    else if (tab === 'quiz') renderQuizTab();
    else if (tab === 'results') renderResultsTab();
}

/* ──────────────────────────────────────────────
   LEARN TAB
────────────────────────────────────────────── */
function renderLearnTab() {
    const grid = document.getElementById('lesson-learn-grid');
    if (!grid) return;
    const words = lessonState.currentLesson?.words || [];
    if (!words.length) { grid.innerHTML = '<div class="classroom-empty">Bài học chưa có từ vựng</div>'; return; }

    // data-word-idx is a plain array index (never lesson text) — the actual
    // word value is looked up from `words` inside the listener below rather
    // than being re-serialized into an onclick="..." attribute. Lesson
    // content (word/meaning/example/...) must never become inline JS source;
    // see the security audit finding this replaced.
    grid.innerHTML = words.map((w, i) => `
        <div class="vocab-card">
            <div class="vocab-card-top">
                <span class="vocab-num">${i + 1}</span>
                <span class="vocab-word-big">${escHtml(w.word)}</span>
                ${w.partOfSpeech ? `<span class="vocab-pos">${escHtml(w.partOfSpeech)}</span>` : ''}
            </div>
            ${w.ipa ? `<div class="vocab-phonetic">${escHtml(w.ipa)}</div>` : ''}
            <div class="vocab-meaning">${escHtml(w.meaning)}</div>
            ${w.example ? `<div class="vocab-example">"${escHtml(w.example)}"</div>` : ''}
            ${w.definition ? `<div class="vocab-example" style="margin-top:4px;font-style:normal">${escHtml(w.definition)}</div>` : ''}
            ${w.collocations?.length ? `<div style="font-size:12px;color:var(--text3);margin-top:8px"><b>Collocations:</b> ${escHtml(w.collocations.join(', '))}</div>` : ''}
            <button class="btn-save-to-book" data-word-idx="${i}"><i class="fas fa-volume-up"></i> Nghe phát âm</button>
        </div>
    `).join('');
    grid.querySelectorAll('.btn-save-to-book[data-word-idx]').forEach(btn => {
        btn.addEventListener('click', () => speakWord(words[Number(btn.dataset.wordIdx)]?.word));
    });
    if (typeof setupDictionaryDouble === 'function') setupDictionaryDouble('lesson-learn-grid', 'vocab-lesson-learn');
}

/* ──────────────────────────────────────────────
   QUIZ ENGINE — runtime question generation, no quiz ever stored.
   Types: mcq, translateEnVi, translateViEn, fill, listen, rearrange —
   one random type assigned per word, in shuffled word order.
────────────────────────────────────────────── */
function resetQuizState() {
    if (lessonState.quiz.timerInterval) clearInterval(lessonState.quiz.timerInterval);
    lessonState.quiz = {
        queue: [], index: 0, correct: 0, wrong: 0, wrongWords: [],
        startTime: null, answered: false, rearrangeTokens: null,
        currentOptions: null, currentAnswer: null, currentWord: null, timerInterval: null,
        submitted: false,   // guards finishLessonQuiz() against double-submit (rapid double-tap on the last question's Next button)
    };
}

// Live "⏱ m:ss" display while a quiz is running — driven by startLessonQuiz()'s
// setInterval, reads the DOM element fresh every tick so it survives
// renderQuizQuestion() rebuilding the whole question card each question.
function updateQuizTimerDisplay() {
    const el = document.getElementById('quizElapsedTime');
    if (!el || !lessonState.quiz.startTime) return;
    const sec = Math.floor((Date.now() - lessonState.quiz.startTime) / 1000);
    el.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

// Minimum options a Multiple-Choice-family question must have (1 correct +
// at least 3 distinct wrong ones) to count as a real question rather than a
// giveaway. fill/listen/rearrange never depend on a distractor pool, so
// they're always eligible regardless of lesson size.
const MIN_MCQ_OPTIONS = 4;
const ALWAYS_ELIGIBLE_TYPES = ['fill', 'listen', 'rearrange'];

// Which quiz types can produce a real (>= MIN_MCQ_OPTIONS-option, no
// duplicate-answer) question for this specific word, given the rest of the
// lesson to draw distractors from. A short lesson or a word with no
// distractors= provided can't always support every type — e.g. a 1-word
// lesson can never support mcq/translateViEn/translateEnVi at all.
function eligibleTypesFor(word, allWords) {
    const types = [...ALWAYS_ELIGIBLE_TYPES];
    if (pickDistractorWords(word, allWords, MIN_MCQ_OPTIONS - 1).length >= MIN_MCQ_OPTIONS - 1) {
        types.push('mcq', 'translateViEn');
    }
    if (pickDistractorMeanings(word, allWords, MIN_MCQ_OPTIONS - 1).length >= MIN_MCQ_OPTIONS - 1) {
        types.push('translateEnVi');
    }
    return types;
}

// mcq ("Multiple Choice — chọn từ đúng") is the format students practice most
// often elsewhere on the site, so it's weighted to show up in ~60% of
// questions rather than an even 1/N split across all eligible types; the
// remaining 40% is split evenly across whichever other types are eligible.
const MCQ_TARGET_WEIGHT = 0.6;

function pickWeightedType(eligible) {
    if (eligible.includes('mcq') && Math.random() < MCQ_TARGET_WEIGHT) return 'mcq';
    const rest = eligible.filter(t => t !== 'mcq');
    return rest[Math.floor(Math.random() * rest.length)];
}

function buildQuizQueue(words) {
    const shuffled = [...words];
    shuffleArray(shuffled);
    return shuffled.map(word => {
        const eligible = eligibleTypesFor(word, words);
        return { type: pickWeightedType(eligible), word };
    });
}

function renderQuizTab() {
    const words = lessonState.currentLesson?.words || [];
    if (!words.length) {
        document.getElementById('lesson-tab-quiz').innerHTML = '<div class="classroom-empty">Bài học chưa có từ vựng</div>';
        return;
    }
    // isQuizInProgress() is false both before starting and right after
    // finishing (queue empty, or index has run past the end) — either way
    // the intro/retake screen is the right thing to show.
    if (isQuizInProgress()) renderQuizQuestion();
    else renderQuizIntro();
}

function renderQuizIntro() {
    const words = lessonState.currentLesson?.words || [];
    document.getElementById('lesson-tab-quiz').innerHTML = `
        <div class="practice-container">
            <div class="practice-header">
                <h3><i class="fas fa-check-circle"></i> Quiz</h3>
                <p>${words.length} câu hỏi — trộn ngẫu nhiên: Trắc nghiệm, Điền từ, Nghe, Dịch, Sắp xếp câu</p>
            </div>
            <button class="btn-next" onclick="startLessonQuiz()">Bắt đầu Quiz <i class="fas fa-arrow-right"></i></button>
        </div>`;
}

function startLessonQuiz() {
    const words = lessonState.currentLesson?.words || [];
    lessonState.quiz.queue = buildQuizQueue(words);
    lessonState.quiz.index = 0;
    lessonState.quiz.correct = 0;
    lessonState.quiz.wrong = 0;
    lessonState.quiz.wrongWords = [];
    lessonState.quiz.startTime = Date.now();
    lessonState.quiz.submitted = false; // "Làm lại Quiz" reuses this state object — must re-arm the double-submit guard from the previous attempt
    if (lessonState.quiz.timerInterval) clearInterval(lessonState.quiz.timerInterval); // e.g. "Làm lại Quiz" without leaving the lesson
    lessonState.quiz.timerInterval = setInterval(updateQuizTimerDisplay, 1000);
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const { queue, index } = lessonState.quiz;
    const q = queue[index];
    lessonState.quiz.answered = false;
    lessonState.quiz.rearrangeTokens = null;
    const words = lessonState.currentLesson.words;
    const container = document.getElementById('lesson-tab-quiz');

    lessonState.quiz.currentWord = q.word;

    const progressPct = Math.round((index / queue.length) * 100);
    const shell = (bodyHtml) => `
        <div class="practice-container">
            <div class="practice-progress">
                <div class="progress-bar"><div class="progress-fill" style="width:${progressPct}%"></div></div>
                <div class="practice-progress-meta">
                    <span class="quiz-elapsed-time" id="quizElapsedTime"><i class="fas fa-stopwatch"></i> 0:00</span>
                    <span class="progress-text">${index + 1}/${queue.length}</span>
                </div>
            </div>
            <div class="question-card">${bodyHtml}</div>
        </div>`;

    if (q.type === 'mcq' || q.type === 'translateViEn') {
        const { prompt, options, answer } = buildWordChoiceQuestion(q.word, words);
        lessonState.quiz.currentOptions = options;
        lessonState.quiz.currentAnswer = answer;
        const label = q.type === 'mcq' ? 'Multiple Choice — chọn từ đúng' : 'Vietnamese → English';
        container.innerHTML = shell(`
            <div class="question-number">${label}</div>
            <div class="question-text">${escHtml(prompt)}</div>
            <div class="answer-options" id="qOptions">
                ${options.map((o, i) => `<button class="answer-option" data-idx="${i}">${escHtml(o)}</button>`).join('')}
            </div>
            <div id="qFeedback"></div>
            <button class="btn-next" id="qBtnNext" style="display:none" onclick="nextQuizQuestion()">Next <i class="fas fa-arrow-right"></i></button>
        `);
        bindAnswerOptionListeners();
    } else if (q.type === 'translateEnVi') {
        const { prompt, options, answer } = buildTranslateEnViQuestion(q.word, words);
        lessonState.quiz.currentOptions = options;
        lessonState.quiz.currentAnswer = answer;
        container.innerHTML = shell(`
            <div class="question-number">English → Vietnamese</div>
            <div class="question-text">${escHtml(prompt)}</div>
            <div class="answer-options" id="qOptions">
                ${options.map((o, i) => `<button class="answer-option" data-idx="${i}">${escHtml(o)}</button>`).join('')}
            </div>
            <div id="qFeedback"></div>
            <button class="btn-next" id="qBtnNext" style="display:none" onclick="nextQuizQuestion()">Next <i class="fas fa-arrow-right"></i></button>
        `);
        bindAnswerOptionListeners();
    } else if (q.type === 'fill') {
        const { sentence, meaning } = buildFillBlank(q.word);
        container.innerHTML = shell(`
            <div class="question-number">Fill in the Blank</div>
            <div class="question-text">${escHtml(sentence)}</div>
            <div class="fb-meaning-hint"><i class="fas fa-lightbulb"></i> Gợi ý (nghĩa): ${escHtml(meaning)}</div>
            <div class="fb-input-row">
                <input class="text-input" id="qFillInput" placeholder="Nhập từ còn thiếu..." onkeypress="if(event.key==='Enter')checkFillQuiz()">
                <button class="btn-check" onclick="checkFillQuiz()">Check</button>
            </div>
            <div id="qFeedback"></div>
            <button class="btn-next" id="qBtnNext" style="display:none" onclick="nextQuizQuestion()">Next <i class="fas fa-arrow-right"></i></button>
        `);
        document.getElementById('qFillInput')?.focus();
    } else if (q.type === 'listen') {
        container.innerHTML = shell(`
            <div class="question-number">Listening</div>
            <button class="btn-play-audio" id="qPlayAudioBtn"><i class="fas fa-volume-up"></i> Play Audio</button>
            <div class="fb-input-row">
                <input class="text-input" id="qListenInput" placeholder="Nhập từ bạn vừa nghe..." onkeypress="if(event.key==='Enter')checkListenQuiz()">
                <button class="btn-check" onclick="checkListenQuiz()">Check</button>
            </div>
            <div id="qFeedback"></div>
            <button class="btn-next" id="qBtnNext" style="display:none" onclick="nextQuizQuestion()">Next <i class="fas fa-arrow-right"></i></button>
        `);
        // q.word.word is called directly as a real JS argument here, never
        // serialized through an HTML attribute — same reasoning as the
        // data-idx pattern above.
        document.getElementById('qPlayAudioBtn')?.addEventListener('click', () => speakWord(q.word.word));
        speakWord(q.word.word);
    } else if (q.type === 'rearrange') {
        const tokens = q.word.example.split(/\s+/).filter(Boolean);
        const shuffled = [...tokens];
        shuffleArray(shuffled);
        lessonState.quiz.rearrangeTokens = { original: tokens, remaining: shuffled, picked: [] };
        container.innerHTML = shell(`
            <div class="question-number">Rearrange — sắp xếp lại câu đúng chứa từ "${escHtml(q.word.word)}"</div>
            <div class="rearrange-slots" id="qRearrangeSlots"></div>
            <div class="rearrange-tiles" id="qRearrangeTiles"></div>
            <div id="qFeedback"></div>
            <button class="btn-next" id="qBtnNext" style="display:none" onclick="nextQuizQuestion()">Next <i class="fas fa-arrow-right"></i></button>
        `);
        renderRearrangeTiles();
    }
    if (typeof setupDictionaryDouble === 'function') setupDictionaryDouble('lesson-tab-quiz', 'vocab-lesson-quiz');
}

/* ── Question generators ── */
// Builds a distractor pool of up to `count` DISTINCT wrong answers, never
// including the word itself. Admin-provided distractors= are trusted for
// content but not for cleanliness — a paste can (accidentally or not) list
// the target word as its own distractor, or repeat one — both are filtered
// out here so a correct answer can never appear twice among the final MCQ
// options (see eligibleTypesFor(), which relies on this returning fewer
// than `count` items whenever the *usable* pool is genuinely too small).
function pickDistractorWords(word, allWords, count) {
    const seen = new Set([word.word.toLowerCase()]);
    const pool = [];
    for (const d of (word.distractors || [])) {
        const key = d.toLowerCase();
        if (pool.length >= count) break;
        if (!seen.has(key)) { seen.add(key); pool.push(d); }
    }
    if (pool.length < count) {
        const others = allWords.filter(w => w.word.toLowerCase() !== word.word.toLowerCase()).map(w => w.word);
        shuffleArray(others);
        for (const o of others) {
            if (pool.length >= count) break;
            const key = o.toLowerCase();
            if (!seen.has(key)) { seen.add(key); pool.push(o); }
        }
    }
    return pool;
}

function pickDistractorMeanings(word, allWords, count) {
    const others = allWords.filter(w => w.word.toLowerCase() !== word.word.toLowerCase() && w.meaning).map(w => w.meaning);
    shuffleArray(others);
    const pool = [];
    for (const m of others) {
        if (pool.length >= count) break;
        if (m !== word.meaning && !pool.includes(m)) pool.push(m);
    }
    return pool;
}

// Shared by 'mcq' (English framing) and 'translateViEn' (VI→EN framing) —
// same shape (show meaning, pick the correct English word), just a
// different label/instruction text at the call site.
function buildWordChoiceQuestion(word, allWords) {
    const wrong = pickDistractorWords(word, allWords, 3);
    const options = [word.word, ...wrong];
    shuffleArray(options);
    return { prompt: word.meaning, options, answer: word.word };
}

function buildTranslateEnViQuestion(word, allWords) {
    const wrong = pickDistractorMeanings(word, allWords, 3);
    const options = [word.meaning, ...wrong];
    shuffleArray(options);
    return { prompt: word.word, options, answer: word.meaning };
}

function buildFillBlank(word) {
    const re = new RegExp(`\\b${word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const sentence = re.test(word.example)
        ? word.example.replace(re, '_____')
        : `${word.definition} → _____`;
    return { sentence, meaning: word.meaning };
}

/* ── Answer handlers ── */
// Attaches click listeners to the just-rendered #qOptions buttons — replaces
// the old onclick="answerWordChoice(this, '<lesson text>', '<lesson text>')"
// pattern, which re-serialized admin-authored word/meaning/distractor text
// into an inline JS attribute and was exploitable as stored XSS (a crafted
// word/distractor value could break out of the attribute's JS string and
// execute). The actual option values now live only in
// lessonState.quiz.currentOptions/currentAnswer — never round-tripped
// through HTML source — and each button carries only a numeric data-idx.
function bindAnswerOptionListeners() {
    document.querySelectorAll('#qOptions .answer-option').forEach(btn => {
        btn.addEventListener('click', () => answerWordChoice(btn));
    });
}

function answerWordChoice(btn) {
    if (lessonState.quiz.answered) return;
    lessonState.quiz.answered = true;
    const { currentOptions, currentAnswer, currentWord } = lessonState.quiz;
    const chosen = currentOptions[Number(btn.dataset.idx)];
    const correct = chosen === currentAnswer;
    document.querySelectorAll('#qOptions .answer-option').forEach(b => {
        // opt-locked (a class, not the native `disabled` attribute) — a real
        // `disabled` button stops firing ALL future mouse events, including
        // the dblclick a student uses to look up a word in the option they
        // just answered. lessonState.quiz.answered already blocks re-answering,
        // so disabling isn't needed for correctness, only to stop re-clicking.
        b.classList.add('opt-locked');
        if (currentOptions[Number(b.dataset.idx)] === currentAnswer) b.classList.add('correct');
        else if (b === btn) b.classList.add('wrong');
    });
    showQuizFeedback(correct, currentWord, currentAnswer);
    recordAnswer(correct);
    document.getElementById('qBtnNext').style.display = 'flex';
}

function checkFillQuiz() {
    if (lessonState.quiz.answered) return;
    const q = lessonState.quiz.queue[lessonState.quiz.index];
    const input = document.getElementById('qFillInput');
    const val = (input?.value || '').trim();
    if (!val) return;
    const correct = val.toLowerCase() === q.word.word.toLowerCase();
    lessonState.quiz.answered = true;
    if (input) input.disabled = true;
    showQuizFeedback(correct, q.word, q.word.word);
    recordAnswer(correct);
    document.getElementById('qBtnNext').style.display = 'flex';
}

function checkListenQuiz() {
    if (lessonState.quiz.answered) return;
    const q = lessonState.quiz.queue[lessonState.quiz.index];
    const input = document.getElementById('qListenInput');
    const val = (input?.value || '').trim();
    if (!val) return;
    const correct = val.toLowerCase() === q.word.word.toLowerCase();
    lessonState.quiz.answered = true;
    if (input) input.disabled = true;
    showQuizFeedback(correct, q.word, q.word.word);
    recordAnswer(correct);
    document.getElementById('qBtnNext').style.display = 'flex';
}

// Always shows meaning + example alongside the correct/wrong verdict — a
// student should see the reinforcement regardless of question type or
// whether they got it right, not just a bare "correct/wrong" verdict.
function showQuizFeedback(correct, word, answerText) {
    const el = document.getElementById('qFeedback');
    if (!el) return;
    const verdict = correct
        ? `<div class="feedback-correct"><i class="fas fa-check-circle"></i> Chính xác!</div>`
        : `<div class="feedback-wrong"><i class="fas fa-times-circle"></i> Chưa đúng — đáp án: <b>${escHtml(answerText)}</b></div>`;
    const detail = word ? `
        <div class="quiz-answer-detail">
            <div><b>Nghĩa:</b> ${escHtml(word.meaning)}</div>
            ${word.example ? `<div class="quiz-answer-example">"${escHtml(word.example)}"</div>` : ''}
        </div>` : '';
    el.innerHTML = verdict + detail;
}

function renderRearrangeTiles() {
    const rt = lessonState.quiz.rearrangeTokens;
    const slots = document.getElementById('qRearrangeSlots');
    const tiles = document.getElementById('qRearrangeTiles');
    if (!slots || !tiles) return;
    slots.innerHTML = rt.picked.map((t, i) => `<button class="rearrange-slot-tile" onclick="unpickRearrangeTile(${i})">${escHtml(t)}</button>`).join('');
    tiles.innerHTML = rt.remaining.map((t, i) => `<button class="rearrange-tile" onclick="pickRearrangeTile(${i})">${escHtml(t)}</button>`).join('');
}

function pickRearrangeTile(i) {
    if (lessonState.quiz.answered) return;
    const rt = lessonState.quiz.rearrangeTokens;
    rt.picked.push(rt.remaining[i]);
    rt.remaining.splice(i, 1);
    renderRearrangeTiles();
    if (rt.remaining.length === 0) checkRearrangeQuiz();
}

function unpickRearrangeTile(i) {
    if (lessonState.quiz.answered) return;
    const rt = lessonState.quiz.rearrangeTokens;
    rt.remaining.push(rt.picked[i]);
    rt.picked.splice(i, 1);
    renderRearrangeTiles();
}

function checkRearrangeQuiz() {
    if (lessonState.quiz.answered) return;
    const q = lessonState.quiz.queue[lessonState.quiz.index];
    const rt = lessonState.quiz.rearrangeTokens;
    const correct = rt.picked.join(' ') === rt.original.join(' ');
    lessonState.quiz.answered = true;
    showQuizFeedback(correct, q.word, rt.original.join(' '));
    recordAnswer(correct);
    const nextBtn = document.getElementById('qBtnNext');
    if (nextBtn) nextBtn.style.display = 'flex';
}

function recordAnswer(correct) {
    const q = lessonState.quiz.queue[lessonState.quiz.index];
    if (correct) {
        lessonState.quiz.correct++;
        if (typeof playCorrectSound === 'function') playCorrectSound();
    } else {
        lessonState.quiz.wrong++;
        lessonState.quiz.wrongWords.push(q.word);
        if (typeof playWrongSound === 'function') playWrongSound();
    }
}

function nextQuizQuestion() {
    lessonState.quiz.index++;
    if (lessonState.quiz.index >= lessonState.quiz.queue.length) {
        finishLessonQuiz();
    } else {
        renderQuizQuestion();
    }
}

// Enter advances to the next question once one's been answered (qBtnNext
// visible) — mirrors dashboard.js's own Notebook-quiz keyboard shortcut.
// Scoped to only fire while the Lesson Quiz tab is actually the visible one,
// so it can't steal Enter from unrelated inputs elsewhere on dashboard.html.
// The fill/listen inputs' own onkeypress="if(...)checkFillQuiz()" still runs
// first (keypress fires after this keydown listener within the same
// keystroke), so the very first Enter always just submits the answer —
// qBtnNext isn't visible yet at that point, this listener only takes over
// on the next Enter press.
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const quizTab = document.getElementById('lesson-tab-quiz');
    if (!quizTab || quizTab.style.display === 'none') return;
    const nextBtn = document.getElementById('qBtnNext');
    if (nextBtn && nextBtn.style.display !== 'none') {
        e.preventDefault();
        nextQuizQuestion();
    }
});

async function finishLessonQuiz() {
    if (lessonState.quiz.submitted) return; // rapid double-tap on the last question's Next button — only submit once
    lessonState.quiz.submitted = true;
    if (lessonState.quiz.timerInterval) { clearInterval(lessonState.quiz.timerInterval); lessonState.quiz.timerInterval = null; }
    const q = lessonState.quiz;
    const total = q.queue.length;
    const timeSpentSec = Math.max(1, Math.round((Date.now() - q.startTime) / 1000));

    lessonState.lastSession = {
        lessonId: lessonState.currentLesson._id,
        score: total > 0 ? Math.round((q.correct / total) * 100) : 0,
        correct: q.correct,
        wrong: q.wrong,
        total,
        timeSpentSec,
        wrongWords: q.wrongWords,
    };

    try {
        await fetch(`${API}/vocabulary-lessons/${lessonState.currentLesson._id}/attempt`, {
            method: 'POST',
            headers: authH(),
            body: JSON.stringify({
                correctCount: q.correct,
                totalCount: total,
                timeSpent: timeSpentSec,
                wrongWords: q.wrongWords.map(w => w.word),
            }),
        });
    } catch (err) { console.error('finishLessonQuiz submit:', err); }

    // Report this quiz to the SAME streak/XP endpoint Notebook/Paraphrase
    // practice already uses — previously this only called
    // loadStreakAndUpdateMascot(), a read-only refresh, so finishing a
    // lesson quiz never actually granted the streak bonus (audit finding:
    // "Vocabulary Lesson quiz doesn't award streak/XP"). Reuses
    // dashboard.js's _applyStreakResult() for the UI update so the mascot/
    // hammer/weekly-progress feedback is identical to every other practice
    // surface on this page. total < 5 is a no-op server-side (same rule
    // Notebook practice already follows), so no separate guard needed here.
    try {
        const res = await fetch(`${API}/vocabbook/practice-complete`, {
            method: 'POST',
            headers: authH(),
            body: JSON.stringify({ wordsAnswered: total, correctAnswered: q.correct, unitId: null, unitType: null }),
        });
        const d = await res.json();
        if (typeof _applyStreakResult === 'function') _applyStreakResult(d);
    } catch (err) { console.error('finishLessonQuiz streak report:', err); }
    if (typeof loadStreakAndUpdateMascot === 'function') loadStreakAndUpdateMascot();
    if (lessonState.lastSession.score === 100 && typeof spawnConfetti === 'function') {
        setTimeout(() => spawnConfetti(100), 400); // same trigger/delay as Notebook practice's results screen
    }
    switchLessonTab('results');
}

// Same 5-tier score->image mapping as Notebook/Unit practice's results
// screen (dashboard.js's showResults()) — reusing the exact same asset
// files so a Lesson quiz result feels consistent with the rest of the
// vocab dashboard instead of introducing a second, different set of mood
// images.
function getVocabResultImage(pct) {
    return pct >= 90 ? 'img/vocab_writingabove90%25.jpg'
         : pct >= 70 ? 'img/above7.5.jpg'
         : pct >= 50 ? 'img/vocab50_70%25.jpg'
         : pct >= 20 ? 'img/vocabbelow50%25.jpg'
         :             'img/verylowscore.jpg';
}

/* ──────────────────────────────────────────────
   RESULTS TAB
────────────────────────────────────────────── */
function formatHistoryDate(iso) {
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function renderResultsTab() {
    const container = document.getElementById('lesson-tab-results');
    if (!container) return;
    container.innerHTML = '<div class="classroom-empty">Đang tải...</div>';

    let attempt = null;
    let history = [];
    try {
        const [attemptRes, historyRes] = await Promise.all([
            fetch(`${API}/vocabulary-lessons/${lessonState.currentLesson._id}/attempt`, { headers: authH() }),
            fetch(`${API}/vocabulary-lessons/${lessonState.currentLesson._id}/attempt/history`, { headers: authH() }),
        ]);
        if (attemptRes.ok) { const d = await attemptRes.json(); attempt = d.attempt; }
        if (historyRes.ok) { const d = await historyRes.json(); history = d.history || []; }
    } catch (err) { /* best-effort */ }

    const session = (lessonState.lastSession && lessonState.lastSession.lessonId === lessonState.currentLesson._id)
        ? lessonState.lastSession : null;

    if (!attempt && !session) {
        container.innerHTML = `
            <div class="practice-container" style="text-align:center;padding:40px 0">
                <p style="color:var(--text2)">Bạn chưa làm Quiz cho bài học này.</p>
                <button class="btn-next" style="max-width:220px;margin:14px auto 0" onclick="switchLessonTab('quiz')">Làm Quiz ngay</button>
            </div>`;
        return;
    }

    const mm = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

    let html = '<div class="practice-container">';

    if (session) {
        html += `
            <div class="lesson-results-stat-row">
                <div class="lesson-results-stat"><div class="lesson-results-stat-value">${session.score}%</div><div class="lesson-results-stat-label">Score</div></div>
                <div class="lesson-results-stat"><div class="lesson-results-stat-value" style="color:var(--green)">${session.correct}</div><div class="lesson-results-stat-label">Correct</div></div>
                <div class="lesson-results-stat"><div class="lesson-results-stat-value" style="color:var(--brand)">${session.wrong}</div><div class="lesson-results-stat-label">Wrong</div></div>
                <div class="lesson-results-stat"><div class="lesson-results-stat-value">${mm(session.timeSpentSec)}</div><div class="lesson-results-stat-label">Time</div></div>
            </div>`;
        if (typeof getScoreMessage === 'function') {
            const { emoji, message } = getScoreMessage(session.score);
            html += `
                <div style="text-align:center;margin-bottom:16px">
                    <div style="font-size:13px;color:var(--text2);margin-bottom:10px">${emoji} ${escHtml(message)}</div>
                    <img src="${getVocabResultImage(session.score)}" alt="" style="width:100%;max-width:200px;border-radius:12px;object-fit:cover">
                </div>`;
        }
        if (session.wrongWords.length) {
            html += `
                <div class="fb-card" style="border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:20px">
                    <div style="font-weight:700;margin-bottom:10px"><i class="fas fa-redo"></i> Review Wrong Answers</div>
                    ${session.wrongWords.map(w => `
                        <div style="padding:8px 0;border-top:1px solid var(--border)">
                            <b>${escHtml(w.word)}</b> — ${escHtml(w.meaning)}
                            ${w.example ? `<div style="font-size:12px;color:var(--text2);font-style:italic">"${escHtml(w.example)}"</div>` : ''}
                        </div>`).join('')}
                </div>`;
        }
    }

    if (attempt) {
        html += `
            <div class="lesson-results-stat-row">
                <div class="lesson-results-stat"><div class="lesson-results-stat-value" style="color:var(--blue)">${attempt.bestScore}%</div><div class="lesson-results-stat-label">Best Score</div></div>
                <div class="lesson-results-stat"><div class="lesson-results-stat-value">${attempt.attemptCount}</div><div class="lesson-results-stat-label">Attempt Count</div></div>
            </div>`;
    }

    if (history.length) {
        html += `
            <div style="margin-bottom:20px">
                <div style="font-weight:700;margin-bottom:10px"><i class="fas fa-history"></i> Lịch sử làm bài</div>
                <div class="table-wrap" style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
                    <table class="lesson-history-table">
                        <thead><tr><th>Lần làm</th><th>Điểm</th><th>Thời gian</th></tr></thead>
                        <tbody>
                            ${history.map(h => `
                                <tr>
                                    <td>${formatHistoryDate(h.createdAt)}</td>
                                    <td>${h.score}%</td>
                                    <td>${mm(h.timeSpent)}</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }

    html += `<button class="btn-next" onclick="switchLessonTab('quiz')"><i class="fas fa-redo"></i> Làm lại Quiz</button>`;
    html += '</div>';
    container.innerHTML = html;
    if (typeof setupDictionaryDouble === 'function') setupDictionaryDouble('lesson-tab-results', 'vocab-lesson-results');
}
