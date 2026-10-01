/**
 * shared/fire-tier.js — streak fire-color ladder, shared by the dashboard
 * (mascot card, book-content mascot banner) and the BXH vocab page's
 * streak leaderboard (js/vocab-leaderboard.js), so a student's streak color
 * stays consistent everywhere it's shown. Plain globals, loaded before
 * either page script.
 *
 * 500+ ("legendary") returns null color and instead relies on the
 * .fire-legendary CSS class (css/dashboard.css) for a gradient effect that
 * a flat color can't express.
 */
var FIRE_TIERS = [
    { min: 500, color: null,      cls: 'fire-legendary' }, // gradient
    { min: 400, color: '#eab308', cls: '' },  // gold
    { min: 300, color: '#10b981', cls: '' },  // emerald
    { min: 200, color: '#06b6d4', cls: '' },  // cyan
    { min: 150, color: '#3b82f6', cls: '' },  // blue
    { min: 100, color: '#a855f7', cls: '' },  // purple
    { min: 60,  color: '#dc2626', cls: '' },  // crimson
    { min: 30,  color: '#ef4444', cls: '' },  // red
];
function getFireTier(streak) {
    for (var i = 0; i < FIRE_TIERS.length; i++) {
        if (streak >= FIRE_TIERS[i].min) return FIRE_TIERS[i];
    }
    return { min: 0, color: null, cls: '' }; // default orange, from CSS
}
// Applies the tier color/class to a fire icon + its adjoining streak number.
function applyFireTier(fireEl, numEl, streak) {
    var tier = getFireTier(streak);
    [fireEl, numEl].forEach(function (el) {
        if (!el) return;
        el.classList.remove('fire-legendary');
        if (tier.cls) el.classList.add(tier.cls);
        el.style.color = tier.cls ? '' : (tier.color || '');
    });
}
