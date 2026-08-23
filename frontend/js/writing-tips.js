'use strict';
// Writing Tips — its own screen on writing.html (opened from the home
// screen's "Writing Tips" button, alongside "Tài liệu mẫu"/"Xem lịch sử"),
// mirroring the collapsible category sidebar + click-through content panel
// used by frontend/js/reading-tips.js and frontend/js/listening-tips.js
// (wst- prefixed here; emerald accent instead of Reading's red/orange or
// Listening's blue — see css/writing-extra.css).
//
// `apiFetch`/`showScreen` are globals defined in writing.js, and
// `escHtml`/`escAttr` come from js/shared/utils.js — both loaded before
// this file.
//
// Unlike Reading/Listening Tips, this page's 'example' blocks use a more
// flexible { label, lines: [{tag, text}], note } shape instead of a fixed
// passage/statement pair — Writing content pairs up all sorts of things
// (Cause/Solution, Idea/Why/Example/Result, ❌Band 6/✅Band 7+, ...), so a
// free-form list of tagged lines fits better than two hardcoded fields.

const WST_LAST_LESSON_KEY = 'wst_last_lesson';
const WST_COLLAPSED_KEY = 'wst_collapsed_categories';
const WST_READ_KEY = 'wst_read_lessons';

let wstLessons = [];
let wstCategories = [];
let wstCurrentKey = null;
let wstLoaded = false; // guards against re-fetching every time the screen is reopened
// Guarded — a malformed value here (partial write from a storage-quota
// error, manual edit, future format change) previously threw synchronously
// at script-parse time, aborting this whole file before any wst* function
// was even defined, permanently stranding Writing Tips on its loading
// placeholder. Same fix as speaking-tips.js's mirrored _sstSafeParse.
function _wstSafeParse(json, fallback) {
  if (json == null) return fallback;
  try { return JSON.parse(json); } catch { return fallback; }
}
let wstCollapsed = new Set(_wstSafeParse(localStorage.getItem(WST_COLLAPSED_KEY), []));
let wstRead = new Set(_wstSafeParse(localStorage.getItem(WST_READ_KEY), []));

function wstKeyOf(l) { return l.category + '||' + l.lessonKey; }

function wstMarkRead(key) {
  if (wstRead.has(key)) return;
  wstRead.add(key);
  localStorage.setItem(WST_READ_KEY, JSON.stringify([...wstRead]));
}

function openWritingTips() {
  history.pushState({ screen: 'writing-tips' }, '', 'writing.html?view=writing-tips');
  showScreen('screen-writing-tips');
  initWritingTips();
}

function exitWritingTips() {
  history.pushState({ screen: 'key' }, '', 'writing.html');
  showScreen('screen-key');
  if (typeof checkRestoreBanner === 'function') checkRestoreBanner();
}

async function initWritingTips() {
  if (wstLoaded) return;
  wstLoaded = true;
  try {
    const data = await apiFetch('/api/writing-tips/lessons');
    if (!data.success) throw new Error('load failed');
    wstLessons = data.lessons || [];
    wstCategories = [...new Set(wstLessons.map(l => l.category))];

    const savedKey = localStorage.getItem(WST_LAST_LESSON_KEY);
    const savedLesson = savedKey && wstLessons.find(l => wstKeyOf(l) === savedKey);
    const initialLesson = savedLesson || wstLessons[0] || null;
    wstCurrentKey = initialLesson ? wstKeyOf(initialLesson) : null;

    wstRenderSidebar();
    if (wstCurrentKey) wstSelectLesson(wstCurrentKey);
    else document.getElementById('wst-main-content').innerHTML = '<div class="wst-loading">Chưa có nội dung.</div>';
  } catch (err) {
    wstLoaded = false; // allow a retry (e.g. transient network error) next time the screen opens
    document.getElementById('wst-main-content').innerHTML =
      '<div class="wst-loading"><div class="wst-loading-icon">⚠️</div>Không tải được nội dung. Vui lòng thử lại sau.</div>';
    if (typeof showToast === 'function') showToast('Không tải được Writing Tips', 'error');
  }
}

