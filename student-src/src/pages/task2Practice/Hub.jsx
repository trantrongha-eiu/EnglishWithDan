import { Fragment, useEffect, useState } from 'react';
import { siteToast } from '../../utils/shell';
import {
  bestPracticeScore, ESSAY_BADGE_CLASS, ESSAY_LABELS, guideFlow, isLoggedIn, isStepUnlocked, isVocabLearned, isVocabQuizPassed,
  isVocabStepDone, LESSON_MIN_WORDS, LESSON_SECTIONS, perBodyChains, RECIPE, ROLE_NUM, roleSentences, savedTermsFor, store,
  T2_TRANSLATE_PASS, translateGateMessage, translateProgress, VQUIZ_KIND_LABEL, VQUIZ_PASS, vocabStats, vquizPossible, wc,
} from '../../utils/task2Practice';
import { BusyButton, Html, InfoBody, InfoBtn, ModeBadge, TermMark } from './Parts';
import { currentStepKey, ideaSides, lessonSteps, scrollToHubStep } from './lib';

// The lesson hub — one prompt = one class session ("Buổi"), 3 phases / 6 steps:
//   Giai đoạn 1 · Chuẩn bị   ① Từ vựng ② Brainstorm ③ Dịch câu ④ Hướng dẫn viết
//   Giai đoạn 2 · Trên lớp   ⑤ Mở bài + Thân bài 1 (split-screen writer)
//   Giai đoạn 3 · Về nhà     ⑥ Thân bài 2 + Kết bài theo template → chấm AI

const luluSvg = (mood) => { try { return window.Mascot ? window.Mascot.svg(mood, { label: 'Lulu' }) : '🍊'; } catch { return '🍊'; } };
const reduceMotion = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };

function StepHead({ num, title, extra, done }) {
  return (
    <div className="t2-step-head">
      <span className={`t2-step-num${done ? ' is-done' : ''}`}>{done ? <i className="fas fa-check" /> : num}</span>
      <div className="t2-step-title">{title}</div>
      {extra}
    </div>
  );
}
const Peek = () => <Html as="div" className="t2-lulu-peek" aria-hidden="true" html={luluSvg('happy')} />;

function Step({ k, cur, extraCls = '', children }) {
  const isCur = cur === k;
  return (
    <section className={`t2-step t2-s-${k}${extraCls}${isCur ? ' is-current' : ''}`} id={`t2-step-${k}`}>
      {isCur && <Peek />}
      {children}
    </section>
  );
}

// Steps 2–6 until step ① is done: just the title and what unlocks it
function LockedStep({ k, num, title, note }) {
  return (
    <section className={`t2-step t2-s-${k} is-locked`} id={`t2-step-${k}`}>
      <StepHead num={num} title={title} extra={<span className="t2-step-tag"><i className="fas fa-lock" /> Chưa mở</span>} />
      {note && <p className="t2-step-desc" style={{ margin: '8px 0 0' }}>🔒 {note} <button type="button" className="t2-link" onClick={() => scrollToHubStep('translate')}>Đến bước Dịch câu</button></p>}
    </section>
  );
}

const WcChip = ({ label, text }) => { const n = wc(text); return <span className={`t2-step-chip${n ? ' ok' : ''}`}>{label}: {n} từ</span>; };

function BsSave({ state, hasNotes }) {
  switch (state) {
    case 'dirty': return <><i className="fas fa-pen" /> Đang soạn…</>;
    case 'saving': return <><i className="fas fa-spinner fa-spin" /> Đang lưu…</>;
    case 'error': return <span className="is-error"><i className="fas fa-exclamation-triangle" /> Chưa lưu được</span>;
    default: return hasNotes ? <span className="is-ok"><i className="fas fa-cloud" /> Đã lưu</span> : null;
  }
}

// ── LULU coach: says what to do next and throws a little party when a step gets done ──
const LULU_STEP = {
  vocab: { say: 'Bắt đầu bằng từ vựng nha! Lưu hết từ vào sổ rồi làm quiz đạt từ 70% là mở khoá các bước sau 📒', tips: ['Bấm 🔊 để nghe phát âm, đọc to theo cho nhớ lâu nha!', 'Học cả cụm (collocation) chứ đừng học từ đơn lẻ nhé 😉', 'Quiz cần đạt từ 70% — chưa đạt thì ôn lại mấy từ sai rồi làm quiz mới nha!'] },
  ideas: { say: 'Giờ brainstorm cùng nhóm nè! Nghĩ thật nhiều ý, ý nào hay thì ghi lại liền 💡', tips: ['Ý hay = rõ ràng + có ví dụ thật. Đừng ngại ghi cả ý của nhóm bạn!', 'Bí ý? Thử nghĩ theo các góc: cá nhân, xã hội, kinh tế, sức khoẻ…', 'Mỗi phần chỉ cần 2–3 ý mạnh là đủ viết rồi.'] },
  translate: { say: 'Dịch câu nào! Có câu chọn, câu điền, câu nghe — đúng từ 70% là mở khoá phần viết ✍️', tips: ['Sai không sao, đọc gợi ý rồi sửa lại là nhớ lâu lắm!', 'Câu nghe & điền: bấm “Nghe chậm” nếu nghe chưa rõ nha 🎧', 'Để ý cụm tô màu trong câu mẫu — dùng lại được trong bài đó!'] },
  guide: { say: 'Xem cách ghép ý + câu đã dịch thành một đoạn văn hoàn chỉnh nha 🧩', tips: ['Công thức thần thánh: Ý chính → Giải thích → Kết quả → Ví dụ!', 'Từ nối làm đoạn văn mượt hơn: This is because, As a result, For example…', 'Đọc đoạn mẫu để học cách triển khai, đừng học thuộc nha.'] },
  class: { say: 'Cùng nhóm viết Mở bài + Thân bài 1 thôi! Đi được nửa đường rồi đó 💪', tips: ['Mở bài: paraphrase đề bằng từ đồng nghĩa, đừng chép nguyên đề nha.', 'Bấm ＋ ở cột trái để chèn câu đã dịch vào bài.', 'Viết xong đọc lại một lượt để sửa lỗi nhỏ nha.'] },
  home: { say: 'Về nhà viết nốt Thân bài 2 + Kết bài rồi nộp chấm AI nha 🏠', tips: ['Mở tab “Template” ở cột trái để viết Kết bài cho nhanh.', 'Kết bài chỉ cần tóm lại ý chính, không thêm ý mới nha.', 'Đủ 4 phần là nộp được để AI chấm rồi!'] },
};
// Kept across hub remounts (a practice run in between), like the old page
let coachShownFor = null;
let coachPokes = 0;
const luluSeen = { topicId: null, done: null };

