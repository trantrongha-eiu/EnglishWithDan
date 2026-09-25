const { evaluateBook, evaluateBooks } = require('../../../services/vocabGoalService');
const { assignDefaultSlots, slotFromName } = require('../../../utils/defaultVocabBooks');

const SINCE = new Date('2026-09-01T00:00:00Z');
const AFTER = new Date('2026-09-02T00:00:00Z');
const BEFORE = new Date('2026-08-30T00:00:00Z');

// n words practised after SINCE, the first `correct` of them answered right,
// padded with `untouched` never-practised words.
function words({ practiced = 0, correct = 0, untouched = 0, at = AFTER }) {
  const out = [];
  for (let i = 0; i < practiced; i++) out.push({ lastPracticedAt: at, lastPracticeCorrect: i < correct });
  for (let i = 0; i < untouched; i++) out.push({});
  return out;
}

describe('evaluateBook — book with >= N words (quota mode)', () => {
  test('passes at exactly N practised with 70% correct', () => {
    const r = evaluateBook(words({ practiced: 100, correct: 70, untouched: 20 }), SINCE, 100);
    expect(r).toMatchObject({ mode: 'quota', completed: true, practiced: 100, correct: 70, target: 100, needCorrect: 70 });
  });

  test('fails at 69% correct', () => {
    expect(evaluateBook(words({ practiced: 100, correct: 69 }), SINCE, 100).completed).toBe(false);
  });

  test('fails when fewer than N words practised, even if all correct', () => {
    expect(evaluateBook(words({ practiced: 80, correct: 80, untouched: 40 }), SINCE, 100).completed).toBe(false);
  });

  test('practice before the assignment was created does not count', () => {
    const r = evaluateBook(words({ practiced: 100, correct: 100, at: BEFORE }), SINCE, 100);
    expect(r).toMatchObject({ completed: false, practiced: 0 });
  });

  test('N below the 50-word floor: a book with >= N words is enough (N=15 -> 11 correct)', () => {
    expect(evaluateBook(words({ practiced: 15, correct: 11 }), SINCE, 15)).toMatchObject({ mode: 'quota', completed: true });
    expect(evaluateBook(words({ practiced: 15, correct: 10 }), SINCE, 15).completed).toBe(false);
  });
});

describe('evaluateBook — 50 <= size < N (học hết sổ)', () => {
  test('passes once every word is practised, regardless of accuracy', () => {
    const r = evaluateBook(words({ practiced: 60, correct: 5 }), SINCE, 100);
    expect(r).toMatchObject({ mode: 'whole_book', completed: true, target: 60 });
  });

  test('fails while a word is still unpractised', () => {
    expect(evaluateBook(words({ practiced: 59, correct: 59, untouched: 1 }), SINCE, 100).completed).toBe(false);
  });
});

describe('evaluateBook — below the 50-word floor', () => {
  test('a book under 50 (and under N) words is not eligible, even fully practised', () => {
    const r = evaluateBook(words({ practiced: 49, correct: 49 }), SINCE, 100);
    expect(r).toMatchObject({ mode: 'too_small', completed: false, bookSize: 49, minSize: 50 });
  });

  test('an empty book is too_small', () => {
    expect(evaluateBook([], SINCE, 100)).toMatchObject({ mode: 'too_small', completed: false, bookSize: 0 });
  });

  test('minSize is N when N < 50', () => {
    expect(evaluateBook(words({ untouched: 10 }), SINCE, 20)).toMatchObject({ mode: 'too_small', minSize: 20 });
  });
});

