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
  vm.runInNewContext(script, { URLSearchParams, location: { pathname: u.pathname, search: u.search, hash: u.hash, replace: (x) => target.push(x) } });
  return target[0];
}

describe('static pages that moved to /app/', () => {
  it.each([
    ['vocab-leaderboard.html', '/vocab-leaderboard.html', '/app/leaderboard'],
    ['shop.html', '/shop', '/app/shop'],
    ['inbox.html', '/inbox.html', '/app/inbox'],
    ['inbox.html', '/inbox.html?msg=abc', '/app/inbox?msg=abc'],
    ['profile.html', '/profile', '/app/profile'],
    ['profile.html', '/profile.html#overview', '/app/profile'],
    ['profile.html', '/profile.html#inventory', '/app/profile?tab=inventory'],
    ['profile.html', '/profile.html#security', '/app/profile?tab=security'],
    ['profile.html', '/profile.html#plan', '/app/profile?focus=plan'],
    ['profile.html', '/profile.html#readingHistoryCard', '/app/profile?focus=readingHistoryCard'],
    ['goal.html', '/goal', '/app/profile?tab=goal'],
    ['tuition.html', '/tuition', '/app/tuition'],
    ['review-history.html', '/review-history.html', '/app/review-history'],
    ['review-history.html', '/review-history.html?view=mock', '/app/review-history?view=mock'],
    ['dictation.html', '/dictation.html', '/app/dictation'],
    ['dictation.html', '/dictation.html?drill=spelling-1', '/app/dictation?drill=spelling-1'],
    ['dictation.html', '/dictation/s1', '/app/dictation?sectionId=s1'],
    ['shadowing.html', '/shadowing.html?lesson=a&mode=watch', '/app/shadowing?lesson=a&mode=watch'],
    ['shadowing.html', '/shadowing/keith-small-talk/', '/app/shadowing?lesson=keith-small-talk'],
  ])('%s: %s → %s', (file, url, to) => {
    expect(redirectOf(file, url)).toBe(to);
  });

  it.each(['vocab-leaderboard.html', 'shop.html', 'inbox.html', 'profile.html', 'tuition.html', 'review-history.html', 'dictation.html', 'shadowing.html', 'goal.html'])('%s stays put with ?legacy=1', (file) => {
    expect(redirectOf(file, `/${file}?legacy=1`)).toBeUndefined();
  });
});
