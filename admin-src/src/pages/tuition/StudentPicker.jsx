// Extracted from Tuition.jsx — the searchable student dropdown used by
// the fee create/edit form. Fully self-contained (students/value/onChange
// props only, no coupling to any of Tuition's other state), unlike the
// rest of that file where every tab shares the same closure over ~15
// pieces of state.
import { useEffect, useRef, useState } from 'react';

// `onSearch` (optional): when provided, the picker delegates matching to the
// parent — it debounces the query and calls onSearch(q), and renders
// whatever `students` the parent then supplies, instead of filtering the
// list locally. Lets a caller with thousands of students (Messages) fetch a
// small server-side result set per keystroke rather than preloading them
// all. Callers without it (Tuition) keep the local-filter behaviour.
export default function StudentPicker({ students, value, onChange, onSearch }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef();

  useEffect(() => {
    if (!onSearch) return;
    const t = setTimeout(() => onSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search, onSearch]);

  // Adjust-during-render (not an effect): when the parent clears the
  // selection (value -> falsy), reset the picker's own search/open UI
  // state in the same render rather than a post-commit effect.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (!value) { setSearch(''); setOpen(false); }
  }

  // Remember the picked student so its label survives the parent swapping
  // `students` for a fresh (onSearch) result set that may not contain it.
  const [pickedLabel, setPickedLabel] = useState(null);
  const selected = students.find(s => s._id === value)
    || (pickedLabel && pickedLabel._id === value ? pickedLabel : null);
  const filtered = onSearch
    ? students // parent already returns the matched set
    : search.trim()
      ? students.filter(s => (s.username + ' ' + s.email).toLowerCase().includes(search.toLowerCase()))
      : students;

  useEffect(() => {
    function handle(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false); setSearch('');
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function pick(s) { setPickedLabel(s); onChange(s._id); setSearch(''); setOpen(false); }

  const displayValue = open ? search : (selected ? `${selected.username} (${selected.email})` : '');

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          className="form-input"
          placeholder="Tìm và chọn học viên..."
          value={displayValue}
          onFocus={() => { setSearch(''); setOpen(true); }}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); setSearch(''); } }}
          autoComplete="off"
          style={{ paddingRight: 28 }}
        />
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text3)', fontSize: 10 }}>▼</span>
      </div>
      {/* hidden input for HTML5 required validation */}
      <input type="text" value={value} required readOnly tabIndex={-1}
        style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }} />
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 300,
          background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
          boxShadow: '0 8px 28px rgba(0,0,0,.18)', maxHeight: 280, overflowY: 'auto',
        }}>
          {filtered.length === 0
            ? <div style={{ padding: '10px 14px', color: 'var(--text3)', fontSize: 13 }}>Không tìm thấy học viên</div>
            : filtered.map(s => (
              <div key={s._id}
                onMouseDown={e => { e.preventDefault(); pick(s); }}
                style={{
                  padding: '9px 14px', cursor: 'pointer', fontSize: 13,
                  background: s._id === value ? 'rgba(59,130,246,.12)' : undefined,
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,.08)'}
                onMouseLeave={e => e.currentTarget.style.background = s._id === value ? 'rgba(59,130,246,.12)' : ''}
              >
                <strong style={{ color: 'var(--blue)' }}>{s.username}</strong>
                <span style={{ color: 'var(--text3)', fontSize: 12 }}>{s.email}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
