import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { hasPremiumAccess } from '../utils/plan';
import { bindDict, openUpgrade, setActivePractice, siteToast } from '../utils/shell';
import { loadScores, remainingOf } from '../utils/advSentences';
import { Spinner } from './advSentences/common';
import Practice from './advSentences/Practice';
import Exam, { ExamResult } from './advSentences/Exam';
import History from './advSentences/History';

// ✍️ Viết câu nâng cao — /app/advanced-sentences (was advanced-sentences.html).
// Weeks → structure groups → per-sentence translation drill, plus a timed
// exam per week and the practice history. The address says where you are:
//   ?week=N             the week's groups
//   ?week=N&groupId=ID  practising that group (homework links open here)
//   ?week=N&mode=exam   the week's exam, only while it runs

const BASE = '/advanced-sentences';

function draftsByWeek(drafts) {
  const m = {};
  drafts.forEach((d) => {
    const rem = remainingOf(d);
    if (rem > 0 && d.week) {
      m[d.week] ||= { remaining: 0, groups: 0 };
      m[d.week].remaining += rem;
      m[d.week].groups += 1;
    }
  });
  return m;
}

function Weeks({ weeks, drafts, onWeek, onHistory }) {
  const dbw = draftsByWeek(drafts);
  const totalDraft = Object.keys(dbw).length;
  const byWeek = new Map(weeks.map((w) => [w.week, w]));
  return (
    <>
      <div className="as-head pf-hero pf-hero-pink">
        <div className="pf-hero-body">
          <h2 className="as-h2">Viết câu <span className="pf-tag">nâng cao</span></h2>
          <p className="as-sub pf-hero-sub">Luyện dịch Việt → Anh theo 12 nhóm cấu trúc ngữ pháp nâng band</p>
        </div>
        <div className="pf-hero-actions"><button className="as-btn pf-hbtn" id="as-hist-btn" onClick={onHistory}><i className="fas fa-history" /> Lịch sử</button></div>
      </div>
      {!hasPremiumAccess() && (
        <div className="as-premium-banner">
          <div style={{ fontSize: 22 }}>⭐</div>
          <div className="t"><b>Nâng cấp Premium để luyện tập không giới hạn</b><span>Toàn bộ 73 câu luyện dịch · 12 nhóm ngữ pháp Band 7+</span></div>
          <button id="as-upg-btn" onClick={() => openUpgrade()}>Upgrade Premium</button>
        </div>
      )}
      {totalDraft > 0 && (
        <div className="as-draft-note">
          <i className="fas fa-bookmark" style={{ color: '#f59e0b' }} /> Bạn có bài đang dở ở {totalDraft} tuần — tuần được đánh dấu vàng. Nhấn để tiếp tục!
        </div>
      )}
      <div className="as-week-grid">
        {[1, 2, 3, 4, 5, 6].map((w) => {
          const d = byWeek.get(w);
          const dr = dbw[w];
          return (
            <div
              key={w}
              className={`as-week-card${d ? '' : ' locked'}${dr ? ' has-draft' : ''}`}
              data-week={w}
              style={d ? undefined : { opacity: 0.45, cursor: 'not-allowed' }}
              onClick={d ? () => onWeek(w) : undefined}
            >
              <div className="as-week-num">W{w}</div>
              <div className="as-week-names">{d ? (d.groupNames || []).join(' · ') : 'Sắp ra'}</div>
              <div className="as-week-label">{d ? `${d.sentenceCount} câu · ${d.groupCount} nhóm` : ''}</div>
              {dr && <div className="as-week-draft-pill"><i className="fas fa-bookmark" style={{ fontSize: 9 }} /> còn {dr.remaining} câu</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Groups({ week, groups, drafts, showHints, onHints, onGroup, onWeeks, onExam }) {
  const draftIds = new Set(drafts.filter((d) => remainingOf(d) > 0).map((d) => String(d.groupId)));
  const scores = loadScores();
  return (
    <>
      <div className="as-crumb"><span id="as-back-weeks" onClick={onWeeks}>Tuần</span> › <b>Tuần {week}</b></div>
      <div className="as-head" style={{ paddingTop: 4 }}><div><h2 className="as-h2" style={{ fontSize: 17 }}>Tuần {week} — Chọn nhóm cấu trúc</h2></div></div>
      <div className="as-mode-row">
        <span style={{ fontSize: 12, color: 'var(--text3,#9ca3af)', fontWeight: 700 }}>Chế độ:</span>
        <button className={`as-toggle${showHints ? ' active' : ''}`} data-hints="1" onClick={() => onHints(true)}>Có gợi ý</button>
        <button className={`as-toggle${!showHints ? ' active' : ''}`} data-hints="0" onClick={() => onHints(false)}>Không gợi ý</button>
        <button className="as-btn" id="as-exam-btn" style={{ marginLeft: 'auto' }} onClick={onExam}><i className="fas fa-clipboard-check" /> Thi thử cả tuần</button>
      </div>
      <div className="as-group-list">
        {groups.map((g) => {
          const dr = draftIds.has(String(g._id));
          const done = !!scores[g._id]?.completed;
          return (
            <div key={g._id} className={`as-group-card${dr ? ' has-draft' : ''}`} data-id={g._id} onClick={() => onGroup(g._id)}>
              <div className="as-group-emoji">{g.emoji || '✍️'}</div>
              <div style={{ flex: 1 }}>
                <div className="as-group-en">{g.nameEn}</div>
                <div className="as-group-name">{g.nameVi}</div>
                <div className="as-group-struct">🎯 {g.targetStructure}</div>
                <div className="as-group-meta">
                  {g.sentenceCount} câu
                  {done && <> · <span className="as-group-done"><i className="fas fa-check-circle" /> Đã hoàn thành</span></>}
                  {dr && <> · <span style={{ color: '#b45309' }}><i className="fas fa-bookmark" /> Đang dở</span></>}
                </div>
              </div>
              <i className="fas fa-chevron-right" style={{ color: '#9ca3af', alignSelf: 'center' }} />
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function AdvancedSentences() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const week = parseInt(params.get('week'), 10) || null;
  const groupId = params.get('groupId');
  const examMode = params.get('mode') === 'exam';
  const examResult = location.state?.examResult || null;

  const [home, setHome] = useState({ status: 'loading', weeks: [] });
  const [drafts, setDrafts] = useState([]);
  const [groupsByWeek, setGroupsByWeek] = useState({});
  const [showHints, setShowHints] = useState(true); // "Có gợi ý" vs "Không gợi ý"
  const [histOpen, setHistOpen] = useState(false);
  const [exam, setExam] = useState(null); // { week, questions } while it runs
  const [examLoading, setExamLoading] = useState(false);
  const appRef = useRef(null);

  const view = groupId ? 'practice'
    : examMode && week ? 'exam'
      : week ? (examResult ? 'examResult' : 'groups')
        : 'weeks';
  const listView = view === 'weeks' || view === 'groups';

  const toWeeks = useCallback((replace) => navigate(BASE, { replace: !!replace }), [navigate]);
  const toGroups = (w, replace) => navigate(`${BASE}?week=${w}`, { replace: !!replace });

  useEffect(() => {
    let alive = true;
    apiFetch('/adv-sentence/weeks')
      .then((d) => { if (alive) setHome({ status: 'ready', weeks: d.weeks || [] }); })
      .catch(() => { if (alive) setHome({ status: 'error', weeks: [] }); });
    return () => { alive = false; };
  }, []);

  // Drafts again on every visit to a list, so the yellow pills reflect a
  // session just finished or saved
  useEffect(() => {
    if (!listView) return undefined;
    let alive = true;
    apiFetch('/adv-sentence/drafts')
      .then((d) => { if (alive) setDrafts(d.drafts || []); })
      .catch(() => { /* the pills are a convenience */ });
    return () => { alive = false; };
  }, [listView, location.key]);

  const groupsWeek = view === 'groups' ? week : null;
  useEffect(() => {
    if (!groupsWeek) return undefined;
    let alive = true;
    apiFetch(`/adv-sentence/groups/week/${groupsWeek}`)
      .then((d) => { if (alive) setGroupsByWeek((m) => ({ ...m, [groupsWeek]: d.groups || [] })); })
      .catch(() => {
        if (!alive) return;
        siteToast('Lỗi tải nhóm', 'error');
        toWeeks(true);
      });
    return () => { alive = false; };
  }, [groupsWeek, toWeeks]);

  // ?mode=exam without a running exam (reload, Back/Forward onto it): resuming
  // a timed exam from history would be unfair, so it drops to the groups
  // (Not while the page itself is leaving the exam: the router applies its
  // navigation after the exam state is already cleared.)
  const staleExam = view === 'exam' && (!exam || exam.week !== week);
  const leavingExam = useRef(false);
  useEffect(() => {
    if (view !== 'exam') { leavingExam.current = false; return; }
    if (staleExam && !leavingExam.current) navigate(`${BASE}?week=${week}`, { replace: true });
  }, [view, staleExam, week, navigate]);

  useEffect(() => {
    setActivePractice(view === 'practice' || view === 'exam');
    return () => setActivePractice(false);
  }, [view]);

  useEffect(() => { bindDict('app', 'advanced-sentences'); }, []);

  // Replay the entrance animation on every view change
  useLayoutEffect(() => {
    const el = appRef.current;
    if (!el) return;
    el.classList.remove('as-view-anim');
    void el.offsetWidth;
    el.classList.add('as-view-anim');
  }, [view, week, groupId]);

  async function startExam() {
    if (examLoading) return;
    setExamLoading(true);
    try {
      const d = await apiFetch(`/adv-sentence/exam?week=${week}&count=12`);
      const questions = d.questions || [];
      if (!questions.length) { siteToast('Chưa có câu cho tuần này', 'error'); return; }
      setExam({ week, questions, id: Date.now() });
      navigate(`${BASE}?week=${week}&mode=exam`);
    } catch (e) {
      if (e?.status === 403) openUpgrade();
      else siteToast('Lỗi tải đề thi', 'error');
    } finally {
      setExamLoading(false);
    }
  }

  function examGraded(result) {
    const w = exam.week;
    leavingExam.current = true;
    setExam(null);
    navigate(`${BASE}?week=${w}`, { replace: true, state: result ? { examResult: result } : undefined });
  }

  let content;
  if (view === 'practice') {
    content = (
      <Practice
        key={groupId}
        groupId={groupId}
        showHints={showHints}
        onLoadFailed={() => toWeeks(true)}
        onDone={() => toWeeks()}
        onBack={() => (window.history.state?.idx > 0 ? navigate(-1) : toWeeks())}
      />
    );
  } else if (view === 'exam') {
    content = staleExam ? <Spinner /> : (
      <Exam
        key={exam.id}
        week={week}
        questions={exam.questions}
        onQuit={() => { leavingExam.current = true; setExam(null); toGroups(week, true); }}
        onGraded={examGraded}
      />
    );
  } else if (view === 'examResult') {
    content = <ExamResult result={examResult} onDone={() => toWeeks()} />;
  } else if (examLoading) {
    content = <Spinner />;
  } else if (home.status === 'error') {
    content = <p style={{ textAlign: 'center', color: '#dc2626', padding: 40 }}>Lỗi tải dữ liệu. Thử tải lại trang.</p>;
  } else if (view === 'groups') {
    const groups = groupsByWeek[week];
    content = !groups ? <Spinner /> : (
      <Groups
        week={week}
        groups={groups}
        drafts={drafts}
        showHints={showHints}
        onHints={setShowHints}
        onGroup={(id) => navigate(`${BASE}?week=${week}&groupId=${id}`)}
        onWeeks={() => toWeeks()}
        onExam={startExam}
      />
    );
  } else {
    content = home.status === 'loading' ? <Spinner /> : (
      <Weeks weeks={home.weeks} drafts={drafts} onWeek={(w) => toGroups(w)} onHistory={() => setHistOpen(true)} />
    );
  }

  return (
    <div id="app" ref={appRef} className="as-view-anim">
      {content}
      {histOpen && <History onClose={() => setHistOpen(false)} />}
    </div>
  );
}
