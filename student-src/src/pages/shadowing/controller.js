// The Shadowing player: YouTube, the microphone and scoring, one per opened
// lesson. It holds the fast-changing state (a 50 ms poll reads it) and hands
// React a snapshot through `view` whenever something on screen changes.
import { apiFetch } from '../../utils/api';
import { siteToast } from '../../utils/shell';

export const MODES = ['watch', 'shadowing', 'dictation'];
export const SPEEDS = [1, 0.75, 0.5, 1.25];
const SR = () => window.SpeechRecognition || window.webkitSpeechRecognition;
export const hasSpeechRecognition = () => !!SR();

const PREFS_KEY = 'ews_shadowing_prefs';
export function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; } catch { return {}; }
}
export function savePrefs(patch) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify({ ...loadPrefs(), ...patch })); } catch { /* storage unavailable */ }
}

// Same numbers as backend/utils/shadowingClip.js: a silence of SKIP_GAP s or
// more between two sentences is a part cut out of the lesson (an ad, the Part 2
// preparation minute). Straight-through play jumps it.
const SKIP_GAP = 6;
const GAP_TAIL = 1;
const GAP_LEAD = 0.4;
// Subtitles go off between two sentences at least this far apart
const SUB_GAP = 2;
const SUB_HOLD = 0.6;
const DC_MAX_ASKS = 3; // "Hỏi Lulu" letters per sentence (the sentence is graded)

