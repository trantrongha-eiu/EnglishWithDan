// listening.html — "Bài lẻ" (single-section practice): mode switch, section
// lists, the practice screen and its submit/review. Shares the page's global
// lexical scope with js/listening.js (state, audio, renderQuestionGroup, …),
// which must load first.
'use strict';

/* ── State ─────────────────────────────────────────────────────────── */
let _ltOrigSection      = null;  // full section with correctAnswer
let _ltCleanSection     = null;  // stripped (no correctAnswer) for display
let _ltPracticePartNum  = null;
let _ltPracticeSectionId= null;
let _ltPracticeClientKey= null;  // BUG-A07: idempotency key for /practice/save, one per attempt
let _ltPracticeBackup   = null;  // saves state.answers etc. when entering practice
let _ltPracticeTimer    = null;
let _ltPracticeStartTime= 0;
let _ltPracticeDoneMap  = {};    // sectionId → { count, lastScore, lastTotal }
let _ltStatusFilter     = 'all'; // 'all' | 'done' | 'new'
let _ltSearchVal        = '';    // current text search value
const LT_PRACTICE_PARTS = [1, 2, 3, 4, 'actual'];
let _ltCategoryCache      = {}; // partNum -> { sections, doneMap }
let _ltGlobalSearchActive = false;
let _ltGlobalSearchToken  = 0;
let _ltPracticeElapsed  = 0;
let _ltPracticeSubmitted= false; // true after submitLTPractice() so dict/highlight work in result view
let _ltPracticeActive   = false; // true while practice screen is open (before submit)
// Test Simulation mode — 'practice' (default) | 'simulation'; set by
// _enterLTPracticeScreen() from what the student chose in
// startPracticeSection()'s ExamModeSelect popup. simAttemptId is the
// server-tracked ListeningPracticeAttempt row's _id (Simulation only —
// see listeningService.startPracticeSimulation).
let _ltPracticeMode        = 'practice';
let _ltPracticeSimAttemptId = null;

/* ── Helper ──────────────────────────────────────────────────────────── */
// Mirrors reading-v2.js's identical helper. Table/note-form/summary-
// completion groups store the REAL gap-fill sentence/cell on the
// GROUP's shared template (tableConfig/noteConfig/summaryConfig/...),
// each blank marked __Qn__ (same convention the live-test renderers
// already use, see this file's own /__Q(\d+)__/g replace calls) —
// each individual question's own questionText is frequently left as
// an unfilled content-authoring placeholder ("Question 9") for these
// group types.
function findTemplateContext(group, qNum) {
    if (!group) return null;
    const marker = `__Q${qNum}__`;
    let found = null;
    function walk(val) {
        if (found) return;
        if (typeof val === 'string') { if (val.includes(marker)) found = val; return; }
        if (Array.isArray(val)) { val.forEach(walk); return; }
        if (val && typeof val === 'object') Object.values(val).forEach(walk);
    }
    ['tableConfig', 'noteConfig', 'bulletConfig', 'summaryConfig', 'endingsConfig', 'dragDropConfig', 'headingsConfig']
        .forEach(key => { if (!found && group[key]) walk(group[key]); });
    // Blank out EVERY __Qn__ marker in the found line, not just this
    // question's own — see reading-v2.js's identical comment for why
    // (a shared sentence/row/table cell often carries sibling
    // questions' blanks too).
    return found ? found.replace(/__Q\d+__/g, '_____') : null;
}

function _ltGetAllQs(section) {
    return (section?.questionGroups || []).flatMap(g => (g.questions || []).map(q => ({
        ...q,
        _templateContext: findTemplateContext(g, q.questionNumber),
    })));
}

// Single-section practice equivalent of _saveListeningHighlightsToStorage()
// (defined in js/listening.js, shared via the page's global
// lexical scope). A practice attempt only gets an id when it's submitted,
// so until then its highlights are a local draft keyed by sectionId —
// _doSubmitLTPractice() replaces lt-practice-questions-inner wholesale on
// submit (review adds correct/wrong indicators the live practice markup
// doesn't have) and re-applies them from that draft. The submit sends them
// along with the result, and from then on they belong to that attempt id
// (local copy + server), so redoing the same section no longer
// overwrites — or wipes — what an earlier attempt's review shows.
function _ltHlStorageKey(sectionId) { return `ews_listening_hl_lt_${sectionId}`; }
function _ltAttemptHlStorageKey(attemptId) { return `ews_listening_hl_ltp_${attemptId}`; }
let _ltSavedAttemptId = null; // set once the practice attempt exists on the server

function _collectLtPracticeHighlights() {
    const questionsInner  = document.getElementById('lt-practice-questions-inner');
    const transcriptInner = document.getElementById('lt-practice-transcript-body');
    return window.HighlightStore.build({
        0: {
            p: window.HighlightStore.serialize(transcriptInner),
            q: window.HighlightStore.extractTexts(questionsInner ? questionsInner.innerHTML : ''),
        },
    });
}

function _saveLtPracticeHighlightsToStorage() {
    const HS = window.HighlightStore;
    const sectionId = _ltPracticeSectionId;
    if (!_ltSavedAttemptId && !sectionId) return;
    const data = _collectLtPracticeHighlights();
    if (_ltSavedAttemptId) {
        HS.writeLocal(_ltAttemptHlStorageKey(_ltSavedAttemptId), data);
        HS.saveRemote('listening-practice', _ltSavedAttemptId, data);
    } else {
        HS.writeLocal(_ltHlStorageKey(sectionId), data);
    }
}
window._saveLtPracticeHighlightsToStorage = _saveLtPracticeHighlightsToStorage;

/* ── Stopwatch ───────────────────────────────────────────────────────── */
function _startLTPracticeTimer(totalQ) {
    _ltPracticeStartTime = Date.now();
    _ltPracticeElapsed   = 0;
    _clearLTPracticeTimer();
    const swEl   = document.getElementById('lt-practice-stopwatch');
    const txtEl  = document.getElementById('lt-practice-progress-txt');
    const barWrap= document.getElementById('lt-practice-prog-bar');
    const barFill= document.getElementById('lt-practice-prog-fill');
    if (swEl)    { swEl.textContent = '00:00'; swEl.className = 'practice-stopwatch'; swEl.style.display = ''; }
    if (txtEl)   { txtEl.textContent = `0 / ${totalQ} câu`; txtEl.style.display = ''; }
    if (barWrap) barWrap.style.display = '';
    if (barFill) { barFill.style.width = '0%'; barFill.className = 'practice-prog-fill'; }
    _ltPracticeTimer = setInterval(() => {
        const secs = Math.floor((Date.now() - _ltPracticeStartTime) / 1000);
        _ltPracticeElapsed = secs;
        const m = String(Math.floor(secs / 60)).padStart(2, '0');
        const s = String(secs % 60).padStart(2, '0');
        if (swEl) {
            swEl.textContent = `${m}:${s}`;
            swEl.className = secs >= 1200 ? 'practice-stopwatch sw-slow'
                           : secs >= 600  ? 'practice-stopwatch sw-medium'
                           : 'practice-stopwatch';
        }
    }, 1000);
}

function _stopLTPracticeTimer() {
    _clearLTPracticeTimer();
    const swEl = document.getElementById('lt-practice-stopwatch');
    if (swEl) swEl.classList.add('sw-stopped');
    return _ltPracticeElapsed;
}

function _clearLTPracticeTimer() {
    if (_ltPracticeTimer) { clearInterval(_ltPracticeTimer); _ltPracticeTimer = null; }
    _cancelLTAutoPlay();
    _cancelListeningReviewCountdown();
}

/* ── Test Simulation: audio auto-plays after a short countdown ───────── */
let _ltAutoPlayTimer = null;
function _setLTAudioStatus(html, color) {
    const el = document.getElementById('lt-practice-audio-status');
    if (!el) return;
    el.innerHTML = html || '';
    el.style.color = color || '';
    el.style.display = html ? '' : 'none';
}
function _cancelLTAutoPlay() {
    if (_ltAutoPlayTimer) { clearInterval(_ltAutoPlayTimer); _ltAutoPlayTimer = null; }
    audio.removeEventListener('play', _cancelLTAutoPlay);
    _setLTAudioStatus('');
}
function _startLTAutoPlay(secs) {
    _cancelLTAutoPlay();
    let left = secs;
    const show = () => _setLTAudioStatus(`<i class="fas fa-clock"></i> Audio tự phát sau ${left}s`, left <= 3 ? '#f59e0b' : '');
    show();
    // Student pressing ▶ early just starts it — drop the countdown.
    audio.addEventListener('play', _cancelLTAutoPlay);
    _ltAutoPlayTimer = setInterval(() => {
        if (--left > 0) return show();
        _cancelLTAutoPlay();
        // No user gesture in this call stack — the browser's autoplay
        // policy can refuse; say so instead of failing silently.
        audio.play().catch(err => {
            console.error('[_startLTAutoPlay] play() failed:', err);
            _setLTAudioStatus('<i class="fas fa-exclamation-triangle"></i> Không tự phát được — bấm ▶', '#dc2626');
            audio.addEventListener('play', () => _setLTAudioStatus(''), { once: true });
        });
    }, 1000);
}

