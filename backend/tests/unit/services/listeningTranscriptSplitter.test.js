'use strict';

const {
  splitLongUnit, splitLongUnits, mergeShortUnits, normalizeDictationUnits,
} = require('../../../services/listeningTranscriptSplitter');

describe('listeningTranscriptSplitter.splitLongUnit', () => {
  it('leaves a short clip untouched', () => {
    const u = { text: 'The office opens at nine.', start: 10, end: 12.5 };
    expect(splitLongUnit(u)).toEqual([u]);
  });

  it('leaves a clip exactly at the trigger untouched', () => {
    const u = { text: 'a b c d e f g h i j k l', start: 0, end: 5 };
    expect(splitLongUnit(u, { targetSec: 4, triggerSec: 5 })).toHaveLength(1);
  });

  it('splits a long clip into sub-clips no longer than the trigger', () => {
    // 37 words over 12s — the real "Bankside Recruitment Agency" complaint.
    const text =
      'You will need to bring two forms of identification, ' +
      'one of which must be a photo ID such as a passport or driving licence, ' +
      'and you should also bring a printed copy of the confirmation email ' +
      'that we sent you when you first registered with the agency.';
    const parts = splitLongUnit({ text, start: 30, end: 42 }, { targetSec: 4, triggerSec: 4 });
    expect(parts.length).toBeGreaterThanOrEqual(3);
    // timings stay inside the parent and run consecutively
    expect(parts[0].start).toBe(30);
    expect(parts[parts.length - 1].end).toBe(42);
    for (let i = 0; i < parts.length; i++) {
      expect(parts[i].end).toBeGreaterThan(parts[i].start);
      if (i > 0) expect(parts[i].start).toBeCloseTo(parts[i - 1].end, 5);
      expect(parts[i].end - parts[i].start).toBeLessThanOrEqual(4);
    }
    // no text lost or duplicated
    expect(parts.map(p => p.text).join(' ')).toBe(text);
  });

  it('reaches a fixpoint — a second split pass over the output changes nothing', () => {
    // a spread of realistic over-long clips
    const cases = [
      { text: 'It is getting more popular each year, and having it in the town square was starting to be a bit difficult because of the numbers, which is why it is next to the river this time.', start: 280.37, end: 290.77 },
      { text: 'David France will be giving an inspirational talk about how as a business-minded teenager he set up a stall in a local market and then grew that one stall into a national chain of shops.', start: 100, end: 113.5 },
      { text: 'She joined the marketing team in March, and she was promoted to team lead just eight months later.', start: 0, end: 6.2 },
    ];
    for (const c of cases) {
      const once = splitLongUnits([c], { targetSec: 4, triggerSec: 4, maxSplittableSec: 25 });
      const twice = splitLongUnits(once, { targetSec: 4, triggerSec: 4, maxSplittableSec: 25 });
      expect(twice).toEqual(once);
      for (const p of once) expect(p.end - p.start).toBeLessThanOrEqual(4);
      expect(once.map(p => p.text).join(' ')).toBe(c.text);
    }
  });

  it('never emits a sub-second stub — folds tiny slices into a neighbour', () => {
    const samples = [
      { text: 'You will need to bring two forms of identification, one of which must be a photo ID such as a passport or driving licence, and you should also bring a printed copy of the confirmation email that we sent you when you first registered.', start: 0, end: 13.4 },
      { text: 'It is getting more popular each year, and having it in the town square was starting to be difficult because of the numbers, which is why it is by the river now.', start: 100, end: 110.2 },
      { text: 'Right. Well, the plan was to have a painting competition for the kids, but it is now going to be cooking instead, and there will be prizes.', start: 5, end: 14 },
    ];
    for (const s of samples) {
      const parts = splitLongUnit(s, { targetSec: 4, triggerSec: 4 });
      for (const p of parts) expect(p.end - p.start).toBeGreaterThanOrEqual(1.2 - 1e-9);
      expect(parts.map(p => p.text).join(' ')).toBe(s.text);
    }
  });

  it('leaves a clip whose duration exceeds maxSplittableSec whole (alignment likely broken)', () => {
    const u = { text: 'a b c d e f g h i j k l m n o p q r s t', start: 0, end: 40 };
    expect(splitLongUnit(u, { targetSec: 4, triggerSec: 4, maxSplittableSec: 25 })).toEqual([u]);
  });

  it('prefers cutting at punctuation / conjunction boundaries', () => {
    const text = 'She joined the marketing team in March, and she was promoted to team lead just eight months later after a very strong first project.';
    const parts = splitLongUnit({ text, start: 0, end: 9 }, { targetSec: 4 });
    // first piece should end on the comma, not mid-phrase
    expect(parts[0].text.endsWith(',')).toBe(true);
  });

  it('is idempotent — re-splitting already-short units is a no-op', () => {
    const text = 'You will need to bring two forms of identification, one of which must be a photo ID such as a passport, and a printed copy of the confirmation email we sent you.';
    const once = splitLongUnits([{ text, start: 0, end: 11 }], { targetSec: 4 });
    const twice = splitLongUnits(once, { targetSec: 4 });
    expect(twice).toEqual(once);
  });

  it('splitLongUnits passes short units through unchanged', () => {
    const units = [
      { text: 'Good morning everyone.', start: 0, end: 2 },
      { text: 'Today we are looking at coastal erosion.', start: 2, end: 5 },
    ];
    expect(splitLongUnits(units, { targetSec: 4 })).toEqual(units);
  });
});

