/**
 * shared/highlight-store.js — persistence for Reading/Listening highlights.
 *
 * Highlights used to live only in this browser's localStorage, stored as the
 * passage/transcript's whole highlighted HTML per attempt. So a review opened
 * on another device or browser, in a private window, after the browser
 * evicted site data (iOS Safari does after 7 days), or once localStorage
 * filled up (never pruned, a full test is ~100 KB of HTML) came back with no
 * highlights at all.
 *
 * Now every attempt's highlights are also saved on the server
 * (PUT /api/highlights/:kind/:attemptId, attempt.highlights) in a compact
 * shape, and localStorage keeps the same compact shape as an offline copy:
 *
 *   { v: 2, ts: <ms of last change>, parts: { "<passage/part idx>": {
 *       p: [[start, end, colorKey, text], ...],  // passage/transcript text offsets
 *       q: [text | { text, colorKey }, ...],      // questions panel, re-found by text
 *   } } }
 *
 * The passage/transcript renders identically while taking the test and in
 * review, so character offsets over its text are stable; `text` is kept too
 * so an offset that no longer matches (passage edited since) can still be
 * re-found. The questions panel renders differently in review (correct/wrong
 * markers, explanations), so for it only the highlighted text is kept, as
 * before — see extractTexts()/applyTexts().
 *
 * The bottom of this file is the click-a-highlight panel (recolor / remove),
 * which fires 'hl:changed' so the page re-saves.
 */
