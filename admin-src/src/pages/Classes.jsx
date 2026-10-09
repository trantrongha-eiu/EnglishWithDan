import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { ProgressRing, ProgressChips, WeekTrack } from './classes/ClassProgress';
import { phaseText, keyLabel, relDay, sessionName } from './classes/classProgressUtils';

const POLICY_BLANK = {
  maxAbsencesAllowed: 3,
  warnThreshold: 1.5,
  excusedCountsAsAbsence: true,
  lateToAbsenceRatio: 2,
  lateThresholdMinutes: 15,
  failOnExceed: true,
};

const BLANK = {
  name: '', courseName: '', startDate: '', endDate: '',
  durationMonths: '', totalSessions: '', sessionsPerWeek: '', sessionsPerMonth: '', startTime: '',
  policy: { ...POLICY_BLANK },
};

function ClassModal({ onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  // Changing the allowed absences re-derives the warn threshold as half of it
  // (owner's rule: remind from the half-way mark) — still editable after.
  const setP = (k) => (e) => setForm((f) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const policy = { ...f.policy, [k]: v };
    if (k === 'maxAbsencesAllowed' && v !== '' && Number(v) >= 0) policy.warnThreshold = Number(v) / 2;
    return { ...f, policy };
  });

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
          <div className="cp-time-box">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">🕒 Giờ vào học</label>
              <input className="form-input" type="time" value={form.startTime} onChange={set('startTime')} style={{ width: 140 }} />
            </div>
            <div className="cp-time-hint">
              Tới giờ này mà chưa điểm danh, hệ thống <b>tự điểm danh tất cả học viên có mặt</b> — bạn vẫn sửa lại được.
              Để trống = tự điểm danh vào cuối ngày học.
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
                <label className="form-label">Ngưỡng nhắc nhở / cảnh báo (buổi) — mặc định ½ số buổi được phép</label>
                <input className="form-input" type="number" min={0} step={0.5} value={form.policy.warnThreshold} onChange={setP('warnThreshold')} />
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

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'today', label: '🔔 Có buổi hôm nay' },
  { key: 'risk', label: '⚠️ Có học viên cảnh báo' },
  { key: 'pending', label: '📝 Chưa điểm danh' },
];

function ClassCard({ c, isAdmin, idx }) {
  const k = c.enrollmentCounts || {};
  const p = c.progress;
  const archived = c.status === 'archived';
  const today = p?.todaySession;
  const teacher = isAdmin ? (c.teacher?.name || c.teacher?.username) : '';
  return (
    <Link to={`/classes/${c._id}`} className={`cp-card${archived ? ' cp-card--archived' : ''}${today ? ' cp-card--today' : ''}`} style={{ '--i': idx }}>
      <div className="cp-card-head">
        <div style={{ minWidth: 0 }}>
          <div className="cp-card-title">{c.name}</div>
          <div className="cp-card-sub">
            {[c.courseName, teacher ? `GV: ${teacher}` : '', c.startTime ? `🕒 ${c.startTime}` : ''].filter(Boolean).join(' · ')
              || (c.startDate ? `Bắt đầu ${formatDate(c.startDate).slice(0, 10)}` : 'Chưa có thông tin khóa')}
          </div>
        </div>
        <span className={`badge ${archived ? 'badge-gray' : p?.phase === 'upcoming' ? 'badge-blue' : p?.phase === 'ended' ? 'badge-purple' : 'badge-green'}`}>
          <span className="dot" />{archived ? 'Lưu trữ' : p?.phase === 'upcoming' ? 'Sắp khai giảng' : p?.phase === 'ended' ? 'Đã kết thúc' : 'Đang học'}
        </span>
      </div>

      {p && (
        <div className="cp-card-prog">
          <ProgressRing pct={p.percent || 0} size={64} stroke={6} />
          <div className="cp-card-prog-main">
            <ProgressChips progress={p} compact />
            <div className="cp-phase">{phaseText(p)}</div>
            <WeekTrack progress={p} />
          </div>
        </div>
      )}

      {p && (today || p.nextSession) && (
        <div className={`cp-next${today ? ' cp-next--today' : ''}`}>
          {today ? <span className="cp-dot" /> : <span aria-hidden="true">🗓️</span>}
          {today
            ? <span><b>Hôm nay: {sessionName(today)}</b>{today.startTime ? ` · ${today.startTime}` : ''}{today.status === 'held' ? ' · đã điểm danh ✓' : ''}{today.autoMarked && <span className="cp-auto">tự động</span>}</span>
            : <span>Tiếp theo: <b>{sessionName(p.nextSession)}</b> · {keyLabel(p.nextSession.dayKey)} <span className="cp-muted">({relDay(p.today, p.nextSession.dayKey)})</span></span>}
        </div>
      )}

      <div className="cp-card-foot">
        <span title="Sĩ số">👥 <b>{k.total || 0}</b> học viên</span>
        {(k.warning || 0) > 0 && <span className="badge badge-yellow">{k.warning} cảnh báo</span>}
        {(k.failed || 0) > 0 && <span className="badge badge-red">{k.failed} rớt</span>}
        {p?.pendingPastSessions > 0 && <span className="badge badge-yellow" title="Buổi đã qua vẫn ở trạng thái Dự kiến">📝 {p.pendingPastSessions} chưa điểm danh</span>}
        <span className="cp-card-go">Mở lớp →</span>
      </div>
    </Link>
  );
}

