'use strict';
/* ══════════════════════════════════════════════
   CONFIG & STATE
══════════════════════════════════════════════ */
const API = 'https://englishwithdan.onrender.com/api';
function authH() {
    return { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' };
}

// ── UI State ──────────────────────────────────
let myBooks = [];
let currentBookId = null;
let currentBookData = null;
let selectedWordIds = new Set();

// ── Unit State ─────────────────────────────────
let currentUnit = null;
let practiceWords = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let currentMode = 'study';
let currentWord = null;
let isFlipped = false;
let hintUsed = false;
let answered = false;
let soundEnabled = true;

// ── Spaced Repetition & Mixed Mode ─────────────
let wrongWordSet = new Set();   // word strings that were answered wrong this session
let requeuedWords = new Set();  // prevent infinite requeue
let mixedQueue = [];            // [{word, type}] for mixed mode
let mixedIndex = 0;
let _retryWordList = null;      // set by retryWrongWords, consumed by startPractice

// ── Session streak tracking ────────────────────
let sessionAnsweredCount = 0;
let _streakReportedThisSession = false;

// ── Vocab book practice tracking ───────────────
let _isBookPractice = false;     // true khi luyện từ sổ cá nhân, false khi luyện unit
let _isDifficultPractice = false; // true khi ôn từ hay sai

// ── Flashcard auto-advance timer ──────────────
let _autoNextTimer = null;
function _clearAutoNext() {
    if (_autoNextTimer !== null) { clearTimeout(_autoNextTimer); _autoNextTimer = null; }
}

function _countAnswer() {
    sessionAnsweredCount++;
    if (!_streakReportedThisSession && sessionAnsweredCount >= 5) {
        _reportSessionStreak();
    }
}

// ── Save-word pending ──────────────────────────
let pendingSaveWord = null;
let selectedBookForSave = null;

// ── Audio ──────────────────────────────────────
const correctSound = new Audio('./sounds/correct.mp3');
const wrongSound   = new Audio('./sounds/incorrect.mp3');
correctSound.volume = 0.5;
wrongSound.volume   = 0.5;

/* ══════════════════════════════════════════════
   SPEAK WORD — multi-layer fallback
   Layer 1: Web Speech API (cần Google TTS / hệ thống TTS)
   Layer 2: DictionaryAPI audio (MP3 có sẵn online)
   Layer 3: Google Translate TTS (fallback cuối)
══════════════════════════════════════════════ */
let _ttsCache = {};   // word → audio URL đã tìm được

async function speakWord(word) {
    if (!word) return;
    word = word.trim();

    // ── Layer 1: Web Speech API ──────────────────
    const synth = window.speechSynthesis;
    if (synth) {
        // Kiểm tra có voice tiếng Anh không
        const voices = synth.getVoices();
        const hasEnVoice = voices.some(v => v.lang.startsWith('en'));

        if (hasEnVoice) {
            synth.cancel();
            const utt = new SpeechSynthesisUtterance(word);
            utt.lang  = 'en-US';
            utt.rate  = 0.85;
            utt.pitch = 1;
            // Chọn voice en-US nếu có
            const enVoice = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en'));
            if (enVoice) utt.voice = enVoice;
            synth.speak(utt);

            // Nếu 1.5s sau vẫn đang "speaking" nhưng không thực sự phát → fallback
            return new Promise(resolve => {
                let timedOut = false;
                const timer = setTimeout(async () => {
                    timedOut = true;
                    synth.cancel();
                    await _speakFallback(word);
                    resolve();
                }, 1500);

                utt.onstart = () => clearTimeout(timer);
                utt.onend   = () => { clearTimeout(timer); resolve(); };
                utt.onerror = async () => {
                    clearTimeout(timer);
                    if (!timedOut) { await _speakFallback(word); resolve(); }
                };
            });
        }
    }

    // Không có Web Speech → fallback ngay
    await _speakFallback(word);
}

async function _speakFallback(word) {
    // ── Layer 2: Cache hit ────────────────────────
    if (_ttsCache[word]) {
        _playAudioUrl(_ttsCache[word]);
        return;
    }

    // ── Layer 2: DictionaryAPI (MP3 thật, không CORS) ─
    try {
        const res  = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        if (res.ok) {
            const data = await res.json();
            let audioUrl = '';
            for (const entry of data) {
                for (const ph of (entry.phonetics || [])) {
                    if (ph.audio && ph.audio.includes('.mp3')) {
                        audioUrl = ph.audio.startsWith('http') ? ph.audio : 'https:' + ph.audio;
                        break;
                    }
                }
                if (audioUrl) break;
            }
            if (audioUrl) {
                _ttsCache[word] = audioUrl;
                _playAudioUrl(audioUrl);
                return;
            }
        }
    } catch { /* ignore */ }

    // ── Layer 3: Web Speech không cần voice check (voices load trễ trên mobile) ──
    try {
        const synth2 = window.speechSynthesis;
        if (synth2) {
            synth2.cancel();
            const utt2 = new SpeechSynthesisUtterance(word);
            utt2.lang  = 'en-US';
            utt2.rate  = 0.85;
            synth2.speak(utt2);
            await new Promise(resolve => {
                utt2.onend   = resolve;
                utt2.onerror = resolve;
                setTimeout(resolve, 2000);
            });
            return;
        }
    } catch { /* ignore */ }

    // ── Layer 4: Google Translate TTS (Audio element bypass CORS) ─────────────
    const gtUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(word)}`;
    _ttsCache[word] = gtUrl;
    _playAudioUrl(gtUrl);
}

function _playAudioUrl(url) {
    try {
        const audio = new Audio(url);
        audio.volume = 1;
        audio.play().catch(() => {
            // Nếu autoplay bị block, không làm gì (tránh crash)
        });
    } catch { }
}

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const name = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || '';
    if (name) { const uEl = document.getElementById('userName'); if (uEl) uEl.textContent = `👋 ${name}`; }
    // Show avatar initial
    const navAv = document.getElementById('navAvatar');
    if (navAv && name) navAv.textContent = name[0].toUpperCase();
    if (navAv && user.avatar) {
      navAv.style.background = 'none';
      navAv.innerHTML = `<img src="${user.avatar}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;" alt="avatar">`;
    }

    // Preload voices (Chrome cần gọi getVoices trước)
    if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }

    setupEmojiPicker();
    await Promise.all([loadMyBooks(), loadUnits()]);
    loadStreakAndUpdateMascot();
    updateDifficultBadge();
});

/* ══════════════════════════════════════════════
   ANIMATION UTILITIES
══════════════════════════════════════════════ */

/* Count-up từ giá trị hiện tại lên target */
function animateCount(el, target, duration = 480) {
    if (!el) return;
    const from = parseInt(el.textContent, 10) || 0;
    if (from === target) return;
    const startTime = performance.now();
    function step(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        el.textContent = Math.round(from + (target - from) * eased);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target; // đảm bảo chính xác
    }
    requestAnimationFrame(step);
}

/* Confetti burst – dùng khi đạt thành tích */
function spawnConfetti(count = 60) {
    const colors = ['#e53935','#3d8bff','#22c55e','#f59e0b','#a78bfa','#fb7185','#34d399'];
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-particle';
        const size = 5 + Math.random() * 8;
        el.style.cssText =
            `left:${8 + Math.random() * 84}%;` +
            `background:${colors[Math.floor(Math.random() * colors.length)]};` +
            `animation:confettiFall ${0.9 + Math.random() * 1.3}s ${Math.random() * 0.35}s linear forwards;` +
            `width:${size}px;height:${size}px;` +
            `border-radius:${Math.random() > .5 ? '50%' : '2px'};`;
        document.body.appendChild(el);
        el.addEventListener('animationend', () => el.remove(), { once: true });
    }
}

/* Kiểm tra xem sổ đã thuộc hết chưa → celebrate */
function checkBookCompletion() {
    if (!currentBookData?.words?.length) return;
    const total    = currentBookData.words.length;
    const mastered = currentBookData.words.filter(w => w.status === 'da-thuoc').length;
    if (mastered === total) {
        const fill = document.getElementById('book-progress-fill');
        if (fill) {
            fill.classList.remove('complete');
            // Force reflow để restart animation
            void fill.offsetWidth;
            fill.classList.add('complete');
            setTimeout(() => fill.classList.remove('complete'), 2800);
        }
        spawnConfetti(90);
        toast(`🎉 Excellent! You've mastered all ${total} words!`, 'success');
    }
}

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function toast(msg, type = 'success') {
    const el = document.getElementById('toast');
    el.className = `show ${type}`;
    document.getElementById('toast-msg').textContent = msg;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3000);
}
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// FIX: thay window.confirm bằng modal nội bộ
function confirm2(title, msg, onOk) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-msg').textContent   = msg;
    document.getElementById('btn-confirm-ok').onclick = () => { closeModal('modal-confirm'); onOk(); };
    openModal('modal-confirm');
}

function pad(n) { return String(n).padStart(2, '0'); }
function toggleSound() {
    soundEnabled = !soundEnabled;
    const text = soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    document.getElementById('soundToggle').textContent = text;
    const mob = document.getElementById('soundToggleMob');
    if (mob) mob.textContent = text;
}
function playCorrectSound() { if (soundEnabled) { correctSound.currentTime = 0; correctSound.play().catch(()=>{}); } }
function playWrongSound()   { if (soundEnabled) { wrongSound.currentTime   = 0; wrongSound.play().catch(()=>{}); } }
function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
}

/* ══════════════════════════════════════════════
   MASCOT PANDA – STREAK & MOTIVATION
══════════════════════════════════════════════ */
const MASCOT_MSGS = [
    ['🔥 {n}-day streak! Amazing – keep it up! 🌟', 7],
    ['😤 {n} days in a row! No joke, you\'re doing great!', 3],
    ['🥳 {n} days! Every word brings you closer to 7.0+!', 2],
    ['💪 Keep going! Daily study builds an amazing habit!', 0],
];
function getMascotMsg(streak) {
    for (const [msg, min] of MASCOT_MSGS) {
        if (streak >= min) return msg.replace('{n}', streak);
    }
    return '💪 Let\'s study! I believe in you!';
}
function getMascotEmoji(streak) {
    if (streak >= 30) return '🐼🎉';
    if (streak >= 14) return '🐼🌟';
    if (streak >= 7)  return '🐼🔥';
    if (streak >= 3)  return '🐼😊';
    return '🐼';
}
async function loadStreakAndUpdateMascot() {
    try {
        const res  = await fetch(`${API}/user/stats`, { headers: authH() });
        const data = await res.json();
        if (!data.success) return;
        const streak = data.stats?.streak ?? 0;
        const numEl  = document.getElementById('mascot-streak-num');
        const msgEl  = document.getElementById('mascot-msg');
        const pandaEl = document.getElementById('mascot-panda');
        if (numEl)  numEl.textContent  = streak;
        if (msgEl)  msgEl.textContent  = getMascotMsg(streak);
        if (pandaEl) pandaEl.textContent = getMascotEmoji(streak);
    } catch { /* silent */ }
}

/* ══════════════════════════════════════════════
   MY BOOKS – SIDEBAR
══════════════════════════════════════════════ */
async function loadMyBooks() {
    try {
        const res  = await fetch(`${API}/vocabbook`, { headers: authH() });
        if (res.status === 401) { logout(); return; }
        if (!res.ok) {
            const isColdStart = res.status === 502 || res.status === 503;
            throw new Error(isColdStart ? 'cold-start' : `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        myBooks = data.books;
        renderBookSidebar();
    } catch (err) {
        console.error('loadMyBooks:', err);
        const isColdStart = err.message === 'cold-start';
        const wrap = document.getElementById('book-list-sidebar');
        if (wrap) {
            wrap.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">
              <div style="font-size:28px;margin-bottom:8px">${isColdStart ? '🔄' : '⚠️'}</div>
              <div style="margin-bottom:10px">${isColdStart ? 'Server is starting up,<br>please try again in a few seconds.' : 'Failed to load notebooks'}</div>
              <button onclick="loadMyBooks()" style="background:var(--brand);color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:12px;cursor:pointer;font-family:inherit">Retry</button>
            </div>`;
        }
    }
}

function renderBookSidebar() {
    const wrap = document.getElementById('book-list-sidebar');
    wrap.innerHTML = myBooks.map((b, i) => `
    <div class="book-item ${b._id === currentBookId ? 'active' : ''}"
         draggable="true"
         data-idx="${i}"
         id="bi-${b._id}"
         onclick="openBook('${b._id}')"
         ondragstart="bookDragStart(event,${i})"
         ondragover="bookDragOver(event)"
         ondragleave="bookDragLeave(event)"
         ondrop="bookDrop(event,${i})"
         ondragend="bookDragEnd(event)">
      <span class="book-drag-handle" title="Kéo để sắp xếp">⠿</span>
      <span class="book-emoji">${b.emoji}</span>
      <span class="book-name">${b.name}</span>
      <span class="book-count">${b.totalWords}</span>
      <button class="book-menu-btn" onclick="event.stopPropagation();openBookMenu('${b._id}')" title="Options">⋯</button>
    </div>
  `).join('');

    // Update book count badge & add button state
    const badge = document.getElementById('book-count-badge');
    if (badge) badge.textContent = `${myBooks.length}/15`;
    const addBtn = document.getElementById('btn-add-book');
    if (addBtn) {
        const atLimit = myBooks.length >= 15;
        addBtn.title  = atLimit ? 'Đã đạt giới hạn 15 sổ' : 'Add new notebook';
        addBtn.style.opacity = atLimit ? '0.4' : '';
        addBtn.style.cursor  = atLimit ? 'not-allowed' : '';
    }

    if (typeof syncSheetBooks === 'function') syncSheetBooks();
}

// ── Drag & drop reorder ───────────────────────
let _dragBookIdx = null;
let _saveOrderTimer = null;

function bookDragStart(e, idx) {
    _dragBookIdx = idx;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
}
function bookDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
}
function bookDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
function bookDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.book-item').forEach(el => el.classList.remove('drag-over'));
}
function bookDrop(e, targetIdx) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (_dragBookIdx === null || _dragBookIdx === targetIdx) return;
    const moved = myBooks.splice(_dragBookIdx, 1)[0];
    myBooks.splice(targetIdx, 0, moved);
    _dragBookIdx = null;
    renderBookSidebar();
    // Debounce save to backend
    clearTimeout(_saveOrderTimer);
    _saveOrderTimer = setTimeout(saveBookOrder, 600);
}
async function saveBookOrder() {
    try {
        await fetch(`${API}/vocabbook/reorder`, {
            method: 'PUT',
            headers: authH(),
            body: JSON.stringify({ order: myBooks.map((b, i) => ({ _id: b._id, sortOrder: i })) })
        });
    } catch (_) {}
}

