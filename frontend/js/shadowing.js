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
 */
(function () {
  'use strict';

  const API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  const authH = () => ({ ...window.AuthService.authHeader(), 'Content-Type': 'application/json' });
  const $ = (id) => document.getElementById(id);

  const CATEGORY_LABEL = { 'ielts-part1': 'Speaking Part 1', 'ielts-part2': 'Speaking Part 2', '6-minute-english': '6 Minute English' };
  const SPEEDS = [1, 0.75, 0.5, 1.25];
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  let lessons = [];
  let filterCat = '';
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
      if (!player || stopAt == null) return;
      if (player.getCurrentTime() >= stopAt) {
        player.pauseVideo();
        stopAt = null;
        stopPoll();
        onSegmentEnded();
      }
    }, 50);
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
    if (isPlaying && stopAt != null) { p.pauseVideo(); stopAt = null; return; }
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
  function tokens(text) {
    return (text || '').replace(/[-–—]/g, ' ').split(/\s+/).filter((w) => normWord(w) !== '');
  }

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
    return text.split(/\s+/).map((w) => w.replace(/([A-Za-z])([A-Za-z']*)/, (_, f, r) => f + r.replace(/[A-Za-z]/g, '_'))).join(' ');
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
    const typed = tokens($('dc-input').value.trim());
    if (!typed.length) return;
    const ref = tokens(lesson.segments[idx].text);
    const { refHit, saidHit } = diffWords(ref, typed);
    const extra = typed.filter((_, k) => !saidHit.has(k));
    const perfect = refHit.size === ref.length && !extra.length;
    const pct = Math.round((refHit.size / ref.length) * 100);
    $('dc-diff').innerHTML = ref.map((w, k) =>
      `<span class="${refHit.has(k) ? 'w-match' : 'w-miss'}">${escHtml(w)}</span>`).join(' ') +
      (extra.length ? ' ' + extra.map((w) => `<span class="w-extra">${escHtml(w)}</span>`).join(' ') : '');
    $('dc-diff').classList.add('show');
    showScore('dc-score', perfect ? 'good' : scoreClass(pct),
      perfect ? '✓ Chính xác!' : `Đúng ${refHit.size}/${ref.length} từ`,
      perfect ? '' : `Từ bôi đỏ là từ bạn thiếu/sai${extra.length ? ', xám gạch ngang là từ thừa' : ''}.`);
    $('dc-check').disabled = true;
    recordAnswer('dictation', idx, refHit.size, ref.length);
  }

  function dcRetry() {
    $('dc-input').value = '';
    $('dc-diff').classList.remove('show');
    $('dc-score').className = 'sh-score';
    $('dc-check').disabled = false;
    $('dc-input').focus();
  }

  function toggleHint() {
    const el = $('dc-hint');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }

  // ══════════════ NAVIGATION / RENDER ══════════════
  function goTo(i) {
    if (!lesson || i < 0 || i >= lesson.segments.length) return;
    if (recording) stopRecord();
    if (player && isPlaying) player.pauseVideo();
    stopAt = null;
    idx = i;
    const seg = lesson.segments[i];
    $('sh-cur').textContent = i + 1;
    $('sh-prev').disabled = i === 0;
    $('sh-next').disabled = i === lesson.segments.length - 1;

    // Shadowing pane
    const hide = $('opt-hide').checked;
    $('sh-sentence').classList.toggle('masked', hide);
    $('sh-sentence').textContent = hide ? maskText(seg.text) : seg.text;
    $('sh-interim').textContent = '';
    $('sh-score').className = 'sh-score';
    $('sh-mine').disabled = true;
    if (myAudioUrl) { URL.revokeObjectURL(myAudioUrl); myAudioUrl = null; }

    // Dictation pane
    $('dc-input').value = '';
    $('dc-diff').classList.remove('show');
    $('dc-score').className = 'sh-score';
    $('dc-check').disabled = false;
    $('dc-hint').style.display = 'none';
    $('dc-hint').textContent = `${tokens(seg.text).length} từ · ${maskText(seg.text)}`;
    if (mode === 'dictation' && window.matchMedia('(min-width: 800px)').matches) $('dc-input').focus();

    renderList();
    const cur = document.querySelector('.sh-item.current');
    if (cur) cur.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
        <span class="sh-item-text${masked ? ' masked' : ''}">${masked ? '•••' : escHtml(s.text)}</span>
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
    setVideoCover(m === 'dictation');
    if (m === 'dictation') hideCaptions();
    syncUrl();
    goTo(idx);
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
    const list = lessons.filter((l) => !filterCat || l.category === filterCat);
    if (!list.length) {
      $('sh-grid').innerHTML = '<div class="sh-empty"><i class="fas fa-video"></i>Chưa có bài nào trong mục này.</div>';
      return;
    }
    $('sh-grid').innerHTML = list.map((l) => {
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
          <div class="sh-card-meta"><span>${escHtml(l.channel)}</span><span>${l.segmentCount} câu</span></div>
          <div class="sh-card-progress"><span class="sh-pill sh-level">${escHtml(l.level)}</span>${pill('shadowing', 'fa-microphone')}${pill('dictation', 'fa-keyboard')}</div>
        </div>
      </div>`;
    }).join('');
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
    $('sh-sub').innerHTML = `${escHtml(CATEGORY_LABEL[lesson.category] || '')} · ${escHtml(lesson.channel)} · ${lesson.segments.length} câu`;
    $('sh-total').textContent = lesson.segments.length;
    const srcUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(lesson.youtubeId)}&t=${Math.floor(lesson.clipStart)}s`;
    $('sh-credit').innerHTML = `Video gốc: <a href="${srcUrl}" target="_blank" rel="noopener">${escHtml(lesson.sourceTitle || lesson.title)}</a> — ${escHtml(lesson.channel)}. Bản quyền thuộc kênh gốc, video được nhúng trực tiếp từ YouTube.`;
    $('sh-sr-notice').classList.toggle('show', !SR);

    ensurePlayer(lesson.youtubeId, lesson.clipStart);
    setMode(new URLSearchParams(location.search).get('mode') === 'dictation' ? 'dictation' : 'shadowing');
    if (!fromCleanPath) syncUrl();
    if (typeof setupDictionaryDouble === 'function') setupDictionaryDouble('screen-practice', 'shadowing');
  }

  function backToList() {
    openSeq++;
    if (recording) stopRecord();
    const saved = saveSession();
    if (player && player.pauseVideo) player.pauseVideo();
    stopAt = null;
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
    document.querySelectorAll('.sh-chip').forEach((c) => c.classList.toggle('active', c === chip));
    renderGrid();
  });
  $('sh-list').addEventListener('click', (e) => {
    const item = e.target.closest('.sh-item');
    if (!item) return;
    goTo(Number(item.dataset.i));
    if (mode === 'shadowing') playSegment();
  });
  $('opt-hide').addEventListener('change', () => goTo(idx));

  $('dc-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!$('dc-check').disabled) dcCheck();
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
  Object.assign(window, { backToList, setMode, goTo, playSegment, toggleRecord, playMine, cycleSpeed, dcCheck, dcRetry, toggleHint });
  Object.defineProperty(window, 'idx', { get: () => idx, configurable: true });

  // ══════════════ INIT ══════════════
  document.addEventListener('DOMContentLoaded', () => {
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
