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
 * before — each page keeps its own text-based helpers for that half.
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
    readLocal: readLocal,
    writeLocal: writeLocal,
    removeLocal: removeLocal,
    saveRemote: saveRemote,
    flush: flush,
  };
})();
