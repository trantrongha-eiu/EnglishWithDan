import { describe, it, expect } from 'vitest';
import { WARMUP_PROMPTS, buildWarmUpMessage } from './warmUpPrompts';

describe('buildWarmUpMessage', () => {
  it('returns the bare prompt when nothing is pasted', () => {
    expect(buildWarmUpMessage('reading', {})).toBe(WARMUP_PROMPTS.reading.prompt);
  });

  it('appends the material in the order the prompt lists it', () => {
    const msg = buildWarmUpMessage('listening', { source: 'TRANSCRIPT TEXT', questions: 'Q1 text' });
    expect(msg.startsWith(WARMUP_PROMPTS.listening.prompt)).toBe(true);
    const q = msg.indexOf('## 1. IELTS Listening Questions\n\nQ1 text');
    const t = msg.indexOf('## 2. IELTS Listening Transcript\n\nTRANSCRIPT TEXT');
    expect(q).toBeGreaterThan(0);
    expect(t).toBeGreaterThan(q);
  });

  it('puts the reading passage before the questions', () => {
    const msg = buildWarmUpMessage('reading', { source: 'PASSAGE', questions: 'QUESTIONS' });
    expect(msg.indexOf('## 1. IELTS Reading Passage')).toBeLessThan(msg.indexOf('## 2. IELTS Reading Questions'));
  });

  it('ignores unknown skills', () => {
    expect(buildWarmUpMessage('writing', { source: 'x' })).toBe('');
  });
});
