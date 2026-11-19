import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { luluSay, mascotHtml, openUpgrade, siteToast } from '../../utils/shell';
import { remainingOf, saveGroupScore } from '../../utils/advSentences';
import { Mascot, Spinner } from './common';

// Site-wide typing rule: the MAX_WORD_ERRORS-th wrong try on one word fails
// the sentence (WbwDrill maxWordErrors). It is graded wrong and comes back
// REQUEUE_GAP sentences later to redo — at most MAX_REQUEUES times.
const MAX_WORD_ERRORS = 3;
const REQUEUE_GAP = 3;
const MAX_REQUEUES = 2;

const play = (ok) => (ok ? window.playOk?.() : window.playWrong?.());

function freshSession(base) {
  const sentences = base.filter((s) => !s._isRepeat);
  return { sentences, status: sentences.map(() => 'pending'), attempts: [], idx: 0 };
}

function resumedSession(base, draft) {
  let sentences = base;
  // keep the sentence order as stored (in case admin reordered since)
  if (draft.sentenceIds?.length) {
    const byId = new Map(base.map((s) => [String(s._id), s]));
    // A sentence requeued by the 3-wrong-tries rule is stored twice —
    // flag the later copies again so totals don't count them.
    const seen = new Set();
    sentences = draft.sentenceIds.map((id) => {
      const s = byId.get(String(id));
      if (!s) return null;
      if (seen.has(String(id))) return { ...s, _isRepeat: true };
      seen.add(String(id));
      return s;
    }).filter(Boolean);
  }
  return {
    sentences,
    status: sentences.map((_, i) => draft.sentenceStatus?.[i] || 'pending'),
    attempts: (draft.sessionAttempts || []).slice(),
    idx: Math.max(0, Math.min(draft.currentIdx || 0, sentences.length - 1)),
  };
}

// Per-sentence state, reset whenever another sentence opens
const fresh = { answered: false, feedback: null, checkFailed: false, hints: 0 };

// One sentence: the "gõ từng chữ" drill (auto-submits on the last letter), or a
// plain textarea + "Kiểm tra" when the sentence has no answer to drill on.
function SentenceCard({ sentence, answered, checkFailed, onSubmit, onFail }) {
  const hostRef = useRef(null);
  const bridgeRef = useRef(null);
  const cb = useRef({ onSubmit, onFail });
  const [mounted, setMounted] = useState(null); // null until the drill is tried
  const [hasText, setHasText] = useState(false);

  useEffect(() => { cb.current = { onSubmit, onFail }; });

  useEffect(() => {
    const host = hostRef.current;
    const ok = !!(sentence.translationAnswer && host && window.WbwDrill && window.WbwDrill.mount(host, {
      answer: sentence.translationAnswer,
      bridgeInput: bridgeRef.current,
      maxWordErrors: MAX_WORD_ERRORS,
      onComplete: () => cb.current.onSubmit(bridgeRef.current?.value.trim() || ''),
      onFail: (info) => cb.current.onFail(info),
    }));
    setMounted(ok);
    return () => { if (host && window.WbwDrill) window.WbwDrill.unmount(host); };
  }, [sentence]);

  // The submit button doubles as the retry button if a check request fails
  // (in drill mode it's hidden until then)
  const showSubmit = checkFailed || (mounted === false && !answered);
  return (
    <div className="as-card">
      <div ref={hostRef} id="as-drill-host" className={`as-drill-host${mounted === false ? ' hidden' : ''}`} />
      <textarea
        ref={bridgeRef}
        className={`as-textarea${mounted === false ? '' : ' hidden'}`}
        id="as-fallback"
        rows={3}
        placeholder="Nhập bản dịch của bạn..."
        onInput={(e) => setHasText(!!e.currentTarget.value.trim())}
      />
      <button
        className="as-submit"
        id="as-submit-btn"
        style={showSubmit ? undefined : { display: 'none' }}
        disabled={!checkFailed && !hasText}
        onClick={() => onSubmit(bridgeRef.current?.value.trim() || '')}
      >
        {checkFailed ? <><i className="fas fa-rotate-right" /> Thử lại</> : <><i className="fas fa-check" /> Kiểm tra</>}
      </button>
    </div>
  );
}

