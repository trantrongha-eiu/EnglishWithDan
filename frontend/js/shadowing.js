/* frontend/js/shadowing.js — Shadowing / Dictation on YouTube clips.
 *
 * Each lesson is a 2–3 minute window of a public YouTube video, split into
 * timed sentences (backend/scripts/shadowing/buildShadowingLessons.js). The
 * video is embedded with the YouTube IFrame API — never downloaded — and a
 * sentence is "played" by seeking to its start and pausing at its end.
 *
 *  - Shadowing: listen → repeat aloud. The browser's SpeechRecognition
 *    transcribes the attempt, which is diffed word-by-word against the
 *    sentence; a parallel MediaRecorder keeps the audio so the student can
 *    compare their own voice with the original.
 *  - Dictation: listen → type, scored with the same LCS word diff as
 *    dictation.html (video covered so on-screen captions don't give it away).
 *  - "Phát liên tục" (or the YouTube player's own play button) plays on
 *    past the sentence end, with the transcript following the video.
 */
(function () {
  'use strict';

  const API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  const authH = () => ({ ...window.AuthService.authHeader(), 'Content-Type': 'application/json' });
  const $ = (id) => document.getElementById(id);

  const CATEGORY_LABEL = {
    'ielts-part1': 'Speaking Part 1', 'ielts-part2': 'Speaking Part 2', 'ielts-part3': 'Speaking Part 3',
    '6-minute-english': '6 Minute English', 'fun-shorts': 'Video ngắn vui',
    'comedy': 'Hài Stand-up', 'ted-shorts': 'TED ngắn', 'everyday-english': 'Everyday English',
    'spelling-numbers': 'Đánh vần & số', 'grammar': 'Ngữ pháp',
  };
  const SPEEDS = [1, 0.75, 0.5, 1.25];
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  // Per-viewer conveniences (speed, practice toggles) — best-effort only.
  const PREFS_KEY = 'ews_shadowing_prefs';
  function loadPrefs() { try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; } catch (_) { return {}; } }
  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({
        speedIdx, autorec: $('opt-autorec').checked, hide: $('opt-hide').checked, vi: $('opt-vi').checked,
        tipsClosed: !$('sh-tips').open, bigVideo,
      }));
    } catch (_) { /* storage unavailable */ }
  }

  let lessons = [];

  // Theater layout on desktop (see .sh-theater in shadowing.html); on by default.
  let bigVideo = true;
  function applyBigVideo() {
    $('screen-practice').classList.toggle('sh-theater', bigVideo);
    $('sh-size').innerHTML = bigVideo
      ? '<i class="fas fa-compress"></i> Thu nhỏ video'
      : '<i class="fas fa-expand"></i> Video lớn';
    $('sh-size').title = bigVideo
      ? 'Thu nhỏ để video, câu và nút bấm vừa một màn hình'
      : 'Phóng to video toàn chiều rộng';
  }
  function toggleBigVideo() { bigVideo = !bigVideo; applyBigVideo(); savePrefs(); }
  let filterCat = '';
  let filterLevel = '';
  let page = 1;
  const PAGE_SIZE = 24; // fills 2, 3 or 4 grid columns evenly
  let lesson = null;
  let idx = 0;
  let mode = 'shadowing';
  let speedIdx = 0;
  // Best result per segment, per mode: { shadowing: {i: {matched,total}}, dictation: {...} }
  let answers = { shadowing: {}, dictation: {} };
  let dirty = { shadowing: false, dictation: false };

  // ══════════════ YOUTUBE PLAYER ══════════════
  let resolveYtApi;
  const ytApiReady = new Promise((r) => { resolveYtApi = r; });
  window.onYouTubeIframeAPIReady = () => resolveYtApi();
  if (window.YT && window.YT.Player) resolveYtApi();

  let player = null;
  let playerReady = null;
  let stopAt = null;     // video time at which the current segment ends
  let pollTimer = null;
  let isPlaying = false;
  let continuous = false; // "Phát liên tục": play on to the end of the clip

  function ensurePlayer(videoId, start) {
    if (playerReady) {
      // Second lesson on the same page: reuse the player once it's ready.
      playerReady = playerReady.then((p) => { p.cueVideoById({ videoId, startSeconds: start }); return p; });
      return playerReady;
    }
    playerReady = ytApiReady.then(() => new Promise((resolve) => {
      player = new YT.Player('yt-player', {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          start: Math.floor(start), rel: 0, modestbranding: 1, playsinline: 1,
          iv_load_policy: 3, cc_load_policy: 0, origin: location.origin,
        },
        events: {
          onReady: () => resolve(player),
          onStateChange: onPlayerState,
          onError: (e) => {
            console.error('[shadowing] YouTube error', e && e.data);
            toast('Không phát được video này — vui lòng thử lại sau.', 'error');
          },
        },
      });
    }));
    return playerReady;
  }

  function onPlayerState(e) {
    isPlaying = e.data === YT.PlayerState.PLAYING;
    setPlayIcon(isPlaying);
    if (isPlaying) startPoll(); else stopPoll();
    if (mode === 'dictation') hideCaptions();
  }

  function startPoll() {
    stopPoll();
    pollTimer = setInterval(() => {
      if (!player || !lesson) return;
      const t = player.getCurrentTime();
      if (stopAt == null || continuous) followVideo(t);
      if (stopAt != null && t >= stopAt) {
        player.pauseVideo();
        stopAt = null;
        stopPoll();
        if (continuous) setContinuous(false);
        else onSegmentEnded();
      }
    }, 50);
  }

  // Free play (YouTube's own controls, or "Phát liên tục"): move the current
  // sentence along with the video instead of leaving it on the old one.
  // Shadowing only: in Dictation a sentence change would wipe what the
  // student is typing.
  function followVideo(t) {
    const segs = lesson.segments;
    if (mode !== 'shadowing' || t < segs[0].start || t > segs[segs.length - 1].end + 1) return;
    let i = idx;
    while (i + 1 < segs.length && t >= segs[i + 1].start) i++;
    while (i > 0 && t < segs[i].start) i--;
    if (i !== idx) goTo(i, { keepPlaying: true });
  }

  function setContinuous(on) {
    continuous = on;
    $('sh-playall').classList.toggle('on', on);
    $('sh-playall').innerHTML = on ? '<i class="fas fa-pause"></i> Dừng phát' : '<i class="fas fa-forward"></i> Phát liên tục';
  }

  async function playAll() {
    if (!lesson) return;
    if (recording) stopRecord();
    const p = await playerReady;
    if (continuous) { p.pauseVideo(); stopAt = null; setContinuous(false); return; }
    setContinuous(true);
    stopAt = lesson.segments[lesson.segments.length - 1].end;
    p.seekTo(lesson.segments[idx].start, true);
    p.setPlaybackRate(SPEEDS[speedIdx]);
    p.playVideo();
  }
  function stopPoll() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

  function hideCaptions() {
    // Not part of the documented API, but long-standing and harmless if it
    // ever stops existing — the video cover below is the real safeguard.
    try { player && player.unloadModule && player.unloadModule('captions'); } catch (_) { /* ignore */ }
  }

  function setPlayIcon(playing) {
    for (const id of ['sh-play', 'dc-play']) {
      const btn = $(id);
      if (btn) btn.innerHTML = playing ? '<i class="fas fa-pause"></i> Dừng' : '<i class="fas fa-play"></i> Nghe';
    }
  }

  async function playSegment() {
    if (!lesson) return;
    if (recording) stopRecord();
    const p = await playerReady;
    if (isPlaying && stopAt != null) { p.pauseVideo(); stopAt = null; setContinuous(false); return; }
    setContinuous(false);
    const seg = lesson.segments[idx];
    stopAt = seg.end;
    p.seekTo(seg.start, true);
    p.setPlaybackRate(SPEEDS[speedIdx]);
    p.playVideo();
  }

  function onSegmentEnded() {
    if (mode === 'shadowing' && $('opt-autorec').checked && !recording) startRecord();
  }

  function cycleSpeed() {
    speedIdx = (speedIdx + 1) % SPEEDS.length;
    $('sh-speed').textContent = SPEEDS[speedIdx] + 'x';
    if (player && player.setPlaybackRate) player.setPlaybackRate(SPEEDS[speedIdx]);
    savePrefs();
  }

  // ══════════════ WORD SCORING ══════════════
  // British spellings in the captions vs. what en-US speech recognition
  // writes back — compared as equal so a correct shadow isn't marked wrong.
  const SPELLING = {
    ok: 'okay', centre: 'center', realise: 'realize', realised: 'realized', programme: 'program',
    practise: 'practice', favourite: 'favorite', colour: 'color', neighbour: 'neighbor',
    theatre: 'theater', behaviour: 'behavior', travelling: 'traveling', organise: 'organize',
  };
  function normWord(w) {
    const n = w.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9']/g, '').replace(/^'+|'+$/g, '');
    return SPELLING[n] || n;
  }
  // Hyphenated words ("high-rise", "self-perception") are scored as their
  // parts, since recognition often returns them as separate words.
  // joinDigits (grading a number `answer`): "1387 9645" and "13879645" are
  // the same number however the student groups the digits.
  function tokens(text, joinDigits = false) {
    const words = (text || '').replace(/[-–—]/g, ' ').split(/\s+/).filter((w) => normWord(w) !== '');
    if (!joinDigits) return words;
    const out = [];
    let joinNext = false;
    for (const w of words) {
      const digits = /^\d+$/.test(normWord(w));
      if (digits && joinNext) out[out.length - 1] += w;
      else out.push(w);
      joinNext = digits && !/[,;.?!]$/.test(w);
    }
    return out;
  }

  // What Dictation grades: a segment's `answer` (just the name or number an
  // IELTS answer sheet wants — "Theresa May" for "T-H-E-R-E-S-A, M-A-Y")
  // when it has one, otherwise the whole sentence.
  function dictRef(seg) { return seg.answer || seg.text; }

  // LCS word alignment → which reference / attempt indices matched.
  function diffWords(refWords, saidWords) {
    const a = refWords.map(normWord), b = saidWords.map(normWord);
    const n = a.length, m = b.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    const refHit = new Set(), saidHit = new Set();
    let i = n, j = m;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) { refHit.add(i - 1); saidHit.add(j - 1); i--; j--; }
      else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
      else j--;
    }
    return { refHit, saidHit };
  }

  function scoreClass(pct) { return pct >= 85 ? 'good' : pct >= 60 ? 'mid' : 'low'; }

  function recordAnswer(m, i, matched, total) {
    const prev = answers[m][i];
    if (!prev || matched / total >= prev.matched / prev.total) answers[m][i] = { matched, total };
    dirty[m] = true;
    renderList();
  }

  function maskText(text) {
    return text.split(/\s+/).map((w) => w.replace(/([A-Za-z0-9])([A-Za-z0-9']*)/, (_, f, r) => f + r.replace(/[A-Za-z0-9]/g, '_'))).join(' ');
  }

  // ══════════════ SHADOWING (speech recognition + own-voice playback) ══════════════
  let recording = false;
  let recognition = null;
  let mediaRecorder = null;
  let mediaStream = null;
  let myAudioUrl = null;
  let myAudio = null;
  let finalText = '';
  let silenceTimer = null;
  let hardTimer = null;
  let recSession = 0; // bumps per recording, so a late mic grant from an old one is dropped

  function startRecord() {
    if (recording || !lesson) return;
    const session = ++recSession;
    if (player && isPlaying) { player.pauseVideo(); stopAt = null; }
    if (continuous) setContinuous(false);
    recording = true;
    finalText = '';
    $('sh-interim').textContent = SR ? 'Đang nghe bạn nói…' : 'Đang ghi âm…';
    $('sh-score').className = 'sh-score';
    const recBtn = $('sh-rec');
    recBtn.classList.add('recording');
    recBtn.innerHTML = '<i class="fas fa-stop"></i> Dừng';

    const seg = lesson.segments[idx];
    const segDur = (seg.end - seg.start) / SPEEDS[speedIdx];
    hardTimer = setTimeout(stopRecord, Math.max(6000, segDur * 2500 + 3000));

    // Recognition starts FIRST and the own-voice capture after it, same order
    // as speaking.js: on Android the mic can only be held by one of them, and
    // the score matters more than the playback button.
    if (SR) {
      recognition = new SR();
      recognition.lang = 'en-US';
      // Android Chrome repeats words across results in continuous mode; one
      // sentence fits in a single non-continuous session anyway.
      recognition.continuous = !/Android/i.test(navigator.userAgent);
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.onresult = (e) => {
        let interim = '';
        finalText = '';
        for (let k = 0; k < e.results.length; k++) {
          if (e.results[k].isFinal) finalText += e.results[k][0].transcript + ' ';
          else interim += e.results[k][0].transcript;
        }
        $('sh-interim').textContent = (finalText + interim).trim() || 'Đang nghe bạn nói…';
        // Stop ~1.5 s after the student goes quiet.
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(stopRecord, 1500);
      };
      recognition.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          toast('Không truy cập được micro — hãy cho phép quyền micro trên trình duyệt.', 'error');
        } else if (e.error === 'network') {
          toast('Không kết nối được dịch vụ nhận diện giọng nói — kiểm tra mạng rồi thử lại.', 'error');
        } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('[shadowing] recognition error', e.error);
        }
      };
      recognition.onend = () => { if (recording) stopRecord(); };
      try { recognition.start(); } catch (err) { console.warn('[shadowing] recognition start failed', err); }
    }
    startAudioCapture(session, idx);
  }

  // Own-voice recording for the "Giọng của tôi" button — best-effort and
  // independent of recognition, so it also works where there's no
  // SpeechRecognition (then it's the only thing the Record button does).
  async function startAudioCapture(session, recIdx) {
    if (!('MediaRecorder' in window) || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (!SR) { stopRecord(); toast('Trình duyệt này không hỗ trợ ghi âm.', 'error'); }
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (!recording || session !== recSession) { stream.getTracks().forEach((t) => t.stop()); return; }
      mediaStream = stream;
      const chunks = [];
      const rec = new MediaRecorder(stream);
      mediaRecorder = rec;
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        if (recIdx !== idx) return; // student already moved to another sentence
        if (myAudioUrl) URL.revokeObjectURL(myAudioUrl);
        myAudioUrl = chunks.length ? URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })) : null;
        $('sh-mine').disabled = !myAudioUrl;
      };
      rec.start();
    } catch (err) {
      console.warn('[shadowing] audio capture unavailable', err);
      if (!SR && recording && session === recSession) {
        stopRecord();
        toast('Không truy cập được micro — hãy cho phép quyền micro trên trình duyệt.', 'error');
      }
    }
  }

  function resetRecordUi() {
    recording = false;
    const recBtn = $('sh-rec');
    recBtn.classList.remove('recording');
    recBtn.innerHTML = '<i class="fas fa-microphone"></i> Nói theo';
  }

  function stopRecord() {
    if (!recording) return;
    clearTimeout(silenceTimer);
    clearTimeout(hardTimer);
    resetRecordUi();
    if (recognition) {
      recognition.onend = null;
      try { recognition.stop(); } catch (_) { /* already stopped */ }
      recognition = null;
    }
    const hadAudio = !!mediaRecorder;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    mediaRecorder = null;
    if (mediaStream) { mediaStream.getTracks().forEach((t) => t.stop()); mediaStream = null; }
    if (SR) gradeShadow(finalText.trim());
    else $('sh-interim').textContent = hadAudio ? 'Đã ghi âm — bấm "Giọng của tôi" để nghe lại và so với bản gốc.' : '';
  }

  function gradeShadow(said) {
    const seg = lesson.segments[idx];
    const ref = tokens(seg.text);
    if (!said) {
      $('sh-interim').textContent = '';
      showScore('sh-score', 'low', 'Chưa nghe thấy bạn nói', 'Bấm "Nói theo" và đọc to câu trên, gần micro hơn một chút.');
      return;
    }
    const { refHit } = diffWords(ref, tokens(said));
    const pct = Math.round((refHit.size / ref.length) * 100);
    $('sh-interim').textContent = 'Máy nghe được: "' + said + '"';
    $('sh-sentence').classList.remove('masked');
    $('sh-sentence').innerHTML = ref.map((w, k) =>
      `<span class="${refHit.has(k) ? 'w-match' : 'w-miss'}">${escHtml(w)}</span>`).join(' ');
    const cls = scoreClass(pct);
    const msg = cls === 'good' ? 'Tuyệt vời!' : cls === 'mid' ? 'Khá tốt — luyện thêm các từ màu đỏ.' : 'Nghe lại và thử thêm lần nữa nhé.';
    showScore('sh-score', cls, `${pct}% — ${msg}`, `Đúng ${refHit.size}/${ref.length} từ. Bấm "Giọng của tôi" để so với bản gốc.`);
    recordAnswer('shadowing', idx, refHit.size, ref.length);
    luluReact(pct, 'shadowing');
  }

  function playMine() {
    if (!myAudioUrl) return;
    if (player && isPlaying) player.pauseVideo();
    if (myAudio) myAudio.pause();
    myAudio = new Audio(myAudioUrl);
    myAudio.play().catch(() => toast('Không phát được bản ghi âm.', 'error'));
  }

  function showScore(id, cls, title, sub) {
    const el = $(id);
    el.className = `sh-score show ${cls}`;
    el.innerHTML = `${escHtml(title)}${sub ? `<small>${escHtml(sub)}</small>` : ''}`;
  }

  // ══════════════ DICTATION ══════════════
  function dcCheck() {
    const seg = lesson.segments[idx];
    const typed = tokens($('dc-input').value.trim(), !!seg.answer);
    if (!typed.length) return;
    const ref = tokens(dictRef(seg), !!seg.answer);
    const { refHit, saidHit } = diffWords(ref, typed);
    const extra = typed.filter((_, k) => !saidHit.has(k));
    const perfect = refHit.size === ref.length && !extra.length;
    const pct = Math.round((refHit.size / ref.length) * 100);
    $('dc-diff').innerHTML = ref.map((w, k) =>
      `<span class="${refHit.has(k) ? 'w-match' : 'w-miss'}">${escHtml(w)}</span>`).join(' ') +
      (extra.length ? ' ' + extra.map((w) => `<span class="w-extra">${escHtml(w)}</span>`).join(' ') : '');
    $('dc-diff').classList.add('show');
    $('dc-vi').textContent = seg.answer ? [seg.text, viOf(seg)].filter(Boolean).join(' — ') : viOf(seg);
    showScore('dc-score', perfect ? 'good' : scoreClass(pct),
      perfect ? '✓ Chính xác!' : `Đúng ${refHit.size}/${ref.length} từ`,
      perfect ? '' : `Từ bôi đỏ là từ bạn thiếu/sai${extra.length ? ', xám gạch ngang là từ thừa' : ''}.`);
    $('dc-check').disabled = true;
    $('dc-check').style.display = 'none';
    $('dc-next').style.display = idx < lesson.segments.length - 1 ? '' : 'none';
    recordAnswer('dictation', idx, refHit.size, ref.length);
    luluReact(perfect ? 100 : pct, 'dictation');
  }

  // Corner Lulu (js/shared/playful.js): hops on a great sentence, cheers
  // once every sentence of the lesson has a great score in this mode.
  function luluReact(pct, m) {
    if (!window.Mascot || pct < 85) return;
    const all = lesson.segments.every((_, i) => {
      const a = answers[m][i];
      return a && a.matched / a.total >= 0.85;
    });
    if (all) window.Mascot.cheer(100, m === 'shadowing' ? 'Nói theo trọn cả bài luôn! Phát âm xịn ghê 🎙🍊' : 'Chép đúng hết cả bài luôn! Tai cậu thính quá trời 🎧🍊');
    else window.Mascot.hop('excited');
  }

  function resetDictationPane() {
    $('dc-input').value = '';
    $('dc-diff').classList.remove('show');
    $('dc-vi').textContent = '';
    $('dc-score').className = 'sh-score';
    $('dc-check').disabled = false;
    $('dc-check').style.display = '';
    $('dc-next').style.display = 'none';
  }

  function dcRetry() {
    resetDictationPane();
    $('dc-input').focus();
  }

  // Next sentence, played straight away — hands stay on the keyboard
  // (Enter → check, Enter → next).
  function dcNext() {
    if (idx >= lesson.segments.length - 1) return;
    goTo(idx + 1);
    $('dc-input').focus({ preventScroll: true });
    playSegment();
  }

  function toggleHint() {
    const el = $('dc-hint');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }

  // ══════════════ NAVIGATION / RENDER ══════════════
  // opts.keepPlaying: called by followVideo() while the video plays on —
  // only the sentence UI moves, the player is left alone.
  function goTo(i, opts) {
    if (!lesson || i < 0 || i >= lesson.segments.length) return;
    const keepPlaying = !!(opts && opts.keepPlaying);
    if (recording) stopRecord();
    if (!keepPlaying) {
      if (player && isPlaying) player.pauseVideo();
      stopAt = null;
      if (continuous) setContinuous(false);
    }
    idx = i;
    const seg = lesson.segments[i];
    $('sh-cur').textContent = i + 1;
    $('sh-prev').disabled = i === 0;
    $('sh-next').disabled = i === lesson.segments.length - 1;

    // Shadowing pane
    const hide = $('opt-hide').checked;
    $('sh-sentence').classList.toggle('masked', hide);
    $('sh-sentence').textContent = hide ? maskText(seg.text) : seg.text;
    $('sh-vi').textContent = viOf(seg);
    $('sh-interim').textContent = '';
    $('sh-score').className = 'sh-score';
    $('sh-mine').disabled = true;
    if (myAudioUrl) { URL.revokeObjectURL(myAudioUrl); myAudioUrl = null; }

    // Dictation pane
    resetDictationPane();
    $('dc-hint').style.display = 'none';
    $('dc-hint').textContent = `${tokens(dictRef(seg), !!seg.answer).length} từ · ${maskText(dictRef(seg))}`;
    $('dc-input').placeholder = seg.answer ? 'Chỉ cần gõ tên / con số bạn nghe được...' : 'Nhập những gì bạn nghe được...';
    if (mode === 'dictation' && !keepPlaying && window.matchMedia('(min-width: 800px)').matches) $('dc-input').focus({ preventScroll: true });

    markCurrent();
    scrollListToCurrent();
  }

  // Vietnamese translation of a sentence, or '' when it has none or the
  // student turned "Hiện tiếng Việt" off.
  function viOf(seg) { return $('opt-vi').checked ? (seg.vi || '') : ''; }

  // Scrolls the transcript box only — scrollIntoView() also scrolled the
  // page, which on mobile (transcript below the panel) yanked the student
  // away from the buttons on every sentence change.
  function scrollListToCurrent() {
    const list = $('sh-list');
    const cur = list.querySelector('.sh-item.current');
    if (!cur) return;
    const top = cur.offsetTop - list.offsetTop;
    if (top < list.scrollTop || top + cur.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: Math.max(0, top - list.clientHeight / 3), behavior: 'smooth' });
    }
  }

  // Moves the .current highlight without rebuilding the list — a rebuild on
  // every sentence change replaced the nodes under the student's cursor, so
  // a double-click to look up a word lost its selection before the
  // dictionary popup could read it.
  function markCurrent() {
    const items = $('sh-list').querySelectorAll('.sh-item');
    if (items.length !== lesson.segments.length) { renderList(); return; }
    items.forEach((el, i) => el.classList.toggle('current', i === idx));
  }

  function renderList() {
    if (!lesson) return;
    const done = answers[mode];
    $('sh-list').innerHTML = lesson.segments.map((s, i) => {
      const a = done[i];
      const pct = a ? Math.round((a.matched / a.total) * 100) : null;
      const masked = mode === 'dictation' && !a;
      return `<div class="sh-item${i === idx ? ' current' : ''}" data-i="${i}">
        <span class="sh-item-num">${i + 1}</span>
        <span class="sh-item-text${masked ? ' masked' : ''}">${masked ? '•••' : escHtml(s.text) + (viOf(s) ? `<span class="sh-item-vi">${escHtml(viOf(s))}</span>` : '')}</span>
        ${pct != null ? `<span class="sh-item-score ${scoreClass(pct)}">${pct}%</span>` : ''}
      </div>`;
    }).join('');
    $('sh-progress').textContent = `${Object.keys(done).length}/${lesson.segments.length} câu`;
  }

  function setMode(m) {
    if (recording) stopRecord();
    mode = m;
    document.querySelectorAll('.sh-mode').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
    $('pane-shadowing').style.display = m === 'shadowing' ? '' : 'none';
    $('pane-dictation').style.display = m === 'dictation' ? '' : 'none';
    $('sh-playall').style.display = m === 'shadowing' ? '' : 'none';
    setVideoCover(m === 'dictation');
    if (m === 'dictation') hideCaptions();
    syncUrl();
    goTo(idx);
    renderList();
  }

  // Covers the video in Dictation so captions / on-screen text can't give
  // the answer away; the student can still lift it if they want.
  function setVideoCover(on) {
    let cover = document.querySelector('.sh-video-cover');
    if (!cover) {
      cover = document.createElement('div');
      cover.className = 'sh-video-cover';
      cover.style.cssText = 'position:absolute;inset:0;background:var(--surface2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--text2);font-size:14px;text-align:center;padding:16px';
      cover.innerHTML = '<i class="fas fa-eye-slash" style="font-size:28px"></i><div>Video đang được che để bạn tập trung nghe.</div>' +
        '<button class="sh-btn sh-btn-ghost" type="button">Hiện video</button>';
      cover.querySelector('button').addEventListener('click', () => { cover.style.display = 'none'; });
      document.querySelector('.sh-video').appendChild(cover);
    }
    cover.style.display = on ? 'flex' : 'none';
  }

  // ══════════════ SAVE SESSION ══════════════
  // Returns once the POSTs settle, so backToList() can refresh the progress
  // pills only after the server has the new scores.
  function saveSession() {
    const pending = [];
    if (!lesson) return Promise.resolve();
    for (const m of ['shadowing', 'dictation']) {
      if (!dirty[m]) continue;
      const rows = Object.entries(answers[m]).map(([i, a]) => ({ segmentIndex: Number(i), matchedWords: a.matched, totalWords: a.total }));
      if (!rows.length) continue;
      dirty[m] = false;
      pending.push(fetch(`${API}/shadowing/lessons/${encodeURIComponent(lesson.slug)}/attempt`, {
        method: 'POST', headers: authH(), keepalive: true,
        body: JSON.stringify({ mode: m, answers: rows }),
      }).catch(() => {}));
    }
    return Promise.all(pending);
  }
  document.addEventListener('pagehide', saveSession);

  // ══════════════ PICKER ══════════════
  async function loadList() {
    try {
      const res = await fetch(`${API}/shadowing/lessons`, { headers: authH() });
      const data = await window.ApiClient.handleResponse(res);
      lessons = data.lessons || [];
    } catch (e) {
      $('sh-grid').innerHTML = '<div class="sh-empty"><i class="fas fa-triangle-exclamation"></i>Không tải được danh sách. Vui lòng thử lại.</div>';
      return;
    }
    renderGrid();
  }

  function fmtDur(s) { return Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0'); }

  function renderGrid() {
    // Category counts follow the level filter and vice versa; a chip with
    // nothing behind it is hidden (unless it's the one selected).
    const match = (l, cat, level) => (!cat || l.category === cat) && (!level || l.level === level);
    document.querySelectorAll('#sh-filters .sh-chip').forEach((c) => {
      const n = lessons.filter((l) => match(l, c.dataset.cat, filterLevel)).length;
      let badge = c.querySelector('.n');
      if (!badge) { badge = document.createElement('span'); badge.className = 'n'; c.appendChild(badge); }
      badge.textContent = `(${n})`;
      c.style.display = n || !c.dataset.cat || c.dataset.cat === filterCat ? '' : 'none';
    });
    document.querySelectorAll('#sh-levels .sh-chip').forEach((c) => {
      const n = lessons.filter((l) => match(l, filterCat, c.dataset.level)).length;
      c.style.display = n || !c.dataset.level || c.dataset.level === filterLevel ? '' : 'none';
    });
    const list = lessons.filter((l) => match(l, filterCat, filterLevel));
    if (!list.length) {
      $('sh-grid').innerHTML = '<div class="sh-empty"><i class="fas fa-video"></i>Chưa có bài nào trong mục này.</div>';
      $('sh-pagination').innerHTML = '';
      return;
    }
    const pages = Math.ceil(list.length / PAGE_SIZE);
    page = Math.min(Math.max(1, page), pages);
    renderPagination(pages, list.length);
    $('sh-grid').innerHTML = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((l) => {
      const p = l.progress || {};
      const pill = (m, icon) => p[m] != null
        ? `<span class="sh-pill ${p[m] >= 85 ? 'good' : ''}"><i class="fas ${icon}"></i> ${p[m]}%</span>` : '';
      return `<div class="sh-card" data-slug="${escHtml(l.slug)}">
        <div class="sh-thumb">
          <img src="https://i.ytimg.com/vi/${encodeURIComponent(l.youtubeId)}/hqdefault.jpg" alt="" loading="lazy">
          <span class="sh-cat">${escHtml(CATEGORY_LABEL[l.category] || l.category)}</span>
          <span class="sh-dur">${fmtDur(l.duration)}</span>
        </div>
        <div class="sh-card-body">
          <div class="sh-card-title">${escHtml(l.title)}</div>
          ${l.description ? `<div class="sh-card-desc">${escHtml(l.description)}</div>` : ''}
          <div class="sh-card-meta"><span>${escHtml(l.channel)}</span><span>${l.segmentCount} câu</span></div>
          <div class="sh-card-progress"><span class="sh-pill sh-level lv-${escHtml(l.level)}">${escHtml(l.level)}</span>${pill('shadowing', 'fa-microphone')}${pill('dictation', 'fa-keyboard')}</div>
        </div>
      </div>`;
    }).join('');
  }

  // Same pager as listening/reading: ‹ 1 … 4 5 6 … 22 › · Trang x/y · n bài
  function renderPagination(pages, total) {
    if (pages <= 1) { $('sh-pagination').innerHTML = ''; return; }
    let start = Math.max(1, page - 2);
    let end = Math.min(pages, page + 2);
    if (end - start < 4) { if (start === 1) end = Math.min(pages, 5); else start = Math.max(1, end - 4); }
    const btn = (p, label, extra = '') => `<button class="pg-btn${extra}" data-page="${p}">${label}</button>`;
    let html = '<div class="pg-wrap">';
    html += `<button class="pg-btn" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
    if (start > 1) { html += btn(1, 1); if (start > 2) html += '<span class="pg-ellipsis">…</span>'; }
    for (let i = start; i <= end; i++) html += btn(i, i, i === page ? ' pg-active' : '');
    if (end < pages) { if (end < pages - 1) html += '<span class="pg-ellipsis">…</span>'; html += btn(pages, pages); }
    html += `<button class="pg-btn" data-page="${page + 1}" ${page === pages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
    html += `<span class="pg-info">Trang ${page}/${pages} · ${total} bài</span></div>`;
    $('sh-pagination').innerHTML = html;
  }

  // ══════════════ OPEN / CLOSE A LESSON ══════════════
  let openSeq = 0;
  async function openLesson(slug, fromCleanPath) {
    if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
      if (window.openUpgradeModal) window.openUpgradeModal();
      return;
    }
    const reqId = ++openSeq;
    $('screen-list').classList.add('hidden');
    $('screen-practice').classList.add('active');
    $('sh-title').textContent = 'Đang tải...';
    let data;
    try {
      const res = await fetch(`${API}/shadowing/lessons/${encodeURIComponent(slug)}`, { headers: authH() });
      data = await window.ApiClient.handleResponse(res);
    } catch (e) {
      if (reqId !== openSeq) return;
      toast('Không tải được bài này.', 'error');
      backToList();
      return;
    }
    if (reqId !== openSeq) return;
    lesson = data.lesson;
    if (!lesson || !(lesson.segments || []).length) { toast('Bài này chưa có dữ liệu.', 'error'); backToList(); return; }

    answers = { shadowing: {}, dictation: {} };
    dirty = { shadowing: false, dictation: false };
    idx = 0;
    $('sh-title').textContent = lesson.title;
    $('sh-sub').innerHTML = `${escHtml(CATEGORY_LABEL[lesson.category] || '')} · ${escHtml(lesson.channel)} · ${escHtml(lesson.level || '')} · ${lesson.segments.length} câu`;
    $('sh-desc').textContent = lesson.description || '';
    $('sh-desc').style.display = lesson.description ? '' : 'none';
    $('sh-desc').classList.remove('open');
    window.scrollTo(0, 0);
    $('sh-total').textContent = lesson.segments.length;
    const srcUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(lesson.youtubeId)}&t=${Math.floor(lesson.clipStart)}s`;
    $('sh-credit').innerHTML = `Video gốc: <a href="${srcUrl}" target="_blank" rel="noopener">${escHtml(lesson.sourceTitle || lesson.title)}</a> — ${escHtml(lesson.channel)}. Bản quyền thuộc kênh gốc, video được nhúng trực tiếp từ YouTube.`;
    $('sh-sr-notice').classList.toggle('show', !SR);

    ensurePlayer(lesson.youtubeId, lesson.clipStart);
    setMode(new URLSearchParams(location.search).get('mode') === 'dictation' ? 'dictation' : 'shadowing');
    if (!fromCleanPath) syncUrl();
    if (typeof setupDictionaryDouble === 'function') setupDictionaryDouble('screen-practice', 'shadowing',
      (e) => !(e.target.closest && e.target.closest('.sh-vi, .sh-item-vi, .masked')));
  }

  function backToList() {
    openSeq++;
    if (recording) stopRecord();
    const saved = saveSession();
    if (player && player.pauseVideo) player.pauseVideo();
    stopAt = null;
    setContinuous(false);
    lesson = null;
    $('screen-practice').classList.remove('active');
    $('screen-list').classList.remove('hidden');
    history.replaceState({}, '', '/shadowing.html');
    saved.then(loadList); // refresh progress pills
  }

  function syncUrl() {
    if (!lesson) return;
    const url = new URL(location.href);
    if (url.pathname.startsWith('/shadowing/')) return; // clean path stays as-is
    url.searchParams.set('lesson', lesson.slug);
    if (mode === 'dictation') url.searchParams.set('mode', 'dictation'); else url.searchParams.delete('mode');
    history.replaceState({}, '', url);
  }

  // ══════════════ EVENTS ══════════════
  $('sh-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.sh-card');
    if (card) openLesson(card.dataset.slug);
  });
  $('sh-filters').addEventListener('click', (e) => {
    const chip = e.target.closest('.sh-chip');
    if (!chip) return;
    filterCat = chip.dataset.cat;
    page = 1;
    document.querySelectorAll('#sh-filters .sh-chip').forEach((c) => c.classList.toggle('active', c === chip));
    renderGrid();
  });
  $('sh-levels').addEventListener('click', (e) => {
    const chip = e.target.closest('.sh-chip');
    if (!chip) return;
    filterLevel = chip.dataset.level;
    page = 1;
    document.querySelectorAll('#sh-levels .sh-chip').forEach((c) => c.classList.toggle('active', c === chip));
    renderGrid();
  });
  $('sh-pagination').addEventListener('click', (e) => {
    const b = e.target.closest('.pg-btn');
    if (!b || b.disabled) return;
    page = Number(b.dataset.page);
    renderGrid();
    $('sh-filters').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('sh-list').addEventListener('click', (e) => {
    const item = e.target.closest('.sh-item');
    // The 2nd click of a double-click is a word lookup (dictionary popup),
    // not another "jump + replay".
    if (!item || e.detail >= 2) return;
    goTo(Number(item.dataset.i));
    if (mode === 'shadowing') playSegment();
  });
  $('opt-hide').addEventListener('change', () => { savePrefs(); goTo(idx); });
  $('opt-autorec').addEventListener('change', savePrefs);
  $('opt-vi').addEventListener('change', () => {
    savePrefs();
    if (!lesson) return;
    $('sh-vi').textContent = viOf(lesson.segments[idx]);
    if ($('dc-diff').classList.contains('show')) $('dc-vi').textContent = viOf(lesson.segments[idx]);
    renderList();
  });

  $('dc-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!$('dc-check').disabled) dcCheck();
      else dcNext();
    }
  });
  // Same anti-paste guard as dictation.html — type what you hear.
  $('dc-input').addEventListener('paste', (e) => { e.preventDefault(); showToast('Không thể dán văn bản vào đây — hãy nghe và gõ lại.', 'warn', 3000); });
  $('dc-input').addEventListener('drop', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    if (!lesson || !$('screen-practice').classList.contains('active')) return;
    if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); playSegment(); return; }
    const t = e.target;
    if (t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === 'Space') {
      // A focused button would also "click" itself on keyup — blur it so
      // Space only ever means play/pause here.
      if (t && t.tagName === 'BUTTON') t.blur();
      e.preventDefault();
      playSegment();
    }
    else if (e.key === 'ArrowRight') goTo(idx + 1);
    else if (e.key === 'ArrowLeft') goTo(idx - 1);
    else if ((e.key === 'r' || e.key === 'R') && mode === 'shadowing') toggleRecord();
  });

  function toggleRecord() { if (recording) stopRecord(); else startRecord(); }

  // Inline onclick handlers in shadowing.html
  Object.assign(window, { backToList, setMode, toggleBigVideo, goTo, playSegment, playAll, toggleRecord, playMine, cycleSpeed, dcCheck, dcRetry, dcNext, toggleHint });
  Object.defineProperty(window, 'idx', { get: () => idx, configurable: true });

  // ══════════════ INIT ══════════════
  document.addEventListener('DOMContentLoaded', () => {
    const prefs = loadPrefs();
    if (Number.isInteger(prefs.speedIdx) && SPEEDS[prefs.speedIdx]) { speedIdx = prefs.speedIdx; $('sh-speed').textContent = SPEEDS[speedIdx] + 'x'; }
    $('opt-autorec').checked = !!prefs.autorec;
    $('opt-hide').checked = !!prefs.hide;
    $('opt-vi').checked = prefs.vi !== false;
    bigVideo = prefs.bigVideo !== false;
    applyBigVideo();
    // Tips stay open until the student folds them away once.
    if (prefs.tipsClosed) $('sh-tips').open = false;
    $('sh-tips').addEventListener('toggle', savePrefs);

    const promo = $('premium-promo-banner');
    if (promo) promo.style.display = (window.AuthService && !window.AuthService.hasPremiumAccess()) ? 'flex' : 'none';

    const clean = window.RouteParams ? window.RouteParams.match([
      { pattern: /^\/shadowing\/([^/?#]+)$/, param: 'lesson' },
    ]) : null;
    const slug = (clean && clean.lesson) || new URLSearchParams(location.search).get('lesson');
    loadList().then(() => { if (slug) openLesson(slug, !!clean); });

    setTimeout(() => {
      if (!(window.YT && window.YT.Player)) console.warn('[shadowing] YouTube IFrame API did not load (blocked by network/CSP?)');
    }, 10000);
  });
})();
