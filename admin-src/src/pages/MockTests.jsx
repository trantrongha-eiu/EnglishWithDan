import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import Pagination from '../components/Pagination';

// Admin monitoring for the full 4-skill mock test. Before this page the run
// history + proctoring log ("gậy" = tab-switch count) were written to
// MockTestAttempt and never surfaced anywhere in the admin panel — this is
// the read-only view of GET /api/admin/mock-tests. Deep-links into the
// per-skill reviews point at the STUDENT site (same origin in production),
// mirroring frontend/review-history.html's mock rows.

const PAGE_SIZE = 20;

const STATUS_META = {
  'in-progress':      { label: 'Đang làm dở', cls: 'badge-gray' },
  'awaiting-grading': { label: 'Chờ chấm W/S', cls: 'badge-yellow' },
  'completed':        { label: 'Hoàn thành', cls: 'badge-green' },
  'disqualified':     { label: 'Huỷ do vi phạm', cls: 'badge-red' },
};

// Bands a teacher may type into the manual-score editor ('' = clear / auto).
// 0 is omitted on purpose — see BAND_VALUES in mockTestService.js.
const BAND_OPTS = ['', '9', '8.5', '8', '7.5', '7', '6.5', '6', '5.5', '5', '4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1'];
const MOCK_SKILLS = [['listening', 'Listening'], ['reading', 'Reading'], ['writing', 'Writing'], ['speaking', 'Speaking']];

function statusBadge(s) {
  const m = STATUS_META[s] || { label: s, cls: 'badge-gray' };
  return <span className={`badge ${m.cls}`}>{m.label}</span>;
}

function bandChip(b) {
  if (b == null) return <span style={{ color: 'var(--text3)', fontSize: 12 }}>–</span>;
  const color = b >= 7 ? 'var(--green)' : b >= 5 ? 'var(--yellow)' : 'var(--accent2)';
  return <span style={{ color, fontWeight: 700 }}>{b.toFixed(1)}</span>;
}

function overallBadge(b) {
  if (b == null) return <span style={{ color: 'var(--text3)', fontSize: 12 }}>chưa đủ</span>;
  const color = b >= 7 ? 'var(--green)' : b >= 5.5 ? 'var(--yellow)' : 'var(--accent2)';
  return <span style={{ fontWeight: 800, fontSize: 15, color }}>{b.toFixed(1)}</span>;
}

// Per-skill review deep-links on the student site. Writing/Speaking have no
// per-attempt review URL — show the band only.
function SkillCell({ skill, step }) {
  const b = step ? step.band : null;
  const href =
    skill === 'listening' && step && step.attemptId ? `/listening.html?review=${step.attemptId}`
    : skill === 'reading' && step && step.attemptId ? `/reading.html?review=${step.attemptId}`
    : null;
  const manualMark = step && step.manual
    ? <span title="Điểm giáo viên nhập tay" style={{ fontSize: 10, color: 'var(--accent2)' }}> ✎</span>
    : null;
  const inner = <>{bandChip(b)}{manualMark}</>;
  if (!href) return <td style={{ textAlign: 'center' }}>{inner}</td>;
  return (
    <td style={{ textAlign: 'center' }}>
      <a href={href} target="_blank" rel="noopener noreferrer" title="Mở bài xem lại trên trang học sinh"
         style={{ textDecoration: 'none' }}>
        {inner} <span style={{ fontSize: 10, color: 'var(--text3)' }}>↗</span>
      </a>
    </td>
  );
}

const PROCTOR_LABEL = { hidden: 'Ẩn tab', blur: 'Mất focus cửa sổ', 'unload-attempt': 'Định đóng tab' };

