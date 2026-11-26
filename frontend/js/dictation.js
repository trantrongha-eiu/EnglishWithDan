/* frontend/js/dictation.js — Luyện Dictation (dictation.html).
 *
 * Two kinds of lesson share one player:
 *  - a Listening section: its dictationSentences, all clips of ONE audio
 *    file; the student types the whole sentence (word-level LCS diff).
 *  - a "drill" (DictationDrill, "Đánh vần tên" / "Số dài & mã số"): ~10
 *    clips of MANY Listening files, each with its own audioUrl; the student
 *    types only the `answer` (the spelled name / number), like an IELTS
 *    answer sheet — spacing and digit grouping don't matter.
 * Plus the Shadowing page's spelling-numbers videos, listed here and opened
 * in shadowing.html's own Dictation mode.
 *
 * Player layout follows dailydictation-style screens: tabs (Dictation /
 * Full transcript), media card + sentence grid on the left, typing panel on
 * the right with Correct/Incorrect + Skip, a masked answer line
 * ("According ** *******") and "Show answer immediately / Show full
 * answer" options; tips bar and full audio + plain transcript below.
 */
const API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
function authH() { return { ...window.AuthService.authHeader(), 'Content-Type': 'application/json' }; }
function pad(n) { return String(Math.floor(n)).padStart(2, '0'); }
function fmtTime(s) { if (!isFinite(s) || s < 0) s = 0; return Math.floor(s / 60) + ':' + pad(s % 60); }

let dictSections = [];      // picker: Listening sections with dictation
let dictDrills = [];        // picker: spelling / numbers drills
// Shadowing's spelling-numbers video lessons (embedded YouTube, never
// re-hosted) — a card opens them in shadowing.html's Dictation mode.
let dictSpellLessons = [];
let dictPart = '';          // active chip: '' | '1'..'4' | 'drill-spelling' | 'drill-numbers' | 'spell'

// The open lesson, normalised: { kind: 'section'|'drill', _id, slug, title,
// sub, transcript, audioUrl, sentences: [{ text, start, end, audioUrl, answer?, sourceTitle? }] }
let dictSection = null;
let dictIndex = 0;
let dictDone = new Set();      // sentences typed right this session
let dictPeeked = new Set();    // sentences whose full answer was shown → not scored as correct
let dictLast = {};             // per sentence: result of the latest check (drives the mask)
let dictTranslations = null;   // sections: Vietnamese meaning per sentence
let dictSpeed = 1;
const audio = document.getElementById('dict-audio');

const DICT_TIPS = [
  'Luyện ít nhất 30 phút mỗi ngày để tiến bộ nhanh hơn!',
  'Nghe lại một câu nhiều lần trước khi xem đáp án — phím Ctrl để nghe lại nhanh.',
  'Đánh vần: "double L" = LL, "triple 5" = 555, "oh" = số 0.',
  'Số điện thoại: viết theo nhóm 3–4 số trong lúc nghe để không bị sót.',
  'Bẫy "13 hay 30": -teen nhấn âm cuối và kéo dài, -ty nhấn âm đầu.',
  'Chép xong câu khó, đọc to lại một lần theo băng để nhớ cách nối âm.',
  'Gặp từ mới, nháy đúp vào từ trong đáp án để tra nghĩa và lưu vào sổ từ.',
];
let dictTipIdx = 0;

// Single source of truth for the play/pause glyph.
function _setDictPlayIcon(playing) {
  document.getElementById('dict-play-btn').innerHTML =
    playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

audio.addEventListener('error', () => {
  console.error('[dictation audio] load error:', audio.error);
  if (!dictSection) return;
  _setDictPlayIcon(false);
  toast('Lỗi tải audio của bài này — vui lòng liên hệ giáo viên.', 'error');
});

/* ══════════════ PREFS (per viewer, best effort) ══════════════ */
const PREFS_KEY = 'dictation-prefs-v2';
function dictLoadPrefs() {
  let p = {};
  try { p = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') || {}; } catch (e) { p = {}; }
  if (typeof p.autoplay === 'boolean') document.getElementById('opt-autoplay').checked = p.autoplay;
  if (typeof p.autonext === 'boolean') document.getElementById('opt-autonext').checked = p.autonext;
  if (typeof p.showAnswer === 'boolean') document.getElementById('opt-show-answer').checked = p.showAnswer;
  if (typeof p.showVi === 'boolean') document.getElementById('opt-show-vi').checked = p.showVi;
  if ([0.75, 1, 1.25, 1.5].includes(p.speed)) { dictSpeed = p.speed; document.getElementById('dict-speed-sel').value = String(p.speed); }
}
function dictSavePrefs() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({
      autoplay: document.getElementById('opt-autoplay').checked,
      autonext: document.getElementById('opt-autonext').checked,
      showAnswer: document.getElementById('opt-show-answer').checked,
      showVi: document.getElementById('opt-show-vi').checked,
      speed: dictSpeed,
    }));
  } catch (e) { /* private mode etc. — prefs just don't stick */ }
}

