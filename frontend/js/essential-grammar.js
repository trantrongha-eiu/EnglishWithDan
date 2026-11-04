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

  // .pf-hero = the coloured Reading/Listening-style banner (css/playful.css).
  let html = '<div class="eg-hero pf-hero pf-hero-purple" data-mascot="think"><div class="pf-hero-body">'
    + '<div class="eg-hero-cat"><span class="pf-tag">' + escHtml(lesson.category) + '</span></div>'
    + '<h1 class="eg-hero-title">' + (lesson.icon || '📘') + ' ' + escHtml(lesson.title) + '</h1>'
    + '<div class="wp-status-row" id="eg-hero-status">' + heroStatusHtml() + '</div>'
    + '</div></div>';
  _egDrills = {}; _egDrillSeq = 0;
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
    case 'video': return renderVideoBlock(block.data);
    case 'verb_forms': return renderVerbFormsBlock(block.data);
    case 'conjugation_drill': return renderConjugationBlock(block.data);
    case 'translation_drill': return renderTranslationBlock(block.data);
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

// ══════════════════════════════════════════════════════
// Tenses extras — teaching video, V0→V2/V3 drill, "chia động từ" drill and
// "luyện dịch câu". Data: backend/scripts/essentialGrammarData/tenseExtras.js.
// These drills show their own score inside the block; they do not change
// the lesson's completion score (quiz + multiple-choice exercises).
// Buttons carry data-eg-act and are handled by one delegated listener
// (_egBindDrillEvents) instead of inline onclick strings.
// ══════════════════════════════════════════════════════

const YT_ID_RE = /^[\w-]{11}$/;
let _egDrills = {};   // drill id → { kind, data, items, status } — rebuilt on every lesson render
let _egDrillSeq = 0;

function _egNewDrill(kind, data, items) {
  const id = 'egd' + (++_egDrillSeq);
  _egDrills[id] = { kind, data, items, status: items.map(() => null) };
  return id;
}

function _egMatch(user, answers) {
  if (window.AnswerMatch) return window.AnswerMatch.isMatch(user, answers);
  const u = String(user).trim().toLowerCase();
  return answers.some(a => a.trim().toLowerCase() === u);
}

// Click-to-play: only the thumbnail loads until the student presses play.
function renderVideoBlock(data) {
  const videos = (data.videos || []).filter(v => YT_ID_RE.test(v.youtubeId || ''));
  if (!videos.length) return '';
  const items = videos.map(v => {
    const id = v.youtubeId;
    return '<div class="eg-video-item">'
      + (v.label ? '<div class="eg-video-label">' + escHtml(v.label) + '</div>' : '')
      + '<div class="eg-video-frame">'
      + '<button type="button" class="eg-video-poster" data-eg-act="play-video" data-yt="' + id + '" aria-label="' + escAttr('Phát video: ' + (v.title || '')) + '">'
      + '<img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" loading="lazy">'
      + '<span class="eg-video-play"><i class="fas fa-play"></i></span>'
      + (v.duration ? '<span class="eg-video-dur">' + escHtml(v.duration) + '</span>' : '')
      + '</button></div>'
      + '<div class="eg-video-meta"><div class="eg-video-title">' + escHtml(v.title || '') + '</div>'
      + '<a class="eg-video-src" href="https://www.youtube.com/watch?v=' + id + '" target="_blank" rel="noopener noreferrer">'
      + '<i class="fab fa-youtube"></i> ' + escHtml(v.channel || 'YouTube') + '</a></div>'
      + '</div>';
  }).join('');
  return '<div class="eg-block"><div class="eg-block-label"><i class="fas fa-play-circle"></i> Video bài giảng</div>' + items + '</div>';
}

function _egPlayVideo(btn) {
  const id = btn.dataset.yt;
  const frame = btn.closest('.eg-video-frame');
  if (!frame || !YT_ID_RE.test(id || '')) return;
  frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="YouTube video" '
    + 'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" '
    + 'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
}

// ── Auto-checked drills: verb_forms + conjugation_drill ──

