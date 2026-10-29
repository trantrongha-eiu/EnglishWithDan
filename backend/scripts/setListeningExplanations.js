'use strict';

/**
 * Write Vietnamese answer explanations into Listening questions — individual
 * sections (ListeningSection) and full-test parts (ListeningTest.sections[]).
 *
 * Data: scripts/data/listeningExplanationsV2/<key>.json, where <key> is
 *   S_<sectionId>                 → a ListeningSection
 *   T_<testId>_P<partNumber>      → one part of a ListeningTest
 * File shape: { title, q: { "<questionNumber>": { d, v, t, p } } }
 *   d = Vietnamese translation of the question / the sentence with the blank
 *   v = where in the recording ("Khi … nói về …")
 *   t = quote(s) from the transcript — string or array, each must appear verbatim
 *   p = analysis, ending with "→ <answer>"
 *
 * Checks before writing (a file with any problem is skipped): the target
 * exists, every question has an entry and no extra ones, every quote is in the
 * transcript, and the text after the last "→" contains the answer key.
 * Only empty explanations are written unless --force.
 *
 * Then every full-test part whose transcript is the same as an individual
 * section's gets that section's explanations copied into its empty questions
 * (matched by order, and only when the answer keys agree) — so a section and
 * its copy inside a full test never drift apart.
 *
 * Run:  node scripts/setListeningExplanations.js [key…]            (dry run)
 *       node scripts/setListeningExplanations.js [key…] --apply [--force]
 */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'data', 'listeningExplanationsV2');