export default function Classes() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  const load = () => apiFetch('/classes')
    .then((d) => setClasses(d.classes || []))
    .catch((e) => toast(e.message, 'error'))
    .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const needle = q.trim().toLowerCase();
  const rank = (c) => (c.status === 'archived' ? 5 : c.progress?.todaySession ? 0
    : ({ ongoing: 1, upcoming: 2, unscheduled: 3, ended: 4 })[c.progress?.phase] ?? 3);
  const rows = classes
    .filter((c) => (showArchived ? true : c.status !== 'archived'))
    .filter((c) => !needle || [c.name, c.courseName, c.teacher?.name].filter(Boolean).some((v) => v.toLowerCase().includes(needle)))
    .filter((c) => {
      const k = c.enrollmentCounts || {};
      if (filter === 'today') return !!c.progress?.todaySession;
      if (filter === 'risk') return (k.warning || 0) + (k.failed || 0) > 0;
      if (filter === 'pending') return (c.progress?.pendingPastSessions || 0) > 0;
      return true;
    })
    // Classes meeting today first, then ongoing, upcoming, ended, archived.
    .sort((a, b) => rank(a) - rank(b));
  const live = classes.filter((c) => c.status !== 'archived');
  const kpi = {
    active: live.length,
    today: live.filter((c) => c.progress?.todaySession).length,
    students: classes.reduce((n, c) => n + (c.enrollmentCounts?.total || 0), 0),
    atRisk: classes.reduce((n, c) => n + (c.enrollmentCounts?.warning || 0) + (c.enrollmentCounts?.failed || 0), 0),
  };

  return (
    <>
      {showModal && <ClassModal onClose={() => setShowModal(false)} onSaved={load} />}

      <div className="section-header">
        <h2 className="section-title">Lớp & Điểm danh ({rows.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Tạo lớp</button>
      </div>

      {!loading && classes.length > 0 && (
        <div className="stats-row cp-stats" style={{ marginBottom: 20 }}>
          <div className="stat-card blue"><div className="stat-label">Lớp đang học</div><div className="stat-value">{kpi.active}</div></div>
          <div className="stat-card green"><div className="stat-label">Có buổi hôm nay</div><div className="stat-value">{kpi.today}</div></div>
          <div className="stat-card yellow"><div className="stat-label">Tổng học viên</div><div className="stat-value">{kpi.students}</div></div>
          <div className="stat-card red"><div className="stat-label">Cảnh báo / Rớt</div><div className="stat-value">{kpi.atRisk}</div></div>
        </div>
      )}

      <div className="filter-bar cp-filter" style={{ marginBottom: 16 }}>
        <input className="form-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Tìm lớp, khóa học…" style={{ maxWidth: 260 }} />
        <div className="cp-filter-chips">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" className={`cp-fchip${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)', marginLeft: 'auto' }}>
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Hiện cả lớp đã lưu trữ
        </label>
      </div>

      {loading ? (
        <div className="cp-grid">{[0, 1, 2].map((i) => <div key={i} className="cp-card cp-card--skeleton" />)}</div>
      ) : rows.length === 0 ? (
        <div className="cp-empty">
          <div style={{ fontSize: 36 }}>🏫</div>
          <div>{classes.length ? 'Không có lớp nào khớp bộ lọc' : 'Chưa có lớp nào'}</div>
          {!classes.length && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Tạo lớp đầu tiên</button>}
        </div>
      ) : (
        <div className="cp-grid">
          {rows.map((c, i) => <ClassCard key={c._id} c={c} isAdmin={isAdmin} idx={i} />)}
        </div>
      )}
    </>
  );
}
