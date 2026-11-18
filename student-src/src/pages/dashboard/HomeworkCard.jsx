import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmDialog } from '../../components/Modal';
import {
  HW_STATUS, PRACTICE_PASS, GAPFILL_MIN_CORRECT, MIN_WORDS_T1, MIN_WORDS_T2,
  ruleTag, examChip, partsChip, resourceHref, mockPageUrl, countdown, fmtDeadline,
} from '../../utils/homework';

// 📚 Bài tập cần làm — port of frontend/js/dashboard-homework.js. Data comes
// from the Dashboard shell (GET /assignments/mine, cached in localStorage),
// which also feeds the in-book "học N từ" bars. Hidden for a student in no
// class; same #homework-card / .hw-* markup as the static page.

function scrollToAssignment(id) {
  const el = document.querySelector(`.hw-item[data-id="${id}"]`);
  if (!el) return;
  const group = el.closest('details');
  if (group) group.open = true;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('hw-item--flash');
  setTimeout(() => el.classList.remove('hw-item--flash'), 1600);
}

function JumpLink({ id, children }) {
  return <a href="#" onClick={(e) => { e.preventDefault(); scrollToAssignment(id); }}>{children}</a>;
}

function Tag({ tag }) {
  if (!tag) return null;
  return <span className={`hw-res-tag ${tag.cls}`} title={tag.title}>{tag.label}</span>;
}

/* ── vocab_goal progress line (services/vocabGoalService.js evaluateBooks) ── */
function VocabGoalProgress({ r }) {
  const v = r.vocabGoal;
  if (!v) return null;
  if (r.completed) return <span className="hw-res-desc">✔ Đã đạt chỉ tiêu</span>;
  const book = v.bookName ? `${v.bookEmoji || '📘'} ${v.bookName}: ` : '';
  if (v.mode === 'no_book') {
    return <span className="hw-res-desc">Mở trang Sổ từ vựng để hệ thống tạo lại Sổ 1–5, rồi lưu từ và luyện tập trong sổ.</span>;
  }
  if (v.mode === 'too_small') {
    const where = v.requiredSlot ? (v.bookName || `Sổ ${v.requiredSlot}`) : (v.bookName || 'một trong Sổ 1–5');
    const missing = Math.max(0, (v.minSize || v.wordCount || 0) - (v.bookSize || 0));
    return (
      <span className="hw-res-desc hw-res-desc--warn">
        ⚠️ {book}mới có <b>{v.bookSize}/{v.minSize}</b> từ — chưa đủ số từ giáo viên giao. Hãy <b>lưu thêm {missing} từ</b> vào {where} rồi luyện tập (quiz/flashcard) để hoàn thành.
      </span>
    );
  }
  const t = v.target || 1;
  const practiced = Math.min(v.practiced || 0, t);
  const pct = (n) => Math.round((Math.min(n, t) / t) * 1000) / 10;
  const left = t - practiced;
  const needMore = Math.max(0, (v.needCorrect || 0) - (v.correct || 0));
  return (
    <span className="hw-vg" title={`Cam = đã luyện, xanh = trả lời đúng, vạch = mức cần đạt (${v.needCorrect} từ đúng)`}>
      <span className="hw-vg-bar" role="progressbar" aria-valuemin={0} aria-valuemax={t} aria-valuenow={practiced} aria-label="Số từ đã luyện">
        <span className="hw-vg-fill hw-vg-fill--all" style={{ width: `${pct(practiced)}%` }} />
        <span className="hw-vg-fill hw-vg-fill--ok" style={{ width: `${pct(v.correct || 0)}%` }} />
        <span className="hw-vg-mark" style={{ left: `${pct(v.needCorrect || 0)}%` }} />
      </span>
      <span className="hw-res-desc">
        {book}đã luyện <b>{practiced}/{t}</b> · đúng <b>{v.correct}</b>/{v.needCorrect} ·{' '}
        {left > 0 ? <>còn <b>{left}</b> từ chưa luyện</> : <>cần thêm <b>{needMore}</b> từ trả lời đúng — luyện lại từ sai</>}
      </span>
    </span>
  );
}

/* ── Class mock test (same bundle for the whole class) ── */
const MOCK_SKILL = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };
const mockOpen = (r) => {
  const m = r.mock;
  return !!(m && m.progress && m.progress !== 'done' && (m.status === 'in-progress' || m.status === 'awaiting-grading'));
};

