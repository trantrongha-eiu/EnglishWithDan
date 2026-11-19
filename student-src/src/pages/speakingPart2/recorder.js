// 🎙️ Nhại: hearing one take of a sentence, outside React (it runs on timers,
// the mic and the browser's recognizer). The screen gets what changed
// through `ui` callbacks. Same behaviour as the old js/speaking-part2.js:
//
//  'sr'     the browser's own speech-to-text (desktop Chrome / Edge, Android
//           Chrome) + a parallel recording for "Giọng tôi".
//  'server' record only, then POST /speaking-part2/transcribe (Whisper).
//           iPhone/iPad (Safari, Zalo, Google app…) and in-app browsers:
//           there the recognizer and the recorder fight over the mic and the
//           student got "Chưa nghe thấy bạn nói" on every take (2026-11-16).
//           Also any browser with no SpeechRecognition, and a device where
//           'sr' missed a voiced take twice (SH_SERVER_KEY).
//  Either way a take the recognizer heard nothing of, but that has a
//  recording, goes to the server instead of failing.
import { API } from '../../utils/api';
import { siteToast } from '../../utils/shell';
import { wc } from '../../utils/speakingPart2';

const SR = () => window.SpeechRecognition || window.webkitSpeechRecognition;
const UA = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
export const IS_IOS = /iPad|iPhone|iPod/.test(UA) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const IS_ANDROID = /Android/i.test(UA);
export const IS_ZALO = /Zalo/i.test(UA);
const IN_APP = /Zalo|FBAN|FBAV|FB_IAB|Instagram|Line\/|TikTok|musical_ly|GSA\/|; wv\)/i.test(UA);
const canRec = () => !!(window.MediaRecorder && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
const SH_SERVER_KEY = 'sp2_sh_server';
const VOICE_LEVEL = 0.02; // RMS that counts as talking (speech ≈ 0.02–0.3)

function serverMode() {
  if (!canRec()) return false;
  if (!SR() || IS_IOS || IN_APP) return true;
  try { return localStorage.getItem(SH_SERVER_KEY) === '1'; } catch { return false; }
}
export const canShadow = () => !!SR() || canRec();

// ui (setUi): { phase(p), interim(t), heard(text), noVoice(info), failed(title, sub),
//       mine(hasUrl), level(0..1), active() → the shadow screen is up }
const NO_UI = { phase() {}, interim() {}, heard() {}, noVoice() {}, failed() {}, mine() {}, level() {}, active: () => false };
export function createRecorder() {
  let ui = NO_UI;
  const rec = {
    on: false, busy: false, mode: 'sr', recog: null, media: null, stream: null, text: '', silence: null, hard: null,
    session: 0, url: null, audio: null, ctx: null, lv: null, peak: 0, voiced: false, srDead: false, srErr: '', micErr: '',
    onBlob: null, misses: 0, idx: -1,
  };

  function startRecognition(session) {
    const recog = new (SR())();
    rec.recog = recog;
    recog.lang = 'en-US';
    recog.continuous = !IS_ANDROID;
    recog.interimResults = true;
    recog.maxAlternatives = 1;
    recog.onresult = (e) => {
      if (session !== rec.session || !rec.on) return;
      let interim = ''; let fin = '';
      for (let k = 0; k < e.results.length; k++) {
        if (e.results[k].isFinal) fin += e.results[k][0].transcript + ' ';
        else interim += e.results[k][0].transcript;
      }
      // Grade on everything heard, not just isFinal results (iOS Safari
      // often ends with the whole sentence still interim)
      rec.text = fin + interim;
      ui.interim((fin + interim).trim() || 'Đang nghe bạn nói…');
      clearTimeout(rec.silence);
      rec.silence = setTimeout(() => stop(), 1500);
    };
    recog.onerror = (e) => {
      if (session !== rec.session) return;
      rec.srErr = e.error;
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      // The recognizer gave up (mic clash, offline, service blocked): keep
      // recording, the take is graded by the server instead
      rec.srDead = true;
      if (e.error === 'network' && !rec.media) siteToast('Không kết nối được dịch vụ nhận diện giọng nói — kiểm tra mạng rồi thử lại.', 'error');
    };
    recog.onend = () => {
      if (session !== rec.session || !rec.on) return;
      // Ended with nothing heard while the recording still runs: let the
      // recording finish the take (stops on silence / Dừng / hard timer)
      if (!rec.text.trim() && rec.media && rec.media.state === 'recording') { rec.srDead = true; return; }
      stop();
    };
    try { recog.start(); } catch { rec.srDead = true; }
  }

  function captureOwnVoice(session, recIdx) {
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }).then((stream) => {
      if (!rec.on || session !== rec.session) { stream.getTracks().forEach((t) => t.stop()); return; }
      rec.stream = stream;
      startMeter(stream, session);
      const chunks = [];
      let mr;
      try { mr = new MediaRecorder(stream); } catch { return; }
      rec.media = mr;
      mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = () => {
        const blob = chunks.length ? new Blob(chunks, { type: mr.mimeType || chunks[0].type || 'audio/webm' }) : null;
        if (session === rec.session && rec.onBlob) { const f = rec.onBlob; rec.onBlob = null; f(blob); }
        if (rec.idx !== recIdx || !ui.active()) return;
        if (rec.url) { try { URL.revokeObjectURL(rec.url); } catch { /* gone */ } }
        rec.url = blob ? URL.createObjectURL(blob) : null;
        ui.mine(!!rec.url);
      };
      mr.start();
    }).catch((err) => {
      if (session !== rec.session) return;
      rec.micErr = err?.name || 'Error';
      // Audio-only take with no mic = nothing to grade; recognition mode
      // still scores without the recording
      if (rec.on && (rec.mode === 'server' || rec.srDead)) stop();
    });
  }

  function primeMeter() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!rec.ctx) rec.ctx = new AC();
      if (rec.ctx.state === 'suspended') rec.ctx.resume().catch(() => {});
    } catch { rec.ctx = null; }
  }
  // Live level → the ring around the mic (the student SEES the mic hear
  // them), "voiced" for the server fallback, and stop-on-silence for takes
  // with no recognizer to say they're done
  function startMeter(stream, session) {
    stopMeter();
    if (!rec.ctx) return;
    try {
      const src = rec.ctx.createMediaStreamSource(stream); const an = rec.ctx.createAnalyser();
      an.fftSize = 1024;
      src.connect(an);
      const buf = new Float32Array(an.fftSize);
      let loud = 0; let quietSince = 0;
      const lv = { src, samples: 0 };
      lv.timer = setInterval(() => {
        if (!rec.on || session !== rec.session || !rec.ctx || rec.ctx.state !== 'running') return;
        an.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        lv.samples++;
        if (rms > rec.peak) rec.peak = rms;
        ui.level(Math.min(1, rms / 0.12).toFixed(2));
        if (rms > VOICE_LEVEL) { loud++; quietSince = 0; if (loud >= 2) rec.voiced = true; } else if (!quietSince) quietSince = Date.now();
        if (rec.voiced && quietSince && Date.now() - quietSince > 1700 && (rec.mode === 'server' || rec.srDead)) stop();
      }, 100);
      rec.lv = lv;
    } catch { rec.lv = null; }
  }
  function stopMeter() {
    const lv = rec.lv;
    rec.lv = null;
    if (!lv) return false;
    clearInterval(lv.timer);
    try { lv.src.disconnect(); } catch { /* gone */ }
    return lv.samples >= 5;
  }

  function serverGrade(blob, session, idx, mode, measured) {
    const stale = () => session !== rec.session || rec.idx !== idx || !ui.active();
    const done = () => { rec.busy = false; if (!stale()) ui.phase('idle'); };
    if (!blob || blob.size < 800) { done(); if (!stale()) noVoice(measured); return; }
    const type = blob.type || '';
    const fd = new FormData();
    fd.append('audio', blob, 'take.' + (/mp4|m4a|aac/.test(type) ? 'm4a' : /ogg/.test(type) ? 'ogg' : /wav/.test(type) ? 'wav' : 'webm'));
    const token = localStorage.getItem('token');
    fetch(API + '/speaking-part2/transcribe', { method: 'POST', headers: token ? { Authorization: 'Bearer ' + token } : {}, body: fd })
      .then((res) => res.json().catch(() => ({})).then((d) => ({ ok: res.ok, d: d || {} })))
      .then((x) => {
        done();
        if (stale()) return;
        if (!x.ok || !x.d.success) { ui.failed(x.d.message || 'Chưa chấm được lần này', 'Bấm micro để thử lại nhé.'); ui.interim(''); return; }
        const t = String(x.d.transcript || '').trim();
        if (!t) { noVoice(measured); return; }
        // The browser's recognizer missed a take that had words in it:
        // twice and this device is switched to server grading for good
        if (mode === 'sr' && ++rec.misses >= 2) { try { localStorage.setItem(SH_SERVER_KEY, '1'); } catch { /* storage off */ } }
        ui.heard(t);
      })
      .catch(() => {
        done();
        if (stale()) return;
        ui.interim('');
        ui.failed('Mất kết nối khi gửi bản ghi', 'Kiểm tra mạng rồi bấm micro thử lại.');
      });
  }
  function noVoice(measured) {
    ui.interim('');
    const denied = /NotAllowed|Security|PermissionDenied/i.test(rec.micErr) || rec.srErr === 'not-allowed' || rec.srErr === 'service-not-allowed';
    const noMic = /NotFound|NotReadable|Overconstrained/i.test(rec.micErr) || rec.srErr === 'audio-capture';
    ui.noVoice({ denied, noMic, silent: !!(measured && !rec.voiced) });
  }

  // silent: leaving the screen / another sentence, stop without grading
  function stop(silent) {
    if (!rec.on) return;
    rec.on = false;
    clearTimeout(rec.silence); clearTimeout(rec.hard);
    if (rec.recog) { rec.recog.onend = null; rec.recog.onresult = null; try { rec.recog.stop(); } catch { /* done */ } rec.recog = null; }
    const measured = stopMeter();
    const mr = rec.media; rec.media = null;
    const live = !!(mr && mr.state !== 'inactive');
    const text = rec.text.trim(); const { session, idx, mode } = rec;
    const quit = silent === true || !ui.active();
    // Nothing recognised but there is a recording → the server hears it.
    // Always, not only when the level meter saw a voice: a meter that reads
    // zeros (iOS quirk) must never leave a student stuck again.
    const toServer = !quit && !text && live;
    if (toServer) {
      rec.busy = true;
      rec.onBlob = (blob) => serverGrade(blob, session, idx, mode, measured);
    }
    if (live) { try { mr.stop(); } catch { /* done */ } }
    if (rec.stream) { rec.stream.getTracks().forEach((t) => t.stop()); rec.stream = null; }
    if (quit) { rec.onBlob = null; rec.busy = false; ui.phase('idle'); return; }
    ui.phase(toServer ? 'busy' : 'idle');
    if (toServer) { ui.interim('Đang chấm phát âm…'); return; }
    if (text) { if (mode === 'sr') rec.misses = 0; ui.heard(text); } else noVoice(measured);
  }

  return {
    setUi(x) { ui = x || NO_UI; },
    get on() { return rec.on; },
    get busy() { return rec.busy; },
    start(sentence, idx) {
      if (rec.on || rec.busy || !canShadow()) return;
      if (rec.audio) rec.audio.pause();
      const session = ++rec.session;
      Object.assign(rec, { on: true, text: '', peak: 0, voiced: false, srDead: false, srErr: '', micErr: '', onBlob: null, idx });
      rec.mode = SR() && !serverMode() ? 'sr' : 'server';
      primeMeter(); // inside the click: iOS only starts an AudioContext from a gesture
      ui.interim(rec.mode === 'sr' ? 'Đang nghe bạn nói…' : 'Đang ghi âm — đọc to câu trên…');
      ui.phase('rec');
      rec.hard = setTimeout(() => stop(), Math.max(7000, wc(sentence) * 900 + 4000));
      // Recognition first, own-voice capture after (Android lets only one hold the mic)
      if (rec.mode === 'sr') startRecognition(session);
      if (canRec()) captureOwnVoice(session, idx);
    },
    stop,
    // Another sentence / leaving: drop a server grade still in flight and the last take
    reset() {
      stop(true);
      rec.session++; rec.busy = false; rec.onBlob = null;
      if (rec.audio) rec.audio.pause();
      if (rec.url) { try { URL.revokeObjectURL(rec.url); } catch { /* gone */ } rec.url = null; }
      rec.idx = -1;
    },
    playMine() {
      if (!rec.url) return;
      if (rec.audio) rec.audio.pause();
      rec.audio = new Audio(rec.url);
      rec.audio.play().catch(() => siteToast('Không phát được bản ghi âm.', 'error'));
    },
    hasMine: () => !!rec.url,
    dispose() {
      this.reset();
      try { rec.ctx?.close(); } catch { /* closed */ }
      rec.ctx = null;
    },
  };
}
