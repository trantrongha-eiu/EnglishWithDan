// "📄 Xem full bài mẫu": the story word for word as in the framework docx
// (GET /speaking-part2/full/:id, built by backend/scripts/speakingBook/buildPart2Full.js)
import { Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { apiFetch } from '../../utils/api';
import { boxTone } from '../../utils/speakingPart2';

const cache = {};

// **bold** and line breaks of the docx text
function Rich({ t }) {
  return String(t).split('\n').map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line.split(/\*\*([^*]+)\*\*/g).map((x, j) => (j % 2 ? <b key={j}>{x}</b> : x))}
    </Fragment>
  ));
}

function Blocks({ blocks }) {
  return blocks.map((b, i) => {
    if (b.k === 'sub') return <p key={i} className="sp2-full-sub">{b.t}</p>;
    if (b.k === 'h') return <h3 key={i} className={`sp2-full-h${/^▼/.test(b.t) ? ' is-flex' : /^★/.test(b.t) ? ' is-star' : ''}`}>{b.t}</h3>;
    if (b.k === 'p') return <p key={i} className="sp2-full-p"><Rich t={b.t} /></p>;
    if (b.k === 'box') {
      return (
        <div key={i} className={`sp2-full-box is-${boxTone(b.label)}`}>
          {b.label && <b className="sp2-full-box-l">{b.label}</b>}
          {b.lines.map((l, j) => <p key={j}><Rich t={l} /></p>)}
        </div>
      );
    }
    if (b.k === 'table') {
      const cols = (b.head || b.rows[0] || []).length;
      return (
        <div key={i} className="sp2-table-wrap"><table className="sp2-table sp2-full-table">
          {b.head && <thead><tr>{b.head.map((c, j) => <th key={j}>{c}</th>)}</tr></thead>}
          <tbody>{b.rows.map((r, j) => (r.length === 1 && cols > 1
            ? <tr key={j} className="is-sec"><td colSpan={cols}><Rich t={r[0]} /></td></tr>
            : <tr key={j}>{r.map((c, n) => <td key={n}><Rich t={c} /></td>)}</tr>))}</tbody>
        </table></div>
      );
    }
    return null;
  });
}

export default function FullDialog({ st, onClose }) {
  const [full, setFull] = useState(() => cache[st.id] || null);
  const [failed, setFailed] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    if (cache[st.id]) return undefined;
    let alive = true;
    apiFetch('/speaking-part2/full/' + encodeURIComponent(st.id))
      .then((d) => { cache[st.id] = d.full; if (alive) setFull(d.full); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [st.id]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return createPortal(
    <div id="sp2-full-ov" className="sp2-full-ov" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sp2-full-dlg" role="dialog" aria-modal="true" aria-label={'Full bài mẫu ' + st.title} style={{ '--g-c': st.color }}>
        <div className="sp2-full-head"><span className="sp2-full-emoji">{st.emoji}</span>
          <div className="sp2-full-ttl"><small>Bài mẫu gốc · Master Framework v3</small><b>{st.no} · {st.title}</b></div>
          <button ref={closeRef} type="button" className="t2-icon-btn" aria-label="Đóng" onClick={onClose}><i className="fas fa-times" /></button></div>
        <div className="sp2-full-body">
          {full ? <Blocks blocks={full.blocks} />
            : failed ? <div className="sp2-boot">Không tải được bài mẫu — thử lại sau nha.</div>
              : <div className="sp2-boot"><i className="fas fa-spinner fa-spin" /> Đang tải…</div>}
        </div>
      </div>
    </div>,
    document.body,
  );
}
