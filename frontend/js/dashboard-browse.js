'use strict';
/* ══════════════════════════════════════════════
   PRACTICE BROWSE — full-width "pick a Paraphrase Unit / Vocab Topic" view.

   The sidebar used to hold both pickers as cramped 240px-wide dropdowns
   (with a Paraphrase/Vocab Topics tab switch, one always pre-selected).
   Now the sidebar only has two unselected buttons; clicking one opens this
   view in the main (wide) area as a searchable card grid. The view lives
   inside #view-mybook (sibling of #book-welcome/#book-content), so every
   existing "hide view-mybook" path (loadUnit/openLesson) hides it for free.

   Context (`ctx`) remembers which browse list the student came from, so
   Back from a unit/lesson opened here returns to the list instead of the
   homepage (closeUnitView/closeLessonView consult PracticeBrowse.context()).
   goHomeView()/openBook() clear it.

   Data: units come from dashboard.js's loadUnits(), lessons from
   dashboard-lesson.js's lessonState — both call onPracticeDataLoaded()
   when their fetch settles (success or failure).

   Above the list: "Gợi ý cho bạn" chips (due paraphrase reviews, continue
   last-opened unit/lesson, next unit, today's lesson) and a collapsible
   "Cách học hiệu quả" guide. "Last opened" is a per-browser convenience in
   localStorage (only remembered for picks made from this view).
══════════════════════════════════════════════ */
(function () {
    let ctx = null;                 // 'paraphrase' | 'topics' | null
    let units = [];
    const loaded = { paraphrase: false, topics: false };
    let paraDueCount = 0;
    let dueSeq = 0;

    const LAST_KEY  = { paraphrase: 'ews_pb_last_unit', topics: 'ews_pb_last_lesson' };
    const GUIDE_KEY = kind => `ews_pb_guide_${kind}`;
    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }

    // Study guides — kept in sync with what the unit/lesson views actually
    // offer (Unit: Study flip-cards + Quiz/Flashcard/Listen/Translate/Mixed,
    // Leitner ratings, "Ôn Paraphrase"; Lesson: Learn/Quiz/Results, "Lưu tất
    // cả", ≥90% → "Review", ≥5 questions for the leaderboard).
    const GUIDES = {
        paraphrase: {
            summary: '<i class="fas fa-lightbulb"></i> Cách học Paraphrase hiệu quả',
            steps: [
                ['Mỗi ngày 1 Unit, 15–20 phút', 'Học đều mỗi ngày nhớ lâu hơn học dồn nhiều Unit một lúc. Học xong một Unit rồi mới sang Unit tiếp.'],
                ['Tự đoán trước rồi mới lật thẻ', 'Ở tab <b>Study</b> (chế độ 🃏 Thẻ), đọc cụm từ trong bài rồi tự hỏi <i>"đề sẽ diễn đạt lại thế nào?"</i> trước khi lật. Tự nhớ ra được thì nhớ lâu hơn nhiều so với chỉ đọc lướt.'],
                ['Chấm mức nhớ thật lòng', 'Bấm <b>Chưa thuộc / Nhớ sơ sơ / Đã thuộc</b> đúng với mức nhớ thật. Hệ thống dựa vào đó để hẹn ngày ôn từng cụm (lặp lại ngắt quãng), nên chấm "Đã thuộc" quá sớm là tự làm mình quên.'],
                ['Luyện ngay sau khi học', 'Làm lần lượt <b>Quiz → Flashcard → Translate</b>, cuối cùng là <b>Mixed</b>. Mixed đạt từ 80% trở lên thì coi như đã nắm được Unit.'],
                ['Ôn đúng hạn trước khi học mới', 'Khi có cụm đến hạn, bấm <b>Ôn Paraphrase</b> trước. Ôn đúng hạn quan trọng hơn học thêm Unit mới.'],
                ['Áp dụng khi làm đề', 'Khi làm Reading/Listening, gạch chân từ khoá trong câu hỏi rồi tìm cụm có cùng nghĩa trong bài. Đó chính là kỹ năng paraphrase bạn đang luyện.'],
            ],
            tip: 'Cụm nào hay sai thì vào <b>Ôn lại từ hay sai</b> ở sidebar, hoặc bấm lưu cụm đó vào sổ từ vựng để ôn lại.',
        },
        topics: {
            summary: '<i class="fas fa-lightbulb"></i> Cách học Vocab Topics hiệu quả',
            steps: [
                ['Ưu tiên bài của lớp bạn', 'Làm các bài trong nhóm <b>Lớp …</b> của bạn trước (giáo viên giao theo tiến độ lớp), sau đó mới đến nhóm <b>Chung</b>.'],
                ['Learn kỹ trước khi Quiz', 'Ở tab <b>Learn</b>, đọc nghĩa, ví dụ và collocation, bấm 🔊 rồi đọc to theo. Với mỗi từ, thử tự đặt 1 câu về bản thân.'],
                ['Tự kiểm tra trước', 'Che phần nghĩa đi, nhìn từ tiếng Anh rồi nói nghĩa. Từ nào chưa nói được thì đọc lại trước khi làm Quiz.'],
                ['Làm Quiz đến khi đạt ≥ 90%', 'Quiz có cả câu sắp xếp lại câu ví dụ, giúp bạn học cách dùng từ chứ không chỉ nhớ nghĩa. Đạt từ 90% trở lên thì bài chuyển sang trạng thái <b>Review</b>.'],
                ['Xem lại câu sai ở Results', 'Mở tab <b>Results</b>, xem lại những từ đã sai và làm lại Quiz sau khoảng 1 ngày.'],
                ['Lưu cả bài vào sổ', 'Bấm <b>Lưu tất cả</b> để đưa các từ vào sổ từ vựng. Hệ thống sẽ nhắc bạn ôn từng từ đúng lúc.'],
            ],
            tip: 'Quiz làm đủ từ 5 câu trở lên sẽ được tính vào bảng <b>Top 10 Quiz điểm cao</b> ở trang chủ.',
        },
    };

    const META = {
        paraphrase: {
            title: 'Paraphrase Cambridge',
            icon: 'fa-graduation-cap',
            sub: 'Các cụm paraphrase thường gặp trong bộ đề Cambridge IELTS 15–20. Chọn một Unit để học.',
            placeholder: 'Tìm Unit theo số hoặc tên...',
            tab: 'practiceTabParaphrase',
        },
        topics: {
            title: 'Vocab Topics',
            icon: 'fa-layer-group',
            sub: 'Từ vựng theo chủ đề — học rồi làm Quiz. Chọn một bài để bắt đầu.',
            placeholder: 'Tìm bài quiz theo tên...',
            tab: 'practiceTabVocab',
        },
    };

    const $ = id => document.getElementById(id);

    function setSidebarActive(kind) {
        Object.keys(META).forEach(k => {
            const btn = $(META[k].tab);
            if (!btn) return;
            btn.classList.toggle('active', k === kind);
            btn.setAttribute('aria-pressed', k === kind ? 'true' : 'false');
        });
    }

    function isShowing() {
        const el = $('practice-browse');
        return !!el && el.style.display !== 'none' && $('view-mybook').style.display !== 'none';
    }

    /* ── Rendering ── */
    function matches(q, ...fields) {
        if (!q) return true;
        const needle = q.toLowerCase();
        return fields.some(f => String(f || '').toLowerCase().includes(needle));
    }

    function emptyHtml(icon, text) {
        return `<div class="pb-empty"><i class="fas ${icon}"></i><div>${text}</div></div>`;
    }

    function loadingHtml() {
        return `<div class="pb-empty"><i class="fas fa-spinner fa-spin"></i><div>Đang tải...</div></div>`;
    }

    function renderParaphrase(q) {
        if (!loaded.paraphrase) return loadingHtml();
        if (!units.length) return emptyHtml('fa-box-open', 'Chưa có Paraphrase Unit nào');
        const current = $('unitSelect')?.value || '';
        const list = units.filter(u => matches(q, `unit ${u.unitNumber}`, u.title, u.description));
        if (!list.length) return emptyHtml('fa-search', 'Không tìm thấy Unit nào');
        return `<div class="pb-grid">${list.map(u => `
            <button type="button" class="pb-card${String(u.unitNumber) === current ? ' is-current' : ''}" data-unit="${escHtml(String(u.unitNumber))}">
                <span class="pb-card-top">
                    <span class="pb-card-num">Unit ${escHtml(String(u.unitNumber))}</span>
                    ${u.level ? `<span class="pb-chip">${escHtml(u.level)}</span>` : ''}
                </span>
                <span class="pb-card-title">${escHtml(u.title || '')}</span>
                ${u.description ? `<span class="pb-card-desc">${escHtml(u.description)}</span>` : ''}
                <span class="pb-card-go">Học ngay <i class="fas fa-arrow-right"></i></span>
            </button>`).join('')}</div>`;
    }

    function renderTopics(q) {
        if (!loaded.topics) return loadingHtml();
        const lessons = (typeof lessonState !== 'undefined' && lessonState.publicLessons) || [];
        if (!lessons.length) return emptyHtml('fa-box-open', 'Chưa có bài học nào');
        const list = lessons.filter(l => matches(q, l.title));
        if (!list.length) return emptyHtml('fa-search', 'Không tìm thấy bài quiz nào');
        // Grouped by targetClass (same order as _lessonPickerGroupedHtml in
        // dashboard-lesson.js: named classes first, "Chung" last).
        const groups = new Map();
        list.forEach(l => {
            const key = l.targetClass || '';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(l);
        });
        const keys = [...groups.keys()].sort((a, b) => {
            if (a === '') return 1;
            if (b === '') return -1;
            return a.localeCompare(b, 'vi', { numeric: true });
        });
        return keys.map(key => `
            <div class="pb-group">
                <div class="pb-group-label">${key ? `Lớp ${escHtml(key)}` : 'Chung (mọi lớp)'} <span>${groups.get(key).length}</span></div>
                <div class="pb-grid">${groups.get(key).map(l => `
                    <button type="button" class="pb-card" data-lesson="${escHtml(String(l._id))}">
                        <span class="pb-card-top">
                            ${l.difficulty ? `<span class="classroom-item-badge">${escHtml(l.difficulty)}</span>` : ''}
                            ${l.wordCount ? `<span class="pb-card-meta">${escHtml(String(l.wordCount))} từ</span>` : ''}
                        </span>
                        <span class="pb-card-title">${escHtml(l.title || '')}</span>
                        <span class="pb-card-go">Vào bài <i class="fas fa-arrow-right"></i></span>
                    </button>`).join('')}</div>
            </div>`).join('');
    }

    function renderBody() {
        if (!ctx) return;
        const q = ($('pb-search')?.value || '').trim();
        const body = $('pb-body');
        if (!body) return;
        body.innerHTML = ctx === 'paraphrase' ? renderParaphrase(q) : renderTopics(q);
        const count = $('pb-count');
        if (count) {
            const n = body.querySelectorAll('.pb-card').length;
            count.textContent = n ? `${n} ${ctx === 'paraphrase' ? 'Unit' : 'bài'}` : '';
        }
        renderSuggest();
    }

    /* ── "Gợi ý cho bạn" ── */
    function chip(icon, label, title, attrs, tone) {
        return `<button type="button" class="pb-suggest-chip${tone ? ' pb-suggest-chip--' + tone : ''}" ${attrs}>
            <span class="pb-suggest-icon"><i class="fas ${icon}"></i></span>
            <span class="pb-suggest-text">
                <span class="pb-suggest-label">${label}</span>
                <span class="pb-suggest-title">${escHtml(title)}</span>
            </span>
        </button>`;
    }

    function paraphraseSuggestions() {
        const out = [];
        if (paraDueCount > 0 && typeof window.openParaphraseReviewModal === 'function') {
            out.push(chip('fa-rotate', 'Đến hạn ôn', `${paraDueCount} cụm paraphrase cần ôn hôm nay`, 'data-review="1"', 'hot'));
        }
        if (!units.length) return out;
        const last = lsGet(LAST_KEY.paraphrase);
        const idx = last ? units.findIndex(u => String(u.unitNumber) === last) : -1;
        if (idx === -1) {
            const u = units[0];
            out.push(chip('fa-flag', 'Bắt đầu từ đây', `Unit ${u.unitNumber} – ${u.title || ''}`, `data-unit="${escHtml(String(u.unitNumber))}"`));
            return out;
        }
        const u = units[idx];
        out.push(chip('fa-play', 'Học tiếp', `Unit ${u.unitNumber} – ${u.title || ''}`, `data-unit="${escHtml(String(u.unitNumber))}"`));
        const next = units[idx + 1];
        if (next) out.push(chip('fa-forward', 'Unit kế tiếp', `Unit ${next.unitNumber} – ${next.title || ''}`, `data-unit="${escHtml(String(next.unitNumber))}"`));
        return out;
    }

    function topicSuggestions() {
        const lessons = (typeof lessonState !== 'undefined' && lessonState.publicLessons) || [];
        if (!lessons.length) return [];
        const out = [];
        const today = typeof _todaysLessonIndex === 'function' ? lessons[_todaysLessonIndex(lessons.length)] : null;
        if (today) out.push(chip('fa-calendar-day', 'Bài hôm nay', today.title || '', `data-lesson="${escHtml(String(today._id))}"`, 'hot'));
        const last = lessons.find(l => String(l._id) === lsGet(LAST_KEY.topics));
        if (last && (!today || last._id !== today._id)) {
            out.push(chip('fa-play', 'Học tiếp', last.title || '', `data-lesson="${escHtml(String(last._id))}"`));
        }
        return out;
    }

    function renderSuggest() {
        const el = $('pb-suggest');
        if (!el || !ctx) return;
        // Suggestions are noise while the student is searching for something specific.
        const searching = !!($('pb-search')?.value || '').trim();
        const chips = searching || !loaded[ctx] ? [] : (ctx === 'paraphrase' ? paraphraseSuggestions() : topicSuggestions());
        el.innerHTML = chips.length
            ? `<div class="pb-suggest-head"><i class="fas fa-wand-magic-sparkles"></i> Gợi ý cho bạn</div><div class="pb-suggest-row">${chips.join('')}</div>`
            : '';
        el.style.display = chips.length ? '' : 'none';
    }

    function fetchParaDueCount() {
        if (typeof API === 'undefined' || typeof authH !== 'function') return;
        const seq = ++dueSeq;
        fetch(`${API}/vocab/paraphrase/due-count`, { headers: authH() })
            .then(r => r.json())
            .then(d => {
                if (seq !== dueSeq) return;
                paraDueCount = (d && d.success && d.count) || 0;
                if (ctx === 'paraphrase') renderSuggest();
            })
            .catch(() => {});
    }

    /* ── "Cách học hiệu quả" (collapsible; open until the student closes it) ── */
    function renderGuide() {
        const g = GUIDES[ctx];
        const details = $('pb-guide');
        if (!details || !g) return;
        $('pb-guide-summary').innerHTML = `${g.summary}<span class="pb-guide-toggle"></span>`;
        $('pb-guide-body').innerHTML = `
            <ol class="pb-guide-steps">${g.steps.map(([t, d]) => `
                <li><div class="pb-guide-step-title">${t}</div><div class="pb-guide-step-desc">${d}</div></li>`).join('')}
            </ol>
            ${g.tip ? `<div class="pb-guide-tip"><i class="fas fa-circle-info"></i> <span>${g.tip}</span></div>` : ''}`;
        details.open = lsGet(GUIDE_KEY(ctx)) !== 'closed';
    }

    function renderHeader() {
        const m = META[ctx];
        $('pb-title').innerHTML = `<i class="fas ${m.icon}"></i> ${escHtml(m.title)}`;
        $('pb-sub').textContent = m.sub;
        const search = $('pb-search');
        search.value = '';
        search.placeholder = m.placeholder;
        const reviewBtn = $('pb-review-btn');
        if (reviewBtn) {
            reviewBtn.style.display = (ctx === 'paraphrase' && typeof window.openParaphraseReviewModal === 'function') ? '' : 'none';
        }
    }

    /* ── Show / clear ── */
    function show(kind, push = true) {
        if (!META[kind]) return;
        if (typeof _clearAutoNext === 'function') _clearAutoNext();
        // Leaving a lesson view: stop its quiz timer/state (askQuitPractice
        // already confirmed abandoning a mid-run quiz).
        if ($('view-lesson').style.display !== 'none' && typeof resetQuizState === 'function') resetQuizState();
        ctx = kind;
        if (typeof currentBookId !== 'undefined') currentBookId = null;
        document.querySelectorAll('.book-item, .sheet-book-item').forEach(el => el.classList.remove('active'));
        $('view-unit').style.display = 'none';
        $('view-lesson').style.display = 'none';
        $('view-mybook').style.display = 'flex';
        $('book-welcome').style.display = 'none';
        $('book-content').style.display = 'none';
        $('practice-browse').style.display = 'flex';
        const panel = $('kbd-hint-panel');
        if (panel) panel.style.display = 'none';
        const fab = $('mobFab');
        if (fab) fab.style.display = '';
        setSidebarActive(kind);
        renderHeader();
        renderGuide();
        renderBody();
        if (kind === 'paraphrase') fetchParaDueCount();
        $('practice-browse').scrollTop = 0;
        if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });
        if (typeof syncViewUrl === 'function') syncViewUrl(push ? 'push' : 'replace', { view: kind });
    }

    function clear() {
        ctx = null;
        const el = $('practice-browse');
        if (el) el.style.display = 'none';
        setSidebarActive(null);
    }

    /* ── Public API ── */
    window.openPracticeBrowse = function (kind, push = true) {
        if (typeof askQuitPractice === 'function') askQuitPractice(() => show(kind, push));
        else show(kind, push);
    };

    window.onPracticeDataLoaded = function (kind, data) {
        if (kind === 'paraphrase' && Array.isArray(data)) units = data;
        loaded[kind] = true;
        if (ctx === kind && isShowing()) renderBody();
    };

    window.PracticeBrowse = {
        context: () => ctx,
        show,
        clear,
    };

    /* ── Wiring (DOM is parsed — this script loads at the end of <body>) ── */
    const search = $('pb-search');
    if (search) {
        search.addEventListener('input', renderBody);
        search.addEventListener('keydown', e => {
            if (e.key === 'Escape' && search.value) { search.value = ''; renderBody(); }
        });
    }
    // Cards and suggestion chips share one handler; the pick is remembered
    // so the next visit can offer "Học tiếp" / "Unit kế tiếp".
    function onPick(e, selector) {
        const el = e.target.closest(selector);
        if (!el) return;
        if (el.dataset.review) { window.openParaphraseReviewModal(); return; }
        if (el.dataset.unit) {
            lsSet(LAST_KEY.paraphrase, el.dataset.unit);
            loadUnit(el.dataset.unit);
        } else if (el.dataset.lesson) {
            lsSet(LAST_KEY.topics, el.dataset.lesson);
            openLesson(el.dataset.lesson);
        }
    }
    const body = $('pb-body');
    if (body) body.addEventListener('click', e => onPick(e, '.pb-card'));
    const suggest = $('pb-suggest');
    if (suggest) suggest.addEventListener('click', e => onPick(e, '.pb-suggest-chip'));

    // Remember open/closed per list. Listening to the summary click (not the
    // async `toggle` event) so renderGuide()'s own `details.open = …` when
    // switching lists never gets written back under the wrong key.
    const guideSummary = $('pb-guide-summary');
    if (guideSummary) {
        guideSummary.addEventListener('click', () => {
            if (ctx) lsSet(GUIDE_KEY(ctx), $('pb-guide').open ? 'closed' : 'open');
        });
    }
})();
