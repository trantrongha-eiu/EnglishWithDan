'use strict';

// Escape regex special characters in user-supplied text before building a
// $regex filter — without this, a raw user string in $regex is a ReDoS/
// unexpected-match risk (and a literal search for e.g. "C++" would silently
// break as a regex). Moved here from routes/admin/_shared.js so non-admin
// services (search.js) don't have to import a routes/admin/ file.
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegex };
