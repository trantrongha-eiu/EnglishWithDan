import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { displayName } from '../../utils/format';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import StudentTuitionModal from '../tuition/StudentTuitionModal';
import { MONTHS, YEARS, fmtVND, fmtLabel } from '../tuition/helpers';

// Class page "Học phí" tab — GET /classes/:id/tuition (rule in
// tuitionService.getClassTuition). Teachers see their own class read-only;
// admins also get the "Nhập/Xem học phí" button (StudentTuitionModal).

const STATUS = {
  missing: { label: 'Chưa nhập học phí', badge: 'badge-red', card: 'red' },
  unpaid: { label: 'Chưa thanh toán', badge: 'badge-yellow', card: 'yellow' },
  paid: { label: 'Đã đóng', badge: 'badge-green', card: 'green' },
};

export default function ClassTuitionTab({ cls }) {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [period, setPeriod] = useState(null); // null → server picks the class's billing month
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);

  const load = () => {
    const qs = period ? `?month=${period.month}&year=${period.year}` : '';
    return apiFetch(`/classes/${cls._id}/tuition${qs}`)
      .then((d) => { setData(d); if (!period) setPeriod(d.period); })
      .catch((e) => toast(e.message, 'error'));
  };
  useEffect(() => { load(); }, [cls._id, period?.month, period?.year]);

  const students = data?.students || [];
  const counts = { missing: 0, unpaid: 0, paid: 0 };
  students.forEach((s) => { counts[s.status] += 1; });
  const needle = q.trim().toLowerCase();
  const rows = students.filter((s) => (!status || s.status === status)
    && (!needle || [displayName(s), s.username, s.email].some((v) => (v || '').toLowerCase().includes(needle))));
  const setP = (k) => (e) => setPeriod((p) => ({ ...p, [k]: Number(e.target.value) }));

  return (
    <>
      <div className="stats-row cp-stats" style={{ marginBottom: 16 }}>
        {Object.entries(STATUS).map(([k, s]) => (
          <button key={k} type="button" className={`stat-card ${s.card}`}
            style={{ textAlign: 'left', cursor: 'pointer', outline: status === k ? '2px solid var(--blue)' : 'none' }}
            onClick={() => setStatus(status === k ? '' : k)}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{data ? counts[k] : '–'}</div>
          </button>
        ))}
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Tháng</label>
          <select className="form-input" value={period?.month || ''} onChange={setP('month')} disabled={!period}>
            {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Năm</label>
          <select className="form-input" value={period?.year || ''} onChange={setP('year')} disabled={!period}>
            {[...new Set([...YEARS, period?.year].filter(Boolean))].sort().map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Trạng thái</label>
          <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả</option>
            {Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
          <label className="form-label">Tìm học viên</label>
          <input className="form-input" type="search" placeholder="Tên, username, email…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
        Tính học phí tháng {period ? `${period.month}/${period.year}` : '…'} cho học viên đang học (hoặc học phí khóa học nhập từ lúc vào lớp).
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>HỌC VIÊN</th><th>TRẠNG THÁI</th><th>KHOẢN HỌC PHÍ</th><th>TỔNG NỢ</th>{isAdmin && <th />}</tr>
          </thead>
          <tbody>
            {!data ? <tr><td colSpan={5} className="table-empty">Đang tải...</td></tr>
              : rows.length === 0 ? <tr><td colSpan={5} className="table-empty">{students.length ? 'Không có học viên khớp bộ lọc' : 'Lớp chưa có học viên đang học'}</td></tr>
              : rows.map((s) => (
                <tr key={s.studentId}>
                  <td>
                    <Link to={`/students/${s.studentId}`}><strong>{displayName(s)}</strong></Link>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>@{s.username}</div>
                  </td>
                  <td><span className={`badge ${STATUS[s.status].badge}`}><span className="dot" />{STATUS[s.status].label}</span></td>
                  <td style={{ fontSize: 13 }}>
                    {s.fees.length === 0 ? <span style={{ color: 'var(--text3)' }}>—</span> : s.fees.map((f) => (
                      <div key={f._id}>
                        {fmtLabel(f)} · <b>{fmtVND(f.amount)}</b>{' '}
                        {f.isPaid
                          ? <span style={{ color: 'var(--green)' }}>✓ đã thu</span>
                          : <span style={{ color: 'var(--danger)' }}>chưa thu{f.studentNotified ? ' · HV báo đã CK' : ''}</span>}
                      </div>
                    ))}
                  </td>
                  <td style={{ fontSize: 13, fontWeight: 700, color: s.unpaidTotal ? 'var(--danger)' : 'var(--text3)' }}>
                    {s.unpaidTotal ? `${fmtVND(s.unpaidTotal)} (${s.unpaidCount} khoản)` : '—'}
                  </td>
                  {isAdmin && (
                    <td>
                      <button type="button" className={`btn btn-sm ${s.status === 'missing' ? 'btn-soft' : 'btn-ghost'}`} onClick={() => setEditing(s)}>
                        {s.status === 'missing' ? '＋ Nhập học phí' : 'Xem học phí'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <StudentTuitionModal
          user={{ _id: editing.studentId, username: editing.username }}
          initialPeriod={period}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </>
  );
}
