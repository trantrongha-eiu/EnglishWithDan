import { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { showBadges } from '../../utils/shell';
import { MODE_LABELS } from '../../utils/task2Template';
import { copyText, toBody } from './helpers';

// "Xem đầy đủ" (the full template of the open type — the same lines the
// path drills) and "Lịch sử" (attempts of the last 90 days).

function Shell({ id, title, icon, wide, onClose, children }) {
  return toBody(
    <div id={id} className="tpl-hist-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`tpl-hist-box${wide ? ' tpl-full-box' : ''}`} role="dialog" aria-modal="true">
        <div className="tpl-hist-hdr">
          <h3 className="tpl-hist-title"><i className={`fas ${icon}`} /> {title}</h3>
          <button className="tpl-hist-close" onClick={onClose} aria-label="Đóng"><i className="fas fa-times" /></button>
        </div>
        {children}
      </div>
    </div>,
  );
}

// data = js/task2-generic-templates.js (already loaded by the page)
export function FullDialog({ data, level: startLevel, typeId, onClose }) {
  const [level, setLevel] = useState(startLevel);
  const [vi, setVi] = useState(false);
  const G = window.Task2GenericTpl;
  const html = data && G ? G.html(data, level, typeId, vi)
    : '<p style="color:#e53935;text-align:center;padding:24px">Không tải được nội dung. Vui lòng thử lại.</p>';
  function copy() {
    const text = G ? G.text(data, level, typeId) : '';
    if (text) copyText(text, 'Đã sao chép văn bản!');
  }
  return (
    <Shell id="tpl-full-overlay" title="Bản đầy đủ template" icon="fa-file-lines" wide onClose={onClose}>
      <div className="tpl-full-toolbar">
        <div className="tpl-full-level-toggle">
          <button className={`tpl-full-level-btn${level === 'band6' ? ' active' : ''}`} data-level="band6" onClick={() => setLevel('band6')}>🌱 Band 6+</button>
          <button className={`tpl-full-level-btn${level === 'band7' ? ' active' : ''}`} data-level="band7" onClick={() => setLevel('band7')}>🏆 Band 7+</button>
        </div>
        <button className="t2-tpl-vi-btn-tab" onClick={() => setVi(!vi)}><span id="tpl-full-vi-label">{vi ? '🇻🇳 Ẩn tiếng Việt' : '🇻🇳 Hiện tiếng Việt'}</span></button>
        <button className="t2-tpl-vi-btn-tab" onClick={copy}><i className="fas fa-copy" /> Sao chép văn bản</button>
      </div>
      <div id="tpl-full-body" className="tpl-hist-body tpl-full-body" dangerouslySetInnerHTML={{ __html: html }} />
    </Shell>
  );
}

export function HistoryDialog({ onClose }) {
  const [st, setSt] = useState({ loading: true });
  useEffect(() => {
    let alive = true;
    apiFetch('/task2template/history?limit=200')
      .then((d) => { showBadges(d); if (!d.success) throw new Error(d.message); if (alive) setSt({ attempts: d.attempts || [] }); })
      .catch((e) => { if (alive) setSt({ error: e.message }); });
    return () => { alive = false; };
  }, []);

  let body;
  if (st.loading) body = <div className="tpl-hist-loading"><div className="tpl-hist-loading-icon">⏳</div><p>Đang tải...</p></div>;
  else if (st.error) body = <p style={{ color: '#e53935', textAlign: 'center', padding: 24, fontSize: 13 }}>Không thể tải: {st.error}</p>;
  else if (!st.attempts.length) body = <div className="tpl-hist-empty"><div className="tpl-hist-empty-icon">📭</div><p>Chưa có lịch sử luyện tập</p></div>;
  else {
    const attempts = st.attempts;
    const totalCorrect = attempts.reduce((s, a) => s + (a.correctItems || 0), 0);
    const totalItems = attempts.reduce((s, a) => s + (a.totalItems || 0), 0);
    body = (
      <>
        <div className="tpl-hist-stats">
          <div className="tpl-hist-stat"><div className="tpl-hist-stat-val">{attempts.length}</div><div className="tpl-hist-stat-lbl">Phiên học</div></div>
          <div className="tpl-hist-stat"><div className="tpl-hist-stat-val">{totalCorrect}/{totalItems}</div><div className="tpl-hist-stat-lbl">Đúng/Tổng</div></div>
          <div className="tpl-hist-stat"><div className="tpl-hist-stat-val">90</div><div className="tpl-hist-stat-lbl">Ngày lưu</div></div>
        </div>
        {attempts.slice(0, 40).map((a, i) => {
          const acc = a.totalItems > 0 ? Math.round((a.correctItems / a.totalItems) * 100) : 0;
          const cls = acc >= 70 ? 'good' : acc >= 50 ? 'mid' : 'bad';
          const date = new Date(a.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const label = a.isExam ? 'Thi thử' : (MODE_LABELS[a.mode] || (a.mode && a.mode !== 'cloze' ? a.mode : ''));
          return (
            <div className="tpl-hist-entry" key={a._id || i}>
              <div className="tpl-hist-date">{date}</div>
              <div className="tpl-hist-name">{a.templateName || a.templateType || '–'}{a.level === 'band6' ? ' · Band 6+' : ' · Band 7+'}{label && <span className="tpl-hist-mode-badge">{label}</span>}</div>
              <div className="tpl-hist-row"><span className="tpl-hist-score">{a.correctItems}/{a.totalItems} câu</span><span className={`tpl-hist-badge tpl-hist-badge--${cls}`}>{acc}%</span></div>
            </div>
          );
        })}
      </>
    );
  }
  return (
    <Shell id="tpl-hist-overlay" title="Lịch sử Task 2 Templates" icon="fa-history" onClose={onClose}>
      <div id="tpl-hist-body" className="tpl-hist-body">{body}</div>
    </Shell>
  );
}