(function () {
  'use strict';

  var COLOR_RE = /hl-(green|purple|pink|orange)/;

  // ── Offsets ───────────────────────────────────────────────────────────

  // Every highlighted stretch inside `root` (an element or a fragment) as
  // [start, end, colorKey, text] over root's text. One .hl span = one range,
  // even when it contains inline markup (<b>, <i>…).
  function serialize(root) {
    if (!root) return [];
    var out = [];
    var off = 0;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node, lastEl = null;
    while ((node = walker.nextNode())) {
      var len = node.nodeValue.length;
      var hl = node.parentElement ? node.parentElement.closest('.hl') : null;
      if (hl && !root.contains(hl)) hl = null;
      if (hl && len) {
        var last = out[out.length - 1];
        if (last && lastEl === hl && last[1] === off) {
          last[1] += len;
          last[3] += node.nodeValue;
        } else {
          var m = (hl.className || '').match(COLOR_RE);
          out.push([off, off + len, m ? m[1] : '', node.nodeValue]);
          lastEl = hl;
        }
      }
      off += len;
    }
    return out.filter(function (r) { return r[3].trim(); });
  }

  // Same as serialize() for an HTML string (a tab cached while switching
  // passages). <template> parses inertly — no image loads.
  function serializeHtml(html) {
    if (!html) return [];
    var t = document.createElement('template');
    t.innerHTML = html;
    return serialize(t.content);
  }

  function _nearestIndexOf(full, text, near) {
    var best = -1, idx = full.indexOf(text), guard = 0;
    while (idx !== -1 && guard++ < 500) {
      if (best === -1 || Math.abs(idx - near) < Math.abs(best - near)) best = idx;
      idx = full.indexOf(text, idx + 1);
    }
    return best;
  }

  function _segments(root, s, e) {
    var segs = [];
    var off = 0;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      var len = node.nodeValue.length;
      var ns = off, ne = off + len;
      off = ne;
      if (ne <= s) continue;
      if (ns >= e) break;
      segs.push({ node: node, a: Math.max(s, ns) - ns, b: Math.min(e, ne) - ns });
    }
    return segs;
  }

  function _wrapSegment(seg, cls) {
    var target = seg.node;
    if (seg.a > 0) target = target.splitText(seg.a);
    if (seg.b - seg.a < target.nodeValue.length) target.splitText(seg.b - seg.a);
    var span = document.createElement('span');
    span.className = cls;
    target.parentNode.insertBefore(span, target);
    span.appendChild(target);
  }

  // Re-highlights `ranges` (from serialize()) inside a freshly rendered root.
  function apply(root, ranges) {
    if (!root || !Array.isArray(ranges) || !ranges.length) return;
    ranges.forEach(function (r) {
      if (!Array.isArray(r)) return;
      var s = r[0], e = r[1], color = r[2] || '', text = r[3] || '';
      var full = root.textContent;
      if (text && full.slice(s, e) !== text) {
        var idx = _nearestIndexOf(full, text, s);
        if (idx === -1) return; // text gone from the passage — skip it
        s = idx; e = idx + text.length;
      }
      if (!(e > s)) return;
      var cls = color ? 'hl hl-' + color : 'hl';
      var segs = _segments(root, s, e).filter(function (g) {
        return !(g.node.parentElement && g.node.parentElement.closest('.hl'));
      });
      if (!segs.length) return;
      // One span when the stretch sits inside a single element (what the
      // highlighter itself produces), so click-to-remove takes it whole.
      try {
        var range = document.createRange();
        range.setStart(segs[0].node, segs[0].a);
        range.setEnd(segs[segs.length - 1].node, segs[segs.length - 1].b);
        var span = document.createElement('span');
        span.className = cls;
        range.surroundContents(span);
        return;
      } catch (_) { /* crosses element boundaries — wrap piece by piece */ }
      segs.forEach(function (g) {
        if (g.node.nodeValue.slice(g.a, g.b).trim()) _wrapSegment(g, cls);
      });
    });
  }

  // ── Stored shape ──────────────────────────────────────────────────────

  function _legacyPart(entry) {
    var html = entry.passage || entry.transcript || null;
    return {
      p: typeof html === 'string' ? serializeHtml(html) : [],
      q: Array.isArray(entry.questionTexts) ? entry.questionTexts : [],
    };
  }

  // Accepts the v2 shape, the server's { ts, parts } and every older
  // localStorage shape ({ idx: { passage|transcript, questionTexts } } for a
  // full test, { passage|transcript, questionTexts } for a practice), and
  // returns { v: 2, ts, parts } — or null when there's nothing usable.
  function normalize(saved) {
    if (!saved || typeof saved !== 'object') return null;
    if (saved.parts && typeof saved.parts === 'object') {
      return { v: 2, ts: Number(saved.ts) || 0, parts: saved.parts };
    }
    var parts = {};
    if ('passage' in saved || 'transcript' in saved || 'questionTexts' in saved) {
      parts['0'] = _legacyPart(saved);
    } else {
      Object.keys(saved).forEach(function (k) {
        if (saved[k] && typeof saved[k] === 'object') parts[k] = _legacyPart(saved[k]);
      });
    }
    return { v: 2, ts: 0, parts: parts };
  }

  function isEmpty(data) {
    if (!data || !data.parts) return true;
    return !Object.keys(data.parts).some(function (k) {
      var p = data.parts[k];
      return p && ((p.p && p.p.length) || (p.q && p.q.length));
    });
  }

  // The more recently changed of the two (server wins a tie — it's the
  // copy that follows the student across devices).
  function pickNewer(local, remote) {
    if (remote && (!local || (remote.ts || 0) >= (local.ts || 0))) return remote;
    return local || null;
  }

  // Builds { v: 2, ts: now, parts } from { idx: { p, q } }, dropping empties.
  function build(partsIn) {
    var parts = {};
    Object.keys(partsIn || {}).forEach(function (k) {
      var part = partsIn[k];
      if (!part) return;
      var p = part.p || [], q = part.q || [];
      if (p.length || q.length) parts[k] = { p: p, q: q };
    });
    return { v: 2, ts: Date.now(), parts: parts };
  }

  // Server copy vs this browser's copy — the newer wins; if this browser's is
  // newer (an earlier upload failed), push it up again.
  function choose(kind, attemptId, local, remoteRaw) {
    var remote = normalize(remoteRaw);
    var chosen = pickNewer(local, remote);
    if (chosen && chosen === local && !isEmpty(local) && attemptId) saveRemote(kind, attemptId, local);
    return chosen;
  }

  // ── Questions panel (text-based) ──────────────────────────────────────

  // The highlighted texts in a questions panel's HTML. A plain string for a
  // default-colored highlight (unchanged shape, so old localStorage data and
  // code that doesn't know about colors keep working) or { text, colorKey }
  // when the student picked a non-default color via
  // the recolor/remove panel at the bottom of this file — applyTexts() below accepts either.
  function extractTexts(html) {
    if (!html) return [];
    var tpl = document.createElement('template'); // inert parse — no image loads
    tpl.innerHTML = html;
    return Array.prototype.map.call(tpl.content.querySelectorAll('.hl'), function (el) {
      var text = el.textContent;
      if (!text) return null;
      var m = el.className.match(COLOR_RE);
      return m ? { text: text, colorKey: m[1] } : text;
    }).filter(Boolean);
  }

  // Finds the first still-unhighlighted occurrence of each text in
  // `container` and wraps it in a <span class="hl"> — used to re-apply
  // highlights saved from exam mode onto review's freshly-rendered
  // (structurally different) questions markup. Best-effort: a highlight
  // whose text no longer appears verbatim (or that spanned multiple text
  // nodes) is silently skipped rather than breaking the render.
  function applyTexts(container, items) {
    if (!container || !items || !items.length) return;
    items.forEach(function (item) {
      var text = typeof item === 'string' ? item : item.text;
      var colorKey = typeof item === 'string' ? '' : (item.colorKey || '');
      if (!text || !text.trim()) return;
      var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          if (node.parentElement && node.parentElement.closest('.hl, .radio-opt, .checkbox-opt, input, textarea, select, button')) {
            return NodeFilter.FILTER_REJECT;
          }
          return node.nodeValue.includes(text) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      });
      var node = walker.nextNode();
      if (!node) return;
      var idx = node.nodeValue.indexOf(text);
      if (idx === -1) return;
      try {
        var range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + text.length);
        var span = document.createElement('span');
        span.className = colorKey ? 'hl hl-' + colorKey : 'hl';
        range.surroundContents(span);
      } catch (e) { /* text spans multiple nodes — skip rather than corrupt the DOM */ }
    });
  }

  // pending: a page's { idx: { p, q } } of highlights restored from
  // storage/server for a passage/part not rendered yet this session. Applies
  // entry `idx` to its freshly rendered panels and drops it. keepTextPending:
  // with no text panel on screen (Listening's exam mode shows no
  // transcript), keep the p half pending instead of dropping it.
  function applyPending(pending, idx, textRoot, questionsRoot, keepTextPending) {
    var pend = pending[idx];
    if (!pend) return;
    var hasP = !!(pend.p && pend.p.length);
    if (!keepTextPending) delete pending[idx];
    if (textRoot && hasP) apply(textRoot, pend.p);
    if (questionsRoot && pend.q && pend.q.length) applyTexts(questionsRoot, pend.q);
    if (keepTextPending) {
      if (textRoot || !hasP) delete pending[idx];
      else pending[idx] = { p: pend.p, q: [] };
    }
  }

  // ── localStorage ──────────────────────────────────────────────────────

  var KEY_RE = /^ews_(reading|listening)_hl_/;

  function readLocal(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? normalize(JSON.parse(raw)) : null;
    } catch (_) { return null; }
  }

  // When storage is full, drop every other attempt's highlight copy (the
  // server has them) and try once more.
  function writeLocal(key, data) {
    var json = JSON.stringify(data);
    try { localStorage.setItem(key, json); return; } catch (_) { /* full — prune below */ }
    try {
      var stale = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k !== key && KEY_RE.test(k)) stale.push(k);
      }
      stale.forEach(function (k) { localStorage.removeItem(k); });
      localStorage.setItem(key, json);
    } catch (_) { /* still unavailable — the server copy is what remains */ }
  }

  function removeLocal(key) {
    try { localStorage.removeItem(key); } catch (_) { /* unavailable */ }
  }

  // ── Server ────────────────────────────────────────────────────────────

  var DEBOUNCE_MS = 1500;
  var _jobs = {};   // "kind:id" -> { kind, attemptId, data }
  var _timers = {};

  function _apiBase() {
    return (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  }

  function _send(job, keepalive) {
    var headers = Object.assign({ 'Content-Type': 'application/json' },
      window.AuthService && window.AuthService.authHeader ? window.AuthService.authHeader() : {});
    if (!headers.Authorization) return;
    try {
      fetch(_apiBase() + '/highlights/' + encodeURIComponent(job.kind) + '/' + encodeURIComponent(job.attemptId), {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ highlights: { ts: job.data.ts, parts: job.data.parts } }),
        keepalive: !!keepalive,
      }).catch(function () { /* offline — the local copy is re-pushed next time the review opens */ });
    } catch (_) { /* fetch unavailable */ }
  }

  function _flushKey(key, keepalive) {
    clearTimeout(_timers[key]);
    delete _timers[key];
    var job = _jobs[key];
    if (!job) return;
    delete _jobs[key];
    _send(job, keepalive);
  }

  // Debounced: a burst of highlighting is one request.
  function saveRemote(kind, attemptId, data) {
    if (!kind || !attemptId || !data) return;
    var key = kind + ':' + attemptId;
    _jobs[key] = { kind: kind, attemptId: String(attemptId), data: data };
    clearTimeout(_timers[key]);
    _timers[key] = setTimeout(function () { _flushKey(key, false); }, DEBOUNCE_MS);
  }

  function flush(keepalive) {
    Object.keys(_jobs).forEach(function (k) { _flushKey(k, keepalive); });
  }

  // Leaving/hiding the page must not swallow a pending save.
  window.addEventListener('pagehide', function () { flush(true); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush(true);
  });

  window.HighlightStore = {
    serialize: serialize,
    serializeHtml: serializeHtml,
    apply: apply,
    normalize: normalize,
    isEmpty: isEmpty,
    pickNewer: pickNewer,
    build: build,
    choose: choose,
    extractTexts: extractTexts,
    applyTexts: applyTexts,
    applyPending: applyPending,
    readLocal: readLocal,
    writeLocal: writeLocal,
    removeLocal: removeLocal,
    saveRemote: saveRemote,
    flush: flush,
  };
})();

