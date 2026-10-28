/**
 * shared/post-submit-reminder.js — big centred notice shown right after a
 * student submits a Reading/Listening test (full test or bài lẻ, Practice
 * or Test Simulation). Reminds them to review every mistake, save new words
 * and study them daily, with a button straight to the review. Closes itself
 * after 10 seconds.
 *
 *   window.showPostSubmitReminder({ skill: 'reading' | 'listening', onReview })
 *
 * onReview() opens the review: the full-test review screen, or for bài lẻ
 * (whose result screen already is the review) a scroll to the first wrong
 * question.
 */
(function () {
  'use strict';

  var AUTO_CLOSE_MS = 10000;
  var _timer = null;

  function _injectStyles() {
    if (document.getElementById('psr-styles')) return;
    var s = document.createElement('style');
    s.id = 'psr-styles';
    s.textContent =
      '#psr-backdrop{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.62);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);opacity:0;transition:opacity .2s ease}' +
      '#psr-backdrop.open{opacity:1}' +
      '.psr-box{position:relative;width:100%;max-width:540px;max-height:calc(100vh - 32px);overflow-y:auto;background:var(--surface,#fff);color:var(--text,#111827);border-radius:20px;padding:30px 28px 22px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.35);transform:scale(.92);transition:transform .22s cubic-bezier(.2,.9,.3,1.3)}' +
      '#psr-backdrop.open .psr-box{transform:scale(1)}' +
      '.psr-close{position:absolute;top:10px;right:12px;width:32px;height:32px;border:none;background:none;color:var(--text3,#9ca3af);font-size:22px;line-height:1;cursor:pointer;border-radius:8px}' +
      '.psr-close:hover{background:rgba(127,127,127,.12)}' +
      '.psr-emoji{font-size:52px;line-height:1;margin-bottom:10px}' +
      '.psr-title{font-size:23px;font-weight:800;line-height:1.3;margin:0 0 14px}' +
      '.psr-list{list-style:none;margin:0 0 16px;padding:0;text-align:left;display:flex;flex-direction:column;gap:9px}' +
      '.psr-list li{display:flex;gap:10px;align-items:flex-start;font-size:15.5px;line-height:1.5;color:var(--text2,#374151)}' +
      '.psr-list li span:first-child{flex-shrink:0;width:24px;text-align:center}' +
      '.psr-warn{background:rgba(220,38,38,.09);border:1.5px solid rgba(220,38,38,.35);color:#b91c1c;border-radius:12px;padding:11px 14px;font-size:15px;font-weight:700;line-height:1.5;margin-bottom:18px}' +
      '.psr-actions{display:flex;flex-direction:column;gap:6px}' +
      '.psr-go{width:100%;padding:14px;border:none;border-radius:12px;background:var(--blue,#3d8bff);color:#fff;font-size:16.5px;font-weight:800;cursor:pointer;font-family:inherit}' +
      '.psr-go:hover{filter:brightness(1.07)}' +
      '.psr-later{background:none;border:none;color:var(--text3,#9ca3af);font-size:13.5px;cursor:pointer;padding:6px;font-family:inherit}' +
      '.psr-bar{height:4px;border-radius:999px;background:rgba(127,127,127,.18);overflow:hidden;margin-top:12px}' +
      '.psr-bar i{display:block;height:100%;width:100%;background:var(--blue,#3d8bff);transform-origin:left;animation:psr-shrink ' + AUTO_CLOSE_MS + 'ms linear forwards}' +
      '@keyframes psr-shrink{to{transform:scaleX(0)}}' +
      '[data-theme="dark"] .psr-warn{color:#fca5a5}' +
      '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .psr-warn{color:#fca5a5}}' +
      '@media (max-width:480px){.psr-box{padding:26px 18px 18px}.psr-title{font-size:20px}.psr-list li{font-size:14.5px}.psr-warn{font-size:14px}}';
    document.head.appendChild(s);
  }

  // Exam screens run in fullscreen; anything outside the fullscreen element
  // is invisible, so keep the notice inside whichever root is showing.
  function _host() { return document.fullscreenElement || document.body; }
  function _reparent() {
    var el = document.getElementById('psr-backdrop');
    if (el && el.parentNode !== _host()) _host().appendChild(el);
  }

  function close() {
    clearTimeout(_timer);
    _timer = null;
    document.removeEventListener('keydown', _onKey);
    document.removeEventListener('fullscreenchange', _reparent);
    var el = document.getElementById('psr-backdrop');
    if (!el) return;
    el.classList.remove('open');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 200);
  }

  function _onKey(e) { if (e.key === 'Escape') close(); }

  function showPostSubmitReminder(opts) {
    opts = opts || {};
    var isListening = opts.skill === 'listening';
    _injectStyles();
    var old = document.getElementById('psr-backdrop');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    clearTimeout(_timer);

    var el = document.createElement('div');
    el.id = 'psr-backdrop';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'psr-title');
    el.innerHTML =
      '<div class="psr-box">' +
        '<button type="button" class="psr-close" aria-label="Đóng">&times;</button>' +
        '<div class="psr-emoji">🧐</div>' +
        '<h2 class="psr-title" id="psr-title">Nộp bài xong rồi — giờ mới là lúc học thật!</h2>' +
        '<ul class="psr-list">' +
          '<li><span>🔍</span><span><b>Review thật kĩ</b> từng câu sai' + (isListening ? ', nghe lại và đối chiếu transcript' : '') + '.</span></li>' +
          '<li><span>🤔</span><span><b>Ngẫm lại vì sao mình sai</b>: dính bẫy paraphrase, thiếu từ vựng hay ' + (isListening ? 'nghe sót' : 'đọc sót') + '?</span></li>' +
          '<li><span>📒</span><span><b>Lưu từ mới</b> và <b>học hằng ngày</b> để nâng vốn từ, không bị sai lại các lỗi tương tự.</span></li>' +
        '</ul>' +
        '<div class="psr-warn">⚠️ Không review và rút kinh nghiệm thì làm bao nhiêu đề cũng sẽ bị chững band, không tiến bộ thêm!</div>' +
        '<div class="psr-actions">' +
          '<button type="button" class="psr-go">Review ngay →</button>' +
          '<button type="button" class="psr-later">Để sau</button>' +
        '</div>' +
        '<div class="psr-bar" aria-hidden="true"><i></i></div>' +
      '</div>';

    el.addEventListener('click', function (e) { if (e.target === el) close(); });
    el.querySelector('.psr-close').addEventListener('click', close);
    el.querySelector('.psr-later').addEventListener('click', close);
    el.querySelector('.psr-go').addEventListener('click', function () {
      close();
      if (typeof opts.onReview === 'function') opts.onReview();
    });

    _host().appendChild(el);
    document.addEventListener('keydown', _onKey);
    document.addEventListener('fullscreenchange', _reparent);
    // next frame so the open transition plays
    requestAnimationFrame(function () { el.classList.add('open'); });
    _timer = setTimeout(close, AUTO_CLOSE_MS);
  }

  window.showPostSubmitReminder = showPostSubmitReminder;
  window.closePostSubmitReminder = close;
})();
