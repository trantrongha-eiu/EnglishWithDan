'use strict';
// Apply small hand-checked corrections to bank passages (specs/vol<V>/bank_fixes.js: [{ id, why, fix(doc) }], fix mutates the
// fetched passage: title / content / questionGroups). Prints a field-level diff; with --apply backs the old document up to
// web/vol<V>/backup/bank_<id>_<time>.json and updates title, content, questionGroups only, conditional on updatedAt (a
// concurrent admin edit is never overwritten). Old attempts keep their saved grading.
//   node bank_fix.js <vol> [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const [vol, ...rest] = process.argv.slice(2);
const apply = rest.includes('--apply');
const fixes = require(`./specs/vol${vol}/bank_fixes.js`);
const dir = path.join(__dirname, 'web', `vol${vol}`);

function diff(a, b, at = '', out = []) {
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    if (JSON.stringify(a) !== JSON.stringify(b)) out.push(`${at}: ${JSON.stringify(a)?.slice(0, 120)} → ${JSON.stringify(b)?.slice(0, 120)}`);
    return out;
  }
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diff(a[k], b[k], at ? `${at}.${k}` : k, out);
  return out;
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  try {
    for (const f of fixes) {
      const _id = new mongoose.Types.ObjectId(f.id);
      const old = await db.collection('passages').findOne({ _id });
      if (!old) { console.log(`✗ ${f.id} not found`); continue; }
      const pick = o => JSON.parse(JSON.stringify({ title: o.title, content: o.content, questionGroups: o.questionGroups }));
      const before = pick(old), backup = JSON.parse(JSON.stringify(old));
      f.fix(old); // mutate the fetched document itself so nested ObjectIds / types are kept
      const d = diff(before, pick(old));
      const practice = await db.collection('readingpracticeattempts').countDocuments({ passageId: _id });
      const full = await db.collection('testattempts').countDocuments({ passagesUsed: _id });
      console.log(`${d.length ? '•' : '='} "${old.title.trim()}" [${f.id}] — ${f.why} (attempts: ${practice} practice, ${full} full-test)`);
      for (const line of d) console.log('    ' + line);
      if (!apply || !d.length) continue;
      fs.mkdirSync(path.join(dir, 'backup'), { recursive: true });
      fs.writeFileSync(path.join(dir, 'backup', `bank_${f.id}_${Date.now()}.json`), JSON.stringify(backup, null, 1));
      const r = await db.collection('passages').updateOne({ _id, updatedAt: old.updatedAt },
        { $set: { title: old.title, content: old.content, questionGroups: old.questionGroups, updatedAt: new Date() } });
      console.log(`    ${r.modifiedCount ? '✓ updated' : '✗ changed meanwhile — not updated'}`);
    }
    if (!apply) console.log('dry run — re-run with --apply');
  } finally { await mongoose.disconnect(); }
})().catch(e => { console.error(e); process.exit(1); });
