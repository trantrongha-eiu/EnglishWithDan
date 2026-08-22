import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 25;

function bandBadge(score) {
  if (score == null) return '–';
  const color = score >= 7 ? 'var(--green)' : score >= 5 ? 'var(--yellow)' : 'var(--accent2)';
  return <span style={{ color, fontWeight: 700 }}>{score.toFixed(1)}</span>;
}

function formatDur(sec) {
  if (sec == null) return '–';
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m${String(s).padStart(2, '0')}s`;
}

function studentName(u) {
  if (!u) return '–';
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || '–';
}

// Listening's mirror of ReadingStats.jsx — same page shape, over
// listeningService's listAdminAttempts/getAdminAttemptsStats
// (backend/routes/admin/listening.js), which already existed with
// identical aggregation logic but had never been wired up to any
// admin-src page (PLATFORM_AUDIT_2026-08-22 NEW-A). Two field-name
// differences from ListeningAttempt vs TestAttempt: submittedAt (not
// endTime) and timeTaken (not duration) — otherwise a straight port.
export default function ListeningStats() {
  const toast = useToast();
  const [tests, setTests] = useState([]);
  const [testId, setTestId] = useState('');
  const [stats, setStats] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/listening/tests').then(d => setTests(d.tests || [])).catch(() => {});
  }, []);

  const load = useCallback(() => {
    const testQuery = testId ? `&testId=${testId}` : '';
    return Promise.all([
      apiFetch(`/admin/listening/attempts/stats${testId ? `?testId=${testId}` : ''}`),
      apiFetch(`/admin/listening/attempts?page=${page}&limit=${PAGE_SIZE}${testQuery}`),
    ])
      .then(([s, a]) => {
        setStats(s);
        setAttempts(a.attempts || []);
        setTotal(a.total || 0);
      })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [testId, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Same set-state-in-render pattern as ReadingStats.jsx/Task2Topics.jsx —
  // see their comments for why (avoids a lint violation / infinite loop).
  const [prevQuery, setPrevQuery] = useState([testId, page]);
  if (prevQuery[0] !== testId || prevQuery[1] !== page) {
    setPrevQuery([testId, page]);
    setLoading(true);
  }

  useEffect(() => { load(); }, [load]);

  function onTestChange(v) {
    setTestId(v);
    setPage(1);
  }

  const overview = stats?.overview || {};

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Thống kê Listening</h2>
      </div>

      <div className="stats-row" style={{ marginBottom: 16 }}>
        <div className="stat-card blue">
          <div className="stat-label">Tổng lượt làm bài</div>
          <div className="stat-value">{overview.totalAttempts || 0}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Band trung bình</div>
          <div className="stat-value">{overview.avgBand ? overview.avgBand.toFixed(1) : '–'}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Đúng trung bình</div>
          <div className="stat-value">{overview.avgCorrect ? overview.avgCorrect.toFixed(1) : '–'}</div>
          <div className="stat-sub">/ 40 câu</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Band cao nhất / thấp nhất</div>
          <div className="stat-value" style={{ fontSize: 20 }}>
            {overview.maxBand ?? '–'} / {overview.minBand ?? '–'}
          </div>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <select className="form-input" value={testId} onChange={e => onTestChange(e.target.value)} style={{ width: 280 }}>
          <option value="">Tất cả bộ đề</option>
          {tests.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>BỘ ĐỀ</th><th>LƯỢT LÀM</th><th>BAND TB</th><th>ĐÚNG TB</th></tr></thead>
            <tbody>
              {!stats || stats.byTest.length === 0
                ? <tr><td colSpan={4} className="table-empty">{loading ? 'Đang tải...' : 'Không có dữ liệu'}</td></tr>
                : stats.byTest.map(t => (
                  <tr key={t._id}>
                    <td>{t.testName}</td>
                    <td style={{ textAlign: 'center' }}>{t.totalAttempts}</td>
                    <td>{bandBadge(t.avgBand)}</td>
                    <td style={{ textAlign: 'center' }}>{t.avgCorrect != null ? t.avgCorrect.toFixed(1) : '–'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>TOP HỌC SINH</th><th>BAND CAO NHẤT</th><th>LƯỢT LÀM</th></tr></thead>
            <tbody>
              {!stats || stats.topStudents.length === 0
                ? <tr><td colSpan={3} className="table-empty">{loading ? 'Đang tải...' : 'Không có dữ liệu'}</td></tr>
                : stats.topStudents.map(s => (
                  <tr key={s._id}>
                    <td>
                      <Link to={`/students/${s._id}`} style={{ fontWeight: 600, color: 'var(--text)' }}>{studentName(s.user)}</Link>
                      {s.user?.username && <div style={{ fontSize: 11, color: 'var(--text3)' }}>@{s.user.username}</div>}
                    </td>
                    <td>{bandBadge(s.bestBand)}</td>
                    <td style={{ textAlign: 'center' }}>{s.attempts}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>HỌC SINH</th><th>BỘ ĐỀ</th><th>NGÀY LÀM</th><th>THỜI GIAN</th><th>ĐÚNG/TỔNG</th><th>BAND</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6} className="table-empty">Đang tải...</td></tr>
              : attempts.length === 0
                ? <tr><td colSpan={6} className="table-empty">Không có dữ liệu</td></tr>
                : attempts.map(a => (
                  <tr key={a._id}>
                    <td>
                      {a.userId?._id
                        ? <Link to={`/students/${a.userId._id}`} style={{ fontWeight: 700, color: 'var(--text)' }}>{studentName(a.userId)}</Link>
                        : <strong>{studentName(a.userId)}</strong>}
                      {a.userId?.username && <div style={{ fontSize: 11, color: 'var(--text3)' }}>@{a.userId.username}</div>}
                    </td>
                    <td>{a.testId?.name || '–'}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(a.submittedAt)}</td>
                    <td>{formatDur(a.timeTaken)}</td>
                    <td>{a.correctCount}/{a.totalQuestions}</td>
                    <td>{bandBadge(a.bandScore)}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12 }}>
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPage={setPage} />
      </div>
    </>
  );
}
