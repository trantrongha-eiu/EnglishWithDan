import { useEffect, useRef, useState } from 'react';
import { mascotHtml, scoreMessage } from '../../utils/shell';
import { testResultImage, timeAgo, TYPE_LABELS } from '../../utils/writingPractice';
import { SECONDS_PER_QUESTION } from './useWpTest';
import { BlankSentence, CombineSentences, Connector, FillOptions, Rearrange } from './Inputs';
import MemeImg from '../../components/MemeImg';

function mmss(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function Question({ ex, last, onNext }) {
  const [text, setText] = useState('');
  const [fill, setFill] = useState('');
  const [order, setOrder] = useState('');
  const boxRef = useRef(null);
  const isText = ex.type !== 'rearrange' && ex.type !== 'fill_blank';
  useEffect(() => { if (isText) boxRef.current?.focus(); }, [isText]);

  const answer = () => (ex.type === 'rearrange' ? order : ex.type === 'fill_blank' ? fill : text).trim();
  const onEnter = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onNext(answer()); } };

  return (
    <div className="wp-card">
      {isText && (
        <div id="test-view-text">
          <div className="wp-task-label" id="test-instruction">{ex.instruction || 'Dịch sang tiếng Anh:'}</div>
          <div className="wp-question-text" id="test-question">{ex.type === 'combine' ? '' : ex.type === 'expand' ? (ex.baseText || ex.question) : ex.question}</div>
          <div id="test-combine-sentences" style={{ marginBottom: 8 }}>{ex.type === 'combine' && <CombineSentences sentences={ex.sentences} />}</div>
          <div id="test-connector-hint" style={{ marginBottom: 8 }}>{ex.type === 'combine' && <Connector connector={ex.connector} />}</div>
          <textarea ref={boxRef} className="wp-answer-box" id="test-answer-box" placeholder="Nhập câu trả lời..." rows={3}
            value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onEnter} />
        </div>
      )}
      {ex.type === 'rearrange' && (
        <div id="test-view-rearrange">
          <div className="wp-task-label">Sắp xếp các từ thành câu đúng:</div>
          <Rearrange words={ex.baseWords} prefix="test-" onChange={setOrder} />
        </div>
      )}
      {ex.type === 'fill_blank' && (
        <div id="test-view-fill">
          <div className="wp-task-label" id="test-fill-label">{ex.instruction || 'Điền vào chỗ trống:'}</div>
          <div className="wp-fill-sentence" id="test-fill-sentence"><BlankSentence text={ex.question} /></div>
          <FillOptions id="test-fill-options" options={ex.options} onPick={setFill} />
          <input className="wp-fill-input" id="test-fill-input" type="text" placeholder="Nhập câu trả lời..."
            value={fill} onChange={(e) => setFill(e.target.value)} onKeyDown={onEnter} />
        </div>
      )}
      <button className="wp-submit-btn" id="test-next-btn" onClick={() => onNext(answer())}>
        {last ? <>Nộp bài <i className="fas fa-check" /></> : <>Tiếp theo <i className="fas fa-arrow-right" /></>}
      </button>
    </div>
  );
}

