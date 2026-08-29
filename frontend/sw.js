// App-shell service worker.
//
// Scope of interception (deliberately tiny): ONLY versionless static assets —
// fonts, images, and the design-token stylesheets. It NEVER touches HTML or
// JS: those must always come straight from the network so a new deploy's
// `<script src="...?v=YYYYMMDD">` bump (and the no-cache HTML from _headers)
// is picked up on the very next load. A cache-first SW that also held JS/HTML
// was the root cause of "a new feature is broken until the user manually
// clears cache / hard-reloads" — most visibly the Writing "viết lại" modal,
// which span forever because the browser kept running a pre-fix writing.js.
//
// Bump CACHE_NAME whenever this file changes so `activate` purges the old
// cache. (v2: stop caching JS/HTML.)
const CACHE_NAME = 'ewd-shell-v2';
const APP_SHELL = [
  '/css/tokens.css',
  '/css/components.css',
  '/manifest.json',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/favicon.svg'
];

// Genuinely-static, safe-to-cache file types. Note: NOT .js and NOT .html.
const STATIC_RE = /\.(?:css|woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|avif|ico)$/;

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
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;   // Cloudinary, fonts, API host — leave alone

  // Everything that isn't a versionless static asset (all HTML, all JS, every
  // navigation, /api/*) is left entirely to the browser — no interception,
  // so it always hits the network and honours normal cache headers.
  const isStatic = APP_SHELL.includes(url.pathname) || STATIC_RE.test(url.pathname);
  if (!isStatic) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
