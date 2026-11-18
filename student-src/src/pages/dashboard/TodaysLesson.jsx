import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchMatch from '../../utils/searchMatch';
import { apiFetch } from '../../utils/api';
import { todaysLessonIndex, groupByClass } from '../../utils/lessons';

// "Học vocab theo topic" card on the home view — the lesson of the day
// (date-seeded), best score from GET /vocabulary-lessons/:id/attempt, and an
// "Đổi bài" picker. Port of dashboard-lesson.js renderTodaysLessonCard +
// setupTodaysLessonPicker; same .todays-lesson-* / .up-* classes.

function Picker({ lessons, onPick, onClose, btnRef }) {
  const [q, setQ] = useState('');
  const box = useRef(null);
  useEffect(() => {
    const onDown = (e) => {
      if (box.current && !box.current.contains(e.target) && !btnRef.current?.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [onClose, btnRef]);
  const list = q ? SearchMatch.filter(lessons, q, l => l.title) : lessons;
  return (
    <div className="unit-picker-dd classroom-picker-dd" ref={box} style={{ display: 'block' }}>
      <div className="up-picker-heading"><i className="fas fa-layer-group" /> Vocab by Topics</div>
      <div className="up-search-row">
        <i className="fas fa-search" />
        <input type="text" className="up-search-input" placeholder="Tìm bài quiz theo tên..." autoComplete="off" autoFocus
          value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} />
      </div>
      <div className="up-search-results">
        {!list.length ? <div className="up-empty">{q ? 'Không tìm thấy bài quiz nào' : 'Chưa có bài học nào'}</div>
          : groupByClass(list).map(g => (
            <div key={g.key}>
              <div className="up-group-label">{g.label}</div>
              {g.items.map(l => (
                <div key={l._id} className="up-item" role="button" tabIndex={0}
                  style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}
                  onMouseDown={(e) => { e.preventDefault(); onPick(l._id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') onPick(l._id); }}>
                  <span style={{ flex: 1, minWidth: 0, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.35 }}>{l.title}</span>
                  {l.difficulty && <span className="classroom-item-badge" style={{ flexShrink: 0, marginTop: 1 }}>{l.difficulty}</span>}
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}

export default function TodaysLesson({ lessons }) {
  const [pickedId, setPickedId] = useState(null);
  const [open, setOpen] = useState(false);
  const [best, setBest] = useState({ id: null, score: 0 });
  const btnRef = useRef(null);
  const today = lessons?.length ? (lessons.find(l => l._id === pickedId) || lessons[todaysLessonIndex(lessons.length)]) : null;
  const todayId = today?._id;

  useEffect(() => {
    if (!todayId) return undefined;
    let alive = true;
    apiFetch(`/vocabulary-lessons/${todayId}/attempt`)
      .then(d => { if (alive) setBest({ id: todayId, score: d.attempt?.bestScore || 0 }); })
      .catch(() => { /* progress just shows 0% */ });
    return () => { alive = false; };
  }, [todayId]);

  if (!today) return null;
  const score = best.id === todayId ? best.score : 0;
  return (
    <div className="todays-lesson-card" style={{ display: 'flex' }}>
      <div className="todays-lesson-icon todays-lesson-lulu" data-dan="excited" aria-hidden="true"><i className="fas fa-chalkboard-teacher" /></div>
      <div className="todays-lesson-info">
        <div className="todays-lesson-bubble" role="note">Vào đây cày vocab nè ní!</div>
        <div className="todays-lesson-label-row">
          <div className="todays-lesson-label">Học vocab theo topic</div>
          <button ref={btnRef} className="todays-lesson-switch-btn" title="Chọn bài Quiz khác" onClick={() => setOpen(o => !o)}>
            <i className="fas fa-exchange-alt" /> Đổi bài
          </button>
          {open && <Picker lessons={lessons} btnRef={btnRef} onClose={() => setOpen(false)} onPick={(id) => { setPickedId(id); setOpen(false); }} />}
        </div>
        <div className="todays-lesson-title">{today.title}</div>
        <div className="todays-lesson-meta">{[today.difficulty, today.wordCount != null ? `${today.wordCount} từ` : ''].filter(Boolean).join(' · ')}</div>
        <div className="todays-lesson-progress-row">
          <div className="progress-bar" style={{ flex: 1 }}><div className="progress-fill" style={{ width: `${score}%` }} /></div>
          <span className="todays-lesson-progress-text">{score}%</span>
        </div>
      </div>
      <Link className="btn btn-primary" to="/dashboard/topics">Xem các topic</Link>
    </div>
  );
}
