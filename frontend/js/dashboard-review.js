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
 * already uses, then grades each word's outcome itself: each due word is
 * tagged with its own _reviewBookId so the SRS status PATCH (same endpoint
 * markReviewWord used to call by hand) can be sent to the right book once
 * the quiz ends. See _onReviewDueSessionComplete below.
 */

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

// Entry point for the home card's "Ôn ngay" button — fetches the due queue
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
        refreshReviewDueCard();
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
        // aggregation — tagged onto the word object here so
        // _onReviewDueSessionComplete below can PATCH the right book
        // without needing to thread a second parallel array through the
        // whole quiz engine.
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

// Called by dashboard.js's showResults() at the end of EVERY practice mode;
// no-ops unless this was a review-due session that just finished a mixed
// round (also fires again after "Ôn lại từ sai" retries a subset — see note
// below). Detected from the words themselves (every word in this session
// carries the _reviewBookId tag _startReviewDueQuiz adds) rather than a
// separate boolean flag — a flag would need to be reset by every OTHER
// session-starting entry point in dashboard.js (openFlashcardMode,
// loadUnit, practiceHardWords, ...) to avoid misfiring on an unrelated
// later session in the same page load; deriving it from currentUnit's own
// data needs no such bookkeeping, since every entry point already replaces
// currentUnit wholesale before its own session starts.
//
// Grades each word actually asked this round from the mixed engine's own
// session state: never missed → 'da-thuoc' (SRS box advances); missed at
// least once → 'chua-thuoc' (SRS resets, due again immediately). Not a
// 3-way split like the old self-report buttons — the quiz doesn't cleanly
// distinguish "missed once then got it right" from "missed twice" without
// invasive changes to the answer-handling code in dashboard.js, and
// resetting on ANY miss is a reasonable, common SRS default (same idea as
// Anki's "Again").
window._onReviewDueSessionComplete = function (mode) {
    if (mode !== 'mixed') return;
    // A retried word appears twice in mixedQueue (original + requeue) — dedupe by _id.
    const seen = new Set();
    const words = (mixedQueue || [])
        .map(item => item.word)
        .filter(w => w && w._id && w._reviewBookId && !seen.has(w._id) && seen.add(w._id));
    if (!words.length) return;

    Promise.all(words.map(w => {
        const status = wrongWordSet.has(w.word) ? 'chua-thuoc' : 'da-thuoc';
        return fetch(`${API}/vocabbook/${w._reviewBookId}/words/${w._id}`, {
            method: 'PATCH', headers: authH(),
            body: JSON.stringify({ status }),
        }).catch(() => {});
    })).then(() => refreshReviewDueCard());
};

window.openReviewDueModal = openReviewDueModal;
