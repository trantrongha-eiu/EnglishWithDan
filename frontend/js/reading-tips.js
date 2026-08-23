'use strict';
// Reading Tips — strategy articles shown as a third tab on reading.html
// (Full đề / Bài lẻ / Reading Tips), browsable the same way Essential
// Grammar lessons are: a collapsible category sidebar + click-through
// content panel (see frontend/essential-grammar.html for the pattern this
// mirrors — rt- prefixed CSS/state here instead of eg-, and no quiz/score
// blocks since this is reference material, not gradeable drills).
//
// `API` (base URL, already including '/api') and `escHtml`/`escAttr` are
// globals defined by reading-v2.js and js/shared/utils.js respectively,
// both loaded before this file — redeclaring them here would throw a
// duplicate-const SyntaxError since classic <script> tags share one scope.

const RT_LAST_LESSON_KEY = 'rt_last_lesson';
const RT_COLLAPSED_KEY = 'rt_collapsed_categories';
const RT_READ_KEY = 'rt_read_lessons';

let rtLessons = [];
let rtCategories = [];
let rtCurrentKey = null;
let rtLoaded = false; // guards against re-fetching every time the tab is reopened
// Guarded — a malformed value here (partial write from a storage-quota
// error, manual edit, future format change) previously threw synchronously
// at script-parse time, aborting this whole file before any rt* function
// was even defined. Same fix as writing-tips.js/speaking-tips.js/
// listening-tips.js's mirrored safe-parse helpers.
function _rtSafeParse(json, fallback) {
  if (json == null) return fallback;
  try { return JSON.parse(json); } catch { return fallback; }
}
let rtCollapsed = new Set(_rtSafeParse(localStorage.getItem(RT_COLLAPSED_KEY), []));
let rtRead = new Set(_rtSafeParse(localStorage.getItem(RT_READ_KEY), []));

function rtKeyOf(l) { return l.category + '||' + l.lessonKey; }

function rtMarkRead(key) {
  if (rtRead.has(key)) return;
  rtRead.add(key);
  localStorage.setItem(RT_READ_KEY, JSON.stringify([...rtRead]));
}

// Called by reading-v2.js's setReadingMode() the first time the "Reading
// Tips" tab is opened — subsequent switches just re-show the already-
// rendered panel, matching how the practice-picker tab lazy-loads once.
async function initReadingTips() {
  if (rtLoaded) return;
  rtLoaded = true;
  try {
    const res = await fetch(API + '/reading-tips/lessons');
    const data = await res.json();
    if (!data.success) throw new Error('load failed');
    rtLessons = data.lessons || [];
    rtCategories = [...new Set(rtLessons.map(l => l.category))];

    const savedKey = localStorage.getItem(RT_LAST_LESSON_KEY);
    const savedLesson = savedKey && rtLessons.find(l => rtKeyOf(l) === savedKey);
    const initialLesson = savedLesson || rtLessons[0] || null;
    rtCurrentKey = initialLesson ? rtKeyOf(initialLesson) : null;

    rtRenderSidebar();
    if (rtCurrentKey) rtSelectLesson(rtCurrentKey);
    else document.getElementById('rt-main-content').innerHTML = '<div class="rt-loading">Chưa có nội dung.</div>';
  } catch (err) {
    rtLoaded = false; // allow a retry (e.g. transient network error) on next tab switch
    document.getElementById('rt-main-content').innerHTML =
      '<div class="rt-loading"><div class="rt-loading-icon">⚠️</div>Không tải được nội dung. Vui lòng thử lại sau.</div>';
    if (typeof showToast === 'function') showToast('Không tải được Reading Tips', 'error');
  }
}

