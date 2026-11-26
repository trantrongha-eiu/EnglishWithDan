import { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { siteToast } from '../../utils/shell';
import {
  OVERVIEW_ROWS_BY_BAND, SKILL_LABEL, TIMETABLE_WEEKS_BY_BAND,
  bandStats, fmtDate, keyFor, loadBand, saveBand, weekDoneCount,
} from '../../utils/examTimetable';
import { TimetableGuide } from './Guide';

// 🗓️ Lộ trình luyện đề 7 tuần — band toggle, session checklist and the
// personal test log, all on /api/exam-timetable (same calls as the old
// js/reading-listening-strategy.js).

const api = (path, opts) => apiFetch('/exam-timetable' + path, opts);
const EMPTY = { checklist: {}, testLogs: [], stats: { totalChecked: 0, totalItems: 42, totalLogs: 0, totalReviewed: 0 } };
// The server's answer, without the `success` flag
const pick = (d) => ({ checklist: d.checklist || {}, testLogs: d.testLogs || [], stats: d.stats || EMPTY.stats });

function Week({ band, w, checklist, onToggle }) {
  const done = weekDoneCount(band, checklist, w);
  return (
    // `open` only sets the first state: the student opens/closes weeks freely
    <details className="tt-week" id={`tt-week-${w.n}`} open={w.n === 1}>
      <summary>
        <span className="tt-week-badge">W{w.n}</span>
        <span className="tt-week-head"><span className="tt-week-title">{w.title}</span><span className="tt-week-goal">{w.goal}</span></span>
        <span className={done === w.sessions.length ? 'tt-week-count done' : 'tt-week-count'}>{done}/{w.sessions.length}</span>
        <i className="fas fa-chevron-down"></i>
      </summary>
      <div className="tt-week-body">
        {w.sessions.map((s) => {
          const key = keyFor(band, w.n, s.k);
          const checked = !!checklist[key];
          return (
            <div key={key} className={'tt-session' + (checked ? ' done' : '')} data-key={key}>
              <input type="checkbox" data-tt-check={key} checked={checked} onChange={(e) => onToggle(key, e.target.checked)} />
              <div className="tt-session-body">
                <div className="tt-session-format">{s.fmt}</div>
                <div className="tt-session-title">{s.t}</div>
                <div className="tt-session-content">{s.c}</div>
              </div>
            </div>
          );
        })}
        <div className="st-callout" style={{ marginTop: 12 }}>
          <div className="st-callout-t"><i className="fas fa-pen-nib"></i> Writing focus</div>
          <p><b>Task 2:</b> {w.focus.t2}<br /><b>Task 1:</b> {w.focus.t1}</p>
        </div>
      </div>
    </details>
  );
}

function LogForm({ onAdded }) {
  const [skill, setSkill] = useState('reading');
  const [week, setWeek] = useState('');
  const [label, setLabel] = useState('');
  const [mistake, setMistake] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const data = await api('/logs', { method: 'POST', body: JSON.stringify({ skill, week: week || null, label: label.trim(), mistake: mistake.trim() }) });
      if (data && data.success) {
        onAdded(data);
        setLabel('');
        setMistake('');
        setWeek('');
        siteToast('Đã thêm vào nhật ký luyện đề', 'success');
      }
    } catch {
      siteToast('Không thêm được, thử lại nhé', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="tt-log-form" id="tt-log-form" onSubmit={submit}>
      <select id="tt-log-skill" required value={skill} onChange={(e) => setSkill(e.target.value)}>
        {Object.entries(SKILL_LABEL).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
      <select id="tt-log-week" className="tt-log-week" value={week} onChange={(e) => setWeek(e.target.value)}>
        <option value="">Tuần?</option>
        {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={String(n)}>W{n}</option>)}
      </select>
      <input type="text" id="tt-log-label" className="tt-log-label" maxLength={120} placeholder="Tên đề (VD: Cambridge 18 Test 2)" value={label} onChange={(e) => setLabel(e.target.value)} />
      <input type="text" id="tt-log-mistake" className="tt-log-mistake" maxLength={500} placeholder="Lỗi hay mắc phải (tuỳ chọn)" value={mistake} onChange={(e) => setMistake(e.target.value)} />
      <button type="submit" disabled={sending}><i className="fas fa-plus"></i> Thêm</button>
    </form>
  );
}

function LogRows({ logs, onReviewed, onDelete }) {
  if (!logs.length) {
    return <tr><td colSpan={7} className="tt-log-empty">Chưa có đề nào — thêm đề đầu tiên ở trên.</td></tr>;
  }
  return logs.map((l) => (
    <tr key={l.id} data-log-id={l.id}>
      <td>{fmtDate(l.date)}</td>
      <td>{l.week ? 'W' + l.week : '—'}</td>
      <td><span className="tt-log-skill-badge">{SKILL_LABEL[l.skill] || l.skill}</span></td>
      <td>{l.label || '—'}</td>
      <td>{l.mistake || '—'}</td>
      <td><input type="checkbox" className="tt-log-reviewed" data-log-reviewed={l.id} checked={!!l.reviewed} onChange={(e) => onReviewed(l.id, e.target.checked)} /></td>
      <td><button type="button" className="tt-log-del" data-log-del={l.id} title="Xoá" onClick={() => onDelete(l.id)}><i className="fas fa-trash"></i></button></td>
    </tr>
  ));
}

export default function Timetable() {
  const [band, setBand] = useState(loadBand);
  const [data, setData] = useState(EMPTY);
  // The old page showed "0/42 buổi" (no %) until the first count
  const [counted, setCounted] = useState(false);

  useEffect(() => {
    let alive = true;
    // Not signed in / offline: the plan still shows, just without saved progress
    api('', { method: 'GET' })
      .then((d) => { if (alive && d && d.success) { setData(pick(d)); setCounted(true); } })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const merge = (d) => { setData(pick(d)); setCounted(true); };

  const switchBand = (b) => {
    if (b === band) return;
    setBand(b);
    saveBand(b);
    setCounted(true);
  };

  const setChecked = (key, checked) => setData((d) => ({ ...d, checklist: { ...d.checklist, [key]: checked } }));
  const onToggle = async (key, checked) => {
    setChecked(key, checked); // at once; undone if the save fails
    setCounted(true);
    try {
      const d = await api('/checklist/' + encodeURIComponent(key), { method: 'PUT', body: JSON.stringify({ checked }) });
      if (d && d.success) merge(d);
    } catch {
      setChecked(key, !checked);
      siteToast('Không lưu được, thử lại nhé', 'error');
    }
  };

  const setReviewed = (logId, reviewed) => setData((d) => ({ ...d, testLogs: d.testLogs.map((l) => (l.id === logId ? { ...l, reviewed } : l)) }));
  const onReviewed = async (logId, reviewed) => {
    setReviewed(logId, reviewed); // the tick shows at once; undone if the save fails
    try {
      const d = await api('/logs/' + logId, { method: 'PATCH', body: JSON.stringify({ reviewed }) });
      if (d && d.success) merge(d);
    } catch {
      setReviewed(logId, !reviewed);
      siteToast('Không lưu được, thử lại nhé', 'error');
    }
  };

  const onDelete = async (logId) => {
    try {
      const d = await api('/logs/' + logId, { method: 'DELETE' });
      if (d && d.success) merge(d);
    } catch {
      siteToast('Không xoá được, thử lại nhé', 'error');
    }
  };

  const { totalItems, totalChecked, pct } = bandStats(band, data.checklist);
  const weeks = TIMETABLE_WEEKS_BY_BAND[band];

  return (
    <section className="st-sec" id="sec-timetable">
      <header className="tt-hero">
        <div className="tt-hero-eyebrow">🗓️ 7-Week Timetable to Conquer the IELTS</div>
        <h1>Lộ trình luyện đề 7 tuần cuối trước kỳ thi</h1>
        <p className="tt-hero-sub">Hoàn thiện kỹ năng → sửa lỗi → luyện đề → ổn định phong độ trước ngày thi.</p>
        <div className="tt-hero-meta">
          <span><i className="fas fa-calendar-week"></i> Mỗi tuần: 3 buổi tại lớp + 3 buổi tự học</span>
          <span><i className="fas fa-clock"></i> ~2 giờ / buổi</span>
          <span><i className="fas fa-flag-checkered"></i> 7 tuần · 42 buổi</span>
        </div>
        <div className="tt-band-toggle" role="tablist" aria-label="Chọn mục tiêu band">
          <button type="button" className={'tt-band-btn' + (band === '6.0' ? ' active' : '')} data-band="6.0" role="tab" onClick={() => switchBand('6.0')}>🎯 Mục tiêu Band 6.0</button>
          <button type="button" className={'tt-band-btn' + (band === '7.0' ? ' active' : '')} data-band="7.0" role="tab" onClick={() => switchBand('7.0')}>🚀 Mục tiêu Band 7.0+</button>
        </div>
      </header>

      <div className="st-block">
        <div className="st-block-label"><i className="fas fa-chart-simple"></i> Tiến độ của bạn</div>
        <div className="tt-progress-row">
          <span className="tt-progress-txt" id="tt-progress-txt">{counted ? `${totalChecked}/${totalItems} buổi (${pct}%)` : '0/42 buổi'}</span>
          <div className="tt-progress-track"><div className="tt-progress-fill" id="tt-progress-fill" style={counted ? { width: pct + '%' } : undefined}></div></div>
        </div>
        <div className="tt-stats">
          <div className="tt-stat"><div className="tt-stat-num" id="tt-stat-sessions">{counted ? totalChecked : 0}</div><div className="tt-stat-label">Buổi đã hoàn thành</div></div>
          <div className="tt-stat"><div className="tt-stat-num" id="tt-stat-tests">{counted ? data.stats.totalLogs : 0}</div><div className="tt-stat-label">Đề đã luyện</div></div>
          <div className="tt-stat"><div className="tt-stat-num" id="tt-stat-reviewed">{counted ? data.stats.totalReviewed : 0}</div><div className="tt-stat-label">Đề đã review</div></div>
        </div>
      </div>

      <div className="st-block">
        <div className="st-block-label"><i className="fas fa-table"></i> Tổng quan 7 tuần</div>
        <div className="st-table-wrap">
          <table className="st-table">
            <thead><tr><th>Tuần</th><th>Trọng tâm</th><th>Reading</th><th>Listening</th><th>Speaking</th><th>Writing T2</th><th>Writing T1</th></tr></thead>
            <tbody id="tt-overview-tbody">
              {OVERVIEW_ROWS_BY_BAND[band].map((r) => (
                <tr key={r[0]}><td><b>{r[0]}</b></td>{r.slice(1).map((c, i) => <td key={i}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="st-block">
        <div className="st-block-label"><i className="fas fa-list-check"></i> Chi tiết từng tuần — tick vào từng buổi khi hoàn thành</div>
        {/* keyed by band: switching band starts with week 1 open again, as before */}
        <div id="tt-weeks" key={band}>
          {weeks.map((w) => <Week key={w.n} band={band} w={w} checklist={data.checklist} onToggle={onToggle} />)}
        </div>
      </div>

      <TimetableGuide />

      <div className="st-block">
        <div className="st-block-label"><i className="fas fa-clipboard-list"></i> Nhật ký luyện đề — tự quản lý &amp; theo dõi</div>
        <p>Ghi lại mỗi đề bạn luyện trên website: đã review chưa, và lỗi hay mắc phải. Đừng chỉ hỏi &quot;được bao nhiêu điểm&quot; — hãy hỏi &quot;tuần này đã sửa được lỗi gì&quot;.</p>
        <LogForm onAdded={merge} />
        <div className="tt-log-table-wrap">
          <table className="tt-log-table">
            <thead><tr><th>Ngày</th><th>Tuần</th><th>Kỹ năng</th><th>Tên đề</th><th>Lỗi hay mắc phải</th><th>Đã review</th><th></th></tr></thead>
            <tbody id="tt-log-tbody"><LogRows logs={data.testLogs} onReviewed={onReviewed} onDelete={onDelete} /></tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