function _egShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function _egVerbTriple(v) {
  return escHtml(v.base) + ' – ' + escHtml(v.past.join(' / ')) + ' – ' + escHtml(v.pastParticiple.join(' / '));
}

function renderVerbFormsBlock(data) {
  const isPast = data.target === 'past';
  const items = (data.items || []).map(v => ({ verb: v, answers: isPast ? v.past : v.pastParticiple }));
  if (!items.length) return '';
  const id = _egNewDrill('verb', data, items);
  const title = isPast ? 'Luyện chuyển động từ V0 → V2 (quá khứ)' : 'Luyện chuyển động từ V0 → V3 (quá khứ phân từ)';
  const intro = isPast
    ? 'Viết dạng quá khứ V2 của ' + items.length + ' động từ. Động từ có quy tắc thêm -ed (chú ý quy tắc chính tả); động từ bất quy tắc phải học thuộc. Nhấn Enter để sang ô tiếp theo.'
    : 'Viết dạng quá khứ phân từ V3 (dùng sau have/has) của ' + items.length + ' động từ. Nhiều động từ có V3 khác V2 (go – went – gone). Nhấn Enter để sang ô tiếp theo.';
  return '<div class="eg-block" id="' + id + '"><div class="eg-block-label"><i class="fas fa-exchange-alt"></i> ' + title + '</div>'
    + '<div class="eg-drill-intro">' + escHtml(intro) + '</div>'
    + '<div class="eg-vf-grid" id="' + id + '-rows">' + _egVerbRowsHtml(id) + '</div>'
    + _egDrillActionsHtml(id, true)
    + '</div>';
}

function _egVerbRowsHtml(id) {
  const d = _egDrills[id];
  const tag = d.data.target === 'past' ? 'V2' : 'V3';
  return d.items.map((it, i) =>
    '<div class="eg-drill-row eg-vf-row" data-i="' + i + '">'
    + '<span class="eg-vf-num">' + (i + 1) + '.</span>'
    + '<span class="eg-vf-word"><span class="eg-vf-base">' + escHtml(it.verb.base) + '</span>'
    + '<span class="eg-vf-mean">' + escHtml(it.verb.meaning) + '</span></span>'
    + '<input class="eg-drill-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + tag + '" '
    + 'data-eg-drill="' + id + '" aria-label="' + escAttr(tag + ' của ' + it.verb.base) + '">'
    + '<div class="eg-drill-fb"></div>'
    + '</div>'
  ).join('');
}

function renderConjugationBlock(data) {
  const items = (data.items || []).map(it => ({ sentence: it.sentence, answers: it.answers || [], explanation: it.explanation || '' }));
  if (!items.length) return '';
  const id = _egNewDrill('conj', data, items);
  const rows = items.map((it, i) => {
    const parts = String(it.sentence).split('___');
    const longest = Math.max(0, ...it.answers.map(a => a.length));
    const input = '<input class="eg-drill-input eg-conj-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" '
      + 'size="' + Math.max(8, longest + 2) + '" data-eg-drill="' + id + '" aria-label="' + escAttr('Câu ' + (i + 1)) + '">';
    return '<div class="eg-drill-row eg-conj-row" data-i="' + i + '">'
      + '<div class="eg-conj-sentence"><span class="eg-vf-num">' + (i + 1) + '.</span> '
      + escHtml(parts[0]) + input + escHtml(parts.slice(1).join('___')) + '</div>'
      + '<div class="eg-drill-fb"></div>'
      + '</div>';
  }).join('');
  return '<div class="eg-block" id="' + id + '"><div class="eg-block-label"><i class="fas fa-pen"></i> Luyện tập thêm: Chia động từ (' + items.length + ' câu)</div>'
    + '<div class="eg-drill-intro">Chia động từ trong ngoặc cho đúng thì. Viết cả trợ động từ (ví dụ: <b>has been working</b>, <b>doesn\'t open</b>). Nhấn Enter để sang câu tiếp theo.</div>'
    + '<div id="' + id + '-rows">' + rows + '</div>'
    + _egDrillActionsHtml(id, false)
    + '</div>';
}

