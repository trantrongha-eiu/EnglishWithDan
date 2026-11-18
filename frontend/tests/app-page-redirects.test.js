'use strict';

// BXH vocab, Cửa hàng lửa and Hộp thư moved to the React app. Old links and
// bookmarks must land on the matching route; ?legacy=1 keeps the static page.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function redirectOf(file, url) {
  const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const script = html.match(/<script>\s*\/\* This page now lives[\s\S]*?<\/script>/)[0]
    .replace(/^<script>/, '').replace(/<\/script>$/, '');
  const target = [];
  const u = new URL(url, 'https://example.test');
  vm.runInNewContext(script, { URLSearchParams, location: { search: u.search, replace: (x) => target.push(x) } });
  return target[0];
}

describe('static pages that moved to /app/', () => {
  it.each([
    ['vocab-leaderboard.html', '/vocab-leaderboard.html', '/app/#/leaderboard'],
    ['shop.html', '/shop', '/app/#/shop'],
    ['inbox.html', '/inbox.html', '/app/#/inbox'],
    ['inbox.html', '/inbox.html?msg=abc', '/app/#/inbox?msg=abc'],
  ])('%s: %s → %s', (file, url, to) => {
    expect(redirectOf(file, url)).toBe(to);
  });

  it.each(['vocab-leaderboard.html', 'shop.html', 'inbox.html'])('%s stays put with ?legacy=1', (file) => {
    expect(redirectOf(file, `/${file}?legacy=1`)).toBeUndefined();
  });
});
