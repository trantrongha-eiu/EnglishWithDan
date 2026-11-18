import { useEffect } from 'react';

// Same markup/classes as the static pages' modals (.modal-overlay/.modal-box
// in components.css), so it looks identical.
export default function Modal({ title, onClose, children, footer, size = 'modal-sm' }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      // a confirm opened on top takes the key (it closes first)
      if (document.querySelector('.modal-overlay [role="alertdialog"]')) return;
      onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal-box ${size}`} role="dialog" aria-modal="true">
        {title && (
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="modal-close" aria-label="Đóng" onClick={onClose}>×</button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Xác nhận xoá', confirmClass = 'btn-danger', onConfirm, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [onClose]);
  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box modal-sm" role="alertdialog" aria-modal="true">
        <div className="modal-body" style={{ textAlign: 'center', padding: '28px 24px' }}>
          <div className="danger-icon">⚠️</div>
          <h3 style={{ marginBottom: 8 }}>{title}</h3>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
          <button className={`btn ${confirmClass}`} onClick={() => { onClose(); onConfirm(); }} autoFocus>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
