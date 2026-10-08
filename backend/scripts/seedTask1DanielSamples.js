/**
 * seedTask1DanielSamples.js — "Model answers from Daniel" for Task 1
 * (data/task1DanielSamples.js):
 *
 *  1. TEXT_FIXES — exact-string corrections in existing prompts, samples
 *     and analyses (skipped when the `from` text is no longer there).
 *  2. SAMPLES — written into docs whose sample is missing or has a blank
 *     section, or (entry.replaces) whose old sample misread the chart and
 *     whose Body 1 still starts with that old text. Any other complete
 *     sample is never overwritten.
 *  3. ANALYSES — "Phân tích đề" for docs with none, or (replaceGeneric)
 *     still on the generic placeholder that starts "1. Dạng bài & cách làm".
 *  4. Highlights — colour-coded sentence roles for every essay: from the
 *     coded sentences of SAMPLES, or from SPECS for the existing essays.
 *     Only `highlights` is set for those — content is never touched.
 *
 * Every write is a scoped updateOne({ _id }). Dry run by default.
 *
 * Usage (from backend/):
 *   node scripts/seedTask1DanielSamples.js            # dry run — validate + report
 *   node scripts/seedTask1DanielSamples.js --apply
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const WritingTask1 = require('../models/WritingTask1');
const { SAMPLES, ANALYSES, TEXT_FIXES, SPECS } = require('./data/task1DanielSamples');
const { buildParagraph, highlightsFromSpec, splitSentences, TASK1_ROLES } = require('./data/task2SampleHighlights');

const APPLY = process.argv.includes('--apply');
const DEFAULT_TITLES = ['Introduction', 'Overview', 'Body 1', 'Body 2'];
const PARTS = ['intro', 'overview', 'body1', 'body2'];
const hasText = secs => (secs || []).some(s => (s.content || '').trim());
const complete = secs => (secs || []).length === 4 && secs.every(s => (s.content || '').trim());
const words = s => s.trim().split(/\s+/).filter(Boolean).length;
const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
const GENERIC_ANALYSIS = '1. Dạng bài & cách làm';

function buildSample(entry, existing) {
  const titles = (existing || []).length === 4 ? existing.map((s, i) => s.title || DEFAULT_TITLES[i]) : DEFAULT_TITLES;
  return PARTS.map((k, i) => {
    const p = buildParagraph(entry[k]);
    // every sentence tagged, and each tagged text a whole sentence
    if (p.highlights.length !== entry[k].length) throw new Error(`${entry.id} ${k}: untagged sentence`);
    if (splitSentences(p.content).length !== entry[k].length) throw new Error(`${entry.id} ${k}: a tagged text is not exactly one sentence`);
    p.highlights.forEach(h => { if (!TASK1_ROLES.includes(h.role)) throw new Error(`${entry.id}: role ${h.role} is not a Task 1 role`); });
    return { title: titles[i], content: p.content, highlights: p.highlights };
  });
}

function specHighlights(id, secs) {
  return SPECS[id].map((spec, i) => {
    const hl = highlightsFromSpec(secs[i].content, spec);
    if (hl.length !== splitSentences(secs[i].content).length) throw new Error(`${id} section ${i}: spec "${spec}" leaves a sentence untagged`);
    return hl;
  });
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`[seedTask1DanielSamples] ${APPLY ? 'APPLY' : 'DRY RUN'}`);
  const sampleIds = new Set(SAMPLES.map(s => s.id));
  for (const id of Object.keys(SPECS)) if (sampleIds.has(id)) throw new Error(`${id} is in both SAMPLES and SPECS`);

  const ids = [...new Set([...SAMPLES.map(s => s.id), ...ANALYSES.map(a => a.id), ...TEXT_FIXES.map(f => f.id), ...Object.keys(SPECS)])];
  const n = { fixes: 0, samples: 0, analyses: 0, highlighted: 0, skipped: 0 };

  for (const id of ids) {
    const doc = await WritingTask1.findById(id).select('prompt sampleSections analysisSections').lean();
    if (!doc) { console.log(`MISS  ${id} — no such WritingTask1`); n.skipped++; continue; }
    const sample = (doc.sampleSections || []).map(s => ({ ...s }));
    const analysis = (doc.analysisSections || []).map(s => ({ ...s }));
    const top = { prompt: doc.prompt };
    const $set = {};
    const notes = [];

    // 1. text fixes
    for (const f of TEXT_FIXES.filter(x => x.id === id)) {
      if (f.field === 'prompt') {
        if (!top.prompt.includes(f.from)) { notes.push('fix skipped (prompt no longer has the text)'); continue; }
        top.prompt = top.prompt.replace(f.from, f.to);
        $set.prompt = top.prompt;
        notes.push('fix prompt');
        n.fixes++;
        continue;
      }
      const arr = f.field === 'sampleSections' ? sample : analysis;
      const key = f.key || 'content';
      const sec = arr[f.index];
      if (!sec || !String(sec[key] || '').includes(f.from)) { notes.push(`fix skipped (${f.field}[${f.index}].${key} no longer has the text)`); continue; }
      sec[key] = sec[key].replace(f.from, f.to);
      $set[`${f.field}.${f.index}.${key}`] = sec[key];
      notes.push(`fix ${f.field}[${f.index}].${key}`);
      n.fixes++;
    }
    const label = top.prompt.replace(/\s+/g, ' ').slice(0, 55);

    // 2./4. sample + highlights
    const entry = SAMPLES.find(s => s.id === id);
    if (entry) {
      const built = buildSample(entry, sample);
      const same = sample.length === 4 && sample.every((s, i) => norm(s.content) === norm(built[i].content));
      const stale = entry.replaces && complete(sample) && norm(sample[2].content).startsWith(entry.replaces);
      if (same) {
        // already ours — refresh the colours only
        built.forEach((s, i) => { $set[`sampleSections.${i}.highlights`] = s.highlights; });
        n.highlighted++;
      } else if (!complete(sample) || stale) {
        $set.sampleSections = built;
        // a sampleSections.N.* fix is superseded by the full write
        Object.keys($set).filter(k => k.startsWith('sampleSections.')).forEach(k => delete $set[k]);
        const total = built.reduce((t, s) => t + words(s.content), 0);
        notes.push(`sample ${stale ? 'REWRITTEN (old one misread the chart)' : 'written'} (${total}w)${total < 150 ? ' ⚠ under 150 words' : ''}`);
        n.samples++; n.highlighted++;
      } else {
        notes.push('⚠ sample differs from the data file (edited in admin?) — kept, not highlighted');
        n.skipped++;
      }
    } else if (SPECS[id]) {
      if (!complete(sample)) { notes.push('no complete sample to highlight'); n.skipped++; }
      else {
        specHighlights(id, sample).forEach((hl, i) => { $set[`sampleSections.${i}.highlights`] = hl; });
        n.highlighted++;
      }
    }

    // 3. analysis
    const a = ANALYSES.find(x => x.id === id);
    if (a) {
      const isGeneric = analysis.length && analysis[0].title === GENERIC_ANALYSIS;
      if (!hasText(analysis) || (a.replaceGeneric && isGeneric)) {
        $set.analysisSections = a.sections;
        Object.keys($set).filter(k => k.startsWith('analysisSections.')).forEach(k => delete $set[k]);
        notes.push(hasText(analysis) ? 'analysis replaced (was generic)' : 'analysis added');
        n.analyses++;
      } else notes.push('analysis already present — kept');
    }

    console.log(`${APPLY ? 'WRITE' : 'PLAN '} ${id} · ${label}…\n      ${notes.join(' · ') || 'highlights'}`);
    if (APPLY && Object.keys($set).length) await WritingTask1.updateOne({ _id: doc._id }, { $set });
  }

  // Active prompts that would still show a sample with no colours / no analysis.
  const active = await WritingTask1.find({ isActive: true }).select('prompt sampleSections analysisSections').lean();
  const gaps = active.filter(d => !sampleIds.has(String(d._id)) && !SPECS[String(d._id)]);
  console.log(`\nfixes ${n.fixes} · samples ${n.samples} · analyses ${n.analyses} · highlighted ${n.highlighted} · skipped ${n.skipped}`);
  if (gaps.length) {
    console.log(`Active Task 1 prompts not covered by the data file (${gaps.length}):`);
    gaps.forEach(d => console.log(`   ${d._id} · sample:${hasText(d.sampleSections) ? 'y' : 'NO'} analysis:${hasText(d.analysisSections) ? 'y' : 'NO'} · ${d.prompt.replace(/\s+/g, ' ').slice(0, 60)}`));
  }
  if (!APPLY) console.log('\nRe-run with --apply to write.');
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
