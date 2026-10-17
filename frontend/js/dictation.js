// dictation.html — Luyện Dictation
const API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
function authH() { return { ...window.AuthService.authHeader(), 'Content-Type': 'application/json' }; }
function pad(n) { return String(Math.floor(n)).padStart(2, '0'); }
function fmtTime(s) { if (!isFinite(s) || s < 0) s = 0; return Math.floor(s / 60) + ':' + pad(s % 60); }

let dictSections = [];      // picker list
let dictSection  = null;    // currently open section (full doc incl. dictationSentences + audioUrl)
let dictIndex    = 0;       // current sentence index
let dictHintShown = [];     // letters Lulu has opened per word of the current sentence
let dictDone     = new Set(); // indices answered correctly this session
let dictTranslations = null; // Vietnamese meaning per sentence (null until loaded)
let dictSpeeds   = [1, 1.25, 1.5, 0.75];
let dictSpeedIdx = 0;
const audio = document.getElementById('dict-audio');

// Single source of truth for the play/pause button glyph — dictGoTo(),
// dictTogglePlay(), the timeupdate end-of-sentence stop and the audio
// 'error' handler all need to keep it in sync, and previously each poked
// the innerHTML directly (so navigating away mid-play left it stuck on the
// pause icon).
function _setDictPlayIcon(playing) {
  document.getElementById('dict-play-btn').innerHTML =
    playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

// Genuine load failure (bad/missing audioUrl, network error, unsupported
// format) — mirrors listening.html's audio 'error' listener; without it a
// broken file just fails silently with the button stuck on "pause".
audio.addEventListener('error', () => {
  console.error('[dictation audio] load error:', audio.error);
  if (!dictSection) return;
  _setDictPlayIcon(false);
  toast('Lỗi tải audio của bài này — vui lòng liên hệ giáo viên.', 'error');
});

// ══════════════ SAVE RESULTS (so admin's "Lịch sử làm bài" actually sees
// dictation practice — this page previously never sent anything to the
// server, checking answers entirely client-side). Keyed by sentenceIndex so
// re-checking the same sentence (dictRetry()) overwrites its earlier result
// instead of double-counting it. ══════════════
let dictSessionAnswers = [];
let dictSessionSaved   = false; // guards against double-POSTing from both backToList() and pagehide

function _recordDictAnswer(sentenceIndex, isCorrect, matchedWords, totalWords) {
  const row = { sentenceIndex, isCorrect, matchedWords, totalWords };
  const i = dictSessionAnswers.findIndex(a => a.sentenceIndex === sentenceIndex);
  if (i >= 0) dictSessionAnswers[i] = row; else dictSessionAnswers.push(row);
  dictSessionSaved = false; // new activity since the last save
}

// Fire-and-forget, same as other session/progress saves in this codebase
// (e.g. task2-practice.html's saveDraft()) — a failed save silently drops
// this session's history without blocking the student's practice.
// keepalive:true keeps the request alive past page unload (pagehide below),
// unlike a plain fetch which the browser would otherwise cancel.
function saveDictSession() {
  if (dictSessionSaved || !dictSection || !dictSessionAnswers.length) return;
  dictSessionSaved = true;
  fetch(`${API}/listening/dictation/save-attempt`, {
    method: 'POST',
    headers: authH(),
    keepalive: true,
    body: JSON.stringify({
      sectionId: dictSection._id,
      sectionTitle: dictSection.title,
      partNumber: dictSection.partNumber,
      answers: dictSessionAnswers
    })
  }).catch(() => {});
}

document.addEventListener('pagehide', saveDictSession);

/* ══════════════ PICKER ══════════════ */
async function loadDictList() {
  try {
    const res = await fetch(`${API}/listening/dictation/list`, { headers: authH() });
    const data = await window.ApiClient.handleResponse(res);
    dictSections = data.sections || [];
  } catch (e) {
    document.getElementById('dict-grid').innerHTML = `<div class="dict-empty"><i class="fas fa-triangle-exclamation"></i>Không tải được danh sách. Vui lòng thử lại.</div>`;
    return;
  }
  renderDictList();
}

// Case/diacritic-insensitive, so "cam18 test 2" or "festival" both match.
function _dictNorm(t) {
  return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function renderDictList() {
  const grid = document.getElementById('dict-grid');
  if (!dictSections.length) {
    grid.innerHTML = `<div class="dict-empty"><i class="fas fa-keyboard"></i>Chưa có bài nào sẵn sàng để luyện Dictation.</div>`;
    return;
  }
  // Every word typed must appear somewhere in the title / Part label.
  const terms = _dictNorm(document.getElementById('dict-search').value).split(' ').filter(Boolean);
  const list = dictSections.filter(s => {
    const hay = _dictNorm(s.title + ' ' + (s.isActualTest ? 'actual test' : 'part ' + s.partNumber));
    const compact = hay.replace(/ /g, '');
    return terms.every(t => hay.includes(t) || compact.includes(t));
  });
  if (!list.length) {
    grid.innerHTML = `<div class="dict-empty"><i class="fas fa-search"></i>Không tìm thấy bài nào khớp với từ khóa.</div>`;
    return;
  }
  grid.innerHTML = list.map(s => `
    <div class="dict-card" onclick="openDictSection('${s._id}')">
      <div class="dict-card-badges">
        <span class="dict-badge">${s.isActualTest ? 'Actual Test' : 'Part ' + s.partNumber}</span>
      </div>
      <div class="dict-card-title">${escHtml(s.title)}</div>
      <div class="dict-card-meta">
        <span><i class="fas fa-list-ol"></i> ${s.sentenceCount} câu</span>
        ${s.audioDuration ? `<span><i class="fas fa-clock"></i> ${fmtTime(s.audioDuration)}</span>` : ''}
      </div>
    </div>
  `).join('');
}

/* ══════════════ OPEN A SECTION ══════════════ */
let _openDictSeq = 0;
async function openDictSection(id, fromCleanPath) {
  // Same free-plan gate as reading/listening tests — browsing the list
  // above stays free, but actually opening a section to practice requires
  // premium (backend also enforces this on /listening/practice/by-id/:id).
  if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
    if (window.openUpgradeModal) window.openUpgradeModal();
    return;
  }
  document.getElementById('screen-list').classList.add('hidden');
  document.getElementById('screen-practice').classList.add('active');
  // Dictation has no timed exam mode — every session here is self-paced
  // practice/review, so double-click-to-save is on unconditionally (no
  // gate), same as e.g. profile.html/inbox.html's ungated calls.
  if (typeof setupDictionaryDouble === 'function') {
    setupDictionaryDouble('screen-practice', 'dictation');
  }
  document.getElementById('dict-section-title').textContent = 'Đang tải...';
  // Guards against double-clicking a card (or clicking a second card before
  // the first finishes loading) resolving out of order, and against a
  // fetch that's still in flight when the user has already clicked "back"
  // — only the most recently-requested section is allowed to apply, and a
  // stale one is discarded instead of silently overwriting the screen the
  // user is now looking at (or re-adding ?sectionId= after backToList()
  // already cleared it).
  const requestId = ++_openDictSeq;
  let data;
  try {
    // Dedicated dictation-content route — same data as /practice/by-id/:id
    // but not behind the mandatory-review gate (dictation is an ungraded
    // drill that never creates a pending review). See
    // backend/routes/listening.js (/dictation/section/:id).
    const res = await fetch(`${API}/listening/dictation/section/${id}`, { headers: authH() });
    data = await window.ApiClient.handleResponse(res);
  } catch (e) {
    if (requestId !== _openDictSeq) return;
    toast('Không tải được bài này.', 'error');
    backToList();
    return;
  }
  if (requestId !== _openDictSeq) return;
  dictSection = data.section;
  if (!dictSection || !(dictSection.dictationSentences || []).length) {
    toast('Bài này chưa có dữ liệu dictation.', 'error');
    backToList();
    return;
  }
  // Reassigning .src resets playbackRate to 1 in every browser, so the speed
  // button would otherwise keep showing a stale "1.5x" from the previous
  // section while playback is actually 1x. Reset both together.
  audio.src = dictSection.audioUrl;
  audio.playbackRate = 1;
  dictSpeedIdx = 0;
  document.getElementById('dict-speed-btn').textContent = '1x';
  _setDictPlayIcon(false);
  dictIndex = 0;
  dictDone = new Set();
  dictSessionAnswers = [];
  dictSessionSaved = false;
  document.getElementById('dict-section-title').textContent = dictSection.title;
  document.getElementById('dict-section-sub').textContent = (dictSection.isActualTest ? 'Actual Test' : 'Part ' + dictSection.partNumber) + ' · ' + dictSection.dictationSentences.length + ' câu';
  document.getElementById('dict-total-num').textContent = dictSection.dictationSentences.length;
  document.getElementById('dict-session-score').textContent = `0/${dictSection.dictationSentences.length} ✓`;
  _loadDictTranslations(id, requestId);
  renderNumGrid();
  dictGoTo(0);
  // Skip when the clean /dictation/:sectionId path already resolved to this
  // exact section — that URL is meant to keep showing forever, same
  // fromCleanPath idiom reading-v2.js uses for /reading/test/:id.
  if (!fromCleanPath) syncViewUrl(id);
}

// Vietnamese meanings (shown under a correctly typed sentence). Fetched in
// the background — the first student on a section waits on a one-off AI
// translation server-side, so practice never blocks on it.
function _loadDictTranslations(id, requestId) {
  dictTranslations = null;
  fetch(`${API}/listening/dictation/section/${id}/translations`, { headers: authH() })
    .then(r => r.json())
    .then(d => (d && d.success && Array.isArray(d.translations)) ? d.translations : [])
    .catch(() => [])
    .then(list => {
      if (requestId !== _openDictSeq) return;
      dictTranslations = list;
      _fillDictVi(); // a sentence may already be showing "Đang tải nghĩa..."
    });
}

function _fillDictVi() {
  const el = document.getElementById('dict-vi');
  if (!el || Number(el.dataset.i) !== dictIndex || !dictTranslations) return;
  const vi = dictTranslations[dictIndex] || '';
  el.innerHTML = vi ? `<b>Nghĩa:</b> ${escHtml(vi)}` : '';
  el.style.display = vi ? '' : 'none';
}

function backToList() {
  _openDictSeq++; // invalidate any in-flight openDictSection() fetch
  saveDictSession();
  audio.pause();
  document.getElementById('screen-practice').classList.remove('active');
  document.getElementById('screen-list').classList.remove('hidden');
  history.replaceState({}, '', '/dictation.html');
}

function syncViewUrl(id) {
  const url = new URL(location.href);
  url.searchParams.set('sectionId', id);
  history.replaceState({}, '', url);
}

function renderNumGrid() {
  const grid = document.getElementById('dict-num-grid');
  grid.innerHTML = dictSection.dictationSentences.map((_, i) => `
    <button class="dict-num-btn${i === dictIndex ? ' current' : ''}${dictDone.has(i) ? ' done' : ''}" data-i="${i}" onclick="dictGoTo(${i})">${i + 1}</button>
  `).join('');
}

/* ══════════════ SENTENCE NAVIGATION ══════════════ */
function dictGoTo(i) {
  const sentences = dictSection.dictationSentences;
  if (i < 0 || i >= sentences.length) return;
  audio.pause();
  _setDictPlayIcon(false); // was left showing "pause" when navigating mid-play
  dictIndex = i;
  document.getElementById('dict-cur-num').textContent = i + 1;
  document.getElementById('dict-prev-btn').disabled = i === 0;
  document.getElementById('dict-next-btn').disabled = i === sentences.length - 1;
  document.getElementById('dict-input').value = '';
  document.getElementById('dict-time').textContent = '0:00 / 0:00';
  document.getElementById('dict-result').classList.remove('show', 'correct', 'wrong');
  document.getElementById('dict-script-body').classList.remove('show');
  document.getElementById('dict-script-chevron').className = 'fas fa-chevron-down';
  document.getElementById('dict-check-btn').disabled = false;
  const sentence = sentences[i];
  const sentenceText = sentence.text || '';
  document.getElementById('dict-word-count').textContent = dictWords(sentenceText).length + ' từ';
  const hint = _buildDictHint(sentenceText);
  dictHintShown = [];
  document.getElementById('dict-script-body').innerHTML =
    `<div class="dict-hint-step">Gợi ý · chữ cái đầu mỗi từ</div>` +
    `<div class="dict-hint-count">📏 ${hint.wordCount} từ</div>` +
    `<div class="dict-hint-pattern" id="dict-hint-pattern">${escHtml(hint.pattern)}</div>` +
    `<div class="dict-hint2">` +
      `<button type="button" class="dict-hint2-btn ask-lulu" id="dict-hint2-btn" onclick="dictAskLulu()"><span class="ask-lulu-ic"></span> Hỏi Lulu thêm 1 chữ</button>` +
    `</div>`;
  updateDictProgress(0);
  document.querySelectorAll('.dict-num-btn').forEach(b => b.classList.toggle('current', parseInt(b.dataset.i, 10) === i));
  // Only auto-focus on desktop — on mobile this yanks the on-screen keyboard
  // up over the audio controls the moment the student opens a section or
  // taps the sentence grid, before they've even heard anything.
  if (window.matchMedia('(min-width: 800px)').matches) {
    document.getElementById('dict-input').focus();
  }
}

// Word count + first-letter-per-word hint — same UX as Task 1/2 writing
// practice (see backend/utils/textMatch.js's buildAnswerHint) and the
// Task 2 Template's Dịch câu mode. Was previously the full correct
// sentence text (clickable per word, spoken via TTS) — replaced since
// showing the literal answer let a student just read it instead of
// transcribing what they actually heard, defeating dictation practice.
function _buildDictHint(text) {
  const words = dictWords(text);
  const pattern = words.map(w => w.charAt(0) + w.slice(1).replace(/[a-zA-Z]/g, '_')).join(' ');
  return { wordCount: words.length, pattern };
}

// "Hỏi Lulu", for when the first-letter pattern isn't enough: each ask
// opens ONE more letter of the first word the student hasn't typed right
// yet (AskLulu.letterHint) — letter by letter, never the whole sentence
// (that used to be a "Hiện cả câu" button, which let a student just read
// the answer instead of transcribing what they heard).
function dictAskLulu() {
  if (!dictSection || !window.AskLulu) return;
  const text = dictWords(currentSentence().text || '').join(' ');
  const res = AskLulu.letterHint(text, document.getElementById('dict-input').value, dictHintShown);
  const el = document.getElementById('dict-hint-pattern');
  if (el) el.textContent = res.pattern;
  AskLulu.say(document.getElementById('dict-hint2-btn'), AskLulu.line(res));
}

/* ══════════════ AUDIO PLAYBACK (seek within the section's ONE shared
   audio file, using this sentence's start/end timestamps) ══════════════ */
function currentSentence() { return dictSection.dictationSentences[dictIndex]; }

function _dictPlay() {
  // audio.play() rejects on a load failure or an autoplay-policy block; without
  // a catch the button would flip to "pause" while nothing actually plays.
  audio.play().then(() => _setDictPlayIcon(true)).catch(() => {
    _setDictPlayIcon(false);
    toast('Không phát được audio — thử lại hoặc tải lại trang.', 'error');
  });
}

function dictTogglePlay() {
  if (audio.paused) {
    if (audio.currentTime < currentSentence().start || audio.currentTime >= currentSentence().end) {
      audio.currentTime = currentSentence().start;
    }
    _dictPlay();
  } else {
    audio.pause();
    _setDictPlayIcon(false);
  }
}

function dictRestart() {
  audio.currentTime = currentSentence().start;
  _dictPlay();
}

function dictCycleSpeed() {
  dictSpeedIdx = (dictSpeedIdx + 1) % dictSpeeds.length;
  audio.playbackRate = dictSpeeds[dictSpeedIdx];
  document.getElementById('dict-speed-btn').textContent = dictSpeeds[dictSpeedIdx] + 'x';
}

function updateDictProgress(ratio) {
  document.getElementById('dict-progress-fill').style.width = (Math.min(1, Math.max(0, ratio)) * 100) + '%';
}

audio.addEventListener('timeupdate', () => {
  if (!dictSection) return;
  const s = currentSentence();
  const dur = s.end - s.start || 1;
  updateDictProgress((audio.currentTime - s.start) / dur);
  document.getElementById('dict-time').textContent = fmtTime(Math.max(0, audio.currentTime - s.start)) + ' / ' + fmtTime(dur);
  if (audio.currentTime >= s.end) {
    audio.pause();
    _setDictPlayIcon(false);
  }
});

/* ══════════════ CHECK ANSWER (word-level diff against the correct,
   human-verified sentence — not the ASR's own wording) ══════════════ */
// Curly/typographic apostrophes (’ ‘ ʼ ` ´) count as a plain ' — the
// transcripts mostly use ’ ("you’ll") while a keyboard types ' ("you'll"),
// and a phone's smart punctuation can do either; without this a perfectly
// typed "you'll" was graded wrong against "you’ll".
function normWord(w) { return w.toLowerCase().replace(/[’‘ʼ`´]/g, "'").replace(/[^a-z0-9']/g, ''); }

// Tokenise a sentence into scorable words, dropping any token that is pure
// punctuation (a lone "–", "-", ".", "—", "…" that the transcript writes
// between spaces). normWord() strips those to "", so a standalone dash used
// to be counted as its own "word" the student could never type — marking a
// perfect transcription as "22/23". Punctuation attached to a real word
// (e.g. "William.") still rides along and is ignored by normWord() at
// compare time, so it never counts against the student either.
function dictWords(text) {
  return (text || '').trim().split(/\s+/).filter(w => normWord(w) !== '');
}

function dictCheck() {
  const inputEl = document.getElementById('dict-input');
  const typed = inputEl.value.trim();
  const correct = currentSentence().text || '';
  const typedWords = dictWords(typed);
  const correctWords = dictWords(correct);
  if (!typedWords.length) { _dictShake(inputEl); inputEl.focus(); return; }

  // Simple LCS-based word alignment — small sentences (a few dozen words at
  // most), so an O(n*m) table is trivial.
  const n = typedWords.length, m = correctWords.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = normWord(typedWords[i - 1]) === normWord(correctWords[j - 1])
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  // Walk the table back into an ordered list of ops: 'ok' (typed word
  // matches), 'bad' (typed word with no match) and 'gap' (answer word the
  // student didn't type).
  const ops = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normWord(typedWords[i - 1]) === normWord(correctWords[j - 1])) {
      ops.push({ type: 'ok', word: typedWords[i - 1] }); i--; j--;
    } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
      ops.push({ type: 'bad', word: typedWords[i - 1] }); i--;
    } else {
      ops.push({ type: 'gap' }); j--;
    }
  }
  ops.reverse();
  const matched = ops.filter(o => o.type === 'ok').length;
  const isPerfect = matched === m && n === m;

  const resultEl = document.getElementById('dict-result');
  const diffEl = document.getElementById('dict-diff');
  resultEl.classList.add('show');
  resultEl.classList.toggle('correct', isPerfect);
  resultEl.classList.toggle('wrong', !isPerfect);
  _recordDictAnswer(dictIndex, isPerfect, matched, m);

  if (!isPerfect) {
    // Show the student's OWN text with each wrong word in red (shaking, same
    // as Task 2's Dịch câu drill) and ＿＿ where words are missing — never the
    // answer, so they fix it from the audio. Between two matched words, a
    // wrong word stands in for a missing one (a misspelling), so only the
    // surplus missing words become gaps.
    const html = [];
    let bad = [], gaps = 0;
    const flush = () => {
      bad.forEach(w => html.push(`<span class="w-bad">${escHtml(w)}</span>`));
      for (let k = bad.length; k < gaps; k++) html.push('<span class="w-gap">＿＿</span>');
      bad = []; gaps = 0;
    };
    ops.forEach(o => {
      if (o.type === 'ok') { flush(); html.push(`<span class="w-ok">${escHtml(o.word)}</span>`); }
      else if (o.type === 'bad') bad.push(o.word);
      else gaps++;
    });
    flush();
    const hasGap = html.some(h => h.includes('w-gap'));
    document.getElementById('dict-result-label').textContent =
      `Đúng ${matched}/${m} từ — sửa các từ bôi đỏ${hasGap ? ' (＿＿ là chỗ còn thiếu từ)' : ''} rồi kiểm tra lại.`;
    diffEl.innerHTML = html.join(' ');
    _dictShake(inputEl);
    if (typeof playWrong === 'function') playWrong();
    inputEl.focus();
    return;
  }

  document.getElementById('dict-result-label').textContent = '✓ Chính xác!';
  diffEl.innerHTML =
    `<div class="dict-correct-en">${escHtml(correct)}</div>` +
    `<div class="dict-vi" id="dict-vi" data-i="${dictIndex}">${dictTranslations ? '' : '<i class="fas fa-spinner fa-spin"></i> Đang tải nghĩa...'}</div>`;
  _fillDictVi();
  document.getElementById('dict-check-btn').disabled = true;
  if (typeof playOk === 'function') playOk();

  dictDone.add(dictIndex);
  document.querySelector(`.dict-num-btn[data-i="${dictIndex}"]`)?.classList.add('done');
  document.getElementById('dict-session-score').textContent = `${dictDone.size}/${dictSection.dictationSentences.length} ✓`;
  // Corner Lulu (js/shared/playful.js): a hop per perfect sentence, a
  // cheer when the whole section is done.
  if (window.Mascot) {
    if (dictDone.size === dictSection.dictationSentences.length) window.Mascot.cheer(100, 'Chép đúng hết cả bài luôn! Tai cậu thính quá trời 🎧🍊');
    else window.Mascot.hop('excited');
  }
}

// Restartable shake (re-adding the class alone wouldn't replay it).
function _dictShake(el) {
  el.classList.remove('dict-shake');
  void el.offsetWidth;
  el.classList.add('dict-shake');
  setTimeout(() => el.classList.remove('dict-shake'), 450);
}

function dictRetry() {
  document.getElementById('dict-input').value = '';
  document.getElementById('dict-result').classList.remove('show', 'correct', 'wrong');
  document.getElementById('dict-check-btn').disabled = false;
  document.getElementById('dict-input').focus();
}

function dictToggleScript() {
  const body = document.getElementById('dict-script-body');
  const chevron = document.getElementById('dict-script-chevron');
  const show = !body.classList.contains('show');
  body.classList.toggle('show', show);
  chevron.className = show ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
}

document.getElementById('dict-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!document.getElementById('dict-check-btn').disabled) dictCheck();
  }
});

// Anti-cheat: dictation is meant to be typed from what the student hears,
// never pasted in from an outside source. Blocks Ctrl+V, right-click
// "Paste", and dragging text in — normal typing is untouched. Same
// pattern as speaking.js's #transcript-textarea guard.
(() => {
  const input = document.getElementById('dict-input');
  input.addEventListener('paste', e => {
    e.preventDefault();
    showToast('Không thể dán văn bản vào đây — hãy nghe và gõ lại.', 'warn', 3000);
  });
  input.addEventListener('drop', e => {
    e.preventDefault();
    showToast('Không thể kéo-thả văn bản vào đây — hãy nghe và gõ lại.', 'warn', 3000);
  });
  input.addEventListener('dragover', e => e.preventDefault());
})();

/* ══════════════ INIT ══════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Premium promo banner (site-wide UX unification, 2026-08-26) — same
  // browsable-with-a-nudge pattern as reading/listening. openDictSection()
  // below still does its own proactive hasPremiumAccess() check.
  const promoBanner = document.getElementById('premium-promo-banner');
  if (promoBanner) promoBanner.style.display = (window.AuthService && !window.AuthService.hasPremiumAccess()) ? 'flex' : 'none';

  // Clean path /dictation/:sectionId (a _redirects 200 rewrite to this same
  // file) — same additive pattern as reading-v2.js/listening.html's
  // RouteParams.match(): checked first, falls back to ?sectionId= unchanged.
  const cleanSection = window.RouteParams ? window.RouteParams.match([
    { pattern: /^\/dictation\/([^/?#]+)$/, param: 'sectionId' }
  ]) : null;
  const sectionId = (cleanSection && cleanSection.sectionId) || new URLSearchParams(location.search).get('sectionId');
  loadDictList().then(() => {
    if (sectionId) openDictSection(sectionId, !!cleanSection);
  });
});