function MockProgress({ r }) {
  const m = r.mock;
  const fmt = (v) => (v == null ? '…' : v);
  if (r.completed && m) {
    const b = m.bands || {};
    return (
      <span className="hw-res-desc">
        L {fmt(b.listening)} · R {fmt(b.reading)} · W {b.writing == null ? 'chờ chấm' : b.writing}
        {m.progress === 'speaking' ? ' · Speaking: chưa thi' : ` · S ${fmt(b.speaking)}`}
        {m.overallBand ? <> · Overall <b>{m.overallBand}</b></> : null}
      </span>
    );
  }
  if (mockOpen(r)) return <span className="hw-res-desc">Đang làm — tiếp theo: <b>{MOCK_SKILL[m.progress] || m.progress}</b></span>;
  if (m && m.status === 'disqualified') return <span className="hw-res-desc hw-res-desc--warn">Lượt trước bị huỷ do rời màn hình thi — hãy làm lại.</span>;
  return <span className="hw-res-desc">Cả lớp làm chung 1 bộ đề · Listening → Reading → Writing (Speaking làm sau). Xong Writing là tính hoàn thành.</span>;
}

function MockAction({ assignmentId, r }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [askReplace, setAskReplace] = useState(false);
  if (r.completed && !mockOpen(r)) return <a className="hw-res-btn" href="/review-history.html?view=mock">Xem kết quả</a>;
  const label = mockOpen(r) ? (r.mock.progress === 'speaking' ? 'Bắt đầu Speaking' : 'Tiếp tục') : 'Bắt đầu';

  // POST /mock-test/start { assignmentId, itemId } (mockTestService.startMockTest `assigned`)
  async function start(replace = false) {
    setBusy(true);
    try {
      if (replace) await apiFetch('/mock-test/current', { method: 'DELETE' });
      const data = await apiFetch('/mock-test/start', { method: 'POST', body: JSON.stringify({ assignmentId, itemId: r.itemId }) });
      const a = data.attempt;
      if (!a) throw new Error('Không mở được bài thi thử');
      const skill = a.progress && a.progress !== 'done' ? a.progress : 'listening';
      window.location.href = mockPageUrl(skill, a._id);
    } catch (err) {
      setBusy(false);
      if (err.status === 409 && err.body?.code === 'MOCK_OPEN_OTHER' && !replace) { setAskReplace(true); return; }
      toast(err.body?.message || err.message || 'Không mở được bài thi thử', 'error');
    }
  }

  return (
    <>
      <button type="button" className="hw-res-btn" disabled={busy} onClick={() => start()}>{busy ? 'Đang mở đề…' : label}</button>
      {askReplace && (
        <ConfirmDialog
          title="Đang có bài thi thử khác"
          message="Bạn đang có một bài thi thử khác làm dở. Bỏ bài đó để bắt đầu bài thi thử giáo viên giao?"
          confirmLabel="Bỏ bài cũ & bắt đầu"
          confirmClass="btn-primary"
          onConfirm={() => start(true)}
          onClose={() => setAskReplace(false)}
        />
      )}
    </>
  );
}

/* ── External link / image: manual "Đánh dấu hoàn thành" ── */
function ManualToggle({ assignmentId, r, onChanged }) {
  const toast = useToast();
  const [pending, setPending] = useState(null); // value being saved
  async function toggle(done) {
    setPending(done);
    try {
      await apiFetch(`/assignments/${assignmentId}/items/${r.itemId}/complete`, { method: 'POST', body: JSON.stringify({ done }) });
      await onChanged();
    } catch (err) {
      toast(err.message || 'Không lưu được', 'error');
    }
    setPending(null);
  }
  return (
    <label className="hw-manual">
      <input type="checkbox" checked={pending ?? !!r.completed} disabled={pending !== null}
        onChange={(e) => toggle(e.target.checked)} />
      <span>Đánh dấu hoàn thành</span>
    </label>
  );
}

