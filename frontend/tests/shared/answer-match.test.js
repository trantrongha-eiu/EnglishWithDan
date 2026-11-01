'use strict';

// shared/answer-match.js — lenient answer check for the grammar drills
// (essential-grammar.html: "Chia động từ", "Luyện dịch câu", V0→V2/V3).
const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  loadScript('answer-match.js');
});

const AM = () => window.AnswerMatch;

describe('AnswerMatch.isMatch', () => {
  test.each([
    ['She does not like tea', "She doesn't like tea."],
    ["I’m not going to eat fast food any more", 'I am not going to eat fast food anymore.'],
    ['They will not have arrived by 6 pm', "They won't have arrived by 6 p.m."],
    ['my mother gets up at five a.m every day', 'My mother gets up at 5 a.m. every day.'],
    ["She's just come home", 'She has just come home.'],
    ["it's going to rain", 'It is going to rain.'],
    ['  WENT ', 'went'],
    ['does your brother play', 'Does your brother play'],
  ])('%s  ≈  %s', (user, answer) => {
    expect(AM().isMatch(user, [answer])).toBe(true);
  });

  test('accepts any of several answers', () => {
    expect(AM().isMatch('traveled', ['travelled', 'traveled'])).toBe(true);
  });

  test('rejects wrong forms and empty input', () => {
    expect(AM().isMatch('goed', ['went'])).toBe(false);
    expect(AM().isMatch('has went', ['has gone'])).toBe(false);
    expect(AM().isMatch('', ['went'])).toBe(false);
    expect(AM().isMatch('   ', ['went'])).toBe(false);
  });

  test("keeps possessive 's (not read as is/has)", () => {
    expect(AM().isMatch("the city's population had doubled", ["The city's population had doubled."])).toBe(true);
    expect(AM().isMatch('the city is population had doubled', ["The city's population had doubled."])).toBe(false);
  });
});

describe('AnswerMatch.diff / closest', () => {
  test('marks the differing words on both sides', () => {
    const d = AM().diff('I have lived in Hanoi since 10 years', "I've lived in Hanoi for ten years.");
    expect(d.user.filter(p => !p.ok).map(p => p.w)).toEqual(['since']);
    expect(d.answer.filter(p => !p.ok).map(p => p.w)).toEqual(['for']);
  });

  test('picks the accepted answer nearest to what was written', () => {
    expect(AM().closest('We have been saving for a house', [
      'We have been saving money to buy a house.',
      'We have been saving money for a house.',
    ])).toBe('We have been saving money for a house.');
  });
});