/* ══════════════ SAVE RESULTS (admin "Lịch sử làm bài") ══════════════
   Keyed by sentenceIndex so re-checking a sentence overwrites its row. */
let dictSessionAnswers = [];
let dictSessionSaved = false;

function _recordDictAnswer(sentenceIndex, isCorrect, matchedWords, totalWords) {
  const row = { sentenceIndex, isCorrect, matchedWords, totalWords };
  const i = dictSessionAnswers.findIndex(a => a.sentenceIndex === sentenceIndex);
  if (i >= 0) dictSessionAnswers[i] = row; else dictSessionAnswers.push(row);
  dictSessionSaved = false;
}

// Fire-and-forget; keepalive lets it outlive a page unload (pagehide below).
function saveDictSession() {
  if (dictSessionSaved || !dictSection || !dictSessionAnswers.length) return;
  dictSessionSaved = true;
  const body = dictSection.kind === 'drill'
    ? { drillSlug: dictSection.slug, sectionTitle: dictSection.title, answers: dictSessionAnswers }
    : { sectionId: dictSection._id, sectionTitle: dictSection.title, partNumber: dictSection.partNumber, answers: dictSessionAnswers };
  fetch(`${API}/listening/dictation/save-attempt`, {
    method: 'POST', headers: authH(), keepalive: true, body: JSON.stringify(body),
  }).catch(() => {});
}
window.addEventListener('pagehide', saveDictSession);

/* ══════════════ PICKER ══════════════ */
async function loadDictList() {
  try {
    const [res] = await Promise.all([
      fetch(`${API}/listening/dictation/list`, { headers: authH() }),
      _loadDictSpellLessons(),
    ]);
    const data = await window.ApiClient.handleResponse(res);
    dictSections = data.sections || [];
    dictDrills = data.drills || [];
  } catch (e) {
    document.getElementById('dict-grid').innerHTML = `<div class="dict-empty"><i class="fas fa-triangle-exclamation"></i>Không tải được danh sách. Vui lòng thử lại.</div>`;
    return;
  }
  renderDictList();
}

// Best effort: without it the page still lists everything else.
async function _loadDictSpellLessons() {
  try {
    const res = await fetch(`${API}/shadowing/lessons`, { headers: authH() });
    if (!res.ok) return;
    const data = await res.json();
    dictSpellLessons = (data.lessons || []).filter(l => l.category === 'spelling-numbers');
  } catch (e) { dictSpellLessons = []; }
}

function _dictPool(part) {
  const drills = dictDrills.map(d => ({ ...d, _drill: true }));
  const spell = dictSpellLessons.map(l => ({ ...l, _spell: true }));
  if (part === 'spell') return spell;
  if (part === 'drill-spelling') return drills.filter(d => d.category === 'spelling');
  if (part === 'drill-numbers') return drills.filter(d => d.category === 'numbers');
  // every section of that part — Actual Test parts included
  if (part) return dictSections.filter(s => String(s.partNumber) === part);
  return drills.concat(spell, dictSections);
}

function _dictChipCounts() {
  document.querySelectorAll('#dict-filters .dict-chip').forEach(btn => {
    let el = btn.querySelector('.n');
    if (!el) { el = document.createElement('span'); el.className = 'n'; btn.appendChild(el); }
    el.textContent = `(${_dictPool(btn.dataset.part).length})`;
  });
}

document.getElementById('dict-filters')?.addEventListener('click', e => {
  const btn = e.target.closest('.dict-chip');
  if (!btn) return;
  dictPart = btn.dataset.part;
  document.querySelectorAll('#dict-filters .dict-chip').forEach(b => b.classList.toggle('active', b === btn));
  renderDictList();
});

function openDictSpell(slug) {
  location.href = '/shadowing.html?lesson=' + encodeURIComponent(slug) + '&mode=dictation';
}