function openBook(bookId) {
    const doOpen = async () => {
        currentBookId = bookId;
        selectedWordIds.clear();

        // Clear search when switching books
        const searchEl = document.getElementById('book-search');
        if (searchEl) searchEl.value = '';

        document.querySelectorAll('.book-item').forEach(el => el.classList.remove('active'));
        const item = document.getElementById(`bi-${bookId}`);
        if (item) item.classList.add('active');

        const content = document.getElementById('book-content');
        document.getElementById('view-mybook').style.display  = 'flex';
        document.getElementById('view-unit').style.display    = 'none';
        document.getElementById('book-welcome').style.display = 'none';
        content.style.display = 'flex';
        if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });

        // Show skeleton while loading
        document.getElementById('words-tbody').innerHTML = Array(5).fill(0).map(() => `
          <tr>
            <td></td>
            <td><div class="skeleton-cell" style="width:80px"></div></td>
            <td><div class="skeleton-cell" style="width:100px"></div></td>
            <td><div class="skeleton-cell" style="width:140px"></div></td>
            <td><div class="skeleton-cell" style="width:180px"></div></td>
            <td></td><td></td>
          </tr>`).join('');
        content.classList.add('loading');

        await refreshCurrentBook();
        content.classList.remove('loading');
        loadStreakAndUpdateMascot();
    };
    askQuitPractice(doOpen);
}

async function refreshCurrentBook() {
    try {
        const res  = await fetch(`${API}/vocabbook/${currentBookId}`, { headers: authH() });
        if (res.status === 401) { logout(); return; }
        if (!res.ok) {
            const isColdStart = res.status === 502 || res.status === 503;
            throw new Error(isColdStart ? 'Server is starting up, please try again.' : `Server error (${res.status})`);
        }
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        currentBookData = data.book;
        renderBookContent(data.book);
    } catch (err) { toast('Error loading notebook: ' + err.message, 'error'); }
}

function renderBookContent(book) {
    document.getElementById('book-top-emoji').textContent = book.emoji;
    document.getElementById('book-editable-name').value   = book.name;

    const total = book.words.length;
    const da    = book.words.filter(w => w.status === 'da-thuoc').length;
    const nho   = book.words.filter(w => w.status === 'nho-so-so').length;
    const chua  = book.words.filter(w => w.status === 'chua-thuoc').length;
    const pct   = total ? Math.round((da / total) * 100) : 0;

    // Animate stats count-up khi mở sổ
    animateCount(document.getElementById('stat-da-thuoc'),   da,   550);
    animateCount(document.getElementById('stat-nho-so-so'),  nho,  550);
    animateCount(document.getElementById('stat-chua-thuoc'), chua, 550);
    animateCount(document.getElementById('stat-total'),      total, 550);

    // Delay nhỏ để progress bar animate sau khi DOM render
    requestAnimationFrame(() => {
        document.getElementById('book-progress-fill').style.width = pct + '%';
    });

    // Re-apply active search filter, otherwise render full list
    const searchEl = document.getElementById('book-search');
    const q = searchEl?.value.trim().toLowerCase();
    if (q) {
        const filtered = book.words.filter(w =>
            w.word.toLowerCase().includes(q) ||
            (w.meaning || '').toLowerCase().includes(q) ||
            (w.note || '').toLowerCase().includes(q));
        renderWordsTable(filtered);
        const totalEl = document.getElementById('stat-total');
        const limitEl = document.getElementById('stat-limit-label');
        if (totalEl) totalEl.textContent = filtered.length;
        if (limitEl) limitEl.textContent = ` / ${book.words.length} words`;
    } else {
        renderWordsTable(book.words);
        const limitEl = document.getElementById('stat-limit-label');
        if (limitEl) limitEl.textContent = ' / 300 words';
    }

    // Cập nhật nút "Ôn lại từ hay sai" — luôn hiện khi sổ mở
    const hardBtn = document.getElementById('btn-hard-words');
    if (hardBtn) {
        const hardCount = book.words.filter(w => (w.wrongCount || 0) >= 3).length;
        hardBtn.style.display = '';
        if (hardCount > 0) {
            hardBtn.innerHTML = `<i class="fas fa-fire"></i> Ôn lại từ hay sai (${hardCount})`;
            hardBtn.classList.add('has-hard-words');
        } else {
            hardBtn.innerHTML = `<i class="fas fa-fire"></i> Ôn lại từ hay sai`;
            hardBtn.classList.remove('has-hard-words');
        }
    }
}

function renderWordsTable(words) {
    const tbody = document.getElementById('words-tbody');
    const total = currentBookData?.words?.length ?? 0;

    // Sort: chưa thuộc → nhớ sơ sơ → đã thuộc, rồi A–Z trong mỗi nhóm
    const statusOrder = { 'chua-thuoc': 0, 'nho-so-so': 1, 'da-thuoc': 2 };
    words = [...words].sort((a, b) => {
        const sd = (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0);
        return sd !== 0 ? sd : a.word.localeCompare(b.word, 'vi', { sensitivity: 'base' });
    });

    if (!total) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:48px;color:var(--text3)">
      <div style="font-size:40px;margin-bottom:10px">📭</div>
      <div>No words in this notebook yet</div>
      <div style="font-size:12px;margin-top:6px">Add words manually or save them while reviewing Reading</div>
    </td></tr>`;
        return;
    }

    if (!words.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text3)">
      <div style="font-size:32px;margin-bottom:10px">🔍</div>
      <div>No matching words found</div>
    </td></tr>`;
        return;
    }

    tbody.innerHTML = words.map((w, i) => {
        const wc = w.wrongCount || 0;
        const diffBadge = wc >= 3
            ? `<span class="diff-badge diff-hard" title="${wc}x wrong">🔥 ${wc}</span>`
            : wc >= 1
            ? `<span class="diff-badge diff-medium" title="${wc}x wrong">⚡ ${wc}</span>`
            : '';
        return `
    <tr class="word-row-anim ${selectedWordIds.has(w._id) ? 'selected' : ''}" id="row-${w._id}"
        style="animation-delay:${Math.min(i * 22, 380)}ms">
      <td class="cb-wrap"><input type="checkbox" ${selectedWordIds.has(w._id) ? 'checked' : ''}
        onchange="toggleSelect('${w._id}', this.checked)"/></td>
      <td>
        <select class="status-select ${w.status}" onchange="updateWordStatus('${w._id}', this.value, this)">
          <option value="chua-thuoc" ${w.status === 'chua-thuoc' ? 'selected' : ''}>Not yet</option>
          <option value="nho-so-so"  ${w.status === 'nho-so-so'  ? 'selected' : ''}>So-so</option>
          <option value="da-thuoc"   ${w.status === 'da-thuoc'   ? 'selected' : ''}>Mastered</option>
        </select>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
          <span class="word-chip-main">${_esc(w.word)}</span>
          ${diffBadge}
          <button class="btn-audio" onclick="speakWord('${escH(w.word)}')" title="Pronounce">🔊</button>
        </div>
        ${w.phonetic ? `<div style="font-size:11px;color:var(--text3);font-family:'JetBrains Mono',monospace">${w.phonetic}</div>` : ''}
      </td>
      <td style="color:var(--text2)">${_esc(w.meaning || '–')}</td>
      <td style="max-width:240px">
        ${w.example ? `<div style="font-size:12px;font-style:italic;color:var(--text2)">${_esc(w.example)}</div>` : ''}
      </td>
      <td style="color:var(--text3);font-size:12px">${_esc(w.note || '')}</td>
      <td style="display:flex;gap:4px">
        <button class="btn btn-ghost btn-sm" onclick="openEditWordModal('${w._id}')" title="Edit word">✏️</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteWord('${w._id}')" title="Delete word">🗑</button>
      </td>
    </tr>`;
    }).join('');
}

/* ── Word search / filter ── */
let _filterTimer = null;
function filterWords(q) {
    clearTimeout(_filterTimer);
    _filterTimer = setTimeout(() => {
        if (!currentBookData) return;
        const query = q.trim().toLowerCase();
        const all   = currentBookData.words;
        const words = query
            ? all.filter(w =>
                w.word.toLowerCase().includes(query) ||
                (w.meaning || '').toLowerCase().includes(query) ||
                (w.note || '').toLowerCase().includes(query))
            : all;
        renderWordsTable(words);
        // Update total count label to show filtered result
        const totalEl    = document.getElementById('stat-total');
        const limitEl    = document.getElementById('stat-limit-label');
        if (totalEl) totalEl.textContent = query ? words.length : all.length;
        if (limitEl) limitEl.textContent = query ? ` / ${all.length} words` : ' / 300 words';
    }, 120);
}

