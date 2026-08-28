// Apply saved theme IMMEDIATELY to avoid flash of wrong theme
(function () {
  const t = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);

  // Personal accent colour picked on profile.html ("Màu chủ đề cá nhân").
  // It was only ever applied on the profile page itself — an inline style on
  // <html> that doesn't survive a navigation — so the label's promise of a
  // device-wide colour never held anywhere else. Apply it here (runs before
  // first paint on every page) so it actually sticks. `--primary` /
  // `--primary-dark` are the tokens the picker sets; they alias `--brand`
  // by default (see css/mobile.css :root).
  try {
    const acc = JSON.parse(localStorage.getItem('profileAccent') || 'null');
    if (acc && acc.primary && acc.dark) {
      document.documentElement.style.setProperty('--primary', acc.primary);
      document.documentElement.style.setProperty('--primary-dark', acc.dark);
    }
  } catch (e) { /* malformed value — ignore, keep the brand default */ }
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
