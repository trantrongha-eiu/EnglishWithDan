'use strict';

/**
 * One-off data fix for the Reading bank (full tests + standalone passages),
 * 2026-09-30 — clears the admin QuestionGroupBuilder warnings ("Word Bank
 * trống", "Chưa có danh sách lựa chọn") and the render/grading bugs found
 * while auditing them (audit: scripts/_audit_reading_warnings.js).
 *
 * Generic rules (applied to every passage):
 *  1. Question `type` must match what the group renders (constants.js ALLOWED):
 *     - sentence-completion WITHOUT a word bank in a plain group is a typed
 *       answer from the passage → fill-blank (same text input, no warning).
 *     - sentence-completion inside a sentence-endings group → matching-info
 *       (the group renders the A–H endings; keys are letters).
 *     - sentence-completion inside a summary-completion group → fill-blank.
 *  2. Summary-completion with a word bank: the student drags the WORD (see
 *     renderSummaryCompletionGroup), and gradeOne compares it with the key —
 *     keys stored as the bank LETTER ("E") could never be marked correct.
 *     Letter keys → the bank word ("tuition").
 *  3. "Which paragraph/section contains…" groups with an empty / blank
 *     letter list → letters A..X from the instruction's range (the same
 *     ["A","B",…] shape the other paragraph-matching groups use); lists
 *     shorter than the instruction range are extended.
 *  4. Empty placeholder groups (no questions, title or instruction) removed.
 *  5. A summary-completion group with no word bank (answers typed from the
 *     passage) rendered only "Chưa có word bank." — no inputs at all →
 *     note-form with the same text (same __Qn__ placeholders).
 *
 * Specific fixes (instruction text copied from the source papers in
 * "IELTS - SUPERVIP/đề thi thật listen-read" where available):
 *  - Having a laugh: "__Q33_" placeholder (Q33 box never rendered), Q35
 *    stem "Q34", "__Q36__. Effect", bank word " laughter"; TFNG instruction.
 *  - The discovery of a baby mammoth Q19–23: options F/G were merged into
 *    one entry ("Bermard Buigues  G  Naoki Suzuki") → 7 options A–G.
 *  - Driverless cars Q26 stem "hich" → "Which".
 *  - Missing instructions: The kākāpō Q1–6, Plant 'thermometer' Q27–32,
 *    Timur Gareyev Q33–36, Does education Q14–18, Whale Culture Q38–40,
 *    What should companies Q35–40, How stress Q36–40 (verdict line).
 *
 * Every write is one updateOne per passage by _id, guarded on the
 * passage's updatedAt as read (an admin edit in between → skipped, never
 * overwritten). No multi-document writes.
 *
 * Run:  node backend/scripts/fixReadingWarnings.js            (dry run)
 *       node backend/scripts/fixReadingWarnings.js --apply    (backup + write)
 *       node backend/scripts/fixReadingWarnings.js --restore backend/scripts/backups/<file>.json
 */

const fs = require('fs');
const path = require('path');

const TFNG = (n) => `Do the following statements agree with the information given in Reading Passage ${n}? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.`;
const YNNG_PREFIX = (n) => `Do the following statements agree with the claims of the writer in Reading Passage ${n}? Write `;

const PARA_MATCH = /which\s+(?:paragraph|section)\s+contains/i;
const LETTER_RANGE = /\b([A-Z])\s*(?:[-–—]|to)\s*([A-Z])\b/;

function letters(from, to) {
  const out = [];
  for (let c = from.charCodeAt(0); c <= to.charCodeAt(0); c++) out.push(String.fromCharCode(c));
  return out;
}

