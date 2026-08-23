/**
 * dashboard-review.js — "Ôn tập hôm nay" spaced-repetition review queue.
 * Page-owned split file (same pattern as dashboard-lesson.js/dashboard-
 * audio.js): loads before dashboard.js but only calls its globals (API,
 * authH, _esc, toast, and the vocab-practice engine's own state — currentUnit,
 * showMode, wrongWordSet, mixedQueue, etc.) inside functions invoked after
 * DOMContentLoaded, once dashboard.js has finished defining them.
 *
 * Source of words is GET /api/vocabbook/review/due, which can span multiple
 * books — unlike dashboard.js's practice-quiz engine (startPractice/
 * currentUnit), which assumes a single currentBookId for persisting results.
 * Rather than building a separate review UI (the previous version's "Chưa
 * thuộc/So-so/Đã thuộc" button list — clicking them had no visible effect,
 * and self-reported mastery is a weaker signal than a graded quiz anyway),
 * this launches the SAME mixed-mode quiz screen every other practice flow
 * already uses. Each due word is tagged with its own _reviewBookId so
 * dashboard.js's shared _syncPracticeEvidence() (called from showResults()
 * for EVERY practice mode, not just this one) knows which book to PATCH —
 * this file no longer grades words itself; see that function's comment for
 * why "ever wrong this session" wins over any correct answer along the way.
 */

// Entry point for the "Cần ôn lại" home tile — fetches the due queue
// and launches it straight into a mixed quiz (no intermediate list screen).
async function openReviewDueModal() {
    let data;
    try {
        data = await fetch(`${API}/vocabbook/review/due?limit=50`, { headers: authH() })
            .then(r => window.ApiClient.handleResponse(r));
    } catch {
        toast('Không thể tải danh sách ôn tập. Vui lòng thử lại', 'error');
        return;
    }
    const items = data.words || [];
    if (!items.length) {
        toast('🎉 Không còn từ nào cần ôn lúc này!', 'success');
        if (typeof loadMyVocabStats === 'function') loadMyVocabStats();
        return;
    }
    _startReviewDueQuiz(items);
}

function _startReviewDueQuiz(items) {
    _isBookPractice = false;
    _isHardWordsSession = false;
    currentBookId = null; // so closing the session lands back on the dashboard home, not a stale book
    currentUnit = {
        // Each due word carries its own bookId from the /review/due
        // aggregation — tagged onto the word object here so dashboard.js's
        // _syncPracticeEvidence() can PATCH the right book without needing
        // to thread a second parallel array through the whole quiz engine.
        words: items.map(it => ({ ...it.word, _reviewBookId: it.bookId })),
        title: 'Ôn tập hôm nay',
    };
    document.getElementById('view-mybook').style.display = 'none';
    const lessonView = document.getElementById('view-lesson');
    if (lessonView) lessonView.style.display = 'none';
    document.getElementById('view-unit').style.display = 'flex';
    document.getElementById('unitTitle').textContent = `🧠 Ôn tập hôm nay – ${items.length} từ`;
    if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });
    showMode('mixed');
}

window.openReviewDueModal = openReviewDueModal;

// ── Weak vocabulary practice — "Từ yếu" dashboard tile + Weakness card's
// Vocabulary chip. Same cross-book launcher shape as _startReviewDueQuiz
// above (words tagged with their own _reviewBookId so the shared
// _syncPracticeEvidence() in dashboard.js's showResults() can PATCH each
// one back to the right book), sourced from GET /vocabbook/weak instead of
// the due-today queue. Always fetches fresh rather than trusting
// loadWeaknessProfile()'s cached count — that count may be stale by the
// time the student actually clicks.
async function practiceWeakVocab() {
    let data;
    try {
        data = await fetch(`${API}/vocabbook/weak?limit=20`, { headers: authH() })
            .then(r => window.ApiClient.handleResponse(r));
    } catch {
        toast('Không thể tải danh sách từ yếu. Vui lòng thử lại', 'error');
        return;
    }
    const items = data.words || [];
    if (!items.length) {
        toast('🎉 Bạn chưa có từ nào bị đánh dấu yếu!', 'success');
        return;
    }
    _startWeakVocabQuiz(items);
}

function _startWeakVocabQuiz(items) {
    _isBookPractice = false;
    _isHardWordsSession = false;
    currentBookId = null; // so closing the session lands back on the dashboard home, not a stale book
    currentUnit = {
        words: items.map(it => ({ ...it.word, _reviewBookId: it.bookId })),
        title: 'Ôn từ yếu',
    };
    document.getElementById('view-mybook').style.display = 'none';
    const lessonView = document.getElementById('view-lesson');
    if (lessonView) lessonView.style.display = 'none';
    document.getElementById('view-unit').style.display = 'flex';
    document.getElementById('unitTitle').textContent = `🔥 Ôn từ yếu – ${items.length} từ`;
    if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });
    showMode('mixed');
}

window.practiceWeakVocab = practiceWeakVocab;