function ProctorModal({ id, onClose, onSaved }) {
  const toast = useToast();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);   // { listening, reading, writing, speaking, note } while editing
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch(`/admin/mock-tests/${id}`)
      .then(d => setAttempt(d.attempt))
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const p = attempt?.proctor;
  const SKILLS = MOCK_SKILLS;

  const bandStr = b => (b == null ? '' : String(b));

  function startEdit() {
    setEdit({
      listening: bandStr(attempt.steps.listening?.band),
      reading:   bandStr(attempt.steps.reading?.band),
      writing:   bandStr(attempt.steps.writing?.band),
      speaking:  bandStr(attempt.steps.speaking?.band),
      note: attempt.adminNote || '',
    });
  }

  async function saveEdit() {
    // Only send skills the teacher actually changed. '' on a skill that had
    // a band clears the manual override; '' on an already-empty skill is
    // skipped.
    const steps = {};
    for (const [s] of SKILLS) {
      const orig = bandStr(attempt.steps[s]?.band);
      if (edit[s] !== orig) steps[s] = edit[s] === '' ? null : Number(edit[s]);
    }
    const noteChanged = (edit.note || '') !== (attempt.adminNote || '');
    if (Object.keys(steps).length === 0 && !noteChanged) { setEdit(null); return; }

    setSaving(true);
    try {
      const d = await apiFetch(`/admin/mock-tests/${id}/scores`, {
        method: 'PUT',
        body: JSON.stringify({ steps, note: noteChanged ? edit.note : undefined }),
      });
      setAttempt(d.attempt);
      setEdit(null);
      toast('Đã lưu điểm', 'success');
      onSaved?.();
    } catch (e) {
      toast(e.message || 'Lỗi lưu điểm', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <h3>🎯 Chi tiết lượt thi thử</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading ? <div style={{ color: 'var(--text3)' }}>Đang tải…</div> : !attempt ? (
            <div style={{ color: 'var(--text3)' }}>Không tìm thấy.</div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14, fontSize: 13 }}>
                <span><strong>Học sinh:</strong> {attempt.user.displayName}
                  {attempt.user.username && <span style={{ color: 'var(--text3)' }}> @{attempt.user.username}</span>}</span>
                <span><strong>Bắt đầu:</strong> {formatDate(attempt.createdAt)}</span>
                <span><strong>Trạng thái:</strong> {STATUS_META[attempt.status]?.label || attempt.status}</span>
                <span><strong>Band tổng:</strong> {attempt.overallBand != null ? attempt.overallBand.toFixed(1) : 'chưa đủ'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong style={{ fontSize: 13 }}>Điểm từng kỹ năng</strong>
                {!edit && <button className="btn btn-ghost btn-sm" onClick={startEdit}>✎ Sửa / nhập điểm</button>}
              </div>

              {edit ? (
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
                    Nhập band 1–9 (bước 0.5). Để trống = xoá điểm nhập tay, dùng lại điểm chấm tự động.
                    Band tổng tính lại tự động (trung bình 4 kỹ năng, làm tròn chuẩn IELTS).
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 10 }}>
                    {SKILLS.map(([s, l]) => (
                      <label key={s} style={{ fontSize: 12, fontWeight: 700 }}>
                        {l}
                        <select className="form-input" value={edit[s]} disabled={saving}
                          onChange={e => setEdit({ ...edit, [s]: e.target.value })}
                          style={{ width: '100%', marginTop: 4 }}>
                          {BAND_OPTS.map(o => <option key={o} value={o}>{o === '' ? '— (tự động)' : o}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>
                    Ghi chú (tuỳ chọn)
                    <textarea className="form-input" rows={2} value={edit.note} disabled={saving}
                      placeholder="VD: Speaking chấm trực tiếp 29/08"
                      onChange={e => setEdit({ ...edit, note: e.target.value })}
                      style={{ width: '100%', marginTop: 4, resize: 'vertical' }} />
                  </label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>
                      {saving ? 'Đang lưu…' : 'Lưu điểm'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEdit(null)} disabled={saving}>Huỷ</button>
                  </div>
                </div>
              ) : (
              <table className="table" style={{ marginBottom: attempt.adminNote ? 8 : 16 }}>
                <thead><tr><th>KỸ NĂNG</th><th>ĐỀ</th><th>BAND</th><th>HOÀN THÀNH</th></tr></thead>
                <tbody>
                  {SKILLS.map(([s, l]) => {
                    const step = attempt.steps[s];
                    const name = s === 'listening' ? attempt.bundle.listeningTestName
                      : s === 'reading' ? attempt.bundle.readingTestName
                      : s === 'writing' ? attempt.bundle.writingExamName
                      : attempt.bundle.speakingTopic;
                    return (
                      <tr key={s}>
                        <td>{l}</td>
                        <td style={{ fontSize: 12, color: 'var(--text2)' }}>{name || '–'}</td>
                        <td>{bandChip(step?.band)}
                          {step?.manual && <span title="Giáo viên nhập tay" style={{ fontSize: 10, color: 'var(--accent2)' }}> ✎ nhập tay</span>}
                        </td>
                        <td style={{ fontSize: 12 }}>{step?.completedAt ? formatDate(step.completedAt) : '–'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              )}
              {!edit && attempt.adminNote && (
                <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
                  <strong>Ghi chú:</strong> {attempt.adminNote}
                </div>
              )}

              <div style={{
                background: p?.violated ? 'rgba(198,40,40,.08)' : 'var(--surface2)',
                border: `1px solid ${p?.violated ? 'var(--danger)' : 'var(--border)'}`,
                borderRadius: 10, padding: '12px 14px',
              }}>
                <div style={{ fontWeight: 700, marginBottom: p?.events?.length ? 10 : 0 }}>
                  {p?.violated ? '⚠️ ' : '✅ '}
                  Proctoring: {p?.violationCount || 0} gậy
                  {p?.violated && <span style={{ color: 'var(--danger)' }}> · Bị đánh dấu vi phạm</span>}
                </div>
                {p?.events?.length > 0 && (
                  <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: 'var(--text2)', display: 'grid', gap: 4 }}>
                    {p.events.map((e, i) => (
                      <li key={i}>
                        <strong>{PROCTOR_LABEL[e.type] || e.type}</strong>
                        {e.skill && <span> · {e.skill}</span>}
                        <span style={{ color: 'var(--text3)' }}> · {formatDate(e.at)}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MockTests() {
  const toast = useToast();
  const [params] = useSearchParams();
  const userId = params.get('userId') || '';

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [violatedTotal, setViolatedTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [violatedOnly, setViolatedOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState(null);

  const load = useCallback(() => {
    const q = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (userId) q.set('userId', userId);
    if (status) q.set('status', status);
    if (violatedOnly) q.set('violatedOnly', '1');
    return apiFetch(`/admin/mock-tests?${q}`)
      .then(d => {
        setRows(d.items || []);
        setTotal(d.total || 0);
        setViolatedTotal(d.violatedTotal || 0);
      })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [page, userId, status, violatedOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  // Same synchronous loading-flip pattern as ReadingStats.jsx / Task2Topics.jsx.
  const [prevQuery, setPrevQuery] = useState([page, status, violatedOnly]);
  if (prevQuery[0] !== page || prevQuery[1] !== status || prevQuery[2] !== violatedOnly) {
    setPrevQuery([page, status, violatedOnly]);
    setLoading(true);
  }

  useEffect(() => { load(); }, [load]);

  const q = search.trim().toLowerCase();
  const shown = q
    ? rows.filter(r =>
        r.user.displayName.toLowerCase().includes(q) ||
        r.user.username.toLowerCase().includes(q) ||
        r.user.className.toLowerCase().includes(q))
    : rows;

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">🎯 Thi thử Full 4 kỹ năng</h2>
      </div>

      <div className="stats-row" style={{ marginBottom: 16 }}>
        <div className="stat-card blue">
          <div className="stat-label">Tổng lượt thi thử{userId ? ' (học sinh này)' : ''}</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Lượt bị đánh dấu vi phạm</div>
          <div className="stat-value">{violatedTotal}</div>
          <div className="stat-sub">Chuyển / thu nhỏ tab khi đang thi</div>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <select className="form-input" value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ width: 180 }}>
          <option value="">Tất cả trạng thái</option>
          <option value="in-progress">Đang làm dở</option>
          <option value="awaiting-grading">Chờ chấm W/S</option>
          <option value="completed">Hoàn thành</option>
          <option value="disqualified">Huỷ do vi phạm</option>
        </select>
        <input className="form-input search-input" placeholder="Tìm học sinh / lớp…"
          value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220, flex: 'none' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>
          <input type="checkbox" checked={violatedOnly}
            onChange={e => { setViolatedOnly(e.target.checked); setPage(1); }} />
          Chỉ hiện lượt vi phạm
        </label>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>HỌC SINH</th><th>NGÀY BẮT ĐẦU</th><th>TRẠNG THÁI</th><th>BAND TỔNG</th>
              <th style={{ textAlign: 'center' }}>L</th><th style={{ textAlign: 'center' }}>R</th>
              <th style={{ textAlign: 'center' }}>W</th><th style={{ textAlign: 'center' }}>S</th>
              <th style={{ textAlign: 'center' }}>GẬY</th><th></th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={10} className="table-empty">Đang tải…</td></tr>
              : shown.length === 0
                ? <tr><td colSpan={10} className="table-empty">Không có lượt thi thử nào</td></tr>
                : shown.map(r => (
                  <tr key={r._id}>
                    <td>
                      {r.user._id
                        ? <Link to={`/students/${r.user._id}`} style={{ fontWeight: 700, color: 'var(--text)' }}>{r.user.displayName}</Link>
                        : <strong>{r.user.displayName}</strong>}
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {r.user.username && `@${r.user.username}`}{r.user.className && ` · Lớp ${r.user.className}`}
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{formatDate(r.createdAt)}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td>{overallBadge(r.overallBand)}</td>
                    <SkillCell skill="listening" step={r.steps.listening} />
                    <SkillCell skill="reading" step={r.steps.reading} />
                    <SkillCell skill="writing" step={r.steps.writing} />
                    <SkillCell skill="speaking" step={r.steps.speaking} />
                    <td style={{ textAlign: 'center' }}>
                      {r.proctor.violated
                        ? <span className="badge badge-red" title="Bị đánh dấu vi phạm thi cử">⚠️ {r.proctor.violationCount}</span>
                        : <span style={{ color: r.proctor.violationCount ? 'var(--yellow)' : 'var(--text3)' }}>{r.proctor.violationCount}</span>}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDetailId(r._id)}>Chi tiết</button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12 }}>
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPage={setPage} />
      </div>

      {detailId && <ProctorModal id={detailId} onClose={() => setDetailId(null)} onSaved={load} />}
    </>
  );
}