describe('listeningTranscriptSplitter.mergeShortUnits', () => {
  it('folds a sub-1.2s clip into its contiguous previous neighbour', () => {
    const units = [
      { text: 'benefits to using an agency', start: 100, end: 101.8 },
      { text: '- for example,', start: 101.8, end: 102.7 },
      { text: 'the interview will be useful', start: 102.7, end: 104.5 },
    ];
    const out = mergeShortUnits(units, 1.2);
    expect(out).toEqual([
      { text: 'benefits to using an agency - for example,', start: 100, end: 102.7 },
      { text: 'the interview will be useful', start: 102.7, end: 104.5 },
    ]);
  });

  it('folds a leading short clip forward into the next one', () => {
    const units = [
      { text: 'Right.', start: 0, end: 0.6 },
      { text: 'Well, the plan was to have a competition.', start: 0.6, end: 3.4 },
    ];
    expect(mergeShortUnits(units, 1.2)).toEqual([
      { text: 'Right. Well, the plan was to have a competition.', start: 0, end: 3.4 },
    ]);
  });

  it('leaves a short clip alone when it is isolated by timing gaps on both sides', () => {
    // a stretched spelled-out fragment with dropped sentences either side
    const units = [
      { text: 'She works in the finance sector now.', start: 10, end: 13 },
      { text: 'W-O-O-D-S', start: 30, end: 30.8 },
      { text: 'Anyway, it was good to catch up.', start: 50, end: 52.5 },
    ];
    expect(mergeShortUnits(units, 1.2)).toEqual(units);
  });

  it('is a no-op when every clip is already long enough', () => {
    const units = [
      { text: 'The first activity went really well.', start: 0, end: 3 },
      { text: 'The second one was a bit harder for them.', start: 3, end: 6 },
    ];
    expect(mergeShortUnits(units, 1.2)).toEqual(units);
  });
});

describe('listeningTranscriptSplitter.normalizeDictationUnits', () => {
  const opts = { maxSec: 4, maxSplittableSec: 25 };

  it('splits long clips AND removes sub-second stubs, and is a fixpoint', () => {
    const units = [
      { text: 'You will need to bring two forms of identification, one of which must be a photo ID such as a passport or driving licence, and you should bring a printed copy of the confirmation email we sent you.', start: 30, end: 43.4 },
      { text: 'Thanks.', start: 43.4, end: 43.9 },
      { text: 'That is really helpful and I will make sure I have everything ready in good time.', start: 43.9, end: 48.4 },
    ];
    const once = normalizeDictationUnits(units, opts);
    const twice = normalizeDictationUnits(once, opts);
    expect(twice).toEqual(once);
    for (const u of once) {
      expect(u.end - u.start).toBeLessThanOrEqual(4 + 1e-9);
      expect(u.end - u.start).toBeGreaterThanOrEqual(1.2 - 1e-9);
    }
    // full text preserved end to end
    expect(once.map(u => u.text).join(' ')).toBe(units.map(u => u.text).join(' '));
  });

  it('leaves an already-normalised array untouched', () => {
    const units = [
      { text: 'Good morning everyone and welcome to the session.', start: 0, end: 3.5 },
      { text: 'Today we are going to look at coastal erosion.', start: 3.5, end: 6.8 },
    ];
    expect(normalizeDictationUnits(units, opts)).toEqual(units);
  });
});
