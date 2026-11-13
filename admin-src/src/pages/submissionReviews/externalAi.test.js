import { describe, it, expect } from 'vitest';
import { parseExternalFeedback } from './externalAi';

const W = ['taskAchievement', 'coherence', 'lexical', 'grammar'];
const S = ['fluency', 'vocabulary', 'grammar', 'pronunciation'];

describe('parseExternalFeedback', () => {
  it('reads a writing JSON reply (inside a ```json fence) into band, criteria and comment', () => {
    const reply = 'Here is the grade:\n```json\n' + JSON.stringify({
      scores: { taskAchievement: 6, coherence: 6.4, lexical: 5.5, grammar: 5 },
      overallBand: 5.5, feedbackVi: 'Đủ ý nhưng thiếu so sánh.',
      corrections: [{ original: 'increase to 20%', corrected: 'increased to 20%', note: 'thì quá khứ' }],
      missingStructures: ['respectively'],
    }) + '\n```';
    const r = parseExternalFeedback(reply, 'writing', W);
    expect(r.parsed).toBe(true);
    expect(r.band).toBe(5.5);
    expect(r.scores).toEqual({ taskAchievement: 6, coherence: 6.5, lexical: 5.5, grammar: 5 });
    expect(r.note).toContain('Đủ ý nhưng thiếu so sánh.');
    expect(r.note).toContain('increase to 20% → increased to 20% (thì quá khứ)');
    expect(r.note).toContain('Cấu trúc còn thiếu: respectively');
  });

  it('reads the speaking criteria schema; pronunciation null stays empty', () => {
    const r = parseExternalFeedback(JSON.stringify({
      criteria: {
        fluencyCoherence: { band: 6, feedback: 'Trôi chảy.' },
        lexicalResource: { band: 5.5, limitations: [{ studentQuote: 'very much happy', correction: 'very happy' }] },
        grammaticalRangeAccuracy: { band: 6 },
        pronunciation: { band: null },
      },
      overallFeedback: 'Khá tốt.', priorityImprovements: ['Mở rộng ý'],
    }), 'speaking', S);
    expect(r.scores).toEqual({ fluency: 6, vocabulary: 5.5, grammar: 6, pronunciation: '' });
    expect(r.band).toBe('');
    expect(r.note).toMatch(/Khá tốt\.[\s\S]*Trôi chảy\.[\s\S]*very much happy → very happy[\s\S]*Mở rộng ý/);
  });

  it('finds the grading JSON among chatter with braces, smart quotes and trailing commas', () => {
    const reply = 'Format: {band} per criterion. Example {"x":1}\n'
      + '{ “scores”: { “taskAchievement”: “Band 6”, “coherence”: 6, “lexical”: “5,5”, “grammar”: 5, }, “overallBand”: 6, “feedbackVi”: “Tốt {nhưng} cần số liệu.”, }\n'
      + 'Hope this helps {:}';
    const r = parseExternalFeedback(reply, 'writing', W);
    expect(r.parsed).toBe(true);
    expect(r.band).toBe(6);
    expect(r.scores).toEqual({ taskAchievement: 6, coherence: 6, lexical: 5.5, grammar: 5 });
    expect(r.note).toContain('Tốt {nhưng} cần số liệu.');
  });

  it('plain text becomes the comment', () => {
    const r = parseExternalFeedback('  Bài viết tốt, cần thêm số liệu.  ', 'writing', W);
    expect(r).toMatchObject({ parsed: false, band: '', note: 'Bài viết tốt, cần thêm số liệu.' });
  });
});
