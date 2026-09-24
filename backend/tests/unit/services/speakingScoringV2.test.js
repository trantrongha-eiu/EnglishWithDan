// speakingScoringV2.normalizeSpeakingV2 — the quality gate every speaking-v2
// AI analysis passes before it is saved/shown (pure function, no DB).
const { normalizeSpeakingV2, makeQuoteChecker, candidateText } = require('../../../services/speakingScoringV2');

const TRANSCRIPT = 'Well, I went to Da Lat with my family last summer. It was a once-in-a-lifetime experience. '
  + 'The food is very good and the weather is very good. If I have more money I would go there again. '
  + 'I ended up staying there for another week because it broadened my horizons.';

function crit(band, extra = {}) {
  return {
    band,
    descriptorMatch: ['Able to keep going', 'Uses a range of connectives'],
    strengths: ['Nói được dài'],
    weaknesses: ['Lặp từ "very good"'],
    evidence: [{ studentQuote: 'It was a once-in-a-lifetime experience', feature: 'idiom', evaluation: 'Tự nhiên', positive: true }],
    limitations: [],
    rangeLevel: 'moderate', accuracyLevel: 'moderate', flexibilityLevel: 'moderate', appropriacyLevel: 'high',
    feedback: 'Vì sao band này.', nextStep: 'Bước tiếp theo.',
    ...extra,
  };
}

function raw(overrides = {}) {
  return {
    noGenuineAnswer: false,
    criteria: {
      fluencyCoherence: crit(6.5),
      lexicalResource: crit(7, {
        features: {
          lowFrequency: [], phrasalVerbs: [{ studentQuote: 'ended up staying', natural: true, assessment: 'ok' }],
          idioms: [{ studentQuote: 'once-in-a-lifetime experience', natural: true, assessment: 'ok' }],
          collocations: [{ studentQuote: 'broadened my horizons', natural: true, assessment: 'ok' }],
          paraphrasing: [], repetition: [{ word: 'very good', count: 2, alternatives: ['delicious', 'pleasant'] }],
        },
      }),
      grammaticalRangeAccuracy: crit(6, {
        limitations: [{ studentQuote: 'If I have more money I would go there again', problem: 'Sai câu điều kiện loại 2', correction: 'If I had more money, I would go there again', explanation: 'Giả định trái hiện tại dùng quá khứ' }],
        structures: [
          { type: 'second conditional', studentQuote: 'If I have more money I would go there again', correct: false },
          { type: 'past simple', studentQuote: 'I went to Da Lat', correct: true },
        ],
        errorDensity: { clauses: 8, errors: 1, minor: 0, major: 1, pattern: 'occasional' },
      }),
      pronunciation: { ...crit(6), assessable: true, reason: '' },
    },
    memorisedLanguage: [],
    partAnalysis: [],
    overallFeedback: 'Tổng quan.',
    priorityImprovements: ['Sửa câu điều kiện', 'Bớt lặp "very good"', 'Mở rộng ý', 'thừa'],
    ...overrides,
  };
}

describe('quote verification', () => {
  const found = makeQuoteChecker(TRANSCRIPT);
  test('accepts verbatim quotes, case/punctuation-insensitively', () => {
    expect(found('it was a once-in-a-lifetime experience')).toBe(true);
    expect(found('If I have more money, I would go there again.')).toBe(true);
  });
  test('accepts "…"-joined fragments that each occur', () => {
    expect(found('I went to Da Lat … broadened my horizons')).toBe(true);
  });
  test('tolerates a dropped filler word in a longer quote', () => {
    expect(found('I ended up staying there for another week because broadened my horizons')).toBe(true);
  });
  test('rejects words the candidate never said', () => {
    expect(found('It had a profound impact on my perspective')).toBe(false);
    expect(found('blessing in disguise')).toBe(false);
  });
  test('never treats an examiner question line as the candidate\'s words', () => {
    const multi = 'Q1 (Part 1): Do you enjoy cooking at home?\nA1: Yes, I cook every weekend.';
    expect(candidateText(multi)).toBe('Yes, I cook every weekend.');
    expect(makeQuoteChecker(multi)('Do you enjoy cooking at home')).toBe(false);
    expect(makeQuoteChecker(multi)('I cook every weekend')).toBe(true);
  });
});

