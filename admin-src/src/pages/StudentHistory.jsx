import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import Pagination from '../components/Pagination';
import { skillBadge, SKILL_META } from '../components/SkillBadge';
import { TableBody, EmptyState } from '../components/ui/States';
import { bandBadge, simBadge } from '../components/ui/badges';
import { formatDur, formatNumber } from '../utils/format';

const PAGE_SIZE = 25;
const INITIAL_LOAD = 150;
const LOAD_MORE_STEP = 300;

// Skill → admin DELETE endpoint. Only these collections have one; rows of
// other skills (grammar/vocab lessons, templates, courses, gap-fill,
// "viết câu nâng cao") get no delete button instead of the old guessed
// `/admin/<skill>-attempts/:id` URL that 404'd.
const DELETE_ENDPOINT = {
  'reading':            id => `/admin/attempts/${id}`,
  'listening':          id => `/admin/listening-attempts/${id}`,
  'writing':            id => `/admin/writing-attempts/${id}`,
  'listening-practice': id => `/admin/listening-practice-attempts/${id}`,
  'reading-practice':   id => `/admin/reading-practice-attempts/${id}`,
  'writing-practice':   id => `/admin/writing-practice-attempts/${id}`,
  'task1-practice':     id => `/admin/task1-attempts/${id}`,
  'task2-practice':     id => `/admin/task2-attempts/${id}`,
  'speaking':           id => `/admin/speaking-attempts/${id}`,
  'dictation':          id => `/admin/dictation-attempts/${id}`,
};

export default function StudentHistory() {
  const toast   = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();

  const [loadLimit, setLoadLimit] = useState(INITIAL_LOAD);
  const [skill,   setSkill]   = useState('');
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [removed, setRemoved] = useState(() => new Set());

  // Skill filtering happens on the server (?skill= queries one collection),
  // so it covers ALL history, not just the rows loaded so far.
  const path = `/admin/recent-attempts?limit=${loadLimit}${skill ? `&skill=${encodeURIComponent(skill)}` : ''}`;
  const { data, error, loading, refreshing, reload } = useApi(path);
  const all = useMemo(() => (data?.attempts || []).filter(h => !removed.has(h._id)), [data, removed]);
  const total = Math.max(0, (data?.total ?? all.length) - removed.size);

  const filtered = useMemo(() => all.filter(h => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (h.userId?.displayName || '').toLowerCase().includes(q)
      || (h.userId?.username || '').toLowerCase().includes(q)
      || (h.testName || '').toLowerCase().includes(q);
  }), [all, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const rows       = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hasMore = all.length < total;

  function del(h, name) {
    const endpoint = DELETE_ENDPOINT[h.skill];
    if (!endpoint) return;
    confirm(`Xóa bài làm của "${name}"?`, async () => {
      try {
        await apiFetch(endpoint(h._id), { method: 'DELETE' });
        toast('Đã xóa');
        setRemoved(s => new Set(s).add(h._id));
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">
          Lịch sử làm bài ({formatNumber(filtered.length)}{search ? ` / ${all.length} đã tải` : ''})
        </h2>
        <button className="btn btn-ghost btn-sm" onClick={reload} disabled={loading || refreshing}>
          {refreshing ? '⏳' : '🔄'} Làm mới
        </button>
      </div>

      {!loading && hasMore && (
        <div className="hint-box" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <span>
            Đang hiển thị <strong>{all.length}</strong> / <strong>{formatNumber(total)}</strong> lượt gần nhất{skill ? ' của kỹ năng này' : ''}.
            {search && ' Ô tìm kiếm chỉ lọc trên phần đã tải.'}
          </span>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }} onClick={() => setLoadLimit(l => l + LOAD_MORE_STEP)} disabled={refreshing}>
            {refreshing ? '⏳ Đang tải...' : `Tải thêm ${LOAD_MORE_STEP}`}
          </button>
        </div>
      )}

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input
          type="search"
          className="form-input search-input"
          placeholder="Tìm tên, username, bộ đề..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          aria-label="Tìm trong lịch sử đã tải"
          style={{ maxWidth: 300 }}
        />
        <select className="form-input" value={skill} onChange={e => { setSkill(e.target.value); setPage(1); setLoadLimit(INITIAL_LOAD); }} style={{ width: 220 }} aria-label="Lọc theo kỹ năng">
          <option value="">Tất cả kỹ năng</option>
          {Object.entries(SKILL_META).filter(([k]) => k !== 'wt1-course').map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </select>
      </div>

      <div className={`table-wrap${refreshing ? ' is-refreshing' : ''}`}>
        <table className="table">
          <thead>
            <tr>
              <th>Học sinh</th><th>Kỹ năng</th><th>Bộ đề</th><th>Ngày làm</th>
              <th>Thời gian</th><th>Đúng/Tổng</th><th>Band</th><th aria-label="Thao tác" />
            </tr>
          </thead>
          <TableBody loading={loading} error={error} onRetry={reload} colSpan={8} rows={8}
            empty={rows.length === 0 && <EmptyState icon="📝" title="Không có dữ liệu" />}>
            {rows.map(h => {
              const name = h.userId?.displayName || h.userId?.username || '–';
              const graded = h.skill === 'writing' || h.skill === 'speaking';
              return (
                <tr key={`${h.skill}-${h._id}`}>
                  <td>
                    {h.userId?._id
                      ? <Link to={`/students/${h.userId._id}`} className="user-cell-name">{name}</Link>
                      : <strong>{name}</strong>}
                    {h.userId?.username && name !== h.userId.username && (
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>@{h.userId.username}</div>
                    )}
                  </td>
                  <td>{skillBadge(h.skill)}</td>
                  <td>
                    {h.testName || '–'}
                    {h.testMeta && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{h.testMeta}</div>}
                    {simBadge(h)}
                  </td>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(h.date)}</td>
                  <td>{formatDur(h.duration)}</td>
                  <td>{h.correctCount != null && h.totalQuestions != null ? `${h.correctCount}/${h.totalQuestions}` : '–'}</td>
                  <td>{graded && h.bandScore == null
                    ? <span className="muted" style={{ fontSize: 12 }}>{h.status === 'error' ? 'Lỗi chấm bài' : 'Chờ chấm'}</span>
                    : bandBadge(h.bandScore)}
                  </td>
                  <td>
                    {isAdmin && DELETE_ENDPOINT[h.skill] && (
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(h, name)} aria-label={`Xoá bài làm của ${name}`} title="Xoá bài làm">🗑</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </TableBody>
        </table>
      </div>

      <Pagination page={safePage} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
    </>
  );
}