function _egDrillActionsHtml(id, shuffle) {
  return '<div class="eg-drill-actions">'
    + '<button type="button" class="eg-ex-reveal-btn" data-eg-act="check-drill" data-eg-drill="' + id + '"><i class="fas fa-check"></i> Kiểm tra</button>'
    + '<button type="button" class="eg-drill-btn-ghost" data-eg-act="reset-drill" data-eg-drill="' + id + '"><i class="fas fa-redo"></i> Làm lại' + (shuffle ? ' (xáo trộn)' : '') + '</button>'
    + '<span class="eg-drill-score" id="' + id + '-score"></span>'
    + '</div>';
}

function checkEgDrill(id) {
  const d = _egDrills[id];
  const block = document.getElementById(id);
  if (!d || !block) return;
  let correct = 0;
  block.querySelectorAll('.eg-drill-row').forEach(row => {
    const i = Number(row.dataset.i);
    const it = d.items[i];
    const val = row.querySelector('.eg-drill-input').value.trim();
    const fb = row.querySelector('.eg-drill-fb');
    const ok = !!val && _egMatch(val, it.answers);
    d.status[i] = ok;
    if (ok) correct++;
    row.classList.toggle('eg-drill-ok', ok);
    row.classList.toggle('eg-drill-bad', !ok);
    const wrongLead = '<i class="fas fa-times"></i> ' + (val ? '' : 'Bỏ trống. ') + 'Đáp án: <b>';
    if (d.kind === 'verb') {
      fb.innerHTML = (ok ? '<i class="fas fa-check"></i> ' : wrongLead + escHtml(it.answers.join(' / ')) + '</b> · ')
        + '<span class="eg-vf-triple">' + _egVerbTriple(it.verb) + '</span>'
        + (!ok && it.verb.note ? '<div class="eg-drill-note">' + escHtml(it.verb.note) + '</div>' : '');
    } else {
      fb.innerHTML = (ok ? '<i class="fas fa-check"></i> Đúng. ' : wrongLead + escHtml(it.answers[0]) + '</b>. ')
        + escHtml(it.explanation);
    }
    fb.classList.add('vis');
  });
  const total = d.items.length;
  const score = document.getElementById(id + '-score');
  if (score) {
    score.textContent = 'Đúng ' + correct + '/' + total + (correct === total ? ' 🎉' : '');
    score.className = 'eg-drill-score ' + (correct / total >= 0.8 ? 'eg-drill-score-good' : 'eg-drill-score-bad');
  }
  if (correct === total) playOk(); else playWrong();
}

function resetEgDrill(id) {
  const d = _egDrills[id];
  const block = document.getElementById(id);
  if (!d || !block) return;
  d.status = d.items.map(() => null);
  if (d.kind === 'verb') {
    d.items = _egShuffle(d.items);
    document.getElementById(id + '-rows').innerHTML = _egVerbRowsHtml(id);
  } else {
    block.querySelectorAll('.eg-drill-row').forEach(row => {
      row.classList.remove('eg-drill-ok', 'eg-drill-bad');
      row.querySelector('.eg-drill-input').value = '';
      const fb = row.querySelector('.eg-drill-fb');
      fb.innerHTML = '';
      fb.classList.remove('vis');
    });
  }
  const score = document.getElementById(id + '-score');
  if (score) { score.textContent = ''; score.className = 'eg-drill-score'; }
  const first = block.querySelector('.eg-drill-input');
  if (first) first.focus();
}

// ── Translation drill (Việt → Anh) ──

