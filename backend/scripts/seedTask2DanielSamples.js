/**
 * seedTask2DanielSamples.js — "Bài mẫu từ Daniel" for Task 2:
 *
 *  A. Writes the hand-written model essays in data/task2DanielSamples.js
 *     into WritingTask2 docs whose sample is missing / all-empty sections
 *     (and their "Phân tích đề" when the doc has none). Never overwrites
 *     a sample that already has text unless --force; an already-seeded
 *     sample whose text still matches gets its highlights refreshed.
 *     The band 7+ rewrites in data/task2DanielRewrites.js are the
 *     exception: they REPLACE the older text they were written for. The
 *     replaced sections are saved to data/task2SampleBackup/ first.
 *  B. Adds colour-coded sentence-role highlights (hook / thesis / topic /
 *     idea / supporting / restatement / final) to the pre-existing essays,
 *     from the sentence-index specs in data/task2SampleHighlightSpecs.js.
 *     Only the `highlights` field of each section is set — content is
 *     never touched.
 *
 * Every write is a scoped updateOne({ _id }). Dry run by default.
 *
 * Usage (from backend/):
 *   node scripts/seedTask2DanielSamples.js            # dry run — validate + report
 *   node scripts/seedTask2DanielSamples.js --apply
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const WritingTask2 = require('../models/WritingTask2');
const SAMPLES = require('./data/task2DanielSamples');
const REWRITES = require('./data/task2DanielRewrites');
const SPECS = require('./data/task2SampleHighlightSpecs');
const { buildParagraph, highlightsFromSpec } = require('./data/task2SampleHighlights');

const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');
const DEFAULT_TITLES = ['Introduction', 'Body 1', 'Body 2', 'Conclusion'];
const hasText = secs => (secs || []).some(s => (s.content || '').trim());
const words = s => s.trim().split(/\s+/).filter(Boolean).length;

const norm = s => String(s || '').replace(/\s+/g, ' ').trim();

function buildSample(entry, existing) {
  const titles = (existing || []).length === 4 ? existing.map((s, i) => s.title || DEFAULT_TITLES[i]) : DEFAULT_TITLES;
  const paras = [entry.intro, entry.body1, entry.body2, entry.conclusion].map(buildParagraph);
  return paras.map((p, i) => {
    const sec = { title: titles[i], content: p.content };
    if (p.highlights.length) sec.highlights = p.highlights;
    return sec;
  });
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`[seedTask2DanielSamples] ${APPLY ? 'APPLY' : 'DRY RUN'}${FORCE ? ' --force' : ''}`);

  // ── A. new essays ──
  let wroteA = 0, skippedA = 0;
  const seen = new Set();
  const backup = [], pending = [];
  const entries = SAMPLES.concat(REWRITES.map(r => ({ ...r, rewrite: true })));
  for (const entry of entries) {
    if (seen.has(entry.id)) throw new Error(`duplicate sample id ${entry.id}`);
    seen.add(entry.id);
    const doc = await WritingTask2.findById(entry.id).select('prompt sampleSections analysisSections isActive').lean();
    if (!doc) { console.log(`MISS  ${entry.id} — no such WritingTask2`); skippedA++; continue; }
    const sampleSections = buildSample(entry, doc.sampleSections);
    const same = (doc.sampleSections || []).length === 4 &&
      doc.sampleSections.every((s, i) => norm(s.content) === norm(sampleSections[i].content));
    if (hasText(doc.sampleSections) && !FORCE && (!entry.rewrite || same)) {
      // Already seeded: refresh only the highlights, and only while the
      // text is still exactly ours (an admin edit keeps its old colours).
      if (!same) { console.log(`SKIP  ${entry.id} — sample text differs from the data file`); skippedA++; continue; }
      const $set = {};
      sampleSections.forEach((s, i) => { $set[`sampleSections.${i}.highlights`] = s.highlights || []; });
      console.log(`${APPLY ? 'HL   ' : 'PLAN '} ${entry.id} [${entry.type}] highlights only`);
      if (APPLY) await WritingTask2.updateOne({ _id: doc._id }, { $set });
      wroteA++;
      continue;
    }
    const total = sampleSections.reduce((n, s) => n + words(s.content), 0);
    const $set = { sampleSections };
    const addAnalysis = Array.isArray(entry.analysis) && !(doc.analysisSections || []).length;
    if (addAnalysis) $set.analysisSections = entry.analysis;
    console.log(`${APPLY ? 'WRITE' : 'PLAN '} ${entry.id} [${entry.type}] ${total}w${addAnalysis ? ' +analysis' : ''} · ${doc.prompt.replace(/\s+/g, ' ').slice(0, 60)}…`);
    if (total < 250) console.log(`      ⚠ under 250 words`);
    if (hasText(doc.sampleSections)) backup.push({ _id: entry.id, sampleSections: doc.sampleSections });
    pending.push({ _id: doc._id, $set });
    wroteA++;
  }

  // Back up every sample about to be replaced BEFORE the first write.
  if (APPLY && backup.length) {
    const dir = path.join(__dirname, 'data', 'task2SampleBackup');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `sampleSections-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(file, JSON.stringify(backup, null, 1));
    console.log(`Backed up ${backup.length} replaced samples → ${path.relative(process.cwd(), file)}`);
  }
  if (APPLY) for (const p of pending) await WritingTask2.updateOne({ _id: p._id }, { $set: p.$set });

  // ── B. highlights for existing essays ──
  let wroteB = 0, skippedB = 0;
  for (const [id, specs] of Object.entries(SPECS)) {
    if (seen.has(id)) throw new Error(`${id} is in both the samples and the specs`);
    const doc = await WritingTask2.findById(id).select('sampleSections').lean();
    const secs = doc && doc.sampleSections;
    if (!secs || secs.length < specs.length || !hasText(secs)) { console.log(`MISS  ${id} — no sample to highlight`); skippedB++; continue; }
    const $set = {};
    specs.forEach((spec, i) => {
      $set[`sampleSections.${i}.highlights`] = highlightsFromSpec(secs[i].content, spec);
    });
    if (APPLY) await WritingTask2.updateOne({ _id: doc._id }, { $set });
    wroteB++;
  }

  // Report active essays that will render with no highlights at all.
  const active = await WritingTask2.find({ isActive: true }).select('prompt sampleSections').lean();
  const uncovered = active.filter(d => hasText(d.sampleSections) && !seen.has(String(d._id)) && !SPECS[String(d._id)]);
  console.log(`\nA. essays ${APPLY ? 'written' : 'to write'}: ${wroteA} (skipped ${skippedA})`);
  console.log(`B. essays ${APPLY ? 'highlighted' : 'to highlight'}: ${wroteB} (skipped ${skippedB})`);
  if (uncovered.length) {
    console.log(`Active essays with no highlight spec (${uncovered.length}):`);
    uncovered.forEach(d => console.log(`   ${d._id} · ${d.prompt.replace(/\s+/g, ' ').slice(0, 70)}`));
  }
  if (!APPLY) console.log('\nRe-run with --apply to write.');
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
