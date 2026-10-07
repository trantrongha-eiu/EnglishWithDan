// READ-ONLY: show where a section's gap-fill (template+answers) diverges from its current transcript.
// Usage: node backend/scripts/_gapfill_diff.js id1,id2
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');

const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const ids = process.argv[2].split(',');
  for (const id of ids) {
    const s = await ListeningSection.findById(id).select('title transcript gapFillTemplate gapFillAnswers').lean();
    const rebuilt = norm(String(s.gapFillTemplate || '').replace(/\[\[(\d+)\]\]/g, (_m, n) => s.gapFillAnswers[Number(n) - 1] ?? ''));
    const t = norm(s.transcript);
    let i = 0;
    while (i < Math.min(t.length, rebuilt.length) && t[i] === rebuilt[i]) i++;
    let j = 0;
    while (j < Math.min(t.length, rebuilt.length) - i && t[t.length - 1 - j] === rebuilt[rebuilt.length - 1 - j]) j++;
    console.log(`\n== ${id} ${s.title}  (transcript ${t.length} chars, rebuilt ${rebuilt.length})`);
    console.log('  TRANSCRIPT:', JSON.stringify(t.slice(Math.max(0, i - 60), t.length - j + 60).slice(0, 400)));
    console.log('  GAPFILL   :', JSON.stringify(rebuilt.slice(Math.max(0, i - 60), rebuilt.length - j + 60).slice(0, 400)));
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