function coachState(steps, submitted) {
  const n = steps.filter((s) => s.done).length;
  const all = n === steps.length;
  const cur = currentStepKey(steps);
  return {
    steps, n, all, cur,
    mood: all ? 'cheer' : n >= 3 ? 'excited' : 'happy',
    text: all ? (submitted ? 'Cậu đã hoàn thành trọn buổi học rồi! Lulu tự hào về cậu quá 🥳' : 'Xong cả 6 bước rồi! Nộp bài để AI chấm điểm nha 🎉') : LULU_STEP[cur].say,
  };
}

function confettiBurst(host) {
  if (!host || reduceMotion()) return;
  const colors = ['#f59e0b', '#22c55e', '#6366f1', '#ec4899', '#0ea5e9', '#facc15'];
  const box = document.createElement('div');
  box.className = 't2-confetti';
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML = Array.from({ length: 18 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 18 + Math.random() * 0.4;
    const d = 60 + Math.random() * 70;
    return `<i style="--c:${colors[i % colors.length]};--dx:${Math.round(Math.cos(a) * d * 1.6)}px;--dy:${Math.round(Math.sin(a) * d - 30)}px;--r:${Math.round(Math.random() * 720 - 360)}deg"></i>`;
  }).join('');
  host.appendChild(box);
  setTimeout(() => box.remove(), 1400);
}

function Coach({ topicId, steps, submitted, ready }) {
  const c = coachState(steps, submitted);
  const [enter] = useState(() => coachShownFor !== topicId);
  const [firstText] = useState(c.text);
  const [say, setSay] = useState(null); // { base, text, mood, jump }
  useEffect(() => { coachShownFor = topicId; }, [topicId]);

  // Steps that just turned done → a celebration (only once lesson + vocab loaded)
  const doneKey = steps.filter((s) => s.done).map((s) => s.key).join(',');
  useEffect(() => {
    if (!ready) { luluSeen.topicId = topicId; luluSeen.done = null; return; }
    const done = doneKey ? doneKey.split(',') : [];
    const prev = luluSeen.topicId === topicId ? luluSeen.done : null;
    luluSeen.topicId = topicId; luluSeen.done = done;
    const fresh = prev ? done.filter((k) => !prev.includes(k)) : [];
    if (!fresh.length) return;
    const key = fresh[fresh.length - 1];
    setTimeout(() => {
      const cs = coachState(steps, submitted);
      const step = cs.steps.find((s) => s.key === key);
      const nxt = cs.steps.find((s) => s.key === cs.cur);
      setSay((p) => ({
        base: cs.text, mood: cs.all ? 'cheer' : 'excited', jump: (p?.jump || 0) + 1,
        text: cs.all ? 'Xong cả 6 bước rồi! Đỉnh quá đi 🥳🎉' : `Xong bước “${step ? step.label : ''}” rồi! 🎉 Tiếp theo: ${nxt ? nxt.label : ''} nha!`,
      }));
      confettiBurst(document.getElementById('t2-coach'));
      const rail = document.querySelector(`.t2-rail-item[data-key="${key}"]`);
      if (rail) { rail.classList.remove('is-pop'); void rail.offsetWidth; rail.classList.add('is-pop'); }
    }, 0);
  }, [doneKey, ready, topicId]); // eslint-disable-line react-hooks/exhaustive-deps

  function poke() {
    coachPokes++;
    const tips = c.all ? ['Tuyệt vời! Ôn lại từ vựng của buổi này vài lần nữa cho nhớ lâu nha 🍊', 'Thử “Thi thử cả tuần” bên dưới để kiểm tra lại cả tuần nè!'] : LULU_STEP[c.cur].tips;
    const text = coachPokes % 9 === 0 ? 'Ui da, cù lét tớ hoài! 🤭' : tips[coachPokes % tips.length];
    setSay((p) => ({ base: c.text, text, mood: ['wink', 'excited', 'think', 'happy'][coachPokes % 4], jump: (p?.jump || 0) + 1 }));
  }

  const live = say && say.base === c.text ? say : null;
  const text = live ? live.text : c.text;
  const mood = live ? live.mood : c.mood;
  const jumped = live && live.jump;
  return (
    <div className="t2-coach" id="t2-coach">
      <button type="button" key={`l${jumped || 0}`} className={`t2-coach-lulu${enter && !jumped ? ' is-enter' : ''}${jumped ? ' is-jump' : ''}`} data-mood={mood} onClick={poke}
        title="Bấm để nghe mẹo từ Lulu" aria-label="Lulu — bấm để nghe mẹo" dangerouslySetInnerHTML={{ __html: luluSvg(mood) }} />
      <div className="t2-coach-body">
        <div key={text} className={`t2-coach-bubble${enter || say || text !== firstText ? ' is-say' : ''}`} id="t2-coach-say" data-base={c.text} role="status" aria-live="polite">{text}</div>
        <div className="t2-coach-prog" aria-label={`Đã xong ${c.n}/${c.steps.length} bước`}>
          {c.steps.map((s) => <i key={s.key} className={`${s.done ? 'on' : ''}${s.key === c.cur && !c.all ? ' cur' : ''}`} />)}
          <span>{c.n}/{c.steps.length} bước</span>
        </div>
      </div>
    </div>
  );
}

