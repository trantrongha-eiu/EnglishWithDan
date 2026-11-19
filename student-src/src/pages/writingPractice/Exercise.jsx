import { Fragment, useEffect, useRef, useState } from 'react';
import SentenceWbw from '../../components/SentenceWbw';
import { wbwUsable } from '../../utils/sentenceWbw';
import { luluSay } from '../../utils/shell';
import { answerDiff } from '../../utils/writingPractice';
import { BlankSentence, CombineSentences, Connector, FillOptions, Rearrange } from './Inputs';

// One practice exercise: the question, its answer widget and "Kiểm tra".
// The parent keys it per exercise, so every input starts empty.
export function ExerciseCard({ ex, answered, submitting, skipped, onSubmit, onFail, onSkip }) {
  const [text, setText] = useState('');
  const [fill, setFill] = useState('');
  const [order, setOrder] = useState('');
  const [hintsShown, setHintsShown] = useState(0);
  const boxRef = useRef(null);

  const isText = ex.type === 'translation' || ex.type === 'expand';
  // The word-by-word drill: translation exercises with the answer shipped
  // (practice only; never `expand`, whose sample is just one valid rewrite)
  const useWbw = ex.type === 'translation' && wbwUsable(ex.translationAnswer);
  const hints = ex.hints || [];
  const maxHints = Math.min(3, hints.length);
  const showHintBtn = isText && hints.length > 0 && !useWbw;

  useEffect(() => {
    if ((isText && !useWbw) || ex.type === 'combine') boxRef.current?.focus();
  }, [isText, useWbw, ex.type]);

  function answer() {
    if (ex.type === 'rearrange') return order.trim();
    if (ex.type === 'fill_blank') return fill.trim();
    return text.trim();
  }
  const submit = () => onSubmit(answer());
  const onEnter = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    if (!answered) submit(); // with the feedback open, the page's Enter goes on
  };

  function revealHint(e) {
    if (hintsShown >= maxHints) return;
    const n = hintsShown + 1;
    setHintsShown(n);
    luluSay(e.currentTarget, `Thử dùng “${hints[n - 1]}” xem sao nè 🍊`);
  }

  const answerHint = (rowId, n, pattern) => (
    <div className="wp-answer-hint" id={rowId}>
      <span className="wp-answer-hint-count">📏 {n} từ</span>
      <span className="wp-answer-hint-pattern">{pattern || ''}</span>
    </div>
  );

  return (
    <div className="wp-card" id="exercise-card">
      {isText && (
        <div id="view-translation">
          <div className="wp-task-label" id="task-instruction">{ex.instruction || 'Dịch sang tiếng Anh:'}</div>
          <div className="wp-question-text" id="question-text">{ex.type === 'expand' ? ex.baseText || ex.question : ex.question}</div>
          {ex.answerWordCount && !useWbw ? answerHint('answer-hint-row', ex.answerWordCount, ex.answerLetterHint) : null}
          <div className="wp-hints-row" id="hints-row">
            {hintsShown > 0 && (
              <>
                <span className="wp-hint-label">🍊</span>
                {hints.slice(0, hintsShown).map((h, i) => <span key={i} className="wp-hint-chip">{h}</span>)}
              </>
            )}
          </div>
          {useWbw ? (
            <SentenceWbw answer={ex.translationAnswer} onComplete={(a) => onSubmit(a)} onFail={onFail} />
          ) : (
            <textarea ref={boxRef} className="wp-answer-box" id="answer-box" placeholder="Viết câu trả lời của bạn tại đây..." rows={3}
              value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onEnter} />
          )}
        </div>
      )}
      {ex.type === 'rearrange' && (
        <div id="view-rearrange">
          <div className="wp-task-label">Sắp xếp các từ thành câu đúng:</div>
          <Rearrange words={ex.baseWords} onChange={setOrder} />
        </div>
      )}
      {ex.type === 'fill_blank' && (
        <div id="view-fill-blank">
          <div className="wp-task-label" id="fill-label">{ex.instruction || 'Điền vào chỗ trống:'}</div>
          <div className="wp-fill-sentence" id="fill-sentence"><BlankSentence text={ex.question} /></div>
          <FillOptions id="fill-options" options={ex.options} onPick={setFill} />
          <input className="wp-fill-input" id="fill-input" type="text" placeholder="Nhập từ cần điền vào chỗ trống..."
            value={fill} onChange={(e) => setFill(e.target.value)} onKeyDown={onEnter} />
        </div>
      )}
      {ex.type === 'combine' && (
        <div id="view-combine">
          <div className="wp-task-label" id="combine-label">{ex.instruction || 'Nối hai câu thành một:'}</div>
          <div className="wp-combine-sentences" id="combine-sentences"><CombineSentences sentences={ex.sentences} /></div>
          <div className="wp-connector-hint" id="connector-hint"><Connector connector={ex.connector} /></div>
          {ex.answerWordCount ? answerHint('combine-answer-hint-row', ex.answerWordCount, ex.answerLetterHint) : null}
          <textarea ref={boxRef} className="wp-answer-box" id="combine-answer-box" placeholder="Viết câu đã nối..." rows={2}
            value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onEnter} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
        {!answered && !skipped && (
          <button className="wp-skip-btn" id="skip-btn" onClick={onSkip} title="Bỏ qua – câu này sẽ xuất hiện lại ở cuối">
            <i className="fas fa-forward" /> Bỏ qua
          </button>
        )}
        {showHintBtn && (
          <button className="wp-vocab-hint-btn ask-lulu" id="vocab-hint-btn" disabled={hintsShown >= maxHints} onClick={revealHint} title="Hỏi Lulu gợi ý từ vựng (tối đa 3 lần)">
            <span className="ask-lulu-ic" /> Hỏi Lulu <span id="vocab-hint-count">{hintsShown ? `${hintsShown}/${maxHints}` : ''}</span>
          </button>
        )}
        {!answered && (
          <button className="wp-submit-btn" id="submit-btn" disabled={submitting} onClick={submit} style={{ flex: 1 }}>
            <i className="fas fa-check" /> Kiểm tra
          </button>
        )}
      </div>
      <div className="wp-key-hint">Enter ↵ để kiểm tra &nbsp;·&nbsp; Shift+Enter để xuống dòng</div>
    </div>
  );
}

