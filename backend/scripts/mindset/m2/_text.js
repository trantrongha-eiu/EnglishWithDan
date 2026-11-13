// txt('u01-antilia') — book text pulled from the PDF by _extract.py (m2/text/*.txt).
'use strict';
const fs = require('fs');
const path = require('path');

function txt(name) {
  return fs.readFileSync(path.join(__dirname, 'text', name + '.txt'), 'utf8').trim();
}
// Passage text without its "## Title" line (for exercises that ask for a title).
const untitled = (t) => t.replace(/^## .*\n+/, '');

module.exports = { txt, untitled };
