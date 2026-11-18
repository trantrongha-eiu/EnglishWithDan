import { useEffect, useState } from 'react';
import { goalProgress } from '../../utils/vocabGoal';
import { getSaveState, onSaveState } from '../../utils/practiceSync';

// Homework "học N từ trong sổ" bars — above the word table (BookView) and
// live during this book's practice (inSession). Port of dashboard.js
// _goalCardHtml; same .vgoal classes from dashboard.css.

const SAVE = {
  pending: ['is-pending', <><i className="fas fa-circle-notch fa-spin" /> Đang lưu…</>],
  saving: ['is-pending', <><i className="fas fa-circle-notch fa-spin" /> Đang lưu…</>],
  saved: ['is-saved', <><i className="fas fa-cloud-arrow-up" /> Đã lưu từng câu lên hệ thống</>],
  retry: ['is-retry', <><i className="fas fa-triangle-exclamation" /> Chưa lưu được (mạng yếu?) — đang tự thử lại, đừng đóng trang</>],
};

function EvidenceState() {
  const [st, setSt] = useState(getSaveState);
  useEffect(() => onSaveState(setSt), []);
  const m = SAVE[st];
  if (!m) return null;
  return <span className={`vgoal-save ${m[0]}`}>{m[1]}</span>;
}

const pctOf = (n, t) => Math.round((Math.min(n, t) / t) * 1000) / 10;

function GoalCard({ g, p, inSession, onStart }) {
  const t = g.target;
  const where = g.requiredSlot ? `Sổ ${g.requiredSlot}` : 'một sổ (Sổ 1–5)';
  const head = (
    <>
      <span className="vgoal-tag">📌 Bài tập{g.title ? ` · ${g.title}` : ''}</span>
      <span className="vgoal-title">Học <b>{t} từ</b> trong {where}</span>
    </>
  );
  if (g.completed) {
    return (
      <div className="vgoal vgoal--done">
        <div className="vgoal-head">{head}<span className="vgoal-badge">✔ Đã đạt</span></div>
      </div>
    );
  }
  const left = Math.max(0, t - p.practiced);
  const missingCorrect = Math.max(0, g.needCorrect - p.correct);
  // not enough words left that a session can show (no meaning = skipped)
  const blockedByMeaning = p.size >= t && p.practiced < t && p.practiced + p.fresh < t && p.noMeaning > 0;
  let status;
  let warn = false;
  if (p.done) status = <>🎉 Đã đủ chỉ tiêu! Bài tập sẽ được tính là hoàn thành.</>;
  else if (p.size < t) {
    warn = true;
    status = <>⚠️ Sổ mới có <b>{p.size}/{t}</b> từ — hãy <b>lưu thêm {t - p.size} từ</b> (+ Add word, Nhập hàng loạt, hoặc lưu từ khi làm bài) rồi luyện tập.</>;
  } else if (blockedByMeaning) {
    warn = true;
    status = <>⚠️ <b>{p.noMeaning} từ chưa có nghĩa</b> nên không xuất hiện khi luyện — còn thiếu <b>{t - p.practiced - p.fresh}</b> từ luyện được. Bấm ✏️ ở từ đó để thêm nghĩa.</>;
  } else if (p.practiced < t) {
    status = <>Còn <b>{left} từ</b> chưa luyện{missingCorrect > 0 && p.practiced - p.correct > 0
      ? <> · cần thêm <b>{missingCorrect}</b> từ đúng — từ nào sai thì luyện lại cho đúng.</> : '.'}</>;
  } else status = <>Đã luyện đủ {t} từ — cần thêm <b>{missingCorrect} từ trả lời đúng</b>: luyện lại các từ đang sai.</>;
  const showCta = !inSession && !p.done && p.size >= t && !blockedByMeaning && onStart;

  return (
    <div className={`vgoal${p.done ? ' vgoal--done' : ''}${warn ? ' vgoal--warn' : ''}`}>
      <div className="vgoal-head">
        {head}
        {showCta && (
          <button type="button" className="vgoal-cta" onClick={onStart}>
            <i className="fas fa-play" /> {p.practiced ? 'Luyện tiếp' : 'Bắt đầu luyện'}
          </button>
        )}
      </div>
      <div className="vgoal-bar" role="progressbar" aria-valuemin={0} aria-valuemax={t} aria-valuenow={Math.min(p.practiced, t)} aria-label="Số từ đã luyện">
        <div className="vgoal-fill vgoal-fill--all" style={{ width: `${pctOf(p.practiced, t)}%` }} />
        <div className="vgoal-fill vgoal-fill--ok" style={{ width: `${pctOf(p.correct, t)}%` }} />
        <div className="vgoal-mark" style={{ left: `${pctOf(g.needCorrect, t)}%` }} title={`Cần ${g.needCorrect} từ đúng`} />
      </div>
      <div className="vgoal-nums">
        <span><i className="vgoal-dot vgoal-dot--all" />Đã luyện <b>{Math.min(p.practiced, t)}/{t}</b></span>
        <span><i className="vgoal-dot vgoal-dot--ok" />Đúng <b>{p.correct}</b> / cần ≥{g.needCorrect}</span>
      </div>
      <div className="vgoal-status">{status}</div>
      {inSession && !p.done && <EvidenceState />}
    </div>
  );
}

export default function VocabGoalCards({ goals, words, inSession = false, onStart }) {
  if (!goals?.length) return null;
  return (
    <div className={`vgoal-wrap${inSession ? ' vgoal-wrap--session' : ''}`}>
      {goals.map(g => (
        <GoalCard key={g.key} g={g} p={goalProgress(g, words)} inSession={inSession} onStart={onStart} />
      ))}
    </div>
  );
}
