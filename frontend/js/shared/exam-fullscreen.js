/**
 * shared/exam-fullscreen.js — the exam screen's fullscreen button.
 *
 * Was copied into listening.html, reading.html and js/writing.js, each copy
 * differing only in which screen goes fullscreen, which buttons show the
 * state and which popups have to come along. A page now calls:
 *
 *   ExamFullscreen.install({
 *     target:  () => element,           // what to put into fullscreen
 *     buttons: [[btnId, iconId], …],    // title + expand/compress icon follow the state
 *     carry:   [id, …],                 // popups/modals moved INTO the fullscreen
 *   });                                 // element while it's up — anything outside
 *                                       // it is not rendered in fullscreen
 *
 * and keeps calling window.toggleFullscreen() from its onclick handlers.
 */
(function () {
  function install(opts) {
    function toggleFullscreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen && document.exitFullscreen();
        return;
      }
      const el = opts.target();
      el && el.requestFullscreen && el.requestFullscreen();
    }

    document.addEventListener('fullscreenchange', () => {
      const fsEl = document.fullscreenElement;
      (opts.buttons || []).forEach(([btnId, iconId]) => {
        const btn  = document.getElementById(btnId);
        const icon = document.getElementById(iconId);
        if (btn)  btn.title = fsEl ? 'Thoát toàn màn hình' : 'Toàn màn hình';
        if (icon) icon.className = fsEl ? 'fas fa-compress' : 'fas fa-expand';
      });
      (opts.carry || []).forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (fsEl) {
          if (!fsEl.contains(el)) { el._fsPrev = el.parentNode; fsEl.appendChild(el); }
        } else if (el._fsPrev) {
          el._fsPrev.appendChild(el);
          el._fsPrev = null;
        }
      });
    });

    window.toggleFullscreen = toggleFullscreen;
  }

  window.ExamFullscreen = { install: install };
})();
