import { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmDialog } from '../../components/Modal';

// 🎤 Đăng kí thi Speaking — block inside each "Lớp học của tôi" class card.
// Port of frontend/js/dashboard-speaking-exam.js. Slots are opened by the
// teacher (admin ClassDetail "🎤 Thi Speaking"); 25′ = 15′ thi + 10′ feedback.
//   GET  /classes/my/speaking-exam
//   POST /classes/my/speaking-exam/:slotId/book   { mode }
//   POST /classes/my/speaking-exam/:slotId/cancel

const WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MODE = {
  online: { icon: '💻', label: 'Online qua Google Meet' },
  offline: { icon: '🏠', label: 'Offline tại nhà giáo viên' },
};

function seDayLabel(key) {
  const d = new Date(`${key}T00:00:00Z`);
  return `${WD[d.getUTCDay()]}, ${key.slice(8, 10)}/${key.slice(5, 7)}`;
}
const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '');

function ResultLine({ h }) {
  if (!h) return null;
  if (h.result === 'no_show') return <div className="se-result se-result--miss">Buổi thi {seDayLabel(h.dayKey)}: <b>vắng thi</b>.</div>;
  if (h.result !== 'done') return null;
  return (
    <div className="se-result">
      ✅ Đã thi {seDayLabel(h.dayKey)}{h.band != null && <> · Band <b>{h.band}</b></>}
      {h.feedbackNote && (
        <details className="se-fb">
          <summary>Xem feedback của giáo viên</summary>
          <div style={{ whiteSpace: 'pre-line' }}>{h.feedbackNote}</div>
        </details>
      )}
    </div>
  );
}

function Picker({ se, c, onClose, onBooked }) {
  const toast = useToast();
  const [slotId, setSlotId] = useState(null);
  const [mode, setMode] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const days = [];
  for (const s of c.openSlots) {
    const last = days[days.length - 1];
    if (last && last.dayKey === s.dayKey) last.items.push(s);
    else days.push({ dayKey: s.dayKey, items: [s] });
  }
  const slot = c.openSlots.find(s => s._id === slotId);
  const modes = slot?.modes || [];

  function pickSlot(s) {
    setSlotId(s._id);
    // keep the chosen mode if this slot allows it; a single-mode slot picks it
    setMode(m => (s.modes.length === 1 ? s.modes[0] : s.modes.includes(m) ? m : null));
  }

  async function submit() {
    if (!slotId || !mode) return;
    setBusy(true);
    try {
      await apiFetch(`/classes/my/speaking-exam/${slotId}/book`, { method: 'POST', body: JSON.stringify({ mode }) });
      toast('Đã đăng kí thi Speaking!', 'success');
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
        <div className="ci-warn-title" id="se-title">🎤 Đăng kí thi Speaking</div>
        <div className="se-intro">
          {c.className}{c.teacherName ? ` · GV ${c.teacherName}` : ''}<br />
          Mỗi buổi {se.slotMinutes || 25} phút: <b>{se.examMinutes || 15}&apos; thi</b> + <b>{se.feedbackMinutes || 10}&apos; nhận feedback</b>. Tick <b>1</b> buổi bạn muốn thi:
        </div>
        <div className="se-days">
          {days.map(d => (
            <div className="se-day" key={d.dayKey}>
              <div className="se-day-title">{seDayLabel(d.dayKey)}</div>
              <div className="se-slots">
                {d.items.map((s, i) => (
                  <label className="se-slot" key={s._id}>
                    <input type="radio" name="se-slot" value={s._id} checked={slotId === s._id} onChange={() => pickSlot(s)}
                      autoFocus={d === days[0] && i === 0} />
                    <span>{s.startTime}–{s.endTime}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        {slot && (
          <div className="se-mode-pick">
            <div className="se-step">Chọn hình thức thi:</div>
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
        <div className="ci-warn-actions">
          <button type="button" className="ci-warn-btn ci-warn-btn--ghost" onClick={onClose}>Đóng</button>
          <button type="button" className="ci-warn-btn se-submit" disabled={!slotId || !mode || busy} onClick={submit}>
            {busy ? 'Đang đăng kí…' : 'Xác nhận đăng kí'}
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
    const where = b.mode === 'online'
      ? (meet
        ? <a className="se-link" href={meet} target="_blank" rel="noopener noreferrer"><i className="fas fa-video" aria-hidden="true" /> Vào Google Meet</a>
        : <span className="se-muted">Giáo viên sẽ gửi link Meet sau.</span>)
      : (b.address ? <span className="se-addr"><i className="fas fa-location-dot" aria-hidden="true" /> {b.address}</span> : null);
    return (
      <div className="se-block se-block--booked">
        <div className="se-head">🎤 Lịch thi Speaking của bạn</div>
        <div className="se-when"><b>{seDayLabel(b.dayKey)}</b> · <b>{b.startTime}–{b.endTime}</b> <span className="se-muted">({mins})</span></div>
        <div className="se-mode">{m.icon} {m.label}</div>
        {where && <div className="se-where">{where}</div>}
        {b.note && <div className="se-note">📝 {b.note}</div>}
        <div className="se-actions">
          {b.canCancel
            ? <button type="button" className="se-btn se-btn--ghost" disabled={busy} onClick={() => setAskCancel(true)}>Hủy / đổi buổi</button>
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
      </div>
    );
  }

  const n = (c.openSlots || []).length;
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