function _hideLTPracticeHUD() {
    ['lt-practice-stopwatch', 'lt-practice-progress-txt', 'lt-practice-prog-bar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function _updateLTPracticeProgress() {
    if (!_ltPracticeTimer) return;
    const allQ   = _ltGetAllQs(_ltCleanSection);
    const total  = allQ.length;
    const answered = allQ.filter(q => {
        const a = state.answers[q.questionNumber];
        return a && a !== '[]';
    }).length;
    const txtEl  = document.getElementById('lt-practice-progress-txt');
    const barFill= document.getElementById('lt-practice-prog-fill');
    const pct    = total ? Math.round(answered / total * 100) : 0;
    if (txtEl)   txtEl.textContent = `${answered} / ${total} câu`;
    if (barFill) {
        barFill.style.width = `${pct}%`;
        barFill.className = answered === total ? 'practice-prog-fill fill-done'
                          : pct >= 50          ? 'practice-prog-fill fill-half'
                          : 'practice-prog-fill';
    }
    // Highlight answered q-nav buttons
    document.querySelectorAll('#lt-practice-q-nav .q-nav-btn').forEach(btn => {
        const m = (btn.getAttribute('onclick') || '').match(/\d+/);
        if (m) {
            const a = state.answers[+m[0]];
            btn.classList.toggle('q-nav-answered', !!(a && a !== '[]'));
        }
    });
    if (window.CDFooter && window.CDFooter.isMounted()) window.CDFooter.refresh();
}

/* ── Bài lẻ list part: 'all' (default, every section) | 1–4 | 'actual' ── */
function _ltParsePart(raw) {
    if (raw === 'actual') return 'actual';
    const n = parseInt(raw);
    return [1, 2, 3, 4].includes(n) ? n : 'all';
}
function _ltListUrl(part) {
    return part === 'all' ? '?mode=single' : `?mode=single&part=${part}`;
}

/* ── Mode switch (Full đề ↔ Bài lẻ) ─────────────────────────────────── */
function setListeningMode(mode, pushHistory = true) {
    const isLele = mode === 'lele';
    const isTips = mode === 'tips';
    if (pushHistory) {
        const activeTab = document.querySelector('#lele-picker-lt .plele-tab.plele-active');
        const part = activeTab?.dataset.part ?? 'all';
        if (isLele) {
            history.pushState({ screen: 'list', mode: 'single', part }, '', _ltListUrl(part));
        } else if (isTips) {
            history.pushState({ screen: 'list', mode: 'tips' }, '', '?mode=tips');
        } else {
            history.pushState({ screen: 'list', mode: 'full' }, '', '?mode=full');
        }
    }
    document.getElementById('ls-mode-full')?.classList.toggle('rmode-active', !isLele && !isTips);
    document.getElementById('ls-mode-lele')?.classList.toggle('rmode-active', isLele);
    document.getElementById('ls-mode-tips')?.classList.toggle('rmode-active', isTips);

    const picker   = document.getElementById('lele-picker-lt');
    const wrapper  = document.getElementById('tests-wrapper');
    const banner   = document.getElementById('resume-banner');
    const filterBar= document.getElementById('ls-filter-bar');
    const subtitle = document.getElementById('ls-mode-subtitle');
    const title    = document.getElementById('ls-mode-title');
    const tipsPanel= document.getElementById('listening-tips-panel');

    const leleHdrBtns = document.getElementById('lele-header-btns');
    const testsPag    = document.getElementById('tests-pagination');
    if (picker)       picker.classList.toggle('hidden', !isLele);
    if (wrapper)      wrapper.style.display    = (isLele || isTips) ? 'none' : '';
    if (banner)       banner.style.display     = (isLele || isTips) ? 'none' : (banner._resumeData ? 'flex' : 'none');
    if (filterBar)    filterBar.style.display  = (isLele || isTips) ? 'none' : '';
    if (leleHdrBtns)  leleHdrBtns.style.display= isLele ? 'flex' : 'none';
    if (testsPag)     testsPag.style.display   = (isLele || isTips) ? 'none' : '';
    if (tipsPanel)    tipsPanel.classList.toggle('hidden', !isTips);
    if (!isLele) { const inp = document.getElementById('lt-practice-search-input'); if (inp) inp.value = ''; _ltSearchVal = ''; }
    if (subtitle)  subtitle.style.display   = (isLele || isTips) ? 'none' : '';
    if (title) {
        title.innerHTML = isLele
            ? 'Luyện tập <span class="ls-tag-blue">Listening Bài lẻ</span>'
            : isTips
            ? 'Luyện tập <span class="ls-tag-blue">Listening Tips</span>'
            : 'Luyện tập <span class="tag-red">Listening Full đề</span>';
    }
    if (isLele) {
        const listEl = document.getElementById('lt-section-list');
        if (listEl && !listEl.children.length) {
            const activeTab = document.querySelector('#lele-picker-lt .plele-tab.plele-active');
            loadPracticeSections(_ltParsePart(activeTab?.dataset.part));
        }
    } else if (isTips) {
        if (typeof initListeningTips === 'function') initListeningTips();
    }
}

// Debounced — _ltRunGlobalSearch() can trigger real network fetches
// (first search across a part not yet cached), so this was firing a
// fetch + full re-render on every keystroke.
let _ltFilterTimer = null;
function filterLtPracticeCards(query) {
    clearTimeout(_ltFilterTimer);
    _ltFilterTimer = setTimeout(() => _runLtPracticeFilter(query), 250);
}

function _runLtPracticeFilter(query) {
    _ltSearchVal = (query || '').trim().toLowerCase();
    _ltPage = 1;
    if (_ltSearchVal) {
        _ltRunGlobalSearch();
    } else {
        _ltGlobalSearchActive = false;
        const cur = _ltCategoryCache[_ltCurrentPart];
        if (cur) { _ltAllSections = cur.sections; _ltPracticeDoneMap = cur.doneMap; }
        rerenderLtSections();
    }
}

// Tìm kiếm xuyên suốt toàn bộ đề (Section 1-4 + Actual Tests), không chỉ trong tab đang mở
async function _ltRunGlobalSearch() {
    const token = ++_ltGlobalSearchToken;
    const toFetch = LT_PRACTICE_PARTS.filter(p => !_ltCategoryCache[p]);
    if (toFetch.length) {
        const listEl = document.getElementById('lt-section-list');
        if (listEl && !_ltGlobalSearchActive) {
            listEl.innerHTML = `<div style="text-align:center;padding:40px 16px;color:#9ca3af"><i class="fas fa-spinner fa-spin" style="font-size:24px"></i><div style="font-size:14px;margin-top:10px">Đang tìm trong toàn bộ đề...</div></div>`;
        }
        await Promise.all(toFetch.map(async part => {
            try {
                const url = part === 'actual'
                    ? `${API}/listening/practice/list?actualTest=true`
                    : `${API}/listening/practice/list?part=${part}`;
                const res  = await fetch(url, { headers: authH() });
                const data = await safeJson(res);
                _ltCategoryCache[part] = { sections: data.sections || [], doneMap: data.doneMap || {} };
            } catch (e) {
                _ltCategoryCache[part] = { sections: [], doneMap: {} };
            }
        }));
    }
    if (token !== _ltGlobalSearchToken) return; // một tìm kiếm mới hơn đã bắt đầu

    _ltGlobalSearchActive = true;
    const merged = new Map();
    LT_PRACTICE_PARTS.forEach(part => {
        (_ltCategoryCache[part]?.sections || []).forEach(s => {
            const id = s._id?.toString();
            const existing = merged.get(id);
            if (!existing || (part === 'actual' && !existing.__isActual)) {
                merged.set(id, Object.assign({}, s, { __isActual: part === 'actual' }));
            }
        });
    });
    _ltPracticeDoneMap = Object.assign({}, ...LT_PRACTICE_PARTS.map(part => _ltCategoryCache[part]?.doneMap || {}));
    // Results come from several tabs — re-sort A–Z like each tab's own list.
    _ltAllSections = [...merged.values()].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', 'en', { numeric: true, sensitivity: 'base' }));
    rerenderLtSections();
}

function filterLtByStatus(filter, btn) {
    document.querySelectorAll('#lt-practice-filter-bar .pf-btn').forEach(b => b.classList.remove('pf-active'));
    if (btn) btn.classList.add('pf-active');
    _ltStatusFilter = filter;
    _ltPage = 1;
    rerenderLtSections();
}

function _applyLtFilters() {
    _ltPage = 1;
    rerenderLtSections();
}

function getLtFilteredSections() {
    return _ltAllSections.filter(s => {
        const title  = (s.title || '').toLowerCase();
        const isDone = !!_ltPracticeDoneMap[s._id?.toString()];
        const passTitle  = !_ltSearchVal || title.includes(_ltSearchVal);
        const passStatus = _ltStatusFilter === 'all'
            || (_ltStatusFilter === 'done' && isDone)
            || (_ltStatusFilter === 'new'  && !isDone);
        return passTitle && passStatus;
    });
}

function _ltRenderSectionCard(s) {
    // Mixed lists (search, 'all' tab) label each card with its own section.
    const partNum   = (_ltGlobalSearchActive || _ltCurrentPart === 'all')
        ? ((s.__isActual || s.isActualTest) ? 'actual' : s.partNumber)
        : _ltCurrentPart;
    const isActual  = partNum === 'actual';
    const clsMap    = { 1:'p1', 2:'p2', 3:'p3', 4:'p4' };
    const cls       = isActual ? 'at' : (clsMap[partNum] || 'p1');
    const typeLabel = {
        'multiple-choice':'Multiple Choice', 'fill-blank':'Gap Filling',
        'sentence-completion':'Sentence Completion', 'matching':'Matching',
        'map-labelling':'Map Labelling', 'checkbox':'Multiple Choice',
        'multi-answer-group':'Multiple Choice', 'matching-info':'Matching Info',
        'table':'Form/Table', 'note-form':'Note Form', 'bullet-list':'Bullet List',
        'plain':'Short Answer', 'map':'Map Labelling',
        'matching-options':'Matching', 'summary-completion':'Summary',
        'sentence-endings':'Sentence Endings'
    };
    const qtypes   = [...new Set((s.questionGroups || []).flatMap(g =>
        (g.questions || []).map(q => typeLabel[q.type] || typeLabel[g.groupType] || g.groupType)
    ))].slice(0, 3);
    const dur       = s.audioDuration ? `${Math.floor(s.audioDuration/60)}:${pad(s.audioDuration%60)} phút` : '';
    const partCls   = clsMap[s.partNumber] || 'p1';
    const cardCls   = isActual ? partCls : cls;
    const cardLabel = isActual
        ? `<div style="position:absolute;bottom:8px;left:8px;display:flex;gap:4px;align-items:center">
                <span class="practice-card-cat-badge at" style="position:static">Đề thật</span>
                <span class="practice-card-cat-badge ${partCls}" style="position:static;font-size:9px;padding:2px 6px">S${s.partNumber}</span>
               </div>`
        : `<span class="practice-card-cat-badge ${cls}">Section ${partNum}</span>`;
    const doneInfo   = _ltPracticeDoneMap[s._id?.toString()];
    const doneAttr   = doneInfo ? ' data-done="1"' : '';
    const donePct    = doneInfo?.lastTotal ? Math.round(doneInfo.lastScore / doneInfo.lastTotal * 100) : 0;
    const doneRibbon = doneInfo ? `<span class="practice-done-ribbon">✓ ${doneInfo.count}x · ${donePct}%</span>` : '';
    const btnText    = _userPlan !== 'premium'
        ? '<i class="fas fa-lock" style="font-size:11px;margin-right:4px"></i> Upgrade gói'
        : (doneInfo ? `<i class="fas fa-redo"></i> Làm lại · ${s.questionCount} câu` : `<i class="fas fa-play"></i> Làm bài · ${s.questionCount} câu`);
    const btnCls     = `practice-card-btn ${cardCls}${_userPlan !== 'premium' ? ' btn-upgrade-lock' : (doneInfo ? ' redo' : '')}`;
    const partArg    = isActual ? s.partNumber : partNum;
    // Cover: the section's own image when it has one, otherwise the Daniel logo
    const cover = s.thumbnail
        ? `<img class="practice-cover-img" src="${escHtml(s.thumbnail)}" alt="" loading="lazy" onerror="this.parentNode.classList.remove('has-img');this.remove()">`
        : '';
    return `<div class="practice-card"${doneAttr} data-pid="${s._id}" onclick="startPracticeSection('${s._id}',${partArg})">
            <div class="practice-card-cover${cover ? ' has-img' : ''}">
                <div class="practice-cover-logo"><span>D</span>aniel</div>
                ${cover}
                ${cardLabel}
                ${doneRibbon}
                <button class="pc-share-btn" onclick="event.stopPropagation();copyLtPracticeLink('${s._id}',${partArg})" title="Sao chép link bài này"><i class="fas fa-link"></i></button>
            </div>
            <div class="practice-card-body">
                <div class="practice-card-title">${escHtml(s.title)}</div>
                <div class="practice-card-qtypes">${qtypes.map(t => `· ${t}`).join('<br>')}${dur ? `<br><small class="ls-card-dur"><i class="fas fa-music"></i> ${dur}</small>` : ''}</div>
                ${s.hasGapFill ? `<button class="practice-card-btn-gapfill" onclick="event.stopPropagation();startGapFillSection('${s._id}')"><i class="fas fa-pen"></i> Gap-fill</button>` : ''}
                <button class="${btnCls}" onclick="event.stopPropagation();startPracticeSection('${s._id}',${partArg})">${btnText}</button>
                ${s.hasWarmUp ? `<button class="practice-card-btn-warmup" onclick="event.stopPropagation();LtWarmUp.start('${s._id}',${partArg})"><i class="fas fa-fire"></i> Warm-up trước khi nghe</button>` : ''}
            </div>
        </div>`;
}

function rerenderLtSections() {
    const listEl = document.getElementById('lt-section-list');
    if (!listEl) return;
    const filtered = getLtFilteredSections();
    if (filtered.length === 0 && _ltAllSections.length > 0) {
        const icon = _ltSearchVal
            ? '<i class="fas fa-search" style="font-size:32px;color:#9ca3af"></i>'
            : (_ltStatusFilter === 'done'
                ? '<i class="fas fa-clipboard-list" style="font-size:32px;color:#9ca3af"></i>'
                : '<i class="fas fa-check-circle" style="font-size:32px;color:#9ca3af"></i>');
        const msg = _ltSearchVal
            ? `Không tìm thấy bài nào khớp với "<strong>${escHtml(_ltSearchVal)}</strong>"`
            : _ltStatusFilter === 'done' ? 'Chưa làm bài nào trong mục này'
            : 'Đã làm tất cả bài trong mục này rồi!';
        listEl.innerHTML = `<div style="text-align:center;padding:40px 16px;color:#9ca3af"><div style="margin-bottom:10px">${icon}</div><div style="font-size:14px">${msg}</div></div>`;
        const pag = document.getElementById('lt-practice-pagination');
        if (pag) pag.innerHTML = '';
        return;
    }
    const start = (_ltPage - 1) * LT_PRACTICE_PAGE_SIZE;
    const pageItems = filtered.slice(start, start + LT_PRACTICE_PAGE_SIZE);
    listEl.innerHTML = `<div class="practice-card-grid">${pageItems.map(_ltRenderSectionCard).join('')}</div>`;
    renderLtPracticePagination(filtered.length, _ltPage);
}

function renderLtPracticePagination(total, page) {
    const container = document.getElementById('lt-practice-pagination');
    if (!container) return;
    const pages = Math.ceil(total / LT_PRACTICE_PAGE_SIZE);
    if (pages <= 1) { container.innerHTML = ''; return; }
    let start = Math.max(1, page - 2);
    let end   = Math.min(pages, page + 2);
    if (end - start < 4) { if (start === 1) end = Math.min(pages, 5); else start = Math.max(1, end - 4); }
    let html = '<div class="pg-wrap">';
    html += `<button class="pg-btn" onclick="goToLtPracticePage(${page - 1})" ${page === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
    if (start > 1) { html += `<button class="pg-btn" onclick="goToLtPracticePage(1)">1</button>`; if (start > 2) html += `<span class="pg-ellipsis">…</span>`; }
    for (let i = start; i <= end; i++) html += `<button class="pg-btn${i === page ? ' pg-active' : ''}" onclick="goToLtPracticePage(${i})">${i}</button>`;
    if (end < pages) { if (end < pages - 1) html += `<span class="pg-ellipsis">…</span>`; html += `<button class="pg-btn" onclick="goToLtPracticePage(${pages})">${pages}</button>`; }
    html += `<button class="pg-btn" onclick="goToLtPracticePage(${page + 1})" ${page === pages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
    html += `<span class="pg-info">Trang ${page}/${pages} · ${total} bài</span></div>`;
    container.innerHTML = html;
}

function goToLtPracticePage(p) {
    const filtered = getLtFilteredSections();
    const pages = Math.ceil(filtered.length / LT_PRACTICE_PAGE_SIZE) || 1;
    if (p < 1 || p > pages) return;
    _ltPage = p;
    rerenderLtSections();
    document.getElementById('lt-section-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

let _ltLoadingPart = 0; // race-condition lock
let _ltPage = 1;
const LT_PRACTICE_PAGE_SIZE = 15;
let _ltAllSections = [];
let _ltCurrentPart = 'all';
let _ltListToken = 0;

/* ── Load section list for a part ───────────────────────────────────── */
async function loadPracticeSections(partNum, tabEl) {
    if (_ltLoadingPart === partNum) return; // đang load part này rồi, bỏ qua
    _ltLoadingPart = partNum;

    // Update URL to reflect active section tab
    history.replaceState({ screen: 'list', mode: 'single', part: partNum }, '', _ltListUrl(partNum));

    document.querySelectorAll('#lele-picker-lt .plele-tab').forEach(b => b.classList.remove('plele-active'));
    const tab = tabEl || document.querySelector(`#lele-picker-lt .plele-tab[data-part="${partNum}"]`);
    if (tab) tab.classList.add('plele-active');

    const listEl = document.getElementById('lt-section-list');
    if (!listEl) return;

    const isActual = partNum === 'actual';
    const clsMap  = { 1:'p1', 2:'p2', 3:'p3', 4:'p4' };
    const cls     = isActual ? 'at' : (clsMap[partNum] || 'p1');
    const typeLabel = {
        'multiple-choice':'Multiple Choice', 'fill-blank':'Gap Filling',
        'sentence-completion':'Sentence Completion', 'matching':'Matching',
        'map-labelling':'Map Labelling', 'checkbox':'Multiple Choice',
        'multi-answer-group':'Multiple Choice', 'matching-info':'Matching Info',
        'table':'Form/Table', 'note-form':'Note Form', 'bullet-list':'Bullet List',
        'plain':'Short Answer', 'map':'Map Labelling',
        'matching-options':'Matching', 'summary-completion':'Summary',
        'sentence-endings':'Sentence Endings'
    };

    // Skeleton
    listEl.innerHTML = `<div class="practice-card-grid">${Array(3).fill(0).map(() => `
            <div class="practice-card practice-card-sk">
                <div class="practice-card-cover"></div>
                <div class="practice-card-body">
                    <div class="sk-line" style="height:14px;width:85%"></div>
                    <div class="sk-line" style="height:12px;width:60%"></div>
                    <div class="sk-line" style="height:32px;width:100%;margin-top:8px;border-radius:7px"></div>
                </div>
            </div>`).join('')}</div>`;

    // Latest call wins — a slower response for the previously clicked
    // tab must not repaint the list (see reading-v2.js's _rdListToken).
    const _token = ++_ltListToken;
    try {
        const url = isActual
            ? `${API}/listening/practice/list?actualTest=true`
            : `${API}/listening/practice/list?part=${partNum}`;
        const res = await fetch(url, { headers: authH() });
        const data = await safeJson(res);
        if (_token !== _ltListToken) return;
        _ltCurrentPart = partNum;
        if (!data.success) throw new Error(data.message);
        const sections = data.sections || [];
        _ltPracticeDoneMap = data.doneMap || {};

        if (!sections.length) {
            _ltAllSections = [];
            const emptyLabel = isActual ? 'Actual Tests' : partNum === 'all' ? 'Mục này' : `Section ${partNum}`;
            listEl.innerHTML = `<div style="text-align:center;padding:56px 24px;color:#9ca3af;max-width:420px;margin:0 auto">
                    <div style="font-size:48px;margin-bottom:16px"><i class="fas fa-music" style="color:#9ca3af"></i></div>
                    <div style="font-size:16px;font-weight:700;color:#374151;margin-bottom:8px">Chưa có bài lẻ nào</div>
                    <div style="font-size:14px;line-height:1.6">${emptyLabel} chưa có bài luyện tập.<br>Admin sẽ thêm bài sớm nhé!</div>
                </div>`;
            const countEl = document.getElementById('lt-practice-done-count');
            if (countEl) countEl.textContent = '';
            const pag = document.getElementById('lt-practice-pagination');
            if (pag) pag.innerHTML = '';
            return;
        }

        // Store for paginated filtering
        _ltCategoryCache[partNum] = { sections, doneMap: data.doneMap || {} };
        _ltGlobalSearchActive = false;
        _ltAllSections  = sections;
        _ltCurrentPart  = partNum;
        _ltStatusFilter = 'all';
        _ltSearchVal    = '';
        const inp = document.getElementById('lt-practice-search-input');
        if (inp) inp.value = '';
        document.querySelectorAll('#lt-practice-filter-bar .pf-btn').forEach((b, i) => b.classList.toggle('pf-active', i === 0));

        // Done count label (based on all sections, not filtered)
        const doneCount = sections.filter(s => _ltPracticeDoneMap[s._id?.toString()]).length;
        const countEl = document.getElementById('lt-practice-done-count');
        if (countEl) countEl.textContent = `${doneCount}/${sections.length} đã làm`;

        _ltPage = 1;
        rerenderLtSections();
    } catch(e) {
        if (_token !== _ltListToken) return;
        listEl.innerHTML = `<div class="ls-section-error">
                Lỗi tải danh sách: ${e.message}
                <br><button class="btn-ghost" style="margin-top:12px" onclick="loadPracticeSections('${partNum}')">Thử lại</button>
            </div>`;
    } finally {
        if (_token === _ltListToken) _ltLoadingPart = 0; // mở lock khi xong
    }
}

/* ── Start practice for one section ─────────────────────────────────── */
// The tab a section really belongs to — ?part= can be missing (homework
// links) or stale; same bug/fix as reading-v2.js's _rdPassageCategory.
function _ltSectionPart(section, hinted) {
    if (hinted === 'actual' && section.isActualTest) return 'actual';
    return section.partNumber || hinted || 1;
}

async function startPracticeSection(sectionId, partNum, _silent = false, mode = null, preferred = null) {
    if (!window.AuthService.hasPremiumAccess()) {
        openUpgradeModal(); return;
    }

    // Show the Practice/Test Simulation popup once per fresh start — not
    // on a popstate/URL-resume (_silent) or the recursive call this
    // popup's own callbacks make with `mode` already decided.
    if (!_silent && !mode && window.ExamModeSelect) {
        window.ExamModeSelect.open({
            skill: 'listening', preferred,
            onPractice: () => startPracticeSection(sectionId, partNum, _silent, 'practice'),
            onSimulation: () => startPracticeSection(sectionId, partNum, _silent, 'simulation'),
        });
        return;
    }
    mode = mode || 'practice';

    const cards = document.querySelectorAll('#lt-section-list .practice-card');
    const clickedCard = document.querySelector(`#lt-section-list .practice-card[data-pid="${sectionId}"]`);
    cards.forEach(c => {
        if (c === clickedCard) {
            const btn = c.querySelector('.practice-card-btn');
            if (btn) { btn._origText = btn.textContent; btn.textContent = '⏳ Đang tải...'; }
            c.style.pointerEvents = 'none';
        } else {
            c.style.opacity = '0.5';
            c.style.pointerEvents = 'none';
        }
    });
    try {
        const res  = await fetch(`${API}/listening/practice/by-id/${sectionId}`, { headers: authH() });
        const data = await safeJson(res);
        if (!data.success || !data.section) { toast('Không tải được bài luyện tập', 'error'); return; }

        const _realPart = _ltSectionPart(data.section, partNum);
        if (String(_realPart) !== String(partNum)) {
            partNum = _realPart;
            // Still on the list entry the init block wrote with the
            // guessed part — fix it and the highlighted tab/list.
            if (!_silent && history.state?.screen === 'list') loadPracticeSections(partNum);
        }

        // Test Simulation mode: get a server-tracked attempt row up
        // front (so a strike has something to attach to) before
        // entering the practice screen — see reading-v2.js's identical
        // startPractice() flow for the full rationale.
        let simAttemptId = null;
        if (mode === 'simulation') {
            try {
                const simRes = await fetch(`${API}/listening/practice/start-simulation`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', ...authH() },
                    body: JSON.stringify({ sectionId, sectionTitle: data.section.title || '', partNumber: partNum })
                });
                const simData = await safeJson(simRes);
                if (!simData.success) { toast(simData.message || 'Không thể bắt đầu Test Simulation', 'error'); return; }
                simAttemptId = simData.attemptId;
            } catch (simErr) {
                if (simErr.status === 429 && simErr.body && simErr.body.code === 'SIMULATION_COOLDOWN') {
                    toast(simErr.body.message || 'Vui lòng đợi trước khi bắt đầu Test Simulation mới', 'error');
                } else {
                    toast('Lỗi kết nối server', 'error');
                }
                return;
            }
        }

        {
            const _url = `?sectionId=${sectionId}&part=${partNum}&exam=${mode}`;
            const _st = { screen: 'practice', sectionId, part: partNum, exam: mode };
            if (!_silent) history.pushState(_st, '', _url);
            else history.replaceState(_st, '', _url);
        }
        _enterLTPracticeScreen(data.section, partNum, sectionId, mode, simAttemptId);
    } catch(e) {
        if (e.body && e.body.code === 'REVIEW_REQUIRED') {
            toast('Bạn cần hoàn thành review bài trước đó trước khi bắt đầu bài mới', 'warning');
            _goToPendingReview(e.body);
        } else {
            toast('Lỗi: ' + (e?.message || 'Không xác định'), 'error');
            console.error('[startPracticeSection]', e);
        }
    }
    finally {
        cards.forEach(c => {
            c.style.opacity = '';
            c.style.pointerEvents = '';
            const btn = c.querySelector('.practice-card-btn');
            if (btn && btn._origText) { btn.textContent = btn._origText; btn._origText = null; }
        });
    }
}

/* ── Enter practice screen ───────────────────────────────────────────── */
function _enterLTPracticeScreen(section, partNum, sectionId, mode = 'practice', simAttemptId = null) {
    _ltOrigSection       = section;
    _ltPracticePartNum   = partNum;
    _ltPracticeSectionId = sectionId;
    _ltSavedAttemptId    = null;
    _ltPracticeSubmitted = false;
    _ltPracticeActive    = true;
    _ltPracticeMode        = mode;
    _ltPracticeSimAttemptId = simAttemptId;
    if (mode === 'simulation' && window.ExamProctor) {
        window.ExamProctor.start({
            skill: 'listening', attemptType: 'practice', attemptId: simAttemptId,
            onDisqualified: () => {
                window.onbeforeunload = null;
                location.href = 'listening.html';
            },
            // Answers so far, kept voided server-side — see _saveDisqualifiedListening.
            saveAnswers: () => fetch(`${API}/listening/practice/save`, {
                method: 'POST', headers: authH(), keepalive: true,
                body: JSON.stringify({
                    sectionId, sectionTitle: section.title || '', partNumber: partNum || section.partNumber || 1,
                    answers: Object.entries(state.answers || {}).map(([q, a]) => ({ questionNumber: Number(q), userAnswer: String(a ?? '') })),
                    timeTaken: _ltPracticeStartTime ? Math.floor((Date.now() - _ltPracticeStartTime) / 1000) : 0,
                    attemptId: simAttemptId, disqualified: true,
                }),
            }),
        });
    }
    // BUG-A07: fresh idempotency key per practice attempt — the save is
    // fire-and-forget, so a double fire must not duplicate the row.
    _ltPracticeClientKey = (crypto.randomUUID && crypto.randomUUID())
        || ('lk-' + Date.now() + '-' + Math.random().toString(36).slice(2));
    const tpEnter = document.getElementById('lt-practice-transcript-panel');
    if (tpEnter) tpEnter.style.display = 'none';
    setTool('none');

    // Backup exam state so we can restore on close
    _ltPracticeBackup = { answers: state.answers, currentTestId: state.currentTestId,
                          currentTest: state.currentTest, partIdx: state.partIdx, isReview: state.isReview };

    // Swap answers to a fresh object (all existing answer funcs write here)
    state.answers = {};
    state.isReview = false;

    // Clean section: strip correctAnswer (keep explanation for after submit)
    _ltCleanSection = JSON.parse(JSON.stringify(section));
    _ltGetAllQs(_ltCleanSection).forEach(q => {
        delete q.correctAnswer;
        delete q.userAnswer;
        delete q.isCorrect;
    });

    // Render header + questions
    const inner = document.getElementById('lt-practice-questions-inner');
    let html = `<div class="section-header-card">
            <div class="section-part-label">Section ${partNum}</div>
            <div class="section-title-text">${escHtml(section.title || '')}</div>
            ${section.description ? `<div class="section-desc">${escHtml(section.description)}</div>` : ''}
            <div class="section-range">Câu ${section.questionRange?.start ?? ''}–${section.questionRange?.end ?? ''}</div>
        </div>`;
    (_ltCleanSection.questionGroups || []).forEach((group, gi) => {
        html += renderQuestionGroup(group, gi, false);
    });
    inner.innerHTML = html;
    _ltGetAllQs(_ltCleanSection).forEach(q => restoreAnswer(q));
    refreshWordChips();
    setupDragDrop(inner);
    setupDictionaryDouble('lt-practice-questions', 'listening', _ltDictGate);

    // Q-nav
    const nav = document.getElementById('lt-practice-q-nav');
    if (nav) {
        nav.innerHTML = _ltGetAllQs(_ltCleanSection)
            .map(q => `<button class="q-nav-btn" id="lt-qnb-${q.questionNumber}" onclick="ltScrollToQ(${q.questionNumber})">${q.questionNumber}</button>`)
            .join('');
    }

    // Audio
    audio.pause();
    audio.src = section.audioUrl || '';
    audio.load();
    const prBtn = document.getElementById('play-btn-pr');
    if (prBtn) prBtn.innerHTML = '<i class="fas fa-play"></i>';
    // Test Simulation: 30s to check answers once the audio ends, then
    // auto-submit (same banner as the full test — see
    // _startListeningReviewCountdown). Practice just gets a nudge.
    audio.onended = mode === 'simulation'
        ? () => {
            if (!_ltPracticeActive || _ltPracticeSubmitted) return;
            _startListeningReviewCountdown(SIMULATION_REVIEW_SECONDS, () => {
                if (_ltPracticeActive && !_ltPracticeSubmitted) submitLTPractice();
            });
        }
        : () => toast('Audio đã kết thúc — hãy kiểm tra đáp án!', 'info');

    // Title + footer
    document.getElementById('lt-practice-title').innerHTML = `<i class="fas fa-headphones"></i> Luyện: ${escHtml(section.title || `Section ${partNum}`)}`;
    document.getElementById('lt-practice-footer-btns').innerHTML = `
            <button class="btn-ghost" onclick="closeLTPractice()"><i class="fas fa-arrow-left"></i> Chọn bài khác</button>
            <button class="btn-primary" onclick="submitLTPractice()"><i class="fas fa-check"></i> Kiểm tra đáp án</button>`;

    // Stopwatch + progress
    _startLTPracticeTimer(_ltGetAllQs(_ltCleanSection).length);
    if (mode === 'simulation' && section.audioUrl) _startLTAutoPlay(10);

    // Listen for answer changes. Guard against re-adding on every call
    // (this screen can be entered multiple times per page load) — same
    // _handler-on-element pattern used by setupDictionaryDouble() above.
    const qi = document.getElementById('lt-practice-questions-inner');
    if (qi) {
        if (qi._practiceAnswerHandler) {
            qi.removeEventListener('click', qi._practiceAnswerHandler);
            qi.removeEventListener('input', qi._practiceAnswerHandler);
        }
        const onAnswer = () => setTimeout(_updateLTPracticeProgress, 40);
        qi._practiceAnswerHandler = onAnswer;
        qi.addEventListener('click', onAnswer);
        qi.addEventListener('input', onAnswer);
    }

    _ltSetCdSkin(true, true);
    _renderLtCdPartHeader(_ltCleanSection, partNum);
    _mountLtCdFooter(_ltCleanSection, partNum);
    showScreen('practice');
}

/* ══════════════════════════════════════════════════════════════════════
   ENTRANCE TEST EMBED (?embed=entrance)
   The Entrance Test (entrance-test.html) runs its Listening section in
   an iframe of this page, so students get the same question renderers,
   drag-drop and highlighter as "lẻ" practice. The parent page owns the
   locked single-play audio, the timer, the submit button, autosave and
   proctoring; this page only renders the questions and reports answers
   through window.parent.EntranceEmbedHost. Dictionary and translation
   stay blocked: _ltPracticeMode is 'simulation', the Test Simulation gate.
   ══════════════════════════════════════════════════════════════════ */
function _ltEntranceEmbedHost() {
    try {
        if (new URLSearchParams(location.search).get('embed') !== 'entrance' || window.parent === window) return null;
        return window.parent.EntranceEmbedHost || null;
    } catch { return null; }
}

function _enterEntranceEmbedLT(host) {
    const data = host.getSection('listening');
    if (!data || !data.section) return;
    if (typeof window.hideTopNav === 'function') window.hideTopNav();
    _ltPracticeActive = true;
    _ltPracticeSubmitted = false;
    _ltPracticeMode = 'simulation';
    _ltCleanSection = JSON.parse(JSON.stringify(data.section));
    state.answers = Object.assign({}, data.answers || {});
    state.isReview = false;
    setTool('none');

    const section = _ltCleanSection;
    const inner = document.getElementById('lt-practice-questions-inner');
    let html = `<div class="section-header-card">
            <div class="section-part-label">Section ${section.partNumber || ''}</div>
            <div class="section-title-text">${escHtml(section.title || '')}</div>
            ${section.description ? `<div class="section-desc">${escHtml(section.description)}</div>` : ''}
            <div class="section-range">Câu ${section.questionRange?.start ?? ''}–${section.questionRange?.end ?? ''}</div>
        </div>`;
    (section.questionGroups || []).forEach((group, gi) => { html += renderQuestionGroup(group, gi, false); });
    inner.innerHTML = html;
    _ltGetAllQs(section).forEach(q => restoreAnswer(q));
    refreshWordChips();
    setupDragDrop(inner);

    const nav = document.getElementById('lt-practice-q-nav');
    const markNav = () => nav && nav.querySelectorAll('.q-nav-btn').forEach(btn => {
        const a = state.answers[+btn.dataset.q];
        btn.classList.toggle('q-nav-answered', !!(a && a !== '[]'));
    });
    if (nav) {
        nav.innerHTML = _ltGetAllQs(section)
            .map(q => `<button class="q-nav-btn" data-q="${q.questionNumber}" id="lt-qnb-${q.questionNumber}" onclick="ltScrollToQ(${q.questionNumber})">${q.questionNumber}</button>`)
            .join('');
        markNav();
    }

    // The parent plays the audio (locked, single play) — keep this
    // page's own player silent.
    audio.pause();
    audio.removeAttribute('src');
    document.getElementById('lt-practice-title').innerHTML = `<i class="fas fa-headphones"></i> ${escHtml(section.title || 'Listening')}`;
    document.getElementById('lt-practice-footer-btns').innerHTML = '';
    showScreen('practice');

    // Every answer change (click/type/drag/select) → the parent's autosave.
    let t = null;
    const report = () => {
        clearTimeout(t);
        t = setTimeout(() => { markNav(); host.onAnswers('listening', Object.assign({}, state.answers)); }, 250);
    };
    ['click', 'input', 'change', 'drop'].forEach(ev => inner.addEventListener(ev, report));
    // The parent's proctor can't see focus leaving the window while it's
    // inside this frame — forward it.
    window.addEventListener('blur', () => host.childBlur());
    window.__entranceEmbed = { getAnswers: () => Object.assign({}, state.answers) };
    host.childReady('listening');
}

/* ══════════════════════════════════════════════════════════════════════
   GAP-FILL — full-transcript fill-in-the-blank drill. Self-contained:
   its own <audio id="gf-audio"> and its own state below, deliberately
   NOT sharing the page's global `audio` element/state used by
   screen-exam/screen-review/screen-practice, since this screen can be
   entered from the section grid independently of those. Continuous
   playback (no per-sentence seeking like dictation.html) — student
   plays/pauses/seeks the whole audio freely while typing into blanks
   inline in the flowing transcript.
   ══════════════════════════════════════════════════════════════════ */
let _gfSection = null;
let _gfSubmitted = false;
const _gfSpeeds = [1, 0.75, 1.25, 1.5];
let _gfSpeedIdx = 0;

async function startGapFillSection(sectionId) {
    if (!window.AuthService.hasPremiumAccess()) { openUpgradeModal(); return; }
    const clickedCard = document.querySelector(`#lt-section-list .practice-card[data-pid="${sectionId}"]`);
    const gfBtn = clickedCard ? clickedCard.querySelector('.practice-card-btn-gapfill') : null;
    if (gfBtn) { gfBtn._origText = gfBtn.innerHTML; gfBtn.innerHTML = '⏳ Đang tải...'; }
    try {
        const res  = await fetch(`${API}/listening/gapfill/section/${sectionId}`, { headers: authH() });
        const data = await safeJson(res);
        if (!data.success || !data.section) { toast('Không tải được bài Gap-fill', 'error'); return; }
        _enterGapFillScreen(data.section);
    } catch (e) {
        toast('Lỗi: ' + (e?.message || 'Không xác định'), 'error');
        console.error('[startGapFillSection]', e);
    } finally {
        if (gfBtn && gfBtn._origText) { gfBtn.innerHTML = gfBtn._origText; gfBtn._origText = null; }
    }
}

function _gfAudioEl() { return document.getElementById('gf-audio'); }

// Some source transcripts embed authoring annotations marking where a
// real exam question's answer falls (e.g. "...harbour. Q1" or "...raw
// (31) materials") — generateGapFillBlanks keeps these verbatim (the
// transcript-fidelity requirement), but they're meaningless clutter in
// a gap-fill drill, whose blanks aren't tied to those question numbers.
// Stripped here for DISPLAY only — grading still uses the real template.
function _gfCleanAnnotations(s) {
    return String(s || '')
        .replace(/[ \t]*\(\d{1,3}\)/g, '')
        .replace(/[ \t]*\bQ\d{1,3}\b\.?/g, '');
}

// [[n]] blank tokens -> real <input>, everything else HTML-escaped.
function _gfRenderInline(text) {
    const parts = text.split(/\[\[(\d+)\]\]/g);
    let html = '';
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            html += escHtml(parts[i]);
        } else {
            const idx = parseInt(parts[i], 10) - 1;
            html += `<span class="gf-blank-wrap"><input type="text" class="gf-blank" data-idx="${idx}" placeholder="•••" autocomplete="off" autocapitalize="off" spellcheck="false"></span>`;
        }
    }
    return html;
}

// Groups the transcript into per-speaker-turn <p> blocks instead of one
// wall of text joined by <br> — handles both authoring conventions seen
// in real content: "LEON:   dialogue" all on one line (turns separated
// by a blank line), and "Woman:" alone on its own line followed by the
// dialogue on the next line(s). A line only counts as a speaker label
// when every word in it starts with a capital letter (up to 3 words) —
// rejects ordinary sentences that happen to contain an early colon
// (e.g. "It costs: 60 pounds", "costs" isn't capitalized so no match).
const GF_SPEAKER_RE = /^\s*([A-Z][A-Za-z'.-]*(?:\s+[A-Z][A-Za-z'.-]*){0,2}):\s*(.*)$/;
function _gfRenderTranscript(template) {
    const lines = _gfCleanAnnotations(template).split('\n');
    const turns = [];
    let cur = null;
    function flush() { if (cur && (cur.speaker || cur.lines.some(l => l.trim()))) turns.push(cur); cur = null; }
    lines.forEach(line => {
        if (!line.trim()) { flush(); return; }
        const m = line.match(GF_SPEAKER_RE);
        if (m) { flush(); cur = { speaker: m[1], lines: m[2] ? [m[2]] : [] }; }
        else { if (!cur) cur = { speaker: null, lines: [] }; cur.lines.push(line); }
    });
    flush();
    return turns.map(t => {
        const body = _gfRenderInline(t.lines.join('\n')).replace(/\n/g, '<br>');
        const speakerHtml = t.speaker ? `<span class="gf-speaker">${escHtml(t.speaker)}</span> ` : '';
        return `<p class="gf-turn">${speakerHtml}${body}</p>`;
    }).join('');
}

