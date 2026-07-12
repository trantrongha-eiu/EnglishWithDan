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
        state.recognition.start();
        state.isRecording = true;
      }
    }
  }, 1000);
}

function skipPrep() {
  clearInterval(state.prepTimer);
  state.prepTimer = null;
  hidePrepTimer();
  if (state.recognition && !state.isRecording) {
    state.recognition.start();
    state.isRecording = true;
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