/* ── Status update ── */
async function updateWordStatus(wordId, status, selectEl) {
    const w = currentBookData?.words?.find(x => x._id === wordId);
    const prevStatus = w?.status;
    try {
        selectEl.className = `status-select ${status}`;
        if (w) {
            w.status = status;
            updateStats(currentBookData);
            if (status === 'da-thuoc') {
                const row = document.getElementById(`row-${wordId}`);
                if (row) {
                    row.querySelectorAll('td').forEach(td => td.classList.add('word-mastered-flash'));
                    setTimeout(() => row.querySelectorAll('td').forEach(td => td.classList.remove('word-mastered-flash')), 700);
                }
                checkBookCompletion();
            }
        }
        const res = await fetch(`${API}/vocabbook/${currentBookId}/words/${wordId}`, {
            method: 'PATCH', headers: authH(),
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Server error');
    } catch {
        toast('Update error', 'error');
        if (w && prevStatus !== undefined) {
            w.status = prevStatus;
            selectEl.className = `status-select ${prevStatus}`;
            updateStats(currentBookData);
        }
    }
}

function updateStats(book) {
    const da    = book.words.filter(w => w.status === 'da-thuoc').length;
    const nho   = book.words.filter(w => w.status === 'nho-so-so').length;
    const chua  = book.words.filter(w => w.status === 'chua-thuoc').length;
    const total = book.words.length;
    const pct   = total ? Math.round((da / total) * 100) : 0;

    function popStat(el, target) {
        if (!el) return;
        const prev = parseInt(el.textContent, 10) || 0;
        animateCount(el, target, 380);
        if (prev !== target) {
            el.classList.remove('stat-pop');
            void el.offsetWidth; // force reflow to restart animation
            el.classList.add('stat-pop');
            el.addEventListener('animationend', () => el.classList.remove('stat-pop'), { once: true });
        }
    }
    popStat(document.getElementById('stat-da-thuoc'),   da);
    popStat(document.getElementById('stat-nho-so-so'),  nho);
    popStat(document.getElementById('stat-chua-thuoc'), chua);

    requestAnimationFrame(() => {
        const fill = document.getElementById('book-progress-fill');
        if (fill) fill.style.width = pct + '%';
    });
}

/* ── Delete word ── */
function deleteWord(wordId) {
    confirm2('Delete Word', 'Are you sure you want to delete this word?', async () => {
        try {
            const res = await fetch(`${API}/vocabbook/${currentBookId}/words/${wordId}`, { method: 'DELETE', headers: authH() });
            if (!res.ok) { const d = await res.json().catch(() => ({})); toast(d.message || 'Delete failed', 'error'); return; }
            selectedWordIds.delete(wordId);
            updateBulkBar();
            toast('Word deleted');
            await Promise.all([refreshCurrentBook(), loadMyBooks()]);
        } catch { toast('Delete failed', 'error'); }
    });
}

/* ── Edit word ── */
let editingWordId = null;
function openEditWordModal(wordId) {
    if (!currentBookData) return;
    const w = currentBookData.words.find(x => x._id === wordId);
    if (!w) return;
    editingWordId = wordId;
    document.getElementById('ew-word').value     = w.word     || '';
    document.getElementById('ew-phonetic').value = w.phonetic || '';
    document.getElementById('ew-meaning').value  = w.meaning  || '';
    document.getElementById('ew-example').value  = w.example  || '';
    document.getElementById('ew-note').value     = w.note     || '';
    openModal('modal-edit-word');
    setTimeout(() => document.getElementById('ew-word').focus(), 100);
}
async function saveEditWord() {
    const word = document.getElementById('ew-word').value.trim();
    if (!word) { toast('Word cannot be empty', 'error'); return; }
    try {
        const res = await fetch(`${API}/vocabbook/${currentBookId}/words/${editingWordId}`, {
            method: 'PATCH', headers: authH(),
            body: JSON.stringify({
                word,
                phonetic:    document.getElementById('ew-phonetic').value.trim(),
                meaning:     document.getElementById('ew-meaning').value.trim(),
                example:     document.getElementById('ew-example').value.trim(),
                note:        document.getElementById('ew-note').value.trim(),
            })
        });
        const data = await res.json();
        if (!data.success) { toast(data.message || 'Error saving word', 'error'); return; }
        closeModal('modal-edit-word');
        toast('Word updated ✅');
        await refreshCurrentBook();
    } catch (err) { toast(err.message, 'error'); }
}

/* ── Bulk select ── */
function toggleSelect(wordId, checked) {
    if (checked) selectedWordIds.add(wordId);
    else selectedWordIds.delete(wordId);
    updateBulkBar();
    const row = document.getElementById(`row-${wordId}`);
    if (row) row.classList.toggle('selected', checked);
}
function toggleSelectAll(cb) {
    if (!currentBookData) return;
    currentBookData.words.forEach(w => {
        if (cb.checked) selectedWordIds.add(w._id);
        else selectedWordIds.delete(w._id);
    });
    updateBulkBar();
    renderWordsTable(currentBookData.words);
}
function updateBulkBar() {
    const bar = document.getElementById('bulk-bar');
    if (selectedWordIds.size > 0) {
        bar.classList.add('show');
        document.getElementById('bulk-count').textContent = selectedWordIds.size;
    } else {
        bar.classList.remove('show');
        const allCb = document.getElementById('check-all');
        if (allCb) allCb.checked = false;
    }
}
async function bulkChangeStatus(status) {
    if (!status || !selectedWordIds.size) return;
    try {
        const results = await Promise.all([...selectedWordIds].map(wid =>
            fetch(`${API}/vocabbook/${currentBookId}/words/${wid}`, {
                method: 'PATCH', headers: authH(), body: JSON.stringify({ status })
            })
        ));
        const allOk = results.every(r => r.ok);
        selectedWordIds.clear();
        document.getElementById('bulk-status-sel').value = '';
        toast(allOk ? 'Status updated' : 'Some updates failed', allOk ? 'success' : 'error');
        await Promise.all([refreshCurrentBook(), loadMyBooks()]);
    } catch { toast('Update failed', 'error'); }
}
async function bulkDelete() {
    if (!selectedWordIds.size) return;
    confirm2('Delete Words', `Delete ${selectedWordIds.size} selected words?`, async () => {
        try {
            const res = await fetch(`${API}/vocabbook/${currentBookId}/words`, {
                method: 'DELETE', headers: authH(),
                body: JSON.stringify({ wordIds: [...selectedWordIds] })
            });
            if (!res.ok) { const d = await res.json().catch(() => ({})); toast(d.message || 'Delete failed', 'error'); return; }
            selectedWordIds.clear();
            updateBulkBar();
            toast('Deleted');
            await Promise.all([refreshCurrentBook(), loadMyBooks()]);
        } catch { toast('Delete failed', 'error'); }
    });
}

/* ── Rename book ── */
async function renameBook() {
    const name = document.getElementById('book-editable-name').value.trim();
    if (!name) { toast('Tên sổ không được để trống', 'error'); return; }
    if (!currentBookId) return;
    try {
        await fetch(`${API}/vocabbook/${currentBookId}`, {
            method: 'PUT', headers: authH(), body: JSON.stringify({ name })
        });
        // Update local state so flashcard/practice titles reflect new name immediately
        if (currentBookData) currentBookData.name = name;
        const bEntry = myBooks.find(x => x._id === currentBookId);
        if (bEntry) bEntry.name = name;
        toast('Notebook renamed');
        await loadMyBooks();
    } catch { toast('Error renaming', 'error'); }
}

/* ── Book menu – action sheet ── */
let _menuBookId = null; // book currently open in action sheet

function openBookMenu(bookId) {
    const book = myBooks.find(b => b._id === bookId);
    if (!book) return;
    _menuBookId = bookId;

    document.getElementById('book-actions-title').textContent = `${book.emoji} ${book.name}`;

    // Default books: chỉ cho đổi tên, ẩn gộp/xóa
    const isDefault = !!book.isDefault;
    document.getElementById('btn-merge-from-menu').style.display  = isDefault ? 'none' : 'flex';
    document.getElementById('btn-delete-from-menu').style.display = isDefault ? 'none' : 'flex';

    openModal('modal-book-actions');
}

function startRenameFromMenu() {
    closeModal('modal-book-actions');
    // Focus vào input tên sổ đang mở; nếu sổ chưa mở thì mở trước
    if (_menuBookId && currentBookId !== _menuBookId) openBook(_menuBookId);
    setTimeout(() => {
        const inp = document.getElementById('book-editable-name');
        if (inp) { inp.focus(); inp.select(); }
    }, 200);
}

function deleteBookFromMenu() {
    closeModal('modal-book-actions');
    const book = myBooks.find(b => b._id === _menuBookId);
    if (!book) return;
    confirm2(
        'Xóa sổ',
        `Xóa sổ "${book.name}"? Tất cả từ trong sổ sẽ bị mất.`,
        async () => {
            try {
                const res = await fetch(`${API}/vocabbook/${_menuBookId}`, { method: 'DELETE', headers: authH() });
                if (!res.ok) { const d = await res.json().catch(() => ({})); toast(d.message || 'Xóa thất bại', 'error'); return; }
                if (currentBookId === _menuBookId) {
                    currentBookId = null;
                    document.getElementById('book-content').style.display  = 'none';
                    document.getElementById('book-welcome').style.display  = 'flex';
                }
                toast('Đã xóa sổ');
                await loadMyBooks();
            } catch { toast('Xóa thất bại', 'error'); }
        }
    );
}

/* ── Merge books ── */
function openMergeModal() {
    closeModal('modal-book-actions');
    const destBook = myBooks.find(b => b._id === _menuBookId);
    if (!destBook) return;

    document.getElementById('merge-modal-title').textContent = `Gộp sổ vào "${destBook.name}"`;
    document.getElementById('merge-dest-name').textContent   = `"${destBook.name}"`;

    // Chỉ hiển thị sổ không phải default và không phải sổ đích
    const candidates = myBooks.filter(b => !b.isDefault && b._id !== _menuBookId);
    const list = document.getElementById('merge-book-list');

    if (!candidates.length) {
        list.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">
            Không có sổ nào khác để gộp.<br>
            <span style="font-size:12px">(Chỉ có thể gộp sổ do bạn tự tạo, không phải 5 sổ mặc định.)</span>
        </div>`;
        document.getElementById('btn-confirm-merge').style.display = 'none';
    } else {
        document.getElementById('btn-confirm-merge').style.display = '';
        list.innerHTML = candidates.map(b => `
            <label class="merge-book-item" id="merge-item-${b._id}">
                <input type="checkbox" value="${b._id}" onchange="toggleMergeItem('${b._id}', this.checked)">
                <span style="font-size:18px">${b.emoji}</span>
                <span style="font-size:13px;font-weight:600">${b.name}</span>
                <span class="merge-book-meta">${b.totalWords} từ</span>
            </label>`).join('');
    }

    openModal('modal-merge-books');
}

function toggleMergeItem(bookId, checked) {
    const item = document.getElementById(`merge-item-${bookId}`);
    if (item) item.classList.toggle('selected', checked);
}

async function confirmMerge() {
    const checkedIds = [...document.querySelectorAll('#merge-book-list input[type=checkbox]:checked')]
        .map(cb => cb.value);
    if (!checkedIds.length) { toast('Vui lòng chọn ít nhất 1 sổ', 'error'); return; }

    const destBook = myBooks.find(b => b._id === _menuBookId);
    const btn = document.getElementById('btn-confirm-merge');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gộp...';

    try {
        const res  = await fetch(`${API}/vocabbook/${_menuBookId}/merge`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ sourceIds: checkedIds })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        closeModal('modal-merge-books');

        // Nếu đang xem một trong các sổ bị xóa → chuyển về sổ đích
        if (checkedIds.includes(currentBookId)) {
            currentBookId = _menuBookId;
        }

        await loadMyBooks();
        if (currentBookId === _menuBookId) await openBook(_menuBookId);

        toast(`Đã gộp ${data.mergedCount} sổ · thêm ${data.addedCount} từ mới vào "${destBook?.name}"`, 'success');
    } catch (err) {
        toast(err.message || 'Lỗi khi gộp sổ', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-object-group"></i> Xác nhận gộp';
    }
}

/* ── Add book modal ── */
let selectedEmoji = '📘';
function setupEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    const emojis = ['📘','📗','📙','📕','📓','📔','📒','📃','🗒️','🌟','⭐','🎯','🔥','💡','🚀'];
    picker.innerHTML = emojis.map(e =>
        `<span class="emoji-opt ${e === selectedEmoji ? 'selected' : ''}" onclick="selectEmoji('${e}')">${e}</span>`
    ).join('');
}
function selectEmoji(emoji) { selectedEmoji = emoji; setupEmojiPicker(); }
function openAddBookModal() {
    if (myBooks.length >= 15) {
        toast('Bạn đã đạt giới hạn 15 sổ. Hãy xóa hoặc gộp bớt sổ cũ trước khi tạo mới.', 'error');
        return;
    }
    document.getElementById('new-book-name').value = '';
    openModal('modal-add-book');
    setTimeout(() => document.getElementById('new-book-name').focus(), 100);
}
async function createBook() {
    const name = document.getElementById('new-book-name').value.trim();
    if (!name) { toast('Notebook name cannot be empty', 'error'); return; }
    try {
        const res  = await fetch(`${API}/vocabbook`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ name, emoji: selectedEmoji, color: '#3d8bff' })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        closeModal('modal-add-book');
        toast('Notebook created');
        await loadMyBooks();
        openBook(data.book._id);
    } catch (err) { toast(err.message, 'error'); }
}

/* ── Add word manual ── */
let _lookupPhonetic = '';
let _lookupPartOfSpeech = '';

function openAddWordManual() {
    const wordCount = currentBookData?.words?.length ?? 0;
    if (wordCount >= 300) {
        toast('Sổ này đã đạt giới hạn 300 từ. Hãy tạo sổ mới hoặc xóa bớt từ cũ.', 'error');
        return;
    }
    _lookupPhonetic = '';
    _lookupPartOfSpeech = '';
    ['aw-word','aw-meaning','aw-example','aw-note'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('aw-example-suggestions').innerHTML = '';
    document.getElementById('aw-meaning-suggestions').innerHTML = '';
    openModal('modal-add-word');
    setTimeout(() => document.getElementById('aw-word').focus(), 100);
}
async function lookupNewWord(word) {
    const suggestWrap   = document.getElementById('aw-example-suggestions');
    const meaningSugWrap = document.getElementById('aw-meaning-suggestions');
    clearTimeout(lookupNewWord._t); // always clear, even when word too short
    if (!word || word.length < 2) {
        _lookupPhonetic = '';
        _lookupPartOfSpeech = '';
        if (suggestWrap) suggestWrap.innerHTML = '';
        if (meaningSugWrap) meaningSugWrap.innerHTML = '';
        return;
    }
    _lookupPhonetic = '';
    _lookupPartOfSpeech = '';
    lookupNewWord._t = setTimeout(async () => {
        try {
            const enc = encodeURIComponent;
            // Fetch dictionary (examples + phonetic), Google Translate (primary meaning), MyMemory (alternatives)
            const [dictRes, gtRes, memRes] = await Promise.allSettled([
                fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${enc(word)}`),
                fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${enc(word)}`).then(r => r.json()),
                fetch(`https://api.mymemory.translated.net/get?q=${enc(word)}&langpair=en|vi`)
            ]);

            // ── Dictionary API ──
            if (dictRes.status === 'fulfilled' && dictRes.value.ok) {
                const data = await dictRes.value.json();
                _lookupPhonetic     = data[0]?.phonetics?.find(p => p.text)?.text || '';
                _lookupPartOfSpeech = data[0]?.meanings?.[0]?.partOfSpeech || '';

                const examples = [];
                for (const entry of data) {
                    for (const meaning of entry.meanings || []) {
                        for (const def of meaning.definitions || []) {
                            if (def.example && !examples.includes(def.example)) {
                                examples.push(def.example);
                            }
                        }
                    }
                    if (examples.length >= 5) break;
                }

                if (examples.length && !document.getElementById('aw-example').value) {
                    document.getElementById('aw-example').value = examples[0];
                }
                if (suggestWrap) {
                    if (!examples.length) { suggestWrap.innerHTML = ''; }
                    else {
                        suggestWrap.innerHTML =
                            '<div class="example-suggestion-label">💡 Ví dụ phổ biến — bấm để chọn:</div>' +
                            examples.map(ex => {
                                const attr = ex.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
                                const html = ex.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                                return `<button class="example-suggestion" data-ex="${attr}" onclick="selectExampleSuggestion(this)">${html}</button>`;
                            }).join('');
                        const firstBtn = suggestWrap.querySelector('.example-suggestion');
                        if (firstBtn && !document.getElementById('aw-example').dataset.userEdited) {
                            firstBtn.classList.add('selected');
                        }
                    }
                }
            } else if (suggestWrap) { suggestWrap.innerHTML = ''; }

            // ── Vietnamese meaning: Google Translate (primary) + MyMemory (alternatives) ──
            if (meaningSugWrap) {
                const meanings = [];
                const seen = new Set();

                // Primary: Google Translate — short, accurate
                if (gtRes.status === 'fulfilled') {
                    const gt = gtRes.value?.[0]?.[0]?.[0]?.trim() || '';
                    if (gt && gt.toLowerCase() !== word.toLowerCase()) {
                        meanings.push(gt);
                        seen.add(gt.toLowerCase());
                    }
                }

                // Alternatives: MyMemory ranked by quality
                if (memRes.status === 'fulfilled' && memRes.value.ok) {
                    const tData = await memRes.value.json();
                    const matches = (tData.matches || [])
                        .filter(m => m.translation && typeof m.translation === 'string')
                        .sort((a, b) => (parseFloat(b.quality) || 0) - (parseFloat(a.quality) || 0));
                    for (const m of matches) {
                        if (meanings.length >= 4) break;
                        const val = m.translation.trim();
                        if (!val || val.toLowerCase() === word.toLowerCase()) continue;
                        if (/^[a-z0-9\s\-,.']+$/i.test(val) && !/[àáảãạăắặẳẵằâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(val)) continue;
                        if (!seen.has(val.toLowerCase())) {
                            seen.add(val.toLowerCase());
                            meanings.push(val);
                        }
                    }
                }

                if (!meanings.length) { meaningSugWrap.innerHTML = ''; }
                else {
                    const meaningInp = document.getElementById('aw-meaning');
                    if (meaningInp && !meaningInp.value) meaningInp.value = meanings[0];
                    meaningSugWrap.innerHTML =
                        '<div class="example-suggestion-label meaning-suggestion-label">🇻🇳 Nghĩa gợi ý — bấm để chọn:</div>' +
                        meanings.map(m => {
                            const attr = m.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
                            const html = m.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                            return `<button class="example-suggestion meaning-suggestion" data-val="${attr}" onclick="selectMeaningSuggestion(this)">${html}</button>`;
                        }).join('');
                    const firstM = meaningSugWrap.querySelector('.meaning-suggestion');
                    if (firstM && document.getElementById('aw-meaning').value === meanings[0]) firstM.classList.add('selected');
                }
            }

        } catch { if (suggestWrap) suggestWrap.innerHTML = ''; if (meaningSugWrap) meaningSugWrap.innerHTML = ''; }
    }, 700);
}