function _enterGapFillScreen(section) {
    _gfSection = section;
    _gfSubmitted = false;
    _gfSpeedIdx = 0;

    document.getElementById('gf-title').innerHTML = `<i class="fas fa-pen"></i> Gap-fill: ${escHtml(section.title || '')}`;
    document.getElementById('gf-transcript').innerHTML = _gfRenderTranscript(section.gapFillTemplate);
    const resultBar = document.getElementById('gf-result-bar');
    resultBar.style.display = 'none';
    resultBar.innerHTML = '';
    document.getElementById('gf-submit-btn').disabled = false;
    document.getElementById('gf-submit-btn').innerHTML = '<i class="fas fa-check"></i> Nộp bài';

    const tArea = document.getElementById('gf-transcript');
    // Block paste — same anti-cheat convention as dictation.html's #dict-input.
    tArea.querySelectorAll('.gf-blank').forEach(inp => {
        inp.addEventListener('paste', e => e.preventDefault());
        inp.addEventListener('input', _gfMarkUsedWords);
    });

    _gfRenderWordBank();
    if ((section.wordBank || []).some(w => !w.hasGloss)) _gfLoadGlossary(section._id);

    const gfAudio = _gfAudioEl();
    const audioUrl = section.audioUrl || '';
    gfAudio.pause();
    gfAudio.defaultPlaybackRate = 1;
    gfAudio.playbackRate = 1;
    _gfDragging = false;
    if (_gfBlobUrl && _gfBlobFor === audioUrl) {
        // Retry on the same section — the full file is already local.
        gfAudio.src = _gfBlobUrl;
    } else {
        _gfResetBlob();
        gfAudio.src = audioUrl;
        if (audioUrl) _gfPrefetchAudio(audioUrl);
    }
    gfAudio.load();
    document.getElementById('gf-play-icon').className = 'fas fa-play';
    document.getElementById('gf-speed-btn').textContent = '1x';

    showScreen('gapfill');
    // The word bank sticks just under the sticky head — measure it, since
    // the topbar wraps to two lines for long titles / on narrow screens.
    const head = document.querySelector('#screen-gapfill .gf-sticky-head');
    if (head) document.getElementById('screen-gapfill').style.setProperty('--gf-head-h', head.offsetHeight + 'px');
}