// Case/diacritic-insensitive fallback matcher (SearchMatch is preferred).
function _dictNorm(t) {
  return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function renderDictList() {
  const grid = document.getElementById('dict-grid');
  _dictChipCounts();
  if (!dictSections.length && !dictDrills.length && !dictSpellLessons.length) {
    grid.innerHTML = `<div class="dict-empty"><i class="fas fa-keyboard"></i>Chưa có bài nào sẵn sàng để luyện Dictation.</div>`;
    return;
  }
  const query = document.getElementById('dict-search').value;
  const text = s => s._drill ? [s.title, s.category === 'spelling' ? 'đánh vần spelling names tên' : 'số numbers phone price postcode']
    : s._spell ? [s.title, 'video đánh vần spelling names numbers số']
    : [s.title, 'part ' + s.partNumber + (s.isActualTest ? ' actual test' : '')];
  const pool = _dictPool(dictPart);
  const list = window.SearchMatch ? window.SearchMatch.filter(pool, query, text) : pool.filter(s => {
    const terms = _dictNorm(query).split(' ').filter(Boolean);
    const hay = _dictNorm(text(s).join(' '));
    const compact = hay.replace(/ /g, '');
    return terms.every(t => hay.includes(t) || compact.includes(t));
  });
  if (!list.length) {
    grid.innerHTML = `<div class="dict-empty"><i class="fas fa-search"></i>Không tìm thấy bài nào khớp với từ khóa.</div>`;
    return;
  }
  grid.innerHTML = list.map(s => {
    if (s._drill) return `
    <div class="dict-card" onclick="openDictDrill('${escHtml(s.slug)}')">
      <div class="dict-card-badges">
        <span class="dict-badge ${s.category === 'spelling' ? 'spell' : 'num'}">${s.category === 'spelling' ? '🔤 Đánh vần tên' : '🔢 Số & mã số'}</span>
      </div>
      <div class="dict-card-title">${escHtml(s.title)}</div>
      <div class="dict-card-meta"><span><i class="fas fa-list-ol"></i> ${s.itemCount} câu</span><span><i class="fas fa-headphones"></i> Audio đề thi</span></div>
    </div>`;
    if (s._spell) return `
    <div class="dict-card" onclick="openDictSpell('${escHtml(s.slug)}')">
      <div class="dict-card-badges">
        <span class="dict-badge">Đánh vần &amp; số</span>
        <span class="dict-badge video"><i class="fab fa-youtube"></i> Video</span>
      </div>
      <div class="dict-card-title">${escHtml(s.title)}</div>
      <div class="dict-card-meta">
        <span><i class="fas fa-list-ol"></i> ${s.segmentCount || 0} câu</span>
        ${s.duration ? `<span><i class="fas fa-clock"></i> ${fmtTime(s.duration)}</span>` : ''}
      </div>
    </div>`;
    return `
    <div class="dict-card" onclick="openDictSection('${s._id}')">
      <div class="dict-card-badges">
        <span class="dict-badge">${'Part ' + s.partNumber + (s.isActualTest ? ' · Actual Test' : '')}</span>
      </div>
      <div class="dict-card-title">${escHtml(s.title)}</div>
      <div class="dict-card-meta">
        <span><i class="fas fa-list-ol"></i> ${s.sentenceCount} câu</span>
        ${s.audioDuration ? `<span><i class="fas fa-clock"></i> ${fmtTime(s.audioDuration)}</span>` : ''}
      </div>
    </div>`;
  }).join('');
}

/* ══════════════ OPEN A LESSON ══════════════ */
let _openDictSeq = 0;

function _dictEnterPractice() {
  if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
    if (window.openUpgradeModal) window.openUpgradeModal();
    return false;
  }
  document.getElementById('screen-list').classList.add('hidden');
  document.getElementById('screen-practice').classList.add('active');
  if (typeof setupDictionaryDouble === 'function') setupDictionaryDouble('screen-practice', 'dictation');
  document.getElementById('dict-section-title').textContent = 'Đang tải...';
  window.scrollTo(0, 0);
  return true;
}

async function _dictFetch(url, requestId) {
  try {
    const res = await fetch(url, { headers: authH() });
    const data = await window.ApiClient.handleResponse(res);
    return requestId === _openDictSeq ? data : null;
  } catch (e) {
    if (requestId === _openDictSeq) { toast('Không tải được bài này.', 'error'); backToList(); }
    return null;
  }
}

async function openDictSection(id, fromCleanPath) {
  if (!_dictEnterPractice()) return;
  const requestId = ++_openDictSeq;
  const data = await _dictFetch(`${API}/listening/dictation/section/${id}`, requestId);
  if (!data) return;
  const s = data.section;
  if (!s || !(s.dictationSentences || []).length) {
    toast('Bài này chưa có dữ liệu dictation.', 'error');
    backToList();
    return;
  }
  _dictStart({
    kind: 'section', _id: s._id, title: s.title, partNumber: s.partNumber,
    sub: 'Part ' + s.partNumber + (s.isActualTest ? ' · Actual Test' : ''),
    transcript: s.transcript || '', audioUrl: s.audioUrl,
    sentences: s.dictationSentences.map(x => ({ text: x.text, start: x.start, end: x.end, audioUrl: s.audioUrl })),
  });
  _loadDictTranslations(id, requestId);
  if (!fromCleanPath) syncViewUrl('sectionId', id);
}

async function openDictDrill(slug) {
  if (!_dictEnterPractice()) return;
  const requestId = ++_openDictSeq;
  const data = await _dictFetch(`${API}/listening/dictation/drill/${encodeURIComponent(slug)}`, requestId);
  if (!data) return;
  const d = data.drill;
  if (!d || !(d.items || []).length) { toast('Bài này chưa có dữ liệu.', 'error'); backToList(); return; }
  dictTranslations = [];
  _dictStart({
    kind: 'drill', _id: d._id, slug: d.slug, title: d.title,
    sub: d.category === 'spelling' ? '🔤 Đánh vần tên — gõ đúng chính tả cái tên' : '🔢 Số dài & mã số — gõ lại con số / mã',
    transcript: '', audioUrl: '',
    sentences: d.items.map(x => ({ text: x.text, start: x.start, end: x.end, audioUrl: x.audioUrl, answer: x.answer, sourceTitle: x.sourceTitle })),
  });
  syncViewUrl('drill', d.slug);
}

function _dictStart(lesson) {
  dictSection = lesson;
  dictIndex = 0;
  dictDone = new Set();
  dictPeeked = new Set();
  dictLast = {};
  dictSessionAnswers = [];
  dictSessionSaved = false;
  if (lesson.kind === 'section') dictTranslations = null;
  audio.removeAttribute('src');
  _setDictPlayIcon(false);
  const n = lesson.sentences.length;
  document.getElementById('dict-section-title').textContent = lesson.title;
  document.getElementById('dict-section-sub').textContent = `${lesson.sub} · ${n} câu`;
  document.getElementById('dict-media-title').textContent = lesson.title;
  document.getElementById('dict-total-num').textContent = n;
  document.getElementById('dict-session-score').textContent = `0/${n} ✓`;
  document.getElementById('opt-show-full').checked = false;
  document.getElementById('opt-show-vi-row').style.display = lesson.kind === 'section' ? '' : 'none';
  // Full audio + plain transcript (sections only — a drill has many files).
  const full = document.getElementById('dict-full');
  full.open = false;
  full.style.display = lesson.kind === 'section' ? '' : 'none';
  const fullAudio = document.getElementById('dict-full-audio');
  fullAudio.pause();
  if (lesson.kind === 'section') fullAudio.src = lesson.audioUrl; else fullAudio.removeAttribute('src');
  document.getElementById('dict-full-text').innerHTML = (lesson.transcript || '').split(/\n+/).filter(Boolean)
    .map(p => `<p>${escHtml(p)}</p>`).join('');
  dictTab('dictation');
  renderNumGrid();
  dictGoTo(0, { noAutoplay: true });
}

// Vietnamese meanings (shown once a sentence is typed right) — sections only.
function _loadDictTranslations(id, requestId) {
  dictTranslations = null;
  fetch(`${API}/listening/dictation/section/${id}/translations`, { headers: authH() })
    .then(r => r.json())
    .then(d => (d && d.success && Array.isArray(d.translations)) ? d.translations : [])
    .catch(() => [])
    .then(list => {
      if (requestId !== _openDictSeq) return;
      dictTranslations = list;
      _fillDictVi();
      _fillDictViHint();
      if (!document.getElementById('dict-pane-transcript').classList.contains('hidden')) renderDictTranscript();
    });
}

function _fillDictVi() {
  const el = document.getElementById('dict-vi');
  if (!el || Number(el.dataset.i) !== dictIndex || !dictTranslations) return;
  const vi = dictTranslations[dictIndex] || '';
  el.innerHTML = vi ? `<b>Nghĩa:</b> ${escHtml(vi)}` : '';
  el.style.display = vi ? '' : 'none';
}

// "Hiện nghĩa tiếng Việt": the meaning while the sentence is being listened
// to — once it's revealed the meaning shows under the answer instead.
function _fillDictViHint() {
  const el = document.getElementById('dict-vi-hint');
  if (!el) return;
  const s = dictSection && currentSentence();
  const st = dictLast[dictIndex];
  const revealed = (st && st.perfect) || document.getElementById('opt-show-full').checked;
  const vi = s && !s.answer && document.getElementById('opt-show-vi').checked && !revealed && dictTranslations ? dictTranslations[dictIndex] || '' : '';
  el.innerHTML = vi ? `<b>Nghĩa:</b> ${escHtml(vi)}` : '';
  el.style.display = vi ? '' : 'none';
}

