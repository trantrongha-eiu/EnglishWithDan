import { useState } from 'react';
import { mascotHtml, scoreMessage } from '../../utils/shell';
import { dataLine, MC_TYPES, SKILL_LABELS, TEXT_TYPES, TYPE_LABELS } from '../../utils/task1Grammar';
import { testResultImage } from '../../utils/writingPractice';
import { Rearrange } from '../writingPractice/Inputs';
import { Blanks, McOptions, T1Chart } from './Parts';
import { SECONDS_PER_QUESTION } from './useT1Test';

function mmss(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function Question({ ex, last, onNext }) {
  const [text, setText] = useState('');
  const [fill, setFill] = useState('');
  const [order, setOrder] = useState('');
  const [mc, setMc] = useState(-1);
  const isText = TEXT_TYPES.includes(ex.type);
  const isMc = MC_TYPES.includes(ex.type);

  const answer = () => {
    if (ex.type === 'rearrange') return order.trim();
    if (ex.type === 'fill_blank') return fill.trim();
    if (isMc) return mc >= 0 ? String(mc) : '';
    return text.trim();
  };
  const onEnter = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onNext(answer()); } };

  return (
    <div className="wp-card">
      <T1Chart id="test-chart" chart={ex.chart} />
      {isText && (
        <div id="test-view-text">
          <div className="wp-task-label" id="test-instruction">{ex.instruction || ''}</div>
          {ex.dataContext?.subject && (
            <div className="t1-data-ctx" id="test-data-ctx-box">
              <div className="t1-data-ctx-label">📋 Ngữ cảnh dữ liệu</div>
              <div id="test-data-ctx-content">{dataLine(ex.dataContext)}</div>
            </div>
          )}
          {ex.type === 'error_correction' && ex.sentenceWithBlanks && (
            <div id="test-error-orig-wrap">
              <div className="t1-data-ctx-label" style={{ marginTop: 8 }}>❌ Câu có lỗi cần sửa:</div>
              <div className="t1-error-text" id="test-error-orig">{ex.sentenceWithBlanks}</div>
            </div>
          )}
          <div className="wp-question-text" id="test-question">{ex.questionVi || ex.questionEn || ''}</div>
          <textarea className="wp-answer-box" id="test-answer-box" placeholder="Nhập câu trả lời..." rows={3}
            value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onEnter} />
        </div>
      )}
      {ex.type === 'rearrange' && (
        <div id="test-view-rearrange">
          <div className="wp-task-label" id="test-rearrange-instruction">{ex.instruction || 'Sắp xếp các từ:'}</div>
          <div className="wp-question-text" id="test-rearrange-context">{ex.questionEn || ex.questionVi || ''}</div>
          <Rearrange words={ex.baseWords} prefix="test-" onChange={setOrder} />
        </div>
      )}
      {ex.type === 'fill_blank' && (
        <div id="test-view-fill">
          <div className="wp-task-label" id="test-fill-label">{ex.instruction || 'Điền vào chỗ trống:'}</div>
          <div className="wp-fill-sentence" id="test-fill-sentence"><Blanks text={ex.sentenceWithBlanks || ex.questionEn || ''} /></div>
          <input className="wp-fill-input" id="test-fill-input" type="text" autoComplete="off" placeholder="Nhập câu trả lời..."
            value={fill} onChange={(e) => setFill(e.target.value)} onKeyDown={onEnter} />
        </div>
      )}
      {isMc && (
        <div id="test-view-mc">
          <div className="wp-task-label" id="test-mc-instruction">{ex.instruction || ''}</div>
          <div className="wp-question-text" id="test-mc-question">{ex.questionEn || ex.questionVi || ''}</div>
          <McOptions id="test-mc-options" options={ex.options} selected={mc} onSelect={setMc} />
        </div>
      )}
      <button className="wp-submit-btn" id="test-next-btn" onClick={() => onNext(answer())} style={{ marginTop: 8 }}>
        {last ? <>Nộp bài <i className="fas fa-check" /></> : <>Tiếp theo <i className="fas fa-arrow-right" /></>}
      </button>
    </div>
  );
}

const retryStyle = { background: 'var(--brand,#e53935)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' };

