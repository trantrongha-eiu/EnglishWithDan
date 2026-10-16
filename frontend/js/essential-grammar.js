// essential-grammar.html — Essential Grammar
const API = (window.AuthService && window.AuthService.API && window.AuthService.API.replace(/\/api\/?$/, '')) || 'https://englishwithdan.onrender.com';
const LAST_LESSON_KEY = 'eg_last_lesson';
const COLLAPSED_KEY = 'eg_collapsed_categories';

const SCORE_KEY = 'eg_lesson_scores';
const COMPLETE_THRESHOLD = 80;
const EX_TYPE_LABELS = {
  multiple_choice: 'Trắc nghiệm',
  fill_blank: 'Điền từ',
  error_correction: 'Sửa lỗi',
  translation_vn_en: 'Dịch Việt → Anh',
  translation_en_vn: 'Dịch Anh → Việt',
  sentence_transformation: 'Biến đổi câu',
  rewrite: 'Viết lại câu',
  find_mistake: 'Tìm lỗi sai',
  mini_dialogue: 'Hội thoại ngắn'
};

let allLessons = [];
let categories = [];
let currentKey = null;
let searchTerm = '';
// Guarded — a malformed value here (partial write from a storage-quota
// error, manual edit, future format change) previously threw synchronously
// at script-parse time, aborting the whole <script> block before even
// initEssentialGrammar was defined and leaving the page stuck on its
// initial "Đang tải..." placeholder forever with no error shown.
function _safeParse(json, fallback) {
  if (json == null) return fallback;
  try { return JSON.parse(json); } catch { return fallback; }
}
let collapsed = new Set(_safeParse(localStorage.getItem(COLLAPSED_KEY), []));
let scores = _safeParse(localStorage.getItem(SCORE_KEY), {});
let quizState = null; // { total, answered, correct, lessonKey } — reset per lesson render

// playOk/playWrong/toggleWpSound moved to js/shared/sound-effects.js
// (single source of truth — student UI audit Nhóm 2, 2026-07-25). The
// on/off toggle button itself now lives in the global nav (js/nav.js),
// which syncs its own icon — initUser() no longer has anything to do.

function getScore(key) { return scores[key] || null; }
function isCompleted(key) { const s = scores[key]; return !!(s && s.completed); }

function saveScore(key, score) {
  const prev = scores[key] || { bestScore: 0, latestScore: 0, completed: false, completedAt: null };
  const bestScore = Math.max(prev.bestScore, score);
  const completed = bestScore >= COMPLETE_THRESHOLD;
  const completedAt = (completed && !prev.completed) ? new Date().toISOString() : prev.completedAt;
  scores[key] = { bestScore, latestScore: score, completed, completedAt };
  localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
  updateHeaderProgressBadge();
}

function completedCount() {
  return allLessons.filter(l => isCompleted(keyOf(l))).length;
}

function updateHeaderProgressBadge() {
  const el = document.getElementById('header-eg-progress');
  if (el) el.textContent = completedCount() + '/' + allLessons.length;
}

function heroStatusHtml() {
  const score = getScore(currentKey);
  let html = '';
  if (score && score.completed) html += '<span class="wp-status-badge wp-status-on-gradient wp-status-done"><i class="fas fa-check-circle"></i> Đã hoàn thành</span>';
  if (score) html += '<span class="wp-status-badge wp-status-on-gradient"><i class="fas fa-star"></i> Điểm cao nhất: ' + score.bestScore + '%</span>';
  html += '<span class="wp-status-badge wp-status-on-gradient"><i class="fas fa-chart-line"></i> Tiến trình: ' + completedCount() + '/' + allLessons.length + ' bài (' + progressPct() + '%)</span>';
  return html;
}

function keyOf(l) { return l.category + '||' + l.lessonKey; }

