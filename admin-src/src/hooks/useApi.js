import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const TIMEOUT_MS = 30_000;

// GET `path` and track { data, error, loading } for it.
//  - a new `path` aborts the in-flight request for the old one, so a slow
//    response can never overwrite a newer one (search-as-you-type races);
//  - `reload()` refetches; `pollMs` refetches while the tab is visible;
//  - data from the previous request stays in place during a refetch, so
//    polling/reloading doesn't flash a skeleton (`loading` is only true
//    before the first successful response for this hook).
// Pass `null` as path to skip fetching.
export function useApi(path, { pollMs } = {}) {
  const [tick, setTick] = useState(0);
  const key = path ? `${path}#${tick}` : null;
  const [state, setState] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    if (!key) return undefined;
    const ctrl = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, TIMEOUT_MS);
    apiFetch(path, { signal: ctrl.signal })
      .then(data => {
        if (!ctrl.signal.aborted) setState({ key, data, error: null });
      })
      .catch(error => {
        if (ctrl.signal.aborted && !timedOut) return; // superseded / unmounted
        const err = timedOut
          ? Object.assign(new Error('Server phản hồi quá lâu — có thể đang khởi động. Thử lại sau vài giây.'), { coldStart: true })
          : error;
        setState(s => ({ key, data: s.data, error: err }));
      })
      .finally(() => clearTimeout(timer));
    return () => { clearTimeout(timer); ctrl.abort(); };
    // `path` is part of `key`.
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!pollMs || !path) return undefined;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') setTick(t => t + 1);
    }, pollMs);
    return () => clearInterval(id);
  }, [pollMs, path]);

  const reload = useCallback(() => setTick(t => t + 1), []);
  const pending = key !== null && state.key !== key;

  return {
    data: state.data,
    error: pending ? null : state.error,
    loading: pending && state.data == null,
    refreshing: pending && state.data != null,
    reload,
  };
}
