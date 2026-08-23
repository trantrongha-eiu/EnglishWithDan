'use strict';
// Speaking Tips — its own screen on speaking.html (opened from the home
// screen's "Speaking Tips" card, alongside "Tài liệu"/"Lịch sử"), mirroring
// frontend/js/writing-tips.js exactly (sst- prefixed here; amber accent —
// see css/speaking-extra.css). Same flexible 'example' block shape
// ({label, lines:[{tag,text}], note}) as Writing Tips, since Speaking
// content pairs things up the same varied way (Q/A samples, Band 6/7/8
// comparisons, etc.).
//
// `apiFetch`/`showScreen` are globals defined in speaking.js, and
// `escHtml`/`escAttr` come from js/shared/utils.js — both loaded before
// this file. This file itself is loaded BEFORE speaking.js (see
// speaking.html) since speaking.js's init can call initSpeakingTips()
// synchronously on page load for a ?tab=speaking-tips deep link.

const SST_LAST_LESSON_KEY = 'sst_last_lesson';
const SST_COLLAPSED_KEY = 'sst_collapsed_categories';
const SST_READ_KEY = 'sst_read_lessons';

let sstLessons = [];
let sstCategories = [];
let sstCurrentKey = null;
let sstLoaded = false; // guards against re-fetching every time the screen is reopened
// Guarded — a malformed value here (partial write from a storage-quota
// error, manual edit, future format change) previously threw synchronously
// at script-parse time, aborting this whole file (including initSpeakingTips)
// before speaking.js even loads, permanently stranding the Speaking Tips
// screen on its loading placeholder with no error shown.
function _sstSafeParse(json, fallback) {
  if (json == null) return fallback;
  try { return JSON.parse(json); } catch { return fallback; }
}
let sstCollapsed = new Set(_sstSafeParse(localStorage.getItem(SST_COLLAPSED_KEY), []));
let sstRead = new Set(_sstSafeParse(localStorage.getItem(SST_READ_KEY), []));

function sstKeyOf(l) { return l.category + '||' + l.lessonKey; }

function sstMarkRead(key) {
  if (sstRead.has(key)) return;
  sstRead.add(key);
  localStorage.setItem(SST_READ_KEY, JSON.stringify([...sstRead]));
}

async function initSpeakingTips() {
  if (sstLoaded) return;
  sstLoaded = true;
  try {
    const data = await apiFetch('/api/speaking-tips/lessons');
    if (!data.success) throw new Error('load failed');
    sstLessons = data.lessons || [];
    sstCategories = [...new Set(sstLessons.map(l => l.category))];

    const savedKey = localStorage.getItem(SST_LAST_LESSON_KEY);
    const savedLesson = savedKey && sstLessons.find(l => sstKeyOf(l) === savedKey);
    const initialLesson = savedLesson || sstLessons[0] || null;
    sstCurrentKey = initialLesson ? sstKeyOf(initialLesson) : null;

    sstRenderSidebar();
    if (sstCurrentKey) sstSelectLesson(sstCurrentKey);
    else document.getElementById('sst-main-content').innerHTML = '<div class="sst-loading">Chưa có nội dung.</div>';
  } catch (err) {
    sstLoaded = false; // allow a retry (e.g. transient network error) next time the screen opens
    document.getElementById('sst-main-content').innerHTML =
      '<div class="sst-loading"><div class="sst-loading-icon">⚠️</div>Không tải được nội dung. Vui lòng thử lại sau.</div>';
    if (typeof showToast === 'function') showToast('Không tải được Speaking Tips', 'error');
  }
}

