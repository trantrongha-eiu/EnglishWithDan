import { useEffect, useRef, useState } from 'react';

// "⋯" overflow menu for table rows — keeps rows to one or two primary
// buttons instead of 6–7 inline ones. Closes on outside click / Escape.
// items: [{ label, onClick, danger, hidden } | 'sep']
export default function RowMenu({ items, label = 'Thêm thao tác' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onDoc(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    function onKey(e) { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('button')?.focus(); } }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const visible = items.filter(i => i === 'sep' || !i.hidden);
  // Drop separators at the edges / doubled up after hidden items.
  const cleaned = visible.filter((i, idx) => i !== 'sep' || (idx > 0 && idx < visible.length - 1 && visible[idx - 1] !== 'sep'));
  if (!cleaned.some(i => i !== 'sep')) return null;

  return (
    <div className="menu-wrap" ref={ref}>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-icon"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        onClick={() => setOpen(o => !o)}
      >⋯</button>
      {open && (
        <div className="menu" role="menu">
          {cleaned.map((i, idx) => (i === 'sep'
            ? <div key={`sep-${idx}`} className="menu-sep" role="separator" />
            : (
              <button
                key={i.label}
                type="button"
                role="menuitem"
                className={`menu-item${i.danger ? ' menu-item--danger' : ''}`}
                onClick={() => { setOpen(false); i.onClick(); }}
              >{i.label}</button>
            )))}
        </div>
      )}
    </div>
  );
}
