import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { accClass, fmtDate } from '../../utils/advSentences';

function Loading() {
  return <div style={{ padding: 32 }}><div className="as-spinner" /></div>;
}

function List({ attempts, onOpen }) {
  const total = attempts.length;
  const avg = Math.round(attempts.reduce((s, x) => s + (x.scorePercentage || 0), 0) / total);
  const tq = attempts.reduce((s, x) => s + (x.totalQuestions || 0), 0);
  const tc = attempts.reduce((s, x) => s + (x.correctCount || 0), 0);
  return (
    <>
      <div className="as-hist-stats">
        <div className="as-hist-stat"><div className="n">{total}</div><div className="l">Phiên</div></div>
        <div className="as-hist-stat"><div className="n">{tc}/{tq}</div><div className="l">Đúng/Tổng</div></div>
        <div className="as-hist-stat"><div className="n">{avg}%</div><div className="l">TB</div></div>
      </div>
      {attempts.slice(0, 50).map((x, i) => {
        const acc = x.scorePercentage != null ? Math.round(x.scorePercentage) : 0;
        return (
          <div key={x._id || i} className={`as-hist-entry${x._id ? ' clickable' : ''}`} data-id={x._id} onClick={x._id ? () => onOpen(x._id) : undefined}>
            <div className="as-hist-entry-date">
              {fmtDate(x.completedAt)} · {x.sessionType === 'exam' ? '🎓 Thi thử' : '✏️ Luyện tập'}{x.week ? ` · Tuần ${x.week}` : ''}
            </div>
            <div className="as-hist-entry-name">{x.groupName || '–'}</div>
            <div className="as-hist-entry-row">
              <span>{x.correctCount != null ? x.correctCount : '?'}/{x.totalQuestions != null ? x.totalQuestions : '?'} câu</span>
              <span className={`as-acc ${accClass(acc)}`}>{acc}%</span>
              {x._id && <span style={{ marginLeft: 'auto', color: '#6366f1', fontWeight: 700 }}>Xem chi tiết ›</span>}
            </div>
          </div>
        );
      })}
    </>
  );
}

function Detail({ id, onBack }) {
  const [state, setState] = useState({ status: 'loading' });
  useEffect(() => {
    let alive = true;
    apiFetch(`/adv-sentence/attempt/${id}`)
      .then((d) => { if (alive) setState({ status: 'ready', attempt: d.attempt }); })
      .catch(() => { if (alive) setState({ status: 'error' }); });
    return () => { alive = false; };
  }, [id]);
  const back = <button className="as-btn" id="as-hist-back" style={{ marginBottom: 12 }} onClick={onBack}><i className="fas fa-arrow-left" /> Quay lại danh sách</button>;
  if (state.status === 'loading') return <Loading />;
  if (state.status === 'error' || !state.attempt) {
    return <>{back}<p style={{ color: '#dc2626', textAlign: 'center', padding: 24 }}>Không tải được.</p></>;
  }
  const a = state.attempt;
  const acc = Math.round(a.scorePercentage || 0);
  const items = a.sentences || [];
  return (
    <>
      {back}
      <div className="as-hist-entry-name">{a.groupName || '–'}{a.week ? ` · Tuần ${a.week}` : ''}</div>
      <div className="as-hist-entry-date" style={{ marginBottom: 10 }}>
        {fmtDate(a.completedAt)} · <span className={`as-acc ${accClass(acc)}`}>{a.correctCount || 0}/{a.totalQuestions || 0} · {acc}%</span>
      </div>
      {a.targetStructure && <div className="as-struct-reminder" style={{ margin: '0 0 10px' }}>🎯 {a.targetStructure}</div>}
      {items.length ? items.map((it, i) => (
        <div key={i} className={`as-review-item ${it.isCorrect ? 'ok' : 'bad'}`} style={{ margin: '8px 0' }}>
          <div style={{ fontSize: 12, fontWeight: 800 }}>{it.isCorrect ? '✅' : '❌'} Câu {it.index}{it.structureNote ? ` · ${it.structureNote}` : ''}</div>
          {it.promptVi && <div style={{ fontSize: 13, marginTop: 6, color: 'var(--text2,#6b7280)' }}>{it.promptVi}</div>}
          <div className="as-fb-row"><span className="lbl">📝 Bạn:</span> {it.userAnswer || <i>(bỏ trống)</i>}</div>
          {!it.isCorrect && it.modelAnswer && <div className="as-fb-row"><span className="lbl">✅ Mẫu:</span> <span className="as-fb-model">{it.modelAnswer}</span></div>}
        </div>
      )) : <p style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>Lượt này được lưu trước khi hệ thống ghi chi tiết từng câu.</p>}
    </>
  );
}

// 📝 Lịch sử luyện tập: past sessions, each opens its sentence-by-sentence review
export default function History({ onClose }) {
  const [list, setList] = useState({ status: 'loading', attempts: [] });
  const [openId, setOpenId] = useState(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    let alive = true;
    apiFetch('/adv-sentence/history?limit=100')
      .then((d) => { if (alive) setList({ status: 'ready', attempts: d.attempts || [] }); })
      .catch(() => { if (alive) setList({ status: 'error', attempts: [] }); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [openId]);

  let content;
  if (openId) content = <Detail id={openId} onBack={() => setOpenId(null)} />;
  else if (list.status === 'loading') content = <Loading />;
  else if (list.status === 'error') content = <p style={{ color: '#dc2626', textAlign: 'center', padding: 24 }}>Không tải được lịch sử.</p>;
  else if (!list.attempts.length) content = <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>📭<br />Chưa có lịch sử luyện tập</div>;
  else content = <List attempts={list.attempts} onOpen={setOpenId} />;

  return (
    <div className="as-hist-overlay" id="as-hist-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="as-hist-modal" role="dialog" aria-modal="true">
        <div className="as-hist-hdr">
          <h3 id="as-hist-title">{openId ? '📝 Chi tiết lượt làm' : '📝 Lịch sử luyện tập'}</h3>
          <button className="as-hist-close" id="as-hist-x" aria-label="Đóng" onClick={onClose}><i className="fas fa-times" /></button>
        </div>
        <div className="as-hist-body" id="as-hist-body" ref={bodyRef}>{content}</div>
      </div>
    </div>
  );
}