// ── Word bank (left column) ──────────────────────────────────────────
// Every answer once, A→Z (server-sorted, so it never reveals which blank
// a word fills), with its in-context Vietnamese meaning. Meanings come
// from GET /gapfill/section/:id/glossary, which Gemini fills once per
// section — the first student to open a section waits a few seconds.
let _gfGlossLoading = false;
const _gfNorm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

function _gfRenderWordBank() {
    const el = document.getElementById('gf-wordbank');
    const bank = (_gfSection && _gfSection.wordBank) || [];
    if (!bank.length) { el.style.display = 'none'; el.innerHTML = ''; return; }
    el.style.display = '';
    const saveable = bank.filter(w => !w.skip);
    const items = bank.map(w => {
        const meaning = w.meaning
            ? `<div class="gf-wb-meaning">${escHtml(w.meaning)}</div>`
            : (_gfGlossLoading && !w.hasGloss ? '<div class="gf-wb-meaning gf-wb-loading">Đang tải nghĩa…</div>' : '');
        return `<li class="gf-wb-item${w.skip ? ' gf-wb-skip' : ''}" data-key="${escHtml(_gfNorm(w.word))}">
                <div class="gf-wb-word">${escHtml(w.word)}${w.count > 1 ? ` <span class="gf-wb-count">×${w.count}</span>` : ''}${w.partOfSpeech && !w.skip ? ` <span class="gf-wb-pos">${escHtml(w.partOfSpeech)}</span>` : ''}</div>
                ${meaning}
            </li>`;
    }).join('');
    el.innerHTML = `
            <div class="gf-wb-head">
                <div class="gf-wb-title"><i class="fas fa-list-ul"></i> Từ cần điền <span class="gf-wb-total">${bank.length}</span></div>
                <div class="gf-wb-note">Xếp theo A → Z, không theo thứ tự chỗ trống</div>
                <button class="gf-wb-save" onclick="gfSaveWordBank()" ${saveable.length && !_gfGlossLoading ? '' : 'disabled'}>
                    <i class="fas fa-bookmark"></i> Lưu tất cả vào sổ${saveable.length ? ` (${saveable.length})` : ''}
                </button>
            </div>
            <ul class="gf-wb-list">${items}</ul>`;
    _gfMarkUsedWords();
}

