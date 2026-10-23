'use strict';
// READ-ONLY: print a regex matching the titles of every passage used by the "Vol <V>" full tests (from the dump of
// dump_reading.js) — for ../miniIelts/pw_grade.js / pw_admin.js:  node pw_grade.js "$(node ../volReading/vol_titles_re.js 2)"
const ts = require('./web/tests.json').filter(t => t.seriesName === `Vol ${process.argv[2]}`);
const ps = require('./web/passages.json');
const esc = s => s.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ids = [...new Set(ts.flatMap(t => t.passageIds.map(String)))];
console.log('^(' + ids.map(i => esc(ps.find(p => String(p._id) === i).title)).join('|') + ')\\s*$');