window.selectExampleSuggestion = function(btn) {
    const ex = btn.dataset.ex;
    const inp = document.getElementById('aw-example');
    if (inp) inp.value = ex;
    btn.closest('.example-suggestions-wrap')?.querySelectorAll('.example-suggestion')
        .forEach(b => b.classList.toggle('selected', b === btn));
};

window.selectMeaningSuggestion = function(btn) {
    const val = btn.dataset.val;
    const inp = document.getElementById('aw-meaning');
    if (inp) inp.value = val;
    btn.closest('.example-suggestions-wrap')?.querySelectorAll('.meaning-suggestion')
        .forEach(b => b.classList.toggle('selected', b === btn));
};
async function addWordManual() {
    const word    = document.getElementById('aw-word').value.trim();
    const meaning = document.getElementById('aw-meaning').value.trim();
    const example = document.getElementById('aw-example').value.trim();
    const note    = document.getElementById('aw-note').value.trim();
    if (!word) { toast('Enter a word to add', 'error'); return; }
    if (!currentBookId) { toast('Please select a notebook first', 'error'); return; }
    try {
        const res  = await fetch(`${API}/vocabbook/${currentBookId}/words`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ word, meaning, example, note, source: 'manual', phonetic: _lookupPhonetic, partOfSpeech: _lookupPartOfSpeech })
        });
        const data = await res.json();
        if (!data.success) { toast(data.message, 'error'); return; }
        closeModal('modal-add-word');
        toast(data.message);
        await Promise.all([refreshCurrentBook(), loadMyBooks()]);
    } catch (err) { toast(err.message, 'error'); }
}

/* ══════════════════════════════════════════════
   SAVE WORD FROM READING / UNIT
══════════════════════════════════════════════ */
window.openSaveWordModal = async function (wordObj) {
    pendingSaveWord    = wordObj;
    selectedBookForSave = null;

    document.getElementById('sw-word').textContent     = wordObj.word     || '';
    document.getElementById('sw-phonetic').textContent = wordObj.phonetic  || '';
    document.getElementById('sw-meaning').textContent  = wordObj.meaning   || '';
    document.getElementById('sw-example').textContent  = wordObj.example   || '';
    document.getElementById('sw-note').value           = '';

    if (!myBooks.length) await loadMyBooks();
    const list = document.getElementById('sw-book-list');
    list.innerHTML = myBooks.map(b => {
        const isFull = b.totalWords >= 300;
        const isNear = b.totalWords >= 250 && !isFull;
        const countColor = isFull ? '#ef4444' : isNear ? '#f59e0b' : 'var(--text3)';
        const countLabel = isFull ? `${b.totalWords} / 300 (đầy)` : isNear ? `${b.totalWords} / 300` : `${b.totalWords} từ`;
        return `<div class="book-opt" id="bopt-${b._id}"
            onclick="${isFull ? '' : `selectBookForSave('${b._id}',this)`}"
            style="${isFull ? 'opacity:.45;cursor:not-allowed;pointer-events:none' : ''}">
          <span class="book-opt-emoji">${b.emoji}</span>
          <div class="book-opt-info">
            <div class="book-opt-name">${b.name}</div>
            <div class="book-opt-count" style="color:${countColor}">${countLabel}</div>
          </div>
          ${isFull ? '<span style="font-size:10px;color:#ef4444;font-weight:700;flex-shrink:0;padding:2px 6px;border:1px solid #fca5a5;border-radius:4px">FULL</span>' : ''}
        </div>`;
    }).join('');

    // Auto-select currently open book (if not full)
    if (currentBookId) {
        const curBook = myBooks.find(b => b._id === currentBookId);
        if (curBook && curBook.totalWords < 300) {
            selectedBookForSave = currentBookId;
            const opt = document.getElementById(`bopt-${currentBookId}`);
            if (opt) opt.classList.add('selected');
        }
    }

    openModal('modal-save-word');
};

function selectBookForSave(bookId, el) {
    selectedBookForSave = bookId;
    document.querySelectorAll('.book-opt').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
}

async function confirmSaveWord() {
    if (!selectedBookForSave) { toast('Please select a notebook', 'error'); return; }
    const note = document.getElementById('sw-note').value.trim();
    const w    = pendingSaveWord;
    try {
        const res  = await fetch(`${API}/vocabbook/${selectedBookForSave}/words`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ ...w, note })
        });
        const data = await res.json();
        closeModal('modal-save-word');
        toast(data.message, data.success ? 'success' : 'error');
        if (data.success) {
            await Promise.all([
                loadMyBooks(),
                currentBookId === selectedBookForSave ? refreshCurrentBook() : Promise.resolve()
            ]);
        }
    } catch (err) { toast(err.message, 'error'); }
}

/* ══════════════════════════════════════════════
   FLASHCARD / PREVIEW từ sổ cá nhân
══════════════════════════════════════════════ */
function openFlashcardMode() {
    if (!currentBookData?.words?.length) { toast('No words in this notebook yet', 'error'); return; }
    _isBookPractice = true;
    currentUnit = { words: currentBookData.words, title: currentBookData.name };
    document.getElementById('view-mybook').style.display = 'none';
    document.getElementById('view-unit').style.display   = 'flex';
    document.getElementById('unitTitle').textContent     = `📘 ${currentBookData.name}`;
    if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });
    showMode('fillBlank');
}
function openPreviewMode() {
    if (!currentBookData?.words?.length) { toast('No words in this notebook yet', 'error'); return; }
    _isBookPractice = true;
    currentUnit = { words: currentBookData.words, title: currentBookData.name };
    document.getElementById('view-mybook').style.display = 'none';
    document.getElementById('view-unit').style.display   = 'flex';
    document.getElementById('unitTitle').textContent     = `📘 ${currentBookData.name}`;
    if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });
    showMode('study');
}
function practiceHardWords() {
    if (!currentBookData?.words?.length) return;
    const hardWords = currentBookData.words
        .filter(w => (w.wrongCount || 0) >= 3)
        .sort((a, b) => (b.wrongCount || 0) - (a.wrongCount || 0));
    if (!hardWords.length) { toast('Chưa có từ nào sai từ 3 lần trở lên. Hãy tiếp tục luyện tập!', 'info'); return; }
    _isBookPractice = true;
    currentUnit = { words: hardWords, title: currentBookData.name };
    document.getElementById('view-mybook').style.display = 'none';
    document.getElementById('view-unit').style.display   = 'flex';
    document.getElementById('unitTitle').textContent = `🔥 Ôn lại từ hay sai – ${hardWords.length} từ`;
    if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });
    showMode('mixed');
}

function closeUnitView() {
    const doClose = () => {
        document.getElementById('view-unit').style.display   = 'none';
        document.getElementById('view-mybook').style.display = 'flex';
        const panel = document.getElementById('kbd-hint-panel');
        if (panel) panel.style.display = 'none';
        if (!currentBookId) {
            document.getElementById('book-welcome').style.display = 'flex';
            document.getElementById('book-content').style.display = 'none';
        }
        if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });
        // Re-render word list to show updated wrongCount badges after book practice
        if (_isBookPractice && currentBookId && currentBookData) {
            renderBookContent(currentBookData);
        }
    };
    askQuitPractice(doClose);
}

/* ══════════════════════════════════════════════
   UNIT LOADING
══════════════════════════════════════════════ */
async function loadUnits() {
    try {
        const res   = await fetch(`${API}/vocab/units`, { headers: authH() });
        if (!res.ok) return;
        const units = await res.json();
        if (!Array.isArray(units)) return;
        const sel   = document.getElementById('unitSelect');
        sel.innerHTML = '<option value="">-- Chọn Paraphrase Unit --</option>';
        units.forEach(u => {
            const opt = document.createElement('option');
            opt.value       = u.unitNumber;
            opt.textContent = `Unit ${u.unitNumber} – ${u.title}`;
            sel.appendChild(opt);
        });
        if (window._upSetUnits) window._upSetUnits(units);
        if (window.syncSheetUnits) window.syncSheetUnits();
    } catch { }
}

async function loadUnit() {
    const num = document.getElementById('unitSelect').value;
    if (!num) { toast('Vui lòng chọn một Paraphrase Unit trước', 'error'); return; }
    try {
        const res     = await fetch(`${API}/vocab/unit/${num}`, { headers: authH() });
        const newUnit = await res.json();
        if (!res.ok || !newUnit.words) {
            toast(newUnit.message || 'Unable to load Unit', 'error');
            return;
        }
        // Assign currentUnit only after user confirms (or if not mid-practice)
        askQuitPractice(() => {
            _isBookPractice = false;
            currentUnit = newUnit;
            document.getElementById('unitTitle').textContent     = `Unit ${currentUnit.unitNumber}: ${currentUnit.title}`;
            document.getElementById('view-mybook').style.display = 'none';
            document.getElementById('view-unit').style.display   = 'flex';
            if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });
            _activateModeNow('study');
        });
    } catch { toast('Unable to load Unit', 'error'); }
}

/* ══════════════════════════════════════════════
   MODE SWITCHING
══════════════════════════════════════════════ */
function _activateModeNow(mode) {
    _clearAutoNext();
    ['studyMode','multipleChoiceMode','fillBlankMode','listeningMode','translationMode','mixedMode','resultsMode']
        .forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    currentMode = mode;
    const tabMap = { study: 0, multipleChoice: 1, fillBlank: 2, listening: 3, translation: 4, mixed: 5 };
    const tabs = document.querySelectorAll('.tab-btn');
    if (tabs[tabMap[mode]] !== undefined) tabs[tabMap[mode]].classList.add('active');

    const stopBtn = document.getElementById('btnStopPractice');
    if (stopBtn) stopBtn.style.display = mode === 'study' ? 'none' : 'inline-flex';

    if (mode === 'study') { document.getElementById('studyMode').style.display = 'block'; renderStudyGrid(); }
    else startPractice(mode);
    updateKbdHint();
}

function showMode(mode) {
    if (!currentUnit) return;
    const inActiveSession = currentMode !== 'study' && currentQuestionIndex > 0 &&
        !document.getElementById('resultsMode')?.style.display?.includes('block');
    if (inActiveSession) {
        if (mode !== currentMode) {
            confirm2('Switch Learning Mode?', 'Your current progress will be lost. Do you want to switch?',
                () => _activateModeNow(mode));
        } else {
            // Re-clicking the same active tab → confirm restart
            confirm2('Restart Practice?', 'This will reset your current progress. Restart?',
                () => _activateModeNow(mode));
        }
        return;
    }
    _activateModeNow(mode);
}

/* ══════════════════════════════════════════════
   STUDY GRID
══════════════════════════════════════════════ */
function renderStudyGrid() {
    const grid = document.getElementById('vocabGrid');
    const vocabWords = currentUnit.words.filter(w => (w.type || 'vocab') === 'vocab');
    const paraWords  = currentUnit.words.filter(w => w.type === 'paraphrase');

    let html = '';

    // ── Vocab cards ──────────────────────────────
    if (vocabWords.length) {
        html += vocabWords.map((w, i) => `
        <div class="vocab-card">
          <div class="vocab-card-top">
            <span class="vocab-num">${i + 1}</span>
            <span class="vocab-word-big">${_esc(w.word)}</span>
            <button class="btn-audio" onclick="speakWord('${escH(w.word)}')" title="Pronounce">🔊</button>
            ${w.partOfSpeech ? `<span class="vocab-pos">${_esc(w.partOfSpeech)}</span>` : ''}
          </div>
          ${w.phonetic ? `<div class="vocab-phonetic">${_esc(w.phonetic)}</div>` : ''}
          <div class="vocab-meaning">${_esc(w.meaning || '')}</div>
          ${w.example ? `<div class="vocab-example">"${_esc(w.example)}"</div>` : ''}
          <button class="btn-save-to-book" onclick="openSaveWordFromUnit('${escH(w.word)}')">
            <i class="fas fa-bookmark"></i> Save to notebook
          </button>
        </div>`).join('');
    }

    grid.innerHTML = html;

    // ── Paraphrase table (below grid, full width) ──
    const existingTable = document.getElementById('paraphrase-table-section');
    if (existingTable) existingTable.remove();

    if (paraWords.length) {
        const section = document.createElement('div');
        section.id = 'paraphrase-table-section';
        section.className = 'paraphrase-section';
        section.innerHTML = renderParaphraseTable(paraWords, currentUnit.title);
        grid.parentElement.insertBefore(section, grid.nextSibling);
    }
}

function renderParaphraseTable(words, title) {
    const rows = words.map(w => `
        <tr class="para-row">
            <td class="para-cell-original">
                <span class="para-original-text">${_esc(w.word)}</span>
            </td>
            <td class="para-cell-paraphrase">
                <span class="para-para-text">${_esc(w.paraphrase || '–')}</span>
            </td>
            <td class="para-cell-meaning">${_esc(w.meaning || '–')}</td>
            <td class="para-cell-explain">${_esc(w.explanation || '')}</td>
        </tr>`).join('');

    return `
    <div class="para-table-header">
        <div class="para-table-title">
            <span class="para-icon">📊</span>
            PARAPHRASE TABLE + EXPLANATION
        </div>
        ${title ? `<div class="para-passage-label">◆ ${title.toUpperCase()}</div>` : ''}
        <button class="para-copy-btn" onclick="copyParaphraseTable()" title="Copy table">⧉</button>
    </div>
    <div class="para-table-wrap">
        <table class="para-table">
            <thead>
                <tr>
                    <th>Text (in passage)</th>
                    <th>Paraphrase (in question)</th>
                    <th>Meaning</th>
                    <th>Detailed Explanation</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    </div>`;
}

