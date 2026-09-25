import { pageWindow } from '../utils/pageWindow';

export default function Pagination({ page, total, pageSize, onPage }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <nav className="pagination" aria-label="Phân trang">
      <span className="page-info">{start}–{end} / {total}</span>
      <button type="button" className="page-btn" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Trang trước">‹</button>
      {pageWindow(page, pages).map(p => (typeof p === 'string'
        ? <span key={p} className="page-gap" aria-hidden="true">…</span>
        : (
          <button
            key={p}
            type="button"
            className={`page-btn${p === page ? ' active' : ''}`}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Trang ${p}`}
            onClick={() => onPage(p)}
          >{p}</button>
        )))}
      <button type="button" className="page-btn" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Trang sau">›</button>
    </nav>
  );
}
