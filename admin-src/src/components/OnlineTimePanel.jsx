import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { ErrorState, EmptyState, Skeleton } from './ui/States';
import { fmtMinutes, fmtSpan, fmtClock, fmtDayLabel } from '../utils/onlineTime';

// One student's online time: minutes per day (last 14 days) and every
// session of the chosen day with its breaks. Data: GET /admin/online-time/:id.
// Used by the Thời gian online popup and the student profile tab.

const DEVICE = { desktop: '💻 Máy tính', mobile: '📱 Điện thoại' };
const PAGE_NAMES = {
  dashboard: 'Dashboard', reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking',
  vocabulary: 'Từ vựng', shadowing: 'Shadowing', dictation: 'Dictation', 'mock-test': 'Thi thử',
  'essential-grammar': 'Ngữ pháp', 'writing-practice': 'Luyện viết', 'task2-practice': 'Task 2', 'task1-practice': 'Task 1',
  profile: 'Hồ sơ', inbox: 'Hộp thư', shop: 'Cửa hàng', goal: 'Mục tiêu', 'review-history': 'Ôn tập',
};

function pageName(p) {
  const k = String(p).replace(/^\//, '').replace(/\.html$/, '') || 'index';
  return PAGE_NAMES[k] || k;
}

function SessionCard({ s, index }) {
  const [open, setOpen] = useState(false);
  const spanSec = (new Date(s.endedAt) - new Date(s.startedAt)) / 1000;
  const focus = spanSec > 0 ? Math.min(100, Math.round((s.activeSeconds / spanSec) * 100)) : 100;
  const breaks = s.breaks || [];
  return (
    <div className="panel" style={{ padding: 12, marginBottom: 10 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <strong>Phiên {index + 1}</strong>
        <span>{fmtClock(s.startedAt)} – {fmtClock(s.endedAt)}</span>
        {s.device && <span className="badge badge-gray">{DEVICE[s.device] || s.device}</span>}
        <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--blue)' }}>{fmtMinutes(s.activeSeconds)} học</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>
        <span title="Thời gian từ lúc bắt đầu đến lúc kết thúc phiên">⏳ Kéo dài {fmtSpan(spanSec)}</span>
        <span title="Phần trăm thời gian thật sự học trong phiên">🎯 Tập trung {focus}%</span>
        <span title="Số lần rời trang ≥ 5 giây (chuyển tab, mở ứng dụng khác, thu nhỏ)">↗️ Chuyển tab: <strong>{s.tabSwitches}</strong></span>
        <span title="Số lần mở trang nhưng không thao tác quá 3 phút">⏸️ Tạm dừng: <strong>{s.idlePauses}</strong></span>
      </div>
      {s.pages?.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
          Trang đã mở: {s.pages.map(pageName).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
        </div>
      )}
      {breaks.length > 0 && (
        <>
          <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} onClick={() => setOpen(o => !o)}>
            {open ? '▾ Ẩn' : '▸ Xem'} {breaks.length} lần gián đoạn
          </button>
          {open && (
            <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12, lineHeight: 1.7 }}>
              {breaks.map((b, i) => (
                <li key={i}>
                  <strong>{fmtClock(b.at)}</strong> — {b.type === 'tab' ? '↗️ Rời trang / chuyển tab' : '⏸️ Không thao tác'} trong <strong>{fmtSpan(b.seconds)}</strong>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default function OnlineTimePanel({ userId, initialDay }) {
  const [day, setDay] = useState(initialDay || '');
  const { data, error, loading, reload } = useApi(`/admin/online-time/${userId}?days=14${day ? `&day=${day}` : ''}`);

  if (loading) return <Skeleton height={200} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const days = data.days || [];
  const max = Math.max(60, ...days.map(d => d.activeSeconds));
  const sel = days.find(d => d.day === data.day);
  const total14 = days.reduce((s, d) => s + d.activeSeconds, 0);
  const activeDays = days.filter(d => d.activeSeconds > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 13, color: 'var(--text2)' }}>
        14 ngày qua: <strong>{fmtMinutes(total14)}</strong> · học {activeDays}/14 ngày
        {activeDays > 0 && <> · trung bình <strong>{fmtMinutes(total14 / activeDays)}</strong>/ngày có học</>}
      </div>

      {/* Minutes per day — click a bar to see that day's sessions */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, overflowX: 'auto' }}>
        {[...days].reverse().map(d => {
          const h = d.activeSeconds ? Math.max(4, Math.round((d.activeSeconds / max) * 90)) : 2;
          const active = d.day === data.day;
          return (
            <button key={d.day} type="button" onClick={() => setDay(d.day)}
              title={`${fmtDayLabel(d.day)}: ${fmtMinutes(d.activeSeconds)} · ${d.sessions} phiên`}
              style={{ flex: '1 0 34px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                gap: 3, height: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>{d.activeSeconds ? Math.round(d.activeSeconds / 60) : ''}</span>
              <span style={{ width: '70%', height: h, borderRadius: 3,
                background: active ? 'var(--blue)' : d.activeSeconds ? 'var(--green)' : 'var(--border)' }} />
              <span style={{ fontSize: 10, color: active ? 'var(--blue)' : 'var(--text3)', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>
                {fmtDayLabel(d.day).split(' ')[1]}
              </span>
            </button>
          );
        })}
      </div>

      <div>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          {fmtDayLabel(data.day)} — {fmtMinutes(sel?.activeSeconds || 0)}
          <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--text2)' }}>
            {' '}· {data.sessions.length} phiên · {sel?.tabSwitches || 0} lần chuyển tab · {sel?.idlePauses || 0} lần tạm dừng
          </span>
        </div>
        {data.sessions.length === 0
          ? <EmptyState icon="💤" title="Không online ngày này" />
          : data.sessions.map((s, i) => <SessionCard key={s._id} s={s} index={i} />)}
      </div>

      <div style={{ fontSize: 11, color: 'var(--text3)' }}>
        Chỉ tính thời gian trang đang mở ở phía trước và học sinh có thao tác trong 3 phút gần nhất (hoặc đang phát audio/video).
        Phiên mới bắt đầu sau 30 phút không hoạt động hoặc sang ngày mới.
      </div>
    </div>
  );
}
