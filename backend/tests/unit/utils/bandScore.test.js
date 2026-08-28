// Unit tests for utils/bandScore.js — bandScoreTable(skill, correctCount),
// the published British Council/IDP raw-score-to-band conversion.
//
// BUG-A08: Reading used to reuse Listening's table. They're now separate,
// each matching IDP's own published chart. Anchor points below are quoted
// from ieltsidpindia.com (2026): Reading 15→5 / 23→6 / 30→7 / 35→8 (+ IDP
// "29 correct = 6.5"); Listening 32-34→7.5 / 30-31→7 / 26-29→6.5 /
// 23-25→6 / 18-22→5.5 / 16-17→5 / 13-15→4.5 / 11-12→4.
const { bandScoreTable } = require('../../../utils/bandScore');

describe('bandScoreTable - listening (IDP published chart)', () => {
  test.each([
    [40, 9.0], [39, 9.0], [38, 8.5], [36, 8.0], [35, 8.0],
    [34, 7.5], [32, 7.5], [31, 7.0], [30, 7.0],
    [29, 6.5], [26, 6.5], [25, 6.0], [23, 6.0],
    [22, 5.5], [18, 5.5], [17, 5.0], [16, 5.0],
    [15, 4.5], [13, 4.5], [12, 4.0], [11, 4.0],
  ])('%i correct -> band %f', (correct, band) => {
    expect(bandScoreTable('listening', correct)).toBe(band);
  });

  test('one below a threshold falls to the next band down (31 -> 7.0, 32 -> 7.5)', () => {
    expect(bandScoreTable('listening', 31)).toBe(7.0);
    expect(bandScoreTable('listening', 32)).toBe(7.5);
  });

  test('0 / 2 correct -> floor 2.0', () => {
    expect(bandScoreTable('listening', 0)).toBe(2.0);
    expect(bandScoreTable('listening', 2)).toBe(2.0);
  });
});

describe('bandScoreTable - academic reading (IDP published chart)', () => {
  test.each([
    [40, 9.0], [39, 9.0], [38, 8.5], [37, 8.5], [35, 8.0],
    [34, 7.5], [33, 7.5], [32, 7.0], [30, 7.0],
    [29, 6.5], [27, 6.5], [26, 6.0], [23, 6.0],
    [22, 5.5], [19, 5.5], [18, 5.0], [15, 5.0],
    [14, 4.5], [13, 4.5], [12, 4.0], [10, 4.0],
  ])('%i correct -> band %f', (correct, band) => {
    expect(bandScoreTable('reading', correct)).toBe(band);
  });

  // The four IDP-quoted anchor points, called out explicitly.
  test('IDP anchor points: 15->5, 23->6, 30->7, 35->8, and 29->6.5', () => {
    expect(bandScoreTable('reading', 15)).toBe(5.0);
    expect(bandScoreTable('reading', 23)).toBe(6.0);
    expect(bandScoreTable('reading', 30)).toBe(7.0);
    expect(bandScoreTable('reading', 35)).toBe(8.0);
    expect(bandScoreTable('reading', 29)).toBe(6.5);
  });

  test('0 / 2 correct -> floor 1.0', () => {
    expect(bandScoreTable('reading', 0)).toBe(1.0);
    expect(bandScoreTable('reading', 2)).toBe(1.0);
  });
});

describe('reading and listening are now DIFFERENT charts', () => {
  // Raw scores where the two IDP charts genuinely diverge — a regression
  // guard so the tables can't silently be re-merged.
  test.each([
    [10, /* reading */ 4.0, /* listening */ 3.5],
    [15, 5.0, 4.5],
    [18, 5.0, 5.5],
    [26, 6.0, 6.5],
    [32, 7.0, 7.5],
  ])('%i correct: reading %f vs listening %f', (correct, r, l) => {
    expect(bandScoreTable('reading', correct)).toBe(r);
    expect(bandScoreTable('listening', correct)).toBe(l);
  });

  test('they still agree where the charts agree (e.g. 40, 35, 30, 23)', () => {
    for (const c of [40, 35, 30, 23]) {
      expect(bandScoreTable('reading', c)).toBe(bandScoreTable('listening', c));
    }
  });
});
