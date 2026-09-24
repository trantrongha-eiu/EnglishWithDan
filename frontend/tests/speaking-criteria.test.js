/**
 * js/speaking-criteria.js — renders a speaking-v2 per-criterion analysis
 * (practice result, session result, History modal).
 */
'use strict';

const fs = require('fs');
const path = require('path');

beforeAll(() => {
  window.eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'speaking-criteria.js'), 'utf8'));
});

function crit(band, extra = {}) {
  return {
    band, descriptorMatch: ['Able to keep going'], strengths: ['Nói được dài'], weaknesses: ['Lặp "very good"'],
    evidence: [{ studentQuote: 'It was a once-in-a-lifetime experience', feature: 'idiom', evaluation: 'Tự nhiên', positive: true }],
    limitations: [], rangeLevel: 'high', accuracyLevel: 'moderate', flexibilityLevel: 'moderate', appropriacyLevel: 'high',
    feedback: 'Vì sao band này.', nextStep: 'Bước tiếp theo.', ...extra,
  };
}
function fb(overrides = {}) {
  return {
    scoringVersion: 'speaking-v2', overallBand: 6.5, provisional: true, pronunciationAssessable: false,
    criteria: {
      fluencyCoherence: crit(6.5),
      lexicalResource: crit(7, { features: {
        idioms: [{ studentQuote: 'over the moon', natural: true, assessment: 'ok' }],
        collocations: [{ studentQuote: 'do a big impact', natural: false, assessment: 'sai collocation' }],
        lowFrequency: [], phrasalVerbs: [], paraphrasing: [],
        repetition: [{ word: 'very good', count: 5, alternatives: ['delicious'] }],
      } }),
      grammaticalRangeAccuracy: crit(6, {
        limitations: [{ studentQuote: 'If I have more money I would go', problem: 'Sai điều kiện loại 2', correction: 'If I had more money, I would go', explanation: 'Giả định' }],
        structures: [{ type: 'second conditional', studentQuote: 'If I have more money I would go', correct: false }],
        errorDensity: { clauses: 10, errors: 2, minor: 1, major: 1, pattern: 'occasional' },
      }),
      pronunciation: { assessable: false, band: null, reason: 'Không có bản ghi âm — không thể đánh giá phát âm chỉ từ văn bản.', nextStep: 'Hãy ghi âm.' },
    },
    priorityImprovements: ['Sửa câu điều kiện', 'Bớt lặp từ', 'Mở rộng ý'],
    memorisedLanguage: [], partAnalysis: [],
    ...overrides,
  };
}

function mount(html) {
  document.body.innerHTML = '<div id="host"></div>';
  document.getElementById('host').innerHTML = html;
  return document.getElementById('host');
}

test('renders one card per criterion with its band, pronunciation N/A and the provisional note', () => {
  const host = mount(window.SpeakingCriteria.render(fb()));
  const cards = host.querySelectorAll('.spc-card');
  expect(cards).toHaveLength(4);
  expect([...cards].map(c => c.querySelector('.spc-card-band').textContent)).toEqual(['6.5', '7', '6', 'N/A']);
  expect(host.querySelector('.spc-provisional').textContent).toMatch(/tạm tính/);
  expect(cards[3].textContent).toMatch(/Không có bản ghi âm/);
});

test('shows why, evidence, corrections, next step, priorities, lexical features and grammar structures', () => {
  const host = mount(window.SpeakingCriteria.render(fb()));
  const text = host.textContent;
  expect(text).toMatch(/Vì sao được band này/);
  expect(text).toMatch(/Bằng chứng từ câu trả lời/);
  expect(text).toMatch(/once-in-a-lifetime experience/);
  expect(text).toMatch(/If I had more money, I would go/);
  expect(text).toMatch(/Cách cải thiện để lên band/);
  expect(host.querySelectorAll('.spc-priorities li')).toHaveLength(3);
  expect(host.querySelector('.spc-feat-ok').textContent).toMatch(/over the moon/);
  expect(host.querySelector('.spc-feat-bad').textContent).toMatch(/do a big impact/);
  expect(host.querySelector('.spc-feat-rep').textContent).toMatch(/lặp ~5 lần/);
  expect(host.querySelector('.spc-struct-bad').textContent).toMatch(/second conditional/);
  expect(host.querySelector('.spc-density').textContent).toMatch(/2 lỗi \/ 10 mệnh đề/);
});

test('escapes AI text (no HTML injection from quotes)', () => {
  const f = fb();
  f.criteria.fluencyCoherence.evidence[0].studentQuote = '<img src=x onerror=alert(1)>';
  const host = mount(window.SpeakingCriteria.render(f));
  expect(host.querySelector('img')).toBeNull();
  expect(host.textContent).toMatch(/<img src=x/);
});

test('first card open on the live result, all closed in the compact History view', () => {
  expect(mount(window.SpeakingCriteria.render(fb())).querySelectorAll('.spc-card[open]')).toHaveLength(1);
  expect(mount(window.SpeakingCriteria.render(fb(), { compact: true })).querySelectorAll('.spc-card[open]')).toHaveLength(0);
});

test('an older flat result (no criteria) renders nothing', () => {
  expect(window.SpeakingCriteria.render({ overallBand: 6, fluency: 6 })).toBe('');
});

test('feedbackFromAttempt maps stored corrections/suggestions back to the live shape', () => {
  const f = window.SpeakingCriteria.feedbackFromAttempt({
    overallBand: 6, corrections: [{ original: 'a', corrected: 'b', explanation: 'c' }], suggestions: ['s'],
  });
  expect(f.mistakes).toEqual([{ original: 'a', corrected: 'b', reason: 'c' }]);
  expect(f.improvements).toEqual(['s']);
});
