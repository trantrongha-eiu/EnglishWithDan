#!/usr/bin/env node
// Copies backend/utils/searchMatch.js (the source of truth) to the frontend
// (byte-identical) and to admin-src (wrapped as an ES module). Run after
// editing the matcher; backend/tests/unit/utils/searchMatch.test.js fails
// when a copy is stale.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'backend/utils/searchMatch.js'), 'utf8').replace(/\r\n/g, '\n');

function adminModule(source) {
  return '// GENERATED from backend/utils/searchMatch.js — do not edit here.\n' +
    '// Re-sync: node scripts/sync-search-match.js (backend test searchMatch.test.js fails when stale).\n' +
    // the UMD source sees a CommonJS-like `module` and puts its API there
    'const SearchMatch = (function (module) {\n' + source.trimEnd() + '\nreturn module.exports;\n})({ exports: {} });\n\n' +
    'export default SearchMatch;\n' +
    'export const { fold, norm, score, matches, filter } = SearchMatch;\n';
}

if (require.main === module) {
  fs.writeFileSync(path.join(ROOT, 'frontend/js/shared/search-match.js'), src);
  fs.writeFileSync(path.join(ROOT, 'admin-src/src/utils/searchMatch.js'), adminModule(src));
  fs.writeFileSync(path.join(ROOT, 'student-src/src/utils/searchMatch.js'), adminModule(src));
  console.log('search-match synced → frontend + admin-src + student-src');
}

module.exports = { adminModule };
