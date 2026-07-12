'use strict';

// Shared HTML-escaping helper for any place user input gets interpolated
// into an HTML string server-side (email bodies, etc.) rather than
// rendered through a templating engine that escapes by default.
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

module.exports = { escapeHtml };