// lessonKey is a unique slug (e.g. "present-simple") across every category
// in the seed data — see backend/scripts/essentialGrammarData/*.js — so it
// doubles as a clean, shareable URL identifier on its own without needing
// the category too.
function lessonKeyFromUrl() {
  // Clean path /essential-grammar/:lessonKey (a _redirects 200 rewrite to
  // this same file) — same additive pattern as reading-v2.js/listening.html's
  // RouteParams.match(): checked first, falls back to ?lesson= unchanged.
  var clean = window.RouteParams ? window.RouteParams.match([
    { pattern: /^\/essential-grammar\/([^/?#]+)$/, param: 'lessonKey' }
  ]) : null;
  return (clean && clean.lessonKey) || new URLSearchParams(location.search).get('lesson');
}
// True when the page was reached via the clean /essential-grammar/:lessonKey
// path rather than a plain ?lesson= query string — checked so the initial-
// load URL normalization below doesn't immediately clobber a clean, shareable
// URL back into its query-string form (same fromCleanPath idiom reading-v2.js
// uses for /reading/test/:id).
function isFromCleanPath() {
  return !!(window.RouteParams && window.RouteParams.match([
    { pattern: /^\/essential-grammar\/([^/?#]+)$/, param: 'lessonKey' }
  ]));
}
function lessonUrl(lesson) {
  return 'essential-grammar.html?lesson=' + encodeURIComponent(lesson.lessonKey);
}

async function initEssentialGrammar() {
  try {
    // Endpoint is auth-gated now (audit 2026-09-10). The page-load guard in
    // js/auth.js already bounced any logged-out visitor to /login.html
    // before this runs, so a token is normally present — but handle a 401
    // (stale/cleared token mid-session) by sending them to log in again
    // rather than showing the generic error box.
    const res = await fetch(API + '/api/essential-grammar/lessons', {
      headers: (window.AuthService && window.AuthService.authHeader()) || {}
    });
    if (res.status === 401) {
      if (window.AuthService) {
        window.location.href = window.AuthService.buildLoginUrl(
          location.pathname + location.search + location.hash);
      }
      return;
    }
    const data = await res.json();
    if (!data.success) throw new Error('load failed');
    allLessons = data.lessons || [];
    if (!allLessons.length) {
      document.getElementById('eg-main-content').innerHTML =
        '<div class="eg-loading"><div class="eg-loading-icon">📭</div>Chưa có bài học nào.</div>';
      return;
    }
    categories = [...new Set(allLessons.map(l => l.category))];

    // A deep link (?lesson=...) takes priority over the last-viewed lesson
    // saved in localStorage — a shared/bookmarked URL should always open
    // that exact lesson, not silently redirect to whatever was last open
    // on this device.
    const urlKey = lessonKeyFromUrl();
    const urlLesson = urlKey && allLessons.find(l => l.lessonKey === urlKey);
    // A ?lesson= key that matches nothing (assigned lesson was since deleted/
    // renamed) must say so, not silently open a different lesson as if it
    // were the one assigned — a student ticking "done" on the wrong lesson
    // with no warning is exactly the failure mode this deep link exists to
    // prevent (see dashboard-homework.js's grammar case).
    if (urlKey && !urlLesson && typeof showToast === 'function') {
      showToast('Bài được giao không còn tồn tại — đang mở bài học khác.', 'error', 6000);
    }
    const savedKey = localStorage.getItem(LAST_LESSON_KEY);
    const savedLesson = savedKey && allLessons.find(l => keyOf(l) === savedKey);
    const initialLesson = urlLesson || savedLesson || allLessons[0] || null;
    currentKey = initialLesson ? keyOf(initialLesson) : null;

    // Normalize the URL for this initial render (adds ?lesson=... if it
    // was missing/stale) without adding a history entry — same idiom as
    // dashboard.js's replaceState-on-load — so popstate has a well-formed
    // starting point to compare against. Skipped when the clean
    // /essential-grammar/:lessonKey path already resolved to exactly the
    // lesson being shown — the whole point of that URL is that it keeps
    // showing the clean path forever, so this must not overwrite it.
    if (initialLesson && !(isFromCleanPath() && initialLesson === urlLesson)) {
      history.replaceState({ lessonKey: initialLesson.lessonKey }, '', lessonUrl(initialLesson));
    }

    renderSidebarShell();
    if (currentKey) selectLesson(currentKey, true, false);
    updateHeaderProgressBadge();

    // Browser back/forward between lessons — the URL bar has already
    // moved by the time this fires, so just sync the UI to it, no further
    // history manipulation.
    window.addEventListener('popstate', () => {
      const key = lessonKeyFromUrl();
      const lesson = key && allLessons.find(l => l.lessonKey === key);
      if (lesson) selectLesson(keyOf(lesson), true, false);
    });
  } catch (err) {
    document.getElementById('eg-main-content').innerHTML =
      '<div class="eg-loading"><div class="eg-loading-icon">⚠️</div>Không tải được nội dung. Vui lòng thử lại sau.</div>';
    if (typeof showToast === 'function') showToast('Không tải được bài học', 'error');
  }
}

// Sidebar is split into a static shell (search input + progress badge —
// rendered once) and a dynamic list (re-rendered on search/collapse/score
// change). Re-rendering the search <input> itself via innerHTML on every
// keystroke destroys and recreates the DOM node, which drops focus after
// the first character typed — so the list must update independently of it.
function renderSidebarShell() {
  const shellHtml = '<div class="eg-sidebar-top">'
    + '<div class="eg-search-box"><i class="fas fa-search eg-search-icon"></i>'
    + '<input class="eg-search-input" id="eg-search-input" placeholder="Tìm bài học..." value="' + escAttr(searchTerm) + '" oninput="onSearchInput(this.value)"/></div>'
    + '<div class="eg-progress-badge"><div class="eg-progress-track"><div class="eg-progress-fill"></div></div>'
    + '<span class="eg-progress-text"></span></div>'
    + '</div>'
    + '<div class="eg-cat-list"></div>';
  document.getElementById('eg-sidebar').innerHTML = shellHtml;
  document.getElementById('eg-sidebar-mobile').innerHTML = shellHtml;
  renderSidebar();
}

function renderSidebar() {
  const term = searchTerm.trim().toLowerCase();
  let html = '';
  let anyMatch = false;
  categories.forEach(cat => {
    const lessons = allLessons
      .filter(l => l.category === cat)
      .filter(l => !term || l.title.toLowerCase().includes(term) || cat.toLowerCase().includes(term))
      .sort((a, b) => a.orderIndex - b.orderIndex);
    if (!lessons.length) return;
    anyMatch = true;
    const isCollapsed = collapsed.has(cat) && !term;
    html += '<div class="eg-cat-group' + (isCollapsed ? ' collapsed' : '') + '" data-cat="' + escAttr(cat) + '">'
      + '<button class="eg-cat-header" onclick="toggleCategory(' + JSON.stringify(cat).replace(/"/g, '&quot;') + ')">'
      + '<span>' + escHtml(cat) + '</span>'
      + '<span class="eg-cat-count">' + lessons.length + '</span>'
      + '<i class="fas fa-chevron-down eg-cat-chevron"></i>'
      + '</button>'
      + '<div class="eg-lesson-list">'
      + lessons.map(l => {
          const k = keyOf(l);
          const active = k === currentKey ? ' active' : '';
          const done = isCompleted(k) ? '<i class="fas fa-check-circle wp-item-done-icon" title="Đã hoàn thành (≥80%)"></i>' : '';
          return '<button class="eg-lesson-item' + active + '" onclick="selectLesson(' + JSON.stringify(k).replace(/"/g, '&quot;') + ')">'
            + '<span class="eg-lesson-icon">' + (l.icon || '📘') + '</span>'
            + '<span class="eg-lesson-title">' + escHtml(l.title) + '</span>' + done + '</button>';
        }).join('')
      + '</div></div>';
  });
  if (!anyMatch) html += '<div class="eg-no-results">Không tìm thấy bài học phù hợp.</div>';

  document.querySelectorAll('.eg-cat-list').forEach(el => { el.innerHTML = html; });
  document.querySelectorAll('.eg-progress-fill').forEach(el => { el.style.width = progressPct() + '%'; });
  document.querySelectorAll('.eg-progress-text').forEach(el => { el.textContent = completedCount() + '/' + allLessons.length; });
}

function progressPct() {
  if (!allLessons.length) return 0;
  return Math.round((completedCount() / allLessons.length) * 100);
}

function onSearchInput(val) {
  searchTerm = val;
  renderSidebar();
}

function toggleCategory(cat) {
  if (collapsed.has(cat)) collapsed.delete(cat); else collapsed.add(cat);
  localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...collapsed]));
  renderSidebar();
}

let _renderedLessonKey = null; // last lesson actually rendered — distinct from currentKey, which is set the moment a lesson is picked (before its blocks may have finished loading)
let _loadSeq = 0;              // bumped on every selectLesson; a stale in-flight block fetch checks this before touching the DOM

// The list endpoint ships metadata only now — a lesson's `blocks` (which
// carry the client-graded quiz/practice answer keys) are fetched one
// lesson at a time, the first time it's opened, then cached on the object.
async function ensureBlocks(lesson) {
  if (Array.isArray(lesson.blocks)) return true;
  const res = await fetch(API + '/api/essential-grammar/lessons/' + lesson._id, {
    headers: (window.AuthService && window.AuthService.authHeader()) || {}
  });
  if (res.status === 401) {
    if (window.AuthService) window.location.href = window.AuthService.buildLoginUrl(location.pathname + location.search + location.hash);
    return false;
  }
  const data = await res.json();
  if (!data.success || !data.lesson) throw new Error('load failed');
  lesson.blocks = data.lesson.blocks || [];
  return true;
}

async function selectLesson(key, skipScroll, pushHistory = true) {
  // Re-clicking the already-open lesson (easy to do — its sidebar entry
  // stays a normal enabled button while .active) would otherwise fully
  // re-render it via renderLessonContent(), silently discarding any
  // in-progress mini-quiz answers. Guard also checks currentKey so that if
  // another lesson's block fetch is mid-flight (currentKey moved on but
  // _renderedLessonKey hasn't), clicking back falls through and re-renders
  // rather than leaving the stale "Đang tải..." spinner up.
  if (key === _renderedLessonKey && key === currentKey) { closeEgSheet(); if (!skipScroll) window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  const lesson = allLessons.find(l => keyOf(l) === key);
  if (!lesson) return;
  currentKey = key;
  const seq = ++_loadSeq;
  localStorage.setItem(LAST_LESSON_KEY, key);
  // pushHistory is false for the initial page render and for popstate
  // restores (initEssentialGrammar already set/synced the URL for those);
  // every real user navigation — sidebar click, prev/next footer button —
  // uses the default true and gets its own history entry.
  if (pushHistory) history.pushState({ lessonKey: lesson.lessonKey }, '', lessonUrl(lesson));
  renderSidebar();
  closeEgSheet();
  if (!skipScroll) window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!Array.isArray(lesson.blocks)) {
    document.getElementById('eg-main-content').innerHTML =
      '<div class="eg-loading"><div class="eg-loading-icon"><i class="fas fa-spinner fa-spin"></i></div>Đang tải bài học...</div>';
  }
  try {
    const ok = await ensureBlocks(lesson);
    if (!ok || seq !== _loadSeq) return; // 401 redirect, or a newer selection superseded this one
  } catch (err) {
    if (seq !== _loadSeq) return;
    document.getElementById('eg-main-content').innerHTML =
      '<div class="eg-loading"><div class="eg-loading-icon">⚠️</div>Không tải được bài học này. Vui lòng thử lại.</div>';
    if (typeof showToast === 'function') showToast('Không tải được bài học', 'error');
    return;
  }
  _renderedLessonKey = key;
  renderLessonContent(lesson);
}

function renderLessonContent(lesson) {
  const idx = allLessons.findIndex(l => keyOf(l) === currentKey);
  const prev = idx > 0 ? allLessons[idx - 1] : null;
  const next = idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

  // Lesson-wide gradeable total — every 'quiz' block's questions PLUS every
  // 'multiple_choice' item inside every 'practice_exercises' block, so one
  // lesson-level attempt (not per-block) rolls up everything checkable in
  // the lesson. Non-MC exercise types (fill_blank, translation_*, etc.) are
  // self-check only and never contribute here.
  const quizTotal = lesson.blocks
    .filter(b => b.type === 'quiz')
    .reduce((n, b) => n + (b.data.questions || []).length, 0);
  const exerciseMcTotal = lesson.blocks
    .filter(b => b.type === 'practice_exercises')
    .reduce((n, b) => n + (b.data.exercises || []).filter(ex => ex.type === 'multiple_choice').length, 0);
  const gradeableTotal = quizTotal + exerciseMcTotal;
  quizState = gradeableTotal > 0
    ? { total: gradeableTotal, answered: 0, correct: 0, wrongTexts: [], lessonId: lesson._id, lessonKey: currentKey, startTime: Date.now() }
    : null;

  let html = '<div class="eg-hero">'
    + '<div class="eg-hero-cat">' + escHtml(lesson.category) + '</div>'
    + '<h1 class="eg-hero-title">' + (lesson.icon || '📘') + ' ' + escHtml(lesson.title) + '</h1>'
    + '<div class="wp-status-row" id="eg-hero-status">' + heroStatusHtml() + '</div>'
    + '</div>';
  html += '<div class="eg-content">' + lesson.blocks.map(renderBlock).join('') + '</div>';
  // Lesson-level "grade now" affordance — so a student who answered most
  // (but not every) gradeable item isn't stuck with no score, and there's
  // one clear place to finish regardless of whether the lesson has a <quiz>
  // block. Hidden until they've answered at least one; auto-hidden once
  // finalizeQuiz() runs (answering the last item still auto-finalizes).
  if (gradeableTotal > 0) {
    html += '<div class="eg-grade-footer" id="eg-grade-footer" style="display:none;text-align:center;margin:8px 0 4px">'
      + '<button type="button" id="eg-grade-now-btn" onclick="finalizeQuiz()" '
      + 'style="background:var(--brand,#e53935);color:#fff;border:none;border-radius:10px;padding:10px 22px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">'
      + '<i class="fas fa-flag-checkered"></i> <span id="eg-grade-now-label">Chấm điểm ngay</span></button></div>';
  }
  html += '<div class="eg-nav-footer">'
    + navFooterBtn(prev, 'prev')
    + navFooterBtn(next, 'next')
    + '</div>';

  document.getElementById('eg-main-content').innerHTML = html;
  // Dictionary lookup stays ON throughout — this is a learning page, and
  // blocking it on the whole lesson (teaching blocks included) until every
  // quiz item was answered was too aggressive. The tiny "translate the
  // question first" hint risk on grammar multiple-choice is acceptable here
  // (the answer + explanation reveal on click anyway).
  if (typeof setupDictionaryDouble === 'function') {
    setupDictionaryDouble('eg-main-content', 'essential-grammar');
  }
}

// Refreshes the lesson-level grade affordance after every answered item.
function _updateEgGradeFooter() {
  if (!quizState) return;
  const footer = document.getElementById('eg-grade-footer');
  const label  = document.getElementById('eg-grade-now-label');
  if (!footer) return;
  const left = quizState.total - quizState.answered;
  if (quizState.answered >= 1 && left > 0) {
    footer.style.display = 'block';
    if (label) label.textContent = `Chấm điểm ngay (đã làm ${quizState.answered}/${quizState.total} câu, ${left} câu bỏ trống sẽ tính sai)`;
  } else {
    footer.style.display = 'none';
  }
}

function navFooterBtn(lesson, dir) {
  const isPrev = dir === 'prev';
  if (!lesson) return '<span></span>';
  const key = keyOf(lesson);
  const icon = isPrev ? '<i class="fas fa-arrow-left"></i>' : '<i class="fas fa-arrow-right"></i>';
  const inner = '<span class="eg-nav-btn-label"><span class="eg-nav-btn-sub">' + (isPrev ? 'Bài trước' : 'Bài tiếp theo') + '</span><br>' + escHtml(lesson.title) + '</span>';
  const order = isPrev ? icon + inner : inner + icon;
  return '<button class="eg-nav-btn" onclick="selectLesson(' + JSON.stringify(key).replace(/"/g, '&quot;') + ')" style="' + (isPrev ? '' : 'margin-left:auto;text-align:right;justify-content:flex-end') + '">' + order + '</button>';
}

function renderBlock(block) {
  switch (block.type) {
    case 'overview': return renderOverviewBlock(block.data);
    case 'formula': return renderFormulaBlock(block.data);
    case 'usage': return renderUsageBlock(block.data);
    case 'signal_words': return renderSignalWordsBlock(block.data);
    case 'image': return renderImageBlock(block.data);
    case 'examples': return renderExamplesBlock(block.data);
    case 'common_mistakes': return renderMistakesBlock(block.data);
    case 'ielts_tips': return renderTipsBlock(block.data);
    case 'comparison': return renderComparisonBlock(block.data);
    case 'practice_exercises': return renderPracticeExercisesBlock(block.data);
    case 'quiz': return renderQuizBlock(block.data);
    case 'summary': return renderSummaryBlock(block.data);
    default: return '';
  }
}

function renderOverviewBlock(data) {
  return '<div class="eg-block"><div class="eg-block-label"><i class="fas fa-book-open"></i> Tổng quan</div>'
    + '<div class="eg-overview-text">' + escHtml(data.text) + '</div></div>';
}

function renderFormulaBlock(data) {
  const cards = (data.forms || []).map(f =>
    '<div class="eg-formula-card">'
    + '<div class="eg-formula-label">' + escHtml(f.label) + '</div>'
    + '<div class="eg-formula-structure">' + escHtml(f.structure) + '</div>'
    + '<div class="eg-formula-example">' + escHtml(f.example) + '</div>'
    + '</div>'
  ).join('');
  return '<div class="eg-block"><div class="eg-block-label"><i class="fas fa-calculator"></i> Công thức</div>' + cards + '</div>';
}

function renderUsageBlock(data) {
  const items = (data.points || []).map(p =>
    '<div class="eg-usage-item"><span class="eg-usage-bullet"><i class="fas fa-check"></i></span>'
    + '<div><div class="eg-usage-title">' + escHtml(p.title) + '</div>'
    + '<div class="eg-usage-desc">' + escHtml(p.description) + '</div></div></div>'
  ).join('');
  return '<div class="eg-block"><div class="eg-block-label"><i class="fas fa-lightbulb"></i> Cách dùng</div>' + items + '</div>';
}

function renderSignalWordsBlock(data) {
  const chips = (data.words || []).map(w => '<span class="eg-chip">' + escHtml(w) + '</span>').join('');
  return '<div class="eg-block"><div class="eg-block-label"><i class="fas fa-tags"></i> Dấu hiệu nhận biết</div>'
    + '<div class="eg-chip-wrap">' + chips + '</div></div>';
}

function renderImageBlock(data) {
  const caption = data.caption
    ? '<div class="eg-image-caption">' + escHtml(data.caption) + '</div>' : '';
  return '<div class="eg-block"><div class="eg-block-label"><i class="fas fa-image"></i> Hình minh họa</div>'
    + '<div class="eg-image-wrap">'
    + '<img class="eg-image" src="' + escHtml(data.src) + '" alt="' + escHtml(data.caption || '') + '" loading="lazy">'
    + caption
    + '</div></div>';
}

function renderExamplesBlock(data) {
  const items = (data.items || []).map(ex =>
    '<div class="eg-example-item"><div class="eg-example-en">' + escHtml(ex.en) + '</div>'
    + '<div class="eg-example-vi">' + escHtml(ex.vi) + '</div></div>'
  ).join('');
  return '<div class="eg-block"><div class="eg-block-label"><i class="fas fa-quote-left"></i> Ví dụ</div>' + items + '</div>';
}

function renderMistakesBlock(data) {
  const items = (data.items || []).map(m =>
    '<div class="eg-mistake-item">'
    + '<div class="eg-mistake-wrong"><i class="fas fa-times"></i> ' + escHtml(m.wrong) + '</div>'
    + '<div class="eg-mistake-right"><i class="fas fa-check"></i> ' + escHtml(m.right) + '</div>'
    + '<div class="eg-mistake-note">' + escHtml(m.note) + '</div>'
    + '</div>'
  ).join('');
  return '<div class="eg-block"><div class="eg-block-label"><i class="fas fa-exclamation-triangle"></i> Lỗi thường gặp</div>' + items + '</div>';
}

function renderTipsBlock(data) {
  const items = (data.tips || []).map(t =>
    '<div class="eg-tip-item"><i class="fas fa-star" style="color:#f59e0b;margin-top:2px"></i><span>' + escHtml(t) + '</span></div>'
  ).join('');
  return '<div class="eg-block"><div class="eg-block-label"><i class="fas fa-graduation-cap"></i> Mẹo cho IELTS</div>' + items + '</div>';
}

function renderComparisonBlock(data) {
  const headers = (data.headers || []).map(h => '<th>' + escHtml(h) + '</th>').join('');
  const rows = (data.rows || []).map(row => '<tr>' + row.map(c => '<td>' + escHtml(c) + '</td>').join('') + '</tr>').join('');
  return '<div class="eg-block"><div class="eg-block-label"><i class="fas fa-not-equal"></i> ' + escHtml(data.title || 'So sánh') + '</div>'
    + '<div class="eg-cmp-wrap"><table class="eg-cmp-table"><thead><tr>' + headers + '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
}

function renderPracticeExercisesBlock(data) {
  const exercises = data.exercises || [];
  const items = exercises.map((ex, i) => renderExerciseItem(ex, i)).join('');
  return '<div class="eg-block"><div class="eg-block-label"><i class="fas fa-dumbbell"></i> Luyện tập (' + exercises.length + ' bài)</div>'
    + '<div class="eg-ex-list">' + items + '</div></div>';
}

function renderExerciseItem(ex, i) {
  const label = EX_TYPE_LABELS[ex.type] || ex.type;
  const questionHtml = escHtml(ex.question).replace(/\n/g, '<br>');
  let body;
  if (ex.type === 'multiple_choice') {
    const options = (ex.options || []).map((opt, oi) =>
      '<button class="eg-quiz-option" data-question="' + escAttr(ex.question) + '" onclick="checkExerciseMC(this, ' + oi + ', ' + ex.answerIndex + ', ' + i + ')">' + escHtml(opt) + '</button>'
    ).join('');
    body = '<div class="eg-quiz-options">' + options + '</div>'
      + '<div class="eg-quiz-explanation" id="eg-ex-exp-' + i + '"><i class="fas fa-info-circle"></i> ' + escHtml(ex.explanation) + '</div>';
  } else {
    const isLong = ex.type === 'translation_vn_en' || ex.type === 'translation_en_vn' || ex.type === 'mini_dialogue';
    const inputTag = isLong
      ? '<textarea class="eg-ex-input" id="eg-ex-input-' + i + '" rows="2" placeholder="Nhập câu trả lời của bạn..."></textarea>'
      : '<input class="eg-ex-input" id="eg-ex-input-' + i + '" type="text" placeholder="Nhập câu trả lời của bạn..."/>';
    body = inputTag
      + '<button class="eg-ex-reveal-btn" data-idx="' + i + '" data-answer="' + escAttr(ex.answer) + '" data-explanation="' + escAttr(ex.explanation) + '" onclick="revealExerciseAnswer(this)">Xem đáp án</button>'
      + '<div class="eg-ex-answer-panel" id="eg-ex-answer-' + i + '"></div>';
  }
  return '<div class="eg-ex-item">'
    + '<div class="eg-ex-badge">' + escHtml(label) + '</div>'
    + '<div class="eg-ex-question">' + (i + 1) + '. ' + questionHtml + '</div>'
    + body
    + '</div>';
}

function checkExerciseMC(btn, oi, answerIndex, i) {
  const group = btn.closest('.eg-ex-item');
  if (group.dataset.answered === '1') return;
  group.dataset.answered = '1';
  const options = group.querySelectorAll('.eg-quiz-option');
  options.forEach((o, idx) => {
    o.disabled = true;
    if (idx === answerIndex) o.classList.add('eg-correct');
    else if (idx === oi) o.classList.add('eg-wrong');
  });
  const exp = document.getElementById('eg-ex-exp-' + i);
  if (exp) exp.classList.add('vis');
  if (oi === answerIndex) playOk(); else playWrong();

  if (!quizState) return;
  quizState.answered++;
  if (oi === answerIndex) quizState.correct++;
  else quizState.wrongTexts.push(btn.dataset.question || '');
  _updateEgGradeFooter();
  if (quizState.answered >= quizState.total) finalizeQuiz();
}

function revealExerciseAnswer(btn) {
  const i = btn.dataset.idx;
  const answer = btn.dataset.answer;
  const explanation = btn.dataset.explanation;
  const input = document.getElementById('eg-ex-input-' + i);
  const userAnswer = input ? input.value.trim() : '';
  const panel = document.getElementById('eg-ex-answer-' + i);
  if (panel) {
    panel.innerHTML = (userAnswer ? '<div class="eg-ex-user-answer"><strong>Bạn trả lời:</strong> ' + escHtml(userAnswer) + '</div>' : '')
      + '<div class="eg-ex-model-answer"><strong>Đáp án gợi ý:</strong> ' + escHtml(answer) + '</div>'
      + '<div class="eg-ex-explanation"><i class="fas fa-info-circle"></i> ' + escHtml(explanation) + '</div>';
    panel.classList.add('vis');
  }
  btn.disabled = true;
  if (input) input.disabled = true;
}

function renderQuizBlock(data) {
  const total = (data.questions || []).length;
  const questions = (data.questions || []).map((q, qi) => {
    const options = (q.options || []).map((opt, oi) =>
      '<button class="eg-quiz-option" data-question="' + escAttr(q.question) + '" onclick="checkQuizAnswer(this, ' + qi + ', ' + oi + ', ' + q.answerIndex + ')">' + escHtml(opt) + '</button>'
    ).join('');
    return '<div class="eg-quiz-q" data-qi="' + qi + '">'
      + '<div class="eg-quiz-question">' + (qi + 1) + '. ' + escHtml(q.question) + '</div>'
      + '<div class="eg-quiz-options">' + options + '</div>'
      + '<div class="eg-quiz-explanation" id="eg-quiz-exp-' + qi + '"><i class="fas fa-info-circle"></i> ' + escHtml(q.explanation) + '</div>'
      + '</div>';
  }).join('');
  // Counter tracks the LESSON-wide gradeable total (this block's questions +
  // any multiple-choice practice_exercises), matching what actually
  // finalizes the lesson — showing the block-only count made "3/3 answered,
  // nothing happened" look broken on a lesson that also had exercises.
  const shown = quizState ? quizState.total : total;
  return '<div class="eg-block"><div class="eg-block-label"><i class="fas fa-puzzle-piece"></i> Mini Quiz</div>'
    + '<div class="eg-quiz-progress" id="eg-quiz-progress">Đã trả lời: 0/' + shown + ' câu (toàn bài)</div>'
    + questions
    + '<div class="eg-quiz-result" id="eg-quiz-result"></div>'
    + '</div>';
}

function checkQuizAnswer(btn, qi, oi, answerIndex) {
  const group = btn.closest('.eg-quiz-q');
  if (group.dataset.answered === '1') return;
  group.dataset.answered = '1';
  const options = group.querySelectorAll('.eg-quiz-option');
  options.forEach((o, i) => {
    o.disabled = true;
    if (i === answerIndex) o.classList.add('eg-correct');
    else if (i === oi) o.classList.add('eg-wrong');
  });
  const exp = document.getElementById('eg-quiz-exp-' + qi);
  if (exp) exp.classList.add('vis');
  if (oi === answerIndex) playOk(); else playWrong();

  if (!quizState) return;
  quizState.answered++;
  if (oi === answerIndex) quizState.correct++;
  else quizState.wrongTexts.push(btn.dataset.question || '');
  const progressEl = document.getElementById('eg-quiz-progress');
  if (progressEl) progressEl.textContent = 'Đã trả lời: ' + quizState.answered + '/' + quizState.total + ' câu (toàn bài)';
  _updateEgGradeFooter();
  if (quizState.answered >= quizState.total) finalizeQuiz();
}

function finalizeQuiz() {
  if (!quizState || !quizState.lessonKey) return;
  const gf = document.getElementById('eg-grade-footer');
  if (gf) gf.style.display = 'none';
  // Unanswered items count as wrong (score over the lesson-wide total) —
  // matches the auto-finalize path and the "câu bỏ trống sẽ tính sai" note.
  const score = quizState.total > 0 ? Math.round((quizState.correct / quizState.total) * 100) : 0;
  saveScore(quizState.lessonKey, score);
  const passed = score >= COMPLETE_THRESHOLD;
  const summary = 'Bạn đạt ' + score + '% (' + quizState.correct + '/' + quizState.total + ' câu đúng).'
    + (passed ? ' Bài học đã được đánh dấu hoàn thành!' : ' Cần đạt từ 80% để hoàn thành bài học — hãy thử lại!');
  const result = document.getElementById('eg-quiz-result');
  if (result) {
    result.className = 'eg-quiz-result vis ' + (passed ? 'eg-qr-good' : 'eg-qr-bad');
    // Lulu reads the summary out (js/shared/playful.js); icon + text without it.
    result.innerHTML = window.Mascot && window.Mascot.reactHtml
      ? window.Mascot.reactHtml({ pct: score, text: summary, size: 64 })
      : (passed ? '<i class="fas fa-trophy"></i> ' : '<i class="fas fa-redo"></i> ') + summary;
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else if (typeof showToast === 'function') {
    // Lessons that grade only through practice_exercises (no <quiz> block)
    // have no #eg-quiz-result node — the completion feedback would otherwise
    // just be a quiet badge change far up the page.
    showToast((passed ? '🏆 ' : '🔁 ') + summary, passed ? 'success' : 'warn', 5000);
  }
  const heroStatus = document.getElementById('eg-hero-status');
  if (heroStatus) heroStatus.innerHTML = heroStatusHtml();
  renderSidebar();

  // Best-effort sync to the backend so admin gets visibility into
  // attempts/scores (audit fix — previously 100% localStorage-only, zero
  // backend footprint). Intentionally does not block/replace the
  // localStorage-driven UX above: a logged-out visitor still gets the full
  // local experience, just with nothing to sync.
  if (quizState.lessonId && window.AuthService && window.AuthService.getToken()) {
    const timeSpent = Math.max(1, Math.round((Date.now() - quizState.startTime) / 1000));
    fetch(API + '/api/essential-grammar/' + quizState.lessonId + '/attempt', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, window.AuthService.authHeader()),
      body: JSON.stringify({
        correctCount: quizState.correct,
        totalCount: quizState.total,
        timeSpent,
        wrongQuestions: quizState.wrongTexts,
      }),
    }).catch(() => {});
  }
}

function renderSummaryBlock(data) {
  return '<div class="eg-block"><div class="eg-block-label"><i class="fas fa-flag-checkered"></i> Tóm tắt</div>'
    + '<div class="eg-summary-box">' + escHtml(data.text) + '</div></div>';
}

function openEgSheet() {
  document.getElementById('eg-mob-sheet').classList.add('open');
  document.getElementById('eg-mob-backdrop').classList.add('visible');
  document.getElementById('eg-mob-fab').classList.add('open');
}
function closeEgSheet() {
  document.getElementById('eg-mob-sheet').classList.remove('open');
  document.getElementById('eg-mob-backdrop').classList.remove('visible');
  document.getElementById('eg-mob-fab').classList.remove('open');
}

initEssentialGrammar();
