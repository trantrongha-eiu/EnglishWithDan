import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { hasPremiumAccess } from '../../utils/plan';
import { openUpgrade } from '../../utils/shell';

// Hồ sơ → Mục tiêu (was goal.html): the goal form, today's work, this week's
// plan and the AI roadmap. Nothing loads until the tab is first opened: the
// roadmap can call the AI, and most visits to Hồ sơ don't need it.

const SLOW = { timeout: 90000 }; // a sleeping server, or the AI writing a roadmap
const BANDS = Array.from({ length: 8 }, (_, i) => 4 + i * 0.5); // 4.0 .. 7.5
const DAYS = [['mon', 'T2'], ['tue', 'T3'], ['wed', 'T4'], ['thu', 'T5'], ['fri', 'T6'], ['sat', 'T7'], ['sun', 'CN']];
const DAY_LABEL = { mon: 'Thứ 2', tue: 'Thứ 3', wed: 'Thứ 4', thu: 'Thứ 5', fri: 'Thứ 6', sat: 'Thứ 7', sun: 'Chủ nhật' };
const CAT_LABEL = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking', vocabulary: 'Từ vựng', grammar: 'Ngữ pháp' };
const EMPTY_FORM = { current: '', target: '', exam: '', weekly: '', session: '', days: [] };

const catLabel = (c) => CAT_LABEL[String(c || '').toLowerCase()] || c;
// "2026-11-16" → "16/11"
function fmtDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  return m ? `${m[3]}/${m[2]}` : iso || '';
}
function todayKey() {
  // Local date: toISOString() is still "yesterday" in Vietnam before 7am
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const text = (v) => (v == null ? '' : String(v));
const formFromGoal = (g) => ({
  current: text(g.currentBand), target: text(g.targetBand), exam: g.examDate ? g.examDate.slice(0, 10) : '',
  weekly: text(g.weeklyStudyMinutes), session: text(g.preferredSessionMinutes), days: g.studyDays || [],
});

// One answer per `version`; while the next one loads the result says so
function useLoad(path, version, enabled) {
  const [result, setResult] = useState({ version: null });
  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    apiFetch(path, SLOW)
      .then((data) => { if (alive) setResult({ version, data }); })
      .catch(() => { if (alive) setResult({ version, failed: true }); });
    return () => { alive = false; };
  }, [path, version, enabled]);
  return result.version === version ? result : { loading: true };
}

// A band set elsewhere can be outside this list (Chỉnh sửa goes up to 9.0)
function BandSelect({ id, value, empty, onChange }) {
  const known = !value || BANDS.some((b) => String(b) === value);
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{empty}</option>
      {BANDS.map((b) => <option key={b} value={String(b)}>{b.toFixed(1)}</option>)}
      {!known && <option value={value}>{Number(value).toFixed(1)} (đặt ở Chỉnh sửa)</option>}
    </select>
  );
}

function scheduleHint({ weekly, session, days }) {
  const w = parseInt(weekly, 10) || 0;
  const s = parseInt(session, 10) || 0;
  if (!days.length || !s) return { text: '', warn: false };
  const fits = days.length * s;
  if (w > fits) return { warn: true, text: `${days.length} ngày × ${s} phút = ${fits} phút/tuần — ít hơn ${w} phút bạn muốn học. Hãy thêm ngày học hoặc tăng số phút mỗi buổi.` };
  return { warn: false, text: `${days.length} ngày × tối đa ${s} phút/buổi${w ? ` · ${w} phút/tuần chia đều cho các ngày học` : ''}.` };
}

