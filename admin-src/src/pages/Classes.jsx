import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const POLICY_BLANK = {
  maxAbsencesAllowed: 3,
  warnThreshold: 2,
  excusedCountsAsAbsence: true,
  lateToAbsenceRatio: 2,
  lateThresholdMinutes: 15,
  failOnExceed: true,
};

const BLANK = {
  name: '', courseName: '', startDate: '', endDate: '',
  durationMonths: '', totalSessions: '', sessionsPerWeek: '', sessionsPerMonth: '',
  policy: { ...POLICY_BLANK },
};

function ClassModal({ onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setP = (k) => (e) => setForm((f) => ({ ...f, policy: { ...f.policy, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value } }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const d = await apiFetch('/classes', { method: 'POST', body: JSON.stringify(form) });
      toast('Đã tạo lớp');
      onSaved(d.class);
      onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Tạo lớp mới</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tên lớp *</label>
            <input className="form-input" value={form.name} onChange={set('name')} required placeholder="IELTS 6.0 – Tối 2-4-6" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Khóa học</label>
            <input className="form-input" value={form.courseName} onChange={set('courseName')} placeholder="IELTS Foundation" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ngày bắt đầu</label>
              <input className="form-input" type="date" value={form.startDate} onChange={set('startDate')} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ngày kết thúc</label>
              <input className="form-input" type="date" value={form.endDate} onChange={set('endDate')} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Số tháng</label>
              <input className="form-input" type="number" min={0} value={form.durationMonths} onChange={set('durationMonths')} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tổng số buổi</label>
              <input className="form-input" type="number" min={1} value={form.totalSessions} onChange={set('totalSessions')} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Buổi / tuần</label>
              <input className="form-input" type="number" min={0} value={form.sessionsPerWeek} onChange={set('sessionsPerWeek')} />
            </div>
          </div>

          <fieldset style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
            <legend style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', padding: '0 6px' }}>Quy định chuyên cần</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Số buổi được phép nghỉ (rớt nếu vượt)</label>
                <input className="form-input" type="number" min={0} value={form.policy.maxAbsencesAllowed} onChange={setP('maxAbsencesAllowed')} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ngưỡng cảnh báo (buổi)</label>
                <input className="form-input" type="number" min={0} value={form.policy.warnThreshold} onChange={setP('warnThreshold')} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Số lần trễ = 1 buổi vắng</label>
                <input className="form-input" type="number" min={1} value={form.policy.lateToAbsenceRatio} onChange={setP('lateToAbsenceRatio')} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Đến muộn quá (phút) = trễ</label>
                <input className="form-input" type="number" min={0} value={form.policy.lateThresholdMinutes} onChange={setP('lateThresholdMinutes')} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)', marginTop: 10 }}>
              <input type="checkbox" checked={form.policy.excusedCountsAsAbsence} onChange={setP('excusedCountsAsAbsence')} /> Vắng có phép vẫn tính vào giới hạn nghỉ
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)', marginTop: 6 }}>
              <input type="checkbox" checked={form.policy.failOnExceed} onChange={setP('failOnExceed')} /> Tự động đánh dấu "Rớt khóa" khi vượt giới hạn
            </label>
          </fieldset>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : '💾 Tạo lớp'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Classes() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const load = () => apiFetch('/classes')
    .then((d) => setClasses(d.classes || []))
    .catch((e) => toast(e.message, 'error'))
    .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const rows = classes.filter((c) => (showArchived ? true : c.status !== 'archived'));

  return (
    <>
      {showModal && <ClassModal onClose={() => setShowModal(false)} onSaved={load} />}

      <div className="section-header">
        <h2 className="section-title">Lớp & Điểm danh ({rows.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Tạo lớp</button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)' }}>
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Hiện cả lớp đã lưu trữ
        </label>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>TÊN LỚP</th>
              {isAdmin && <th>GIÁO VIÊN</th>}
              <th>KHÓA HỌC</th>
              <th>HỌC VIÊN</th>
              <th>CẢNH BÁO / RỚT</th>
              <th>BẮT ĐẦU</th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={isAdmin ? 7 : 6} className="table-empty">Đang tải...</td></tr>
              : rows.length === 0
              ? <tr><td colSpan={isAdmin ? 7 : 6} className="table-empty">Chưa có lớp nào</td></tr>
              : rows.map((c) => {
                const k = c.enrollmentCounts || {};
                return (
                  <tr key={c._id}>
                    <td><Link to={`/classes/${c._id}`} style={{ fontWeight: 700, color: 'var(--purple)' }}>{c.name}</Link></td>
                    {isAdmin && <td style={{ fontSize: 13 }}>{c.teacher?.name || c.teacher?.username || '–'}</td>}
                    <td style={{ fontSize: 13 }}>{c.courseName || '–'}</td>
                    <td style={{ fontSize: 13 }}>{k.total || 0}</td>
                    <td style={{ fontSize: 13 }}>
                      <span className="badge badge-yellow" style={{ marginRight: 4 }}>{k.warning || 0} ⚠️</span>
                      <span className="badge badge-red">{k.failed || 0} ⛔</span>
                    </td>
                    <td style={{ fontSize: 13 }}>{c.startDate ? formatDate(c.startDate).slice(0, 10) : '–'}</td>
                    <td><span className={`badge ${c.status === 'archived' ? 'badge-gray' : 'badge-green'}`}><span className="dot" />{c.status === 'archived' ? 'Lưu trữ' : 'Đang học'}</span></td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
}
