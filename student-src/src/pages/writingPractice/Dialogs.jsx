import { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { HISTORY_LEVEL_LABELS, HISTORY_TYPE_LABELS } from '../../utils/writingPractice';

const RING = 289.03; // 2π·46

// "Bạn muốn dừng học?" — q = { title, sub, confirmText, continueText, results: { pct, correct, wrong, xp } | null }
export function QuitDialog({ q, onContinue, onConfirm }) {
  const r = q.results;
  const color = r ? (r.pct >= 70 ? '#22c55e' : r.pct >= 40 ? '#f59e0b' : '#ef4444') : '#22c55e';
  return (
    <div className="wp-quit-overlay" id="wp-quit-overlay">
      <div className="wp-quit-box" role="dialog" aria-modal="true">
        <div className="wp-quit-top">
          <div className="wp-quit-mascot">✏️</div>
          <p className="wp-quit-title" id="wp-quit-title">{q.title || 'Bạn muốn dừng học?'}</p>
          <p className="wp-quit-sub" id="wp-quit-sub">{q.sub}</p>
        </div>
        {r && (
          <div className="wp-quit-results" id="wp-quit-results">
            <div className="wp-quit-results-title">Kết quả session</div>
            <div className="wp-quit-ring-wrap">
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="46" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle id="wp-quit-score-circle" cx="55" cy="55" r="46" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray="289.03" strokeDashoffset={(RING - (r.pct / 100) * RING).toFixed(2)} transform="rotate(-90 55 55)" />
              </svg>
              <div className="wp-quit-ring-text">
                <span className="wp-quit-ring-pct" id="wp-quit-ring-pct">{r.pct}%</span>
                <span className="wp-quit-ring-lbl">Chính xác</span>
              </div>
            </div>
            <div className="wp-quit-stat-row">
              <span className="wp-qs-correct"><i className="fas fa-check" /> Đúng: <b id="wp-quit-correct">{r.correct}</b></span>
              <span className="wp-qs-wrong"><i className="fas fa-times" /> Sai: <b id="wp-quit-wrong">{r.wrong}</b></span>
              <span className="wp-qs-xp"><i className="fas fa-star" /> XP: <b id="wp-quit-xp">{r.xp}</b></span>
            </div>
          </div>
        )}
        <div className="wp-quit-actions">
          <button className="wp-quit-continue" id="wp-quit-continue-btn" onClick={onContinue}>
            <i className="fas fa-play-circle" /> {q.continueText || 'Tiếp tục học'}
          </button>
          <button className="wp-quit-leave" id="wp-quit-leave-btn" onClick={onConfirm}>
            <i className="fas fa-sign-out-alt" /> {q.confirmText || 'Dừng lại'}
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryBody({ attempts }) {
  if (!attempts.length) {
    return <div className="t1-hist-empty"><div className="t1-hist-empty-icon">📭</div><p>Chưa có lịch sử. Hãy bắt đầu luyện tập!</p></div>;
  }
  // One row per finished session (correct/total); a row saved before that
  // change has no totalItems and counts as one sentence, like the admin panel
  const itemCount = (a) => a.totalItems ?? 1;
  const total = attempts.reduce((s, a) => s + itemCount(a), 0);
  const totalXP = attempts.reduce((s, a) => s + (a.xpEarned || 0), 0);
  const byDay = {};
  attempts.forEach((a) => {
    const key = new Date(a.createdAt).toISOString().slice(0, 10);
    if (!byDay[key]) byDay[key] = { date: a.createdAt, list: [] };
    byDay[key].list.push(a);
  });
  const days = Object.values(byDay).sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <>
      <div className="t1-hist-summary">
        <div className="t1-hist-stat"><div className="t1-hist-num">{total}</div><div className="t1-hist-lbl">Tổng bài</div></div>
        <div className="t1-hist-stat"><div className="t1-hist-num">{days.length}</div><div className="t1-hist-lbl">Ngày học</div></div>
        <div className="t1-hist-stat"><div className="t1-hist-num">+{totalXP}</div><div className="t1-hist-lbl">Tổng XP</div></div>
      </div>
      <div>
        {days.slice(0, 30).map((d) => {
          const xp = d.list.reduce((s, a) => s + (a.xpEarned || 0), 0);
          const done = d.list.reduce((s, a) => s + itemCount(a), 0);
          const correct = d.list.reduce((s, a) => s + (a.correctItems ?? (a.xpEarned >= 15 ? 1 : 0)), 0);
          const date = new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const types = [...new Set(d.list.flatMap((a) => a.types || (a.type ? [a.type] : [])).map((t) => HISTORY_TYPE_LABELS[t]).filter(Boolean))];
          const levels = [...new Set(d.list.map((a) => HISTORY_LEVEL_LABELS[a.level]).filter(Boolean))];
          return (
            <div key={d.date} className="t1-hist-row">
              <div className="t1-hist-row-date">{date}</div>
              <div className="t1-hist-row-skills">{levels.join(' · ')}{types.length ? ' · ' + types.slice(0, 2).join(', ') : ''}</div>
              <div className="t1-hist-row-stats">
                <span className="t1-hist-row-count">{correct}/{done} câu đúng</span>
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
    apiFetch('/writing-practice/history?limit=200')
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
          <h3>📋 Lịch sử Viết câu giao tiếp</h3>
          <button className="t1-hist-close" onClick={onClose}>✕</button>
        </div>
        <div className="t1-hist-body" id="t1-hist-body">{body}</div>
      </div>
    </div>
  );
}