async function _gfLoadGlossary(sectionId) {
    _gfGlossLoading = true;
    _gfRenderWordBank();
    try {
        const res  = await fetch(`${API}/listening/gapfill/section/${sectionId}/glossary`, { headers: authH() });
        const data = await safeJson(res);
        if (_gfSection && String(_gfSection._id) === String(sectionId) && data.success && Array.isArray(data.wordBank)) {
            _gfSection.wordBank = data.wordBank;
        }
    } catch (e) {
        console.warn('[gapfill] glossary failed', e);
    } finally {
        _gfGlossLoading = false;
        if (_gfSection && String(_gfSection._id) === String(sectionId)) _gfRenderWordBank();
    }
}

// Fades out a word once some blank holds it — a "used" tick, nothing
// more: it says the word was typed somewhere, not that it's in the right blank.
function _gfMarkUsedWords() {
    const typed = new Set(Array.from(document.querySelectorAll('#gf-transcript .gf-blank'))
        .map(inp => _gfNorm(inp.value)).filter(Boolean));
    document.querySelectorAll('#gf-wordbank .gf-wb-item').forEach(li => {
        li.classList.toggle('gf-wb-used', typed.has(li.dataset.key));
    });
}

function gfSaveWordBank() {
    const items = ((_gfSection && _gfSection.wordBank) || [])
        .filter(w => !w.skip)
        .map(w => ({ word: w.word, meaning: w.meaning || '', partOfSpeech: w.partOfSpeech || '', source: 'listening' }));
    if (!items.length) return;
    if (typeof openVocabBookPickerBulk !== 'function') { toast('Không mở được sổ từ vựng, thử tải lại trang.', 'error'); return; }
    openVocabBookPickerBulk(items);
}

function gfTogglePlay() {
    const gfAudio = _gfAudioEl();
    if (gfAudio.paused) gfAudio.play().catch(() => toast('Không phát được audio.', 'error'));
    else gfAudio.pause();
}
// Seeking lag: the audio src is the /api/media/listening proxy (Render →
// Cloudinary), so every seek outside the buffered range is a fresh Range
// round-trip (~2s). Fix: download the whole file once in the background
// and switch the <audio> to a local blob: URL — seeks are then instant.
// Until the blob is ready, playback streams from the proxy as before.
let _gfBlobUrl = null;      // object URL of the fully-downloaded audio
let _gfBlobFor = '';        // the proxy URL that blob was downloaded from
let _gfPrefetchCtrl = null; // AbortController of the in-flight download
let _gfSwapping = false;    // src is being switched proxy → blob
let _gfSwapTarget = 0;      // where to land once that switch finishes
let _gfDragging = false;    // student is dragging the seek slider

function _gfResetBlob() {
    if (_gfPrefetchCtrl) { _gfPrefetchCtrl.abort(); _gfPrefetchCtrl = null; }
    if (_gfBlobUrl) { URL.revokeObjectURL(_gfBlobUrl); _gfBlobUrl = null; }
    _gfBlobFor = '';
    _gfSwapping = false;
}

async function _gfPrefetchAudio(url) {
    const ctrl = new AbortController();
    _gfPrefetchCtrl = ctrl;
    try {
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) return;
        const blob = await res.blob();
        if (ctrl.signal.aborted || _gfPrefetchCtrl !== ctrl) return;
        _gfPrefetchCtrl = null;
        _gfBlobUrl = URL.createObjectURL(blob);
        _gfBlobFor = url;
        // Paused → switch now (no audible glitch). Playing → switch on the
        // next seek, where a ~50ms hiccup is hidden by the jump itself.
        if (_gfAudioEl().paused) _gfSwapToBlob(_gfAudioEl().currentTime);
    } catch (e) {
        // Aborted or network error — keep streaming from the proxy.
        if (e?.name !== 'AbortError') console.warn('[gapfill] audio prefetch failed', e);
    }
}

function _gfOnBlob() { const a = _gfAudioEl(); return !!_gfBlobUrl && a.src === _gfBlobUrl; }

function _gfSwapToBlob(targetTime) {
    const a = _gfAudioEl();
    const wasPlaying = !a.paused;
    const rate = a.playbackRate;
    _gfSwapping = true;
    _gfSwapTarget = targetTime;
    a.src = _gfBlobUrl;
    a.addEventListener('loadedmetadata', () => {
        a.defaultPlaybackRate = rate;
        a.playbackRate = rate;
        a.currentTime = Math.max(0, Math.min(a.duration || 0, _gfSwapTarget));
        _gfSwapping = false;
        if (wasPlaying) a.play().catch(() => {});
    }, { once: true });
    a.load();
}

function _gfSeekTo(t) {
    const a = _gfAudioEl();
    if (!a.src) return;
    const target = Math.max(0, Math.min(a.duration || 0, t));
    if (_gfBlobUrl && !_gfOnBlob() && !_gfSwapping) { _gfSwapToBlob(target); return; }
    if (_gfSwapping) { _gfSwapTarget = target; _gfRenderTime(target); return; }
    a.currentTime = target;
    _gfRenderTime(target);
}

function _gfRenderTime(t) {
    const seek = document.getElementById('gf-seek');
    if (seek && !_gfDragging) seek.value = t;
    document.getElementById('gf-time-cur').textContent = `${pad(Math.floor(t/60))}:${pad(Math.floor(t%60))}`;
}

function gfSkip(secs) {
    _gfSeekTo(_gfAudioEl().currentTime + secs);
}
// While dragging only preview the time (streaming from the proxy, a seek
// per input event queued a Range request each); commit on release. Once
// the audio is local, scrub live since seeks cost nothing.
function gfSeekInput(val) {
    const t = parseFloat(val);
    _gfDragging = true;
    document.getElementById('gf-time-cur').textContent = `${pad(Math.floor(t/60))}:${pad(Math.floor(t%60))}`;
    if (_gfOnBlob() && !_gfSwapping) _gfAudioEl().currentTime = t;
}
function gfSeekCommit(val) {
    _gfDragging = false;
    _gfSeekTo(parseFloat(val));
}
function gfCycleSpeed() {
    _gfSpeedIdx = (_gfSpeedIdx + 1) % _gfSpeeds.length;
    const a = _gfAudioEl();
    a.defaultPlaybackRate = _gfSpeeds[_gfSpeedIdx];
    a.playbackRate = _gfSpeeds[_gfSpeedIdx];
    document.getElementById('gf-speed-btn').textContent = _gfSpeeds[_gfSpeedIdx] + 'x';
}