const norm = s => ' ' + String(s || '').toLowerCase()
  .replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—−-]/g, '-').replace(/…/g, '...')
  .replace(/[^a-z0-9'%£$€.,&-]+/g, ' ').replace(/\s+/g, ' ') + ' ';
const loose = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const quotes = t => (Array.isArray(t) ? t : [t]).filter(Boolean);
const allQs = part => (part.questionGroups || []).flatMap(g => g.questions || [])
  .sort((a, b) => a.questionNumber - b.questionNumber);

function compose(e) {
  const parts = [`Dịch: ${e.d}`];
  if (e.v) parts.push(`Vị trí: ${e.v}`);
  const qs = quotes(e.t);
  if (qs.length) parts.push(`Transcript: ${qs.map(x => `“${x}”`).join(' … ')}`);
  parts.push(`Phân tích: ${e.p}`);
  return parts.join('\n\n');
}

function keyAlternatives(key) {
  let k = String(key || '');
  try { const j = JSON.parse(k); if (Array.isArray(j)) return [j.join(' ')]; } catch { /* plain key */ }
  return k.split('/').map(x => x.trim()).filter(Boolean);
}

function check(part, data) {
  const problems = [];
  const qs = allQs(part);
  const body = norm(part.transcript);
  const nums = new Set(qs.map(q => String(q.questionNumber)));
  for (const n of Object.keys(data.q || {})) if (!nums.has(n)) problems.push(`Q${n}: no such question`);
  for (const q of qs) {
    const e = (data.q || {})[q.questionNumber];
    if (!e) { problems.push(`Q${q.questionNumber}: missing`); continue; }
    if (!e.d || !e.p || !e.v) problems.push(`Q${q.questionNumber}: empty d/v/p`);
    if (!quotes(e.t).length) problems.push(`Q${q.questionNumber}: no transcript quote`);
    for (const t of quotes(e.t)) if (!body.includes(norm(t).trim())) problems.push(`Q${q.questionNumber}: quote not in transcript: "${t.slice(0, 70)}"`);
    if (!String(e.p).includes('→')) { problems.push(`Q${q.questionNumber}: analysis has no "→ answer"`); continue; }
    if (e.key !== undefined && !e.why) problems.push(`Q${q.questionNumber}: key change without "why"`);
    const tail = ' ' + loose(String(e.p).split('→').pop()) + ' ';
    const alts = keyAlternatives(e.key !== undefined ? e.key : q.correctAnswer);
    if (!alts.some(a => tail.includes(' ' + loose(a) + ' '))) problems.push(`Q${q.questionNumber}: "→ …" does not contain the key "${q.correctAnswer}"`);
  }
  return problems;
}

// Answer-key corrections found while writing, as { "<sectionId>": { [questionNumber]: { from, to } } },
// so the copy step can fix the same key in the section's full-test copy.
const keyFixes = {};

function fill(part, data, force, sectionId) {
  let n = 0;
  for (const q of allQs(part)) {
    const e = data.q[q.questionNumber];
    if (e && e.key !== undefined && String(e.key) !== String(q.correctAnswer)) {
      console.log(`  key Q${q.questionNumber}: "${q.correctAnswer}" → "${e.key}" (${e.why})`);
      if (sectionId) (keyFixes[sectionId] = keyFixes[sectionId] || {})[q.questionNumber] = { from: q.correctAnswer, to: String(e.key) };
      q.correctAnswer = String(e.key);
      n++;
    }
    if (!e || ((q.explanation || '').trim() && !force)) continue;
    q.explanation = compose(e);
    n++;
  }
  return n;
}

async function run({ keys, apply, force }) {
  const mongoose = require('mongoose');
  const db = mongoose.connection.db;
  const Sec = db.collection('listeningsections');
  const Tst = db.collection('listeningtests');

  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'))
    .filter(f => !keys.length || keys.includes(f.replace(/\.json$/, '')));
  let ok = 0, bad = 0, written = 0;

  for (const f of files) {
    const key = f.replace(/\.json$/, '');
    const data = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    let m;
    if ((m = key.match(/^S_([0-9a-f]{24})$/))) {
      const s = await Sec.findOne({ _id: new mongoose.Types.ObjectId(m[1]) });
      if (!s) { console.log(`✗ ${key}: section not found`); bad++; continue; }
      const problems = check(s, data);
      if (problems.length) { console.log(`✗ ${key} ${s.title}\n   ${problems.join('\n   ')}`); bad++; continue; }
      const n = fill(s, data, force, String(s._id));
      ok++;
      if (apply && n) {
        const r = await Sec.updateOne({ _id: s._id, updatedAt: s.updatedAt }, { $set: { questionGroups: s.questionGroups, updatedAt: new Date() } });
        if (!r.modifiedCount) { console.log(`✗ ${key}: changed while running — rerun`); continue; }
        written += n;
      }
      console.log(`✓ ${key} ${s.title}: ${n} to write`);
    } else if ((m = key.match(/^T_([0-9a-f]{24})_P([1-4])$/))) {
      const t = await Tst.findOne({ _id: new mongoose.Types.ObjectId(m[1]) });
      const part = t && (t.sections || []).find(p => p.partNumber === Number(m[2]));
      if (!part) { console.log(`✗ ${key}: test part not found`); bad++; continue; }
      const problems = check(part, data);
      if (problems.length) { console.log(`✗ ${key} ${t.name} P${m[2]}\n   ${problems.join('\n   ')}`); bad++; continue; }
      const n = fill(part, data, force);
      ok++;
      if (apply && n) {
        const r = await Tst.updateOne({ _id: t._id, updatedAt: t.updatedAt }, { $set: { sections: t.sections, updatedAt: new Date() } });
        if (!r.modifiedCount) { console.log(`✗ ${key}: changed while running — rerun`); continue; }
        written += n;
      }
      console.log(`✓ ${key} ${t.name} P${m[2]}: ${n} to write`);
    } else {
      console.log(`✗ ${f}: bad file name`); bad++;
    }
  }
  console.log(`\nfiles ok ${ok}, with problems ${bad}; explanations written ${written}${apply ? '' : ' (dry run)'}`);

  // Copy section explanations into the matching parts of full tests.
  const secs = await Sec.find({}).toArray();
  const byTr = new Map(secs.map(s => [loose(s.transcript).slice(0, 300), s]));
  let copied = 0;
  for (const t of await Tst.find({}).toArray()) {
    let n = 0;
    for (const part of t.sections || []) {
      const s = byTr.get(loose(part.transcript).slice(0, 300));
      if (!s) continue;
      const src = allQs(s), dst = allQs(part);
      if (src.length !== dst.length) { console.log(`  ! ${t.name} P${part.partNumber}: ${dst.length} questions vs ${src.length} in "${s.title}"`); continue; }
      const fixes = keyFixes[String(s._id)] || {};
      dst.forEach((q, i) => {
        const from = src[i];
        const fix = fixes[from.questionNumber];
        if (fix && loose(q.correctAnswer) === loose(fix.from)) {
          console.log(`  key ${t.name} Q${q.questionNumber}: "${q.correctAnswer}" → "${fix.to}"`);
          q.correctAnswer = fix.to;
          n++;
        }
        if (!(from.explanation || '').trim() || (q.explanation || '').trim()) return;
        if (loose(from.correctAnswer) !== loose(q.correctAnswer)) { console.log(`  ! ${t.name} Q${q.questionNumber}: key "${q.correctAnswer}" ≠ section "${from.correctAnswer}" — not copied`); return; }
        // Question numbers are written inside the text only as "Q…" refs; keep as is.
        q.explanation = from.explanation;
        n++;
      });
    }
    if (n) {
      copied += n;
      if (apply) await Tst.updateOne({ _id: t._id, updatedAt: t.updatedAt }, { $set: { sections: t.sections, updatedAt: new Date() } });
      console.log(`  → ${t.name}: ${n} copied from individual sections`);
    }
  }
  console.log(`copied into full tests: ${copied}${apply ? '' : ' (dry run)'}`);
}

if (require.main === module) {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const mongoose = require('mongoose');
  const args = process.argv.slice(2);
  const opts = { apply: args.includes('--apply'), force: args.includes('--force'), keys: args.filter(a => !a.startsWith('--')) };
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try { await run(opts); } finally { await mongoose.disconnect(); }
  })().catch(e => { console.error('[setListeningExplanations] FAILED', e); process.exit(1); });
}

module.exports = { run, check, compose };