function Feedback({ data, userAnswer, last, onNext }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, []);
  return (
    <div ref={ref} className={`as-fb ${data.isCorrect ? 'ok' : 'bad'}`} id="as-fb">
      <div className="as-fb-banner">{data.feedbackVi}</div>
      <div className="as-fb-row"><span className="lbl">📝 Câu của bạn:</span> {userAnswer}</div>
      {!data.isCorrect && data.modelAnswer && (
        <div className="as-fb-row"><span className="lbl">✅ Đáp án mẫu:</span> <span className="as-fb-model">{data.modelAnswer}</span></div>
      )}
      <button className="as-next" id="as-next-btn" onClick={onNext}>{last ? 'Xem kết quả' : 'Câu tiếp theo'} <i className="fas fa-arrow-right" /></button>
    </div>
  );
}

function QuitDialog({ done, total, onContinue, onSave, onLeave }) {
  return (
    <div className="as-hist-overlay" id="as-quit-overlay" style={{ zIndex: 1500 }}>
      <div className="as-hist-modal" style={{ maxWidth: 380 }} role="dialog" aria-modal="true">
        <div className="as-hist-body" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✏️</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Dừng luyện tập?</div>
          <div id="as-quit-sub" style={{ fontSize: 13, color: 'var(--text2,#6b7280)', marginBottom: 16 }}>
            {done > 0 ? `Bạn đã làm ${done}/${total} câu.` : 'Bạn chưa làm câu nào.'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="as-next" id="as-quit-continue" style={{ marginTop: 0 }} onClick={onContinue}><i className="fas fa-arrow-left" /> Tiếp tục học</button>
            {done > 0 && <button className="as-btn" id="as-quit-save" style={{ justifyContent: 'center' }} onClick={onSave}><i className="fas fa-bookmark" /> Thoát &amp; lưu tiến độ</button>}
            <button className="as-btn" id="as-quit-leave" style={{ justifyContent: 'center', color: '#dc2626', borderColor: '#fca5a5' }} onClick={onLeave}>Dừng lại (không lưu)</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumeDialog({ draft, onResume, onRestart }) {
  return (
    <div className="as-hist-overlay" id="as-resume-overlay" style={{ zIndex: 1500 }}>
      <div className="as-hist-modal" style={{ maxWidth: 380 }} role="dialog" aria-modal="true">
        <div className="as-hist-body" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔖</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Bạn có bài đang dở ở nhóm này</div>
          <div style={{ fontSize: 13, color: 'var(--text2,#6b7280)', marginBottom: 16 }}>
            Đã làm {draft.currentIdx || 0}/{draft.sentenceIds?.length || 0} câu. Tiếp tục?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="as-next" id="as-resume-yes" style={{ marginTop: 0 }} onClick={onResume}><i className="fas fa-play" /> Tiếp tục</button>
            <button className="as-btn" id="as-resume-no" style={{ justifyContent: 'center' }} onClick={onRestart}>Làm lại từ đầu</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✏️ Practice of one structure group: drafts are saved after every answer, so
// "Thoát & lưu tiến độ" (or closing the tab) lets the student pick up later.
export default function Practice({ groupId, showHints, onLoadFailed, onDone, onBack }) {
  const [load, setLoad] = useState({ status: 'loading' }); // { group, base, draft }
  const [sess, setSess] = useState(null); // { sentences, status, attempts, idx }
  const [cur, setCur] = useState(fresh);
  const [run, setRun] = useState(0); // remounts the drill on "Làm lại nhóm này"
  const [quitOpen, setQuitOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const live = useRef({ sess, cur });
  useEffect(() => { live.current = { sess, cur }; });
  const failRef = useRef(onLoadFailed);
  useEffect(() => { failRef.current = onLoadFailed; });

  useEffect(() => {
    let alive = true;
    Promise.all([
      apiFetch(`/adv-sentence/group/${groupId}`),
      apiFetch(`/adv-sentence/draft/${groupId}`).catch(() => ({ draft: null })),
    ]).then(([data, d]) => {
      if (!alive) return;
      if (!data?.group) throw new Error('no group');
      const base = data.sentences || [];
      const draft = d?.draft;
      const ask = draft && draft.mode !== 'exam' && remainingOf(draft) > 0;
      setLoad({ status: 'ready', group: data.group, base, draft: ask ? draft : null });
      if (!ask) setSess(freshSession(base));
    }).catch((e) => {
      if (!alive) return;
      // Practising is Premium (the server answers 403): offer the upgrade
      if (e?.status === 403) openUpgrade();
      else siteToast('Lỗi tải nhóm', 'error');
      failRef.current();
    });
    return () => { alive = false; };
  }, [groupId]);

  if (load.status === 'loading') return <Spinner />;
  const { group, base, draft } = load;
  const week = group.week;

  function deleteDraft() {
    apiFetch(`/adv-sentence/draft/${group._id}`, { method: 'DELETE' }).catch(() => {});
  }

  function saveDraft(s, answered) {
    apiFetch('/adv-sentence/draft', {
      method: 'POST',
      body: JSON.stringify({
        groupId: group._id,
        groupName: group.nameVi,
        week,
        mode: 'practice',
        sentenceIds: s.sentences.map((x) => String(x._id)),
        currentIdx: s.idx + (answered ? 1 : 0),
        sessionAttempts: s.attempts,
        sentenceStatus: s.status,
        sessionDone: s.attempts.length,
        sessionCorrect: s.attempts.filter((a) => a.isCorrect).length,
      }),
    }).catch(() => {});
  }

  function startFresh() {
    setSess(freshSession(base));
    setCur(fresh);
    setResult(null);
    setRun((n) => n + 1);
  }

  if (draft && !sess) {
    return (
      <ResumeDialog
        draft={draft}
        onResume={() => setSess(resumedSession(base, draft))}
        onRestart={() => { deleteDraft(); setSess(freshSession(base)); }}
      />
    );
  }
  if (!sess) return <Spinner />;

  if (result) {
    const { score, correct, total } = result;
    return (
      <div className="as-result-hero">
        <Mascot html={mascotHtml({ pct: score, stacked: true })}>
          <div style={{ fontSize: 44 }}>{score >= 80 ? '🎉' : score >= 50 ? '👍' : '💪'}</div>
        </Mascot>
        <div className="as-result-score">{score}%</div>
        <div style={{ color: 'var(--text2,#6b7280)', fontSize: 14 }}>{correct} / {total} câu đạt yêu cầu</div>
        <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="as-btn" id="as-retry" onClick={startFresh}>Làm lại nhóm này</button>
          <button className="as-next" style={{ width: 'auto', marginTop: 0 }} id="as-done" onClick={onDone}>Về danh sách tuần</button>
        </div>
      </div>
    );
  }

  if (!sess.sentences.length) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: 'var(--text2,#6b7280)' }}>
        Nhóm này chưa có câu nào.
        <br /><button className="as-btn" style={{ marginTop: 14 }} onClick={onBack}>← Quay lại</button>
      </div>
    );
  }

  const idx = Math.min(sess.idx, sess.sentences.length - 1);
  const s = sess.sentences[idx];
  const pct = Math.round(((idx + 1) / sess.sentences.length) * 100);
  const hints = s.hintWords || [];
  const maxHint = Math.min(3, hints.length);
  const last = idx >= sess.sentences.length - 1;

  // Records the graded answer of the sentence at `at` and saves the draft
  function record(at, entry, extra) {
    const { sess: now } = live.current;
    const sentences = extra?.sentences || now.sentences;
    const status = (extra?.status || now.status).slice();
    status[at] = entry.isCorrect ? 'correct' : 'wrong';
    const attempts = now.attempts.slice();
    const i = attempts.findIndex((a) => String(a.sentenceId) === String(entry.sentenceId));
    if (i >= 0) attempts[i] = entry; else attempts.push(entry);
    const next = { ...now, sentences, status, attempts };
    setSess(next);
    saveDraft(next, true);
    return next;
  }

  async function submitAnswer(userAnswer) {
    const { sess: now, cur: c } = live.current;
    if (c.answered || !userAnswer) return;
    const at = now.idx;
    const sent = now.sentences[at];
    setCur((p) => ({ ...p, answered: true, checkFailed: false }));
    let data;
    try {
      data = await apiFetch('/adv-sentence/check', {
        method: 'POST',
        body: JSON.stringify({ groupId: group._id, sentenceId: sent._id, userAnswer }),
        timeout: 20000,
      });
    } catch {
      data = { failed: 'Không chấm được, thử lại' };
    }
    if (!data?.success) {
      siteToast(data?.failed || 'Lỗi chấm bài', 'error');
      setCur((p) => ({ ...p, answered: false, checkFailed: true }));
      return;
    }
    const entry = {
      sentenceId: sent._id, userAnswer, isCorrect: data.isCorrect, score: data.score,
      modelAnswer: data.modelAnswer, feedbackVi: data.feedbackVi, promptVi: sent.promptVi,
    };
    // A sentence failed on the 3-wrong-tries rule stays wrong in the score —
    // redoing it is practice, not a second chance at the mark.
    const prev = live.current.sess.attempts.find((a) => String(a.sentenceId) === String(sent._id));
    if (prev?.drillFailed) Object.assign(entry, { isCorrect: false, score: 0, drillFailed: true });
    record(at, entry);
    play(data.isCorrect);
    if (live.current.sess.idx === at) setCur((p) => ({ ...p, feedback: { data, userAnswer } }));
  }

  // The drill hit MAX_WORD_ERRORS on one word: grade the sentence wrong
  // locally (no /check — the bridge now holds the revealed answer) and put
  // another copy REQUEUE_GAP sentences later so the student redoes it.
  function failSentence(info) {
    const { sess: now, cur: c } = live.current;
    if (c.answered) return;
    const at = now.idx;
    const sent = now.sentences[at];
    if (!sent) return;
    const sentences = now.sentences.slice();
    const status = now.status.slice();
    const copies = sentences.filter((x) => String(x._id) === String(sent._id)).length - 1;
    const requeued = copies < MAX_REQUEUES;
    if (requeued) {
      const pos = Math.min(at + 1 + REQUEUE_GAP, sentences.length);
      sentences.splice(pos, 0, { ...sent, _isRepeat: true });
      status.splice(pos, 0, 'pending');
    }
    const partial = info?.sofar || '';
    const stuck = info?.word ? `từ “${info.word}”` : 'một từ';
    const data = {
      isCorrect: false, score: 0, modelAnswer: sent.translationAnswer,
      feedbackVi: `Bạn gõ sai ${stuck} ${MAX_WORD_ERRORS} lần nên câu này tính là sai. `
        + (requeued ? `Xem kỹ đáp án mẫu nhé — câu này sẽ quay lại sau ${REQUEUE_GAP} câu để bạn làm lại 💪`
          : 'Xem kỹ đáp án mẫu và ghi nhớ nhé.'),
    };
    record(at, {
      sentenceId: sent._id, userAnswer: partial, isCorrect: false, score: 0, drillFailed: true,
      modelAnswer: data.modelAnswer, feedbackVi: data.feedbackVi, promptVi: sent.promptVi,
    }, { sentences, status });
    setCur((p) => ({ ...p, answered: true, feedback: { data, userAnswer: partial ? `${partial} …` : '(chưa gõ xong từ nào)' } }));
  }

  function revealHint(e) {
    if (cur.hints >= maxHint) return;
    const n = cur.hints + 1;
    setCur((p) => ({ ...p, hints: n }));
    luluSay(e.currentTarget, `Thử dùng “${hints[n - 1]}” xem sao nè 🍊`);
  }

  function goTo(i) {
    if (i === idx) return;
    setSess((p) => ({ ...p, idx: i }));
    setCur(fresh);
  }

  async function finish() {
    if (finishing) return;
    setFinishing(true);
    const correct = sess.attempts.filter((a) => a.isCorrect).length;
    // Requeued copies (3-wrong-tries rule) aren't extra sentences.
    const total = sess.sentences.filter((x) => !x._isRepeat).length;
    const score = total ? Math.round((correct / total) * 100) : 0;
    saveGroupScore(group._id, score);
    await apiFetch('/adv-sentence/save-attempt', {
      method: 'POST',
      body: JSON.stringify({
        sessionType: 'practice',
        week,
        groupId: group._id,
        groupName: group.nameVi,
        sentencesAttempted: sess.attempts.map((a) => ({ sentenceId: a.sentenceId, userAnswer: a.userAnswer, isCorrect: a.isCorrect, score: a.score })),
        totalQuestions: total,
        correctCount: correct,
      }),
    }).catch(() => { /* non-fatal */ });
    await apiFetch(`/adv-sentence/draft/${group._id}`, { method: 'DELETE' }).catch(() => {});
    setFinishing(false);
    setResult({ score, correct, total });
  }

  function next() {
    if (last) { finish(); return; }
    goTo(idx + 1);
  }

  return (
    <>
      <div className="as-topbar">
        <button className="as-btn" id="as-quit-btn" onClick={() => setQuitOpen(true)}><i className="fas fa-times" /> Thoát</button>
        <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>✏️ Luyện dịch</span>
      </div>
      <div className="as-ctx">
        <b>Tuần {week}</b> › {group.emoji || ''} <b>{group.nameVi}</b>
        {s.structureNote && <> · <span style={{ color: '#6366f1', fontWeight: 700 }}>{s.structureNote}</span></>}
      </div>
      <div className="as-prompt"><div className="as-prompt-label">📝 Dịch câu sau sang tiếng Anh</div><p>{s.promptVi}</p></div>
      {showHints && <div className="as-struct-reminder">🎯 {group.targetStructure}</div>}
      <div className="as-progress-wrap"><div className="as-progress-bar" style={{ width: `${pct}%` }} /></div>
      <div className="as-dots">
        {sess.sentences.map((x, i) => {
          const st = sess.status[i] || 'pending';
          const c = st === 'correct' ? 'ok' : st === 'wrong' ? 'err' : (i === idx ? 'cur' : '');
          return <span key={i} className={`as-dot ${c}`} data-i={i} onClick={() => goTo(i)} />;
        })}
      </div>
      <div className="as-counter">
        {idx + 1} / {sess.sentences.length} câu
        {s._isRepeat && <> · <span style={{ color: '#92400e', fontWeight: 700 }}>🔁 Làm lại</span></>}
      </div>
      {showHints && hints.length > 0 && (
        <div className="as-hint-row" id="as-hint-row">
          {hints.slice(0, cur.hints).map((h, i) => <span key={i} className="as-hint-chip">{h}</span>)}
          <button className="as-hint-btn ask-lulu" id="as-hint-btn" title="Hỏi Lulu gợi ý từ vựng" disabled={cur.hints >= maxHint} onClick={revealHint}>
            <span className="ask-lulu-ic" /> Hỏi Lulu từ vựng <span id="as-hint-n">{cur.hints}/{maxHint}</span>
          </button>
        </div>
      )}
      <SentenceCard
        key={`${run}-${idx}`}
        sentence={s}
        answered={cur.answered}
        checkFailed={cur.checkFailed}
        onSubmit={submitAnswer}
        onFail={failSentence}
      />
      {cur.feedback && <Feedback data={cur.feedback.data} userAnswer={cur.feedback.userAnswer} last={last} onNext={next} />}
      {quitOpen && (
        <QuitDialog
          done={sess.attempts.length}
          total={sess.sentences.length}
          onContinue={() => setQuitOpen(false)}
          onSave={() => { saveDraft(sess, cur.answered); setQuitOpen(false); onDone(); }}
          onLeave={() => { deleteDraft(); setQuitOpen(false); onDone(); }}
        />
      )}
    </>
  );
}
