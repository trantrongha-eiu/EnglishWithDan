// Unit tests for utils/bandScore.js — bandScoreTable(skill, correctCount),
// the official IELTS raw-score-to-band conversion. Reading and Listening
// use different thresholds despite both being 40-question tests, so this
// locks in the exact table values and the floor for very low scores.
const { bandScoreTable } = require('../../../utils/bandScore');

describe('bandScoreTable - listening', () => {
  test('39 correct -> 9.0 (top band)', () => {
    expect(bandScoreTable('listening', 39)).toBe(9.0);
  });

  test('32 correct -> 7.5 (listening-specific threshold)', () => {
    expect(bandScoreTable('listening', 32)).toBe(7.5);
  });

  test('31 correct (one below the 32 threshold) -> falls to next band 7.0', () => {
    expect(bandScoreTable('listening', 31)).toBe(7.0);
  });

  test('4 correct -> 2.5 (lowest explicit table entry)', () => {
    expect(bandScoreTable('listening', 4)).toBe(2.5);
  });

  test('0 correct -> floor 2.0', () => {
    expect(bandScoreTable('listening', 0)).toBe(2.0);
  });

  test('3 correct (below lowest table entry) -> floor 2.0', () => {
    expect(bandScoreTable('listening', 3)).toBe(2.0);
  });

  test('a score above the max table entry still returns the top band', () => {
    expect(bandScoreTable('listening', 40)).toBe(9.0);
  });
});

describe('bandScoreTable - reading', () => {
  test('39 correct -> 9.0 (top band)', () => {
    expect(bandScoreTable('reading', 39)).toBe(9.0);
  });

  test('33 correct -> 7.5 (reading-specific threshold, differs from listening\'s 32)', () => {
    expect(bandScoreTable('reading', 33)).toBe(7.5);
  });

  test('32 correct (one below the 33 threshold) -> falls to next band 7.0', () => {
    expect(bandScoreTable('reading', 32)).toBe(7.0);
  });

  test('4 correct -> 2.5 (lowest explicit table entry)', () => {
    expect(bandScoreTable('reading', 4)).toBe(2.5);
  });

  test('0 correct -> floor 1.0', () => {
    expect(bandScoreTable('reading', 0)).toBe(1.0);
  });

  test('3 correct (below lowest table entry) -> floor 1.0', () => {
    expect(bandScoreTable('reading', 3)).toBe(1.0);
  });
});

describe('bandScoreTable - listening vs reading divergence at the 7.5 boundary', () => {
  test('32 correct: listening=7.5 but reading=7.0 (different table thresholds)', () => {
    expect(bandScoreTable('listening', 32)).toBe(7.5);
    expect(bandScoreTable('reading', 32)).toBe(7.0);
  });
});
