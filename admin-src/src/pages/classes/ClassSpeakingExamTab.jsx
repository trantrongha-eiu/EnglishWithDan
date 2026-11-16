import { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../components/ConfirmDialog';
import { keyLabel } from './classProgressUtils';
import { slotCount, vnTodayKey, MODE_LABEL } from './speakingExamUtils';

// Class page "🎤 Thi Speaking" tab — GET/POST/PUT/DELETE
// /classes/:id/speaking-exam (backend/controllers/speakingExam.controller.js).
// The teacher enters free windows (ngày + từ giờ → đến giờ); each is cut into
// 25' slots = 15' thi + 10' feedback. Students tick one slot on their
// dashboard ("Lớp học của tôi") and pick online (Meet) / offline (nhà GV).

const RESULT = {
  done: { label: 'Đã thi', badge: 'badge-green' },
  no_show: { label: 'Vắng thi', badge: 'badge-red' },
};
const VIEWS = [
  { key: 'upcoming', label: 'Sắp tới' },
  { key: 'past', label: 'Đã qua' },
  { key: 'all', label: 'Tất cả' },
];

const emptyRange = () => ({ date: '', from: '', to: '' });

export default function ClassSpeakingExamTab({ cls, roster = [] }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [data, setData] = useState(null);
  const [view, setView] = useState('upcoming');
  const [ranges, setRanges] = useState([emptyRange()]);
  const [modes, setModes] = useState(['online', 'offline']);
  const [meetLink, setMeetLink] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [alsoClasses, setAlsoClasses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [prefilled, setPrefilled] = useState(false);
  // 'now' for the upcoming/past split — refreshed on every load, not read during render.
  const [now, setNow] = useState(() => Date.now());

  const load = () => apiFetch(`/classes/${cls._id}/speaking-exam`)
    .then((d) => {
      setNow(Date.now());
      setData(d);
      if (!prefilled && d.defaults) {
        setMeetLink(d.defaults.meetLink || '');
        setAddress(d.defaults.address || '');
        if (d.defaults.modes?.length) setModes(d.defaults.modes);
        setPrefilled(true);
      }
    })
    .catch((e) => toast(e.message, 'error'));
  useEffect(() => { load(); }, [cls._id]);

  const slotMin = data?.slotMinutes || 25;
  const slots = data?.slots || [];
  const isPast = (s) => new Date(s.endsAt).getTime() <= now;
  const shown = slots.filter((s) => (view === 'all' ? true : view === 'past' ? isPast(s) : !isPast(s)));
  const upcoming = slots.filter((s) => !isPast(s));
  const stats = {
    open: upcoming.filter((s) => !s.booked).length,
    booked: upcoming.filter((s) => s.booked).length,
    done: slots.filter((s) => s.result === 'done').length,
  };

  // Roster students with neither an upcoming booking nor a finished exam in
  // the list — who still has to register.
  const registered = new Set(slots.filter((s) => s.student && (s.result === 'done' || !isPast(s))).map((s) => String(s.student._id)));
  const notRegistered = roster.filter((r) => r.status !== 'dropped' && !registered.has(String(r.student._id)));

  const totalNew = ranges.reduce((n, r) => n + slotCount(r.from, r.to, slotMin), 0);
  const otherClasses = (data?.teacherClasses || []).filter((c) => String(c._id) !== String(cls._id));

  const setRange = (i, k) => (e) => setRanges((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: e.target.value } : r)));
  const toggle = (list, setList, v) => setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function create(e) {
    e.preventDefault();
    const filled = ranges.filter((r) => r.date || r.from || r.to);
    if (!filled.length) return toast('Nhập ít nhất 1 khung giờ rảnh', 'error');
    if (filled.some((r) => !r.date || !r.from || !r.to)) return toast('Mỗi khung giờ cần đủ ngày, từ giờ, đến giờ', 'error');
    if (!modes.length) return toast('Chọn ít nhất 1 hình thức thi', 'error');
    setSaving(true);
    try {
      const d = await apiFetch(`/classes/${cls._id}/speaking-exam`, {
        method: 'POST',
        body: JSON.stringify({ ranges: filled, modes, meetLink, address, note, classIds: alsoClasses }),
      });
      const extra = [
        d.skippedOverlap ? `${d.skippedOverlap} buổi trùng lịch đã có` : '',
        d.skippedPast ? `${d.skippedPast} buổi đã qua giờ` : '',
      ].filter(Boolean).join(', ');
      toast(d.created ? `Đã mở ${d.created} buổi thi${extra ? ` (bỏ qua ${extra})` : ''}` : `Không tạo được buổi mới${extra ? ` — ${extra}` : ''}`, d.created ? 'success' : 'error');
      if (d.created) { setRanges([emptyRange()]); setNote(''); setView('upcoming'); }
      load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  function remove(s) {
    const msg = s.booked
      ? `Xoá buổi ${keyLabel(s.dayKey)} ${s.startTime}? ${s.student?.name || 'Học viên'} đã đăng kí buổi này — học viên sẽ nhận tin nhắn báo hủy.`
      : `Xoá buổi trống ${keyLabel(s.dayKey)} ${s.startTime}–${s.endTime}?`;
    confirm(msg, async () => {
      try {
        await apiFetch(`/classes/${cls._id}/speaking-exam/${s._id}`, { method: 'DELETE' });
        toast('Đã xoá buổi thi');
        load();
      } catch (err) { toast(err.message, 'error'); }
    });
  }

  function cancelBooking(s) {
    confirm(`Hủy đăng kí của ${s.student?.name || 'học viên'} (${keyLabel(s.dayKey)} ${s.startTime})? Buổi sẽ mở lại cho học viên khác${isPast(s) ? '' : ' và học viên nhận tin nhắn báo hủy'}.`, async () => {
      try {
        await apiFetch(`/classes/${cls._id}/speaking-exam/${s._id}`, { method: 'PUT', body: JSON.stringify({ cancelBooking: true }) });
        toast('Đã hủy đăng kí');
        load();
      } catch (err) { toast(err.message, 'error'); }
    });
  }

  // Group the shown slots by day for the table.
  const byDay = [];
  shown.forEach((s) => {
    const last = byDay[byDay.length - 1];
    if (last && last.dayKey === s.dayKey) last.items.push(s);
    else byDay.push({ dayKey: s.dayKey, items: [s] });
  });
  if (view === 'past') byDay.reverse();
  const today = vnTodayKey(now);

  return (
    <>
      <div className="se-info">
        🎤 Mỗi buổi <b>{slotMin} phút</b> = <b>{data?.examMinutes || 15}' thi Speaking</b> + <b>{data?.feedbackMinutes || 10}' nhận feedback</b>.
        Nhập khung giờ rảnh theo ngày — hệ thống tự chia thành các buổi {slotMin}'. Học viên tick 1 buổi trên trang chủ (mục <i>Lớp học của tôi</i>)
        và chọn <b>Online qua Google Meet</b> hoặc <b>Offline tại nhà giáo viên</b>. Học viên tự đăng kí / hủy được tới <b>{data?.lockHours || 2} tiếng</b> trước giờ thi.
        Link Meet và địa chỉ chỉ hiện cho học viên đã đăng kí buổi đó.
      </div>

      <form onSubmit={create} className="se-form">
        <div className="se-form-title">➕ Mở lịch thi (thời gian rảnh của giáo viên)</div>
        {ranges.map((r, i) => {
          const n = slotCount(r.from, r.to, slotMin);
          return (
            <div key={i} className="se-range">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ngày</label>
                <input className="form-input" type="date" min={today} value={r.date} onChange={setRange(i, 'date')} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Từ giờ</label>
                <input className="form-input" type="time" value={r.from} onChange={setRange(i, 'from')} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Đến giờ</label>
                <input className="form-input" type="time" value={r.to} onChange={setRange(i, 'to')} />
              </div>
              <span className="se-range-count">{r.from && r.to ? (n ? `→ ${n} buổi` : `ngắn hơn ${slotMin}'`) : ''}</span>
              {ranges.length > 1 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRanges((rs) => rs.filter((_, j) => j !== i))} aria-label="Bỏ khung giờ này">✕</button>
              )}
            </div>
          );
        })}
        <div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRanges((rs) => [...rs, { ...emptyRange(), date: rs[rs.length - 1]?.date || '' }])}>
            + Thêm khung giờ / ngày khác
          </button>
        </div>

        <div className="se-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Hình thức cho phép</label>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', paddingTop: 6 }}>
              {['online', 'offline'].map((m) => (
                <label key={m} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
                  <input type="checkbox" checked={modes.includes(m)} onChange={() => toggle(modes, setModes, m)} />
                  {MODE_LABEL[m]}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="se-row">
          {modes.includes('online') && (
            <div className="form-group" style={{ marginBottom: 0, flex: '1 1 260px' }}>
              <label className="form-label">Link Google Meet</label>
              <input className="form-input" value={meetLink} onChange={(e) => setMeetLink(e.target.value)} placeholder="https://meet.google.com/xxx-xxxx-xxx" />
            </div>
          )}
          {modes.includes('offline') && (
            <div className="form-group" style={{ marginBottom: 0, flex: '1 1 260px' }}>
              <label className="form-label">Địa chỉ nhà giáo viên *</label>
              <input className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, đường, quận…" />
            </div>
          )}
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 220px' }}>
            <label className="form-label">Ghi chú cho học viên</label>
            <input className="form-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: đến sớm 5 phút, mang theo tai nghe…" />
          </div>
        </div>
        {otherClasses.length > 0 && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Mở cho cả các lớp khác của giáo viên</label>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {otherClasses.map((c) => (
                <label key={c._id} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
                  <input type="checkbox" checked={alsoClasses.includes(c._id)} onChange={() => toggle(alsoClasses, setAlsoClasses, c._id)} />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" disabled={saving || !totalNew}>
            {saving ? 'Đang tạo…' : `🎤 Mở ${totalNew || ''} buổi thi`}
          </button>
          <span style={{ fontSize: 11.5, color: 'var(--text3)' }}>Buổi trùng giờ với lịch thi đã có (kể cả ở lớp khác) sẽ được bỏ qua.</span>
        </div>
      </form>

      <div className="stats-row cp-stats" style={{ marginBottom: 14 }}>
        <div className="stat-card blue"><div className="stat-label">Buổi trống sắp tới</div><div className="stat-value">{data ? stats.open : '–'}</div></div>
        <div className="stat-card yellow"><div className="stat-label">Đã có học viên đăng kí</div><div className="stat-value">{data ? stats.booked : '–'}</div></div>
        <div className="stat-card green"><div className="stat-label">Đã thi</div><div className="stat-value">{data ? stats.done : '–'}</div></div>
        <div className="stat-card red" title={notRegistered.map((r) => r.student.name || r.student.username).join(', ')}>
          <div className="stat-label">Học viên chưa đăng kí</div><div className="stat-value">{data ? notRegistered.length : '–'}</div>
        </div>
      </div>
      {data && notRegistered.length > 0 && (
        <div className="se-missing">
          <b>Chưa đăng kí:</b> {notRegistered.map((r) => r.student.name || r.student.username).join(', ')}
        </div>
      )}

      <div className="inner-tabs-nav" style={{ marginBottom: 12 }}>
        {VIEWS.map((v) => (
          <button key={v.key} type="button" className={`inner-tab${v.key === view ? ' active' : ''}`} onClick={() => setView(v.key)}>{v.label}</button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>NGÀY</th><th>GIỜ</th><th>HÌNH THỨC</th><th>HỌC VIÊN</th><th>KẾT QUẢ</th><th></th></tr>
          </thead>
          <tbody>
            {!data ? <tr><td colSpan={6} className="table-empty">Đang tải...</td></tr>
              : byDay.length === 0 ? <tr><td colSpan={6} className="table-empty">{view === 'past' ? 'Chưa có buổi thi nào đã qua' : 'Chưa mở buổi thi nào — nhập thời gian rảnh ở trên'}</td></tr>
              : byDay.map((g) => g.items.map((s, i) => (
                <tr key={s._id} className={`cp-srow${g.dayKey === today ? ' cp-srow--today' : ''}${isPast(s) && !s.booked ? ' cp-srow--off' : ''}`}>
                  {i === 0 && (
                    <td rowSpan={g.items.length} style={{ fontSize: 13, verticalAlign: 'top' }}>
                      <strong>{keyLabel(g.dayKey)}</strong>/{g.dayKey.slice(0, 4)}
                      {g.dayKey === today && <span className="cp-today-tag">Hôm nay</span>}
                    </td>
                  )}
                  <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}><strong>{s.startTime}</strong>–{s.endTime}</td>
                  <td style={{ fontSize: 12.5 }}>
                    {s.booked
                      ? <span className={`badge ${s.mode === 'online' ? 'badge-blue' : 'badge-purple'}`}>{s.mode === 'online' ? '💻 Online' : '🏠 Offline'}</span>
                      : s.modes.map((m) => (m === 'online' ? '💻' : '🏠')).join(' ')}
                    {s.classNames.length > 1 && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Mở cho: {s.classNames.join(', ')}</div>}
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {s.student
                      ? <>
                        <strong>{s.student.name || s.student.username}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                          {[s.student.phone, s.student.email, s.bookedClassName && s.bookedClassName !== cls.name ? `lớp ${s.bookedClassName}` : ''].filter(Boolean).join(' · ')}
                        </div>
                      </>
                      : <span style={{ color: 'var(--text3)' }}>{isPast(s) ? '— không ai đăng kí' : 'Còn trống'}</span>}
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {s.result ? <span className={`badge ${RESULT[s.result].badge}`}>{RESULT[s.result].label}</span> : s.booked ? (isPast(s) ? <span className="badge badge-yellow">Chưa ghi kết quả</span> : '—') : '—'}
                    {s.band != null && <div style={{ fontSize: 12, marginTop: 2 }}>Band <b>{s.band}</b></div>}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(s)}>{s.booked ? '📝 Kết quả / Sửa' : 'Sửa'}</button>
                      {s.booked && !s.result && <button className="btn btn-ghost btn-sm" onClick={() => cancelBooking(s)}>Hủy đăng kí</button>}
                      <button className="btn btn-ghost btn-sm" onClick={() => remove(s)} title="Xoá buổi thi">🗑️</button>
                    </div>
                  </td>
                </tr>
              )))}
          </tbody>
        </table>
      </div>

      {editing && <SlotModal cls={cls} slot={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </>
  );
}

function SlotModal({ cls, slot, onClose, onSaved }) {
  const toast = useToast();
  const [modes, setModes] = useState(slot.modes);
  const [meetLink, setMeetLink] = useState(slot.meetLink || '');
  const [address, setAddress] = useState(slot.address || '');
  const [note, setNote] = useState(slot.note || '');
  const [result, setResult] = useState(slot.result || '');
  const [band, setBand] = useState(slot.band == null ? '' : String(slot.band));
  const [feedbackNote, setFeedbackNote] = useState(slot.feedbackNote || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const body = { modes, meetLink, address, note };
      if (slot.booked) Object.assign(body, { result, band: band === '' ? null : Number(band), feedbackNote });
      await apiFetch(`/classes/${cls._id}/speaking-exam/${slot._id}`, { method: 'PUT', body: JSON.stringify(body) });
      toast('Đã lưu');
      onSaved();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }
  const toggleMode = (m) => setModes((ms) => (ms.includes(m) ? ms.filter((x) => x !== m) : [...ms, m]));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">🎤 {keyLabel(slot.dayKey)}/{slot.dayKey.slice(0, 4)} · {slot.startTime}–{slot.endTime}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {slot.student && (
            <div className="se-info" style={{ margin: 0 }}>
              <b>{slot.student.name || slot.student.username}</b> đã đăng kí — {MODE_LABEL[slot.mode]}
            </div>
          )}
          {slot.booked && (
            <fieldset style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <legend style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', padding: '0 6px' }}>Kết quả buổi thi (học viên xem được)</legend>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Trạng thái</label>
                  <select className="form-input" value={result} onChange={(e) => setResult(e.target.value)}>
                    <option value="">Chưa thi</option>
                    <option value="done">Đã thi</option>
                    <option value="no_show">Vắng thi</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0, width: 120 }}>
                  <label className="form-label">Band</label>
                  <input className="form-input" type="number" min="0" max="9" step="0.5" value={band} onChange={(e) => setBand(e.target.value)} placeholder="6.5" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Feedback</label>
                <textarea className="form-input" rows={4} value={feedbackNote} onChange={(e) => setFeedbackNote(e.target.value)} placeholder="Điểm mạnh, điểm cần cải thiện…" />
              </div>
            </fieldset>
          )}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Hình thức cho phép</label>
            <div style={{ display: 'flex', gap: 14 }}>
              {['online', 'offline'].map((m) => (
                <label key={m} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
                  <input type="checkbox" checked={modes.includes(m)} disabled={slot.mode === m} onChange={() => toggleMode(m)} />
                  {MODE_LABEL[m]}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Link Google Meet</label>
            <input className="form-input" value={meetLink} onChange={(e) => setMeetLink(e.target.value)} placeholder="https://meet.google.com/…" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Địa chỉ nhà giáo viên</label>
            <input className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Ghi chú cho học viên</label>
            <input className="form-input" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 22px' }}>
          <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
        </div>
      </div>
    </div>
  );
}
