/* ══════════════════════════════════════════════
   word-audio.js  –  Shared vocab pronunciation engine.

   Used by every "listen to a vocab word" feature on the site: dashboard
   speakWord() (flashcards, Listen mode, quizzes, vocab notebook, class
   lessons), the dictionary popup's speakDictWord(), and Task 2 topic
   vocab. Exposes window.WordAudio.speak(word, { slow }).

   Two problems this solves:
   1. Words were hard to catch because the first syllable got clipped —
      speakers / Bluetooth headsets need a moment to wake the output, and
      playback started instantly. Every word is now preceded by a short
      silent lead-in (LEAD_MS) played through the SAME <audio> element, so
      the device is already awake when the word starts.
   2. The primary source used to be the browser's TTS voice (quality varies
      wildly per device). We now prefer real recorded pronunciations from
      recognised dictionaries, falling back to TTS only when none exists:
        a. Oxford Dictionaries recordings (served by Google's dictionary CDN)
        b. dictionaryapi.dev / Wiktionary recordings (US, then UK)
        c. Web Speech TTS with the clearest English voice available
        d. Google Translate TTS (no Web Speech at all)
══════════════════════════════════════════════ */
(function () {
  'use strict';

  var LEAD_MS = 450;          // silence before each word
  var PROBE_TIMEOUT_MS = 3000;
  var RATE_TTS = 0.85, RATE_TTS_SLOW = 0.6;
  var RATE_MP3_SLOW = 0.75;   // recordings play at natural speed unless slow

  var _urlCache = new Map();  // normalised word → recording URL, or '' (none → TTS)
  var _pending = new Map();   // normalised word → in-flight lookup promise
  var _seq = 0;               // only the newest speak() call may play
  var _el = null;             // one shared <audio>: unlocked by the first tap (iOS)
  var _silenceUri = null;

  function norm(word) {
    return String(word || '').trim().replace(/\s+/g, ' ')
      .replace(/^[^A-Za-z]+|[^A-Za-z.]+$/g, '');
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

  // Resolves true once `url` is loadable as audio, false on 404 / timeout.
  // Uses a throwaway element so the shared one isn't disturbed; the file
  // lands in the HTTP cache, so the real play starts immediately.
  function probe(url) {
    return new Promise(function (resolve) {
      var a = new Audio();
      var done = false;
      function finish(ok) {
        if (done) return; done = true; clearTimeout(t);
        a.removeAttribute('src'); try { a.load(); } catch (e) {}
        resolve(ok);
      }
      var t = setTimeout(function () { finish(false); }, PROBE_TIMEOUT_MS);
      a.preload = 'auto';
      a.addEventListener('loadeddata', function () { finish(true); });
      a.addEventListener('canplay', function () { finish(true); });
      a.addEventListener('error', function () { finish(false); });
      a.src = url;
      try { a.load(); } catch (e) { finish(false); }
    });
  }

  function oxfordUrl(w) {
    // Google's Oxford recordings exist only for single words.
    if (!/^[a-z][a-z'-]*$/.test(w)) return '';
    return 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/' + encodeURIComponent(w) + '--_us_1.mp3';
  }

  function dictApiUrl(w) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, PROBE_TIMEOUT_MS);
    return fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w),
      ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) {
        var all = [];
        (Array.isArray(data) ? data : []).forEach(function (e) {
          (e.phonetics || []).forEach(function (p) { if (p.audio) all.push(p.audio.indexOf('http') === 0 ? p.audio : 'https:' + p.audio); });
        });
        return all.find(function (u) { return /-us\.mp3$/i.test(u); })
          || all.find(function (u) { return /-uk\.mp3$/i.test(u); })
          || all[0] || '';
      })
      .catch(function () { return ''; })
      .then(function (u) { clearTimeout(t); return u; });
  }

  // Finds the best recorded pronunciation for a word ('' if none).
  function lookup(w) {
    var key = w.toLowerCase();
    if (_urlCache.has(key)) return Promise.resolve(_urlCache.get(key));
    if (_pending.has(key)) return _pending.get(key);
    var ox = oxfordUrl(key);
    var dictP = dictApiUrl(key); // in parallel, only used if Oxford has nothing
    var p = (ox ? probe(ox) : Promise.resolve(false))
      .then(function (ok) { return ok ? ox : dictP; })
      .then(function (url) {
        _urlCache.set(key, url || '');
        _pending.delete(key);
        return url || '';
      });
    _pending.set(key, p);
    return p;
  }

  // Plays the silent lead-in on the shared element; resolves when it ends.
  // Must be called synchronously from the tap so iOS unlocks the element.
  function playLead() {
    var a = el();
    return new Promise(function (resolve) {
      var t = setTimeout(resolve, LEAD_MS + 400);
      a.onended = function () { clearTimeout(t); resolve(); };
      a.playbackRate = 1;
      a.src = silence();
      var pr = a.play();
      if (pr && pr.catch) pr.catch(function () {
        // Autoplay blocked (no gesture) — still keep the pause.
        clearTimeout(t); setTimeout(resolve, LEAD_MS);
      });
    });
  }

  function playUrl(url, slow) {
    var a = el();
    return new Promise(function (resolve) {
      a.onended = function () { resolve(); };
      a.onerror = function () { resolve(); };
      a.src = url;
      a.volume = 1;
      try { a.preservesPitch = true; a.mozPreservesPitch = true; a.webkitPreservesPitch = true; } catch (e) {}
      a.playbackRate = slow ? RATE_MP3_SLOW : 1;
      // Some browsers reset playbackRate when a new src loads.
      a.onloadedmetadata = function () { a.playbackRate = slow ? RATE_MP3_SLOW : 1; };
      var pr = a.play();
      if (pr && pr.catch) pr.catch(function () { resolve(); });
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
      var t = setTimeout(resolve, 4000 + w.length * 150);
      u.onend = u.onerror = function () { clearTimeout(t); resolve(); };
      synth.speak(u);
    });
  }

  function stop() {
    _seq++;
    if (_el) { try { _el.pause(); } catch (e) {} }
    if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  }

  function speak(word, opts) {
    var w = norm(word);
    if (!w) return Promise.resolve();
    var slow = !!(opts && opts.slow);
    stop();
    var id = _seq;
    var lead = playLead();
    return Promise.all([lead, lookup(w)]).then(function (r) {
      if (id !== _seq) return;           // a newer word was requested meanwhile
      return r[1] ? playUrl(r[1], slow) : playTts(w, slow);
    });
  }

  // Warm the cache ahead of time (e.g. the next quiz question).
  function prefetch(word) {
    var w = norm(word);
    if (w) lookup(w);
  }

  if (window.speechSynthesis) {
    try { window.speechSynthesis.getVoices(); } catch (e) {}
  }

  window.WordAudio = { speak: speak, stop: stop, prefetch: prefetch };
})();
