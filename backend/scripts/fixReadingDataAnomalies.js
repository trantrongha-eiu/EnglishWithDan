'use strict';

/**
 * One-off data fix for Reading passages — errors found while auditing the
 * bank for the Reading Tips practice (chat log 2026-09-23).
 *
 *  1. Options typed with their own letter ("A predicting…", "B describing…")
 *     render as "A. A predicting…" in Reading practice. The letter is
 *     stripped only when EVERY option of the question / matching group
 *     carries its own letter in order: MCQ `options` (group + legacy flat
 *     questions) and matching-group `matchingOptions`.
 *  2. Innovation in Business Q35: stem was a copy of Q31's ("What is the
 *     writer doing in the third paragraph?"); the real stem is "According to
 *     the writer, companies like Previously Unavailable" (options/key D fit).
 *  3. Roman tunnels Q13: answer key was copied from Q12 ("the architect…");
 *     the explanation's own quote gives "the harbor". Also "Qevlik" →
 *     "Çevlik", the passage's spelling.
 *  4. Invasion of the Robot Umpires Q27–32 (Cambridge 20 Test 2 Passage 3)
 *     is YES/NO/NOT GIVEN ("claims of the writer") but was typed TFNG with
 *     TRUE/FALSE keys → yes-no-ng, TRUE→YES, FALSE→NO (same verdicts as the
 *     official key: 27 NO, 28 YES, 29 NG, 30 NO, 31 NG, 32 YES).
 *  5. Koalas Q6–12 is TFNG (keys TRUE/FALSE, "information given") but its
 *     instruction said "Write YES … NO …" → TRUE/FALSE wording.
 *  6. Title typo "ewels from the sea" → "Jewels from the sea".
 *
 * Deliberately NOT changed: "The Step Pyramid of Djoser" exists twice on
 * purpose (same text, different question sets), and the two "Jewels from
 * the sea" documents belong to different mock tests (29 and 33).
 *
 * Every change is a targeted $set on one path of one passage, and the
 * update's filter requires that path to still hold the value seen when the
 * plan was made — an admin edit in between makes the update a no-op
 * (reported), never an overwrite. No multi-document writes.
 *
 * Run:  node backend/scripts/fixReadingDataAnomalies.js            (dry run)
 *       node backend/scripts/fixReadingDataAnomalies.js --apply    (backup + write)
 *       node backend/scripts/fixReadingDataAnomalies.js --restore backend/scripts/backups/<file>.json
 */

const fs = require('fs');
const path = require('path');

const LETTER_PREFIX = (letter) => new RegExp(`^\\s*${letter}(?:[.):]\\s*|\\s+)(?=\\S)`);

// ['A predicting x', 'B describing y', …] → ['predicting x', 'describing y', …];
// null unless every entry is a non-empty string starting with its own
// letter (A for index 0, B for 1, …).
function stripOwnLetters(list) {
  if (!Array.isArray(list) || list.length < 2) return null;
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (typeof item !== 'string') return null;
    const re = LETTER_PREFIX(String.fromCharCode(65 + i));
    if (!re.test(item)) return null;
    out.push(item.replace(re, '').trim());
  }
  return out;
}

// Letter-prefix changes for one passage: [{ path, from, to, label }].
function letterPrefixChanges(passage) {
  const changes = [];
  (passage.questionGroups || []).forEach((g, gi) => {
    (g.questions || []).forEach((q, qi) => {
      const to = stripOwnLetters(q.options);
      if (to) changes.push({ path: `questionGroups.${gi}.questions.${qi}.options`, from: q.options, to, label: `Q${q.questionNumber} options` });
    });
    const mo = stripOwnLetters(g.matchingOptions);
    if (mo) changes.push({ path: `questionGroups.${gi}.matchingOptions`, from: g.matchingOptions, to: mo, label: `${g.groupTitle || 'group ' + gi} matchingOptions` });
  });
  (passage.questions || []).forEach((q, qi) => {
    const to = stripOwnLetters(q.options);
    if (to) changes.push({ path: `questions.${qi}.options`, from: q.options, to, label: `Q${q.questionNumber} options (legacy flat)` });
  });
  return changes;
}

// Visits every copy of question `qNum` (group + legacy flat array).
function eachQuestion(passage, qNum, fn) {
  (passage.questionGroups || []).forEach((g, gi) => (g.questions || []).forEach((q, qi) => {
    if (q.questionNumber === qNum) fn(q, `questionGroups.${gi}.questions.${qi}`);
  }));
  (passage.questions || []).forEach((q, qi) => {
    if (q.questionNumber === qNum) fn(q, `questions.${qi}`);
  });
}

const INNOVATION_Q35_OLD = 'What is the writer doing in the third paragraph?';
const INNOVATION_Q35_NEW = 'According to the writer, companies like Previously Unavailable';
const ROMAN_Q13_BAD_KEY = /^\s*he architect\b/;
const ROMAN_Q13_KEY = 'the harbor / harbor / the harbour / harbour';
const KOALAS_OLD_WORDING = 'Write YES if the statement agrees with the information, NO if the statement contradicts the information';
const KOALAS_NEW_WORDING = 'Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information';

