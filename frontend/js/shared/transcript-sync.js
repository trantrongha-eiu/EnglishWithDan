/* ══════════════════════════════════════════════════════════════════════
   TranscriptSync — highlights the sentence the speaker is saying (and the
   word inside it) while a Listening audio plays.

   Timing comes from the server as one entry per raw transcript token
   (text.split(/\s+/)) — see backend/services/transcriptTimingService.js
   (encodeTiming/decodeTiming must stay in step). The rendered transcript
   is matched back to those tokens by walking its text nodes, so renderers
   don't change at all.

   Painted with the CSS Custom Highlight API: no DOM changes, so the
   student's own highlights (surroundContents + text-offset storage),
   double-click dictionary and text selection keep working exactly as
   before. Browsers without it fall back to tinting the current paragraph.

     TranscriptSync.attach({ container, audio, text, timing,
                             blankSelector?, skipSelector?, autoScroll?, topInset? })
     TranscriptSync.detach(container)
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    var HAS_CSS_HL = typeof CSS !== 'undefined' && CSS.highlights && typeof window.Highlight === 'function';
    var LINE = 'ts-line', WORD = 'ts-word';
    var controllers = new Map(); // container -> controller
    var owner = null;            // controller currently painting

    function decode(str) {
        if (!str) return null;
        var prev = 0;
        return String(str).split(',').map(function (e) {
            if (!e) return null;
            var p = e.split('.');
            var a = p[0];
            var s = prev + (a.charAt(0) === '-' ? -parseInt(a.slice(1), 36) : parseInt(a, 36));
            prev = s;
            return [s / 100, (s + parseInt(p[1], 36)) / 100];
        });
    }

    function norm(w) { return String(w).toLowerCase().replace(/[^a-z0-9']/g, ''); }

    var ABBREV = /^(mr|mrs|ms|dr|st|vs|etc|a\.m|p\.m|e\.g|i\.e)\.$/i;
    function endsSentence(word) {
        return /[.?!…]["'”’)\]]*$/.test(word) && !ABBREV.test(word.replace(/^["'“‘(]+/, ''));
    }

    var BLOCK_SEL = 'p, li, div, td, h1, h2, h3, h4, h5, h6';

    // DOM tokens of the container, each mapped to a raw-token index.
    function scan(c) {
        var raw = String(c.text || '').split(/\s+/).filter(Boolean);
        var rawNorm = raw.map(norm);
        var timing = c.times;
        var toks = [];
        var walker = document.createTreeWalker(c.container, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
            acceptNode: function (n) {
                if (n.nodeType === 1) {
                    if (c.skipSelector && n.matches(c.skipSelector)) return NodeFilter.FILTER_REJECT;
                    if (c.blankSelector && n.matches(c.blankSelector)) return NodeFilter.FILTER_ACCEPT;
                    return NodeFilter.FILTER_SKIP;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var last = -1;          // raw index of the previous DOM token
        var glued = false;      // previous item ended with no whitespace after it
        var prevBlock = null;
        var n;
        while ((n = walker.nextNode())) {
            var block = (n.nodeType === 1 ? n : n.parentElement).closest(BLOCK_SEL) || c.container;
            if (block !== prevBlock) glued = false;
            prevBlock = block;
            if (n.nodeType === 1) {
                // A gap-fill blank stands for the raw token holding [[n]].
                var idx = parseInt(n.getAttribute('data-idx'), 10);
                var want = '[[' + (idx + 1) + ']]';
                var found = -1;
                for (var j = Math.max(0, glued ? last : last + 1); j < raw.length && j <= last + 12; j++) {
                    if (raw[j].indexOf(want) !== -1) { found = j; break; }
                }
                if (found !== -1) last = found;
                toks.push({ el: n, block: block, ri: found, word: '' });
                glued = true;
                continue;
            }
            var data = n.data;
            var re = /\S+/g, r;
            var any = false;
            while ((r = re.exec(data))) {
                var word = r[0];
                var stuck = r.index === 0 && glued;
                var nw = norm(word);
                var ri = -1;
                if (stuck || !nw) {
                    ri = last;
                } else {
                    for (var k = last + 1; k < raw.length && k <= last + 12; k++) {
                        var rn = rawNorm[k];
                        if (rn === nw || (rn && (rn.indexOf(nw) === 0 || nw.indexOf(rn) === 0))) { ri = k; break; }
                    }
                    if (ri !== -1) last = ri;
                }
                toks.push({ node: n, start: r.index, end: r.index + word.length, block: block, ri: ri, word: word });
                any = true;
                glued = r.index + word.length === data.length;
            }
            if (!any && data.length) glued = false;
        }
        toks.forEach(function (t) { t.time = t.ri >= 0 && timing[t.ri] ? timing[t.ri] : null; });
        return toks;
    }

    // Nobody pauses this long inside a sentence: a bigger jump between two
    // timed words means the audio went elsewhere (question-reading time, an
    // example played twice), so the sentence is split there — otherwise its
    // highlight would sit frozen through the whole gap.
    var MAX_GAP = 3;

    function groupsOf(toks) {
        var groups = [], cur = null, lastTime = null;
        toks.forEach(function (t, i) {
            var prev = toks[i - 1];
            var brk = !cur || t.block !== cur.block || (prev && prev.word && endsSentence(prev.word) && t.ri !== prev.ri) ||
                (t.time && lastTime && (t.time[0] - lastTime[1] > MAX_GAP || t.time[0] < lastTime[0] - MAX_GAP));
            if (brk) { cur = { block: t.block, toks: [] }; groups.push(cur); }
            cur.toks.push(t);
            if (t.time) lastTime = t.time;
        });
        return groups.map(function (g) {
            var timed = g.toks.filter(function (t) { return t.time; });
            if (!timed.length) return null;
            var a = timed[0], b = timed[timed.length - 1];
            var range = document.createRange();
            if (a.el) range.setStartBefore(a.el); else range.setStart(a.node, a.start);
            if (b.el) range.setEndAfter(b.el); else range.setEnd(b.node, b.end);
            return {
                t0: a.time[0], t1: b.time[1], range: range, block: g.block,
                words: timed,
                blanks: g.toks.filter(function (t) { return t.el; }).map(function (t) { return t.el; }),
            };
        }).filter(Boolean).sort(function (x, y) { return x.t0 - y.t0; }); // update() binary-searches by t0
    }

    function visible(el) { return el.isConnected && el.getClientRects().length > 0; }

    function scrollParent(el) {
        for (var p = el; p && p !== document.body; p = p.parentElement) {
            var oy = getComputedStyle(p).overflowY;
            if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight + 4) return p;
        }
        return null;
    }

    function clearPaint() {
        if (HAS_CSS_HL) { CSS.highlights.delete(LINE); CSS.highlights.delete(WORD); }
        if (owner) {
            if (owner.activeBlock) owner.activeBlock.classList.remove('ts-active-block');
            if (owner.activeWord && owner.activeWord.el) owner.activeWord.el.classList.remove('ts-now');
            (owner.activeBlanks || []).forEach(function (el) { el.classList.remove('ts-active'); });
            owner.activeBlock = null; owner.activeBlanks = [];
            owner.active = null; owner.activeWord = null;
        }
        owner = null;
    }

    function Controller(opts) {
        this.container = opts.container;
        this.audio = opts.audio;
        this.text = opts.text;
        this.times = decode(opts.timing) || [];
        this.blankSelector = opts.blankSelector || '';
        this.skipSelector = opts.skipSelector || '';
        this.autoScroll = opts.autoScroll !== false;
        this.shouldScroll = typeof opts.autoScroll === 'function' ? opts.autoScroll : null;
        this.topInset = typeof opts.topInset === 'function' ? opts.topInset : null; // sticky header over a page-scrolled transcript
        this.groups = null;
        this.active = null; this.activeWord = null;
        this.activeBlock = null; this.activeBlanks = [];
        this.userScrollAt = 0;
        this.raf = 0;
        var self = this;
        this.dirty = true;
        this.mo = new MutationObserver(function () { self.dirty = true; if (owner === self) self.active = null; });
        this.mo.observe(this.container, { childList: true, subtree: true, characterData: true });
        this.onTime = function () { self.update(); };
        this.onPlay = function () { self.loop(); };
        this.onUserScroll = function () { self.userScrollAt = Date.now(); };
        ['timeupdate', 'seeked'].forEach(function (ev) { self.audio.addEventListener(ev, self.onTime); });
        this.audio.addEventListener('play', this.onPlay);
        window.addEventListener('wheel', this.onUserScroll, { passive: true });
        window.addEventListener('touchmove', this.onUserScroll, { passive: true });
        if (!this.audio.paused) this.loop();
    }

    Controller.prototype.loop = function () {
        var self = this;
        cancelAnimationFrame(this.raf);
        var tick = function () {
            if (self.destroyed || self.audio.paused) return;
            self.update();
            self.raf = requestAnimationFrame(tick);
        };
        this.raf = requestAnimationFrame(tick);
    };

    Controller.prototype.update = function () {
        if (this.destroyed || !visible(this.container)) {
            if (owner === this) clearPaint();
            return;
        }
        if (this.dirty) {
            this.dirty = false;
            this.groups = groupsOf(scan(this));
            if (owner === this) clearPaint();
        }
        var t = this.audio.currentTime;
        var gs = this.groups, g = null;
        // Last group started at or before t, still within its own span
        // (plus a short tail so the highlight doesn't flicker off between
        // sentences).
        var lo = 0, hi = gs.length - 1, at = -1;
        while (lo <= hi) { var mid = (lo + hi) >> 1; if (gs[mid].t0 <= t) { at = mid; lo = mid + 1; } else hi = mid - 1; }
        if (at >= 0) {
            var next = gs[at + 1];
            var tail = Math.min(1.2, next ? Math.max(0, next.t0 - gs[at].t1) : 1.2);
            if (t <= gs[at].t1 + tail) g = gs[at];
        }
        var w = null;
        if (g) {
            for (var i = 0; i < g.words.length; i++) {
                var tm = g.words[i].time;
                if (tm[0] <= t + 0.05) w = g.words[i]; else break;
            }
            if (w && t > w.time[1] + 0.35) w = null;
        }
        if (owner !== this) { clearPaint(); owner = this; }
        if (g !== this.active) this.paintLine(g);
        if (w !== this.activeWord) this.paintWord(w);
    };

    Controller.prototype.paintLine = function (g) {
        this.active = g;
        if (this.activeBlock) this.activeBlock.classList.remove('ts-active-block');
        this.activeBlanks.forEach(function (el) { el.classList.remove('ts-active'); });
        this.activeBlock = null; this.activeBlanks = [];
        if (HAS_CSS_HL) {
            if (g) CSS.highlights.set(LINE, new Highlight(g.range)); else CSS.highlights.delete(LINE);
        }
        if (!g) return;
        if (!HAS_CSS_HL && g.block !== this.container) { g.block.classList.add('ts-active-block'); this.activeBlock = g.block; }
        g.blanks.forEach(function (el) { el.classList.add('ts-active'); });
        this.activeBlanks = g.blanks;
        this.scrollTo(g);
    };

    Controller.prototype.paintWord = function (w) {
        if (this.activeWord && this.activeWord.el) this.activeWord.el.classList.remove('ts-now');
        this.activeWord = w;
        // A gap-fill blank's own word is being said right now.
        if (w && w.el) w.el.classList.add('ts-now');
        if (!HAS_CSS_HL) return;
        if (!w || w.el) { CSS.highlights.delete(WORD); return; }
        var r = document.createRange();
        r.setStart(w.node, w.start); r.setEnd(w.node, w.end);
        var h = new Highlight(r);
        h.priority = 1; // paints over the sentence highlight
        CSS.highlights.set(WORD, h);
    };

    // Keeps the current sentence in view — unless the student scrolled
    // away in the last few seconds, or the page says not now (e.g. typing
    // in a gap-fill blank).
    Controller.prototype.scrollTo = function (g) {
        if (!this.autoScroll || this.audio.paused) return;
        if (Date.now() - this.userScrollAt < 4000) return;
        if (this.shouldScroll && !this.shouldScroll()) return;
        var rect = g.range.getBoundingClientRect();
        if (!rect.height) return;
        var sp = scrollParent(this.container);
        var top, bottom;
        if (sp) { var pr = sp.getBoundingClientRect(); top = pr.top; bottom = pr.bottom; }
        else { top = this.topInset ? this.topInset() || 0 : 0; bottom = window.innerHeight; }
        var margin = Math.min(120, (bottom - top) * 0.2);
        if (rect.top >= top + margin && rect.bottom <= bottom - margin) return;
        var delta = rect.top - (top + (bottom - top) * 0.35);
        if (sp) sp.scrollBy({ top: delta, behavior: 'smooth' });
        else window.scrollBy({ top: delta, behavior: 'smooth' });
    };

    Controller.prototype.destroy = function () {
        this.destroyed = true;
        cancelAnimationFrame(this.raf);
        this.mo.disconnect();
        var self = this;
        ['timeupdate', 'seeked'].forEach(function (ev) { self.audio.removeEventListener(ev, self.onTime); });
        this.audio.removeEventListener('play', this.onPlay);
        window.removeEventListener('wheel', this.onUserScroll);
        window.removeEventListener('touchmove', this.onUserScroll);
        if (owner === this) clearPaint();
    };

    function detach(container) {
        var c = controllers.get(container);
        if (c) { c.destroy(); controllers.delete(container); }
    }

    function attach(opts) {
        if (!opts || !opts.container || !opts.audio) return null;
        detach(opts.container);
        var times = decode(opts.timing);
        var rawCount = String(opts.text || '').split(/\s+/).filter(Boolean).length;
        // Timing made for another version of the text — show nothing
        // rather than highlight the wrong words.
        if (!times || times.length !== rawCount) return null;
        var c = new Controller(opts);
        controllers.set(opts.container, c);
        c.update();
        return c;
    }

    window.TranscriptSync = { attach: attach, detach: detach, decode: decode, supported: HAS_CSS_HL };
})();
