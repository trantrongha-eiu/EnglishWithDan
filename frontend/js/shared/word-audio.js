/* ══════════════════════════════════════════════
   word-audio.js  –  Shared vocab pronunciation engine.

   Used by every "listen to a vocab word" feature on the site: dashboard
   speakWord() (flashcards, Listen mode, quizzes, vocab notebook, class
   lessons), the dictionary popup's speakDictWord(), and Task 2 topic
   vocab. Exposes window.WordAudio.speak(word, { slow }).

   Sources, best first (real dictionary recordings; TTS only when none):
     a. Oxford recordings, US then UK (served by Google's dictionary CDN)
     b. dictionaryapi.dev / Wiktionary recordings (US, then UK)
     c. Web Speech TTS with the clearest English voice available
     d. Google Translate TTS (no Web Speech at all)

   Keeping the tap fast:
   - Words are looked up AND downloaded before the tap: every 🔊 button with
     onclick="speakWord('…')" that appears on the page is prefetched, and
     pages can call WordAudio.prefetch(word | [words]) for words they pick
     at runtime (quiz queues, dictionary popup).
   - Found recordings and confirmed misses are remembered across visits, so
     a known word never waits on a lookup and a word with no recording goes
     straight to TTS.
   - Speakers / Bluetooth headsets clip the first syllable when they have to
     wake up, so a short silent lead-in plays first — but only when nothing
     was played in the last few seconds. Back-to-back taps play at once.
══════════════════════════════════════════════ */
(function () {
  'use strict';

  var LEAD_MS = 300;          // silence before a word when the output is cold
  var WARM_MS = 6000;         // output still counts as awake this long after audio
  var PROBE_TIMEOUT_MS = 3000;
  var DICT_TIMEOUT_MS = 1500; // dictionaryapi.dev is often slow / down (5xx)
  var LOOKUP_BUDGET_MS = 1200; // longest a tap waits for a recording before TTS
  var PREFETCH_CONCURRENCY = 3, PREFETCH_QUEUE_MAX = 80;
  // TTS below ~0.75 drags and slurs the sounds (worst on phrases, which
  // always go through TTS), so "slow" is only a mild slow-down.
  var RATE_TTS = 1, RATE_TTS_SLOW = 0.8;
  var RATE_MP3_SLOW = 0.85;   // recordings play at natural speed unless slow

  var STORE_KEY = 'ews_word_audio_v1', STORE_MAX = 3000;     // word → recording URL
  var MISS_KEY = 'ews_word_audio_miss_v1', MISS_MAX = 2000;  // word → time a miss was confirmed
  var MISS_TTL_MS = 14 * 24 * 3600 * 1000;

  var _urlCache = new Map();  // lowercased word → recording URL, or '' (none → TTS)
  var _stored = {};
  var _misses = {};
  var _pending = new Map();   // lowercased word → { p, kick } in-flight lookup
  var _warmed = new Set();    // recording URLs already downloaded this page
  var _queue = [], _active = 0;
  var _seq = 0;               // only the newest speak() call may play
  var _el = null;             // one shared <audio>: unlocked by the first tap (iOS)
  var _silenceUri = null;
  var _playing = false, _lastAudioEnd = 0;

  function norm(word) {
    return String(word || '').trim().replace(/\s+/g, ' ')
      .replace(/^[^A-Za-z]+|[^A-Za-z.]+$/g, '');
  }

  function readStore(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (e) { return {}; }
  }
  function writeStore(key, obj, max) {
    var keys = Object.keys(obj);
    if (keys.length > max) keys.slice(0, keys.length - max).forEach(function (k) { delete obj[k]; });
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) { /* quota / private mode */ }
  }

  _stored = readStore(STORE_KEY);
  Object.keys(_stored).forEach(function (k) { _urlCache.set(k, _stored[k]); });
  _misses = readStore(MISS_KEY);
  (function () {
    var now = Date.now(), dropped = false;
    Object.keys(_misses).forEach(function (k) {
      if (now - _misses[k] < MISS_TTL_MS) { if (!_urlCache.has(k)) _urlCache.set(k, ''); }
      else { delete _misses[k]; dropped = true; }
    });
    if (dropped) writeStore(MISS_KEY, _misses, MISS_MAX);
  })();

  // A miss is only remembered across visits when every source answered
  // "no recording" — a timeout or a dictionary outage stays per-page.
  function remember(key, url, definite) {
    _urlCache.set(key, url);
    if (url) {
      if (_misses[key]) { delete _misses[key]; writeStore(MISS_KEY, _misses, MISS_MAX); }
      if (_stored[key] !== url) { _stored[key] = url; writeStore(STORE_KEY, _stored, STORE_MAX); }
    } else if (definite) {
      _misses[key] = Date.now();
      writeStore(MISS_KEY, _misses, MISS_MAX);
    }
  }

  function forget(key) {
    _urlCache.delete(key);
    if (_stored[key]) { delete _stored[key]; writeStore(STORE_KEY, _stored, STORE_MAX); }
  }

  // Tiny 8 kHz / 8-bit mono WAV of pure silence, built once as a data: URI
  // (CSP media-src already allows data:).
  function silence() {
    if (_silenceUri) return _silenceUri;
    var n = Math.round(8000 * LEAD_MS / 1000);
    var bytes = new Uint8Array(44 + n);
    var dv = new DataView(bytes.buffer);
    function str(o, s) { for (var i = 0; i < s.length; i++) bytes[o + i] = s.charCodeAt(i); }
    str(0, 'RIFF'); dv.setUint32(4, 36 + n, true); str(8, 'WAVE');
    str(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
    dv.setUint32(24, 8000, true); dv.setUint32(28, 8000, true); dv.setUint16(32, 1, true); dv.setUint16(34, 8, true);
    str(36, 'data'); dv.setUint32(40, n, true);
    for (var i = 44; i < bytes.length; i++) bytes[i] = 128; // 8-bit PCM midpoint = silence
    var bin = '';
    for (var j = 0; j < bytes.length; j++) bin += String.fromCharCode(bytes[j]);
    _silenceUri = 'data:audio/wav;base64,' + btoa(bin);
    return _silenceUri;
  }

  function el() {
    if (!_el) { _el = new Audio(); _el.preload = 'auto'; }
    return _el;
  }

  // Downloads `url` on a throwaway element and resolves 'ok', 'missing'
  // (404 / undecodable) or 'timeout'. The file lands in the HTTP cache
  // (gstatic sends a one-year max-age), so the real play starts at once.
  // (gstatic sends no CORS headers and connect-src doesn't list it, so an
  // <audio> element is the only way to check it.)
  function probe(url) {
    return new Promise(function (resolve) {
      var a = new Audio();
      var done = false, freed = false;
      // Release the element (browsers cap live media players), but only once
      // the file is fully downloaded — tearing down at metadata would leave a
      // half-cached file and the real play would hit the network again.
      function free() {
        if (freed) return; freed = true;
        a.removeAttribute('src'); try { a.load(); } catch (e) {}
      }
      function finish(r) {
        if (done) return; done = true; clearTimeout(t);
        if (r === 'ok') { _warmed.add(url); setTimeout(free, 2000); } else free();
        resolve(r);
      }
      var t = setTimeout(function () { finish('timeout'); }, PROBE_TIMEOUT_MS);
      a.preload = 'auto';
      // iOS may stop at metadata until a real play(), so any of these counts.
      ['loadedmetadata', 'loadeddata', 'canplay'].forEach(function (ev) {
        a.addEventListener(ev, function () { finish('ok'); });
      });
      a.addEventListener('canplaythrough', function () { finish('ok'); free(); });
      a.addEventListener('error', function () { finish('missing'); });
      a.src = url;
      try { a.load(); } catch (e) { finish('missing'); }
    });
  }

  function oxfordUrl(w, region) {
    // Google's Oxford recordings exist only for single words.
    if (!/^[a-z][a-z'-]*$/.test(w)) return '';
    return 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/' + encodeURIComponent(w) + '--_' + region + '_1.mp3';
  }

  // Resolves { url, definite }: definite means the API really answered
  // (200, or 404 "no definitions"), not an outage or timeout.
  function dictApiUrl(w) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, DICT_TIMEOUT_MS);
    var definite = false;
    return fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w),
      ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (r) {
        definite = r.ok || r.status === 404;
        return r.ok ? r.json() : [];
      })
      .then(function (data) {
        var all = [];
        (Array.isArray(data) ? data : []).forEach(function (e) {
          (e.phonetics || []).forEach(function (p) { if (p.audio) all.push(p.audio.indexOf('http') === 0 ? p.audio : 'https:' + p.audio); });
        });
        return all.find(function (u) { return /-us\.mp3$/i.test(u); })
          || all.find(function (u) { return /-uk\.mp3$/i.test(u); })
          || all[0] || '';
      })
      .catch(function () { definite = false; return ''; })
      .then(function (u) { clearTimeout(t); return { url: u, definite: definite || !!u }; });
  }

  // Finds the best recorded pronunciation for a word ('' if none).
  // `urgent` (a tap is waiting) asks every source at once; a prefetch asks
  // them in order so a long word list doesn't hammer the dictionary API.
  function lookup(key, urgent) {
    if (_urlCache.has(key)) return Promise.resolve(_urlCache.get(key));
    var job = _pending.get(key);
    if (job) { if (urgent) job.kick(); return job.p; }
    // Multi-word phrases ("splits into two halves") have no recording in
    // either dictionary — go straight to TTS instead of waiting on a lookup.
    if (/\s/.test(key)) { _urlCache.set(key, ''); return Promise.resolve(''); }

    var us = oxfordUrl(key, 'us'), gb = oxfordUrl(key, 'gb');
    var gbP = null, dictP = null;
    function askGb() { return gbP || (gbP = gb ? probe(gb) : Promise.resolve('missing')); }
    function askDict() { return dictP || (dictP = dictApiUrl(key)); }
    function kick() { askGb(); askDict(); }
    if (urgent) kick();

    var p = (us ? probe(us) : Promise.resolve('missing'))
      .then(function (rUs) {
        if (rUs === 'ok') return { url: us, definite: true };
        return askGb().then(function (rGb) {
          if (rGb === 'ok') return { url: gb, definite: true };
          return askDict().then(function (d) {
            return { url: d.url, definite: !!d.url || (rUs === 'missing' && rGb === 'missing' && d.definite) };
          });
        });
      })
      .then(function (r) {
        remember(key, r.url || '', r.definite);
        _pending.delete(key);
        return r.url || '';
      });
    _pending.set(key, { p: p, kick: kick });
    return p;
  }

  // ── Prefetch queue ───────────────────────────────────────────────────
  // Known URL: just download it into the HTTP cache (a recording that has
  // since disappeared is forgotten). Unknown word: look it up.
  function fetchAhead(key) {
    var known = _urlCache.get(key);
    if (!known) return lookup(key, false);
    return probe(known).then(function (r) { if (r === 'missing') forget(key); });
  }

  function pump() {
    while (_active < PREFETCH_CONCURRENCY && _queue.length) {
      var key = _queue.shift();
      var known = _urlCache.get(key);
      if (known === '' || _pending.has(key) || (known && _warmed.has(known))) continue;
      _active++;
      fetchAhead(key).then(done, done);
    }
    function done() { _active--; pump(); }
  }

  // A single word (the one a learner is about to hear) is fetched now; a
  // list goes to the front of the queue, since the newest render is what's
  // on screen.
  function prefetch(words) {
    if (!Array.isArray(words)) {
      var w = norm(words);
      if (!w) return;
      var key = w.toLowerCase();
      var known = _urlCache.get(key);
      if (known && !_warmed.has(known)) { _queue.unshift(key); pump(); }
      else if (known === undefined) lookup(key, true);
      return;
    }
    var fresh = [];
    words.forEach(function (x) {
      var k = norm(x).toLowerCase();
      if (!k || /\s/.test(k) || fresh.indexOf(k) >= 0) return;
      var u = _urlCache.get(k);
      if (u === '' || (u && _warmed.has(u)) || _pending.has(k)) return;
      fresh.push(k);
    });
    if (!fresh.length) return;
    _queue = fresh.concat(_queue.filter(function (k) { return fresh.indexOf(k) < 0; }))
      .slice(0, PREFETCH_QUEUE_MAX);
    pump();
  }

  // ── Playback ─────────────────────────────────────────────────────────
  function isWarm() { return _playing || (Date.now() - _lastAudioEnd < WARM_MS); }
  function startedAudio() { _playing = true; }
  function endedAudio() { _playing = false; _lastAudioEnd = Date.now(); }

  // Plays the silent lead-in on the shared element; resolves when it ends.
  // Must be called synchronously from the tap so iOS unlocks the element.
  function playLead() {
    var a = el();
    return new Promise(function (resolve) {
      var t = setTimeout(resolve, LEAD_MS + 400);
      a.onended = function () { clearTimeout(t); resolve(); };
      // 'ended' can arrive late (or not at all on some outputs), so also
      // time the lead-in from the moment it really starts.
      a.onplaying = function () { a.onplaying = null; clearTimeout(t); t = setTimeout(resolve, LEAD_MS); };
      a.onerror = null;
      a.playbackRate = 1;
      a.src = silence();
      var pr = a.play();
      if (pr && pr.catch) pr.catch(function () {
        // Autoplay blocked (no gesture) — still keep the pause.
        clearTimeout(t); setTimeout(resolve, LEAD_MS);
      });
    });
  }

  // Resolves true once the recording finished, false if it couldn't play.
  function playUrl(url, slow) {
    var a = el();
    return new Promise(function (resolve) {
      var settled = false;
      function finish(ok) { if (settled) return; settled = true; endedAudio(); resolve(ok); }
      a.onended = function () { finish(true); };
      a.onerror = function () { finish(false); };
      a.src = url;
      a.volume = 1;
      try { a.preservesPitch = true; a.mozPreservesPitch = true; a.webkitPreservesPitch = true; } catch (e) {}
      a.playbackRate = slow ? RATE_MP3_SLOW : 1;
      // Some browsers reset playbackRate when a new src loads.
      a.onloadedmetadata = function () { a.playbackRate = slow ? RATE_MP3_SLOW : 1; };
      startedAudio();
      var pr = a.play();
      if (pr && pr.catch) pr.catch(function (e) {
        // AbortError = a newer word replaced this one; not a broken file.
        finish(e && e.name === 'AbortError');
      });
    });
  }

  function bestVoice() {
    var synth = window.speechSynthesis;
    var voices = synth ? synth.getVoices() : [];
    var en = voices.filter(function (v) { return /^en[-_]/i.test(v.lang) || v.lang === 'en'; });
    var us = en.filter(function (v) { return /^en[-_]US/i.test(v.lang); });
    var good = /Google|Natural|Neural|Online|Samantha|Aria|Jenny|Ava|Allison/i;
    return us.find(function (v) { return good.test(v.name); })
      || en.find(function (v) { return good.test(v.name); })
      || us[0] || en[0] || null;
  }

  function playTts(w, slow) {
    var synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      return playUrl('https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=' + encodeURIComponent(w), slow);
    }
    return new Promise(function (resolve) {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(w);
      u.lang = 'en-US';
      u.rate = slow ? RATE_TTS_SLOW : RATE_TTS;
      u.pitch = 1;
      var v = bestVoice();
      if (v) u.voice = v;
      function finish() { clearTimeout(t); endedAudio(); resolve(); }
      var t = setTimeout(finish, 4000 + w.length * 150);
      u.onend = u.onerror = finish;
      startedAudio();
      synth.speak(u);
    });
  }

  function stop() {
    _seq++;
    if (_playing) endedAudio();
    if (_el) { try { _el.pause(); } catch (e) {} }
    if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  }

  function speak(word, opts) {
    var w = norm(word);
    if (!w) return Promise.resolve();
    var key = w.toLowerCase();
    var slow = !!(opts && opts.slow);
    var warm = isWarm();
    stop();
    var id = _seq;

    function play(url) {
      if (id !== _seq) return;           // a newer word was requested meanwhile
      if (!url) return playTts(w, slow);
      return playUrl(url, slow).then(function (ok) {
        if (ok || id !== _seq) return;
        forget(key);                     // stale / broken recording → TTS now
        return playTts(w, slow);
      });
    }

    var known = _urlCache.has(key) ? _urlCache.get(key) : undefined;
    // Known word, output already awake: play inside the tap, no waiting.
    if (known !== undefined && warm) return play(known);

    var lead = warm ? Promise.resolve() : playLead();
    // A slow lookup never holds the word back for long: past the budget,
    // speak with TTS now; the lookup still finishes and is cached, so the
    // next tap gets the recording.
    var found = known !== undefined ? Promise.resolve(known) : Promise.race([lookup(key, true), new Promise(function (res) {
      setTimeout(function () { res(''); }, LOOKUP_BUDGET_MS);
    })]);
    return Promise.all([lead, found]).then(function (r) { return play(r[1]); });
  }

  // ── Auto-prefetch every 🔊 button rendered as onclick="speakWord('…')" ──
  var SPEAK_SEL = '[onclick*="speakWord"]';
  var SPEAK_RE = /speakWord\('((?:\\.|[^'\\])*)'\)/;
  var _seen = typeof WeakSet === 'function' ? new WeakSet() : null;
  var _scanTimer = null;

  function scan() {
    _scanTimer = null;
    if (!_seen || !document.querySelectorAll) return;
    var words = [];
    var nodes = document.querySelectorAll(SPEAK_SEL);
    for (var i = 0; i < nodes.length; i++) {
      if (_seen.has(nodes[i])) continue;
      _seen.add(nodes[i]);
      var m = SPEAK_RE.exec(nodes[i].getAttribute('onclick') || '');
      if (m) words.push(m[1].replace(/\\(.)/g, '$1'));
    }
    if (words.length) prefetch(words);
  }
  function scheduleScan() { if (!_scanTimer) _scanTimer = setTimeout(scan, 250); }

  function watch() {
    scheduleScan();
    if (typeof MutationObserver === 'function' && document.body) {
      new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
    }
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
    else watch();
  }

  if (window.speechSynthesis) {
    try { window.speechSynthesis.getVoices(); } catch (e) {}
  }

  window.WordAudio = { speak: speak, stop: stop, prefetch: prefetch };
})();
