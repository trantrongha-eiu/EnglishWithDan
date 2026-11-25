import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBlocker, useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { hasPremiumAccess } from '../utils/plan';
import { bindDict, openUpgrade, setActivePractice, showBadges, siteToast, useLeaveWarning } from '../utils/shell';
import {
  addXP, allSentencesOf, allStepsDone, buildLevel, emptyProg, homeworkFrom, knownCount, loadXP, mergeProg, queryFor,
  reviewDue, stateFromSearch, STEP_KEYS, STEPS, stepDone, stepUnlocked, TYPE_META, typePct,
} from '../utils/task2Template';
import Overview from './task2Template/Overview';
import Warmup from './task2Template/Warmup';
import Read from './task2Template/Read';
import Drill from './task2Template/Drill';
import Assemble from './task2Template/Assemble';
import Apply from './task2Template/Apply';
import RecallRun from './task2Template/RecallRun';
import TypeGuide from './task2Template/Guide';
import { guideAllPassed, guidePassedCount } from './task2Template/guideQuizRules';
import { FullDialog, HistoryDialog } from './task2Template/Dialogs';
import { copyText } from './task2Template/helpers';
import { LeaveDialog } from './task2Template/Parts';
import { drillRun, fixItems, reviewItems } from './task2Template/runs';
import { initVoices, stopSpeak } from './task2Template/tts';

// 📚 Task 2 Templates — /app/task2-template?type=typeNN&level=band7 (was
// task2-template.html). One short practice path per essay type and level
// over the full template of the Template Bank book (js/task2-generic-
// templates.js, the same lines "Xem đầy đủ" shows):
//   ① Khung bài ② Đọc & nghe ③ Luyện từng đoạn ④ Ghép cả bài ⑤ Áp dụng đề thật
// plus ⚡ Ôn nhanh (due 1/3/7/14/30 days after ④), 🎯 Luyện câu yếu and Thi
// thử. Progress is on the account (/api/task2template/progress, no TTL);
// finished runs go to /api/task2template/save (history + homework tick).

