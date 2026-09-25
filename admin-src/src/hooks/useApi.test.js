import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

const apiFetch = vi.fn();
vi.mock('../utils/api', () => ({ apiFetch: (...a) => apiFetch(...a) }));

import { useApi } from './useApi';

describe('useApi', () => {
  beforeEach(() => apiFetch.mockReset());

  it('loads data and exposes loading → data', async () => {
    apiFetch.mockResolvedValue({ ok: 1 });
    const { result } = renderHook(() => useApi('/x'));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual({ ok: 1 }));
    expect(result.current.loading).toBe(false);
  });

  it('never lets a slow, superseded response overwrite a newer one', async () => {
    let resolveSlow;
    apiFetch.mockImplementation((path, opts = {}) => {
      if (path === '/slow') {
        return new Promise((res, rej) => {
          resolveSlow = () => res({ which: 'slow' });
          opts.signal?.addEventListener('abort', () => rej(Object.assign(new Error('aborted'), { name: 'AbortError' })));
        });
      }
      return Promise.resolve({ which: 'fast' });
    });
    const { result, rerender } = renderHook(({ p }) => useApi(p), { initialProps: { p: '/slow' } });
    rerender({ p: '/fast' });
    await waitFor(() => expect(result.current.data).toEqual({ which: 'fast' }));
    act(() => resolveSlow());
    await new Promise(r => setTimeout(r, 10));
    expect(result.current.data).toEqual({ which: 'fast' });
  });

  it('surfaces errors and retries on reload()', async () => {
    apiFetch.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce({ ok: 2 });
    const { result } = renderHook(() => useApi('/y'));
    await waitFor(() => expect(result.current.error?.message).toBe('boom'));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data).toEqual({ ok: 2 }));
    expect(result.current.error).toBeNull();
  });

  it('does nothing for a null path', () => {
    const { result } = renderHook(() => useApi(null));
    expect(apiFetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });
});
