import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useListFilter } from './useListFilter';

const items = [
  { name: 'Banana', isActive: true, createdAt: '2026-01-05' },
  { name: 'apple', isActive: false, createdAt: '2026-01-10' },
  { name: 'Cherry', isActive: true, createdAt: '2026-01-01' },
];

describe('useListFilter', () => {
  it('returns all items sorted by date-desc by default', () => {
    const { result } = renderHook(() => useListFilter(items));
    expect(result.current.paged.map(i => i.name)).toEqual(['apple', 'Banana', 'Cherry']);
    expect(result.current.filteredCount).toBe(3);
  });

  it('filters by search across the given searchKeys', () => {
    const { result } = renderHook(() => useListFilter(items, { searchKeys: ['name'] }));
    act(() => result.current.setSearch('ba'));
    expect(result.current.paged.map(i => i.name)).toEqual(['Banana']);
  });

  it('filters by status', () => {
    const { result } = renderHook(() => useListFilter(items));
    act(() => result.current.setStatusFilter('hidden'));
    expect(result.current.paged.map(i => i.name)).toEqual(['apple']);
  });

  it('resets to page 1 when a filter changes after paging forward', () => {
    const many = Array.from({ length: 25 }, (_, i) => ({ name: `Item ${i}`, isActive: true, createdAt: `2026-01-${String(i + 1).padStart(2, '0')}` }));
    const { result } = renderHook(() => useListFilter(many, { pageSize: 10 }));
    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);
    act(() => result.current.setSearch('Item 1'));
    expect(result.current.page).toBe(1);
  });

  it('clamps to the last valid page when the underlying item count shrinks (e.g. after a delete)', () => {
    const many = Array.from({ length: 25 }, (_, i) => ({ name: `Item ${i}`, isActive: true, createdAt: `2026-01-${String(i + 1).padStart(2, '0')}` }));
    const { result, rerender } = renderHook(({ items }) => useListFilter(items, { pageSize: 10 }), { initialProps: { items: many } });
    act(() => result.current.setPage(3)); // page 3 of 3 (items 20-24)
    expect(result.current.page).toBe(3);
    rerender({ items: many.slice(0, 5) }); // shrunk to 5 items — page 3 no longer exists
    expect(result.current.page).toBe(1);
    expect(result.current.paged).toHaveLength(5);
  });

  it('supports a custom nameKey for sorting', () => {
    const prompts = [{ prompt: 'B', createdAt: 1 }, { prompt: 'A', createdAt: 2 }];
    const { result } = renderHook(() => useListFilter(prompts, { nameKey: 'prompt', searchKeys: ['prompt'] }));
    act(() => result.current.setSortBy('name-asc'));
    expect(result.current.paged.map(p => p.prompt)).toEqual(['A', 'B']);
  });
});
