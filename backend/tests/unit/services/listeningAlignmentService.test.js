'use strict';

const { selectDictationSentences, validateAlignment } = require('../../../services/listeningAlignmentService');

// Builds an alignSentences()-shaped result row without needing a real ASR
// call — matchedWords/totalWords/unmatchedTokens are exactly what
// selectDictationSentences/validateAlignment actually read.
function row({ text, start, end, totalWords, matchedWords, unmatchedTokens = [] }) {
  return { text, start, end, totalWords, matchedWords: matchedWords ?? totalWords, unmatchedTokens };
}

describe('listeningAlignmentService.selectDictationSentences', () => {
  it('keeps a substantive sentence that matched 100% at a plausible speech rate', () => {
    const results = [
      row({ text: 'The mangrove regeneration project has been running for over a decade now.', start: 10, end: 14, totalWords: 12 }),
    ];
    const { kept, dropped } = selectDictationSentences(results);
    expect(kept).toHaveLength(1);
    expect(dropped).toHaveLength(0);
    expect(kept[0]).toEqual({ text: results[0].text, start: 10, end: 14 });
  });

  it('drops a short filler sentence even when perfectly matched and timed (per product decision)', () => {
    const results = [
      row({ text: 'Okay.', start: 5, end: 5.3, totalWords: 1 }),
      row({ text: 'Hello there.', start: 6, end: 6.6, totalWords: 2 }),
    ];
    const { kept, dropped } = selectDictationSentences(results);
    expect(kept).toHaveLength(0);
    expect(dropped).toHaveLength(2);
    expect(dropped[0].reason).toMatch(/quá ngắn/);
  });

  it('drops a sentence Whisper mismatched (e.g. a spelled-out word or phone number)', () => {
    const results = [
      row({
        text: 'It is spelled W O O D S I D E for anyone taking notes today.',
        start: 20, end: 24, totalWords: 12, matchedWords: 6,
        unmatchedTokens: ['w', 'o', 'o', 'd', 's', 'i'],
      }),
    ];
    const { kept, dropped } = selectDictationSentences(results);
    expect(kept).toHaveLength(0);
    expect(dropped[0].reason).toMatch(/không khớp Whisper/);
  });

  it('keeps a sentence whose only unmatched tokens are hesitation fillers (um/uh/hmm)', () => {
    const results = [
      row({
        text: 'Um, I think the presentation should focus mainly on the survey results.',
        start: 30, end: 33.5, totalWords: 12, matchedWords: 11,
        unmatchedTokens: ['um'],
      }),
    ];
    const { kept, dropped } = selectDictationSentences(results);
    expect(dropped).toHaveLength(0);
    expect(kept).toHaveLength(1);
  });

  it('drops a sentence with an implausible speech rate (interpolated/mis-timed)', () => {
    const results = [
      // 8 words stretched across 58s — the "0.34 words/sec" real-world case
      // from a genuinely mistimed interpolated gap.
      row({ text: 'I am sure there is lots to look forward to.', start: 100, end: 158, totalWords: 8 }),
    ];
    const { kept, dropped } = selectDictationSentences(results);
    expect(kept).toHaveLength(0);
    expect(dropped[0].reason).toMatch(/thời lượng bất thường/);
  });

  it('drops a sentence with zero/negative duration', () => {
    const results = [row({ text: 'Right.', start: 10, end: 10, totalWords: 1 })];
    const { dropped } = selectDictationSentences(results);
    expect(dropped).toHaveLength(1);
  });

  it('respects a custom minWords threshold', () => {
    const results = [row({ text: 'Fair enough then.', start: 1, end: 2, totalWords: 3 })];
    expect(selectDictationSentences(results, 6).kept).toHaveLength(0);
    expect(selectDictationSentences(results, 2).kept).toHaveLength(1);
  });

  it('a mixed batch keeps only the good+substantive ones, preserving order', () => {
    const results = [
      row({ text: 'Good morning everyone, thanks for joining the call today.', start: 0, end: 3, totalWords: 9 }),
      row({ text: 'Okay.', start: 3, end: 3.2, totalWords: 1 }),
      row({ text: 'My number is double 5, triple 2, 9 4.', start: 4, end: 6, totalWords: 10, matchedWords: 4, unmatchedTokens: ['double', '5', 'triple', '2', '9', '4'] }),
      row({ text: "Let's start with the first item on the agenda for this quarter.", start: 7, end: 10, totalWords: 12 }),
    ];
    const { kept, dropped } = selectDictationSentences(results);
    expect(kept.map(k => k.text)).toEqual([results[0].text, results[3].text]);
    expect(dropped).toHaveLength(2);
  });
});

// Sanity — validateAlignment (the previous all-or-nothing gate) is kept in
// the module for any future caller wanting a strict pass/fail, unchanged by
// this phase's addition of selectDictationSentences.
describe('listeningAlignmentService.validateAlignment (unchanged all-or-nothing gate)', () => {
  it('is valid only when every sentence passes', () => {
    const good = row({ text: 'A perfectly fine sentence with enough words in it.', start: 0, end: 3, totalWords: 9 });
    const bad = row({ text: 'Okay.', start: 3, end: 3.01, totalWords: 1 });
    expect(validateAlignment([good]).valid).toBe(true);
    expect(validateAlignment([good, bad]).valid).toBe(false);
  });
});
