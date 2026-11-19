import { useEffect, useRef, useState } from 'react';
import SentenceWbw from '../../components/SentenceWbw';
import { wbwUsable } from '../../utils/sentenceWbw';
import { luluSay } from '../../utils/shell';
import { blankCount, dataLine, MC_TYPES, TEXT_TYPES } from '../../utils/task1Grammar';
import { Rearrange } from '../writingPractice/Inputs';
import { Blanks, DiffText, McOptions, T1Chart, WhenGuide } from './Parts';

const Focus = ({ id, text }) => (text ? (
  <div className="t1-ctx-note" id={id}>
    <div className="t1-ctx-note-lbl">📚 Grammar Focus</div>
    <div>{text}</div>
  </div>
) : null);

// One practice exercise: question, answer widget, "Kiểm tra". The parent keys
// it per exercise, so every input starts empty. Hidden (not unmounted) while
// its feedback shows, as on the old page.
export function ExerciseCard({ ex, hidden, submitting, skipped, onSubmit, onFail, onSkip }) {
  const [text, setText] = useState('');
  const [fill, setFill] = useState('');
  const [order, setOrder] = useState('');
  const [mc, setMc] = useState(-1);
  const [hintsShown, setHintsShown] = useState(0);
  const boxRef = useRef(null);
  const fillRef = useRef(null);

  const isText = TEXT_TYPES.includes(ex.type);
  const isMc = MC_TYPES.includes(ex.type);
  // Word-by-word drill: translation exercises with the answer shipped (practice only)
  const useWbw = ex.type === 'translation' && wbwUsable(ex.translationAnswer);
  const hints = isText && ex.type !== 'error_correction' && !useWbw ? (ex.hints || []) : [];
  const maxHints = Math.min(3, hints.length);

  useEffect(() => {
    if (isText && !useWbw) boxRef.current?.focus();
    if (ex.type === 'fill_blank') fillRef.current?.focus();
  }, [isText, useWbw, ex.type]);

  function answer() {
    if (ex.type === 'rearrange') return order.trim();
    if (ex.type === 'fill_blank') return fill.trim();
    if (isMc) return mc >= 0 ? String(mc) : '';
    return text.trim();
  }
  const submit = () => onSubmit(answer(), mc);
  const onEnter = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    if (!hidden) submit(); // with the feedback open, the page's Enter goes on
  };

  function revealHint(e) {
    if (hintsShown >= maxHints) return;
    const n = hintsShown + 1;
    setHintsShown(n);
    luluSay(e.currentTarget, `Thử dùng “${hints[n - 1]}” xem sao nè 🍊`);
  }

  const sentence = ex.sentenceWithBlanks || ex.questionEn || '';
  const blanks = blankCount(sentence);
  let fillLabel = ex.instruction || 'Điền vào chỗ trống:';
  if (blanks > 1 && !fillLabel.includes('dấu phẩy')) fillLabel += ` — điền ${blanks} chỗ trống, cách nhau bằng dấu phẩy`;
  const fillHints = ex.hints?.length ? ex.hints.slice(0, (ex.answerWordCount || 1) <= 6 ? 2 : 3) : [];
  const dc = ex.dataContext;

  return (
    <div className={`wp-card${hidden ? ' hidden' : ''}`} id="exercise-card">
      <WhenGuide ex={ex} />
      <T1Chart id="t1-chart" chart={ex.chart} />
      {isText && (
        <div id="view-translation">
          <div className="wp-task-label" id="task-instruction">{ex.instruction || ''}</div>
          {ex.type !== 'error_correction' && <Focus id="trans-ctx-note" text={ex.grammarPoint} />}
          {dc?.subject && (
            <div className="t1-data-ctx" id="data-ctx-box">
              <div className="t1-data-ctx-label">📋 Ngữ cảnh dữ liệu</div>
              <div id="data-ctx-content">{`${dc.subject} | ${dc.year || ''} | ${dc.value || ''} ${dc.unit || ''}`}</div>
            </div>
          )}
          {ex.type === 'error_correction' && ex.sentenceWithBlanks && (
            <div id="view-error-orig">
              <div className="t1-data-ctx-label" style={{ marginTop: 8 }}>❌ Câu có lỗi cần sửa:</div>
              <div className="t1-error-text" id="error-orig-text">{ex.sentenceWithBlanks}</div>
            </div>
          )}
          <div className="wp-question-text" id="question-text">{ex.questionVi || ex.questionEn || ''}</div>
          {ex.answerWordCount && !useWbw ? (
            <div className="t1-answer-hint" id="answer-hint-row">
              <span className="t1-answer-hint-count" id="answer-hint-count">📏 {ex.answerWordCount} từ</span>
              <span className="t1-answer-hint-pattern" id="answer-hint-pattern">{ex.answerLetterHint || ''}</span>
            </div>
          ) : null}
          <div className="t1-hints-row" id="hints-row">
            {hintsShown > 0 && (
              <>
                <span className="t1-hint-label">🍊 Lulu gợi ý:</span>
                {hints.slice(0, hintsShown).map((h, i) => <span key={i} className="t1-hint-chip">{h}</span>)}
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
          <div className="wp-task-label" id="rearrange-instruction">{ex.instruction || 'Sắp xếp các từ thành câu đúng:'}</div>
          <Focus id="rearrange-ctx-note" text={ex.grammarPoint} />
          <div className="wp-question-text" id="rearrange-context">{ex.questionEn || ex.questionVi || ''}</div>
          <Rearrange words={ex.baseWords} onChange={setOrder} />
        </div>
      )}
      {ex.type === 'fill_blank' && (
        <div id="view-fill-blank">
          <div className="wp-task-label" id="fill-label">{fillLabel}</div>
          {dc && (dc.subject || dc.value) && (
            <div className="t1-data-ctx" id="fill-data-ctx-box">
              <div className="t1-data-ctx-label" id="fill-data-ctx-label">📊 Dữ liệu</div>
              <div id="fill-data-ctx-content">{dataLine(dc)}</div>
              {dc.additionalData?.note && <div className="t1-data-ctx-note" id="fill-data-ctx-note">→ {dc.additionalData.note}</div>}
            </div>
          )}
          <Focus id="fill-ctx-note" text={ex.grammarPoint} />
          <div className="wp-fill-sentence" id="fill-sentence"><Blanks text={sentence} /></div>
          <div className="t1-hints-row" id="fill-hints-row">
            {fillHints.length > 0 && (
              <>
                <span className="t1-hint-label">💡 Gợi ý:</span>
                {fillHints.map((h, i) => <span key={i} className="t1-hint-chip">{h}</span>)}
              </>
            )}
          </div>
          <input ref={fillRef} className="wp-fill-input" id="fill-input" type="text" autoComplete="off"
            placeholder={blanks > 1 ? `Nhập ${blanks} từ theo thứ tự, cách nhau bằng dấu phẩy (vd: from, to, of)` : 'Nhập từ cần điền vào chỗ trống...'}
            value={fill} onChange={(e) => setFill(e.target.value)} onKeyDown={onEnter} />
        </div>
      )}
      {isMc && (
        <div id="view-multiple-choice">
          <div className="wp-task-label" id="mc-instruction">{ex.instruction || ''}</div>
          <Focus id="mc-ctx-note" text={ex.grammarPoint} />
          <div className="wp-question-text" id="mc-question">{ex.questionEn || ex.questionVi || ''}</div>
          <McOptions id="mc-options" options={ex.options} selected={mc} onSelect={setMc} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
        {!skipped && (
          <button className="wp-skip-btn" id="skip-btn" onClick={onSkip}>
            <i className="fas fa-forward" /> Bỏ qua
          </button>
        )}
        {hints.length > 0 && (
          <button className="wp-vocab-hint-btn ask-lulu" id="vocab-hint-btn" disabled={hintsShown >= maxHints} onClick={revealHint} title="Hỏi Lulu gợi ý từ vựng (tối đa 3 lần)">
            <span className="ask-lulu-ic" /> Hỏi Lulu <span id="vocab-hint-count">{hintsShown ? `${hintsShown}/${maxHints}` : ''}</span>
          </button>
        )}
        <button className="wp-submit-btn" id="submit-btn" disabled={submitting || hidden} onClick={submit} style={{ flex: 1 }}>
          <i className="fas fa-check" /> Kiểm tra
        </button>
      </div>
    </div>
  );
}

// The result of one answer.
// fb = { userAnswer, isCorrect, sampleAnswer, feedbackVi, grammarPoint, explanation, mc: { options, picked, correct } | null, countdown }
export function FeedbackCard({ fb, onNext }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, []);
  const exp = [fb.grammarPoint, fb.explanation].filter(Boolean).join(' — ');
  return (
    <div ref={ref} className="wp-feedback-card" id="feedback-card">
      <div className={`wp-result-banner ${fb.isCorrect ? 'wp-result-correct' : 'wp-result-wrong'}`} id="result-banner">
        {fb.isCorrect ? '✅ Chính xác!' : '❌ Chưa đúng'}
      </div>
      {fb.mc ? (
        // The options with the right one marked (the old page hid them with the card)
        <McOptions id="mc-feedback-options" options={fb.mc.options} selected={-1} marks={fb.mc} />
      ) : (
        <div className="wp-comparison-box" id="comparison-box">
          <div className="wp-cmp-row wp-cmp-student">
            <span className="wp-cmp-label">📝 Câu của bạn:</span>
            <span className="wp-cmp-text" id="student-answer-display"><DiffText user={fb.userAnswer} sample={fb.sampleAnswer} /></span>
          </div>
          <div className="wp-cmp-row wp-cmp-sample">
            <span className="wp-cmp-label">✅ Đáp án mẫu:</span>
            <span className="wp-cmp-text" id="sample-answer-display">{fb.sampleAnswer || '—'}</span>
          </div>
        </div>
      )}
      {exp && (
        <div className="t1-explanation" id="grammar-explanation">
          <div className="t1-exp-title">💡 Grammar Point</div>
          <div className="t1-exp-body" id="grammar-explanation-text">{exp}</div>
        </div>
      )}
      <div className="wp-feedback" id="feedback-text">{fb.feedbackVi || ''}</div>
      <button className="wp-next-btn" id="next-btn-practice" onClick={onNext}>
        Câu tiếp theo <i className="fas fa-arrow-right" />
      </button>
      <div id="t1-countdown-bar" style={{ display: fb.countdown ? 'block' : 'none' }}>
        {fb.countdown ? <div className="t1-countdown-bar" style={{ '--cd-dur': `${fb.countdown}ms` }} /> : null}
      </div>
    </div>
  );
}
