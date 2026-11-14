import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { formatDate } from '../utils/api';
import { TableBody, EmptyState } from '../components/ui/States';
import Pagination from '../components/Pagination';
import { useAdminData } from '../contexts/AdminDataContext';
import ReviewGradeModal from './submissionReviews/ReviewGradeModal';

// "Chấm bài khoá học & Speaking".
//  - Writing khoá học: the AI grades on submit but the student does NOT see
//    it yet — the teacher checks the AI band here, confirms/corrects it and
//    sends it (inbox + the attempt's Lịch sử). These are the "chờ chấm" rows.
//  - Speaking (course + standalone practice): the AI grade already went to
//    the student; the teacher can still listen and add a grade/comment. Only
//    answers the AI could NOT grade wait on the teacher ("pending" + badge).
// Backend: routes/admin/submissionReviews.js → services/teacherReviewService.js.
// The IELTS Writing tests keep their own page (/writing-grades).

const PAGE = 30;
const TABS = [
  { key: 'writing', label: '✍️ Writing khoá học' },
  { key: 'speaking', label: '🎤 Speaking' },
];
const TYPE_LABEL = {
  sentence_writing: 'Viết câu', paragraph_writing: 'Viết đoạn', full_task1: 'Bài hoàn chỉnh',
  speaking_response: 'Nói (khoá học)', speaking: 'Luyện Speaking',
};

function bandBadge(b) {
  if (b == null || b === 0) return <span className="muted" style={{ fontSize: 12 }}>–</span>;
  const cls = b >= 7 ? 'badge-green' : b >= 5.5 ? 'badge-blue' : 'badge-red';
  return <span className={`badge ${cls}`} style={{ fontWeight: 700 }}>{Number(b).toFixed(1)}</span>;
}