function Results({ result, onRetry }) {
  if (result.status === 'grading') {
    return <div className="wp-test-score-header" id="test-score-header"><div className="wp-spinner" /><p>Đang chấm bài...</p></div>;
  }
  if (result.status === 'error') {
    return (
      <div className="wp-test-score-header" id="test-score-header">
        <p style={{ color: '#dc2626', marginBottom: 12 }}>{result.msg}</p>
        <button onClick={onRetry} style={{ background: 'var(--brand,#e53935)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Thử chấm lại</button>
      </div>
    );
  }
  const { correct, score, countable, results } = result.data;
  const expandCount = results.length - (countable ?? results.length);
  const { emoji, message } = scoreMessage(score);
  const lulu = mascotHtml({ pct: score, text: message, stacked: true });
  return (
    <>
      <div className="wp-test-score-header" id="test-score-header">
        <MemeImg src={testResultImage(score)} style={{ display: 'block', width: '100%', maxWidth: 220, borderRadius: 12, margin: '0 auto 12px', objectFit: 'cover' }} />
        {lulu && <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: lulu }} />}
        <div className="wp-test-big-score">{lulu ? '' : emoji + ' '}{score}%</div>
        <div className="wp-test-score-msg">
          {lulu ? '' : message + ' '}Đúng {correct}/{countable || results.length} câu
          {expandCount > 0 && <> <span style={{ fontSize: 13, opacity: 0.7 }}>(+ {expandCount} câu mở rộng)</span></>}.
        </div>
      </div>
      <div className="wp-test-review" id="test-review-list">
        {results.map((r, i) => {
          const q = r.isExpand ? (r.baseText || r.question) : r.type === 'combine' ? (r.sentences || []).join(' + ') : r.question;
          return (
            <div key={i} className={`wp-review-item ${r.isCorrect ? 'wp-review-correct' : r.isExpand ? 'wp-review-info' : 'wp-review-wrong'}`}>
              <div className="wp-review-num">{i + 1}</div>
              <div className="wp-review-body">
                <div className="wp-review-q">{r.isExpand ? '📖' : r.isCorrect ? '✅' : '❌'} {q}</div>
                <div className="wp-review-your">📝 Bạn: <em>{r.userAnswer || '(bỏ qua)'}</em></div>
                <div className="wp-review-ans">✅ Đáp án: <strong>{r.sampleAnswer}</strong></div>
                {r.grammarPoint && <div className="wp-review-gp">📌 {r.grammarPoint}</div>}
                {r.explanation && <div className="wp-review-gp wp-review-gp-explain">💡 {r.explanation}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function TestPanel({ t, onStop, onPractice }) {
  const { phase, run, timeLeft, result, resume } = t;
  if (phase === 'intro' || phase === 'loading') {
    return (
      <div id="test-intro" className="wp-test-intro" style={phase === 'loading' ? { display: 'none' } : undefined}>
        <div style={{ fontSize: 48 }}>📝</div>
        <h2>Chế độ Thi thử</h2>
        <p>Câu hỏi random từ nhiều chủ đề. Không có gợi ý. Kết quả hiện sau khi nộp bài.</p>
        <p style={{ fontSize: 13, color: '#6b7280' }}>Chọn cấp độ và số câu rồi nhấn <strong>Bắt đầu thi</strong>.</p>
        {resume && (
          <div id="test-resume-banner" style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', marginTop: 14, fontSize: 13, flexWrap: 'wrap' }}>
            <span style={{ flex: 1, minWidth: 180 }}>
              📝 Bài thi dở dang: câu <strong>{(resume.answers?.length || 0) + 1}/{resume.exercises.length}</strong>{' '}
              <span style={{ color: '#6b7280' }}>({timeAgo(resume.savedAt)})</span>
            </span>
            <button onClick={t.resumeTest} style={{ background: '#3d8bff', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Tiếp tục thi</button>
            <button onClick={t.dismissResume} style={{ background: 'none', border: '1px solid #d1d5db', color: '#6b7280', borderRadius: 7, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Bỏ qua</button>
          </div>
        )}
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
        <button className="wp-stop-btn" onClick={onStop} title="Dừng thi"><i className="fas fa-stop-circle" /> Dừng</button>
        <span className={`wp-test-timer${share <= 0.1 ? ' danger' : share <= 0.25 ? ' warn' : ''}`} id="test-timer">⏱ {mmss(timeLeft)}</span>
        <span className="wp-grammar-badge" id="test-grammar-badge">{ex.grammarPoint || ''}</span>
        <span className="wp-ex-counter" id="test-counter">{run.idx + 1} / {total}</span>
        <span className="wp-type-tag" id="test-type-tag">{TYPE_LABELS[ex.type] || ex.type}</span>
      </div>
      <Question key={run.idx} ex={ex} last={run.idx === total - 1} onNext={t.next} />
    </div>
  );
}