function renderTranslationBlock(data) {
  const items = (data.items || []).map(it => ({ vi: it.vi, answers: it.answers || [], hint: it.hint || '' }));
  if (!items.length) return '';
  const id = _egNewDrill('tr', data, items);
  const btnAttrs = i => ' data-eg-drill="' + id + '" data-i="' + i + '"';
  const rows = items.map((it, i) =>
    '<div class="eg-tr-item" data-i="' + i + '">'
    + '<div class="eg-tr-vi"><span class="eg-vf-num">' + (i + 1) + '.</span> ' + escHtml(it.vi) + '</div>'
    + '<textarea class="eg-ex-input eg-tr-input" rows="2" placeholder="Viết câu tiếng Anh... (Ctrl+Enter để kiểm tra)"' + btnAttrs(i) + '></textarea>'
    + '<div class="eg-tr-actions">'
    + '<button type="button" class="eg-ex-reveal-btn" data-eg-act="check-tr"' + btnAttrs(i) + '>Kiểm tra</button>'
    + (it.hint ? '<button type="button" class="eg-drill-btn-ghost ask-lulu" data-eg-act="hint" title="Hỏi Lulu gợi ý"><span class="ask-lulu-ic"></span> Hỏi Lulu</button>' : '')
    + '</div>'
    + (it.hint ? '<div class="eg-tr-hint">🍊 Lulu gợi ý: <span class="eg-tr-hint-txt">' + escHtml(it.hint) + '</span></div>' : '')
    + '<div class="eg-tr-result"></div>'
    + '</div>'
  ).join('');
  return '<div class="eg-block" id="' + id + '"><div class="eg-block-label"><i class="fas fa-language"></i> Luyện dịch câu Việt → Anh (' + items.length + ' câu)</div>'
    + '<div class="eg-drill-intro">Dịch sang tiếng Anh, dùng đúng thì của bài. Máy so với các đáp án gợi ý (không phân biệt viết tắt, chữ hoa/thường, dấu câu). Nếu câu của bạn khác đáp án nhưng vẫn đúng, bấm <b>"Câu của tôi cũng đúng"</b>.</div>'
    + rows
    + '<div class="eg-drill-actions"><span class="eg-drill-score" id="' + id + '-score"></span></div>'
    + '</div>';
}

function _egDiffHtml(parts, missClass) {
  return parts.map(p => p.ok ? escHtml(p.w) : '<span class="' + missClass + '">' + escHtml(p.w) + '</span>').join(' ');
}

function _egAnswerList(list) {
  return list.map(a => '<div class="eg-tr-answer">• ' + escHtml(a) + '</div>').join('');
}

function checkEgTranslation(id, i) {
  const d = _egDrills[id];
  const block = document.getElementById(id);
  if (!d || !block) return;
  const row = block.querySelector('.eg-tr-item[data-i="' + i + '"]');
  const it = d.items[i];
  if (!row || !it) return;
  const val = row.querySelector('textarea').value.trim();
  const result = row.querySelector('.eg-tr-result');
  const AM = window.AnswerMatch;
  let html;
  if (!val) {
    d.status[i] = false;
    html = '<div class="eg-tr-head eg-tr-head-skip"><i class="fas fa-eye"></i> Đáp án gợi ý:</div>' + _egAnswerList(it.answers);
  } else if (_egMatch(val, it.answers)) {
    d.status[i] = true;
    const others = AM ? it.answers.filter(a => !AM.isMatch(a, [val])) : [];
    html = '<div class="eg-tr-head eg-tr-head-ok"><i class="fas fa-check-circle"></i> Chính xác!</div>'
      + (others.length ? '<div class="eg-tr-sub">Cách dịch khác:</div>' + _egAnswerList(others) : '');
    playOk();
  } else {
    d.status[i] = false;
    const best = AM ? AM.closest(val, it.answers) : it.answers[0];
    const diff = AM ? AM.diff(val, best) : null;
    const others = it.answers.filter(a => a !== best);
    html = '<div class="eg-tr-head eg-tr-head-bad"><i class="fas fa-exclamation-circle"></i> Chưa khớp với đáp án gợi ý</div>'
      + '<div class="eg-tr-line"><b>Bạn viết:</b> ' + (diff ? _egDiffHtml(diff.user, 'eg-tr-extra') : escHtml(val)) + '</div>'
      + '<div class="eg-tr-line"><b>Đáp án gần nhất:</b> ' + (diff ? _egDiffHtml(diff.answer, 'eg-tr-miss') : escHtml(best)) + '</div>'
      + (diff ? '<div class="eg-tr-legend"><span class="eg-tr-extra">chữ đỏ</span> = khác đáp án · <span class="eg-tr-miss">chữ xanh</span> = phần bạn thiếu hoặc viết khác</div>' : '')
      + (others.length ? '<div class="eg-tr-sub">Cách dịch khác:</div>' + _egAnswerList(others) : '')
      + '<button type="button" class="eg-drill-btn-ghost eg-tr-self" data-eg-act="self-ok" data-eg-drill="' + id + '" data-i="' + i + '"><i class="fas fa-user-check"></i> Câu của tôi cũng đúng</button>';
    playWrong();
  }
  result.innerHTML = html;
  result.classList.add('vis');
  _egUpdateTranslationScore(id);
}

