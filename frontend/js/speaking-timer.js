/* ═══════════════════════════════════════════════════════
   speaking-timer.js  –  Exam timer subsystem, extracted from speaking.js
   Prep countdown (60s), speak countdown (2min, Part 2 only), and the
   elapsed-time display during recording. Reads/writes the shared `state`
   object declared in speaking.js — safe because classic <script> tags in
   the same page share one top-level lexical scope, and none of these
   functions touch `state` until they're actually called (by then
   speaking.js has already run and declared it), not at script-load time.
═══════════════════════════════════════════════════════ */

function fmtTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function clearAllTimers() {
  clearInterval(state.elapsedTimer);
  clearInterval(state.prepTimer);
  clearInterval(state.speakTimer);
  state.elapsedTimer = state.prepTimer = state.speakTimer = null;
}

// ──────────────────────────────────────────────────────
// Part 2 – Prep Timer (60s)
// ──────────────────────────────────────────────────────
function startPrepTimer() {
  clearInterval(state.prepTimer);
  state.prepSecondsLeft = 60;

  const prepEl    = document.getElementById('p2-prep');
  const clockEl   = document.getElementById('p2-prep-clock');
  const btnRecord = document.getElementById('btn-record');

  if (!prepEl) return;
  prepEl.style.display = 'block';
  if (clockEl)  clockEl.textContent = fmtTime(state.prepSecondsLeft);
  if (btnRecord) { btnRecord.disabled = true; btnRecord.classList.add('btn-record--disabled'); }

  state.prepTimer = setInterval(() => {
    state.prepSecondsLeft--;
    if (clockEl) clockEl.textContent = fmtTime(state.prepSecondsLeft);
    if (state.prepSecondsLeft <= 0) {
      clearInterval(state.prepTimer);
      state.prepTimer = null;
      hidePrepTimer();
      showToast('⏰ Hết thời gian chuẩn bị — Bắt đầu nói!', 'info');
      if (state.recognition && !state.isRecording) {
        try {
          state.recognition.start();
          state.isRecording = true;
        } catch (e) {
          showToast('Không thể bắt đầu ghi âm, thử lại.', 'error');
        }
      }
    }
  }, 1000);
}

function skipPrep() {
  clearInterval(state.prepTimer);
  state.prepTimer = null;
  hidePrepTimer();
  if (state.recognition && !state.isRecording) {
    try {
      state.recognition.start();
      state.isRecording = true;
    } catch (e) {
      showToast('Không thể bắt đầu ghi âm, thử lại.', 'error');
    }
  }
}

function hidePrepTimer() {
  const prepEl    = document.getElementById('p2-prep');
  const btnRecord = document.getElementById('btn-record');
  if (prepEl)    prepEl.style.display = 'none';
  if (btnRecord) { btnRecord.disabled = false; btnRecord.classList.remove('btn-record--disabled'); }
}

// ──────────────────────────────────────────────────────
// Part 2 – Speaking Countdown (2 min)
// ──────────────────────────────────────────────────────
function startSpeakCountdown() {
  if (state.currentQuestion?.part !== 2) return;
  clearInterval(state.speakTimer);
  state.speakSecondsLeft = 120;

  const cdEl = document.getElementById('p2-speak-countdown');
  const tmEl = document.getElementById('p2-speak-time');
  if (cdEl) cdEl.classList.remove('hidden');
  if (tmEl) tmEl.textContent = fmtTime(state.speakSecondsLeft);

  state.speakTimer = setInterval(() => {
    state.speakSecondsLeft--;
    if (tmEl) tmEl.textContent = fmtTime(state.speakSecondsLeft);
    if (state.speakSecondsLeft === 30) showToast('⚠️ Còn 30 giây!', 'warn');
    if (state.speakSecondsLeft <= 0) {
      clearInterval(state.speakTimer);
      state.speakTimer = null;
      if (state.isRecording && state.recognition) {
        state.recognition.stop();
        state.isRecording = false;
      }
      showToast('⏰ Hết 2 phút — ghi âm đã dừng.', 'info');
      hideSpeakCountdown();
    }
  }, 1000);
}

function hideSpeakCountdown() {
  const cdEl = document.getElementById('p2-speak-countdown');
  if (cdEl) cdEl.classList.add('hidden');
  clearInterval(state.speakTimer);
  state.speakTimer = null;
}

// ──────────────────────────────────────────────────────
// Elapsed timer
// ──────────────────────────────────────────────────────
function startElapsedTimer() {
  clearInterval(state.elapsedTimer);
  state.recordStartTime = Date.now();
  const el = document.getElementById('rec-elapsed');
  if (el) el.classList.remove('hidden');

  // Cache outside the interval, same pattern as startPrepTimer/startSpeakCountdown
  // above — was re-querying this id every tick.
  const t = document.getElementById('rec-elapsed-time');
  state.elapsedTimer = setInterval(() => {
    const secs = Math.floor((Date.now() - state.recordStartTime) / 1000);
    if (t) t.textContent = fmtTime(secs);
  }, 1000);
}

function stopElapsedTimer() {
  clearInterval(state.elapsedTimer);
  state.elapsedTimer = null;
}

function getElapsedSeconds() {
  if (!state.recordStartTime) return 0;
  return Math.floor((Date.now() - state.recordStartTime) / 1000);
}

