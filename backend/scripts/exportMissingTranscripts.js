/**
 * exportMissingTranscripts.js — dump every ListeningTest section that has
 * questions but no transcript, together with all the data needed to write
 * a fitting listening script (question text, type, correct answers, group
 * instructions / table-note-map configs, question range).
 *
 * Round-trip workflow:
 *   1. node backend/scripts/exportMissingTranscripts.js
 *      → writes backend/scripts/data/missing-transcripts.json
 *   2. Fill in each entry's "transcript" field (leave the rest untouched).
 *   3. node backend/scripts/importTranscripts.js --apply
 *
 * Read-only. Never writes to the DB.
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const ListeningTest = require('../models/ListeningTest');
const ListeningSection = require('../models/ListeningSection');

const OUT = path.join(__dirname, 'data', 'missing-transcripts.json');
const MIN_LEN = 20; // shorter than this counts as "no real transcript"

function slimGroup(g) {
  const out = { groupType: g.groupType };
  if (g.groupTitle) out.groupTitle = g.groupTitle;
  if (g.instruction) out.instruction = g.instruction;
  if (g.tableConfig && (g.tableConfig.headers?.length || g.tableConfig.rows?.length)) out.tableConfig = g.tableConfig;
  if (g.noteConfig && (g.noteConfig.title || g.noteConfig.lines?.length)) out.noteConfig = g.noteConfig;
  if (g.bulletConfig && g.bulletConfig.items?.length) out.bulletConfig = g.bulletConfig;
  if (g.matchingOptions?.length) out.matchingOptions = g.matchingOptions;
  if (g.summaryConfig && g.summaryConfig.text) out.summaryConfig = g.summaryConfig;
  if (g.endingsConfig && g.endingsConfig.endings?.length) out.endingsConfig = g.endingsConfig;
  if (g.dragDropConfig && g.dragDropConfig.text) out.dragDropConfig = g.dragDropConfig;
  out.questions = (g.questions || []).map(q => ({
    questionNumber: q.questionNumber,
    type: q.type,
    questionText: q.questionText,
    options: q.options && q.options.length ? q.options : undefined,
    correctAnswer: q.correctAnswer,
  }));
  return out;
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const tests = await ListeningTest.find({}).sort({ testNumber: 1 }).lean();
  const standalone = await ListeningSection.find({}).select('_id title partNumber transcript').lean();
  const byTitle = new Map(standalone.map(s => [`${s.partNumber}::${(s.title || '').trim().toLowerCase()}`, s]));

  const entries = [];
  for (const t of tests) {
    for (const s of (t.sections || [])) {
      const qCount = (s.questionGroups || []).reduce((n, g) => n + (g.questions || []).length, 0);
      const hasTranscript = !!(s.transcript && s.transcript.trim().length >= MIN_LEN);
      if (qCount === 0 || hasTranscript) continue;

      const genericTitle = /^Part \d$/.test((s.title || '').trim());
      const lookupTitle = genericTitle ? `${t.name} – Part ${s.partNumber}` : (s.title || '').trim();
      const match = byTitle.get(`${s.partNumber}::${lookupTitle.toLowerCase()}`);

      entries.push({
        testId: String(t._id),
        testName: t.name,
        testNumber: t.testNumber,
        sectionId: String(s._id),
        partNumber: s.partNumber,
        questionRange: s.questionRange,
        standaloneSectionId: match ? String(match._id) : null,
        standaloneSectionHasTranscript: match ? !!(match.transcript && match.transcript.trim().length >= MIN_LEN) : null,
        groups: (s.questionGroups || []).map(slimGroup),
        transcript: ''   // <-- fill this in
      });
    }
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(entries, null, 2));
  console.log(`\n${entries.length} section(s) missing a transcript.`);
  const byTest = {};
  for (const e of entries) byTest[`#${e.testNumber} ${e.testName}`] = (byTest[`#${e.testNumber} ${e.testName}`] || 0) + 1;
  for (const [k, v] of Object.entries(byTest)) console.log(`  ${k}: Part ${entries.filter(e => `#${e.testNumber} ${e.testName}` === k).map(e => e.partNumber).join(', ')}  (${v})`);
  console.log(`\nWritten to: ${OUT}`);

  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
