/**
 * seedTask2DanielSamples.js — "Bài mẫu từ Daniel" for Task 2:
 *
 *  A. Writes the hand-written model essays in data/task2DanielSamples.js
 *     into WritingTask2 docs whose sample is missing / all-empty sections
 *     (and their "Phân tích đề" when the doc has none). Never overwrites
 *     a sample that already has text unless --force.
 *  B. Adds colour-coded sentence-role highlights (hook / topic / idea /
 *     supporting) to the pre-existing essays, from the sentence-index specs
 *     in data/task2SampleHighlightSpecs.js. Only the `highlights` field of
 *     each section is set — content is never touched.
 *
 * Every write is a scoped updateOne({ _id }). Dry run by default.
 *
 * Usage (from backend/):
 *   node scripts/seedTask2DanielSamples.js            # dry run — validate + report
 *   node scripts/seedTask2DanielSamples.js --apply
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const WritingTask2 = require('../models/WritingTask2');
const SAMPLES = require('./data/task2DanielSamples');
const SPECS = require('./data/task2SampleHighlightSpecs');
const { buildParagraph, highlightsFromSpec } = require('./data/task2SampleHighlights');

const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');
const DEFAULT_TITLES = ['Introduction', 'Body 1', 'Body 2', 'Conclusion'];
const hasText = secs => (secs || []).some(s => (s.content || '').trim());
const words = s => s.trim().split(/\s+/).filter(Boolean).length;

function buildSample(entry, existing) {
  const titles = (existing || []).length === 4 ? existing.map((s, i) => s.title || DEFAULT_TITLES[i]) : DEFAULT_TITLES;
  const paras = [entry.intro, entry.body1, entry.body2].map(buildParagraph);
  paras.push({ content: entry.conclusion.join(' '), highlights: [] });
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
  for (const entry of SAMPLES) {
    if (seen.has(entry.id)) throw new Error(`duplicate sample id ${entry.id}`);
    seen.add(entry.id);
    const doc = await WritingTask2.findById(entry.id).select('prompt sampleSections analysisSections isActive').lean();
    if (!doc) { console.log(`MISS  ${entry.id} — no such WritingTask2`); skippedA++; continue; }
    if (hasText(doc.sampleSections) && !FORCE) { console.log(`SKIP  ${entry.id} — already has a sample`); skippedA++; continue; }
    const sampleSections = buildSample(entry, doc.sampleSections);
    const total = sampleSections.reduce((n, s) => n + words(s.content), 0);
    const $set = { sampleSections };
    const addAnalysis = Array.isArray(entry.analysis) && !(doc.analysisSections || []).length;
    if (addAnalysis) $set.analysisSections = entry.analysis;
    console.log(`${APPLY ? 'WRITE' : 'PLAN '} ${entry.id} [${entry.type}] ${total}w${addAnalysis ? ' +analysis' : ''} · ${doc.prompt.replace(/\s+/g, ' ').slice(0, 60)}…`);
    if (total < 250) console.log(`      ⚠ under 250 words`);
    if (APPLY) await WritingTask2.updateOne({ _id: doc._id }, { $set });
    wroteA++;
  }

  // ── B. highlights for existing essays ──
  let wroteB = 0, skippedB = 0;
  for (const [id, [b1, b2]] of Object.entries(SPECS)) {
    if (seen.has(id)) throw new Error(`${id} is in both the samples and the specs`);
    const doc = await WritingTask2.findById(id).select('sampleSections').lean();
    const secs = doc && doc.sampleSections;
    if (!secs || secs.length < 3 || !hasText(secs)) { console.log(`MISS  ${id} — no sample to highlight`); skippedB++; continue; }
    const $set = {};
    [['H0', 0], [b1, 1], [b2, 2]].forEach(([spec, i]) => {
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
