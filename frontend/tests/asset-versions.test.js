// Every local JS/CSS ref must carry ?v=<content hash> (scripts/stamp-asset-
// versions.js): the static site may serve /js/* and /css/* with a long
// immutable cache, so a changed file whose ref wasn't re-stamped would keep
// being served stale from students' browser caches.
const { stamp } = require('../../scripts/stamp-asset-versions');

test('asset ?v= hashes match file contents (run: node scripts/stamp-asset-versions.js)', () => {
  const stale = stamp({ write: false }).map((s) => `${s.file}: ${s.ref} ${s.from} -> ${s.to}`);
  expect(stale).toEqual([]);
});
