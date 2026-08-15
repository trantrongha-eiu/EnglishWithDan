// Extracted from QuestionGroupBuilder.jsx — small presentational
// components and one pure helper shared across the group-type config
// editors (TableConfig, NoteConfig, etc.) and the main builder.
import { useState } from 'react';

export function InfoBox({ children }) {
  return (
    <div className="hint-box" style={{ fontSize: 11, padding: '8px 11px', marginBottom: 10, lineHeight: 1.6 }}>
      {children}
    </div>
  );
}

export function GuideBox({ title = 'Hướng dẫn nhập liệu', children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid var(--info-border)', borderRadius: 7, marginBottom: 10, overflow: 'hidden' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: '100%', textAlign: 'left', background: open ? 'var(--info-bg-strong)' : 'var(--info-bg)', border: 'none', padding: '7px 11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--text)', gap: 8 }}>
        <span>📖 {title}</span>
        <span style={{ fontSize: 10, opacity: .7 }}>{open ? '▲ Thu gọn' : '▼ Xem hướng dẫn'}</span>
      </button>
      {open && (
        <div style={{ fontSize: 11, padding: '10px 12px', color: 'var(--text2)', lineHeight: 1.8, background: 'var(--info-bg)', borderTop: '1px solid var(--info-border)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function RemoveBtn({ onClick }) {
  return <button style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, padding: '2px 4px' }} onClick={onClick}>✕</button>;
}
