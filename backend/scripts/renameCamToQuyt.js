'use strict';
// Thầy 2026-11-26: "đổi toàn bộ chữ Cam trên web thành chữ Quýt" — the Cambridge book label "Cam N" (test names, series,
// section titles, Passage.source / tags, homework labels, dictation sources, attempt history snapshots…) becomes "Quýt N".
// Only "Cam" followed by a number is touched, so "Cam kết", "Cam Ranh", orange "Cam" etc. stay.
//   node scripts/renameCamToQuyt.js            dry run: counts per collection.field + examples
//   node scripts/renameCamToQuyt.js --apply    writes; backup of every changed top-level field → backups/cam-to-quyt-<ts>.json
// Every collection is walked (all string fields, nested), except SKIP below (people's own speech / free text).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const mongoose = require('mongoose');
const fs = require('fs'), path = require('path');

const APPLY = process.argv.includes('--apply');
const RE = /\bCam(\s+)(\d)/g;
const TO = 'Quýt$1$2';
const SKIP = new Set(['speakingattempts', 'messages', 'sessions']);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const stats = {}, backup = {};
  try {
    for (const { name } of await db.listCollections().toArray()) {
      if (SKIP.has(name) || name.startsWith('system.')) continue;
      const ops = [];
      for await (const doc of db.collection(name).find({})) {
        const set = {};
        for (const [k, v] of Object.entries(doc)) {
          if (k === '_id') continue;
          let changed = false;
          const walk = (x, p) => {
            if (typeof x === 'string') {
              if (!RE.test(x)) return x;
              RE.lastIndex = 0;
              changed = true;
              const key = `${name}.${p.replace(/\.\d+/g, '[]')}`;
              const s = (stats[key] ||= { n: 0, ex: [] });
              s.n++;
              const y = x.replace(RE, TO);
              if (s.ex.length < 2) s.ex.push(`${x.slice(0, 60)} → ${y.slice(0, 60)}`);
              return y;
            }
            if (Array.isArray(x)) return x.map((e, i) => walk(e, `${p}.${i}`));
            if (x && typeof x === 'object' && !(x instanceof Date) && !x._bsontype) {
              const o = {};
              for (const [kk, vv] of Object.entries(x)) o[kk] = walk(vv, `${p}.${kk}`);
              return o;
            }
            return x;
          };
          const nv = walk(v, k);
          if (changed) set[k] = nv;
        }
        if (Object.keys(set).length) {
          (backup[name] ||= []).push({ _id: doc._id, ...Object.fromEntries(Object.keys(set).map(k => [k, doc[k]])) });
          ops.push({ updateOne: { filter: { _id: doc._id }, update: { $set: set } } });
        }
      }
      if (ops.length) {
        console.log(`${name}: ${ops.length} docs`);
        if (APPLY) for (let i = 0; i < ops.length; i += 500) await db.collection(name).bulkWrite(ops.slice(i, i + 500), { ordered: false });
      }
    }
    console.log('');
    for (const [k, s] of Object.entries(stats).sort()) console.log(String(s.n).padStart(5), k, '|', s.ex.join(' || '));
    if (APPLY) {
      const dir = path.join(__dirname, '..', 'backups'); fs.mkdirSync(dir, { recursive: true });
      const f = path.join(dir, `cam-to-quyt-${Date.now()}.json`);
      fs.writeFileSync(f, JSON.stringify(backup));
      console.log(`\napplied; backup → ${f}`);
    } else console.log('\ndry run — re-run with --apply');
  } finally { await mongoose.disconnect(); }
})().catch(e => { console.error(e); process.exit(1); });
