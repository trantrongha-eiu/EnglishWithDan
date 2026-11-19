import { Fragment, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { bindDict } from '../utils/shell';

// My Mistakes + Thi thử Full test history — /app/review-history?view=mock
// (was review-history.html). Mock tests finish here, so ?view=mock must keep working.

const PAGE_SIZE = 10;
const ATTEMPT_LABEL = {
  reading: 'Reading (Full test)', 'reading-practice': 'Reading (Practice)',
  listening: 'Listening (Full test)', 'listening-practice': 'Listening (Practice)',
};
const MOCK_SKILLS = [['listening', 'Listening'], ['reading', 'Reading'], ['writing', 'Writing'], ['speaking', 'Speaking']];

const categoriesOf = (items) => [...new Set(items.flatMap((r) => (r.mistakes || []).map((m) => m.errorCategory)).filter(Boolean))];

// One page of a list. `url` null = this tab is closed. The last answer stays
// available while the next one loads, so the pager doesn't jump.
function usePagedList(url, onData) {
  const [result, setResult] = useState({ url: null, data: null, failed: false });
  useEffect(() => {
    if (!url) return undefined;
    let alive = true;
    apiFetch(url).then((data) => {
      if (!alive) return;
      setResult({ url, data, failed: false });
      onData?.(data);
    }).catch(() => {
      if (alive) setResult((r) => ({ url, data: r.data, failed: true }));
    });
    return () => { alive = false; };
  }, [url, onData]);
  return { ...result, loading: result.url !== url };
}

function Pager({ prefix, data, onMove }) {
  if (!data) return null;
  const pages = Math.max(1, Math.ceil(data.total / data.limit));
  if (pages <= 1) return null;
  return (
    <div className="rh-pagination" id={`${prefix}Pagination`}>
      <button className="btn btn-ghost btn-sm" id={`${prefix}PrevBtn`} disabled={data.page <= 1} onClick={() => onMove(-1)}>← Trước</button>
      <span id={`${prefix}PageLabel`} style={{ alignSelf: 'center', fontSize: 13, color: 'var(--text2)' }}>Trang {data.page}/{pages}</span>
      <button className="btn btn-ghost btn-sm" id={`${prefix}NextBtn`} disabled={data.page >= pages} onClick={() => onMove(1)}>Sau →</button>
    </div>
  );
}

function ReviewCard({ r }) {
  const mistakes = r.mistakes || [];
  return (
    <div className="card rh-item">
      <div className="card-body">
        <div className="rh-item-meta">
          <span className="badge badge-primary">{ATTEMPT_LABEL[r.attemptType] || r.attemptType}</span>
          <span>{r.completedAt ? new Date(r.completedAt).toLocaleDateString('vi-VN') : ''}</span>
          <span>· {mistakes.length} câu sai</span>
        </div>
        {mistakes.map((m, i) => (
          <div className="rh-mistake" key={i}>
            <div className="rh-mistake-q">Câu {m.questionNumber}{m.questionType ? ` · ${m.questionType}` : ''}</div>
            {m.errorCategory && <div className="rh-mistake-row">❌ <strong>{m.errorCategory}</strong> — {m.errorReason || ''}</div>}
            {m.retryResult && <div className="rh-mistake-row">{m.retryResult === 'correct' ? '✅ Thử lại: đúng' : '❌ Thử lại: vẫn sai'}</div>}
            {m.note && <div className="rh-mistake-note">&quot;{m.note}&quot;</div>}
            {m.learningPoint?.content && <div className="rh-mistake-note">📌 {m.learningPoint.content}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockOverall({ a }) {
  if (a.overallBand != null) return <span className="mt-overall">Band tổng {Number(a.overallBand).toFixed(1)}</span>;
  if (a.status === 'disqualified') return <span className="mt-overall pending">🚫 Huỷ do vi phạm — không tính kết quả</span>;
  return <span className="mt-overall pending">{a.status === 'in-progress' ? 'Đang làm dở' : 'Đang chờ chấm Writing / Speaking'}</span>;
}

function MockCard({ a }) {
  const steps = a.steps || {};
  const links = [];
  // A run in progress continues from the mock test page
  if (a.status === 'in-progress') links.push(['/mock-test.html', 'Tiếp tục thi thử']);
  if (steps.listening?.attemptId) links.push([`/listening.html?review=${steps.listening.attemptId}`, 'Xem lại Listening']);
  if (steps.reading?.attemptId) links.push([`/reading.html?review=${steps.reading.attemptId}`, 'Xem lại Reading']);
  links.push(['/speaking.html?tab=history', 'Lịch sử Speaking'], ['/writing.html', 'Lịch sử Writing']);
  return (
    <div className="card rh-item">
      <div className="card-body">
        <div className="rh-item-meta">
          <span className="badge badge-primary">🎯 Thi thử Full 4 kỹ năng</span>
          <span>{new Date(a.createdAt).toLocaleString('vi-VN')}</span>
        </div>
        <div className="mt-overall-row">
          <MockOverall a={a} />
          {a.proctor?.violated && <span className="mt-violation" title="Số lần rời khỏi tab khi đang thi">⚠️ Vi phạm thi cử · {a.proctor.violationCount || 0} gậy</span>}
        </div>
        <div className="mt-chips">
          {MOCK_SKILLS.map(([skill, label]) => {
            const band = steps[skill]?.band;
            return <span key={skill} className={`mt-chip ${band != null ? 'done' : 'pending'}`}>{label}: {band != null ? Number(band).toFixed(1) : 'chờ chấm'}</span>;
          })}
        </div>
        <div className="mt-links">
          {links.map(([href, label], i) => <Fragment key={href}>{i > 0 && ' · '}<a href={href}>{label}</a></Fragment>)}
        </div>
      </div>
    </div>
  );
}

const Empty = ({ children }) => <div className="rh-empty">{children}</div>;

export default function ReviewHistory() {
  const [params, setParams] = useSearchParams();
  const isMock = params.get('view') === 'mock';

  const [filters, setFilters] = useState({ type: '', from: '', to: '' });
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [mockPage, setMockPage] = useState(1);

  const query = new URLSearchParams({ page, limit: PAGE_SIZE });
  if (filters.type) query.set('attemptType', filters.type);
  if (filters.from) query.set('from', filters.from);
  if (filters.to) query.set('to', filters.to);

  // The category list comes from the page on screen: one it lacks is cleared
  const keepCategory = useCallback((data) => {
    const cats = categoriesOf(data.items || []);
    setCategory((c) => (cats.includes(c) ? c : ''));
  }, []);
  const reviews = usePagedList(isMock ? null : `/review/history?${query}`, keepCategory);
  const mocks = usePagedList(isMock ? `/mock-test/history?page=${mockPage}&limit=${PAGE_SIZE}` : null);

  // Both lists stay mounted (hidden when closed), so one binding covers every render
  useEffect(() => {
    bindDict('rhList', 'review-history');
    bindDict('mockList', 'review-history');
  }, []);

  function setFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }
  function setView(mock) {
    setParams((p) => {
      const next = new URLSearchParams(p);
      if (mock) next.set('view', 'mock'); else next.delete('view');
      return next;
    }, { replace: true });
  }

  const items = reviews.data?.items || [];
  const shown = category ? items.filter((r) => (r.mistakes || []).some((m) => m.errorCategory === category)) : items;
  const mockItems = mocks.data?.items || [];

  return (
    <div className="rh-layout">
      <div className="rh-hero pf-hero pf-hero-coral" data-mascot="think">
        <div className="pf-hero-body">
          <h1 className="rh-title">My <span className="pf-tag">Mistakes</span></h1>
          <p className="rh-subtitle pf-hero-sub">Lịch sử các câu sai đã review — dữ liệu tự động xóa sau 3 tháng, giống lịch sử làm bài.</p>
        </div>
      </div>

      <div className="rh-viewtabs">
        <button id="rhTabMistakes" className={`rh-viewtab${isMock ? '' : ' active'}`} onClick={() => setView(false)}>📝 My Mistakes</button>
        <button id="rhTabMock" className={`rh-viewtab${isMock ? ' active' : ''}`} onClick={() => setView(true)}>🎯 Thi thử Full test</button>
      </div>

      <div className="rh-filters" style={isMock ? { display: 'none' } : undefined}>
        <select id="rhFilterType" value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
          <option value="">Tất cả</option>
          {Object.entries(ATTEMPT_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select id="rhFilterCategory" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Tất cả nhóm lỗi</option>
          {categoriesOf(items).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" id="rhFilterFrom" title="Từ ngày" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} />
        <input type="date" id="rhFilterTo" title="Đến ngày" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} />
      </div>

      <div id="rhList" style={isMock ? { display: 'none' } : undefined}>
        {reviews.loading ? <Empty>Đang tải...</Empty>
          : reviews.failed ? <Empty>Lỗi tải lịch sử review.</Empty>
            : shown.length ? shown.map((r, i) => <ReviewCard key={r._id || i} r={r} />)
              : <Empty>Chưa có review nào phù hợp bộ lọc.</Empty>}
      </div>
      {!isMock && <Pager prefix="rh" data={reviews.data} onMove={(d) => setPage((p) => p + d)} />}

      <div id="mockList" style={isMock ? undefined : { display: 'none' }}>
        {mocks.loading ? <Empty>Đang tải...</Empty>
          : mocks.failed ? <Empty>Lỗi tải lịch sử thi thử.</Empty>
            : mockItems.length ? mockItems.map((a, i) => <MockCard key={a._id || i} a={a} />)
              : <Empty>Bạn chưa hoàn thành bài thi thử full nào.</Empty>}
      </div>
      {isMock && <Pager prefix="mock" data={mocks.data} onMove={(d) => setMockPage((p) => p + d)} />}
    </div>
  );
}