function copyParaphraseTable() {
    if (!currentUnit?.words) return;
    const paraWords = currentUnit.words.filter(w => w.type === 'paraphrase');
    const text = paraWords.map(w =>
        `${w.word}\t${w.paraphrase || ''}\t${w.meaning || ''}\t${w.explanation || ''}`
    ).join('\n');
    navigator.clipboard.writeText(text).then(() => toast('Paraphrase table copied ✅'));
}

function openSaveWordFromUnit(wordText) {
    const w = currentUnit?.words?.find(x => x.word === wordText);
    if (!w) return;
    const src = currentUnit.unitNumber
        ? `Unit ${currentUnit.unitNumber}`
        : (currentUnit.title || '');
    window.openSaveWordModal({
        word: w.word, meaning: w.meaning, example: w.example || '',
        phonetic: w.phonetic || '', partOfSpeech: w.partOfSpeech || '',
        source: src
    });
}

/* ══════════════════════════════════════════════
   PRACTICE
══════════════════════════════════════════════ */
async function _reportSessionStreak() {
    if (_streakReportedThisSession) return;
    if (sessionAnsweredCount < 5) return;
    _streakReportedThisSession = true;
    try {
        const res = await fetch(`${API}/vocabbook/practice-complete`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ wordsAnswered: sessionAnsweredCount })
        });
        const d = await res.json();
        if (d.success && d.streak) {
            const numEl = document.getElementById('mascot-streak-num');
            if (numEl) animateCount(numEl, d.streak, 500);
            const msgEl = document.getElementById('mascot-msg');
            if (msgEl) msgEl.textContent = getMascotMsg(d.streak);
            const pandaEl = document.getElementById('mascot-panda');
            if (pandaEl) pandaEl.textContent = getMascotEmoji(d.streak);
        }
    } catch { /* silent */ }
}

function startPractice(mode) {
    wrongWordSet.clear();
    requeuedWords.clear();
    _isDifficultPractice = false;
    mixedQueue = [];
    mixedIndex = 0;
    currentQuestionIndex = 0;
    correctAnswers = 0;
    wrongAnswers   = 0;
    answered = false;
    sessionAnsweredCount = 0;
    _streakReportedThisSession = false;
    const wrongListEl = document.getElementById('wrong-words-list');
    if (wrongListEl) wrongListEl.style.display = 'none';

    // Lấy tất cả từ (vocab + paraphrase); _retryWordList is set by retryWrongWords
    const allPracticeWords = (_retryWordList || currentUnit.words).filter(w => w.word && w.meaning);
    _retryWordList = null;
    if (!allPracticeWords.length) { toast('No words in this unit to practice', 'info'); return; }

    if (mode === 'mixed') {
        // Xây hàng đợi hỗn hợp: mỗi từ được gán ngẫu nhiên 1 trong 3 kiểu
        const types = ['multipleChoice', 'listening', 'translation'];
        const words = [...allPracticeWords];
        shuffleArray(words);
        mixedQueue = words.map((w, i) => ({ word: w, type: types[i % types.length] }));
        shuffleArray(mixedQueue);
        document.getElementById('mixedMode').style.display = 'block';
        showMixedQuestion();
        return;
    }

    practiceWords = [...allPracticeWords];
    shuffleArray(practiceWords);
    const modeEl = {
        multipleChoice: 'multipleChoiceMode',
        fillBlank:      'fillBlankMode',
        listening:      'listeningMode',
        translation:    'translationMode'
    }[mode];
    if (modeEl) document.getElementById(modeEl).style.display = 'block';
    showQuestion(mode);
}

function showQuestion(mode) {
    if (currentQuestionIndex >= practiceWords.length) { showResults(mode); return; }
    currentWord = practiceWords[currentQuestionIndex];
    if (mode === 'multipleChoice') showMultipleChoiceQuestion();
    else if (mode === 'fillBlank') showFillBlankQuestion();
    else if (mode === 'listening') showListeningQuestion();
    else if (mode === 'translation') showTranslationQuestion();
}

function updateProgress(prefix) {
    const total = currentMode === 'mixed' ? mixedQueue.length : practiceWords.length;
    const cur   = currentMode === 'mixed' ? mixedIndex : currentQuestionIndex;
    const pct   = total ? (cur / total) * 100 : 0;
    const fill  = document.getElementById(`${prefix}ProgressFill`);
    const txt   = document.getElementById(`${prefix}ProgressText`);
    if (fill) fill.style.width = pct + '%';
    if (txt)  txt.textContent = `${cur + 1}/${total}`;
}

// Spaced repetition: đưa từ sai vào 3 vị trí sau trong hàng đợi
function requeueWrongWord(word) {
    const key = word.word;
    if (requeuedWords.has(key)) return;
    requeuedWords.add(key);
    if (currentMode === 'mixed') {
        const types = ['multipleChoice', 'listening', 'translation'];
        const type  = types[Math.floor(Math.random() * types.length)];
        const insertAt = Math.min(mixedIndex + 4, mixedQueue.length);
        mixedQueue.splice(insertAt, 0, { word, type, _isRepeat: true });
    } else {
        const insertAt = Math.min(currentQuestionIndex + 4, practiceWords.length);
        practiceWords.splice(insertAt, 0, word);
    }
}

function nextQuestion(mode) { currentQuestionIndex++; showQuestion(mode); }
function restartPractice() {
    // Ưu tiên ôn lại từ sai; nếu không có từ sai thì làm lại toàn bộ
    if (wrongWordSet.size > 0) {
        retryWrongWords();
    } else {
        _activateModeNow(currentMode); // _activateModeNow ẩn resultsMode trước khi bắt đầu
    }
}

/* ── Quit-practice confirmation modal ── */
let _quitCallback = null;

function _isActivePractice() {
    if (currentMode === 'study') return false;
    const resultsEl = document.getElementById('resultsMode');
    if (resultsEl && resultsEl.style.display === 'block') return false;
    const total = currentMode === 'mixed' ? mixedQueue.length : practiceWords.length;
    if (total === 0) return false;
    return (correctAnswers + wrongAnswers) > 0;
}

function askQuitPractice(onQuit) {
    if (!_isActivePractice()) { onQuit(); return; }

    _quitCallback = onQuit;

    const remaining = currentMode === 'mixed'
        ? Math.max(0, mixedQueue.length - mixedIndex)
        : Math.max(0, practiceWords.length - currentQuestionIndex);
    const wrongCount = wrongWordSet.size;

    const parts = [];
    if (remaining > 0)   parts.push(`${remaining} words still left`);
    if (wrongCount > 0)  parts.push(`${wrongCount} words still being reviewed`);
    const streakEl = document.getElementById('mascot-streak-num');
    const streak   = streakEl ? (parseInt(streakEl.textContent) || 0) : 0;
    if (streak > 0)      parts.push(`Your ${streak}-day streak is waiting! 🔥`);

    const titleEl = document.getElementById('quit-title');
    const subEl   = document.getElementById('quit-sub');
    const emoji   = document.getElementById('quit-mascot-emoji');

    if (titleEl) titleEl.textContent = wrongCount > 0
        ? 'You still have words to review!'
        : 'Do you want to keep studying?';
    if (subEl)   subEl.textContent   = parts.join(' · ');
    if (emoji)   emoji.textContent   = streak >= 7 ? '🐼🔥' : '🐼';

    openModal('modal-quit-practice');
}

function confirmQuit() {
    closeModal('modal-quit-practice');
    _reportSessionStreak(); // tính streak nếu đã trả lời >= 5 từ trước khi thoát
    if (_quitCallback) { const cb = _quitCallback; _quitCallback = null; cb(); }
}

function cancelQuit() {
    closeModal('modal-quit-practice');
    _quitCallback = null;
}

/* ── Stop practice mid-session ── */
function stopPractice() {
    askQuitPractice(() => showResults(currentMode));
}

/* ══════════════════════════════════════════════
   MIXED MODE
══════════════════════════════════════════════ */
function showMixedQuestion() {
    if (mixedIndex >= mixedQueue.length) { showResults('mixed'); return; }
    answered = false;
    const item = mixedQueue[mixedIndex];
    currentWord = item.word;
    const type  = item.type;

    // Update mixed progress bar
    const total = mixedQueue.length;
    const pct   = (mixedIndex / total) * 100;
    const fill  = document.getElementById('mixProgressFill');
    const txt   = document.getElementById('mixProgressText');
    if (fill) fill.style.width = pct + '%';
    if (txt)  txt.textContent = `${mixedIndex + 1}/${total}`;

    // Badge ôn tập nếu là từ bị requeue
    const repeatBadge = item._isRepeat
        ? '<span style="background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:12px;padding:2px 10px;font-size:11px;font-weight:700;margin-bottom:10px;display:inline-block">🔁 Review again</span>'
        : '';

    // Render question theo type vào #mixQuestionWrap
    const wrap = document.getElementById('mixQuestionWrap');
    if (type === 'multipleChoice') {
        const opts = generateOptions(currentWord);
        wrap.innerHTML = `
          <div class="question-card">
            ${repeatBadge}
            <div class="question-number" style="font-size:11px;color:var(--text3);text-transform:uppercase;font-weight:700;letter-spacing:.6px;margin-bottom:12px">
              <i class="fas fa-check-circle"></i> Multiple Choice
            </div>
            <div class="question-text" style="font-size:18px;font-weight:700;margin-bottom:20px">
              What does "<strong>${currentWord.word}</strong>" mean?
              <button class="btn-audio" onclick="speakWord('${escH(currentWord.word)}')" title="Pronounce" style="font-size:17px;vertical-align:middle;margin-left:6px;opacity:.75">🔊</button>
            </div>
            <div class="answer-options" id="mixAnswerOptions">
              ${opts.map(o => `<button class="answer-option" onclick="checkMixedMC(this,'${escH(o)}','${escH(currentWord.meaning)}')">${o}</button>`).join('')}
            </div>
            <button class="btn-next" id="mixBtnNext" onclick="advanceMixed()" style="display:none">Next <i class="fas fa-arrow-right"></i></button>
          </div>`;
    } else if (type === 'listening') {
        wrap.innerHTML = `
          <div class="question-card">
            ${repeatBadge}
            <div class="question-number" style="font-size:11px;color:var(--text3);text-transform:uppercase;font-weight:700;letter-spacing:.6px;margin-bottom:12px">
              <i class="fas fa-headphones"></i> Listening
            </div>
            <button class="btn-play-audio" onclick="speakWord('${escH(currentWord.word)}')"><i class="fas fa-volume-up" style="font-size:24px"></i> Play Audio</button>
            <div class="listen-hint" style="font-size:13px;color:var(--text2);margin:10px 0">💡 The word has ${currentWord.word.length} letters</div>
            <div class="fb-input-row">
              <input class="listen-input" id="mixListenInput" placeholder="Type what you hear..." onkeypress="if(event.key==='Enter')checkMixedListen()"/>
              <button class="btn-check" onclick="checkMixedListen()">Check</button>
            </div>
            <div id="mixListenFeedback" style="margin-top:10px"></div>
            <button class="btn-next" id="mixBtnNext" onclick="advanceMixed()" style="display:none">Next <i class="fas fa-arrow-right"></i></button>
          </div>`;
    } else {
        const ex = currentWord.example || `The word is: ${currentWord.word}`;
        const exHtml = ex.replace(new RegExp(`\\b${escR(currentWord.word)}\\b`, 'gi'),
            `<strong class="highlight-word">${currentWord.word}</strong>`);
        wrap.innerHTML = `
          <div class="question-card">
            ${repeatBadge}
            <div class="question-number" style="font-size:11px;color:var(--text3);text-transform:uppercase;font-weight:700;letter-spacing:.6px;margin-bottom:12px">
              <i class="fas fa-language"></i> Translation
            </div>
            <div class="trans-example" style="font-size:15px;color:var(--text2);background:var(--surface2);border-radius:var(--radius-sm);padding:14px 18px;margin-bottom:14px;line-height:1.6">${exHtml}</div>
            <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:10px">Translate: <strong>${currentWord.word}</strong> <button class="btn-audio" onclick="speakWord('${escH(currentWord.word)}')" title="Pronounce" style="font-size:17px;vertical-align:middle;margin-left:6px;opacity:.75">🔊</button></div>
            <div class="fb-input-row">
              <input class="trans-input" id="mixTransInput" placeholder="Enter the meaning..." onkeypress="if(event.key==='Enter')checkMixedTrans()"/>
              <button class="btn-check" onclick="checkMixedTrans()">Check</button>
            </div>
            <div id="mixTransFeedback" style="margin-top:10px"></div>
            <button class="btn-next" id="mixBtnNext" onclick="advanceMixed()" style="display:none">Next <i class="fas fa-arrow-right"></i></button>
          </div>`;
        setTimeout(() => document.getElementById('mixTransInput')?.focus(), 50);
    }
}

function advanceMixed() { mixedIndex++; currentQuestionIndex = mixedIndex; showMixedQuestion(); }

function checkMixedMC(btn, selected, correct) {
    if (answered) return; answered = true;
    _countAnswer();
    document.querySelectorAll('#mixAnswerOptions .answer-option').forEach(b => b.disabled = true);
    if (selected === correct) {
        btn.classList.add('correct'); correctAnswers++; playCorrectSound();
    } else {
        btn.classList.add('wrong'); wrongAnswers++; playWrongSound();
        wrongWordSet.add(currentWord.word);
        requeueWrongWord(currentWord);
        document.querySelectorAll('#mixAnswerOptions .answer-option')
            .forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
    }
    document.getElementById('mixBtnNext').style.display = 'flex';
}