function wstRenderSidebar() {
  let html = '';
  wstCategories.forEach(cat => {
    const lessons = wstLessons.filter(l => l.category === cat).sort((a, b) => a.orderIndex - b.orderIndex);
    if (!lessons.length) return;
    const isCollapsed = wstCollapsed.has(cat);
    html += '<div class="wst-cat-group' + (isCollapsed ? ' collapsed' : '') + '" data-cat="' + escAttr(cat) + '">'
      + '<button class="wst-cat-header" onclick="wstToggleCategory(' + JSON.stringify(cat).replace(/"/g, '&quot;') + ')">'
      + '<span>' + escHtml(cat) + '</span>'
      + '<span class="wst-cat-count">' + lessons.length + '</span>'
      + '<i class="fas fa-chevron-down wst-cat-chevron"></i>'
      + '</button>'
      + '<div class="wst-lesson-list">'
      + lessons.map(l => {
          const k = wstKeyOf(l);
          const active = k === wstCurrentKey ? ' active' : '';
          const done = wstRead.has(k) ? '<i class="fas fa-check-circle wst-done-icon" title="Đã xem"></i>' : '';
          return '<button class="wst-lesson-item' + active + '" onclick="wstSelectLesson(' + JSON.stringify(k).replace(/"/g, '&quot;') + ')">'
            + '<span class="wst-lesson-icon">' + (l.icon || '✏️') + '</span>'
            + '<span class="wst-lesson-title">' + escHtml(l.title) + '</span>' + done + '</button>';
        }).join('')
      + '</div></div>';
  });
  const el = document.getElementById('wst-cat-list');
  if (el) el.innerHTML = html || '<div class="wst-no-results">Chưa có nội dung.</div>';
}

function wstToggleCategory(cat) {
  if (wstCollapsed.has(cat)) wstCollapsed.delete(cat); else wstCollapsed.add(cat);
  localStorage.setItem(WST_COLLAPSED_KEY, JSON.stringify([...wstCollapsed]));
  wstRenderSidebar();
}

function wstSelectLesson(key) {
  const lesson = wstLessons.find(l => wstKeyOf(l) === key);
  if (!lesson) return;
  wstCurrentKey = key;
  localStorage.setItem(WST_LAST_LESSON_KEY, key);
  wstMarkRead(key);
  wstRenderSidebar();
  wstRenderLessonContent(lesson);
  const panel = document.getElementById('screen-writing-tips');
  if (panel) panel.scrollTo({ top: 0, behavior: 'smooth' });
}

function wstRenderLessonContent(lesson) {
  let html = '<div class="wst-hero">'
    + '<div class="wst-hero-cat">' + escHtml(lesson.category) + '</div>'
    + '<h1 class="wst-hero-title">' + (lesson.icon || '✏️') + ' ' + escHtml(lesson.title) + '</h1>'
    + '</div>';
  html += '<div class="wst-content">' + lesson.blocks.map(wstRenderBlock).join('') + '</div>';
  document.getElementById('wst-main-content').innerHTML = html;
}

function wstRenderBlock(block) {
  switch (block.type) {
    case 'overview': return wstRenderOverview(block.data);
    case 'steps':    return wstRenderSteps(block.data);
    case 'list':     return wstRenderList(block.data);
    case 'example':  return wstRenderExample(block.data);
    case 'callout':  return wstRenderCallout(block.data);
    case 'table':    return wstRenderTable(block.data);
    case 'summary':  return wstRenderSummary(block.data);
    default: return '';
  }
}

function wstRenderOverview(text) {
  return '<div class="wst-block"><div class="wst-block-label"><i class="fas fa-book-open"></i> Tổng quan</div>'
    + '<div class="wst-overview-text">' + escHtml(text) + '</div></div>';
}

function wstRenderSteps(items) {
  const rows = (items || []).map(s =>
    '<div class="wst-step-item"><span class="wst-step-num"><i class="fas fa-arrow-right"></i></span>'
    + '<div><div class="wst-step-title">' + escHtml(s.title) + '</div>'
    + '<div class="wst-step-desc">' + escHtml(s.description) + '</div></div></div>'
  ).join('');
  return '<div class="wst-block"><div class="wst-block-label"><i class="fas fa-list-ol"></i> Quy trình</div>' + rows + '</div>';
}

function wstRenderList(data) {
  const items = (data.items || []).map(t =>
    '<div class="wst-list-item"><i class="fas fa-circle"></i><span>' + escHtml(t) + '</span></div>'
  ).join('');
  const title = data.title ? '<div class="wst-list-title">' + escHtml(data.title) + '</div>' : '';
  return '<div class="wst-block">' + title + items + '</div>';
}

// { label, lines: [{tag, text}], note } — see file header comment.
function wstRenderExample(items) {
  const cards = (items || []).map(ex => {
    const label = ex.label ? '<div class="wst-example-label">' + escHtml(ex.label) + '</div>' : '';
    const lines = (ex.lines || []).map(ln =>
      '<div class="wst-example-row"><strong>' + escHtml(ln.tag) + ':</strong> ' + escHtml(ln.text) + '</div>'
    ).join('');
    const note = ex.note ? '<div class="wst-example-note">' + escHtml(ex.note) + '</div>' : '';
    return '<div class="wst-example-item">' + label + lines + note + '</div>';
  }).join('');
  return '<div class="wst-block"><div class="wst-block-label"><i class="fas fa-quote-left"></i> Ví dụ minh hoạ</div>' + cards + '</div>';
}

function wstRenderCallout(data) {
  const title = data.title ? '<div class="wst-callout-title">' + escHtml(data.title) + '</div>' : '';
  return '<div class="wst-block"><div class="wst-callout">' + title + '<div class="wst-callout-text">' + escHtml(data.text) + '</div></div></div>';
}

function wstRenderTable(data) {
  const headers = (data.headers || []).map(h => '<th>' + escHtml(h) + '</th>').join('');
  const rows = (data.rows || []).map(row => '<tr>' + row.map(c => '<td>' + escHtml(c) + '</td>').join('') + '</tr>').join('');
  const title = data.title ? '<div class="wst-table-title">' + escHtml(data.title) + '</div>' : '';
  return '<div class="wst-block">' + title
    + '<div class="wst-table-wrap"><table class="wst-table"><thead><tr>' + headers + '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
}

function wstRenderSummary(text) {
  return '<div class="wst-block"><div class="wst-block-label"><i class="fas fa-flag-checkered"></i> Tóm tắt</div>'
    + '<div class="wst-summary-box">' + escHtml(text) + '</div></div>';
}

// Reference material, not a gradeable drill — double-click word lookup is on
// unconditionally, no exam/quiz gate needed. #wst-main-content already
// exists in writing.html's static markup by the time this script runs, so
// this can attach once here rather than after every render.
if (typeof setupDictionaryDouble === 'function') {
  setupDictionaryDouble('wst-main-content', 'writing-tips');
}
