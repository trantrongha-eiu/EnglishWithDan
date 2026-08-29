/**
 * seedWritingTask2Samples.js — fill in the missing "Phân tích đề"
 * (analysisSections) and "Bài mẫu từ Daniel" (sampleSections) on WritingTask2
 * docs, so every weekly Task 2 topic has a prompt analysis + a model essay.
 *
 * Each essay is generated to FOLLOW the Band 7+ cloze template for its essay
 * type (the same 7 skeletons students practise at
 * task2-template.html → "Band 7+"), targets IELTS Band 7.5+, and is written
 * in natural, human-like academic English (see geminiService.buildTask2EssayPrompt
 * for the exact rules / anti-AI-tell bans).
 *
 * Two engines:
 *   --engine groq    (default) — uses Groq (openai/gpt-oss-120b). No ~20/day
 *                     cap, so a whole backfill can run in one pass. Needs
 *                     GROQ_API_KEY.
 *   --engine gemini  — uses Gemini 2.5 Flash. Higher ceiling on quality but
 *                     the free tier is ~20 requests/day on this project's key,
 *                     so use --limit for daily batches.
 *
 * Selection: WritingTask2 docs (isActive) where analysisSections OR
 * sampleSections is empty. ONLY fills the empty field(s) — never overwrites
 * content already there. Scoped updateOne({_id}) per doc.
 *
 * Essay type comes from the linked Task2Topic (Task2Topic.writingTask2Id →
 * essayType). If nothing links to the doc, a light keyword heuristic on the
 * prompt is used, defaulting to 'agree_disagree'.
 *
 * An overload / rate-limit error stops the run cleanly; re-run later to
 * continue (it only fills still-empty docs).
 *
 * Usage:
 *   node backend/scripts/seedWritingTask2Samples.js                       # dry run — list what it WOULD do
 *   node backend/scripts/seedWritingTask2Samples.js --apply               # Groq, all missing
 *   node backend/scripts/seedWritingTask2Samples.js --apply --verify      # grade each essay, regen once if band < 7.0
 *   node backend/scripts/seedWritingTask2Samples.js --apply --engine gemini --limit 15
 *   node backend/scripts/seedWritingTask2Samples.js --apply --delay 2500
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const WritingTask2 = require('../models/WritingTask2');
const Task2Topic = require('../models/Task2Topic');
const Task2Template = require('../models/Task2Template');
const { generateTask2Essay, gradeTask2Band } = require('../services/geminiService');
const { generateTask2EssayGroq, gradeTask2BandGroq } = require('../services/groqService');

// Band 7+ template typeId → Task2Topic.essayType + a human label.
const TYPE_MAP = {
  type01: { essayType: 'advantages_disadvantages',          label: 'Advantages & Disadvantages' },
  type02: { essayType: 'discuss_both_views',                label: 'Discuss Both Views' },
  type03: { essayType: 'cause_solution',                    label: 'Cause – Solution' },
  type04: { essayType: 'effect_solution',                   label: 'Effect – Solution' },
  type05: { essayType: 'cause_effect',                      label: 'Cause – Effect' },
  type06: { essayType: 'agree_disagree',                    label: 'Agree / Disagree' },
  type07: { essayType: 'positive_or_negative_development',  label: 'Positive or Negative Development' },
};
const LABEL_BY_ESSAYTYPE = Object.fromEntries(
  Object.values(TYPE_MAP).map(v => [v.essayType, v.label])
);

function parseArgs(argv) {
  const a = { apply: false, verify: false, engine: 'groq', limit: Infinity, delay: 2500 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--apply') a.apply = true;
    else if (argv[i] === '--verify') a.verify = true;
    else if (argv[i] === '--engine') a.engine = (argv[++i] || 'groq').toLowerCase();
    else if (argv[i] === '--limit') a.limit = parseInt(argv[++i], 10) || Infinity;
    else if (argv[i] === '--delay') a.delay = parseInt(argv[++i], 10) || 2500;
  }
  if (!['groq', 'gemini'].includes(a.engine)) a.engine = 'groq';
  return a;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Very light fallback classifier — only used when no Task2Topic links to the
// WritingTask2 doc, so we still pick a sensible template.
function inferEssayType(prompt) {
  const p = (prompt || '').toLowerCase();
  if (/discuss both views|discuss both these views|and give your own opinion/.test(p)) return 'discuss_both_views';
  if (/advantages and disadvantages|advantages outweigh|benefits and drawbacks/.test(p)) return 'advantages_disadvantages';
  if (/positive or negative development|positive or a negative/.test(p)) return 'positive_or_negative_development';
  if (/what (can be done|solutions|measures)|how (can|could) this (problem|issue) be (solved|addressed)/.test(p)) {
    return /effects? of|impact of|consequenc/.test(p) ? 'effect_solution' : 'cause_solution';
  }
  if (/why .*\?.*(effect|impact|result)|reasons for this|causes? of this/.test(p)) return 'cause_effect';
  return 'agree_disagree';
}

// Render a band7 template into a compact "MOVE: sentence frame" skeleton.
function renderSkeleton(tpl) {
  return (tpl.sections || []).map(sec => {
    const lines = (sec.items || []).map(it => '  - ' + (it.en || '').trim()).filter(l => l.length > 4);
    return sec.title + '\n' + lines.join('\n');
  }).join('\n\n');
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const generate = args.engine === 'gemini' ? generateTask2Essay : generateTask2EssayGroq;
  const gradeBand = args.engine === 'gemini' ? gradeTask2Band : gradeTask2BandGroq;

  await mongoose.connect(process.env.MONGO_URI);

  // 1. Band 7+ template skeletons, keyed by essayType.
  const band7 = await Task2Template.find({ level: 'band7', isActive: true }).lean();
  const skeletonByType = {};
  for (const tpl of band7) {
    const m = TYPE_MAP[tpl.typeId];
    if (m) skeletonByType[m.essayType] = renderSkeleton(tpl);
  }
  const haveTemplates = Object.keys(skeletonByType).length;
  console.log(`[seedWritingTask2Samples] engine=${args.engine} · loaded ${haveTemplates}/7 Band 7+ template skeletons`);
  if (!haveTemplates) {
    console.error('No band7 Task2Template docs found — seed those first. Aborting.');
    await mongoose.disconnect();
    process.exit(1);
  }

  // 2. Candidates: missing analysis OR sample.
  const emptyOr = f => ({ $or: [{ [f]: { $exists: false } }, { [f]: { $size: 0 } }] });
  const candidates = await WritingTask2.find({
    isActive: true,
    $or: [emptyOr('analysisSections'), emptyOr('sampleSections')],
  }).lean();

  if (!candidates.length) {
    console.log('Nothing to do — every active WritingTask2 already has analysis + sample.');
    await mongoose.disconnect();
    return;
  }

  // 3. essayType per doc, from whichever Task2Topic links to it.
  const ids = candidates.map(c => c._id);
  const topics = await Task2Topic.find({ writingTask2Id: { $in: ids } })
    .select('writingTask2Id essayType').lean();
  const typeByWt2 = new Map(topics.map(t => [String(t.writingTask2Id), t.essayType]));

  const todo = candidates.slice(0, args.limit);
  console.log(`${candidates.length} doc(s) need content; ${args.apply ? 'processing' : 'DRY RUN for'} ${todo.length} this run.` +
    (args.verify ? ' (--verify: essays graded, regenerated once if band < 7.0)' : ''));

  let ok = 0, failed = 0, regen = 0;
  for (const [i, doc] of todo.entries()) {
    const linkedType = typeByWt2.get(String(doc._id));
    const essayType = linkedType || inferEssayType(doc.prompt);
    const label = LABEL_BY_ESSAYTYPE[essayType] || 'Agree / Disagree';
    const skeleton = skeletonByType[essayType] || skeletonByType['agree_disagree'];
    const needAnalysis = !(doc.analysisSections && doc.analysisSections.length);
    const needSample = !(doc.sampleSections && doc.sampleSections.length);
    const tag = `[${i + 1}/${todo.length}] ${label}${linkedType ? '' : ' (inferred)'} · "${doc.prompt.slice(0, 62)}..."`;

    if (!args.apply) {
      console.log(`PLAN  ${tag}  → ${[needAnalysis && 'analysis', needSample && 'sample'].filter(Boolean).join(' + ')}`);
      continue;
    }

    try {
      let { sampleSections, analysisSections } = await generate(doc.prompt, label, skeleton);

      if (args.verify && needSample) {
        const essayText = sampleSections.map(s => s.content).join('\n\n');
        const band = await gradeBand(doc.prompt, essayText);
        if (typeof band === 'number' && band < 7.0) {
          console.log(`      ↳ graded ${band} (<7.0) — regenerating once`);
          regen++;
          const retry = await generate(doc.prompt, label, skeleton);
          sampleSections = retry.sampleSections;
          analysisSections = retry.analysisSections;
        } else if (typeof band === 'number') {
          console.log(`      ↳ graded ${band} ✓`);
        } else {
          console.log('      ↳ verify skipped (grader unavailable)');
        }
      }

      const $set = {};
      if (needAnalysis) $set.analysisSections = analysisSections;
      if (needSample) $set.sampleSections = sampleSections;
      await WritingTask2.updateOne({ _id: doc._id }, { $set });
      ok++;
      console.log(`OK    ${tag}`);
    } catch (err) {
      failed++;
      console.error(`FAIL  ${tag}\n      ${err.message}`);
      if (err.isOverloaded || /rate.?limit|429|quota|resource_exhausted/i.test(err.message)) {
        console.error('[seedWritingTask2Samples] AI overloaded / rate-limited — stopping. Re-run later to continue.');
        break;
      }
    }
    if (i < todo.length - 1) await sleep(args.delay);
  }

  console.log(`\n${args.apply ? 'Done' : 'Dry run'} — ok: ${ok}, failed: ${failed}` +
    (regen ? `, regenerated: ${regen}` : '') +
    `, still missing after this run: ${Math.max(0, candidates.length - ok)}`);
  if (!args.apply) console.log('Re-run with --apply to generate + write.');
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
