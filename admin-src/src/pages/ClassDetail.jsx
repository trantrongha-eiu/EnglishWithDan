import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { apiFetch, formatDate, API } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

const MARK_OPTS = [
  { v: 'present', label: 'Có mặt', cls: 'badge-green' },
  { v: 'late', label: 'Đi trễ', cls: 'badge-yellow' },
  { v: 'excused', label: 'Vắng có phép', cls: 'badge-blue' },
  { v: 'absent', label: 'Vắng', cls: 'badge-red' },
];
const ENR_BADGE = { active: 'badge-green', warning: 'badge-yellow', failed: 'badge-red', completed: 'badge-blue', dropped: 'badge-gray' };
const ENR_LABEL = { active: 'Đang học', warning: 'Cảnh báo', failed: 'Rớt khóa', completed: 'Hoàn thành', dropped: 'Nghỉ học' };

const TABS = [
  { key: 'overview', label: '⚙️ Tổng quan' },
  { key: 'students', label: '👥 Học viên' },
  { key: 'sessions', label: '📅 Buổi học' },
  { key: 'attendance', label: '✅ Điểm danh' },
  { key: 'dashboard', label: '📊 Chuyên cần' },
  { key: 'assignments', label: '📚 Bài tập' },
];

const RESOURCE_CATS = [
  { type: 'reading_test', label: 'Bộ đề Reading' },
  { type: 'listening_test', label: 'Đề Listening' },
  { type: 'reading_practice', label: 'Bài đọc lẻ (Passage)' },
  { type: 'listening_practice', label: 'Bài nghe lẻ (Section)' },
  { type: 'dictation', label: 'Dictation' },
  { type: 'writing_exam', label: 'Đề Writing' },
  { type: 'task2', label: 'Task 2 Writing' },
  { type: 'speaking', label: 'Speaking' },
  { type: 'grammar', label: 'Essential Grammar' },
  { type: 'vocabulary_lesson', label: 'Vocabulary Lessons' },
  { type: 'mock_test', label: 'Thi thử 4 kỹ năng' },
];
const RES_LABEL = Object.fromEntries(RESOURCE_CATS.map((r) => [r.type, r.label]));
const ASG_STATUS = { not_started: 'badge-gray', in_progress: 'badge-blue', completed: 'badge-green', overdue: 'badge-red' };
const ASG_LABEL = { not_started: 'Chưa làm', in_progress: 'Đang làm', completed: 'Hoàn thành', overdue: 'Quá hạn' };

export default function ClassDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const active = TABS.find((t) => t.key === params.get('tab')) || TABS[0];
  const [cls, setCls] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClass = () => apiFetch(`/classes/${id}`)
    .then((d) => { setCls(d.class); setRoster(d.roster || []); })
    .catch((e) => toast(e.message, 'error'))
    .finally(() => setLoading(false));
  useEffect(() => { loadClass(); }, [id]);

  if (loading) return <div className="route-loading">Đang tải…</div>;
  if (!cls) return <div className="section-header"><h2 className="section-title">Không tìm thấy lớp</h2></div>;

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">
          <Link to="/classes" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Lớp</Link> › {cls.name}
          {cls.status === 'archived' && <span className="badge badge-gray" style={{ marginLeft: 8 }}>Lưu trữ</span>}
        </h2>
      </div>

      <div className="inner-tabs-nav" style={{ marginBottom: 18 }}>
        {TABS.map((t) => (
          <button key={t.key} className={`inner-tab${t.key === active.key ? ' active' : ''}`}
            onClick={() => setParams(t.key === 'overview' ? {} : { tab: t.key }, { replace: true })}>
            {t.label}
          </button>
        ))}
      </div>

      {active.key === 'overview' && <OverviewTab cls={cls} onSaved={loadClass} />}
      {active.key === 'students' && <StudentsTab cls={cls} roster={roster} onChange={loadClass} />}
      {active.key === 'sessions' && <SessionsTab cls={cls} />}
      {active.key === 'attendance' && <AttendanceTab cls={cls} />}
      {active.key === 'dashboard' && <DashboardTab cls={cls} />}
      {active.key === 'assignments' && <AssignmentsTab cls={cls} />}
    </>
  );
}

// ── Overview + policy ────────────────────────────────────────────────