describe('evaluateBooks — best book wins', () => {
  test('a passing book beats a further-along failing one', () => {
    const r = evaluateBooks([
      { _id: 'a', name: 'Sổ 1', slot: 1, words: words({ practiced: 90, correct: 90, untouched: 50 }) },
      { _id: 'b', name: 'Sổ 2', slot: 2, words: words({ practiced: 100, correct: 75 }) },
    ], SINCE, 100);
    expect(r).toMatchObject({ completed: true, bookId: 'b', bookName: 'Sổ 2', bookSlot: 2, wordCount: 100 });
  });

  test('progress is per book, never summed across books', () => {
    const r = evaluateBooks([
      { _id: 'a', words: words({ practiced: 60, correct: 60, untouched: 60 }) },
      { _id: 'b', words: words({ practiced: 60, correct: 60, untouched: 60 }) },
    ], SINCE, 100);
    expect(r).toMatchObject({ completed: false, practiced: 60 });
  });

  test('an eligible book is preferred over a too-small one with more practice', () => {
    const r = evaluateBooks([
      { _id: 'tiny', words: words({ practiced: 30, correct: 30 }) },
      { _id: 'big', words: words({ practiced: 10, untouched: 140 }) },
    ], SINCE, 100);
    expect(r).toMatchObject({ bookId: 'big', mode: 'quota' });
  });

  test('no books -> no_book', () => {
    expect(evaluateBooks([], SINCE, 100)).toMatchObject({ mode: 'no_book', completed: false, bookId: null });
  });
});

describe('assignDefaultSlots', () => {
  test('keeps tagged books, matches canonical names, fills renamed ones in _id order', () => {
    const { bySlot, missing, extra } = assignDefaultSlots([
      { _id: 1, name: 'UNIT 8', isDefault: true, defaultSlot: null },
      { _id: 2, name: 'Sổ 2', isDefault: true, defaultSlot: null },
      { _id: 3, name: 'Speaking', isDefault: true, defaultSlot: null },
      { _id: 4, name: 'Sổ 4', isDefault: true, defaultSlot: 4 },
    ]);
    expect(bySlot.get(2)._id).toBe(2);
    expect(bySlot.get(4)._id).toBe(4);
    expect(bySlot.get(1)._id).toBe(1);
    expect(bySlot.get(3)._id).toBe(3);
    expect(missing).toEqual([5]);
    expect(extra).toEqual([]);
  });

  test('more than 5 defaults -> extras', () => {
    const books = Array.from({ length: 7 }, (_, i) => ({ _id: i, name: `X${i}`, isDefault: true, defaultSlot: null }));
    const { bySlot, extra, missing } = assignDefaultSlots(books);
    expect(bySlot.size).toBe(5);
    expect(extra.map((b) => b._id)).toEqual([5, 6]);
    expect(missing).toEqual([]);
  });

  test('ordinary "Sổ N" books fill their own slot (most words wins); other ordinary books are never taken', () => {
    const { bySlot, missing, discard } = assignDefaultSlots([
      { _id: 1, name: 'Sổ 1', isDefault: false, wordCount: 185 },
      { _id: 2, name: 'speaking', isDefault: false, wordCount: 35 },
      { _id: 3, name: ' sổ  3 ', isDefault: false, wordCount: 3 },
      { _id: 4, name: 'Sổ 3', isDefault: false, wordCount: 9 },
      { _id: 5, name: 'Sổ 6', isDefault: false, wordCount: 9 },
    ]);
    expect(bySlot.get(1)._id).toBe(1);
    expect(bySlot.get(3)._id).toBe(4);
    expect(missing).toEqual([2, 4, 5]);
    expect(discard).toEqual([]);
  });

  test('an empty default loses its slot to a non-empty ordinary "Sổ N"; a non-empty one keeps it', () => {
    const { bySlot, discard } = assignDefaultSlots([
      { _id: 1, name: 'Sổ 1', isDefault: false, wordCount: 185 },
      { _id: 2, name: 'Sổ 2', isDefault: false, wordCount: 5 },
      { _id: 10, name: 'Sổ 1', isDefault: true, defaultSlot: 1, wordCount: 0 },
      { _id: 11, name: 'Sổ 2', isDefault: true, defaultSlot: 2, wordCount: 1 },
    ]);
    expect(bySlot.get(1)._id).toBe(1);
    expect(bySlot.get(2)._id).toBe(11);
    expect(discard.map((b) => b._id)).toEqual([10]);
  });
});

describe('slotFromName', () => {
  test.each([['Sổ 1', 1], ['sổ 5', 5], ['  SỔ   2 ', 2], ['Sổ3', 3], ['Sổ 6', null], ['Sổ 10', null], ['Sổ của mẹ', null], ['So 1', null]])('%s -> %s', (name, slot) => {
    expect(slotFromName(name)).toBe(slot);
  });
});