export default function SubmissionReviews() {
  const [params, setParams] = useSearchParams();
  const kind = TABS.some(t => t.key === params.get('tab')) ? params.get('tab') : 'writing';
  const [writingStatus, setWritingStatus] = useState('pending');
  const [speakingStatus, setSpeakingStatus] = useState('all');
  const isWriting = kind === 'writing';
  const status = isWriting ? writingStatus : speakingStatus;
  const setStatus = isWriting ? setWritingStatus : setSpeakingStatus;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null); // { source, id }
  const { reloadBadges } = useAdminData();

  // Reset to page 1 when a filter changes (adjust-during-render, as Users.jsx).
  const [prev, setPrev] = useState([kind, status, search]);
  if (prev[0] !== kind || prev[1] !== status || prev[2] !== search) {
    setPrev([kind, status, search]);
    if (page !== 1) setPage(1);
  }

  const q = new URLSearchParams({ kind, status, page, limit: PAGE });
  if (search.trim()) q.set('search', search.trim());
  const { data, error, loading, refreshing, reload } = useApi(`/admin/submission-reviews?${q}`);
  const { data: countData, reload: reloadCounts } = useApi('/admin/submission-reviews/counts');
  const counts = countData?.counts || {};
  const rows = data?.rows || [];

  function onSaved() {
    setOpen(null);
    reload(); reloadCounts(); reloadBadges?.();
  }

  return (
    <>
      {open && <ReviewGradeModal source={open.source} id={open.id} onClose={() => setOpen(null)} onSaved={onSaved} />}

      <div className="section-header">
        <div>
          <h2 className="section-title">Chấm bài khoá học & Speaking</h2>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
            <b>Writing khoá học:</b> AI chấm ngay khi nộp nhưng học sinh <b>chưa thấy điểm</b> — giáo viên xem điểm AI, xác nhận/sửa rồi gửi (học sinh nhận ở Hộp thư + Lịch sử bài làm).{' '}
            <b>Speaking:</b> điểm AI đã gửi thẳng cho học sinh — giáo viên chỉ cần chấm những bài AI chấm lỗi, còn lại nghe/nhận xét thêm nếu muốn.
            Bài thi Writing IELTS chấm ở trang <Link to="/writing-grades">Chấm bài Writing</Link>.
          </div>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { reload(); reloadCounts(); }} disabled={refreshing}>
          {refreshing ? '⏳' : '🔄'} Làm mới
        </button>
      </div>

      <div className="inner-tabs-nav" style={{ marginBottom: 14 }}>
        {TABS.map(t => (
          <button key={t.key} type="button" className={`inner-tab${t.key === kind ? ' active' : ''}`}
            onClick={() => setParams(t.key === 'writing' ? {} : { tab: t.key }, { replace: true })}>
            {t.label}{counts[t.key] > 0 && <span className="badge badge-red" style={{ marginLeft: 6 }}>{counts[t.key]}</span>}
          </button>
        ))}
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input className="form-input search-input" placeholder="Tìm học sinh..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 260 }} aria-label="Tìm học sinh" />
        <select className="form-input" value={status} onChange={e => setStatus(e.target.value)} style={{ width: 180 }} aria-label="Trạng thái">
          <option value="pending">{isWriting ? '⏳ Chờ giáo viên xác nhận' : '⚠️ AI chấm lỗi — cần GV chấm'}</option>
          <option value="done">✅ Đã chấm</option>
          <option value="all">Tất cả</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>HỌC SINH</th>
              <th>BÀI</th>
              <th>LOẠI</th>
              {kind === 'writing' ? <th>SỐ TỪ</th> : <th>GHI ÂM</th>}
              <th>AI</th>
              <th>GV CHẤM</th>
              <th>NGÀY NỘP</th>
              <th></th>
            </tr>
          </thead>
          <TableBody loading={loading} error={error} onRetry={reload} colSpan={8}
            empty={!rows.length && <EmptyState icon={status === 'pending' ? '🎉' : '📭'} title={status === 'pending' ? (isWriting ? 'Không còn bài nào chờ xác nhận' : 'Không có bài Speaking nào AI chấm lỗi') : 'Chưa có bài nào'} />}>
            {rows.map(r => (
              <tr key={`${r.source}-${r.id}`}>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.student?.name}</div>
                  {r.student?.username && <div className="muted" style={{ fontSize: 12 }}>@{r.student.username}</div>}
                </td>
                <td style={{ maxWidth: 340 }}>
                  <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{r.title}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{r.context}{r.attempt ? ` · lượt ${r.attempt}` : ''}</div>
                </td>
                <td style={{ fontSize: 12 }}>{TYPE_LABEL[r.exerciseType] || r.exerciseType}</td>
                {kind === 'writing'
                  ? <td style={{ fontSize: 12 }}>{r.words ?? '–'}</td>
                  : <td>{r.hasAudio ? '🔊' : <span className="muted" style={{ fontSize: 12 }}>chỉ transcript</span>}</td>}
                <td>
                  {r.aiBand ? bandBadge(r.aiBand) : r.score != null ? <span style={{ fontSize: 12 }}>{r.score}%</span> : <span className="muted">–</span>}
                  {r.aiUnavailable && <div style={{ fontSize: 11, color: 'var(--yellow, #d97706)' }}>AI lỗi/bận</div>}
                </td>
                <td>
                  {r.reviewedAt
                    ? <>{bandBadge(r.teacherBand)}<div className="muted" style={{ fontSize: 11 }}>{r.reviewerName}</div></>
                    : isWriting
                      ? <><span className="badge badge-yellow">Chờ xác nhận</span>{r.held && <div className="muted" style={{ fontSize: 11 }}>HS chưa thấy điểm</div>}</>
                      : r.aiUnavailable
                        ? <span className="badge badge-yellow">Cần GV chấm</span>
                        : <span className="muted" style={{ fontSize: 12 }}>AI đã gửi HS</span>}
                </td>
                <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(r.createdAt)}</td>
                <td>
                  <button type="button" className={`btn btn-sm ${r.reviewedAt || (!isWriting && !r.aiUnavailable) ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setOpen({ source: r.source, id: r.id })}>
                    {r.reviewedAt ? 'Xem / sửa' : isWriting ? 'Xác nhận' : r.aiUnavailable ? 'Chấm' : 'Xem / nhận xét'}
                  </button>
                </td>
              </tr>
            ))}
          </TableBody>
        </table>
      </div>
      <Pagination page={page} total={data?.total || 0} pageSize={PAGE} onPage={setPage} />
    </>
  );
}
