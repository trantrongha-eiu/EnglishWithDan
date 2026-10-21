/* ══════════════════════════════════════════════════════════════════════
   Listening "Bài lẻ" — Warm-up trước khi nghe (#screen-warmup)
   Optional mode opened from the section card, like Gap-fill:
     Step 1  Activity 1 "Synonym Hunt" + Thử thách nhóm — guess the words
             the speaker will use (no transcript).
     Step 2  Activity 2 "Paraphrase Detectives" — transcript on the left,
             questions on the right; select (or click) words in the
             transcript to fill the chosen blank, or type.
   Ungraded: drafts stay in this browser (localStorage). The answer key
   never comes with the section — staff (teacher/admin) fetch it on demand
   from the teacher-only /api/admin/listening/sections/:id/warmup.
   ══════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    const BLANK = '____';
    // "Woman:" / "LEON:" speaker labels (same rule as the Gap-fill screen).
    const SPEAKER_RE = /^\s*([A-Z][A-Za-z'.-]*(?:\s+[A-Z][A-Za-z'.-]*){0,2}):\s*(.*)$/;

    let _sec = null;        // { _id, title, partNumber, transcript, warmUp: { synonyms, paraphrases } }
    let _part = null;       // card's part arg, passed on to startPracticeSection
    let _step = 1;
    let _active = 0;        // Activity 2 blank that a transcript pick fills
    let _key = null;        // teacher key once fetched
    let _showKey = false;

    const esc = (s) => window.escHtml(String(s == null ? '' : s));
    const $ = (id) => document.getElementById(id);
    const isStaff = () => !!(window.AuthService && window.AuthService.isStaff && window.AuthService.isStaff());
    const draftKey = () => `ews_lt_warmup_${_sec && _sec._id}`;

    function loadDraft() {
        try { return JSON.parse(localStorage.getItem(draftKey()) || '{}') || {}; } catch (e) { return {}; }
    }
    function saveDraft() {
        if (!_sec) return;
        const d = loadDraft();
        document.querySelectorAll('#screen-warmup [data-wu]').forEach((f) => {
            if (f.value.trim()) d[f.dataset.wu] = f.value; else delete d[f.dataset.wu];
        });
        try { localStorage.setItem(draftKey(), JSON.stringify(d)); } catch (e) { /* private mode — fine */ }
    }

    const keyChip = (text) => (_showKey && text ? `<span class="wu-key"><i class="fas fa-key"></i> ${esc(text)}</span>` : '');

    // Transcript as speaker turns, every word its own <span> so a click can
    // pick it; a drag-selection picks a phrase.
    function transcriptHtml(text) {
        const turns = [];
        let cur = null;
        const flush = () => { if (cur && (cur.speaker || cur.lines.some((l) => l.trim()))) turns.push(cur); cur = null; };
        String(text || '').replace(/[ \t]*\(\d{1,3}\)/g, '').replace(/[ \t]*\bQ\d{1,3}\b\.?/g, '').split('\n').forEach((line) => {
            if (!line.trim()) { flush(); return; }
            const m = line.match(SPEAKER_RE);
            if (m) { flush(); cur = { speaker: m[1], lines: m[2] ? [m[2]] : [] }; }
            else { if (!cur) cur = { speaker: null, lines: [] }; cur.lines.push(line); }
        });
        flush();
        const words = (s) => esc(s).split(/(\s+)/).map((t) => (/\S/.test(t) ? `<span class="wu-w">${t}</span>` : t)).join('');
        return turns.map((t) => `<p class="wu-turn">${t.speaker ? `<span class="wu-speaker">${esc(t.speaker)}</span> ` : ''}${t.lines.map(words).join('<br>')}</p>`).join('');
    }

    function renderSteps() {
        const w = _sec.warmUp;
        const tab = (n, label, count) => `<button type="button" role="tab" class="wu-step${_step === n ? ' on' : ''}" aria-selected="${_step === n}" onclick="LtWarmUp.go(${n})"${count ? '' : ' disabled'}><span class="wu-step-n">${n}</span>${label}</button>`;
        $('wu-steps').innerHTML = tab(1, 'Synonym Hunt', w.synonyms.length) + '<span class="wu-step-sep"></span>' + tab(2, 'Paraphrase Detectives', w.paraphrases.length);
        $('wu-keybtn-slot').innerHTML = isStaff()
            ? `<button type="button" class="wu-keybtn${_showKey ? ' on' : ''}" onclick="LtWarmUp.toggleKey()"><i class="fas fa-${_showKey ? 'eye-slash' : 'eye'}"></i> ${_showKey ? 'Ẩn đáp án' : 'Hiện đáp án (GV)'}</button>`
            : '';
    }

    function renderStep1(draft) {
        const val = (k) => esc(draft[k] || '');
        const rows = _sec.warmUp.synonyms.map((s, i) => `
            <div class="wu-row">
                <span class="wu-no">${i + 1}</span>
                <span class="wu-kw">${esc(s.keyword)}</span>
                <span class="wu-ans">
                    <input class="wu-input" data-wu="s${i}" value="${val('s' + i)}" placeholder="…" autocomplete="off" spellcheck="false" aria-label="Từ đồng nghĩa cho ${esc(s.keyword)}">
                    ${keyChip(_key && _key.synonyms[i] && _key.synonyms[i].answer)}
                </span>
            </div>`).join('');
        return `
        <div class="wu-col">
            <section class="wu-act">
                <h4>Activity 1. Synonym Hunt <span>— Tìm từ đồng nghĩa</span></h4>
                <p class="wu-hint"><i class="far fa-clock"></i> 5–7 phút · Từ/cụm từ nào trong bài nghe có thể mang nghĩa tương đương với từ khoá trong câu hỏi? Cứ đoán thoải mái — không chấm đúng sai.</p>
                <div class="wu-grid">
                    <div class="wu-row wu-th"><span>No.</span><span>Keywords in the questions</span><span>Synonyms / Paraphrases in the transcript</span></div>
                    ${rows}
                </div>
                <div class="wu-box">
                    <strong>Thử thách nhóm:</strong> Chọn 3 cặp từ và đặt câu mới sử dụng từ/cụm từ trong transcript.
                    ${[0, 1, 2].map((i) => `<textarea class="wu-input wu-sentence" data-wu="c${i}" rows="1" placeholder="${i + 1}." aria-label="Câu ${i + 1}">${val('c' + i)}</textarea>`).join('')}
                </div>
            </section>
        </div>`;
    }

    function renderStep2(draft) {
        const val = (k) => esc(draft[k] || '');
        const rows = _sec.warmUp.paraphrases.map((p, i) => {
            const [before, after] = String(p.evidence).split(BLANK);
            return `
            <div class="wu-prow${i === _active ? ' active' : ''}" data-idx="${i}">
                <div class="wu-pq"><span class="wu-no">${i + 1}</span><span class="wu-kw">${esc(p.question)}</span></div>
                <div class="wu-evi">${esc(before)}<input class="wu-input wu-inline" data-wu="p${i}" data-idx="${i}" value="${val('p' + i)}" autocomplete="off" spellcheck="false" aria-label="Từ còn thiếu ${i + 1}">${esc(after || '')}${keyChip(_key && _key.paraphrases[i] && _key.paraphrases[i].answer)}</div>
            </div>`;
        }).join('');
        return `
        <div class="wu-split">
            <aside class="wu-tpane" aria-label="Transcript">
                <div class="wu-tpane-head"><i class="fas fa-scroll"></i> Transcript
                    <span>Bôi đen hoặc bấm vào từ để điền vào ô đang chọn</span></div>
                <div class="wu-transcript" id="wu-transcript">${transcriptHtml(_sec.transcript)}</div>
            </aside>
            <section class="wu-qpane">
                <h4>Activity 2. Paraphrase Detectives <span>— Giải mã câu hỏi</span></h4>
                <p class="wu-hint"><i class="far fa-clock"></i> 7–10 phút · Tìm trong transcript cụm từ paraphrase cho từ khoá của câu hỏi, rồi điền vào chỗ trống.</p>
                ${rows}
                <p class="wu-box wu-discuss"><strong>Thảo luận:</strong> Với mỗi câu, giải thích vì sao cụm từ trong transcript có thể thay thế từ khoá trong câu hỏi.
                <em>Ví dụ: save time ≈ spend less time vì cả hai đều nói về việc giảm thời gian cần thiết để làm một việc.</em></p>
            </section>
        </div>`;
    }

    function renderFooter() {
        const left = _step === 1
            ? '<button class="btn-ghost" onclick="LtWarmUp.close()"><i class="fas fa-arrow-left"></i> Chọn bài khác</button>'
            : '<button class="btn-ghost" onclick="LtWarmUp.go(1)"><i class="fas fa-arrow-left"></i> Activity 1</button>';
        const right = _step === 1 && _sec.warmUp.paraphrases.length
            ? '<button class="btn-primary" onclick="LtWarmUp.go(2)">Tiếp: Activity 2 <i class="fas fa-arrow-right"></i></button>'
            : '<button class="btn-primary" onclick="LtWarmUp.listen()">Làm bài nghe <i class="fas fa-headphones"></i></button>';
        $('wu-footer').innerHTML = `<span class="wu-note"><i class="fas fa-check"></i> Tự lưu trên máy này</span><div class="exam-footer-btns">${left}${right}</div>`;
    }

    function render() {
        const draft = loadDraft();
        renderSteps();
        const body = $('wu-body');
        body.className = `wu-body wu-body-${_step}`;
        body.innerHTML = _step === 1 ? renderStep1(draft) : renderStep2(draft);
        body.querySelectorAll('.wu-inline').forEach(fitWidth);
        body.scrollTop = 0;
        renderFooter();
    }

    function setActive(i) {
        _active = i;
        document.querySelectorAll('#screen-warmup .wu-prow').forEach((r) => r.classList.toggle('active', Number(r.dataset.idx) === i));
    }

    const cleanPick = (t) => String(t || '').replace(/\s+/g, ' ').replace(/^[^\w']+|[^\w']+$/g, '').trim();
    let _lastPick = null;   // { idx, span } — tapping the next word extends the phrase

    function activeInput() { return document.querySelector(`#screen-warmup .wu-inline[data-idx="${_active}"]`); }
    // Activity 2 blanks grow with their text so a picked phrase stays readable.
    function fitWidth(inp) { inp.style.width = `${Math.max(9, inp.value.length + 1)}ch`; }
    function flash(inp) {
        fitWidth(inp);
        inp.classList.add('wu-filled');
        setTimeout(() => inp.classList.remove('wu-filled'), 600);
    }

    // A drag-selection fills the active blank with the phrase and moves on
    // to the next empty blank (marked, not focused — no phone keyboard pop).
    function fillPhrase(text) {
        const clean = cleanPick(text);
        const inp = activeInput();
        if (!clean || !inp) return;
        inp.value = clean.split(' ').slice(0, 6).join(' ');
        flash(inp);
        saveDraft();
        _lastPick = null;
        const blanks = [...document.querySelectorAll('#screen-warmup .wu-inline')];
        const next = blanks.find((b) => Number(b.dataset.idx) > _active && !b.value.trim()) || blanks.find((b) => !b.value.trim());
        if (next) {
            setActive(Number(next.dataset.idx));
            next.closest('.wu-prow').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    // A click/tap fills one word; tapping the very next word of the
    // transcript right after extends it ("spend" → "spend so" → "spend so long").
    function pickWord(span) {
        const word = cleanPick(span.textContent);
        const inp = activeInput();
        if (!word || !inp) return;
        const extend = _lastPick && _lastPick.idx === _active && _lastPick.span.nextElementSibling === span && inp.value.trim();
        inp.value = extend && inp.value.split(' ').length < 6 ? `${inp.value} ${word}` : word;
        _lastPick = { idx: _active, span };
        flash(inp);
        saveDraft();
    }

    function bindScreen() {
        const screen = $('screen-warmup');
        if (screen._wuBound) return;
        screen._wuBound = true;
        screen.addEventListener('input', (e) => {
            if (e.target.classList.contains('wu-inline')) fitWidth(e.target);
            saveDraft();
        });
        screen.addEventListener('focusin', (e) => { if (e.target.classList.contains('wu-inline')) setActive(Number(e.target.dataset.idx)); });
        screen.addEventListener('click', (e) => {
            const row = e.target.closest('.wu-prow');
            if (row && !e.target.closest('input')) setActive(Number(row.dataset.idx));
        });
        // Transcript: a drag-selection fills the phrase, a click/tap the word.
        // pointerup fires once for mouse and touch alike (touchend + the
        // emulated mouseup would fill twice).
        screen.addEventListener('pointerup', (e) => {
            const tr = e.target.closest && e.target.closest('#wu-transcript');
            if (!tr) return;
            setTimeout(() => {
                const sel = window.getSelection();
                const picked = sel && !sel.isCollapsed && tr.contains(sel.anchorNode) ? sel.toString() : '';
                if (cleanPick(picked).includes(' ')) { fillPhrase(picked); sel.removeAllRanges(); return; }
                const w = e.target.closest('.wu-w');
                if (w) { pickWord(w); if (sel) sel.removeAllRanges(); }
            }, 0);
        });
    }

    async function start(sectionId, partNum) {
        if (!window.AuthService.hasPremiumAccess()) { openUpgradeModal(); return; }
        const btn = document.querySelector(`#lt-section-list .practice-card[data-pid="${sectionId}"] .practice-card-btn-warmup`);
        if (btn) { btn._orig = btn.innerHTML; btn.innerHTML = '⏳ Đang tải...'; }
        try {
            const res = await fetch(`${API}/listening/warmup/section/${sectionId}`, { headers: authH() });
            const data = await safeJson(res);
            if (!data.success || !data.section) { toast(data.message || 'Không tải được Warm-up', 'error'); return; }
            _sec = data.section;
            _part = partNum;
            _step = _sec.warmUp.synonyms.length ? 1 : 2;
            _active = 0;
            _key = null;
            _showKey = false;
            $('wu-title').innerHTML = `<i class="fas fa-fire"></i> Warm-up: ${esc(_sec.title || '')}`;
            bindScreen();
            render();
            showScreen('warmup');
            window.scrollTo(0, 0);
        } catch (e) {
            toast('Lỗi: ' + (e && e.message || 'Không xác định'), 'error');
            console.error('[LtWarmUp.start]', e);
        } finally {
            if (btn && btn._orig) { btn.innerHTML = btn._orig; btn._orig = null; }
        }
    }

    function go(step) {
        if (!_sec) return;
        saveDraft();
        _step = step;
        render();
    }

    function close() {
        saveDraft();
        _sec = null;
        showScreen('list');
    }

    // Done warming up → straight into the listening practice for this section.
    function listen() {
        if (!_sec) return;
        const id = _sec._id, part = _part || _sec.partNumber;
        close();
        startPracticeSection(id, part);
    }

    async function toggleKey() {
        if (!isStaff() || !_sec) return;
        saveDraft();
        if (!_showKey && !_key) {
            try {
                const res = await fetch(`${API}/admin/listening/sections/${_sec._id}/warmup`, { headers: authH() });
                const data = await safeJson(res);
                if (!data.success) throw new Error(data.message || '');
                _key = data.warmUp;
            } catch (e) {
                toast('Không tải được đáp án warm-up', 'error');
                return;
            }
        }
        _showKey = !_showKey;
        render();
    }

    window.LtWarmUp = { start, go, close, listen, toggleKey };
})();
