// hex "#rgb" / "#rrggbb" -> "rgba(r,g,b,a)". Shared by the accent applier
// below and profile.html's live-preview swatch handler. Defined first so
// the pre-paint IIFE can use it.
window.hexToRgba = function (hex, alpha) {
  var h = String(hex || '').trim().replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length !== 6) return null;
  var r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
};

// Apply saved theme + personal accent IMMEDIATELY to avoid a flash of the
// wrong colours.
(function () {
  const t = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);

  // Personal accent colour picked on profile.html ("Màu chủ đề cá nhân").
  // It was only ever applied on the profile page itself — an inline style on
  // <html> that doesn't survive a navigation — so the label's promise of a
  // device-wide colour never held anywhere else. Apply it here (runs before
  // first paint on every page) so it actually sticks, and drive the WHOLE
  // brand palette off it: --brand/--brand-dark are what components.css /
  // main.css consume, --primary is the mobile.css alias, --brand-light is
  // the 12%-tint used for hover/subtle backgrounds. --accent follows
  // --brand automatically (css/mobile.css :root). --brand2 (gradient
  // secondary) is intentionally left alone.
  try {
    const acc = JSON.parse(localStorage.getItem('profileAccent') || 'null');
    if (acc && acc.primary && acc.dark) {
      const S = document.documentElement.style;
      S.setProperty('--primary', acc.primary);
      S.setProperty('--primary-dark', acc.dark);
      S.setProperty('--brand', acc.primary);
      S.setProperty('--brand-dark', acc.dark);
      const light = window.hexToRgba(acc.primary, 0.12);
      if (light) S.setProperty('--brand-light', light);
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