function checkMixedListen() {
    if (answered) return; answered = true;
    _countAnswer();
    const ua = document.getElementById('mixListenInput')?.value.trim().toLowerCase() || '';
    document.getElementById('mixListenInput').disabled = true;
    const ok = ua === currentWord.word.toLowerCase();
    if (ok) {
        document.getElementById('mixListenFeedback').innerHTML =
            `<div class="feedback-correct">✅ Correct! <strong>${currentWord.word}</strong> – ${currentWord.meaning}</div>`;
        correctAnswers++; playCorrectSound();
    } else {
        document.getElementById('mixListenFeedback').innerHTML =
            `<div class="feedback-wrong">❌ Answer: <strong>${currentWord.word}</strong> – ${currentWord.meaning}
             <button class="btn-check" style="margin-top:8px" onclick="speakWord('${escH(currentWord.word)}')">🔊 Listen again</button></div>`;
        wrongAnswers++; playWrongSound();
        wrongWordSet.add(currentWord.word);
        requeueWrongWord(currentWord);
    }
    document.getElementById('mixBtnNext').style.display = 'flex';
}

function checkMixedTrans() {
    if (answered) return; answered = true;
    _countAnswer();
    const ua    = document.getElementById('mixTransInput')?.value.trim().toLowerCase() || '';
    document.getElementById('mixTransInput').disabled = true;
    const caRaw = currentWord.meaning.toLowerCase();
    const alts  = caRaw.split(/[\/,]/).map(s => s.trim()).filter(s => s.length > 0);
    const norm  = s => s.replace(/[^a-z0-9àáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹý一-鿿㐀-䶿가-힯]/gi, '').trim();
    const ok    = alts.some(alt => {
        const na = norm(alt), nu = norm(ua);
        if (nu === na) return true;
        const aw = na.split(/\s+/).filter(w => w.length > 1);
        const uw = nu.split(/\s+/).filter(w => w.length > 1);
        if (aw.length === 0) return false;
        return aw.every(w => uw.some(u => u.includes(w) || w.includes(u)));
    });
    if (ok) {
        document.getElementById('mixTransFeedback').innerHTML =
            `<div class="feedback-correct">✅ Well done! Answer: <em>${currentWord.meaning}</em></div>`;
        correctAnswers++; playCorrectSound();
    } else {
        document.getElementById('mixTransFeedback').innerHTML =
            `<div class="feedback-wrong">❌ Correct answer: <strong>${currentWord.meaning}</strong></div>`;
        wrongAnswers++; playWrongSound();
        wrongWordSet.add(currentWord.word);
        requeueWrongWord(currentWord);
    }
    document.getElementById('mixBtnNext').style.display = 'flex';
}

/* ── Multiple Choice ── */
function showMultipleChoiceQuestion() {
    answered = false;
    updateProgress('mc');
    document.getElementById('mcQuestionNumber').textContent = `Question ${currentQuestionIndex + 1}/${practiceWords.length}`;
    document.getElementById('mcQuestionText').innerHTML =
        `What does "<strong>${currentWord.word}</strong>" mean?
        <button class="btn-audio" onclick="speakWord('${escH(currentWord.word)}')" title="Pronounce" style="font-size:17px;vertical-align:middle;margin-left:6px;opacity:.75">🔊</button>`;
    const opts      = generateOptions(currentWord);
    const container = document.getElementById('mcAnswerOptions');
    container.innerHTML = opts.map(o =>
        `<button class="answer-option" onclick="checkMultipleChoice(this,'${escH(o)}','${escH(currentWord.meaning)}')">${o}</button>`
    ).join('');
    document.getElementById('mcBtnNext').style.display = 'none';
}
function generateOptions(cw) {
    const opts  = [cw.meaning];
    const other = currentUnit.words.filter(w => w.word !== cw.word);
    while (opts.length < 4 && other.length) {
        const i = Math.floor(Math.random() * other.length);
        if (!opts.includes(other[i].meaning)) opts.push(other[i].meaning);
        other.splice(i, 1);
    }
    shuffleArray(opts);
    return opts;
}
function checkMultipleChoice(btn, selected, correct) {
    if (answered) return; answered = true;
    _countAnswer();
    document.querySelectorAll('#mcAnswerOptions .answer-option').forEach(b => b.disabled = true);
    if (selected === correct) {
        btn.classList.add('correct'); correctAnswers++; playCorrectSound();
    } else {
        btn.classList.add('wrong'); wrongAnswers++; playWrongSound();
        wrongWordSet.add(currentWord.word);
        requeueWrongWord(currentWord);
        document.querySelectorAll('#mcAnswerOptions .answer-option')
            .forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
    }
    document.getElementById('mcBtnNext').style.display = 'flex';
}
function escH(s) { return (s || '').replace(/&/g, '&amp;').replace(/'/g, "\\'").replace(/"/g, '&quot;'); }
function escR(s) { return (s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function _esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* ── Flashcard ── */
function showFillBlankQuestion() {
    answered = false; isFlipped = false; hintUsed = false;
    updateProgress('fb');
    document.getElementById('fbQuestionNumber').textContent = `Question ${currentQuestionIndex + 1}/${practiceWords.length}`;
    document.getElementById('fbMeaning').textContent  = currentWord.meaning;
    document.getElementById('fbWord').textContent     = currentWord.word;
    document.getElementById('fbPhonetic').textContent = currentWord.phonetic || '';

    const isPara = currentWord.type === 'paraphrase';
    const labelEl = document.getElementById('fcBackLabel');
    if (labelEl) labelEl.textContent = isPara ? 'Text in passage' : 'English word';
    const paraEl = document.getElementById('fbParaphrase');
    if (paraEl) {
        paraEl.textContent = currentWord.paraphrase ? `→ Paraphrase: ${currentWord.paraphrase}` : '';
        paraEl.style.display = currentWord.paraphrase ? '' : 'none';
    }

    document.getElementById('flashcard').classList.remove('flipped');
    document.getElementById('fbInput').value    = '';
    document.getElementById('fbInput').disabled = false;
    document.getElementById('fbFeedback').innerHTML = '';
    document.getElementById('fbBtnNext').style.display   = 'none';
    document.getElementById('quick-btns').style.display  = 'none';
    document.getElementById('fbInputArea').style.display = 'none';

    // FIX: re-enable buttons bị disable từ lần trước
    document.querySelectorAll('.btn-remembered,.btn-not-remembered').forEach(b => b.disabled = false);
}
function flipCard() {
    const fc = document.getElementById('flashcard');
    if (!isFlipped) {
        fc.classList.add('flipped');
        isFlipped = true;
        setTimeout(() => {
            document.getElementById('quick-btns').style.display  = 'flex';
            document.getElementById('fbInputArea').style.display = 'block';
            // FIX: dùng speakWord (có fallback) thay vì speechSynth trực tiếp
            speakWord(currentWord?.word);
            document.getElementById('fbInput').focus();
        }, 300);
    } else {
        fc.classList.remove('flipped');
        isFlipped = false;
        document.getElementById('quick-btns').style.display  = 'none';
        document.getElementById('fbInputArea').style.display = 'none';
    }
}
function markAsRemembered() {
    if (!isFlipped) { toast('Flip the card first!', 'error'); return; }
    if (answered) return; answered = true;
    _countAnswer();
    correctAnswers++; playCorrectSound();
    document.getElementById('fbFeedback').innerHTML = '<div class="feedback-correct">✅ Great job! You remembered this word! 🎉</div>';
    disableFlashcardBtns();
    setTimeout(() => { currentQuestionIndex++; showQuestion('fillBlank'); }, 1500);
}
function markAsNotRemembered() {
    if (!isFlipped) { toast('Flip the card first!', 'error'); return; }
    if (answered) return; answered = true;
    _countAnswer();
    wrongAnswers++; playWrongSound();
    wrongWordSet.add(currentWord.word);
    requeueWrongWord(currentWord);

    // Hiện feedback + nút Tiếp theo ngay để học sinh tự review rồi bấm
    document.getElementById('fbFeedback').innerHTML =
        `<div class="feedback-wrong">💪 Keep going! Word: <strong>${currentWord.word}</strong> – ${currentWord.meaning}</div>`;
    disableFlashcardBtns();

    // Hiện nút Tiếp theo ngay (học sinh tự bấm khi sẵn sàng)
    const btnNext = document.getElementById('fbBtnNext');
    if (btnNext) btnNext.style.display = 'flex';

    // Tự động chuyển sau 15 giây nếu học sinh không bấm
    _clearAutoNext();
    _autoNextTimer = setTimeout(() => { _autoNextTimer = null; currentQuestionIndex++; showQuestion('fillBlank'); }, 15000);

    // Nếu học sinh bấm nút Tiếp theo → huỷ timer tự động
    if (btnNext) {
        btnNext.onclick = function() {
            _clearAutoNext();
            currentQuestionIndex++; showQuestion('fillBlank');
        };
    }
}
function disableFlashcardBtns() {
    document.querySelectorAll('.btn-remembered,.btn-not-remembered').forEach(b => b.disabled = true);
    const inp = document.getElementById('fbInput');
    if (inp) inp.disabled = true;
}
function showHint() {
    if (!document.getElementById('flashcard').classList.contains('flipped')) return;
    const hint = currentWord.word[0] + '_'.repeat(currentWord.word.length - 1);
    document.getElementById('fbFeedback').innerHTML =
        `<div class="feedback-hint">💡 Hint: <strong>${hint}</strong> (${currentWord.word.length} letters)</div>`;
    hintUsed = true;
}
function checkFillBlank() {
    if (answered || !isFlipped) return;
    const ua = document.getElementById('fbInput').value.trim().toLowerCase();
    const ca = currentWord.word.toLowerCase();
    if (!ua) { toast('Type a word first', 'error'); return; }
    answered = true;
    _countAnswer();
    document.getElementById('fbInput').disabled = true;
    disableFlashcardBtns();
    if (ua === ca) {
        document.getElementById('fbFeedback').innerHTML = '<div class="feedback-correct">✅ Correct! 🎉</div>';
        correctAnswers++; playCorrectSound();
    } else {
        document.getElementById('fbFeedback').innerHTML =
            `<div class="feedback-wrong">❌ Answer: <strong>${currentWord.word}</strong></div>`;
        wrongAnswers++; playWrongSound();
        wrongWordSet.add(currentWord.word);
        requeueWrongWord(currentWord);
    }
    document.getElementById('fbBtnNext').style.display = 'flex';
}

/* ── Listening – FIX: không auto-play khi load, chỉ play khi bấm nút ── */
function showListeningQuestion() {
    answered = false;
    updateProgress('listen');
    document.getElementById('listenQuestionNumber').textContent = `Question ${currentQuestionIndex + 1}/${practiceWords.length}`;
    document.getElementById('listenHint').textContent = `💡 The word has ${currentWord.word.length} letters`;
    document.getElementById('listenInput').value   = '';
    document.getElementById('listenInput').disabled = false;
    document.getElementById('listenFeedback').innerHTML = '';
    document.getElementById('listenBtnNext').style.display = 'none';
    // FIX: bỏ auto-play speakWord() — người dùng tự bấm nút "Phát Âm Thanh"
    // Thiết bị Android không Google TTS sẽ crash/im lặng nếu auto-play
}
function playAudio() { speakWord(currentWord?.word); }
function checkListening() {
    if (answered) return; answered = true;
    _countAnswer();
    const ua = document.getElementById('listenInput').value.trim().toLowerCase();
    document.getElementById('listenInput').disabled = true;
    const ok = ua === currentWord.word.toLowerCase();
    if (ok) {
        document.getElementById('listenFeedback').innerHTML =
            `<div class="feedback-correct">✅ Correct! <strong>${currentWord.word}</strong> – ${currentWord.meaning}</div>`;
        correctAnswers++; playCorrectSound();
    } else {
        document.getElementById('listenFeedback').innerHTML =
            `<div class="feedback-wrong">❌ Answer: <strong>${currentWord.word}</strong> – ${currentWord.meaning}
       <button class="btn-check" style="margin-top:8px" onclick="speakWord('${escH(currentWord.word)}')">🔊 Listen again</button></div>`;
        wrongAnswers++; playWrongSound();
        wrongWordSet.add(currentWord.word);
        requeueWrongWord(currentWord);
    }
    document.getElementById('listenBtnNext').style.display = 'flex';
}

/* ── Translation ── */
function showTranslationQuestion() {
    answered = false;
    updateProgress('trans');
    document.getElementById('transQuestionNumber').textContent = `Question ${currentQuestionIndex + 1}/${practiceWords.length}`;
    const ex = currentWord.example || `The word is: ${currentWord.word}`;
    document.getElementById('transExample').innerHTML =
        ex.replace(new RegExp(`\\b${escR(currentWord.word)}\\b`, 'gi'),
            `<strong class="highlight-word">${currentWord.word}</strong>`);
    document.getElementById('transWordHighlight').innerHTML = `Translate: <strong>${currentWord.word}</strong> <button class="btn-audio" onclick="speakWord('${escH(currentWord.word)}')" title="Pronounce" style="font-size:17px;vertical-align:middle;margin-left:6px;opacity:.75">🔊</button>`;
    document.getElementById('transInput').value   = '';
    document.getElementById('transInput').disabled = false;
    document.getElementById('transFeedback').innerHTML = '';
    document.getElementById('transBtnNext').style.display = 'none';
    document.getElementById('transInput').focus();
}
function checkTranslation() {
    if (answered) return; answered = true;
    _countAnswer();
    const ua     = document.getElementById('transInput').value.trim().toLowerCase();
    document.getElementById('transInput').disabled = true;
    const caRaw  = currentWord.meaning.toLowerCase();
    const alts   = caRaw.split(/[\/,]/).map(s => s.trim()).filter(s => s.length > 0);
    const norm   = s => s.replace(/[^a-z0-9àáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹý一-鿿㐀-䶿가-힯]/gi, '').trim();
    const ok     = alts.some(alt => {
        const normAlt = norm(alt), normUa = norm(ua);
        if (normUa === normAlt) return true;
        const altWords = normAlt.split(/\s+/).filter(Boolean);
        const uaWords  = normUa.split(/\s+/).filter(Boolean);
        if (altWords.length === 0) return false;
        return altWords.every(w => uaWords.some(u => u.includes(w) || w.includes(u)));
    });
    if (ok) {
        document.getElementById('transFeedback').innerHTML =
            `<div class="feedback-correct">✅ Well done! Answer: <em>${currentWord.meaning}</em></div>`;
        correctAnswers++; playCorrectSound();
    } else {
        document.getElementById('transFeedback').innerHTML =
            `<div class="feedback-wrong">❌ Correct answer: <strong>${currentWord.meaning}</strong></div>`;
        wrongAnswers++; playWrongSound();
        wrongWordSet.add(currentWord.word);
        requeueWrongWord(currentWord);
    }
    document.getElementById('transBtnNext').style.display = 'flex';
}

/* ── Results ── */
function showResults(mode) {
    _clearAutoNext();
    ['studyMode','multipleChoiceMode','fillBlankMode','listeningMode','translationMode','mixedMode']
        .forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    document.getElementById('resultsMode').style.display = 'block';

    _reportSessionStreak(); // tính streak nếu đã trả lời >= 5 từ

    const stopBtn = document.getElementById('btnStopPractice');
    if (stopBtn) stopBtn.style.display = 'none';
    updateKbdHint(); // hide shortcut panel on results screen

    const total     = mode === 'mixed' ? mixedQueue.length : practiceWords.length;
    const answered_ = correctAnswers + wrongAnswers;
    const pct       = answered_ ? Math.round((correctAnswers / answered_) * 100) : 0;
    const modeNames = { multipleChoice: 'Quiz', fillBlank: 'Flashcard', listening: 'Listen', translation: 'Translate', mixed: 'Mixed' };
    document.getElementById('resultModeTitle').textContent = `Mode: ${modeNames[mode] || mode}`;
    document.getElementById('scorePercent').textContent    = pct + '%';
    document.getElementById('correctCount').textContent    = correctAnswers;
    document.getElementById('wrongCount').textContent      = wrongAnswers;

    // Hiện nút ôn tập từ sai nếu có
    const wrongCount = wrongWordSet.size;
    const wrongWrap  = document.getElementById('wrongRetryWrap');
    const wrongCntEl = document.getElementById('wrongRetryCount');
    if (wrongWrap) wrongWrap.style.display = wrongCount > 0 ? 'block' : 'none';
    if (wrongCntEl) wrongCntEl.textContent = wrongCount;

    const circ   = 2 * Math.PI * 68;
    const offset = circ - (pct / 100) * circ;
    const circle = document.getElementById('scoreCircle');
    circle.style.stroke = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#e53935';
    // Reset to full offset first, then animate to target via CSS transition
    circle.style.transition = 'none';
    circle.style.strokeDashoffset = circ;
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            circle.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)';
            circle.style.strokeDashoffset = offset;
        });
    });
    if (pct === 100) {
        setTimeout(() => spawnConfetti(100), 400);
    }
    void total; // total used for reference only

    // Vocab result image
    const vocabImgEl = document.getElementById('vocab-result-img');
    if (vocabImgEl) {
        vocabImgEl.src = pct >= 70 ? 'img/aboveband7.jpg'
                       : pct >= 50 ? 'img/vocab50_70%25.jpg'
                       :             'img/vocabbelow50%25.jpg';
        vocabImgEl.style.display = 'block';
    }

    // Hiện danh sách từ đã sai
    const wrongListEl = document.getElementById('wrong-words-list');
    if (wrongListEl) {
        if (wrongWordSet.size > 0) {
            const allWords = currentUnit?.words || [];
            const wrongWords = [...wrongWordSet].map(ws => allWords.find(x => x.word === ws) || { word: ws, meaning: '' });
            wrongListEl.innerHTML = `<div class="wl-title">Words to review (${wrongWords.length}):</div>` +
                wrongWords.map(w => `<div class="wl-item"><span class="wl-word">${w.word}</span>${w.meaning ? `<span class="wl-meaning">${w.meaning}</span>` : ''}</div>`).join('');
            wrongListEl.style.display = 'block';
        } else {
            wrongListEl.style.display = 'none';
        }
    }
    // Ghi nhận số lần sai vào DB
    if (_isBookPractice && wrongWordSet.size > 0) _persistWrongCounts();
    if (wrongWordSet.size > 0) _reportDifficultWords(); // track across all sessions
}

