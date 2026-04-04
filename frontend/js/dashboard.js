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

// ── Save-word pending ──────────────────────────
let pendingSaveWord = null;
let selectedBookForSave = null;

// ── Audio ──────────────────────────────────────
const correctSound = new Audio('./sounds/correct.mp3');
const wrongSound   = new Audio('./sounds/incorect.mp3');
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
    // ── Layer 2: DictionaryAPI (có file MP3 thật) ─
    if (_ttsCache[word]) {
        _playAudioUrl(_ttsCache[word]);
        return;
    }
    try {
        const res  = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        if (res.ok) {
            const data = await res.json();
            // Tìm audio URL trong phonetics
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
    } catch { /* ignore, go to layer 3 */ }

    // ── Layer 3: Google Translate TTS ─────────────
    // Lưu ý: không dùng được khi bị CORS block → dùng Audio element bypass CORS
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
    if (name) document.getElementById('userName').textContent = `👋 ${name}`;

    // Preload voices (Chrome cần gọi getVoices trước)
    if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }

    setupEmojiPicker();
    await Promise.all([loadMyBooks(), loadUnits()]);
});

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
    document.getElementById('soundToggle').textContent = soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
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
   MY BOOKS – SIDEBAR
══════════════════════════════════════════════ */
async function loadMyBooks() {
    try {
        const res  = await fetch(`${API}/vocabbook`, { headers: authH() });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        myBooks = data.books;
        renderBookSidebar();
    } catch (err) { console.error(err); }
}

function renderBookSidebar() {
    const wrap = document.getElementById('book-list-sidebar');
    wrap.innerHTML = myBooks.map(b => `
    <div class="book-item ${b._id === currentBookId ? 'active' : ''}"
         onclick="openBook('${b._id}')" id="bi-${b._id}">
      <span class="book-emoji">${b.emoji}</span>
      <span class="book-name">${b.name}</span>
      <span class="book-count">${b.totalWords}</span>
      <button class="book-menu-btn" onclick="event.stopPropagation();openBookMenu('${b._id}')" title="Tuỳ chọn">⋯</button>
    </div>
  `).join('');
}

async function openBook(bookId) {
    currentBookId = bookId;
    selectedWordIds.clear();

    document.querySelectorAll('.book-item').forEach(el => el.classList.remove('active'));
    const item = document.getElementById(`bi-${bookId}`);
    if (item) item.classList.add('active');

    document.getElementById('view-mybook').style.display  = 'flex';
    document.getElementById('view-unit').style.display    = 'none';
    document.getElementById('book-welcome').style.display = 'none';
    document.getElementById('book-content').style.display = 'flex';

    await refreshCurrentBook();
}

async function refreshCurrentBook() {
    try {
        const res  = await fetch(`${API}/vocabbook/${currentBookId}`, { headers: authH() });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        currentBookData = data.book;
        renderBookContent(data.book);
    } catch (err) { toast('Lỗi tải sổ: ' + err.message, 'error'); }
}