// The result of one answer. fb = { userAnswer, isExpand, isCorrect, sampleAnswer, feedbackVi, explanation }
export function FeedbackCard({ fb, countdown, onNext }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, []);
  const banner = fb.isExpand
    ? ['wp-result-info', '📖 Xem câu mẫu để so sánh']
    : fb.isCorrect ? ['wp-result-correct', '✅ Chính xác! Rất tốt!'] : ['wp-result-wrong', '❌ Chưa đúng – xem đáp án gợi ý'];
  const diff = !fb.isExpand && !fb.isCorrect && fb.sampleAnswer;
  return (
    <div ref={ref} className="wp-feedback-card" id="feedback-card">
      <div className={`wp-result-banner ${banner[0]}`} id="result-banner">{banner[1]}</div>
      <div className="wp-comparison-box">
        <div className="wp-cmp-row wp-cmp-student">
          <span className="wp-cmp-label">📝 Câu của bạn:</span>
          <span className={`wp-cmp-text ${fb.isExpand ? '' : fb.isCorrect ? 'wp-answer-good' : 'wp-answer-bad'}`} id="student-answer-display">
            {diff ? answerDiff(fb.userAnswer, fb.sampleAnswer).map((w, i) => (
              <Fragment key={i}>{i > 0 && ' '}<span className={w.ok ? 'wp-diff-ok' : 'wp-diff-err'}>{w.word}</span></Fragment>
            )) : fb.userAnswer}
          </span>
        </div>
        <div className="wp-cmp-row wp-cmp-sample">
          <span className="wp-cmp-label">✅ Đáp án gợi ý:</span>
          <span className="wp-cmp-text" id="sample-answer-display">{fb.sampleAnswer || ''}</span>
        </div>
      </div>
      <div className="wp-feedback" id="feedback-text">{fb.feedbackVi || ''}</div>
      {fb.explanation && <div className="wp-explanation-box" id="explanation-box">{fb.explanation}</div>}
      <button className="wp-next-btn" id="wp-next-btn" onClick={onNext}>
        Câu tiếp theo <i className="fas fa-arrow-right" />
      </button>
      <div id="wp-countdown-bar" style={{ display: countdown ? 'block' : 'none' }}>
        <div className="wp-countdown-bar-inner" style={countdown ? { '--cd-dur': `${countdown}ms` } : undefined} />
      </div>
    </div>
  );
}
