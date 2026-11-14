import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FRONTEND_URL, formatDate } from '../utils/api';
import { useApi } from '../hooks/useApi';
import PageHeader from '../components/ui/PageHeader';
import { ErrorState, EmptyState, TableBody } from '../components/ui/States';

// Part 2 · 7 câu chuyện gốc — admin view of speaking-part2.html
// (GET /api/admin/speaking-part2/overview). The 7 stories are code-owned
// (backend/data/speakingPart2.js, versioned sentence keys), so this page is
// read-only: per-story uptake + every student's progress, with the same
// mastery % and 4 steps the student sees. Homework type `speaking_part2`
// passes a story at ≥ passPercent (sticky masteredAt).

const STEPS = [
  ['read', '① Đọc bài mẫu'],
  ['vocab', '② Từ vựng'],
  ['learn', '③ Học thuộc'],
  ['speak', '④ Nói thử'],
];

function Meter({ pct, pass }) {
  const tone = pct >= pass ? 'var(--green)' : pct >= pass / 2 ? 'var(--yellow)' : 'var(--danger)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: tone }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, width: 36, textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

export default function SpeakingPart2() {
  const { data, error, loading, reload } = useApi('/admin/speaking-part2/overview');
  const [story, setStory] = useState('');
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');

  const pass = data?.passPercent || 70;
  const stories = useMemo(() => data?.stories || [], [data]);
  const storyName = useMemo(() => Object.fromEntries(stories.map(s => [s.id, `${s.emoji || ''} ${s.no} · ${s.title}`])), [stories]);
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.rows || []).filter(r => (!story || r.storyId === story)
      && (!state || (state === 'mastered' ? r.masteredAt : state === 'completed' ? r.completedAt : !r.masteredAt))
      && (!q || (r.name || '').toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q)));
  }, [data, story, search, state]);

  return (
    <>
      <PageHeader
        title="Part 2 · 7 câu chuyện gốc"
        subtitle={`Tiến độ học sinh ở trang speaking-part2.html. Một câu chuyện "đạt" khi học được ≥ ${pass}% (nhại + dịch từng câu) — đây cũng là mốc qua bài tập về nhà. Nội dung câu chuyện nằm trong code (backend/data/speakingPart2.js), từ vựng mỗi chuyện là các bài "IELTS Speaking – …" ở Học Vocab Topics.`}
        actions={<>
          <Link className="btn btn-ghost btn-sm" to="/vocabulary-lessons">Từ vựng của chuyện →</Link>
          <a className="btn btn-ghost btn-sm" href={`${FRONTEND_URL}/speaking-part2.html`} target="_blank" rel="noreferrer">Mở trang học sinh ↗</a>
        </>}
      />

      {error && <ErrorState error={error} onRetry={reload} />}

      <div className="skill-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
        {stories.map(s => (
          <button key={s.id} type="button" className={`panel${story === s.id ? ' active' : ''}`}
            style={{ textAlign: 'left', cursor: 'pointer', margin: 0, outline: story === s.id ? '2px solid var(--blue)' : 'none' }}
            onClick={() => setStory(story === s.id ? '' : s.id)} aria-pressed={story === s.id}>
            <div style={{ fontWeight: 700 }}>{s.emoji} {s.no} · {s.group}</div>
            <div className="muted" style={{ fontSize: 12, margin: '2px 0 8px' }}>{s.title}</div>
            <div style={{ fontSize: 12 }}>
              <b>{s.students}</b> HS đã học · <b style={{ color: 'var(--green)' }}>{s.mastered}</b> đạt · {s.completed} xong 4 bước
            </div>
            {s.avgPct != null && <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>TB {s.avgPct}%</div>}
          </button>
        ))}
      </div>

      <div className="filter-bar" style={{ marginBottom: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="search" className="form-input search-input" style={{ maxWidth: 260 }} placeholder="Tìm học sinh…"
          value={search} onChange={e => setSearch(e.target.value)} aria-label="Tìm học sinh" />
        <select className="form-input" style={{ width: 260 }} value={story} onChange={e => setStory(e.target.value)} aria-label="Lọc câu chuyện">
          <option value="">Cả 7 câu chuyện</option>
          {stories.map(s => <option key={s.id} value={s.id}>{storyName[s.id]}</option>)}
        </select>
        <select className="form-input" style={{ width: 170 }} value={state} onChange={e => setState(e.target.value)} aria-label="Lọc trạng thái">
          <option value="">Mọi trạng thái</option>
          <option value="mastered">Đã đạt ≥ {pass}%</option>
          <option value="completed">Xong cả 4 bước</option>
          <option value="learning">Đang học</option>
        </select>
        <span className="muted" style={{ marginLeft: 'auto', fontSize: 13 }}>{rows.length} lượt học</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>HỌC SINH</th><th>CÂU CHUYỆN</th><th>ĐÃ HỌC</th><th>CÁC BƯỚC</th><th>ĐẠT</th><th>CẬP NHẬT</th></tr></thead>
          <TableBody loading={loading} colSpan={6}
            empty={!loading && rows.length === 0 ? <EmptyState icon="📖" title="Chưa có học sinh nào học">Học sinh mở speaking-part2.html và bắt đầu một câu chuyện thì tiến độ hiện ở đây.</EmptyState> : null}>
            {rows.map(r => (
              <tr key={`${r.userId}-${r.storyId}`}>
                <td>
                  <Link to={`/students/${r.userId}`} style={{ fontWeight: 600 }}>{r.name}</Link>
                  <div className="muted" style={{ fontSize: 11 }}>{r.email}</div>
                </td>
                <td style={{ fontSize: 12 }}>{storyName[r.storyId] || r.storyId}</td>
                <td><Meter pct={r.pct} pass={pass} /></td>
                <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                  {STEPS.map(([k, label]) => (
                    <span key={k} className={`badge ${r.steps?.[k] ? 'badge-green' : 'badge-gray'}`} style={{ marginRight: 4, fontSize: 10 }} title={label}>{label}</span>
                  ))}
                  {r.speakRuns > 0 && <span className="muted"> · nói {r.speakRuns} lần</span>}
                </td>
                <td style={{ fontSize: 12 }}>{r.masteredAt ? <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ {formatDate(r.masteredAt).split(' ')[0]}</span> : <span className="muted">—</span>}</td>
                <td style={{ fontSize: 12 }} className="muted">{formatDate(r.updatedAt)}</td>
              </tr>
            ))}
          </TableBody>
        </table>
      </div>
    </>
  );
}
