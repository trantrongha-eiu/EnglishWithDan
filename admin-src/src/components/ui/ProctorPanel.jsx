import { useState } from 'react';
import Modal from './Modal';
import { formatDate } from '../../utils/api';

// Proctoring log of one proctored attempt (Test Simulation, Full Mock Test,
// Entrance Test): strike count, each strike, and the screenshot of the
// student's shared screen taken right after it (see backend
// services/proctorShotService.js). Was duplicated in MockTests.jsx and
// EntranceTest.jsx before screenshots existed.

export const PROCTOR_LABEL = {
  hidden: 'Ẩn tab / chuyển tab',
  blur: 'Mất focus cửa sổ (chuyển ứng dụng)',
  'unload-attempt': 'Định đóng / tải lại tab',
  'share-stopped': 'Dừng chia sẻ màn hình',
};

const CAPTURE_NOTE = {
  unsupported: 'thiết bị không hỗ trợ chụp màn hình (điện thoại / máy tính bảng)',
  none: 'không có chia sẻ màn hình',
};

function ShotGrid({ shots }) {
  if (!shots?.length) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginTop: 12 }}>
      {shots.map((s, i) => (
        <a key={s.url || i} href={s.url} target="_blank" rel="noopener noreferrer"
          title="Mở ảnh gốc"
          style={{ display: 'block', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--surface2)', textDecoration: 'none' }}>
          <img src={s.url} alt={`Ảnh màn hình lúc vi phạm ${i + 1}`} loading="lazy"
            style={{ display: 'block', width: '100%', aspectRatio: '16 / 10', objectFit: 'cover' }} />
          <div style={{ padding: '5px 8px', fontSize: 11, color: 'var(--text2)' }}>
            <strong>{PROCTOR_LABEL[s.type] || s.type}</strong>
            {s.skill && <span> · {s.skill}</span>}
            <div style={{ color: 'var(--text3)' }}>{formatDate(s.at)}</div>
          </div>
        </a>
      ))}
    </div>
  );
}

export default function ProctorPanel({ proctor }) {
  const p = proctor || {};
  const events = p.events || [];
  return (
    <div style={{
      background: p.violated ? 'rgba(198,40,40,.08)' : 'var(--surface2)',
      border: `1px solid ${p.violated ? 'var(--danger)' : 'var(--border)'}`,
      borderRadius: 10, padding: '12px 14px',
    }}>
      <div style={{ fontWeight: 700, marginBottom: events.length ? 10 : 0 }}>
        {p.violated ? '⚠️ ' : '✅ '}Proctoring: {p.violationCount || 0} gậy
        {p.violated && <span style={{ color: 'var(--danger)' }}> · Bị đánh dấu vi phạm</span>}
        {p.shots?.length > 0 && <span style={{ fontWeight: 400, color: 'var(--text2)' }}> · {p.shots.length} ảnh màn hình</span>}
      </div>
      {events.length > 0 && (
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: 'var(--text2)', display: 'grid', gap: 4 }}>
          {events.map((e, i) => (
            <li key={i}>
              <strong>{PROCTOR_LABEL[e.type] || e.type}</strong>
              {e.skill && <span> · {e.skill}</span>}
              <span style={{ color: 'var(--text3)' }}> · {formatDate(e.at)}</span>
              {CAPTURE_NOTE[e.capture] && <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}> · {CAPTURE_NOTE[e.capture]}</span>}
            </li>
          ))}
        </ol>
      )}
      <ShotGrid shots={p.shots} />
      {p.shots?.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)' }}>
          Ảnh màn hình tự động xoá sau 30 ngày (kể từ lúc chụp).
        </div>
      )}
    </div>
  );
}

// "📷 N ảnh" on a recent-attempts row → the same panel in a modal.
export function ProctorShotsButton({ row }) {
  const [open, setOpen] = useState(false);
  const shots = row.shots || [];
  if (!shots.length && !(row.proctorEvents || []).length) return null;
  return (
    <>
      <button type="button" className="badge badge-gray" onClick={() => setOpen(true)}
        style={{ fontSize: 10, border: 'none', cursor: 'pointer' }}
        title="Xem nhật ký giám sát và ảnh màn hình lúc vi phạm">
        📷 {shots.length} ảnh
      </button>
      {open && (
        <Modal title="Nhật ký giám sát" width={760} onClose={() => setOpen(false)}>
          <ProctorPanel proctor={{
            violationCount: row.violationCount, violated: row.violated,
            events: row.proctorEvents, shots,
          }} />
        </Modal>
      )}
    </>
  );
}