function rtRenderSidebar() {
  let html = '';
  rtCategories.forEach(cat => {
    const lessons = rtLessons.filter(l => l.category === cat).sort((a, b) => a.orderIndex - b.orderIndex);
    if (!lessons.length) return;
    const isCollapsed = rtCollapsed.has(cat);
    html += '<div class="rt-cat-group' + (isCollapsed ? ' collapsed' : '') + '" data-cat="' + escAttr(cat) + '">'
      + '<button class="rt-cat-header" onclick="rtToggleCategory(' + JSON.stringify(cat).replace(/"/g, '&quot;') + ')">'
      + '<span>' + escHtml(cat) + '</span>'
      + '<span class="rt-cat-count">' + lessons.length + '</span>'
      + '<i class="fas fa-chevron-down rt-cat-chevron"></i>'
      + '</button>'
      + '<div class="rt-lesson-list">'
      + lessons.map(l => {
          const k = rtKeyOf(l);
          const active = k === rtCurrentKey ? ' active' : '';
          const done = rtRead.has(k) ? '<i class="fas fa-check-circle rt-done-icon" title="Đã xem"></i>' : '';
          return '<button class="rt-lesson-item' + active + '" onclick="rtSelectLesson(' + JSON.stringify(k).replace(/"/g, '&quot;') + ')">'
            + '<span class="rt-lesson-icon">' + (l.icon || '📖') + '</span>'
            + '<span class="rt-lesson-title">' + escHtml(l.title) + '</span>' + done + '</button>';
        }).join('')
      + '</div></div>';
  });
  const el = document.getElementById('rt-cat-list');
  if (el) el.innerHTML = html || '<div class="rt-no-results">Chưa có nội dung.</div>';
}

function rtToggleCategory(cat) {
  if (rtCollapsed.has(cat)) rtCollapsed.delete(cat); else rtCollapsed.add(cat);
  localStorage.setItem(RT_COLLAPSED_KEY, JSON.stringify([...rtCollapsed]));
  rtRenderSidebar();
}

function rtSelectLesson(key) {
  const lesson = rtLessons.find(l => rtKeyOf(l) === key);
  if (!lesson) return;
  rtCurrentKey = key;
  localStorage.setItem(RT_LAST_LESSON_KEY, key);
  rtMarkRead(key);
  rtRenderSidebar();
  rtRenderLessonContent(lesson);
  const panel = document.getElementById('reading-tips-panel');
  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function rtRenderLessonContent(lesson) {
  let html = '<div class="rt-hero">'
    + '<div class="rt-hero-cat">' + escHtml(lesson.category) + '</div>'
    + '<h1 class="rt-hero-title">' + (lesson.icon || '📖') + ' ' + escHtml(lesson.title) + '</h1>'
    + '</div>';
  html += '<div class="rt-content">' + lesson.blocks.map(rtRenderBlock).join('') + '</div>';
  document.getElementById('rt-main-content').innerHTML = html;
}

function rtRenderBlock(block) {
  switch (block.type) {
    case 'overview': return rtRenderOverview(block.data);
    case 'steps':    return rtRenderSteps(block.data);
    case 'list':     return rtRenderList(block.data);
    case 'example':  return rtRenderExample(block.data);
    case 'callout':  return rtRenderCallout(block.data);
    case 'table':    return rtRenderTable(block.data);
    case 'summary':  return rtRenderSummary(block.data);
    default: return '';
  }
}

function rtRenderOverview(text) {
  return '<div class="rt-block"><div class="rt-block-label"><i class="fas fa-book-open"></i> Tổng quan</div>'
    + '<div class="rt-overview-text">' + escHtml(text) + '</div></div>';
}

function rtRenderSteps(items) {
  const rows = (items || []).map(s =>
    '<div class="rt-step-item"><span class="rt-step-num"><i class="fas fa-arrow-right"></i></span>'
    + '<div><div class="rt-step-title">' + escHtml(s.title) + '</div>'
    + '<div class="rt-step-desc">' + escHtml(s.description) + '</div></div></div>'
  ).join('');
  return '<div class="rt-block"><div class="rt-block-label"><i class="fas fa-list-ol"></i> Quy trình</div>' + rows + '</div>';
}

function rtRenderList(data) {
  const items = (data.items || []).map(t =>
    '<div class="rt-list-item"><i class="fas fa-circle"></i><span>' + escHtml(t) + '</span></div>'
  ).join('');
  const title = data.title ? '<div class="rt-list-title">' + escHtml(data.title) + '</div>' : '';
  return '<div class="rt-block">' + title + items + '</div>';
}

function rtRenderExample(items) {
  const cards = (items || []).map(ex => {
    const label = ex.label ? '<div class="rt-example-label">' + escHtml(ex.label) + '</div>' : '';
    const passage = ex.passage ? '<div class="rt-example-row"><strong>Passage:</strong> ' + escHtml(ex.passage) + '</div>' : '';
    const statement = ex.statement ? '<div class="rt-example-row"><strong>Statement:</strong> ' + escHtml(ex.statement) + '</div>' : '';
    const note = ex.note ? '<div class="rt-example-note">' + escHtml(ex.note) + '</div>' : '';
    return '<div class="rt-example-item">' + label + passage + statement + note + '</div>';
  }).join('');
  return '<div class="rt-block"><div class="rt-block-label"><i class="fas fa-quote-left"></i> Ví dụ minh hoạ</div>' + cards + '</div>';
}

function rtRenderCallout(data) {
  const title = data.title ? '<div class="rt-callout-title">' + escHtml(data.title) + '</div>' : '';
  return '<div class="rt-block"><div class="rt-callout">' + title + '<div class="rt-callout-text">' + escHtml(data.text) + '</div></div></div>';
}

function rtRenderTable(data) {
  const headers = (data.headers || []).map(h => '<th>' + escHtml(h) + '</th>').join('');
  const rows = (data.rows || []).map(row => '<tr>' + row.map(c => '<td>' + escHtml(c) + '</td>').join('') + '</tr>').join('');
  const title = data.title ? '<div class="rt-table-title">' + escHtml(data.title) + '</div>' : '';
  return '<div class="rt-block">' + title
    + '<div class="rt-table-wrap"><table class="rt-table"><thead><tr>' + headers + '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
}

function rtRenderSummary(text) {
  return '<div class="rt-block"><div class="rt-block-label"><i class="fas fa-flag-checkered"></i> Tóm tắt</div>'
    + '<div class="rt-summary-box">' + escHtml(text) + '</div></div>';
}

// Reference material, not a gradeable drill (see file header) — double-click
// word lookup is on unconditionally, no exam/quiz gate needed. #rt-main-
// content already exists in reading.html's static markup by the time this
// script runs, so this can attach once here rather than after every render.
if (typeof setupDictionaryDouble === 'function') {
  setupDictionaryDouble('rt-main-content', 'reading-tips');
}
