'use strict';
// Print a regex matching exactly the titles of the passages drafted for a vol (web/vol<V>/batch.json, or the drafts) —
// for pw_admin.js / pw_grade.js / cover_candidates.js on just the new passages of that vol.
//   node vol_new_titles_re.js <vol>
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'web', `vol${process.argv[2]}`, 'draft');
const titles = fs.readdirSync(dir).map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).doc.title);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
console.log(`^(${titles.map(esc).join('|')})$`);
