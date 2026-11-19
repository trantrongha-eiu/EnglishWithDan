import { Fragment, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { mascotHtml, siteToast } from '../../utils/shell';
import { Block, TEACHING_BLOCKS } from './blocks';
import { Conjugation, Translation, VerbForms } from './Drills';

// One open lesson. It is mounted again for "Làm lại bài" and for every lesson
// change, so its answers always start clean. Graded here: every Mini Quiz
// question + every multiple-choice exercise, sent back by position ("ref").

export const COMPLETE_THRESHOLD = 80;
const HW_PASS_PERCENT = 70;
const EX_TYPE_LABELS = {
  multiple_choice: 'Trắc nghiệm', fill_blank: 'Điền từ', error_correction: 'Sửa lỗi',
  translation_vn_en: 'Dịch Việt → Anh', translation_en_vn: 'Dịch Anh → Việt',
  sentence_transformation: 'Biến đổi câu', rewrite: 'Viết lại câu', find_mistake: 'Tìm lỗi sai', mini_dialogue: 'Hội thoại ngắn',
};
const LONG_ANSWER = ['translation_vn_en', 'translation_en_vn', 'mini_dialogue'];

function fmtDate(d, withTime) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${p(dt.getDate())}/${p(dt.getMonth() + 1)}/${dt.getFullYear()}${withTime ? ` ${p(dt.getHours())}:${p(dt.getMinutes())}` : ''}`;
}
function fmtDuration(sec) {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  if (s < 60) return `${s} giây`;
  const m = Math.floor(s / 60);
  return `${m} phút${s % 60 ? ` ${s % 60} giây` : ''}`;
}

function countGradeable(blocks) {
  return blocks.reduce((n, b) => {
    if (b.type === 'quiz') return n + (b.data.questions || []).length;
    if (b.type === 'practice_exercises') return n + (b.data.exercises || []).filter((ex) => ex.type === 'multiple_choice').length;
    return n;
  }, 0);
}

function Options({ itemRef, options, answerIndex, quiz }) {
  const pick = quiz.picks.find((p) => p.ref === itemRef);
  return (
    <div className="eg-quiz-options">
      {(options || []).map((opt, i) => {
        const mark = pick ? (i === answerIndex ? ' eg-correct' : i === pick.chosen ? ' eg-wrong' : '') : '';
        return <button key={i} className={`eg-quiz-option${mark}`} disabled={!!pick || !!quiz.final} onClick={() => quiz.answer(itemRef, i, answerIndex)}>{opt}</button>;
      })}
    </div>
  );
}

function Explanation({ text, show }) {
  return <div className={`eg-quiz-explanation${show ? ' vis' : ''}`}><i className="fas fa-info-circle" /> {text}</div>;
}

function Exercise({ ex, i, bi, quiz }) {
  const input = useRef(null);
  const [revealed, setRevealed] = useState(null);
  const isChoice = ex.type === 'multiple_choice';
  const ref = `ex:${bi}:${i}`;
  const Field = LONG_ANSWER.includes(ex.type) ? 'textarea' : 'input';
  const fieldProps = LONG_ANSWER.includes(ex.type) ? { rows: 2 } : { type: 'text' };
  return (
    <div className="eg-ex-item" data-ref={isChoice ? ref : undefined}>
      <div className="eg-ex-badge">{EX_TYPE_LABELS[ex.type] || ex.type}</div>
      <div className="eg-ex-question">{i + 1}. {String(ex.question).split('\n').map((line, k) => <Fragment key={k}>{k > 0 && <br />}{line}</Fragment>)}</div>
      {isChoice ? (
        <>
          <Options itemRef={ref} options={ex.options} answerIndex={ex.answerIndex} quiz={quiz} />
          <Explanation text={ex.explanation} show={quiz.picks.some((p) => p.ref === ref)} />
        </>
      ) : (
        <>
          <Field className="eg-ex-input" ref={input} placeholder="Nhập câu trả lời của bạn..." disabled={revealed != null} {...fieldProps} />
          <button className="eg-ex-reveal-btn" disabled={revealed != null} onClick={() => setRevealed(input.current.value.trim())}>Xem đáp án</button>
          <div className={`eg-ex-answer-panel${revealed != null ? ' vis' : ''}`}>
            {revealed != null && (
              <>
                {revealed && <div className="eg-ex-user-answer"><strong>Bạn trả lời:</strong> {revealed}</div>}
                <div className="eg-ex-model-answer"><strong>Đáp án gợi ý:</strong> {ex.answer}</div>
                <div className="eg-ex-explanation"><i className="fas fa-info-circle" /> {ex.explanation}</div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const Exercises = ({ data, bi, quiz }) => {
  const list = data.exercises || [];
  return (
    <Block icon="fa-dumbbell" title={`Luyện tập (${list.length} bài)`}>
      <div className="eg-ex-list">{list.map((ex, i) => <Exercise key={i} ex={ex} i={i} bi={bi} quiz={quiz} />)}</div>
    </Block>
  );
};

function RetryButton({ onClick }) {
  return (
    <div style={{ textAlign: 'center', marginTop: 10 }}>
      <button type="button" className="eg-retry-btn" onClick={onClick} style={{ background: 'transparent', border: '1.5px solid currentColor', borderRadius: 10, padding: '8px 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: 'inherit' }}>
        <i className="fas fa-rotate-left" /> Làm lại bài
      </button>
    </div>
  );
}

function QuizResult({ final, onRetry, boxRef }) {
  // Lulu reads the summary out; icon + text without her
  const html = final && mascotHtml({ pct: final.score, text: final.summary, size: 64 });
  return (
    <div ref={boxRef} className={`eg-quiz-result${final ? ` vis ${final.passed ? 'eg-qr-good' : 'eg-qr-bad'}` : ''}`} id="eg-quiz-result">
      {final && (
        <>
          {html
            ? <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />
            : <><i className={`fas ${final.passed ? 'fa-trophy' : 'fa-redo'}`} /> {final.summary}</>}
          <RetryButton onClick={onRetry} />
        </>
      )}
    </div>
  );
}

function Quiz({ data, bi, quiz, holdsResult }) {
  return (
    <Block icon="fa-puzzle-piece" title="Mini Quiz">
      <div className="eg-quiz-progress">Đã trả lời: {quiz.picks.length}/{quiz.total} câu (toàn bài)</div>
      {(data.questions || []).map((q, qi) => {
        const ref = `q:${bi}:${qi}`;
        return (
          <div className="eg-quiz-q" key={qi} data-ref={ref}>
            <div className="eg-quiz-question">{qi + 1}. {q.question}</div>
            <Options itemRef={ref} options={q.options} answerIndex={q.answerIndex} quiz={quiz} />
            <Explanation text={q.explanation} show={quiz.picks.some((p) => p.ref === ref)} />
          </div>
        );
      })}
      {holdsResult ? <QuizResult final={quiz.final} onRetry={quiz.retry} boxRef={quiz.resultRef} /> : <div className="eg-quiz-result" />}
    </Block>
  );
}

function HomeworkBanner({ items }) {
  if (!items.length) return <div id="eg-hw-banner" className="eg-hw-banner" hidden />;
  const allDone = items.every((i) => i.completed);
  const names = items.map((it, i) => (
    <Fragment key={i}>{i > 0 && ', '}<b>{it.title}</b>{it.deadline ? ` (hạn ${fmtDate(it.deadline, true)})` : ''}{it.completed ? ' ✓' : ''}</Fragment>
  ));
  return (
    <div id="eg-hw-banner" className={`eg-hw-banner ${allDone ? 'eg-hw-done' : 'eg-hw-todo'}`}>
      <i className={`fas ${allDone ? 'fa-check-circle' : 'fa-thumbtack'}`} />
      {allDone
        ? <div><b>Bài tập về nhà đã hoàn thành.</b> {names}</div>
        : <div><b>Đây là bài tập về nhà:</b> {names}.<br />Cần <b>làm hết tất cả câu</b> (Mini Quiz + câu trắc nghiệm trong bài) và <b>đúng từ {HW_PASS_PERCENT}% trở lên</b> mới được tính hoàn thành. Làm lại bao nhiêu lần cũng được.</div>}
    </div>
  );
}

function History({ lessonId, version }) {
  const [state, setState] = useState({ status: 'loading' });
  useEffect(() => {
    let alive = true;
    apiFetch(`/essential-grammar/${lessonId}/attempt/history`)
      .then((d) => { if (alive) setState(d.success ? { status: 'ready', rows: d.history || [] } : { status: 'error' }); })
      .catch(() => { if (alive) setState({ status: 'error' }); });
    return () => { alive = false; };
  }, [lessonId, version]);

  let body = <div id="eg-history-body" className="eg-hist-empty">Đang tải...</div>;
  if (state.status === 'error') body = <div id="eg-history-body" className="eg-hist-empty">Không tải được lịch sử làm bài.</div>;
  if (state.status === 'ready' && !state.rows.length) {
    body = <div id="eg-history-body" className="eg-hist-empty">Chưa có lần làm nào. Làm hết các câu hỏi (hoặc bấm &quot;Chấm điểm ngay&quot;) để lưu kết quả.</div>;
  }
  if (state.status === 'ready' && state.rows.length) {
    body = (
      <div id="eg-history-body">
        <div className="eg-hist-list">
          {state.rows.map((h, i) => {
            const tone = h.score >= COMPLETE_THRESHOLD ? 'good' : h.score >= HW_PASS_PERCENT ? 'ok' : 'bad';
            return (
              <div className="eg-hist-row" key={h._id || i}>
                <span className="eg-hist-date">{fmtDate(h.createdAt, true)}</span>
                <span className={`eg-hist-score eg-hist-${tone}`}>{h.score}%</span>
                <span className="eg-hist-detail">{h.correct}/{h.total} câu đúng{h.answered != null && h.answered < h.total ? ` · bỏ trống ${h.total - h.answered} câu` : ''} · {fmtDuration(h.timeSpent)}</span>
              </div>
            );
          })}
        </div>
        <div className="eg-hist-note">Hiển thị tối đa 20 lần gần nhất trong 3 tháng. Điểm cao nhất được lưu vĩnh viễn.</div>
      </div>
    );
  }
  return (
    <div className="eg-content eg-hist-wrap">
      <div className="eg-block" id="eg-history"><div className="eg-block-label"><i className="fas fa-history" /> Lịch sử làm bài</div>{body}</div>
    </div>
  );
}

function NavButton({ lesson, dir, onSelect }) {
  if (!lesson) return <span />;
  const isPrev = dir === 'prev';
  const icon = <i className={`fas ${isPrev ? 'fa-arrow-left' : 'fa-arrow-right'}`} />;
  const label = <span className="eg-nav-btn-label"><span className="eg-nav-btn-sub">{isPrev ? 'Bài trước' : 'Bài tiếp theo'}</span><br />{lesson.title}</span>;
  return (
    <button className="eg-nav-btn" style={isPrev ? undefined : { marginLeft: 'auto', textAlign: 'right', justifyContent: 'flex-end' }} onClick={() => onSelect(lesson)}>
      {isPrev ? <>{icon}{label}</> : <>{label}{icon}</>}
    </button>
  );
}

export default function Lesson({ lesson, blocks, prev, next, score, doneCount, lessonCount, percent, homework, retried, onSelect, onScore, onRetry, onHomeworkChange }) {
  const total = countGradeable(blocks);
  const hasQuiz = blocks.some((b) => b.type === 'quiz');
  const firstQuiz = blocks.findIndex((b) => b.type === 'quiz');
  const root = useRef(null);
  const resultRef = useRef(null);
  const [startedAt] = useState(() => Date.now());
  const [picks, setPicks] = useState([]); // { ref, chosen, correct } in answer order
  const [final, setFinal] = useState(null);
  const [historyVersion, setHistoryVersion] = useState(0);

  useEffect(() => {
    if (final && hasQuiz) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [final, hasQuiz]);

  // "Làm lại bài" brings the first graded question back into view
  useEffect(() => {
    if (retried) root.current?.querySelector('.eg-quiz-q, .eg-ex-item[data-ref]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [retried]);

  function finalize(list) {
    if (final || !total) return;
    const correct = list.filter((p) => p.correct).length;
    const value = Math.round((correct / total) * 100);
    const passed = value >= COMPLETE_THRESHOLD;
    const isHomework = homework.length > 0;
    const blanks = total - list.length;
    let hwNote = '';
    if (isHomework && blanks > 0) hwNote = ` Bài tập về nhà cần làm hết tất cả câu (còn ${blanks} câu bỏ trống) — hãy làm lại!`;
    else if (isHomework && value >= HW_PASS_PERCENT) hwNote = ` Bài tập về nhà: đạt yêu cầu ≥${HW_PASS_PERCENT}% ✓`;
    else if (isHomework) hwNote = ` Bài tập về nhà cần đạt từ ${HW_PASS_PERCENT}% mới được tính — hãy làm lại!`;
    const summary = `Bạn đạt ${value}% (${correct}/${total} câu đúng).${passed ? ' Bài học đã được đánh dấu hoàn thành!' : ` Cần đạt từ ${COMPLETE_THRESHOLD}% để đánh dấu hoàn thành bài học.`}${hwNote}`;
    setFinal({ score: value, passed, summary });
    onScore(value);
    // Without a Mini Quiz there is no result box on the page
    if (!hasQuiz) siteToast(`${passed ? '🏆 ' : '🔁 '}${summary}`, passed ? 'success' : 'warn', 5000);

    // This attempt is what ticks a homework item and fills the history, so a
    // failed save has to be said out loud.
    apiFetch(`/essential-grammar/${lesson._id}/attempt`, {
      method: 'POST',
      body: JSON.stringify({ answers: list.map(({ ref, chosen }) => ({ ref, chosen })), timeSpent: Math.max(1, Math.round((Date.now() - startedAt) / 1000)) }),
    }).then((d) => {
      if (!d.success) throw new Error('save failed');
      setHistoryVersion((v) => v + 1);
      if (isHomework) onHomeworkChange();
    }).catch(() => {
      siteToast('Chưa lưu được kết quả lên hệ thống (lỗi mạng?). Hãy làm lại bài để được lưu lịch sử và tính bài tập về nhà.', 'error', 7000);
    });
  }

  function answer(ref, chosen, answerIndex) {
    if (final || picks.some((p) => p.ref === ref)) return;
    const correct = chosen === answerIndex;
    if (correct) window.playOk?.(); else window.playWrong?.();
    const next2 = [...picks, { ref, chosen, correct }];
    setPicks(next2);
    if (next2.length >= total) finalize(next2);
  }

  const quiz = { picks, final, total, answer, retry: onRetry, resultRef };
  const left = total - picks.length;
  const showGrade = !final && picks.length >= 1 && left > 0;
  const showRetry = !!final && !hasQuiz;

  return (
    <div ref={root} style={{ display: 'contents' }}>
      <div className="eg-hero pf-hero pf-hero-purple" data-mascot="think">
        <div className="pf-hero-body">
          <div className="eg-hero-cat"><span className="pf-tag">{lesson.category}</span></div>
          <h1 className="eg-hero-title">{lesson.icon || '📘'} {lesson.title}</h1>
          <div className="wp-status-row" id="eg-hero-status">
            {score?.completed && <span className="wp-status-badge wp-status-on-gradient wp-status-done"><i className="fas fa-check-circle" /> Đã hoàn thành</span>}
            {score && <span className="wp-status-badge wp-status-on-gradient"><i className="fas fa-star" /> Điểm cao nhất: {score.bestScore}%</span>}
            <span className="wp-status-badge wp-status-on-gradient"><i className="fas fa-chart-line" /> Tiến trình: {doneCount}/{lessonCount} bài ({percent}%)</span>
          </div>
        </div>
      </div>

      <div className="eg-content">
        <HomeworkBanner items={homework} />
        {blocks.map((b, bi) => {
          const Teaching = TEACHING_BLOCKS[b.type];
          if (Teaching) return <Teaching key={bi} data={b.data} />;
          if (b.type === 'practice_exercises') return <Exercises key={bi} data={b.data} bi={bi} quiz={quiz} />;
          if (b.type === 'quiz') return <Quiz key={bi} data={b.data} bi={bi} quiz={quiz} holdsResult={bi === firstQuiz} />;
          if (b.type === 'verb_forms') return <VerbForms key={bi} data={b.data} />;
          if (b.type === 'conjugation_drill') return <Conjugation key={bi} data={b.data} />;
          if (b.type === 'translation_drill') return <Translation key={bi} data={b.data} />;
          return null;
        })}
      </div>

      {total > 0 && (
        <>
          <div className="eg-grade-footer" id="eg-grade-footer" style={{ display: showGrade || showRetry ? 'block' : 'none', textAlign: 'center', margin: '8px 0 4px' }}>
            <button type="button" id="eg-grade-now-btn" onClick={showRetry ? onRetry : () => finalize(picks)} style={{ background: 'var(--brand,#e53935)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {showRetry
                ? <><i className="fas fa-rotate-left" /> Làm lại bài</>
                : <><i className="fas fa-flag-checkered" /> <span id="eg-grade-now-label">{showGrade ? `Chấm điểm ngay (đã làm ${picks.length}/${total} câu, ${left} câu bỏ trống sẽ tính sai)` : 'Chấm điểm ngay'}</span></>}
            </button>
          </div>
          <History lessonId={lesson._id} version={historyVersion} />
        </>
      )}

      <div className="eg-nav-footer">
        <NavButton lesson={prev} dir="prev" onSelect={onSelect} />
        <NavButton lesson={next} dir="next" onSelect={onSelect} />
      </div>
    </div>
  );
}
