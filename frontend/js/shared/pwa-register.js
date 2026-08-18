// Registers the app-shell service worker (sw.js). Included only on a small,
// deliberately scoped set of entry pages for now (dashboard/index/login) —
// see docs/PRODUCT_FEATURE_AUDIT.md's PWA phase for why this isn't rolled
// out to every page yet.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
