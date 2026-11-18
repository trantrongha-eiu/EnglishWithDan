import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import {
  ATTENDANCE_MARK, CLASS_STATUS, fmtDate, homeworkForClass, keyLabel, scheduleStats,
  sessionName, sessionState, splitSchedule, vnToday,
} from '../utils/classroom';
import { Checkin, ClassLimits, ClassTiles, ProgressBlock } from './dashboard/ClassInfoCard';
import HomeworkCard from './dashboard/HomeworkCard';
import SpeakingExamBlock, { SpeakingExamHistory, seDayLabel } from './dashboard/SpeakingExamBlock';

// 🏫 Lớp học — /app/#/classroom?class=<id>&tab=overview|schedule|homework|speaking
//   GET /classes/my/classroom gates the page; check-in, homework and the
//   Speaking exam are best-effort: their tab says so if they fail.
// A student in no class sees how to contact the teacher.

const TABS = [
  { key: 'overview', icon: 'fa-gauge-high', label: 'Tổng quan' },
  { key: 'schedule', icon: 'fa-calendar-days', label: 'Lịch học' },
  { key: 'homework', icon: 'fa-list-check', label: 'Bài tập' },
  { key: 'speaking', icon: 'fa-microphone', label: 'Thi Speaking' },
];
// Same public contact details as contact.html
const CONTACT = [
  { href: 'https://zalo.me/0914769618', icon: 'fas fa-comment-dots', title: 'Nhắn Zalo', sub: '0914 769 618', external: true },
  { href: 'tel:0914769618', icon: 'fas fa-phone', title: 'Gọi điện', sub: '0914 769 618' },
  { href: 'https://www.facebook.com/EnglishWithDan', icon: 'fa-brands fa-facebook', title: 'Facebook', sub: 'EnglishWithDan', external: true },
];

