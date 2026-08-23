'use strict';
// Listening Tips — strategy articles shown as a third tab on listening.html
// (Full đề / Bài lẻ / Listening Tips), mirroring frontend/js/reading-tips.js
// (lst- prefixed here instead of rt-, since listening.html already uses
// lt-/ls- for "listening practice"/"listening page general").
//
// `API` (base URL, already including '/api') and `escHtml`/`escAttr` are
// globals — API is declared in listening.html's own inline <script>, and
// escHtml/escAttr come from js/shared/utils.js — both loaded before this
// file. Redeclaring API here would throw a duplicate-const SyntaxError
// since classic <script> tags share one top-level scope.

const LST_LAST_LESSON_KEY = 'lst_last_lesson';
const LST_COLLAPSED_KEY = 'lst_collapsed_categories';
const LST_READ_KEY = 'lst_read_lessons';

let lstLessons = [];
let lstCategories = [];
let lstCurrentKey = null;
let lstLoaded = false; // guards against re-fetching every time the tab is reopened
// Guarded — a malformed value here (partial write from a storage-quota
// error, manual edit, future format change) previously threw synchronously
// at script-parse time, aborting this whole file before any lst* function
// was even defined. Same fix as writing-tips.js/speaking-tips.js's mirrored
// safe-parse helpers.
function _lstSafeParse(json, fallback) {
  if (json == null) return fallback;
  try { return JSON.parse(json); } catch { return fallback; }
}
let lstCollapsed = new Set(_lstSafeParse(localStorage.getItem(LST_COLLAPSED_KEY), []));
let lstRead = new Set(_lstSafeParse(localStorage.getItem(LST_READ_KEY), []));

function lstKeyOf(l) { return l.category + '||' + l.lessonKey; }

function lstMarkRead(key) {
  if (lstRead.has(key)) return;
  lstRead.add(key);
  localStorage.setItem(LST_READ_KEY, JSON.stringify([...lstRead]));
}

// Called by setListeningMode() the first time the "Listening Tips" tab is
// opened — subsequent switches just re-show the already-rendered panel.
async function initListeningTips() {
  if (lstLoaded) return;
  lstLoaded = true;
  try {
    const res = await fetch(API + '/listening-tips/lessons');
    const data = await res.json();
    if (!data.success) throw new Error('load failed');
    lstLessons = data.lessons || [];
    lstCategories = [...new Set(lstLessons.map(l => l.category))];

    const savedKey = localStorage.getItem(LST_LAST_LESSON_KEY);
    const savedLesson = savedKey && lstLessons.find(l => lstKeyOf(l) === savedKey);
    const initialLesson = savedLesson || lstLessons[0] || null;
    lstCurrentKey = initialLesson ? lstKeyOf(initialLesson) : null;

    lstRenderSidebar();
    if (lstCurrentKey) lstSelectLesson(lstCurrentKey);
    else document.getElementById('lst-main-content').innerHTML = '<div class="lst-loading">Chưa có nội dung.</div>';
  } catch (err) {
    lstLoaded = false; // allow a retry (e.g. transient network error) on next tab switch
    document.getElementById('lst-main-content').innerHTML =
      '<div class="lst-loading"><div class="lst-loading-icon">⚠️</div>Không tải được nội dung. Vui lòng thử lại sau.</div>';
    if (typeof showToast === 'function') showToast('Không tải được Listening Tips', 'error');
  }
}

