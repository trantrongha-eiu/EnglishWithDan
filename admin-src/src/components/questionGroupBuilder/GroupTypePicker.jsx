// Extracted from QuestionGroupBuilder.jsx — the "add group" type picker
// modal. Purely presentational: reads only the static GROUP_TYPES_* config
// and reports the chosen type via onSelect, no access to the builder's
// group-list state.
import { GROUP_TYPES_READING, GROUP_TYPES_LISTENING } from './constants';

export function GroupTypePicker({ context, onSelect, onClose }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Chọn loại nhóm câu hỏi</h3>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Mỗi loại hỗ trợ các dạng câu hỏi IELTS khác nhau — xem danh sách bên dưới</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxHeight: '75vh', overflowY: 'auto' }}>
          {(context === 'listening' ? GROUP_TYPES_LISTENING : GROUP_TYPES_READING).map(gt => (
            <div key={gt.value}
              onClick={() => onSelect(gt.value)}
              style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', transition: 'border-color .15s, background .15s', display: 'flex', flexDirection: 'column', gap: 4 }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#3d8bff'; e.currentTarget.style.background = 'rgba(61,139,255,.06)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = ''; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{gt.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{gt.label}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.4 }}>{gt.desc}</div>
              {gt.supports?.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 7, marginTop: 3 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Hỗ trợ dạng:</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {gt.supports.map((s, i) => (
                      <li key={i} style={{ fontSize: 10, color: 'var(--text2)', lineHeight: 1.4, display: 'flex', gap: 5 }}>
                        <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
