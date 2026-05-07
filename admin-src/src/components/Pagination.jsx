export default function Pagination({ page, total, pageSize, onPage }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="pagination">
      <span className="page-info">{start}–{end} / {total}</span>
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          className={`page-btn${p === page ? ' active' : ''}`}
          onClick={() => onPage(p)}
        >{p}</button>
      ))}
    </div>
  );
}