// British spellings in the captions vs. what en-US recognition writes back
const SPELLING = {
  ok: 'okay', centre: 'center', realise: 'realize', realised: 'realized', programme: 'program',
  practise: 'practice', favourite: 'favorite', colour: 'color', neighbour: 'neighbor',
  theatre: 'theater', behaviour: 'behavior', travelling: 'traveling', organise: 'organize',
};
export function normWord(w) {
  const n = w.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9']/g, '').replace(/^'+|'+$/g, '');
  return SPELLING[n] || n;
}
// Hyphenated words are scored as their parts. joinDigits (a number `answer`):
// "1387 9645" and "13879645" are the same number.
export function tokens(text, joinDigits = false) {
  const words = (text || '').replace(/[-–—]/g, ' ').split(/\s+/).filter((w) => normWord(w) !== '');
  if (!joinDigits) return words;
  const out = [];
  let joinNext = false;
  for (const w of words) {
    const digits = /^\d+$/.test(normWord(w));
    if (digits && joinNext) out[out.length - 1] += w; else out.push(w);
    joinNext = digits && !/[,;.?!]$/.test(w);
  }
  return out;
}
// What Dictation grades: just the name / number when the sentence has one
export const dictRef = (seg) => seg.answer || seg.text;
export const scoreClass = (pct) => (pct >= 85 ? 'good' : pct >= 60 ? 'mid' : 'low');
export const maskText = (text) => text.split(/\s+/)
  .map((w) => w.replace(/([A-Za-z0-9])([A-Za-z0-9']*)/, (_, f, r) => f + r.replace(/[A-Za-z0-9]/g, '_'))).join(' ');
export const hintText = (seg) => `${tokens(dictRef(seg), !!seg.answer).length} từ · ${maskText(dictRef(seg))}`;

// LCS word alignment → which reference / attempt indices matched
export function diffWords(refWords, saidWords) {
  const a = refWords.map(normWord);
  const b = saidWords.map(normWord);
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const refHit = new Set();
  const saidHit = new Set();
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) { refHit.add(i - 1); saidHit.add(j - 1); i--; j--; }
    else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
    else j--;
  }
  return { refHit, saidHit };
}

// The IFrame API script, loaded once for the whole app
let ytApi = null;
function loadYouTubeApi() {
  if (ytApi) return ytApi;
  ytApi = new Promise((resolve) => {
    if (window.YT?.Player) { resolve(); return; }
    const before = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { before?.(); resolve(); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    document.head.appendChild(s);
  });
  return ytApi;
}

const wide = () => window.matchMedia('(min-width: 800px)').matches;
const emptyDictation = { dcDiff: null, dcVi: '', dcScore: null, dcChecked: false };

export function createShadowing({ lesson, onModeChange }) {
  const segs = lesson.segments;
  const stored = loadPrefs();
  // Read when the lesson opens: a card opened later has no mode in its address
  const urlMode = new URLSearchParams(window.location.search).get('mode');
  const startMode = MODES.includes(urlMode) ? urlMode : MODES.includes(stored.lastMode) ? stored.lastMode : 'shadowing';

  const view = {
    idx: 0,
    mode: startMode,
    lastMode: MODES.includes(stored.lastMode) ? stored.lastMode : 'shadowing',
    chooser: !MODES.includes(urlMode), // a link naming the mode skips the picker
    playing: false,
    paused: false,
    continuous: false,
    subGap: false,
    speedIdx: Number.isInteger(stored.speedIdx) && SPEEDS[stored.speedIdx] ? stored.speedIdx : 0,
    autorec: !!stored.autorec,
    hide: !!stored.hide,
    vi: stored.vi !== false,
    sub: stored.sub !== false,
    bigVideo: stored.bigVideo !== false,
    answers: { shadowing: {}, dictation: {} },
    recording: false,
    interim: '',
    spoken: null, // words of the last graded attempt
    shScore: null,
    wtDone: null,
    hasMine: false,
    coverLifted: false,
    hintOpen: false,
    hint: null,
    ...emptyDictation,
  };

  let onView = null;
  let ui = {};
  let attached = false;
  function set(patch) {
    Object.assign(view, patch);
    onView?.({ ...view });
  }

  const dirty = { shadowing: false, dictation: false };
  // One id per opening: a repeat save updates that session's row on the server
  const sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  let dcHintShown = [];
  let dcAsks = 0;

  // ══ YouTube ══
  let player = null;
  let playerReady = new Promise(() => {});
  let stopAt = null;
  let pollTimer = null;
  let lastPollT = null;
  let isPlaying = false;

  const ready = async () => {
    const p = await playerReady;
    return attached ? p : null;
  };

  function hideCaptions() {
    // Undocumented but harmless if it goes away; the cover is the real safeguard
    try { player?.unloadModule?.('captions'); } catch { /* ignore */ }
  }

  function stopPoll() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    lastPollT = null;
  }

  // Playing straight through, just past a sentence followed by a cut part:
  // jump over it. A student dragging the seek bar into it is left there.
  function skipCut(t) {
    const prev = lastPollT;
    lastPollT = t;
    if (prev == null || t < prev || t - prev > 2) return false;
    for (let k = 0; k + 1 < segs.length; k++) {
      const from = segs[k].end + GAP_TAIL;
      const to = segs[k + 1].start - GAP_LEAD;
      if (segs[k + 1].start - segs[k].end >= SKIP_GAP && prev < from && t >= from && t < to) {
        player.seekTo(to, true);
        lastPollT = null;
        return true;
      }
    }
    return false;
  }

  function syncSubtitleGap(t) {
    const seg = segs[view.idx];
    const next = segs[view.idx + 1];
    const gap = t > seg.end + SUB_HOLD && (!next || (next.start - seg.end >= SUB_GAP && t < next.start));
    if (gap !== view.subGap) set({ subGap: gap });
  }

  // Free play: the current sentence moves with the video. Not in Dictation,
  // where a sentence change would wipe what the student is typing.
  function followVideo(t) {
    if (view.mode === 'dictation' || t < segs[0].start || t > segs[segs.length - 1].end + 1) return;
    let i = view.idx;
    while (i + 1 < segs.length && t >= segs[i + 1].start) i++;
    while (i > 0 && t < segs[i].start) i--;
    if (i !== view.idx) goTo(i, { keepPlaying: true });
  }

  function startPoll() {
    stopPoll();
    pollTimer = setInterval(() => {
      if (!player) return;
      const t = player.getCurrentTime();
      if (stopAt == null || view.continuous) {
        if (skipCut(t)) return;
        followVideo(t);
        if (view.mode === 'watch') syncSubtitleGap(t);
      }
      if (stopAt != null && t >= stopAt) {
        player.pauseVideo();
        stopAt = null;
        stopPoll();
        if (view.continuous) {
          set({ continuous: false });
          if (view.mode === 'watch') {
            set({ wtDone: { cls: 'good', title: '🎉 Xem hết bài rồi!', sub: 'Giờ chọn tab Shadowing để nói theo từng câu, hoặc Dictation để chép lại.' } });
          }
        } else if (view.mode === 'shadowing' && view.autorec && !view.recording) startRecord();
      }
    }, 50);
  }

  function onPlayerState(e) {
    isPlaying = e.data === window.YT.PlayerState.PLAYING;
    set({ playing: isPlaying, paused: !isPlaying });
    if (isPlaying) startPoll(); else stopPoll();
    if (view.mode === 'dictation' || view.mode === 'watch') hideCaptions();
  }

  // A fresh player for every lesson: reusing one left the previous video's
  // caption box frozen over the new video.
  function createPlayer() {
    playerReady = loadYouTubeApi().then(() => new Promise((resolve) => {
      if (!attached) return;
      const el = document.createElement('div');
      el.id = 'yt-player';
      ui.host.replaceChildren(el);
      const p = new window.YT.Player(el, {
        videoId: lesson.youtubeId,
        width: '100%',
        height: '100%',
        playerVars: {
          start: Math.floor(lesson.clipStart), rel: 0, modestbranding: 1, playsinline: 1,
          iv_load_policy: 3, cc_load_policy: 0, origin: window.location.origin,
        },
        events: {
          onReady: () => resolve(p),
          onStateChange: (e) => { if (p === player) onPlayerState(e); },
          onError: (e) => {
            console.error('[shadowing] YouTube error', e?.data);
            siteToast('Không phát được video này — vui lòng thử lại sau.', 'error');
          },
        },
      });
      player = p;
    }));
  }

  function run(p, from) {
    p.seekTo(from, true);
    p.setPlaybackRate(SPEEDS[view.speedIdx]);
    p.playVideo();
  }

  async function playSegment() {
    if (view.recording) stopRecord();
    const p = await ready();
    if (!p) return;
    if (isPlaying && stopAt != null) { p.pauseVideo(); stopAt = null; set({ continuous: false }); return; }
    set({ continuous: false });
    stopAt = segs[view.idx].end;
    run(p, segs[view.idx].start);
  }

  async function playAll() {
    if (view.recording) stopRecord();
    const p = await ready();
    if (!p) return;
    if (view.continuous) { p.pauseVideo(); stopAt = null; set({ continuous: false }); return; }
    set({ continuous: true });
    stopAt = segs[segs.length - 1].end;
    run(p, segs[view.idx].start);
  }

  // Plays from sentence i (default: where the student is) to the end of the clip
  async function watchFrom(i) {
    if (i != null && i !== view.idx) goTo(i);
    const p = await ready();
    if (!p) return;
    set({ wtDone: null, continuous: true });
    stopAt = segs[segs.length - 1].end;
    run(p, segs[view.idx].start);
  }

  // Resumes where it paused, unless the student has moved to another sentence
  async function watchToggle() {
    const p = await ready();
    if (!p) return;
    if (isPlaying) { p.pauseVideo(); return; }
    const t = p.getCurrentTime();
    const seg = segs[view.idx];
    const next = segs[view.idx + 1];
    const inCurrent = t >= seg.start - 0.2 && (next ? t < next.start : t < seg.end - 0.2);
    if (!inCurrent) { watchFrom(); return; }
    set({ wtDone: null, continuous: true });
    stopAt = segs[segs.length - 1].end;
    p.setPlaybackRate(SPEEDS[view.speedIdx]);
    p.playVideo();
  }

  function cycleSpeed() {
    const speedIdx = (view.speedIdx + 1) % SPEEDS.length;
    set({ speedIdx });
    player?.setPlaybackRate?.(SPEEDS[speedIdx]);
    savePrefs({ speedIdx });
  }

  // ══ Scores ══
  function recordAnswer(m, i, matched, total) {
    const prev = view.answers[m][i];
    const best = !prev || matched / total >= prev.matched / prev.total ? { matched, total } : prev;
    dirty[m] = true;
    set({ answers: { ...view.answers, [m]: { ...view.answers[m], [i]: best } } });
  }

  // Corner Lulu: hops on a great sentence, cheers once all of them are great
  function luluReact(pct, m) {
    if (!window.Mascot || pct < 85) return;
    const all = segs.every((_, i) => {
      const a = view.answers[m][i];
      return a && a.matched / a.total >= 0.85;
    });
    if (all) window.Mascot.cheer(100, m === 'shadowing' ? 'Nói theo trọn cả bài luôn! Phát âm xịn ghê 🎙🍊' : 'Chép đúng hết cả bài luôn! Tai cậu thính quá trời 🎧🍊');
    else window.Mascot.hop('excited');
  }

  // ══ Recording ══
  let recognition = null;
  let mediaRecorder = null;
  let mediaStream = null;
  let myAudioUrl = null;
  let myAudio = null;
  let finalText = '';
  let interimText = ''; // iOS Safari often never marks the sentence final
  let silenceTimer = null;
  let hardTimer = null;
  let recSession = 0; // a late mic grant from an older recording is dropped

  function dropMyAudio() {
    if (myAudioUrl) URL.revokeObjectURL(myAudioUrl);
    myAudioUrl = null;
  }

  function gradeShadow(said) {
    if (!said) {
      set({ interim: '', shScore: { cls: 'low', title: 'Chưa nghe thấy bạn nói', sub: 'Bấm "Nói theo" và đọc to câu trên, gần micro hơn một chút.' } });
      return;
    }
    const ref = tokens(segs[view.idx].text);
    const { refHit } = diffWords(ref, tokens(said));
    const pct = Math.round((refHit.size / ref.length) * 100);
    const cls = scoreClass(pct);
    const msg = cls === 'good' ? 'Tuyệt vời!' : cls === 'mid' ? 'Khá tốt — luyện thêm các từ màu đỏ.' : 'Nghe lại và thử thêm lần nữa nhé.';
    set({
      interim: `Máy nghe được: "${said}"`,
      spoken: ref.map((w, k) => ({ w, hit: refHit.has(k) })),
      shScore: { cls, title: `${pct}% — ${msg}`, sub: `Đúng ${refHit.size}/${ref.length} từ. Bấm "Giọng của tôi" để so với bản gốc.` },
    });
    recordAnswer('shadowing', view.idx, refHit.size, ref.length);
    luluReact(pct, 'shadowing');
  }

  function stopRecord() {
    if (!view.recording) return;
    clearTimeout(silenceTimer);
    clearTimeout(hardTimer);
    set({ recording: false });
    if (recognition) {
      recognition.onend = null;
      try { recognition.stop(); } catch { /* already stopped */ }
      recognition = null;
    }
    const hadAudio = !!mediaRecorder;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    mediaRecorder = null;
    mediaStream?.getTracks().forEach((t) => t.stop());
    mediaStream = null;
    if (SR()) gradeShadow(`${finalText}${interimText}`.trim());
    else set({ interim: hadAudio ? 'Đã ghi âm — bấm "Giọng của tôi" để nghe lại và so với bản gốc.' : '' });
  }

  // Own-voice recording for "Giọng của tôi": best-effort, separate from
  // recognition (where there is none, it's all the button does)
  async function startAudioCapture(session, recIdx) {
    if (!('MediaRecorder' in window) || !navigator.mediaDevices?.getUserMedia) {
      if (!SR()) { stopRecord(); siteToast('Trình duyệt này không hỗ trợ ghi âm.', 'error'); }
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (!view.recording || session !== recSession) { stream.getTracks().forEach((t) => t.stop()); return; }
      mediaStream = stream;
      const chunks = [];
      const rec = new MediaRecorder(stream);
      mediaRecorder = rec;
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        if (recIdx !== view.idx || !attached) return; // already on another sentence
        dropMyAudio();
        myAudioUrl = chunks.length ? URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })) : null;
        set({ hasMine: !!myAudioUrl });
      };
      rec.start();
    } catch (err) {
      console.warn('[shadowing] audio capture unavailable', err);
      if (!SR() && view.recording && session === recSession) {
        stopRecord();
        siteToast('Không truy cập được micro — hãy cho phép quyền micro trên trình duyệt.', 'error');
      }
    }
  }

  function startRecord() {
    if (view.recording) return;
    const session = ++recSession;
    const Recognition = SR();
    if (player && isPlaying) { player.pauseVideo(); stopAt = null; }
    finalText = '';
    interimText = '';
    set({ continuous: false, recording: true, interim: Recognition ? 'Đang nghe bạn nói…' : 'Đang ghi âm…', shScore: null });

    const seg = segs[view.idx];
    const length = (seg.end - seg.start) / SPEEDS[view.speedIdx];
    hardTimer = setTimeout(stopRecord, Math.max(6000, length * 2500 + 3000));

    // Recognition first: on Android only one of them can hold the mic, and the
    // score matters more than the playback button.
    if (Recognition) {
      recognition = new Recognition();
      recognition.lang = 'en-US';
      // Android Chrome repeats words across results in continuous mode
      recognition.continuous = !/Android/i.test(navigator.userAgent);
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.onresult = (e) => {
        let interim = '';
        finalText = '';
        for (let k = 0; k < e.results.length; k++) {
          if (e.results[k].isFinal) finalText += `${e.results[k][0].transcript} `;
          else interim += e.results[k][0].transcript;
        }
        interimText = interim;
        set({ interim: `${finalText}${interim}`.trim() || 'Đang nghe bạn nói…' });
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(stopRecord, 1500); // ~1.5 s after going quiet
      };
      recognition.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          siteToast('Không truy cập được micro — hãy cho phép quyền micro trên trình duyệt.', 'error');
        } else if (e.error === 'network') {
          siteToast('Không kết nối được dịch vụ nhận diện giọng nói — kiểm tra mạng rồi thử lại.', 'error');
        } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('[shadowing] recognition error', e.error);
        }
      };
      recognition.onend = () => { if (view.recording) stopRecord(); };
      try { recognition.start(); } catch (err) { console.warn('[shadowing] recognition start failed', err); }
    }
    startAudioCapture(session, view.idx);
  }

  const toggleRecord = () => { if (view.recording) stopRecord(); else startRecord(); };

  function playMine() {
    if (!myAudioUrl) return;
    if (player && isPlaying) player.pauseVideo();
    myAudio?.pause();
    myAudio = new Audio(myAudioUrl);
    myAudio.play().catch(() => siteToast('Không phát được bản ghi âm.', 'error'));
  }

  // ══ Dictation ══
  const focusInput = () => ui.input?.()?.focus({ preventScroll: true });

  function resetDictation() {
    const input = ui.input?.();
    if (input) input.value = '';
    set({ ...emptyDictation });
  }

  function dcCheck() {
    const seg = segs[view.idx];
    let typed = tokens((ui.input?.()?.value || '').trim(), !!seg.answer);
    if (!typed.length) return;
    const ref = tokens(dictRef(seg), !!seg.answer);
    // A name / number also counts when only the spacing differs
    const compact = (ws) => ws.map(normWord).join('');
    if (seg.answer && compact(typed) === compact(ref)) typed = ref.slice();
    const { refHit, saidHit } = diffWords(ref, typed);
    const extra = typed.filter((_, k) => !saidHit.has(k));
    const perfect = refHit.size === ref.length && !extra.length;
    const pct = Math.round((refHit.size / ref.length) * 100);
    const vi = view.vi ? seg.vi || '' : '';
    set({
      dcDiff: { ref: ref.map((w, k) => ({ w, hit: refHit.has(k) })), extra },
      // The Vietnamese meaning is the reward for a sentence typed right
      dcVi: [seg.answer ? seg.text : '', perfect ? vi : ''].filter(Boolean).join(' — '),
      dcScore: {
        cls: perfect ? 'good' : scoreClass(pct),
        title: perfect ? '✓ Chính xác!' : `Đúng ${refHit.size}/${ref.length} từ`,
        sub: perfect ? '' : `Từ bôi đỏ là từ bạn thiếu/sai${extra.length ? ', xám gạch ngang là từ thừa' : ''}.`,
      },
      dcChecked: true,
    });
    recordAnswer('dictation', view.idx, refHit.size, ref.length);
    luluReact(perfect ? 100 : pct, 'dictation');
  }

  function dcRetry() {
    resetDictation();
    ui.input?.()?.focus();
  }

  // Next sentence, played straight away: Enter → check, Enter → next
  function dcNext() {
    if (view.idx >= segs.length - 1) return;
    goTo(view.idx + 1);
    focusInput();
    playSegment();
  }

  // The first ask shows the first-letter pattern; each later one opens ONE
  // more letter of the first word not typed right yet.
  function toggleHint() {
    const btn = ui.hintBtn?.();
    const lulu = window.AskLulu;
    if (!view.hintOpen) {
      set({ hintOpen: true });
      if (lulu) {
        lulu.left(btn, DC_MAX_ASKS);
        lulu.say(btn, `Chữ cái đầu mỗi từ đây nè! Bí nữa thì hỏi Lulu tiếp (tối đa ${DC_MAX_ASKS} lần) 🍊`);
      }
      return;
    }
    if (!lulu || dcAsks >= DC_MAX_ASKS) return;
    const seg = segs[view.idx];
    const ref = dictRef(seg);
    const res = lulu.letterHint(ref, ui.input?.()?.value || '', dcHintShown);
    set({ hint: `${tokens(ref, !!seg.answer).length} từ · ${res.pattern}` });
    if (!res.done) { dcAsks += 1; lulu.left(btn, DC_MAX_ASKS - dcAsks); }
    lulu.say(btn, lulu.line(res));
  }

  // ══ Moving around ══
  // keepPlaying: the video plays on and only the sentence on screen moves
  function goTo(i, { keepPlaying = false } = {}) {
    if (i < 0 || i >= segs.length) return;
    if (view.recording) stopRecord();
    const patch = {};
    if (!keepPlaying) {
      if (player && isPlaying) player.pauseVideo();
      stopAt = null;
      patch.continuous = false;
    }
    dropMyAudio();
    dcHintShown = [];
    dcAsks = 0;
    ui.hintBtn?.()?.querySelector('.ask-lulu-left')?.remove();
    resetDictation();
    set({ ...patch, idx: i, subGap: false, interim: '', spoken: null, shScore: null, hasMine: false, hintOpen: false, hint: null });
    if (view.mode === 'watch') hideCaptions();
    if (view.mode === 'dictation' && !keepPlaying && wide()) focusInput();
  }

  // ← / → / "Câu tiếp": move and play it straight away; in watch mode a
  // playing video carries on from the new sentence.
  function step(delta) {
    const i = view.idx + delta;
    if (i < 0 || i >= segs.length) return;
    const wasPlaying = isPlaying;
    goTo(i);
    if (view.mode !== 'watch') playSegment();
    else if (wasPlaying) watchFrom();
  }

  function clickSentence(i) {
    goTo(i);
    if (view.mode === 'shadowing') playSegment();
    else if (view.mode === 'watch') watchFrom();
  }

  function setMode(m) {
    const mode = MODES.includes(m) ? m : 'shadowing';
    if (view.recording) stopRecord();
    if (view.lastMode !== mode) savePrefs({ lastMode: mode });
    set({ mode, lastMode: mode, wtDone: null, coverLifted: false });
    if (mode !== 'shadowing') hideCaptions();
    onModeChange(mode);
    goTo(view.idx);
  }

  // The click that picks a mode is also the gesture that lets the video start
  function chooseMode(m) {
    set({ chooser: false });
    setMode(m);
    if (m === 'watch') watchFrom(0);
    else playSegment();
  }

  function setOption(name, value) {
    if (name === 'vi') {
      set({ vi: value });
      savePrefs({ vi: value });
      return;
    }
    set({ [name]: value });
    savePrefs({ [name]: value });
    if (name === 'hide') goTo(view.idx);
    if (name === 'sub' && view.mode === 'watch') hideCaptions(); // ours replace YouTube's
  }

  function toggleBigVideo() {
    const bigVideo = !view.bigVideo;
    set({ bigVideo });
    savePrefs({ bigVideo });
  }

  function toggleSubtitles() { setOption('sub', !view.sub); }

  // ══ Saving ══
  // Settles once the server has the scores (the list then shows them)
  function save() {
    const pending = [];
    for (const m of ['shadowing', 'dictation']) {
      if (!dirty[m]) continue;
      const answers = Object.entries(view.answers[m]).map(([i, a]) => ({ segmentIndex: Number(i), matchedWords: a.matched, totalWords: a.total }));
      if (!answers.length) continue;
      dirty[m] = false;
      pending.push(apiFetch(`/shadowing/lessons/${encodeURIComponent(lesson.slug)}/attempt`, {
        method: 'POST', keepalive: true, body: JSON.stringify({ mode: m, answers, sessionId }),
      }).catch(() => {}));
    }
    return Promise.all(pending);
  }
  // Phones often kill a hidden tab without any pagehide
  const onHidden = () => { if (document.visibilityState === 'hidden') save(); };

  function onKey(e) {
    if (view.chooser) {
      if (e.key === 'Escape') set({ chooser: false });
      else if (/^[123]$/.test(e.key)) chooseMode(MODES[Number(e.key) - 1]);
      return;
    }
    const play = view.mode === 'watch' ? watchToggle : playSegment;
    if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); play(); return; }
    const t = e.target;
    if (t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === 'Space') {
      // A focused button would also "click" itself on keyup
      if (t?.tagName === 'BUTTON') t.blur();
      e.preventDefault();
      play();
    } else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if ((e.key === 'r' || e.key === 'R') && view.mode === 'shadowing') toggleRecord();
    else if ((e.key === 'c' || e.key === 'C') && view.mode === 'watch') toggleSubtitles();
  }

  return {
    view: { ...view },

    attach(elements, listener) {
      ui = elements;
      onView = listener;
      attached = true;
      document.addEventListener('keydown', onKey);
      document.addEventListener('pagehide', save);
      document.addEventListener('visibilitychange', onHidden);
      createPlayer();
      onModeChange(view.mode);
      if (view.mode === 'dictation' && !view.chooser && wide()) focusInput();
    },

    // Leaving the lesson. Returns the save, so the list can show the new scores.
    detach() {
      if (view.recording) stopRecord();
      const saved = save();
      attached = false;
      onView = null;
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pagehide', save);
      document.removeEventListener('visibilitychange', onHidden);
      stopPoll();
      stopAt = null;
      isPlaying = false;
      myAudio?.pause();
      dropMyAudio();
      try { player?.destroy(); } catch { /* ignore */ }
      player = null;
      ui.host?.replaceChildren();
      return saved;
    },

    setMode, chooseMode, closeChooser: () => set({ chooser: false }),
    goTo, step, clickSentence, playSegment, playAll, watchFrom, watchToggle, cycleSpeed,
    toggleRecord, playMine, dcCheck, dcRetry, dcNext, toggleHint, setOption, toggleBigVideo, toggleSubtitles,
    liftCover: () => set({ coverLifted: true }),
  };
}