function genericChanges(p, log) {
  const groups = p.questionGroups || [];

  groups.forEach((g, gi) => {
    const tag = `G${gi + 1}[${g.groupType}]`;
    const qs = g.questions || [];

    // 1. question type vs group
    qs.forEach(q => {
      if (q.type !== 'sentence-completion') return;
      if (g.groupType === 'sentence-endings') { q.type = 'matching-info'; log(`Q${q.questionNumber} type sentence-completion → matching-info (${tag})`); }
      else if (g.groupType === 'summary-completion') { q.type = 'fill-blank'; log(`Q${q.questionNumber} type sentence-completion → fill-blank (${tag})`); }
      else if (g.groupType === 'plain' && !(q.wordBank || []).length) { q.type = 'fill-blank'; log(`Q${q.questionNumber} type sentence-completion → fill-blank (${tag}, no word bank)`); }
    });

    // 2. summary letter keys → bank words
    const bank = g.groupType === 'summary-completion' ? (g.summaryConfig?.wordBank || []) : [];
    if (bank.length) {
      qs.forEach(q => {
        const key = String(q.correctAnswer || '').trim();
        const words = bank.map(w => String(w.word || '').trim().toLowerCase());
        if (words.includes(key.toLowerCase())) return;
        const hit = /^[A-Z]$/i.test(key) && bank.find(w => String(w.letter || '').trim().toUpperCase() === key.toUpperCase());
        if (!hit || !String(hit.word || '').trim()) throw new Error(`${p.title} Q${q.questionNumber}: key "${key}" matches no bank word — fix by hand`);
        q.correctAnswer = String(hit.word).trim();
        log(`Q${q.questionNumber} key "${key}" → "${q.correctAnswer}" (summary bank word)`);
      });
    }

    // 3. paragraph-matching letter list
    if (g.groupType === 'matching-options' && PARA_MATCH.test(`${g.instruction} ${g.groupTitle}`)) {
      const m = String(g.instruction || '').match(LETTER_RANGE);
      const opts = g.matchingOptions || [];
      const letterOnly = opts.every(o => String(o).trim().length <= 1);
      if (m && letterOnly) {
        const want = letters(m[1], m[2]);
        if (JSON.stringify(opts) !== JSON.stringify(want)) {
          g.matchingOptions = want;
          log(`${tag} matchingOptions ${JSON.stringify(opts)} → ${JSON.stringify(want)}`);
        }
      }
    }

    // 5. summary without a bank → note-form
    if (g.groupType === 'summary-completion' && !bank.length && String(g.summaryConfig?.text || '').trim()) {
      g.groupType = 'note-form';
      g.noteConfig = { title: '', lines: [g.summaryConfig.text.trim()] };
      log(`${tag} summary-completion without word bank → note-form (typed answers)`);
    }
  });

  // 4. empty placeholder groups
  const kept = groups.filter(g => (g.questions || []).length || String(g.groupTitle || '').trim() || String(g.instruction || '').trim());
  if (kept.length !== groups.length) {
    log(`removed ${groups.length - kept.length} empty placeholder group(s)`);
    p.questionGroups = kept;
  }
}

function group(p, qNum) {
  const g = (p.questionGroups || []).find(x => (x.questions || []).some(q => q.questionNumber === qNum));
  if (!g) throw new Error(`${p.title}: no group holds Q${qNum}`);
  return g;
}
function question(p, qNum) {
  return group(p, qNum).questions.find(q => q.questionNumber === qNum);
}
function setInstruction(p, qNum, text, log, { onlyIfEmpty = true } = {}) {
  const g = group(p, qNum);
  if (onlyIfEmpty && String(g.instruction || '').trim()) return;
  log(`Q${qNum}… instruction "${g.instruction || ''}" → "${text.slice(0, 70)}…"`);
  g.instruction = text;
}

const SPECIFIC = {
  'Having a laugh': (p, log) => {
    const g = group(p, 32);
    const t0 = g.summaryConfig.text;
    const t1 = t0.replace(/__Q33_(?!_)/, '__Q33__').replace(/__Q36__\.\s*Effect/, '__Q36__ effect').replace(/__Q35__and/, '__Q35__ and');
    if (t1 !== t0) { g.summaryConfig.text = t1; log('summary: "__Q33_" → "__Q33__", "__Q36__. Effect" → "__Q36__ effect"'); }
    g.summaryConfig.wordBank.forEach(w => { const t = String(w.word || '').trim(); if (t !== w.word) { log(`bank ${w.letter} "${w.word}" → "${t}"`); w.word = t; } });
    const q35 = question(p, 35);
    if (q35.questionText === 'Q34') { q35.questionText = 'Q35'; log('Q35 stem "Q34" → "Q35"'); }
    setInstruction(p, 37, TFNG(3), log);
  },
  'The discovery of a baby mammoth': (p, log) => {
    const g = group(p, 19);
    const i = g.matchingOptions.findIndex(o => /Buigues\s+G\s+Naoki/.test(o));
    if (i < 0) return;
    const before = g.matchingOptions.slice();
    g.matchingOptions.splice(i, 1, 'Bernard Buigues', 'Naoki Suzuki');
    log(`Q19–23 options ${JSON.stringify(before)} → ${JSON.stringify(g.matchingOptions)}`);
  },
  'Driverless cars': (p, log) => {
    const q = question(p, 26);
    if (/^hich\b/.test(q.questionText)) { q.questionText = 'W' + q.questionText; log('Q26 stem "hich" → "Which"'); }
  },
  'The kākāpō': (p, log) => setInstruction(p, 1, TFNG(1), log),
  'Plant ‘thermometer’ triggers springtime growth by measuring night-time heat': (p, log) => setInstruction(p, 27, TFNG(3), log),
  'Timur Gareyev – blindfold chess champion': (p, log) => setInstruction(p, 33, TFNG(3), log),
  'Does education fuel economic growth?': (p, log) => {
    setInstruction(p, 14, 'Reading Passage 2 has six sections, A–F. Which section contains the following information? Write the correct letter, A–F, in boxes 14–18 on your answer sheet.', log);
    const g = group(p, 14);
    const want = letters('A', 'F');
    if (JSON.stringify(g.matchingOptions) !== JSON.stringify(want)) { log(`Q14–18 matchingOptions → ${JSON.stringify(want)}`); g.matchingOptions = want; }
  },
  'Whale Culture': (p, log) => {
    setInstruction(p, 38, 'Reading Passage 3 has eight paragraphs, A–H. Which paragraph contains the following information? Write the correct letter, A–H, in boxes 38–40 on your answer sheet.', log);
    const g = group(p, 38);
    const want = letters('A', 'H');
    if (JSON.stringify(g.matchingOptions) !== JSON.stringify(want)) { log(`Q38–40 matchingOptions → ${JSON.stringify(want)}`); g.matchingOptions = want; }
    const g1 = group(p, 27);
    if (/^YES if/.test(g1.instruction.trim())) { log('Q27–31 instruction: add "Do the following statements agree…"'); g1.instruction = YNNG_PREFIX(3) + g1.instruction.trim(); }
  },
  'What should companies do to survive?': (p, log) => {
    setInstruction(p, 35, 'Reading Passage 3 has ten paragraphs, A–J. Which paragraph contains the following information? Write the correct letter, A–J, in boxes 35–40 on your answer sheet. NB You may use any letter more than once.', log);
    const g = group(p, 35);
    const want = letters('A', 'J');
    if (JSON.stringify(g.matchingOptions) !== JSON.stringify(want)) { log(`Q35–40 matchingOptions → ${JSON.stringify(want)}`); g.matchingOptions = want; }
    const g1 = group(p, 27);
    if (/^YES if/.test(g1.instruction.trim())) { log('Q27–34 instruction: add "Do the following statements agree…"'); g1.instruction = YNNG_PREFIX(3) + g1.instruction.trim(); }
  },
  'How stress affects our judgement': (p, log) => {
    const g = group(p, 36);
    if (!/TRUE/.test(g.instruction)) { log('Q36–40 instruction: add TRUE/FALSE/NOT GIVEN line'); g.instruction = TFNG(3); }
  },
};

