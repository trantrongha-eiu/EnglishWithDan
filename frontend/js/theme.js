// Apply saved theme IMMEDIATELY to avoid flash of wrong theme
(function () {
  const t = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
})();

function toggleDark() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  _syncDarkIcons(next);
}

function _syncDarkIcons(t) {
  const icon = t === 'dark' ? '☀️' : '🌙';
  document.querySelectorAll('.dark-toggle-icon').forEach(el => { el.textContent = icon; });
}

window.addEventListener('DOMContentLoaded', function () {
  _syncDarkIcons(localStorage.getItem('theme') || 'light');
});
