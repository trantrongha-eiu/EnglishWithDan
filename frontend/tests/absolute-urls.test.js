'use strict';

// Render serves "/about/" (and "/reading/", "/login/" …) as the .html file
// WITHOUT redirecting, so a relative src/href like "img/big_logo.png" or
// "courses.html" resolved under "/about/" and 404'd (routing audit
// 2026-11-14). Every page-level URL must be root-absolute.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));

test.each(pages)('%s has no relative src/href', (file) => {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const bad = [];
  for (const m of html.matchAll(/\b(?:src|href)="([^"]*)"/g)) {
    const u = m[1];
    if (!u || /^(?:[a-z][a-z0-9+.-]*:|#|\/|\$\{|\{)/i.test(u)) continue;
    bad.push(u);
  }
  expect(bad).toEqual([]);
});
