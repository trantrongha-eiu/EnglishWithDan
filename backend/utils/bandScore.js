'use strict';

// Official IELTS raw-score-to-band conversion tables. Reading and Listening
// use the same 40-question format but different thresholds, so they stay as
// two explicit tables rather than one shared shape — this just removes the
// duplicated if/else ladder previously copy-pasted in both attempt models.
const TABLES = {
  listening: [
    [39, 9.0], [37, 8.5], [35, 8.0], [32, 7.5], [30, 7.0], [26, 6.5],
    [23, 6.0], [18, 5.5], [16, 5.0], [13, 4.5], [10, 4.0], [8, 3.5],
    [6, 3.0], [4, 2.5],
  ],
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
