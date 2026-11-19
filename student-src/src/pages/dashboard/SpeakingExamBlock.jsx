import { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmDialog } from '../../components/Modal';

// 🎤 Đăng kí thi Speaking — block inside each "Lớp học của tôi" class card.
// Port of frontend/js/dashboard-speaking-exam.js (keep both in step). Slots are
// opened by the teacher (admin ClassDetail "🎤 Thi Speaking"); 25′ = 15′ thi +
// 10′ feedback. The picker goes ngày → giờ → hình thức.
//   GET  /classes/my/speaking-exam
//   POST /classes/my/speaking-exam/:slotId/book   { mode, replaceBooking? }
//   POST /classes/my/speaking-exam/:slotId/cancel

const WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MODE = {
  online: { icon: '💻', label: 'Online qua Google Meet' },
  offline: { icon: '🏠', label: 'Offline tại nhà giáo viên' },
};
const PARTS = [['Sáng', 0, 12], ['Chiều', 12, 18], ['Tối', 18, 24]];

// eslint-disable-next-line react-refresh/only-export-components
export function seDayLabel(key) {
  const d = new Date(`${key}T00:00:00Z`);
  return `${WD[d.getUTCDay()]}, ${key.slice(8, 10)}/${key.slice(5, 7)}`;
}
function seRelDay(key) {
  const today = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
  const n = Math.round((Date.parse(`${key}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 864e5);
  if (n < 0) return '';
  return n === 0 ? 'hôm nay' : n === 1 ? 'ngày mai' : `còn ${n} ngày`;
}
const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '');

function ResultLine({ h }) {
  if (!h) return null;
  if (h.result === 'no_show') return <div className="se-result se-result--miss">Buổi thi {seDayLabel(h.dayKey)}: <b>vắng thi</b>.</div>;
  if (h.result !== 'done') return null;
  return (
    <div className="se-result">
      ✅ Đã thi {seDayLabel(h.dayKey)}{h.band != null && <> · Band <b>{h.band}</b></>}
      <Feedback h={h} />
    </div>
  );
}

function Feedback({ h }) {
  if (!h.feedbackNote) return null;
  return (
    <details className="se-fb">
      <summary>Xem feedback của giáo viên</summary>
      <div style={{ whiteSpace: 'pre-line' }}>{h.feedbackNote}</div>
    </details>
  );
}

// Past exams of a class, newest first (Lớp học page → Thi Speaking).
export function SpeakingExamHistory({ history }) {
  return (
    <div className="se-hist">
      {history.map((h) => (
        <div className="se-hist-row" key={h._id}>
          <div className="se-hist-head">
            <span><b>{seDayLabel(h.dayKey)}</b> · {h.startTime}–{h.endTime}</span>
            {h.result === 'done'
              ? <span className="se-hist-tag se-hist-tag--done">Đã thi{h.band != null ? ` · Band ${h.band}` : ''}</span>
              : h.result === 'no_show'
                ? <span className="se-hist-tag se-hist-tag--miss">Vắng thi</span>
                : <span className="se-hist-tag">Chờ giáo viên ghi kết quả</span>}
          </div>
          <Feedback h={h} />
        </div>
      ))}
    </div>
  );
}

function Picker({ se, c, swapping, onClose, onBooked }) {
  const toast = useToast();
  const days = [];
  for (const s of c.openSlots) {
    const last = days[days.length - 1];
    if (last && last.dayKey === s.dayKey) last.items.push(s);
    else days.push({ dayKey: s.dayKey, items: [s] });
  }
  const [dayKey, setDayKey] = useState(days[0]?.dayKey);
  const [slotId, setSlotId] = useState(null);
  const [mode, setMode] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const day = days.find(d => d.dayKey === dayKey) || days[0];
  const slot = c.openSlots.find(s => s._id === slotId);
  const modes = slot?.modes || [];

  function pickSlot(s) {
    setSlotId(s._id);
    // keep the chosen mode if this slot allows it; a single-mode slot picks it
    setMode(m => {
      const wanted = m || (swapping ? c.booking.mode : null);
      return s.modes.length === 1 ? s.modes[0] : s.modes.includes(wanted) ? wanted : null;
    });
  }

  async function submit() {
    if (!slot || !mode) return;
    setBusy(true);
    try {
      await apiFetch(`/classes/my/speaking-exam/${slotId}/book`, {
        method: 'POST',
        body: JSON.stringify({ mode, ...(swapping ? { replaceBooking: true } : {}) }),
      });
      toast(swapping ? 'Đã đổi buổi thi Speaking!' : 'Đã đăng kí thi Speaking!', 'success');
      onClose();
    } catch (err) {
      toast(err.message || 'Không đăng kí được', 'error');
      setBusy(false);
    }
    onBooked(); // also on error: the slot probably went to a classmate — refresh
  }

  return (
    <div className="ci-warn-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ci-warn-box se-box" role="dialog" aria-modal="true" aria-labelledby="se-title">
        <div className="ci-warn-title" id="se-title">🎤 {swapping ? 'Đổi buổi thi Speaking' : 'Đăng kí thi Speaking'}</div>
        <div className="se-intro">
          {c.className}{c.teacherName ? ` · GV ${c.teacherName}` : ''}<br />
          Mỗi buổi {se.slotMinutes || 25} phút: <b>{se.examMinutes || 15}&apos; thi</b> + <b>{se.feedbackMinutes || 10}&apos; nhận feedback</b>.
        </div>
        {swapping && (
          <div className="se-current">
            Buổi hiện tại: <b>{seDayLabel(c.booking.dayKey)} · {c.booking.startTime}–{c.booking.endTime}</b>. Buổi này vẫn giữ nguyên cho tới khi đổi thành công.
          </div>
        )}
        <div className="se-step">1. Chọn ngày</div>
        <div className="se-daychips">
          {days.map((d, i) => {
            const [wd, date] = seDayLabel(d.dayKey).split(', ');
            const on = d.dayKey === day?.dayKey;
            return (
              <button type="button" key={d.dayKey} className={`se-daychip${on ? ' is-on' : ''}`} aria-pressed={on}
                autoFocus={i === 0} onClick={() => setDayKey(d.dayKey)}>
                <b>{wd}</b><span>{date}</span><small>{d.items.length} buổi</small>
              </button>
            );
          })}
        </div>
        <div className="se-step">2. Chọn giờ</div>
        <div className="se-days">
          <div className="se-day">
            {PARTS.map(([label, from, to]) => {
              const items = (day?.items || []).filter((s) => { const h = Number(s.startTime.slice(0, 2)); return h >= from && h < to; });
              if (!items.length) return null;
              return (
                <div className="se-part" key={label}>
                  <div className="se-day-title">{label}</div>
                  <div className="se-slots">
                    {items.map(s => (
                      <label className="se-slot" key={s._id}>
                        <input type="radio" name="se-slot" value={s._id} checked={slotId === s._id} onChange={() => pickSlot(s)} />
                        <span>{s.startTime}–{s.endTime}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {slot && (
          <div className="se-mode-pick">
            <div className="se-step">3. Chọn hình thức thi</div>
            <div className="se-modes">
              {modes.map(m => (
                <label className="se-mode-opt" key={m}>
                  <input type="radio" name="se-mode" value={m} checked={mode === m} onChange={() => setMode(m)} />
                  <span>{MODE[m]?.icon} {MODE[m]?.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {slot?.note && <div className="se-slot-note se-muted">📝 {slot.note}</div>}
        {slot && mode && (
          <div className="se-summary">✅ <b>{seDayLabel(slot.dayKey)}</b> · <b>{slot.startTime}–{slot.endTime}</b> · {MODE[mode]?.icon} {MODE[mode]?.label}</div>
        )}
        <div className="ci-warn-actions">
          <button type="button" className="ci-warn-btn ci-warn-btn--ghost" onClick={onClose}>Đóng</button>
          <button type="button" className="ci-warn-btn se-submit" disabled={!slot || !mode || busy} onClick={submit}>
            {busy ? (swapping ? 'Đang đổi…' : 'Đang đăng kí…') : (swapping ? 'Xác nhận đổi buổi' : 'Xác nhận đăng kí')}
          </button>
        </div>
      </div>
    </div>
  );
}

// se = last GET /classes/my/speaking-exam payload (null → nothing)
export default function SpeakingExamBlock({ se, classId, onChanged }) {
  const toast = useToast();
  const [picker, setPicker] = useState(false);
  const [askCancel, setAskCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const c = se?.classes?.find(x => String(x.classId) === String(classId));
  if (!c) return null;
  const last = (c.history || [])[0];
  const mins = `${se.examMinutes || 15}' thi + ${se.feedbackMinutes || 10}' feedback`;
  const b = c.booking;
  const n = (c.openSlots || []).length;

  async function cancel() {
    setBusy(true);
    try {
      await apiFetch(`/classes/my/speaking-exam/${b._id}/cancel`, { method: 'POST' });
      toast('Đã hủy buổi thi — bạn có thể chọn buổi khác.', 'success');
      onChanged();
    } catch (err) {
      toast(err.message || 'Không hủy được', 'error');
    }
    setBusy(false);
  }

  if (b) {
    const m = MODE[b.mode] || {};
    const meet = safeUrl(b.meetLink);
    const rel = seRelDay(b.dayKey);
    const where = b.mode === 'online'
      ? (meet
        ? <a className="se-link" href={meet} target="_blank" rel="noopener noreferrer"><i className="fas fa-video" aria-hidden="true" /> Vào Google Meet</a>
        : <span className="se-muted">Giáo viên sẽ gửi link Meet sau.</span>)
      : (b.address ? <span className="se-addr"><i className="fas fa-location-dot" aria-hidden="true" /> {b.address}</span> : null);
    return (
      <div className="se-block se-block--booked">
        <div className="se-head">🎤 Lịch thi Speaking của bạn{rel && <> <span className="se-rel">{rel}</span></>}</div>
        <div className="se-when"><b>{seDayLabel(b.dayKey)}</b> · <b>{b.startTime}–{b.endTime}</b> <span className="se-muted">({mins})</span></div>
        <div className="se-mode">{m.icon} {m.label}</div>
        {where && <div className="se-where">{where}</div>}
        {b.note && <div className="se-note">📝 {b.note}</div>}
        <div className="se-actions">
          {b.canCancel
            ? <>
              {n > 0 && <button type="button" className="se-btn" onClick={() => setPicker(true)}>Đổi buổi</button>}
              <button type="button" className="se-btn se-btn--ghost" disabled={busy} onClick={() => setAskCancel(true)}>Hủy buổi</button>
            </>
            : <span className="se-muted">Muốn đổi/hủy trong {se.lockHours || 2} tiếng trước giờ thi — hãy nhắn giáo viên.</span>}
        </div>
        {askCancel && (
          <ConfirmDialog
            title="Hủy buổi thi Speaking?"
            message="Buổi này sẽ mở lại cho bạn khác. Bạn có thể chọn buổi khác ngay sau đó."
            confirmLabel="Hủy buổi thi"
            onConfirm={cancel}
            onClose={() => setAskCancel(false)}
          />
        )}
        {picker && <Picker se={se} c={c} swapping onClose={() => setPicker(false)} onBooked={onChanged} />}
      </div>
    );
  }

  if (!n && !last) return null;
  return (
    <div className="se-block">
      <div className="se-row">
        <div>
          <div className="se-head">🎤 Thi Speaking 1-1 với giáo viên</div>
          <div className="se-sub">{mins} · {n ? <>còn <b>{n}</b> buổi trống</> : 'chưa có buổi trống'}</div>
        </div>
        {n > 0 && <button type="button" className="se-btn" onClick={() => setPicker(true)}>Đăng kí thi</button>}
      </div>
      <ResultLine h={last} />
      {picker && <Picker se={se} c={c} onClose={() => setPicker(false)} onBooked={onChanged} />}
    </div>
  );
}
