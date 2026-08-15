// utils/bandScore.js's Reading/Listening conversion tables had several wrong
// thresholds (didn't match the official published band-score chart) and
// services/listeningService.js additionally carried its own copy-pasted,
// equally-wrong table used for every full Listening test submission. Both
// were corrected in the same change that adds this script. This one-off
// migration recomputes bandScore for every already-completed TestAttempt
// (Reading) and ListeningAttempt (Listening) from their stored correctCount,
// so historical results — and the averages/admin views built on top of them
// — match the corrected table too, not just attempts submitted after the fix.
// Only the bandScore field is touched; correctCount/answers are untouched.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const TestAttempt = require('../models/TestAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const { bandScoreTable } = require('../utils/bandScore');

async function run() {
  const readingAttempts = await TestAttempt.find({ status: 'completed' }, 'correctCount bandScore');
  let readingFixed = 0;
  for (const a of readingAttempts) {
    const correct = bandScoreTable('reading', a.correctCount);
    if (correct !== a.bandScore) {
      console.log(`[fixHistoricalBandScores] TestAttempt ${a._id}: correctCount=${a.correctCount} bandScore ${a.bandScore} -> ${correct}`);
      a.bandScore = correct;
      await a.save();
      readingFixed++;
    }
  }

  const listeningAttempts = await ListeningAttempt.find({ status: 'completed' }, 'correctCount bandScore');
  let listeningFixed = 0;
  for (const a of listeningAttempts) {
    const correct = bandScoreTable('listening', a.correctCount);
    if (correct !== a.bandScore) {
      console.log(`[fixHistoricalBandScores] ListeningAttempt ${a._id}: correctCount=${a.correctCount} bandScore ${a.bandScore} -> ${correct}`);
      a.bandScore = correct;
      await a.save();
      listeningFixed++;
    }
  }

  console.log(`\n[fixHistoricalBandScores] Done. reading fixed=${readingFixed}/${readingAttempts.length}, listening fixed=${listeningFixed}/${listeningAttempts.length}`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await run();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[fixHistoricalBandScores] FAILED', e); process.exit(1); });
}

module.exports = { run };
