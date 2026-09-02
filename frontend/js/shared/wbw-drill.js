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
    this.typed = '';
    this.showAll = false;
    this.erroring = false;
    this.done = false;
    this._errorTimer = null;
    this._completeTimer = null;

    this._composing = false;
    this._onInput = this._onInput.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onPaste = function (e) { e.preventDefault(); };
    var self0 = this;
    // Vietnamese Telex/VNI (and any IME) fire streams of intermediate `input`
    // events while composing a character — wait for compositionend so we
    // validate the finished letter, not the half-typed "aa"/"a".
    this._onCompStart = function () { self0._composing = true; };
    this._onCompEnd = function () { self0._composing = false; self0._onInput(); };
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
        '<div class="wbwd-hint">Gõ từng chữ cái — đúng thì tự mở từ tiếp theo. Dấu câu tự thêm. Backspace để xoá.</div>' +
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
    this.$input.addEventListener('compositionstart', this._onCompStart);
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
      this.$input.removeEventListener('compositionstart', this._onCompStart);
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
        var remaining = Math.max(0, t.target.length - self.typed.length);
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
    // Enter / Space are no-ops — progression is automatic, completion fires
    // onComplete(). Stop them from bubbling to any page-level "advance" key
    // handler while the drill is still in progress.
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  Drill.prototype._onInput = function () {
    if (this.done || !this.$input || this._composing) return;
    var tok = this.tokens[this.activeIdx];
    if (!tok) return;
    var raw = nfc(this.$input.value).replace(NOT_TYPABLE, '');

    var good = '';
    var rejected = false;
    for (var k = 0; k < raw.length; k++) {
      var expected = tok.target[good.length];
      if (expected === undefined) break;
      if (raw[k].toLowerCase() === expected.toLowerCase()) good += raw[k];
      else { rejected = true; break; }
    }

    this.typed = good;
    this.$input.value = good;                 // active recall: never auto-fill

    if (rejected) { this._flashError(); return; }
    if (good.length < tok.target.length) { this._renderWords(); return; }

    // active word complete
    this.activeIdx++;
    this.typed = '';
    this.$input.value = '';
    this._renderWords();
    this._updateBar();
    this._syncBridge(false);
    var chip = this.$words.querySelector('.wbwd-word[data-i="' + (this.activeIdx - 1) + '"]');
    if (chip) chip.classList.add('just-done');

    if (this.activeIdx >= this.tokens.length) this._complete();
    else this.focus();
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
