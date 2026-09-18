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

// IELTS Entrance Test ("Test đầu vào") internal placement scales — NOT an
// official IELTS conversion table. The entrance test's sections are much
// shorter than a real 40-question paper (25 Grammar / 13 Reading / 10
// Listening), so the tables above (calibrated to a 40-question raw score)
// can't be reused as-is. These thresholds come directly from the product
// spec for the entrance test and exist only to produce a rough internal
// placement band, displayed to students as "Estimated Entrance Level" /
// "EnglishWithDan Placement Band" — never as an official IELTS band.
const ENTRANCE_TABLES = {
  grammar: [
    [23, 7.0], [22, 6.5], [21, 6.0], [20, 5.5], [18, 5.0], [16, 4.5],
    [14, 4.0], [12, 3.5], [10, 3.0], [8, 2.5], [6, 2.0], [4, 1.5], [0, 1.0],
  ],
  reading13: [
    [13, 7.0], [12, 6.5], [11, 6.0], [10, 5.5], [9, 5.0], [8, 4.5],
    [7, 4.0], [6, 3.5], [5, 3.0], [4, 2.5], [3, 2.0], [0, 1.0],
  ],
  listening10: [
    [10, 7.0], [9, 6.5], [8, 5.5], [7, 4.5], [6, 4.0], [5, 3.5],
    [4, 3.0], [3, 2.5], [2, 2.0], [0, 1.0],
  ],
};

function entranceBand(section, correctCount) {
  const table = ENTRANCE_TABLES[section];
  if (!table) throw new Error(`Unknown entrance-test section: ${section}`);
  for (const [minCorrect, band] of table) {
    if (correctCount >= minCorrect) return band;
  }
  return 1.0;
}

// IELTS-style nearest-half-band rounding (matches mockTestService's own
// roundOverall — duplicated here as a one-liner rather than importing across
// feature boundaries): 5.125→5.0, 5.25→5.5, 5.375→5.5, 5.625→5.5, 5.75→6.0.
function roundIeltsHalf(avg) {
  return Math.round(avg * 2) / 2;
}

module.exports = { bandScoreTable, entranceBand, roundIeltsHalf };
