'use strict';

const {
  tokenize, spokenMask, alignTranscripts, timingQuality,
  encodeTiming, decodeTiming, gapFillTiming, timingFits,
} = require('../../../services/transcriptTimingService');

// Fake ASR: one word per 0.5s from `from`, Whisper-style tokens.
const asr = (text, from = 0) => text.split(/\s+/).filter(Boolean)
  .map((w, i) => ({ w, s: from + i * 0.5, e: from + i * 0.5 + 0.4 }));

describe('transcriptTimingService', () => {
  test('speaker labels and question annotations are not spoken', () => {
    const text = 'Woman:\nHello (1) there.\nMRS SMITH: Fine Q2 thanks.';
    expect(tokenize(text)).toEqual(['Woman:', 'Hello', '(1)', 'there.', 'MRS', 'SMITH:', 'Fine', 'Q2', 'thanks.']);
    expect(spokenMask(text)).toEqual([false, true, false, true, false, false, true, false, true]);
  });

  test('aligns every spoken token, skipping the audio intro', () => {
    const text = 'Man:\nI want to check some details about the festival.';
    const words = [...asr('You will hear a man phoning', 0), ...asr('I want to check sum details about the festival', 10)];
    const [timing] = alignTranscripts([text], words);
    expect(timing[0]).toBeNull();            // "Man:"
    expect(timing[1]).toEqual([10, 10.4]);   // "I"
    expect(timing[5]).not.toBeNull();        // "some" (heard as "sum") — interpolated
    expect(timing[5][0]).toBeGreaterThanOrEqual(timing[4][1]);
    expect(timing[5][1]).toBeLessThanOrEqual(timing[6][0]);
    expect(timingQuality(timing).match).toBeCloseTo(8 / 9);
  });

  test('a lone coincidental match far from the dialogue is dropped', () => {
    const text = 'Beechen Festival\nWoman: Good morning, how can I help you today?';
    const words = [...asr('you will hear a call to the festival office', 0), ...asr('good morning how can i help you today', 60)];
    const [timing] = alignTranscripts([text], words);
    expect(timing[1]).toBeNull(); // heading "Festival" must not take the intro's time
    expect(timing[3]).toEqual([60, 60.4]);
  });

  test('parts sharing one audio are split back per part', () => {
    const p1 = 'Hello and welcome to the museum.';
    const p2 = 'Today we are going to talk about bees.';
    const words = [...asr(p1, 0), ...asr('now turn to part two', 20), ...asr(p2, 40)];
    const [t1, t2] = alignTranscripts([p1, p2], words);
    expect(t1).toHaveLength(6);
    expect(t2[0]).toEqual([40, 40.4]);
  });

  test('encode/decode round-trip keeps nulls and centisecond precision', () => {
    const t = [[1.234, 1.5], null, [0.5, 0.9], [100, 101.27]];
    expect(decodeTiming(encodeTiming(t))).toEqual([[1.23, 1.5], null, [0.5, 0.9], [100, 101.27]]);
    expect(decodeTiming('')).toBeNull();
  });

  test('gap-fill timing: one entry per template token, a blank spans its answer', () => {
    const transcript = 'It is a big concert with local musicians.';
    const timing = tokenize(transcript).map((_, i) => [i, i + 0.9]);
    const enc = gapFillTiming('It is a [[1]] with local [[2]].', ['big concert', 'musicians'], transcript, encodeTiming(timing));
    expect(decodeTiming(enc)).toEqual([[0, 0.9], [1, 1.9], [2, 2.9], [3, 4.9], [5, 5.9], [6, 6.9], [7, 7.9]]);
    // template no longer matches the transcript → nothing
    expect(gapFillTiming('It is a [[1]] with local [[2]].', ['huge', 'musicians'], transcript, encodeTiming(timing))).toBe('');
  });

  test('timingFits checks the token count', () => {
    expect(timingFits('a b c', encodeTiming([[0, 1], null, [2, 3]]))).toBe(true);
    expect(timingFits('a b c d', encodeTiming([[0, 1], null, [2, 3]]))).toBe(false);
    expect(timingFits('a', '')).toBe(false);
  });
});
