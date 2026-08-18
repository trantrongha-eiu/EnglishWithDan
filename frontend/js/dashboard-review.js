/**
 * dashboard-review.js — "Ôn tập hôm nay" spaced-repetition review queue.
 * Page-owned split file (same pattern as dashboard-lesson.js/dashboard-
 * audio.js): loads before dashboard.js but only calls its globals (API,
 * authH, _esc, toast) inside functions invoked after DOMContentLoaded, once
 * dashboard.js has finished defining them.
 *
 * Source of words is GET /api/vocabbook/review/due, which can span multiple
 * books — unlike the existing practice-quiz engine (startPractice/
 * currentUnit), which assumes a single currentBookId, so this deliberately
 * does NOT reuse that engine. Each due word carries its own bookId from the
 * aggregation, threaded through to the status-update PATCH call below.
 */

let _reviewDueList = [];

async function refreshReviewDueCard() {
    const card = document.getElementById('review-due-card');
    if (!card) return;
    try {
        const data = await fetch(`${API}/vocabbook/review/due?limit=50`, { headers: authH() })
            .then(r => window.ApiClient.handleResponse(r));
        const count = (data.words || []).length;
        if (count === 0) { card.style.display = 'none'; return; }
        document.getElementById('review-due-title').textContent =
            count >= 50 ? '50+ từ cần ôn lại' : `${count} từ cần ôn lại`;
        card.style.display = 'flex';
    } catch {
        card.style.display = 'none';
    }
}

async function openReviewDueModal() {
    openModal('modal-review-due');
    const body = document.getElementById('review-due-body');
    body.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text3)"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';
    document.getElementById('review-due-count').textContent = '';
    try {
        const data = await fetch(`${API}/vocabbook/review/due?limit=50`, { headers: authH() })
            .then(r => window.ApiClient.handleResponse(r));
        _renderReviewDueWords(data.words || []);
    } catch {
        body.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text3)">Không thể tải danh sách. Vui lòng thử lại.</div>';
    }
}

function closeReviewDueModal() { closeModal('modal-review-due'); }

function _renderReviewDueWords(items) {
    _reviewDueList = items;
    const body = document.getElementById('review-due-body');
    document.getElementById('review-due-count').textContent = items.length ? `(${items.length} từ)` : '';

    if (!items.length) {
        body.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:var(--text3)">
                <div style="font-size:48px;margin-bottom:12px">🎉</div>
                <p style="font-size:14px;font-weight:600;color:var(--text2)">Không còn từ nào cần ôn lúc này!</p>
                <p style="font-size:13px;margin-top:6px;line-height:1.6">Quay lại sau — từ sẽ đến hạn ôn dần theo lịch trí nhớ.</p>
            </div>`;
        return;
    }

    body.innerHTML = items.map(item => {
        const w = item.word;
        return `
        <div class="dw-item" id="review-item-${w._id}">
            <div class="dw-item-header">
                <div style="min-width:0">
                    <span class="dw-word">${_esc(w.word)}</span>
                    ${w.phonetic     ? `<span class="dw-phonetic"> ${_esc(w.phonetic)}</span>` : ''}
                    ${w.partOfSpeech ? `<span class="dw-pos"> · ${_esc(w.partOfSpeech)}</span>` : ''}
                </div>
                <span class="dw-wrong-badge" style="background:var(--brand-light);color:var(--text2)">${_esc(item.bookName)}</span>
            </div>
            <div class="dw-meaning">${w.meaning ? _esc(w.meaning) : '<em style="color:var(--text3)">Chưa có nghĩa</em>'}</div>
            ${w.example ? `<div class="dw-example">${_esc(w.example)}</div>` : ''}
            <div style="display:flex;gap:6px;margin-top:10px">
                <button class="btn-outline" style="flex:1;font-size:12px;padding:7px 4px" onclick="markReviewWord('${item.bookId}','${w._id}','chua-thuoc')">Chưa thuộc</button>
                <button class="btn-outline" style="flex:1;font-size:12px;padding:7px 4px" onclick="markReviewWord('${item.bookId}','${w._id}','nho-so-so')">So-so</button>
                <button class="btn-primary" style="flex:1;font-size:12px;padding:7px 4px" onclick="markReviewWord('${item.bookId}','${w._id}','da-thuoc')">Đã thuộc</button>
            </div>
        </div>`;
    }).join('');
}

async function markReviewWord(bookId, wordId, status) {
    try {
        const res = await fetch(`${API}/vocabbook/${bookId}/words/${wordId}`, {
            method: 'PATCH', headers: authH(),
            body: JSON.stringify({ status })
        });
        await window.ApiClient.handleResponse(res);
        document.getElementById(`review-item-${wordId}`)?.remove();
        _reviewDueList = _reviewDueList.filter(item => item.word._id !== wordId);
        document.getElementById('review-due-count').textContent = _reviewDueList.length ? `(${_reviewDueList.length} từ)` : '';
        if (_reviewDueList.length === 0) _renderReviewDueWords([]);
        refreshReviewDueCard();
    } catch {
        toast('Lỗi khi cập nhật, vui lòng thử lại', 'error');
    }
}

window.openReviewDueModal = openReviewDueModal;
window.closeReviewDueModal = closeReviewDueModal;
window.markReviewWord = markReviewWord;