function Results({ result, onRetry }) {
  if (result.status === 'grading') {
    return <div className="wp-test-score-header" id="test-score-header"><div className="wp-spinner" /><p>Đang chấm bài...</p></div>;
  }
  if (result.status === 'error') {
    return (
      <div className="wp-test-score-header" id="test-score-header">
        <p style={{ color: '#dc2626', marginBottom: 12 }}>{result.msg}</p>
        <button onClick={onRetry} style={retryStyle}>Thử chấm lại</button>
      </div>
    );
  }
  const { score, correct, total, results = [] } = result.data;
  const { emoji, message } = scoreMessage(score);
  const lulu = mascotHtml({ pct: score, text: message, stacked: true });
  const scoreClass = score >= 70 ? 'wp-score-good' : score >= 40 ? 'wp-score-mid' : 'wp-score-bad';
  return (
    <>
      <div className="wp-test-score-header" id="test-score-header">
        <img src={testResultImage(score)} alt="" style={{ display: 'block', width: '100%', maxWidth: 220, borderRadius: 12, margin: '0 auto 12px', objectFit: 'cover' }} />
        {lulu ? <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: lulu }} /> : <div className="wp-done-icon">{emoji}</div>}
        <h2 className={scoreClass}>{score}%</h2>
        <p>{lulu ? '' : message + ' '}Đúng {correct} / {total} câu</p>
      </div>
      <div className="wp-test-review" id="test-review-list">
        {results.map((r, i) => (
          <div key={i} className={r.isCorrect ? 'wp-wr-item-ok' : 'wp-wr-item'}>
            <div className={r.isCorrect ? 'wp-wr-num-ok' : 'wp-wr-num'}>
              {r.isCorrect ? '✅' : '❌'} Câu {i + 1} — {TYPE_LABELS[r.type] || r.type}
              {' '}<span className="wp-wr-skill">{SKILL_LABELS[r.skillType] || ''}</span>
            </div>
            {r.instruction && <div className="wp-wr-instr">{r.instruction}</div>}
            {(r.questionVi || r.questionEn) && <div className="wp-wr-q-i">{r.questionVi || r.questionEn}</div>}
            <div className="wp-wr-row"><span className="wp-wr-lbl-you">Bạn:</span> <span className={r.isCorrect ? 'wp-wr-ans' : 'wp-wr-your'}>{r.userAnswer || '(bỏ trống)'}</span></div>
            {!r.isCorrect && <div className="wp-wr-row"><span className="wp-wr-lbl-ans">Đáp án:</span> <span className="wp-wr-ans">{r.sampleAnswer || ''}</span></div>}
            {r.grammarPoint && <div className="wp-wr-gp">💡 {r.grammarPoint}</div>}
          </div>
        ))}
      </div>
    </>
  );
}

export function TestPanel({ t, onStop, onPractice }) {
  const { phase, run, timeLeft, result } = t;
  if (phase === 'intro' || phase === 'loading') {
    return (
      <div id="test-intro" className="wp-test-intro">
        <div style={{ fontSize: 48 }}>📝</div>
        <h2>Chế độ Thi thử – Task 1</h2>
        <p>Câu hỏi random từ các kỹ năng Task 1. Không có gợi ý. Kết quả hiện sau khi nộp bài.</p>
        <p style={{ fontSize: 13 }}>Chọn cấp độ và số câu rồi nhấn <strong>Bắt đầu thi</strong>.</p>
      </div>
    );
  }
  if (phase === 'results') {
    return (
      <div id="test-results">
        <Results result={result} onRetry={t.retry} />
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <button className="wp-restart-btn" onClick={t.reset}><i className="fas fa-redo" /> Thi lại</button>
          <button className="wp-more-btn" onClick={onPractice}><i className="fas fa-pencil-alt" /> Về luyện tập</button>
        </div>
      </div>
    );
  }
  const ex = run.exercises[run.idx];
  if (!ex) return null;
  const total = run.exercises.length;
  const share = timeLeft / (total * SECONDS_PER_QUESTION);
  return (
    <div id="test-in-progress">
      <div className="wp-progress-bar-wrap">
        <div className="wp-progress-bar" id="test-progress-bar" style={{ width: `${Math.round((run.idx / total) * 100)}%` }} />
      </div>
      <div className="wp-exercise-meta">
        <button className="wp-stop-btn" onClick={onStop}><i className="fas fa-stop-circle" /> Dừng</button>
        <span className={`wp-test-timer${share <= 0.1 ? ' danger' : share <= 0.25 ? ' warn' : ''}`} id="test-timer">⏱ {mmss(timeLeft)}</span>
        <span className="wp-ex-counter" id="test-counter">{run.idx + 1} / {total}</span>
        <span className="wp-type-tag" id="test-type-tag">{TYPE_LABELS[ex.type] || ex.type}</span>
      </div>
      <Question key={run.idx} ex={ex} last={run.idx === total - 1} onNext={t.next} />
    </div>
  );
}