// ← / → seek 5s on the gap-fill screen. Inside a blank plain arrows keep
// moving the caret (needed to fix a typo), so there it's Ctrl/⌘ + ← / →.
const GF_ARROW_SKIP = 5;
document.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (!document.getElementById('screen-gapfill')?.classList.contains('active')) return;
    if (e.altKey || e.shiftKey) return;
    const t = e.target;
    const inBlank = t.classList?.contains('gf-blank');
    const inOtherField = !inBlank && t !== document.getElementById('gf-seek')
        && (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable);
    if (inOtherField) return;
    if (inBlank && !(e.ctrlKey || e.metaKey)) return;
    if (!inBlank && (e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    gfSkip(e.key === 'ArrowLeft' ? -GF_ARROW_SKIP : GF_ARROW_SKIP);
});

(function _wireGfAudioEvents() {
    document.addEventListener('DOMContentLoaded', () => {
        const gfAudio = _gfAudioEl();
        if (!gfAudio) return;
        gfAudio.addEventListener('play',  () => { document.getElementById('gf-play-icon').className = 'fas fa-pause'; });
        gfAudio.addEventListener('pause', () => { if (!_gfSwapping) document.getElementById('gf-play-icon').className = 'fas fa-play'; });
        gfAudio.addEventListener('loadedmetadata', () => {
            const seek = document.getElementById('gf-seek');
            if (seek) seek.max = gfAudio.duration || 0;
            document.getElementById('gf-time-total').textContent = `${pad(Math.floor((gfAudio.duration||0)/60))}:${pad(Math.floor((gfAudio.duration||0)%60))}`;
        });
        gfAudio.addEventListener('timeupdate', () => {
            if (_gfSwapping) return; // src switch briefly reports 0 — don't flash the slider back
            _gfRenderTime(gfAudio.currentTime);
        });
    });
})();

async function gfSubmit() {
    if (!_gfSection || _gfSubmitted) return;
    const inputs = Array.from(document.querySelectorAll('#gf-transcript .gf-blank'));
    if (!inputs.length) return;
    const answers = inputs.map(inp => ({ blankIndex: parseInt(inp.dataset.idx, 10), userAnswer: inp.value }));
    const btn = document.getElementById('gf-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '⏳ Đang chấm...';
    try {
        const res = await fetch(`${API}/listening/gapfill/save-attempt`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ sectionId: _gfSection._id, sectionTitle: _gfSection.title, partNumber: _gfSection.partNumber, answers })
        });
        const data = await safeJson(res);
        if (!data.success) { toast('Không chấm được bài, thử lại.', 'error'); btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Nộp bài'; return; }
        _gfSubmitted = true;
        const byIdx = {};
        (data.answers || []).forEach(a => { byIdx[a.blankIndex] = a; });
        inputs.forEach(inp => {
            const g = byIdx[parseInt(inp.dataset.idx, 10)];
            if (!g) return;
            inp.readOnly = true;
            inp.classList.add(g.isCorrect ? 'gf-correct' : 'gf-wrong');
            if (!g.isCorrect) {
                const hint = document.createElement('span');
                hint.className = 'gf-answer-hint';
                hint.textContent = `→ ${g.correctAnswer}`;
                inp.insertAdjacentElement('afterend', hint);
            }
        });
        const resultBar = document.getElementById('gf-result-bar');
        resultBar.style.display = '';
        resultBar.innerHTML = `Bạn đúng <strong>${data.correctCount}/${data.totalBlanks}</strong> chỗ trống`;
        btn.innerHTML = '<i class="fas fa-check"></i> Đã nộp';
    } catch (e) {
        toast('Lỗi: ' + (e?.message || 'Không xác định'), 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Nộp bài';
    }
}

function gfRetry() {
    if (!_gfSection) return;
    _enterGapFillScreen(_gfSection);
}

function closeGapFillScreen() {
    const gfAudio = _gfAudioEl();
    gfAudio.pause();
    gfAudio.removeAttribute('src');
    gfAudio.load();
    _gfResetBlob();
    _gfSection = null;
    showScreen('list');
}

/* ── Submit + grade ──────────────────────────────────────────────────── */
function submitLTPractice() {
    if (!_ltCleanSection || !_ltOrigSection) { toast('Lỗi: không tìm thấy dữ liệu bài luyện. Vui lòng tải lại trang.', 'error'); return; }
    _cancelListeningReviewCountdown();
    _doSubmitLTPractice().catch(e => { console.error('[submitLTPractice]', e); toast('Lỗi hiển thị kết quả: ' + e.message, 'error'); });
}
async function _doSubmitLTPractice() {

    // Fresh practice sessions (startPracticeSection -> _enterLTPracticeScreen)
    // no longer get correctAnswer/explanation in the initial fetch at all
    // (security fix — see backend/services/listeningService.js's
    // getPracticeSectionById: answers used to be visible in the Network tab
    // before the student had even pressed play), so fetch them now, at the
    // moment of submitting — the student has already committed their
    // answers, so this reveals nothing they haven't already locked in.
    // loadLTPracticeReview() (viewing a PAST submitted attempt) already
    // populates _ltOrigSection with real correctAnswer values from that
    // attempt's own history endpoint and sets _ltPracticeSubmitted=true
    // before this function could ever run again, so this fetch is skipped
    // for that path.
    const _ltFirstQ = _ltGetAllQs(_ltOrigSection)[0];
    if (_ltPracticeSectionId && _ltFirstQ && !_ltFirstQ.correctAnswer) {
        try {
            const keyRes = await fetch(`${API}/listening/practice/answer-key/${_ltPracticeSectionId}`, { headers: authH() });
            const keyData = await safeJson(keyRes);
            if (keyData.success && keyData.answerKey) {
                for (const group of _ltOrigSection.questionGroups || []) {
                    for (const q of group.questions || []) {
                        const key = keyData.answerKey[q.questionNumber];
                        if (key) { q.correctAnswer = key.correctAnswer; q.explanation = key.explanation; }
                    }
                }
            }
        } catch (e) { console.error('[_doSubmitLTPractice] answer-key fetch failed', e); }
    }

    const elapsed = _stopLTPracticeTimer();
    const allQ    = _ltGetAllQs(_ltOrigSection);
    const total   = allQ.length;
    let correct = 0, wrong = 0, skipped = 0;

    // Build reviewed groups: merge user answers + correctAnswer + isCorrect
    const reviewSection = JSON.parse(JSON.stringify(_ltOrigSection));
    for (const group of reviewSection.questionGroups || []) {
        const qs = group.questions || [];
        // TFNG/yes-no-ng never uses pool matching — each question has its own fixed answer
        const isTFNGLt = qs.some(q => ['true-false-ng', 'yes-no-ng'].includes(q.type));
        if (group.interchangeableAnswers && qs.length > 0 && !isTFNGLt) {
            // Pool matching: đáp án trong nhóm có thể hoán đổi thứ tự (như backend)
            const remainingPool = qs.map(q => (q.correctAnswer || '').trim().toLowerCase());
            for (const q of qs) {
                const userAns = state.answers[q.questionNumber] || '';
                const poolIdx = userAns ? remainingPool.indexOf(userAns.trim().toLowerCase()) : -1;
                const isCorrect = poolIdx !== -1;
                if (isCorrect) remainingPool.splice(poolIdx, 1);
                if (!userAns || userAns === '[]') skipped++;
                else if (isCorrect) correct++;
                else wrong++;
                q.userAnswer = userAns;
                q.isCorrect  = isCorrect;
            }
        } else {
            for (const q of qs) {
                const qNum      = q.questionNumber;
                const userAns   = state.answers[qNum] || '';
                const correctAns= q.correctAnswer || '';
                let isCorrect   = false;
                if (!userAns || userAns === '[]') {
                    skipped++;
                } else if (q.type === 'multi-answer-group') {
                    try {
                        const uaArr = JSON.parse(userAns || '[]').map(x => x.toUpperCase().trim());
                        isCorrect = uaArr.includes(correctAns.toUpperCase().trim());
                    } catch { isCorrect = false; }
                    if (isCorrect) correct++; else wrong++;
                } else if (q.type === 'checkbox') {
                    try {
                        const a = JSON.parse(userAns).map(x => x.toLowerCase().trim()).sort();
                        const b = JSON.parse(correctAns || '[]').map(x => x.toLowerCase().trim()).sort();
                        isCorrect = JSON.stringify(a) === JSON.stringify(b);
                    } catch { isCorrect = false; }
                    if (isCorrect) correct++; else wrong++;
                } else {
                    const userLow = userAns.trim().toLowerCase();
                    const alts    = correctAns.split(/\s*\/\s*/).map(s => s.toLowerCase().trim()).filter(Boolean);
                    isCorrect     = alts.length > 0 ? alts.some(a => a === userLow) : false;
                    if (isCorrect) correct++; else wrong++;
                }
                q.userAnswer = userAns;
                q.isCorrect  = isCorrect;
            }
        }
    }

    const pct    = total ? Math.round(correct / total * 100) : 0;
    const barVar = pct >= 70 ? 'good' : pct >= 40 ? 'mid' : 'bad';

    // Time line
    const tm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ts = String(elapsed % 60).padStart(2, '0');
    const perQ = total ? Math.round(elapsed / total) : 0;
    const speed = perQ <= 45 ? '<i class="fas fa-bolt"></i> Rất nhanh' : perQ <= 80 ? 'Ổn' : 'Cần tăng tốc';
    const encourage = pct >= 80 ? 'Ôi học giỏi vậy? Đi dạy lại đi chứ 😏🔥'
                    : pct >= 60 ? 'Tạm ổn đó... nhưng mà Daniel biết bạn làm được hơn 👀'
                    : pct >= 40 ? 'Được hơn 40% rồi nhưng sai nhiều vậy là chưa ổn nha 🥲 Cày thêm đi!'
                    : 'Học cho đàng hoàng zô coiii 😤';
    const timeLine = `<div class="ls-rb-time">
            <span><i class="fas fa-clock"></i> Thời gian: <strong>${tm}:${ts}</strong></span>
            <span>${speed} · ${perQ}s/câu</span>
            <span style="font-style:italic">${encourage}</span>
        </div>`;

    // Re-render with review data
    const inner = document.getElementById('lt-practice-questions-inner');
    // Capture highlights made during practice before the innerHTML swap
    // below wipes them (review markup adds correct/wrong indicators the
    // live practice markup doesn't have, so raw HTML can't be reused).
    const savedQuestionHl = window.HighlightStore.extractTexts(inner.innerHTML);
    const ltPracImgSrc = pct >= 75 ? 'img/above7.5.jpg'
                        : pct >= 60 ? 'img/band_6_7.jpg'
                        : pct >= 50 ? 'img/listening_readingbelow60%25.jpg'
                        : pct >= 40 ? 'img/listening_readingbelow50%25.jpg'
                        : pct >= 30 ? 'img/listening_readingbelow40%25.jpg'
                        : pct >= 20 ? 'img/listening_readingbelow30%25.jpg'
                        : 'img/listening_readingbelow20%25.jpg';
    let html = `<div class="ls-result-bar ls-result-bar--${barVar}">
            <img src="${ltPracImgSrc}" alt="" loading="lazy" style="display:block;width:100%;max-width:200px;border-radius:12px;margin:0 auto 12px;object-fit:cover">
            <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
                <span>Kết quả: <strong>${correct}/${total}</strong> câu đúng (${pct}%)</span>
                <span class="ls-rb-correct">● Đúng: ${correct}</span>
                <span class="ls-rb-wrong">● Sai: ${wrong}</span>
                <span class="ls-rb-skip">● Bỏ qua: ${skipped}</span>
            </div>${timeLine}
        </div>
        <div class="section-header-card">
            <div class="section-part-label">Section ${_ltPracticePartNum}</div>
            <div class="section-title-text">${escHtml(_ltOrigSection.title || '')}</div>
        </div>`;
    (reviewSection.questionGroups || []).forEach((group, gi) => {
        try { html += renderQuestionGroup(group, gi, true); }
        catch (e) { console.error('[lt-review] group', gi, e); }
    });

    inner.innerHTML = html;
    inner.scrollTop = 0;
    if (savedQuestionHl.length) window.HighlightStore.applyTexts(inner, savedQuestionHl);

    // Update Q-nav with correct/wrong/skipped colors
    const navPr = document.getElementById('lt-practice-q-nav');
    if (navPr) {
        navPr.innerHTML = _ltGetAllQs(reviewSection)
            .map(q => {
                const cls = !q.userAnswer ? 'skipped' : q.isCorrect ? 'correct' : 'wrong';
                return `<button class="q-nav-btn ${cls}" onclick="ltScrollToQ(${q.questionNumber})">${q.questionNumber}</button>`;
            })
            .join('');
    }

    // Show transcript panel (left side, like full-test review)
    const tp = document.getElementById('lt-practice-transcript-panel');
    const tb = document.getElementById('lt-practice-transcript-body');
    if (tp && tb) {
        if (_ltOrigSection.transcript) {
            tb.innerHTML = _ltOrigSection.transcript.split('\n').map(l =>
                l.trim() ? `<p style="margin-bottom:8px">${escHtml(l)}</p>` : '<br>'
            ).join('');
            tp.style.display = '';
            setupDictionaryDouble('lt-practice-transcript-body', 'listening', _ltDictGate);
        } else {
            tp.style.display = 'none';
        }
    }

    _saveLtPracticeHighlightsToStorage();

    _ltPracticeSubmitted = true;
    // Auto-enable Dict lookup now that the transcript is visible — same
    // reasoning as goToReview(): the hint text promises double-click
    // works immediately, and a student who had Dict on while answering
    // (to look up words in the questions) would otherwise have it
    // silently switched off right as the transcript they actually want
    // to look words up in appears.
    setTool('dict', true);

    // Lưu kết quả lên server — server tự grade lại để đảm bảo tính chính xác
    const answersToSave = (reviewSection.questionGroups || []).flatMap(g =>
        (g.questions || []).map(q => ({
            questionNumber: q.questionNumber,
            userAnswer:    q.userAnswer || ''
        }))
    );
    if (_ltPracticeMode === 'simulation' && window.ExamProctor) window.ExamProctor.stop();
    _ltSavePracticeResult({
        clientKey:    _ltPracticeClientKey,
        sectionId:    _ltPracticeSectionId,
        sectionTitle: _ltOrigSection.title || '',
        partNumber:   _ltPracticePartNum || 1,
        answers:      answersToSave,
        timeTaken:    elapsed,
        // Test Simulation only — undefined for Practice, so the
        // backend takes the exact same plain-insert path it always has.
        attemptId: _ltPracticeMode === 'simulation' ? _ltPracticeSimAttemptId : undefined,
        // Highlights travel with the result (no attempt id to save them
        // under before this); once the id comes back they are keyed to it.
        highlights:   _collectLtPracticeHighlights(),
    });

    // Update footer
    document.getElementById('lt-practice-footer-btns').innerHTML = `
            <button class="btn-ghost" onclick="closeLTPractice()"><i class="fas fa-arrow-left"></i> Chọn bài khác</button>
            <button class="btn-primary" onclick="retryLTPractice()"><i class="fas fa-redo"></i> Làm lại bài này</button>`;
    _ltSetCdSkin(true, false); // review look for questions + footer

    // This screen already is the review — the button jumps to the first
    // question answered wrong (or skipped).
    if (window.showPostSubmitReminder) {
        const firstWrong = _ltGetAllQs(reviewSection).find(q => !q.isCorrect);
        window.showPostSubmitReminder({
            skill: 'listening',
            onReview: () => {
                if (firstWrong) ltScrollToQ(firstWrong.questionNumber);
                else inner.scrollTop = 0;
            },
        });
    }
} // end _doSubmitLTPractice