// Content-specific fixes, keyed by passage title.
const SPECIFIC = {
  'Innovation in Business': (p) => {
    const out = [];
    eachQuestion(p, 35, (q, at) => {
      if (q.questionText === INNOVATION_Q35_OLD) out.push({ path: `${at}.questionText`, from: q.questionText, to: INNOVATION_Q35_NEW, label: 'Q35 stem' });
    });
    return out;
  },
  'Roman tunnels': (p) => {
    const out = [];
    eachQuestion(p, 13, (q, at) => {
      if (ROMAN_Q13_BAD_KEY.test(q.correctAnswer || '')) out.push({ path: `${at}.correctAnswer`, from: q.correctAnswer, to: ROMAN_Q13_KEY, label: 'Q13 answer key' });
      if (/Qevlik/.test(q.questionText || '')) out.push({ path: `${at}.questionText`, from: q.questionText, to: q.questionText.replace(/Qevlik/g, 'Çevlik'), label: 'Q13 spelling' });
    });
    return out;
  },
  'Invasion of the Robot Umpires': (p) => {
    const out = [];
    const YN = { TRUE: 'YES', FALSE: 'NO', 'NOT GIVEN': 'NOT GIVEN' };
    for (let n = 27; n <= 32; n++) {
      eachQuestion(p, n, (q, at) => {
        if (q.type !== 'true-false-ng') return;
        const key = String(q.correctAnswer || '').trim().toUpperCase();
        if (!YN[key]) throw new Error(`Robot Umpires Q${n}: unexpected key "${q.correctAnswer}" — fix by hand`);
        out.push({ path: `${at}.type`, from: q.type, to: 'yes-no-ng', label: `Q${n} type` });
        if (YN[key] !== q.correctAnswer) out.push({ path: `${at}.correctAnswer`, from: q.correctAnswer, to: YN[key], label: `Q${n} key` });
        if (/\b(?:TRUE|FALSE)\b/.test(q.explanation || '')) {
          out.push({ path: `${at}.explanation`, from: q.explanation, to: q.explanation.replace(/\bTRUE\b/g, 'YES').replace(/\bFALSE\b/g, 'NO'), label: `Q${n} explanation verdict` });
        }
      });
    }
    return out;
  },
  Koalas: (p) => {
    const out = [];
    (p.questionGroups || []).forEach((g, gi) => {
      const tfng = (g.questions || []).some(q => q.type === 'true-false-ng');
      if (tfng && typeof g.instruction === 'string' && g.instruction.includes(KOALAS_OLD_WORDING)) {
        out.push({ path: `questionGroups.${gi}.instruction`, from: g.instruction, to: g.instruction.replace(KOALAS_OLD_WORDING, KOALAS_NEW_WORDING), label: 'Q6–12 instruction' });
      }
    });
    return out;
  },
  'ewels from the sea': () => [{ path: 'title', from: 'ewels from the sea', to: 'Jewels from the sea', label: 'title typo' }],
};

function planForPassage(passage) {
  const specific = SPECIFIC[passage.title] ? SPECIFIC[passage.title](passage) : [];
  return [...letterPrefixChanges(passage), ...specific];
}

function describe(v) {
  const s = Array.isArray(v) ? JSON.stringify(v) : JSON.stringify(String(v));
  return s.length > 160 ? s.slice(0, 157) + '…' : s;
}

async function run() {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
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
    // Only passages that can actually be touched: every doc is scanned for
    // letter prefixes (read-only), specific fixes match by exact title.
    const passages = await col.find({}).toArray();
    const plans = passages.map(p => ({ p, changes: planForPassage(p) })).filter(x => x.changes.length);
    let total = 0;
    for (const { p, changes } of plans) {
      console.log(`\n${p._id} "${p.title}" (${p.category}${p.isActive ? '' : ', inactive'})`);
      for (const c of changes) {
        total++;
        console.log(`  - ${c.label} [${c.path}]\n      from ${describe(c.from)}\n      to   ${describe(c.to)}`);
      }
    }
    console.log(`\n[fix] ${total} change(s) across ${plans.length} passage(s).`);
    if (!total) { console.log('[fix] nothing to do.'); return; }
    if (!apply) { console.log('[fix] dry run — re-run with --apply to write (a backup is taken first).'); return; }

    const dir = path.join(__dirname, 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `reading-data-fix-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(file, EJSON.stringify(plans.map(x => x.p), { relaxed: false }));
    console.log(`[fix] backup of ${plans.length} passage(s) → ${file}`);

    let ok = 0, skipped = 0;
    for (const { p, changes } of plans) {
      const filter = { _id: p._id };
      const set = { updatedAt: new Date() };
      for (const c of changes) { filter[c.path] = c.from; set[c.path] = c.to; }
      const r = await col.updateOne(filter, { $set: set });
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

module.exports = { stripOwnLetters, letterPrefixChanges, planForPassage };