function Today({ result, onSetGoal }) {
  const t = result.data;
  if (result.loading) return <div id="today-content" className="goal-loading">Đang tải…</div>;
  if (result.failed) return <div id="today-content" className="today-empty">Không thể tải nội dung học hôm nay.</div>;
  if (!t.hasGoal) {
    return <div id="today-content" className="today-empty">{t.message} <a href="#f-target" onClick={onSetGoal}>Đặt mục tiêu bên dưới ↓</a></div>;
  }
  if (!t.hasPlan || !t.isStudyDay || !t.sessions?.length) {
    return <div id="today-content" className="today-empty">{t.message || 'Hôm nay chưa có lịch học nào.'}</div>;
  }
  return (
    <div id="today-content">
      <div className="today-total">{t.totalMinutes} phút hôm nay</div>
      <div className="today-sessions">
        {t.sessions.map((s, i) => (
          <div className="today-session" key={i}>
            <div className="today-session-head">
              <span className="today-session-cat">{catLabel(s.category)}</span>
              <span className="today-session-min">{s.minutes} phút</span>
            </div>
            <div className="today-session-reason">{s.reason}</div>
            <a className="today-start-btn" href={s.practiceUrl}><i className="fas fa-play" /> {s.action}</a>
          </div>
        ))}
      </div>
    </div>
  );
}

function Summary({ goal: g }) {
  if (!g?.hasGoal) return null;
  const band = (b) => (b == null ? '—' : Number(b).toFixed(1));
  const Stat = ({ value, label }) => <div className="goal-stat"><div className="goal-stat-val">{value}</div><div className="goal-stat-label">{label}</div></div>;
  return (
    <div className="goal-card" id="summary-card">
      <h2><i className="fas fa-chart-line" /> Tổng quan mục tiêu</h2>
      <div className="goal-summary-grid" id="summary-stats">
        {Stat({ value: band(g.targetBand), label: 'Band mục tiêu' })}
        {Stat({ value: band(g.currentBand), label: `Hiện tại${g.currentBandSource === 'self_assessed' ? ' (tự đánh giá)' : ''}` })}
        {g.gapBands != null && Stat({ value: `${g.gapBands >= 0 ? '+' : ''}${g.gapBands}`, label: 'Chênh lệch' })}
        {g.daysRemaining != null && Stat({ value: g.isPastExamDate ? 'Đã qua' : g.daysRemaining, label: 'Ngày còn lại' })}
        {!!g.weeklyStudyMinutes && Stat({ value: g.weeklyStudyMinutes, label: 'Phút/tuần' })}
        {!!g.studyDays?.length && Stat({ value: g.studyDays.length, label: 'Ngày/tuần' })}
      </div>
      {g.feasibility && <div className={`goal-feasibility ${g.feasibility.level}`} id="summary-feasibility">{g.feasibility.message}</div>}
    </div>
  );
}