function ResourceRow({ a, r, onChanged }) {
  let name = null;
  let action = null;
  if (r.kind === 'vocab_goal') {
    const bookId = r.vocabGoal?.bookId;
    name = (
      <>
        {r.label || `Học ${r.wordCount} từ trong ${r.bookSlot ? `Sổ ${r.bookSlot}` : '1 sổ mặc định (Sổ 1–5)'}`}
        <span className="hw-res-tag hw-res-tag--quiz" title="Sổ phải có đủ số từ được giao; luyện đủ số từ đó, đúng từ 70% trở lên.">≥70% đúng</span>
        <VocabGoalProgress r={r} />
      </>
    );
    action = <Link className="hw-res-btn" to={bookId ? `/dashboard/book/${bookId}` : '/dashboard'}>{r.completed ? 'Xem sổ' : 'Mở sổ'}</Link>;
  } else if (r.kind === 'internal' && r.fixedMock) {
    const mp = r.mockParts;
    const mpText = mp ? [mp.listening ? `Listening: Section ${mp.listening.join(', ')}` : '', mp.reading ? `Reading: Passage ${mp.reading.join(', ')}` : ''].filter(Boolean).join(' · ') : '';
    name = (
      <>
        {r.label || 'Thi thử full 4 kỹ năng'}
        {mpText && <span className="hw-res-parts" title="Giáo viên chỉ giao các phần này">{mpText}</span>}
        <MockProgress r={r} />
      </>
    );
    action = <MockAction assignmentId={a._id} r={r} />;
  } else if (r.kind === 'internal') {
    const parts = partsChip(r);
    const exam = examChip(r);
    name = (
      <>
        {r.label || r.resourceType}
        {parts && <span className="hw-res-parts" title={parts.title}>{parts.label}</span>}
        {exam && <span className={`hw-res-parts ${exam.cls}`} title={exam.title}>{exam.label}</span>}
      </>
    );
    const href = resourceHref(r);
    action = href
      ? <a className="hw-res-btn" href={href} target="_blank" rel="noopener">{r.completed ? 'Xem lại' : 'Bắt đầu'}</a>
      : <span className="hw-res-na">(nội dung không còn khả dụng)</span>;
  } else if (r.kind === 'external') {
    name = r.title || r.url;
    // teacher-typed URL: http(s) as is, "www.x.com" → https://, other schemes (javascript:) dropped
    const u = String(r.url || '').trim();
    const safe = /^https?:\/\//i.test(u) ? u : (!u || /^[a-z][\w+.-]*:/i.test(u) ? null : `https://${u}`);
    action = (
      <>
        {safe && <a className="hw-res-btn" href={safe} target="_blank" rel="noopener noreferrer">Mở link</a>}
        <ManualToggle assignmentId={a._id} r={r} onChanged={onChanged} />
      </>
    );
  } else if (r.kind === 'image') {
    name = r.title || 'Bài tập hình ảnh';
    action = (
      <>
        {(r.images || []).map((im, i) => (
          <a key={i} href={im.url} target="_blank" rel="noopener"><img className="hw-res-thumb" src={im.url} alt="" /></a>
        ))}
        <ManualToggle assignmentId={a._id} r={r} onChanged={onChanged} />
      </>
    );
  }
  // locked (too many old ones unfinished) — backend refuses ticks / the mock too
  if (a.locked && !r.completed) action = <span className="hw-res-locked">🔒 Đang khoá</span>;
  // the lesson / test was deleted after being assigned — no longer counted
  if (r.removed) action = <span className="hw-res-na">Nội dung đã bị xoá — không tính vào bài tập</span>;
  const tag = r.kind === 'internal' && !r.removed ? ruleTag(r.resourceType) : null;

  return (
    <div className={`hw-res${r.completed ? ' hw-res--done' : ''}${r.removed ? ' hw-res--removed' : ''}`}>
      <span className="hw-res-check">{r.removed ? '–' : r.completed ? '☑' : '☐'}</span>
      <span className="hw-res-name">
        {name}
        <Tag tag={tag} />
        {r.description && <span className="hw-res-desc">{r.description}</span>}
        {r.instruction && <span className="hw-res-desc">{r.instruction}</span>}
      </span>
      <span className="hw-res-action">{action}</span>
    </div>
  );
}

