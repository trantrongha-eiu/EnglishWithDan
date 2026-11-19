import { useState } from 'react';

// Hồ sơ → Lịch sử. The server sends up to 60 attempts per skill; each table
// shows the latest few with a "Xem thêm" row.

const KEEP = 8;
const dayVN = (d) => new Date(d).toLocaleDateString('vi-VN');
const Band = ({ cls, value }) => <span className={`badge ${cls}`}>Band {value}</span>;

function HistoryCard({ id, bodyId, icon, title, head, rows }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? rows : rows.slice(0, KEEP);
  const hidden = rows.length - KEEP;
  return (
    <div className="card mb-16" id={id}>
      <div className="card-header"><span style={{ fontWeight: 700 }}><i className={`fas ${icon}`} /> {title}</span></div>
      <div className="table-wrap">
        <table className="responsive-table">
          <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody id={bodyId}>
            {!rows.length && (
              <tr><td colSpan={head.length} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 20 }}>Chưa có dữ liệu</td></tr>
            )}
            {shown.map((cells, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                {cells.map((c, j) => <td key={j}>{c}</td>)}
              </tr>
            ))}
            {hidden > 0 && (
              <tr>
                <td colSpan={head.length} style={{ textAlign: 'center', padding: 10 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setExpanded((v) => !v)}>
                    {expanded ? 'Thu gọn' : `Xem thêm ${hidden} lần`}
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function HistoryTab({ active, stats }) {
  const list = (k) => stats?.[k].history || [];
  const words = (n) => (n != null ? `${n} từ` : '-');
  return (
    <div className={`tab-content${active ? ' active' : ''}`} id="tab-history">
      <HistoryCard id="readingHistoryCard" bodyId="readingHistory" icon="fa-book-open" title="Lịch sử Reading"
        head={['#', 'Ngày', 'Band Score']}
        rows={list('reading').map((a) => [dayVN(a.createdAt), <Band key="b" cls="badge-primary" value={a.bandScore} />])} />
      <HistoryCard id="listeningHistoryCard" bodyId="listeningHistory" icon="fa-headphones" title="Lịch sử Listening"
        head={['#', 'Ngày', 'Band Score']}
        rows={list('listening').map((a) => [dayVN(a.createdAt), <Band key="b" cls="badge-success" value={a.bandScore} />])} />
      <HistoryCard id="writingHistoryCard" bodyId="writingHistory" icon="fa-pen" title="Lịch sử Writing"
        head={['#', 'Ngày', 'Task 1 (số từ)', 'Task 2 (số từ)', 'Band']}
        rows={list('writing').map((a) => [
          dayVN(a.createdAt), words(a.wordCount1), words(a.wordCount2),
          a.grading?.overallBand != null
            ? <Band key="b" cls="badge-primary" value={a.grading.overallBand} />
            : <span key="b" style={{ color: 'var(--text-light)' }}>Chờ chấm</span>,
        ])} />
      <HistoryCard id="speakingHistoryCard" bodyId="speakingHistory" icon="fa-microphone" title="Lịch sử Speaking"
        head={['#', 'Ngày', 'Band Score (AI)']}
        rows={list('speaking').map((a) => [
          dayVN(a.createdAt),
          a.aiFeedback?.overallBand ? <Band key="b" cls="badge-warning" value={a.aiFeedback.overallBand} /> : '-',
        ])} />

      <a href="/review-history.html" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
        <span style={{ fontWeight: 700 }}><i className="fas fa-clipboard-check" /> My Mistakes — Lịch sử Review lỗi sai</span>
        <i className="fas fa-chevron-right" style={{ color: 'var(--text-light)' }} />
      </a>
    </div>
  );
}
