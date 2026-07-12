import '@testing-library/jest-dom';

// Node 22+ ships an experimental native `localStorage`/`sessionStorage`
// global (gated behind the `--localstorage-file` flag), and jsdom 27+
// delegates its own Storage implementation to that native backend when
// present. Without a configured --localstorage-file, the native backend
// returns a methodless stub object (no getItem/setItem/clear), so plain
// `localStorage` / `window.localStorage` is unusable out of the box in
// this test environment (Node v25 here). Swap in a small in-memory
// polyfill so tests can use localStorage the way a real browser exposes it.
class MemoryStorage {
  constructor() {
    this._data = new Map();
  }
  get length() {
    return this._data.size;
  }
  key(n) {
    return Array.from(this._data.keys())[n] ?? null;
  }
  getItem(key) {
    return this._data.has(String(key)) ? this._data.get(String(key)) : null;
  }
  setItem(key, value) {
    this._data.set(String(key), String(value));
  }
  removeItem(key) {
    this._data.delete(String(key));
  }
  clear() {
    this._data.clear();
  }
}

for (const prop of ['localStorage', 'sessionStorage']) {
  Object.defineProperty(window, prop, {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  });
}
