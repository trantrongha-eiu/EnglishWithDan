/* ══════════════════════════════════════════════════════════════════════
   Listening "Bài lẻ" — pre-listening Warm-up
   Activity 1 "Synonym Hunt" + Activity 2 "Paraphrase Detectives", opened
   before the student listens (Practice mode only). Ungraded: students just
   fill it in; drafts stay in this browser (localStorage). The answer key
   never comes with the section — staff (teacher/admin) fetch it on demand
   from the teacher-only /api/admin/listening/sections/:id/warmup.
   ══════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    const BLANK = '____';
    let _warmUp = null;     // { synonyms: [{keyword}], paraphrases: [{question, evidence}] }
    let _sectionId = null;
    let _key = null;        // teacher key once fetched
    let _showKey = false;

    const esc = (s) => window.escHtml(String(s == null ? '' : s));
    const isStaff = () => !!(window.AuthService && window.AuthService.isStaff && window.AuthService.isStaff());
    const draftKey = () => `ews_lt_warmup_${_sectionId}`;
    const el = () => document.getElementById('lt-warmup');

    function loadDraft() {
        try { return JSON.parse(localStorage.getItem(draftKey()) || '{}') || {}; } catch (e) { return {}; }
    }
    function saveDraft() {
        const root = el();
        if (!root) return;
        const d = {};
        root.querySelectorAll('[data-wu]').forEach((f) => { if (f.value.trim()) d[f.dataset.wu] = f.value; });
        try { localStorage.setItem(draftKey(), JSON.stringify(d)); } catch (e) { /* private mode — fine */ }
    }

    function keyHtml(text) {
        return _showKey && text ? `<span class="lt-wu-key"><i class="fas fa-key"></i> ${esc(text)}</span>` : '';
    }

    function render() {
        const w = _warmUp;
        const draft = loadDraft();
        const val = (k) => esc(draft[k] || '');
        const keyS = (i) => keyHtml(_key && _key.synonyms[i] && _key.synonyms[i].answer);
        const keyP = (i) => keyHtml(_key && _key.paraphrases[i] && _key.paraphrases[i].answer);

        const synRows = w.synonyms.map((s, i) => `
            <div class="lt-wu-row">
                <span class="lt-wu-no">${i + 1}</span>
                <span class="lt-wu-kw">${esc(s.keyword)}</span>
                <span class="lt-wu-ans">
                    <input class="lt-wu-input" data-wu="s${i}" value="${val('s' + i)}" placeholder="…" autocomplete="off" spellcheck="false" aria-label="Từ đồng nghĩa cho ${esc(s.keyword)}">
                    ${keyS(i)}
                </span>
            </div>`).join('');

        const paraRows = w.paraphrases.map((p, i) => {
            const [before, after] = String(p.evidence).split(BLANK);
            return `
            <div class="lt-wu-row">
                <span class="lt-wu-no">${i + 1}</span>
                <span class="lt-wu-kw">${esc(p.question)}</span>
                <span class="lt-wu-evi">${esc(before)}<input class="lt-wu-input lt-wu-inline" data-wu="p${i}" value="${val('p' + i)}" autocomplete="off" spellcheck="false" aria-label="Từ còn thiếu ${i + 1}">${esc(after || '')}${keyP(i)}</span>
            </div>`;
        }).join('');

        const staffBtn = isStaff()
            ? `<button type="button" class="lt-wu-keybtn${_showKey ? ' on' : ''}" onclick="LtWarmUp.toggleKey()"><i class="fas fa-${_showKey ? 'eye-slash' : 'eye'}"></i> ${_showKey ? 'Ẩn đáp án' : 'Hiện đáp án (GV)'}</button>`
            : '';

        el().innerHTML = `
        <div class="lt-wu-box" role="dialog" aria-modal="true" aria-labelledby="lt-wu-title">
            <div class="lt-wu-head">
                <div class="lt-wu-head-text">
                    <h3 id="lt-wu-title"><i class="fas fa-fire"></i> Warm-up trước khi nghe</h3>
                    <p>Tìm từ đồng nghĩa và cách paraphrase giữa câu hỏi và bài nghe. Không chấm đúng sai — cứ đoán thoải mái, rồi nghe để kiểm chứng.</p>
                </div>
                ${staffBtn}
                <button type="button" class="modal-close" onclick="LtWarmUp.close()" aria-label="Đóng"><i class="fas fa-times"></i></button>
            </div>
            <div class="lt-wu-body">
                ${w.synonyms.length ? `
                <section class="lt-wu-act">
                    <h4>Activity 1. Synonym Hunt <span>— Tìm từ đồng nghĩa</span></h4>
                    <p class="lt-wu-hint"><i class="far fa-clock"></i> 5–7 phút · Từ/cụm từ nào trong bài nghe có thể mang nghĩa tương đương với từ khoá trong câu hỏi?</p>
                    <div class="lt-wu-grid">
                        <div class="lt-wu-row lt-wu-th"><span>No.</span><span>Keywords in the questions</span><span>Synonyms / Paraphrases in the transcript</span></div>
                        ${synRows}
                    </div>
                    <div class="lt-wu-challenge">
                        <strong>Thử thách nhóm:</strong> Chọn 3 cặp từ và đặt câu mới sử dụng từ/cụm từ trong transcript.
                        ${[0, 1, 2].map((i) => `<textarea class="lt-wu-input lt-wu-sentence" data-wu="c${i}" rows="1" placeholder="${i + 1}." aria-label="Câu ${i + 1}">${val('c' + i)}</textarea>`).join('')}
                    </div>
                </section>` : ''}
                ${w.paraphrases.length ? `
                <section class="lt-wu-act">
                    <h4>Activity 2. Paraphrase Detectives <span>— Giải mã câu hỏi</span></h4>
                    <p class="lt-wu-hint"><i class="far fa-clock"></i> 7–10 phút · Điền cụm từ paraphrase còn thiếu trong đoạn trích từ bài nghe.</p>
                    <div class="lt-wu-grid">
                        <div class="lt-wu-row lt-wu-th"><span>No.</span><span>Question keywords</span><span>Transcript evidence</span></div>
                        ${paraRows}
                    </div>
                    <p class="lt-wu-discuss"><strong>Thảo luận:</strong> Với mỗi câu, giải thích vì sao cụm từ trong transcript có thể thay thế từ khoá trong câu hỏi.
                    <em>Ví dụ: save time ≈ spend less time vì cả hai đều nói về việc giảm thời gian cần thiết để làm một việc.</em></p>
                </section>` : ''}
            </div>
            <div class="lt-wu-foot">
                <span class="lt-wu-note"><i class="fas fa-check"></i> Câu trả lời được lưu tự động trên máy này</span>
                <button type="button" class="btn-primary" onclick="LtWarmUp.close()">Bắt đầu nghe <i class="fas fa-arrow-right"></i></button>
            </div>
        </div>`;
    }

    function onKey(e) {
        if (e.key === 'Escape') close();
    }

    function open() {
        if (!_warmUp) return;
        let root = el();
        if (!root) {
            root = document.createElement('div');
            root.id = 'lt-warmup';
            root.className = 'lt-wu-overlay';
            root.addEventListener('input', saveDraft);
            document.body.appendChild(root);
        }
        render();
        root.hidden = false;
        document.addEventListener('keydown', onKey);
        const first = root.querySelector('.lt-wu-input');
        if (first) first.focus({ preventScroll: true });
    }

    function close() {
        const root = el();
        if (root && !root.hidden) { saveDraft(); root.hidden = true; }
        document.removeEventListener('keydown', onKey);
    }

    async function toggleKey() {
        if (!isStaff()) return;
        saveDraft();
        if (!_showKey && !_key) {
            try {
                const res = await fetch(`${API}/admin/listening/sections/${_sectionId}/warmup`, { headers: authH() });
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

    // Called on every practice-screen entry. `warmUp` is null in Test
    // Simulation or when the section has none — the topbar button hides.
    function mount(warmUp, sectionId) {
        close();
        const has = !!(warmUp && ((warmUp.synonyms || []).length || (warmUp.paraphrases || []).length));
        _warmUp = has ? { synonyms: warmUp.synonyms || [], paraphrases: warmUp.paraphrases || [] } : null;
        _sectionId = sectionId;
        _key = null;
        _showKey = false;
        const btn = document.getElementById('btn-warmup-pr');
        if (btn) btn.style.display = has ? '' : 'none';
        if (has) open();
    }

    window.LtWarmUp = { mount, open, close, toggleKey };
})();