// Lưu kết quả luyện tập lên server và báo lỗi rõ ràng nếu thất bại.
// Cố ý KHÔNG tự động thử lại: /listening/practice/save luôn tạo bản ghi mới
// (không idempotent), nên gọi lại tự động có thể tạo bản ghi trùng lặp nếu
// request đầu tiên thực ra đã thành công ở server nhưng phản hồi bị mất.
async function _ltSavePracticeResult(payload) {
    try {
        const res = await fetch(`${API}/listening/practice/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authH() },
            body: JSON.stringify(payload)
        });
        const data = await safeJson(res);
        if (data && data.attemptId) {
            if (_ltPracticeClientKey === payload.clientKey && _ltPracticeSubmitted && !_ltSavedAttemptId) {
                // Still on this review — key the highlights to the attempt
                // (incl. any added while the request was in flight).
                window.HighlightStore.removeLocal(_ltHlStorageKey(payload.sectionId));
                _ltSavedAttemptId = data.attemptId;
                _saveLtPracticeHighlightsToStorage();
            } else if (payload.highlights) {
                window.HighlightStore.writeLocal(_ltAttemptHlStorageKey(data.attemptId), payload.highlights);
            }
        }
    } catch (e) {
        toast('Không thể lưu kết quả lên server. Vui lòng chụp màn hình lưu lại.', 'error');
    }
}

/* ── Close practice → back to section list ───────────────────────────── */
function closeLTPractice() {
    // Leaving without submitting must disarm proctoring too — only the
    // submit path did this before, so a Simulation "lẻ" attempt
    // abandoned via "Thoát" kept the badge, violation counting and
    // nav-lock armed indefinitely (BUG-108).
    if (_ltPracticeMode === 'simulation' && window.ExamProctor) window.ExamProctor.stop();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    _clearLTPracticeTimer();
    _hideLTPracticeHUD();
    _ltPracticeSubmitted = false;
    _ltPracticeActive    = false;
    _ltLoadingPart = 0;
    _ltSetCdSkin(false, false);
    const tpClose = document.getElementById('lt-practice-transcript-panel');
    if (tpClose) tpClose.style.display = 'none';
    setTool('none');
    audio.onended = null;
    audio.pause();
    audio.src = '';

    // Restore exam state
    if (_ltPracticeBackup) {
        state.answers      = _ltPracticeBackup.answers;
        state.currentTestId= _ltPracticeBackup.currentTestId;
        state.currentTest  = _ltPracticeBackup.currentTest;
        state.partIdx      = _ltPracticeBackup.partIdx;
        state.isReview     = _ltPracticeBackup.isReview;
        _ltPracticeBackup  = null;
    }
    _ltOrigSection = _ltCleanSection = null;

    // Clear list so it reloads fresh; replaceState keeps correct URL without adding history entry
    // Back to the list tab the student came from ('all' or one section).
    const partNum = _ltParsePart(document.querySelector('#lele-picker-lt .plele-tab.plele-active')?.dataset.part);
    history.replaceState({ screen: 'list', mode: 'single', part: partNum }, '', _ltListUrl(partNum));
    const listEl = document.getElementById('lt-section-list');
    if (listEl) listEl.innerHTML = '';
    showScreen('list');
    setListeningMode('lele', false);
}

/* ── Retry same section ───────────────────────────────────────────────── */
function retryLTPractice() {
    if (!_ltPracticeSectionId || !_ltPracticePartNum) return;
    const sectionId = _ltPracticeSectionId;
    const partNum   = _ltPracticePartNum;
    // Restore backup so _enterLTPracticeScreen can re-save it — all 5
    // fields, matching closeLTPractice()/handleLtPracticePopstate. Missing
    // partIdx/isReview here left the fresh _enterLTPracticeScreen() call
    // backing up isReview:false regardless of the real value (e.g. true
    // when this practice session was entered from exam review), silently
    // and permanently resetting state.isReview once this retry's session
    // eventually closes.
    if (_ltPracticeBackup) {
        state.answers      = _ltPracticeBackup.answers;
        state.currentTestId= _ltPracticeBackup.currentTestId;
        state.currentTest  = _ltPracticeBackup.currentTest;
        state.partIdx      = _ltPracticeBackup.partIdx;
        state.isReview     = _ltPracticeBackup.isReview;
        _ltPracticeBackup  = null;
    }
    startPracticeSection(sectionId, partNum);
}

/* ── Q-nav scroll for practice ───────────────────────────────────────── */
function ltScrollToQ(num) {
    let el = _ltFindQuestionEl(num);
    if (!el) {
        document.querySelectorAll('#lt-practice-questions-inner [data-cluster-start]').forEach(c => {
            const s = parseInt(c.dataset.clusterStart);
            const e = parseInt(c.dataset.clusterEnd);
            if (num >= s && num <= e) el = c;
        });
    }
    if (!el) return;
    const panel = document.getElementById('lt-practice-questions');
    if (panel) {
        const pr = panel.getBoundingClientRect();
        const er = el.getBoundingClientRect();
        panel.scrollTop += (er.top - pr.top) - 16;
    } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    el.classList.remove('q-scroll-flash');
    void el.offsetWidth;
    el.classList.add('q-scroll-flash');
    setTimeout(() => el.classList.remove('q-scroll-flash'), 950);
}

function _ltFindQuestionEl(num) {
    const inner = document.getElementById('lt-practice-questions-inner');
    if (!inner) return null;
    return inner.querySelector(`#qi-${num}`) || inner.querySelector(`#fi-${num}`) || inner.querySelector(`#q${num}`);
}

/* ── Full-test look for bài lẻ (css/cd-exam.css, "Bài lẻ" section) ───── */
// skin: logo, Part box and white bars for the whole visit; live: exam-
// style questions + the CD footer while answering (dropped once checked,
// so the review keeps its correct/wrong look). The Entrance Test embed
// never calls this and keeps its old look.
function _ltSetCdSkin(skin, live) {
    const scr = document.getElementById('screen-practice');
    if (!scr) return;
    scr.classList.toggle('cd-skin', !!skin);
    scr.classList.toggle('cd-live', !!(skin && live));
    // Tool buttons sit on the Part box when skinned, in the body's left
    // column otherwise.
    const tb = document.getElementById('lt-practice-toolbar');
    const dest = document.getElementById(skin ? 'cd-part-tools-pr' : 'lt-practice-body');
    if (tb && dest && tb.parentElement !== dest) dest.prepend(tb);
}
function _renderLtCdPartHeader(section, partNum) {
    const t = document.getElementById('cd-part-title-pr');
    const sub = document.getElementById('cd-part-sub-pr');
    if (!t || !sub || !section) return;
    const nums = _ltGetAllQs(section).map(q => q.questionNumber);
    t.textContent = `Part ${partNum || section.partNumber || 1}`;
    sub.textContent = nums.length
        ? `Listen and answer questions ${Math.min(...nums)}–${Math.max(...nums)}`
        : 'Listen and answer the questions';
}
function _ltIsAnswered(n) {
    const filled = v => {
        if (!v) return false;
        try { const a = JSON.parse(v); return Array.isArray(a) ? a.length > 0 : true; } catch { return true; }
    };
    if (filled(state.answers[n])) return true;
    // Multi-answer clusters keep the answer on their first number.
    const c = [...document.querySelectorAll('#lt-practice-questions-inner [data-cluster-start]')]
        .find(el => n >= +el.dataset.clusterStart && n <= +el.dataset.clusterEnd);
    return !!c && filled(state.answers[+c.dataset.clusterStart]);
}
function _ltMarkCurrentQ(n) {
    document.querySelectorAll('#lt-practice-questions-inner .cd-current').forEach(x => x.classList.remove('cd-current'));
    const el = _ltFindQuestionEl(n);
    if (el) el.classList.add('cd-current');
}
function _mountLtCdFooter(section, partNum) {
    const el = document.getElementById('lt-practice-cd-footer');
    if (!el || !window.CDFooter || !section) return;
    window.CDFooter.mount(el, {
        parts: [{
            label: `Part ${partNum || section.partNumber || 1}`,
            questions: _ltGetAllQs(section).map(q => q.questionNumber).sort((a, b) => a - b),
        }],
        btnId: n => `ltcdq-${n}`,
        isAnswered: _ltIsAnswered,
        onJump: n => { ltScrollToQ(n); _ltMarkCurrentQ(n); },
        onSubmit: submitLTPractice,
        submitLabel: 'Kiểm tra đáp án',
    });
    if (!el._cdTracking) {
        el._cdTracking = true;
        const panel = document.getElementById('lt-practice-questions');
        const onTouch = e => {
            if (!document.getElementById('screen-practice')?.classList.contains('cd-live')) return;
            const host = e.target.closest('[data-qnum], [id^="qi-"]');
            const n = host ? parseInt(host.dataset.qnum || host.id.slice(3), 10) : NaN;
            if (!n) return;
            window.CDFooter.setCurrent(n);
            _ltMarkCurrentQ(n);
        };
        panel?.addEventListener('focusin', onTouch);
        panel?.addEventListener('click', onTouch);
    }
}

function confirmCloseLTPractice() { openModal('modal-lt-practice-exit'); }

/* ── Practice history — now the same combined Full đề + Bài lẻ modal ── */
function showLTPracticeHistoryModal() { return window.showHistoryModal(); }

async function loadLTPracticeReview(attemptId) {
    closeModal('modal-history');
    try {
        const res  = await fetch(`${API}/listening/practice/history/${attemptId}`, { headers: authH() });
        const data = await safeJson(res);
        if (!data.success || !data.section) { toast('Không tải được bài đã làm.', 'error'); return; }
        const { attempt, section } = data;

        // The history endpoint no longer ships the answer key (backend
        // getPracticeHistoryDetail — P1 fix). Re-fetch it from the
        // requirePremium-gated answer-key endpoint, exactly like
        // _doSubmitLTPractice(). A free/expired user gets 403 → keyMap
        // stays empty → the review shows their answers + score without
        // correct-answer hints.
        const keyMap = {};
        try {
            const keyRes  = await fetch(`${API}/listening/practice/answer-key/${attempt.sectionId}`, { headers: authH() });
            const keyData = await safeJson(keyRes);
            if (keyData.success && keyData.answerKey) Object.assign(keyMap, keyData.answerKey);
        } catch (e) { /* 403 for lapsed access, or transient — degrade to no key */ }

        // Highlights of this attempt (see _saveLtPracticeHighlightsToStorage):
        // the server copy or this browser's, whichever is newer. An attempt
        // saved before highlights were stored per attempt has neither —
        // fall back to the old per-section local copy then (and pin it to
        // this attempt).
        const HS = window.HighlightStore;
        let localLtHl = HS.readLocal(_ltAttemptHlStorageKey(attempt._id));
        if (!localLtHl && !attempt.highlights) {
            localLtHl = HS.readLocal(_ltHlStorageKey(attempt.sectionId));
            if (localLtHl) { localLtHl.ts = 0; HS.writeLocal(_ltAttemptHlStorageKey(attempt._id), localLtHl); }
        }
        const savedLtPart = window.HighlightStore.choose('listening-practice', attempt._id, localLtHl, attempt.highlights)?.parts?.[0] || null;

        // Build reviewSection: merge saved answers onto the full section
        const reviewSection = JSON.parse(JSON.stringify(section));
        const answerMap = {};
        (attempt.answers || []).forEach(a => { answerMap[a.questionNumber] = a; });

        for (const group of reviewSection.questionGroups || []) {
            for (const q of group.questions || []) {
                const saved = answerMap[q.questionNumber];
                q.userAnswer = saved?.userAnswer || '';
                q.isCorrect  = saved?.isCorrect  || false;
                // correctAnswer/explanation no longer come from the history
                // response — take them from the premium-gated key fetch
                // above (empty for a lapsed-access user). Prefer the
                // attempt's frozen value if an older payload still has it.
                const k = keyMap[q.questionNumber];
                if (saved?.correctAnswer !== undefined) q.correctAnswer = saved.correctAnswer;
                else if (k?.correctAnswer !== undefined) q.correctAnswer = k.correctAnswer;
                if (k?.explanation !== undefined) q.explanation = k.explanation;
            }
        }

        // Enter the practice screen in "review from history" mode
        _ltOrigSection       = section;
        _ltCleanSection      = reviewSection;
        _ltPracticePartNum   = attempt.partNumber;
        _ltPracticeSectionId = attempt.sectionId;
        _ltSavedAttemptId    = attempt._id; // highlights added in this review save to it
        _ltPracticeSubmitted = true;
        _ltPracticeActive    = true;  // needed so closeLTPractice cleans up correctly

        // Backup current state
        _ltPracticeBackup = {
            answers:       { ...state.answers },
            currentTestId: state.currentTestId,
            currentTest:   state.currentTest,
            partIdx:       state.partIdx,
            isReview:      state.isReview
        };
        state.answers = Object.fromEntries(
            (attempt.answers || []).map(a => [a.questionNumber, a.userAnswer || ''])
        );

        // Show practice screen
        showScreen('practice');
        _ltSetCdSkin(true, false);
        _renderLtCdPartHeader(section, attempt.partNumber);
        document.getElementById('lt-practice-title').innerHTML = `<i class="fas fa-headphones"></i> Xem lại – ${escHtml(section.title || `Section ${attempt.partNumber}`)}`;

        const pct    = attempt.totalQuestions ? Math.round(attempt.correctCount / attempt.totalQuestions * 100) : 0;
        const barVar = pct >= 70 ? 'good' : pct >= 40 ? 'mid' : 'bad';
        const tm = String(Math.floor(attempt.timeTaken / 60)).padStart(2, '0');
        const ts = String(attempt.timeTaken % 60).padStart(2, '0');
        const ltHistImgSrc = pct >= 75 ? 'img/above7.5.jpg'
                            : pct >= 60 ? 'img/band_6_7.jpg'
                            : pct >= 50 ? 'img/listening_readingbelow60%25.jpg'
                            : pct >= 40 ? 'img/listening_readingbelow50%25.jpg'
                            : pct >= 30 ? 'img/listening_readingbelow40%25.jpg'
                            : pct >= 20 ? 'img/listening_readingbelow30%25.jpg'
                            : 'img/listening_readingbelow20%25.jpg';

        let html = `<div class="ls-result-bar ls-result-bar--${barVar}">
                <img src="${ltHistImgSrc}" alt="" loading="lazy" style="display:block;width:100%;max-width:200px;border-radius:12px;margin:0 auto 12px;object-fit:cover">
                <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
                    <span>Kết quả: <strong>${attempt.correctCount}/${attempt.totalQuestions}</strong> câu đúng (${pct}%)</span>
                    <span class="ls-rb-correct">● Đúng: ${attempt.correctCount}</span>
                    <span class="ls-rb-wrong">● Sai: ${attempt.wrongCount}</span>
                    <span class="ls-rb-skip">● Bỏ qua: ${attempt.skippedCount}</span>
                </div>
                <div class="ls-rb-time">
                    <i class="fas fa-clock"></i> Thời gian: <strong>${tm}:${ts}</strong>
                    &nbsp;·&nbsp; ${new Date(attempt.submittedAt).toLocaleDateString('vi-VN')}
                </div>
            </div>
            <div class="section-header-card">
                <div class="section-part-label">Section ${attempt.partNumber}</div>
                <div class="section-title-text">${escHtml(section.title || '')}</div>
            </div>`;
        (reviewSection.questionGroups || []).forEach((group, gi) => {
            html += renderQuestionGroup(group, gi, true);
        });

        const inner = document.getElementById('lt-practice-questions-inner');
        inner.innerHTML = html;
        inner.scrollTop = 0;
        if (savedLtPart?.q?.length) window.HighlightStore.applyTexts(inner, savedLtPart.q);

        // Show transcript if available
        const tp = document.getElementById('lt-practice-transcript-panel');
        const tb = document.getElementById('lt-practice-transcript-body');
        if (tp && tb) {
            if (section.transcript) {
                tb.innerHTML = section.transcript.split('\n').map(l =>
                    l.trim() ? `<p style="margin-bottom:8px">${escHtml(l)}</p>` : '<br>'
                ).join('');
                if (savedLtPart?.p?.length) HS.apply(tb, savedLtPart.p);
                tp.style.display = '';
                setupDictionaryDouble('lt-practice-transcript-body', 'listening', _ltDictGate);
            } else {
                tp.style.display = 'none';
            }
        }

        // Q-nav: build scroll buttons for review with correct/wrong/skipped colors
        const nav = document.getElementById('lt-practice-q-nav');
        if (nav) {
            nav.innerHTML = _ltGetAllQs(reviewSection)
                .map(q => {
                    const cls = !q.userAnswer ? 'skipped' : q.isCorrect ? 'correct' : 'wrong';
                    return `<button class="q-nav-btn ${cls}" onclick="ltScrollToQ(${q.questionNumber})">${q.questionNumber}</button>`;
                })
                .join('');
        }

        // Set up audio so user can replay while reviewing
        audio.pause();
        audio.src = section.audioUrl || '';
        if (section.audioUrl) {
            audio.load();
            const prBtn = document.getElementById('play-btn-pr');
            if (prBtn) prBtn.innerHTML = '<i class="fas fa-play"></i>';
        }

        _hideLTPracticeHUD();
        document.getElementById('lt-practice-footer-btns').innerHTML = `
                <button class="btn-ghost" onclick="closeLTPractice()"><i class="fas fa-arrow-left"></i> Chọn bài khác</button>
                <button class="btn-primary" onclick="retryLTPractice()"><i class="fas fa-redo"></i> Làm lại bài này</button>`;

        // Same as the post-submit screen and goToReview(): the transcript's
        // "Double-click a word to look it up" hint should work right away.
        setTool('dict', true);

        _mountInlineReviews('listening-practice', attemptId, _ltGetAllQs(reviewSection), 'lt-practice-questions-inner');
    } catch (e) {
        console.error(e);
        // Backend detected the section behind this review was permanently
        // deleted and already auto-resolved the pending review for it —
        // refresh the banner/popup so it stops pointing at this now-cleared
        // item (a student stuck here previously had no way forward: every
        // "Tiếp tục Review" click retried this exact same unloadable attempt).
        if (e && e.status === 410 && e.body && e.body.code === 'CONTENT_REMOVED') {
            toast('Bài nghe này đã bị gỡ khỏi hệ thống — đã tự động bỏ qua review này.', 'info');
            if (typeof _checkPendingReviewBanner === 'function') _checkPendingReviewBanner();
        } else {
            toast('Không tải được bài đã làm.', 'error');
        }
    }
}

function copyLtPracticeLink(sectionId, partNum) {
    const url = `${location.origin}/listening.html?sectionId=${sectionId}&part=${partNum}`;
    navigator.clipboard.writeText(url).then(
        () => toast('Link bài lẻ đã được sao chép!', 'success'),
        () => toast('Không thể sao chép link', 'error')
    );
}

// Expose bài lẻ functions after they are defined
window.copyLtPracticeLink = copyLtPracticeLink;
window.confirmCloseLTPractice = confirmCloseLTPractice;
window.showLTPracticeHistoryModal = showLTPracticeHistoryModal;
window.loadLTPracticeReview = loadLTPracticeReview;
window.setListeningMode = setListeningMode;
window.filterLtPracticeCards = filterLtPracticeCards;
window.filterLtByStatus = filterLtByStatus;
window.loadPracticeSections = loadPracticeSections;
window.startPracticeSection = startPracticeSection;
window.submitLTPractice = submitLTPractice;
window.closeLTPractice = closeLTPractice;
window.retryLTPractice = retryLTPractice;
window.ltScrollToQ = ltScrollToQ;
// Getters for block-2 code (popstate listener, setupDictionaryDouble) to read block-3 state
window.isLtPracticeActive    = () => _ltPracticeActive;
window.isLtPracticeSubmitted = () => _ltPracticeSubmitted;
// Handles the "close practice on browser Back" logic that lives in block-3 scope
window.handleLtPracticePopstate = function(tab, part) {
    if (!_ltPracticeActive) return false;
    // closeLTPractice()/forceExit() both do this on exit — without it,
    // leaving LT Practice via the browser Back button (rather than the
    // in-page close button) leaves the page stuck in fullscreen with the
    // toolbar hidden even though the section list is now showing.
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    _clearLTPracticeTimer();
    _hideLTPracticeHUD();
    _ltPracticeSubmitted = false;
    _ltPracticeActive    = false;
    _ltLoadingPart       = 0;
    _ltSetCdSkin(false, false);
    const tp = document.getElementById('lt-practice-transcript-panel');
    if (tp) tp.style.display = 'none';
    setTool('none');
    audio.pause();
    audio.src = '';
    if (_ltPracticeBackup) {
        state.answers       = _ltPracticeBackup.answers;
        state.currentTestId = _ltPracticeBackup.currentTestId;
        state.currentTest   = _ltPracticeBackup.currentTest;
        state.partIdx       = _ltPracticeBackup.partIdx;
        state.isReview      = _ltPracticeBackup.isReview;
        _ltPracticeBackup   = null;
    }
    _ltOrigSection = _ltCleanSection = null;
    const _sl = document.getElementById('lt-section-list');
    if (_sl) _sl.innerHTML = '';
    return true;
};
