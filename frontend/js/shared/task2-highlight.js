/* Model-answer structure highlighting: Task 2 ("Bài mẫu từ Daniel" on
 * writing.html + the Band 7+ model essay on task2-template.html) and Task 1
 * ("Model answers from Daniel" on writing.html — paraphrase / overview /
 * topic / detail / comparison).
 *
 * A section carries `highlights: [{ role, text }]` where `text` is an exact
 * sentence of the section body (see backend/scripts/data/
 * task2SampleHighlights.js). html() escapes the body and wraps each matched
 * sentence in a colour-coded span; a sentence that no longer matches (the
 * body was edited in admin) is simply left plain. The role label is drawn
 * by CSS ::before from data-label, so copying the text (textContent) never
 * picks up "Topic"/"Idea 1" tags.
 *
 * Styles: css/task2-highlight.css. The on/off choice is a per-viewer
 * convenience kept in localStorage.
 */
(function () {
  'use strict';

  // Keep in sync with ROLES in backend/scripts/data/task2SampleHighlights.js.
  // Task 2: hook/thesis · topic/idea/support · restate/final.
  // Task 1: paraphrase · overview · topic/detail/compare.
  const ROLES = [
    { key: 'hook',       part: 'intro',    tag: 'Hook',       name: 'Hook',            vi: 'câu mở đầu dẫn vào chủ đề' },
    { key: 'thesis',     part: 'intro',    tag: 'Thesis',     name: 'Thesis statement', vi: 'nêu quan điểm / hướng bài viết' },
    { key: 'paraphrase', part: 'intro',    tag: 'Paraphrase', name: 'Paraphrase',      vi: 'giới thiệu biểu đồ (viết lại đề)' },
    { key: 'overview',   part: 'overview', tag: 'Overview',   name: 'Overview',        vi: 'đặc điểm nổi bật, không số liệu' },
    { key: 'topic',      part: 'body',     tag: 'Topic',      name: 'Topic sentence',  vi: 'câu chủ đề của đoạn' },
    { key: 'idea1',      part: 'body',     tag: 'Idea 1',     name: 'Idea 1',          vi: 'ý chính thứ nhất' },
    { key: 'support1',   part: 'body',     tag: 'Support 1',  name: 'Supporting 1',    vi: 'giải thích / ví dụ cho ý 1' },
    { key: 'idea2',      part: 'body',     tag: 'Idea 2',     name: 'Idea 2',          vi: 'ý chính thứ hai' },
    { key: 'support2',   part: 'body',     tag: 'Support 2',  name: 'Supporting 2',    vi: 'giải thích / ví dụ cho ý 2' },
    { key: 'detail',     part: 'body',     tag: 'Detail',     name: 'Detail',          vi: 'số liệu / chi tiết cụ thể' },
    { key: 'compare',    part: 'body',     tag: 'Compare',    name: 'Comparison',      vi: 'so sánh, đối chiếu' },
    { key: 'restate',    part: 'concl',    tag: 'Restate',    name: 'Restatement',     vi: 'nhắc lại quan điểm (diễn đạt khác)' },
    { key: 'final',      part: 'concl',    tag: 'Final',      name: 'Final statement', vi: 'câu chốt cuối bài' },
  ];
  const PARTS = [
    { key: 'intro',    vi: 'Mở bài' },
    { key: 'overview', vi: 'Overview' },
    { key: 'body',     vi: 'Thân bài' },
    { key: 'concl',    vi: 'Kết bài' },
  ];
  const BY_KEY = Object.fromEntries(ROLES.map(r => [r.key, r]));
  const PREF_KEY = 't2hl:off';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // Whitespace-tolerant literal matcher (stored sentences are
  // whitespace-collapsed; the body may contain line breaks/double spaces).
  function sentenceRe(text) {
    const parts = String(text).trim().split(/\s+/).map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(parts.join('\\s+'), 'g');
  }

  // → [{ start, end, role }] sorted, non-overlapping.
  function locate(text, highlights) {
    const ranges = [];
    let cursor = 0;
    const overlaps = (s, e) => ranges.some(r => s < r.end && e > r.start);
    for (const h of highlights || []) {
      if (!h || !BY_KEY[h.role] || !String(h.text || '').trim()) continue;
      const re = sentenceRe(h.text);
      re.lastIndex = cursor;
      let m = re.exec(text);
      if (!m || overlaps(m.index, m.index + m[0].length)) {
        // Out of order — retry from the top, still refusing overlaps.
        re.lastIndex = 0;
        m = null;
        let x;
        while ((x = re.exec(text))) {
          if (!overlaps(x.index, x.index + x[0].length)) { m = x; break; }
        }
      }
      if (!m) continue;
      ranges.push({ start: m.index, end: m.index + m[0].length, role: h.role });
      cursor = m.index + m[0].length;
    }
    return ranges.sort((a, b) => a.start - b.start);
  }

  // Escaped HTML of `text` with each highlighted sentence wrapped. Only the
  // first sentence of a run of the same role shows the role label.
  function html(text, highlights) {
    const src = String(text == null ? '' : text);
    const ranges = locate(src, highlights);
    if (!ranges.length) return esc(src);
    let out = '', pos = 0, prevRole = null, prevEnd = -1;
    for (const r of ranges) {
      out += esc(src.slice(pos, r.start));
      const continues = r.role === prevRole && !src.slice(prevEnd, r.start).trim();
      const role = BY_KEY[r.role];
      out += `<span class="t2hl t2hl--${r.role}"${continues ? '' : ` data-label="${esc(role.tag)}"`} title="${esc(role.name + ' — ' + role.vi)}">` +
        esc(src.slice(r.start, r.end)) + '</span>';
      pos = r.end; prevRole = r.role; prevEnd = r.end;
    }
    return out + esc(src.slice(pos));
  }

  function hasAny(sections) {
    return (sections || []).some(s => Array.isArray(s && s.highlights) && s.highlights.length);
  }

  function isOff() {
    try { return localStorage.getItem(PREF_KEY) === '1'; } catch (_) { return false; }
  }

  // Legend for the roles actually used in `sections`, one row per part of
  // the essay (Mở bài / Thân bài / Kết bài), with an on/off toggle.
  function legend(sections) {
    const used = new Set();
    (sections || []).forEach(s => (s && s.highlights || []).forEach(h => used.add(h.role)));
    const chips = PARTS.map(p => {
      const roles = ROLES.filter(r => r.part === p.key && used.has(r.key));
      if (!roles.length) return '';
      return `<div class="t2hl-row"><span class="t2hl-part">${esc(p.vi)}</span>` + roles.map(r =>
        `<span class="t2hl-chip t2hl-chip--${r.key}" title="${esc(r.name + ' — ' + r.vi)}"><b>${esc(r.name)}</b><small>${esc(r.vi)}</small></span>`).join('') +
        '</div>';
    }).join('');
    const off = isOff();
    return `<div class="t2hl-legend">` +
      `<div class="t2hl-legend-head"><span class="t2hl-legend-title">🎨 Cấu trúc bài viết</span>` +
      `<button type="button" class="t2hl-toggle" onclick="T2Highlight.toggle(this)" aria-pressed="${off ? 'false' : 'true'}">${off ? 'Bật tô màu' : 'Tắt tô màu'}</button></div>` +
      `<div class="t2hl-chips">${chips}</div></div>`;
  }

  // Apply the saved on/off preference to a container (call after render).
  function applyPref(root) {
    if (root) root.classList.toggle('t2hl-off', isOff());
  }

  function toggle(btn) {
    const root = btn && btn.closest('.t2hl-root');
    if (!root) return;
    const off = !root.classList.contains('t2hl-off');
    root.classList.toggle('t2hl-off', off);
    btn.textContent = off ? 'Bật tô màu' : 'Tắt tô màu';
    btn.setAttribute('aria-pressed', off ? 'false' : 'true');
    try { localStorage.setItem(PREF_KEY, off ? '1' : '0'); } catch (_) { /* private mode */ }
  }

  window.T2Highlight = { ROLES, PARTS, html, hasAny, legend, isOff, applyPref, toggle };
})();
