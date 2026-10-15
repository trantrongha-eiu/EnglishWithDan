#!/usr/bin/env node
// Rewrites every local JS/CSS reference in the public frontend to
// `?v=<content hash>` — `src="js/nav.js?v=20261015cake"` becomes
// `src="js/nav.js?v=3f9a1c07be"`.
//
// Why: the ?v= strings used to be hand-bumped dates, so JS/CSS had to be
// served no-cache (a forgotten bump meant students stuck on an old file).
// With the hash, a changed file is a new URL by construction, so the static
// site can serve /js/* and /css/* with a one-year immutable cache — repeat
// page loads then read ~45 files from disk instead of revalidating each one.
//
// Covers <script src>/<link href> in frontend/*.html and the string-literal
// loads inside frontend/js/**/*.js (nav.js → pets.js → pets.css, …). A JS
// file's own hash includes the stamped refs inside it, so the passes repeat
// until nothing changes. Only refs to files that exist under frontend/ are
// touched; sw.js is left alone (the browser update-checks it on its own).
//
//   node scripts/stamp-asset-versions.js          rewrite in place
//   node scripts/stamp-asset-versions.js --check  list stale refs, exit 1 if any
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', 'frontend');
const REF_RE = /(["'])(\/?)((?:[\w-]+\/)*[\w.-]+\.(?:js|css))(\?v=[\w.-]*)?\1/g;
const SKIP = new Set(['sw.js']);
const MAX_PASSES = 10;

function listSources() {
  const html = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')).map((f) => path.join(ROOT, f));
  const js = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js')) js.push(p);
    }
  })(path.join(ROOT, 'js'));
  // JS first, so a page sees its scripts' final hashes in the same pass.
  return js.concat(html);
}

function hashOf(rel, contents, cache) {
  if (!cache.has(rel)) {
    const abs = path.join(ROOT, rel);
    const text = contents.has(abs) ? contents.get(abs) : fs.readFileSync(abs, 'utf8');
    // CRLF→LF: git (autocrlf) may hand a Windows checkout CRLF while CI and
    // Render see LF — the hash must not depend on which one ran this.
    cache.set(rel, crypto.createHash('sha256').update(text.replace(/\r\n/g, '\n'), 'utf8').digest('hex').slice(0, 10));
  }
  return cache.get(rel);
}

// Returns [{ file, ref, from, to }] for every ref whose ?v= isn't its hash.
// With write=true the in-memory contents are updated as it goes.
function stamp({ write }) {
  const sources = listSources();
  const contents = new Map(sources.map((f) => [f, fs.readFileSync(f, 'utf8')]));
  const stale = new Map();

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let changed = false;
    const cache = new Map();
    for (const file of sources) {
      const before = contents.get(file);
      const after = before.replace(REF_RE, (m, q, slash, rel, ver) => {
        if (SKIP.has(path.basename(rel))) return m;
        if (!fs.existsSync(path.join(ROOT, rel))) return m;
        const want = '?v=' + hashOf(rel, contents, cache);
        if (ver === want) return m;
        stale.set(file + '|' + rel, { file: path.relative(ROOT, file), ref: rel, from: ver || '(none)', to: want });
        return q + slash + rel + want + q;
      });
      if (after !== before) {
        changed = true;
        contents.set(file, after);
        cache.clear(); // a rewritten JS file has a new hash
      }
    }
    if (!changed) {
      if (write) {
        for (const file of sources) {
          if (contents.get(file) !== fs.readFileSync(file, 'utf8')) fs.writeFileSync(file, contents.get(file), 'utf8');
        }
      }
      return [...stale.values()];
    }
    if (!write && pass === 0) return [...stale.values()];
  }
  throw new Error('stamp-asset-versions: refs did not settle after ' + MAX_PASSES + ' passes (circular script loads?)');
}

module.exports = { stamp, ROOT };

if (require.main === module) {
  const check = process.argv.includes('--check');
  const stale = stamp({ write: !check });
  if (check) {
    for (const s of stale) console.log(`${s.file}: ${s.ref} ${s.from} -> ${s.to}`);
    if (stale.length) {
      console.error(`\n${stale.length} stale asset version(s). Run: node scripts/stamp-asset-versions.js`);
      process.exit(1);
    }
    console.log('All asset versions match their file contents.');
  } else {
    const files = new Set(stale.map((s) => s.file));
    console.log(`Stamped ${stale.length} ref(s) in ${files.size} file(s).`);
  }
}
