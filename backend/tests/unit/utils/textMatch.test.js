// Unit tests for utils/textMatch.js — levenshtein(a, b) edit distance and
// the NUM_WORDS number->word mapping shared by task1/writing practice
// answer-grading normalize() functions.
const { levenshtein, NUM_WORDS } = require('../../../utils/textMatch');

describe('levenshtein', () => {
  test('identical strings have distance 0', () => {
    expect(levenshtein('hello', 'hello')).toBe(0);
  });

  test('one substitution has distance 1', () => {
    expect(levenshtein('cat', 'cot')).toBe(1);
  });

  test('one insertion has distance 1', () => {
    expect(levenshtein('cat', 'cats')).toBe(1);
  });

  test('one deletion has distance 1', () => {
    expect(levenshtein('cats', 'cat')).toBe(1);
  });

  test('empty string vs "abc" is 3', () => {
    expect(levenshtein('', 'abc')).toBe(3);
  });

  test('"abc" vs empty string is 3 (symmetric)', () => {
    expect(levenshtein('abc', '')).toBe(3);
  });

  test('two empty strings is 0', () => {
    expect(levenshtein('', '')).toBe(0);
  });

  test('completely different strings', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
  });

  test('completely disjoint short strings', () => {
    expect(levenshtein('abc', 'xyz')).toBe(3);
  });
});

describe('NUM_WORDS', () => {
  test('maps 1 through 10 to their English words', () => {
    expect(NUM_WORDS['1']).toBe('one');
    expect(NUM_WORDS['2']).toBe('two');
    expect(NUM_WORDS['3']).toBe('three');
    expect(NUM_WORDS['4']).toBe('four');
    expect(NUM_WORDS['5']).toBe('five');
    expect(NUM_WORDS['6']).toBe('six');
    expect(NUM_WORDS['7']).toBe('seven');
    expect(NUM_WORDS['8']).toBe('eight');
    expect(NUM_WORDS['9']).toBe('nine');
    expect(NUM_WORDS['10']).toBe('ten');
  });

  test('has exactly 10 entries', () => {
    expect(Object.keys(NUM_WORDS)).toHaveLength(10);
  });

  test('does not map "0" or "11"', () => {
    expect(NUM_WORDS['0']).toBeUndefined();
    expect(NUM_WORDS['11']).toBeUndefined();
  });
});