describe('normalizeSpeakingV2', () => {
  test('with audio heard: all 4 criteria assessed, overall = IELTS-rounded mean of 4, not provisional', () => {
    const fb = normalizeSpeakingV2(raw(), { transcript: TRANSCRIPT, heardAudio: true });
    expect(fb.scoringVersion).toBe('speaking-v2');
    expect([fb.fluency, fb.vocabulary, fb.grammar, fb.pronunciation]).toEqual([6.5, 7, 6, 6]);
    expect(fb.overallBand).toBe(6.5); // 25.5 / 4 = 6.375 → 6.5
    expect(fb.provisional).toBe(false);
    expect(fb.pronunciationAssessable).toBe(true);
  });

  test('WITHOUT audio: pronunciation is not assessable (null, no evidence) even if the model scored it; overall from 3 criteria and provisional', () => {
    const r = raw();
    r.criteria.pronunciation.evidence = [{ studentQuote: 'Da Lat', feature: 'sound', evaluation: 'x', positive: false }];
    const fb = normalizeSpeakingV2(r, { transcript: TRANSCRIPT, heardAudio: false });
    expect(fb.pronunciation).toBeNull();
    expect(fb.criteria.pronunciation).toMatchObject({ assessable: false, band: null, evidence: [], limitations: [] });
    expect(fb.criteria.pronunciation.reason).toMatch(/bản ghi âm/);
    expect(fb.overallBand).toBe(6.5); // (6.5 + 7 + 6) / 3 = 6.5
    expect(fb.provisional).toBe(true);
    expect(fb.pronunciationAssessable).toBe(false);
  });

  test('drops invented evidence quotes and counts them in qualityCheck', () => {
    const r = raw();
    r.criteria.lexicalResource.evidence.push({ studentQuote: 'It had a profound impact on me', feature: 'collocation', evaluation: 'x', positive: true });
    r.criteria.lexicalResource.features.idioms.push({ studentQuote: 'over the moon', natural: true, assessment: 'x' });
    const fb = normalizeSpeakingV2(r, { transcript: TRANSCRIPT, heardAudio: true });
    const quotes = fb.criteria.lexicalResource.evidence.map(e => e.studentQuote);
    expect(quotes).not.toContain('It had a profound impact on me');
    expect(fb.criteria.lexicalResource.features.idioms.map(i => i.studentQuote)).toEqual(['once-in-a-lifetime experience']);
    expect(fb.qualityCheck.droppedQuotes).toBe(2);
    expect(fb.qualityCheck.verifiedQuotes).toBeGreaterThan(0);
  });

  test('snaps bands to half bands inside 0–9', () => {
    const r = raw();
    r.criteria.fluencyCoherence.band = 6.7;
    r.criteria.lexicalResource.band = 11;
    const fb = normalizeSpeakingV2(r, { transcript: TRANSCRIPT, heardAudio: true });
    expect(fb.fluency).toBe(6.5);
    expect(fb.vocabulary).toBe(9);
  });

  test('derives the legacy fields older consumers read', () => {
    const fb = normalizeSpeakingV2(raw(), { transcript: TRANSCRIPT, heardAudio: false });
    expect(fb.mistakes).toEqual([{ original: 'If I have more money I would go there again', corrected: 'If I had more money, I would go there again', reason: 'Giả định trái hiện tại dùng quá khứ' }]);
    expect(fb.vocabUpgrades[0]).toMatchObject({ original: 'very good', upgrade: 'delicious / pleasant' });
    expect(fb.priorityImprovements).toHaveLength(3);
    expect(fb.improvements).toEqual(fb.priorityImprovements);
    expect(fb.todaysFocus).toBe('Sửa câu điều kiện');
    expect(fb.strengths.length).toBeGreaterThan(0);
    expect(fb.criteria.grammaticalRangeAccuracy.structures).toHaveLength(2);
    expect(fb.criteria.grammaticalRangeAccuracy.errorDensity.pattern).toBe('occasional');
  });

  test('noGenuineAnswer: bands 0, lists emptied, pronunciation stays null without audio', () => {
    const r = raw({ noGenuineAnswer: true });
    const fb = normalizeSpeakingV2(r, { transcript: 'um', heardAudio: false });
    expect(fb.noGenuineAnswer).toBe(true);
    expect([fb.fluency, fb.vocabulary, fb.grammar]).toEqual([0, 0, 0]);
    expect(fb.pronunciation).toBeNull();
    expect(fb.criteria.lexicalResource.evidence).toEqual([]);
    expect(fb.mistakes).toEqual([]);
  });

  test('a real answer with a core band missing is rejected as unusable (so the next engine can try)', () => {
    const r = raw();
    r.criteria.grammaticalRangeAccuracy.band = null;
    expect(() => normalizeSpeakingV2(r, { transcript: TRANSCRIPT, heardAudio: true })).toThrow(expect.objectContaining({ code: 'INVALID_AI_OUTPUT' }));
  });

  test('applies the minimum-band-floor callback to the assessed criteria only', () => {
    const r = raw();
    r.criteria.fluencyCoherence.band = 4;
    r.criteria.lexicalResource.band = 4.5;
    r.criteria.grammaticalRangeAccuracy.band = 4;
    const seen = [];
    const fb = normalizeSpeakingV2(r, {
      transcript: TRANSCRIPT, heardAudio: false,
      applyFloor: bands => { seen.push({ ...bands }); bands.fluency = 5.5; bands.vocabulary = 5.5; bands.grammar = 5.5; },
    });
    expect(seen[0].pronunciation).toBeNull();
    expect(fb.criteria.fluencyCoherence.band).toBe(5.5);
    expect(fb.overallBand).toBe(5.5);
  });

  test('with audio: uses the AI transcription when the client sent none, and returns it', () => {
    const r = raw({ transcript: TRANSCRIPT });
    const fb = normalizeSpeakingV2(r, { transcript: '', heardAudio: true });
    expect(fb.transcript).toBe(TRANSCRIPT);
    expect(fb.qualityCheck.droppedQuotes).toBe(0);
  });
});