// ════════════════════════════════════════════════════════════════════════
//  Click a highlight → recolor / remove panel
// ════════════════════════════════════════════════════════════════════════
/* ═══════════════════════════════════════════════════════
   Recolor / remove panel — click a <span class="hl"> highlight to get a
   small floating panel right above it: a row of color swatches to
   re-color the highlight, plus a trash icon to remove it.
   Shared between reading.html (reading-v2.js) and listening.html, which
   both create highlights the same way (wrap the selection in
   <span class="hl">...</span> via Range.surroundContents) but previously
   had no way to remove or re-color one short of re-loading the page.
   Self-contained: no dependency on either page's own state object, so it
   works the same regardless of which tool (highlight/dict/none) is active.
   Any change (recolor or remove) fires a 'hl:changed' event on document —
   each page listens for that to persist its own highlights to localStorage
   (see the mouseup handler right next to it in reading-v2.js/listening.html
   for the save functions this mirrors).
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // key === '' is the original/default color (no extra class — the .hl
  // base rule's color, unchanged from before this palette existed, so
  // every highlight ever saved with plain class="hl" keeps looking the
  // same). The others add a modifier class defined in reading.css/listening.css.
  var COLORS = [
    { key: '', hex: '#fbbf24', label: 'Vàng (mặc định)' },
    { key: 'green', hex: '#4ade80', label: 'Xanh lá' },
    { key: 'purple', hex: '#c084fc', label: 'Tím' },
    { key: 'pink', hex: '#f472b6', label: 'Hồng' },
    { key: 'orange', hex: '#fb923c', label: 'Cam' },
  ];

  var _panel = null;
  var _activeSpan = null;

  // Two-phase so a page whose save routing depends on which container the
  // highlight lives in (e.g. listening.html's main-test vs practice-mode
  // storage) can inspect the span's still-attached ancestry in
  // 'hl:willChange' and remember it, then actually persist in 'hl:changed'
  // once the DOM mutation (recolor/removal) below has already happened —
  // by then the span may be detached (removal unwraps it), so ancestry
  // checks must happen in the "will" phase, not the "changed" one.
  function _fireWillChange() {
    document.dispatchEvent(new CustomEvent('hl:willChange', { detail: { span: _activeSpan } }));
  }
  function _fireChanged() {
    document.dispatchEvent(new CustomEvent('hl:changed'));
  }

  function _currentColorKey(span) {
    for (var i = 1; i < COLORS.length; i++) {
      if (span.classList.contains('hl-' + COLORS[i].key)) return COLORS[i].key;
    }
    return '';
  }

  function _applyColor(span, key) {
    for (var i = 1; i < COLORS.length; i++) span.classList.remove('hl-' + COLORS[i].key);
    if (key) span.classList.add('hl-' + key);
  }

  function _ensurePanel() {
    if (_panel) return _panel;
    _panel = document.createElement('div');
    _panel.id = 'hl-edit-panel';
    _panel.style.cssText = [
      'position:fixed', 'z-index:3000', 'display:none',
      'align-items:center', 'gap:6px',
      'background:#1f2937', 'border-radius:9px',
      'padding:6px 8px', 'box-shadow:0 6px 16px rgba(0,0,0,.25)', 'white-space:nowrap'
    ].join(';');

    COLORS.forEach(function (c) {
      var sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'hl-edit-swatch';
      sw.dataset.colorKey = c.key;
      sw.title = c.label;
      sw.style.cssText = [
        'width:20px', 'height:20px', 'border-radius:50%', 'cursor:pointer',
        'background:' + c.hex, 'padding:0', 'box-sizing:border-box'
      ].join(';');
      sw.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!_activeSpan) return;
        _fireWillChange();
        _applyColor(_activeSpan, c.key);
        _fireChanged();
        _hide();
      });
      _panel.appendChild(sw);
    });

    var divider = document.createElement('span');
    divider.style.cssText = 'width:1px;align-self:stretch;background:rgba(255,255,255,.25);margin:0 2px';
    _panel.appendChild(divider);

    var trash = document.createElement('button');
    trash.type = 'button';
    trash.id = 'hl-remove-btn';
    trash.title = 'Xóa highlight';
    trash.innerHTML = '<i class="fas fa-trash-alt"></i>';
    trash.style.cssText = [
      'background:none', 'border:none', 'color:#fff', 'font-size:13px',
      'cursor:pointer', 'padding:4px 2px', 'line-height:1'
    ].join(';');
    trash.addEventListener('click', function (e) {
      e.stopPropagation();
      _fireWillChange();
      _removeActiveHighlight();
      _fireChanged();
      _hide();
    });
    _panel.appendChild(trash);

    document.body.appendChild(_panel);
    return _panel;
  }

  function _removeActiveHighlight() {
    var span = _activeSpan;
    if (!span || !span.parentNode) return;
    var parent = span.parentNode;
    while (span.firstChild) parent.insertBefore(span.firstChild, span);
    parent.removeChild(span);
    parent.normalize(); // merge the now-adjacent text nodes back together
  }

  function _hide() {
    if (_panel) _panel.style.display = 'none';
    _activeSpan = null;
  }

  function _showFor(span) {
    var panel = _ensurePanel();
    _activeSpan = span;
    var activeKey = _currentColorKey(span);
    panel.querySelectorAll('.hl-edit-swatch').forEach(function (sw) {
      var isActive = sw.dataset.colorKey === activeKey;
      sw.style.boxShadow = isActive ? '0 0 0 2px #1f2937, 0 0 0 4px #fff' : 'none';
    });
    panel.style.display = 'flex';
    var rect = span.getBoundingClientRect();
    var left = rect.left + rect.width / 2 - panel.offsetWidth / 2;
    left = Math.max(6, Math.min(left, window.innerWidth - panel.offsetWidth - 6));
    var top = rect.top - panel.offsetHeight - 8;
    if (top < 6) top = rect.bottom + 8; // flip below when too close to the top of the viewport
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
  }

  document.addEventListener('click', function (e) {
    if (e.target === _panel || (_panel && _panel.contains(e.target))) return; // its own click handlers deal with this
    var span = e.target.closest && e.target.closest('span.hl');
    // A click that ends a drag-selection (extending/re-selecting across a
    // highlight) shouldn't pop the edit panel — only a plain click.
    var sel = window.getSelection();
    var hasLiveSelection = sel && !sel.isCollapsed && sel.toString().trim().length > 0;
    if (span && !hasLiveSelection) _showFor(span);
    else _hide();
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') _hide(); });
  window.addEventListener('scroll', _hide, true);
  window.addEventListener('resize', _hide);
})();