function AssignmentBlock({ a, onChanged }) {
  const st = HW_STATUS[a.status] || HW_STATUS.not_started;
  const pct = a.total ? Math.round((a.done / a.total) * 100) : 0;
  // late = made up after the deadline: done, but 2 of these count as 1 miss
  const pill = a.locked ? '🔒 Đang khoá' : a.late ? 'Hoàn thành · nộp trễ' : (a.archived ? 'Đã đóng · tính là thiếu' : st.label);
  const pillCls = a.locked ? 'hw-pill--locked' : (a.late ? 'hw-pill--late' : st.cls);
  const cd = a.status !== 'completed' ? countdown(a.deadline) : null;
  const need = a.unlockNeed || 1;
  return (
    <div className={`hw-item${a.locked ? ' hw-item--locked' : ''}`} data-id={a._id} data-status={a.status || 'not_started'}>
      <div className="hw-item-head">
        <div>
          <div className="hw-item-title">{a.title}</div>
          <div className="hw-item-sub">{a.className}{a.teacherName ? ` · ${a.teacherName}` : ''}</div>
        </div>
        <span className={`hw-pill ${pillCls}`} title={a.late ? 'Làm bù sau hạn — cứ 2 bài nộp trễ tính là 1 bài thiếu' : undefined}>{pill}</span>
      </div>
      {a.locked && (
        <div className="hw-lock-note">
          🔒 <b>Bài này đang bị khoá.</b> Bạn còn {(a.lockedBy || []).length} bài tập cũ chưa hoàn thành —
          hãy làm xong <b>{need} bài</b> trong số này để mở khoá:
          <ul>
            {(a.lockedBy || []).map(o => (
              <li key={o._id}>
                <JumpLink id={o._id}>{o.title}</JumpLink>
                {o.status === 'overdue' && <> <span className="hw-due hw-due--over">Quá hạn</span></>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {a.instruction && <div className="hw-item-instruction">{a.instruction}</div>}
      <div className="hw-progress">
        <div className="hw-progress-bar"><div className="hw-progress-fill" style={{ width: `${pct}%` }} /></div>
        <span className="hw-progress-text">{a.done}/{a.total} hoàn thành</span>
      </div>
      <div className="hw-reslist">
        {a.resources.map((r, i) => <ResourceRow key={r.itemId || i} a={a} r={r} onChanged={onChanged} />)}
      </div>
      <div className="hw-item-foot">
        <span className="hw-deadline">⏰ {fmtDeadline(a.deadline)}</span>
        {a.status !== 'completed'
          ? (cd && <span className={`hw-due ${cd.cls}`}>{cd.text}</span>)
          : a.late
            ? <span className="hw-due hw-due--late">✔ Đã xong · nộp trễ (2 bài trễ = 1 bài thiếu)</span>
            : <span className="hw-due hw-due--ok">✔ Đã xong</span>}
      </div>
    </div>
  );
}

function Rules({ policy }) {
  const pol = policy || {};
  const lockThr = Number.isFinite(pol.lockThreshold) ? pol.lockThreshold : 2;
  const warnThr = pol.warnThreshold || 4;
  const failThr = pol.failThreshold || 8;
  return (
    <details className="hw-rules">
      <summary>ℹ️ Cách tính bài tập đã hoàn thành</summary>
      <ul>
        <li><span className="hw-res-tag hw-res-tag--quiz">≥70%</span> Bài có chấm điểm (grammar, vocabulary, viết câu, template, buổi học khóa Writing/Speaking…): cần đạt <b>từ 70% số điểm trở lên</b> mới tính hoàn thành. Buổi học <b>Mindset</b>: thêm điều kiện mỗi bài Reading/Listening của buổi cũng phải đạt <b>từ 70%</b>.</li>
        <li><span className="hw-res-tag hw-res-tag--quiz">≥{PRACTICE_PASS}%</span> Reading / Listening (đề full, bài đọc lẻ, bài nghe lẻ, dictation): cần đạt <b>từ {PRACTICE_PASS}% số điểm trở lên</b> là tự động tính hoàn thành.</li>
        <li><span className="hw-res-tag hw-res-tag--quiz">≥{GAPFILL_MIN_CORRECT} câu đúng</span> Bài nghe Gap-fill: cần điền <b>đúng ít nhất {GAPFILL_MIN_CORRECT} chỗ trống</b> trên tổng số chỗ trống của bài.</li>
        <li><span className="hw-res-tag hw-res-tag--quiz">≥70% đúng</span> Học từ trong sổ từ vựng: chỉ tính <b>Sổ 1–5</b> (sổ mặc định; nếu giáo viên chỉ định sổ thì phải học đúng sổ đó). Sổ phải có <b>đủ số từ giáo viên giao</b> (thiếu thì tự lưu thêm từ vào sổ), rồi luyện tập (quiz/flashcard) <b>đủ số từ đó</b> và trả lời đúng <b>từ 70%</b> trở lên. Kết quả được lưu <b>ngay sau mỗi câu</b> — dừng giữa chừng vẫn được tính; từ <b>chưa có nghĩa</b> không xuất hiện khi luyện nên không được tính. Đổi trạng thái "đã thuộc" bằng tay không được tính.</li>
        <li><span className="hw-res-tag hw-res-tag--writing">≥{MIN_WORDS_T1}/{MIN_WORDS_T2} từ</span> Bài viết (Writing): chỉ cần <b>nộp bài và viết đủ số từ tối thiểu</b> (Task 1 ≥{MIN_WORDS_T1} từ, Task 2 ≥{MIN_WORDS_T2} từ) là tính hoàn thành, không yêu cầu điểm.</li>
        <li><span className="hw-res-tag">Mở xem là xong</span> Video Shadowing, bài giảng Tips, Unit Vocab/Paraphrase: chỉ cần <b>bấm vào mở xem</b> là tự động tính hoàn thành.</li>
        <li>🔒 {lockThr > 0 ? <>Còn <b>hơn {lockThr} bài tập cũ</b> chưa hoàn thành</> : <>Còn <b>bài tập cũ</b> nào chưa hoàn thành</>} (kể cả bài đã quá hạn) thì các bài tập mới hơn sẽ bị <b>khoá</b> — làm bù bài cũ để mở khoá.</li>
        <li>⚠️ Làm thiếu bài tập nhiều sẽ ảnh hưởng chuyên cần của lớp: bắt đầu <b>cảnh báo từ {warnThr} bài</b> chưa hoàn thành đúng hạn, và <b>rớt khóa học</b> nếu thiếu tới <b>{failThr} bài</b>. Bài giáo viên đã <b>đóng (lưu trữ)</b> mà bạn chưa làm xong <b>vẫn tính là thiếu</b> — làm bù đầy đủ sẽ được trừ.</li>
      </ul>
    </details>
  );
}

export default function HomeworkCard({ homework, reload }) {
  const data = homework?.data;
  if (!data || !data.hasClasses) return null;
  const sync = homework.stale ? <span className="hw-sync" title="Đang tải trạng thái mới nhất">⟳ Đang cập nhật…</span> : null;
  const warn = data.homeworkWarning && (
    <div className="hw-warn">
      ⚠️ Bạn đang có <b>{data.homeworkWarning.missedCount} bài tập</b> chưa hoàn thành đúng hạn
      {data.homeworkWarning.className && <> ở lớp <b>{data.homeworkWarning.className}</b></>}. Vui lòng hoàn thành homework đúng hạn để không bị tụt lại.
    </div>
  );
  const list = data.assignments || [];

  if (!list.length) {
    return (
      <div id="homework-card" style={{ display: 'block' }}>
        <div className="hw-head"><h3>📚 Bài tập cần làm</h3>{sync}</div>
        {warn}
        <div className="hw-empty">Hiện tại không có bài tập nào.</div>
      </div>
    );
  }

  const lk = data.homeworkLock;
  const lockBanner = lk && lk.lockedCount ? (
    <div className="hw-lock-banner">
      🔒 Bạn còn <b>{lk.pendingOld.length} bài tập cũ</b> chưa hoàn thành nên <b>{lk.lockedCount} bài tập mới</b> đang bị khoá.
      Hãy hoàn thành các bài cũ dưới đây (kể cả bài đã quá hạn) để được làm tiếp bài mới:
      <ul>
        {lk.pendingOld.map(o => (
          <li key={o._id}>
            <JumpLink id={o._id}>{o.title}</JumpLink> · {o.done}/{o.total}
            {o.status === 'overdue' && <> <span className="hw-due hw-due--over">Quá hạn</span></>}
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  // The badge counts ASSIGNMENTS; the open sub-items are spelled out too.
  const open = list.filter(a => a.status !== 'completed');
  const done = list.filter(a => a.status === 'completed');
  const openItems = open.reduce((sum, a) => sum + Math.max(0, a.total - a.done), 0);
  const countLabel = openItems > open.length
    ? `${open.length} bài tập chưa xong · còn ${openItems} mục`
    : `${open.length} chưa xong`;

  return (
    <div id="homework-card" style={{ display: 'block' }}>
      <div className="hw-head">
        <h3>📚 Bài tập cần làm</h3>
        <span className="hw-head-right">{sync}<span className="hw-count">{countLabel}</span></span>
      </div>
      {lockBanner}
      <Rules policy={data.homeworkPolicy} />
      {!lockBanner && warn}
      {open.length
        ? <div className="hw-list">{open.map(a => <AssignmentBlock key={a._id} a={a} onChanged={reload} />)}</div>
        : <div className="hw-empty">🎉 Bạn đã hoàn thành hết bài tập được giao.</div>}
      {done.length > 0 && (
        <details className="hw-done-group">
          <summary>✔ Đã hoàn thành ({done.length})</summary>
          <div className="hw-list">{done.map(a => <AssignmentBlock key={a._id} a={a} onChanged={reload} />)}</div>
        </details>
      )}
    </div>
  );
}