const BASE = '/task2-template';
const TOUR_PAGE = 'task2-template.html';
const LEAVE_SUB = 'Phần đang luyện dở của bước này sẽ không được lưu.';

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// One essay type at one level. A new type or level (a new address) starts a
// new Screen, so a half-done step never carries over.
function Screen({ page, typeId, level, lv, rows, loading, failed, locked }) {
  const navigate = useNavigate();
  const tpl = lv ? lv.byId[typeId] : null;
  const types = lv ? lv.types : [];
  const row = rows[typeId] || emptyProg(typeId, level);
  const isB7 = level === 'band7';
  const meta = TYPE_META[typeId] || {};
  // Guide reading-check quizzes (one row per type, both levels): null while
  // loading, 'off' if they could not be loaded (then nothing is locked).
  const gq = page.guideQuiz;
  const qp = gq === 'off' ? 'off' : (gq ? (gq[typeId] || { typeId, sections: {} }) : null);
  const started = STEP_KEYS.some((k) => stepDone(row, k)) || (row.drillRounds || []).some(Boolean);
  // The path opens after all six guide quizzes — students who already
  // started this type keep going.
  const guideOk = qp == null || qp === 'off' || !page.guides?.[typeId] || started || guideAllPassed(qp);

  const [view, setView] = useState('overview'); // overview · warmup · read · drill · assemble · apply · review · fix · exam
  const [act, setAct] = useState({ seq: 0 });
  const [done, setDone] = useState(false);
  const [leave, setLeave] = useState(null); // { sub, action }
  const [full, setFull] = useState(false);
  const [hist, setHist] = useState(false);
  const runRef = useRef(null);
  const viewRef = useRef(view);
  useEffect(() => { viewRef.current = view; });

  const inActivity = view !== 'overview' && view !== 'read' && !done;
  const exam = view === 'exam';

  // Back / a link / another type or level mid-step asks first
  const blocker = useBlocker(({ currentLocation: a, nextLocation: b }) => inActivity && (a.pathname !== b.pathname || a.search !== b.search));
  useLeaveWarning(exam && !done);
  useEffect(() => { setActivePractice(inActivity); return () => setActivePractice(false); }, [inActivity]);

  useEffect(() => {
    document.documentElement.style.setProperty('--tpl-type-c', meta.color || '#4d63d8');
    return () => document.documentElement.style.removeProperty('--tpl-type-c');
  }, [meta.color]);
  useEffect(() => {
    window.__ewsExamActive = () => viewRef.current === 'exam';
    bindDict('tpl-content-area', 'task2-template', () => viewRef.current !== 'exam');
    return () => { delete window.__ewsExamActive; stopSpeak(); };
  }, []);

  function confirmLeave(sub, action) {
    if (!inActivity) { action(); return; }
    setLeave({ sub, action });
  }
  function begin(nextView, extra = {}) {
    stopSpeak();
    setAct((a) => ({ seq: a.seq + 1, ...extra }));
    setView(nextView);
    setDone(false);
    scrollTop();
  }
  function backToPath() {
    stopSpeak();
    setView('overview');
    setAct((a) => ({ seq: a.seq + 1 }));
    setDone(false);
    scrollTop();
  }

  const ctx = {
    tpl, typeId, level, isB7, row, guides: page.guides,
    guideOk, guideDone: qp && qp !== 'off' ? guidePassedCount(qp) : 0,
    onOpenGuide() {
      const d = document.querySelector('#tpl-guide-area details.t2-guide');
      if (d) { d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    },
    homeworkPending: page.homework.some((h) => h.typeId === typeId && h.level === level && !h.completed),
    save: (patch) => page.save(patch, typeId),
    saveAttempt: (a) => page.saveAttempt(a, typeId, tpl),
    addXP: page.addXP,
    // Finishing a step: save, award XP (first time), refresh the homework tick
    completeStep(key, extra = {}) {
      const first = !stepDone(row, key);
      page.save({ steps: { [key]: true }, ...extra }, typeId);
      page.refreshHomeworkSoon();
      if (first) {
        page.addXP(10);
        const s = STEPS[STEP_KEYS.indexOf(key)];
        siteToast(`🎉 Xong bước ${s.num} ${s.title}! +10 XP`, 'success', 2500);
      }
    },
    onBack: backToPath,
    onDone: (flag) => setDone(!!flag),
    onStep(key) {
      const i = STEP_KEYS.indexOf(key);
      if (i < 0 || !stepUnlocked(row, i)) return;
      if (i === 0 && !guideOk) { siteToast('Qua 6 quiz ở “Hướng dẫn dạng bài này” trước để mở lộ trình nha 🔒', 'info', 3000); ctx.onOpenGuide(); return; }
      if (key === 'drill') begin('drill', { init: drillRun(ctx, null, act.seq) });
      else begin(key);
    },
    onRestart: () => begin(view),
    onReview: () => begin('review', { items: reviewItems(row, tpl), start: Date.now() }),
    onFix(keys, from = '') {
      const items = fixItems(row, tpl, keys);
      if (!items.length) { siteToast('Chưa có câu yếu nào — luyện bước ③ trước nha!', 'info', 2500); return; }
      begin('fix', { items, from, start: Date.now() });
    },
    onExam() {
      confirmLeave('Bắt đầu thi thử sẽ bỏ phần đang luyện dở của bước này.', () => {
        begin('exam', { items: allSentencesOf(tpl), start: Date.now() });
        siteToast('⏱ Bắt đầu thi thử! Nhớ lại từng câu từ tiếng Việt — không có gợi ý.', 'info', 3000);
      });
    },
  };

  function pickType(id) {
    if (id === typeId) { if (view !== 'overview') confirmLeave(LEAVE_SUB, backToPath); return; }
    navigate(BASE + queryFor(id, level));
    scrollTop();
  }
  const pickLevel = (l) => { if (l !== level) navigate(BASE + queryFor(typeId, l)); };
  function examButton() {
    if (exam) runRef.current?.submit();
    else ctx.onExam();
  }
  function resetPath() {
    const ok = () => page.save({ reset: true }, typeId);
    if (window.confirmDialog) window.confirmDialog('Làm lại từ đầu?', 'Xoá tiến độ lộ trình của dạng bài này (cấp độ hiện tại) và làm lại từ đầu?', ok, { confirmLabel: 'Xoá tiến độ', confirmClass: 'btn-danger' });
    else if (window.confirm('Xoá tiến độ lộ trình của dạng bài này (cấp độ hiện tại) và làm lại từ đầu?')) ok();
  }
  const copyShare = () => copyText(`${window.location.origin}/app${BASE}?type=${typeId}${level !== 'band6' ? '&level=' + level : ''}`, 'Đã sao chép link chia sẻ!');

  // ── header numbers ──
  const doneTypes = types.filter((t) => allStepsDone(rows[t.id] || emptyProg(t.id, level))).length;
  const known = types.reduce((s, t) => s + knownCount(rows[t.id] || emptyProg(t.id, level), lv.byId[t.id]), 0);
  const total = types.reduce((s, t) => s + allSentencesOf(lv.byId[t.id]).length, 0);
  const due = types.filter((t) => reviewDue(rows[t.id] || emptyProg(t.id, level))).length;
  const nParas = tpl ? tpl.paras.length : 1;
  const duo = window.Mascot ? window.Mascot.duo('happy') : '';

  let content;
  if (locked) content = null;
  else if (failed) content = <div className="pth-loading">Không tải được nội dung. Vui lòng tải lại trang.</div>;
  else if (loading) content = <div className="pth-loading">⏳ Đang tải...</div>;
  else if (!tpl) content = <div className="pth-loading">Chưa có nội dung</div>;
  else {
    const k = act.seq;
    switch (view) {
      case 'warmup': content = <Warmup key={k} ctx={ctx} />; break;
      case 'read': content = <Read key={k} ctx={ctx} />; break;
      case 'drill': content = <Drill key={k} ctx={ctx} init={act.init} />; break;
      case 'assemble': content = <Assemble key={k} ctx={ctx} />; break;
      case 'apply': content = <Apply key={k} ctx={ctx} />; break;
      case 'review': case 'fix': case 'exam':
        content = <RecallRun key={k} ref={runRef} ctx={ctx} mode={view} items={act.items} from={act.from} start={act.start} />; break;
      default: content = <Overview ctx={ctx} homework={page.homework} onLevel={pickLevel} onReset={resetPath} />;
    }
  }

  let leaveBox = null;
  if (blocker.state === 'blocked') leaveBox = <LeaveDialog sub={LEAVE_SUB} onStay={() => blocker.reset()} onLeave={() => blocker.proceed()} />;
  else if (leave) leaveBox = <LeaveDialog sub={leave.sub} onStay={() => setLeave(null)} onLeave={() => { const a = leave.action; setLeave(null); a(); }} />;

  return (
    <div className="tpl-page">
      <section className="tpl-hero" id="tpl-hero" style={{ '--tpl-c': meta.color || '#4d63d8' }}>
        <div className="tpl-hero-text">
          <h1 className="tpl-hero-title">Luyện viết <span className="tpl-hero-tag">Task 2 Template</span></h1>
          <p className="tpl-hero-sub" id="tpl-page-sub">
            {lv && !locked ? `Lộ trình 5 bước để thuộc ${total} câu của bản template đầy đủ — 7 dạng bài IELTS Task 2, ${isB7 ? 'Band 7+' : 'Band 6+'}. Bí quá thì bấm “Hỏi Lulu” nha!` : 'Lộ trình 5 bước để thuộc bản template đầy đủ của 7 dạng bài IELTS Task 2.'}
          </p>
          <div className="tpl-hero-badges">
            <span className="tpl-hero-badge" id="tpl-main-badge">{lv && !locked ? <><i className="fas fa-flag-checkered" /> {doneTypes}/{types.length} dạng hoàn thành</> : '0 / 7 dạng hoàn thành'}</span>
            <span className="tpl-hero-badge" id="tpl-mode-badge">{lv && !locked ? `🧠 Đã thuộc ${known}/${total} câu` + (due ? ` · 🔔 ${due} dạng cần ôn` : '') : '🧠 Đã thuộc 0/0 câu'}</span>
          </div>
        </div>
        <div className="tpl-hero-side">
          {/* Band 6+ / Band 7+ — same 7 essay types; Band 7+ gets fewer hints */}
          <div className="t2-level-toggle" id="tpl-level-toggle" role="tablist" aria-label="Trình độ">
            {[['band6', '🌱 Band 6+'], ['band7', '🏆 Band 7+']].map(([l, label]) => (
              <button key={l} className={`t2-level-btn${l === level ? ' active' : ''}`} data-level={l} role="tab" aria-selected={l === level ? 'true' : 'false'}
                onClick={() => { if (!locked) pickLevel(l); }}>{label}</button>
            ))}
          </div>
          <div className="tpl-hero-tools">
            <button className="tpl-glass-btn" id="tpl-full-btn" onClick={() => setFull(true)} title="Xem toàn bộ template của dạng bài này — đúng các câu bạn luyện trong lộ trình">
              <i className="fas fa-file-lines" /> Xem đầy đủ
            </button>
            <button className="tpl-glass-btn" onClick={() => setHist(true)} title="Xem lịch sử luyện tập"><i className="fas fa-history" /> Lịch sử</button>
            <button className="tpl-glass-btn tpl-glass-btn--icon" onClick={copyShare} title="Sao chép link chia sẻ trang này" aria-label="Sao chép link"><i className="fas fa-link" /></button>
          </div>
        </div>
        <div className="lh-mascot" id="tpl-hero-mascot" aria-hidden="true" dangerouslySetInnerHTML={{ __html: duo }} />
      </section>

      <nav id="tpl-type-tabs" className="tpl-type-nav" aria-label="Dạng bài">
        {!locked && types.map((t) => {
          const tm = TYPE_META[t.id] || {};
          const r = rows[t.id] || emptyProg(t.id, level);
          const pct = typePct(r, lv.byId[t.id].paras.length);
          const hw = page.homework.some((h) => h.typeId === t.id && h.level === level && !h.completed);
          let badge = null;
          if (reviewDue(r)) badge = <span className="t2-tab-pct-badge pth-due-badge" title="Đến hạn ôn">🔔</span>;
          else if (hw) badge = <span className="t2-tab-pct-badge pth-due-badge" title="Bài tập về nhà">📌</span>;
          else if (allStepsDone(r)) badge = <span className="t2-tab-done-badge" title="Đã xong lộ trình">✓</span>;
          else if (pct > 0) badge = <span className="t2-tab-pct-badge">{pct}%</span>;
          return (
            <button key={t.id} className={`t2-type-tab-btn ${typeId === t.id ? 'active' : ''}`} onClick={() => pickType(t.id)} data-tpl-type={t.id}
              style={{ '--tab-color': tm.color || '#4d63d8' }} title={t.name}>
              <span className="t2-tab-icon-wrap"><i className={`fas ${tm.icon || 'fa-file'}`} /></span>
              <span className="t2-tab-text">
                <span className="t2-tab-label">{t.label}</span>
                <span className="t2-tab-sub">{t.sub}</span>
                <span className="t2-tab-mode-dots" title="5 bước của lộ trình">
                  {STEP_KEYS.map((key) => <span key={key} className={`t2-tab-mode-dot${stepDone(r, key) ? ' on' : ''}`} />)}
                </span>
              </span>
              {badge}
            </button>
          );
        })}
      </nav>

      {/* Toolbar — the practice itself is the 5-step path below */}
      <div className="tpl-toolbar" id="tpl-toolbar">
        <button className={`t2-tpl-exam-btn-tab${exam ? ' active' : ''}`} id="tpl-exam-btn" onClick={() => { if (tpl && !loading && !locked) examButton(); }}
          title="Thi thử: nhớ lại mọi câu từ tiếng Việt, không gợi ý, 30 phút">
          <i className="fas fa-clock" /> <span id="tpl-exam-label">{exam ? 'Thoát thi thử' : 'Thi thử'}</span>
        </button>
        <div className="tpl-stats" id="tpl-type-status">
          {tpl && !locked && !loading && (
            <>
              <span className="tpl-stat"><i className="fas fa-route" /> {meta.label || ''}: {typePct(row, nParas)}%</span>
              {allStepsDone(row) && <span className="tpl-stat is-ok"><i className="fas fa-check-circle" /> Xong lộ trình</span>}
              {row.assembleBest > 0 && <span className="tpl-stat"><i className="fas fa-star" /> Ghép bài tốt nhất: {row.assembleBest}%</span>}
            </>
          )}
        </div>
        <div className="tpl-xp">
          <span className="tpl-stat tpl-stat--xp"><i className="fas fa-star" /> <span id="header-xp">{page.xp.xp}</span> XP</span>
          <span className="tpl-stat tpl-stat--fire">🔥 <span id="header-streak">{page.xp.streak}</span></span>
        </div>
      </div>

      {/* Per-type reference guide */}
      {!locked && (
        <TypeGuide g={page.guides?.[typeId]} guides={page.guides} typeId={typeId} hidden={exam} qp={qp}
          onQuizDone={(section, correct, total) => page.saveGuideQuiz(typeId, section, correct, total)}
          onGuideDone={() => { if (view !== 'overview') backToPath(); setTimeout(() => document.querySelector('.pth-steps')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80); }} />
      )}
      {locked && <div id="tpl-guide-area" />}

      <main className="tpl-content-outer">
        <div id="tpl-content-area">{content}</div>
      </main>

      {leaveBox}
      {full && <FullDialog data={page.data} level={level} typeId={typeId} onClose={() => setFull(false)} />}
      {hist && <HistoryDialog onClose={() => setHist(false)} />}
    </div>
  );
}

export default function Task2Template() {
  const location = useLocation();
  const [premium] = useState(() => hasPremiumAccess());
  const [data, setData] = useState(null); // js/task2-generic-templates.js · 'error'
  const [prog, setProg] = useState({ level: null, rows: {} });
  const [guides, setGuides] = useState(null);
  const [guideQuiz, setGuideQuiz] = useState(null); // { typeId: { sections } } · 'off'
  const [homework, setHomework] = useState([]);
  const [xp, setXp] = useState(loadXP);

  const { type: typeParam, level } = stateFromSearch(location.search);
  const built = useMemo(() => (data && data !== 'error' ? { band6: buildLevel(data, 'band6'), band7: buildLevel(data, 'band7') } : null), [data]);
  const lv = built ? built[level] : null;
  const typeId = lv && typeParam && lv.byId[typeParam] ? typeParam : (lv?.types[0]?.id || 'type01');

  const levelRef = useRef(level);
  useEffect(() => { levelRef.current = level; });
  const gqRef = useRef(guideQuiz);
  useEffect(() => { gqRef.current = guideQuiz; });
  const hwRef = useRef(homework);
  useEffect(() => { hwRef.current = homework; });
  const chain = useRef(Promise.resolve());

  useEffect(() => {
    document.title = 'Task 2 Templates – EnglishWithDan';
    if (!premium) { openUpgrade(); return; }
    initVoices();
    let alive = true;
    const T = window.Task2GenericTpl;
    (T ? T.load() : Promise.reject(new Error('no loader')))
      .then((d) => { if (!alive) return; setData(d); window.EWSTour?.autoStart?.(TOUR_PAGE); })
      .catch(() => { if (alive) setData('error'); });
    apiFetch('/task2/type-guides')
      .then((d) => { const m = {}; if (d && d.success && Array.isArray(d.guides)) d.guides.forEach((g) => { m[g.typeId] = g; }); if (alive) setGuides(m); })
      .catch(() => { if (alive) setGuides({}); });
    apiFetch('/task2template/guide-quiz')
      .then((d) => {
        if (!alive) return;
        if (!d || !d.success) { setGuideQuiz('off'); return; }
        const m = {}; (d.quiz || []).forEach((r) => { m[r.typeId] = r; });
        setGuideQuiz(m);
      })
      .catch(() => { if (alive) setGuideQuiz('off'); });
    return () => { alive = false; };
  }, [premium]);

  // This level's progress (fetched again on every level switch)
  useEffect(() => {
    if (!premium) return undefined;
    let alive = true;
    apiFetch(`/task2template/progress?level=${level}`)
      .then((d) => {
        const rows = {};
        if (d && d.success) (d.progress || []).forEach((p) => { rows[p.typeId] = p; });
        if (alive) setProg({ level, rows });
      })
      .catch(() => { if (alive) setProg({ level, rows: {} }); });
    return () => { alive = false; };
  }, [level, premium]);

  // Class homework (task2_template): toast when one gets ticked
  const loadHomework = useCallback(() => {
    apiFetch('/assignments/mine').then((d) => {
      if (!d || !d.success) return;
      const before = new Map(hwRef.current.map((h) => [h.key, h.completed]));
      const out = homeworkFrom(d.assignments);
      setHomework(out);
      if (out.some((h) => h.completed && before.get(h.key) === false)) {
        siteToast('✅ Đạt bài tập về nhà: đã học xong và thuộc ≥ 70% số câu!', 'success', 4000);
        setXp(addXP(10));
      }
    }).catch(() => {});
  }, []);
  useEffect(() => { if (premium) loadHomework(); }, [premium, loadHomework]);
  // Re-check after anything that can change the tick (waits for pending saves)
  const refreshHomeworkSoon = useCallback(() => {
    if (!hwRef.current.some((h) => !h.completed)) return;
    chain.current.then(() => setTimeout(loadHomework, 400));
  }, [loadHomework]);

  // Merge locally right away (so the screen moves), then send. Saves run one
  // after another so a slow request never lands after a newer one.
  const save = useCallback((patch, tId) => {
    const lvl = levelRef.current;
    const put = (rows, r) => {
      const next = { ...rows };
      if (patch.reset) delete next[tId]; else next[tId] = r;
      return next;
    };
    setProg((p) => (p.level !== lvl ? p : { ...p, rows: put(p.rows, mergeProg(p.rows[tId] || emptyProg(tId, lvl), patch)) }));
    const body = JSON.stringify({ level: lvl, ...patch });
    chain.current = chain.current.then(async () => {
      try {
        const d = await apiFetch(`/task2template/progress/${tId}`, { method: 'PUT', body });
        if (d && d.success && d.progress && levelRef.current === lvl) setProg((p) => (p.level !== lvl ? p : { ...p, rows: put(p.rows, d.progress) }));
      } catch { siteToast('Chưa lưu được tiến độ — kiểm tra kết nối mạng.', 'warn', 3000); }
    });
    return chain.current;
  }, []);

  // One finished run → attempt history (90-day TTL) + homework completion
  const saveAttempt = useCallback(({ mode, total, correct, isExam = false, timeTakenSec }, tId, tpl) => {
    if (!total) return;
    const meta = TYPE_META[tId];
    apiFetch('/task2template/save', {
      method: 'POST',
      body: JSON.stringify({ templateType: tId, templateName: meta && tpl ? `${meta.label} – ${tpl.name}` : tId, totalItems: total, correctItems: correct, mode, isExam, timeTakenSec, level: levelRef.current }),
    }).then(showBadges).catch(() => {}).finally(refreshHomeworkSoon);
  }, [refreshHomeworkSoon]);

  // A finished guide quiz: shown at once, then saved; the first pass of a
  // section gives +5 XP.
  const saveGuideQuiz = useCallback((tId, section, correct, total) => {
    const pass = correct * 100 >= total * 90;
    const pct = Math.round((correct / total) * 100);
    const m0 = gqRef.current;
    const first = pass && m0 && m0 !== 'off' && !(((m0[tId] || {}).sections || {})[section] || {}).passedAt;
    setGuideQuiz((m) => {
      if (!m || m === 'off') return m;
      const row = m[tId] || { typeId: tId, sections: {} };
      const cur = row.sections[section] || {};
      const next = { best: Math.max(cur.best || 0, pct), tries: (cur.tries || 0) + 1, passedAt: cur.passedAt || (pass ? new Date().toISOString() : null) };
      return { ...m, [tId]: { ...row, sections: { ...row.sections, [section]: next } } };
    });
    if (first) setXp(addXP(5));
    apiFetch(`/task2template/guide-quiz/${tId}`, { method: 'POST', body: JSON.stringify({ section, correct, total }) })
      .then((d) => { if (d && d.success && d.progress) setGuideQuiz((m) => (m && m !== 'off' ? { ...m, [tId]: d.progress } : m)); })
      .catch(() => siteToast('Chưa lưu được kết quả quiz — kiểm tra kết nối mạng.', 'warn', 3000));
  }, []);

  const page = {
    data: data === 'error' ? null : data, guides, guideQuiz, saveGuideQuiz, homework, xp, save, saveAttempt, refreshHomeworkSoon,
    addXP: (n) => setXp(addXP(n)),
  };
  return (
    <Screen key={`${typeId}|${level}`} page={page} typeId={typeId} level={level} lv={lv} rows={prog.level === level ? prog.rows : {}}
      loading={!premium ? false : (!data || prog.level !== level)} failed={data === 'error'} locked={!premium} />
  );
}