function Contact({ title, text }) {
  return (
    <section className="cr-contact">
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="cr-contact-list">
        {CONTACT.map((c) => (
          <a key={c.href} className="cr-contact-item" href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            <i className={c.icon} aria-hidden="true" />
            <span><b>{c.title}</b><small>{c.sub}</small></span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Hero({ c }) {
  const st = CLASS_STATUS[c.status] || CLASS_STATUS.active;
  return (
    <header className="cr-hero pf-hero pf-hero-purple" data-mascot="none">
      <div className="pf-hero-body">
        <span className={`ci-badge ${st.cls}`}>{st.label}</span>
        <h1>{c.className}</h1>
        {c.courseName && <p className="pf-hero-sub">{c.courseName}</p>}
        <div className="cr-facts">
          {c.teacherName && <span><i className="fas fa-chalkboard-user" aria-hidden="true" /> GV {c.teacherName}</span>}
          {(c.startDate || c.endDate) && (
            <span><i className="far fa-calendar" aria-hidden="true" /> {fmtDate(c.startDate)}{c.startDate && c.endDate ? ' – ' : ''}{fmtDate(c.endDate)}</span>
          )}
          {c.startTime && <span><i className="far fa-clock" aria-hidden="true" /> Vào học {c.startTime}</span>}
          <span><i className="fas fa-users" aria-hidden="true" /> {c.classSize} học viên</span>
        </div>
      </div>
    </header>
  );
}

function Shortcut({ icon, title, text, href, onClick }) {
  const body = (
    <>
      <span className="cr-shortcut-icon" aria-hidden="true">{icon}</span>
      <span><b>{title}</b><small>{text}</small></span>
      <i className="fas fa-chevron-right" aria-hidden="true" />
    </>
  );
  return href
    ? <a className="cr-shortcut" href={href}>{body}</a>
    : <button type="button" className="cr-shortcut" onClick={onClick}>{body}</button>;
}

function Overview({ c, ck, homework, se, animate, closed, onToggle, reload, go }) {
  const list = homework?.assignments || [];
  const open = list.filter((a) => a.status !== 'completed');
  const overdue = open.filter((a) => a.status === 'overdue').length;
  const hwText = !homework ? 'Xem bài tập của lớp'
    : !open.length ? 'Bạn đã làm hết bài được giao'
      : `${open.length} bài chưa xong${overdue ? ` · ${overdue} quá hạn` : ''}`;
  const sc = se?.classes?.find((x) => String(x.classId) === String(c.classId));
  const seText = !sc ? 'Xem lịch thi của lớp'
    : sc.booking ? `Đã đăng kí ${seDayLabel(sc.booking.dayKey)} · ${sc.booking.startTime}`
      : sc.openSlots?.length ? `Còn ${sc.openSlots.length} buổi trống — chọn lịch ngay` : 'Giáo viên chưa mở lịch thi';
  const panels = { a: !closed[`${c.classId}:a`], h: !closed[`${c.classId}:h`] };

  return (
    <>
      {c.statusReason && (c.status === 'warning' || c.status === 'failed') && (
        <div className={`ci-reason ci-reason--${c.status}`}>{c.status === 'failed' ? '⛔' : '⚠️'} {c.statusReason}</div>
      )}
      <section id="class-info-card" className={`cr-card${animate ? '' : ' ci-no-anim'}`} style={{ display: 'block' }}>
        <div className="ci-head"><h3>Tiến độ khóa học</h3></div>
        <ProgressBlock c={c} animate={animate} />
        <Checkin ck={ck} todaySession={c.progress?.todaySession} onDone={reload} />
        <ClassTiles c={c} animate={animate} open={panels} onToggle={onToggle} />
        <ClassLimits c={c} open={panels} />
      </section>
      <div className="cr-shortcuts">
        <Shortcut icon="📅" title="Lịch học" text={`${(c.sessions || []).length} buổi · điểm danh từng buổi`} onClick={() => go('schedule')} />
        <Shortcut icon="📚" title="Bài tập" text={hwText} onClick={() => go('homework')} />
        <Shortcut icon="🎤" title="Thi Speaking" text={seText} onClick={() => go('speaking')} />
        <Shortcut icon="💰" title="Học phí" text="Xem các khoản cần đóng" href="/tuition.html" />
        <Shortcut icon="✉️" title="Hộp thư" text="Tin nhắn từ giáo viên" href="/inbox.html" />
      </div>
      <Contact title="Cần hỗ trợ về lớp học?" text="Xin nghỉ, đổi buổi hoặc có thắc mắc, hãy liên hệ giáo viên qua:" />
    </>
  );
}

function SessionRow({ s, today }) {
  const st = sessionState(s, today);
  const mark = ATTENDANCE_MARK[s.mark];
  const [wd, date] = keyLabel(s.dayKey).split(', ');
  return (
    <li className={`cr-sess cr-sess--${st.cls}`}>
      <span className="cr-sess-date"><b>{wd}</b>{date}</span>
      <span className="cr-sess-main">
        <b>{sessionName(s)}</b>{s.startTime && <> <small>{s.startTime}</small></>}
        {s.topic && <span className="cr-sess-topic">{s.topic}</span>}
      </span>
      <span className="cr-sess-tags">
        <span className={`cr-pill cr-pill--${mark ? mark.cls : st.cls}`}>{mark ? mark.label : st.label}</span>
      </span>
    </li>
  );
}

function Week({ w, today }) {
  return (
    <div className="cr-week">
      {w.week ? <div className="cr-week-title">Tuần {w.week}</div> : null}
      <ul className="cr-sess-list">{w.items.map((s) => <SessionRow key={s._id} s={s} today={today} />)}</ul>
    </div>
  );
}

function Schedule({ c }) {
  const rows = c.sessions || [];
  if (!rows.length) return <div className="cr-note">🗓️ Lớp chưa có lịch học. Giáo viên sẽ cập nhật sớm.</div>;
  const today = c.progress?.today || vnToday();
  const { coming, past } = splitSchedule(rows, today);
  return (
    <>
      <div className="cr-stats">
        {scheduleStats(c, today).map(([k, v]) => <div key={k}><b>{v}</b><span>{k}</span></div>)}
      </div>
      <section className="cr-card">
        {coming.length
          ? coming.map((w) => <Week key={w.items[0]._id} w={w} today={today} />)
          : <div className="cr-note">Khóa học đã đi hết lịch.</div>}
        {past.length > 0 && (
          <details className="cr-past" open={!coming.length}>
            <summary>Các tuần đã qua ({past.reduce((n, w) => n + w.items.length, 0)} buổi)</summary>
            {past.map((w) => <Week key={w.items[0]._id} w={w} today={today} />)}
          </details>
        )}
      </section>
    </>
  );
}

function Speaking({ c, se, reload }) {
  const sc = se?.classes?.find((x) => String(x.classId) === String(c.classId));
  if (!sc) return <div className="cr-note">Chưa tải được lịch thi Speaking. Hãy tải lại trang để thử lại.</div>;
  const canAct = sc.booking || sc.openSlots?.length;
  return (
    <>
      <section className="cr-card">
        <div className="ci-head"><h3>🎤 Thi Speaking 1-1 với giáo viên</h3></div>
        <p className="cr-hint">
          Mỗi buổi {se.slotMinutes || 25} phút gồm {se.examMinutes || 15}&apos; thi và {se.feedbackMinutes || 10}&apos; nhận feedback.
          {' '}Bạn đăng kí, đổi hoặc hủy được tới {se.lockHours || 2} tiếng trước giờ thi.
        </p>
        {canAct
          ? <SpeakingExamBlock se={se} classId={c.classId} onChanged={reload} />
          : <div className="cr-note">Giáo viên chưa mở lịch thi mới. Lịch sẽ hiện ở đây khi được mở.</div>}
      </section>
      {sc.history?.length > 0 && (
        <section className="cr-card">
          <div className="ci-head"><h3>Kết quả các buổi đã thi</h3></div>
          <SpeakingExamHistory history={sc.history} />
        </section>
      )}
    </>
  );
}

export default function Classroom() {
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState({ status: 'loading' });
  const [animate, setAnimate] = useState(true); // count-ups only on the first paint
  const [closed, setClosed] = useState({}); // `${classId}:a|h` → limit panel closed
  const seq = useRef(0);
  const painted = useRef(false);
  const lastRefresh = useRef(0);
  const tabsRef = useRef(null);

  const load = useCallback(() => {
    const id = ++seq.current;
    lastRefresh.current = Date.now();
    return Promise.all([
      apiFetch('/classes/my/classroom'),
      apiFetch('/classes/my/checkin').catch(() => null),
      apiFetch('/assignments/mine').catch(() => null),
      apiFetch('/classes/my/speaking-exam').catch(() => null),
    ]).then(([room, ck, homework, se]) => {
      if (id !== seq.current) return;
      painted.current = true;
      setState({
        status: 'ready',
        classes: room.classes || [],
        checkin: new Map((ck?.classes || []).map((c) => [String(c.classId), c])),
        homework,
        se,
      });
    }).catch(() => {
      // a refresh that fails keeps what is on screen
      if (id === seq.current && !painted.current) setState({ status: 'error' });
    });
  }, []);

  const reload = useCallback(() => { setAnimate(false); return load(); }, [load]);

  useEffect(() => {
    load();
    // work done in another tab (homework, attendance…) shows on return, ≤ 1 per 30s
    const onVis = () => {
      if (document.visibilityState !== 'visible' || Date.now() - lastRefresh.current < 30000) return;
      reload();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [load, reload]);

  let body;
  if (state.status === 'loading') body = <div className="cr-note">Đang tải lớp học…</div>;
  else if (state.status === 'error') {
    body = (
      <div className="cr-note cr-note--error">
        Không tải được thông tin lớp học.
        <button type="button" className="se-btn" onClick={() => { setState({ status: 'loading' }); load(); }}>Thử lại</button>
      </div>
    );
  } else if (!state.classes.length) {
    body = (
      <div className="cr-empty">
        <div className="cr-empty-icon" aria-hidden="true">🏫</div>
        <Contact title="Bạn chưa có lớp học" text="Hãy liên hệ giáo viên để được xếp lớp. Sau khi vào lớp, lịch học, điểm danh, bài tập và lịch thi Speaking sẽ hiện ở đây." />
      </div>
    );
  } else {
    const { classes, checkin, se } = state;
    const c = classes.find((x) => String(x.classId) === params.get('class')) || classes[0];
    const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'overview';
    const homework = homeworkForClass(state.homework, c);
    const sc = se?.classes?.find((x) => String(x.classId) === String(c.classId));
    const badge = {
      homework: (homework?.assignments || []).filter((a) => a.status !== 'completed').length,
      speaking: sc && !sc.booking ? (sc.openSlots || []).length : 0,
    };
    const select = (nextTab, classId = c.classId) => {
      const q = {};
      if (classes.length > 1) q.class = String(classId);
      if (nextTab !== 'overview') q.tab = nextTab;
      setParams(q, { replace: true });
    };
    const go = (nextTab) => {
      select(nextTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      requestAnimationFrame(() => tabsRef.current?.querySelector('[aria-selected="true"]')?.focus());
    };
    const onTabKey = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const i = TABS.findIndex((t) => t.key === tab);
      select(TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length].key);
      requestAnimationFrame(() => tabsRef.current?.querySelector('[aria-selected="true"]')?.focus());
    };

    body = (
      <>
        {classes.length > 1 && (
          <div className="cr-classes" role="group" aria-label="Chọn lớp">
            {classes.map((x) => {
              const on = String(x.classId) === String(c.classId);
              return <button key={x.classId} type="button" className={`cr-class${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => select(tab, x.classId)}>{x.className}</button>;
            })}
          </div>
        )}
        <Hero c={c} />
        <div className="cr-tabs" role="tablist" aria-label="Thông tin lớp học" ref={tabsRef} onKeyDown={onTabKey}>
          {TABS.map((t) => {
            const on = t.key === tab;
            return (
              <button key={t.key} type="button" role="tab" className={`cr-tab${on ? ' is-on' : ''}`} aria-selected={on} tabIndex={on ? 0 : -1} onClick={() => select(t.key)}>
                <i className={`fas ${t.icon}`} aria-hidden="true" /> {t.label}{badge[t.key] ? <em>{badge[t.key]}</em> : null}
              </button>
            );
          })}
        </div>
        <div id="crPanel" role="tabpanel">
          {tab === 'overview' && (
            <Overview c={c} ck={checkin.get(String(c.classId))} homework={homework} se={se} animate={animate} closed={closed}
              onToggle={(k) => setClosed((o) => ({ ...o, [`${c.classId}:${k}`]: !o[`${c.classId}:${k}`] }))} reload={reload} go={go} />
          )}
          {tab === 'schedule' && <Schedule c={c} />}
          {tab === 'homework' && (homework
            ? <HomeworkCard homework={{ data: homework, stale: false }} reload={reload} />
            : <div className="cr-note">Chưa tải được bài tập. Hãy tải lại trang để thử lại.</div>)}
          {tab === 'speaking' && <Speaking c={c} se={se} reload={reload} />}
        </div>
      </>
    );
  }

  return <main className="cr-layout">{body}</main>;
}
