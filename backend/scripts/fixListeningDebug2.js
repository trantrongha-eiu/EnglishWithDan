'use strict';

/**
 * Listening debug fixes, round 2 (2026-10-31), found by volListening/ls_deep_audit.js + ls_display_audit.js.
 * Applied to the đề lẻ (listeningsections) AND every full-test part with the same title, guarded on the current value.
 *   - Renting a House Q3 (Vol 1 - Test 7 P1): the source prints "ONE WORD AND/OR A NUMBER" but keys "credit check"
 *     → accept both "credit check / credit"
 *   - Presentation about refrigeration: transcript typos "I'm no terribly keen" / "you own me" → not / owe
 *     (same token count, so transcript timing stays valid)
 * Run: node backend/scripts/fixListeningDebug2.js [--apply]
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const HAND = {
  'Renting a House': { keys: { 3: ['credit check', 'credit check / credit'] } },
  'Presentation about refrigeration': { transcript: [["I'm no terribly keen", "I'm not terribly keen"], ['But you own me, Jack', 'But you owe me, Jack']] },
};

function fixUnit(u, fix, log) {
  let n = 0;
  for (const [qn, [from, to]] of Object.entries(fix.keys || {})) {
    const q = (u.questionGroups || []).flatMap(g => g.questions || []).find(x => x.questionNumber === +qn);
    if (q && String(q.correctAnswer).trim() === from) { q.correctAnswer = to; n++; log(`Q${qn} key "${from}" → "${to}"`); }
    else log(`!! Q${qn} key is "${q?.correctAnswer}", expected "${from}" — skipped`);
  }
  for (const [from, to] of fix.transcript || []) {
    if (String(u.transcript || '').includes(from)) { u.transcript = u.transcript.split(from).join(to); n++; log(`transcript "${from}" → "${to}"`); }
    else log(`!! transcript has no "${from}" — skipped`);
  }
  return n;
}

(async () => {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const backup = { sections: [], tests: [] };
  const ops = [];
  try {
    for (const [title, fix] of Object.entries(HAND)) {
      for (const s of await db.collection('listeningsections').find({ title }).toArray()) {
        backup.sections.push(JSON.parse(JSON.stringify(s)));
        const log = m => console.log(`S ${title}: ${m}`);
        if (fixUnit(s, fix, log)) ops.push(['listeningsections', s._id, { questionGroups: s.questionGroups, transcript: s.transcript }]);
      }
      for (const t of await db.collection('listeningtests').find({ 'sections.title': title }).toArray()) {
        backup.tests.push(JSON.parse(JSON.stringify(t)));
        let n = 0;
        t.sections.forEach((p, i) => { if (p.title === title) n += fixUnit(p, fix, m => console.log(`T ${t.name} P${p.partNumber}: ${m}`)); });
        if (n) ops.push(['listeningtests', t._id, { sections: t.sections }]);
      }
    }
    if (!apply) { console.log(`\nDry run: ${ops.length} documents would change. Re-run with --apply.`); return; }
    const dir = path.join(__dirname, 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `listening-debug-fix2-${Date.now()}.json`);
    fs.writeFileSync(file, JSON.stringify(backup));
    for (const [col, _id, set] of ops) await db.collection(col).updateOne({ _id }, { $set: { ...set, updatedAt: new Date() } });
    console.log(`\nApplied ${ops.length} documents. Backup: ${file}`);
  } finally { await mongoose.disconnect(); }
})().catch(e => { console.error(e); process.exit(1); });
