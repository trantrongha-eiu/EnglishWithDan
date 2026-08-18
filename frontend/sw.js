// App-shell cache-first service worker. Does NOT cache /api/* — this app's
// data (test lists, vocab, band scores) is always live, never stale-served.
// Bump CACHE_NAME on any app-shell change to invalidate old caches.
const CACHE_NAME = 'ewd-shell-v1';
const APP_SHELL = [
  '/css/tokens.css',
  '/css/components.css',
  '/manifest.json',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return; // never cache live data
  if (url.origin !== self.location.origin) return; // don't intercept cross-origin (Cloudinary, fonts, API host)

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (res.ok && (APP_SHELL.includes(url.pathname) || url.pathname.endsWith('.css'))) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
