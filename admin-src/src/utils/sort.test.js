import { describe, it, expect } from 'vitest';
import { sortItems } from './sort';

const items = [
  { name: 'Banana', createdAt: '2026-01-05' },
  { name: 'apple', createdAt: '2026-01-10' },
  { name: 'Cherry', createdAt: '2026-01-01' },
];

describe('sortItems', () => {
  it('sorts by name ascending, case-insensitively', () => {
    expect(sortItems(items, 'name-asc').map(i => i.name)).toEqual(['apple', 'Banana', 'Cherry']);
  });

  it('sorts by name descending', () => {
    expect(sortItems(items, 'name-desc').map(i => i.name)).toEqual(['Cherry', 'Banana', 'apple']);
  });

  it('sorts by date descending (newest first) by default', () => {
    expect(sortItems(items, 'date-desc').map(i => i.name)).toEqual(['apple', 'Banana', 'Cherry']);
  });

  it('sorts by date ascending (oldest first)', () => {
    expect(sortItems(items, 'date-asc').map(i => i.name)).toEqual(['Cherry', 'Banana', 'apple']);
  });

  it('falls back to date-desc for an unknown sort value', () => {
    expect(sortItems(items, 'bogus').map(i => i.name)).toEqual(sortItems(items, 'date-desc').map(i => i.name));
  });

  it('does not mutate the original array', () => {
    const copy = [...items];
    sortItems(items, 'name-asc');
    expect(items).toEqual(copy);
  });

  it('supports a custom nameKey/dateKey', () => {
    const prompts = [{ prompt: 'B prompt', addedAt: 2 }, { prompt: 'A prompt', addedAt: 1 }];
    expect(sortItems(prompts, 'name-asc', { nameKey: 'prompt' }).map(p => p.prompt)).toEqual(['A prompt', 'B prompt']);
    expect(sortItems(prompts, 'date-asc', { dateKey: 'addedAt' }).map(p => p.addedAt)).toEqual([1, 2]);
  });
});
