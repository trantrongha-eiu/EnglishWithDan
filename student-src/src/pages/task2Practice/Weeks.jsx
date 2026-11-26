import { useState } from 'react';
import {
  bestPracticeScore, ESSAY_BADGE_CLASS, ESSAY_COLORS, ESSAY_LABELS, isLoggedIn, isVocabLearned, isVocabStepDone, nextSession,
  pendingDrafts, savedTermsFor, sessState, store, T2_WRITE_MIN_ACCURACY, T2W_STEPS, weekLabel, WEEK_GROUPS,
} from '../../utils/task2Practice';
import { BusyButton, Html } from './Parts';

// The weeks screen (Lulu playful look, same as Task 2 Templates): every
// lesson ("Buổi N") grouped by essay type, plus where the student is.

function SessionRow({ s, page, draftTopicIds, isNext }) {
  const p = page.lessonProgress[s._id];
  const st = sessState(s, page.lessonProgress, draftTopicIds);
  const chips = [];
  if (st === 'done') chips.push(<span key="d" className="t2w-chip is-ok"><i className="fas fa-check" /> Đã nộp</span>);
  else if (p && p.written) chips.push(<span key="w" className="t2w-chip is-mid">✍️ Đã viết {p.written}/4 phần</span>);
  else if (st === 'doing') chips.push(<span key="g" className="t2w-chip is-mid"><i className="fas fa-bookmark" /> Đang làm dở</span>);
  if (isNext) chips.push(<span key="n" className="t2w-chip is-next">👉 Học tiếp</span>);
  return (
    <BusyButton className={`t2-sess t2w-sess is-${st}${isNext ? ' is-next' : ''}`} data-week={Number(s.week)} data-topic={String(s._id)} title={s.topicName}
      onClick={() => page.openTopic(Number(s.week), String(s._id), false)}>
      <span className="t2w-sess-num"><small>Buổi</small>{s.n}</span>
      <span className="t2w-sess-body">
        <span className="t2w-sess-name">{s.topicEmoji || '📝'} {s.topicName}</span>
        {chips.length > 0 && <span className="t2w-sess-chips">{chips}</span>}
      </span>
      <span className="t2w-sess-go" aria-hidden="true">{st === 'done' ? <i className="fas fa-check" /> : <i className="fas fa-chevron-right" />}</span>
    </BusyButton>
  );
}

// Lulu's bubble on top of the list + one button straight into the next lesson
function Coach({ next, nDone, total, page }) {
  let text; let mood = 'happy';
  if (!next) { text = `Cậu đã nộp đủ ${total} buổi rồi! Lulu tự hào về cậu quá 🥳`; mood = 'cheer'; }
  else {
    const p = page.lessonProgress[next._id];
    if (p && p.written) text = `Cậu đang viết dở Buổi ${next.n} (${p.written}/4 phần) — viết nốt nha, sắp xong rồi! ✍️`;
    else if (nDone) { text = `Giỏi lắm, đã xong ${nDone} buổi! Tiếp theo là Buổi ${next.n}: “${next.topicName}” 💪`; mood = 'excited'; }
    else text = isLoggedIn()
      ? `Chào cậu! Tớ là Lulu 🍊 Bắt đầu với Buổi ${next.n}: “${next.topicName}” nha — đi từng bước một thôi!`
      : 'Chào cậu! Tớ là Lulu 🍊 Đăng nhập để Lulu lưu tiến độ từng buổi cho cậu nha!';
  }
  const html = window.Mascot?.reactHtml?.({ text, mood, solo: true, compact: true });
  const p = next && page.lessonProgress[next._id];
  return (
    <div className="t2w-coach">
      {html ? <Html html={html} style={{ display: 'contents' }} /> : <div className="t2w-coach-txt">🍊 {text}</div>}
      {next && (
        <BusyButton className="t2w-go t2-sess-go" data-week={Number(next.week)} data-topic={String(next._id)} onClick={() => page.openTopic(Number(next.week), String(next._id), false)}>
          <i className="fas fa-play" /> {p && p.written ? 'Viết tiếp' : nDone ? 'Học' : 'Bắt đầu'} Buổi {next.n}
        </BusyButton>
      )}
    </div>
  );
}