function OverviewTab({ cls, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(() => ({
    name: cls.name || '', courseName: cls.courseName || '',
    startDate: cls.startDate ? cls.startDate.slice(0, 10) : '',
    endDate: cls.endDate ? cls.endDate.slice(0, 10) : '',
    durationMonths: cls.durationMonths ?? '', totalSessions: cls.totalSessions ?? '',
    sessionsPerWeek: cls.sessionsPerWeek ?? '', sessionsPerMonth: cls.sessionsPerMonth ?? '',
    policy: { ...cls.policy },
  }));
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setP = (k) => (e) => setForm((f) => ({ ...f, policy: { ...f.policy, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value } }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/classes/${cls._id}`, { method: 'PUT', body: JSON.stringify(form) });
      toast('Đã lưu');
      onSaved();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function toggleArchive() {
    try {
      await apiFetch(`/classes/${cls._id}/status`, { method: 'POST', body: JSON.stringify({ status: cls.status === 'archived' ? 'active' : 'archived' }) });
      toast(cls.status === 'archived' ? 'Đã mở lại lớp' : 'Đã lưu trữ lớp');
      onSaved();
    } catch (err) { toast(err.message, 'error'); }
  }

  return (
    <form onSubmit={save} style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Tên lớp</label>
        <input className="form-input" value={form.name} onChange={set('name')} required />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Khóa học</label>
        <input className="form-input" value={form.courseName} onChange={set('courseName')} />
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
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
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Buổi / tháng</label>
          <input className="form-input" type="number" min={0} value={form.sessionsPerMonth} onChange={set('sessionsPerMonth')} />
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
          <input type="checkbox" checked={!!form.policy.excusedCountsAsAbsence} onChange={setP('excusedCountsAsAbsence')} /> Vắng có phép vẫn tính vào giới hạn nghỉ
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)', marginTop: 6 }}>
          <input type="checkbox" checked={!!form.policy.failOnExceed} onChange={setP('failOnExceed')} /> Tự động đánh dấu "Rớt khóa" khi vượt giới hạn
        </label>
      </fieldset>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}</button>
        <button type="button" className="btn btn-ghost" onClick={toggleArchive}>{cls.status === 'archived' ? 'Mở lại lớp' : 'Lưu trữ lớp'}</button>
      </div>
    </form>
  );
}

// ── Students / roster ────────────────────────────────────────────────

function StudentsTab({ cls, roster, onChange }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);

  async function add(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    try {
      const d = await apiFetch(`/classes/${cls._id}/students`, { method: 'POST', body: JSON.stringify({ email: email.trim() }) });
      toast(d.added?.length ? `Đã thêm ${d.added.length} học viên` : 'Không thêm được');
      setEmail('');
      onChange();
    } catch (err) { toast(err.message, 'error'); }
    finally { setAdding(false); }
  }

  function remove(enr) {
    confirm(`Xoá "${enr.student.name || enr.student.username}" khỏi lớp? Lịch sử điểm danh vẫn được giữ lại.`, async () => {
      try {
        await apiFetch(`/classes/${cls._id}/students/${enr.enrollmentId}`, { method: 'DELETE' });
        toast('Đã xoá khỏi lớp');
        onChange();
      } catch (err) { toast(err.message, 'error'); }
    });
  }

  async function setStatus(enr, status) {
    try {
      await apiFetch(`/classes/${cls._id}/students/${enr.enrollmentId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      toast('Đã cập nhật trạng thái');
      onChange();
    } catch (err) { toast(err.message, 'error'); }
  }

  return (
    <>
      <form onSubmit={add} className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <input className="form-input" placeholder="Email học viên cần thêm..." value={email} onChange={(e) => setEmail(e.target.value)} style={{ maxWidth: 320 }} />
        <button className="btn btn-primary" disabled={adding}>{adding ? 'Đang thêm...' : '+ Thêm học viên'}</button>
      </form>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>HỌC VIÊN</th><th>ĐÃ HỌC</th><th>ĐÃ NGHỈ</th><th>TRỄ</th><th>CHUYÊN CẦN</th><th>CÒN ĐƯỢC NGHỈ</th><th>TRẠNG THÁI</th><th></th></tr>
          </thead>
          <tbody>
            {roster.length === 0
              ? <tr><td colSpan={8} className="table-empty">Chưa có học viên</td></tr>
              : roster.map((e) => {
                const s = e.stats || {};
                const absent = (s.absentUnexcused || 0) + (s.absentExcused || 0);
                return (
                  <tr key={e.enrollmentId}>
                    <td>
                      <strong>{e.student.name || e.student.username}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{e.student.email}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{s.attendedCount || 0}/{s.heldSessions || 0}</td>
                    <td style={{ fontSize: 13 }}>{absent}{s.absentExcused ? ` (${s.absentExcused} có phép)` : ''}</td>
                    <td style={{ fontSize: 13 }}>{s.lateCount || 0}</td>
                    <td style={{ fontSize: 13 }}>{s.attendanceRate || 0}%</td>
                    <td style={{ fontSize: 13 }}>{s.remainingAllowed ?? '–'}</td>
                    <td>
                      <span className={`badge ${ENR_BADGE[e.status] || 'badge-gray'}`}><span className="dot" />{ENR_LABEL[e.status] || e.status}</span>
                      {e.statusReason && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{e.statusReason}</div>}
                    </td>
                    <td>
                      <div className="row-actions">
                        <select className="form-input" style={{ width: 130, fontSize: 12, padding: '4px 6px' }} value=""
                          onChange={(ev) => { if (ev.target.value) setStatus(e, ev.target.value); }}>
                          <option value="">Đặt trạng thái…</option>
                          <option value="active">Đang học (auto)</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="dropped">Nghỉ học</option>
                        </select>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => remove(e)} title="Xoá khỏi lớp">🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Sessions ─────────────────────────────────────────────────────────

function SessionsTab({ cls }) {
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ date: '', topic: '', type: 'regular', makeupForSessionId: '', status: 'held' });

  const load = () => apiFetch(`/classes/${cls._id}/sessions`)
    .then((d) => setSessions(d.sessions || []))
    .catch((e) => toast(e.message, 'error'))
    .finally(() => setLoading(false));
  useEffect(() => { load(); }, [cls._id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function create(e) {
    e.preventDefault();
    try {
      await apiFetch(`/classes/${cls._id}/sessions`, { method: 'POST', body: JSON.stringify(form) });
      toast('Đã tạo buổi học');
      setForm({ date: '', topic: '', type: 'regular', makeupForSessionId: '', status: 'held' });
      load();
    } catch (err) { toast(err.message, 'error'); }
  }

  async function updateStatus(s, status) {
    try {
      await apiFetch(`/classes/${cls._id}/sessions/${s._id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      toast('Đã cập nhật buổi học');
      load();
    } catch (err) { toast(err.message, 'error'); }
  }

  return (
    <>
      <form onSubmit={create} className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Ngày *</label>
          <input className="form-input" type="date" value={form.date} onChange={set('date')} required />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Nội dung</label>
          <input className="form-input" value={form.topic} onChange={set('topic')} placeholder="Unit 3 — Reading skills" style={{ minWidth: 220 }} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Loại</label>
          <select className="form-input" value={form.type} onChange={set('type')}>
            <option value="regular">Buổi thường</option>
            <option value="makeup">Buổi học bù</option>
          </select>
        </div>
        {form.type === 'makeup' && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Bù cho buổi</label>
            <select className="form-input" value={form.makeupForSessionId} onChange={set('makeupForSessionId')} required>
              <option value="">— chọn buổi gốc —</option>
              {sessions.filter((s) => s.type === 'regular').map((s) => (
                <option key={s._id} value={s._id}>Buổi {s.sessionNumber} — {formatDate(s.date).slice(0, 10)}</option>
              ))}
            </select>
          </div>
        )}
        <button className="btn btn-primary">+ Tạo buổi</button>
      </form>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>BUỔI</th><th>NGÀY</th><th>NỘI DUNG</th><th>LOẠI</th><th>ĐÃ ĐIỂM DANH</th><th>TRẠNG THÁI</th><th></th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="table-empty">Đang tải...</td></tr>
              : sessions.length === 0 ? <tr><td colSpan={7} className="table-empty">Chưa có buổi học</td></tr>
              : sessions.map((s) => (
                <tr key={s._id}>
                  <td><strong>{s.sessionNumber}</strong></td>
                  <td style={{ fontSize: 13 }}>{formatDate(s.date).slice(0, 10)}</td>
                  <td style={{ fontSize: 13 }}>{s.topic || '–'}</td>
                  <td style={{ fontSize: 13 }}>{s.type === 'makeup' ? '🔁 Học bù' : 'Thường'}</td>
                  <td style={{ fontSize: 13 }}>{s.markedCount || 0}</td>
                  <td>
                    <span className={`badge ${s.status === 'held' ? 'badge-green' : s.status === 'cancelled' ? 'badge-gray' : 'badge-blue'}`}>
                      <span className="dot" />{s.status === 'held' ? 'Đã học' : s.status === 'cancelled' ? 'Đã huỷ' : 'Dự kiến'}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      {s.status !== 'held' && <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(s, 'held')}>Đánh dấu đã học</button>}
                      {s.status !== 'cancelled' && <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(s, 'cancelled')}>Huỷ</button>}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Attendance grid ──────────────────────────────────────────────────

function AttendanceTab({ cls }) {
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [roster, setRoster] = useState([]);
  const [marks, setMarks] = useState({}); // enrollmentId -> { status, lateMinutes, note }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch(`/classes/${cls._id}/sessions`).then((d) => setSessions((d.sessions || []).filter((s) => s.status !== 'cancelled'))).catch(() => {});
  }, [cls._id]);

  function loadSession(sid) {
    setSessionId(sid);
    if (!sid) { setRoster([]); return; }
    setLoading(true);
    apiFetch(`/classes/${cls._id}/sessions/${sid}/attendance`)
      .then((d) => {
        setRoster(d.roster || []);
        const m = {};
        (d.roster || []).forEach((r) => { m[r.enrollmentId] = { status: r.status || 'present', lateMinutes: r.lateMinutes || '', note: r.note || '' }; });
        setMarks(m);
      })
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }

  const setMark = (eid, patch) => setMarks((m) => ({ ...m, [eid]: { ...m[eid], ...patch } }));
  const bulkSet = (status) => setMarks((m) => {
    const next = { ...m };
    roster.forEach((r) => { next[r.enrollmentId] = { ...next[r.enrollmentId], status }; });
    return next;
  });

  async function save() {
    setSaving(true);
    try {
      const payload = roster.map((r) => ({
        enrollmentId: r.enrollmentId,
        status: marks[r.enrollmentId]?.status || 'present',
        lateMinutes: marks[r.enrollmentId]?.lateMinutes ? Number(marks[r.enrollmentId].lateMinutes) : undefined,
        note: marks[r.enrollmentId]?.note || '',
      }));
      const d = await apiFetch(`/classes/${cls._id}/sessions/${sessionId}/attendance`, { method: 'PUT', body: JSON.stringify({ marks: payload }) });
      setRoster(d.roster || []);
      toast('Đã lưu điểm danh');
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <>
      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <select className="form-input" value={sessionId} onChange={(e) => loadSession(e.target.value)} style={{ minWidth: 280 }}>
          <option value="">— chọn buổi học để điểm danh —</option>
          {sessions.map((s) => (
            <option key={s._id} value={s._id}>
              Buổi {s.sessionNumber} — {formatDate(s.date).slice(0, 10)}{s.type === 'makeup' ? ' (học bù)' : ''}{s.markedCount ? ' ✓' : ''}
            </option>
          ))}
        </select>
        {sessionId && roster.length > 0 && (
          <>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Đánh dấu tất cả:</span>
            {MARK_OPTS.map((o) => (
              <button key={o.v} type="button" className="btn btn-ghost btn-sm" onClick={() => bulkSet(o.v)}>{o.label}</button>
            ))}
          </>
        )}
      </div>

      {loading ? <div className="route-loading">Đang tải…</div> : sessionId && (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>HỌC VIÊN</th><th>TRẠNG THÁI</th><th>SỐ PHÚT TRỄ</th><th>GHI CHÚ</th></tr></thead>
              <tbody>
                {roster.length === 0 ? <tr><td colSpan={4} className="table-empty">Lớp chưa có học viên</td></tr>
                  : roster.map((r) => {
                    const m = marks[r.enrollmentId] || {};
                    return (
                      <tr key={r.enrollmentId}>
                        <td>
                          <strong>{r.student.name || r.student.username}</strong>
                          {r.removed && <span className="badge badge-gray" style={{ marginLeft: 6 }}>đã rời lớp</span>}
                          {r.edited && <span className="badge badge-yellow" style={{ marginLeft: 6 }} title="Đã từng sửa">đã sửa</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {MARK_OPTS.map((o) => (
                              <button key={o.v} type="button"
                                className={`btn btn-sm ${m.status === o.v ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setMark(r.enrollmentId, { status: o.v })}>
                                {o.label}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td>
                          {m.status === 'late' && (
                            <input className="form-input" type="number" min={0} style={{ width: 90 }} value={m.lateMinutes || ''}
                              onChange={(e) => setMark(r.enrollmentId, { lateMinutes: e.target.value })} />
                          )}
                        </td>
                        <td>
                          <input className="form-input" value={m.note || ''} onChange={(e) => setMark(r.enrollmentId, { note: e.target.value })} placeholder="—" />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {roster.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? 'Đang lưu...' : '💾 Lưu điểm danh'}</button>
            </div>
          )}
        </>
      )}
    </>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────

function DashboardTab({ cls }) {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', from: '', to: '' });

  const load = () => {
    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) qs.set(k, v); });
    apiFetch(`/classes/${cls._id}/dashboard${qs.toString() ? `?${qs}` : ''}`)
      .then((d) => setRows(d.rows || []))
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [cls._id, filters]);

  const setF = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Trạng thái</label>
          <select className="form-input" value={filters.status} onChange={setF('status')}>
            <option value="">Tất cả</option>
            <option value="active">Đang học</option>
            <option value="warning">Cảnh báo</option>
            <option value="failed">Rớt khóa</option>
            <option value="completed">Hoàn thành</option>
            <option value="dropped">Nghỉ học</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Từ ngày</label>
          <input className="form-input" type="date" value={filters.from} onChange={setF('from')} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Đến ngày</label>
          <input className="form-input" type="date" value={filters.to} onChange={setF('to')} />
        </div>
        {(filters.from || filters.to) && <span style={{ fontSize: 11, color: 'var(--text3)' }}>* tính lại theo khoảng ngày đã chọn</span>}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>HỌC VIÊN</th><th>ĐÃ HỌC</th><th>ĐÃ NGHỈ</th><th>TRỄ</th><th>TỶ LỆ CHUYÊN CẦN</th><th>CÒN ĐƯỢC NGHỈ</th><th>TRẠNG THÁI</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="table-empty">Đang tải...</td></tr>
              : rows.length === 0 ? <tr><td colSpan={7} className="table-empty">Không có dữ liệu</td></tr>
              : rows.map((r) => (
                <tr key={r.enrollmentId}>
                  <td><strong>{r.student.name || r.student.username}</strong>{r.removed && <span className="badge badge-gray" style={{ marginLeft: 6 }}>đã rời lớp</span>}</td>
                  <td style={{ fontSize: 13 }}>{r.attendedCount}/{r.heldSessions}</td>
                  <td style={{ fontSize: 13 }}>{r.absentTotal}{r.absentExcused ? ` (${r.absentExcused} có phép)` : ''}</td>
                  <td style={{ fontSize: 13 }}>{r.lateCount}</td>
                  <td style={{ fontSize: 13, fontWeight: 700, color: r.attendanceRate >= 85 ? 'var(--green)' : r.attendanceRate >= 70 ? 'var(--amber, #d97706)' : 'var(--danger)' }}>{r.attendanceRate}%</td>
                  <td style={{ fontSize: 13 }}>{r.remainingAllowed}</td>
                  <td><span className={`badge ${ENR_BADGE[r.status] || 'badge-gray'}`}><span className="dot" />{ENR_LABEL[r.status] || r.status}</span></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Assignments (homework) ───────────────────────────────────────────

function AssignmentsTab({ cls }) {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [openId, setOpenId] = useState(null);

  const load = () => apiFetch(`/classes/${cls._id}/assignments`)
    .then((d) => { setList(d.assignments || []); setEnrolledCount(d.enrolledCount || 0); })
    .catch((e) => toast(e.message, 'error'))
    .finally(() => setLoading(false));
  useEffect(() => { load(); }, [cls._id]);

  async function archive(a) {
    try {
      await apiFetch(`/classes/${cls._id}/assignments/${a._id}/status`, { method: 'POST', body: JSON.stringify({ status: a.status === 'archived' ? 'active' : 'archived' }) });
      toast(a.status === 'archived' ? 'Đã mở lại' : 'Đã lưu trữ');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  return (
    <>
      {showEditor && <AssignmentEditor cls={cls} onClose={() => setShowEditor(false)} onSaved={load} />}

      <div className="section-header" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>{list.length} bài tập · {enrolledCount} học viên</div>
        <button className="btn btn-primary" onClick={() => setShowEditor(true)}>+ Tạo bài tập</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>BÀI TẬP</th><th>SỐ PHẦN</th><th>HOÀN THÀNH</th><th>DEADLINE</th><th>TRẠNG THÁI</th><th></th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="table-empty">Đang tải...</td></tr>
              : list.length === 0 ? <tr><td colSpan={6} className="table-empty">Chưa có bài tập nào</td></tr>
              : list.map((a) => (
                <React.Fragment key={a._id}>
                  <tr>
                    <td><button onClick={() => setOpenId(openId === a._id ? null : a._id)} style={{ fontWeight: 700, color: 'var(--purple)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{a.title}</button></td>
                    <td style={{ fontSize: 13 }}>{a.resourceCount}</td>
                    <td style={{ fontSize: 13 }}>{a.completedStudents}/{enrolledCount}</td>
                    <td style={{ fontSize: 13 }}>{a.deadline ? formatDate(a.deadline) : '—'}</td>
                    <td><span className={`badge ${a.status === 'archived' ? 'badge-gray' : 'badge-green'}`}><span className="dot" />{a.status === 'archived' ? 'Lưu trữ' : 'Đang giao'}</span></td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => setOpenId(openId === a._id ? null : a._id)}>{openId === a._id ? 'Ẩn' : 'Chi tiết'}</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => archive(a)}>{a.status === 'archived' ? 'Mở lại' : 'Lưu trữ'}</button>
                      </div>
                    </td>
                  </tr>
                  {openId === a._id && (
                    <tr>
                      <td colSpan={6} style={{ background: 'var(--bg)' }}>
                        <AssignmentProgressPanel cls={cls} assignmentId={a._id} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AssignmentProgressPanel({ cls, assignmentId }) {
  const toast = useToast();
  const [data, setData] = useState(null);
  useEffect(() => {
    apiFetch(`/classes/${cls._id}/assignments/${assignmentId}`)
      .then(setData)
      .catch((e) => toast(e.message, 'error'));
  }, [cls._id, assignmentId]);
  if (!data) return <div style={{ padding: 12, color: 'var(--text3)' }}>Đang tải…</div>;
  return (
    <div style={{ padding: '10px 6px' }}>
      <table className="table" style={{ margin: 0 }}>
        <thead><tr><th>HỌC VIÊN</th><th>HOÀN THÀNH</th><th>THIẾU</th><th>XONG LÚC</th><th>TRẠNG THÁI</th></tr></thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={r.enrollmentId}>
              <td><strong>{r.student.name || r.student.username}</strong>{r.removed && <span className="badge badge-gray" style={{ marginLeft: 6 }}>đã rời lớp</span>}</td>
              <td style={{ fontSize: 13 }}>{r.completed}/{r.total}</td>
              <td style={{ fontSize: 13 }}>{r.missing}</td>
              <td style={{ fontSize: 13 }}>{r.allCompletedAt ? formatDate(r.allCompletedAt) : '—'}</td>
              <td><span className={`badge ${ASG_STATUS[r.status] || 'badge-gray'}`}><span className="dot" />{ASG_LABEL[r.status] || r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssignmentEditor({ cls, onClose, onSaved }) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [instruction, setInstruction] = useState('');
  const [deadline, setDeadline] = useState('');
  const [picked, setPicked] = useState([]);
  const [externals, setExternals] = useState([]);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const [cat, setCat] = useState('reading_test');
  const [search, setSearch] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [loadingCat, setLoadingCat] = useState(false);

  useEffect(() => {
    let alive = true;
    const qs = new URLSearchParams({ type: cat });
    if (search.trim()) qs.set('search', search.trim());
    apiFetch(`/classes/resources/catalog?${qs}`)
      .then((d) => { if (alive) setCatalog(d.items || []); })
      .catch(() => { if (alive) setCatalog([]); })
      .finally(() => { if (alive) setLoadingCat(false); });
    return () => { alive = false; };
  }, [cat, search]);

  const keyOf = (type, id) => `${type}:${id || '*'}`;
  function togglePick(item) {
    const k = keyOf(cat, item._id);
    setPicked((p) => p.some((x) => keyOf(x.resourceType, x.resourceId) === k)
      ? p.filter((x) => keyOf(x.resourceType, x.resourceId) !== k)
      : [...p, { kind: 'internal', resourceType: cat, resourceId: item._id, label: item.label }]);
  }
  const isPicked = (item) => picked.some((x) => keyOf(x.resourceType, x.resourceId) === keyOf(cat, item._id));

  async function uploadImages(e) {
    const files = [...e.target.files];
    if (!files.length) return;
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/classes/${cls._id}/assignments/images`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Upload lỗi');
      setImages((im) => [...im, { kind: 'image', images: d.images, title: '', instruction: '' }]);
    } catch (err) { toast(err.message, 'error'); }
    e.target.value = '';
  }

  async function save() {
    const resources = [
      ...picked,
      ...externals.filter((x) => x.url.trim()).map((x) => ({ kind: 'external', ...x })),
      ...images,
    ];
    if (!title.trim()) return toast('Nhập tên bài tập', 'error');
    if (!resources.length) return toast('Chọn ít nhất một tài nguyên', 'error');
    setSaving(true);
    try {
      await apiFetch(`/classes/${cls._id}/assignments`, {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), instruction: instruction.trim(), deadline: deadline || null, resources }),
      });
      toast('Đã giao bài tập');
      onSaved();
      onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  const totalRes = picked.length + externals.filter((x) => x.url.trim()).length + images.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 760, maxHeight: '94vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Tạo bài tập — {cls.name}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ padding: '18px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tên bài tập *</label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Homework – Week 4" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Hướng dẫn</label>
            <textarea className="form-input" rows={2} value={instruction} onChange={(e) => setInstruction(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, maxWidth: 280 }}>
            <label className="form-label">Deadline</label>
            <input className="form-input" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>

          <fieldset style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
            <legend style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', padding: '0 6px' }}>Tài nguyên trên hệ thống</legend>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <select className="form-input" style={{ width: 200 }} value={cat} onChange={(e) => setCat(e.target.value)}>
                {RESOURCE_CATS.map((r) => <option key={r.type} value={r.type}>{r.label}</option>)}
              </select>
              <input className="form-input" placeholder="Tìm..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6 }}>
              {loadingCat ? <div style={{ padding: 10, color: 'var(--text3)' }}>Đang tải…</div>
                : catalog.length === 0 ? <div style={{ padding: 10, color: 'var(--text3)' }}>Không có kết quả</div>
                : catalog.map((item) => (
                  <label key={String(item._id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" checked={isPicked(item)} onChange={() => togglePick(item)} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.meta && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{item.meta}</span>}
                  </label>
                ))}
            </div>
            {picked.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {picked.map((p) => (
                  <span key={keyOf(p.resourceType, p.resourceId)} className="badge badge-blue" style={{ cursor: 'pointer' }} onClick={() => setPicked((x) => x.filter((y) => y !== p))}>
                    {RES_LABEL[p.resourceType]}: {p.label} ✕
                  </span>
                ))}
              </div>
            )}
          </fieldset>

          <fieldset style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
            <legend style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', padding: '0 6px' }}>Link ngoài</legend>
            {externals.map((x, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto', gap: 8, marginBottom: 6 }}>
                <input className="form-input" placeholder="https://..." value={x.url} onChange={(e) => setExternals((a) => a.map((y, j) => (j === i ? { ...y, url: e.target.value } : y)))} />
                <input className="form-input" placeholder="Tên bài" value={x.title} onChange={(e) => setExternals((a) => a.map((y, j) => (j === i ? { ...y, title: e.target.value } : y)))} />
                <button className="btn btn-ghost btn-sm" onClick={() => setExternals((a) => a.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={() => setExternals((a) => [...a, { url: '', title: '', description: '' }])}>+ Thêm link</button>
          </fieldset>

          <fieldset style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
            <legend style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', padding: '0 6px' }}>Hình ảnh bài tập</legend>
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={uploadImages} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {images.flatMap((g, gi) => g.images.map((im, ii) => (
                <div key={`${gi}-${ii}`} style={{ position: 'relative' }}>
                  <img src={im.url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                  <button onClick={() => setImages((a) => a.filter((_, j) => j !== gi))} style={{ position: 'absolute', top: -6, right: -6, background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 11 }}>✕</button>
                </div>
              )))}
            </div>
          </fieldset>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{totalRes} tài nguyên</span>
            <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? 'Đang giao...' : '📤 Giao bài tập'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
