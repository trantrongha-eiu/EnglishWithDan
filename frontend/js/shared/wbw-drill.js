/* ══════════════════════════════════════════════════════════════════════
   WbwDrill — reusable word-by-word "gõ từng chữ" typing drill.

   Same UX as the "Dịch câu" drill in Luyện viết Task 2 / Task 1 Grammar
   (frontend/task2-practice.html, .wbw-* in writing-practice.css): the answer
   is shown one word at a time as a masked pattern; the student types it
   letter by letter; a wrong character shakes red with an ✕ and is rejected
   (never auto-filled — active recall); a completed word turns green and the
   next word opens; the final word marks the drill done and calls onComplete().

   Self-contained: injects its own <style> on first use (prefixed .wbwd-* so it
   never collides with the page-local .wbw-* copies), Unicode-aware so it works
   for Vietnamese meanings as well as English words.

   Usage:
     WbwDrill.mount(hostEl, {
       answer:      'the canonical string to type',
       bridgeInput: <input>,        // optional: its .value is kept in sync so an
                                    //   existing check function can read it
       onComplete:  () => {...},    // called once, after the last word
     });
     WbwDrill.unmount(hostEl);
     WbwDrill.isActive(hostEl) -> bool   // mounted and not yet completed
   ══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var STYLE_ID = 'wbwd-styles';
  var CSS = [
    '.wbwd{margin-top:10px}',
    '.wbwd-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px;font-size:12px}',
    '.wbwd-count{background:#f3f4f6;color:#4b5563;border-radius:20px;padding:3px 11px;font-weight:800;white-space:nowrap;transition:background .2s,color .2s}',
    '.wbwd-count.is-full{background:#dcfce7;color:#15803d}',
    '.wbwd-showall{background:none;border:none;color:#6366f1;font-weight:700;font-size:12px;cursor:pointer;padding:2px 4px;display:inline-flex;align-items:center;gap:4px}',
    '.wbwd-showall:hover{text-decoration:underline}',
    '.wbwd-words{display:flex;flex-wrap:wrap;gap:7px 8px;padding:12px;border-radius:12px;background:#f9fafb;border:1px solid #eef0f3;min-height:44px;align-content:flex-start}',
    '.wbwd-word{font-family:"Courier New",ui-monospace,monospace;font-size:14px;font-weight:700;letter-spacing:.5px;padding:5px 10px;border-radius:8px;white-space:nowrap;background:#eef0f3;color:#9ca3af;border:1.5px solid transparent;transition:background .18s,color .18s,border-color .18s,transform .18s}',
    '.wbwd-word.is-peek{color:#6b7280;font-style:italic}',
    '.wbwd-word.is-done{background:#dcfce7;color:#15803d;border-color:#86efac}',
    '.wbwd-word.just-done{animation:wbwd-pop .34s ease}',
    '.wbwd-word.is-active{background:#fff;color:#111827;border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.15)}',
    '.wbwd-word.is-active .wbwd-star{color:#d1d5db}',
    '.wbwd-word.is-active.is-error{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.18);animation:wbwd-shake .24s ease}',
    '.wbwd-err{color:#ef4444}',
    '.wbwd-caret{display:inline-block;width:1px;margin:0 1px;border-left:2px solid #f59e0b;animation:wbwd-blink 1s step-end infinite}',
    '.wbwd-input{margin-top:10px;width:100%;box-sizing:border-box;font-family:"Courier New",ui-monospace,monospace;font-size:16px;font-weight:700;letter-spacing:1px;padding:10px 12px;border-radius:10px;border:1.5px solid #d1d5db;background:#fff;color:#111827;transition:border-color .18s,box-shadow .18s,background .18s}',
    '.wbwd-input:focus{outline:none;border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.15)}',
    '.wbwd-input.is-error{border-color:#ef4444;background:#fef2f2;box-shadow:0 0 0 3px rgba(239,68,68,.18);animation:wbwd-shake .24s ease}',
    '.wbwd-input:disabled{background:#f3f4f6;color:#9ca3af}',
    '.wbwd-hint{margin-top:7px;font-size:11.5px;color:#9ca3af}',
    '@keyframes wbwd-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}',
    '@keyframes wbwd-pop{0%{transform:scale(1)}45%{transform:scale(1.12)}100%{transform:scale(1)}}',
    '@keyframes wbwd-blink{50%{opacity:0}}',
    '[data-theme="dark"] .wbwd-words{background:#0f172a;border-color:#1e293b}',
    '[data-theme="dark"] .wbwd-word{background:#1e293b;color:#64748b}',
    '[data-theme="dark"] .wbwd-word.is-done{background:#052e16;color:#4ade80;border-color:#166534}',
    '[data-theme="dark"] .wbwd-word.is-active{background:#0d0d0d;color:#f1f5f9}',
    '[data-theme="dark"] .wbwd-count{background:#0d0d0d;color:#94a3b8}',
    '[data-theme="dark"] .wbwd-count.is-full{background:#052e16;color:#4ade80}',
    '[data-theme="dark"] .wbwd-input{background:#0d0d0d;border-color:#334155;color:#f1f5f9}',
    '[data-theme="dark"] .wbwd-input:disabled{background:#1e293b;color:#64748b}',
    '@media (max-width:640px){.wbwd-word{font-size:15px}}'
  ].join('');

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // A "typable" character = any Unicode letter or number. Everything else
  // (spaces, hyphens, punctuation) is auto-filled and stays visible in the
  // mask. \p{L}\p{N} with the u flag keeps Vietnamese diacritics intact.
  var TYPABLE = /[\p{L}\p{N}]/u;
  var NOT_TYPABLE = /[^\p{L}\p{N}]/gu;

  // True if the string has any non-ASCII char — used to auto-enable
  // per-word checking (Vietnamese Telex/VNI can't be validated per key).
  function _hasNonAscii(str) {
    str = String(str || "");
    for (var i = 0; i < str.length; i++) if (str.charCodeAt(i) > 127) return true;
    return false;
  }

  function nfc(s) {
    s = String(s == null ? '' : s);
    return s.normalize ? s.normalize('NFC') : s;
  }

  function tokenize(answer) {
    return nfc(answer).trim().split(/\s+/).filter(Boolean).map(function (raw) {
      var target = raw.replace(NOT_TYPABLE, '');
      var seen = false;
      var mask = Array.from(raw).map(function (ch) {
        if (TYPABLE.test(ch)) { if (!seen) { seen = true; return ch; } return '*'; }
        return ch;
      }).join('');
      return { raw: raw, target: target, mask: mask };
    }).filter(function (t) { return t.target.length > 0; });
  }

  // One drill instance bound to a host element.
  function Drill(host, opts) {
    this.host = host;
    this.answer = nfc(opts.answer);
    this.bridgeInput = opts.bridgeInput || null;
    this.onComplete = typeof opts.onComplete === 'function' ? opts.onComplete : function () {};
    this.tokens = tokenize(this.answer);
    this.activeIdx = 0;
    // Per-WORD checking (vs per-letter). Auto-on when the answer has non-ASCII
    // letters, i.e. Vietnamese: Telex/VNI compose one syllable from several
    // keystrokes ("muws" → "mứ"), so matching each keystroke against the
    // composed target ("ư" vs the "u" Telex needs first) makes the word
    // impossible to type. In per-word mode we accept whatever's in the box
    // and only advance once the whole current word matches (NFC, case-insens).
    this.perWord = (opts.perWord != null)
      ? !!opts.perWord
      : _hasNonAscii(this.answer);
    this.typed = '';
    this.showAll = false;
    this.erroring = false;
    this.done = false;
    this._errorTimer = null;
    this._completeTimer = null;

    this._onInput = this._onInput.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onPaste = function (e) { e.preventDefault(); };
    var self0 = this;
    // Validate on every `input` event (real-time, same as Luyện viết Task 2's
    // drill). We deliberately do NOT pause on compositionstart/compositionend:
    // Android IMEs keep a whole word in composition until space/punctuation,
    // so gating on it made each keystroke wait for the composition to end —
    // the "check bị delay" the drill must not have. compositionend just
    // re-runs the check as a safety net for IMEs that batch their input.
    this._onCompEnd = function () { self0._onInput(); };
    this._focus = this.focus.bind(this);

    this._render();
    this._bind();
    this._syncBridge(false);
    var self = this;
    setTimeout(function () { self.focus(); }, 30);
  }

  Drill.prototype._render = function () {
    this.host.innerHTML =
      '<div class="wbwd">' +
        '<div class="wbwd-bar">' +
          '<span class="wbwd-count" data-role="count">0 / 0 từ</span>' +
          '<button type="button" class="wbwd-showall" data-role="showall">' +
            '<i class="fas fa-eye"></i> <span>Hiện tất cả</span>' +
          '</button>' +
        '</div>' +
        '<div class="wbwd-words" data-role="words"></div>' +
        '<input class="wbwd-input" data-role="input" type="text" autocomplete="off" ' +
          'autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Gõ từng từ" />' +
        '<div class="wbwd-hint">Gõ từng chữ cái — đúng thì tự mở từ tiếp theo. Không cần gõ dấu câu (-, \', .) — cứ gõ tiếp chữ sau, dấu câu tự thêm. Backspace để xoá.</div>' +
      '</div>';
    this.$count = this.host.querySelector('[data-role="count"]');
    this.$showall = this.host.querySelector('[data-role="showall"]');
    this.$words = this.host.querySelector('[data-role="words"]');
    this.$input = this.host.querySelector('[data-role="input"]');
    this.$words.addEventListener('click', this._focus);
    this._renderWords();
    this._updateBar();
  };

  Drill.prototype._bind = function () {
    this.$input.addEventListener('input', this._onInput);
    this.$input.addEventListener('keydown', this._onKeydown);
    this.$input.addEventListener('paste', this._onPaste);
    this.$input.addEventListener('compositionend', this._onCompEnd);
    var self = this;
    this.$showall.addEventListener('click', function () { self._toggleShowAll(); });
  };

  Drill.prototype.destroy = function () {
    clearTimeout(this._errorTimer);
    clearTimeout(this._completeTimer);
    if (this.$input) {
      this.$input.removeEventListener('input', this._onInput);
      this.$input.removeEventListener('keydown', this._onKeydown);
      this.$input.removeEventListener('paste', this._onPaste);
      this.$input.removeEventListener('compositionend', this._onCompEnd);
    }
    if (this.$words) this.$words.removeEventListener('click', this._focus);
    this.host.innerHTML = '';
  };

  Drill.prototype.focus = function () {
    if (this.done || !this.$input) return;
    this.$input.focus();
  };

  Drill.prototype._toggleShowAll = function () {
    this.showAll = !this.showAll;
    var sp = this.$showall.querySelector('span');
    var ic = this.$showall.querySelector('i');
    if (sp) sp.textContent = this.showAll ? 'Ẩn bớt' : 'Hiện tất cả';
    if (ic) ic.className = this.showAll ? 'fas fa-eye-slash' : 'fas fa-eye';
    this._renderWords();
    this.focus();
  };

  Drill.prototype._renderWords = function () {
    var self = this;
    this.$words.innerHTML = this.tokens.map(function (t, i) {
      if (i < self.activeIdx) {
        return '<span class="wbwd-word is-done" data-i="' + i + '">' + esc(t.raw) + '</span>';
      }
      if (i === self.activeIdx && !self.done) {
        // Remaining-star count is by real letters/numbers only — self.typed
        // may already include auto-filled punctuation (e.g. "energy-"), which
        // must not shrink the star count meant for the letters still ahead.
        var typedLetters = self.typed.replace(NOT_TYPABLE, '').length;
        var remaining = Math.max(0, t.target.length - typedLetters);
        var tail = self.erroring
          ? '<span class="wbwd-err">✕</span>'
          : '<span class="wbwd-caret"></span>';
        return '<span class="wbwd-word is-active' + (self.erroring ? ' is-error' : '') + '" data-i="' + i + '">' +
          esc(self.typed) + tail + '<span class="wbwd-star">' + repeat('*', remaining) + '</span></span>';
      }
      var text = self.showAll ? esc(t.raw) : esc(t.mask);
      return '<span class="wbwd-word is-locked' + (self.showAll ? ' is-peek' : '') + '" data-i="' + i + '">' + text + '</span>';
    }).join('');
    if (this.$input && !this.done) {
      var cur = this.tokens[this.activeIdx];
      this.$input.placeholder = cur ? cur.mask : '';
    }
  };

  Drill.prototype._updateBar = function () {
    var total = this.tokens.length;
    var done = this.done ? total : this.activeIdx;
    this.$count.textContent = done + ' / ' + total + ' từ';
    if (done === total && total > 0) this.$count.classList.add('is-full');
    else this.$count.classList.remove('is-full');
  };

  // Keep the finished words (or the whole answer once done) in the bridge
  // <input> so an existing check-function can grade it unchanged.
  Drill.prototype._syncBridge = function (full) {
    if (!this.bridgeInput) return;
    this.bridgeInput.value = (full || this.done)
      ? this.answer
      : this.tokens.slice(0, this.activeIdx).map(function (t) { return t.raw; }).join(' ');
  };

  Drill.prototype._flashError = function () {
    if (this.erroring) return;
    this.erroring = true;
    if (this.$input) this.$input.classList.add('is-error');
    this._renderWords();
    var self = this;
    this._errorTimer = setTimeout(function () {
      self.erroring = false;
      if (self.$input) self.$input.classList.remove('is-error');
      self._renderWords();
    }, 260);
  };

  Drill.prototype._onKeydown = function (e) {
    if (this.done) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      e.stopPropagation();
      // Per-word mode: Space is the explicit "I've finished this word" signal
      // (Vietnamese words aren't validated per keystroke). Check it now — a
      // no-op if it already auto-advanced on the last `input` event.
      if (this.perWord && e.key !== 'Enter') this._onInputWord(this.tokens[this.activeIdx], true);
    }
  };

  // Strip non-typable chars and lower-case — the comparison key for a word.
  function _wordKey(s) { return nfc(s).replace(NOT_TYPABLE, '').toLowerCase(); }

  // Advance past the just-completed active word.
  Drill.prototype._advanceWord = function () {
    this.activeIdx++;
    this.typed = '';
    if (this.$input) this.$input.value = '';
    this._renderWords();
    this._updateBar();
    this._syncBridge(false);
    var chip = this.$words.querySelector('.wbwd-word[data-i="' + (this.activeIdx - 1) + '"]');
    if (chip) chip.classList.add('just-done');
    if (this.activeIdx >= this.tokens.length) this._complete();
    else this.focus();
  };

  Drill.prototype._onInput = function () {
    if (this.done || !this.$input) return;
    var tok = this.tokens[this.activeIdx];
    if (!tok) return;

    if (this.perWord) { this._onInputWord(tok, false); return; }

    // Walk tok.raw (the real word, punctuation and all) instead of the
    // letters-only tok.target, so a punctuation character (hyphen,
    // apostrophe...) is auto-filled into `good` — and shown — the instant
    // the pointer reaches it, whether or not the student actually typed it.
    // A punctuation keystroke they DO type (BUG-089: "energy-efficient"
    // students pressing "-" and seeing nothing happen, thinking the drill
    // was rejecting the key) is simply absorbed as a no-op below — never
    // required, never rejected — so it can't get anyone stuck.
    var typedRaw = nfc(this.$input.value);
    var good = '';
    var pos = 0;
    var rejected = false;
    var skipPunct = function () {
      while (pos < tok.raw.length && !TYPABLE.test(tok.raw[pos])) { good += tok.raw[pos]; pos++; }
    };
    skipPunct();
    for (var k = 0; k < typedRaw.length; k++) {
      var ch = typedRaw[k];
      if (!TYPABLE.test(ch)) continue; // punctuation keystroke — harmless no-op
      var expected = tok.raw[pos];
      if (expected === undefined) { rejected = true; break; }
      if (ch.toLowerCase() === expected.toLowerCase()) { good += ch; pos++; skipPunct(); }
      else { rejected = true; break; }
    }

    this.typed = good;
    this.$input.value = good;                 // active recall: never auto-fill letters

    if (rejected) { this._flashError(); return; }
    if (pos < tok.raw.length) { this._renderWords(); return; }
    this._advanceWord();
  };

  // Per-word validation: never touch the box (so IME composition — Telex/VNI
  // "muws" → "mứ" — is left alone), just watch for the whole word to match.
  // `committed` = the student pressed Space, so a non-match is worth a shake.
  Drill.prototype._onInputWord = function (tok, committed) {
    if (this.done || !this.$input || !tok) return;
    var val = nfc(this.$input.value);
    this.typed = val.replace(/\s+$/, '');
    var got = _wordKey(val);
    var want = _wordKey(tok.target);

    if (got === want) { this._advanceWord(); return; }

    // Not matching. Stay quiet while they're still (plausibly) mid-word;
    // shake only when they explicitly committed with Space, or clearly
    // overshot the target length.
    if (!this.erroring && (committed || got.length > want.length + 1)) this._flashError();
    this._renderWords();
  };

  Drill.prototype._complete = function () {
    this.done = true;
    if (this.$input) { this.$input.disabled = true; this.$input.blur(); }
    this._renderWords();
    this._updateBar();
    this._syncBridge(true);
    var self = this;
    this._completeTimer = setTimeout(function () { self.onComplete(); }, 450);
  };

  function repeat(ch, n) { return n > 0 ? new Array(n + 1).join(ch) : ''; }

  var registry = new WeakMap();

  var WbwDrill = {
    // Returns true if a real drill was mounted, false if it declined (empty /
    // untypable answer) — caller should fall back to the plain input then.
    mount: function (host, opts) {
      if (!host || !opts || !opts.answer) return false;
      injectStyles();
      this.unmount(host);
      var tokens = tokenize(opts.answer);
      if (!tokens.length) return false;
      registry.set(host, new Drill(host, opts));
      return true;
    },
    unmount: function (host) {
      if (!host) return;
      var d = registry.get(host);
      if (d) { d.destroy(); registry.delete(host); }
    },
    isActive: function (host) {
      var d = host && registry.get(host);
      return !!(d && !d.done);
    },
    isMounted: function (host) {
      return !!(host && registry.get(host));
    }
  };

  global.WbwDrill = WbwDrill;
})(window);