function renderBookContent(book) {
    document.getElementById('book-top-emoji').textContent     = book.emoji;
    document.getElementById('book-editable-name').value       = book.name;

    const total = book.words.length;
    const da    = book.words.filter(w => w.status === 'da-thuoc').length;
    const nho   = book.words.filter(w => w.status === 'nho-so-so').length;
    const chua  = book.words.filter(w => w.status === 'chua-thuoc').length;
    const pct   = total ? Math.round((da / total) * 100) : 0;

    document.getElementById('stat-da-thuoc').textContent  = da;
    document.getElementById('stat-nho-so-so').textContent = nho;
    document.getElementById('stat-chua-thuoc').textContent = chua;
    document.getElementById('stat-total').textContent     = total;
    document.getElementById('book-progress-fill').style.width = pct + '%';

    const tbody = document.getElementById('words-tbody');
    if (!total) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:48px;color:var(--text3)">
      <div style="font-size:40px;margin-bottom:10px">📭</div>
      <div>Chưa có từ nào trong sổ này</div>
      <div style="font-size:12px;margin-top:6px">Thêm từ thủ công hoặc lưu từ khi review bài Reading</div>
    </td></tr>`;
        return;
    }

    tbody.innerHTML = book.words.map(w => `
    <tr class="${selectedWordIds.has(w._id) ? 'selected' : ''}" id="row-${w._id}">
      <td class="cb-wrap"><input type="checkbox" ${selectedWordIds.has(w._id) ? 'checked' : ''}
        onchange="toggleSelect('${w._id}', this.checked)"/></td>
      <td>
        <select class="status-select ${w.status}" onchange="updateWordStatus('${w._id}', this.value, this)">
          <option value="chua-thuoc" ${w.status === 'chua-thuoc' ? 'selected' : ''}>Chưa thuộc</option>
          <option value="nho-so-so"  ${w.status === 'nho-so-so'  ? 'selected' : ''}>Nhớ sơ sơ</option>
          <option value="da-thuoc"   ${w.status === 'da-thuoc'   ? 'selected' : ''}>Đã thuộc</option>
        </select>
      </td>
      <td>
        <span class="word-chip-main">${w.word}</span>
        <button class="btn-audio" onclick="speakWord('${escH(w.word)}')" title="Phát âm">🔊</button>
        ${w.phonetic ? `<div style="font-size:11px;color:var(--text3);font-family:'JetBrains Mono',monospace">${w.phonetic}</div>` : ''}
      </td>
      <td style="color:var(--text2)">${w.meaning || '–'}</td>
      <td style="max-width:240px">
        ${w.example ? `<div style="font-size:12px;font-style:italic;color:var(--text2)">${w.example}</div>` : ''}
      </td>
      <td style="color:var(--text3);font-size:12px">${w.note || ''}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="deleteWord('${w._id}')" title="Xoá từ">🗑</button>
      </td>
    </tr>
  `).join('');
}

/* ── Status update ── */
async function updateWordStatus(wordId, status, selectEl) {
    try {
        selectEl.className = `status-select ${status}`;
        await fetch(`${API}/vocabbook/${currentBookId}/words/${wordId}`, {
            method: 'PATCH', headers: authH(),
            body: JSON.stringify({ status })
        });
        await loadMyBooks();
        const w = currentBookData?.words?.find(w => w._id === wordId);
        if (w) { w.status = status; updateStats(currentBookData); }
    } catch { toast('Lỗi cập nhật', 'error'); }
}

function updateStats(book) {
    const da    = book.words.filter(w => w.status === 'da-thuoc').length;
    const nho   = book.words.filter(w => w.status === 'nho-so-so').length;
    const chua  = book.words.filter(w => w.status === 'chua-thuoc').length;
    const total = book.words.length;
    const pct   = total ? Math.round((da / total) * 100) : 0;
    document.getElementById('stat-da-thuoc').textContent   = da;
    document.getElementById('stat-nho-so-so').textContent  = nho;
    document.getElementById('stat-chua-thuoc').textContent = chua;
    document.getElementById('book-progress-fill').style.width = pct + '%';
}

/* ── Delete word ── */
function deleteWord(wordId) {
    confirm2('Xoá từ vựng', 'Bạn có chắc muốn xoá từ này?', async () => {
        await fetch(`${API}/vocabbook/${currentBookId}/words/${wordId}`, { method: 'DELETE', headers: authH() });
        toast('Đã xoá từ');
        await refreshCurrentBook();
        await loadMyBooks();
    });
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
    renderBookContent(currentBookData);
}
function updateBulkBar() {
    const bar = document.getElementById('bulk-bar');
    if (selectedWordIds.size > 0) {
        bar.classList.add('show');
        document.getElementById('bulk-count').textContent = selectedWordIds.size;
    } else {
        bar.classList.remove('show');
    }
}
async function bulkChangeStatus(status) {
    if (!status || !selectedWordIds.size) return;
    for (const wid of selectedWordIds) {
        await fetch(`${API}/vocabbook/${currentBookId}/words/${wid}`, {
            method: 'PATCH', headers: authH(), body: JSON.stringify({ status })
        });
    }
    selectedWordIds.clear();
    document.getElementById('bulk-status-sel').value = '';
    toast('Đã cập nhật trạng thái');
    await refreshCurrentBook();
    await loadMyBooks();
}
async function bulkDelete() {
    if (!selectedWordIds.size) return;
    confirm2('Xoá từ vựng', `Xoá ${selectedWordIds.size} từ đã chọn?`, async () => {
        await fetch(`${API}/vocabbook/${currentBookId}/words`, {
            method: 'DELETE', headers: authH(),
            body: JSON.stringify({ wordIds: [...selectedWordIds] })
        });
        selectedWordIds.clear();
        updateBulkBar();
        toast('Đã xoá');
        await refreshCurrentBook();
        await loadMyBooks();
    });
}

/* ── Rename book ── */
async function renameBook() {
    const name = document.getElementById('book-editable-name').value.trim();
    if (!name || !currentBookId) return;
    try {
        await fetch(`${API}/vocabbook/${currentBookId}`, {
            method: 'PUT', headers: authH(), body: JSON.stringify({ name })
        });
        toast('Đã đổi tên sổ');
        await loadMyBooks();
    } catch { toast('Lỗi đổi tên', 'error'); }
}

/* ── Book menu – FIX: dùng modal thay window.confirm ── */
function openBookMenu(bookId) {
    const book = myBooks.find(b => b._id === bookId);
    if (!book) return;
    if (book.isDefault) {
        toast('Không thể xoá sổ mặc định', 'error');
        return;
    }
    confirm2(
        'Xoá sổ từ vựng',
        `Xoá sổ "${book.name}"? Tất cả từ trong sổ sẽ bị mất.`,
        async () => {
            await fetch(`${API}/vocabbook/${bookId}`, { method: 'DELETE', headers: authH() });
            if (currentBookId === bookId) {
                currentBookId = null;
                document.getElementById('book-content').style.display  = 'none';
                document.getElementById('book-welcome').style.display  = 'flex';
            }
            toast('Đã xoá sổ');
            await loadMyBooks();
        }
    );
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
    document.getElementById('new-book-name').value = '';
    openModal('modal-add-book');
    setTimeout(() => document.getElementById('new-book-name').focus(), 100);
}
async function createBook() {
    const name = document.getElementById('new-book-name').value.trim();
    if (!name) { toast('Tên sổ không được để trống', 'error'); return; }
    try {
        const res  = await fetch(`${API}/vocabbook`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ name, emoji: selectedEmoji, color: '#3d8bff' })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        closeModal('modal-add-book');
        toast('Đã tạo sổ mới');
        await loadMyBooks();
        openBook(data.book._id);
    } catch (err) { toast(err.message, 'error'); }
}

/* ── Add word manual ── */
function openAddWordManual() {
    ['aw-word','aw-meaning','aw-example','aw-note'].forEach(id => { document.getElementById(id).value = ''; });
    openModal('modal-add-word');
    setTimeout(() => document.getElementById('aw-word').focus(), 100);
}
async function lookupNewWord(word) {
    if (!word || word.length < 2) return;
    clearTimeout(lookupNewWord._t);
    lookupNewWord._t = setTimeout(async () => {
        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
            if (!res.ok) return;
            const data = await res.json();
            const def = data[0]?.meanings[0]?.definitions[0];
            if (def && !document.getElementById('aw-example').value) {
                document.getElementById('aw-example').value = def.example || '';
            }
        } catch { }
    }, 700);
}
async function addWordManual() {
    const word    = document.getElementById('aw-word').value.trim();
    const meaning = document.getElementById('aw-meaning').value.trim();
    const example = document.getElementById('aw-example').value.trim();
    const note    = document.getElementById('aw-note').value.trim();
    if (!word) { toast('Nhập từ cần thêm', 'error'); return; }
    if (!currentBookId) { toast('Chọn sổ trước', 'error'); return; }
    try {
        const res  = await fetch(`${API}/vocabbook/${currentBookId}/words`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ word, meaning, example, note, source: 'manual' })
        });
        const data = await res.json();
        if (!data.success) { toast(data.message, 'error'); return; }
        closeModal('modal-add-word');
        toast(data.message);
        await refreshCurrentBook();
        await loadMyBooks();
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
    list.innerHTML = myBooks.map(b => `
    <div class="book-opt" onclick="selectBookForSave('${b._id}',this)" id="bopt-${b._id}">
      <span class="book-opt-emoji">${b.emoji}</span>
      <div class="book-opt-info">
        <div class="book-opt-name">${b.name}</div>
        <div class="book-opt-count">${b.totalWords} từ</div>
      </div>
    </div>
  `).join('');

    openModal('modal-save-word');
};

function selectBookForSave(bookId, el) {
    selectedBookForSave = bookId;
    document.querySelectorAll('.book-opt').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
}

async function confirmSaveWord() {
    if (!selectedBookForSave) { toast('Chọn sổ để lưu', 'error'); return; }
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
            await loadMyBooks();
            if (currentBookId === selectedBookForSave) await refreshCurrentBook();
        }
    } catch (err) { toast(err.message, 'error'); }
}

/* ══════════════════════════════════════════════
   FLASHCARD / PREVIEW từ sổ cá nhân
══════════════════════════════════════════════ */
function openFlashcardMode() {
    if (!currentBookData?.words?.length) { toast('Sổ chưa có từ nào', 'error'); return; }
    currentUnit = { words: currentBookData.words, title: currentBookData.name };
    document.getElementById('view-mybook').style.display = 'none';
    document.getElementById('view-unit').style.display   = 'flex';
    document.getElementById('unitTitle').textContent     = `📘 ${currentBookData.name}`;
    showMode('fillBlank');
}
function openPreviewMode() {
    if (!currentBookData?.words?.length) { toast('Sổ chưa có từ nào', 'error'); return; }
    currentUnit = { words: currentBookData.words, title: currentBookData.name };
    document.getElementById('view-mybook').style.display = 'none';
    document.getElementById('view-unit').style.display   = 'flex';
    document.getElementById('unitTitle').textContent     = `📘 ${currentBookData.name}`;
    showMode('study');
}
function closeUnitView() {
    document.getElementById('view-unit').style.display   = 'none';
    document.getElementById('view-mybook').style.display = 'flex';
    if (!currentBookId) {
        document.getElementById('book-welcome').style.display = 'flex';
        document.getElementById('book-content').style.display = 'none';
    }
}

/* ══════════════════════════════════════════════
   UNIT LOADING
══════════════════════════════════════════════ */
async function loadUnits() {
    try {
        const res   = await fetch(`${API}/vocab/units`, { headers: authH() });
        const units = await res.json();
        const sel   = document.getElementById('unitSelect');
        sel.innerHTML = '<option value="">-- Chọn Unit --</option>';
        units.forEach(u => {
            const opt = document.createElement('option');
            opt.value       = u.unitNumber;
            opt.textContent = `Unit ${u.unitNumber} – ${u.title}`;
            sel.appendChild(opt);
        });
    } catch { }
}

async function loadUnit() {
    const num = document.getElementById('unitSelect').value;
    if (!num) { toast('Chọn Unit trước', 'error'); return; }
    try {
        const res = await fetch(`${API}/vocab/unit/${num}`, { headers: authH() });
        currentUnit = await res.json();
        document.getElementById('unitTitle').textContent     = `Unit ${currentUnit.unitNumber}: ${currentUnit.title}`;
        document.getElementById('view-mybook').style.display = 'none';
        document.getElementById('view-unit').style.display   = 'flex';
        showMode('study');
    } catch { toast('Không thể tải Unit', 'error'); }
}

/* ══════════════════════════════════════════════
   MODE SWITCHING
══════════════════════════════════════════════ */
function showMode(mode) {
    if (!currentUnit) return;
    ['studyMode','multipleChoiceMode','fillBlankMode','listeningMode','translationMode','resultsMode']
        .forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    currentMode = mode;
    const tabMap = { study: 0, multipleChoice: 1, fillBlank: 2, listening: 3, translation: 4 };
    const tabs = document.querySelectorAll('.tab-btn');
    if (tabs[tabMap[mode]]) tabs[tabMap[mode]].classList.add('active');
    if (mode === 'study') { document.getElementById('studyMode').style.display = 'block'; renderStudyGrid(); }
    else startPractice(mode);
}

/* ══════════════════════════════════════════════
   STUDY GRID
══════════════════════════════════════════════ */
function renderStudyGrid() {
    const grid = document.getElementById('vocabGrid');
    grid.innerHTML = currentUnit.words.map((w, i) => `
    <div class="vocab-card">
      <div class="vocab-card-top">
        <span class="vocab-num">${i + 1}</span>
        <span class="vocab-word-big">${w.word}</span>
        <button class="btn-audio" onclick="speakWord('${escH(w.word)}')" title="Phát âm">🔊</button>
        ${w.partOfSpeech ? `<span class="vocab-pos">${w.partOfSpeech}</span>` : ''}
      </div>
      ${w.phonetic ? `<div class="vocab-phonetic">${w.phonetic}</div>` : ''}
      <div class="vocab-meaning">${w.meaning || ''}</div>
      ${w.example ? `<div class="vocab-example">"${w.example}"</div>` : ''}
      <button class="btn-save-to-book" onclick='openSaveWordFromUnit(${JSON.stringify(w)})'>
        <i class="fas fa-bookmark"></i> Lưu vào sổ
      </button>
    </div>
  `).join('');
}

function openSaveWordFromUnit(w) {
    window.openSaveWordModal({
        word: w.word, meaning: w.meaning, example: w.example || '',
        phonetic: w.phonetic || '', partOfSpeech: w.partOfSpeech || '',
        source: `Unit ${currentUnit.unitNumber || ''}`
    });
}

/* ══════════════════════════════════════════════
   PRACTICE
══════════════════════════════════════════════ */
function startPractice(mode) {
    practiceWords = [...currentUnit.words];
    shuffleArray(practiceWords);
    currentQuestionIndex = 0;
    correctAnswers = 0;
    wrongAnswers   = 0;
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
    const pct  = (currentQuestionIndex / practiceWords.length) * 100;
    const fill = document.getElementById(`${prefix}ProgressFill`);
    const txt  = document.getElementById(`${prefix}ProgressText`);
    if (fill) fill.style.width = pct + '%';
    if (txt)  txt.textContent = `${currentQuestionIndex + 1}/${practiceWords.length}`;
}

function nextQuestion(mode) { currentQuestionIndex++; showQuestion(mode); }
function restartPractice()  { startPractice(currentMode); }

/* ── Multiple Choice ── */
function showMultipleChoiceQuestion() {
    answered = false;
    updateProgress('mc');
    document.getElementById('mcQuestionNumber').textContent = `Câu ${currentQuestionIndex + 1}/${practiceWords.length}`;
    document.getElementById('mcQuestionText').innerHTML =
        `"<strong>${currentWord.word}</strong>" có nghĩa là gì?`;
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
    document.querySelectorAll('#mcAnswerOptions .answer-option').forEach(b => b.disabled = true);
    if (selected === correct) {
        btn.classList.add('correct'); correctAnswers++; playCorrectSound();
    } else {
        btn.classList.add('wrong'); wrongAnswers++; playWrongSound();
        document.querySelectorAll('#mcAnswerOptions .answer-option')
            .forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
    }
    document.getElementById('mcBtnNext').style.display = 'flex';
}
function escH(s) { return (s || '').replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

/* ── Flashcard ── */
function showFillBlankQuestion() {
    answered = false; isFlipped = false; hintUsed = false;
    updateProgress('fb');
    document.getElementById('fbQuestionNumber').textContent = `Câu ${currentQuestionIndex + 1}/${practiceWords.length}`;
    document.getElementById('fbMeaning').textContent  = currentWord.meaning;
    document.getElementById('fbWord').textContent     = currentWord.word;
    document.getElementById('fbPhonetic').textContent = currentWord.phonetic || '';

    document.getElementById('flashcard').classList.remove('flipped');
    document.getElementById('fbInput').value   = '';
    document.getElementById('fbInput').disabled = false;
    document.getElementById('fbFeedback').innerHTML = '';
    document.getElementById('fbBtnNext').style.display   = 'none';
    document.getElementById('quick-btns').style.display  = 'none';
    document.getElementById('fbInputArea').style.display = 'none';
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
    if (!isFlipped) { toast('Lật thẻ trước!', 'error'); return; }
    if (answered) return; answered = true;
    correctAnswers++; playCorrectSound();
    document.getElementById('fbFeedback').innerHTML = '<div class="feedback-correct">✅ Tuyệt vời! Bạn đã nhớ từ này! 🎉</div>';
    disableFlashcardBtns();
    setTimeout(() => { currentQuestionIndex++; showQuestion('fillBlank'); }, 1500);
}
function markAsNotRemembered() {
    if (!isFlipped) { toast('Lật thẻ trước!', 'error'); return; }
    if (answered) return; answered = true;
    wrongAnswers++; playWrongSound();
    document.getElementById('fbFeedback').innerHTML =
        `<div class="feedback-wrong">💪 Cố lên! Từ: <strong>${currentWord.word}</strong> – ${currentWord.meaning}</div>`;
    disableFlashcardBtns();
    setTimeout(() => { currentQuestionIndex++; showQuestion('fillBlank'); }, 2000);
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
        `<div class="feedback-hint">💡 Gợi ý: <strong>${hint}</strong> (${currentWord.word.length} chữ)</div>`;
    hintUsed = true;
}
function checkFillBlank() {
    if (answered || !isFlipped) return;
    const ua = document.getElementById('fbInput').value.trim().toLowerCase();
    const ca = currentWord.word.toLowerCase();
    if (!ua) return;
    answered = true;
    document.getElementById('fbInput').disabled = true;
    disableFlashcardBtns();
    if (ua === ca) {
        document.getElementById('fbFeedback').innerHTML = '<div class="feedback-correct">✅ Chính xác! 🎉</div>';
        correctAnswers++; playCorrectSound();
    } else {
        document.getElementById('fbFeedback').innerHTML =
            `<div class="feedback-wrong">❌ Đáp án: <strong>${currentWord.word}</strong></div>`;
        wrongAnswers++; playWrongSound();
    }
    document.getElementById('fbBtnNext').style.display = 'flex';
}

/* ── Listening – FIX: không auto-play khi load, chỉ play khi bấm nút ── */
function showListeningQuestion() {
    answered = false;
    updateProgress('listen');
    document.getElementById('listenQuestionNumber').textContent = `Câu ${currentQuestionIndex + 1}/${practiceWords.length}`;
    document.getElementById('listenHint').textContent = `💡 Từ có ${currentWord.word.length} chữ cái`;
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
    const ua = document.getElementById('listenInput').value.trim().toLowerCase();
    document.getElementById('listenInput').disabled = true;
    const ok = ua === currentWord.word.toLowerCase();
    if (ok) {
        document.getElementById('listenFeedback').innerHTML =
            `<div class="feedback-correct">✅ Đúng! <strong>${currentWord.word}</strong> – ${currentWord.meaning}</div>`;
        correctAnswers++; playCorrectSound();
    } else {
        document.getElementById('listenFeedback').innerHTML =
            `<div class="feedback-wrong">❌ Đáp án: <strong>${currentWord.word}</strong> – ${currentWord.meaning}
       <button class="btn-check" style="margin-top:8px" onclick="speakWord('${escH(currentWord.word)}')">🔊 Nghe lại</button></div>`;
        wrongAnswers++; playWrongSound();
    }
    document.getElementById('listenBtnNext').style.display = 'flex';
}

/* ── Translation ── */
function showTranslationQuestion() {
    answered = false;
    updateProgress('trans');
    document.getElementById('transQuestionNumber').textContent = `Câu ${currentQuestionIndex + 1}/${practiceWords.length}`;
    const ex = currentWord.example || `The word is: ${currentWord.word}`;
    document.getElementById('transExample').innerHTML =
        ex.replace(new RegExp(`\\b${currentWord.word}\\b`, 'gi'),
            `<strong class="highlight-word">${currentWord.word}</strong>`);
    document.getElementById('transWordHighlight').innerHTML = `Dịch từ: <strong>${currentWord.word}</strong>`;
    document.getElementById('transInput').value   = '';
    document.getElementById('transInput').disabled = false;
    document.getElementById('transFeedback').innerHTML = '';
    document.getElementById('transBtnNext').style.display = 'none';
    document.getElementById('transInput').focus();
}
function checkTranslation() {
    if (answered) return; answered = true;
    const ua     = document.getElementById('transInput').value.trim().toLowerCase();
    document.getElementById('transInput').disabled = true;
    const caRaw  = currentWord.meaning.toLowerCase();
    const alts   = caRaw.split(/[\/,]/).map(s => s.trim()).filter(s => s.length > 0);
    const norm   = s => s.replace(/[^a-z0-9àáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹý]/gi, '').trim();
    const ok     = alts.some(alt => {
        const normAlt = norm(alt), normUa = norm(ua);
        if (normUa === normAlt) return true;
        const altWords = normAlt.split(/\s+/).filter(w => w.length > 1);
        const uaWords  = normUa.split(/\s+/).filter(w => w.length > 1);
        return altWords.every(w => uaWords.some(u => u.includes(w) || w.includes(u)));
    });
    if (ok) {
        document.getElementById('transFeedback').innerHTML =
            `<div class="feedback-correct">✅ Tốt lắm! Đáp án: <em>${currentWord.meaning}</em></div>`;
        correctAnswers++; playCorrectSound();
    } else {
        document.getElementById('transFeedback').innerHTML =
            `<div class="feedback-wrong">❌ Nghĩa đúng: <strong>${currentWord.meaning}</strong></div>`;
        wrongAnswers++; playWrongSound();
    }
    document.getElementById('transBtnNext').style.display = 'flex';
}

/* ── Results ── */
function showResults(mode) {
    ['studyMode','multipleChoiceMode','fillBlankMode','listeningMode','translationMode']
        .forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    document.getElementById('resultsMode').style.display = 'block';
    const total     = practiceWords.length;
    const pct       = Math.round((correctAnswers / total) * 100);
    const modeNames = { multipleChoice: 'Trắc Nghiệm', fillBlank: 'Flashcard', listening: 'Nghe', translation: 'Dịch' };
    document.getElementById('resultModeTitle').textContent = `Chế độ: ${modeNames[mode] || mode}`;
    document.getElementById('scorePercent').textContent    = pct + '%';
    document.getElementById('correctCount').textContent    = correctAnswers;
    document.getElementById('wrongCount').textContent      = wrongAnswers;
    const circ   = 2 * Math.PI * 68;
    const offset = circ - (pct / 100) * circ;
    const circle = document.getElementById('scoreCircle');
    circle.style.stroke = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#e53935';
    setTimeout(() => { circle.style.strokeDashoffset = offset; }, 100);
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
window.loadUnit           = loadUnit;
window.showMode           = showMode;
window.toggleSound        = toggleSound;
window.openAddBookModal   = openAddBookModal;
window.createBook         = createBook;
window.openBook           = openBook;
window.openBookMenu       = openBookMenu;
window.renameBook         = renameBook;
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
window.openSaveWordFromUnit = openSaveWordFromUnit;