function sstRenderSidebar() {
  let html = '';
  sstCategories.forEach(cat => {
    const lessons = sstLessons.filter(l => l.category === cat).sort((a, b) => a.orderIndex - b.orderIndex);
    if (!lessons.length) return;
    const isCollapsed = sstCollapsed.has(cat);
    html += '<div class="sst-cat-group' + (isCollapsed ? ' collapsed' : '') + '" data-cat="' + escAttr(cat) + '">'
      + '<button class="sst-cat-header" onclick="sstToggleCategory(' + JSON.stringify(cat).replace(/"/g, '&quot;') + ')">'
      + '<span>' + escHtml(cat) + '</span>'
      + '<span class="sst-cat-count">' + lessons.length + '</span>'
      + '<i class="fas fa-chevron-down sst-cat-chevron"></i>'
      + '</button>'
      + '<div class="sst-lesson-list">'
      + lessons.map(l => {
          const k = sstKeyOf(l);
          const active = k === sstCurrentKey ? ' active' : '';
          const done = sstRead.has(k) ? '<i class="fas fa-check-circle sst-done-icon" title="Đã xem"></i>' : '';
          return '<button class="sst-lesson-item' + active + '" onclick="sstSelectLesson(' + JSON.stringify(k).replace(/"/g, '&quot;') + ')">'
            + '<span class="sst-lesson-icon">' + (l.icon || '🎙️') + '</span>'
            + '<span class="sst-lesson-title">' + escHtml(l.title) + '</span>' + done + '</button>';
        }).join('')
      + '</div></div>';
  });
  const el = document.getElementById('sst-cat-list');
  if (el) el.innerHTML = html || '<div class="sst-no-results">Chưa có nội dung.</div>';
}

function sstToggleCategory(cat) {
  if (sstCollapsed.has(cat)) sstCollapsed.delete(cat); else sstCollapsed.add(cat);
  localStorage.setItem(SST_COLLAPSED_KEY, JSON.stringify([...sstCollapsed]));
  sstRenderSidebar();
}

function sstSelectLesson(key) {
  const lesson = sstLessons.find(l => sstKeyOf(l) === key);
  if (!lesson) return;
  sstCurrentKey = key;
  localStorage.setItem(SST_LAST_LESSON_KEY, key);
  sstMarkRead(key);
  sstRenderSidebar();
  sstRenderLessonContent(lesson);
  const panel = document.getElementById('screen-speaking-tips');
  if (panel) panel.scrollTo({ top: 0, behavior: 'smooth' });
}

function sstRenderLessonContent(lesson) {
  let html = '<div class="sst-hero">'
    + '<div class="sst-hero-cat">' + escHtml(lesson.category) + '</div>'
    + '<h1 class="sst-hero-title">' + (lesson.icon || '🎙️') + ' ' + escHtml(lesson.title) + '</h1>'
    + '</div>';
  html += '<div class="sst-content">' + lesson.blocks.map(sstRenderBlock).join('') + '</div>';
  document.getElementById('sst-main-content').innerHTML = html;
}

function sstRenderBlock(block) {
  switch (block.type) {
    case 'overview': return sstRenderOverview(block.data);
    case 'steps':    return sstRenderSteps(block.data);
    case 'list':     return sstRenderList(block.data);
    case 'example':  return sstRenderExample(block.data);
    case 'callout':  return sstRenderCallout(block.data);
    case 'table':    return sstRenderTable(block.data);
    case 'summary':  return sstRenderSummary(block.data);
    default: return '';
  }
}

function sstRenderOverview(text) {
  return '<div class="sst-block"><div class="sst-block-label"><i class="fas fa-book-open"></i> Tổng quan</div>'
    + '<div class="sst-overview-text">' + escHtml(text) + '</div></div>';
}

function sstRenderSteps(items) {
  const rows = (items || []).map(s =>
    '<div class="sst-step-item"><span class="sst-step-num"><i class="fas fa-arrow-right"></i></span>'
    + '<div><div class="sst-step-title">' + escHtml(s.title) + '</div>'
    + '<div class="sst-step-desc">' + escHtml(s.description) + '</div></div></div>'
  ).join('');
  return '<div class="sst-block"><div class="sst-block-label"><i class="fas fa-list-ol"></i> Quy trình</div>' + rows + '</div>';
}

function sstRenderList(data) {
  const items = (data.items || []).map(t =>
    '<div class="sst-list-item"><i class="fas fa-circle"></i><span>' + escHtml(t) + '</span></div>'
  ).join('');
  const title = data.title ? '<div class="sst-list-title">' + escHtml(data.title) + '</div>' : '';
  return '<div class="sst-block">' + title + items + '</div>';
}

// { label, lines: [{tag, text}], note }
function sstRenderExample(items) {
  const cards = (items || []).map(ex => {
    const label = ex.label ? '<div class="sst-example-label">' + escHtml(ex.label) + '</div>' : '';
    const lines = (ex.lines || []).map(ln =>
      '<div class="sst-example-row"><strong>' + escHtml(ln.tag) + ':</strong> ' + escHtml(ln.text) + '</div>'
    ).join('');
    const note = ex.note ? '<div class="sst-example-note">' + escHtml(ex.note) + '</div>' : '';
    return '<div class="sst-example-item">' + label + lines + note + '</div>';
  }).join('');
  return '<div class="sst-block"><div class="sst-block-label"><i class="fas fa-quote-left"></i> Ví dụ minh hoạ</div>' + cards + '</div>';
}

function sstRenderCallout(data) {
  const title = data.title ? '<div class="sst-callout-title">' + escHtml(data.title) + '</div>' : '';
  return '<div class="sst-block"><div class="sst-callout">' + title + '<div class="sst-callout-text">' + escHtml(data.text) + '</div></div></div>';
}

function sstRenderTable(data) {
  const headers = (data.headers || []).map(h => '<th>' + escHtml(h) + '</th>').join('');
  const rows = (data.rows || []).map(row => '<tr>' + row.map(c => '<td>' + escHtml(c) + '</td>').join('') + '</tr>').join('');
  const title = data.title ? '<div class="sst-table-title">' + escHtml(data.title) + '</div>' : '';
  return '<div class="sst-block">' + title
    + '<div class="sst-table-wrap"><table class="sst-table"><thead><tr>' + headers + '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
}

function sstRenderSummary(text) {
  return '<div class="sst-block"><div class="sst-block-label"><i class="fas fa-flag-checkered"></i> Tóm tắt</div>'
    + '<div class="sst-summary-box">' + escHtml(text) + '</div></div>';
}

// Reference material, not a gradeable drill — double-click word lookup is on
// unconditionally, no exam/quiz gate needed. #sst-main-content already
// exists in speaking.html's static markup by the time this script runs, so
// this can attach once here rather than after every render.
if (typeof setupDictionaryDouble === 'function') {
  setupDictionaryDouble('sst-main-content', 'speaking-tips');
}