function WeekPlan({ result }) {
  const p = result.data;
  if (result.loading) return <div id="plan-content" className="goal-loading">Đang tải…</div>;
  if (result.failed) return <div id="plan-content" className="plan-empty">Không thể tải kế hoạch học.</div>;
  if (!p.hasPlan) return <div id="plan-content" className="plan-empty">{p.message || 'Thiết lập mục tiêu ở trên để tạo kế hoạch.'}</div>;
  const most = Math.max(...p.allocation.map((a) => a.minutes));
  const scheduled = p.scheduledMinutes ?? p.totalMinutes;
  return (
    <div id="plan-content">
      <div className="plan-week">Tuần {fmtDate(p.weekStart)} → {fmtDate(p.weekEnd)} · Tổng {scheduled} phút</div>
      {scheduled < p.totalMinutes && <div className="goal-hint warn">Lịch học chỉ xếp được {scheduled}/{p.totalMinutes} phút — hãy thêm ngày học hoặc tăng số phút mỗi buổi.</div>}
      <div className="plan-alloc">
        {p.allocation.map((a) => (
          <div className="plan-alloc-row" key={a.category}>
            <div>{catLabel(a.category)}</div>
            <div className="plan-alloc-bar-wrap"><div className="plan-alloc-bar" style={{ width: `${most ? Math.round((a.minutes / most) * 100) : 0}%` }} /></div>
            <div className="plan-alloc-min">{a.minutes}p</div>
          </div>
        ))}
      </div>
      {p.sessions.map((s) => (
        <div className="plan-day" key={s.date || s.day}>
          <div className="plan-day-head">
            <span className="plan-day-title">{DAY_LABEL[s.day] || s.day} · {fmtDate(s.date)}</span>
            <span className="plan-day-total">{s.totalMinutes} phút</span>
          </div>
          {s.items.map((it, i) => (
            <div className="plan-item" key={i}>
              <div className="plan-item-cat">{catLabel(it.category)}</div>
              <div className="plan-item-reason">{it.reason}</div>
              <div className="plan-item-min">{it.minutes} phút</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function AiPlan({ result, regenerating, onRefresh }) {
  const paragraphs = (result.data?.aiPlan || '').split(/\n\n+/).filter((p) => p.trim());
  return (
    <div className="goal-card" id="ai-plan-card">
      <h2><i className="fas fa-robot" /> Lộ trình học cá nhân (AI)</h2>
      {result.loading && <div id="ai-plan-content" className="goal-loading">{regenerating ? 'Đang tạo lại lộ trình…' : 'Đang tải lộ trình AI…'}</div>}
      {result.failed && <div id="ai-plan-content" className="plan-empty">Không thể tải lộ trình AI.</div>}
      {result.data && (paragraphs.length
        ? <div id="ai-plan-content" className="ai-plan-text">{paragraphs.map((p, i) => <p key={i}>{p.trim()}</p>)}</div>
        : <div id="ai-plan-content" className="plan-empty">Chưa có lộ trình AI — lưu mục tiêu để tạo tự động.</div>)}
      {!result.loading && (
        <div className="goal-form-actions" style={{ marginTop: 14 }}>
          <button className="goal-btn" id="ai-plan-refresh-btn" onClick={onRefresh}><i className="fas fa-sync-alt" /> Tạo lại lộ trình</button>
        </div>
      )}
    </div>
  );
}

export default function GoalTab({ active, onSaved }) {
  const [premium] = useState(() => hasPremiumAccess());
  const [opened, setOpened] = useState(active);
  if (active && !opened) setOpened(true);
  const enabled = opened && premium;

  const [goal, setGoal] = useState(null);
  const [goalFailed, setGoalFailed] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [version, setVersion] = useState(0); // today + week plan, again after a save
  const [ai, setAi] = useState({ n: 0, refresh: false });
  const dirty = useRef(false);
  const targetRef = useRef(null);

  // Each time the tab comes back: Chỉnh sửa can change the same band and date.
  // What the student is still typing here is left alone.
  useEffect(() => {
    if (!active || !premium || dirty.current) return undefined;
    let alive = true;
    apiFetch('/goals', SLOW).then((data) => {
      if (!alive || dirty.current) return;
      const g = data.goal || {}; // "no goal yet" may omit it
      setGoal(g);
      setGoalFailed(false);
      setForm(formFromGoal(g));
    }).catch(() => { if (alive) setGoalFailed(true); });
    return () => { alive = false; };
  }, [active, premium]);

  const today = useLoad('/learning/today', version, enabled);
  const plan = useLoad('/study-plan/current', version, enabled);
  const hasTarget = goal?.targetBand != null;
  const aiPlan = useLoad(`/goals/ai-plan${ai.refresh ? '?refresh=1' : ''}`, ai.n, enabled && hasTarget);

  function change(patch) {
    dirty.current = true;
    setForm((f) => ({ ...f, ...patch }));
  }
  const toggleDay = (day) => change({ days: form.days.includes(day) ? form.days.filter((d) => d !== day) : [...form.days, day] });

  async function save() {
    setMsg(null);
    if (!form.target) {
      setMsg({ cls: 'error', text: 'Hãy chọn band mục tiêu để Dan lập kế hoạch cho bạn.' });
      return;
    }
    setSaving(true);
    try {
      const data = await apiFetch('/goals', {
        method: 'PUT',
        body: JSON.stringify({
          currentBand: form.current ? parseFloat(form.current) : null,
          targetBand: parseFloat(form.target),
          examDate: form.exam || null,
          weeklyStudyMinutes: form.weekly ? parseInt(form.weekly, 10) : null,
          preferredSessionMinutes: form.session ? parseInt(form.session, 10) : null,
          studyDays: form.days,
        }),
      });
      dirty.current = false;
      setMsg({ cls: 'ok', text: 'Đã lưu!' });
      setGoal(data.goal || {});
      setVersion((v) => v + 1);
      setAi((a) => ({ n: a.n + 1, refresh: false })); // regenerates if the goal changed
      onSaved?.(); // the band and date also show in the rest of Hồ sơ
    } catch (e) {
      setMsg({ cls: 'error', text: e.message || 'Không thể lưu mục tiêu.' });
    } finally {
      setSaving(false);
    }
  }

  function jumpToTarget(e) {
    e.preventDefault();
    targetRef.current?.querySelector('select')?.focus();
    targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const hint = scheduleHint(form);
  return (
    <div className={`tab-content${active ? ' active' : ''}`} id="tab-goal">
      {!premium && (
        <div className="goal-card">
          <h2><i className="fas fa-bullseye" /> Mục tiêu &amp; kế hoạch học</h2>
          <p className="plan-empty">Nâng cấp Premium để đặt mục tiêu và nhận kế hoạch học mỗi tuần.</p>
          <div className="goal-form-actions" style={{ justifyContent: 'center' }}>
            <button className="goal-btn goal-btn-primary" onClick={() => openUpgrade()}>Nâng cấp Premium</button>
          </div>
        </div>
      )}
      {premium && (
        <>
          <div className="goal-card" id="today-card">
            <h2><i className="fas fa-sun" /> Học hôm nay</h2>
            <Today result={today} onSetGoal={jumpToTarget} />
          </div>

          <div className="goal-card">
            <h2><i className="fas fa-bullseye" /> Mục tiêu của bạn</h2>
            <div className="goal-form-grid">
              <div className="goal-field">
                <label htmlFor="f-current">Trình độ IELTS hiện tại (tự đánh giá, không bắt buộc)</label>
                <BandSelect id="f-current" value={form.current} empty="— Chưa đặt —" onChange={(current) => change({ current })} />
              </div>
              <div className="goal-field" ref={targetRef}>
                <label htmlFor="f-target">Band mục tiêu</label>
                <BandSelect id="f-target" value={form.target} empty="— Chọn —" onChange={(target) => change({ target })} />
              </div>
              <div className="goal-field">
                <label htmlFor="f-exam">Ngày thi</label>
                <input type="date" id="f-exam" min={todayKey()} value={form.exam} onChange={(e) => change({ exam: e.target.value })} />
              </div>
              <div className="goal-field">
                <label htmlFor="f-weekly">Thời gian học mỗi tuần (phút)</label>
                <input type="number" id="f-weekly" min="1" step="10" placeholder="VD: 240" value={form.weekly} onChange={(e) => change({ weekly: e.target.value })} />
              </div>
              <div className="goal-field">
                <label htmlFor="f-session">Số phút mỗi buổi</label>
                <input type="number" id="f-session" min="5" max="240" step="5" placeholder="VD: 60" value={form.session} onChange={(e) => change({ session: e.target.value })} />
              </div>
              <div className="goal-field">
                <label>Ngày học trong tuần</label>
                <div className="goal-days" id="f-days">
                  {DAYS.map(([day, label]) => (
                    <button type="button" key={day} className={`goal-day-chip${form.days.includes(day) ? ' active' : ''}`} data-day={day} aria-pressed={form.days.includes(day)} onClick={() => toggleDay(day)}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className={`goal-hint${hint.warn ? ' warn' : ''}`} id="schedule-hint" aria-live="polite">{hint.text}</div>
            <div className="goal-form-actions">
              <button className="goal-btn goal-btn-primary" id="goal-save-btn" disabled={saving} onClick={save}>{saving ? 'Đang lưu…' : 'Lưu mục tiêu'}</button>
              <span className={`goal-msg${goalFailed ? ' error' : msg ? ` ${msg.cls}` : ''}`} id="goal-msg">{goalFailed ? 'Không thể tải mục tiêu.' : msg?.text}</span>
            </div>
          </div>

          <Summary goal={goal} />
          {hasTarget && <AiPlan result={aiPlan} regenerating={ai.refresh} onRefresh={() => setAi((a) => ({ n: a.n + 1, refresh: true }))} />}

          <div className="goal-card">
            <h2><i className="fas fa-calendar-week" /> Kế hoạch học tuần này</h2>
            <WeekPlan result={plan} />
          </div>
        </>
      )}
    </div>
  );
}
