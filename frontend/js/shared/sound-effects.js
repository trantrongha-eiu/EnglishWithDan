/**
 * shared/sound-effects.js — correct/wrong sound effects + mute toggle.
 *
 * Was duplicated verbatim (same Audio objects, same 'wp_sound' localStorage
 * key, same #sound-icon element id, same toggleWpSound()/initUser() icon
 * sync) across task2-practice.html, task2-template.html and
 * essential-grammar.html (student UI audit, Nhóm 2, 2026-07-25).
 * Exposes the same global function names each page already called, so no
 * call-site changes were needed beyond deleting the local copies.
 */
(function () {
  'use strict';

  var _sndCorrect = new Audio('./sounds/correct.mp3');
  var _sndWrong   = new Audio('./sounds/incorrect.mp3');
  _sndCorrect.volume = 0.5;
  _sndWrong.volume = 0.5;
  var _soundEnabled = localStorage.getItem('wp_sound') !== 'off';

  function playOk()    { if (!_soundEnabled) return; _sndCorrect.currentTime = 0; _sndCorrect.play().catch(function () {}); }
  function playWrong() { if (!_soundEnabled) return; _sndWrong.currentTime   = 0; _sndWrong.play().catch(function () {}); }
  function isSoundEnabled() { return _soundEnabled; }

  function toggleWpSound() {
    _soundEnabled = !_soundEnabled;
    localStorage.setItem('wp_sound', _soundEnabled ? 'on' : 'off');
    var icon = document.getElementById('sound-icon');
    if (icon) icon.className = _soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
  }

  window.playOk = playOk;
  window.playWrong = playWrong;
  window.toggleWpSound = toggleWpSound;
  window.isSoundEnabled = isSoundEnabled;
})();
