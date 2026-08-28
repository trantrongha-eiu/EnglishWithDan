'use strict';

// Raw-score (out of 40) → IELTS band conversion for Listening and Academic
// Reading.
//
// These are the published British Council / IDP / Cambridge conversion
// charts used in every official practice-test answer key. IELTS equates the
// difficulty of each real test version, so the live exam can differ from
// these reference values by roughly ±0.5 near a boundary — the student-
// facing result screens now say so (see frontend/reading.html &
// listening.html result panels).
//
// BUG-A08: Reading previously reused Listening's table verbatim. They are
// genuinely different charts (Academic Reading is graded on a slightly
// different curve), so each skill now has its own. Anchor points verified
// against IDP's own published tables (ieltsidpindia.com, 2026):
//   Reading:   15→5, 23→6, 30→7, 35→8   (+ "29 correct = 6.5" per IDP)
//   Listening: 32-34→7.5, 30-31→7, 26-29→6.5, 23-25→6, 18-22→5.5,
//              16-17→5, 13-15→4.5, 11-12→4
// The <3.5 rows aren't published by IDP; they follow the standard chart
// used in the Cambridge practice books and are only reached by a near-zero
// score anyway.
//
// Historical attempts are NOT re-scored: TestAttempt/ListeningAttempt store
// `bandScore` at submit time and it's never recomputed, so this only
// affects submissions made after deploy. A student comparing an old attempt
// to a new one right at the 15-/19-correct Reading boundary may see a 0.5
// step that reflects the corrected table, not a regression.
const TABLES = {
  // IELTS Listening (Academic & General Training share this table).
  listening: [
    [39, 9.0], [37, 8.5], [35, 8.0], [32, 7.5], [30, 7.0], [26, 6.5],
    [23, 6.0], [18, 5.5], [16, 5.0], [13, 4.5], [11, 4.0], [8, 3.5],
    [6, 3.0], [4, 2.5],
  ],
  // IELTS Academic Reading.
  reading: [
    [39, 9.0], [37, 8.5], [35, 8.0], [33, 7.5], [30, 7.0], [27, 6.5],
    [23, 6.0], [19, 5.5], [15, 5.0], [13, 4.5], [10, 4.0], [8, 3.5],
    [6, 3.0], [4, 2.5],
  ],
};

const FLOOR = { listening: 2.0, reading: 1.0 };

function bandScoreTable(skill, correctCount) {
  const table = TABLES[skill];
  for (const [minCorrect, band] of table) {
    if (correctCount >= minCorrect) return band;
  }
  return FLOOR[skill];
}

module.exports = { bandScoreTable };
