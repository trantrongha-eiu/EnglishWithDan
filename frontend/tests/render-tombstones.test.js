'use strict';

// Render's static site never removes files deleted from the repo — they kept
// answering 200 on production (routing audit 2026-11-14, docs/DEPLOYMENT.md
// "Deleting a file from frontend/"). Each path below is a tombstone: an EMPTY
// file that overwrites the stale copy on deploy. Retired pages are redirect
// stubs instead (REDIRECT_STUBS). Never delete these; add to the list when
// you retire another served file.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const TOMBSTONES = [
  'LICENSE.txt',
  'READ-ME.txt',
  'css/admin.css',
  'css/bootstrap.min.css',
  'dashboard.js',
  'img/about.jpg',
  'img/aboveband7.jpg',
  'img/belowband6.jpg',
  'img/carousel-1.jpg',
  'img/carousel-2.jpg',
  'img/cat-1.jpg',
  'img/cat-2.jpg',
  'img/cat-3.jpg',
  'img/cat-4.jpg',
  'img/team-1.jpg',
  'img/team-2.jpg',
  'img/team-3.jpg',
  'img/team-4.jpg',
  'img/testimonial-1.jpg',
  'img/testimonial-2.jpg',
  'img/testimonial-3.jpg',
  'img/testimonial-4.jpg',
  'img/verylowscore.jpg',
  'js/addReadingTest.js',
  'js/admin.js',
  'js/listening-upgrade-modal.js',
  'js/main.js',
  'js/reading-upgrade-modal.js',
  'js/reading.js',
  'js/shared/course-result.js',
  'js/shared/entrance-test-proctor.js',
  'js/shared/exam-fullscreen.js',
  'js/shared/exam-proctor.js',
  'js/shared/fire-tier.js',
  'js/shared/highlight-remove.js',
  'js/shared/post-submit-reminder.js',
  'js/shared/review-drawer.js',
  'js/shared/safe-redirect.js',
  'js/shared/score-message.js',
  'js/shared/time-badge.js',
  'js/shared/writing-rewrite-reminder.js',
  'js/shared/wt1-history.js',
  'js/vocab.js',
  'lib/owlcarousel/assets/owl.carousel.css',
  'lib/owlcarousel/assets/owl.carousel.min.css',
  'lib/owlcarousel/assets/owl.theme.default.css',
  'lib/owlcarousel/assets/owl.theme.default.min.css',
  'lib/owlcarousel/assets/owl.theme.green.css',
  'lib/owlcarousel/assets/owl.theme.green.min.css',
  'lib/owlcarousel/assets/owl.video.play.png',
  'lib/owlcarousel/owl.carousel.js',
  'lib/owlcarousel/owl.carousel.min.js',
  'lib/waypoints/waypoints.min.js',
  'lib/wow/wow.js',
  'lib/wow/wow.min.js',
  'listening.css',
  'reading.css',
  'reading.js',
  'sounds/incorect.mp3',
  'speaking.css',
  'style.css',
  'styles-enhanced.css',
  'writing-practice.css',
  'writing.css',
];

const REDIRECT_STUBS = {
  'admin.html': '/admin/',
  'noun-phrase-writing.html': '/writing-task1.html',
  'daniel.html': '/courses.html',
  'team.html': '/about.html',
  'testimonial.html': '/',
  'vocab.html': '/dashboard.html',
};

test.each(TOMBSTONES)('%s is an empty tombstone', (rel) => {
  expect(fs.statSync(path.join(ROOT, rel)).size).toBe(0);
});

test.each(Object.entries(REDIRECT_STUBS))('%s redirects to %s', (rel, to) => {
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  expect(html).toContain(`location.replace('${to}'`);
  expect(html).toContain('noindex');
});

test('no page or script references a tombstone', () => {
  const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
  const scripts = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', 'admin', 'tests', 'lib'].includes(e.name)) continue;
      const f = path.join(dir, e.name);
      if (e.isDirectory()) walk(f);
      else if (/\.(js|css)$/.test(e.name)) scripts.push(f);
    }
  })(ROOT);
  const sources = [...pages.map((p) => path.join(ROOT, p)), ...scripts]
    .filter((f) => fs.statSync(f).size > 0)
    .map((f) => [path.relative(ROOT, f), fs.readFileSync(f, 'utf8')]);
  const hits = [];
  for (const t of TOMBSTONES) {
    const esc = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // A URL context: quoted, after "=", or CSS url( … ) — not a "(dashboard.js)" comment.
    const re = new RegExp('(?:["\'=`]|url\\()/?' + esc + '(?=[?"\'#)`])');
    for (const [name, src] of sources) if (re.test(src)) hits.push(`${name} → ${t}`);
  }
  expect(hits).toEqual([]);
});
