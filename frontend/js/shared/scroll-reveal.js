/* ══════════════════════════════════════════════════════════════════════
   scroll-reveal.js — reveal [data-reveal] elements as they enter the
   viewport. Pairs with css/motion.css.

   - No-op (content stays visible) if IntersectionObserver is unavailable
     or the user prefers reduced motion.
   - Adds `.sr-ready` to <html> synchronously so css/motion.css hides the
     targets BEFORE first paint (no flash-of-visible-then-hidden).
   - `data-reveal` on any element = fade/slide it in.
     Values: "" | "up" (default) | "left" | "right" | "zoom".
   - `data-reveal-children` on a wrapper = reveal its direct children one
     by one with a stagger (each child gets a transition-delay).
   - window.ScrollReveal.refresh() re-scans for late/async-rendered nodes.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (reduce || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('sr-ready');

  var STAGGER_MS = 70;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

  function tag(el, delayMs) {
    if (el.__srTagged) return;
    el.__srTagged = true;
    if (delayMs) el.style.transitionDelay = delayMs + 'ms';
    io.observe(el);
  }

  function scan(root) {
    (root || document).querySelectorAll('[data-reveal-children]').forEach(function (wrap) {
      var kids = wrap.children;
      for (var i = 0; i < kids.length; i++) {
        if (!kids[i].hasAttribute('data-reveal')) kids[i].setAttribute('data-reveal', '');
        tag(kids[i], (i % 12) * STAGGER_MS);
      }
    });
    (root || document).querySelectorAll('[data-reveal]:not(.is-in)').forEach(function (el) {
      tag(el, 0);
    });
  }

  function start() {
    scan(document);
    // async-rendered sections (e.g. the landing-page course grid)
    setTimeout(function () { scan(document); }, 1200);
    setTimeout(function () { scan(document); }, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.ScrollReveal = { refresh: function (root) { scan(root); } };
})();
