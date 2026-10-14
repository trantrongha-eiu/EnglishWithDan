// Read-only: count Cloudinary URLs still stored anywhere in the DB, per collection + field path.
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const mongoose = require('mongoose');
const RE = /https?:\/\/res\.cloudinary\.com\/[^\s"'<>)\\]+/g;
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const cols = (await db.listCollections().toArray()).map(c => c.name).sort();
  const stats = {}; const urls = new Set(); const kinds = {};
  for (const col of cols) {
    const cur = db.collection(col).find({});
    for await (const doc of cur) {
      const walk = (v, p) => {
        if (typeof v === 'string') {
          const m = v.match(RE); if (!m) return;
          const key = `${col}.${p.replace(/\.\d+/g, '[]')}`;
          stats[key] = (stats[key] || 0) + m.length;
          m.forEach(u => { urls.add(u); const k = (u.match(/res\.cloudinary\.com\/[^/]+\/(\w+\/\w+)\/(?:[^/]*,[^/]*\/)?(?:v\d+\/)?([^/]+)\//) || []).slice(1).join(' '); kinds[k] = (kinds[k] || 0) + 1; });
        } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}.${i}`));
        else if (v && typeof v === 'object' && !(v instanceof Date) && !v._bsontype) for (const k of Object.keys(v)) walk(v[k], p ? `${p}.${k}` : k);
      };
      walk(doc, '');
    }
  }
  Object.entries(stats).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(String(n).padStart(6), k));
  console.log('\nunique URLs:', urls.size);
  Object.entries(kinds).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(String(n).padStart(6), k));
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
