// Bulk gap-fill generation for Listening "bài lẻ" (ListeningSection docs) —
// turns each section's existing, human-verified transcript into a full-
// transcript fill-in-the-blank drill via Gemini (geminiService.generateGapFillBlanks),
// which itself validates that the generated blanks reconstruct the ORIGINAL
// transcript exactly before returning (never trusts the AI not to alter
// wording). This script only writes gapFillTemplate/gapFillAnswers — it
// NEVER sets gapFillPublished:true, since generated content must always go
// through admin review (ListeningSectionEdit.jsx's Gap-fill card) before any
// student can see it.
//
// Safe to re-run: the default filter only picks up sections that don't have
// gap-fill content yet and weren't already marked skipped, mirroring
// scripts/bulkAlignListeningDictation.js's resumability.
//
// Usage:
//   node backend/scripts/generateListeningGapFill.js                  # untried sections only
//   node backend/scripts/generateListeningGapFill.js --limit 20        # cap this run
//   node backend/scripts/generateListeningGapFill.js --include-skipped # also retry sections that previously failed generation/validation
//   node backend/scripts/generateListeningGapFill.js --force           # regenerate EVERYTHING, including sections that already have gap-fill content
//   node backend/scripts/generateListeningGapFill.js --delay 2000      # ms between sections (default 2000, Gemini rate limits)
//   node backend/scripts/generateListeningGapFill.js --ids id1,id2     # regenerate ONLY these specific _ids (always force-mode for exactly this set)
'use strict';

require('dotenv').config();

function parseArgs(argv) {
  const args = { limit: Infinity, force: false, delay: 2000, includeSkipped: false, ids: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit') args.limit = parseInt(argv[++i], 10) || Infinity;
    else if (argv[i] === '--force') args.force = true;
    else if (argv[i] === '--delay') args.delay = parseInt(argv[++i], 10) || 2000;
    else if (argv[i] === '--include-skipped') args.includeSkipped = true;
    else if (argv[i] === '--ids') args.ids = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
  }
  return args;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function run() {
  const mongoose = require('mongoose');
  const ListeningSection = require('../models/ListeningSection');
  const geminiService = require('../services/geminiService');

  const args = parseArgs(process.argv.slice(2));

  await mongoose.connect(process.env.MONGO_URI);

  const filter = { isActive: true, transcript: { $ne: '' } };
  if (args.ids) {
    const validIds = [];
    for (const id of args.ids) {
      try { validIds.push(new mongoose.Types.ObjectId(id)); }
      catch (err) { console.error(`[gapfill] Skipping invalid --ids entry "${id}": ${err.message}`); }
    }
    filter._id = { $in: validIds };
  } else if (!args.force) {
    filter.$or = [{ gapFillTemplate: { $exists: false } }, { gapFillTemplate: '' }];
    if (!args.includeSkipped) filter.gapFillSkippedAt = null;
  }

  const totalMissing = await ListeningSection.countDocuments(filter);
  const sections = await ListeningSection.find(filter).select('title transcript').limit(args.limit).lean();

  console.log(`[gapfill] ${totalMissing} section(s) need gap-fill generation; processing ${sections.length} this run.`);

  let ok = 0, failed = 0, flaggedCount = 0;
  const failedList = [];
  const flaggedList = [];
  for (const [i, section] of sections.entries()) {
    const tag = `[${i + 1}/${sections.length}] "${section.title}"`;
    try {
      const { template, answers, flaggedNames } = await geminiService.generateGapFillBlanks(section.transcript);
      await ListeningSection.updateOne(
        { _id: section._id },
        { $set: {
            gapFillTemplate: template,
            gapFillAnswers: answers,
            gapFillGeneratedAt: new Date(),
            gapFillPublished: false, // always needs admin review before publish
            gapFillSkippedAt: null,
            gapFillSkipReason: '',
          }
        }
      );
      if (flaggedNames && flaggedNames.length) {
        flaggedCount++;
        flaggedList.push({ title: section.title, id: String(section._id), names: flaggedNames, blanks: answers.length });
        console.log(`${tag} OK — ${answers.length} blank(s), but ${flaggedNames.length} still look like a name/place after retries: ${flaggedNames.join(', ')} (needs manual review before publish)`);
      } else {
        console.log(`${tag} OK — ${answers.length} blank(s) generated (chưa publish, cần admin duyệt)`);
      }
      ok++;
    } catch (err) {
      if (err.isOverloaded) {
        console.error(`${tag} STOPPED — Gemini quota/overload hit. Re-run this script later to pick up where it left off.`);
        break;
      }
      failed++;
      failedList.push({ title: section.title, reason: err.message });
      console.error(`${tag} FAIL: ${err.message}`);
      await ListeningSection.updateOne(
        { _id: section._id },
        { $set: { gapFillSkippedAt: new Date(), gapFillSkipReason: `error: ${err.message}`.slice(0, 500) } }
      ).catch(() => {});
    }
    if (i < sections.length - 1) await sleep(args.delay);
  }

  console.log(`\n[gapfill] Done. ${ok} generated, ${failed} failed, ${totalMissing - ok - failed} still pending.`);
  if (failedList.length) {
    console.log(`[gapfill] ${failedList.length} section(s) failed — marked skipped, won't be retried by default (use --include-skipped or --force):`);
    failedList.forEach(r => console.log(`  - "${r.title}": ${r.reason}`));
  }
  if (flaggedList.length) {
    console.log(`[gapfill] ${flaggedCount} section(s) still have a suspected person/place-name answer after the built-in retries — review manually before publishing:`);
    flaggedList.forEach(r => console.log(`  - "${r.title}" (${r.id}): ${r.names.join(', ')}`));
  }

  await mongoose.disconnect();
}

run().catch(e => { console.error('[gapfill] FAILED', e); process.exit(1); });
