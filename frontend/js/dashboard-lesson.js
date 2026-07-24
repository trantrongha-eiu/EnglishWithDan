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
    await renderTodaysLessonCard();
}

function renderClassroomSidebar() {
    const list = document.getElementById('classroom-list-sidebar');
    if (!list) return;
    if (!lessonState.publicLessons.length) {
        list.innerHTML = '<div class="classroom-empty">Chưa có bài học nào</div>';
        return;
    }
    list.innerHTML = lessonState.publicLessons.map(l => `
        <div class="classroom-item" id="ci-${l._id}" onclick="openLesson('${l._id}')">
            <span class="classroom-item-title">${escHtml(l.title)}</span>
            <span class="classroom-item-badge">${escHtml(l.difficulty)}</span>
        </div>
    `).join('');
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
        if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });

        document.querySelectorAll('.classroom-item').forEach(el => el.classList.remove('active'));
        document.getElementById(`ci-${lessonId}`)?.classList.add('active');

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
}

/* ──────────────────────────────────────────────
   QUIZ ENGINE — runtime question generation, no quiz ever stored.
   Types: mcq, translateEnVi, translateViEn, fill, listen, rearrange —
   one random type assigned per word, in shuffled word order.
────────────────────────────────────────────── */
function resetQuizState() {
    lessonState.quiz = {
        queue: [], index: 0, correct: 0, wrong: 0, wrongWords: [],
        startTime: null, answered: false, rearrangeTokens: null,
        currentOptions: null, currentAnswer: null,
    };
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

function buildQuizQueue(words) {
    const shuffled = [...words];
    shuffleArray(shuffled);
    return shuffled.map(word => {
        const eligible = eligibleTypesFor(word, words);
        return { type: eligible[Math.floor(Math.random() * eligible.length)], word };
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
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const { queue, index } = lessonState.quiz;
    const q = queue[index];
    lessonState.quiz.answered = false;
    lessonState.quiz.rearrangeTokens = null;
    const words = lessonState.currentLesson.words;
    const container = document.getElementById('lesson-tab-quiz');

    const progressPct = Math.round((index / queue.length) * 100);
    const shell = (bodyHtml) => `
        <div class="practice-container">
            <div class="practice-progress">
                <div class="progress-bar"><div class="progress-fill" style="width:${progressPct}%"></div></div>
                <div class="progress-text">${index + 1}/${queue.length}</div>
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
            <button class="btn-next" id="qBtnNext" style="display:none" onclick="nextQuizQuestion()">Next <i class="fas fa-arrow-right"></i></button>
        `);
        bindAnswerOptionListeners();
    } else if (q.type === 'fill') {
        const { sentence } = buildFillBlank(q.word);
        container.innerHTML = shell(`
            <div class="question-number">Fill in the Blank</div>
            <div class="question-text">${escHtml(sentence)}</div>
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
    if (re.test(word.example)) {
        return { sentence: word.example.replace(re, '_____') };
    }
    return { sentence: `${word.definition} → _____` };
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
    const { currentOptions, currentAnswer } = lessonState.quiz;
    const chosen = currentOptions[Number(btn.dataset.idx)];
    const correct = chosen === currentAnswer;
    document.querySelectorAll('#qOptions .answer-option').forEach(b => {
        b.disabled = true;
        if (currentOptions[Number(b.dataset.idx)] === currentAnswer) b.classList.add('correct');
        else if (b === btn) b.classList.add('wrong');
    });
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
    showQuizFeedback(correct, q.word.word);
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
    showQuizFeedback(correct, q.word.word);
    recordAnswer(correct);
    document.getElementById('qBtnNext').style.display = 'flex';
}

function showQuizFeedback(correct, answer) {
    const el = document.getElementById('qFeedback');
    if (!el) return;
    el.innerHTML = correct
        ? `<div class="feedback-correct"><i class="fas fa-check-circle"></i> Chính xác!</div>`
        : `<div class="feedback-wrong"><i class="fas fa-times-circle"></i> Chưa đúng — đáp án: <b>${escHtml(answer)}</b></div>`;
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
    const rt = lessonState.quiz.rearrangeTokens;
    const correct = rt.picked.join(' ') === rt.original.join(' ');
    lessonState.quiz.answered = true;
    showQuizFeedback(correct, rt.original.join(' '));
    recordAnswer(correct);
    const nextBtn = document.getElementById('qBtnNext');
    if (nextBtn) nextBtn.style.display = 'flex';
}

function recordAnswer(correct) {
    const q = lessonState.quiz.queue[lessonState.quiz.index];
    if (correct) lessonState.quiz.correct++;
    else { lessonState.quiz.wrong++; lessonState.quiz.wrongWords.push(q.word); }
}

function nextQuizQuestion() {
    lessonState.quiz.index++;
    if (lessonState.quiz.index >= lessonState.quiz.queue.length) {
        finishLessonQuiz();
    } else {
        renderQuizQuestion();
    }
}

async function finishLessonQuiz() {
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
            body: JSON.stringify({ correctCount: q.correct, totalCount: total, timeSpent: timeSpentSec }),
        });
    } catch (err) { console.error('finishLessonQuiz submit:', err); }

    if (typeof loadStreakAndUpdateMascot === 'function') loadStreakAndUpdateMascot();
    switchLessonTab('results');
}

/* ──────────────────────────────────────────────
   RESULTS TAB
────────────────────────────────────────────── */
async function renderResultsTab() {
    const container = document.getElementById('lesson-tab-results');
    if (!container) return;
    container.innerHTML = '<div class="classroom-empty">Đang tải...</div>';

    let attempt = null;
    try {
        const res = await fetch(`${API}/vocabulary-lessons/${lessonState.currentLesson._id}/attempt`, { headers: authH() });
        if (res.ok) { const d = await res.json(); attempt = d.attempt; }
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

    html += `<button class="btn-next" onclick="switchLessonTab('quiz')"><i class="fas fa-redo"></i> Làm lại Quiz</button>`;
    html += '</div>';
    container.innerHTML = html;
}
