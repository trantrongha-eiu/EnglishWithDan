/* ═══════════════════════════════════════════════════════
   writing-autosave.js  –  Exam-mode autosave, extracted from writing.js
   Persists the in-progress full exam (answers/flags/time left) to
   localStorage and offers to restore it. Reads/writes the shared `state`
   object declared in writing.js — safe because classic <script> tags share
   one top-level lexical scope. Must load BEFORE writing.js: writing.js's
   own init IIFE calls checkRestoreBanner() synchronously at load time, not
   just from a later click, so this file's functions need to already exist
   by then (see writing.html's script order).

   Scope note: this does NOT include the separate practice-mode autosave
   (savePracticeToStorage etc.) — that one reads/writes practiceState,
   which is also threaded through task selection, the stopwatch, and
   submission in ways that don't share this module's clean boundary.
═══════════════════════════════════════════════════════ */

const _AUTOSAVE_KEY = 'ews_writing_autosave';
const _AUTOSAVE_MAX_AGE_MS = 4 * 60 * 60 * 1000; // 4 hours

function saveToStorage() {
  if (!state.exam) return;
  try {
    localStorage.setItem(_AUTOSAVE_KEY, JSON.stringify({
      exam:        state.exam,
      answers:     state.answers,
      flags:       state.flags,
      secondsLeft: state.secondsLeft,
      savedAt:     Date.now()
    }));
    const lbl = document.getElementById('btn-autosave');
    if (lbl) {
      lbl.title = 'Đã lưu lúc ' + new Date().toLocaleTimeString('vi-VN');
      lbl.classList.add('saved');
      clearTimeout(lbl._t);
      lbl._t = setTimeout(() => lbl.classList.remove('saved'), 2000);
    }
  } catch (_) {}
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(_AUTOSAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || !saved.exam) return null;
    if (Date.now() - saved.savedAt > _AUTOSAVE_MAX_AGE_MS) {
      localStorage.removeItem(_AUTOSAVE_KEY);
      return null;
    }
    return saved;
  } catch (_) { return null; }
}

function clearAutoSave() {
  localStorage.removeItem(_AUTOSAVE_KEY);
}

function checkRestoreBanner() {
  const saved = loadFromStorage();
  const banner = document.getElementById('restore-banner');
  const desc   = document.getElementById('restore-banner-desc');
  if (!saved || !banner) return;

  const mins = Math.floor(saved.secondsLeft / 60);
  const secs = saved.secondsLeft % 60;
  const wc1  = countWords(saved.answers[1] || '');
  const wc2  = countWords(saved.answers[2] || '');
  desc.textContent =
    `${saved.exam.name}  •  Task 1: ${wc1} từ  |  Task 2: ${wc2} từ  •  Còn ${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  banner.style.display = 'block';
}

function restoreExam() {
  const saved = loadFromStorage();
  if (!saved) return;
  state.exam        = saved.exam;
  state.answers     = saved.answers  || { 1: '', 2: '' };
  state.flags       = saved.flags    || { 1: false, 2: false };
  state.secondsLeft = saved.secondsLeft || 3600;
  state.totalSeconds = state.exam.duration ? state.exam.duration * 60 : 3600;
  state.currentTask  = 1;
  document.getElementById('restore-banner').style.display = 'none';
  launchExam();
}

function discardSaved() {
  clearAutoSave();
  document.getElementById('restore-banner').style.display = 'none';
}
