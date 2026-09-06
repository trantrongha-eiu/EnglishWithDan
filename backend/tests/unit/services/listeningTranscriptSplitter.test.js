'use strict';

const {
  splitLongUnit, splitLongUnits, mergeShortUnits, mergeAdjacentFragments,
  normalizeDictationUnits,
} = require('../../../services/listeningTranscriptSplitter');

describe('listeningTranscriptSplitter.splitLongUnit', () => {
  it('leaves a whole sentence within the soft cap untouched', () => {
    const u = { text: 'The office opens at nine in the morning.', start: 10, end: 14 };
    expect(splitLongUnit(u, { softMaxSec: 9 })).toEqual([u]);
  });

  it('leaves a long sentence WHOLE when it has no strong internal boundary', () => {
    // long, but no semicolon/dash and no comma-before-a-clause — a truncated
    // fragment would be worse than one long complete sentence.
    const u = {
      text: 'You will need to bring two forms of identification such as a passport or a driving licence to the reception desk before nine.',
      start: 0, end: 12,
    };
    expect(splitLongUnit(u, { softMaxSec: 9 })).toEqual([u]);
  });

  it('splits a long sentence at a comma before a new clause, keeping both halves whole', () => {
    const u = {
      text: 'The painting competition for the children has been cancelled, but there will be a cookery session instead and prizes for every age group.',
      start: 100, end: 112,
    };
    const parts = splitLongUnit(u, { softMaxSec: 9 });
    expect(parts).toHaveLength(2);
    expect(parts[0].text).toBe('The painting competition for the children has been cancelled,');
    // continuation piece is capitalised so it reads as a sentence
    expect(parts[1].text).toBe('But there will be a cookery session instead and prizes for every age group.');
    expect(parts[0].start).toBe(100);
    expect(parts[1].end).toBe(112);
    expect(parts[1].start).toBeCloseTo(parts[0].end, 5);
    // nothing lost
    expect(parts.map(p => p.text).join(' ').toLowerCase()).toBe(u.text.toLowerCase());
  });

  it('splits at a semicolon', () => {
    const u = {
      text: 'The ferry leaves at eight in the morning; passengers should check in at least an hour before departure at the main terminal.',
      start: 0, end: 11,
    };
    const parts = splitLongUnit(u, { softMaxSec: 9 });
    expect(parts).toHaveLength(2);
    expect(parts[0].text.endsWith(';')).toBe(true);
  });

  it('never leaves a piece ending on a dangling preposition', () => {
    const u = {
      text: 'My talk is about a research study I did over a period of several months, and I want to explain how the data was collected.',
      start: 0, end: 12,
    };
    const parts = splitLongUnit(u, { softMaxSec: 9 });
    for (const p of parts) {
      expect(p.text).not.toMatch(/\b(over|of|to|in|on|at|for|with|from|by|and|the|a|an)$/i);
    }
    expect(parts.map(p => p.text).join(' ').toLowerCase()).toBe(u.text.toLowerCase());
  });

  it('leaves a >25s clip whole (alignment drift, not real speech)', () => {
    const u = { text: 'a b c d e f g h i j, and k l m n o p q r s t.', start: 0, end: 40 };
    expect(splitLongUnit(u, { softMaxSec: 9, maxSplittableSec: 25 })).toEqual([u]);
  });

  it('is a fixpoint — re-splitting its own output changes nothing', () => {
    const u = {
      text: 'The route begins at the harbour and follows the coast for two miles, then it climbs steeply to the lighthouse, and finally it drops back down to the village square.',
      start: 0, end: 16,
    };
    const once = splitLongUnits([u], { softMaxSec: 9 });
    const twice = splitLongUnits(once, { softMaxSec: 9 });
    expect(twice).toEqual(once);
    expect(once.map(p => p.text).join(' ').toLowerCase()).toBe(u.text.toLowerCase());
  });
});

describe('listeningTranscriptSplitter.mergeAdjacentFragments', () => {
  it('rejoins clips cut out of one sentence', () => {
    const units = [
      { text: 'My talk is about a research study I did over', start: 0, end: 3 },
      { text: 'a period of several months.', start: 3, end: 6 },
      { text: 'It was really interesting.', start: 6, end: 8 },
    ];
    expect(mergeAdjacentFragments(units)).toEqual([
      { text: 'My talk is about a research study I did over a period of several months.', start: 0, end: 6 },
      { text: 'It was really interesting.', start: 6, end: 8 },
    ]);
  });

  it('does not join across a timing gap', () => {
    const units = [
      { text: 'the plan was to have a competition', start: 0, end: 3 },
      { text: 'but that has now changed.', start: 12, end: 15 },
    ];
    expect(mergeAdjacentFragments(units)).toHaveLength(2);
  });

  it('leaves already-whole sentences alone', () => {
    const units = [
      { text: 'Good morning everyone.', start: 0, end: 2 },
      { text: 'Today we look at coastal erosion.', start: 2, end: 5 },
    ];
    expect(mergeAdjacentFragments(units)).toEqual(units);
  });
});

describe('listeningTranscriptSplitter.mergeShortUnits', () => {
  it('folds a sub-1.2s clip into its contiguous previous neighbour', () => {
    const units = [
      { text: 'benefits to using an agency', start: 100, end: 101.8 },
      { text: '- for example,', start: 101.8, end: 102.7 },
      { text: 'the interview will be useful.', start: 102.7, end: 104.5 },
    ];
    const out = mergeShortUnits(units, 1.2);
    expect(out[0].text).toBe('benefits to using an agency - for example,');
    expect(out).toHaveLength(2);
  });

  it('leaves a short clip alone when isolated by timing gaps', () => {
    const units = [
      { text: 'She works in finance now.', start: 10, end: 13 },
      { text: 'W-O-O-D-S', start: 30, end: 30.8 },
      { text: 'Anyway, good to catch up.', start: 50, end: 52.5 },
    ];
    expect(mergeShortUnits(units, 1.2)).toEqual(units);
  });
});

describe('listeningTranscriptSplitter.normalizeDictationUnits', () => {
  it('keeps whole sentences and only splits the genuinely long ones', () => {
    const units = [
      { text: 'The office opens at nine.', start: 0, end: 2 },
      {
        text: 'You should check in an hour before departure, and you must bring photo identification such as a passport or a driving licence with you.',
        start: 2, end: 15,
      },
    ];
    const out = normalizeDictationUnits(units, { maxSec: 9 });
    expect(out[0]).toEqual(units[0]);
    expect(out.length).toBeGreaterThan(2);
    for (const u of out) expect(u.text).not.toMatch(/\b(and|or|the|a|to|of)$/i);
    expect(out.map(u => u.text).join(' ').toLowerCase()).toBe(units.map(u => u.text).join(' ').toLowerCase());
  });

  it('is a fixpoint', () => {
    const units = [{
      text: 'The route begins at the harbour and follows the coast, then it climbs to the lighthouse, and finally it returns to the square.',
      start: 0, end: 14,
    }];
    const once = normalizeDictationUnits(units, { maxSec: 9 });
    const twice = normalizeDictationUnits(once, { maxSec: 9 });
    expect(twice).toEqual(once);
  });

  it('leaves an already-normalised list untouched', () => {
    const units = [
      { text: 'Good morning and welcome to the session.', start: 0, end: 3.5 },
      { text: 'Today we will look at coastal erosion.', start: 3.5, end: 6.8 },
    ];
    expect(normalizeDictationUnits(units, { maxSec: 9 })).toEqual(units);
  });
});