/* ══════════════════════════════════════════════
   KEYBOARD SHORTCUT HINT PANEL
══════════════════════════════════════════════ */
function updateKbdHint() {
    const panel = document.getElementById('kbd-hint-panel');
    const list  = document.getElementById('kbd-hint-list');
    if (!panel || !list) return;

    const isResults = document.getElementById('resultsMode')?.style.display === 'block';
    if (currentMode === 'study' || isResults) { panel.style.display = 'none'; return; }

    const hints = [];
    if (currentMode === 'fillBlank') {
        hints.push(['Space', 'Flip card']);
        hints.push(['Enter', 'Next question']);
    } else if (currentMode === 'multipleChoice' || currentMode === 'mixed') {
        hints.push(['1 – 4', 'Choose answer']);
        hints.push(['Enter / →', 'Next question']);
    } else {
        hints.push(['Enter / →', 'Next question']);
    }
    hints.push(['Esc', 'Stop studying']);

    list.innerHTML = hints.map(([key, label]) => `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;justify-content:space-between">
        <kbd style="background:var(--surface2);border:1px solid var(--border2);border-radius:5px;padding:2px 8px;font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--text);white-space:nowrap;flex-shrink:0">${key}</kbd>
        <span style="font-size:11px;color:var(--text2);text-align:right">${label}</span>
      </div>`).join('');

    panel.style.display = 'block';
}

/* ══════════════════════════════════════════════
   KEYBOARD SHORTCUTS during practice
   Space / → : flip flashcard or advance to next
   Enter     : advance to next question (after answering)
   1–4       : select multiple-choice option
   Esc       : trigger quit modal
══════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
    // Skip if typing in an input / textarea
    if (e.target.matches('input,textarea,select')) return;

    const unitView = document.getElementById('view-unit');
    if (!unitView || unitView.style.display === 'none') return;

    // Skip if any modal is open
    if (document.querySelector('.modal-overlay:not(.hidden)')) return;

    const _nextBtn = () => {
        const nextIds = ['mcBtnNext','fbBtnNext','listenBtnNext','transBtnNext','mixBtnNext'];
        for (const id of nextIds) {
            const btn = document.getElementById(id);
            if (btn && btn.style.display !== 'none') { btn.click(); return true; }
        }
        return false;
    };

    // Space / → : flip flashcard or advance
    if (e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentMode === 'fillBlank' && !answered) { flipCard(); return; }
        _nextBtn();
        return;
    }

    // Enter: flip if card not yet revealed, otherwise advance
    if (e.key === 'Enter') {
        e.preventDefault();
        if (currentMode === 'fillBlank' && !answered && !isFlipped) { flipCard(); return; }
        _nextBtn();
        return;
    }

    // 1–4: pick multiple-choice answer
    if (['1','2','3','4'].includes(e.key)) {
        if ((currentMode === 'multipleChoice' || currentMode === 'mixed') && !answered) {
            const opts = document.querySelectorAll(
                '#mcAnswerOptions .answer-option:not(:disabled), #mixAnswerOptions .answer-option:not(:disabled)'
            );
            const idx = parseInt(e.key) - 1;
            if (opts[idx]) { opts[idx].click(); }
        }
        return;
    }

    // Esc: quit practice
    if (e.key === 'Escape') {
        if (_isActivePractice()) stopPractice();
    }
});

/* ── Retry wrong words ── */
function retryWrongWords() {
    if (!wrongWordSet.size) return;
    const wordsToRetry = (currentUnit.words || []).filter(w => wrongWordSet.has(w.word));
    if (!wordsToRetry.length) { toast('No words found to retry', 'error'); return; }
    // Use _retryWordList instead of mutating currentUnit so Restart still has the full word list
    _retryWordList = wordsToRetry;
    _activateModeNow(currentMode === 'study' ? 'mixed' : currentMode);
}

/* ── Ghi nhận từ hay sai vào database (fire-and-forget) ── */
async function _persistWrongCounts() {
    if (!currentBookId || !currentBookData?.words) return;
    wrongWordSet.forEach(wordStr => {
        const w = currentBookData.words.find(x => x.word === wordStr);
        if (!w) return;
        w.wrongCount = (w.wrongCount || 0) + 1;
        fetch(`${API}/vocabbook/${currentBookId}/words/${w._id}`, {
            method: 'PATCH', headers: authH(),
            body: JSON.stringify({ wrongCount: w.wrongCount })
        }).catch(() => {});
    });
}

/* ══════════════════════════════════════════════
   DIFFICULT WORDS TRACKER
══════════════════════════════════════════════ */

/* Report wrong words from any session → server accumulates wrongCount */
async function _reportDifficultWords() {
    if (!wrongWordSet.size) return;
    const allWords = currentUnit?.words || [];
    const words = [...wrongWordSet].map(ws => {
        const found = allWords.find(x => x.word === ws);
        return found
            ? { word: found.word, meaning: found.meaning || '', phonetic: found.phonetic || '', partOfSpeech: found.partOfSpeech || '', example: found.example || '' }
            : { word: ws, meaning: '' };
    });
    const source = _isBookPractice
        ? (currentBookData?.name || 'Sổ cá nhân')
        : (_isDifficultPractice ? 'Từ hay sai' : `Unit ${currentUnit?.unitNumber || ''}`);
    try {
        await fetch(`${API}/difficult-words/report`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ words, source })
        });
        updateDifficultBadge();
    } catch {}
}

/* Update badge count on the sidebar button */
async function updateDifficultBadge() {
    try {
        const data = await fetch(`${API}/difficult-words`, { headers: authH() }).then(r => r.json());
        const count = (data.words || []).length;
        ['difficultCountBadge', 'difficultCountBadgeMob'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    } catch {}
}

/* Open the modal and load words */
async function openDifficultWordsModal() {
    openModal('modal-difficult-words');
    const body = document.getElementById('difficult-words-body');
    body.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text3)"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';
    document.getElementById('btn-practice-difficult').style.display = 'none';
    try {
        const data = await fetch(`${API}/difficult-words`, { headers: authH() }).then(r => r.json());
        _renderDifficultWords(data.words || []);
    } catch {
        body.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text3)">Không thể tải danh sách. Vui lòng thử lại.</div>';
    }
}

function closeDifficultWordsModal() { closeModal('modal-difficult-words'); }

