import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { displayName, initials } from '../utils/format';

// Topbar "Tìm học sinh" — jump straight to a student's profile from any
// page (was: open Người dùng → search → click). "/" focuses it.
export default function QuickSearch() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onKey(e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const path = debounced.length >= 2
    ? `/admin/users?role=student&limit=6&search=${encodeURIComponent(debounced)}`
    : null;
  const { data, loading, error } = useApi(path);
  const results = path ? (data?.users || []) : [];

  function go(u) {
    setOpen(false); setQ(''); setDebounced('');
    inputRef.current?.blur();
    navigate(`/students/${u._id}`);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') { setOpen(false); e.currentTarget.blur(); return; }
    if (!results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => (c + 1) % results.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => (c - 1 + results.length) % results.length); }
    if (e.key === 'Enter') { e.preventDefault(); go(results[Math.min(cursor, results.length - 1)]); }
  }

  const showPanel = open && debounced.length >= 2;

  return (
    <div className="quick-search">
      <span className="quick-search-icon" aria-hidden="true">🔍</span>
      <input
        ref={inputRef}
        type="search"
        className="quick-search-input"
        placeholder="Tìm học sinh…  ( / )"
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); setCursor(0); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="quick-search-list"
        aria-autocomplete="list"
        aria-label="Tìm học sinh theo tên, username hoặc email"
      />
      {showPanel && (
        <div className="quick-search-panel" id="quick-search-list" role="listbox">
          {loading && <div className="quick-search-note">Đang tìm…</div>}
          {error && <div className="quick-search-note">Không tìm được: {error.message}</div>}
          {!loading && !error && results.length === 0 && <div className="quick-search-note">Không có học sinh khớp “{debounced}”</div>}
          {results.map((u, i) => (
            <button
              key={u._id}
              type="button"
              role="option"
              aria-selected={i === cursor}
              className={`quick-search-item${i === cursor ? ' is-active' : ''}`}
              onMouseDown={e => e.preventDefault()}
              onClick={() => go(u)}
              onMouseEnter={() => setCursor(i)}
            >
              <span className="avatar-sm" aria-hidden="true">{initials(u)}</span>
              <span className="quick-search-text">
                <strong>{displayName(u)}</strong>
                <small>@{u.username} · {u.email}</small>
              </span>
              {u.className && <span className="badge badge-purple">{u.className}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
