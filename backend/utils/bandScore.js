'use strict';

// Official IELTS raw-score-to-band conversion tables (Academic Reading and
// Listening, Academic + General Training both use this same table for
// Listening; Reading here matches the standard published conversion chart,
// which uses identical thresholds to Listening).
const TABLES = {
  listening: [
    [39, 9.0], [37, 8.5], [35, 8.0], [33, 7.5], [30, 7.0], [27, 6.5],
    [23, 6.0], [20, 5.5], [16, 5.0], [13, 4.5], [10, 4.0], [7, 3.5],
    [5, 3.0], [3, 2.5],
  ],
  reading: [
    [39, 9.0], [37, 8.5], [35, 8.0], [33, 7.5], [30, 7.0], [27, 6.5],
    [23, 6.0], [20, 5.5], [16, 5.0], [13, 4.5], [10, 4.0], [7, 3.5],
    [5, 3.0], [3, 2.5],
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