function Rail({ steps, cur }) {
  return (
    <nav className="t2-rail" id="t2-rail" aria-label="Các bước của buổi học">
      {steps.map((s, i) => (
        <button key={s.key} type="button" className={`t2-rail-item t2-s-${s.key}${s.done ? ' is-done' : ''}${s.key === cur ? ' is-current' : ''}`} data-key={s.key} onClick={() => scrollToHubStep(s.key)}>
          <span className="t2-rail-num">{s.done ? <i className="fas fa-check" style={{ fontSize: 9 }} /> : i + 1}</span>{s.label}
        </button>
      ))}
    </nav>
  );
}

// ── ① Từ vựng + quiz ────────────────────────────────────────────────────
function VocabQuiz({ c }) {
  const qz = c.vocabQuiz;
  const n = qz.items.length;
  if (qz.idx >= n) {
    const pct = Math.round((qz.correct / n) * 100);
    const pass = pct >= VQUIZ_PASS;
    const saved = isVocabLearned(c.t._id);
    return (
      <div className="t2-quiz">
        <div className="t2-quiz-done">
          <div style={{ fontSize: 30 }}>{pct >= 90 ? '🎉' : pass ? '👍' : '📚'}</div>
          <div className="t2-quiz-score">{qz.correct}/{n} · {pct}%</div>
          <div className={`t2-quiz-pass ${pass ? 'ok' : 'bad'}`}>{pass ? `✓ Đạt (≥ ${VQUIZ_PASS}%)` : `Chưa đạt — cần ≥ ${VQUIZ_PASS}%`}</div>
          <div className="t2-step-desc" style={{ margin: '6px 0 0' }}>{pass
            ? (saved ? 'Tuyệt vời! Bạn đã mở khoá các bước tiếp theo.' : 'Giỏi lắm! Lưu tất cả từ vào sổ nữa là mở khoá bước tiếp theo.')
            : 'Ôn lại các từ dưới đây rồi làm lại quiz nhé.'}</div>
        </div>
        {qz.missed.length > 0 && (
          <div className="t2-quiz-miss">{qz.missed.map((m, i) => (
            <div key={i} className="t2-quiz-miss-item">• <b>{m.term}</b> — {m.def}{m.ex && <div className="t2-vitem-ex"><TermMark text={m.ex} term={m.term} /></div>}</div>
          ))}</div>
        )}
        <div className="t2-actions" style={{ justifyContent: 'center', marginTop: 12 }}>
          {pass ? (
            <>
              <button className="t2-primary" onClick={saved ? c.continueAfterQuiz : c.closeQuiz}>{saved ? <>Tiếp tục <i className="fas fa-arrow-right" /></> : 'Đóng quiz'}</button>
              <button className="t2-secondary" onClick={c.startQuiz}><i className="fas fa-redo" /> Làm lại quiz</button>
            </>
          ) : (
            <>
              <button className="t2-primary" onClick={c.startQuiz}><i className="fas fa-redo" /> Làm lại quiz</button>
              <button className="t2-secondary" onClick={c.closeQuiz}>Đóng quiz</button>
            </>
          )}
        </div>
      </div>
    );
  }
  const it = qz.items[qz.idx];
  const answered = qz.picked != null;
  const ok = answered && it.options[qz.picked] === it.answer;
  return (
    <div className="t2-quiz">
      <div className="t2-quiz-top">
        <span><i className="fas fa-bolt" style={{ color: '#6366f1' }} /> Câu {qz.idx + 1}/{n}</span>
        <button className="t2-link" onClick={c.closeQuiz} style={{ padding: 0 }}><i className="fas fa-times" /> Đóng</button>
      </div>
      <div className="t2-meter" style={{ margin: '8px 0 0' }}><span style={{ width: `${Math.round((qz.idx / n) * 100)}%` }} /></div>
      <div className="t2-quiz-kind">{VQUIZ_KIND_LABEL[it.kind]}</div>
      <div className="t2-quiz-q">{it.kind === 'gap' ? `"${it.prompt}"` : it.prompt}</div>
      <div className="t2-quiz-opts">
        {it.options.map((o, i) => {
          const cls = answered ? (o === it.answer ? ' correct' : i === qz.picked ? ' wrong' : '') : '';
          return <button key={i} className={`t2-quiz-opt${cls}`} onClick={() => c.pickQuiz(i)} disabled={answered}><span className="t2-quiz-key">{i + 1}</span><span>{o}</span></button>;
        })}
      </div>
      <div className="t2-quiz-foot">
        {answered ? (
          <>
            <span className={`t2-quiz-fb ${ok ? 'ok' : 'bad'}`}>{ok ? '✓ Chính xác!' : `✗ Đáp án: ${it.answer}`}</span>
            {!ok && <button className="t2-primary is-sm" onClick={c.nextQuiz}>Câu tiếp <i className="fas fa-arrow-right" /></button>}
            {!ok && it.ex && <div className="t2-quiz-ex"><b>{it.term}</b> = {it.def}<br /><TermMark text={it.ex} term={it.term} /></div>}
          </>
        ) : <span className="t2-step-desc" style={{ margin: 0, fontSize: 12 }}>Mẹo: bấm phím 1–4 để chọn nhanh</span>}
      </div>
    </div>
  );
}