function lstRenderSidebar() {
  let html = '';
  lstCategories.forEach(cat => {
    const lessons = lstLessons.filter(l => l.category === cat).sort((a, b) => a.orderIndex - b.orderIndex);
    if (!lessons.length) return;
    const isCollapsed = lstCollapsed.has(cat);
    html += '<div class="lst-cat-group' + (isCollapsed ? ' collapsed' : '') + '" data-cat="' + escAttr(cat) + '">'
      + '<button class="lst-cat-header" onclick="lstToggleCategory(' + JSON.stringify(cat).replace(/"/g, '&quot;') + ')">'
      + '<span>' + escHtml(cat) + '</span>'
      + '<span class="lst-cat-count">' + lessons.length + '</span>'
      + '<i class="fas fa-chevron-down lst-cat-chevron"></i>'
      + '</button>'
      + '<div class="lst-lesson-list">'
      + lessons.map(l => {
          const k = lstKeyOf(l);
          const active = k === lstCurrentKey ? ' active' : '';
          const done = lstRead.has(k) ? '<i class="fas fa-check-circle lst-done-icon" title="Đã xem"></i>' : '';
          return '<button class="lst-lesson-item' + active + '" onclick="lstSelectLesson(' + JSON.stringify(k).replace(/"/g, '&quot;') + ')">'
            + '<span class="lst-lesson-icon">' + (l.icon || '🎧') + '</span>'
            + '<span class="lst-lesson-title">' + escHtml(l.title) + '</span>' + done + '</button>';
        }).join('')
      + '</div></div>';
  });
  const el = document.getElementById('lst-cat-list');
  if (el) el.innerHTML = html || '<div class="lst-no-results">Chưa có nội dung.</div>';
}

function lstToggleCategory(cat) {
  if (lstCollapsed.has(cat)) lstCollapsed.delete(cat); else lstCollapsed.add(cat);
  localStorage.setItem(LST_COLLAPSED_KEY, JSON.stringify([...lstCollapsed]));
  lstRenderSidebar();
}

function lstSelectLesson(key) {
  const lesson = lstLessons.find(l => lstKeyOf(l) === key);
  if (!lesson) return;
  lstCurrentKey = key;
  localStorage.setItem(LST_LAST_LESSON_KEY, key);
  lstMarkRead(key);
  lstRenderSidebar();
  lstRenderLessonContent(lesson);
  const panel = document.getElementById('listening-tips-panel');
  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function lstRenderLessonContent(lesson) {
  let html = '<div class="lst-hero">'
    + '<div class="lst-hero-cat">' + escHtml(lesson.category) + '</div>'
    + '<h1 class="lst-hero-title">' + (lesson.icon || '🎧') + ' ' + escHtml(lesson.title) + '</h1>'
    + '</div>';
  html += '<div class="lst-content">' + lesson.blocks.map(lstRenderBlock).join('') + '</div>';
  document.getElementById('lst-main-content').innerHTML = html;
}

function lstRenderBlock(block) {
  switch (block.type) {
    case 'overview': return lstRenderOverview(block.data);
    case 'steps':    return lstRenderSteps(block.data);
    case 'list':     return lstRenderList(block.data);
    case 'example':  return lstRenderExample(block.data);
    case 'callout':  return lstRenderCallout(block.data);
    case 'table':    return lstRenderTable(block.data);
    case 'summary':  return lstRenderSummary(block.data);
    default: return '';
  }
}

function lstRenderOverview(text) {
  return '<div class="lst-block"><div class="lst-block-label"><i class="fas fa-book-open"></i> Tổng quan</div>'
    + '<div class="lst-overview-text">' + escHtml(text) + '</div></div>';
}

function lstRenderSteps(items) {
  const rows = (items || []).map(s =>
    '<div class="lst-step-item"><span class="lst-step-num"><i class="fas fa-arrow-right"></i></span>'
    + '<div><div class="lst-step-title">' + escHtml(s.title) + '</div>'
    + '<div class="lst-step-desc">' + escHtml(s.description) + '</div></div></div>'
  ).join('');
  return '<div class="lst-block"><div class="lst-block-label"><i class="fas fa-list-ol"></i> Quy trình</div>' + rows + '</div>';
}

function lstRenderList(data) {
  const items = (data.items || []).map(t =>
    '<div class="lst-list-item"><i class="fas fa-circle"></i><span>' + escHtml(t) + '</span></div>'
  ).join('');
  const title = data.title ? '<div class="lst-list-title">' + escHtml(data.title) + '</div>' : '';
  return '<div class="lst-block">' + title + items + '</div>';
}

function lstRenderExample(items) {
  const cards = (items || []).map(ex => {
    const label = ex.label ? '<div class="lst-example-label">' + escHtml(ex.label) + '</div>' : '';
    const passage = ex.passage ? '<div class="lst-example-row"><strong>Audio:</strong> ' + escHtml(ex.passage) + '</div>' : '';
    const statement = ex.statement ? '<div class="lst-example-row"><strong>Question:</strong> ' + escHtml(ex.statement) + '</div>' : '';
    const note = ex.note ? '<div class="lst-example-note">' + escHtml(ex.note) + '</div>' : '';
    return '<div class="lst-example-item">' + label + passage + statement + note + '</div>';
  }).join('');
  return '<div class="lst-block"><div class="lst-block-label"><i class="fas fa-quote-left"></i> Ví dụ minh hoạ</div>' + cards + '</div>';
}

function lstRenderCallout(data) {
  const title = data.title ? '<div class="lst-callout-title">' + escHtml(data.title) + '</div>' : '';
  return '<div class="lst-block"><div class="lst-callout">' + title + '<div class="lst-callout-text">' + escHtml(data.text) + '</div></div></div>';
}

function lstRenderTable(data) {
  const headers = (data.headers || []).map(h => '<th>' + escHtml(h) + '</th>').join('');
  const rows = (data.rows || []).map(row => '<tr>' + row.map(c => '<td>' + escHtml(c) + '</td>').join('') + '</tr>').join('');
  const title = data.title ? '<div class="lst-table-title">' + escHtml(data.title) + '</div>' : '';
  return '<div class="lst-block">' + title
    + '<div class="lst-table-wrap"><table class="lst-table"><thead><tr>' + headers + '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
}

function lstRenderSummary(text) {
  return '<div class="lst-block"><div class="lst-block-label"><i class="fas fa-flag-checkered"></i> Tóm tắt</div>'
    + '<div class="lst-summary-box">' + escHtml(text) + '</div></div>';
}

// Reference material, not a gradeable drill — double-click word lookup is on
// unconditionally, no exam/quiz gate needed. #lst-main-content already
// exists in listening.html's static markup by the time this script runs, so
// this can attach once here rather than after every render.
if (typeof setupDictionaryDouble === 'function') {
  setupDictionaryDouble('lst-main-content', 'listening-tips');
}
