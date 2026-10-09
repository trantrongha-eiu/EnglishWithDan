// Date/label helpers for ClassProgress.jsx and Classes.jsx — see that file's header.

const WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const keyDate = (k) => new Date(`${k}T00:00:00Z`);
export const keyDiff = (a, b) => Math.round((keyDate(b) - keyDate(a)) / 864e5);
export function keyLabel(k) {
  const d = keyDate(k);
  return `${WD[d.getUTCDay()]}, ${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}
export function relDay(today, k) {
  const n = keyDiff(today, k);
  if (n === 0) return 'hôm nay';
  if (n === 1) return 'ngày mai';
  return n > 0 ? `còn ${n} ngày` : `${-n} ngày trước`;
}
export const sessionName = (s) => (s.type === 'makeup' ? 'Buổi học bù' : `Buổi ${s.ordinal || s.sessionNumber}`);

export function phaseText(p) {
  if (!p) return '';
  if (p.phase === 'upcoming') return p.daysUntilStart === 1 ? '🚀 Khai giảng ngày mai' : `🚀 Khai giảng sau ${p.daysUntilStart} ngày`;
  if (p.phase === 'ended') return '🎓 Đã kết thúc';
  if (p.phase === 'ongoing') {
    const parts = ['📖 Đang học'];
    if (p.daysLeft != null) parts.push(p.daysLeft === 0 ? 'hôm nay là ngày cuối' : `còn ${p.daysLeft} ngày`);
    if (p.remainingSessions) parts.push(`còn ${p.remainingSessions} buổi`);
    return parts.join(' · ');
  }
  return '🗓️ Chưa có lịch học';
}

