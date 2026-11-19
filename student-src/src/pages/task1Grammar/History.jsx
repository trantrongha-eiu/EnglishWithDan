import { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { SKILL_LABELS } from '../../utils/task1Grammar';

// 📊 Lịch sử luyện tập Task 1: one row per practice session (sessionId; an
// old row without one falls in its hour), newest 40.
function HistoryBody({ attempts }) {
  if (!attempts.length) {
    return <div className="t1-hist-empty"><div className="t1-hist-empty-icon">📭</div><p>Chưa có lịch sử luyện tập.<br />Hãy bắt đầu làm bài nhé!</p></div>;
  }
  const total = attempts.length;
  const correct = attempts.filter((a) => a.isCorrect).length;
  const totalXP = attempts.reduce((s, a) => s + (a.xpEarned || 0), 0);
  const accuracy = Math.round((correct / total) * 100);

  const sessions = {};
  attempts.forEach((a) => {
    const key = a.sessionId || new Date(a.createdAt).toISOString().slice(0, 13);
    if (!sessions[key]) sessions[key] = { key, date: a.createdAt, attempts: [] };
    sessions[key].attempts.push(a);
  });
  const rows = Object.values(sessions).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 40);

  return (
    <>
      <div className="t1-hist-summary">
        <div className="t1-hist-stat"><div className="t1-hist-num">{total}</div><div className="t1-hist-lbl">Tổng câu</div></div>
        <div className="t1-hist-stat"><div className="t1-hist-num">{accuracy}%</div><div className="t1-hist-lbl">Tỉ lệ đúng</div></div>
        <div className="t1-hist-stat"><div className="t1-hist-num">+{totalXP}</div><div className="t1-hist-lbl">Tổng XP</div></div>
      </div>
      <div className="t1-hist-list">
        {rows.map((s) => {
          const sc = s.attempts.filter((a) => a.isCorrect).length;
          const xp = s.attempts.reduce((sum, a) => sum + (a.xpEarned || 0), 0);
          const acc = Math.round((sc / s.attempts.length) * 100);
          const cls = acc >= 70 ? 'good' : acc >= 50 ? 'mid' : 'bad';
          const date = new Date(s.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          const skills = [...new Set(s.attempts.map((a) => SKILL_LABELS[a.skillType]).filter(Boolean))];
          return (
            <div key={s.key} className="t1-hist-row">
              <div className="t1-hist-row-date">{date}</div>
              <div className="t1-hist-row-skills">{skills.slice(0, 3).join(' · ') || 'Tổng hợp'}</div>
              <div className="t1-hist-row-stats">
                <span className="t1-hist-row-count">{s.attempts.length} câu</span>
                <span className={`t1-hist-row-acc ${cls}`}>{sc}/{s.attempts.length} đúng · {acc}%</span>
                <span className="t1-hist-row-xp">+{xp} XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function HistoryDialog({ onClose }) {
  const [state, setState] = useState({ status: 'loading' });
  useEffect(() => {
    let alive = true;
    apiFetch('/task1/history?limit=200')
      .then((d) => {
        if (!d.success) throw new Error(d.message);
        if (alive) setState({ status: 'ready', attempts: d.attempts || [] });
      })
      .catch((e) => { if (alive) setState({ status: 'error', msg: e.message }); });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  let body;
  if (state.status === 'loading') {
    body = <div style={{ textAlign: 'center', padding: 32 }}><div className="wp-spinner" /><p style={{ color: '#9ca3af', marginTop: 10, fontSize: 13 }}>Đang tải...</p></div>;
  } else if (state.status === 'error') {
    body = <p style={{ color: '#e53935', textAlign: 'center', padding: 24, fontSize: 13 }}>Không thể tải: {state.msg}</p>;
  } else {
    body = <HistoryBody attempts={state.attempts} />;
  }
  return (
    <div className="t1-hist-overlay" id="t1-hist-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="t1-hist-modal" role="dialog" aria-modal="true">
        <div className="t1-hist-header">
          <h3>📊 Lịch sử luyện tập Task 1</h3>
          <button className="t1-hist-close" onClick={onClose}>✕</button>
        </div>
        <div className="t1-hist-body" id="t1-hist-body">{body}</div>
      </div>
    </div>
  );
}
