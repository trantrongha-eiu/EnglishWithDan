// Extracted from QuestionGroupBuilder.jsx — small presentational
// components and one pure helper shared across the group-type config
// editors (TableConfig, NoteConfig, etc.) and the main builder.
import { useState } from 'react';

export function InfoBox({ children }) {
  return (
    <div style={{ fontSize: 11, background: 'rgba(61,139,255,.08)', border: '1px solid rgba(61,139,255,.25)', borderRadius: 7, padding: '8px 11px', marginBottom: 10, color: 'var(--text2)', lineHeight: 1.6 }}>
      {children}
    </div>
  );
}

export function GuideBox({ title = 'Hướng dẫn nhập liệu', children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid rgba(61,139,255,.2)', borderRadius: 7, marginBottom: 10, overflow: 'hidden' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: '100%', textAlign: 'left', background: open ? 'rgba(61,139,255,.1)' : 'rgba(61,139,255,.05)', border: 'none', padding: '7px 11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--blue)', gap: 8 }}>
        <span>📖 {title}</span>
        <span style={{ fontSize: 10, opacity: .7 }}>{open ? '▲ Thu gọn' : '▼ Xem hướng dẫn'}</span>
      </button>
      {open && (
        <div style={{ fontSize: 11, padding: '10px 12px', color: 'var(--text2)', lineHeight: 1.8, background: 'rgba(61,139,255,.03)', borderTop: '1px solid rgba(61,139,255,.15)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function RemoveBtn({ onClick }) {
  return <button style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, padding: '2px 4px' }} onClick={onClick}>✕</button>;
}

export function formatRanges(nums) {
  if (!nums.length) return '';
  const sorted = [...nums].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0], end = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) { end = sorted[i]; }
    else { ranges.push(start === end ? `${start}` : `${start}–${end}`); start = end = sorted[i]; }
  }
  ranges.push(start === end ? `${start}` : `${start}–${end}`);
  return ranges.join(', ');
}
