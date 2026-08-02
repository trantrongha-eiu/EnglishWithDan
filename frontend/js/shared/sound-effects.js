/**
 * shared/sound-effects.js — correct/wrong sound effects + mute toggle.
 *
 * Was duplicated verbatim (same Audio objects, same 'wp_sound' localStorage
 * key, same toggleWpSound()/initUser() icon
 * sync) across task2-practice.html, task2-template.html and
 * essential-grammar.html (student UI audit, Nhóm 2, 2026-07-25).
 * Exposes the same global function names each page already called, so no
 * call-site changes were needed beyond deleting the local copies.
 */
(function () {
  'use strict';

  // Root-relative — this file now loads on pages reachable through nested
  // clean URLs (e.g. /reading/test/*), where a "./sounds/..." path would
  // resolve against the wrong directory and 404.
  var _sndCorrect = new Audio('/sounds/correct.mp3');
  var _sndWrong   = new Audio('/sounds/incorrect.mp3');
  _sndCorrect.volume = 0.5;
  _sndWrong.volume = 0.5;
  var _soundEnabled = localStorage.getItem('wp_sound') !== 'off';

  function playOk()    { if (!_soundEnabled) return; _sndCorrect.currentTime = 0; _sndCorrect.play().catch(function () {}); }
  function playWrong() { if (!_soundEnabled) return; _sndWrong.currentTime   = 0; _sndWrong.play().catch(function () {}); }
  function isSoundEnabled() { return _soundEnabled; }

  // Mirrors js/theme.js's .dark-toggle-icon pattern — updates every
  // instance in the DOM (currently just the global nav button) rather than
  // a single hardcoded #id, so it works regardless of which page/how many
  // buttons are present.
  function _syncSoundIcons(enabled) {
    var icon = enabled ? '🔊' : '🔇';
    document.querySelectorAll('.sound-toggle-icon').forEach(function (el) { el.textContent = icon; });
  }

  function toggleWpSound() {
    _soundEnabled = !_soundEnabled;
    localStorage.setItem('wp_sound', _soundEnabled ? 'on' : 'off');
    _syncSoundIcons(_soundEnabled);
  }

  window.addEventListener('DOMContentLoaded', function () {
    _syncSoundIcons(_soundEnabled);
  });

  window.playOk = playOk;
  window.playWrong = playWrong;
  window.toggleWpSound = toggleWpSound;
  window.isSoundEnabled = isSoundEnabled;
})();