function VocabStep({ c, cur }) {
  const id = c.t._id;
  const done = isVocabLearned(id);
  const vs = vocabStats(id, c.vocab);
  const loaded = c.vocab.for === id;
  const list = loaded ? c.vocab.list : [];
  const open = c.vocabOpen ?? !done;
  let body;
  if (!loaded) {
    body = !isLoggedIn()
      ? <div className="t2-lock-note"><i className="fas fa-user-lock" /> Đăng nhập để học từ vựng của chủ đề này.</div>
      : c.vocab.error
        ? <div className="t2-lock-note"><i className="fas fa-exclamation-circle" /> Không tải được từ vựng. <button className="t2-link" onClick={c.retryVocab}>Thử lại</button></div>
        : <p className="t2-step-desc"><i className="fas fa-spinner fa-spin" /> Đang tải từ vựng...</p>;
  } else if (!list.length) {
    body = <p className="t2-step-desc">Chủ đề này chưa có danh sách từ vựng — bạn có thể sang bước Luyện câu luôn.</p>;
  } else if (c.vocabQuiz) {
    body = <VocabQuiz c={c} />;
  } else {
    const savedSet = savedTermsFor(id);
    const quizBest = store.vquizBest[id];
    const passed = isVocabQuizPassed(id, c.vocab);
    const canQuiz = vquizPossible(list);
    body = (
      <>
        <div className="t2-vtasks">
          <div className={`t2-vtask${done ? ' ok' : ''}`}><span className="t2-vtask-ic">{done ? <i className="fas fa-check" /> : '1'}</span>Lưu tất cả từ vào sổ <b>{vs.saved}/{vs.total}</b></div>
          <div className={`t2-vtask${passed ? ' ok' : ''}`}><span className="t2-vtask-ic">{passed ? <i className="fas fa-check" /> : '2'}</span>Làm quiz từ vựng đạt <b>≥ {VQUIZ_PASS}%</b>{quizBest != null && <> <span className={`t2-vtask-best${passed ? ' ok' : ''}`}>cao nhất {quizBest}%</span></>}</div>
        </div>
        <div className={`t2-meter${done ? ' ok' : ''}`}><span style={{ width: `${vs.pct}%` }} /></div>
        <div className="t2-actions">
          {!done && <button className="t2-primary" onClick={c.saveAllVocab}><i className="fas fa-save" /> Lưu tất cả vào sổ</button>}
          {canQuiz && <button className={done && !passed ? 't2-primary' : 't2-secondary'} onClick={c.startQuiz}><i className="fas fa-bolt" /> {passed ? 'Làm lại quiz' : quizBest != null ? 'Làm quiz lại' : 'Làm quiz từ vựng'}</button>}
          <button className="t2-link" onClick={() => c.setVocabOpen(!open)} style={{ marginLeft: 'auto' }}>{open ? 'Thu gọn' : `Xem ${list.length} từ`} <i className={`fas fa-chevron-${open ? 'up' : 'down'}`} /></button>
        </div>
        {open && (
          <div className="t2-vlist">
            {list.map((v, i) => {
              const saved = savedSet.has(v.term);
              return (
                <div key={i} className={`t2-vitem${saved ? ' is-saved' : ''}`}>
                  <div className="t2-vitem-main">
                    <div className="t2-vitem-term">{v.term}<button className="t2-speak" onClick={() => c.speakVocab(i)} title="Nghe phát âm" aria-label="Nghe phát âm"><i className="fas fa-volume-up" /></button></div>
                    {v.definitionVi && <div className="t2-vitem-def">{v.definitionVi}</div>}
                    {v.example && <div className="t2-vitem-ex"><TermMark text={v.example} term={v.term} /></div>}
                  </div>
                  <button className={`t2-vbtn${saved ? ' saved' : ''}`} onClick={() => c.saveOneVocab(i)} disabled={saved} title={saved ? 'Đã lưu' : 'Lưu vào sổ'}><i className={`fas fa-${saved ? 'check' : 'plus'}`} /></button>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  }
  return (
    <Step k="vocab" cur={cur}>
      <StepHead num={1} title="Từ vựng & collocations" done={isVocabStepDone(id, c.vocab)}
        extra={<>{vs.total > 0 && <span className={`t2-step-tag${done ? ' ok' : ''}`}>{vs.saved}/{vs.total} đã lưu</span>}<InfoBtn k="vocab" info={c.info} /></>} />
      <InfoBody k="vocab" info={c.info}>
        <ol className="t2-info-list">
          <li><b>Nghe</b> 🔊 và đọc to từng cụm.</li>
          <li><b>Đọc câu ví dụ</b> — cụm được tô màu: để ý từ đi kèm (collocation) và cách dùng trong câu.</li>
          <li><b>Lưu vào sổ</b> để ôn lại sau.</li>
          <li><b>Làm quiz ≥ {VQUIZ_PASS}%</b> (có câu điền cụm vào câu ví dụ) để mở khoá các bước sau. Sai thì xem lại câu ví dụ rồi làm lại.</li>
        </ol>
      </InfoBody>
      {body}
    </Step>
  );
}

// ── ② Brainstorm ────────────────────────────────────────────────────────
function IdeaStep({ c, cur }) {
  const t = c.t;
  if (!isStepUnlocked(t._id, c.vocab)) return <LockedStep k="ideas" num={2} title="Brainstorm ý tưởng" />;
  const sides = ideaSides(t);
  const hasHints = sides.some((s) => (s.points || []).length);
  const done = c.notes.some((n) => (n || '').trim());
  const loggedIn = isLoggedIn();
  function addHint(i, k) {
    const p = ((sides[i] || {}).points || [])[k];
    if (!p) return;
    const curNote = String(c.notes[i] || '');
    if (curNote.split('\n').some((l) => l.trim().replace(/^[-•]\s*/, '') === p)) { siteToast('Ý này đã có trong phần của bạn rồi', 'info', 2000); return; }
    c.setNote(i, (curNote.trim() ? curNote.replace(/\s+$/, '') + '\n' : '') + p);
    siteToast('Đã thêm vào ý của bạn', 'success', 1600);
  }
  return (
    <Step k="ideas" cur={cur} extraCls=" t2-ideas">
      <StepHead num={2} title="Brainstorm ý tưởng" done={done}
        extra={<>{loggedIn && <span className="t2-bs-save" aria-live="polite"><BsSave state={c.saveState} hasNotes={done} /></span>}<InfoBtn k="ideas" info={c.info} /></>} />
      <InfoBody k="ideas" info={c.info}>
        <ul className="t2-info-list">
          <li>Cùng nhóm nghĩ thật nhiều ý cho từng phần — <b>mỗi dòng một ý</b>.</li>
          <li>Ý được <b>tự động lưu</b> vào tài khoản: lần sau vào lại buổi này (máy nào cũng được) vẫn thấy, và hiện ở cột trái khi viết bài.</li>
          <li>Sau khi các nhóm trình bày, mở <b>Gợi ý ý chính</b> và bấm <b>＋</b> để thêm ý hay vào phần của bạn.</li>
        </ul>
      </InfoBody>
      {!loggedIn && <div className="t2-lock-note"><i className="fas fa-user-lock" /> Đăng nhập để lưu ý tưởng cho lần sau.</div>}
      <div className="t2-bs-grid">
        {sides.map((h, i) => (
          <div key={i} className={`t2-bs-side t2-side-c${i % 4}`}>
            <label className="t2-bs-label" htmlFor={`t2-idea-${i}`}>{h.side}</label>
            <textarea id={`t2-idea-${i}`} className="t2-brainstorm-input" rows={4} placeholder="Mỗi dòng một ý…" value={c.notes[i] || ''} onChange={(e) => c.setNote(i, e.target.value)} />
          </div>
        ))}
      </div>
      {hasHints && (
        <details className="t2-brainstorm-reveal" open={c.hintOpen} onToggle={(e) => c.setHintOpen(e.currentTarget.open)}>
          <summary>Gợi ý ý chính <span className="t2-muted">(mở sau khi các nhóm trình bày)</span></summary>
          <div className="t2-bs-grid">
            {sides.map((h, i) => (
              <div key={i} className={`t2-bs-side t2-side-c${i % 4}`}>
                <div className="t2-bs-label">{h.side}</div>
                <ul className="t2-bs-hints">{(h.points || []).map((p, k) => (
                  <li key={k}><span>{p}</span><button type="button" className="t2-bs-add" onClick={() => addHint(i, k)} title="Thêm vào ý của tôi" aria-label="Thêm vào ý của tôi"><i className="fas fa-plus" /></button></li>
                ))}</ul>
              </div>
            ))}
          </div>
        </details>
      )}
    </Step>
  );
}

// ── ③ Dịch câu ──────────────────────────────────────────────────────────
function TranslateStep({ c, cur }) {
  const id = c.t._id;
  if (!isStepUnlocked(id, c.vocab)) return <LockedStep k="translate" num={3} title="Dịch câu Việt → Anh" />;
  const sent = c.lesson.status === 'ready' ? c.lesson.sentences : [];
  const done = sent.filter((s) => s.en).length;
  const allDone = sent.length > 0 && done >= sent.length;
  const tp = translateProgress(c.lesson);
  const passed = !!(tp && tp.passed);
  const todo = sent.filter((s) => !(s.en && s.isCorrect)).length;
  const best = bestPracticeScore(id, c.topicStats);
  return (
    <Step k="translate" cur={cur}>
      <StepHead num={3} title="Dịch câu Việt → Anh" done={allDone && passed} extra={<><span className="t2-step-tag">Có thể làm ở nhà</span><InfoBtn k="translate" info={c.info} /></>} />
      <InfoBody k="translate" info={c.info}>
        <ul className="t2-info-list">
          <li>Mỗi câu là một ý chính của đề, dùng từ vựng vừa học. Câu làm xong sẽ hiện ở cột trái khi bạn viết bài.</li>
          <li>Chỉ khoảng <b>1/4 số câu phải gõ cả câu</b> — còn lại là chọn cụm đúng, điền cụm từ, nghe &amp; điền, ghép cụm.</li>
          <li>Câu cuối: <b>tự viết đoạn kết bài</b> theo template Band 7+ — tóm tắt ý thân bài, nêu ý kiến nếu đề hỏi, thử dùng câu điều kiện loại 1/2. AI chấm.</li>
          <li><b>Đúng ≥ {T2_TRANSLATE_PASS}% số câu</b> là mở khoá phần viết trên lớp. Sai 3 lần thì câu tính sai và quay lại sau để làm lại.</li>
        </ul>
      </InfoBody>
      <div className="t2-mode-legend">{['mcq', 'gap', 'listen', 'type', 'order', 'write'].map((m) => <ModeBadge key={m} m={m} />)}</div>
      {sent.length > 0 && (
        <>
          <div className={`t2-meter${allDone ? ' ok' : ''}`}><span style={{ width: `${Math.round(done / sent.length * 100)}%` }} /></div>
          <div className="t2-wc-row">
            <span className={`t2-step-chip${allDone ? ' ok' : ''}`}>Đã làm {done}/{sent.length} câu</span>
            {tp && done > 0 && <span className={`t2-step-chip${passed ? ' ok' : ''}`}>Đúng {tp.correct}/{tp.total} · {tp.pct}%{passed ? (tp.legacy ? ' · đã mở khoá từ bộ câu cũ' : ' · đã mở khoá phần viết') : ` · cần ≥ ${T2_TRANSLATE_PASS}%`}</span>}
          </div>
        </>
      )}
      {tp && done > 0 && !passed && <p className="t2-step-desc" style={{ margin: '6px 0 0' }}>🔒 Cần đúng thêm <b>{tp.need} câu</b>.</p>}
      <div className="t2-actions">
        <BusyButton className="t2-primary is-lg" onClick={c.startTranslate}><i className="fas fa-language" /> {!done ? 'Bắt đầu' : !todo ? 'Làm lại' : allDone ? `Làm lại ${todo} câu chưa đúng` : `Làm tiếp ${todo} câu`}</BusyButton>
        {c.wrongIds.length > 0 && <BusyButton className="t2-secondary is-warn" onClick={c.startRetryWrong}><i className="fas fa-redo-alt" /> Ôn câu sai ({c.wrongIds.length})</BusyButton>}
      </div>
      <details className="t2-more" open={c.moreOpen} onToggle={(e) => c.setMoreOpen(e.currentTarget.open)}>
        <summary><i className="fas fa-chevron-right" /> Tuỳ chọn khác</summary>
        <div className="t2-opts-row">
          <BusyButton className="t2-link" onClick={c.startPractice}><i className="fas fa-layer-group" /> Luyện đủ bộ câu (điền từ, sắp xếp, nhận diện dạng…){best != null ? ` · cao nhất ${best}%` : ''}</BusyButton>
        </div>
        <div className="t2-opts-row" style={{ marginTop: 4 }}>
          <button type="button" className={`t2-pill-toggle${c.prefs.autoNext ? ' on' : ''}`} onClick={() => c.togglePref('autoNext')} title="Tự động chuyển câu tiếp theo sau khi trả lời đúng">Tự chuyển câu</button>
          <button type="button" className={`t2-pill-toggle${c.prefs.shuffleMode ? ' on' : ''}`} onClick={() => c.togglePref('shuffleMode')} title="Xáo trộn thứ tự câu hỏi ngẫu nhiên">Xáo trộn câu</button>
          <button type="button" className="t2-link" onClick={c.openPreview}><i className="fas fa-eye" /> Xem trước câu hỏi</button>
        </div>
      </details>
    </Step>
  );
}

// ── ④ Hướng dẫn viết ────────────────────────────────────────────────────
export function Chains({ chains }) {
  return chains.map((ch, i) => (
    <Fragment key={i}>
      <div className="t2-flow">{ch.label && <b style={{ fontSize: 12 }}>{ch.label}:</b>}{ch.steps.map((s, k) => <Fragment key={k}>{k > 0 && <i className="fas fa-chevron-right" />}<span>{s}</span></Fragment>)}</div>
      {ch.note && <p className="t2-step-desc" style={{ margin: '-6px 0 10px' }}>💡 {ch.note}</p>}
    </Fragment>
  ));
}
function GuideStep({ c, cur, steps }) {
  const t = c.t;
  if (!isStepUnlocked(t._id, c.vocab)) return <LockedStep k="guide" num={4} title="Hướng dẫn viết (Guided writing)" />;
  const g = c.guide;
  const flow = guideFlow(g);
  const chains = perBodyChains(g?.outline?.perBody);
  const body1 = g?.modelEssay?.sections?.[1];
  return (
    <Step k="guide" cur={cur}>
      <StepHead num={4} title="Hướng dẫn viết (Guided writing)" done={steps[3].done} extra={<InfoBtn k="guide" info={c.info} />} />
      <InfoBody k="guide" info={c.info}>
        <ul className="t2-info-list">
          <li>Mỗi đoạn thân bài = <b>Ý chính → Giải thích → Kết quả → Ví dụ</b>. Lấy ý từ bước ②, câu từ bước ③.</li>
          <li>Đoạn mẫu là <b>đề khác cùng dạng</b>: số ①–④ trước mỗi câu cho biết câu đó thuộc phần nào — xem cách triển khai, không chép.</li>
        </ul>
      </InfoBody>
      <div className="t2-guide-block">
        <div className="t2-guide-k"><span className="t2-guide-n">A</span> Bố cục bài {ESSAY_LABELS[t.essayType] || ''}</div>
        <div className="t2-flow is-sections">{flow.map((f, i) => <Fragment key={i}>{i > 0 && <i className="fas fa-chevron-right" />}<span className={`t2-sec-c${Math.min(i, 3)}`}>{f}</span></Fragment>)}</div>
      </div>
      <div className="t2-guide-block">
        <div className="t2-guide-k"><span className="t2-guide-n">B</span> Một đoạn thân bài gồm 4 phần</div>
        <div className="t2-recipe">{RECIPE.map((r, i) => (
          <div key={r.role} className={`t2-recipe-item r-${r.role}`}><div className="t2-recipe-k"><span>{i + 1}</span>{r.k}</div><div className="t2-recipe-v">{r.v}</div><div className="t2-recipe-ex">{r.ex}</div></div>
        ))}</div>
      </div>
      {body1 ? (
        <details className="t2-model t2-guide-block" open>
          <summary><span className="t2-guide-n">C</span> Đoạn mẫu cùng dạng (đề khác)</summary>
          {g.modelEssay.prompt && <div className="t2-model-q is-prompt"><span>Đề bài</span><b>{g.modelEssay.prompt}</b></div>}
          <div className="t2-role-key">{RECIPE.map((r, i) => <span key={r.role} className={`r-${r.role}`}><sup className="t2-role-n">{i + 1}</sup>{r.k.charAt(0) + r.k.slice(1).toLowerCase()}</span>)}</div>
          <p className="t2-role-para"><b>{body1.title}.</b> {roleSentences(body1.text).map((s, i) => <Fragment key={i}><span className={`t2-role r-${s.role}`}><sup className="t2-role-n">{ROLE_NUM[s.role]}</sup>{s.text}</span> </Fragment>)}</p>
        </details>
      ) : (c.guides === null ? <p className="t2-step-desc"><i className="fas fa-spinner fa-spin" /> Đang tải đoạn mẫu...</p> : null)}
      {chains.length > 0 && <details className="t2-model"><summary>🧭 Triển khai mỗi đoạn thân bài</summary><Chains chains={chains} /></details>}
    </Step>
  );
}

// ── ⑤ Trên lớp · ⑥ Về nhà ───────────────────────────────────────────────
function ClassStep({ c, cur }) {
  const t = c.t;
  if (!isStepUnlocked(t._id, c.vocab)) return <LockedStep k="class" num={5} title="Viết Mở bài + Thân bài 1" />;
  if (!c.writingUnlocked) return <LockedStep k="class" num={5} title="Viết Mở bài + Thân bài 1" note={translateGateMessage(c.lesson)} />;
  const ready = c.lesson.status === 'ready';
  const sec = ready ? c.lesson.sections : {};
  const done = !!(wc(sec.intro) && wc(sec.body1));
  return (
    <Step k="class" cur={cur}>
      <StepHead num={5} title="Viết Mở bài + Thân bài 1" done={done} extra={<InfoBtn k="class" info={c.info} />} />
      <div className="t2-sec-pills"><span className="t2-sec-c0">Mở bài</span><span className="t2-sec-c1">Thân bài 1</span></div>
      <InfoBody k="class" info={c.info}>
        <ul className="t2-info-list">
          <li><b>Mở bài:</b> paraphrase đề, nêu hướng triển khai / quan điểm.</li>
          <li><b>Thân bài 1:</b> cùng nhóm chọn ý mạnh nhất → <b>ý chính → giải thích → kết quả → ví dụ</b>, rồi viết lại bằng lời của bạn.</li>
          <li>Câu đã dịch, ý tưởng và từ vựng nằm ở cột trái màn hình viết.</li>
        </ul>
      </InfoBody>
      {ready && <div className="t2-wc-row"><WcChip label="Mở bài" text={sec.intro} /><WcChip label="Thân bài 1" text={sec.body1} /></div>}
      {isLoggedIn()
        ? <BusyButton className="t2-primary is-lg" onClick={() => c.openCompose('class')}><i className="fas fa-columns" /> {done ? 'Xem / sửa phần viết trên lớp' : 'Mở màn hình viết'}</BusyButton>
        : <div className="t2-lock-note"><i className="fas fa-user-lock" /> Đăng nhập để viết và lưu bài.</div>}
    </Step>
  );
}

function HomeStep({ c, cur }) {
  const t = c.t;
  if (!isStepUnlocked(t._id, c.vocab)) return <LockedStep k="home" num={6} title="Viết Thân bài 2 + Kết bài" />;
  if (!c.writingUnlocked) return <LockedStep k="home" num={6} title="Viết Thân bài 2 + Kết bài" note={translateGateMessage(c.lesson)} />;
  const ready = c.lesson.status === 'ready';
  const sec = ready ? c.lesson.sections : {};
  const filled = LESSON_SECTIONS.filter((s) => (sec[s.key] || '').trim()).length;
  const total = LESSON_SECTIONS.reduce((a, s) => a + wc(sec[s.key]), 0);
  const done = !!(wc(sec.body2) && wc(sec.conclusion));
  const submitted = !!(ready && c.lesson.submittedAt);
  const untranslated = ready ? c.lesson.sentences.filter((s) => !s.en).length : 0;
  return (
    <Step k="home" cur={cur}>
      <StepHead num={6} title="Viết Thân bài 2 + Kết bài" done={done} extra={<>{submitted && <span className="t2-step-tag ok"><i className="fas fa-check" /> Đã nộp</span>}<InfoBtn k="home" info={c.info} /></>} />
      <div className="t2-sec-pills"><span className="t2-sec-c2">Thân bài 2</span><span className="t2-sec-c3">Kết bài</span></div>
      <InfoBody k="home" info={c.info}>
        <ul className="t2-info-list">
          <li>Viết theo <b>template Band 6+ / 7+</b> (tab “Template” ở cột trái màn hình viết).</li>
          <li><b>Kết bài:</b> chép lại đoạn kết bạn đã tự viết ở bước ③ rồi sửa cho khớp với 2 thân bài.</li>
          <li>Dùng từ vựng, ý tưởng và câu đã dịch — <b>tự viết bằng lời của bạn</b>, không chép bài mẫu.</li>
          <li>Đủ 4 phần (≥ {LESSON_MIN_WORDS} từ) → bấm <b>Nộp bài chấm AI</b>.</li>
        </ul>
      </InfoBody>
      {untranslated > 0 && <p className="t2-step-desc" style={{ margin: '6px 0' }}>Còn <b>{untranslated} câu</b> ở bước 3 chưa làm.</p>}
      {ready && <div className="t2-wc-row"><WcChip label="Thân bài 2" text={sec.body2} /><WcChip label="Kết bài" text={sec.conclusion} /><span className={`t2-step-chip${total >= LESSON_MIN_WORDS ? ' ok' : ''}`}>Cả bài: {total} từ</span></div>}
      {isLoggedIn() && (
        <div className="t2-actions">
          <BusyButton className="t2-primary is-lg" onClick={() => c.openCompose('home')}><i className="fas fa-house-user" /> {done ? 'Xem / sửa phần về nhà' : 'Viết phần về nhà'}</BusyButton>
          {filled === LESSON_SECTIONS.length && t.writingTask2Id && <BusyButton className="t2-primary is-write" onClick={c.submitEssay}><i className="fas fa-paper-plane" /> {submitted ? 'Nộp lại để chấm AI' : 'Nộp bài chấm AI'}</BusyButton>}
        </div>
      )}
    </Step>
  );
}

function ExamStep({ c }) {
  return (
    <section className="t2-step" id="t2-step-exam">
      <div className="t2-step-head">
        <span className="t2-step-num is-alt"><i className="fas fa-clipboard-check" /></span>
        <div className="t2-step-title">Thi thử cả tuần <span className="t2-opt-tag">tuỳ chọn</span></div>
        <InfoBtn k="exam" info={c.info} />
      </div>
      <InfoBody k="exam" info={c.info}><p className="t2-step-desc" style={{ margin: 0 }}>Câu hỏi ngẫu nhiên từ các chủ đề của Tuần {c.week}, tính giờ 2 phút/câu, không có gợi ý.</p></InfoBody>
      <div className="t2-actions">
        <div className="t2-seg" role="group" aria-label="Số câu">
          {[10, 15, 20].map((n) => <button key={n} type="button" className={c.examCount === n ? 'active' : ''} onClick={() => c.setExamCount(n)}>{n} câu</button>)}
        </div>
        <BusyButton className="t2-secondary" onClick={c.startExam}><i className="fas fa-play" /> Bắt đầu thi</BusyButton>
      </div>
    </section>
  );
}

export function Hub({ c }) {
  const t = c.t;
  const n = c.sessionNumber;
  const steps = lessonSteps(c);
  const cur = currentStepKey(steps);
  const draft = c.draft;
  const hasDraft = !!(draft && draft.sessionDone < (draft.questionIds?.length || 0));
  const ready = c.lesson.status === 'ready' && c.vocab.for === t._id;
  return (
    <>
      <div className="t2-nav t2-nav-row">
        <div className="t2-nav-crumb"><span onClick={c.goWeeks}>Lộ trình</span> › <b>{n ? `Buổi ${n}` : t.topicName}</b></div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="t2-guide-btn" onClick={c.openTeacherGuide} title="Cách tổ chức buổi học này trên lớp"><i className="fas fa-chalkboard-teacher" /><span className="long">Guideline for teacher</span><span className="short">GV</span></button>
          <button className="t2-icon-btn" onClick={c.copyShare} title="Sao chép link" aria-label="Sao chép link"><i className="fas fa-link" /></button>
          <button className="t2-icon-btn" onClick={c.openHistory} title="Lịch sử" aria-label="Lịch sử"><i className="fas fa-history" /></button>
        </div>
      </div>
      <div className="t2-hub">
        <div className="t2-hub-head">
          <div className="t2-hub-emoji">{t.topicEmoji || '📝'}</div>
          <div style={{ minWidth: 0 }}>
            {n && <div className="t2-hub-kicker">Buổi {n}</div>}
            <h2 className="t2-hub-title">{t.topicName}</h2>
            <span className={ESSAY_BADGE_CLASS[t.essayType] || 'et-badge'}>{ESSAY_LABELS[t.essayType] || t.essayType}</span>
          </div>
        </div>
        <div className="t2-selector-prompt"><strong>Đề bài:</strong> {t.prompt}</div>

        {hasDraft && (
          <div className="t2-draft-banner">
            <div className="t2-draft-info">📌 Còn <strong>{(draft.questionIds?.length || 0) - draft.sessionDone} câu chưa làm</strong> từ phiên trước <span style={{ color: '#6b7280', fontSize: 12 }}>· {new Date(draft.savedAt).toLocaleDateString('vi-VN')}</span></div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <BusyButton className="t2-resume-btn" onClick={c.resumeSession}><i className="fas fa-play" /> Tiếp tục</BusyButton>
              <button className="t2-dismiss-btn" onClick={c.dismissDraft}><i className="fas fa-times" /> Bỏ qua</button>
            </div>
          </div>
        )}

        <Coach topicId={t._id} steps={steps} submitted={!!(c.lesson.status === 'ready' && c.lesson.submittedAt)} ready={ready} />
        <Rail steps={steps} cur={cur} />

        <div className="t2-phase"><span className="t2-phase-k">Giai đoạn 1</span><b>Chuẩn bị</b></div>
        <VocabStep c={c} cur={cur} />
        <IdeaStep c={c} cur={cur} />
        <TranslateStep c={c} cur={cur} />
        <GuideStep c={c} cur={cur} steps={steps} />

        <div className="t2-phase is-class"><span className="t2-phase-k">Giai đoạn 2</span><b>Viết trên lớp</b></div>
        <ClassStep c={c} cur={cur} />

        <div className="t2-phase is-home"><span className="t2-phase-k">Giai đoạn 3</span><b>Bài tập về nhà</b></div>
        <HomeStep c={c} cur={cur} />
        <ExamStep c={c} />
      </div>
    </>
  );
}
