'use strict';

// dashboard.html now forwards to the React app (/app/). Every link the site
// (or a student's bookmark) still uses must land on the matching route.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'dashboard.html'), 'utf8');
const script = html.match(/<script>\s*\/\* The vocab home now lives[\s\S]*?<\/script>/)[0]
  .replace(/^<script>/, '').replace(/<\/script>$/, '');

function run(url, stored = {}) {
  const u = new URL(url, 'https://example.test');
  const target = [];
  const session = { ...stored };
  vm.runInNewContext(script, {
    URLSearchParams,
    encodeURIComponent,
    location: { search: u.search, hash: u.hash, replace: (x) => target.push(x) },
    sessionStorage: {
      getItem: (k) => (k in session ? session[k] : null),
      setItem: (k, v) => { session[k] = v; },
      removeItem: (k) => { delete session[k]; },
    },
  });
  return { to: target[0], session };
}

describe('dashboard.html redirect', () => {
  it.each([
    ['/dashboard.html', '/app/#/dashboard'],
    ['/dashboard.html?view=home', '/app/#/dashboard'],
    ['/dashboard.html?view=topics', '/app/#/dashboard/topics'],
    ['/dashboard.html?view=paraphrase', '/app/#/dashboard/paraphrase'],
    ['/dashboard.html?view=lesson&lessonId=abc', '/app/#/dashboard/lesson/abc'],
    ['/dashboard.html?view=unit&unit=3', '/app/#/dashboard/unit/3'],
    ['/dashboard.html?view=unit&unit=3&mode=multipleChoice', '/app/#/dashboard/unit/3?mode=quiz'],
    ['/dashboard.html?view=book&bookId=b1', '/app/#/dashboard/book/b1'],
    ['/dashboard.html?view=book&bookId=b1&mode=study', '/app/#/dashboard/book/b1'],
    ['/dashboard.html?view=book&bookId=b1&mode=fillBlank', '/app/#/dashboard/book/b1/practice?mode=flashcard'],
    ['/dashboard.html?action=review-due', '/app/#/dashboard/practice?src=due'],
    ['/dashboard.html?action=review-paraphrase', '/app/#/dashboard/practice?src=paraphrase'],
    ['/dashboard.html#homework-card', '/app/#/dashboard?focus=homework-card'],
  ])('%s', (from, to) => {
    expect(run(from).to).toBe(to);
  });

  it('keeps the old page for ?legacy=1 and for the rest of that tab', () => {
    const first = run('/dashboard.html?legacy=1');
    expect(first.to).toBeUndefined();
    expect(run('/dashboard.html', first.session).to).toBeUndefined();
  });

  it('?legacy=0 goes back to the new page', () => {
    expect(run('/dashboard.html?legacy=0', { ews_legacy_dash: '1' }).to).toBe('/app/#/dashboard');
  });
});
