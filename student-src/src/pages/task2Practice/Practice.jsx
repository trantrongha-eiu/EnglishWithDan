import { Fragment, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { mascotHtml, siteToast } from '../../utils/shell';
import {
  AI_TYPES, cheerImage, drillMode, ESSAY_BADGE_CLASS, ESSAY_LABELS, gfBlanks, GF_MAX_TRIES, LEVEL_COLORS, MC_TYPES, ORD_MAX_TRIES,
  Q_LABELS, qid, sentenceParts, spanPieces, store, topicCompletedCount, translateGateMessage,
  WBW_MAX_REQUEUES, WBW_MAX_WORD_ERRORS, WBW_REQUEUE_GAP, WBW_TYPES,
} from '../../utils/task2Practice';
import { BusyButton, Html, ModeBadge, QuitDialog } from './Parts';
import { QuestionCard } from './Question';
import { newSession, nextUid, prepFor, saveDraft } from './lib';

// A Luyện tập / Dịch câu / Ôn câu sai run and its "done" screen. Every answer
// saves a resumable draft; a run that reaches the last question is saved as
// an attempt (history + homework).

function StatusRow({ topicId }) {
  const s = store.topicScores[topicId];
  return (
    <div className="wp-status-row" style={{ justifyContent: 'center' }}>
      {s && s.completed && <span className="wp-status-badge wp-status-done"><i className="fas fa-check-circle" /> Đã hoàn thành</span>}
      {s && <span className="wp-status-badge wp-status-best"><i className="fas fa-star" /> Điểm cao nhất: {s.bestScore}%</span>}
      <span className="wp-status-badge"><i className="fas fa-chart-line" /> Đã hoàn thành {topicCompletedCount()} chủ đề</span>
    </div>
  );
}

function Done({ s, ctx, onRetryWrong }) {
  const t = ctx.t;
  const pct = s.done > 0 ? Math.round((s.correct / s.done) * 100) : 0;
  const scoreClass = pct >= 80 ? 'wp-score-good' : pct >= 50 ? 'wp-score-mid' : 'wp-score-bad';
  const wrong = s.attempts.filter((a) => !a.isCorrect);
  const loggedIn = !!window.AuthService?.isLoggedIn?.();
  const canWrite = s.translateOnly && loggedIn && ctx.writingUnlocked;
  const writeLocked = s.translateOnly && loggedIn && !canWrite;
  const mascot = mascotHtml({ pct, stacked: true });
  return (
    <>
      <div className="t2-done">
        <img src={cheerImage(pct).slice(1)} alt="" style={{ display: 'block', width: '100%', maxWidth: 220, borderRadius: 12, margin: '0 auto 12px', objectFit: 'cover' }} />
        {mascot ? <Html html={mascot} style={{ display: 'contents' }} /> : <div className="t2-done-icon">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚'}</div>}
        <div className={`t2-done-score ${scoreClass}`}>{pct}%</div>
        <div className="t2-done-sub">Hoàn thành {s.done} câu · {t.topicName || ''}</div>
        <StatusRow topicId={t._id} />
        <div className="t2-done-stats">
          <div className="t2-done-stat"><div className="t2-done-stat-num wp-score-good">✅ {s.correct}</div><div className="t2-done-stat-lbl">Đúng</div></div>
          <div className="t2-done-stat"><div className="t2-done-stat-num wp-score-bad">❌ {wrong.length}</div><div className="t2-done-stat-lbl">Sai</div></div>
          <div className="t2-done-stat"><div className="t2-done-stat-num">{s.done}</div><div className="t2-done-stat-lbl">Tổng</div></div>
        </div>
        {canWrite && (
          <div style={{ margin: '0 0 14px' }}>
            <BusyButton className="t2-primary is-lg" onClick={() => ctx.openCompose()}><i className="fas fa-columns" /> Vào viết bài</BusyButton>
            <div className="t2-done-sub" style={{ fontSize: 12.5, margin: '6px 0 0' }}>Các câu bạn vừa dịch sẽ hiện ở cột trái màn hình viết.</div>
          </div>
        )}
        {writeLocked && <div className="t2-done-sub" style={{ fontSize: 13, margin: '0 0 14px' }}>🔒 {translateGateMessage(ctx.lesson)}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {wrong.length > 0 && <button className="t2-start-btn" onClick={onRetryWrong} style={{ fontSize: 13, padding: '10px 20px', marginTop: 0 }}><i className="fas fa-redo-alt" /> Ôn lại {wrong.length} câu sai</button>}
          <BusyButton className="wp-restart-btn" onClick={s.translateOnly ? ctx.startTranslate : ctx.startPractice}><i className="fas fa-redo" /> Làm lại từ đầu</BusyButton>
          <button className="wp-more-btn" onClick={ctx.backToHub}><i className="fas fa-arrow-left" /> Về buổi học</button>
        </div>
      </div>
      {wrong.length > 0 ? (
        <div style={{ padding: '0 20px 30px' }}>
          <h3 className="wp-wr-title">📋 Chi tiết câu sai ({wrong.length})</h3>
          {wrong.map((a, i) => (
            <div className="wp-wr-item" key={i}>
              <div className="wp-wr-num">❌ Câu {i + 1} — {Q_LABELS[a.type] || a.type}</div>
              <div className="wp-wr-q" style={{ whiteSpace: 'pre-line' }}>{a.questionText || ''}</div>
              <div className="wp-wr-row"><span className="wp-wr-lbl-you">Bạn trả lời:</span> <span className="wp-wr-your">{a.userAnswer || '(bỏ trống)'}</span></div>
              <div className="wp-wr-row"><span className="wp-wr-lbl-ans">Đáp án đúng:</span> <span className="wp-wr-ans">{a.modelAnswer || ''}</span></div>
              {a.feedbackVi && <div className="wp-wr-gp">{a.feedbackVi}</div>}
            </div>
          ))}
        </div>
      ) : <div className="wp-wr-all-ok" style={{ padding: 12 }}>🌟 Tuyệt vời! Không có câu nào sai!</div>}
    </>
  );
}

function Feedback({ fb, q, autoNext, onNext }) {
  const short = q.type === 'short_writing';
  return (
    <div className="wp-feedback-card" id="feedback-card" style={{ margin: '12px 20px' }}>
      <div className={`wp-result-banner ${fb.isOk ? 'wp-result-correct' : 'wp-result-wrong'}`} id="result-banner">
        {fb.isOk ? '✅ Chính xác!' : '❌ Chưa đúng'}{fb.aiGraded && <> <span className="t2-ai-badge"><i className="fas fa-robot" /> AI</span></>}
      </div>
      <div id="comparison-box" style={fb.mc ? { display: 'none' } : undefined}>
        <div className="wp-cmp-row wp-cmp-student"><span className="wp-cmp-label">📝 {short ? 'Kết bài của bạn' : 'Câu của bạn'}:</span>
          <span id="student-answer-display" className="wp-cmp-text">
            {fb.student ? fb.student.map((p, i) => (p.fill == null ? <Fragment key={i}>{p.text}</Fragment> : <mark key={i} className={`t2-fill ${p.fill ? 'ok' : 'bad'}`}>{p.text}</mark>)) : fb.studentText}
          </span>
        </div>
        <div className="wp-cmp-row wp-cmp-sample" id="model-answer-row"><span className="wp-cmp-label">{short ? '📘 Kết bài mẫu (chỉ để tham khảo):' : '✅ Đáp án mẫu:'}</span>
          <span id="model-answer-display" className="wp-cmp-text">
            {fb.modelSpans.length
              ? spanPieces(fb.model, fb.modelSpans).map((p, i) => (p.span == null ? <Fragment key={i}>{p.text}</Fragment> : <mark key={i} className="t2-key">{p.text}</mark>))
              : fb.model}
          </span>
        </div>
      </div>
      {fb.explanation && (
        <div className="t2-explanation" id="explanation-box">
          <div className="t2-exp-title">💡 Giải thích</div>
          <div className="t2-exp-body" id="explanation-text">{fb.explanation}</div>
        </div>
      )}
      {fb.feedbackVi && <div className="wp-feedback" id="feedback-text">{fb.feedbackVi}</div>}
      <button className="wp-next-btn" id="t2-next-btn" onClick={onNext}>
        Câu tiếp theo <i className="fas fa-arrow-right" />
        <span style={{ fontSize: 10, opacity: 0.55, marginLeft: 4, fontWeight: 400 }}>Enter ↵</span>
      </button>
      <div id="t2-countdown-bar" style={{ display: autoNext ? 'block' : 'none' }}>{autoNext && <div className="t2-countdown-bar" style={{ '--cd-dur': '1500ms' }} />}</div>
    </div>
  );
}

// run = { seq, session, view: 'practice' | 'done' }
export function PracticeRun({ run, ctx }) {
  const [s, setS] = useState(run.session);
  const [view, setView] = useState(run.view || 'practice');
  const [fb, setFb] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loader, setLoader] = useState('');
  const [quit, setQuit] = useState(false);
  const S = useRef(s);
  const meta = useRef(new Map()); // uid → { asks, ordTries, gfTries } (survive jumping away and back)
  const autoTimer = useRef(0);
  const busy = useRef(false);
  const set = (next) => { S.current = next; setS(next); };
  const t = ctx.t;
  const metaOf = (uid) => meta.current.get(uid) || {};
  useEffect(() => () => clearTimeout(autoTimer.current), []);
  useEffect(() => { ctx.onRunState({ view, done: s.done, correct: s.correct }); }, [view, s.done, s.correct]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = s.questions[s.idx];
  // Finishing: the topic score is saved before the done screen reads it
  function toDone(cur) {
    const pct = cur.done > 0 ? Math.round((cur.correct / cur.done) * 100) : 0;
    if (cur.done > 0) ctx.saveTopicScore(pct);
    setView('done');
    setFb(null);
    window.scrollTo(0, 0);
  }
  function goto(i, cur = S.current) {
    clearTimeout(autoTimer.current);
    if (i >= cur.questions.length) { toDone(cur); ctx.saveAttempt(cur); return; }
    set({ ...cur, idx: i, prep: prepFor(cur.questions[i]) });
    setFb(null);
  }
  const next = () => goto(S.current.idx + 1);
  function jump(i) {
    if (busy.current || i === S.current.idx) return;
    goto(i);
  }
  function requeue(cur, idx) {
    const qq = cur.questions[idx];
    const id = qid(qq);
    const copies = cur.questions.filter((x) => qid(x) === id).length - 1;
    if (copies >= WBW_MAX_REQUEUES) return false;
    const at = Math.min(idx + 1 + WBW_REQUEUE_GAP, cur.questions.length);
    // A redo starts fresh; a missed multiple-choice comes back as "điền cụm"
    const redo = { ...qq, _isRepeat: true, _uid: nextUid() };
    if (redo._mode === 'mcq') redo._mode = 'gap';
    cur.questions.splice(at, 0, redo);
    cur.status.splice(at, 0, 'pending');
    return true;
  }

  async function submit(payload) {
    if (busy.current) return;
    const cur = S.current;
    const st = cur.status[cur.idx];
    if (st === 'correct' || st === 'wrong') { siteToast('Câu này đã trả lời rồi.', 'info'); return; }
    const qq = cur.questions[cur.idx];
    let answer = payload.answer;
    const wbwFail = payload.wbwFail && WBW_TYPES.has(qq.type) && qq.translationAnswer ? payload.wbwFail : null;
    if (!wbwFail && (answer === '' || answer == null)) { siteToast('Vui lòng nhập câu trả lời!', 'warn'); return; }
    const verbatim = !!payload.verbatim && WBW_TYPES.has(qq.type) && !!qq.translationAnswer && answer === qq.translationAnswer;
    const gf = payload.gf || null;
    const ord = payload.ord || null;
    busy.current = true;
    setSubmitting(true);
    // copies the run can change (a failed sentence comes back later)
    const work = { ...cur, questions: cur.questions.slice(), status: cur.status.slice(), attempts: cur.attempts.slice() };
    const local = (isCorrect, feedbackVi) => ({ success: true, isCorrect, score: isCorrect ? 100 : 0, modelAnswer: qq.translationAnswer, feedbackVi, explanationVi: qq.explanationVi || '', aiGraded: false });
    try {
      let data;
      const viLine = gf && gf.mode === 'listen' ? ` Nghĩa: “${sentenceParts(qq.questionText).vi}”` : '';
      if (gf && !gf.ok) {
        const back = requeue(work, work.idx);
        data = local(false, (gf.mode === 'mcq' ? 'Chọn chưa đúng. ' : `Bạn điền sai ${GF_MAX_TRIES} lần nên câu này tính là sai. `)
          + (back ? `Xem kỹ cụm tô màu trong câu mẫu — câu này sẽ quay lại ở phía sau${gf.mode === 'mcq' ? ' (lần này bạn tự điền)' : ''} 💪`
            : 'Xem kỹ câu mẫu rồi ôn lại ở "Ôn lại câu sai" sau buổi nhé.') + viLine);
      } else if (gf) {
        data = local(true, 'Chính xác! Đọc lại cả câu và để ý cụm tô màu nhé.' + viLine);
      } else if (ord && !ord.ok) {
        const back = requeue(work, work.idx);
        data = local(false, `Bạn xếp sai thứ tự ${ORD_MAX_TRIES} lần nên câu này tính là sai. `
          + (back ? 'Xem kỹ đoạn mẫu nhé — câu này sẽ quay lại ở phía sau để bạn làm lại 💪' : 'Xem kỹ đoạn mẫu rồi ôn lại ở "Ôn lại câu sai" sau buổi nhé.'));
      } else if (ord) {
        data = local(true, 'Chính xác! Bạn đã ghép đúng thứ tự đoạn kết bài.');
      } else if (wbwFail) {
        const back = requeue(work, work.idx);
        const stuck = wbwFail.word ? `từ “${wbwFail.word}”` : 'một từ';
        data = local(false, `Bạn gõ sai ${stuck} ${WBW_MAX_WORD_ERRORS} lần nên câu này tính là sai. `
          + (back ? 'Xem kỹ đáp án mẫu nhé — câu này sẽ quay lại ở phía sau để bạn làm lại 💪' : 'Xem kỹ đáp án mẫu rồi ôn lại ở "Ôn lại câu sai" sau buổi nhé.'));
      } else if (verbatim) {
        data = local(true, 'Chính xác! Bạn đã gõ đúng từng chữ của câu mẫu.');
      } else {
        setLoader(AI_TYPES.has(qq.type) ? '✨ AI đang chấm bài...' : 'Đang chấm bài...');
        data = await apiFetch('/task2/check', { method: 'POST', body: JSON.stringify({ topicId: t._id, questionId: qid(qq), userAnswer: answer }) });
      }
      if (!data.success) throw new Error(data.message);
      if (gf) answer = gf.ok ? qq.translationAnswer : answer;
      const isOk = data.isCorrect;
      window[isOk ? 'playOk' : 'playWrong']?.();
      work.done++;
      if (isOk) { work.correct++; ctx.addXP(qq.xpReward || 5, true); }
      work.status[work.idx] = isOk ? 'correct' : 'wrong';
      work.attempts.push({ questionId: qid(qq), userAnswer: answer, isCorrect: isOk, score: data.score || 0, modelAnswer: data.modelAnswer || '', feedbackVi: data.feedbackVi || '', questionText: qq.questionText || '', type: qq.type });
      // A half-typed failed sentence isn't worth showing in the writer's list
      if (WBW_TYPES.has(qq.type) && !wbwFail && !(ord && !ord.ok) && !(gf && !gf.ok)) ctx.noteSentence(qq, answer, isOk);
      set(work);
      saveDraft(t, ctx.week, work);
      const model = data.modelAnswer || '';
      setFb({
        isOk, aiGraded: !!data.aiGraded, mc: MC_TYPES.has(qq.type),
        student: gf ? gf.student : null,
        studentText: wbwFail ? (answer ? answer + ' …' : '(chưa gõ xong từ nào)') : answer,
        model, modelSpans: model && model === qq.translationAnswer ? gfBlanks(qq) : [],
        explanation: data.explanationVi || '', feedbackVi: data.feedbackVi || '',
        autoNext: ctx.prefs.autoNext && isOk,
      });
      clearTimeout(autoTimer.current);
      if (ctx.prefs.autoNext && isOk) autoTimer.current = setTimeout(next, 1500);
    } catch (err) {
      siteToast('Lỗi chấm bài: ' + err.message, 'error');
    } finally {
      setLoader('');
      busy.current = false;
      setSubmitting(false);
    }
  }

  // Enter on the feedback card → next question
  useEffect(() => {
    if (!fb) return undefined;
    const key = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); next(); } };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  });

  function retryWrong() {
    const cur = S.current;
    const wrongIds = new Set(cur.attempts.filter((a) => !a.isCorrect).map((a) => a.questionId));
    const seen = new Set();
    const list = cur.questions
      .filter((x) => wrongIds.has(x._id) || wrongIds.has(x.questionId))
      .filter((x) => { const id = qid(x); if (seen.has(id)) return false; seen.add(id); return true; })
      .map(({ _isRepeat, _uid, ...rest }) => rest); // eslint-disable-line no-unused-vars
    if (!list.length) { siteToast('Không có câu nào sai!', 'info'); return; }
    meta.current = new Map();
    set(newSession({ questions: list, mode: 'retry', translateOnly: cur.translateOnly }));
    setFb(null);
    setView('practice');
  }

  // Thoát: a run that reached the last question records an attempt; part-way saves a draft
  function quitPractice() {
    if (S.current.done > 0) setQuit(true);
    else ctx.backToHub();
  }
  // Leaving by Back / a link asks the same (the run only records what was answered)
  useEffect(() => { ctx.regQuit(view === 'practice' && s.done > 0 ? () => setQuit('nav') : null); return () => ctx.regQuit(null); });

  if (view === 'done') return <Done s={s} ctx={ctx} onRetryWrong={retryWrong} />;
  if (!q) return null;

  const pct = Math.round(((s.idx + 1) / s.questions.length) * 100);
  const dm = drillMode(q);
  const quitBox = quit && (
    <QuitDialog
      opts={{ mascot: '✏️', title: 'Dừng luyện tập?', sub: `Bạn đã làm ${s.done} câu. Xem tổng kết phiên học nhé!`, confirmText: quit === 'nav' ? 'Dừng lại' : 'Xem kết quả', continueText: 'Tiếp tục học' }}
      onStay={() => { setQuit(false); ctx.navStay(); }}
      onLeave={() => {
        const cur = S.current;
        setQuit(false);
        if (cur.done >= cur.questions.length) ctx.saveAttempt(cur); else saveDraft(t, ctx.week, cur);
        if (quit === 'nav') ctx.navGo();
        else toDone(cur);
      }}
      onSave={() => {
        const cur = S.current;
        setQuit(false);
        saveDraft(t, ctx.week, cur);
        ctx.keepDraft(cur);
        if (quit === 'nav') ctx.navGo(); else ctx.backToHub();
      }} />
  );
  return (
    <>
      <div className="t2-prac-head">
        <button className="t2-back-btn" onClick={quitPractice}><i className="fas fa-times" /> Thoát</button>
        <div className="t2-prac-ctx">
          <span className="t2-ctx-week">{ctx.sessionLabel || `Tuần ${ctx.week}`}</span>
          <span className="t2-ctx-name" title={t.topicName}>{t.topicEmoji || ''} {t.topicName}</span>
        </div>
        {s.mode === 'retry'
          ? <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase' }}>Ôn câu sai</span>
          : s.translateOnly
            ? <span style={{ background: '#eef2ff', color: '#4338ca', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase' }}>③ Dịch câu</span>
            : <span className={ESSAY_BADGE_CLASS[t.essayType] || 'et-badge'} style={{ fontSize: 10 }}>{ESSAY_LABELS[t.essayType] || ''}</span>}
      </div>
      <details className="t2-prompt-box" open={ctx.promptOpen} onToggle={(e) => ctx.setPromptOpen(e.currentTarget.open)}>
        <summary className="t2-prompt-box-label">📋 Đề bài <span className="t2-prompt-peek">— {(t.prompt || '').slice(0, 70)}{(t.prompt || '').length > 70 ? '…' : ''}</span></summary>
        <p>{t.prompt}</p>
      </details>
      <div className="wp-progress-bar-wrap"><div className="wp-progress-bar" style={{ width: `${pct}%` }} /></div>
      <div className="t2-q-dots" id="q-dots">
        {s.questions.map((_, i) => {
          const st = s.status[i] || 'pending';
          return <span key={i} className={`t2-q-dot ${st === 'correct' ? 't2-dot-ok' : st === 'wrong' ? 't2-dot-err' : i === s.idx ? 't2-dot-current' : ''}`} data-qi={i} title={`Câu ${i + 1}`} onClick={() => jump(i)} />;
        })}
      </div>
      <div className="wp-exercise-meta" style={{ padding: '8px 20px' }}>
        <span className="wp-ex-counter">{s.idx + 1} / {s.questions.length}</span>
        <span style={{ color: LEVEL_COLORS[q.level] || '#6b7280', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{q.level}</span>
        {dm ? <ModeBadge m={dm} /> : <span className="wp-type-tag">{Q_LABELS[q.type] || q.type}</span>}
        {q._isRepeat && <span className="wp-type-tag" style={{ background: '#fef3c7', color: '#92400e' }}>🔁 Làm lại</span>}
      </div>
      <QuestionCard key={`${q._uid}@${s.idx}`} q={q} answered={['correct', 'wrong'].includes(s.status[s.idx])} submitting={submitting} hidden={!!fb}
        ctx={ctx} metaOf={metaOf} prep={s.prep}
        onMeta={(patch) => { meta.current.set(q._uid, { ...(meta.current.get(q._uid) || {}), ...patch }); }}
        onSubmit={submit} />
      {fb && <Feedback fb={fb} q={q} autoNext={fb.autoNext} onNext={next} />}
      {loader && (
        <div className="wp-checking-loader" id="checking-loader" style={{ margin: '0 20px' }}>
          <div className="wp-spinner" /><p id="checking-loader-text">{loader}</p>
        </div>
      )}
      {quitBox}
    </>
  );
}
