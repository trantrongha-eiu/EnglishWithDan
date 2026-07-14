import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import Pagination from '../components/Pagination';
import GradeModal from './writingGrades/GradeModal';
import ViewModal from './writingGrades/ViewModal';
import { STATUS, PAGE } from './writingGrades/constants';

function bandBadge(b) {
  if (b == null) return <span style={{ color: 'var(--text3)', fontSize: 12 }}>–</span>;
  const cls = b >= 7 ? 'badge-green' : b >= 5.5 ? 'badge-blue' : 'badge-red';
  return <span className={`badge ${cls}`} style={{ fontWeight: 700 }}>{Number(b).toFixed(1)}</span>;
}

function wcBadge(count, target) {
  const n = count || 0;
  if (!n) return <span style={{ color: 'var(--text3)', fontSize: 12 }}>–</span>;
  const met = n >= target;
  const close = n >= target * 0.8;
  const bg  = met ? '#dcfce7' : close ? '#fef9c3' : '#fee2e2';
  const col = met ? '#15803d' : close ? '#a16207' : '#b91c1c';
  return (
    <span style={{ background: bg, color: col, borderRadius: 5, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
      {n}w{!met ? ` ⚠<${target}` : ''}
    </span>
  );
}

export default function WritingGrades() {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const [attempts, setAttempts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  // Counts come from a separate endpoint so the "N chờ chấm / N AI đã chấm"
  // summary reflects the whole table, not just whatever page is loaded.
  const [counts, setCounts]         = useState({ pending: 0, ai_done: 0, confirmed: 0 });
  // Starts true: the mount effect below immediately kicks off a load.
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter]   = useState('');
  const [typeFilter, setTypeFilter]       = useState('');
  const [search, setSearch]               = useState('');
  const [selectedId, setSelectedId]       = useState(null);
  const [viewId, setViewId]               = useState(null);

  function load(p = page) {
    const params = new URLSearchParams({ page: p, limit: PAGE });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('type', typeFilter);
    return apiFetch(`/admin/writing-history?${params}`)
      .then(d => {
        const t = d.total || 0;
        setTotal(t);
        // Deleting/confirming the last row on the last page (or narrowing a
        // filter) can shrink the total below the page we're currently on —
        // land back on the last page that actually has rows instead of
        // showing a phantom "Không có dữ liệu" page with no way back.
        const maxPage = Math.max(1, Math.ceil(t / PAGE));
        if (p > maxPage) { setPage(maxPage); return; }
        setAttempts(d.attempts || []);
      })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }

  function loadCounts() {
    return apiFetch('/admin/writing-history/counts')
      .then(d => setCounts(d.counts || {}))
      .catch(e => toast(e.message, 'error'));
  }

  // Adjust-during-render (not an effect): reset to page 1 whenever a filter
  // changes — same pattern as Users.jsx, so a filter edit and a pagination
  // click each cause exactly one load, never two.
  const [prevFilters, setPrevFilters] = useState([search, statusFilter, typeFilter]);
  if (prevFilters[0] !== search || prevFilters[1] !== statusFilter || prevFilters[2] !== typeFilter) {
    setPrevFilters([search, statusFilter, typeFilter]);
    if (page !== 1) setPage(1);
  }
  useEffect(() => { load(page); }, [search, statusFilter, typeFilter, page]);
  useEffect(() => { loadCounts(); }, []);

  function delAttempt(id) {
    confirm('Xóa bài nộp này? Không thể khôi phục!', async () => {
      try {
        await apiFetch(`/admin/writing-attempts/${id}`, { method: 'DELETE' });
        toast('Đã xóa bài nộp');
        setLoading(true);
        load(page);
        loadCounts();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  function onGraded() {
    setLoading(true);
    load(page);
    loadCounts();
    setSelectedId(null);
  }

  function refresh() {
    setLoading(true);
    load(page);
    loadCounts();
  }

  const pending = counts.pending || 0;
  const aiDone  = counts.ai_done || 0;

  return (
    <>
      {selectedId && (
        <GradeModal attemptId={selectedId} onClose={() => setSelectedId(null)} onGraded={onGraded} />
      )}
      {viewId && <ViewModal attemptId={viewId} onClose={() => setViewId(null)} />}

      <div className="section-header">
        <div>
          <h2 className="section-title">Chấm bài Writing ({total})</h2>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
            {pending > 0 && <span style={{ color: 'var(--accent2)' }}>{pending} chờ chấm</span>}
            {pending > 0 && aiDone > 0 && ' · '}
            {aiDone > 0 && <span style={{ color: '#3d8bff' }}>{aiDone} AI đã chấm, chờ xác nhận</span>}
            {pending === 0 && aiDone === 0 && <span>Tất cả đã xác nhận ✓</span>}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={loading}>
          {loading ? '⏳' : '🔄'} Làm mới
        </button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input className="form-input search-input" placeholder="Tìm học sinh, tên đề..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
        <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 180 }}>
          <option value="">Tất cả trạng thái</option>
          <option value="pending">⏳ Chờ chấm</option>
          <option value="ai_done">🤖 AI đã chấm</option>
          <option value="confirmed">✅ Đã xác nhận</option>
        </select>
        <select className="form-input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 160 }}>
          <option value="">Tất cả loại</option>
          <option value="exam">🏆 Bài thi</option>
          <option value="practice">✏️ Luyện tập</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>HỌC SINH</th>
              <th>LOẠI</th>
              <th>ĐỀ THI</th>
              <th>T1 (≥150w)</th>
              <th>T2 (≥250w)</th>
              <th>BAND</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY NỘP</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={9} className="table-empty">Đang tải...</td></tr>
              : attempts.length === 0
                ? <tr><td colSpan={9} className="table-empty">Không có dữ liệu</td></tr>
                : attempts.map(a => {
                  const name = [a.userId?.firstName, a.userId?.lastName].filter(Boolean).join(' ') || a.userId?.username || '–';
                  const st   = STATUS[a.gradingStatus] || STATUS.pending;
                  const isPracticeT1 = a.submissionType === 'practice' && (a.examName || '').includes('Task 1');
                  const isPracticeT2 = a.submissionType === 'practice' && (a.examName || '').includes('Task 2');
                  const dash = <span style={{ color: 'var(--text3)', fontSize: 12 }}>–</span>;
                  return (
                    <tr key={a._id}>
                      <td>
                        <strong>{name}</strong>
                        {a.userId?.username && <div style={{ fontSize: 11, color: 'var(--text3)' }}>@{a.userId.username}</div>}
                      </td>
                      <td>
                        {a.submissionType === 'practice'
                          ? <span className="badge badge-blue" style={{ fontSize: 11 }}>✏️ Luyện</span>
                          : <span className="badge badge-gray" style={{ fontSize: 11 }}>🏆 Thi</span>}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text2)' }}>{a.examName || '–'}</td>
                      <td>{isPracticeT2 ? dash : wcBadge(a.wordCount1, 150)}</td>
                      <td>{isPracticeT1 ? dash : wcBadge(a.wordCount2, 250)}</td>
                      <td>{bandBadge(a.grading?.overallBand)}</td>
                      <td><span className={`badge ${st.cls}`}><span className="dot" />{st.label}</span></td>
                      <td style={{ fontSize: 12 }}>{formatDate(a.submittedAt)}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setViewId(a._id)} title="Xem bài">👁</button>
                          <button className={`btn btn-sm ${a.gradingStatus === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ fontSize: 11, padding: '3px 10px' }}
                            onClick={() => setSelectedId(a._id)}>
                            {a.gradingStatus === 'pending' ? '📝 Chấm' : '✏️ Chấm'}
                          </button>
                          {isAdmin && (
                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => delAttempt(a._id)} title="Xóa bài nộp">🗑</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={total} pageSize={PAGE} onPage={setPage} />
    </>
  );
}
