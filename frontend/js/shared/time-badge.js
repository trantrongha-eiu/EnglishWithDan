/* Review-screen header badge showing how long the student took on the
   test ("⏱ 12:34"). Used by Reading + Listening review screens, both the
   bài lẻ practice and the full tests. Hidden when the time is 0/unknown
   (e.g. old attempts, or "Làm lại" from a full-test review). */
(function () {
  'use strict';

  function fmtTakenTime(sec) {
    sec = Math.max(0, Math.round(Number(sec) || 0));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = n => String(n).padStart(2, '0');
    return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }

  function setTimeBadge(id, sec) {
    const el = document.getElementById(id);
    if (!el) return;
    const secs = Math.max(0, Math.round(Number(sec) || 0));
    if (!secs) { el.style.display = 'none'; return; }
    el.innerHTML = `<i class="fas fa-stopwatch" aria-hidden="true"></i> ${fmtTakenTime(secs)}`;
    el.title = 'Tổng thời gian làm bài';
    el.setAttribute('aria-label', `Tổng thời gian làm bài: ${fmtTakenTime(secs)}`);
    el.style.display = '';
  }

  window.fmtTakenTime = fmtTakenTime;
  window.setTimeBadge = setTimeBadge;
})();