export function Weeks({ page }) {
  const weekData = {};
  page.weeks.forEach((w) => { weekData[w.week] = w; });
  const drafts = pendingDrafts(page.allDrafts).filter((d) => d.week);
  const draftWeeks = new Set(drafts.map((d) => Number(d.week)));
  const draftTopicIds = new Set(drafts.map((d) => String(d.topicId)));
  const all = page.sessions.map((s, i) => ({ ...s, n: i + 1 }));
  const byWeek = {};
  all.forEach((s) => { (byWeek[s.week] = byWeek[s.week] || []).push(s); });
  const useSessions = all.length > 0;
  const nDone = all.filter((s) => sessState(s, page.lessonProgress, draftTopicIds) === 'done').length;
  const nDoing = all.filter((s) => sessState(s, page.lessonProgress, draftTopicIds) === 'doing').length;
  const next = nextSession(all, page.lessonProgress, draftTopicIds);
  const showPromo = !!(window.AuthService && !window.AuthService.hasPremiumAccess());
  const duo = window.Mascot ? window.Mascot.duo('happy') : '';
  return (
    <div className="t2w">
      <section className="t2w-hero">
        <div className="t2w-hero-text">
          <h1 className="t2w-hero-title">Luyện đề <span className="t2w-hero-tag">Task 2 theo buổi</span></h1>
          <p className="t2w-hero-sub">Mỗi đề là một buổi học trọn vẹn: chuẩn bị từ vựng &amp; ý tưởng → viết nửa bài trên lớp → hoàn thành ở nhà.</p>
          <div className="t2w-hero-badges">
            {useSessions && <span className="t2w-hero-badge"><i className="fas fa-flag-checkered" /> {nDone}/{all.length} buổi đã nộp</span>}
            {nDoing > 0 && <span className="t2w-hero-badge">✍️ {nDoing} buổi đang làm</span>}
            <span className="t2w-hero-badge"><i className="fas fa-star" /> {Number(page.xp.xp) || 0} XP</span>
            <span className="t2w-hero-badge">🔥 {Number(page.xp.streak) || 0}</span>
          </div>
        </div>
        <div className="t2w-hero-side">
          <button type="button" className="t2w-glass-btn" id="t2w-hist-btn" onClick={page.openHistory} title="Xem lịch sử luyện tập">
            <i className="fas fa-history" /> Lịch sử
          </button>
        </div>
        <Html as="div" className="lh-mascot" aria-hidden="true" html={duo} />
      </section>

      <div className="t2w-flow" aria-label="Các bước trong mỗi buổi">
        <span className="t2w-flow-lbl">Mỗi buổi gồm 6 bước</span>
        {T2W_STEPS.map((g) => (
          <div key={g.cls} className={`t2w-phase is-${g.cls}`}>
            <span className="t2w-phase-name">{g.phase}{g.time && <> <em>{g.time}</em></>}</span>
            <span className="t2w-phase-steps">{g.steps.map(([n, ic, label]) => <span key={n} className="t2w-step"><b>{n}</b><i className={`fas ${ic}`} /> {label}</span>)}</span>
          </div>
        ))}
      </div>

      {useSessions && <Coach next={next} nDone={nDone} total={all.length} page={page} />}

      {showPromo && (
        <div className="t2w-promo" id="premium-promo-banner">
          <span className="t2w-promo-ic">⭐</span>
          <div className="t2w-promo-txt">
            <b>Nâng cấp Premium để luyện tập không giới hạn</b>
            <span>Toàn bộ {all.length || ''} buổi học Task 2 Writing theo chủ đề</span>
          </div>
          <button type="button" className="t2w-go" onClick={() => window.openUpgradeModal?.()}>Upgrade Premium</button>
        </div>
      )}

      {drafts.length > 0 && (
        <div className="t2w-continue">
          <div className="t2w-continue-title"><i className="fas fa-bookmark" /> Bài dịch câu đang làm dở</div>
          {drafts.slice(0, 3).map((d) => (
            <div className="t2w-continue-row" key={String(d.topicId)}>
              <span className="t2w-continue-name">{d.topicName || 'Chủ đề'} <span className="t2w-continue-meta">· {page.sessionLabel(String(d.topicId)) || `Tuần ${Number(d.week)}`} · còn {d._rem} câu</span></span>
              <BusyButton className="t2w-go is-sm t2-continue-go" data-week={Number(d.week)} data-topic={String(d.topicId)} onClick={() => page.openTopic(Number(d.week), String(d.topicId), true)}>
                <i className="fas fa-play" /> Tiếp tục
              </BusyButton>
            </div>
          ))}
        </div>
      )}

      <div className="t2w-grid" id="t2w-grid">
        {WEEK_GROUPS.map((g, gi) => {
          const list = g.weeks.flatMap((w) => byWeek[w] || []);
          const done = list.filter((s) => sessState(s, page.lessonProgress, draftTopicIds) === 'done').length;
          const color = ESSAY_COLORS[g.essayType] || '#8a7f6e';
          return (
            <div key={gi} className={`t2w-group${g.essayType ? '' : ' is-review'}`} style={{ '--g-c': color, '--i': gi }}>
              <div className="t2w-group-head">
                <span className="t2w-group-emoji">{g.emoji}</span>
                <div className="t2w-group-title">
                  <div className="t2w-group-theme">{g.theme}</div>
                  <span className="t2w-group-type">{g.essayType ? ESSAY_LABELS[g.essayType] : 'Tổng hợp các dạng'}</span>
                </div>
                {useSessions && list.length > 0 && <span className={`t2w-group-count${done === list.length ? ' is-full' : ''}`} title={`Đã nộp ${done}/${list.length} buổi`}>{done}/{list.length}</span>}
              </div>
              {useSessions && list.length > 0 && <div className="t2w-group-bar"><i style={{ width: `${Math.round(done / list.length * 100)}%` }} /></div>}
              {useSessions ? (
                <div className="t2w-group-sessions">
                  {list.length ? list.map((s) => <SessionRow key={String(s._id)} s={s} page={page} draftTopicIds={draftTopicIds} isNext={!!next && next._id === s._id} />)
                    : <span className="t2w-soon">🌱 Sắp ra</span>}
                </div>
              ) : (
                <div className="t2w-group-weeks">
                  {g.weeks.map((w) => {
                    const d = weekData[w];
                    const hasDraft = draftWeeks.has(w);
                    return (
                      <button type="button" key={w} className={`t2-wk t2w-wk${d ? '' : ' locked'}${hasDraft ? ' has-draft' : ''}`} data-week={w} disabled={!d}
                        onClick={() => page.selectWeek(w)}>
                        <span className="t2w-wk-num">Tuần {w}</span>
                        <span className="t2w-wk-sub">{d ? d.topicCount + ' chủ đề' : 'Sắp ra'}</span>
                        {hasDraft && <span className="t2w-chip is-mid"><i className="fas fa-bookmark" /> Đang dở</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Where the student is on a topic's path, from what this browser knows
function TopicChips({ t }) {
  const id = t._id;
  const chips = [];
  if (isVocabStepDone(id, null)) chips.push(<span key="v" className="t2-step-chip ok"><i className="fas fa-check" /> Từ vựng</span>);
  else if (isVocabLearned(id)) {
    const qb = store.vquizBest[id];
    chips.push(<span key="v" className="t2-step-chip mid">⚡ Quiz từ vựng{qb != null ? ` ${qb}%` : ''}</span>);
  } else {
    const total = store.vocabTotal[id];
    const saved = Math.min(savedTermsFor(id).size, total || 0);
    chips.push(<span key="v" className="t2-step-chip">📖 Từ vựng{total ? ` ${saved}/${total}` : ''}</span>);
  }
  const best = bestPracticeScore(id, null);
  if (best == null) chips.push(<span key="p" className="t2-step-chip">✏️ Chưa luyện</span>);
  else chips.push(<span key="p" className={`t2-step-chip ${best >= T2_WRITE_MIN_ACCURACY ? 'ok' : 'mid'}`}>✏️ Luyện câu {best}%</span>);
  if (t.writingTask2Id) {
    chips.push(best != null && best >= T2_WRITE_MIN_ACCURACY
      ? <span key="w" className="t2-step-chip ok"><i className="fas fa-pen-nib" /> Viết bài</span>
      : <span key="w" className="t2-step-chip"><i className="fas fa-lock" /> Viết bài</span>);
  }
  return chips;
}

function TopicCard({ t, hasDraft, page }) {
  const [busy, setBusy] = useState(false);
  async function open() {
    if (busy) return;
    setBusy(true);
    try { await page.openTopic(page.week, t._id, false); } finally { setBusy(false); }
  }
  const n = page.sessionNumber(t._id);
  return (
    <div className={`t2-topic-card${hasDraft ? ' has-draft' : ''}`} data-id={t._id} onClick={open}>
      <div className="t2-topic-emoji">{t.topicEmoji || '📝'}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="t2-topic-name">{n && <span className="t2-sess-num" style={{ marginRight: 6 }}>{page.sessionLabel(t._id)}</span>}{t.topicName}</div>
        <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span className={ESSAY_BADGE_CLASS[t.essayType] || 'et-badge'}>{ESSAY_LABELS[t.essayType] || t.essayType}</span>
          {hasDraft && <span className="t2-week-draft-pill"><i className="fas fa-bookmark" style={{ fontSize: 9 }} /> Đang dở</span>}
        </div>
        <div className="t2-topic-prompt">{t.prompt}</div>
        <div className="t2-topic-steps"><TopicChips t={t} /></div>
      </div>
      {/* Topic data takes 4 requests — show it's working instead of a dead click */}
      <i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-chevron-right'} t2-topic-chev`} style={{ color: '#9ca3af', fontSize: 18, flexShrink: 0 }} />
    </div>
  );
}

export function Topics({ page }) {
  const draftTopicIds = new Set(pendingDrafts(page.allDrafts).map((d) => d.topicId?.toString()));
  const label = weekLabel(page.week);
  return (
    <>
      <div className="t2-nav">
        <div className="t2-nav-crumb"><span onClick={page.goWeeks}>Tuần</span> › <b>Tuần {page.week}</b></div>
      </div>
      <div style={{ padding: '0 20px 4px' }}>
        <h2 className="t2-page-h2" style={{ fontSize: 20 }}>Tuần {page.week}{label && <> <span className="t2-page-sub" style={{ fontSize: 15, fontWeight: 600 }}>· {label}</span></>}</h2>
        <p className="t2-page-sub" style={{ fontSize: 13 }}>Chọn một chủ đề để bắt đầu</p>
      </div>
      <div className="t2-topic-list">
        {page.topics.length
          ? page.topics.map((t) => <TopicCard key={t._id} t={t} hasDraft={draftTopicIds.has(t._id?.toString())} page={page} />)
          : <p className="t2-page-sub" style={{ textAlign: 'center', padding: 24 }}>Tuần này chưa có chủ đề.</p>}
      </div>
    </>
  );
}
