// Unit tests for utils/bandScore.js — bandScoreTable(skill, correctCount),
// the official IELTS raw-score-to-band conversion. Reading and Listening
// share the same published conversion table (both are 40-question tests
// with identical thresholds), so this locks in the shared table values and
// the floor for very low scores.
const { bandScoreTable } = require('../../../utils/bandScore');

describe('bandScoreTable - listening', () => {
  test('39 correct -> 9.0 (top band)', () => {
    expect(bandScoreTable('listening', 39)).toBe(9.0);
  });

  test('33 correct -> 7.5', () => {
    expect(bandScoreTable('listening', 33)).toBe(7.5);
  });

  test('32 correct (one below the 33 threshold) -> falls to next band 7.0', () => {
    expect(bandScoreTable('listening', 32)).toBe(7.0);
  });

  test('3 correct -> 2.5 (lowest explicit table entry)', () => {
    expect(bandScoreTable('listening', 3)).toBe(2.5);
  });

  test('0 correct -> floor 2.0', () => {
    expect(bandScoreTable('listening', 0)).toBe(2.0);
  });

  test('2 correct (below lowest table entry) -> floor 2.0', () => {
    expect(bandScoreTable('listening', 2)).toBe(2.0);
  });

  test('a score above the max table entry still returns the top band', () => {
    expect(bandScoreTable('listening', 40)).toBe(9.0);
  });
});

describe('bandScoreTable - reading', () => {
  test('39 correct -> 9.0 (top band)', () => {
    expect(bandScoreTable('reading', 39)).toBe(9.0);
  });

  test('33 correct -> 7.5', () => {
    expect(bandScoreTable('reading', 33)).toBe(7.5);
  });

  test('32 correct (one below the 33 threshold) -> falls to next band 7.0', () => {
    expect(bandScoreTable('reading', 32)).toBe(7.0);
  });

  test('3 correct -> 2.5 (lowest explicit table entry)', () => {
    expect(bandScoreTable('reading', 3)).toBe(2.5);
  });

  test('0 correct -> floor 1.0', () => {
    expect(bandScoreTable('reading', 0)).toBe(1.0);
  });

  test('2 correct (below lowest table entry) -> floor 1.0', () => {
    expect(bandScoreTable('reading', 2)).toBe(1.0);
  });
});

describe('bandScoreTable - listening and reading share identical thresholds', () => {
  // Below 3 correct falls to each skill's own floor (2.0 for listening,
  // 1.0 for reading), which legitimately differ — only the table itself
  // (3 correct and up) is shared, so the comparison starts at 3.
  test.each([40, 39, 37, 35, 33, 30, 27, 23, 20, 16, 13, 10, 7, 5, 3])(
    '%i correct gives the same band for both skills',
    (correct) => {
      expect(bandScoreTable('listening', correct)).toBe(bandScoreTable('reading', correct));
    }
  );
});
