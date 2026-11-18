/* global __PAGE_CSS__ */
import { useEffect, useState } from 'react';

// Some pages keep the stylesheets of their old static version, and those are
// written for a page of their own (inbox.css restyles .btn and body). They are
// linked only while the route is open, so they can't touch the other routes.
const links = new Map(); // href → { el, users, ready }

function acquire(href) {
  let entry = links.get(href);
  if (!entry) {
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = href;
    // A stylesheet that fails must not hold the page back
    const ready = new Promise((resolve) => {
      el.addEventListener('load', resolve, { once: true });
      el.addEventListener('error', resolve, { once: true });
      setTimeout(resolve, 5000);
    });
    document.head.appendChild(el);
    entry = { el, users: 0, ready };
    links.set(href, entry);
  }
  entry.users += 1;
  return entry;
}

function release(href) {
  const entry = links.get(href);
  if (!entry) return;
  entry.users -= 1;
  if (entry.users > 0) return;
  entry.el.remove();
  links.delete(href);
}

export default function PageCss({ names, children }) {
  const key = names.join(',');
  const [readyKey, setReadyKey] = useState(null);

  useEffect(() => {
    let alive = true;
    const hrefs = key.split(',').map((n) => __PAGE_CSS__[n]);
    Promise.all(hrefs.map((h) => acquire(h).ready)).then(() => { if (alive) setReadyKey(key); });
    return () => {
      alive = false;
      hrefs.forEach(release);
    };
  }, [key]);

  if (readyKey !== key) return <div className="route-loading">Đang tải…</div>;
  return children;
}
