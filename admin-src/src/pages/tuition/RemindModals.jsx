// Extracted from Tuition.jsx — the single-fee remind modal and the
// bulk-remind modal. Both are self-contained overlays driven entirely by
// props; neither reaches into any of Tuition's other tab state.
import { MONTHS, YEARS, fmtVND, fmtLabel } from './helpers';

export function RemindModal({ remindFee, remindMsg, setRemindMsg, sendingRemind, onSend, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 28, width: 480, maxWidth: '95vw' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>📩 Gửi nhắc nhở học phí</h3>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16 }}>
          Gửi tới: <strong>{remindFee.studentId?.username}</strong> — {fmtLabel(remindFee)} — {fmtVND(remindFee.amount)}
        </p>
        <div className="form-group" style={{ margin: '0 0 16px' }}>
          <label className="form-label">Nội dung (để trống dùng mặc định)</label>
          <textarea className="form-input" rows={5} value={remindMsg} onChange={e => setRemindMsg(e.target.value)}
            placeholder="Để trống để dùng nội dung mặc định..." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
          <button className="btn btn-primary" onClick={onSend} disabled={sendingRemind}>
            {sendingRemind ? 'Đang gửi...' : '📤 Gửi nhắc nhở'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BulkRemindModal({ bulkMonth, setBulkMonth, bulkYear, setBulkYear, bulkMsg, setBulkMsg, sendingBulk, onSend, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 28, width: 480, maxWidth: '95vw' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>📣 Nhắc hàng loạt học phí chưa đóng</h3>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div className="form-group" style={{ margin: 0, flex: 1 }}>
            <label className="form-label">Tháng</label>
            <select className="form-input" value={bulkMonth} onChange={e => setBulkMonth(e.target.value)}>
              {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0, flex: 1 }}>
            <label className="form-label">Năm</label>
            <select className="form-input" value={bulkYear} onChange={e => setBulkYear(e.target.value)}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group" style={{ margin: '0 0 16px' }}>
          <label className="form-label">Nội dung tùy chỉnh (để trống = mặc định)</label>
          <textarea className="form-input" rows={4} value={bulkMsg} onChange={e => setBulkMsg(e.target.value)}
            placeholder="Để trống dùng nội dung tự động..." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
          <button className="btn btn-primary" onClick={onSend} disabled={sendingBulk}>
            {sendingBulk ? 'Đang gửi...' : `📤 Gửi cho tất cả chưa đóng tháng ${bulkMonth}/${bulkYear}`}
          </button>
        </div>
      </div>
    </div>
  );
}