/* Render word list inside modal */
function _renderDifficultWords(words) {
    document.getElementById('difficult-words-count').textContent = words.length ? `(${words.length} từ)` : '';
    const body = document.getElementById('difficult-words-body');
    const practiceBtn = document.getElementById('btn-practice-difficult');

    if (!words.length) {
        body.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:var(--text3)">
                <div style="font-size:48px;margin-bottom:12px">🎉</div>
                <p style="font-size:14px;font-weight:600;color:var(--text2)">Chưa có từ nào trong danh sách!</p>
                <p style="font-size:13px;margin-top:6px;line-height:1.6">Từ sẽ được thêm tự động khi bạn trả lời sai từ đó<br>từ 3 lần trở lên trong bất kỳ session luyện tập nào.</p>
            </div>`;
        practiceBtn.style.display = 'none';
        return;
    }

    practiceBtn.style.display = 'flex';
    window._difficultWordsList = words;

    body.innerHTML = words.map(w => `
        <div class="dw-item" id="dw-item-${w._id}">
            <div class="dw-item-header">
                <div style="min-width:0">
                    <span class="dw-word">${w.word}</span>
                    ${w.phonetic    ? `<span class="dw-phonetic"> ${w.phonetic}</span>` : ''}
                    ${w.partOfSpeech ? `<span class="dw-pos"> · ${w.partOfSpeech}</span>` : ''}
                </div>
                <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
                    <span class="dw-wrong-badge">🔥 ${w.wrongCount} lần</span>
                    <div class="dw-actions">
                        <button class="dw-btn-edit" onclick="startEditDifficultWord('${w._id}')" title="Chỉnh sửa nghĩa"><i class="fas fa-pen"></i></button>
                        <button class="dw-btn-del"  onclick="deleteDifficultWord('${w._id}')"    title="Xóa khỏi danh sách"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            </div>
            <div class="dw-meaning" id="dw-meaning-${w._id}">${w.meaning || '<em style="color:var(--text3)">Chưa có nghĩa</em>'}</div>
            ${w.example ? `<div class="dw-example">${w.example}</div>` : ''}
            ${w.source  ? `<div class="dw-source"><i class="fas fa-tag" style="font-size:10px"></i> ${w.source}</div>` : ''}
            <div class="dw-edit-form" id="dw-edit-${w._id}" style="display:none">
                <input class="dw-edit-input" id="dw-edit-meaning-${w._id}" value="${(w.meaning || '').replace(/"/g,'&quot;')}" placeholder="Nhập nghĩa của từ...">
                <div style="display:flex;gap:6px;margin-top:8px">
                    <button class="btn-primary" style="font-size:12px;padding:5px 14px" onclick="saveDifficultWordEdit('${w._id}')">Lưu</button>
                    <button class="btn-outline" style="font-size:12px;padding:5px 14px" onclick="cancelDifficultWordEdit('${w._id}')">Hủy</button>
                </div>
            </div>
        </div>`).join('');
}

function startEditDifficultWord(id) {
    document.getElementById(`dw-edit-${id}`).style.display = 'block';
    document.getElementById(`dw-edit-meaning-${id}`).focus();
}

function cancelDifficultWordEdit(id) {
    document.getElementById(`dw-edit-${id}`).style.display = 'none';
}

async function saveDifficultWordEdit(id) {
    const meaning = document.getElementById(`dw-edit-meaning-${id}`).value.trim();
    try {
        await fetch(`${API}/difficult-words/${id}`, {
            method: 'PATCH', headers: authH(),
            body: JSON.stringify({ meaning })
        });
        const el = document.getElementById(`dw-meaning-${id}`);
        el.innerHTML = meaning || '<em style="color:var(--text3)">Chưa có nghĩa</em>';
        document.getElementById(`dw-edit-${id}`).style.display = 'none';
        if (window._difficultWordsList) {
            const w = window._difficultWordsList.find(x => x._id === id);
            if (w) w.meaning = meaning;
        }
        toast('Đã cập nhật', 'success');
    } catch { toast('Lỗi khi lưu', 'error'); }
}

async function deleteDifficultWord(id) {
    confirm2('Xóa khỏi danh sách', 'Bạn đã nhớ từ này rồi và muốn xóa khỏi danh sách hay sai?', async () => {
        try {
            await fetch(`${API}/difficult-words/${id}`, { method: 'DELETE', headers: authH() });
            document.getElementById(`dw-item-${id}`)?.remove();
            window._difficultWordsList = (window._difficultWordsList || []).filter(w => w._id !== id);
            const remaining = window._difficultWordsList.length;
            if (remaining === 0) {
                _renderDifficultWords([]);
            } else {
                document.getElementById('difficult-words-count').textContent = `(${remaining} từ)`;
            }
            updateDifficultBadge();
            toast('Đã xóa', 'success');
        } catch { toast('Lỗi khi xóa', 'error'); }
    });
}

/* Start a practice session using the difficult words list */
function startDifficultWordsPractice() {
    const words = window._difficultWordsList;
    if (!words?.length) return;

    closeDifficultWordsModal();

    const practiceWordsList = words.map(w => ({
        word:         w.word,
        meaning:      w.meaning      || '',
        phonetic:     w.phonetic     || '',
        partOfSpeech: w.partOfSpeech || '',
        example:      w.example      || '',
        type: 'vocab'
    }));

    _isBookPractice      = false;
    _isDifficultPractice = true;
    currentUnit = { title: 'Từ hay sai', unitNumber: null, words: practiceWordsList };

    document.getElementById('view-mybook').style.display = 'none';
    document.getElementById('view-unit').style.display   = 'flex';
    document.getElementById('unitTitle').textContent     = '🔥 Ôn lại từ hay sai';

    showMode('mixed');
}

/* ══════════════════════════════════════════════
   LOGOUT
══════════════════════════════════════════════ */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

/* ══════════════════════════════════════════════
   EXPOSE globals
══════════════════════════════════════════════ */
window.logout             = logout;
window.loadMyBooks        = loadMyBooks;
window.loadUnit           = loadUnit;
window.showMode           = showMode;
window.toggleSound        = toggleSound;
window.openAddBookModal   = openAddBookModal;
window.createBook         = createBook;
window.openBook           = openBook;
window.openBookMenu          = openBookMenu;
window.startRenameFromMenu   = startRenameFromMenu;
window.deleteBookFromMenu    = deleteBookFromMenu;
window.openMergeModal        = openMergeModal;
window.toggleMergeItem       = toggleMergeItem;
window.confirmMerge          = confirmMerge;
window.renameBook            = renameBook;
window.deleteWord         = deleteWord;
window.updateWordStatus   = updateWordStatus;
window.toggleSelect       = toggleSelect;
window.toggleSelectAll    = toggleSelectAll;
window.bulkChangeStatus   = bulkChangeStatus;
window.bulkDelete         = bulkDelete;
window.openAddWordManual  = openAddWordManual;
window.addWordManual      = addWordManual;
window.selectBookForSave  = selectBookForSave;
window.confirmSaveWord    = confirmSaveWord;
window.openFlashcardMode  = openFlashcardMode;
window.openPreviewMode    = openPreviewMode;
window.closeUnitView      = closeUnitView;
window.speakWord          = speakWord;
window.flipCard           = flipCard;
window.markAsRemembered   = markAsRemembered;
window.markAsNotRemembered = markAsNotRemembered;
window.showHint           = showHint;
window.checkFillBlank     = checkFillBlank;
window.nextQuestion       = nextQuestion;
window.restartPractice    = restartPractice;
window.playAudio          = playAudio;
window.checkListening     = checkListening;
window.checkTranslation   = checkTranslation;
window.checkMultipleChoice = checkMultipleChoice;
window.closeModal         = closeModal;
window.selectEmoji        = selectEmoji;
window.lookupNewWord      = lookupNewWord;
window.openSaveWordFromUnit    = openSaveWordFromUnit;
window.copyParaphraseTable     = copyParaphraseTable;
window.stopPractice       = stopPractice;
window.confirmQuit        = confirmQuit;
window.cancelQuit         = cancelQuit;
window.retryWrongWords    = retryWrongWords;
window.advanceMixed       = advanceMixed;
window.checkMixedMC       = checkMixedMC;
window.checkMixedListen   = checkMixedListen;
window.checkMixedTrans    = checkMixedTrans;
window.practiceHardWords         = practiceHardWords;
window.openDifficultWordsModal   = openDifficultWordsModal;
window.closeDifficultWordsModal  = closeDifficultWordsModal;
window.startDifficultWordsPractice = startDifficultWordsPractice;
window.deleteDifficultWord       = deleteDifficultWord;
window.startEditDifficultWord    = startEditDifficultWord;
window.cancelDifficultWordEdit   = cancelDifficultWordEdit;
window.saveDifficultWordEdit     = saveDifficultWordEdit;
window.updateDifficultBadge      = updateDifficultBadge;

/* ── Mobile helpers ── */
window.openCurrentBookMenu = function() {
    if (currentBookId) openBookMenu(currentBookId);
};
window.filterWords = filterWords;
window.openEditWordModal = openEditWordModal;

// ── Bulk import ──────────────────────────────────────────────────────────────

let _bulkRows = []; // [{word, meaning, example, phonetic, partOfSpeech, status}]

function openBulkImport() {
    if (!currentBookId) { toast('Chọn sổ từ vựng trước', 'error'); return; }
    document.getElementById('bulk-textarea').value = '';
    document.getElementById('bulk-parse-error').style.display = 'none';
    document.getElementById('bulk-step-1').style.display = '';
    document.getElementById('bulk-step-2').style.display = 'none';
    _bulkRows = [];
    openModal('modal-bulk-import');
}

function bulkGoBack() {
    document.getElementById('bulk-step-1').style.display = '';
    document.getElementById('bulk-step-2').style.display = 'none';
}

async function parseBulkInput() {
    const raw = document.getElementById('bulk-textarea').value.trim();
    const errEl = document.getElementById('bulk-parse-error');
    if (!raw) { errEl.textContent = 'Vui lòng nhập ít nhất một từ.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';

    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed = [];
    const existingSet = new Set((currentBookData?.words || []).map(w => w.word.toLowerCase().trim()));

    for (const line of lines) {
        let word = '', meaning = '';
        const colonIdx = line.indexOf(':');
        const dashIdx  = line.indexOf(' - ');
        const tabIdx   = line.indexOf('\t');
        if (colonIdx > 0) {
            word    = line.slice(0, colonIdx).trim();
            meaning = line.slice(colonIdx + 1).trim();
        } else if (dashIdx > 0) {
            word    = line.slice(0, dashIdx).trim();
            meaning = line.slice(dashIdx + 3).trim();
        } else if (tabIdx > 0) {
            word    = line.slice(0, tabIdx).trim();
            meaning = line.slice(tabIdx + 1).trim();
        } else {
            word = line.trim();
        }
        if (!word) continue;
        const isDup = existingSet.has(word.toLowerCase());
        parsed.push({ word, meaning, example: '', phonetic: '', partOfSpeech: '', status: isDup ? 'dup' : 'loading', selected: !isDup });
    }

    if (!parsed.length) { errEl.textContent = 'Không tìm thấy từ nào hợp lệ.'; errEl.style.display = ''; return; }

    _bulkRows = parsed;
    document.getElementById('bulk-step-1').style.display = 'none';
    document.getElementById('bulk-step-2').style.display = '';
    _renderBulkPreview();

    // Auto-fetch examples concurrently for non-dup words
    const fetches = _bulkRows.map((row, i) => {
        if (row.status === 'dup') return Promise.resolve();
        return _fetchWordInfo(row.word).then(info => {
            _bulkRows[i].example      = info.example;
            _bulkRows[i].phonetic     = info.phonetic;
            _bulkRows[i].partOfSpeech = info.partOfSpeech;
            _bulkRows[i].status       = 'ok';
            _updateBulkRow(i);
        }).catch(() => {
            _bulkRows[i].status = 'ok';
            _updateBulkRow(i);
        });
    });
    await Promise.all(fetches);
    _updateBulkStepInfo();
}

async function _fetchWordInfo(word) {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) return { phonetic: '', partOfSpeech: '', example: '' };
    const data = await res.json();
    const entry    = Array.isArray(data) ? data[0] : null;
    if (!entry) return { phonetic: '', partOfSpeech: '', example: '' };
    const phonetic    = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '';
    const meaning     = entry.meanings?.[0];
    const partOfSpeech = meaning?.partOfSpeech || '';
    const example     = meaning?.definitions?.[0]?.example || '';
    return { phonetic, partOfSpeech, example };
}

function _renderBulkPreview() {
    const tbody = document.getElementById('bulk-preview-body');
    tbody.innerHTML = _bulkRows.map((r, i) => `
        <tr id="bulk-row-${i}" class="${r.status === 'dup' ? 'bulk-row-dup' : ''}">
          <td><input type="checkbox" id="bulk-chk-${i}" ${r.selected ? 'checked' : ''} ${r.status === 'dup' ? 'disabled' : ''} onchange="_bulkRows[${i}].selected=this.checked;_updateBulkStepInfo()"/></td>
          <td><strong>${_esc(r.word)}</strong>${r.phonetic ? `<br><span class="bulk-phonetic">${_esc(r.phonetic)}</span>` : ''}</td>
          <td>${_esc(r.meaning) || '<em style="color:var(--text3)">—</em>'}</td>
          <td id="bulk-ex-${i}" class="bulk-ex-cell">
            ${r.status === 'loading' ? '<span class="bulk-spinner"></span>' :
              (r.example ? `<span class="bulk-example-text">${_esc(r.example)}</span>` : '<em style="color:var(--text3)">—</em>')}
          </td>
          <td id="bulk-st-${i}">${_bulkStatusBadge(r.status)}</td>
        </tr>`).join('');
    _updateBulkStepInfo();
}

function _updateBulkRow(i) {
    const r = _bulkRows[i];
    const exCell = document.getElementById(`bulk-ex-${i}`);
    const stCell = document.getElementById(`bulk-st-${i}`);
    const wordCell = document.querySelector(`#bulk-row-${i} td:nth-child(2)`);
    if (exCell) exCell.innerHTML = r.example
        ? `<span class="bulk-example-text">${_esc(r.example)}</span>`
        : '<em style="color:var(--text3)">—</em>';
    if (stCell) stCell.innerHTML = _bulkStatusBadge(r.status);
    if (wordCell) wordCell.innerHTML = `<strong>${_esc(r.word)}</strong>${r.phonetic ? `<br><span class="bulk-phonetic">${_esc(r.phonetic)}</span>` : ''}`;
}

function _bulkStatusBadge(status) {
    if (status === 'loading') return '<span class="bulk-spinner"></span>';
    if (status === 'dup')     return '<span class="bulk-badge bulk-badge-dup">Trùng</span>';
    return '<span class="bulk-badge bulk-badge-ok">OK</span>';
}

function _updateBulkStepInfo() {
    const el = document.getElementById('bulk-step2-info');
    if (!el) return;
    const total    = _bulkRows.length;
    const dups     = _bulkRows.filter(r => r.status === 'dup').length;
    const selected = _bulkRows.filter(r => r.selected).length;
    el.innerHTML = `<span>${total} từ được nhập</span>${dups ? `<span class="bulk-info-dup">· ${dups} từ trùng (bỏ qua)</span>` : ''}<span class="bulk-info-sel">· <strong>${selected}</strong> từ sẽ được thêm</span>`;
}

function bulkToggleAll(chk) {
    _bulkRows.forEach((r, i) => {
        if (r.status === 'dup') return;
        r.selected = chk.checked;
        const c = document.getElementById(`bulk-chk-${i}`);
        if (c) c.checked = chk.checked;
    });
    _updateBulkStepInfo();
}

async function confirmBulkImport() {
    const toAdd = _bulkRows.filter(r => r.selected && r.status !== 'dup');
    if (!toAdd.length) { toast('Không có từ nào được chọn', 'error'); return; }

    const btn = document.getElementById('btn-confirm-bulk');
    btn.disabled = true;
    btn.innerHTML = '<span class="bulk-spinner"></span> Đang thêm…';

    try {
        const res  = await fetch(`${API}/vocabbook/${currentBookId}/words/bulk`, {
            method: 'POST',
            headers: authH(),
            body: JSON.stringify({ words: toAdd })
        });
        const data = await res.json();
        if (!data.success) { toast(data.message || 'Lỗi thêm từ', 'error'); return; }
        toast(data.message, 'success');
        closeModal('modal-bulk-import');
        await refreshCurrentBook();
    } catch (e) {
        toast('Lỗi kết nối', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-plus"></i> Thêm vào sổ';
    }
}

function _esc(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function openGuideModal() { openModal('modal-guide'); }
window.openGuideModal    = openGuideModal;
window.openBulkImport    = openBulkImport;
window.parseBulkInput    = parseBulkInput;
window.confirmBulkImport = confirmBulkImport;
window.bulkGoBack        = bulkGoBack;
window.bulkToggleAll     = bulkToggleAll;