import { useEffect, useId, useRef } from 'react';

// Accessible modal shell: role="dialog" + aria-modal + labelled title,
// Escape to close, focus moved into the dialog on open and restored on
// close, Tab kept inside. The 28 hand-rolled `modal-overlay` blocks across
// the older pages had none of these; new/rewritten dialogs use this.
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ title, onClose, children, footer, width = 520, busy = false }) {
  const titleId = useId();
  const ref = useRef(null);
  // Latest callbacks in refs so the mount effect below runs exactly once —
  // re-running it per render (inline onClose) would steal focus mid-typing.
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  useEffect(() => { closeRef.current = onClose; busyRef.current = busy; });

  useEffect(() => {
    const prev = document.activeElement;
    const node = ref.current;
    const first = node?.querySelector('[autofocus]') || node?.querySelector(FOCUSABLE);
    (first || node)?.focus();

    function onKey(e) {
      if (e.key === 'Escape' && !busyRef.current) { e.stopPropagation(); closeRef.current?.(); }
      if (e.key === 'Tab' && node) {
        const items = [...node.querySelectorAll(FOCUSABLE)];
        if (!items.length) return;
        const firstEl = items[0], lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (prev && typeof prev.focus === 'function') prev.focus();
    };
  }, []);

  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget && !busy) onClose?.(); }}>
      <div
        ref={ref}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{ maxWidth: width }}
      >
        <div className="modal-header">
          <h3 className="modal-title" id={titleId}>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng" disabled={busy}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
