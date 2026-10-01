// READ-ONLY: where every id of mini-ielts "Recent Actual Tests" (web/mini/all_ids.json, 340 ids) stands.
//   imported  = source id of an item in ../data/miniIeltsReading/*.json (live on the site)
//   rejected  = web/mini/rejected.txt (hand-reviewed and dropped)
//   bank dup  = web/mini/dedupe_every.txt "DUP of <title>" where <title> is NOT a mini-ielts passage (already in our bank)
//   the rest  = still to do, split by web/mini/broken.txt, image_host_down.txt, heavy_convert3.txt (WARN) and "other"
// Usage: node mini_status.js [--list]          (reads passages.json for the mini titles — run dump_passages.js first)
const fs = require('fs');
const path = require('path');
const W = p => path.join(__dirname, 'web', 'mini', p);
const ids = t => (String(t).match(/\b\d{3,4}\b/g) || []);
const all = require(W('all_ids.json')).map(x => String(x.id));
const dataDir = path.join(__dirname, '..', 'data', 'miniIeltsReading');
const imported = new Set();
for (const f of fs.readdirSync(dataDir).filter(n => n.endsWith('.json'))) for (const it of JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'))) { const m = String(it.source).match(/\/(\d+)\//); if (m) imported.add(m[1]); }
const rejected = new Set(ids(fs.readFileSync(W('rejected.txt'), 'utf8')));
const miniTitles = new Set(require('./passages.json').filter(p => (p.tags || []).includes('mini-ielts')).map(p => p.title.trim().toLowerCase()));
const bankDup = new Set();
for (const line of fs.readFileSync(W('dedupe_every.txt'), 'utf8').split('\n')) {
  const m = line.match(/^(\d+)\s.*DUP of (.+)$/);
  if (m && !miniTitles.has(m[2].trim().toLowerCase())) bankDup.add(m[1]);
}
const read = f => (fs.existsSync(W(f)) ? fs.readFileSync(W(f), 'utf8') : '');
const broken = new Set(ids(read('broken.txt')));
const hostDown = new Set(ids(read('image_host_down.txt')));
const heavyWarn = new Set(read('heavy_convert3.txt').split('\n').filter(l => /WARN/.test(l)).map(l => (l.match(/^#+\s*(\d+)/) || [])[1]).filter(Boolean));

const groups = { imported: [], rejected: [], bankDup: [], broken: [], hostDown: [], heavyWarn: [], other: [] };
for (const id of all) {
  const k = imported.has(id) ? 'imported' : rejected.has(id) ? 'rejected' : bankDup.has(id) ? 'bankDup' : broken.has(id) ? 'broken'
    : hostDown.has(id) ? 'hostDown' : heavyWarn.has(id) ? 'heavyWarn' : 'other';
  groups[k].push(id);
}
const left = groups.broken.length + groups.hostDown.length + groups.heavyWarn.length + groups.other.length;
console.log(`Recent Actual Tests: ${all.length} ids`);
console.log(`  đã nhập (đang chạy):      ${groups.imported.length}`);
console.log(`  đã xét và bỏ:             ${groups.rejected.length}`);
console.log(`  trùng ngân hàng có sẵn:   ${groups.bankDup.length}`);
console.log(`  CÒN LẠI chưa xử lý:       ${left}`);
console.log(`    - heavy còn WARN:        ${groups.heavyWarn.length}`);
console.log(`    - "hỏng" (broken):       ${groups.broken.length}`);
console.log(`    - chờ máy chủ hình:      ${groups.hostDown.length}`);
console.log(`    - khác (chưa rà):        ${groups.other.length}`);
if (process.argv.includes('--list')) for (const k of ['heavyWarn', 'broken', 'hostDown', 'other']) console.log(`\n${k}: ${groups[k].join(' ')}`);
