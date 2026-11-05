/**
 * seedWritingTask1RealTests2026.js — 25 new Writing Task 1 prompts, five per
 * "Dạng đề" group (static / dynamic / mixed / process / map). All are real
 * exam questions (2025–2026) analysed by ZIM Academy (zim.vn).
 *
 * Each task gets:
 *   · the exam chart, uploaded to R2 (writing-tasks/) from scripts/data/task1Images/<slug>.*
 *   · chartData — exact figures for the AI grader (read off the chart)
 *   · sampleSections — ZIM's model answer (scripts/data/task1RealTests2026/samples.js),
 *     with colour-coded sentence roles (auto-tagged, see specFor below)
 *   · analysisSections — a Vietnamese "Phân tích đề" guide written for this site,
 *     ending with a "5. Nguồn bài mẫu" credit section
 *
 * Tasks are matched by prompt text, so rerunning updates instead of duplicating.
 *
 * Usage (from backend/):
 *   node scripts/seedWritingTask1RealTests2026.js           # dry run
 *   node scripts/seedWritingTask1RealTests2026.js --apply
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const WritingTask1 = require('../models/WritingTask1');
const mediaStore = require('../services/mediaStore');
const { highlightsFromSpec, splitSentences } = require('./data/task2SampleHighlights');

const APPLY = process.argv.includes('--apply');
const VERBOSE = process.argv.includes('--verbose');
const DATA_DIR = path.join(__dirname, 'data', 'task1RealTests2026');
const IMG_DIR = path.join(__dirname, 'data', 'task1Images');
const OUR_MEDIA = /^https:\/\/media\.ieltsthayha\.com\//;

const SAMPLES = require(path.join(DATA_DIR, 'samples.js'));
const TASKS = ['static', 'dynamic', 'mixed', 'process', 'map']
  .flatMap(type => require(path.join(DATA_DIR, `${type}.js`)).map(t => ({ ...t, chartType: type })));

// Sentence roles for a sample section (spec letters: Q paraphrase,
// O overview, T topic, D detail, C compare). Introduction → all Q,
// Overview → all O. Body: the first sentence is the topic sentence (except
// in process essays, where every body sentence is a step), sentences that
// compare two things are C, the rest D. A task can override a section with
// `specs: { 'Body 2': 'T0 D1-3' }`.
const COMPARE = /\b(whereas|while|by contrast|in contrast|conversely|compared (with|to)|on the other hand|similarly|likewise|in a similar vein|the same|opposite|than)\b/i;
function specFor(task, title, content) {
  if (task.specs && task.specs[title]) return task.specs[title];
  const n = splitSentences(content).length;
  const all = l => `${l}0${n > 1 ? `-${n - 1}` : ''}`;
  if (title === 'Introduction') return all('Q');
  if (title === 'Overview') return all('O');
  if (task.chartType === 'process') return all('D');
  return splitSentences(content).map((s, i) => {
    if (i === 0) return `T${i}`;
    return `${COMPARE.test(s) ? 'C' : 'D'}${i}`;
  }).join(' ');
}

function buildSample(task) {
  const rows = SAMPLES[task.slug];
  if (!rows) throw new Error(`no sample for ${task.slug}`);
  return rows.map(([title, content]) => {
    const spec = specFor(task, title, content);
    const highlights = highlightsFromSpec(content, spec);
    const n = splitSentences(content).length;
    if (highlights.length !== n) throw new Error(`${task.slug} "${title}": spec "${spec}" tags ${highlights.length} of ${n} sentences`);
    return { title, content, highlights };
  });
}

function imageFile(slug) {
  const f = fs.readdirSync(IMG_DIR).find(x => x.replace(/\.[^.]+$/, '') === slug);
  if (!f) throw new Error(`no image for ${slug} in ${IMG_DIR}`);
  return f;
}

async function uploadImage(file) {
  const buf = fs.readFileSync(path.join(IMG_DIR, file));
  const mime = file.endsWith('.webp') ? 'image/webp' : file.endsWith('.png') ? 'image/png' : 'image/jpeg';
  if (!APPLY) return `(dry run) R2 upload of ${file}`;
  return (await mediaStore.uploadImage(`data:${mime};base64,${buf.toString('base64')}`, 'writing-tasks')).url;
}

const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function run() {
  // Validate everything before touching the database.
  const prepared = TASKS.map(t => {
    if (!t.prompt || !t.chartData || !t.analysis || !t.source) throw new Error(`${t.slug}: missing field`);
    return {
      t,
      image: imageFile(t.slug),
      sampleSections: buildSample(t),
      analysisSections: [...t.analysis, ['5. Nguồn bài mẫu', t.source]].map(([title, content]) => ({ title, content })),
    };
  });
  const counts = prepared.reduce((m, p) => ({ ...m, [p.t.chartType]: (m[p.t.chartType] || 0) + 1 }), {});
  console.log(`[seedWritingTask1RealTests2026] ${APPLY ? 'APPLY' : 'DRY RUN'} — ${prepared.length} tasks`, counts);

  await mongoose.connect(process.env.MONGO_URI);
  for (const { t, image, sampleSections, analysisSections } of prepared) {
    // Match on the first sentence of the prompt (the question itself).
    const firstSentence = t.prompt.split(/(?<=\.)\s/)[0];
    const doc = await WritingTask1.findOne({ prompt: new RegExp('^' + escapeRe(firstSentence)) }).lean();
    const $set = {
      prompt: t.prompt, chartType: t.chartType, chartData: t.chartData,
      sampleSections, analysisSections, isActive: true,
    };
    if (!doc || !OUR_MEDIA.test(doc.imageUrl || '')) $set.imageUrl = await uploadImage(image);

    const words = sampleSections.map(s => s.content).join(' ').split(/\s+/).length;
    console.log(`${doc ? 'UPDATE ' + doc._id : 'CREATE'}  ${t.chartType.padEnd(7)} ${t.slug.padEnd(38)} sample ${words}w`);
    if (VERBOSE) sampleSections.forEach(s => console.log(`    ${s.title.padEnd(12)} ${s.highlights.map(h => h.role[0]).join('')}`));
    if (!APPLY) continue;
    if (doc) await WritingTask1.updateOne({ _id: doc._id }, { $set });
    else await WritingTask1.create($set);
  }
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
