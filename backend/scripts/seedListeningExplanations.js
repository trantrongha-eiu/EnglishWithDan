'use strict';

/**
 * Fills in the `explanation` field for Listening questions, section by
 * section, grounded in that section's own (human-verified) `transcript`.
 * This is a large, ongoing content backfill — see chat log 2026-09-11:
 * 135 of 158 ListeningSection docs have a real transcript but ZERO
 * per-question explanations (only `correctAnswer` was ever set); the other
 * 23 have no transcript yet (waiting on the user to upload real audio) and
 * are deliberately left out of this pipeline until they do.
 *
 * Data lives in scripts/data/listeningExplanations/*.js — one small batch
 * file per work session, each exporting an array of:
 *   { sectionId, title (sanity label only), explanations: [{ questionNumber, explanation }] }
 * All batch files are merged and applied here so progress accumulates
 * across many runs ("seed từ từ") without one giant data file.
 *
 * Idempotent + scoped: looks up each question by questionNumber inside the
 * section's own questionGroups (same shape Passage/ListeningSection already
 * use), sets only `explanation`, does not touch anything else. Skips (with
 * a warning) any sectionId/questionNumber it can't find rather than
 * failing the whole batch, so an ID typo in the middle of a big JS array
 * doesn't lose everything else already committed.
 *
 * Run: node backend/scripts/seedListeningExplanations.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data', 'listeningExplanations');

function loadBatches() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.js')).sort();
  let all = [];
  for (const f of files) {
    const batch = require(path.join(DATA_DIR, f));
    all = all.concat(batch);
  }
  return all;
}

async function run() {
  const ListeningSection = require('../models/ListeningSection');
  const batches = loadBatches();
  console.log(`[ListeningExplanations] ${batches.length} section entries across all batch files`);

  let sectionsTouched = 0, questionsSet = 0, sectionsNotFound = 0, questionsNotFound = 0;

  for (const entry of batches) {
    const section = await ListeningSection.findById(entry.sectionId);
    if (!section) {
      console.warn(`  [MISSING SECTION] ${entry.sectionId} ("${entry.title || ''}")`);
      sectionsNotFound++;
      continue;
    }
    const byNumber = new Map();
    (section.questionGroups || []).forEach(g => (g.questions || []).forEach(q => byNumber.set(q.questionNumber, q)));

    let touchedThis = 0;
    for (const { questionNumber, explanation } of entry.explanations) {
      const q = byNumber.get(questionNumber);
      if (!q) {
        console.warn(`  [MISSING Q${questionNumber}] in "${section.title}" (${entry.sectionId})`);
        questionsNotFound++;
        continue;
      }
      q.explanation = explanation;
      touchedThis++;
      questionsSet++;
    }
    if (touchedThis) {
      section.markModified('questionGroups');
      await section.save();
      sectionsTouched++;
    }
  }

  console.log(`[ListeningExplanations] sections updated: ${sectionsTouched} | questions set: ${questionsSet}`);
  if (sectionsNotFound || questionsNotFound) {
    console.log(`[ListeningExplanations] WARNING: ${sectionsNotFound} section(s) not found, ${questionsNotFound} question(s) not found — check batch data above.`);
  }
}

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await run();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[ListeningExplanations] FAILED', e); process.exit(1); });
}

module.exports = { run };