function backToList() {
  _openDictSeq++;
  saveDictSession();
  audio.pause();
  document.getElementById('dict-full-audio').pause();
  dictSection = null;
  document.getElementById('screen-practice').classList.remove('active');
  document.getElementById('screen-list').classList.remove('hidden');
  history.replaceState({}, '', '/dictation.html');
}

function syncViewUrl(param, value) {
  const url = new URL(location.href);
  url.searchParams.delete('sectionId');
  url.searchParams.delete('drill');
  url.searchParams.set(param, value);
  history.replaceState({}, '', url);
}

function renderNumGrid() {
  document.getElementById('dict-num-grid').innerHTML = dictSection.sentences.map((_, i) =>
    `<button class="dict-num-btn${i === dictIndex ? ' current' : ''}${dictDone.has(i) ? ' done' : ''}" data-i="${i}" onclick="dictGoTo(${i})">${i + 1}</button>`
  ).join('');
}

/* ══════════════ TABS / TRANSCRIPT / TIPS ══════════════ */
function dictTab(name) {
  document.querySelectorAll('.dx-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.getElementById('dict-pane-dictation').classList.toggle('hidden', name !== 'dictation');
  document.getElementById('dict-pane-transcript').classList.toggle('hidden', name !== 'transcript');
  if (name === 'transcript') renderDictTranscript();
}

function renderDictTranscript() {
  if (!dictSection) return;
  document.getElementById('dict-transcript-list').innerHTML = dictSection.sentences.map((s, i) => `
    <li class="${dictDone.has(i) ? 'done' : ''}${i === dictIndex ? ' current' : ''}" onclick="dictTab('dictation'); dictGoTo(${i})">
      ${s.answer ? `<b class="dict-t-answer">${escHtml(s.answer)}</b> — ` : ''}${escHtml(s.text)}
      ${s.sourceTitle ? `<span class="dict-t-src">${escHtml(s.sourceTitle)}</span>` : ''}
      ${document.getElementById('opt-show-vi').checked && dictTranslations && dictTranslations[i] ? `<div class="dict-t-vi">${escHtml(dictTranslations[i])}</div>` : ''}
    </li>`).join('');
}

function dictNextTip() {
  dictTipIdx = (dictTipIdx + 1) % DICT_TIPS.length;
  document.getElementById('dict-tip-text').textContent = DICT_TIPS[dictTipIdx];
}

/* ══════════════ SETTINGS ══════════════ */
function dictToggleSettings(e) {
  if (e) e.stopPropagation();
  document.getElementById('dict-settings').classList.toggle('show');
}
document.addEventListener('click', e => {
  const box = document.getElementById('dict-settings');
  if (box && box.classList.contains('show') && !e.target.closest('.dict-gear-wrap')) box.classList.remove('show');
});
function dictSetSpeed(v) {
  dictSpeed = Number(v) || 1;
  audio.playbackRate = dictSpeed;
  dictSavePrefs();
}

/* ══════════════ SENTENCE NAVIGATION ══════════════ */
function currentSentence() { return dictSection.sentences[dictIndex]; }

// A drill's answer = what to type; a section sentence = the whole text.
function dictRef(s) { return s.answer || s.text || ''; }

function dictGoTo(i, opts = {}) {
  if (!dictSection) return;
  const sentences = dictSection.sentences;
  if (i < 0 || i >= sentences.length) return;
  clearTimeout(_dictAutoNextTimer);
  audio.pause();
  _setDictPlayIcon(false);
  dictIndex = i;
  const s = sentences[i];
  // A drill's clips come from different files — switch source when needed.
  if (audio.getAttribute('src') !== s.audioUrl) {
    audio.src = s.audioUrl;
    audio.playbackRate = dictSpeed;
  }
  document.getElementById('dict-cur-num').textContent = i + 1;
  document.getElementById('dict-prev-btn').disabled = i === 0;
  document.getElementById('dict-next-btn').disabled = i === sentences.length - 1;
  document.getElementById('dict-media-src').textContent = s.sourceTitle ? '🎧 ' + s.sourceTitle : '';
  const input = document.getElementById('dict-input');
  input.value = '';
  input.disabled = false;
  document.getElementById('dict-check-btn').disabled = dictDone.has(i);
  document.getElementById('dict-time').textContent = '0:00 / ' + fmtTime(s.end - s.start);
  document.getElementById('opt-show-full').checked = false;
  document.getElementById('dict-prompt').innerHTML = s.answer
    ? (dictSection.slug && dictSection.slug.startsWith('spelling')
      ? 'Nghe và gõ lại <b>cái tên / từ được đánh vần</b>.'
      : 'Nghe và gõ lại <b>con số / mã số / địa chỉ</b>.')
    : '';
  updateDictProgress(0);
  dictRenderMask();
  document.querySelectorAll('.dict-num-btn').forEach(b => b.classList.toggle('current', parseInt(b.dataset.i, 10) === i));
  if (!document.getElementById('dict-pane-transcript').classList.contains('hidden')) renderDictTranscript();
  if (window.matchMedia('(min-width: 800px)').matches) input.focus();
  if (!opts.noAutoplay && document.getElementById('opt-autoplay').checked) dictRestart(true);
}

function dictSkip() {
  if (!dictSection) return;
  if (dictIndex < dictSection.sentences.length - 1) dictGoTo(dictIndex + 1);
  else toast('Đây là câu cuối rồi.', 'info');
}

/* ══════════════ AUDIO (seek within each clip's file) ══════════════ */
// Seeking before metadata has loaded is ignored by some browsers.
function _dictSeek(t, then) {
  if (audio.readyState >= 1) { audio.currentTime = t; then(); return; }
  audio.addEventListener('loadedmetadata', function once() {
    audio.removeEventListener('loadedmetadata', once);
    audio.currentTime = t;
    then();
  });
  audio.load();
}

function _dictPlay(silent) {
  audio.playbackRate = dictSpeed;
  audio.play().then(() => _setDictPlayIcon(true)).catch(() => {
    _setDictPlayIcon(false);
    if (!silent) toast('Không phát được audio — thử lại hoặc tải lại trang.', 'error');
  });
}

function dictTogglePlay() {
  if (!dictSection) return;
  if (audio.paused) {
    const s = currentSentence();
    if (audio.readyState < 1 || audio.currentTime < s.start - 0.05 || audio.currentTime >= s.end) _dictSeek(s.start, () => _dictPlay());
    else _dictPlay();
  } else {
    audio.pause();
    _setDictPlayIcon(false);
  }
}

// silent = an automatic play (sentence change): an autoplay block is not an error.
function dictRestart(silent) {
  if (!dictSection) return;
  _dictSeek(currentSentence().start, () => _dictPlay(silent === true));
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

// timeupdate fires only ~4×/s — too late to stop before the next word, so
// while playing the clip end is watched every frame (timeupdate stays as the
// fallback for background tabs, where frames are paused).
let _dictEndWatch = 0;
function _dictWatchEnd() {
  cancelAnimationFrame(_dictEndWatch);
  const tick = () => {
    if (audio.paused || !dictSection) return;
    if (audio.currentTime >= currentSentence().end) {
      audio.pause();
      _setDictPlayIcon(false);
      return;
    }
    _dictEndWatch = requestAnimationFrame(tick);
  };
  _dictEndWatch = requestAnimationFrame(tick);
}
audio.addEventListener('play', _dictWatchEnd);
// A drill clip is its own short file: it can simply run to its end.
audio.addEventListener('ended', () => _setDictPlayIcon(false));

/* ══════════════ CHECKING ══════════════ */
// Curly apostrophes count as a plain ' (transcripts use ’, keyboards ').
function normWord(w) { return w.toLowerCase().replace(/[’‘ʼ`´]/g, "'").replace(/[^a-z0-9']/g, ''); }
// "OK" in the transcript typed as "okay" (or "O.K.") is the same word.
const _DICT_SAME_WORD = { okay: 'ok' };
function _dictMatchWord(w) { const n = normWord(w); return _DICT_SAME_WORD[n] || n; }

// Scorable words; pure punctuation tokens ("–", "…") are dropped.
function dictWords(text) {
  return (text || '').trim().split(/\s+/).filter(w => normWord(w) !== '');
}

// A drill answer: hyphens split ("091-463-8520"), consecutive digit groups
// join ("0491 577 248" = "0491577248") so the grouping never matters.
function answerWords(text) {
  const out = [];
  let joinNext = false;
  for (const w of (text || '').replace(/[-–—]/g, ' ').split(/\s+/).filter(x => normWord(x) !== '')) {
    const digits = /^\d+$/.test(normWord(w));
    if (digits && joinNext) out[out.length - 1] += w; else out.push(w);
    joinNext = digits;
  }
  return out;
}

// LCS word alignment → ordered ops: ok (typed word matches), bad (typed
// word with no match), gap (reference word not typed). Each op that
// consumes a reference word carries its index `r`.
function _dictAlign(typedWords, refWords) {
  const n = typedWords.length, m = refWords.length;
  const a = typedWords.map(_dictMatchWord), b = refWords.map(_dictMatchWord);
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++)
    dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const ops = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) { ops.push({ type: 'ok', word: typedWords[i - 1], r: j - 1 }); i--; j--; }
    else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) { ops.push({ type: 'bad', word: typedWords[i - 1] }); i--; }
    else { ops.push({ type: 'gap', r: j - 1 }); j--; }
  }
  return ops.reverse();
}

function dictCheck() {
  if (!dictSection) return;
  const inputEl = document.getElementById('dict-input');
  const typed = inputEl.value.trim();
  if (!typed) { _dictShake(inputEl); inputEl.focus(); return; }
  const s = currentSentence();
  const isDrill = !!s.answer;
  const refWords = isDrill ? answerWords(s.answer) : dictWords(s.text);
  const typedWords = isDrill ? answerWords(typed) : dictWords(typed);
  const ops = _dictAlign(typedWords, refWords);
  const okRefs = new Set(ops.filter(o => o.type === 'ok').map(o => o.r));
  let perfect = okRefs.size === refWords.length && typedWords.length === refWords.length;
  // A name / number also counts when only the spacing differs ("se100dx").
  if (isDrill && !perfect && typedWords.map(normWord).join('') === refWords.map(normWord).join('')) perfect = true;

  // The first reference word not typed right, and the typed word standing in
  // for it (a misspelling) — "Show answer immediately" reveals that word.
  let firstWrong = -1, typedFor = '';
  if (!perfect) {
    firstWrong = refWords.findIndex((_, r) => !okRefs.has(r));
    // the run of unmatched ops (between two matched words) holding that gap
    let seg = [];
    for (const o of ops) {
      if (o.type !== 'ok') { seg.push(o); continue; }
      if (seg.some(x => x.type === 'gap' && x.r === firstWrong)) break;
      seg = [];
    }
    const bad = seg.find(o => o.type === 'bad');
    typedFor = bad ? bad.word : '';
  }
  dictLast[dictIndex] = { okRefs: perfect ? new Set(refWords.map((_, r) => r)) : okRefs, firstWrong, typedFor, perfect, checked: true };

  const scored = perfect && !dictPeeked.has(dictIndex);
  _recordDictAnswer(dictIndex, scored, perfect ? refWords.length : okRefs.size, refWords.length);
  dictRenderMask();

  if (!perfect) {
    _dictShake(inputEl);
    if (typeof playWrong === 'function') playWrong();
    inputEl.focus();
    return;
  }

  if (typeof playOk === 'function') playOk();
  document.getElementById('dict-check-btn').disabled = true;
  dictDone.add(dictIndex);
  document.querySelector(`.dict-num-btn[data-i="${dictIndex}"]`)?.classList.add('done');
  const total = dictSection.sentences.length;
  document.getElementById('dict-session-score').textContent = `${dictDone.size}/${total} ✓`;
  if (window.Mascot) {
    if (dictDone.size === total) window.Mascot.cheer(100, 'Chép đúng hết cả bài luôn! Tai cậu thính quá trời 🎧🍊');
    else window.Mascot.hop('excited');
  }
  if (dictDone.size === total) saveDictSession();
  else if (document.getElementById('opt-autonext').checked) {
    const next = _nextUndone();
    if (next >= 0) _dictAutoNextTimer = setTimeout(() => { if (dictSection) dictGoTo(next); }, 1600);
  }
}
let _dictAutoNextTimer = null;

function _nextUndone() {
  const n = dictSection.sentences.length;
  for (let k = 1; k <= n; k++) { const i = (dictIndex + k) % n; if (!dictDone.has(i)) return i; }
  return -1;
}

// Status line + masked answer ("According ** *******"): words typed right
// are shown, the rest are asterisks; with "Show answer immediately" the
// first wrong word is revealed with its wrong letters marked; "Show full
// answer" shows everything (that sentence then isn't scored as correct).
function dictRenderMask() {
  if (!dictSection) return;
  const s = currentSentence();
  const isDrill = !!s.answer;
  const st = dictLast[dictIndex];
  const statusEl = document.getElementById('dict-status');
  const maskEl = document.getElementById('dict-mask');
  const revealEl = document.getElementById('dict-reveal');
  const showFull = document.getElementById('opt-show-full').checked;
  const showAnswer = document.getElementById('opt-show-answer').checked;
  if (showFull && !(st && st.perfect)) dictPeeked.add(dictIndex);
  _fillDictViHint();

  statusEl.className = 'dict-status' + (st ? (st.perfect ? ' ok' : ' bad') : '');
  statusEl.innerHTML = !st ? ''
    : st.perfect ? '<i class="fas fa-circle-check"></i> Correct!'
    : '<i class="fas fa-triangle-exclamation"></i> Incorrect' + (st.firstWrong < 0 ? ' <small>— bạn gõ thừa từ</small>' : '');

  const done = st && st.perfect;
  if (done || showFull) {
    maskEl.innerHTML = '';
    revealEl.innerHTML = (isDrill ? `<div class="dict-reveal-answer">${escHtml(s.answer)}</div>` : '') +
      `<div class="dict-correct-en">${escHtml(s.text)}</div>` +
      (!isDrill ? `<div class="dict-vi" id="dict-vi" data-i="${dictIndex}">${dictTranslations ? '' : (done ? '<i class="fas fa-spinner fa-spin"></i> Đang tải nghĩa...' : '')}</div>` : '') +
      (done && dictPeeked.has(dictIndex) ? '<div class="dict-peek-note">Câu này đã xem đáp án nên không tính điểm.</div>' : '');
    if (!isDrill) _fillDictVi();
    return;
  }
  revealEl.innerHTML = '';
  if (!st) { maskEl.innerHTML = ''; return; }
  const words = isDrill ? (s.answer || '').split(/\s+/).filter(Boolean) : dictWords(s.text);
  // map displayed words → scored words (identical for sections; a drill's
  // digit groups were joined for scoring, so reveal a group only when the
  // whole joined token was right)
  const scored = isDrill ? answerWords(s.answer) : words;
  let si = 0, acc = '';
  const owner = words.map(w => {
    const idx = si;
    acc += normWord(w);
    if (acc === normWord(scored[si] || '')) { si++; acc = ''; }
    return idx;
  });
  maskEl.innerHTML = words.map((w, k) => {
    const r = owner[k];
    if (st.okRefs.has(r)) return `<span class="m-ok">${escHtml(w)}</span>`;
    if (showAnswer && r === st.firstWrong) return `<span class="m-show">${_markDiff(w, st.typedFor)}</span>`;
    return `<span class="m-hide">${w.replace(/[A-Za-z0-9]/g, '*')}</span>`;
  }).join(' ');
}

// The revealed word with the first letter the student got wrong underlined.
function _markDiff(word, typed) {
  const a = word, b = (typed || '').toLowerCase();
  let k = 0;
  while (k < a.length && k < b.length && a[k].toLowerCase() === b[k]) k++;
  if (!typed || k >= a.length) return escHtml(a);
  return escHtml(a.slice(0, k)) + `<u class="m-err">${escHtml(a[k])}</u>` + escHtml(a.slice(k + 1));
}

function _dictShake(el) {
  el.classList.remove('dict-shake');
  void el.offsetWidth;
  el.classList.add('dict-shake');
  setTimeout(() => el.classList.remove('dict-shake'), 450);
}

/* ══════════════ KEYBOARD ══════════════ */
document.getElementById('dict-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!document.getElementById('dict-check-btn').disabled) dictCheck();
    else if (dictSection && dictDone.has(dictIndex)) { const n = _nextUndone(); if (n >= 0) dictGoTo(n); }
  }
});

// Ctrl pressed and released on its own = replay the sentence (Ctrl+C etc.
// still work: any other key in between cancels it).
let _ctrlAlone = false;
document.addEventListener('keydown', e => { _ctrlAlone = e.key === 'Control' && !e.repeat ? true : (e.key === 'Control' ? _ctrlAlone : false); });
document.addEventListener('keyup', e => {
  if (e.key === 'Control' && _ctrlAlone && dictSection && document.getElementById('screen-practice').classList.contains('active')) dictRestart();
  _ctrlAlone = false;
});

// Anti-cheat: typed from what was heard, never pasted in.
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
  const promoBanner = document.getElementById('premium-promo-banner');
  if (promoBanner) promoBanner.style.display = (window.AuthService && !window.AuthService.hasPremiumAccess()) ? 'flex' : 'none';
  dictLoadPrefs();
  dictTipIdx = Math.floor(Math.random() * DICT_TIPS.length);
  document.getElementById('dict-tip-text').textContent = DICT_TIPS[dictTipIdx];

  // Clean path /dictation/:sectionId, else ?sectionId= / ?drill=
  const cleanSection = window.RouteParams ? window.RouteParams.match([
    { pattern: /^\/dictation\/([^/?#]+)$/, param: 'sectionId' },
  ]) : null;
  const params = new URLSearchParams(location.search);
  const sectionId = (cleanSection && cleanSection.sectionId) || params.get('sectionId');
  const drill = params.get('drill');
  loadDictList().then(() => {
    if (drill) openDictDrill(drill);
    else if (sectionId) openDictSection(sectionId, !!cleanSection);
  });
});