/* ──────────────────────────────────────────────────────
   Sequential (mock-test) topic practice — mirrors the timers
   above but targets seq- prefixed elements/state fields, fully
   isolated from the single-question flow's timers.
   ────────────────────────────────────────────────────── */

// Part 2 – Prep Timer (60s)
function startSeqPrepTimer() {
  clearInterval(state.seqPrepTimer);
  state.seqPrepSecondsLeft = 60;

  const prepEl  = document.getElementById('seq-p2-prep');
  const clockEl = document.getElementById('seq-p2-prep-clock');
  if (!prepEl) return;
  prepEl.style.display = 'block';
  if (clockEl) clockEl.textContent = fmtTime(state.seqPrepSecondsLeft);

  state.seqPrepTimer = setInterval(() => {
    state.seqPrepSecondsLeft--;
    if (clockEl) clockEl.textContent = fmtTime(state.seqPrepSecondsLeft);
    if (state.seqPrepSecondsLeft <= 0) {
      clearInterval(state.seqPrepTimer);
      state.seqPrepTimer = null;
      hideSeqPrepTimer();
      showToast('⏰ Hết thời gian chuẩn bị — Bắt đầu nói!', 'info');
      startSeqRecording();
    }
  }, 1000);
}

function skipSeqPrep() {
  clearInterval(state.seqPrepTimer);
  state.seqPrepTimer = null;
  hideSeqPrepTimer();
  startSeqRecording();
}

function hideSeqPrepTimer() {
  const prepEl = document.getElementById('seq-p2-prep');
  if (prepEl) prepEl.style.display = 'none';
}

// Part 2 – Speaking Countdown (2 min)
function startSeqSpeakCountdown() {
  clearInterval(state.seqSpeakTimer);
  state.seqSpeakSecondsLeft = 120;

  const cdEl = document.getElementById('seq-p2-speak-countdown');
  const tmEl = document.getElementById('seq-p2-speak-time');
  if (cdEl) cdEl.classList.remove('hidden');
  if (tmEl) tmEl.textContent = fmtTime(state.seqSpeakSecondsLeft);

  state.seqSpeakTimer = setInterval(() => {
    state.seqSpeakSecondsLeft--;
    if (tmEl) tmEl.textContent = fmtTime(state.seqSpeakSecondsLeft);
    if (state.seqSpeakSecondsLeft === 30) showToast('⚠️ Còn 30 giây!', 'warn');
    if (state.seqSpeakSecondsLeft <= 0) {
      clearInterval(state.seqSpeakTimer);
      state.seqSpeakTimer = null;
      if (state.seqIsRecording && state.seqRecognition) {
        try { state.seqRecognition.stop(); } catch (e) {}
      }
      showToast('⏰ Hết 2 phút — tự động chuyển câu tiếp theo.', 'info');
      hideSeqSpeakCountdown();
      confirmSeqAnswer();
    }
  }, 1000);
}

function hideSeqSpeakCountdown() {
  const cdEl = document.getElementById('seq-p2-speak-countdown');
  if (cdEl) cdEl.classList.add('hidden');
  clearInterval(state.seqSpeakTimer);
  state.seqSpeakTimer = null;
}

// Elapsed timer (per-question, accumulated into state.seqTotalElapsed on confirm)
function startSeqElapsedTimer() {
  clearInterval(state.seqElapsedTimer);
  state.seqRecordStartTime = Date.now();
  const el = document.getElementById('seq-rec-elapsed');
  if (el) el.classList.remove('hidden');

  const t = document.getElementById('seq-rec-elapsed-time');
  state.seqElapsedTimer = setInterval(() => {
    const secs = Math.floor((Date.now() - state.seqRecordStartTime) / 1000);
    if (t) t.textContent = fmtTime(secs);
  }, 1000);
}

function stopSeqElapsedTimer() {
  clearInterval(state.seqElapsedTimer);
  state.seqElapsedTimer = null;
}

function getSeqElapsedSeconds() {
  if (!state.seqRecordStartTime) return 0;
  return Math.floor((Date.now() - state.seqRecordStartTime) / 1000);
}

// Part 1/3 – "haven't said anything yet" 3s auto-advance grace timer.
// Cancelled the moment any speech (interim or final) is detected — see
// speaking.js's setupSeqRecognition() onresult handler.
function startSeqSilenceTimer() {
  clearInterval(state.seqSilenceTimer);
  state.seqSilenceSecondsLeft = 3;

  const hintEl  = document.getElementById('seq-silence-hint');
  const countEl = document.getElementById('seq-silence-count');
  if (hintEl) hintEl.classList.remove('hidden');
  if (countEl) countEl.textContent = state.seqSilenceSecondsLeft;

  state.seqSilenceTimer = setInterval(() => {
    state.seqSilenceSecondsLeft--;
    if (countEl) countEl.textContent = state.seqSilenceSecondsLeft;
    if (state.seqSilenceSecondsLeft <= 0) {
      clearInterval(state.seqSilenceTimer);
      state.seqSilenceTimer = null;
      if (hintEl) hintEl.classList.add('hidden');
      confirmSeqAnswer();
    }
  }, 1000);
}

function clearSeqSilenceTimer() {
  const hintEl = document.getElementById('seq-silence-hint');
  if (hintEl) hintEl.classList.add('hidden');
  clearInterval(state.seqSilenceTimer);
  state.seqSilenceTimer = null;
}