// Specific fixes run BEFORE the generic pass so rule 3 sees the new
// instructions (Does education / Whale / companies).
function planForPassage(passage) {
  const p = JSON.parse(JSON.stringify(passage)); // plain clone; ObjectIds become strings, only used for diffing
  const changes = [];
  const log = (s) => changes.push(s);
  if (SPECIFIC[p.title]) SPECIFIC[p.title](p, log);
  genericChanges(p, log);
  return { changes, next: p };
}

async function run() {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const mongoose = require('mongoose');
  const { EJSON } = mongoose.mongo.BSON;
  const args = process.argv.slice(2);
  await mongoose.connect(process.env.MONGO_URI);
  const col = mongoose.connection.db.collection('passages');
  try {
    if (args[0] === '--restore') {
      const file = args[1];
      if (!file || !fs.existsSync(file)) throw new Error('Usage: --restore <backup.json>');
      const docs = EJSON.parse(fs.readFileSync(file, 'utf8'), { relaxed: false });
      for (const doc of docs) {
        const r = await col.replaceOne({ _id: doc._id }, doc);
        console.log(`[restore] ${doc._id} "${doc.title}" matched=${r.matchedCount} modified=${r.modifiedCount}`);
      }
      return;
    }

    const apply = args.includes('--apply');
    const passages = await col.find({}).toArray();
    const plans = [];
    for (const p of passages) {
      const { changes, next } = planForPassage(p);
      if (!changes.length) continue;
      plans.push({ p, changes, next });
      console.log(`\n${p._id} "${p.title}" (${p.category}${p.isActive ? '' : ', inactive'})`);
      changes.forEach(c => console.log(`  - ${c}`));
    }
    const total = plans.reduce((n, x) => n + x.changes.length, 0);
    console.log(`\n[fix] ${total} change(s) across ${plans.length} passage(s).`);
    if (!total) { console.log('[fix] nothing to do.'); return; }
    if (!apply) { console.log('[fix] dry run — re-run with --apply to write (a backup is taken first).'); return; }

    const dir = path.join(__dirname, 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `reading-warnings-fix-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(file, EJSON.stringify(plans.map(x => x.p), { relaxed: false }));
    console.log(`[fix] backup of ${plans.length} passage(s) → ${file}`);

    // Re-hydrate the edited groups through the Passage model's schema so
    // subdocument _ids / types stay as ObjectIds (the plan worked on a JSON clone).
    const Passage = require('../models/Passage');
    let ok = 0, skipped = 0;
    for (const { p, next } of plans) {
      const groups = new Passage({ ...next, _id: p._id }).toObject().questionGroups;
      const r = await col.updateOne(
        { _id: p._id, updatedAt: p.updatedAt },
        { $set: { questionGroups: groups, updatedAt: new Date() } },
      );
      if (r.matchedCount === 1) ok++;
      else { skipped++; console.log(`[fix] SKIPPED ${p._id} "${p.title}" — changed since the plan was made; re-run to re-plan.`); }
    }
    console.log(`[fix] applied to ${ok} passage(s), skipped ${skipped}.`);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  run().catch(e => { console.error('[fix] FAILED', e); process.exit(1); });
}

module.exports = { planForPassage };
