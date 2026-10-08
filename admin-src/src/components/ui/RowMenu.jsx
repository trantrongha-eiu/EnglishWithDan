import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// "⋯" overflow menu for table rows — keeps rows to one or two primary
// buttons instead of 6–7 inline ones. Closes on outside click / Escape.
// items: [{ label, onClick, danger, hidden } | 'sep']
//
// The menu is portalled to <body> with fixed positioning: rendered inside
// the row it was clipped by .table-wrap (overflow-x: auto also clips
// vertically), so with only one or two rows — e.g. after a search — just a
// sliver of it showed. It opens below the button, or above when there's no
// room below, and closes when the page scrolls or resizes.
export default function RowMenu({ items, label = 'Thêm thao tác' }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onDoc(e) {
      if (!ref.current?.contains(e.target) && !menuRef.current?.contains(e.target)) setOpen(false);
    }
    function onKey(e) { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('button')?.focus(); } }
    function onMove(e) { if (!menuRef.current?.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const btn = ref.current?.querySelector('button');
    const menu = menuRef.current;
    if (!btn || !menu) return;
    const r = btn.getBoundingClientRect();
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    const gap = 4, edge = 8;
    let top = r.bottom + gap;
    if (top + mh > window.innerHeight - edge && r.top - gap - mh >= edge) top = r.top - gap - mh;
    const left = Math.max(edge, Math.min(r.right - mw, window.innerWidth - mw - edge));
    setPos({ top, left });
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
        // Drop the last placement so a reopen is measured afresh (hidden) —
        // the only way the menu opens, so the layout effect needn't reset it.
        onClick={() => { setPos(null); setOpen(o => !o); }}
      >⋯</button>
      {open && createPortal(
        <div
          className="menu menu--floating"
          role="menu"
          ref={menuRef}
          // Measured first (hidden), then placed — see useLayoutEffect above.
          style={pos ? { top: pos.top, left: pos.left } : { top: 0, left: 0, visibility: 'hidden' }}
        >
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
        </div>,
        document.body,
      )}
    </div>
  );
}