function _egMarkTranslationOk(btn) {
  const d = _egDrills[btn.dataset.egDrill];
  if (!d) return;
  d.status[Number(btn.dataset.i)] = true;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-check"></i> Đã tính là đúng';
  _egUpdateTranslationScore(btn.dataset.egDrill);
}

function _egUpdateTranslationScore(id) {
  const d = _egDrills[id];
  const el = document.getElementById(id + '-score');
  if (!d || !el) return;
  const done = d.status.filter(s => s !== null).length;
  const correct = d.status.filter(s => s === true).length;
  el.textContent = 'Đã làm ' + done + '/' + d.items.length + ' câu · Đúng ' + correct;
  el.className = 'eg-drill-score' + (done === d.items.length ? (correct / done >= 0.8 ? ' eg-drill-score-good' : ' eg-drill-score-bad') : '');
}

// One listener for every drill/video button and input on the page —
// #eg-main-content itself persists across lesson renders.
function _egBindDrillEvents() {
  const root = document.getElementById('eg-main-content');
  if (!root || root.dataset.egDrillBound) return;
  root.dataset.egDrillBound = '1';
  root.addEventListener('click', ev => {
    const btn = ev.target.closest('[data-eg-act]');
    if (!btn || !root.contains(btn)) return;
    switch (btn.dataset.egAct) {
      case 'play-video': _egPlayVideo(btn); break;
      case 'check-drill': checkEgDrill(btn.dataset.egDrill); break;
      case 'reset-drill': resetEgDrill(btn.dataset.egDrill); break;
      case 'check-tr': checkEgTranslation(btn.dataset.egDrill, Number(btn.dataset.i)); break;
      case 'self-ok': _egMarkTranslationOk(btn); break;
      case 'hint': {
        // Lulu says the hint in a bubble; it also stays written under the
        // buttons so the student can keep reading it while typing.
        const item = btn.closest('.eg-tr-item');
        const hint = item.querySelector('.eg-tr-hint');
        if (hint) hint.classList.add('vis');
        const txt = item.querySelector('.eg-tr-hint-txt');
        if (window.AskLulu && txt) window.AskLulu.say(btn, txt.textContent + ' 🍊');
        break;
      }
    }
  });
  root.addEventListener('keydown', ev => {
    if (ev.key !== 'Enter') return;
    const el = ev.target;
    if (el.classList.contains('eg-tr-input')) {
      // Ctrl/Cmd+Enter checks; plain Enter still makes a new line.
      if (ev.ctrlKey || ev.metaKey) { ev.preventDefault(); checkEgTranslation(el.dataset.egDrill, Number(el.dataset.i)); }
      return;
    }
    if (!el.classList.contains('eg-drill-input')) return;
    ev.preventDefault();
    const id = el.dataset.egDrill;
    const inputs = Array.from(document.querySelectorAll('#' + id + ' .eg-drill-input'));
    const next = inputs[inputs.indexOf(el) + 1];
    if (next) next.focus(); else checkEgDrill(id);
  });
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

_egBindDrillEvents();
initEssentialGrammar();
